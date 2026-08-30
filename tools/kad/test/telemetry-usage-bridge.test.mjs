import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeOmpUsageReport,
  normalizeOmpUsageReports,
  collectOmpUsageReportsCli,
  handleAfterProviderResponse,
} from '../telemetry/omp-usage-adapter.mjs';
import { buildControlPlaneViewModel } from '../telemetry/view-model.mjs';
import { renderCompactMeter, renderDetailedPanel } from '../telemetry/control-plane-runtime.mjs';

// Sample mock OMP usage report matching real installed OMP 18.0.10 format
const mockCodexUsageReport = {
  provider: 'openai-codex',
  fetchedAt: 1788050000000,
  limits: [
    {
      id: 'openai-codex:primary',
      label: '5 hours',
      scope: {
        provider: 'openai-codex',
        windowId: '5h',
        shared: true,
      },
      window: {
        id: '5h',
        label: '5 hours',
        durationMs: 18000000,
        resetsAt: 1788056523000,
      },
      amount: {
        used: 28,
        limit: 100,
        remaining: 72,
        usedFraction: 0.28,
        remainingFraction: 0.72,
        unit: 'percent',
      },
      status: 'ok',
    },
    {
      id: 'openai-codex:secondary',
      label: '7 days',
      scope: {
        provider: 'openai-codex',
        windowId: '7d',
        shared: true,
      },
      window: {
        id: '7d',
        label: '7 days',
        durationMs: 604800000,
        resetsAt: 1788643323000,
      },
      amount: {
        used: 4,
        limit: 100,
        remaining: 96,
        usedFraction: 0.04,
        remainingFraction: 0.96,
        unit: 'percent',
      },
      status: 'ok',
    },
  ],
  metadata: {
    planType: 'plus',
    allowed: true,
    limitReached: false,
    email: 'user@example.com',
    accountId: 'acc-1234',
    meterStates: {
      chat: {
        allowed: true,
        limitReached: false,
      },
    },
  },
};

const mockAntigravityUsageReport = {
  provider: 'google-antigravity',
  fetchedAt: 1788050000000,
  limits: [
    {
      id: 'google-antigravity:google:default:daily',
      label: 'Usage (Google)',
      scope: {
        provider: 'google-antigravity',
        projectId: 'aicode-consumers',
        windowId: 'daily',
      },
      window: {
        id: 'daily',
        label: 'Daily',
        durationMs: 86400000,
        resetsAt: 1788065540000,
      },
      amount: {
        unit: 'percent',
        remainingFraction: 0.607887,
        usedFraction: 0.392113,
        remaining: 60.7887,
        used: 39.2113,
        limit: 100,
      },
      status: 'ok',
    },
  ],
  metadata: {
    endpoint: 'https://daily-cloudcode-pa.googleapis.com',
    projectId: 'aicode-consumers',
  },
};

test('UB1 Codex native quota report normalizes into populated KAD telemetry records', () => {
  const records = normalizeOmpUsageReport(mockCodexUsageReport, { now: 1788050000000 });
  assert.equal(records.length, 2);

  const primary = records.find((r) => r.window.kind === '5h');
  assert.ok(primary);
  assert.equal(primary.provider_id, 'openai-codex');
  assert.equal(primary.unit, 'percent');
  assert.equal(primary.quota.limit, 100);
  assert.equal(primary.quota.used, 28);
  assert.equal(primary.quota.remaining, 72);
  assert.equal(primary.window.resets_at, 1788056523000);
  assert.equal(primary.state, 'AUTHORITATIVE_REMOTE');
  assert.equal(primary.source.adapter, 'omp-usage');
  assert.equal(primary.source.class, 'AUTHORITATIVE_REMOTE');

  // Secrets such as raw email / accountId must be redacted
  assert.equal(primary.metadata?.email, undefined);
  assert.equal(primary.metadata?.accountId, undefined);
});

test('UB2 Antigravity native quota report normalizes into populated KAD telemetry records', () => {
  const records = normalizeOmpUsageReport(mockAntigravityUsageReport, { now: 1788050000000 });
  assert.equal(records.length, 1);

  const daily = records[0];
  assert.equal(daily.provider_id, 'google-antigravity');
  assert.equal(daily.unit, 'percent');
  assert.equal(daily.quota.limit, 100);
  assert.equal(daily.quota.used, 39.2113);
  assert.equal(daily.quota.remaining, 60.7887);
  assert.equal(daily.window.kind, 'daily');
  assert.equal(daily.window.resets_at, 1788065540000);
  assert.equal(daily.state, 'AUTHORITATIVE_REMOTE');
});

test('UB3 Multi-window quotas remain distinct and un-collapsed', () => {
  const records = normalizeOmpUsageReport(mockCodexUsageReport, { now: 1788050000000 });
  const w5h = records.find((r) => r.window.kind === '5h');
  const w7d = records.find((r) => r.window.kind === '7d');

  assert.ok(w5h);
  assert.ok(w7d);
  assert.notEqual(w5h.quota.remaining, w7d.quota.remaining);
  assert.notEqual(w5h.window.resets_at, w7d.window.resets_at);
});

test('UB4 Explicit allowed=true / limitReached=false outranks misleading advisory 100% usage', () => {
  const saturatedReport = {
    provider: 'openai-codex',
    fetchedAt: 1788050000000,
    limits: [
      {
        id: 'openai-codex:primary',
        window: { id: '5h', resetsAt: 1788056523000 },
        amount: { used: 100, limit: 100, remaining: 0, unit: 'percent' },
        status: 'ok',
      },
    ],
    metadata: {
      allowed: true,
      limitReached: false,
    },
  };

  const records = normalizeOmpUsageReport(saturatedReport, { now: 1788050000000 });
  assert.equal(records[0].metadata?.allowed, true);
  assert.equal(records[0].metadata?.limitReached, false);
  assert.equal(records[0].state, 'AUTHORITATIVE_REMOTE');
});

test('UB5 Stale native report transitions to STALE state', () => {
  const staleReport = {
    ...mockCodexUsageReport,
    fetchedAt: 1000000,
  };

  // Evaluate at time far beyond default TTL
  const records = normalizeOmpUsageReport(staleReport, { now: 1000000 + 400000, ttlMs: 300000 });
  assert.equal(records[0].state, 'STALE');
});

test('UB6 Malformed OMP usage report degrades safely without throwing', () => {
  assert.deepEqual(normalizeOmpUsageReport(null), []);
  assert.deepEqual(normalizeOmpUsageReport({}), []);
  assert.deepEqual(normalizeOmpUsageReport({ provider: 'test', limits: null }), []);
  assert.deepEqual(normalizeOmpUsageReports(null), []);
  assert.deepEqual(normalizeOmpUsageReports({ reports: 'invalid' }), []);
});

test('UB7 Passive after_provider_response hook captures response evidence without secrets', () => {
  const event = {
    type: 'after_provider_response',
    status: 200,
    headers: {
      'x-ratelimit-remaining-requests': '990',
      'x-ratelimit-limit-requests': '1000',
      'x-ratelimit-reset-requests': '12s',
      'authorization': 'Bearer sk-secret-token-12345',
      'set-cookie': 'session=secret-cookie-val',
    },
    requestId: 'req_98765',
    metadata: {
      cost: 0.0012,
    },
  };

  const ctx = {
    model: {
      provider: 'google-antigravity',
      id: 'gemini-3-flash',
    },
  };

  const record = handleAfterProviderResponse(event, ctx, { now: 1788050000000 });
  assert.ok(record);
  assert.equal(record.provider_id, 'google-antigravity');
  assert.equal(record.state, 'OBSERVED');
  assert.equal(record.source.class, 'OBSERVED');
  assert.equal(record.source.adapter, 'after_provider_response');

  // Verify authorization and cookies were redacted
  assert.equal(record.metadata?.headers?.authorization, '[REDACTED]');
  assert.equal(record.metadata?.headers?.['set-cookie'], '[REDACTED]');
  assert.equal(record.metadata?.headers?.['x-ratelimit-remaining-requests'], '990');
});

test('UB8 View model and compact meter integrate native provider quota truth', () => {
  const codexRecords = normalizeOmpUsageReport(mockCodexUsageReport, { now: 1788050000000 });
  const antigravityRecords = normalizeOmpUsageReport(mockAntigravityUsageReport, { now: 1788050000000 });

  const vm = buildControlPlaneViewModel({
    sessionUsage: {
      total_tokens: 154000,
      model_id: 'gpt-5.6-luna',
      provider_id: 'openai-codex',
    },
    telemetryRecords: [...codexRecords, ...antigravityRecords],
    now: 1788050000000,
  });

  const codexView = vm.providers.find((p) => p.provider_id === 'openai-codex');
  assert.ok(codexView);
  assert.equal(codexView.percent_remaining, 72);
  assert.equal(codexView.source_class, 'AUTHORITATIVE_REMOTE');

  const antigravityView = vm.providers.find((p) => p.provider_id === 'google-antigravity');
  assert.ok(antigravityView);
  assert.equal(antigravityView.percent_remaining, 61); // Rounded from 60.7887

  // Meter formatting should show binding quota percentage instead of 'QUOTA ?'
  const meter = renderCompactMeter({
    session_tokens: 154000,
    economic_route: 'REMOTE_SUBSCRIPTION',
    provider_quota_percent: 72,
    workctl: { has_active_claim: true, ticket_id: 'WP-KAD-USAGE-BRIDGE-002' },
  });

  assert.ok(meter.includes('P:72%'));
  assert.ok(!meter.includes('QUOTA ?'));
});

test('UB9 CLI usage runner collects structured OMP reports with fallback', () => {
  const reports = collectOmpUsageReportsCli({
    runner: () => JSON.stringify({ reports: [mockCodexUsageReport, mockAntigravityUsageReport] }),
  });

  assert.equal(reports.length, 2);
  assert.equal(reports[0].provider, 'openai-codex');
  assert.equal(reports[1].provider, 'google-antigravity');

  // Fallback on runner error
  const fallbackReports = collectOmpUsageReportsCli({
    runner: () => {
      throw new Error('omp command not available');
    },
  });
  assert.deepEqual(fallbackReports, []);
});
