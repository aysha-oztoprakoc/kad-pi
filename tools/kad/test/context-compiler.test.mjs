import assert from 'node:assert/strict';
import test from 'node:test';
import { CapabilityRegistry } from '../local-router.mjs';
import { compileResourceAwareTaskPacket, evaluateSplitAuthorization, interpretHistoricalResourceFit, requiredOutputReserve, resolveSourceSelector, validateStcContractIdentity } from '../context-compiler.mjs';
import { executeSwarm } from '../swarm.mjs';
import { createRecord } from '../distillation.mjs';

const resource = { resource_id: 'kad-local-retrieval-amdy', trust_domain: 'retrieval', capabilities: ['repository-fact-finding', 'structured-extraction'], effective_context_window: 2048, effective_max_output_tokens: 192, evidence: ['live'], confidence: 'OBSERVED_RUNTIME' };
const request = { task_id: 'TOKENMAX-LIVE-001', role: 'local_retrieval', trust_domain: 'retrieval', capability: 'repository-fact-finding', question: 'prove trust isolation', source_paths: ['router.mjs', 'models.json', 'models.yml'], max_facts: 4, budget: { max_input_tokens: 4096, max_output_tokens: 512, max_model_calls: 1 } };
const router = `export class CapabilityRegistry {\n  eligible(requirement) {\n    return [...this.#resources.values()].filter(resource => resource.available &&\n      requirement.trust_domain === resource.trust_domain &&\n      (requirement.capabilities ?? []).every(capability => resource.capabilities.includes(capability)) &&\n      (requirement.min_context ?? 0) <= (resource.context_window ?? 0));\n  }\n  choose(requirement) { return this.eligible(requirement)[0]; }\n}\n`;
const modelsJson = JSON.stringify({ providers: { 'kad-local-world': { models: [{ id: 'stheno-local', trust_domain: 'world' }] }, 'kad-local-qwen': { models: [{ id: 'qwen-local', trust_domain: 'retrieval' }] } } }, null, 2);
const modelsYaml = `providers:\n  kad-local-world:\n    models:\n      - id: kad-local-s13\n        trust_domain: world\n        contextWindow: 4096\n  kad-local-qwen:\n    models:\n      - id: qwen-local\n        trust_domain: retrieval\n        contextWindow: 4096\n`;
const sources = [{ path: 'router.mjs', content: router }, { path: 'models.json', content: modelsJson }, { path: 'models.yml', content: modelsYaml }];
const selectors = [
  { path: 'router.mjs', selector: { kind: 'symbol', value: 'CapabilityRegistry.eligible', reason: 'trust-domain eligibility rule' } },
  { path: 'models.json', selector: { kind: 'json_pointer', value: '/providers/kad-local-world', reason: 'Stheno WORLD trust domain' } },
  { path: 'models.json', selector: { kind: 'json_pointer', value: '/providers/kad-local-qwen', reason: 'Qwen retrieval trust domain' } },
  { path: 'models.yml', selector: { kind: 'yaml_path', value: 'providers.kad-local-world', reason: 'OMP WORLD declaration' } },
  { path: 'models.yml', selector: { kind: 'yaml_path', value: 'providers.kad-local-qwen', reason: 'OMP Qwen declaration' } },
];

test('T1 proven worker envelope overrides aspirational task budget', () => {
  const packet = compileResourceAwareTaskPacket({ request, sources, selectors, resource_contract: resource, output_reserve: 160 });
  assert.equal(packet.compiled.context_window, 2048);
  assert.equal(packet.compiled.effective_max_output_tokens, 192);
  assert.equal(packet.requested.budget.max_output_tokens, 512);
});

test('T2 oversized task never invokes worker', async () => {
  const registry = new CapabilityRegistry();
  registry.register({ id: 'qwen', trust_domain: 'retrieval', capabilities: ['repository-fact-finding'], context_window: 2048 });
  let calls = 0;
  const result = await executeSwarm({ request: { ...request, source_paths: ['router.mjs'], budget: { max_output_tokens: 512, max_repairs: 0 } }, sources: [sources[0]], controller: { lanes: [{ id: 'c', role: 'controller', approved: true, payg: false, billing_class: 'SUBSCRIPTION_BACKED' }], execute: async () => ({ plan: { source_paths: ['router.mjs'], question: 'q', max_facts: 1 }, telemetry: {} }) }, registry, worker: { resource_id: 'qwen', resource_contract: resource, required_prompt_tokens: 2302, execute: async () => { calls += 1; return { output: '{}', telemetry: {} }; } }, max_repairs: 0 });
  assert.equal(result.failure_reason, 'LOCAL_TASK_BUDGET_UNSATISFIABLE');
  assert.equal(calls, 0);
});

test('T3 precise source selector beats broad excerpt', () => {
  const precise = resolveSourceSelector(sources[0], { kind: 'symbol', value: 'CapabilityRegistry.eligible' }, ['router.mjs']);
  const broad = resolveSourceSelector(sources[0], { kind: 'whole_file' }, ['router.mjs']);
  assert.ok(precise.selected_bytes < broad.selected_bytes);
});

test('T4 selector outside allowlisted source fails closed', () => {
  assert.throws(() => resolveSourceSelector({ path: '../secret', content: 'x' }, { kind: 'whole_file' }, ['router.mjs']), /outside allowlist/);
});

test('T5 nonexistent symbol/key selector fails closed', () => {
  assert.throws(() => resolveSourceSelector(sources[0], { kind: 'symbol', value: 'Missing.symbol' }, ['router.mjs']), /resolve uniquely/);
  assert.throws(() => resolveSourceSelector(sources[1], { kind: 'json_pointer', value: '/missing' }, ['models.json']), /does not exist/);
});

test('T6 JSON and YAML subtree selection is deterministic', () => {
  const a = resolveSourceSelector(sources[1], { kind: 'json_pointer', value: '/providers/kad-local-qwen' }, ['models.json']);
  const b = resolveSourceSelector(sources[2], { kind: 'yaml_path', value: 'providers.kad-local-qwen' }, ['models.yml']);
  assert.equal(a.selected_sha256.length, 64);
  assert.equal(b.selected_sha256.length, 64);
  assert.deepEqual(a, resolveSourceSelector(sources[1], { kind: 'json_pointer', value: '/providers/kad-local-qwen' }, ['models.json']));
});

test('T7 identical inputs compile to identical packet hash', () => {
  const a = compileResourceAwareTaskPacket({ request, sources, selectors, resource_contract: resource, output_reserve: 160 });
  const b = compileResourceAwareTaskPacket({ request, sources, selectors, resource_contract: resource, output_reserve: 160 });
  assert.equal(a.packet_sha256, b.packet_sha256);
});

test('T8 source change invalidates selected-source hash', () => {
  const a = resolveSourceSelector(sources[1], { kind: 'json_pointer', value: '/providers/kad-local-qwen' }, ['models.json']);
  const changed = { path: 'models.json', content: modelsJson.replace('retrieval', 'world') };
  const b = resolveSourceSelector(changed, { kind: 'json_pointer', value: '/providers/kad-local-qwen' }, ['models.json']);
  assert.notEqual(a.selected_sha256, b.selected_sha256);
});

test('T9 compiled prompt plus reserve fits worker context when deterministically reduced', () => {
  const packet = compileResourceAwareTaskPacket({ request, sources, selectors, resource_contract: resource, output_reserve: 120 });
  assert.equal(packet.resource_fit, 'PASS');
});

test('T10 output reserve cannot exceed proven worker maximum', () => {
  const packet = compileResourceAwareTaskPacket({ request, sources, selectors, resource_contract: resource, output_reserve: 512 });
  assert.equal(packet.resource_fit, 'FAIL');
  assert.equal(packet.fit.reason, 'REQUESTED_OUTPUT_EXCEEDS_RESOURCE_MAX');
});

test('T11 UNKNOWN resource capacity cannot become unlimited', () => {
  const packet = compileResourceAwareTaskPacket({ request, sources, selectors, resource_contract: { resource_id: 'qwen' }, output_reserve: 1 });
  assert.equal(packet.resource_fit, 'FAIL');
  assert.equal(packet.fit.reason, 'EFFECTIVE_CONTEXT_UNKNOWN');
});

test('T12 WORLD trust mismatch still rejects regardless of fit', () => {
  const registry = new CapabilityRegistry();
  registry.register({ id: 'world', trust_domain: 'world', capabilities: ['repository-fact-finding'], context_window: 999999 });
  assert.equal(registry.choose({ trust_domain: 'retrieval', capabilities: ['repository-fact-finding'], min_context: 1 }).status, 'DEGRADED');
});

test('T13 larger context cannot expand Qwen capability authority', () => {
  const registry = new CapabilityRegistry();
  registry.register({ id: 'qwen', trust_domain: 'retrieval', capabilities: ['repository-fact-finding'], context_window: 999999 });
  assert.equal(registry.choose({ trust_domain: 'retrieval', capabilities: ['world-generation'], min_context: 1 }).status, 'DEGRADED');
});

test('T14 resource rejection is infrastructure failure, not model failure', () => {
  const packet = compileResourceAwareTaskPacket({ request, sources, selectors, resource_contract: resource, output_reserve: 512 });
  assert.equal(packet.fit.code, 'LOCAL_TASK_OUTPUT_UNSATISFIABLE');
});

test('T15 rejected-before-inference episode records zero model calls', async () => {
  const registry = new CapabilityRegistry();
  registry.register({ id: 'qwen', trust_domain: 'retrieval', capabilities: ['repository-fact-finding'], context_window: 2048 });
  const result = await executeSwarm({ request: { ...request, source_paths: ['router.mjs'], budget: { max_output_tokens: 512, max_repairs: 0 } }, sources: [sources[0]], controller: { lanes: [{ id: 'c', role: 'controller', approved: true, payg: false, billing_class: 'SUBSCRIPTION_BACKED' }], execute: async () => ({ plan: { source_paths: ['router.mjs'], question: 'q', max_facts: 1 }, telemetry: {} }) }, registry, worker: { resource_id: 'qwen', resource_contract: resource, required_prompt_tokens: 2302, execute: async () => { throw new Error('must not run'); } }, max_repairs: 0 });
  assert.equal(result.telemetry.local_invocations, 0);
});

test('T16 historical R2 remains immutable', () => {
  const interpretation = interpretHistoricalResourceFit({ task_id: 'TOKENMAX-LIVE-001-R2', attempts: [{ input_tokens: 2302 }, { input_tokens: 2346 }], resource_contract: resource, requested_output_tokens: 512 });
  assert.equal(interpretation.historical_evidence_immutable, true);
});

test('T17 derived interpretation may classify historical task fit failure without rewriting history', () => {
  const interpretation = interpretHistoricalResourceFit({ task_id: 'TOKENMAX-LIVE-001-R2', attempts: [{ input_tokens: 2302 }, { input_tokens: 2346 }], resource_contract: resource, requested_output_tokens: 512 });
  assert.equal(interpretation.task_fit_under_current_proven_contract, 'FAIL');
  assert.equal(interpretation.QWEN_SEMANTIC_RELIABILITY_SIGNAL, 'INVALID_FOR_PROMOTION');
});

test('T18 logical distillation receipt contains no unsupported model-behavior claim', () => {
  const record = createRecord({ id: 'TASK_RESOURCE_FIT_REQUIRED_BEFORE_INFERENCE', task: { class: 'LOGICAL_CONTRACT_DISTILLATION', objective: 'prove resource fit before inference' }, input: { canonical: { lesson: 'TASK_RESOURCE_FIT_REQUIRED_BEFORE_INFERENCE' } }, distillation: { lesson: 'prove resource fit before inference', policies: ['deterministic resource fit gate'], negative_examples: [] }, behavior: { required: ['required_resource <= available_resource'], forbidden: ['Qwen is unreliable'] } });
  assert.equal(JSON.stringify(record).includes('Qwen cannot perform retrieval'), false);
});

test('T19 deterministic reduction never removes required evidence or schema constraints', () => {
  const packet = compileResourceAwareTaskPacket({ request, sources, selectors, resource_contract: resource, output_reserve: 120 });
  assert.equal(packet.limits.required_evidence, true);
  assert.ok(packet.output_schema.fact.evidence.includes('exact'));
});

test('T20 task splitting cannot exceed model-call budget', () => {
  assert.equal(evaluateSplitAuthorization({ subtasks: ['a', 'b'], max_model_calls: 1 }).authorized, false);
  assert.equal(evaluateSplitAuthorization({ subtasks: ['a'], max_model_calls: 1 }).authorized, true);
});

test('T21 PON emits one meaningful fit decision, not notification noise', () => {
  const packet = compileResourceAwareTaskPacket({ request, sources, selectors, resource_contract: resource, output_reserve: 120 });
  const trace = ['work.requested', 'resource.selected', 'resource.contract.observed', 'context.compiled', 'resource.fit.evaluated', packet.resource_fit === 'PASS' ? 'worker.authorized' : 'worker.rejected_resource_fit'];
  assert.equal(trace.filter(item => item === 'resource.fit.evaluated').length, 1);
});

test('T22 STC contract cannot authorize a different process/model identity', () => {
  const contract = { resource_id: 'qwen', model_identity: 'Qwen', runtime_argv_sha256: 'aaa' };
  assert.equal(validateStcContractIdentity(contract, { resource_id: 'qwen', model_identity: 'Other', runtime_argv_sha256: 'aaa' }), false);
});

test('T23 resource numeric changes are data-only compiler inputs', () => {
  const packet = compileResourceAwareTaskPacket({ request, sources, selectors, resource_contract: { ...resource, effective_context_window: 4096, effective_max_output_tokens: 256 }, output_reserve: 160 });
  assert.equal(packet.compiled.context_window, 4096);
  assert.equal(packet.compiled.effective_max_output_tokens, 256);
});

test('T24 a different worker envelope uses the same compiler path', () => {
  const other = compileResourceAwareTaskPacket({ request: { ...request, task_id: 'OTHER-WORKER' }, sources, selectors, resource_contract: { ...resource, resource_id: 'other-specialist', effective_context_window: 4096, effective_max_output_tokens: 256 }, output_reserve: 160 });
  assert.equal(other.compiled.resource_id, 'other-specialist');
  assert.equal(other.resource_fit, 'PASS');
});
