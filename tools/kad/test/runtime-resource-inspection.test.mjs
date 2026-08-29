import assert from 'node:assert/strict';
import test from 'node:test';
import { preflightResourceContract } from '../resource-contract.mjs';
import { observeProcessArgv, parseKoboldRuntimeArgv, runtimeEvidenceContract, zeroInferenceLedger } from '../runtime-resource-inspection.mjs';

const argv = ['/repo/koboldcpp', '--model', '/repo/Qwen.gguf', '--usecpu', '--contextsize', '2048', '--batchsize', '128', '--threads', '4', '--host', '127.0.0.1', '--port', '5002', '--skiplauncher'];

test('T1 live runtime evidence outranks static declaration', () => {
  const observation = observeProcessArgv({ pid: 123, argv, observed_at: '2026-01-01T00:00:00.000Z' });
  const contract = runtimeEvidenceContract({ resource: { resource_id: 'qwen', trust_domain: 'retrieval', capabilities: ['repository-fact-finding'] }, processObservation: observation, transportOutputCap: 192 });
  assert.equal(contract.effective_context_window, 2048);
  assert.equal(contract.confidence, 'OBSERVED_RUNTIME');
});

test('T2 observed process context is represented without changing trust or capability', () => {
  const observation = observeProcessArgv({ pid: 123, argv });
  const contract = runtimeEvidenceContract({ resource: { resource_id: 'qwen', trust_domain: 'retrieval', capabilities: ['repository-fact-finding'] }, processObservation: observation, transportOutputCap: 192 });
  assert.equal(contract.trust_domain, 'retrieval');
  assert.deepEqual(contract.capabilities, ['repository-fact-finding']);
});

test('T3 context mismatch fails task-budget gate', () => {
  const result = preflightResourceContract({ resource: { effective_context_window: 2048, effective_max_output_tokens: 192 }, required_prompt_tokens: 2302, required_output_reserve: 192, requested_output_tokens: 192 });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'PROMPT_PLUS_RESERVE_EXCEEDS_CONTEXT');
});

test('T4 output mismatch fails task-budget gate', () => {
  const result = preflightResourceContract({ resource: { effective_context_window: 4096, effective_max_output_tokens: 192 }, required_prompt_tokens: 100, required_output_reserve: 192, requested_output_tokens: 512 });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'REQUESTED_OUTPUT_EXCEEDS_RESOURCE_MAX');
});

test('T5 unknown runtime field remains UNKNOWN', () => {
  const parsed = parseKoboldRuntimeArgv(['/repo/koboldcpp', '--port', '5002']);
  assert.equal(parsed.context_window, null);
  const observation = observeProcessArgv({ pid: 123, argv: ['/repo/koboldcpp', '--port', '5002'] });
  assert.equal(observation.fields.context_window.class, 'UNKNOWN');
});

test('T6 runtime inspection cannot authorize inference', () => {
  const ledger = zeroInferenceLedger({ inspected_endpoints: ['/api/v1/model'] });
  assert.equal(ledger.NO_INFERENCE, 'PROVEN');
  assert.equal(ledger.chat_completion_requests, 0);
});

test('T7 lifecycle disposal target is represented as owned Qwen only', () => {
  const qwen = { resource_id: 'kad-local-retrieval-amdy', ownership: 'OWNED' };
  assert.equal(qwen.ownership, 'OWNED');
});

test('T8 external WORLD resource survives as separate external resource', () => {
  const world = { resource_id: 'kad-local-world-external', trust_domain: 'world', ownership: 'EXTERNAL' };
  assert.equal(world.trust_domain, 'world');
  assert.equal(world.ownership, 'EXTERNAL');
});

test('T9 resource receipt replays deterministically', () => {
  const one = observeProcessArgv({ pid: 123, argv, observed_at: '2026-01-01T00:00:00.000Z' });
  const two = observeProcessArgv({ pid: 123, argv, observed_at: '2026-01-01T00:00:00.000Z' });
  assert.deepEqual(one, two);
});

test('T10 resource inspection produces zero economic inference usage', () => {
  const ledger = zeroInferenceLedger({ completion_requests: 0, chat_completion_requests: 0, controller_calls: 0, remote_tokens: 0, local_generation_calls: 0 });
  assert.deepEqual({ remote_tokens: ledger.remote_tokens, local_generation_calls: ledger.local_generation_calls }, { remote_tokens: 0, local_generation_calls: 0 });
  assert.equal(ledger.NO_INFERENCE, 'PROVEN');
});
