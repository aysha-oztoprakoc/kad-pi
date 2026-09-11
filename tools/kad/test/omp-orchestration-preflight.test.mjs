import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { inspectPreflight, canonicalReceipt } from '../omp-orchestration-preflight.mjs';
import { createOmpPreflightFixture, removeOmpPreflightFixture, EXPECTED_OMP } from './fixtures/omp-preflight-root.mjs';

const observed = { ompVersion: EXPECTED_OMP, piVersion: '0.84.3', localInference: { ownership: 'INACTIVE', available: false } };

test('T1 valid OMP/KAD fixture is READY', async () => {
  const root = await createOmpPreflightFixture();
  try {
    const receipt = inspectPreflight({ root, observed: { ...observed, localInference: { ownership: 'OWNED', available: true, provider: 'kad-local-qwen', model: 'qwen-local' } } });
    assert.equal(receipt.status, 'READY');
  } finally { await removeOmpPreflightFixture(root); }
});

test('T2 missing local retrieval role is DEGRADED', async () => {
  const root = await createOmpPreflightFixture({ role: 'missing' });
  try { assert.equal(inspectPreflight({ root, observed }).status, 'DEGRADED'); }
  finally { await removeOmpPreflightFixture(root); }
});

test('T3 WORLD role remains ineligible for engineering', async () => {
  const root = await createOmpPreflightFixture({ role: 'world' });
  try {
    const receipt = inspectPreflight({ root, observed });
    assert.equal(receipt.authority.world_engineering_eligible, false);
    assert.equal(receipt.status, 'DEGRADED');
  } finally { await removeOmpPreflightFixture(root); }
});

test('T4 enabled autolearn fails the safety gate', async () => {
  const root = await createOmpPreflightFixture({ autolearn: true });
  try { assert.equal(inspectPreflight({ root, observed }).status, 'BLOCKED'); }
  finally { await removeOmpPreflightFixture(root); }
});

test('T5 unknown or unapproved PAYG surface blocks spend safety', async () => {
  const root = await createOmpPreflightFixture({ spend: 'unsafe' });
  try { assert.equal(inspectPreflight({ root, observed }).status, 'BLOCKED'); }
  finally { await removeOmpPreflightFixture(root); }
});

test('T6 missing OMP binary and manifest is clearly blocked', async () => {
  const root = await createOmpPreflightFixture({ omp: false });
  try { assert.equal(inspectPreflight({ root, observed }).status, 'BLOCKED'); }
  finally { await removeOmpPreflightFixture(root); }
});

test('T7 canonical receipt replays identically', async () => {
  const root = await createOmpPreflightFixture();
  try {
    const a = canonicalReceipt(inspectPreflight({ root, observed }));
    const b = canonicalReceipt(inspectPreflight({ root, observed }));
    assert.deepEqual(a, b);
    assert.equal(JSON.stringify(a), JSON.stringify(b));
  } finally { await removeOmpPreflightFixture(root); }
});

/**
 * T8 is the one deliberately config-coupled test in this file: it reads the live
 * checkout and pins the *consequence* of the posture declared in `.omp/RULES.md` and
 * enforced by `.omp/config.yml` (memory.backend != off, autolearn enabled, model
 * surface outside loopback+auth:none). Every other test here is fixture-isolated.
 *
 * It fails when the posture is relaxed — which is the point. If that is a deliberate
 * decision, change the posture and this test in the same commit, and say so in
 * `.omp/RULES.md`.
 */
test('T8 live posture: the aggregate verdict names each declared blocking cause', () => {
  const repoRoot = fileURLToPath(new URL('../../..', import.meta.url));
  const receipt = inspectPreflight({
    root: repoRoot,
    observed: { ompVersion: EXPECTED_OMP, piVersion: '0.84.3', localInference: { resources: [] } }
  });
  assert.equal(receipt.status, 'BLOCKED', 'the declared posture must still block the preflight');
  for (const code of ['MEMORY_NOT_OFF', 'AUTOLEARN_ENABLED', 'UNAPPROVED_OR_PAYG_MODEL_SURFACE']) {
    assert.ok(receipt.failures.includes(code), `blocking cause must be reported: ${code}`);
  }
  assert.equal(receipt.spend.approved_surface, false);
});
