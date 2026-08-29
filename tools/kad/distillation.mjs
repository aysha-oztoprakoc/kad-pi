import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateEpisode } from './episode.mjs';

export const STATES = Object.freeze(['RAW', 'CANDIDATE', 'VERIFIED', 'GOLDEN', 'ACTIVE', 'REJECTED']);
export const SOURCE_CLASSES = Object.freeze(['BOOTSTRAP_POLICY_FIXTURE', 'REAL_ACCEPTED_TRAJECTORY', 'TEACHER_CORRECTION', 'NEGATIVE_FAILURE', 'SYNTHETIC_EXPERIMENT']);
export const FAILURE_CLASSES = Object.freeze(['UNSUPPORTED_CLAIM', 'SCOPE_VIOLATION', 'SCHEMA_FAILURE', 'TEST_FAILURE', 'NONDETERMINISTIC_STATE', 'MISSING_EVIDENCE', 'UNAUTHORIZED_MUTATION', 'INVALID_TOOL_SEQUENCE', 'STALE_CONTEXT', 'HALLUCINATED_STATE']);
const transitions = new Map([['RAW', new Set(['CANDIDATE', 'REJECTED'])], ['CANDIDATE', new Set(['VERIFIED', 'REJECTED'])], ['VERIFIED', new Set(['GOLDEN', 'REJECTED'])], ['GOLDEN', new Set(['ACTIVE'])], ['ACTIVE', new Set()], ['REJECTED', new Set()]]);

// Canonicalization changes representation only: strings and array order are preserved.
function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, normalize(value[key])]));
  return value;
}
export function canonicalize(value) { return JSON.stringify(normalize(value)); }
export function hashCanonical(value) { return createHash('sha256').update(canonicalize(value), 'utf8').digest('hex'); }
export function hashArtifact(path) { return createHash('sha256').update(readFileSync(path)).digest('hex'); }

export function createRecord(input = {}) {
  if (!input.id) throw new Error('record id is required');
  const canonicalInput = input.input?.canonical ?? input.input?.raw ?? null;
  return normalize({
    id: input.id, schema_version: 'kad-distill-1', state: input.state ?? 'RAW', source_class: input.source_class ?? 'SYNTHETIC_EXPERIMENT',
    task: { class: input.task?.class ?? 'UNKNOWN', objective: input.task?.objective ?? '', constraints: input.task?.constraints ?? [] },
    provenance: { source: input.provenance?.source ?? 'unknown', source_version: input.provenance?.source_version ?? null, executor: input.provenance?.executor ?? 'unknown', timestamp: input.provenance?.timestamp ?? null, source_artifact: input.provenance?.source_artifact ?? null, source_hash: input.provenance?.source_hash ?? null, source_episode_id: input.provenance?.source_episode_id ?? null, source_episode_hash: input.provenance?.source_episode_hash ?? null },
    input: { canonical: canonicalInput, hash: input.input?.hash ?? (canonicalInput == null ? null : hashCanonical(canonicalInput)) },
    trajectory: input.trajectory ?? [],
    behavior: { required: input.behavior?.required ?? [], forbidden: input.behavior?.forbidden ?? [], canonical_strategy: input.behavior?.canonical_strategy ?? 'structured' },
    output: { expected_type: input.output?.expected_type ?? 'object', canonical_example: input.output?.canonical_example ?? null },
    verification: { verifier_ids: input.verification?.verifier_ids ?? [], evidence: input.verification?.evidence ?? [], verdict: input.verification?.verdict ?? 'UNKNOWN' },
    distillation: { lesson: input.distillation?.lesson ?? '', policies: input.distillation?.policies ?? [], negative_examples: input.distillation?.negative_examples ?? [] },
    promotion: { state: input.promotion?.state ?? input.state ?? 'RAW', promoted_by: input.promotion?.promoted_by ?? null, promotion_evidence: input.promotion?.promotion_evidence ?? [] },
    replay: { enabled: input.replay?.enabled ?? false, adapter_id: input.replay?.adapter_id ?? null, fixture: input.replay?.fixture ?? null, comparison_mode: input.replay?.comparison_mode ?? 'BEHAVIOR' },
    ancestry: input.ancestry ?? { origin: 'DISTILLED', generation_depth: 0, parents: [] },
    teacher: input.teacher ?? { used: false, provider: null, model: null, version: null },
    evidence_refs: input.evidence_refs ?? [],
    training_eligibility: input.training_eligibility ?? { eligible: false, rights_status: 'UNKNOWN', quality_status: 'UNREVIEWED', reason: 'runtime-only until explicitly approved' }
  });
}

function provenanceErrors(record) {
  const p = record?.provenance;
  const errors = !p?.source || !p?.executor || !p?.timestamp || !p?.source_artifact || !p?.source_hash ? ['required provenance is missing'] : [];
  if (p?.source_artifact && existsSync(p.source_artifact) && p.source_hash !== hashArtifact(p.source_artifact)) errors.push('source artifact hash mismatch');
  if (p?.source_episode_id && !p.source_episode_hash) errors.push('source episode hash is missing');
  return errors;
}

export function validateRecord(record) {
  const errors = [];
  if (record?.schema_version !== 'kad-distill-1') errors.push('unsupported schema_version');
  if (!record?.id) errors.push('id is required');
  if (!STATES.includes(record?.state)) errors.push('invalid state');
  if (record?.promotion?.state !== record?.state) errors.push('promotion.state must match state');
  if (!SOURCE_CLASSES.includes(record?.source_class)) errors.push('invalid source_class');
  if (!record?.task?.class || !record?.task?.objective) errors.push('task class and objective are required');
  if (!record?.input?.canonical || !record?.input?.hash) errors.push('canonical input and hash are required');
  if (record?.input?.hash && hashCanonical(record.input.canonical) !== record.input.hash) errors.push('input hash does not match canonical input');
  if (!['EXACT_OUTPUT', 'SEMANTIC_STRUCTURE', 'BEHAVIOR', 'SIDE_EFFECT'].includes(record?.replay?.comparison_mode)) errors.push('invalid replay comparison_mode');
  if (record?.state === 'GOLDEN' || record?.state === 'ACTIVE') errors.push(...provenanceErrors(record));
  return { valid: errors.length === 0, errors };
}

function receiptPayload(receipt) { const { receipt_hash: ignored, ...payload } = receipt; return payload; }
function receiptIsValid(receipt, record, registry) {
  const implementation = registry.get(receipt?.verifier_id);
  return Boolean(implementation && receipt.verifier_version === implementation.version && receipt.implementation_hash === implementation.hash && receipt.input_hash === hashCanonical(record.input.canonical) && receipt.receipt_hash === hashCanonical(receiptPayload(receipt)) && typeof receipt.passed === 'boolean');
}

export class VerifierRegistry {
  constructor() { this.implementations = new Map(); }
  register(verifierId, implementation, version = '1') {
    if (!verifierId || typeof implementation !== 'function') throw new Error('verifier id and implementation are required');
    this.implementations.set(verifierId, { fn: implementation, version, hash: hashCanonical({ verifierId, version, implementation: implementation.toString() }) });
    return this;
  }
  get(id) { return this.implementations.get(id); }
  execute(verifierId, record) {
    const implementation = this.get(verifierId);
    if (!implementation) throw new Error(`unknown verifier: ${verifierId}`);
    const observation = implementation.fn(record);
    const receipt = { verifier_id: verifierId, verifier_version: implementation.version, implementation_hash: implementation.hash, input_hash: hashCanonical(record.input.canonical), observed: observation.observed ?? null, expected: observation.expected ?? null, exit_code: observation.exit_code ?? null, passed: Boolean(observation.passed) };
    return { ...receipt, receipt_hash: hashCanonical(receipt) };
  }
}

export const defaultVerifiers = new VerifierRegistry()
  .register('record-schema', candidate => ({ observed: 'schema-valid', expected: 'schema-valid', passed: validateRecord(candidate).valid }))
  .register('episode-accepted', candidate => ({ observed: candidate.outcome?.accepted, expected: true, passed: candidate.outcome?.accepted === true && candidate.validation?.result === 'PASS' }));

export function verifyCandidate(record, registry = defaultVerifiers) {
  const shape = validateRecord(record);
  if (!shape.valid) return { verified: false, errors: shape.errors, record };
  if (!record.verification.verifier_ids.length) return { verified: false, errors: ['at least one verifier is required'], record };
  let evidence;
  try { evidence = record.verification.verifier_ids.map(id => registry.execute(id, record)); } catch (error) { return { verified: false, errors: [error.message], record }; }
  const passed = evidence.every(receipt => receipt.passed && receiptIsValid(receipt, record, registry));
  const verified = passed && evidence.length > 0;
  return { verified, errors: verified ? [] : ['authorized verifier did not pass'], record: normalize({ ...record, verification: { ...record.verification, evidence, verdict: verified ? 'PASS' : 'FAIL' } }), evidence };
}

export function verifyRecord(record, registry = defaultVerifiers) {
  const errors = validateRecord(record).errors;
  if (!record?.verification?.evidence?.length) errors.push('verification evidence is required');
  if (!record?.verification?.verifier_ids?.length) errors.push('at least one verifier is required');
  const receipts = new Map((record?.verification?.evidence ?? []).map(receipt => [receipt.verifier_id, receipt]));
  for (const id of record?.verification?.verifier_ids ?? []) {
    const receipt = receipts.get(id);
    if (!receipt || !receiptIsValid(receipt, record, registry)) { errors.push(`invalid or forged receipt: ${id}`); continue; }
    try {
      const fresh = registry.execute(id, record);
      if (canonicalize(fresh) !== canonicalize(receipt)) errors.push(`receipt does not match fresh verifier execution: ${id}`);
    } catch (error) { errors.push(error.message); }
  }
  if (record?.verification?.verdict !== 'PASS') errors.push('verification verdict must be PASS');
  return { verified: errors.length === 0, errors, evidence: record?.verification?.evidence ?? [] };
}

export function verifyEpisodeLineage(record, episode) {
  const expected = hashCanonical(episode);
  return { valid: record?.provenance?.source_episode_id === episode?.episode_id && record?.provenance?.source_episode_hash === expected, expected, actual: record?.provenance?.source_episode_hash ?? null };
}

export function fromEpisode(episode, input = {}) {
  const check = validateEpisode(episode);
  if (!check.valid) throw new Error(`invalid source episode: ${check.errors.join('; ')}`);
  if (!episode.outcome.accepted || episode.validation.result !== 'PASS') throw new Error('episode is not an accepted validated trajectory');
  const episodeHash = hashCanonical(episode);
  return createRecord({ ...input, source_class: input.source_class ?? 'REAL_ACCEPTED_TRAJECTORY', provenance: { ...input.provenance, source: input.provenance?.source ?? 'KAD Episode', source_episode_id: episode.episode_id, source_episode_hash: episodeHash, source_artifact: input.provenance?.source_artifact ?? `episode:${episode.episode_id}`, source_hash: input.provenance?.source_hash ?? episodeHash }, trajectory: episode.trajectory, ancestry: episode.ancestry, teacher: episode.teacher, evidence_refs: episode.evidence_refs, training_eligibility: episode.training_eligibility });
}

export function transition(record, target, options = {}) {
  if (!transitions.get(record?.state)?.has(target)) throw new Error(`illegal transition ${record?.state} -> ${target}`);
  if (target === 'VERIFIED' || target === 'GOLDEN') {
    const check = verifyRecord(record, options.registry ?? defaultVerifiers);
    if (!check.verified) throw new Error(`deterministic verification required: ${check.errors.join('; ')}`);
  }
  if (target === 'GOLDEN') {
    const provenance = provenanceErrors(record);
    if (options.episode && !verifyEpisodeLineage(record, options.episode).valid) provenance.push('source episode hash mismatch');
    if (provenance.length) throw new Error(provenance.join('; '));
    if (!options.promoted_by || !options.promotion_evidence?.length) throw new Error('promotion authority and evidence are required');
  }
  const next = normalize({ ...record, state: target, promotion: { ...record.promotion, state: target, promoted_by: options.promoted_by ?? record.promotion?.promoted_by ?? null, promotion_evidence: options.promotion_evidence ?? record.promotion?.promotion_evidence ?? [] } });
  const valid = validateRecord(next);
  if (!valid.valid) throw new Error(valid.errors.join('; '));
  return next;
}

export function rejectRecord(record, failure) {
  if (!FAILURE_CLASSES.includes(failure?.failure_class)) throw new Error(`unknown failure class: ${failure?.failure_class}`);
  if (!transitions.get(record?.state)?.has('REJECTED')) throw new Error(`cannot reject from ${record?.state}`);
  return normalize({ ...record, state: 'REJECTED', promotion: { ...record.promotion, state: 'REJECTED' }, rejection: { candidate: failure.candidate ?? record.output.canonical_example, failure_class: failure.failure_class, failed_verifier: failure.failed_verifier ?? null, observed: failure.observed ?? null, expected: failure.expected ?? null, lesson: failure.lesson ?? '' } });
}

export class DistillationStore {
  constructor(root) { this.root = root; this.goldenDir = join(root, 'golden'); this.rejectedDir = join(root, 'rejected'); mkdirSync(this.goldenDir, { recursive: true }); mkdirSync(this.rejectedDir, { recursive: true }); }
  put(record) { const check = validateRecord(record); if (!check.valid) throw new Error(check.errors.join('; ')); const dir = record.state === 'GOLDEN' || record.state === 'ACTIVE' ? this.goldenDir : record.state === 'REJECTED' ? this.rejectedDir : this.root; mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, `${record.id}.json`), canonicalize(record) + '\n'); return record; }
  list(state = null) { const dirs = state === 'GOLDEN' || state === 'ACTIVE' ? [this.goldenDir] : state === 'REJECTED' ? [this.rejectedDir] : [this.goldenDir, this.rejectedDir]; return dirs.flatMap(dir => readdirSync(dir).filter(f => f.endsWith('.json')).sort().map(f => JSON.parse(readFileSync(join(dir, f), 'utf8')))).filter(r => !state || r.state === state); }
}

export function retrieveGolden(records, task, limit = 3) { return records.filter(r => (r.state === 'GOLDEN' || r.state === 'ACTIVE') && (!task.class || r.task.class === task.class)).sort((a, b) => a.task.class.localeCompare(b.task.class) || a.id.localeCompare(b.id)).slice(0, limit); }
export function buildSteeringContext(records, task, limit = 3) { return retrieveGolden(records, task, limit).map(r => ({ id: r.id, source_class: r.source_class, policy: r.distillation.policies, lesson: r.distillation.lesson, required: r.behavior.required, forbidden: r.behavior.forbidden, example: r.output.canonical_example, negative_examples: r.distillation.negative_examples })); }

const comparators = {
  EXACT_OUTPUT: (actual, expected) => canonicalize(actual) === canonicalize(expected),
  SEMANTIC_STRUCTURE: (actual, expected) => actual !== null && expected !== null && typeof actual === typeof expected && (Array.isArray(actual) ? actual.length === expected.length : typeof actual === 'object' && Object.keys(actual).sort().join() === Object.keys(expected).sort().join()),
  BEHAVIOR: (actual, expected) => canonicalize(actual) === canonicalize(expected),
  SIDE_EFFECT: (actual, expected) => canonicalize(actual) === canonicalize(expected)
};
export const replayAdapters = new Map();
export function registerReplayAdapter(id, executor) { if (!id || typeof executor !== 'function') throw new Error('replay adapter id and executor are required'); replayAdapters.set(id, executor); }
export function replayRecord(record, actual) { if (!record?.replay?.enabled || !record.replay.fixture) return { status: 'NOT_REPLAYED', reason: 'replay fixture is disabled or missing' }; if (actual === undefined) return { status: 'NOT_REPLAYED', reason: 'fresh observed replay result is required' }; const comparator = comparators[record.replay.comparison_mode]; return { status: comparator(actual, record.replay.fixture.expected) ? 'PASS' : 'FAIL', mode: record.replay.comparison_mode, id: record.id }; }
export async function replayWithAdapter(record) { if (!record?.replay?.adapter_id || !replayAdapters.has(record.replay.adapter_id)) return { status: 'NOT_REPLAYED', reason: 'registered replay adapter is required' }; return replayRecord(record, await replayAdapters.get(record.replay.adapter_id)(record.replay.fixture.input)); }

function trainingApproved(record) { return record.training_eligibility?.eligible === true && record.training_eligibility.rights_status === 'ACCEPTED' && record.training_eligibility.quality_status === 'ACCEPTED' && provenanceErrors(record).length === 0; }
export function exportDataset(records, intent = 'runtime-steering') {
  const eligible = records.filter(r => r.state === 'GOLDEN' || r.state === 'ACTIVE').sort((a, b) => a.id.localeCompare(b.id));
  const selected = intent === 'training' ? eligible.filter(trainingApproved) : eligible;
  const rows = [];
  for (const r of selected) {
    rows.push({ type: 'supervised', id: r.id, input: r.input.canonical, output: r.output.canonical_example, source_class: r.source_class, evidence: r.verification.evidence });
    if (intent !== 'training') for (const n of r.distillation.negative_examples) rows.push({ type: 'preference', id: `${r.id}:${n.id ?? hashCanonical(n.candidate).slice(0, 12)}`, input: r.input.canonical, accepted: r.output.canonical_example, rejected: n.candidate, failure_reason: n.failure_class ?? n.reason });
    for (const policy of r.distillation.policies) rows.push({ type: 'policy', id: `${r.id}:policy:${hashCanonical(policy).slice(0, 12)}`, input: r.input.canonical, policy, output: r.behavior.required });
  }
  return rows.sort((a, b) => a.id.localeCompare(b.id)).map(canonicalize).join('\n') + (rows.length ? '\n' : '');
}
