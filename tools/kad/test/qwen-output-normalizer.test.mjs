import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeWorkerOutput } from '../swarm.mjs';
import { compileTaskPacket, executeSwarm } from '../swarm.mjs';
import { CapabilityRegistry } from '../local-router.mjs';

const packet = compileTaskPacket({ task_id: 'R1-001', role: 'local_retrieval', trust_domain: 'retrieval', capability: 'repository-fact-finding', question: 'fact', source_paths: ['fixture.md'], max_facts: 1 }, [{ path: 'fixture.md', content: 'Exact fact.' }]);
const valid = { task_id: 'R1-001', facts: [{ claim: 'Exact fact.', source_path: 'fixture.md', evidence: 'Exact fact.' }], unknowns: [], conflicts: [] };

// T1 exact JSON
 test('T1 exact JSON passes unchanged', () => { const raw = JSON.stringify(valid); const result = normalizeWorkerOutput(raw); assert.equal(result.success, true); assert.equal(result.classification, 'VALID_JSON'); assert.equal(result.changed, false); assert.deepEqual(result.value, valid); });
// T2 fenced JSON
 test('T2 fenced JSON is recovered deterministically', () => { const result = normalizeWorkerOutput('```json\n' + JSON.stringify(valid) + '\n```'); assert.equal(result.success, true); assert.equal(result.classification, 'FENCED_JSON'); assert.deepEqual(result.value, valid); });
// T3 whitespace
 test('T3 surrounding whitespace is harmless', () => { const result = normalizeWorkerOutput(`  \n${JSON.stringify(valid)}\n  `); assert.equal(result.success, true); assert.equal(result.classification, 'WHITESPACE'); });
// T4 unique harmless wrapper
 test('T4 one unique wrapped JSON object is recovered', () => { const result = normalizeWorkerOutput(`Result:\n${JSON.stringify(valid)}\nDone.`); assert.equal(result.success, true); assert.equal(result.classification, 'UNIQUE_WRAPPED_JSON'); });
// T5 multiple candidates
 test('T5 multiple JSON objects fail closed', () => { const result = normalizeWorkerOutput(`${JSON.stringify(valid)}\n${JSON.stringify(valid)}`); assert.equal(result.success, false); assert.equal(result.classification, 'MULTIPLE_JSON_VALUES'); });
// T6 truncated JSON
 test('T6 truncated JSON fails closed', () => { const result = normalizeWorkerOutput('{"task_id":"R1-001","facts":['); assert.equal(result.success, false); assert.equal(result.classification, 'TRUNCATED_JSON'); });
// T7 wrong semantic key
 test('T7 wrong semantic key is not repaired by normalization', () => { const wrong = { ...valid, facts: [{ rule: 'Exact fact.', source_path: 'fixture.md', evidence: 'Exact fact.' }] }; const result = normalizeWorkerOutput(JSON.stringify(wrong)); assert.deepEqual(result.value, wrong); assert.equal(result.success, true); });
// T8 missing required field
 test('T8 missing required field is not invented', () => { const { conflicts, ...missing } = valid; const result = normalizeWorkerOutput(JSON.stringify(missing)); assert.equal(result.value.conflicts, undefined); });
// T9 unsupported source
 test('T9 normalization cannot bypass source validation', () => { const output = { ...valid, facts: [{ ...valid.facts[0], source_path: 'outside.md', evidence: 'Exact fact.' }] }; const result = normalizeWorkerOutput(JSON.stringify(output)); assert.equal(result.success, true); assert.equal(result.value.facts[0].source_path, 'outside.md'); });
// T10 task mismatch
 test('T10 normalization cannot modify task ID', () => { const output = { ...valid, task_id: 'OTHER' }; assert.equal(normalizeWorkerOutput(JSON.stringify(output)).value.task_id, 'OTHER'); });
// T11 trust-domain mismatch
 test('T11 normalization cannot modify trust claims', () => { const output = { ...valid, facts: [{ ...valid.facts[0], claim: 'WORLD satisfies RETRIEVAL.' }] }; assert.equal(normalizeWorkerOutput(JSON.stringify(output)).value.facts[0].claim, 'WORLD satisfies RETRIEVAL.'); });
// T12 visible reasoning wrapper
 test('T12 visible reasoning is excluded while unique JSON continues', () => { const result = normalizeWorkerOutput(`<think>private reasoning</think>\n${JSON.stringify(valid)}`); assert.equal(result.success, true); assert.equal(result.reasoning_wrapper_detected, true); assert.equal(result.value.reasoning, undefined); });
// T13 repair suppression
 test('T13 deterministic recovery suppresses model repair', async () => {
  const controller = { lanes: [{ role: 'controller', id: 'c', provider: 'p', model: 'm', approved: true, payg: false, billing_class: 'SUBSCRIPTION_BACKED', available: true }], execute: async request => ({ plan: { capability: request.capability, source_paths: request.source_paths, question: request.question, max_facts: request.max_facts }, telemetry: { input_tokens: 1, output_tokens: 1 } }) };
  const registry = new CapabilityRegistry(); registry.register({ id: 'qwen', local: true, trust_domain: 'retrieval', capabilities: ['repository-fact-finding'], context_window: 2048, available: true });
  let calls = 0; const result = await executeSwarm({ request: { task_id: 'R1-001', role: 'local_retrieval', trust_domain: 'retrieval', capability: 'repository-fact-finding', question: 'fact', source_paths: ['fixture.md'] }, sources: [{ path: 'fixture.md', content: 'Exact fact.' }], controller, registry, worker: { resource_id: 'qwen', execute: async () => { calls++; return { output: `Result:\n${JSON.stringify(valid)}` }; } } });
  assert.equal(result.status, 'ACCEPTED'); assert.equal(calls, 1); assert.equal(result.telemetry.repairs, 0); assert.equal(result.telemetry.deterministic_normalization_successes, 1); assert.equal(result.telemetry.normalization_history[0].classification, 'UNIQUE_WRAPPED_JSON');
 });
// T14 semantic failure retains bounded repair
 test('T14 semantic failure retains maximum-one model repair', async () => {
  const controller = { lanes: [{ role: 'controller', id: 'c', provider: 'p', model: 'm', approved: true, payg: false, billing_class: 'SUBSCRIPTION_BACKED', available: true }], execute: async request => ({ plan: { capability: request.capability, source_paths: request.source_paths, question: request.question, max_facts: request.max_facts }, telemetry: {} }) };
  const registry = new CapabilityRegistry(); registry.register({ id: 'qwen', local: true, trust_domain: 'retrieval', capabilities: ['repository-fact-finding'], context_window: 2048, available: true });
  let calls = 0; const wrong = { task_id: 'R1-001', facts: [{ rule: 'wrong key', source_path: 'fixture.md', evidence: 'Exact fact.' }], unknowns: [], conflicts: [] }; const result = await executeSwarm({ request: { task_id: 'R1-001', role: 'local_retrieval', trust_domain: 'retrieval', capability: 'repository-fact-finding', question: 'fact', source_paths: ['fixture.md'] }, sources: [{ path: 'fixture.md', content: 'Exact fact.' }], controller, registry, worker: { resource_id: 'qwen', execute: async () => { calls++; return { output: JSON.stringify(wrong) }; } } });
  assert.equal(result.status, 'DEGRADED'); assert.equal(calls, 2); assert.equal(result.telemetry.repairs, 1); assert.equal(result.telemetry.model_repair_calls, 1); assert.equal(result.telemetry.normalization_history.length, 2);
 });
// T15 rejected economics
 test('T15 rejected normalized output remains economically counted', () => { const result = normalizeWorkerOutput('{"task_id":"R1-001","facts":['); assert.equal(result.raw_hash.length, 64); });
// T16 deterministic replay
 test('T16 same raw bytes replay identically', () => { const raw = `Result: ${JSON.stringify(valid)}`; assert.deepEqual(normalizeWorkerOutput(raw), normalizeWorkerOutput(raw)); });
// T17 no hidden CoT
 test('T17 normalization result does not retain reasoning text', () => { const result = normalizeWorkerOutput(`<think>do not retain this</think>${JSON.stringify(valid)}`); assert.equal(Object.hasOwn(result, 'raw'), false); assert.equal(Object.hasOwn(result, 'reasoning'), false); });
// T18 authority remains external
 test('T18 normalizer has no acceptance authority', () => { const result = normalizeWorkerOutput(JSON.stringify(valid)); assert.equal(result.accepted, undefined); assert.equal(result.value.accepted, undefined); });
// T19 frozen upstream resume avoids another controller call
 test('T19 frozen upstream resume avoids another controller call', async () => {
  let executeCalls = 0; let consumeCalls = 0;
  const controller = { lanes: [{ role: 'controller', id: 'c', provider: 'p', model: 'm', approved: true, payg: false, billing_class: 'SUBSCRIPTION_BACKED', available: true }], execute: async () => { executeCalls++; throw new Error('must not execute'); }, consume: async () => { consumeCalls++; throw new Error('must not consume'); } };
  const registry = new CapabilityRegistry(); registry.register({ id: 'qwen', local: true, trust_domain: 'retrieval', capabilities: ['repository-fact-finding'], context_window: 2048, available: true });
  const result = await executeSwarm({ request: { task_id: 'R1-001', role: 'local_retrieval', trust_domain: 'retrieval', capability: 'repository-fact-finding', question: 'fact', source_paths: ['fixture.md'] }, sources: [{ path: 'fixture.md', content: 'Exact fact.' }], controller, registry, resume: { controller_result: { plan: { capability: 'repository-fact-finding', source_paths: ['fixture.md'], question: 'fact', max_facts: 1 } }, telemetry: { controller_invocations: 1, input_tokens: 10, output_tokens: 8 }, skip_consumption: true }, worker: { resource_id: 'qwen', execute: async () => ({ output: JSON.stringify(valid) }) } });
  assert.equal(result.status, 'ACCEPTED'); assert.equal(executeCalls, 0); assert.equal(consumeCalls, 0); assert.equal(result.telemetry.new_remote_controller_calls, 0); assert.equal(result.telemetry.remote_input_tokens, 10); assert.equal(result.telemetry.controller_invocations, 1);
 });
// T20 non-allowlisted wrapper fails closed
 test('T20 arbitrary wrapper text is not allowlisted', () => { const result = normalizeWorkerOutput(`preamble ${JSON.stringify(valid)} trailing`); assert.equal(result.success, false); assert.equal(result.classification, 'WRAPPER_TEXT'); });
// T21 escaped JSON strings remain syntax-only recoverable
 test('T21 escaped quotes and braces are scanned without corruption', () => { const value = { ...valid, facts: [{ ...valid.facts[0], claim: 'quoted "value" {literal}' }] }; const result = normalizeWorkerOutput(`Result: ${JSON.stringify(value)}`); assert.equal(result.success, true); assert.equal(result.value.facts[0].claim, 'quoted "value" {literal}'); });
