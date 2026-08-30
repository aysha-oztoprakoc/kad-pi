import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TELEMETRY_SCHEMA_VERSION,
  EPISTEMIC_STATES,
  METRIC_UNITS,
  createTelemetryRecord,
  validateTelemetryRecord,
  normalizeTelemetryObservation,
  reconcileTelemetry,
  checkStaleness,
} from '../telemetry/schema.mjs';
import { TelemetryLedger } from '../telemetry/quota-ledger.mjs';
import { discoverProviders, createProviderTelemetry } from '../telemetry/provider-adapters.mjs';
import { collectOmpSessionUsage, reconcileOmpStats } from '../telemetry/omp-usage-adapter.mjs';
import { createEconomicViewModel } from '../telemetry/economic-adapter.mjs';
import { createWorkctlViewModel } from '../telemetry/workctl-adapter.mjs';
import { collectGpuTelemetry } from '../telemetry/system-metrics.mjs';
import { collectServiceHealth } from '../telemetry/health.mjs';
import { computeTokenmaxxingMetrics } from '../telemetry/tokenmaxxing.mjs';
import { buildControlPlaneViewModel } from '../telemetry/view-model.mjs';

test('T1 Telemetry schema enforces version and required epistemic provenance', () => {
  const record = createTelemetryRecord({
    provider_id: 'openai-codex',
    model_id: 'gpt-5.6-luna',
    metric: 'input_tokens',
    unit: 'tokens',
    quota: { limit: 1000000, used: 250000, remaining: 750000 },
    source: {
      class: 'AUTHORITATIVE_REMOTE',
      adapter: 'omp-usage',
      evidence_ref: 'headers.x-ratelimit-remaining',
    },
    observed_at: 1700000000000,
    stale_after: 1700000060000,
  });

  assert.equal(record.schema_version, TELEMETRY_SCHEMA_VERSION);
  assert.equal(record.provider_id, 'openai-codex');
  assert.equal(record.metric, 'input_tokens');
  assert.equal(record.unit, 'tokens');
  assert.equal(record.state, 'AUTHORITATIVE_REMOTE');
  assert.equal(validateTelemetryRecord(record), true);
});

test('T2 Quota honesty: Non-token quotas NEVER convert to fake tokens', () => {
  const messageQuota = createTelemetryRecord({
    provider_id: 'provider-messages',
    metric: 'messages',
    unit: 'messages',
    window: { kind: 'weekly', resets_at: 1700003600000 },
    quota: { limit: 200, used: 50, remaining: 150 },
    source: { class: 'AUTHORITATIVE_REMOTE', adapter: 'provider-api' },
  });
  assert.equal(messageQuota.metric, 'messages');
  assert.equal(messageQuota.unit, 'messages');
  assert.equal(messageQuota.quota.remaining, 150);

  const requestQuota = createTelemetryRecord({
    provider_id: 'provider-requests',
    metric: 'requests',
    unit: 'requests',
    window: { kind: 'daily', resets_at: 1700003600000 },
    quota: { limit: 1000, used: 100, remaining: 900 },
    source: { class: 'OBSERVED', adapter: 'headers' },
  });
  assert.equal(requestQuota.metric, 'requests');
  assert.equal(requestQuota.unit, 'requests');
  assert.equal(requestQuota.quota.remaining, 900);
});

test('T3 Quota honesty: Unknown provider limit leaves remaining UNKNOWN and yields no percentage', () => {
  const unknownQuota = createTelemetryRecord({
    provider_id: 'provider-opaque',
    metric: 'total_tokens',
    unit: 'tokens',
    quota: { limit: null, used: 45000, remaining: null },
    source: { class: 'OBSERVED', adapter: 'session-events' },
    state: 'UNKNOWN',
  });

  assert.equal(unknownQuota.quota.limit, null);
  assert.equal(unknownQuota.quota.remaining, null);
  assert.equal(unknownQuota.quota.used, 45000);
  assert.equal(unknownQuota.state, 'UNKNOWN');

  const vm = buildControlPlaneViewModel({
    telemetryRecords: [unknownQuota],
  });
  const provider = vm.providers.find((p) => p.provider_id === 'provider-opaque');
  assert.ok(provider);
  assert.equal(provider.percent_remaining, null);
  assert.equal(provider.quota_display, 'UNKNOWN');
});

test('T4 Deterministic reconciliation: Authoritative remote beats local estimate while preserving both', () => {
  const localObs = createTelemetryRecord({
    provider_id: 'openai-codex',
    metric: 'total_tokens',
    unit: 'tokens',
    quota: { limit: 100000, used: 61000, remaining: 39000 },
    source: { class: 'DERIVED', adapter: 'local-ledger' },
    observed_at: 1700000000000,
  });

  const remoteObs = createTelemetryRecord({
    provider_id: 'openai-codex',
    metric: 'total_tokens',
    unit: 'tokens',
    quota: { limit: 100000, used: 58000, remaining: 42000 },
    source: { class: 'AUTHORITATIVE_REMOTE', adapter: 'omp-usage' },
    observed_at: 1700000010000,
  });

  const reconciled = reconcileTelemetry([localObs, remoteObs]);
  assert.equal(reconciled.effective.state, 'AUTHORITATIVE_REMOTE');
  assert.equal(reconciled.effective.quota.remaining, 42000);
  assert.equal(reconciled.provenance.length, 2);
  assert.equal(reconciled.delta.remaining, 3000);
});

test('T5 Staleness: Expired observations transition to STALE state', () => {
  const freshRecord = createTelemetryRecord({
    provider_id: 'google-antigravity',
    metric: 'requests',
    unit: 'requests',
    quota: { limit: 1000, used: 100, remaining: 900 },
    source: { class: 'OBSERVED', adapter: 'api' },
    observed_at: 1000,
    stale_after: 2000,
  });

  const evaluatedFresh = checkStaleness(freshRecord, 1500);
  assert.equal(evaluatedFresh.state, 'OBSERVED');

  const evaluatedStale = checkStaleness(freshRecord, 2500);
  assert.equal(evaluatedStale.state, 'STALE');
});

test('T6 Telemetry Ledger survives append, query, and redaction of secrets', () => {
  const ledger = new TelemetryLedger({ storageDir: '/tmp/kad-test-ledger-' + Date.now() });
  const record = createTelemetryRecord({
    provider_id: 'test-prov',
    metric: 'input_tokens',
    unit: 'tokens',
    quota: { limit: 5000, used: 1000, remaining: 4000 },
    source: {
      class: 'OBSERVED',
      adapter: 'test-adapter',
      evidence_ref: 'Bearer sk-secret-key-12345',
    },
    observed_at: Date.now(),
  });

  ledger.record(record);
  const latest = ledger.getLatest('test-prov', 'input_tokens');
  assert.ok(latest);
  assert.equal(latest.provider_id, 'test-prov');
  assert.ok(!JSON.stringify(latest).includes('sk-secret-key-12345'));
  assert.ok(JSON.stringify(latest).includes('[REDACTED]'));
});

test('T7 Provider discovery produces truthful capability/quota inventory for all configured providers', () => {
  const ompConfig = {
    modelRoles: {
      plan: 'openai-codex/gpt-5.6-luna:high',
      slow: 'google-antigravity/gemini-3-flash:high',
      smol: 'zai-free/glm-4.7-flash:minimal',
      local_retrieval: 'kad-local-qwen/qwen-local:low',
      world: 'kad-local-world/kad-local-s13:low',
    },
    disabledProviders: ['openrouter'],
  };

  const inventory = discoverProviders({ config: ompConfig });
  assert.ok(inventory.some((p) => p.provider_id === 'openai-codex'));
  assert.ok(inventory.some((p) => p.provider_id === 'google-antigravity'));
  assert.ok(inventory.some((p) => p.provider_id === 'zai-free'));
  assert.ok(inventory.some((p) => p.provider_id === 'kad-local-qwen'));
  assert.ok(inventory.some((p) => p.provider_id === 'kad-local-world'));

  const disabled = inventory.find((p) => p.provider_id === 'openrouter');
  assert.equal(disabled?.configured, false);
  assert.equal(disabled?.enabled, false);
});

test('T8 Economic router integration projects active route, paid authorization, and fallback', () => {
  const routeState = createEconomicViewModel({
    requirement: { trust_domain: 'engineering', capabilities: ['code_build'] },
    lanes: [
      {
        lane_id: 'lane-free',
        provider: 'zai-free',
        model: 'glm-4.7-flash',
        execution_class: 'REMOTE_FREE',
        trust_domain: 'engineering',
        capabilities: ['code_build'],
        context_window: 128000,
        quota: { remaining: 500, capacity: 1000, unit: 'requests', status: 'KNOWN' },
      },
      {
        lane_id: 'lane-paid',
        provider: 'openai-codex',
        model: 'gpt-5.6-luna',
        execution_class: 'REMOTE_SUBSCRIPTION',
        trust_domain: 'engineering',
        capabilities: ['code_build'],
        context_window: 200000,
        payg: true,
        quota: { remaining: 1000, capacity: 1000, unit: 'tokens', status: 'KNOWN' },
      },
    ],
    policy: { spend: { payg_authorized: false, allow_paid_fallback: false } },
  });

  assert.equal(routeState.selected_lane, 'lane-free');
  assert.equal(routeState.paid_authorized, false);
  assert.ok(routeState.rejections.some((r) => r.reason === 'PAYG_NOT_AUTHORIZED'));
});

test('T9 Workctl view-model projects active claim, ticket ID, and frontier', () => {
  const activeVm = createWorkctlViewModel({
    activeClaim: {
      task: 'WP-KAD-OPERATOR-CONTROL-PLANE-001',
      actor_label: 'test-actor',
      mode: 'mutate',
    },
    frontier: ['WP-KAD-OPERATOR-CONTROL-PLANE-001'],
  });

  assert.equal(activeVm.has_active_claim, true);
  assert.equal(activeVm.ticket_id, 'WP-KAD-OPERATOR-CONTROL-PLANE-001');

  const emptyVm = createWorkctlViewModel({
    activeClaim: null,
    frontier: [],
  });
  assert.equal(emptyVm.has_active_claim, false);
  assert.equal(emptyVm.ticket_id, 'NO ACTIVE CLAIM');
});

test('T10 GPU telemetry parses structured amdgpu_top JSON into normalized records', () => {
  const mockAmdgpuTopOutput = JSON.stringify({
    devices: [
      {
        Info: { DeviceName: 'AMD Radeon RX 9060 XT' },
        VRAM: {
          'Total VRAM': { value: 8144, unit: 'MiB' },
          'Total VRAM Usage': { value: 5955, unit: 'MiB' },
        },
        gpu_activity: { GFX: { value: 6, unit: '%' } },
        Sensors: {
          'Edge Temperature': { value: 58, unit: 'C' },
          'Average Power': { value: 18, unit: 'W' },
        },
      },
    ],
  });

  const gpuMetrics = collectGpuTelemetry({
    runner: () => mockAmdgpuTopOutput,
  });

  assert.equal(gpuMetrics.state, 'AVAILABLE');
  assert.equal(gpuMetrics.device_name, 'AMD Radeon RX 9060 XT');
  assert.equal(gpuMetrics.vram_used_mib, 5955);
  assert.equal(gpuMetrics.vram_total_mib, 8144);
  assert.equal(gpuMetrics.gpu_utilization_percent, 6);
  assert.equal(gpuMetrics.temperature_c, 58);
  assert.equal(gpuMetrics.power_w, 18);
});

test('T11 Service health collector probes OpenViking, Zotero, and local runtimes', async () => {
  const health = await collectServiceHealth({
    probes: {
      openviking: async () => ({ state: 'AVAILABLE', latency_ms: 5 }),
      zotero: async () => ({ state: 'DEGRADED', reason: 'connection refused' }),
      needle: async () => ({ state: 'UNAVAILABLE', reason: 'not configured' }),
    },
  });

  assert.equal(health.services.openviking.state, 'AVAILABLE');
  assert.equal(health.services.zotero.state, 'DEGRADED');
  assert.equal(health.services.needle.state, 'UNAVAILABLE');
});

test('T12 TOKENMAXXING metrics derive mathematically defensible operational metrics', () => {
  const metrics = computeTokenmaxxingMetrics({
    sessionUsage: {
      inputTokens: 100000,
      outputTokens: 20000,
      cacheReadTokens: 800000,
      totalTokens: 920000,
    },
    acceptedTickets: 2,
    passedTests: 50,
    commits: 3,
    localTokens: 300000,
    remoteTokens: 620000,
  });

  assert.equal(metrics.cache_hit_rate, 800000 / 900000);
  assert.equal(metrics.tokens_per_accepted_ticket, 920000 / 2);
  assert.equal(metrics.tokens_per_pass, 920000 / 50);
  assert.equal(metrics.tokens_per_commit, 920000 / 3);
  assert.equal(metrics.local_to_remote_ratio, 300000 / 620000);
});

test('T13 Reset boundaries with injected time handle before reset, after reset, and rolling windows', () => {
  const baseTime = 1000000;
  const resetTime = 1000000 + 3600000; // 1 hour later

  const record = createTelemetryRecord({
    provider_id: 'openai-codex',
    metric: 'total_tokens',
    window: { kind: 'hourly', resets_at: resetTime },
    quota: { limit: 100000, used: 20000, remaining: 80000 },
    observed_at: baseTime,
  });

  // Before reset: resets_in shows 60m / 1h 0m
  const vmBefore = buildControlPlaneViewModel({
    telemetryRecords: [record],
    now: baseTime + 1800000, // 30 min in
  });
  assert.equal(vmBefore.providers[0].resets_in, '30m');

  // After reset: resets_at is past, resets_in is null
  const vmAfter = buildControlPlaneViewModel({
    telemetryRecords: [record],
    now: resetTime + 5000,
  });
  assert.equal(vmAfter.providers[0].resets_in, null);
});

test('T14 Provider discovery and view model render diverse providers without inventing equivalence', () => {
  const provA = createTelemetryRecord({
    provider_id: 'prov-token',
    metric: 'total_tokens',
    unit: 'tokens',
    quota: { limit: 100000, used: 25000, remaining: 75000 },
    source: { class: 'AUTHORITATIVE_REMOTE' },
    state: 'AUTHORITATIVE_REMOTE',
  });
  const provB = createTelemetryRecord({
    provider_id: 'prov-request',
    metric: 'requests',
    unit: 'requests',
    quota: { limit: 1000, used: 100, remaining: 900 },
    source: { class: 'AUTHORITATIVE_REMOTE' },
    state: 'AUTHORITATIVE_REMOTE',
  });
  const provC = createTelemetryRecord({
    provider_id: 'prov-observed',
    metric: 'total_tokens',
    unit: 'tokens',
    quota: { limit: null, used: 50000, remaining: null },
    source: { class: 'OBSERVED' },
    state: 'OBSERVED',
  });
  const provD = createTelemetryRecord({
    provider_id: 'prov-unknown',
    metric: 'total_tokens',
    unit: 'tokens',
    quota: { limit: null, used: null, remaining: null },
    source: { class: 'UNKNOWN' },
    state: 'UNKNOWN',
  });

  const vm = buildControlPlaneViewModel({
    telemetryRecords: [provA, provB, provC, provD],
    discoveredProviders: [
      { provider_id: 'prov-unavailable', configured: false, enabled: false, models: [] },
    ],
  });

  assert.equal(vm.providers.length, 5);

  const viewA = vm.providers.find((p) => p.provider_id === 'prov-token');
  assert.equal(viewA.percent_remaining, 75);
  assert.equal(viewA.quota_display, '75000/100000 tokens (75%)');

  const viewB = vm.providers.find((p) => p.provider_id === 'prov-request');
  assert.equal(viewB.percent_remaining, 90);
  assert.equal(viewB.quota_display, '900/1000 requests (90%)');

  const viewC = vm.providers.find((p) => p.provider_id === 'prov-observed');
  assert.equal(viewC.percent_remaining, null);
  assert.equal(viewC.quota_display, '50000 tokens used (limit UNKNOWN)');

  const viewD = vm.providers.find((p) => p.provider_id === 'prov-unknown');
  assert.equal(viewD.percent_remaining, null);
  assert.equal(viewD.quota_display, 'UNKNOWN');

  const viewE = vm.providers.find((p) => p.provider_id === 'prov-unavailable');
  assert.equal(viewE.configured, false);
  assert.equal(viewE.quota_display, 'UNKNOWN');
});

test('T15 Workctl view-model edge states: blocked frontier, accepted tickets, null state', () => {
  const vm = createWorkctlViewModel({
    activeClaim: null,
    frontier: ['WP-002', 'WP-003'],
    accepted: ['WP-001'],
    blocked: ['WP-004'],
  });
  assert.equal(vm.has_active_claim, false);
  assert.equal(vm.ticket_id, 'NO ACTIVE CLAIM');
  assert.deepEqual(vm.frontier, ['WP-002', 'WP-003']);
  assert.deepEqual(vm.accepted, ['WP-001']);
  assert.deepEqual(vm.blocked, ['WP-004']);
});

test('T16 Epistemic honesty: Manual limit + observed usage yields DERIVED remaining', () => {
  const manualRecord = createTelemetryRecord({
    provider_id: 'zai-free',
    metric: 'total_tokens',
    quota: { limit: 500000, used: 120000, remaining: null },
    source: { class: 'MANUAL', adapter: 'user-config' },
    state: 'MANUAL',
  });
  assert.equal(manualRecord.quota.remaining, 380000);
  assert.equal(manualRecord.state, 'MANUAL');
});
