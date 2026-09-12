import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ensureVault, vaultRoot, stableKadId } from './index.mjs';

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
export { stableKadId };
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
export function executeMigration({ root = vaultRoot(), legacyRoot = path.resolve('wiki') } = {}) {
  ensureVault(root);
  const manifest = migrationManifest({ root, legacyRoot });
  let migrated = 0, review = 0, archive = 0, derived = 0;
  for (const entry of manifest.entries) {
    const sourceFile = path.join(legacyRoot, entry.old_path);
    const destFile = path.join(root, entry.destination);
    fs.mkdirSync(path.dirname(destFile), { recursive: true });
    const content = fs.readFileSync(sourceFile, 'utf8');

    if (entry.classification === 'MIGRATE_CANONICAL') {
      const isRoadmap = entry.old_path.toLowerCase().includes('roadmap');
      const title = path.basename(entry.old_path, '.md').replaceAll('_', ' ');
      const type = isRoadmap ? 'roadmap' : 'workpackage';
      const cleanContent = content.replace(/^---[\s\S]*?---\n/, '');
      const frontmatter = `---\nkad_id: ${entry.canonical_id}\ntitle: ${title}\ntype: ${type}\nauthority: CANONICAL_KNOWLEDGE\nepistemic_class: PROJECT_INFERENCE\nreview_status: APPROVED\nvisibility: project\ncontext_eligible: true\ntrain_eligible: false\npublish: false\ntemporal_status: CURRENT\nlegacy_source: wiki/${entry.old_path}\n---\n\n`;
      fs.writeFileSync(destFile, frontmatter + cleanContent.trimStart());
      entry.migration_status = 'MIGRATED';
      migrated += 1;
    } else if (entry.classification === 'REVIEW_REQUIRED') {
      const title = `Review: ${path.basename(entry.old_path)}`;
      const cleanContent = content.replace(/^---[\s\S]*?---\n/, '');
      const frontmatter = `---\nkad_id: ${entry.canonical_id}\ntitle: ${title}\ntype: review_record\nauthority: PROPOSAL_UNREVIEWED\nepistemic_class: UNKNOWN\nreview_status: PENDING\nvisibility: project\ncontext_eligible: false\ntrain_eligible: false\npublish: false\ntemporal_status: HISTORICAL\nlegacy_source: wiki/${entry.old_path}\n---\n\n`;
      fs.writeFileSync(destFile, frontmatter + cleanContent.trimStart());
      entry.migration_status = 'REVIEW_PENDING';
      review += 1;
    } else if (entry.classification === 'ARCHIVE') {
      fs.copyFileSync(sourceFile, destFile);
      entry.migration_status = 'ARCHIVED';
      archive += 1;
    } else if (entry.classification === 'DERIVED_ONLY') {
      fs.copyFileSync(sourceFile, destFile);
      entry.migration_status = 'DERIVED';
      derived += 1;
    }
  }
  fs.writeFileSync(path.join(root, '90_Derived/KnowledgePlane/migration-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return { migrated, review, archive, derived, total: manifest.entries.length, manifest };
}
export function migrateLegacyWiki(options = {}) { return executeMigration(options); }

/**
 * Retire the migration's derived and archived copies once each has a surviving counterpart.
 *
 * The migration parked two classes under the vault's LegacyWiki trees: regenerable projections
 * (DERIVED_ONLY) and synthetic material (ARCHIVE). Both have a live home — `docs/generated/` and
 * `.agents/knowledge/` — and both are checked for one before anything is removed, because a prune
 * without that check is data loss with a receipt. Every removal is recorded per entry in the
 * manifest (`PRUNED`, when, and the hash of what left), so the record still names what was there.
 */
export function pruneLegacyCopies({ root = vaultRoot(), generatedDir = 'docs/generated', corpusDir = '.agents/knowledge', at = new Date().toISOString() } = {}) {
  ensureVault(root);
  const manifestPath = path.join(root, '90_Derived/KnowledgePlane/migration-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const survivorFor = (entry) => `${entry.classification === 'DERIVED_ONLY' ? generatedDir : corpusDir}/${entry.classification === 'DERIVED_ONLY' ? entry.old_path.replace(/^generated\//, '') : entry.old_path}`;
  const pruned = [];
  const refused = [];
  for (const entry of manifest.entries.filter((candidate) => candidate.classification === 'DERIVED_ONLY' || candidate.classification === 'ARCHIVE')) {
    const destFile = path.join(root, entry.destination);
    if (entry.migration_status === 'PRUNED' && !fs.existsSync(destFile)) continue;
    const survivor = survivorFor(entry);
    if (!fs.existsSync(path.resolve(survivor))) {
      refused.push({ old_path: entry.old_path, classification: entry.classification, reason: `no surviving counterpart at ${survivor}` });
      continue;
    }
    const present = fs.existsSync(destFile);
    entry.migration_status = 'PRUNED';
    entry.pruned_at = at;
    entry.pruned_hash = present ? hash(fs.readFileSync(destFile)) : null;
    entry.survivor = survivor;
    if (present) fs.rmSync(destFile);
    pruned.push({ old_path: entry.old_path, survivor, present });
  }
  const removedDirs = [];
  for (const relative of ['90_Derived/LegacyWiki', '99_Archive/LegacyWiki']) {
    const absolute = path.join(root, relative);
    if (fs.existsSync(absolute) && walk(absolute).length === 0) { fs.rmSync(absolute, { recursive: true, force: true }); removedDirs.push(relative); }
  }
  manifest.prune = {
    at,
    decision: 'operator instruction, 2026-09-12: prune the retired wiki tree\'s derived and archived copies',
    survivor_rule: { DERIVED_ONLY: `${generatedDir}/<old_path without the generated/ prefix>`, ARCHIVE: `${corpusDir}/<old_path>` },
    pruned: pruned.length,
    refused: refused.length,
    removed_dirs: removedDirs,
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return { pruned: pruned.filter((entry) => entry.present).length, already_absent: pruned.filter((entry) => !entry.present).length, refused, removed_dirs: removedDirs, manifest };
}
