import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ACCEPTANCE_STATES,
  DEFAULT_SOURCE_ALLOWLIST,
  EPISTEMIC_CLASSES,
  DeterministicKnowledgePlane,
  hashSource,
  projectionImpact,
  validateAcceptanceTransition
} from '../knowledge-plane.mjs';
import { createNeedleAdapter, runOptionalAdapterProbe } from '../knowledge-plane-adapters.mjs';

const ROOT_DIR = new URL('../../..', import.meta.url).pathname;

function createPlane(options = {}) {
  return new DeterministicKnowledgePlane({ rootDir: ROOT_DIR, ...options });
}

test('KnowledgePlane exposes backend-independent health, ingest, read, retrieve, and project behavior', async () => {
  const plane = createPlane();
  assert.equal(plane.health().backend, 'deterministic');
  const records = plane.ingest();
  assert.equal(records.length, DEFAULT_SOURCE_ALLOWLIST.length);
  assert.ok(records.every(record => record.source_ref && record.source_hash));
  const record = plane.read({ source_ref: DEFAULT_SOURCE_ALLOWLIST[0].path, trust_domain: 'engineering' });
  assert.equal(record.acceptance_state, ACCEPTANCE_STATES.ACCEPTED);
  assert.equal(record.epistemic_class, EPISTEMIC_CLASSES.DOCUMENT_DERIVED);
  const results = plane.retrieve('What owns authority in KAD-PI?', { trust_domain: 'engineering' });
  assert.ok(results.results.length > 0);
  assert.equal(results.results[0].retrieval_mode, 'exact');
  const projection = plane.project();
  assert.equal(projection.status, 'PASS');
  assert.ok(projection.markdown.includes('DERIVED'));
  assert.equal(projection.records.length, records.length);
});

test('source hash is stable and projection is deterministic and source-preserving', async () => {
  const plane = createPlane();
  const before = await Promise.all(DEFAULT_SOURCE_ALLOWLIST.map(async source => [source.path, hashSource(join(ROOT_DIR, source.path))]));
  const first = plane.project();
  const second = plane.project();
  assert.deepEqual(second, first);
  const after = await Promise.all(DEFAULT_SOURCE_ALLOWLIST.map(async source => [source.path, hashSource(join(ROOT_DIR, source.path))]));
  assert.deepEqual(after, before);
});

test('human and machine projections preserve identical record identity and provenance', () => {
  const projection = createPlane().project();
  const parsed = JSON.parse(projection.structured);
  assert.deepEqual(parsed.records.map(record => ({ id: record.id, source_ref: record.source_ref, source_hash: record.source_hash, epistemic_class: record.epistemic_class, acceptance_state: record.acceptance_state })), projection.records.map(record => ({ id: record.id, source_ref: record.source_ref, source_hash: record.source_hash, epistemic_class: record.epistemic_class, acceptance_state: record.acceptance_state })));
  for (const record of projection.records) assert.match(projection.markdown, new RegExp(record.id));
});

test('unknown or unauthorized sources fail closed without a second authorization engine', () => {
  const plane = createPlane();
  assert.throws(() => plane.read({ source_ref: 'secrets.txt', trust_domain: 'engineering' }), /unknown source/i);
  assert.throws(() => plane.read({ source_ref: DEFAULT_SOURCE_ALLOWLIST[0].path, trust_domain: 'world' }), /trust domain/i);
  const result = plane.retrieve('authority', { trust_domain: 'world' });
  assert.equal(result.status, 'REJECTED');
});

test('semantic unavailability preserves exact retrieval but reports DEGRADED', () => {
  const result = createPlane().retrieve('What owns authority in KAD-PI?', { trust_domain: 'engineering', semantic_available: false });
  assert.equal(result.status, 'DEGRADED');
  assert.equal(result.retrieval_mode, 'exact');
  assert.ok(result.results[0].source_ref);
  assert.ok(result.results[0].source_hash);
});

test('derived records cannot self-promote to accepted knowledge', () => {
  const record = createPlane().ingest()[0];
  assert.equal(validateAcceptanceTransition(record, { actor: 'OpenViking', target_state: 'ACCEPTED' }).status, 'REJECTED');
  assert.equal(validateAcceptanceTransition({ ...record, acceptance_state: 'PROPOSED', epistemic_class: 'INFERRED' }, { actor: 'KAD_VALIDATOR', target_state: 'ACCEPTED' }).status, 'ACCEPTED');
});

test('irrelevant source changes do not trigger projection rebuild', () => {
  assert.deepEqual(projectionImpact({ changed_paths: ['README.md'] }), { rebuild: false, affected_paths: [] });
  assert.deepEqual(projectionImpact({ changed_paths: [DEFAULT_SOURCE_ALLOWLIST[0].path] }), { rebuild: true, affected_paths: [DEFAULT_SOURCE_ALLOWLIST[0].path] });
});

test('project writes an equivalent bounded wiki representation when requested', async () => {
  const outputDir = await mkdtemp(join(tmpdir(), 'kad-knowledge-plane-'));
  try {
    const result = createPlane().project({ output_dir: outputDir, write: true });
    assert.equal(result.status, 'PASS');
    assert.equal((await readFile(join(outputDir, 'records.json'), 'utf8')), result.structured + '\n');
    assert.equal((await readFile(join(outputDir, 'index.md'), 'utf8')), result.markdown);
  } finally {
    await rm(outputDir, { recursive: true, force: true });
  }
});
test('optional adapters remain non-authoritative and preserve proposed inference state', async () => {
  const adapter = createNeedleAdapter({ infer: async input => ({ label: 'bounded', input }) });
  const result = await runOptionalAdapterProbe(adapter, { input: 'classify this', schema: { type: 'object' } });
  assert.equal(result.status, 'PASS');
  assert.equal(result.authority, false);
  assert.equal(result.inference.acceptance_state, 'PROPOSED');
  await assert.rejects(() => runOptionalAdapterProbe({ ...adapter, authority: true }, { input: 'blocked', schema: {} }), /non-authoritative/);
});

assert.deepEqual(EPISTEMIC_CLASSES, Object.freeze({
  AUTHOR_DECLARED: 'AUTHOR_DECLARED',
  DOCUMENT_DERIVED: 'DOCUMENT_DERIVED',
  OBSERVED: 'OBSERVED',
  INFERRED: 'INFERRED',
  HYPOTHESIS: 'HYPOTHESIS',
  UNKNOWN: 'UNKNOWN'
}));
