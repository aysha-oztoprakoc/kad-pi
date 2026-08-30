import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ensureVault, vaultRoot } from './index.mjs';

const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const safeId = (value) => String(value).replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'unknown';
export const MIGRATION_CLASSES = Object.freeze(['MIGRATE_CANONICAL','MERGE_INTO_EXISTING','DERIVED_ONLY','REVIEW_REQUIRED','ARCHIVE','DUPLICATE','UNKNOWN']);

function walk(root, relative = '') {
  const directory = path.join(root, relative);
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const next = path.join(relative, entry.name);
    return entry.isDirectory() ? walk(root, next) : [next];
  }).sort();
}
function classify(relative) {
  if (relative.startsWith('generated/')) return ['DERIVED_ONLY', 'generated projection'];
  if (relative.startsWith('synthetic/')) return ['ARCHIVE', 'synthetic material is not source-grounded'];
  if (/^KAD_(?:Counterfactual|Economic|Knowledge|Operator|Research|Usage)/.test(path.basename(relative))) return ['MIGRATE_CANONICAL', 'accepted KAD record'];
  if (/duplicate/i.test(relative)) return ['DUPLICATE', 'legacy path explicitly marks duplicate'];
  if (/merge/i.test(relative)) return ['MERGE_INTO_EXISTING', 'legacy path explicitly requests merge'];
  if (/handoff|implementation_plan/i.test(relative)) return ['REVIEW_REQUIRED', 'historical handoff or plan'];
  if (!relative.toLowerCase().endsWith('.md') && !relative.toLowerCase().endsWith('.json')) return ['UNKNOWN', 'unsupported legacy artifact type'];
  return ['REVIEW_REQUIRED', 'legacy knowledge requires human classification'];
}
function destination(relative, classification) {
  if (classification === 'DERIVED_ONLY') return `90_Derived/LegacyWiki/${relative}`;
  if (classification === 'MIGRATE_CANONICAL') return `50_Projects/KAD-PI/Workpackages/${path.basename(relative)}`;
  if (classification === 'REVIEW_REQUIRED') return `80_Review/Pending/legacy-${safeId(relative)}.md`;
  return `99_Archive/LegacyWiki/${relative}`;
}
export function stableKadId(identity) { return `kad-${hash(String(identity)).slice(0, 24)}`; }
export function migrationManifest({ root = vaultRoot(), legacyRoot = path.resolve('wiki') } = {}) {
  ensureVault(root);
  const entries = walk(legacyRoot).filter((file) => !file.endsWith('.gitkeep')).map((relative) => {
    const file = path.join(legacyRoot, relative);
    const bytes = fs.readFileSync(file);
    const sourceHash = hash(bytes);
    const [classification, reason] = classify(relative);
    return { old_path: relative.split(path.sep).join('/'), hash: sourceHash, destination: destination(relative, classification), canonical_id: stableKadId(sourceHash), reason, evidence: [`wiki/${relative.split(path.sep).join('/')}`], migration_status: 'INVENTORIED', classification };
  });
  const manifest = { schema: 'kad-vault-migration-v1', source: 'wiki/', canonical_root: path.relative(process.cwd(), root), source_count: entries.length, entries };
  fs.writeFileSync(path.join(root, '90_Derived/KnowledgePlane/migration-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}
export function migrateLegacyWiki(options = {}) { return migrationManifest(options); }
