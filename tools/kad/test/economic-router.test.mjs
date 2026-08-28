import assert from 'node:assert/strict';
import test from 'node:test';
import { EXECUTION_CLASSES, createEconomicPolicy, normalizeLane, routeEconomically, quotaNotification } from '../economic-router.mjs';
import { WATERMARKS, normalizeQuota } from '../quota-state.mjs';
import { createTaskBudget, recordModelCall } from '../task-budget.mjs';
import { createStageTelemetry, finishStageTelemetry, recordStage } from '../telemetry.mjs';

const now = Date.parse('2026-08-28T00:00:00Z');
const requirement = { trust_domain: 'retrieval', capabilities: ['structured-extraction'], min_context: 100 };
const lane = (overrides = {}) => ({ lane_id: 'lane', execution_class: 'REMOTE_FREE', billing_class: 'FREE_RECURRING', available: true, authority_compatible: true, trust_domain: 'retrieval', capabilities: ['structured-extraction'], context_window: 2048, marginal_cost: 0, payg: false, quota: { status: 'KNOWN', unit: 'percent', remaining: 80, capacity: 100, observed_at: now, source: 'fixture' }, ...overrides });
const policy = createEconomicPolicy({ now, quota: { stale_ttl_ms: 86400000, expiring_window_ms: 86400000, green_min_fraction: 0.5, yellow_min_fraction: 0.25 }, spend: { payg_authorized: false, allow_paid_fallback: false, allow_auto_topup: false, max_incremental_cost: 0 } });

// T1
 test('T1 deterministic sufficient capability outranks every model lane', () => { const r = routeEconomically({ requirement, lanes: [lane({ lane_id: 'remote', execution_class: 'REMOTE_FREE' }), lane({ lane_id: 'det', execution_class: 'DETERMINISTIC_EXISTING', deterministic: true })], policy, now }); assert.equal(r.selected_lane, 'det'); });
// T2
 test('T2 exact trust-domain mismatch is excluded regardless of price', () => { const r = routeEconomically({ requirement, lanes: [lane({ trust_domain: 'world', marginal_cost: 0 })], policy, now }); assert.equal(r.status, 'DEGRADED'); assert.ok(r.rejections.some(x => x.reason === 'TRUST_DOMAIN_MISMATCH')); });
// T3
 test('T3 proven local capability outranks remote inference', () => { const r = routeEconomically({ requirement, lanes: [lane({ lane_id: 'remote', execution_class: 'REMOTE_FREE' }), lane({ lane_id: 'local', execution_class: 'LOCAL_SPECIALIST', local: true, proven: true })], policy, now }); assert.equal(r.selected_lane, 'local'); });
// T4
 test('T4 recurring free remote beats ordinary subscription remote', () => { const r = routeEconomically({ requirement, lanes: [lane({ lane_id: 'sub', execution_class: 'REMOTE_SUBSCRIPTION', billing_class: 'SUBSCRIPTION' }), lane({ lane_id: 'free', execution_class: 'REMOTE_FREE' })], policy, now }); assert.equal(r.selected_lane, 'free'); });
// T5
 test('T5 expiring healthy subscription may outrank ordinary free queued work', () => { const reset = now + 3600000; const r = routeEconomically({ requirement, queued_work: true, lanes: [lane({ lane_id: 'free', execution_class: 'REMOTE_FREE' }), lane({ lane_id: 'expiring', execution_class: 'REMOTE_SUBSCRIPTION', quota: { status: 'KNOWN', unit: 'percent', remaining: 80, capacity: 100, reset_at: reset, observed_at: now, source: 'fixture' } })], policy, now }); assert.equal(r.selected_lane, 'expiring'); assert.ok(r.reason_codes.includes('USE_IT_OR_LOSE_IT_QUOTA')); });
// T6
 test('T6 RED subscription loses to healthy equivalent free lane', () => { const r = routeEconomically({ requirement, lanes: [lane({ lane_id: 'red', execution_class: 'REMOTE_SUBSCRIPTION', quota: { status: 'KNOWN', unit: 'percent', remaining: 10, capacity: 100, observed_at: now, source: 'fixture' } }), lane({ lane_id: 'free', execution_class: 'REMOTE_FREE' })], policy, now }); assert.equal(r.selected_lane, 'free'); });
// T7
 test('T7 unknown quota remains UNKNOWN and never fabricates capacity', () => { const x = normalizeLane(lane({ quota: { status: 'UNKNOWN', unit: 'tokens', remaining: null, capacity: null } }), policy, now); assert.equal(x.quota.status, 'UNKNOWN'); assert.equal(x.quota.remaining, null); assert.equal(x.quota.watermark, 'UNKNOWN'); });
// T8
 test('T8 old quota observation becomes STALE', () => { const q = normalizeQuota({ status: 'KNOWN', unit: 'percent', remaining: 90, capacity: 100, observed_at: now - 90000000 }, policy.quota, now); assert.equal(q.watermark, 'STALE'); });
// T9
 test('T9 PAYG candidate is rejected while spend is disabled', () => { const r = routeEconomically({ requirement, lanes: [lane({ payg: true, marginal_cost: 0.01 })], policy, now }); assert.equal(r.status, 'DEGRADED'); assert.ok(r.rejections.some(x => x.reason === 'PAYG_NOT_AUTHORIZED')); });
// T10
 test('T10 exhausted free quota does not silently select PAYG', () => { const r = routeEconomically({ requirement, lanes: [lane({ lane_id: 'exhausted', quota: { status: 'KNOWN', unit: 'tokens', remaining: 0, capacity: 100, observed_at: now } }), lane({ lane_id: 'payg', payg: true, marginal_cost: 1 })], policy, now }); assert.equal(r.status, 'DEGRADED'); assert.ok(r.rejections.some(x => x.reason === 'QUOTA_EXHAUSTED')); assert.ok(r.rejections.some(x => x.reason === 'PAYG_NOT_AUTHORIZED')); });
// T11
 test('T11 unsupported capability degrades', () => assert.equal(routeEconomically({ requirement: { ...requirement, capabilities: ['code-modification'] }, lanes: [lane()], policy, now }).status, 'DEGRADED'));
// T12
 test('T12 task budget prevents excess model calls', () => { const b = createTaskBudget({ max_model_calls: 1, max_repairs: 0 }); assert.equal(recordModelCall(b).allowed, true); assert.equal(recordModelCall(b).allowed, false); });
// T13
 test('T13 repair budget remains bounded', () => { const b = createTaskBudget({ max_model_calls: 3, max_repairs: 1 }); assert.equal(recordModelCall(b, { repair: true }).allowed, true); assert.equal(recordModelCall(b, { repair: true }).allowed, false); });
// T14
 test('T14 malformed result is not an economic acceptance signal', () => { const r = routeEconomically({ requirement, lanes: [lane({ performance: { accepted_tasks: 0, rejected_tasks: 2 } })], policy, now }); assert.notEqual(r.selected_lane, undefined); assert.equal(r.acceptance, undefined); });
// T15
 test('T15 provider identity does not grant authority', () => { const r = routeEconomically({ requirement, lanes: [lane({ lane_id: 'trusted-name', provider: 'trusted-name', authority_compatible: false })], policy, now }); assert.equal(r.status, 'DEGRADED'); assert.ok(r.rejections.some(x => x.reason === 'AUTHORITY_INCOMPATIBLE')); });
// T16
 test('T16 Stheno WORLD lane cannot satisfy retrieval', () => { const r = routeEconomically({ requirement, lanes: [lane({ provider: 'kad-local-world', trust_domain: 'world' })], policy, now }); assert.equal(r.status, 'DEGRADED'); });
// T17
 test('T17 Qwen lane is bounded to promoted capabilities', () => { const r = normalizeLane(lane({ provider: 'kad-local-qwen', capabilities: ['repository-fact-finding', 'structured-extraction'], execution_class: 'LOCAL_SPECIALIST' }), policy, now); assert.deepEqual(r.capabilities, ['repository-fact-finding', 'structured-extraction']); });
// T18
 test('T18 economic observation can be attached to route', () => { const r = routeEconomically({ requirement, lanes: [lane()], policy, now }); assert.equal(r.observation.watermark, 'GREEN'); assert.equal(r.observation.quota_unit, 'percent'); });
// T19
 test('T19 same normalized input replays identically', () => { const args = { requirement, lanes: [lane({ lane_id: 'b' }), lane({ lane_id: 'a' })], policy, now }; assert.deepEqual(routeEconomically(args), routeEconomically(args)); });
// T20
 test('T20 quota watermark change emits only the affected decision path', () => { const before = normalizeLane(lane({ lane_id: 'a' }), policy, now); const after = normalizeLane(lane({ lane_id: 'a', quota: { status: 'KNOWN', unit: 'percent', remaining: 10, capacity: 100, observed_at: now } }), policy, now); const event = quotaNotification(before, after); assert.equal(event.type, 'quota.watermark.changed'); assert.deepEqual(event.affected_lane_ids, ['a']); });

 test('execution classes and stage telemetry are explicit', () => { assert.ok(EXECUTION_CLASSES.includes('LOCAL_TINY_SPECIALIST')); const t = createStageTelemetry(); recordStage(t, 'normalize_ms', 2); finishStageTelemetry(t, 10); assert.equal(t.normalize_ms, 2); assert.equal(t.total_ms, 10); assert.equal(Object.values(WATERMARKS).length, 6); });
