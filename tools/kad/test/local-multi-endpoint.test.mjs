import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { canonicalReceipt, inspectPreflight } from '../omp-orchestration-preflight.mjs';
import { createOmpPreflightFixture, removeOmpPreflightFixture, ompObservation } from './fixtures/omp-preflight-root.mjs';

/**
 * Endpoint facts these tests inject. The fixture root supplies everything else, so the
 * aggregate `status` reflects local-inference degradation only — not the operator's live
 * learning/spend posture (that coupling lives in T8 of omp-orchestration-preflight.test.mjs).
 */
const world = {
  provider: 'kad-local-world', endpoint: 'http://127.0.0.1:5001/v1', expected_model: 'kad-local-s13',
  observed_identity: 'koboldcpp/L3-8B-Stheno-v3.2-Q4_K_M', endpoint_available: true,
  ownership: 'EXTERNAL', capability_state: 'AVAILABLE'
};
const qwen = {
  provider: 'kad-local-qwen', endpoint: 'http://127.0.0.1:5002/v1', expected_model: 'qwen-local',
  observed_identity: 'koboldcpp/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Q4_K_M', endpoint_available: true,
  ownership: 'OWNED', capability_state: 'AVAILABLE'
};

/** Two local endpoints plus the TRANSPORT_ONLY gateway the census must not claim to own. */
const MODELS_YAML = `providers:
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
  omniroute:
    baseUrl: http://127.0.0.1:20128/v1
    auth: apiKey
    models:
      - id: auto/best-free
        contextWindow: 128000
`;

const EXTERNAL_PROVIDERS = {
  version: 1,
  providers: [
    {
      id: 'omniroute-gateway',
      authority: 'TRANSPORT_ONLY',
      omp_provider: 'omniroute'
    }
  ]
};

let root;

before(async () => {
  root = await createOmpPreflightFixture({ modelsYaml: MODELS_YAML, externalProviders: EXTERNAL_PROVIDERS });
});

after(async () => {
  await removeOmpPreflightFixture(root);
});

function receipt(resources) {
  return inspectPreflight({ root, observed: {
    ...ompObservation(root), piVersion: '0.84.3',
    localInference: { resources }
  } });
}

test('T1 WORLD and Qwen are independently represented', () => {
  const result = receipt([world, qwen]);
  const byProvider = new Map(result.local_inference.resources.map(resource => [resource.provider, resource]));

  // Both endpoints are represented, and neither is conflated with the other.
  // (The census also lists every other configured provider that declares a
  // baseUrl, so this asserts presence and identity rather than an exact array.)
  assert.ok(byProvider.has('kad-local-world'), 'WORLD must be represented');
  assert.ok(byProvider.has('kad-local-qwen'), 'Qwen must be represented');
  assert.equal(byProvider.get('kad-local-world').endpoint, 'http://127.0.0.1:5001/v1');
  assert.equal(byProvider.get('kad-local-qwen').endpoint, 'http://127.0.0.1:5002/v1');
  assert.notEqual(byProvider.get('kad-local-world').endpoint, byProvider.get('kad-local-qwen').endpoint);

  assert.equal(byProvider.get('kad-local-world').ownership, 'EXTERNAL');
  assert.equal(byProvider.get('kad-local-qwen').ownership, 'OWNED');
});

test('T1b TRANSPORT_ONLY gateway providers are not counted as local inference', () => {
  // `omniroute` is registered TRANSPORT_ONLY in the fixture registry. It answers on
  // loopback but KAD-PI owns no inference process behind it, so the census must not
  // claim ownership of it.
  const result = receipt([]);
  assert.equal(
    result.local_inference.resources.some(resource => resource.provider === 'omniroute'),
    false,
    'the transport-only gateway must not appear as a local-inference resource'
  );
});

test('T1c the repository model map still carries the gateway provider', () => {
  // Structural fact of the committed harness projection, independent of the fixture.
  const models = readFileSync(fileURLToPath(new URL('../../../.omp/models.yml', import.meta.url)), 'utf8');
  assert.match(models, /^ {2}omniroute:$/m, 'the gateway provider is configured');
});

test('T2 inactive Qwen degrades retrieval without changing WORLD', () => {
  const result = receipt([world, { ...qwen, endpoint_available: false, capability_state: 'UNAVAILABLE', observed_identity: 'UNKNOWN' }]);
  const byProvider = new Map(result.local_inference.resources.map(resource => [resource.provider, resource]));
  assert.equal(byProvider.get('kad-local-world').capability_state, 'AVAILABLE');
  assert.equal(byProvider.get('kad-local-qwen').capability_state, 'UNAVAILABLE');
  assert.equal(result.status, 'DEGRADED');
});

test('T3 Qwen endpoint serving Stheno is a capability mismatch', () => {
  const result = receipt([{ ...qwen, observed_identity: world.observed_identity, capability_state: 'CAPABILITY_MISMATCH' }]);
  assert.equal(result.local_inference.resources.find(resource => resource.provider === 'kad-local-qwen').capability_state, 'CAPABILITY_MISMATCH');
  assert.equal(result.status, 'DEGRADED');
});

test('T4 matching Qwen with UNKNOWN ownership is not STC-owned', () => {
  const result = receipt([{ ...qwen, ownership: 'UNKNOWN', capability_state: 'NOT_STC_OWNED' }]);
  const retrieval = result.local_inference.resources.find(resource => resource.provider === 'kad-local-qwen');
  assert.equal(retrieval.ownership, 'UNKNOWN');
  assert.notEqual(retrieval.capability_state, 'AVAILABLE');
  assert.equal(result.status, 'DEGRADED');
});

test('T5 tracked Qwen lifecycle can advertise OWNED availability', () => {
  const result = receipt([qwen]);
  const retrieval = result.local_inference.resources.find(resource => resource.provider === 'kad-local-qwen');
  assert.equal(retrieval.ownership, 'OWNED');
  assert.equal(retrieval.capability_state, 'AVAILABLE');
});

test('T6 Qwen disposal withdraws retrieval only', () => {
  const before = receipt([world, qwen]);
  const after = receipt([world, { ...qwen, endpoint_available: false, capability_state: 'UNAVAILABLE', ownership: 'INACTIVE', observed_identity: 'UNKNOWN' }]);
  const worldBefore = before.local_inference.resources.find(resource => resource.provider === 'kad-local-world');
  const worldAfter = after.local_inference.resources.find(resource => resource.provider === 'kad-local-world');
  const qwenAfter = after.local_inference.resources.find(resource => resource.provider === 'kad-local-qwen');
  assert.equal(worldAfter.observed_identity, worldBefore.observed_identity);
  assert.equal(qwenAfter.capability_state, 'UNAVAILABLE');
});

test('T7 provider-aware collection does not assume port 5001', () => {
  const result = receipt([{ ...qwen, endpoint: 'http://127.0.0.1:5017/v1' }]);
  assert.equal(result.local_inference.resources.find(resource => resource.provider === 'kad-local-qwen').endpoint, 'http://127.0.0.1:5017/v1');
});

test('T8 multi-endpoint canonical receipt replays identically', () => {
  const a = canonicalReceipt(receipt([world, qwen]));
  const b = canonicalReceipt(receipt([world, qwen]));
  assert.deepEqual(a, b);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});
