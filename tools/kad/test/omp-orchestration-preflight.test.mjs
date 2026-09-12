import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { inspectPreflight, canonicalReceipt } from '../omp-orchestration-preflight.mjs';
import { createOmpPreflightFixture, removeOmpPreflightFixture, EXPECTED_OMP, DEFAULT_MODELS_YAML } from './fixtures/omp-preflight-root.mjs';

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

test('T4 a posture that diverges from its declaration blocks', async () => {
  const root = await createOmpPreflightFixture({ autolearn: true, declaration: { 'autolearn.enabled': 'false' } });
  try {
    const receipt = inspectPreflight({ root, observed });
    assert.equal(receipt.status, 'BLOCKED');
    assert.ok(receipt.failures.includes('POSTURE_DECLARATION_MISMATCH'), 'the mismatch is the blocking cause');
    assert.equal(receipt.learning.autolearn_enabled, true, 'autolearn itself is reported, not fatal');
  } finally { await removeOmpPreflightFixture(root); }
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

test('T9 a registered transport-only provider stays out of the local-inference census', async () => {
  const modelsYaml = `providers:
  kad-local-world:
    baseUrl: http://127.0.0.1:5001/v1
    auth: none
    models:
      - id: kad-local-s13
        contextWindow: 4096
  kad-local-qwen:
    baseUrl: http://127.0.0.1:5002/v1
    auth: none
    models:
      - id: qwen-local
        contextWindow: 4096
  zai-free:
    baseUrl: https://api.z.ai/api/paas/v4
    auth: none
    models:
      - id: glm-flash
        contextWindow: 4096
`;
  const root = await createOmpPreflightFixture({
    modelsYaml,
    externalProviders: {
      providers: [
        { id: 'zai-free-cloud', class: 'WORKLOAD_PROVIDER', status: 'ACTIVE', authority: 'TRANSPORT_ONLY', omp_provider: 'zai-free' }
      ]
    }
  });
  try {
    const receipt = inspectPreflight({
      root,
      observed: {
        ompVersion: EXPECTED_OMP,
        piVersion: '0.84.3',
        localInference: {
          resources: [
            { provider: 'kad-local-qwen', model: 'qwen-local', endpoint: 'http://127.0.0.1:5002/v1', endpoint_available: true, observed_identity: 'qwen-local', ownership: 'OWNED', capability_state: 'AVAILABLE' }
          ]
        }
      }
    });
    assert.deepEqual(receipt.local_inference.resources.map((r) => r.provider), ['kad-local-world', 'kad-local-qwen'], 'only loopback compute the harness can own is census material');
    assert.deepEqual(receipt.local_inference.failures, [], 'a declared transport never reads as an unowned local process');
    assert.equal(receipt.status, 'READY');
  } finally { await removeOmpPreflightFixture(root); }
});

test('T10 spend: declared fixed-cost lanes pass while metered and undeclared lanes block', async () => {
  const registry = {
    providers: [
      { id: 'vendor-sub', class: 'WORKLOAD_PROVIDER', status: 'ACTIVE', authority: 'TRANSPORT_ONLY', cost_class: 'FIXED_SUBSCRIPTION', omp_provider: 'vendor-sub' },
      { id: 'vendor-metered', class: 'WORKLOAD_PROVIDER', status: 'ACTIVE', authority: 'TRANSPORT_ONLY', cost_class: 'METERED', omp_provider: 'vendor-metered' }
    ]
  };
  const modelsYaml = `${DEFAULT_MODELS_YAML}  vendor-sub:
    auth: subscription
    models:
      - id: big-model
        contextWindow: 200000
  vendor-metered:
    auth: api-key
    models:
      - id: metered-model
        contextWindow: 200000
  vendor-unlisted:
    auth: api-key
    models:
      - id: mystery
        contextWindow: 200000
`;
  const spendFor = async (enabledModels) => {
    const root = await createOmpPreflightFixture({ modelsYaml, externalProviders: registry, enabledModels });
    try { return inspectPreflight({ root, observed }).spend; }
    finally { await removeOmpPreflightFixture(root); }
  };

  const approved = await spendFor(['kad-local-qwen/qwen-local', 'vendor-sub/*']);
  assert.equal(approved.approved_surface, true);
  assert.deepEqual(approved.lanes.map((lane) => [lane.provider, lane.cost_class]), [['kad-local-qwen', 'LOCAL'], ['vendor-sub', 'FIXED_SUBSCRIPTION']]);

  const metered = await spendFor(['kad-local-qwen/qwen-local', 'vendor-metered/*']);
  assert.equal(metered.approved_surface, false);
  assert.equal(metered.lanes.find((lane) => lane.provider === 'vendor-metered').cost_class, 'METERED');

  const undeclared = await spendFor(['kad-local-qwen/qwen-local', 'vendor-unlisted/*']);
  assert.equal(undeclared.approved_surface, false);
  assert.equal(undeclared.lanes.find((lane) => lane.provider === 'vendor-unlisted').cost_class, 'UNDECLARED');
});

test('T11 advisory memory and autolearn pass once declared and enforced', async () => {
  const root = await createOmpPreflightFixture({ memory: 'mnemopi', autolearn: true });
  try {
    const receipt = inspectPreflight({ root, observed });
    assert.deepEqual(receipt.learning.failures, [], 'an enabled advisory store is not a gate failure');
    assert.deepEqual(receipt.learning.advisory_systems, ['memory:mnemopi', 'autolearn']);
    assert.deepEqual(receipt.learning.posture.problems, []);
    assert.notEqual(receipt.status, 'BLOCKED');
  } finally { await removeOmpPreflightFixture(root); }
});

/**
 * T8 is the one deliberately config-coupled test in this file: it reads the live
 * checkout and pins the *consequence* of the posture declared in `.omp/RULES.md`, enforced by
 * `.omp/config.yml`, and of the cost class declared for every lane in
 * `config/external-providers.json` (ADR 0016 / ADR 0017).
 *
 * It fails when the posture moves without the declaration moving with it, when an undeclared or
 * metered provider is enabled, or when a managed store is pointed at canon — which is the point.
 * Changing the posture means changing the declaration in the same commit.
 */
test('T8 live posture: declared, enforced, and every enabled lane carries an approved cost class', () => {
  const repoRoot = fileURLToPath(new URL('../../..', import.meta.url));
  const receipt = inspectPreflight({
    root: repoRoot,
    observed: { ompVersion: EXPECTED_OMP, piVersion: '0.84.3', localInference: { resources: [] } }
  });
  assert.deepEqual(receipt.learning.failures, [], 'the live posture must be declared and enforced');
  assert.equal(receipt.spend.approved_surface, true, 'no enabled lane may be undeclared or metered');
  for (const lane of receipt.spend.lanes) {
    assert.ok(['LOCAL', 'FIXED_SUBSCRIPTION', 'FREE_TIER'].includes(lane.cost_class), `${lane.pattern} carries ${lane.cost_class}`);
  }
  assert.notEqual(receipt.status, 'BLOCKED', `the live preflight must not block: ${receipt.failures.join(', ')}`);
});
