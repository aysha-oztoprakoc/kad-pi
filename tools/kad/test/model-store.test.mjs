import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  loadRegistry,
  metadata,
  resolveModel,
  resolveModelHome,
  verifyModel,
} from '../model-store.mjs';
import { CapabilityRegistry } from '../local-router.mjs';

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'kad-model-store-'));
  await mkdir(join(root, '.models', 'gguf', 'world'), { recursive: true });
  const bytes = 'canonical model bytes';
  await writeFile(join(root, '.models', 'gguf', 'world', 'sample.gguf'), bytes);
  const registry = {
    schema_version: 'kad-local-model-registry-1',
    models: [{
      id: 'sample-world',
      display_name: 'Sample world model',
      relative_path: 'gguf/world/sample.gguf',
      sha256: 'c514b3e8c4a40036befeb60fb825575d740ed2ce6ce64e57dc1100d31b2e5d78',
      qualification_state: 'FILE_ONLY',
      capability_candidates: ['world'],
    }],
  };
  await mkdir(join(root, 'config'), { recursive: true });
  await writeFile(join(root, 'config', 'local-models.registry.json'), JSON.stringify(registry));
  return { root, modelPath: join(root, '.models', 'gguf', 'world', 'sample.gguf') };
}

test('resolves the shared model home from repository root or explicit environment', async () => {
  const { root } = await fixture();
  assert.equal(resolveModelHome({ root }), join(root, '.models'));
  assert.equal(resolveModelHome({ root, env: { KAD_MODEL_HOME: '/srv/models' } }), '/srv/models');
});

test('loads registry metadata and resolves a path-independent model ID', async () => {
  const { root, modelPath } = await fixture();
  const entry = metadata('sample-world', { root });
  assert.equal(entry.id, 'sample-world');
  assert.equal(resolveModel('sample-world', { root }).path, modelPath);
  assert.equal(resolveModel('sample-world', { root }).relative_path, 'gguf/world/sample.gguf');
  assert.equal(loadRegistry({ root }).models.length, 1);
});

test('reports missing models without granting availability', async () => {
  const { root } = await fixture();
  const result = verifyModel('does-not-exist', { root });
  assert.equal(result.state, 'MISSING');
  assert.equal(result.available, false);
  assert.equal(result.capability_state, 'UNAVAILABLE');
});

test('rejects a hash mismatch and never reports the model available', async () => {
  const { root, modelPath } = await fixture();
  await writeFile(modelPath, 'tampered model bytes');
  const result = verifyModel('sample-world', { root });
  assert.equal(result.state, 'HASH_MISMATCH');
  assert.equal(result.available, false);
  assert.equal(result.quarantine_required, true);
});

test('detects duplicate model bytes by hash', async () => {
  const { root } = await fixture();
  const registryPath = join(root, 'config', 'local-models.registry.json');
  const registry = JSON.parse(await readFile(registryPath, 'utf8'));
  registry.models.push({ ...registry.models[0], id: 'sample-copy', relative_path: 'gguf/world/sample-copy.gguf' });
  await writeFile(join(root, '.models', 'gguf', 'world', 'sample-copy.gguf'), 'canonical model bytes');
  await writeFile(registryPath, JSON.stringify(registry));
  const result = verifyModel('sample-world', { root });
  assert.deepEqual(result.duplicate_ids, ['sample-copy']);
});

test('rejects legacy paths and arbitrary symlinks at the resolver seam', async () => {
  const { root, modelPath } = await fixture();
  const registryPath = join(root, 'config', 'local-models.registry.json');
  const registry = JSON.parse(await readFile(registryPath, 'utf8'));
  registry.models[0].relative_path = '../legacy/model.gguf';
  await writeFile(registryPath, JSON.stringify(registry));
  assert.throws(() => resolveModel('sample-world', { root }), /relative_path/);
  registry.models[0].relative_path = 'gguf/world/linked.gguf';
  await symlink(modelPath, join(root, '.models', 'gguf', 'world', 'linked.gguf'));
  await writeFile(registryPath, JSON.stringify(registry));
  assert.throws(() => resolveModel('sample-world', { root }), /symlink/);
});

test('rejects symlinked parent directories before resolving model bytes', async () => {
  const { root } = await fixture();
  const outside = await mkdtemp(join(tmpdir(), 'kad-model-outside-'));
  await writeFile(join(outside, 'sample.gguf'), 'outside bytes');
  await symlink(outside, join(root, '.models', 'linked-dir'), 'dir');
  const registryPath = join(root, 'config', 'local-models.registry.json');
  const registry = JSON.parse(await readFile(registryPath, 'utf8'));
  registry.models[0].relative_path = 'linked-dir/sample.gguf';
  await writeFile(registryPath, JSON.stringify(registry));
  assert.throws(() => resolveModel('sample-world', { root }), /symlink/);
});

test('requires a recorded SHA256 before a model can be verified', async () => {
  const { root } = await fixture();
  const registryPath = join(root, 'config', 'local-models.registry.json');
  const registry = JSON.parse(await readFile(registryPath, 'utf8'));
  delete registry.models[0].sha256;
  await writeFile(registryPath, JSON.stringify(registry));
  assert.throws(() => loadRegistry({ root }), /sha256/);
});

test('runtime consumers read bytes through the canonical resolved path', async () => {
  const { root } = await fixture();
  const resolved = resolveModel('sample-world', { root });
  assert.equal(await readFile(resolved.path, 'utf8'), 'canonical model bytes');
});

test('capability access remains trust-domain constrained after model resolution', async () => {
  const { root } = await fixture();
  assert.equal(resolveModel('sample-world', { root }).capability_candidates.includes('world'), true);
  const registry = new CapabilityRegistry();
  registry.register({ id: 'world-model', local: true, capabilities: ['world'], trust_domain: 'world' });
  assert.deepEqual(registry.choose({ capabilities: ['retrieval'], trust_domain: 'retrieval' }), {
    status: 'DEGRADED',
    reason: 'no eligible capability',
    candidates: [],
  });
});
