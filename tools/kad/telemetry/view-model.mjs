export function buildControlPlaneViewModel({
  sessionUsage = null,
  telemetryRecords = [],
  discoveredProviders = [],
  economicState = null,
  workctlState = null,
  gpuState = null,
  healthState = null,
  tokenmaxxingMetrics = null,
  now = Date.now(),
} = {}) {
  // 1. Overview
  const totalSessionTokens = sessionUsage?.total_tokens ?? 0;
  const currentModel = sessionUsage?.model_id || 'unknown';
  const currentProvider = sessionUsage?.provider_id || 'unknown';
  const executionClass = economicState?.selected_execution_class || 'UNKNOWN';
  const paidAuthorized = economicState?.paid_authorized ?? false;

  // 2. Providers mapping
  const providerViews = [];
  const processedProviders = new Set();
  const providerQuotas = new Map();

  for (const record of telemetryRecords) {
    const provId = record.provider_id;
    processedProviders.add(provId);

    const limit = record.quota?.limit ?? null;
    const used = record.quota?.used ?? null;
    const remaining = record.quota?.remaining ?? null;
    const unit = record.unit ?? 'tokens';

    let percentRemaining = null;
    let quotaDisplay = 'UNKNOWN';

    if (limit !== null && remaining !== null && limit > 0) {
      percentRemaining = Math.max(0, Math.min(100, Math.round((remaining / limit) * 100)));
      quotaDisplay = `${remaining}/${limit} ${unit} (${percentRemaining}%)`;
    } else if (unit === 'percent' && remaining !== null) {
      percentRemaining = Math.max(0, Math.min(100, Math.round(remaining)));
      quotaDisplay = `${percentRemaining}%`;
    } else if (record.state === 'UNKNOWN' || (limit === null && remaining === null && used === null)) {
      quotaDisplay = 'UNKNOWN';
    } else if (used !== null && limit === null) {
      quotaDisplay = `${used} ${unit} used (limit UNKNOWN)`;
    } else {
      quotaDisplay = 'UNKNOWN';
    }

    let resetsIn = null;
    if (record.window?.resets_at && record.window.resets_at > now) {
      const ms = record.window.resets_at - now;
      const hours = Math.floor(ms / 3600000);
      const mins = Math.floor((ms % 3600000) / 60000);
      resetsIn = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }

    const viewItem = {
      provider_id: provId,
      model_id: record.model_id ?? null,
      metric: record.metric,
      unit,
      limit,
      used,
      remaining,
      percent_remaining: percentRemaining,
      quota_display: quotaDisplay,
      source_class: record.source?.class ?? record.state,
      state: record.state,
      resets_in: resetsIn,
      window_kind: record.window?.kind ?? null,
      observed_at: record.observed_at,
      configured: true,
      enabled: true,
      metadata: record.metadata || {},
    };

    providerViews.push(viewItem);

    if (percentRemaining !== null) {
      const existing = providerQuotas.get(provId);
      if (existing === undefined || percentRemaining < existing) {
        providerQuotas.set(provId, percentRemaining);
      }
    }
  }

  // Include discovered providers not in telemetry records
  for (const dp of discoveredProviders) {
    if (!processedProviders.has(dp.provider_id)) {
      providerViews.push({
        provider_id: dp.provider_id,
        model_id: Array.from(dp.models || [])[0] ?? null,
        metric: 'total_tokens',
        unit: 'tokens',
        limit: null,
        used: null,
        remaining: null,
        percent_remaining: null,
        quota_display: 'UNKNOWN',
        source_class: 'UNKNOWN',
        state: 'UNKNOWN',
        resets_in: null,
        window_kind: null,
        observed_at: now,
        configured: dp.configured ?? true,
        enabled: dp.enabled ?? true,
        metadata: {},
      });
    }
  }

  // Primary quota percentage for active provider
  const primaryQuotaPercent = providerQuotas.get(currentProvider) ?? null;

  return {
    overview: {
      model: currentModel,
      provider: currentProvider,
      session_tokens: totalSessionTokens,
      execution_class: executionClass,
      paid_authorized: paidAuthorized,
      economic_route: economicState?.selected_lane || 'DEFAULT',
      route_status: economicState?.status || 'UNKNOWN',
      primary_quota_percent: primaryQuotaPercent,
    },
    providers: providerViews,
    gpu: gpuState,
    services: healthState?.services ?? {},
    workctl: workctlState,
    tokenmaxxing: tokenmaxxingMetrics,
    generated_at: now,
  };
}
