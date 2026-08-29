import assert from 'node:assert/strict';
import test from 'node:test';
import { applyStaleness, observeRuntime, runtimeTransition, SELECTED_RUNTIME } from '../runtime-status.mjs';

test('healthy expected runtime becomes AVAILABLE with observed identity', async () => {
  const result = await observeRuntime({
    runtime: SELECTED_RUNTIME,
    fetchImpl: async () => new Response(JSON.stringify({
      object: 'list',
      data: [{ id: 'koboldcpp/L3-8B-Stheno-v3.2-Q4_K_M', status: { value: 'loaded' } }]
    }), { status: 200, headers: { 'content-type': 'application/json' } }),
    now: () => '2026-08-29T21:00:00.000Z'
  });

  assert.equal(result.schema, 'kad-runtime-status-v1');
  assert.equal(result.runtime_id, 'stheno-v3.2');
  assert.equal(result.state, 'AVAILABLE');
  assert.equal(result.identity, 'koboldcpp/L3-8B-Stheno-v3.2-Q4_K_M');
  assert.equal(result.capability, 'world');
  assert.equal(result.trust_domain, 'world');
  assert.equal(result.source, 'runtime-probe');
});
test('connection failure becomes UNAVAILABLE without healthy fallback', async () => {
  const result = await observeRuntime({
    runtime: SELECTED_RUNTIME,
    fetchImpl: async () => { throw new TypeError('connection refused'); },
    now: () => '2026-08-29T21:00:00.000Z'
  });

  assert.equal(result.state, 'UNAVAILABLE');
  assert.equal(result.identity, null);
  assert.match(result.reason, /unreachable/);
});

test('probe timeout becomes bounded UNAVAILABLE', async () => {
  const result = await observeRuntime({
    runtime: SELECTED_RUNTIME,
    timeoutMs: 5,
    fetchImpl: async () => new Promise(() => {}),
    now: () => '2026-08-29T21:00:00.000Z'
  });

  assert.equal(result.state, 'UNAVAILABLE');
  assert.match(result.reason, /timed out after 5ms/);
});

test('malformed response remains UNKNOWN', async () => {
  const result = await observeRuntime({
    runtime: SELECTED_RUNTIME,
    fetchImpl: async () => new Response('{not-json', { status: 200 }),
    now: () => '2026-08-29T21:00:00.000Z'
  });

  assert.equal(result.state, 'UNKNOWN');
  assert.match(result.reason, /not valid JSON/);
});

test('identity mismatch becomes DEGRADED and preserves observed identity', async () => {
  const result = await observeRuntime({
    runtime: SELECTED_RUNTIME,
    fetchImpl: async () => new Response(JSON.stringify({ object: 'list', data: [{ id: 'koboldcpp/other-model', status: { value: 'loaded' } }] }), { status: 200 }),
    now: () => '2026-08-29T21:00:00.000Z'
  });

  assert.equal(result.state, 'DEGRADED');
  assert.equal(result.identity, 'koboldcpp/other-model');
  assert.match(result.reason, /identity mismatch/);
});

test('old observation becomes STALE instead of remaining green', () => {
  const observation = { schema: 'kad-runtime-status-v1', observed_at: '2026-08-29T20:00:00.000Z', state: 'AVAILABLE' };
  const result = applyStaleness(observation, { now: () => Date.parse('2026-08-29T20:01:00.001Z'), maxAgeMs: 60000 });

  assert.equal(result.state, 'STALE');
  assert.match(result.reason, /stale threshold/);
});
test('old unavailable observation remains unavailable', () => {
  const observation = { schema: 'kad-runtime-status-v1', observed_at: '2026-08-29T20:00:00.000Z', state: 'UNAVAILABLE', reason: 'runtime endpoint unreachable' };
  const result = applyStaleness(observation, { now: () => Date.parse('2026-08-29T20:01:00.001Z'), maxAgeMs: 60000 });

  assert.equal(result.state, 'UNAVAILABLE');
  assert.equal(result.reason, 'runtime endpoint unreachable');
});
test('meaningful state transitions are classified without automatic reaction', () => {
  assert.equal(runtimeTransition({ state: 'AVAILABLE' }, { state: 'UNAVAILABLE' }), 'AVAILABLE_TO_UNAVAILABLE');
  assert.equal(runtimeTransition({ state: 'AVAILABLE' }, { state: 'STALE' }), 'FRESH_TO_STALE');
  assert.equal(runtimeTransition({ state: 'DEGRADED' }, { state: 'UNKNOWN' }), null);
});
