import assert from 'node:assert/strict';
import test from 'node:test';
import { ProviderQuotaAdapter, normalizeRawProviderQuota, redactProviderOutput } from '../provider-quota-adapter.mjs';
import { createEconomicPolicy, normalizeLane, routeEconomically, quotaNotification } from '../economic-router.mjs';

const now = Date.parse('2026-08-28T00:00:00Z');
const policy = { stale_ttl_ms: 86400000, expiring_window_ms: 86400000, green_min_fraction: 0.5, yellow_min_fraction: 0.25 };
const known = { status: 'KNOWN', unit: 'requests', remaining: 7, capacity: 10, reset_at: '2026-08-28T01:00:00Z', observed_at: now, source: 'provider-fixture', confidence: 'OBSERVED' };

// T1
 test('T1 provider raw quota maps to canonical normalized quota', () => { const q = normalizeRawProviderQuota({ provider: 'fixture', surface: 'surface', raw: { quota: known }, model_scope: 'model-a', now, policy }); assert.equal(q.status, 'KNOWN'); assert.equal(q.remaining, 7); assert.equal(q.watermark, 'GREEN'); assert.equal(q.provenance.provider, 'fixture'); });
// T2
 test('T2 missing quota remains UNKNOWN with null dimensions', () => { const q = normalizeRawProviderQuota({ provider: 'fixture', surface: 'surface', raw: { status: 'ready' }, now, policy }); assert.equal(q.status, 'UNKNOWN'); assert.equal(q.watermark, 'UNKNOWN'); assert.equal(q.remaining, null); assert.equal(q.capacity, null); });
// T3
 test('T3 old observation becomes STALE', () => { const q = normalizeRawProviderQuota({ provider: 'fixture', surface: 'surface', raw: { quota: { ...known, observed_at: now - 90000000 } }, now, policy }); assert.equal(q.watermark, 'STALE'); });
// T4
 test('T4 heterogeneous units remain unchanged', () => { const q = normalizeRawProviderQuota({ provider: 'fixture', surface: 'surface', raw: { quota: { ...known, unit: 'requests' } }, now, policy }); assert.equal(q.unit, 'requests'); assert.notEqual(q.unit, 'tokens'); });
// T5
 test('T5 reset time and model scope are preserved', () => { const q = normalizeRawProviderQuota({ provider: 'fixture', surface: 'surface', raw: { quota: known }, model_scope: 'model-a', window_scope: 'weekly', now, policy }); assert.equal(q.reset_at, '2026-08-28T01:00:00Z'); assert.deepEqual(q.scope, { model: 'model-a', window: 'weekly' }); });
// T6
 test('T6 expiring watermark requires useful queued work', () => { const raw = { quota: { ...known, reset_at: now + 3600000 } }; const noWork = normalizeRawProviderQuota({ provider: 'fixture', surface: 'surface', raw, now, policy }); const work = normalizeRawProviderQuota({ provider: 'fixture', surface: 'surface', raw: { ...raw, quota: { ...raw.quota, useful_queued_work: true } }, now, policy }); assert.equal(noWork.watermark, 'GREEN'); assert.equal(work.watermark, 'EXPIRING'); });
// T7
 test('T7 identical sanitized observation replays canonically', () => { const args = { provider: 'fixture', surface: 'surface', raw: { quota: known }, model_scope: 'model-a', now, policy }; assert.deepEqual(normalizeRawProviderQuota(args), normalizeRawProviderQuota(args)); });
// T8
 test('T8 quota observation does not authorize spend', () => { const q = normalizeRawProviderQuota({ provider: 'fixture', surface: 'surface', raw: { quota: known }, now, policy }); assert.equal(q.payg_authorized, undefined); const route = routeEconomically({ requirement: { trust_domain: 'retrieval', capabilities: ['x'] }, lanes: [{ lane_id: 'payg', execution_class: 'REMOTE_STRONG', trust_domain: 'retrieval', capabilities: ['x'], payg: true, marginal_cost: 1, quota: q }], policy: createEconomicPolicy({ now }) }); assert.equal(route.status, 'DEGRADED'); });
// T9
 test('T9 quota cannot bypass trust or capability eligibility', () => { const q = normalizeRawProviderQuota({ provider: 'fixture', surface: 'surface', raw: { quota: { ...known, remaining: 100000 } }, now, policy }); const route = routeEconomically({ requirement: { trust_domain: 'engineering', capabilities: ['code-modification'] }, lanes: [{ lane_id: 'rich', trust_domain: 'retrieval', capabilities: ['structured-extraction'], execution_class: 'REMOTE_FREE', quota: q }], policy: createEconomicPolicy({ now }) }); assert.equal(route.status, 'DEGRADED'); });
// T10
 test('T10 credential-like output is redacted before receipt/hash', () => { const raw = JSON.stringify({ status: 'ready', authorization: 'Bearer secret-token', api_key: 'abc123', nested: { cookie: 'session=secret' } }); const sanitized = redactProviderOutput(raw); assert.equal(sanitized.includes('secret-token'), false); assert.equal(sanitized.includes('abc123'), false); assert.equal(sanitized.includes('session=secret'), false); });
// T11
 test('T11 malformed provider output fails closed to UNKNOWN', () => { const q = normalizeRawProviderQuota({ provider: 'fixture', surface: 'surface', raw: 'not-json', now, policy }); assert.equal(q.status, 'UNKNOWN'); assert.equal(q.watermark, 'UNKNOWN'); assert.ok(q.provenance.parse_warnings.length > 0); });
// T12
 test('T12 provider outage returns UNKNOWN without throwing', () => { const adapter = new ProviderQuotaAdapter({ providerId: 'openai-codex', surfaceId: 'pi-auth-check', runner: () => { throw new Error('offline'); }, now: () => now }); const q = adapter.observe(); assert.equal(q.status, 'UNKNOWN'); assert.equal(q.provenance.parse_warnings[0], 'provider command unavailable'); });
// T13
 test('T13 model-scoped quota cannot route an unrelated model', () => { const q = normalizeLane({ lane_id: 'model-a', execution_class: 'REMOTE_SUBSCRIPTION', trust_domain: 'retrieval', capabilities: ['x'], context_window: 100, quota: { ...known, scope: { model: 'model-a' } } }, createEconomicPolicy({ now }), now); const route = routeEconomically({ requirement: { trust_domain: 'retrieval', capabilities: ['x'], model_scope: 'model-b' }, lanes: [{ ...q, quota: q.quota }], policy: createEconomicPolicy({ now }), now }); assert.ok(route.rejections.some(item => item.reason === 'QUOTA_SCOPE_MISMATCH')); });
// T14
 test('T14 meaningful quota change emits a causal notification', () => { const a = normalizeLane({ lane_id: 'a', execution_class: 'REMOTE_FREE', trust_domain: 'retrieval', capabilities: ['x'], context_window: 100, quota: known }, createEconomicPolicy({ now }), now); const b = normalizeLane({ lane_id: 'a', execution_class: 'REMOTE_FREE', trust_domain: 'retrieval', capabilities: ['x'], context_window: 100, quota: { ...known, remaining: 2 } }, createEconomicPolicy({ now }), now); assert.equal(quotaNotification(a, b).type, 'quota.watermark.changed'); });
// T15
 test('T15 identical observation emits no-noise notification', () => { const a = normalizeLane({ lane_id: 'a', execution_class: 'REMOTE_FREE', trust_domain: 'retrieval', capabilities: ['x'], context_window: 100, quota: known }, createEconomicPolicy({ now }), now); assert.equal(quotaNotification(a, a).type, 'quota.unchanged'); });
// T16
 test('T16 economic router consumes normalized state without provider parsing', () => { const q = normalizeRawProviderQuota({ provider: 'fixture', surface: 'surface', raw: { quota: known }, now, policy }); const route = routeEconomically({ requirement: { trust_domain: 'retrieval', capabilities: ['x'] }, lanes: [{ lane_id: 'normalized', execution_class: 'REMOTE_FREE', trust_domain: 'retrieval', capabilities: ['x'], context_window: 100, quota: q }], policy: createEconomicPolicy({ now }), now }); assert.equal(route.selected_lane, 'normalized'); assert.equal(route.observation.watermark, 'GREEN'); });

 test('provider adapter invokes only bounded no-refresh status command', () => { let called; const adapter = new ProviderQuotaAdapter({ providerId: 'openai-codex', surfaceId: 'pi-auth-check', runner: (command, args) => { called = [command, args]; return '{"status":"ready","provider":"openai-codex","authType":"oauth"}'; }, now: () => now }); const q = adapter.observe(); assert.equal(called[0], 'pi'); assert.deepEqual(called[1], ['auth', 'check', '--provider', 'openai-codex', '--no-refresh', '--json']); assert.equal(q.provenance.command_identity, 'pi auth check --provider openai-codex --no-refresh --json'); });
