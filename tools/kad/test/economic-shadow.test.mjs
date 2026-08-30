import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateEconomicShadow,
  matchTelemetryScope,
  calculateBindingWindow,
  scoreLaneShadow,
} from '../telemetry/economic-shadow.mjs';
import { routeEconomically, createEconomicPolicy } from '../economic-router.mjs';

const mockLanes = [
  {
    lane_id: 'deterministic_existing',
    provider: 'local',
    model: 'ast-grep',
    execution_class: 'DETERMINISTIC_EXISTING',
    billing_class: 'FREE',
    available: true,
    authority_compatible: true,
    trust_domain: 'engineering',
    capabilities: ['code_build'],
    context_window: 100000,
    deterministic: true,
    local: true,
    payg: false,
    marginal_cost: 0,
  },
  {
    lane_id: 'local_specialist',
    provider: 'ollama',
    model: 'qwen2.5-coder:7b',
    execution_class: 'LOCAL_SPECIALIST',
    billing_class: 'FREE',
    available: true,
    authority_compatible: true,
    trust_domain: 'engineering',
    capabilities: ['code_build'],
    context_window: 32000,
    deterministic: false,
    local: true,
    payg: false,
    marginal_cost: 0,
  },
  {
    lane_id: 'remote_free_gemini',
    provider: 'google-antigravity',
    model: 'gemini-3-flash',
    execution_class: 'REMOTE_FREE',
    billing_class: 'FREE',
    available: true,
    authority_compatible: true,
    trust_domain: 'engineering',
    capabilities: ['code_build'],
    context_window: 1000000,
    deterministic: false,
    local: false,
    payg: false,
    marginal_cost: 0,
  },
  {
    lane_id: 'remote_sub_codex',
    provider: 'openai-codex',
    model: 'gpt-5.6-luna',
    execution_class: 'REMOTE_SUBSCRIPTION',
    billing_class: 'SUBSCRIPTION',
    available: true,
    authority_compatible: true,
    trust_domain: 'engineering',
    capabilities: ['code_build'],
    context_window: 128000,
    deterministic: false,
    local: false,
    payg: false,
    marginal_cost: 0,
  },
  {
    lane_id: 'remote_paid_claude',
    provider: 'anthropic',
    model: 'claude-3-7-sonnet',
    execution_class: 'REMOTE_STRONG',
    billing_class: 'PAID',
    available: true,
    authority_compatible: true,
    trust_domain: 'engineering',
    capabilities: ['code_build'],
    context_window: 200000,
    deterministic: false,
    local: false,
    payg: true,
    marginal_cost: 0.015,
  },
];

const standardRequirement = {
  trust_domain: 'engineering',
  capabilities: ['code_build'],
  min_context: 4000,
};

test('T1 abundant quota, distant reset -> baseline scoring, no expiring boost', () => {
  const now = 1000000;
  const telemetry = [
    {
      schema_version: 'kad-telemetry-v1',
      provider_id: 'openai-codex',
      metric: 'quota_usage',
      unit: 'percent',
      window: { kind: '5h', durationMs: 18000000, resets_at: now + 17000000 },
      quota: { limit: 100, used: 10, remaining: 90 },
      source: { class: 'AUTHORITATIVE_REMOTE', adapter: 'omp-usage' },
      observed_at: now,
      state: 'AUTHORITATIVE_REMOTE',
    },
  ];

  const evalResult = evaluateEconomicShadow({
    requirement: standardRequirement,
    lanes: mockLanes,
    telemetryRecords: telemetry,
    policy: createEconomicPolicy({ now }),
    now,
    queued_work: false,
  });

  assert.equal(evalResult.status, 'ROUTED');
  assert.equal(evalResult.actual_route, 'deterministic_existing');
  assert.equal(evalResult.shadow_recommended_route, 'deterministic_existing');
  assert.equal(evalResult.same_or_different, 'SAME');
});

test('T2 abundant quota, imminent reset (queued_work=true) -> USE_IT_OR_LOSE_IT boost for subscription lane', () => {
  const now = 1000000;
  const remoteOnlyLanes = mockLanes.filter(
    (l) => l.execution_class === 'REMOTE_FREE' || l.execution_class === 'REMOTE_SUBSCRIPTION'
  );

  const telemetry = [
    {
      schema_version: 'kad-telemetry-v1',
      provider_id: 'openai-codex',
      metric: 'quota_usage',
      unit: 'percent',
      window: { kind: '5h', durationMs: 18000000, resets_at: now + 1800000 }, // 30m left (10% of window)
      quota: { limit: 100, used: 20, remaining: 80 },
      source: { class: 'AUTHORITATIVE_REMOTE', adapter: 'omp-usage' },
      observed_at: now,
      state: 'AUTHORITATIVE_REMOTE',
    },
  ];

  const evalResult = evaluateEconomicShadow({
    requirement: standardRequirement,
    lanes: remoteOnlyLanes,
    telemetryRecords: telemetry,
    policy: createEconomicPolicy({ now }),
    now,
    queued_work: true,
  });

  // Production route for remote-only with standard policy without expiring quota on lane is REMOTE_FREE
  // But shadow detects the expiring subscription quota and recommends REMOTE_SUBSCRIPTION ahead of REMOTE_FREE
  assert.equal(evalResult.status, 'ROUTED');
  assert.equal(evalResult.shadow_recommended_route, 'remote_sub_codex');
  assert.ok(evalResult.reason_codes.includes('SUBSCRIPTION_EXPIRING_OPPORTUNITY'));
});

test('T3 scarce quota, distant reset -> PRESERVE_SCARCE_QUOTA demotion', () => {
  const now = 1000000;
  const telemetry = [
    {
      schema_version: 'kad-telemetry-v1',
      provider_id: 'openai-codex',
      metric: 'quota_usage',
      unit: 'percent',
      window: { kind: '7d', durationMs: 604800000, resets_at: now + 500000000 },
      quota: { limit: 100, used: 90, remaining: 10 },
      source: { class: 'AUTHORITATIVE_REMOTE', adapter: 'omp-usage' },
      observed_at: now,
      state: 'AUTHORITATIVE_REMOTE',
    },
  ];

  const codexLane = mockLanes.find((l) => l.lane_id === 'remote_sub_codex');
  const binding = calculateBindingWindow(codexLane, telemetry, { now });
  assert.ok(binding);
  assert.equal(binding.remaining_fraction, 0.10);

  const score = scoreLaneShadow(codexLane, binding, { policy: createEconomicPolicy({ now }), now, queued_work: false });
  assert.ok(score.adjustments.some((a) => a.reason_code === 'PRESERVE_SCARCE_QUOTA'));
});

test('T4 scarce quota, imminent reset -> no boost (quota is not abundant)', () => {
  const now = 1000000;
  const telemetry = [
    {
      schema_version: 'kad-telemetry-v1',
      provider_id: 'openai-codex',
      metric: 'quota_usage',
      unit: 'percent',
      window: { kind: '5h', durationMs: 18000000, resets_at: now + 1000000 },
      quota: { limit: 100, used: 95, remaining: 5 }, // scarce (5%)
      source: { class: 'AUTHORITATIVE_REMOTE', adapter: 'omp-usage' },
      observed_at: now,
      state: 'AUTHORITATIVE_REMOTE',
    },
  ];

  const codexLane = mockLanes.find((l) => l.lane_id === 'remote_sub_codex');
  const binding = calculateBindingWindow(codexLane, telemetry, { now });
  const score = scoreLaneShadow(codexLane, binding, { policy: createEconomicPolicy({ now }), now, queued_work: true });

  assert.ok(!score.adjustments.some((a) => a.reason_code === 'SUBSCRIPTION_EXPIRING_OPPORTUNITY'));
});

test('T5 5h + 7d binding-window selection -> chooses bottleneck window', () => {
  const now = 1000000;
  const telemetry = [
    {
      schema_version: 'kad-telemetry-v1',
      provider_id: 'openai-codex',
      metric: 'quota_usage',
      unit: 'percent',
      window: { kind: '5h', durationMs: 18000000, resets_at: now + 10000000 },
      quota: { limit: 100, used: 20, remaining: 80 },
      source: { class: 'AUTHORITATIVE_REMOTE', adapter: 'omp-usage' },
      observed_at: now,
      state: 'AUTHORITATIVE_REMOTE',
    },
    {
      schema_version: 'kad-telemetry-v1',
      provider_id: 'openai-codex',
      metric: 'quota_usage',
      unit: 'percent',
      window: { kind: '7d', durationMs: 604800000, resets_at: now + 500000000 },
      quota: { limit: 100, used: 70, remaining: 30 }, // 30% remaining is the bottleneck
      source: { class: 'AUTHORITATIVE_REMOTE', adapter: 'omp-usage' },
      observed_at: now,
      state: 'AUTHORITATIVE_REMOTE',
    },
  ];

  const codexLane = mockLanes.find((l) => l.lane_id === 'remote_sub_codex');
  const binding = calculateBindingWindow(codexLane, telemetry, { now });
  assert.equal(binding.window_kind, '7d');
  assert.equal(binding.remaining_fraction, 0.30);
});

test('T6 model-scoped quota isolation -> quota for model A does not constrain model B', () => {
  const telemetry = [
    {
      schema_version: 'kad-telemetry-v1',
      provider_id: 'google-antigravity',
      model_id: 'claude-3-5-sonnet',
      metric: 'quota_usage',
      unit: 'percent',
      window: { kind: 'daily', durationMs: 86400000, resets_at: 2000000 },
      quota: { limit: 100, used: 99, remaining: 1 },
      source: { class: 'AUTHORITATIVE_REMOTE', adapter: 'omp-usage' },
      state: 'AUTHORITATIVE_REMOTE',
    },
  ];

  const geminiLane = mockLanes.find((l) => l.lane_id === 'remote_free_gemini');
  assert.equal(matchTelemetryScope(geminiLane, telemetry[0]), false);

  const binding = calculateBindingWindow(geminiLane, telemetry, { now: 1000000 });
  assert.equal(binding.remaining_fraction, null); // Unconstrained by claude quota
});

test('T7 account-wide quota application -> account ceiling applies to all matching lanes', () => {
  const telemetry = [
    {
      schema_version: 'kad-telemetry-v1',
      provider_id: '*',
      metric: 'quota_usage',
      unit: 'percent',
      window: { kind: 'monthly', durationMs: 2592000000, resets_at: 3000000 },
      quota: { limit: 100, used: 60, remaining: 40 },
      source: { class: 'AUTHORITATIVE_REMOTE', adapter: 'omp-usage' },
      state: 'AUTHORITATIVE_REMOTE',
    },
  ];

  const geminiLane = mockLanes.find((l) => l.lane_id === 'remote_free_gemini');
  assert.equal(matchTelemetryScope(geminiLane, telemetry[0]), true);

  const binding = calculateBindingWindow(geminiLane, telemetry, { now: 1000000 });
  assert.equal(binding.remaining_fraction, 0.40);
});

test('T8 UNKNOWN quota handling -> zero synthetic bonus, neutral evaluation', () => {
  const telemetry = [
    {
      schema_version: 'kad-telemetry-v1',
      provider_id: 'openai-codex',
      metric: 'total_tokens',
      unit: 'tokens',
      window: null,
      quota: { limit: null, used: null, remaining: null },
      source: { class: 'UNKNOWN', adapter: 'provider' },
      state: 'UNKNOWN',
    },
  ];

  const codexLane = mockLanes.find((l) => l.lane_id === 'remote_sub_codex');
  const binding = calculateBindingWindow(codexLane, telemetry, { now: 1000000 });
  assert.equal(binding.remaining_fraction, null);
  assert.equal(binding.epistemic_class, 'UNKNOWN');

  const score = scoreLaneShadow(codexLane, binding, { policy: createEconomicPolicy(), now: 1000000, queued_work: true });
  assert.ok(score.adjustments.some((a) => a.reason_code === 'UNKNOWN_QUOTA_NEUTRAL'));
  assert.equal(score.effective_rank, 6.0); // Exact baseline rank for REMOTE_SUBSCRIPTION
});

test('T9 STALE telemetry -> demoted and cannot outrank fresh authoritative telemetry', () => {
  const now = 2000000;
  const staleObservedAt = now - 90000000; // 90,000s ago (> 86,400s TTL)
  const telemetry = [
    {
      schema_version: 'kad-telemetry-v1',
      provider_id: 'openai-codex',
      metric: 'quota_usage',
      unit: 'percent',
      window: { kind: '5h', durationMs: 18000000, resets_at: now + 1000000 },
      quota: { limit: 100, used: 10, remaining: 90 },
      source: { class: 'AUTHORITATIVE_REMOTE', adapter: 'omp-usage' },
      observed_at: staleObservedAt,
      stale_after: staleObservedAt + 300000,
      state: 'STALE',
    },
  ];

  const codexLane = mockLanes.find((l) => l.lane_id === 'remote_sub_codex');
  const binding = calculateBindingWindow(codexLane, telemetry, { now });
  assert.equal(binding.freshness, 'STALE');

  const score = scoreLaneShadow(codexLane, binding, { policy: createEconomicPolicy({ now }), now, queued_work: true });
  assert.ok(score.adjustments.some((a) => a.reason_code === 'STALE_TELEMETRY_DEMOTION'));
  assert.ok(score.effective_rank > 6.0); // Demoted
});

test('T10 DEGRADED state on all lanes ineligible', () => {
  const impossibleRequirement = {
    trust_domain: 'classified_security_zone',
    capabilities: ['teleportation'],
  };

  const evalResult = evaluateEconomicShadow({
    requirement: impossibleRequirement,
    lanes: mockLanes,
    telemetryRecords: [],
    policy: createEconomicPolicy(),
  });

  assert.equal(evalResult.status, 'DEGRADED');
  assert.equal(evalResult.shadow_recommended_route, null);
  assert.ok(evalResult.reason_codes.includes('NO_ELIGIBLE_LANE'));
});

test('T11 explicit allowed=true precedence over high advisory percentage', () => {
  const now = 1000000;
  const telemetry = [
    {
      schema_version: 'kad-telemetry-v1',
      provider_id: 'openai-codex',
      metric: 'quota_usage',
      unit: 'percent',
      window: { kind: '5h', durationMs: 18000000, resets_at: now + 5000000 },
      quota: { limit: 100, used: 100, remaining: 0 },
      source: { class: 'AUTHORITATIVE_REMOTE', adapter: 'omp-usage' },
      metadata: { allowed: true, limitReached: false },
      state: 'AUTHORITATIVE_REMOTE',
    },
  ];

  const codexLane = mockLanes.find((l) => l.lane_id === 'remote_sub_codex');
  const binding = calculateBindingWindow(codexLane, telemetry, { now });
  assert.equal(binding.allowed, true);
  assert.equal(binding.limit_reached, false);

  const score = scoreLaneShadow(codexLane, binding, { policy: createEconomicPolicy({ now }), now, queued_work: false });
  assert.equal(score.eligible, true);
});

test('T12 explicit limitReached=true blocks constrained lane immediately', () => {
  const now = 1000000;
  const telemetry = [
    {
      schema_version: 'kad-telemetry-v1',
      provider_id: 'openai-codex',
      metric: 'quota_usage',
      unit: 'percent',
      window: { kind: '5h', durationMs: 18000000, resets_at: now + 5000000 },
      quota: { limit: 100, used: 100, remaining: 0 },
      source: { class: 'AUTHORITATIVE_REMOTE', adapter: 'omp-usage' },
      metadata: { allowed: false, limitReached: true },
      state: 'AUTHORITATIVE_REMOTE',
    },
  ];

  const codexLane = mockLanes.find((l) => l.lane_id === 'remote_sub_codex');
  const binding = calculateBindingWindow(codexLane, telemetry, { now });
  assert.equal(binding.limit_reached, true);

  const score = scoreLaneShadow(codexLane, binding, { policy: createEconomicPolicy({ now }), now, queued_work: false });
  assert.equal(score.eligible, false);
  assert.equal(score.rejection_reason, 'RATE_LIMIT_REACHED');
});

test('T13 free/local lane preference preserved under standard policy', () => {
  const evalResult = evaluateEconomicShadow({
    requirement: standardRequirement,
    lanes: mockLanes,
    telemetryRecords: [],
    policy: createEconomicPolicy(),
    queued_work: false,
  });

  assert.equal(evalResult.shadow_recommended_route, 'deterministic_existing');
  assert.ok(evalResult.reason_codes.includes('EXECUTION_CLASS_DETERMINISTIC_EXISTING'));
});

test('T14 paid lane cannot be recommended when paid_authorized=false', () => {
  const paidOnlyLanes = mockLanes.filter((l) => l.payg === true || l.billing_class === 'PAID');
  const policyWithoutPaid = createEconomicPolicy({
    spend: { payg_authorized: false, allow_paid_fallback: false },
  });

  const evalResult = evaluateEconomicShadow({
    requirement: standardRequirement,
    lanes: paidOnlyLanes,
    telemetryRecords: [],
    policy: policyWithoutPaid,
  });

  assert.equal(evalResult.status, 'DEGRADED');
  assert.equal(evalResult.shadow_recommended_route, null);
  assert.ok(evalResult.rejections.some((r) => r.reason === 'PAYG_NOT_AUTHORIZED'));
});

test('T15 side-by-side decision recording captures both actual and shadow', () => {
  const now = 1000000;
  const evalResult = evaluateEconomicShadow({
    requirement: standardRequirement,
    lanes: mockLanes,
    telemetryRecords: [],
    policy: createEconomicPolicy({ now }),
    now,
  });

  assert.ok('actual_route' in evalResult);
  assert.ok('shadow_recommended_route' in evalResult);
  assert.ok('same_or_different' in evalResult);
  assert.ok('candidate_lanes' in evalResult);
  assert.ok('economic_factors' in evalResult);
  assert.ok('policy_constraints' in evalResult);
  assert.ok('paid_authorized' in evalResult);
});

test('T16 immutability and zero side-effects on actual route', () => {
  const policy = createEconomicPolicy();
  const rawActual = routeEconomically({
    requirement: standardRequirement,
    lanes: mockLanes,
    policy,
  });

  const shadowResult = evaluateEconomicShadow({
    requirement: standardRequirement,
    lanes: mockLanes,
    telemetryRecords: [],
    policy,
  });

  assert.equal(shadowResult.actual_route, rawActual.selected_lane);
  // Ensure lanes array and policy are not mutated
  assert.equal(mockLanes[0].lane_id, 'deterministic_existing');
  assert.equal(policy.spend.payg_authorized, false);
});

test('T17 deterministic replay consistency', () => {
  const now = 123456789;
  const telemetry = [
    {
      schema_version: 'kad-telemetry-v1',
      provider_id: 'openai-codex',
      metric: 'quota_usage',
      unit: 'percent',
      window: { kind: '5h', durationMs: 18000000, resets_at: now + 3600000 },
      quota: { limit: 100, used: 30, remaining: 70 },
      source: { class: 'AUTHORITATIVE_REMOTE', adapter: 'omp-usage' },
      observed_at: now,
      state: 'AUTHORITATIVE_REMOTE',
    },
  ];

  const res1 = evaluateEconomicShadow({
    requirement: standardRequirement,
    lanes: mockLanes,
    telemetryRecords: telemetry,
    policy: createEconomicPolicy({ now }),
    now,
    queued_work: true,
  });

  const res2 = evaluateEconomicShadow({
    requirement: standardRequirement,
    lanes: mockLanes,
    telemetryRecords: telemetry,
    policy: createEconomicPolicy({ now }),
    now,
    queued_work: true,
  });

  assert.deepEqual(res1, res2);
});

test('T18 malformed telemetry graceful degradation', () => {
  const malformedTelemetry = [
    null,
    undefined,
    { invalid: 'schema' },
    { provider_id: 'openai-codex', quota: null },
    { provider_id: 'openai-codex', quota: { limit: 'not_a_number' } },
  ];

  assert.doesNotThrow(() => {
    const res = evaluateEconomicShadow({
      requirement: standardRequirement,
      lanes: mockLanes,
      telemetryRecords: malformedTelemetry,
      policy: createEconomicPolicy(),
    });
    assert.ok(res);
    assert.equal(res.status, 'ROUTED');
  });
});
