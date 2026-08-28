import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalReceipt, inspectPreflight } from '../omp-orchestration-preflight.mjs';

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

function receipt(resources) {
  return inspectPreflight({ root: process.cwd(), observed: {
    ompVersion: '18.0.9', piVersion: '0.84.3',
    localInference: { resources }
  } });
}

test('T1 WORLD and Qwen are independently represented', () => {
  const result = receipt([world, qwen]);
  assert.deepEqual(result.local_inference.resources.map(resource => [resource.provider, resource.endpoint]), [
    ['kad-local-world', 'http://127.0.0.1:5001/v1'],
    ['kad-local-qwen', 'http://127.0.0.1:5002/v1']
  ]);
  assert.equal(result.local_inference.resources[0].ownership, 'EXTERNAL');
  assert.equal(result.local_inference.resources[1].ownership, 'OWNED');
});

test('T2 inactive Qwen degrades retrieval without changing WORLD', () => {
  const result = receipt([world, { ...qwen, endpoint_available: false, capability_state: 'UNAVAILABLE', observed_identity: 'UNKNOWN' }]);
  assert.equal(result.local_inference.resources[0].capability_state, 'AVAILABLE');
  assert.equal(result.local_inference.resources[1].capability_state, 'UNAVAILABLE');
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
  assert.equal(before.local_inference.resources[0].observed_identity, after.local_inference.resources[0].observed_identity);
  assert.equal(after.local_inference.resources[1].capability_state, 'UNAVAILABLE');
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
