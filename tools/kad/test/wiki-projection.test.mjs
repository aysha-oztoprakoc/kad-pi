import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  CURATED_SOURCE_ALLOWLIST,
  CuratedKnowledgeProjection,
  NAMESPACE_NAMES,
  projectionImpact,
  validateProjection
} from '../wiki-projection.mjs';

const ROOT_DIR = new URL('../../..', import.meta.url).pathname;

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

function createProjection(options = {}) {
  return new CuratedKnowledgeProjection({ rootDir: ROOT_DIR, ...options });
}

test('curated census expands the five-source plane with explicit governed metadata', () => {
  assert.ok(CURATED_SOURCE_ALLOWLIST.length > 5);
  assert.ok(CURATED_SOURCE_ALLOWLIST.every(source => source.path && source.source_class && source.namespace && source.reason));
  assert.ok(CURATED_SOURCE_ALLOWLIST.some(source => source.source_class === 'MODEL'));
  assert.ok(CURATED_SOURCE_ALLOWLIST.some(source => source.source_class === 'EVIDENCE'));
  assert.equal(new Set(CURATED_SOURCE_ALLOWLIST.map(source => source.path)).size, CURATED_SOURCE_ALLOWLIST.length);
});

test('projection emits only populated namespaces and preserves source provenance', () => {
  const result = createProjection().project();
  assert.equal(result.status, 'PASS');
  assert.ok(result.records.length > CURATED_SOURCE_ALLOWLIST.length / 2);
  assert.ok(result.namespaces.PROJECT.length > 0);
  assert.ok(result.namespaces.DECISIONS.length > 0);
  assert.ok(result.namespaces.MODELS.length > 0);
  assert.ok(result.namespaces.AGENTS.length > 0);
  assert.ok(result.namespaces.SKILLS.length > 0);
  assert.ok(Object.keys(result.namespaces).every(namespace => NAMESPACE_NAMES.includes(namespace)));
  for (const record of result.records) {
    assert.match(record.source_ref, /\S/);
    assert.match(record.source_hash, /^[a-f0-9]{64}$/);
    assert.equal(record.projection_id, result.projection_id);
    assert.ok(record.privacy_class);
  }
});

test('machine and human projections share the same governed record identities', async () => {
  const outputDir = await mkdtemp(join(tmpdir(), 'kad-wiki-projection-'));
  try {
    const result = createProjection().project({ output_dir: outputDir, write: true });
    const machine = JSON.parse(await readFile(join(outputDir, 'project-state.json'), 'utf8'));
    assert.deepEqual(machine.records.map(record => record.id), result.records.map(record => record.id));
    assert.ok((await readFile(join(outputDir, 'index.md'), 'utf8')).includes('Canonical KAD-PI Wiki'));
    assert.ok((await readFile(join(outputDir, 'project.json'), 'utf8')).includes('source_hash'));
    assert.ok((await readFile(join(outputDir, 'status.json'), 'utf8')).includes('status'));
  } finally {
    await rm(outputDir, { recursive: true, force: true });
  }
});

test('status and cited questions remain deterministic and unknown stays unknown', () => {
  const projection = createProjection();
  const status = projection.status();
  assert.ok(['PASS', 'PARTIAL', 'DEGRADED'].includes(status.status));
  assert.ok(status.components.some(component => component.component === 'KnowledgePlane'));
  const answer = projection.ask('Which components are currently degraded?');
  assert.notEqual(answer.status, 'REJECTED');
  assert.ok(answer.results.every(result => result.source_ref && result.source_hash));
  const unknown = projection.ask('What is the launch date for the public website?');
  assert.equal(unknown.status, 'UNKNOWN');
  assert.deepEqual(unknown.results, []);
  assert.equal(projection.ask('authority', { trust_domain: 'world' }).status, 'REJECTED');
  assert.throws(() => projection.read({ source_ref: 'PRIME_DIRECTIVE.md', trust_domain: 'world' }), /trust domain/i);
});

test('unchanged rebuilds are byte-identical and unrelated changes have no impact', async () => {
  const outputDir = await mkdtemp(join(tmpdir(), 'kad-wiki-idempotence-'));
  try {
    const projection = createProjection();
    projection.project({ output_dir: outputDir, write: true });
    const first = JSON.parse(await readFile(join(outputDir, 'project-state.json'), 'utf8'));
    const firstHash = hash(await readFile(join(outputDir, 'project-state.json')));
    projection.project({ output_dir: outputDir, write: true });
    const secondHash = hash(await readFile(join(outputDir, 'project-state.json')));
    assert.equal(secondHash, firstHash);
    assert.deepEqual(validateProjection({ rootDir: ROOT_DIR, outputDir }).status, 'CURRENT');
    assert.deepEqual(projectionImpact({ changed_paths: ['unrelated.txt'] }).rebuild, false);
    assert.deepEqual(projectionImpact({ changed_paths: ['docs/adr/0001-notification-oriented-causality.md'] }).affected_namespaces, ['DECISIONS']);
    assert.equal(first.source_count, CURATED_SOURCE_ALLOWLIST.filter(source => source.optional !== true || source.path === 'docs/adr/0008-unified-context-knowledge-plane.md' || source.path === 'wiki/KAD_Context_Knowledge_Plane_Roadmap_2026-08-29.md' || source.path === 'wiki/KAD_Implementation_Plan.md').length);
  } finally {
    await rm(outputDir, { recursive: true, force: true });
  }
});

test('changed canonical input is stale until rebuilt and missing optional input is quarantined', async () => {
  const rootDir = await mkdtemp(join(tmpdir(), 'kad-wiki-stale-'));
  const outputDir = join(rootDir, 'out');
  const sourcePath = 'fixture.md';
  try {
    await writeFile(join(rootDir, sourcePath), '# Fixture\n\nOriginal claim.\n');
    const allowlist = [{
      path: sourcePath,
      title: 'Fixture',
      kind: 'evidence',
      source_class: 'EVIDENCE',
      namespace: 'EVIDENCE',
      classification: 'OBSERVED',
      authority_class: 'CANONICAL_SOURCE',
      acceptance_state: 'ACCEPTED',
      trust_domain: 'engineering',
      reason: 'test fixture',
      optional: false
    }, {
      path: 'missing.md',
      title: 'Missing optional fixture',
      kind: 'evidence',
      source_class: 'EVIDENCE',
      namespace: 'EVIDENCE',
      classification: 'UNKNOWN',
      authority_class: 'CANONICAL_SOURCE',
      acceptance_state: 'UNKNOWN',
      trust_domain: 'engineering',
      reason: 'quarantine behavior fixture',
      optional: true
    }];
    const projection = new CuratedKnowledgeProjection({ rootDir, source_allowlist: allowlist });
    const built = projection.project({ output_dir: outputDir, write: true });
    assert.equal(built.status, 'PASS');
    assert.equal(built.quarantined_sources.length, 1);
    assert.equal(validateProjection({ rootDir, outputDir }).status, 'CURRENT');
    await writeFile(join(rootDir, sourcePath), '# Fixture\n\nChanged claim.\n');
    assert.equal(validateProjection({ rootDir, outputDir }).status, 'STALE');
    const rebuilt = projection.project({ output_dir: outputDir, write: true });
    assert.equal(rebuilt.status, 'PASS');
    assert.equal(validateProjection({ rootDir, outputDir }).status, 'CURRENT');
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});
