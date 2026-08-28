import assert from 'node:assert/strict';
import test from 'node:test';
import { chmod, mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { inspectPreflight, canonicalReceipt } from '../omp-orchestration-preflight.mjs';

async function fixture({ role = 'qwen', autolearn = false, spend = 'safe', omp = true } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'kad-omp-preflight-'));
  await mkdir(join(root, '.omp', 'agents'), { recursive: true });
  await mkdir(join(root, '.agents', 'skills', 'kad-evidence-gate'), { recursive: true });
  await mkdir(join(root, 'tools', 'kad', 'test'), { recursive: true });
  await writeFile(join(root, 'PRIME_DIRECTIVE.md'), '# PRIME DIRECTIVE\n');
  await writeFile(join(root, '.omp', 'AGENTS.md'), 'This is a pointer to PRIME_DIRECTIVE.md.\n');
  await writeFile(join(root, '.omp', 'RULES.md'), 'KAD authority outranks OMP.\n');
  await writeFile(join(root, '.agents', 'skills', 'kad-evidence-gate', 'SKILL.md'), 'evidence gate\n');
  await writeFile(join(root, 'tools', 'kad', 'local-router.mjs'), 'requirement.trust_domain === resource.trust_domain\n');
  await writeFile(join(root, 'tools', 'kad', 'test', 'local-router.test.mjs'), "'WORLD resources cannot satisfy retrieval or engineering requirements'\n");
  if (omp) {
    await mkdir(join(root, '.tools', 'oh-my-pi'), { recursive: true });
    await mkdir(join(root, 'bin'), { recursive: true });
    const binary = join(root, '.tools', 'oh-my-pi', 'v18.0.9');
    const wrapper = join(root, 'bin', 'omp-kad');
    await writeFile(binary, 'binary');
    await writeFile(wrapper, '#!/bin/sh\n');
    await chmod(binary, 0o755);
    await chmod(wrapper, 0o755);
    await writeFile(join(root, '.omp', 'install-manifest.json'), JSON.stringify({ release: '18.0.9', omp_version_output: 'omp v18.0.9' }));
  }
  const roleYaml = role === 'qwen' ? '  local_retrieval: "kad-local-qwen/qwen-local:low"\n' : role === 'world' ? '  world: "kad-local-world/kad-local-s13:low"\n' : '';
  const enabled = role === 'qwen' ? '  - "kad-local-qwen/qwen-local"\n  - "kad-local-world/*"\n' : '  - "kad-local-world/*"\n';
  const spendYaml = spend === 'unsafe' ? '  - "*"\n' : enabled;
  await writeFile(join(root, '.omp', 'config.yml'), `modelRoles:\n${roleYaml}enabledModels:\n${spendYaml}advisor:\n  enabled: false\nmemory:\n  backend: "off"\nautolearn:\n  enabled: ${autolearn}\nskills:\n  enableAgentsProject: true\n`);
  await writeFile(join(root, '.omp', 'models.yml'), `providers:\n  kad-local-world:\n    baseUrl: http://127.0.0.1:5001/v1\n    auth: none\n    models:\n      - id: kad-local-s13\n        contextWindow: 4096\n  kad-local-qwen:\n    baseUrl: http://127.0.0.1:5001/v1\n    auth: none\n    models:\n      - id: qwen-local\n        contextWindow: 4096\n`);
  return root;
}

const observed = { ompVersion: '18.0.9', piVersion: '0.84.3', localInference: { ownership: 'INACTIVE', available: false } };

test('T1 valid OMP/KAD fixture is READY', async () => {
  const root = await fixture();
  try {
    const receipt = inspectPreflight({ root, observed: { ...observed, localInference: { ownership: 'OWNED', available: true, provider: 'kad-local-qwen', model: 'qwen-local' } } });
    assert.equal(receipt.status, 'READY');
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('T2 missing local retrieval role is DEGRADED', async () => {
  const root = await fixture({ role: 'missing' });
  try { assert.equal(inspectPreflight({ root, observed }).status, 'DEGRADED'); }
  finally { await rm(root, { recursive: true, force: true }); }
});

test('T3 WORLD role remains ineligible for engineering', async () => {
  const root = await fixture({ role: 'world' });
  try {
    const receipt = inspectPreflight({ root, observed });
    assert.equal(receipt.authority.world_engineering_eligible, false);
    assert.equal(receipt.status, 'DEGRADED');
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('T4 enabled autolearn fails the safety gate', async () => {
  const root = await fixture({ autolearn: true });
  try { assert.equal(inspectPreflight({ root, observed }).status, 'BLOCKED'); }
  finally { await rm(root, { recursive: true, force: true }); }
});

test('T5 unknown or unapproved PAYG surface blocks spend safety', async () => {
  const root = await fixture({ spend: 'unsafe' });
  try { assert.equal(inspectPreflight({ root, observed }).status, 'BLOCKED'); }
  finally { await rm(root, { recursive: true, force: true }); }
});

test('T6 missing OMP binary and manifest is clearly blocked', async () => {
  const root = await fixture({ omp: false });
  try { assert.equal(inspectPreflight({ root, observed }).status, 'BLOCKED'); }
  finally { await rm(root, { recursive: true, force: true }); }
});

test('T7 canonical receipt replays identically', async () => {
  const root = await fixture();
  try {
    const a = canonicalReceipt(inspectPreflight({ root, observed }));
    const b = canonicalReceipt(inspectPreflight({ root, observed }));
    assert.deepEqual(a, b);
    assert.equal(JSON.stringify(a), JSON.stringify(b));
  } finally { await rm(root, { recursive: true, force: true }); }
});
