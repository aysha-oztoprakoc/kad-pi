import assert from 'node:assert/strict';
import test from 'node:test';
import { CapabilityRegistry } from '../local-router.mjs';
import { canonicalSwarmReceipt, compileTaskPacket, executeSwarm, selectControllerLane, validateWorkerResult } from '../swarm.mjs';

const source = { path: 'fixture.md', content: '# KAD\nDeterministic routing is authoritative.\n' };
const request = { task_id: 'SWARM-TEST-001', role: 'local_retrieval', trust_domain: 'retrieval', capability: 'repository-fact-finding', question: 'What is authoritative?', source_paths: ['fixture.md'], max_facts: 1 };
function registry() {
  const r = new CapabilityRegistry();
  r.register({ id: 'kad-local-retrieval-amdy', local: true, priority: 1, context_window: 2048, trust_domain: 'retrieval', capabilities: ['repository-fact-finding'], available: true });
  r.register({ id: 'stheno-world', local: true, priority: 0, context_window: 4096, trust_domain: 'world', capabilities: ['repository-fact-finding'], available: true });
  return r;
}
function worker(packet) { return JSON.stringify({ task_id: packet.task_id, facts: [{ claim: 'Deterministic routing is authoritative.', source_path: 'fixture.md', evidence: 'Deterministic routing is authoritative.' }], unknowns: [], conflicts: [] }); }
const controller = { lanes: [{ role: 'controller', id: 'approved-controller', provider: 'approved', model: 'controller-v1', approved: true, payg: false, billing_class: 'SUBSCRIPTION_BACKED', available: true }], execute: async normalized => ({ plan: { capability: normalized.capability, source_paths: normalized.source_paths, question: normalized.question, max_facts: normalized.max_facts }, telemetry: { input_tokens: 10, output_tokens: 8, cost: null } }), consume: async () => ({ consumed: true, telemetry: { input_tokens: 3, output_tokens: 2, cost: null } }) };

// T1
 test('T1 resolves semantic controller without provider-bound policy', () => assert.equal(selectControllerLane(controller.lanes).selected_lane.role, 'controller'));
// T2
 test('T2 exact trust-domain isolation excludes WORLD', () => assert.equal(registry().choose({ trust_domain: 'engineering', capabilities: ['repository-fact-finding'] }).status, 'DEGRADED'));
// T3
 test('T3 compiles a bounded packet with hashes and only requested sources', () => { const packet = compileTaskPacket(request, [source]); assert.deepEqual(packet.sources.map(x => x.path), ['fixture.md']); assert.equal(packet.sources[0].sha256.length, 64); assert.equal(packet.limits.max_facts, 1); });
// T4
 test('T4 worker output is not accepted without deterministic validation', () => assert.equal(validateWorkerResult('{"task_id":"x","facts":[],"unknowns":[],"conflicts":[]}', compileTaskPacket(request, [source])).accepted, false));
// T5
 test('T5 bounded controller delegation reaches a validated local worker', async () => { const result = await executeSwarm({ request, sources: [source], controller, registry: registry(), worker: { resource_id: 'kad-local-retrieval-amdy', execute: async packet => ({ output: worker(packet), telemetry: { input_tokens: 40, output_tokens: 30, latency_ms: 2 } }) } }); assert.equal(result.status, 'ACCEPTED'); assert.equal(result.worker.provider, 'kad-local-retrieval-amdy'); assert.equal(result.controller.consumption.consumed, true); });
// T6
 test('T6 unsupported capability fails closed', async () => { const result = await executeSwarm({ request: { ...request, capability: 'code-modification' }, sources: [source], controller, registry: registry(), worker: { resource_id: 'kad-local-retrieval-amdy', execute: worker } }); assert.equal(result.status, 'DEGRADED'); assert.equal(result.failure_reason, 'UNSUPPORTED_LOCAL_CAPABILITY'); });
// T7
 test('T7 malformed worker output degrades without accepting', async () => { const result = await executeSwarm({ request, sources: [source], controller, registry: registry(), worker: { resource_id: 'kad-local-retrieval-amdy', execute: async () => ({ output: 'not-json' }) } }); assert.equal(result.status, 'DEGRADED'); assert.equal(result.validation.result, 'FAIL'); });
// T8
 test('T8 execution exposes bounded cleanup callback', async () => { let disposed = 0; const result = await executeSwarm({ request, sources: [source], controller, registry: registry(), worker: { resource_id: 'kad-local-retrieval-amdy', execute: async packet => ({ output: worker(packet), dispose: async () => { disposed++; } }) } }); await result.dispose(); assert.equal(disposed, 1); });
// T9
 test('T9 WORLD resource remains external to retrieval execution', async () => { const result = await executeSwarm({ request, sources: [source], controller, registry: registry(), worker: { resource_id: 'stheno-world', execute: worker } }); assert.equal(result.status, 'DEGRADED'); assert.equal(result.failure_reason, 'TRUST_DOMAIN_UNAVAILABLE'); });
// T10
 test('T10 telemetry includes route, worker, validation, and unknown economics', async () => { const result = await executeSwarm({ request, sources: [source], controller, registry: registry(), worker: { resource_id: 'kad-local-retrieval-amdy', execute: async packet => ({ output: worker(packet), telemetry: {} }) } }); assert.equal(result.telemetry.route.selected_lane.id, 'approved-controller'); assert.equal(result.telemetry.local_invocations, 1); assert.equal(result.telemetry.remote_cost, null); });
// T11
 test('T11 episode is observable and excludes hidden reasoning', async () => { const result = await executeSwarm({ request, sources: [source], controller, registry: registry(), worker: { resource_id: 'kad-local-retrieval-amdy', execute: async packet => ({ output: worker(packet) }) } }); assert.equal(result.episode.training_eligibility.eligible, false); assert.equal(result.episode.reasoning, undefined); });
// T12
 test('T12 canonical receipt replays identically', async () => { const result = await executeSwarm({ request, sources: [source], controller, registry: registry(), worker: { resource_id: 'kad-local-retrieval-amdy', execute: async packet => ({ output: worker(packet) }) } }); assert.equal(canonicalSwarmReceipt(result), canonicalSwarmReceipt(JSON.parse(JSON.stringify(result)))); });
// T13
 test('T13 unknown PAYG controller fails closed', () => assert.equal(selectControllerLane([{ role: 'controller', id: 'unknown-payg', approved: false, payg: true, available: true }]).status, 'DEGRADED'));
// T14
 test('T14 retries are bounded at one', async () => { const result = await executeSwarm({ request, sources: [source], max_repairs: 1, controller, registry: registry(), worker: { resource_id: 'kad-local-retrieval-amdy', execute: async () => ({ output: 'bad' }) } }); assert.equal(result.telemetry.repairs, 1); assert.equal(result.telemetry.escalations, 0); });
// T15
 test('T15 local capability loss degrades only retrieval', async () => { const r = registry(); r.setAvailability('kad-local-retrieval-amdy', false, 'disposed'); const result = await executeSwarm({ request, sources: [source], controller, registry: r, worker: { resource_id: 'kad-local-retrieval-amdy', execute: worker } }); assert.equal(result.status, 'DEGRADED'); assert.equal(r.snapshot().find(x => x.id === 'stheno-world').available, true); });
