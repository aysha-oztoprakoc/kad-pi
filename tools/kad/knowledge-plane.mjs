#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';

export const EPISTEMIC_CLASSES = Object.freeze({
  AUTHOR_DECLARED: 'AUTHOR_DECLARED',
  DOCUMENT_DERIVED: 'DOCUMENT_DERIVED',
  OBSERVED: 'OBSERVED',
  INFERRED: 'INFERRED',
  HYPOTHESIS: 'HYPOTHESIS',
  UNKNOWN: 'UNKNOWN'
});

export const ACCEPTANCE_STATES = Object.freeze({
  PROPOSED: 'PROPOSED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  SUPERSEDED: 'SUPERSEDED',
  UNKNOWN: 'UNKNOWN'
});

const PROJECTION_ID = 'kad-knowledge-plane-wiki-v1';
const ALLOWLIST = [
  ['PRIME_DIRECTIVE.md', 'Prime Directive', 'directive'],
  ['CONTEXT.md', 'KAD-PI Domain Context', 'glossary'],
  ['docs/adr/0007-synthetic-knowledge-librarian-architecture.md', 'Synthetic Knowledge Librarian Architecture', 'adr'],
  ['docs/adr/0008-unified-context-knowledge-plane.md', 'Unified Context and Knowledge Plane', 'adr'],
  ['wiki/KAD_Context_Knowledge_Plane_Roadmap_2026-08-29.md', 'KAD Context Knowledge Plane Roadmap', 'roadmap']
];

export const DEFAULT_SOURCE_ALLOWLIST = Object.freeze(ALLOWLIST.map(([path, title, kind]) => Object.freeze({
  path,
  title,
  kind,
  classification: EPISTEMIC_CLASSES.DOCUMENT_DERIVED,
  authority_class: 'CANONICAL_SOURCE',
  acceptance_state: ACCEPTANCE_STATES.ACCEPTED,
  trust_domain: 'engineering'
})));

function canonicalPath(rootDir, sourcePath) {
  if (typeof sourcePath !== 'string' || !sourcePath || sourcePath.includes('\0')) throw new Error('source path is invalid');
  const root = resolve(rootDir);
  const full = resolve(root, sourcePath);
  const rel = relative(root, full);
  if (!rel || rel.startsWith(`..${sep}`) || rel === '..' || rel.startsWith(sep) || rel !== sourcePath) throw new Error(`source path is outside root: ${sourcePath}`);
  return full;
}

export function hashSource(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function recordId(sourcePath) {
  return `kp:${sourcePath.replaceAll('/', ':')}`;
}

const QUERY_STOPWORDS = new Set(['a', 'an', 'and', 'are', 'does', 'for', 'how', 'in', 'is', 'of', 'on', 'or', 'the', 'to', 'what', 'when', 'where', 'which', 'who']);

function lineExcerpt(content, terms, maxLines = 3) {
  const scored = content.split(/\r?\n/).map((line, index) => ({
    line,
    line_number: index + 1,
    score: terms.reduce((score, term) => score + (line.toLowerCase().includes(term) ? 1 : 0), 0)
  })).filter(item => item.score > 0);
  return scored.sort((left, right) => right.score - left.score || left.line_number - right.line_number).slice(0, maxLines).sort((left, right) => left.line_number - right.line_number);
}

function queryTerms(query) {
  return (String(query ?? '').toLowerCase().match(/[a-z0-9][a-z0-9_-]*/g) ?? []).filter(term => !QUERY_STOPWORDS.has(term));
}

function occurrences(text, term) {
  return text.split(term).length - 1;
}

function scoreContent(content, title, terms) {
  const lowerContent = content.toLowerCase();
  const lowerTitle = title.toLowerCase();
  return terms.reduce((score, term) => score + (lowerTitle.includes(term) ? 12 : 0) + occurrences(lowerContent, term) * 4, 0);
}

function assertTrust(record, trustDomain) {
  if (!trustDomain || trustDomain === 'UNKNOWN') throw new Error('trust domain is required');
  if (record.trust_domain !== trustDomain) throw new Error(`trust domain mismatch: ${trustDomain}`);
}

function markdownFor(records) {
  const lines = [
    '# KAD KnowledgePlane Projection',
    '',
    '<!-- DERIVED: generated from allowlisted canonical sources. This file is not authoritative. -->',
    '',
    `Projection: \`${PROJECTION_ID}\``,
    '',
    '## Records',
    ''
  ];
  for (const record of records) {
    lines.push(`### ${record.title}`, '');
    lines.push(`- Record ID: \`${record.id}\``);
    lines.push(`- Kind: \`${record.kind}\``);
    lines.push(`- Status: \`DERIVED\``);
    lines.push(`- Source ref: \`${record.source_ref}\``);
    lines.push(`- Source path: \`${record.source_path}\``);
    lines.push(`- Source hash: \`${record.source_hash}\``);
    lines.push(`- Epistemic class: \`${record.epistemic_class}\``);
    lines.push(`- Acceptance state: \`${record.acceptance_state}\``);
    lines.push(`- Authority class: \`${record.authority_class}\``);
    lines.push(`- Trust domain: \`${record.trust_domain}\``);
    lines.push(`- Projection ID: \`${record.projection_id}\``);
    lines.push(`- Stale state: \`${record.stale_state}\``);
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

export function projectionImpact({ changed_paths: changedPaths = [] } = {}) {
  const allowed = new Set(DEFAULT_SOURCE_ALLOWLIST.map(source => source.path));
  const affected = [...new Set(changedPaths.filter(path => allowed.has(path)))].sort();
  return { rebuild: affected.length > 0, affected_paths: affected };
}

export function validateAcceptanceTransition(record, { actor, target_state: targetState } = {}) {
  if (!record || !Object.values(ACCEPTANCE_STATES).includes(targetState)) return { status: 'REJECTED', reason: 'invalid acceptance state' };
  if (targetState === ACCEPTANCE_STATES.ACCEPTED && actor !== 'KAD_VALIDATOR') return { status: 'REJECTED', reason: 'only KAD_VALIDATOR may accept a record' };
  if (targetState === ACCEPTANCE_STATES.ACCEPTED && record.authority_class === 'MODEL_INFERENCE') return { status: 'REJECTED', reason: 'model inference cannot self-promote' };
  return { status: targetState === ACCEPTANCE_STATES.ACCEPTED ? 'ACCEPTED' : 'VALID' };
}

export class DeterministicKnowledgePlane {
  #rootDir;
  #allowlist;

  constructor({ rootDir = process.cwd(), source_allowlist: sourceAllowlist = DEFAULT_SOURCE_ALLOWLIST } = {}) {
    this.#rootDir = resolve(rootDir);
    this.#allowlist = Object.freeze(sourceAllowlist.map(source => Object.freeze({ ...source })));
  }

  health() {
    return {
      status: 'PASS',
      backend: 'deterministic',
      source_count: this.#allowlist.length,
      projection_id: PROJECTION_ID
    };
  }

  #source(path) {
    const source = this.#allowlist.find(item => item.path === path);
    if (!source) throw new Error(`unknown source: ${path}`);
    return source;
  }

  #record(source) {
    const fullPath = canonicalPath(this.#rootDir, source.path);
    const content = readFileSync(fullPath, 'utf8');
    const sourceHash = hashSource(fullPath);
    return {
      id: recordId(source.path),
      title: source.title,
      kind: source.kind,
      source_ref: source.path,
      source_path: source.path,
      source_hash: sourceHash,
      epistemic_class: source.classification ?? EPISTEMIC_CLASSES.DOCUMENT_DERIVED,
      authority_class: source.authority_class ?? 'CANONICAL_SOURCE',
      acceptance_state: source.acceptance_state ?? ACCEPTANCE_STATES.ACCEPTED,
      trust_domain: source.trust_domain ?? 'UNKNOWN',
      projection_id: PROJECTION_ID,
      created_at: null,
      updated_at: null,
      stale_state: 'FRESH',
      _content: content
    };
  }

  ingest() {
    return this.#allowlist.map(source => {
      const { _content: content, ...record } = this.#record(source);
      void content;
      return record;
    });
  }

  read({ source_ref: sourceRef, trust_domain: trustDomain } = {}) {
    const source = this.#source(sourceRef);
    const record = this.#record(source);
    assertTrust(record, trustDomain);
    const { _content: content, ...publicRecord } = record;
    return { ...publicRecord, content };
  }

  retrieve(query, { trust_domain: trustDomain, limit = 5, semantic_available: semanticAvailable = true } = {}) {
    if (!trustDomain || trustDomain === 'UNKNOWN') return { status: 'REJECTED', reason: 'trust domain is required', results: [] };
    const terms = queryTerms(query);
    if (terms.length === 0) return { status: 'REJECTED', reason: 'query is required', results: [] };
    const sources = this.#allowlist.map(source => this.#record(source));
    const unauthorized = sources.some(record => record.trust_domain !== trustDomain);
    if (unauthorized && !sources.some(record => record.trust_domain === trustDomain)) return { status: 'REJECTED', reason: `no sources authorized for trust domain: ${trustDomain}`, results: [] };
    const results = sources
      .filter(record => record.trust_domain === trustDomain)
      .map(record => ({ record, score: scoreContent(record._content, record.title, terms) }))
      .filter(item => item.score > 0)
      .sort((left, right) => right.score - left.score || left.record.source_ref.localeCompare(right.record.source_ref))
      .slice(0, limit)
      .map(({ record, score }) => {
        const excerpts = lineExcerpt(record._content, terms);
        const first = excerpts[0] ?? { line: record.title, line_number: 1 };
        const last = excerpts.at(-1) ?? first;
        return {
          id: record.id,
          title: record.title,
          answer: excerpts.map(item => item.line.trim()).join(' '),
          excerpt: excerpts.map(item => item.line.trim()).join('\n'),
          source_ref: record.source_ref,
          source_path: record.source_path,
          source_hash: record.source_hash,
          locator: `${record.source_path}#L${first.line_number}-L${last.line_number}`,
          start_line: first.line_number,
          end_line: last.line_number,
          epistemic_class: record.epistemic_class,
          acceptance_state: record.acceptance_state,
          trust_domain: record.trust_domain,
          retrieval_mode: 'exact',
          score
        };
      });
    return {
      status: semanticAvailable === false ? 'DEGRADED' : 'PASS',
      retrieval_mode: 'exact',
      degradation_status: semanticAvailable === false ? 'semantic backend unavailable; exact fallback used' : 'NONE',
      results
    };
  }

  project({ output_dir: outputDir = null, write = false } = {}) {
    const records = this.ingest();
    const markdown = markdownFor(records);
    const structured = JSON.stringify({ projection_id: PROJECTION_ID, status: 'DERIVED', records }, null, 2);
    if (write) {
      if (!outputDir) throw new Error('output_dir is required when write is true');
      mkdirSync(outputDir, { recursive: true });
      writeFileSync(join(outputDir, 'index.md'), markdown);
      writeFileSync(join(outputDir, 'records.json'), `${structured}\n`);
    }
    return {
      status: 'PASS',
      projection_id: PROJECTION_ID,
      output_dir: outputDir,
      records,
      markdown,
      structured,
      source_preservation: true
    };
  }
}

export const CLAIM_CLASSES = Object.freeze({
  SOURCE_FACT: 'SOURCE_FACT',
  DERIVED_SYNTHESIS: 'DERIVED_SYNTHESIS',
  PROJECT_INFERENCE: 'PROJECT_INFERENCE',
  UNKNOWN: 'UNKNOWN'
});

export const TRAINING_ELIGIBILITY = Object.freeze({
  TRAIN_ELIGIBLE: 'TRAIN_ELIGIBLE',
  TRAIN_INELIGIBLE: 'TRAIN_INELIGIBLE',
  UNKNOWN: 'UNKNOWN'
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function claimRecord(claim, source) {
  const epistemicClass = claim.classification;
  const authoritative = epistemicClass === CLAIM_CLASSES.SOURCE_FACT;
  return Object.freeze({
    id: `kp:claim:${claim.claim_id}`,
    canonical_id: `kp:claim:${claim.claim_id}`,
    claim_id: claim.claim_id,
    claim_text: claim.claim_text,
    epistemic_class: epistemicClass,
    authority_class: authoritative ? 'AUTHORITATIVE_EVIDENCE' : 'DERIVED_KAD_KNOWLEDGE',
    acceptance_state: ACCEPTANCE_STATES.ACCEPTED,
    promotion_state: 'PROMOTED',
    source_id: source.source_id,
    source_ref: source.source_ref,
    source_hash: source.source_hash,
    support_location: claim.support_location,
    support_type: claim.support_type,
    verification_status: claim.verification_status,
    provenance: {
      source_id: source.source_id,
      source_ref: source.source_ref,
      source_hash: source.source_hash,
      support_location: claim.support_location,
      audit_status: claim.verification_status
    },
    training_eligibility: epistemicClass === CLAIM_CLASSES.UNKNOWN
      ? TRAINING_ELIGIBILITY.UNKNOWN
      : TRAINING_ELIGIBILITY.TRAIN_ELIGIBLE,
    version: 1,
    supersedes: null
  });
}

function validateAuditedClaim(claim, sources) {
  if (!claim || !claim.claim_id || !claim.claim_text) return 'claim_id and claim_text are required';
  if (claim.classification === CLAIM_CLASSES.UNKNOWN) return null;
  if (!Object.values(CLAIM_CLASSES).includes(claim.classification)) return 'invalid epistemic class';
  if (!claim.source_id) return 'source_id is required';
  const source = sources.get(claim.source_id);
  if (!source) return 'source linkage is not present';
  if (!claim.support_location || !claim.support_type) return 'support provenance is required';
  if (claim.verification_status !== 'SUPPORTED' && claim.verification_status !== 'DERIVED_NOT_SOURCE_FACT') return 'verification_status must be SUPPORTED';
  if (claim.classification === CLAIM_CLASSES.SOURCE_FACT && claim.verification_status !== 'SUPPORTED') return 'SOURCE_FACT requires SUPPORTED verification';
  return null;
}

export class ClaimKnowledgePlane {
  #sources;
  #records = new Map();
  #history = [];

  constructor({ sources = [] } = {}) {
    this.#sources = new Map(sources.map(source => [source.source_id, Object.freeze({ ...source })]));
  }

  promote(claims = []) {
    const promoted = [];
    const retained = [];
    const rejected = [];
    const duplicates = [];
    for (const claim of claims) {
      if (claim?.classification === CLAIM_CLASSES.UNKNOWN) {
        retained.push(Object.freeze({ ...clone(claim), epistemic_class: CLAIM_CLASSES.UNKNOWN, promotion_state: 'RETAINED', acceptance_state: ACCEPTANCE_STATES.UNKNOWN, training_eligibility: TRAINING_ELIGIBILITY.UNKNOWN }));
        continue;
      }
      const reason = validateAuditedClaim(claim, this.#sources);
      if (reason) {
        rejected.push({ claim_id: claim?.claim_id ?? null, reason });
        continue;
      }
      const id = `kp:claim:${claim.claim_id}`;
      if (this.#records.has(id)) {
        duplicates.push(id);
        continue;
      }
      const record = claimRecord(claim, this.#sources.get(claim.source_id));
      this.#records.set(id, record);
      this.#history.push(record);
      promoted.push(record);
    }
    return { promoted, retained, rejected, duplicates };
  }

  supersede(claimId, replacement) {
    const prior = this.#records.get(`kp:claim:${claimId}`);
    if (!prior) throw new Error(`claim not found: ${claimId}`);
    const result = this.promote([{ ...replacement, claim_id: replacement.claim_id }]);
    if (result.promoted.length !== 1) throw new Error(result.rejected[0]?.reason ?? 'replacement was not promoted');
    const current = result.promoted[0];
    const priorRecord = Object.freeze({ ...prior, acceptance_state: ACCEPTANCE_STATES.SUPERSEDED, superseded_by: current.id });
    const currentRecord = Object.freeze({ ...current, supersedes: prior.id, version: prior.version + 1 });
    const priorIndex = this.#history.findIndex(item => item.id === prior.id);
    const currentIndex = this.#history.findIndex(item => item.id === current.id);
    if (priorIndex < 0 || currentIndex < 0) throw new Error('claim history is inconsistent');
    this.#records.set(prior.id, priorRecord);
    this.#records.set(current.id, currentRecord);
    this.#history[priorIndex] = priorRecord;
    this.#history[currentIndex] = currentRecord;
    return { previous: priorRecord, current: currentRecord };
  }

  list() { return [...this.#records.values()].filter(record => record.acceptance_state !== ACCEPTANCE_STATES.SUPERSEDED); }
  show(claimId) { return this.#records.get(`kp:claim:${claimId}`) ?? null; }
  history() { return [...this.#history]; }

  projectOpenViking({ available = false } = {}) {
    if (!available) return { status: 'DEGRADED', canonical_mutation: false, entries: [], reason: 'OpenViking unavailable; exact canonical fallback remains available' };
    return { status: 'PASS', canonical_mutation: false, entries: this.list().map(record => ({ uri: `viking://resources/kad-claims/${record.claim_id}.json`, canonical_id: record.id, epistemic_class: record.epistemic_class, source_ref: record.source_ref, source_hash: record.source_hash })) };
  }
}

export function createClaimKnowledgePlane(options = {}) {
  return new ClaimKnowledgePlane(options);
}

export function projectClaims(records = []) {
  const safeRecords = records.map(clone).sort((left, right) => left.id.localeCompare(right.id));
  const lines = ['# KAD KnowledgePlane Claim Projection', '', '<!-- DERIVED: canonical claim records remain authoritative. -->', ''];
  for (const record of safeRecords) {
    lines.push(`## ${record.claim_id}`, '', `- Canonical ID: \`${record.canonical_id}\``, `- Epistemic class: \`${record.epistemic_class}\``, `- Authority: \`${record.authority_class}\``, `- Source: \`${record.source_ref}\``, `- Source hash: \`${record.source_hash}\``, `- Claim: ${record.claim_text}`, '');
  }
  return { projection_id: 'kad-claim-projection-v1', status: 'DERIVED', records: safeRecords, markdown: `${lines.join('\n')}\n` };
}

export function promoteAuditedClaims({ claims = [], sources = [] } = {}) {
  const plane = createClaimKnowledgePlane({ sources });
  const result = plane.promote(claims);
  return {
    ...result,
    counts: {
      considered: claims.length,
      source_facts: result.promoted.filter(record => record.epistemic_class === CLAIM_CLASSES.SOURCE_FACT).length,
      derived_synthesis: result.promoted.filter(record => record.epistemic_class === CLAIM_CLASSES.DERIVED_SYNTHESIS).length,
      project_inference: result.promoted.filter(record => record.epistemic_class === CLAIM_CLASSES.PROJECT_INFERENCE).length,
      unknown_retained: result.retained.length,
      rejected: result.rejected.length
    },
    plane
  };
}

export function parseKnowledgeCliArgs(args) {
  const [command, ...rest] = args;
  const json = rest.includes('--json');
  const positional = rest.filter(arg => arg !== '--json');
  return { command: command ?? 'help', positional, query: positional.join(' '), json };
}

export function runKnowledgeCli(args, { rootDir = resolve(dirname(new URL(import.meta.url).pathname), '../..'), outputDir = join(rootDir, 'wiki', 'generated', 'knowledge-plane'), stdout = console.log, stderr = console.error } = {}) {
  const cli = parseKnowledgeCliArgs(args);
  const plane = new DeterministicKnowledgePlane({ rootDir });
  if (cli.command === 'rebuild') {
    const result = plane.project({ output_dir: outputDir, write: true });
    stdout(JSON.stringify({ status: result.status, projection_id: result.projection_id, output_dir: relative(rootDir, outputDir), records: result.records.length }, null, 2));
    return 0;
  }
  if (cli.command === 'ask' && cli.query) {
    const result = plane.retrieve(cli.query, { trust_domain: 'engineering' });
    stdout(JSON.stringify({ query: cli.query, ...result }, null, 2));
    return result.status === 'REJECTED' ? 1 : 0;
  }
  if (cli.command === 'health') {
    stdout(JSON.stringify(plane.health(), null, 2));
    return 0;
  }
  stderr('usage: kad-knowledge rebuild|ask <question>|health');
  return 2;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  process.exitCode = runKnowledgeCli(process.argv.slice(2));
}
