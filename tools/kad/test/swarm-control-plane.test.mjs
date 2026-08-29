import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ACCEPTANCE_STATES,
  RESOURCE_STATES,
  SwarmCoordinator,
  aggregateSwarmResults,
  createResourceRegistry,
  createTaskContract,
  decomposeTaskRequests,
} from '../swarm-control-plane.mjs';
import { createQwenRetrievalWorker, createSthenoWorldWorker } from '../swarm-workers.mjs';

const tempState = () => join(mkdtempSync(join(tmpdir(), 'kad-swarm-')), 'swarm-state.json');

function resources() {
  return createResourceRegistry([
    { id: 'kad-local-qwen-amdy', provider: 'kad-local-qwen', model_identity: 'Qwen3.5-9B', capabilities: ['repository-fact-finding', 'structured-extraction'], trust_domain: 'retrieval', context_window: 2048, max_output_tokens: 512 },
    { id: 'kad-local-world-amdy', provider: 'kad-local-world', model_identity: 'L3-8B-Stheno', capabilities: ['world-simulation'], trust_domain: 'world', context_window: 4096, max_output_tokens: 512, ownership: 'EXTERNAL' },
  ]);
}

function task(capability, trust_domain, task_id = `task-${capability}`) {
  return createTaskContract({ task_id, requested_capability: capability, trust_domain, input_reference: `fixture:${task_id}`, expected_output_schema: { type: 'object', required: ['value'] }, max_runtime: 1000, resource_policy: { mode: 'time-multiplexed', compiled_prompt_tokens: 128, required_output_reserve: 128 }, evidence_requirements: ['worker-receipt'] });
}

test('typed task contract rejects generic or incomplete work', () => {
  assert.throws(() => createTaskContract({ task_id: 'x', requested_capability: 'do-anything' }), /trust_domain/);
  const generic = createTaskContract({ task_id: 'x', requested_capability: 'do-anything', trust_domain: 'engineering', input_reference: 'fixture:x', expected_output_schema: { type: 'object' }, max_runtime: 1000, resource_policy: {}, evidence_requirements: [] });
  assert.equal(generic.requested_capability, 'do-anything');
  assert.equal(decomposeTaskRequests([generic])[0].task_id, 'x');
});

test('router proves resource fit before invoking a worker', () => {
  const registry = resources();
  const oversized = createTaskContract({
    ...task('repository-fact-finding', 'retrieval', 'oversized'),
    resource_policy: { compiled_prompt_tokens: 2000, required_output_reserve: 1000 },
  });
  assert.deepEqual(registry.route(oversized), { status: 'DEFER', reason: 'RESOURCE_CONTRACT_MISMATCH', candidates: ['kad-local-qwen-amdy'] });
});

test('router enforces exact capability and trust domains', () => {
  const registry = resources();
  assert.equal(registry.route(task('repository-fact-finding', 'retrieval')).resource_id, 'kad-local-qwen-amdy');
  assert.equal(registry.route(task('world-simulation', 'retrieval')).status, 'REJECT');
  assert.equal(registry.route(task('unknown', 'world')).status, 'REJECT');
});

test('resource registry blocks trust-domain capability escalation', () => {
 assert.throws(() => createResourceRegistry([{ id: 'bad-world', provider: 'x', model_identity: 'x', capabilities: ['repository-fact-finding'], trust_domain: 'world', context_window: 100, max_output_tokens: 10 }]), /world resource cannot register non-world capability/);
 assert.throws(() => createResourceRegistry([{ id: 'bad-retrieval', provider: 'x', model_identity: 'x', capabilities: ['world-simulation'], trust_domain: 'retrieval', context_window: 100, max_output_tokens: 10 }]), /retrieval resource cannot register world capability/);
});


test('aggregator deterministically requires qualified trust-domain coverage', () => {
  const aggregated = aggregateSwarmResults([
    { acceptance: ACCEPTANCE_STATES.ACCEPTED, result: { trust_domain: 'retrieval' } },
    { acceptance: ACCEPTANCE_STATES.ACCEPTED, result: { trust_domain: 'world' } },
    { acceptance: ACCEPTANCE_STATES.REJECTED, result: { trust_domain: 'engineering' } },
  ], { required_trust_domains: ['retrieval', 'world'] });
  assert.equal(aggregated.complete, true);
  assert.equal(aggregated.accepted_results, 2);
  assert.equal(aggregated.trust_domains_separate, true);
  assert.equal(aggregated.model_vote_used, false);
});
test('Qwen worker activates, verifies identity, validates, and releases', async () => {
  const calls = [];
  const worker = createQwenRetrievalWorker({
    resource_id: 'kad-local-qwen-amdy',
    activate: async () => { calls.push('activate'); return { model_identity: 'Qwen3.5-9B' }; },
    invoke: async () => ({ value: 'fact', evidence: ['fixture'] }),
    release: async () => { calls.push('release'); },
    expected_model_identity: 'Qwen3.5-9B',
  });
  const result = await worker.execute(task('repository-fact-finding', 'retrieval'));
  assert.equal(result.runtime_status, 'COMPLETED');
  assert.equal(result.accepted, undefined);
  assert.deepEqual(calls, ['activate', 'release']);
});

test('Qwen worker can expose each explicitly qualified retrieval capability', async () => {
  const worker = createQwenRetrievalWorker({
    resource_id: 'kad-local-qwen-amdy',
    supported_capabilities: ['repository-fact-finding', 'structured-extraction'],
    activate: async () => ({ model_identity: 'Qwen3.5-9B' }),
    invoke: async () => ({ value: 'structured fact', evidence: ['fixture'] }),
    release: async () => {},
    expected_model_identity: 'Qwen3.5-9B',
  });
  const result = await worker.execute(task('structured-extraction', 'retrieval', 'structured'));
  assert.equal(result.runtime_status, 'COMPLETED');
  assert.equal(result.capability, 'structured-extraction');
});

test('Stheno worker preserves external lifecycle ownership', async () => {
  let invoked = 0;
  const worker = createSthenoWorldWorker({ resource_id: 'kad-local-world-amdy', model_identity: 'L3-8B-Stheno', invoke: async () => { invoked++; return { value: 'world', evidence: ['simulation'] }; } });
  const result = await worker.execute(task('world-simulation', 'world'));
  assert.equal(result.runtime_status, 'COMPLETED');
  assert.equal(invoked, 1);
  assert.equal(result.resource_ownership, 'EXTERNAL');
});

test('coordinator time-multiplexes two typed workers and persists recoverable state', async () => {
  const statePath = tempState();
  const telemetryPath = join(mkdtempSync(join(tmpdir(), 'kad-swarm-')), 'telemetry.jsonl');
  const coordinator = new SwarmCoordinator({ registry: resources(), statePath, telemetryPath });
  coordinator.registerWorker(createQwenRetrievalWorker({ resource_id: 'kad-local-qwen-amdy', activate: async () => ({ model_identity: 'Qwen3.5-9B' }), invoke: async () => ({ value: 'fact', evidence: ['qwen'] }), release: async () => {}, expected_model_identity: 'Qwen3.5-9B' }));
  coordinator.registerWorker(createSthenoWorldWorker({ resource_id: 'kad-local-world-amdy', model_identity: 'L3-8B-Stheno', invoke: async () => ({ value: 'world', evidence: ['stheno'] }) }));
  const results = await coordinator.runAll([task('repository-fact-finding', 'retrieval', 'a'), task('world-simulation', 'world', 'b')]);
  assert.deepEqual(results.map(result => result.acceptance), [ACCEPTANCE_STATES.ACCEPTED, ACCEPTANCE_STATES.ACCEPTED]);
  assert.deepEqual(results.map(result => result.resource_id), ['kad-local-qwen-amdy', 'kad-local-world-amdy']);
  const persisted = JSON.parse(readFileSync(statePath, 'utf8'));
  assert.equal(persisted.tasks_completed, 2);
  assert.equal(persisted.tasks_total, 2);
  assert.equal(persisted.schedule, 'TIME_MULTIPLEXED');
  const degradedStatePath = tempState();
  writeFileSync(degradedStatePath, JSON.stringify({ completed_task_ids: [], events: [], resources: [{ id: 'kad-local-world-amdy', state: 'DEGRADED', available: false, state_reason: 'persisted outage' }] }));
  const recoveredDegraded = new SwarmCoordinator({ registry: resources(), statePath: degradedStatePath });
  assert.equal(recoveredDegraded.registry.resource('kad-local-world-amdy').state, 'DEGRADED');
  assert.equal(readFileSync(telemetryPath, 'utf8').trim().split('\n').length, 2);
  const recovered = SwarmCoordinator.recover(statePath);
  assert.deepEqual(recovered.completed_task_ids, ['a', 'b']);
  const resumed = new SwarmCoordinator({ registry: resources(), statePath });
  assert.deepEqual(resumed.snapshot().completed_task_ids, ['a', 'b']);
});

test('coordinator fails closed for malformed output, identity mismatch, timeout, and unavailable resource', async () => {
  const coordinator = new SwarmCoordinator({ registry: resources(), statePath: tempState() });
  coordinator.registerWorker(createQwenRetrievalWorker({ resource_id: 'kad-local-qwen-amdy', activate: async () => ({ model_identity: 'wrong' }), invoke: async () => ({ value: 'x', evidence: ['x'] }), release: async () => {}, expected_model_identity: 'Qwen3.5-9B' }));
  const mismatch = await coordinator.run(task('repository-fact-finding', 'retrieval', 'identity'));
  assert.equal(mismatch.acceptance, ACCEPTANCE_STATES.REJECTED);
  const rollbackCalls = [];
  const activationFailureWorker = createQwenRetrievalWorker({
    resource_id: 'kad-local-qwen-amdy',
    activate: async () => { rollbackCalls.push('activate'); throw new Error('activation failed'); },
    invoke: async () => ({ value: 'never', evidence: ['never'] }),
    release: async () => { rollbackCalls.push('release'); },
    expected_model_identity: 'Qwen3.5-9B',
  });
  const activationFailure = await activationFailureWorker.execute(task('repository-fact-finding', 'retrieval', 'activation-failure'));
  assert.equal(activationFailure.runtime_status, 'UNAVAILABLE');
  assert.deepEqual(rollbackCalls, ['activate', 'release']);

  const unavailableRegistry = resources();
  unavailableRegistry.setState('kad-local-world-amdy', 'UNAVAILABLE', 'test outage');
  const unavailableCoordinator = new SwarmCoordinator({ registry: unavailableRegistry });
  const unavailable = await unavailableCoordinator.run(task('world-simulation', 'world', 'unavailable'));
  assert.equal(unavailable.acceptance, ACCEPTANCE_STATES.DEFERRED);

  const timeoutCoordinator = new SwarmCoordinator({ registry: resources() });
  timeoutCoordinator.registerWorker(createQwenRetrievalWorker({
    resource_id: 'kad-local-qwen-amdy',
    activate: async () => ({ model_identity: 'Qwen3.5-9B' }),
    invoke: () => new Promise(resolve => setTimeout(() => resolve({ value: 'late', evidence: ['late'] }), 20)),
    release: async () => {},
    expected_model_identity: 'Qwen3.5-9B',
  }));
  const timeout = await timeoutCoordinator.run(createTaskContract({ ...task('repository-fact-finding', 'retrieval', 'timeout'), max_runtime: 5 }));
  assert.equal(timeout.acceptance, ACCEPTANCE_STATES.REJECTED);
  assert.equal(timeout.runtime_status, 'TIMEOUT');

  const malformedCoordinator = new SwarmCoordinator({ registry: resources(), statePath: tempState() });

  const throwingCoordinator = new SwarmCoordinator({ registry: resources() });
  throwingCoordinator.registerWorker({ resource_id: 'kad-local-qwen-amdy', execute: async () => { throw new Error('unexpected worker failure'); } });
  const thrown = await throwingCoordinator.run(task('repository-fact-finding', 'retrieval', 'throwing-worker'));
  assert.equal(thrown.acceptance, ACCEPTANCE_STATES.REJECTED);
  assert.equal(thrown.runtime_status, 'REJECTED');
  malformedCoordinator.registerWorker(createQwenRetrievalWorker({ resource_id: 'kad-local-qwen-amdy', activate: async () => ({ model_identity: 'Qwen3.5-9B' }), invoke: async () => 'not-an-object', release: async () => {}, expected_model_identity: 'Qwen3.5-9B' }));
  const malformed = await malformedCoordinator.run(task('repository-fact-finding', 'retrieval', 'malformed'));
  assert.equal(malformed.acceptance, ACCEPTANCE_STATES.REJECTED);
  assert.equal(malformed.runtime_status, 'MALFORMED');
  assert.equal(malformedCoordinator.registry.resource('kad-local-qwen-amdy').state, 'DEGRADED');
});

test('resource states expose bounded lifecycle vocabulary', () => {
  assert.deepEqual(RESOURCE_STATES, ['AVAILABLE', 'ACTIVATING', 'ACTIVE', 'BUSY', 'RELEASING', 'UNAVAILABLE', 'DEGRADED']);
});
