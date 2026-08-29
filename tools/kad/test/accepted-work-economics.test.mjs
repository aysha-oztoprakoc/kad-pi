import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { normalizeEconomicReceipt, deriveEconomicMetrics, compareEconomicEpisodes, shadowRecommend, createDistillationCandidateReceipt, replayEconomicReceipt, attachEconomicReceipt } from '../accepted-work-economics.mjs';
import { createEpisode, validateEpisode } from '../episode.mjs';
import { createEconomicPolicy, routeEconomically } from '../economic-router.mjs';
import { CapabilityRegistry } from '../local-router.mjs';
import { executeSwarm } from '../swarm.mjs';

const base = { task_id: 'TASK-1', episode_id: 'EP-1', semantic_role: 'controller', provider: 'openrouter', model: 'model-a', execution_class: 'REMOTE_SUBSCRIPTION', trust_domain: 'retrieval', capability: 'structured-extraction', equivalence_key: 'retrieval/structured-extraction/fact', billing_class: 'SUBSCRIPTION_BACKED', usage: { input_tokens: 100, cached_input_tokens: 20, output_tokens: 30 }, performance: { latency_ms: 500 }, validation: 'PASS', acceptance_authority: 'KAD_VALIDATOR', accepted: true, repairs: 1, escalations: 0, quota_snapshot: { status: 'UNKNOWN', windows: [{ window_id: 'monthly', unit: 'USD', remaining: null }] } };

// T1
test('T1 provider metadata normalizes into one canonical economic receipt', () => { const r = normalizeEconomicReceipt(base); assert.equal(r.usage.input_tokens, 100); assert.equal(r.usage.output_tokens, 30); assert.equal(r.usage.total_tokens, 130); assert.equal(r.quality.accepted, true); assert.equal(r.schema_version, 'kad-economic-1'); });
// T2
test('T2 missing usage remains null rather than zero', () => { const r = normalizeEconomicReceipt({ ...base, usage: {} }); assert.equal(r.usage.input_tokens, null); assert.equal(r.usage.output_tokens, null); assert.equal(r.usage.total_tokens, null); });
// T3
test('T3 subscription billing does not acquire API list price', () => { const r = normalizeEconomicReceipt({ ...base, billing_class: 'SUBSCRIPTION_BACKED', provider_reported_cost: null, list_price: 0.02 }); assert.equal(r.economics.provider_reported_cost, null); assert.equal(r.economics.cost_unit, null); });
// T4
test('T4 cost requires provider-reported provenance', () => { const rejected = normalizeEconomicReceipt({ ...base, provider_reported_cost: 1.2 }); const accepted = normalizeEconomicReceipt({ ...base, provider_reported_cost: 1.2, cost_provenance: 'PROVIDER_REPORTED', cost_unit: 'USD' }); assert.equal(rejected.economics.provider_reported_cost, null); assert.equal(accepted.economics.provider_reported_cost, 1.2); });
// T5
test('T5 model success cannot grant KAD acceptance', () => { const r = normalizeEconomicReceipt({ ...base, accepted: true, acceptance_authority: null, validation: 'UNKNOWN' }); assert.equal(r.quality.accepted, false); });
// T6
test('T6 accepted token metrics require observed usage and acceptance', () => { const r = normalizeEconomicReceipt(base); assert.equal(deriveEconomicMetrics([r]).accepted_remote_tokens, 130); assert.equal(deriveEconomicMetrics([normalizeEconomicReceipt({ ...base, usage: {} })]).accepted_remote_tokens, null); });
// T7
test('T7 rejected work remains in resource accounting', () => { const r = normalizeEconomicReceipt({ ...base, accepted: false, acceptance_authority: 'KAD_VALIDATOR', validation: 'FAIL' }); const m = deriveEconomicMetrics([r]); assert.equal(m.remote_tokens, 130); assert.equal(m.accepted_episode_count, 0); });
// T8
test('T8 repair amplification counts every justified retry', () => { const r = normalizeEconomicReceipt({ ...base, repairs: 2 }); assert.equal(deriveEconomicMetrics([r]).repair_amplification, 3); });
// T9
test('T9 receipts exclude hidden reasoning traces', () => { const r = normalizeEconomicReceipt({ ...base, reasoning_trace: 'secret chain of thought', output: 'accepted artifact' }); assert.equal(r.reasoning_trace, undefined); assert.equal(r.provenance.reasoning_trace, undefined); });
// T10
test('T10 economic core has no provider parser branches', () => { const source = readFileSync(new URL('../accepted-work-economics.mjs', import.meta.url), 'utf8'); assert.doesNotMatch(source, /parse(OpenAi|OpenRouter|GitHub)|openai-codex|openrouter|github-copilot/); });
// T11
test('T11 native cost and token units remain separate', () => { const r = normalizeEconomicReceipt({ ...base, usage: { input_tokens: 10, output_tokens: 5 }, provider_reported_cost: 2, cost_provenance: 'PROVIDER_REPORTED', cost_unit: 'USD' }); assert.equal(r.usage.total_tokens, 15); assert.equal(r.economics.cost_unit, 'USD'); assert.notEqual(r.economics.cost_unit, 'tokens'); });
// T12
test('T12 equivalent accepted episodes can dominate', () => { const a = normalizeEconomicReceipt({ ...base, episode_id: 'A', usage: { input_tokens: 100, output_tokens: 20 }, repairs: 0, performance: { latency_ms: 100 } }); const b = normalizeEconomicReceipt({ ...base, episode_id: 'B', usage: { input_tokens: 180, output_tokens: 40 }, repairs: 1, performance: { latency_ms: 200 } }); assert.equal(compareEconomicEpisodes(a, b).result, 'DOMINATES'); });
// T13
test('T13 different task classes are incomparable', () => { const a = normalizeEconomicReceipt(base); const b = normalizeEconomicReceipt({ ...base, episode_id: 'B', equivalence_key: 'engineering/code-modification' }); assert.equal(compareEconomicEpisodes(a, b).result, 'INCOMPARABLE'); });
// T14
test('T14 sparse evidence is insufficient', () => { const a = normalizeEconomicReceipt({ ...base, usage: {} }); const b = normalizeEconomicReceipt({ ...base, episode_id: 'B', usage: { input_tokens: 10, output_tokens: 2 } }); assert.equal(compareEconomicEpisodes(a, b).result, 'INSUFFICIENT_EVIDENCE'); });
// T15
test('T15 shadow recommendation cannot mutate actual route', () => { const actual = normalizeEconomicReceipt(base); const before = JSON.stringify(actual); const result = shadowRecommend({ actual, alternatives: [] }); assert.equal(result.recommendation, 'INSUFFICIENT_EVIDENCE'); assert.equal(JSON.stringify(actual), before); });
// T16
test('T16 repeated validated expensive work creates a candidate only', () => { const result = createDistillationCandidateReceipt({ receipts: [base, { ...base, episode_id: 'EP-2' }], repetition_threshold: 2 }); assert.equal(result.distillation_candidate, true); assert.equal(result.promoted, false); });
// T17
test('T17 failed work never creates a positive distillation candidate', () => { const result = createDistillationCandidateReceipt({ receipts: [{ ...base, accepted: false, validation: 'FAIL' }, { ...base, episode_id: 'EP-2' }] }); assert.equal(result.distillation_candidate, false); });
// T18
test('T18 normalized receipt replay is deterministic', () => { const a = normalizeEconomicReceipt(base); const b = replayEconomicReceipt(JSON.parse(JSON.stringify(a))); assert.deepEqual(a, b); });
// T19
test('T19 telemetry cannot authorize PAYG', () => { const r = normalizeEconomicReceipt({ ...base, billing_class: 'PAYG', provider_reported_cost: 0, cost_provenance: 'PROVIDER_REPORTED' }); const route = routeEconomically({ requirement: { trust_domain: 'retrieval', capabilities: ['x'] }, lanes: [{ lane_id: 'payg', execution_class: 'REMOTE_STRONG', trust_domain: 'retrieval', capabilities: ['x'], payg: true, quota: { status: 'KNOWN', unit: 'USD', remaining: 100, capacity: 100 } }], policy: createEconomicPolicy({ now: Date.now() }) }); assert.equal(r.quality.accepted, true); assert.equal(route.status, 'DEGRADED'); });
// T20
test('T20 telemetry normalization has no request executor', () => { const source = readFileSync(new URL('../accepted-work-economics.mjs', import.meta.url), 'utf8'); assert.doesNotMatch(source, /fetch\(|spawn\(|execFile|\.prompt\(|\.steer\(/); });
// T21
test('T21 context fields preserve null versus observed zero', () => { const r = normalizeEconomicReceipt({ ...base, context: { compiled_context_bytes: 0, input_tokens: null } }); assert.equal(r.performance.compiled_context_bytes, 0); assert.equal(r.usage.input_tokens, 100); const empty = normalizeEconomicReceipt({ ...base, usage: {}, context: {} }); assert.equal(empty.performance.compiled_context_bytes, null); });
// T22
test('T22 quota snapshot is linked immutably', () => { const r = normalizeEconomicReceipt(base); assert.equal(r.economics.quota_snapshot_id.length, 64); assert.deepEqual(r.economics.quota_state, base.quota_snapshot); });
// T23
test('T23 cache metadata stays provider-scoped and does not claim savings', () => { const r = normalizeEconomicReceipt({ ...base, cache: { status: 'HIT', provider: 'openrouter', saved_cost: 4 } }); assert.deepEqual(r.economics.cache, { status: 'HIT', provider: 'openrouter' }); assert.equal(r.economics.provider_reported_cost, null); });
// T24
test('T24 attaching receipt preserves episode authority boundaries', () => { const episode = createEpisode({ episode_id: 'EP-1', task: { task_id: 'TASK-1' }, resolution: { selected_execution_class: 'LOCAL_SPECIALIST' }, validation: { result: 'PASS' }, outcome: { accepted: true } }); const attached = attachEconomicReceipt(episode, normalizeEconomicReceipt(base)); assert.equal(validateEpisode(attached).valid, true); assert.equal(attached.economics.economic_receipt.quality.accepted, true); assert.equal(attached.reasoning, undefined); });
test('T25 swarm attaches passive remote telemetry to the accepted episode', async () => { const registry = new CapabilityRegistry(); registry.register({ id: 'local-worker', local: true, priority: 1, context_window: 100, trust_domain: 'retrieval', capabilities: ['repository-fact-finding'], available: true }); const source = { path: 'receipt.md', content: 'Observed receipt fact.' }; const request = { task_id: 'RECEIPT-SWARM-1', role: 'local_retrieval', trust_domain: 'retrieval', capability: 'repository-fact-finding', question: 'What fact?', source_paths: ['receipt.md'], max_facts: 1 }; const controller = { lanes: [{ role: 'controller', id: 'fixture-controller', provider: 'fixture-remote', model: 'fixture-model', approved: true, payg: false, billing_class: 'SUBSCRIPTION_BACKED', available: true, quota_snapshot: { status: 'UNKNOWN', windows: [{ window_id: 'daily', unit: 'USD', remaining: null }] } }], execute: async () => ({ plan: { source_paths: ['receipt.md'], question: 'What fact?', max_facts: 1 }, telemetry: { input_tokens: 4, output_tokens: 2 } }), consume: async () => ({ consumed: true, telemetry: { input_tokens: 3, output_tokens: 1 } }) }; const result = await executeSwarm({ request, sources: [source], controller, registry, worker: { resource_id: 'local-worker', execute: async packet => ({ output: { task_id: packet.task_id, facts: [{ claim: 'Observed receipt fact.', source_path: 'receipt.md', evidence: 'Observed receipt fact.' }], unknowns: [], conflicts: [] } }) } }); assert.equal(result.status, 'ACCEPTED'); assert.equal(result.episode.economics.economic_receipt.usage.total_tokens, 10); assert.equal(result.episode.economics.economic_receipt.quality.accepted, true); assert.equal(result.episode.economics.economic_receipt.quality.accepted_artifact_hash.length, 64); assert.equal(result.episode.economics.economic_receipt.provenance.provider_metadata_observed, true); assert.equal(result.episode.economics.economic_receipt.economics.quota_snapshot_id.length, 64); assert.equal(result.episode.economics.economic_receipt.economics.provider_reported_cost, null); });
