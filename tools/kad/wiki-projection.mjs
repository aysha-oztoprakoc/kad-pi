#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { EPISTEMIC_CLASSES, ACCEPTANCE_STATES, DeterministicKnowledgePlane } from './knowledge-plane.mjs';

export const PROJECTION_ID = 'kad-governed-wiki-v1';
export const NAMESPACE_NAMES = Object.freeze([
  'PROJECT', 'ARCHITECTURE', 'DECISIONS', 'RESEARCH', 'TECHNOLOGIES', 'EXPERIMENTS',
  'MODELS', 'PROVIDERS', 'AGENTS', 'CAPABILITIES', 'SKILLS', 'EVIDENCE', 'FAILURES',
  'GLOSSARY', 'ROADMAP'
]);
export const STATUS_STATES = Object.freeze([
  'ACCEPTED', 'PASS', 'PARTIAL', 'DEGRADED', 'BLOCKED', 'EXPERIMENTAL', 'FILE_ONLY',
  'LOADABLE', 'QUALIFIED', 'SUPERSEDED', 'UNKNOWN', 'ACTIVE', 'REJECTED', 'STALE',
  'CURRENT', 'QUARANTINED'
]);

const SOURCE = (path, title, kind, sourceClass, namespace, reason, extra = {}) => Object.freeze({
  path,
  title,
  kind,
  source_class: sourceClass,
  namespace,
  classification: EPISTEMIC_CLASSES.DOCUMENT_DERIVED,
  authority_class: 'CANONICAL_SOURCE',
  acceptance_state: ACCEPTANCE_STATES.ACCEPTED,
  trust_domain: 'engineering',
  projection_eligible: true,
  privacy_class: 'INTERNAL',
  reason,
  ...extra
});

export const CURATED_SOURCE_ALLOWLIST = Object.freeze([
  SOURCE('README.md', 'KAD-PI Project', 'project', 'PROJECT', 'PROJECT', 'Repository orientation and bounded project identity.'),
  SOURCE('PRIME_DIRECTIVE.md', 'Prime Directive', 'directive', 'GOVERNANCE', 'PROJECT', 'Normative authority and epistemic rules.'),
  SOURCE('CONTEXT.md', 'KAD-PI Domain Context', 'glossary', 'GLOSSARY', 'GLOSSARY', 'Canonical project vocabulary.'),
  ...[
    ['0001-notification-oriented-causality.md', 'Notification-Oriented Causality'],
    ['0002-spatiotemporal-composability-cordis-ownership.md', 'Spatiotemporal Composability and Cordis Ownership'],
    ['0003-intent-authority-boundary.md', 'Intent Authority Boundary'],
    ['0004-model-agnostic-control-plane.md', 'Model-Agnostic Control Plane'],
    ['0005-deterministic-first-and-epistemic-classification.md', 'Deterministic First and Epistemic Classification'],
    ['0006-pi-sdk-session-subscribe-integration-seam.md', 'Pi SDK Session Subscribe Integration Seam'],
    ['0007-synthetic-knowledge-librarian-architecture.md', 'Synthetic Knowledge Librarian Architecture'],
    ['0008-unified-context-knowledge-plane.md', 'Unified Context and Knowledge Plane']
  ].map(([file, title]) => SOURCE(`docs/adr/${file}`, title, 'adr', 'DECISION', 'DECISIONS', 'Accepted ADR defining an explicit architecture boundary.', { optional: file.startsWith('0008-') })),
  SOURCE('wiki/KAD_Context_Knowledge_Plane_Roadmap_2026-08-29.md', 'KAD Context Knowledge Plane Roadmap', 'roadmap', 'ROADMAP', 'ROADMAP', 'Current bounded roadmap and sequencing constraints.', { optional: true }),
  SOURCE('wiki/KAD_Implementation_Plan.md', 'KAD Implementation Plan', 'roadmap', 'ROADMAP', 'ROADMAP', 'Historical implementation baseline retained for navigation.', { status: 'SUPERSEDED', optional: true }),
  SOURCE('wiki/synthetic/01_ARCHITECTURE_PON_STC.md', 'PON/STC Architecture', 'architecture', 'ARCHITECTURE', 'ARCHITECTURE', 'Canonical synthetic architecture artifact with explicit derivation boundary.'),
  SOURCE('wiki/synthetic/03_PI_HARNESS_INTEGRATION.md', 'Pi Harness Integration', 'technology', 'TECHNOLOGY', 'TECHNOLOGIES', 'Canonical integration notes for the Pi harness.'),
  SOURCE('evidence/WP-KAD-001/final-report.md', 'WP-KAD-001 Evidence', 'evidence', 'EVIDENCE', 'EVIDENCE', 'Accepted workpackage report and observed integration evidence.'),
  SOURCE('evidence/WP-KAD-002/final-report.md', 'WP-KAD-002 Evidence', 'evidence', 'EVIDENCE', 'EVIDENCE', 'Accepted workpackage report and observed transition evidence.'),
  SOURCE('evidence/WP-KAD-003/final-report.md', 'WP-KAD-003 Evidence', 'evidence', 'EVIDENCE', 'EVIDENCE', 'Accepted workpackage report and observed evidence.'),
  SOURCE('evidence/WP-KAD-004/final-report.md', 'WP-KAD-004 Evidence', 'evidence', 'EVIDENCE', 'EVIDENCE', 'Accepted workpackage report and observed evidence.'),
  SOURCE('evidence/WP-KAD-005/final-report.md', 'WP-KAD-005 Evidence', 'evidence', 'EVIDENCE', 'EVIDENCE', 'Accepted workpackage report and observed evidence.'),
  SOURCE('evidence/WP-KAD-CONTEXT-SWARM-001/REPORT.md', 'Context Swarm Evidence', 'evidence', 'EVIDENCE', 'EVIDENCE', 'Accepted bounded swarm evidence.'),
  SOURCE('evidence/WP-KAD-KNOWLEDGE-PLANE-001/REPORT-R2.md', 'KnowledgePlane Evidence', 'evidence', 'EVIDENCE', 'EVIDENCE', 'Latest accepted KnowledgePlane report; preserves optional-runtime degradation.', {
    component_statuses: { KnowledgePlane: 'PASS', OpenViking: 'DEGRADED', Needle: 'BLOCKED' }
  }),
  SOURCE('evidence/WP-KAD-OMP-001/final-report.md', 'OMP Boundary Evidence', 'evidence', 'EVIDENCE', 'EVIDENCE', 'Accepted OMP boundary and role evidence.'),
  SOURCE('evidence/WP-KAD-LIB-002-R1/final-report.md', 'Librarian Evidence', 'evidence', 'EVIDENCE', 'EVIDENCE', 'Reconciled deterministic Librarian evidence.'),
  SOURCE('evidence/WP-KAD-SHARED-MODEL-STORE-001/REPORT.md', 'Shared Model Store Evidence', 'evidence', 'EVIDENCE', 'EVIDENCE', 'Accepted model-store evidence, including unresolved runtime partials.'),
  SOURCE('evidence/WP-KAD-KNOWLEDGE-PLANE-001/adapter-probe.json', 'KnowledgePlane Adapter Failures', 'failure', 'FAILURE', 'FAILURES', 'Observed optional adapter degradation and bounded failure matrix.'),
  SOURCE('evidence/WP-KAD-005/rag-experiment-results.json', 'RAG Experiment Results', 'experiment', 'EXPERIMENT', 'EXPERIMENTS', 'Observed experiment results; not architectural proof.'),
  SOURCE('evidence/WP-KAD-SHARED-MODEL-STORE-001/NEW-MODEL-RESEARCH.md', 'Model Research Candidates', 'research', 'RESEARCH', 'RESEARCH', 'Research candidates remain non-authoritative.'),
  SOURCE('config/local-models.registry.json', 'Local Model Registry', 'registry', 'MODEL', 'MODELS', 'Current structured model identity, capability, trust, and qualification registry.'),
  SOURCE('evidence/WP-KAD-OMP-001/provider-role-map.json', 'Provider Role Map', 'registry', 'PROVIDER', 'PROVIDERS', 'Observed provider role bindings and trust boundary.'),
  SOURCE('.agents/agents/kad-master/agent.md', 'kad-master Agent', 'agent', 'AGENT', 'AGENTS', 'Authoritative project agent declaration.'),
  SOURCE('.agents/agents/kad-builder/agent.md', 'kad-builder Agent', 'agent', 'AGENT', 'AGENTS', 'Bounded implementation agent declaration.'),
  SOURCE('.agents/agents/kad-reviewer/agent.md', 'kad-reviewer Agent', 'agent', 'AGENT', 'AGENTS', 'Independent review agent declaration.'),
  SOURCE('.agents/agents/kad-researcher/agent.md', 'kad-researcher Agent', 'agent', 'AGENT', 'AGENTS', 'Read-only research agent declaration.'),
  SOURCE('.agents/agents/kad-tester/agent.md', 'kad-tester Agent', 'agent', 'AGENT', 'AGENTS', 'Deterministic verification agent declaration.'),
  SOURCE('.agents/capabilities/ask_user/CAPABILITY.md', 'ask_user Capability', 'capability', 'CAPABILITY', 'CAPABILITIES', 'Canonical capability contract and failure semantics.'),
  SOURCE('.agents/skills/kad-evidence-gate/SKILL.md', 'kad-evidence-gate Skill', 'skill', 'SKILL', 'SKILLS', 'Evidence promotion workflow and authority boundary.'),
  SOURCE('.agents/skills/tdd/SKILL.md', 'tdd Skill', 'skill', 'SKILL', 'SKILLS', 'Test-first implementation discipline.'),
  SOURCE('.agents/skills/implement/SKILL.md', 'implement Skill', 'skill', 'SKILL', 'SKILLS', 'Bounded implementation workflow.'),
  SOURCE('.agents/skills/code-review/SKILL.md', 'code-review Skill', 'skill', 'SKILL', 'SKILLS', 'Two-axis review workflow.')
]);

function canonicalPath(rootDir, sourcePath) {
  const root = resolve(rootDir);
  const full = resolve(root, sourcePath);
  const rel = relative(root, full);
  if (!sourcePath || sourcePath.includes('\0') || rel !== sourcePath || rel.startsWith('..')) throw new Error(`source path is outside root: ${sourcePath}`);
  return full;
}

function hashSource(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function firstHeading(content, fallback) {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? fallback;
}

function frontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  return Object.fromEntries(match[1].split(/\r?\n/).flatMap(line => {
    const item = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    return item ? [[item[1], item[2].replace(/^['"]|['"]$/g, '')]] : [];
  }));
}

function nextHeadingValue(content, heading) {
  const lines = content.split(/\r?\n/);
  const headingPattern = new RegExp(`^##\\s+${heading}\\s*$`, 'i');
  const start = lines.findIndex(line => headingPattern.test(line));
  if (start < 0) return null;
  const value = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s+/.test(line)) break;
    if (line.trim()) value.push(line.trim());
  }
  return value.find(Boolean) ?? null;
}

function reportVerdict(content) {
  const value = nextHeadingValue(content, 'Verdict');
  const match = value?.match(/^\*\*(PASS|PARTIAL|BLOCKED|DEGRADED|UNKNOWN|SUPERSEDED)(?:\s|\/|\*)/);
  return match?.[1] ?? 'UNKNOWN';
}

function statusForSource(source, content) {
  if (source.status) return source.status;
  if (source.source_class === 'MODEL') return 'UNKNOWN';
  if (source.source_class === 'EVIDENCE') return reportVerdict(content);
  if (source.source_class === 'AGENT' || source.source_class === 'CAPABILITY' || source.source_class === 'SKILL') return 'FILE_ONLY';
  return source.acceptance_state ?? 'UNKNOWN';
}

function statusFromQualification(value) {
  const allowed = new Set(['ACTIVE', 'DEGRADED', 'FILE_ONLY', 'LOADABLE', 'QUALIFIED', 'BLOCKED', 'UNKNOWN']);
  return allowed.has(value) ? value : 'UNKNOWN';
}

function entry({ id, title, source, sourceHash, status, description = '', fields = {}, relationships = [] }) {
  return {
    id,
    title,
    kind: source.kind,
    namespace: source.namespace,
    status: STATUS_STATES.includes(status) ? status : 'UNKNOWN',
    source_ref: source.path,
    source_hash: sourceHash,
    epistemic_class: source.classification,
    authority_class: source.authority_class,
    acceptance_state: source.acceptance_state,
    trust_domain: source.trust_domain,
    projection_id: PROJECTION_ID,
    privacy_class: source.privacy_class ?? 'UNKNOWN',
    stale_state: 'FRESH',
    description: description.trim().slice(0, 500),
    relationships,
    ...fields
  };
}

function parseAdr(source, content, sourceHash) {
  const adrId = basename(source.path).match(/^(\d+)/)?.[1] ?? source.path;
  const status = nextHeadingValue(content, 'Status') ?? source.acceptance_state;
  const date = nextHeadingValue(content, 'Date');
  const supersedes = [...content.matchAll(/(?:supersed(?:es|ed)|replaces)\s+(?:ADR\s+)?(\d{4})/gi)].map(match => match[1]);
  return entry({
    id: `decision:${adrId}`,
    title: source.title,
    source,
    sourceHash,
    status: status === 'Accepted' ? 'ACCEPTED' : status === 'Superseded' ? 'SUPERSEDED' : 'UNKNOWN',
    description: nextHeadingValue(content, 'Context') ?? firstHeading(content, source.title),
    fields: { date, decision_status: status, path: source.path, supersedes },
    relationships: supersedes.map(target => ({ type: 'supersedes', target: `decision:${target}` }))
  });
}

function parseEvidence(source, content, sourceHash) {
  const verdict = source.source_class === 'FAILURE' ? 'DEGRADED' : reportVerdict(content);
  const workpackage = source.path.split('/')[1] ?? 'UNKNOWN';
  const commit = content.match(/^(?:[-*]\s*)?(?:fixed point|repository fixed point|commit|HEAD)\b[^0-9a-f]*([0-9a-f]{7,40})\b/im)?.[1] ?? null;
  const date = content.match(/\b20\d{2}-\d{2}-\d{2}\b/)?.[0] ?? null;
  return [entry({
    id: `evidence:${workpackage}:${basename(source.path)}`,
    title: source.title,
    source,
    sourceHash,
    status: verdict,
    description: firstHeading(content, source.title),
    fields: { workpackage, verdict, report_path: source.path, commit, date, evidence_type: source.source_class },
    relationships: [{ type: 'supports', target: `status:${workpackage}` }]
  })];
}

function parseModelRegistry(source, content, sourceHash) {
  const parsed = JSON.parse(content);
  return parsed.models.map(model => entry({
    id: `model:${model.id}`,
    title: model.display_name ?? model.id,
    source,
    sourceHash,
    status: statusFromQualification(model.qualification_state),
    description: model.notes ?? model.family ?? model.id,
    fields: {
      model_id: model.id,
      family: model.family,
      parameters: model.parameters,
      format: model.format,
      quantization: model.quantization,
      capability_candidates: model.capability_candidates ?? [],
      declared_trust_domain: model.trust_domain ?? 'UNKNOWN',
      qualification_state: model.qualification_state ?? 'UNKNOWN',
      lifecycle_owner: model.lifecycle_owner ?? 'UNKNOWN',
      relative_path: model.relative_path,
      sha256: model.sha256
    },
    relationships: (model.capability_candidates ?? []).map(capability => ({ type: 'provides_candidate', target: `capability:${capability}` }))
  }));
}

function parseProviderMap(source, content, sourceHash) {
  const parsed = JSON.parse(content);
  return Object.entries(parsed.roles ?? {}).map(([role, value]) => {
    const details = typeof value === 'string' ? { selector: value } : value;
    const status = role === 'world' && details?.evidence?.startsWith('live') ? 'QUALIFIED' : value === 'UNKNOWN' || details?.selector === 'UNKNOWN' ? 'UNKNOWN' : 'FILE_ONLY';
    return entry({
      id: `provider:${role}`,
      title: role,
      source,
      sourceHash,
      status,
      description: details?.authority ?? details?.selector ?? 'No provider binding observed.',
      fields: { role, selector: details?.selector ?? null, provider: details?.provider ?? null, model: details?.model ?? null, declared_trust_domain: details?.trust_class ?? 'UNKNOWN' },
      relationships: [{ type: 'binds_role', target: `role:${role}` }]
    });
  });
}

function parseAgent(source, content, sourceHash) {
  const metadata = frontmatter(content);
  return [entry({
    id: `agent:${metadata.name ?? basename(dirname(source.path))}`,
    title: source.title,
    source,
    sourceHash,
    status: 'FILE_ONLY',
    description: metadata.description ?? firstHeading(content, source.title),
    fields: { agent_name: metadata.name ?? null, model_binding: metadata.model ?? 'UNKNOWN', command_execution_policy: metadata.commandExecutionPolicy ?? 'UNKNOWN', main_agent: metadata.mainAgent === 'true', subagent: metadata.subagent === 'true' },
    relationships: [{ type: 'allowed', target: 'capability:declared-by-agent-policy' }]
  })];
}

function parseSkill(source, content, sourceHash) {
  const metadata = frontmatter(content);
  return [entry({
    id: `skill:${metadata.name ?? basename(dirname(source.path))}`,
    title: source.title,
    source,
    sourceHash,
    status: 'FILE_ONLY',
    description: metadata.description ?? firstHeading(content, source.title),
    fields: { skill_name: metadata.name ?? null },
    relationships: [{ type: 'used_by', target: 'workflow:bounded-implementation' }]
  })];
}

function parseCapability(source, content, sourceHash) {
  return [entry({
    id: `capability:${basename(dirname(source.path))}`,
    title: source.title,
    source,
    sourceHash,
    status: 'ACCEPTED',
    description: firstHeading(content, source.title),
    fields: { contract: source.path },
    relationships: [{ type: 'allowed', target: 'agent:policy-filter' }]
  })];
}

function parseResearch(source, content, sourceHash) {
  const researchType = source.source_class === 'EXPERIMENT' ? 'EXPERIMENT' : source.path.includes('RESEARCH') ? 'FUTURE_RESEARCH' : 'OBSERVATION';
  return [entry({
    id: `${researchType.toLowerCase()}:${source.path.replaceAll('/', ':')}`,
    title: source.title,
    source,
    sourceHash,
    status: source.source_class === 'EXPERIMENT' ? 'EXPERIMENTAL' : 'UNKNOWN',
    description: firstHeading(content, source.title),
    fields: { research_type: researchType, tested_hypothesis: researchType === 'EXPERIMENT' ? 'UNKNOWN' : null },
    relationships: [{ type: 'tests', target: researchType === 'EXPERIMENT' ? 'hypothesis:bounded-retrieval' : 'research:future-work' }]
  })];
}

function parseGeneric(source, content, sourceHash) {
  return [entry({
    id: `record:${source.path.replaceAll('/', ':')}`,
    title: source.title,
    source,
    sourceHash,
    status: statusForSource(source, content),
    description: firstHeading(content, source.title),
    fields: { source_class: source.source_class }
  })];
}

function recordsFor(source, content, sourceHash) {
  if (source.source_class === 'DECISION') return [parseAdr(source, content, sourceHash)];
  if (source.source_class === 'EVIDENCE' || source.source_class === 'FAILURE') return parseEvidence(source, content, sourceHash);
  if (source.source_class === 'MODEL') return parseModelRegistry(source, content, sourceHash);
  if (source.source_class === 'PROVIDER') return parseProviderMap(source, content, sourceHash);
  if (source.source_class === 'AGENT') return parseAgent(source, content, sourceHash);
  if (source.source_class === 'SKILL') return parseSkill(source, content, sourceHash);
  if (source.source_class === 'CAPABILITY') return parseCapability(source, content, sourceHash);
  if (source.source_class === 'RESEARCH' || source.source_class === 'EXPERIMENT') return parseResearch(source, content, sourceHash);
  return parseGeneric(source, content, sourceHash);
}

function sourceManifest(source, rootDir) {
  const fullPath = canonicalPath(rootDir, source.path);
  if (!existsSync(fullPath)) return { ...source, exists: false, state: source.optional ? 'QUARANTINED' : 'MISSING', source_hash: null };
  return { ...source, exists: true, state: 'CURRENT', source_hash: hashSource(fullPath) };
}

function markdownFor(result) {
  const lines = [
    '# Canonical KAD-PI Wiki',
    '',
    '<!-- DERIVED: generated from the curated KAD KnowledgePlane. Canonical sources remain authoritative. -->',
    '',
    `Projection: \`${result.projection_id}\``,
    `Status: \`${result.status}\``,
    `Sources: \`${result.source_count}\``,
    `Records: \`${result.record_count}\``,
    '',
    '## Navigation',
    ''
  ];
  for (const namespace of Object.keys(result.namespaces)) lines.push(`- [${namespace}](namespaces/${namespace}.md) — ${result.namespaces[namespace].length} records`);
  lines.push('', '## Trust boundary', '', 'This is derived navigation. Every record carries `source_ref` and `source_hash`; no generated record grants authority or mutates canonical sources.', '');
  return lines.join('\n');
}

function namespaceMarkdown(namespace, records) {
  const lines = [`# ${namespace}`, '', '<!-- DERIVED: this namespace is rebuildable project state. -->', ''];
  for (const record of records) {
    lines.push(`## ${record.title}`, '', `- ID: \`${record.id}\``, `- Status: \`${record.status}\``, `- Source: \`${record.source_ref}\``, `- Source hash: \`${record.source_hash}\``, `- Epistemic class: \`${record.epistemic_class}\``, `- Acceptance: \`${record.acceptance_state}\``, `- Trust domain: \`${record.trust_domain}\``, `- Privacy: \`${record.privacy_class}\``);
    if (record.description) lines.push(`- Description: ${record.description}`);
    lines.push('');
  }
  return lines.join('\n');
}

export function projectionImpact({ changed_paths: changedPaths = [] } = {}) {
  const sources = new Map(CURATED_SOURCE_ALLOWLIST.map(source => [source.path, source]));
  const affected = [...new Set(changedPaths.filter(path => sources.has(path)))].sort();
  const affectedNamespaces = [...new Set(affected.map(path => sources.get(path).namespace))].sort();
  return { rebuild: affected.length > 0, affected_paths: affected, affected_namespaces: affectedNamespaces };
}

export function validateProjection({ rootDir = process.cwd(), outputDir } = {}) {
  if (!outputDir || !existsSync(join(outputDir, 'manifest.json'))) return { status: 'UNKNOWN', reason: 'projection manifest is unavailable' };
  const manifest = JSON.parse(readFileSync(join(outputDir, 'manifest.json'), 'utf8'));
  for (const source of manifest.sources) {
    const fullPath = canonicalPath(rootDir, source.path);
    const exists = existsSync(fullPath);
    if (!exists && ['QUARANTINED', 'MISSING'].includes(source.state)) continue;
    if (exists && !source.source_hash) return { status: 'STALE', source_ref: source.path };
    if (!exists || hashSource(fullPath) !== source.source_hash) return { status: 'STALE', source_ref: source.path };
  }
  return { status: 'CURRENT', projection_id: manifest.projection_id };
}

function linkValidation(outputDir) {
  const broken = [];
  const files = [];
  const walk = dir => {
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, name.name);
      if (name.isDirectory()) walk(full);
      else if (name.name.endsWith('.md')) files.push(full);
    }
  };
  walk(outputDir);
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    for (const [, target] of content.matchAll(/\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)/g)) {
      const resolved = resolve(dirname(file), target);
      if (!existsSync(resolved)) broken.push({ file: relative(outputDir, file), target });
    }
  }
  return { status: broken.length === 0 ? 'PASS' : 'FAIL', checked_files: files.length, broken_links: broken };
}

export class CuratedKnowledgeProjection {
  #rootDir;
  #allowlist;
  #plane;

  constructor({ rootDir = process.cwd(), source_allowlist: sourceAllowlist = CURATED_SOURCE_ALLOWLIST } = {}) {
    this.#rootDir = resolve(rootDir);
    this.#allowlist = Object.freeze(sourceAllowlist.map(source => Object.freeze({ ...source })));
    this.#plane = new DeterministicKnowledgePlane({ rootDir: this.#rootDir, source_allowlist: this.#allowlist });
  }

  census() {
    return this.#allowlist.map(source => sourceManifest(source, this.#rootDir));
  }

  #load() {
    const sourceCensus = this.census();
    const quarantined = sourceCensus.filter(source => !source.exists);
    const records = [];
    for (const source of sourceCensus.filter(item => item.exists && item.projection_eligible)) {
      try {
        const fullPath = canonicalPath(this.#rootDir, source.path);
        const content = readFileSync(fullPath, 'utf8');
        records.push(...recordsFor(source, content, source.source_hash));
      } catch (error) {
        source.state = 'QUARANTINED';
        source.error = 'source parsing failed';
        quarantined.push(source);
      }
    }
    records.sort((left, right) => left.id.localeCompare(right.id));
    const namespaces = {};
    for (const record of records) (namespaces[record.namespace] ??= []).push(record);
    for (const namespace of Object.keys(namespaces)) namespaces[namespace].sort((left, right) => left.id.localeCompare(right.id));
    return { sourceCensus, quarantined, records, namespaces };
  }

  project({ output_dir: outputDir = null, write = false, changed_paths: changedPaths = [] } = {}) {
    const impact = projectionImpact({ changed_paths: changedPaths });
    if (write && changedPaths.length > 0 && !impact.rebuild) return { status: 'PASS', skipped: true, impact };
    const loaded = this.#load();
    const status = loaded.quarantined.some(source => !source.optional) ? 'PARTIAL' : 'PASS';
    const result = {
      status,
      projection_id: PROJECTION_ID,
      source_count: loaded.sourceCensus.filter(source => source.exists).length,
      record_count: loaded.records.length,
      records: loaded.records,
      namespaces: loaded.namespaces,
      source_census: loaded.sourceCensus,
      quarantined_sources: loaded.quarantined,
      impact,
      markdown: markdownFor({ status, projection_id: PROJECTION_ID, source_count: loaded.sourceCensus.filter(source => source.exists).length, record_count: loaded.records.length, namespaces: loaded.namespaces })
    };
    if (!write) return result;
    mkdirSync(outputDir, { recursive: true });
    mkdirSync(join(outputDir, 'namespaces'), { recursive: true });
    for (const namespace of NAMESPACE_NAMES) {
      if (namespace !== 'PROJECT') rmSync(join(outputDir, `${namespace.toLowerCase()}.json`), { force: true });
      if (!loaded.namespaces[namespace]) {
        rmSync(join(outputDir, 'namespaces', `${namespace}.md`), { force: true });
        rmSync(join(outputDir, 'namespaces', `${namespace}.json`), { force: true });
        if (namespace === 'PROJECT') rmSync(join(outputDir, 'project-records.json'), { force: true });
      }
    }
    const state = { projection_id: PROJECTION_ID, status, source_count: result.source_count, record_count: result.record_count, source_census: loaded.sourceCensus, quarantined_sources: loaded.quarantined, records: loaded.records, namespaces: loaded.namespaces };
    const statusProjection = this.status(loaded);
    const adrIndex = this.adrIndex(loaded.records);
    const evidenceIndex = this.evidenceIndex(loaded.records);
    const files = {
      'project-state.json': state,
      'project.json': { projection_id: PROJECTION_ID, name: 'KAD-PI', status, source_count: result.source_count, record_count: result.record_count, source_hashes: loaded.sourceCensus.filter(source => source.exists).map(source => ({ source_ref: source.path, source_hash: source.source_hash })) },
      'status.json': statusProjection,
      'adr-index.json': adrIndex,
      'evidence-index.json': evidenceIndex,
      'source-census.json': loaded.sourceCensus,
      'source-allowlist.json': this.#allowlist,
      'source-hashes.json': loaded.sourceCensus.filter(source => source.exists).map(source => ({ source_ref: source.path, source_hash: source.source_hash })),
      'namespace-manifest.json': Object.fromEntries(Object.entries(loaded.namespaces).map(([namespace, items]) => [namespace, items.map(item => item.id)])),
      'index.md': result.markdown,
      'link-validation.json': null
    };
    for (const [name, value] of Object.entries(files)) if (value !== null) writeFileSync(join(outputDir, name), typeof value === 'string' ? value : stableJson(value));
    for (const [namespace, items] of Object.entries(loaded.namespaces)) {
      writeFileSync(join(outputDir, 'namespaces', `${namespace}.md`), namespaceMarkdown(namespace, items));
      writeFileSync(join(outputDir, 'namespaces', `${namespace}.json`), stableJson(items));
    }
    const links = linkValidation(outputDir);
    writeFileSync(join(outputDir, 'link-validation.json'), stableJson(links));
    writeFileSync(join(outputDir, 'manifest.json'), stableJson({ projection_id: PROJECTION_ID, status, sources: loaded.sourceCensus.map(source => ({ path: source.path, source_hash: source.source_hash, state: source.state })) }));
    return { ...result, status_projection: statusProjection, adr_index: adrIndex, evidence_index: evidenceIndex, link_validation: links, output_dir: outputDir };
  }

  status(loaded = this.#load()) {
    const components = [];
    for (const source of loaded.sourceCensus) {
      if (source.component_statuses) for (const [component, state] of Object.entries(source.component_statuses)) components.push({ component, state, source_ref: source.path, evidence_ref: source.path, source_hash: source.source_hash, blocking_reason: state === 'BLOCKED' ? 'qualification evidence is incomplete' : null, degraded_capabilities: [] });
    }
    for (const record of loaded.records.filter(record => record.namespace === 'MODELS' || record.namespace === 'PROVIDERS')) components.push({ component: record.title, state: record.status, source_ref: record.source_ref, evidence_ref: record.source_ref, source_hash: record.source_hash, blocking_reason: record.status === 'DEGRADED' ? record.description : null, degraded_capabilities: record.status === 'DEGRADED' ? record.capability_candidates ?? [] : [] });
    components.sort((left, right) => left.component.localeCompare(right.component));
    const degraded = components.filter(component => ['DEGRADED', 'BLOCKED', 'PARTIAL'].includes(component.state));
    return { projection_id: PROJECTION_ID, status: degraded.length > 0 ? 'PARTIAL' : 'PASS', components, degraded_components: degraded.map(component => component.component) };
  }
  adrIndex(records = this.#load().records) {
    return records.filter(record => record.namespace === 'DECISIONS').map(record => ({ id: record.id, title: record.title, status: record.decision_status ?? 'UNKNOWN', path: record.path ?? record.source_ref, date: record.date ?? null, superseded: record.status === 'SUPERSEDED', related_decisions: record.relationships.filter(relation => relation.type === 'supersedes').map(relation => relation.target) }));
  }

  evidenceIndex(records = this.#load().records) {
    return records.filter(record => ['EVIDENCE', 'FAILURES'].includes(record.namespace)).map(record => ({ workpackage: record.workpackage ?? 'UNKNOWN', verdict: record.verdict ?? 'UNKNOWN', report_path: record.report_path ?? record.source_ref, commit: record.commit ?? null, date: record.date ?? null, major_capabilities_proven: [], remaining_blockers: record.status === 'BLOCKED' || record.status === 'DEGRADED' ? [record.description] : [] }));
  }

  read({ source_ref: sourceRef, trust_domain: trustDomain } = {}) {
    return this.#plane.read({ source_ref: sourceRef, trust_domain: trustDomain });
  }

  ask(query, { limit = 5, trust_domain: trustDomain = 'engineering' } = {}) {
    if (trustDomain !== 'engineering') return { status: 'REJECTED', reason: 'no sources authorized for trust domain', retrieval_mode: 'exact', results: [] };
    const terms = String(query ?? '').toLowerCase().match(/[a-z0-9][a-z0-9_-]*/g)?.filter(term => !new Set(['a', 'an', 'and', 'are', 'does', 'for', 'how', 'in', 'is', 'of', 'on', 'or', 'the', 'to', 'what', 'when', 'where', 'which', 'who']).has(term)) ?? [];
    if (terms.length === 0) return { status: 'UNKNOWN', retrieval_mode: 'exact', results: [] };
    const loaded = this.#load();
    const results = loaded.records.map(record => {
      const searchable = JSON.stringify(record).toLowerCase();
      const matchedTerms = terms.filter(term => searchable.includes(term)).length;
      const score = terms.reduce((sum, term) => sum + (record.title.toLowerCase().includes(term) ? 12 : 0) + (searchable.split(term).length - 1) * 4, 0);
      return { record, score, matchedTerms };
    }).filter(item => item.record.trust_domain === trustDomain && item.matchedTerms >= Math.min(2, terms.length) && item.score > 0)
      .filter(item => !(terms.includes('qualified') && item.record.namespace === 'MODELS' && !['QUALIFIED', 'ACTIVE', 'LOADABLE'].includes(item.record.status)))
      .sort((left, right) => right.score - left.score || left.record.id.localeCompare(right.record.id))
      .slice(0, limit)
      .map(({ record, score }) => ({ id: record.id, title: record.title, answer: record.description, excerpt: record.description, source_ref: record.source_ref, source_path: record.source_ref, source_hash: record.source_hash, locator: record.source_ref, epistemic_class: record.epistemic_class, acceptance_state: record.acceptance_state, trust_domain: record.trust_domain, retrieval_mode: 'exact', score, status: record.status }));
    return { status: results.length > 0 ? 'PASS' : 'UNKNOWN', retrieval_mode: 'exact', results };
  }

  list(namespace = null) {
    const loaded = this.#load();
    return namespace ? loaded.namespaces[namespace] ?? [] : loaded.records;
  }

  show(id) {
    return this.#load().records.find(record => record.id === id) ?? null;
  }
}

export function runCuratedKnowledgeCli(args, { rootDir = resolve(dirname(new URL(import.meta.url).pathname), '../..'), outputDir = join(rootDir, 'wiki', 'generated', 'kad-canonical'), stdout = console.log, stderr = console.error } = {}) {
  const [command, ...rest] = args;
  const positional = rest.filter(arg => arg !== '--json');
  const projection = new CuratedKnowledgeProjection({ rootDir });
  if (command === 'rebuild') {
    const result = projection.project({ output_dir: outputDir, write: true });
    stdout(JSON.stringify({ status: result.status, projection_id: result.projection_id, output_dir: relative(rootDir, outputDir), records: result.record_count, sources: result.source_count }, null, 2));
    return 0;
  }
  if (command === 'health') {
    const result = projection.project();
    const status = projection.status();
    stdout(JSON.stringify({ status: status.status, projection_status: result.status, backend: 'deterministic', projection_id: PROJECTION_ID, source_count: result.source_count, record_count: result.record_count, degraded_components: status.degraded_components }, null, 2));
    return 0;
  }
  if (command === 'status') {
    stdout(JSON.stringify(projection.status(), null, 2));
    return 0;
  }
  if (command === 'ask' && positional.length > 0) {
    const result = projection.ask(positional.join(' '));
    stdout(JSON.stringify({ query: positional.join(' '), ...result }, null, 2));
    return result.status === 'UNKNOWN' || result.status === 'REJECTED' ? 1 : 0;
  }
  if (command === 'list') {
    stdout(JSON.stringify(projection.list(positional[0] ?? null), null, 2));
    return 0;
  }
  if (command === 'show' && positional[0]) {
    const record = projection.show(positional[0]);
    stdout(JSON.stringify(record ?? { status: 'UNKNOWN', id: positional[0] }, null, 2));
    return record ? 0 : 1;
  }
  stderr('usage: kad-knowledge rebuild|ask <question>|health|status|list [namespace]|show <id>');
  return 2;
}
