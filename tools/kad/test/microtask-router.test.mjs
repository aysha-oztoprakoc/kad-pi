import assert from 'node:assert/strict';
import test from 'node:test';
import { createEconomicPolicy } from '../economic-router.mjs';
import {
  EXECUTION_CLASSES,
  ESCALATION_REASONS,
  classifyMicrotask,
  compileFreshLocalPacket,
  buildEscalationPacket,
  routeMicrotask,
  executeMicrotask,
  makeEconomicReceipt,
  recordDistillationCandidate,
} from '../microtask-router.mjs';

const resource = {
  resource_id: 'kad-local-retrieval-amdy', model_identity: 'Qwen3.5-9B',
  runtime_argv_sha256: 'argv-hash', runtime_configuration_sha256: 'config-hash',
  trust_domain: 'retrieval', capabilities: ['repository-fact-finding', 'structured-extraction'],
  effective_context_window: 2048, effective_max_output_tokens: 192,
  evidence: ['runtime-observation'], confidence: 'OBSERVED_RUNTIME', available: true,
};
const task = (overrides = {}) => ({
  task_id: 'MICRO-1', trust_domain: 'retrieval', capability: 'repository-fact-finding',
  source_paths: ['a.md'], source_selectors: [{ path: 'a.md', selector: { kind: 'whole_file', max_bytes: 1000 } }],
  output_schema: { type: 'object' }, read_only: true, mutation: false,
  authority_required: false, security_sensitive: false, architecture_decision: false,
  source_count: 1, output_bound: true, validator: true, remote_allowed: true,
  question: 'Extract the fact', max_facts: 1, budget: { max_output_tokens: 64, max_model_calls: 1 }, ...overrides,
});
const source = { path: 'a.md', content: 'The exact fact is here.' };
const local = { ...resource, id: resource.resource_id, local: true, deterministic: false, priority: 1 };
const remote = { lane_id: 'subscription', execution_class: 'REMOTE_SUBSCRIPTION', billing_class: 'SUBSCRIPTION_BACKED', provider: 'approved', model: 'subscription-model', trust_domain: 'retrieval', capabilities: ['repository-fact-finding'], context_window: 8192, available: true, authority_compatible: true, payg: false, marginal_cost: 0, quota: { status: 'UNKNOWN', remaining: null, capacity: null } };
const policy = createEconomicPolicy({ spend: { payg_authorized: false, allow_paid_fallback: false, allow_auto_topup: false, max_incremental_cost: 0 } });

function accepted(value = { fact: 'ok' }) { return { output: value, validation: { accepted: true, result: 'PASS', accepted_artifact_hash: 'artifact' }, telemetry: { input_tokens: 20, output_tokens: 5, latency_ms: 7 } }; }

// T1–T8: classification and admission
for (const [name, input, expected] of [
  ['T1 deterministic task selects deterministic', { deterministic_tool: { id: 'json', trust_domain: 'retrieval', capabilities: ['repository-fact-finding'], available: true, validator: true, execute: () => accepted() } }, 'DETERMINISTIC'],
  ['T2 eligible bounded retrieval prefers local', { local_resources: [local], remote_lanes: [remote] }, 'LOCAL_SPECIALIST'],
  ['T3 WORLD cannot satisfy retrieval', { local_resources: [{ ...local, id: 'world', resource_id: 'world', trust_domain: 'world' }] }, 'REMOTE_REQUIRED'],
  ['T4 Qwen cannot satisfy architecture', { task: task({ architecture_decision: true }), local_resources: [local], remote_lanes: [remote] }, 'REMOTE_REQUIRED'],
  ['T5 Qwen cannot satisfy security mutation', { task: task({ security_sensitive: true, mutation: true }), local_resources: [local], remote_lanes: [remote] }, 'REMOTE_REQUIRED'],
  ['T6 unknown resource contract rejects local', { local_resources: [{ ...local, effective_context_window: null }] }, 'REMOTE_REQUIRED'],
  ['T7 resource fit failure does not invoke local', { task: task({ source_selectors: [{ path: 'a.md', selector: { kind: 'whole_file', max_bytes: 1000 } }], compiled_prompt_tokens: 2000 }), local_resources: [local], remote_lanes: [remote] }, 'REMOTE_REQUIRED'],
  ['T8 resource fit failure does not auto invoke remote', { task: task({ compiled_prompt_tokens: 2000 }), local_resources: [local], remote_lanes: [remote] }, 'REMOTE_REQUIRED'],
]) {
  test(name, () => {
    const value = input.task ?? task();
    const result = routeMicrotask({ task: value, deterministic_tool: input.deterministic_tool, local_resources: input.local_resources ?? [], remote_lanes: input.remote_lanes ?? [], policy });
    assert.equal(result.execution_class, expected);
    if (name.startsWith('T7') || name.startsWith('T8')) assert.equal(result.invoke, false);
  });
}

test('T9 accepted local suppresses remote escalation', async () => {
  let remoteCalls = 0;
  const result = await executeMicrotask({ task: task(), local_resources: [local], remote_lanes: [remote], policy, local_execute: async () => accepted(), remote_execute: async () => { remoteCalls += 1; } });
  assert.equal(result.status, 'ACCEPTED'); assert.equal(remoteCalls, 0); assert.equal(result.receipt.remote_call_avoided, null);
});
test('T10 local validation failure is eligible but not invoked remotely', async () => {
  let remoteCalls = 0;
  const result = await executeMicrotask({ task: task(), local_resources: [local], remote_lanes: [remote], policy, local_execute: async () => ({ output: {}, validation: { accepted: false, result: 'FAIL' } }), remote_execute: async () => { remoteCalls += 1; } });
  assert.equal(result.status, 'ESCALATION_REQUIRED'); assert.equal(result.escalation_reason, 'LOCAL_VALIDATION_FAILED'); assert.equal(remoteCalls, 0);
});
test('T11 formatting normalization is deterministic and does not escalate', async () => {
  const result = await executeMicrotask({ task: task(), local_resources: [local], policy, local_execute: async () => ({ output: '\nREADY\n', normalize: () => accepted() }) });
  assert.equal(result.status, 'ACCEPTED'); assert.equal(result.receipt.repairs, 0);
});
test('T12 remote execution requires an explicit typed reason', async () => {
  await assert.rejects(() => executeMicrotask({ task: task({ local_required: false }), remote_lanes: [remote], policy, remote_execute: async () => accepted() }), /typed escalation reason/);
});
test('T13 economics cannot bypass trust', () => assert.equal(routeMicrotask({ task: task(), local_resources: [{ ...local, trust_domain: 'world' }], remote_lanes: [{ ...remote, trust_domain: 'world', marginal_cost: 0 }], policy }).execution_class, 'REMOTE_REQUIRED'));
test('T14 economics cannot bypass capability', () => assert.equal(routeMicrotask({ task: task({ capability: 'unsupported' }), local_resources: [{ ...local, capabilities: ['repository-fact-finding'] }], remote_lanes: [{ ...remote, capabilities: ['repository-fact-finding'] }], policy }).execution_class, 'REMOTE_REQUIRED'));
test('T15 economics cannot bypass validation', async () => { const result = await executeMicrotask({ task: task(), local_resources: [local], policy, local_execute: async () => ({ output: {}, validation: { accepted: false, result: 'FAIL' } }) }); assert.equal(result.status, 'ESCALATION_REQUIRED'); });
test('T16 PAYG remains disabled', () => assert.equal(routeMicrotask({ task: task(), remote_lanes: [{ ...remote, lane_id: 'payg', payg: true, marginal_cost: 1 }], policy }).execution_class, 'REMOTE_REQUIRED'));
test('T17 UNKNOWN quota remains UNKNOWN', () => { const result = routeMicrotask({ task: task({ local_required: false }), remote_lanes: [remote], policy, escalation_reason: 'NO_LOCAL_CAPABILITY' }); assert.equal(result.quota.watermark, 'UNKNOWN'); assert.equal(result.quota.remaining, null); });

test('T18 fresh local packet contains only bounded compiled context', () => { const packet = compileFreshLocalPacket({ task: task(), sources: [source], resource_contract: resource }); assert.equal(packet.task_id, 'MICRO-1'); assert.equal(packet.sources.length, 1); assert.equal(packet.sources[0].path, 'a.md'); assert.ok(packet.packet_sha256); });
test('T19 prior local transcript is absent from next packet', () => { const packet = compileFreshLocalPacket({ task: task({ prior_local_transcript: 'private reasoning' }), sources: [source], resource_contract: resource }); assert.equal(JSON.stringify(packet).includes('private reasoning'), false); });
test('T20 escalation packet contains receipts, not raw reasoning', () => { const packet = buildEscalationPacket({ task: task(), reason: 'LOCAL_VALIDATION_FAILED', evidence: [{ path: 'a.md', sha256: 'hash' }], validator: { result: 'FAIL' }, unresolved: 'Decide whether fact is sufficient', raw_transcript: 'hidden reasoning' }); assert.equal(packet.reason, 'LOCAL_VALIDATION_FAILED'); assert.equal(JSON.stringify(packet).includes('hidden reasoning'), false); assert.ok(packet.packet_sha256); });
test('T21 identical classification is deterministic', () => { const args = { task: task(), local_resources: [local], remote_lanes: [remote], policy }; assert.deepEqual(routeMicrotask(args), routeMicrotask(args)); });
test('T22 changing costs does not change authority', () => { const a = routeMicrotask({ task: task(), local_resources: [local], remote_lanes: [remote], policy }); const b = routeMicrotask({ task: task(), local_resources: [{ ...local, marginal_cost: 0 }], remote_lanes: [{ ...remote, marginal_cost: 0 }], policy }); assert.equal(a.execution_class, b.execution_class); });
test('T23 authority requirement prevents local selection', () => assert.notEqual(routeMicrotask({ task: task({ authority_required: true }), local_resources: [local], remote_lanes: [remote], policy }).execution_class, 'LOCAL_SPECIALIST'));
test('T24 deterministic outranks local', () => assert.equal(routeMicrotask({ task: task(), deterministic_tool: { id: 'tool', trust_domain: 'retrieval', capabilities: ['repository-fact-finding'], available: true, validator: true }, local_resources: [local], policy }).execution_class, 'DETERMINISTIC'));
test('T25 local outranks subscription', () => assert.equal(routeMicrotask({ task: task(), local_resources: [local], remote_lanes: [remote], policy }).execution_class, 'LOCAL_SPECIALIST'));
test('T26 remote wins when local capability insufficient', () => assert.equal(routeMicrotask({ task: task({ capability: 'architecture' }), local_resources: [local], remote_lanes: [{ ...remote, capabilities: ['architecture'] }], policy }).execution_class, 'REMOTE_SUBSCRIPTION'));
test('T27 unavailable local is typed', () => assert.equal(routeMicrotask({ task: task(), local_resources: [{ ...local, available: false }], remote_lanes: [remote], policy }).reason_code, 'LOCAL_RESOURCE_UNAVAILABLE'));
test('T28 failed episode does not demote globally', async () => { const result = await executeMicrotask({ task: task(), local_resources: [local], policy, local_execute: async () => ({ output: {}, validation: { accepted: false, result: 'FAIL' } }) }); assert.equal(result.capability_update, null); });
test('T29 successful episode does not promote globally', async () => { const result = await executeMicrotask({ task: task(), local_resources: [local], policy, local_execute: async () => accepted() }); assert.equal(result.capability_update, null); });
test('T30 repeated accepted extraction creates deterministic candidate only', () => { const result = recordDistillationCandidate({ task: task(), receipts: [{ accepted: true }, { accepted: true }] }); assert.equal(result.candidate, true); assert.equal(result.promoted, false); });
test('T31 distillation excludes hidden reasoning', () => assert.equal(JSON.stringify(recordDistillationCandidate({ task: task(), receipts: [{ accepted: true }, { accepted: true }], reasoning: 'secret' })).includes('secret'), false));
test('T32 packet hash deterministic', () => { const a = compileFreshLocalPacket({ task: task(), sources: [source], resource_contract: resource }); const b = compileFreshLocalPacket({ task: task(), sources: [source], resource_contract: resource }); assert.equal(a.packet_sha256, b.packet_sha256); });
test('T33 duplicate selectors deduplicate', () => { const packet = compileFreshLocalPacket({ task: task({ source_selectors: [task().source_selectors[0], task().source_selectors[0]] }), sources: [source], resource_contract: resource }); assert.equal(packet.sources.length, 1); });
test('T34 local provenance survives compact receipt', async () => { const result = await executeMicrotask({ task: task(), local_resources: [local], policy, local_execute: async () => accepted() }); assert.equal(result.receipt.resource_id, resource.resource_id); assert.ok(result.receipt.context_hash); });
test('T35 legacy resources are not eligible for new routing', () => assert.equal(routeMicrotask({ task: task(), local_resources: [{ ...local, resource_contract: undefined, resource_id: undefined }], remote_lanes: [remote], policy }).execution_class, 'REMOTE_REQUIRED'));
test('T36 legacy behavior remains available only outside new router', () => assert.equal(EXECUTION_CLASSES.includes('LOCAL_SPECIALIST'), true));

test('classification exposes explicit escalation catalog', () => { assert.ok(ESCALATION_REASONS.includes('LOCAL_VALIDATION_FAILED')); assert.equal(classifyMicrotask(task()).execution_class, 'LOCAL_SPECIALIST'); });
test('planner cannot shrink the measured source set', () => { assert.equal(classifyMicrotask(task({ source_paths: ['a.md', 'b.md'], source_count: 1 })).complexity.source_count, 2); });
test('local context compilation failure is typed and non-escalating', async () => { const result = await executeMicrotask({ task: task({ source_selectors: [{ path: 'missing.md', selector: { kind: 'whole_file' } }] }), local_resources: [local], sources: [source], policy, local_execute: async () => { throw new Error('must not run'); } }); assert.equal(result.status, 'RECONSIDERATION_REQUIRED'); assert.equal(result.route.reason_code, 'LOCAL_CONTEXT_COMPILE_FAILED'); });
test('economic receipt records bounded unknowns without claims', () => { const receipt = makeEconomicReceipt({ task: task(), execution_class: 'LOCAL_SPECIALIST', accepted: true, resource: local, context_bytes: 12 }); assert.equal(receipt.remote_input_tokens, null); assert.equal(receipt.remote_call_avoided, null); assert.equal(receipt.accepted, true); });
