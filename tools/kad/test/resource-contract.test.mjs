import assert from 'node:assert/strict';
import test from 'node:test';
import { CapabilityRegistry } from '../local-router.mjs';
import { compileTaskPacket, executeSwarm } from '../swarm.mjs';
import { routeEconomically, createEconomicPolicy } from '../economic-router.mjs';
import { classifyOutputLimitSaturation, compareDeclarations, derivePiOpenAIRequestContract, normalizeFinishReason, normalizeResourceContract, preflightResourceContract } from '../resource-contract.mjs';

const qwenPiModel = { contextWindow: 2048, maxTokens: 192, samplingParams: { reasoning_effort: 'none', max_tokens: 192 }, compat: { maxTokensField: 'max_tokens' } };

test('T1 conflicting declarations are detected instead of merged into one capability', () => {
  const comparison = compareDeclarations({ task_budget: { max_input_tokens: 4096, max_output_tokens: 512 }, pi_model: qwenPiModel, omp_model: { contextWindow: 4096, maxTokens: 256 }, kobold_runtime: { context_window: 2048 }, effective_request: { max_tokens: 192 } });
  assert.equal(comparison.classifications.context_window, 'INCONSISTENT');
  assert.equal(comparison.classifications.max_output_tokens, 'INCONSISTENT');
  assert.equal(comparison.classifications.task_budget_gt_worker_output, 'INCONSISTENT');
});

test('T2 effective request/runtime evidence outranks configuration declaration', () => {
  const comparison = compareDeclarations({ task_budget: { max_output_tokens: 512 }, pi_model: { contextWindow: 2048, maxTokens: 512 }, omp_model: { contextWindow: 4096, maxTokens: 512 }, kobold_runtime: { context_window: 2048 }, effective_request: { max_tokens: 192 } });
  assert.equal(comparison.effective_request.max_tokens, 192);
  assert.equal(comparison.classifications.task_budget_gt_worker_output, 'INCONSISTENT');
});

test('T3 prompt plus reserve exceeding context fails before inference', () => {
  const result = preflightResourceContract({ resource: { effective_context_window: 2048, effective_max_output_tokens: 192 }, required_prompt_tokens: 1900, required_output_reserve: 192 });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'LOCAL_TASK_BUDGET_UNSATISFIABLE');
});

test('T4 requested output exceeding resource maximum fails before inference', () => {
  const result = preflightResourceContract({ resource: { effective_context_window: 4096, effective_max_output_tokens: 192 }, required_prompt_tokens: 1000, required_output_reserve: 128, requested_output_tokens: 512 });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'LOCAL_TASK_OUTPUT_UNSATISFIABLE');
});

test('T5 exact-fit task is permitted', () => {
  const result = preflightResourceContract({ resource: { effective_context_window: 2048, effective_max_output_tokens: 192 }, required_prompt_tokens: 1856, required_output_reserve: 192, requested_output_tokens: 192 });
  assert.equal(result.ok, true);
});

test('T6 unknown effective context fails conservatively for bounded local execution', () => {
  const result = preflightResourceContract({ resource: { effective_max_output_tokens: 192 }, required_prompt_tokens: 1, required_output_reserve: 1 });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'EFFECTIVE_CONTEXT_UNKNOWN');
});

test('T7 output-limit saturation is recorded only when actual effective cap matches observed usage', () => {
  assert.equal(classifyOutputLimitSaturation({ observed_output_tokens: 192, effective_max_output_tokens: 192 }), 'OBSERVED');
  assert.equal(classifyOutputLimitSaturation({ observed_output_tokens: 192, effective_max_output_tokens: 256 }), 'NOT_PROVEN');
});

test('T8 unknown finish reason remains UNKNOWN', () => {
  assert.deepEqual(normalizeFinishReason({}), { finish_reason: 'UNKNOWN', stop_reason: 'UNKNOWN', truncated: 'UNKNOWN', length_limit_hit: 'UNKNOWN' });
});

test('T9 request-capture fixture contract does not require model inference', () => {
  const derived = derivePiOpenAIRequestContract({ model: qwenPiModel, prompt_tokens: 2302, requested_output_tokens: 512 });
  assert.equal(derived.pi_clamped_max_tokens, 1);
  assert.equal(derived.request.max_tokens, 192);
  assert.equal(derived.request.reasoning_effort, 'none');
});

test('T10 trust and capability authority remain unchanged by resource budget normalization', () => {
  const contract = normalizeResourceContract({ resource_id: 'kad-local-retrieval-amdy', trust_domain: 'retrieval', capabilities: ['repository-fact-finding'], effective_context_window: 4096, effective_max_output_tokens: 192, confidence: 'OBSERVED' });
  assert.deepEqual(contract.capabilities, ['repository-fact-finding']);
  assert.equal(contract.trust_domain, 'retrieval');
});

test('T11 WORLD still cannot satisfy RETRIEVAL regardless of context size', () => {
  const registry = new CapabilityRegistry();
  registry.register({ id: 'world', trust_domain: 'world', capabilities: ['structured-extraction'], context_window: 999999, available: true });
  assert.deepEqual(registry.eligible({ trust_domain: 'retrieval', capabilities: ['structured-extraction'], min_context: 1 }), []);
});

test('T12 changing context budget cannot self-promote Qwen capability', () => {
  const registry = new CapabilityRegistry();
  registry.register({ id: 'qwen', trust_domain: 'retrieval', capabilities: ['repository-fact-finding'], context_window: 8192, available: true });
  assert.deepEqual(registry.eligible({ trust_domain: 'retrieval', capabilities: ['world-generation'], min_context: 1 }), []);
});

test('T13 deterministic replay of resource contract is stable', () => {
  const one = derivePiOpenAIRequestContract({ model: qwenPiModel, prompt_tokens: 10, requested_output_tokens: 512 });
  const two = derivePiOpenAIRequestContract({ model: qwenPiModel, prompt_tokens: 10, requested_output_tokens: 512 });
  assert.deepEqual(one, two);
});

test('T14 existing task packet hashes remain attributable', () => {
  const sources = [{ path: 'tools/kad/local-router.mjs', content: 'export const x = 1;\n' }];
  const packet = compileTaskPacket({ task_id: 'TOKENMAX-LIVE-001', role: 'local_retrieval', trust_domain: 'retrieval', capability: 'repository-fact-finding', question: 'q', source_paths: ['tools/kad/local-router.mjs'] }, sources);
  assert.match(packet.packet_sha256, /^[a-f0-9]{64}$/);
  assert.equal(packet.sources[0].sha256.length, 64);
});

test('T15 PAYG economic policy is unaffected by context budget checks', () => {
  const route = routeEconomically({ requirement: { trust_domain: 'control', capabilities: ['decomposition'] }, lanes: [{ lane_id: 'payg', role: 'controller', available: true, approved: true, payg: true, billing_class: 'PAYG', trust_domain: 'control', capabilities: ['decomposition'], context_window: 999999 }, { lane_id: 'sub', role: 'controller', available: true, approved: true, payg: false, billing_class: 'SUBSCRIPTION_BACKED', trust_domain: 'control', capabilities: ['decomposition'], context_window: 1 }], policy: createEconomicPolicy(), queued_work: true });
  assert.equal(route.selected_lane, 'sub');
});

test('resource contract gate blocks impossible local task before worker invocation', async () => {
  const registry = new CapabilityRegistry();
  registry.register({ id: 'qwen', trust_domain: 'retrieval', capabilities: ['repository-fact-finding'], context_window: 2048, available: true });
  let invoked = false;
  const result = await executeSwarm({
    request: { task_id: 'GATE-001', role: 'local_retrieval', trust_domain: 'retrieval', capability: 'repository-fact-finding', question: 'q', source_paths: ['a.js'], budget: { max_output_tokens: 512, max_repairs: 0 } },
    sources: [{ path: 'a.js', content: 'export const a = 1;\n' }],
    controller: { lanes: [{ id: 'controller', role: 'controller', available: true, approved: true, payg: false, billing_class: 'SUBSCRIPTION_BACKED' }], execute: async () => ({ plan: { source_paths: ['a.js'], question: 'q', max_facts: 1 }, telemetry: {} }) },
    registry,
    worker: { resource_id: 'qwen', resource_contract: { effective_context_window: 2048, effective_max_output_tokens: 192 }, required_prompt_tokens: 10, execute: async () => { invoked = true; return { output: '{}', telemetry: {} }; } },
    max_repairs: 0,
  });
  assert.equal(result.status, 'DEGRADED');
  assert.equal(result.failure_reason, 'LOCAL_TASK_OUTPUT_UNSATISFIABLE');
  assert.equal(invoked, false);
});
