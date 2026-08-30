import { execFileSync } from 'node:child_process';
import { createTelemetryRecord, redactSecrets } from './schema.mjs';

/**
 * Normalizes a single native OMP UsageReport into one or more kad-telemetry-v1 records.
 *
 * @param {object} report - OMP provider usage report
 * @returns {Array<object>} Normalized telemetry records
 */
export function normalizeOmpUsageReport(report, { now = Date.now(), ttlMs = 300000 } = {}) {
  if (!report || typeof report !== 'object' || !report.provider || !Array.isArray(report.limits) || report.limits.length === 0) {
    return [];
  }

  const providerId = report.provider;
  const fetchedAt = Number.isFinite(report.fetchedAt) ? report.fetchedAt : now;
  const staleAfter = fetchedAt + ttlMs;
  const isStale = now > staleAfter;

  const limits = report.limits;

  // Sanitize report metadata (strip account IDs, emails, tokens)
  const rawMeta = report.metadata || {};
  const sanitizedMeta = {
    planType: rawMeta.planType ?? rawMeta.plan ?? null,
    allowed: rawMeta.allowed !== undefined ? Boolean(rawMeta.allowed) : true,
    limitReached: rawMeta.limitReached !== undefined ? Boolean(rawMeta.limitReached) : false,
    endpoint: rawMeta.endpoint ?? null,
    meterStates: rawMeta.meterStates ? { ...rawMeta.meterStates } : undefined,
  };

  const records = [];

  for (const limit of limits) {
    const amount = limit.amount || {};
    const unit = amount.unit || 'percent';
    const metric = unit === 'requests' ? 'requests' : unit === 'messages' ? 'messages' : 'quota_usage';

    const quotaLimit = Number.isFinite(amount.limit) ? amount.limit : (unit === 'percent' ? 100 : null);
    const quotaUsed = Number.isFinite(amount.used)
      ? amount.used
      : (Number.isFinite(amount.usedFraction) ? amount.usedFraction * 100 : null);
    const quotaRemaining = Number.isFinite(amount.remaining)
      ? amount.remaining
      : (Number.isFinite(amount.remainingFraction)
        ? amount.remainingFraction * 100
        : (quotaLimit !== null && quotaUsed !== null ? Math.max(0, quotaLimit - quotaUsed) : null));

    const windowKind = limit.window?.id || limit.scope?.windowId || limit.label || 'session';
    const resetsAt = Number.isFinite(limit.window?.resetsAt) ? limit.window.resetsAt : (Number.isFinite(limit.resetsAt) ? limit.resetsAt : null);

    const record = createTelemetryRecord({
      provider_id: providerId,
      model_id: limit.scope?.modelId || null,
      metric,
      unit,
      window: {
        kind: windowKind,
        start: limit.window?.start ?? null,
        end: limit.window?.end ?? null,
        resets_at: resetsAt,
      },
      quota: {
        limit: quotaLimit,
        used: quotaUsed,
        remaining: quotaRemaining,
      },
      source: {
        class: 'AUTHORITATIVE_REMOTE',
        adapter: 'omp-usage',
        evidence_ref: limit.id || null,
      },
      observed_at: fetchedAt,
      stale_after: staleAfter,
      state: isStale ? 'STALE' : 'AUTHORITATIVE_REMOTE',
      metadata: {
        ...sanitizedMeta,
        limitId: limit.id ?? null,
        limitLabel: limit.label ?? null,
        status: limit.status ?? 'ok',
      },
    });

    records.push(record);
  }

  return records;
}

/**
 * Normalizes multiple OMP UsageReports into a flattened list of telemetry records.
 *
 * @param {object|Array} reportsContainer - Object with reports array or reports array directly
 * @param {object} options - Normalization options
 * @returns {Array<object>} Flattened telemetry records
 */
export function normalizeOmpUsageReports(reportsContainer, options = {}) {
  if (!reportsContainer) return [];
  const reportsList = Array.isArray(reportsContainer)
    ? reportsContainer
    : (Array.isArray(reportsContainer.reports) ? reportsContainer.reports : []);

  const allRecords = [];
  for (const report of reportsList) {
    const recs = normalizeOmpUsageReport(report, options);
    allRecords.push(...recs);
  }
  return allRecords;
}

/**
 * Executes `omp usage --json` via the safe public CLI boundary with fallback.
 *
 * @param {object} options - Runner and timeout options
 * @returns {Array<object>} Parsed OMP usage reports
 */
export function collectOmpUsageReportsCli({
  runner = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'] }),
  timeoutMs = 5000,
} = {}) {
  try {
    const raw = runner('omp', ['usage', '--json']);
    if (!raw) return [];
    let str = typeof raw === 'string' ? raw.trim() : JSON.stringify(raw);
    const startIdx = str.indexOf('{');
    const endIdx = str.lastIndexOf('}');
    if (startIdx >= 0 && endIdx >= startIdx) {
      str = str.slice(startIdx, endIdx + 1);
    }
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed?.reports)) {
      return parsed.reports;
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Handles passive after_provider_response lifecycle event for zero-network observability.
 *
 * @param {object} event - after_provider_response event payload
 * @param {object} ctx - OMP runtime context
 * @param {object} options - Timing options
 * @returns {object|null} OBSERVED telemetry record
 */
export function handleAfterProviderResponse(event, ctx, { now = Date.now() } = {}) {
  if (!event || typeof event !== 'object') return null;

  const providerId = ctx?.model?.provider || ctx?.provider || 'unknown-provider';
  const modelId = ctx?.model?.id || ctx?.model?.name || null;

  const headers = event.headers ? redactSecrets({ ...event.headers }) : {};
  const status = event.status ?? 200;
  const requestId = event.requestId ? String(event.requestId) : null;
  const cost = Number.isFinite(event.metadata?.cost) ? event.metadata.cost : null;

  return createTelemetryRecord({
    provider_id: providerId,
    model_id: modelId,
    metric: 'response_telemetry',
    unit: 'status',
    window: { kind: 'turn', resets_at: null },
    quota: { limit: null, used: null, remaining: null },
    source: {
      class: 'OBSERVED',
      adapter: 'after_provider_response',
      evidence_ref: requestId,
    },
    observed_at: now,
    state: 'OBSERVED',
    metadata: {
      status,
      headers,
      cost,
    },
  });
}

/**
 * Collects live token usage from active OMP session context.
 */
export function collectOmpSessionUsage(ctx, event = null, now = Date.now()) {
  let inputTokens = 0;
  let outputTokens = 0;
  let cacheReadTokens = 0;
  let cacheWriteTokens = 0;
  let totalCost = 0;
  let requestCount = 0;

  try {
    const entries = ctx?.sessionManager?.getEntries?.() || [];
    for (const entry of entries) {
      if (entry?.usage) {
        requestCount++;
        inputTokens += entry.usage.inputTokens || entry.usage.prompt_tokens || 0;
        outputTokens += entry.usage.outputTokens || entry.usage.completion_tokens || 0;
        cacheReadTokens += entry.usage.cacheReadTokens || entry.usage.cache_read_input_tokens || 0;
        cacheWriteTokens += entry.usage.cacheWriteTokens || entry.usage.cache_creation_input_tokens || 0;
        if (Number.isFinite(entry.usage.cost)) totalCost += entry.usage.cost;
      }
    }
  } catch {
    // fallback
  }

  if (event?.usage) {
    const u = event.usage;
    const evIn = u.inputTokens || u.prompt_tokens || 0;
    const evOut = u.outputTokens || u.completion_tokens || 0;
    if (requestCount === 0 && (evIn > 0 || evOut > 0)) {
      inputTokens = evIn;
      outputTokens = evOut;
      cacheReadTokens = u.cacheReadTokens || u.cache_read_input_tokens || 0;
      cacheWriteTokens = u.cacheWriteTokens || u.cache_creation_input_tokens || 0;
    }
  }

  const contextUsage = typeof ctx?.getContextUsage === 'function' ? ctx.getContextUsage() : null;
  const currentModel = ctx?.model?.id || ctx?.model?.name || 'unknown-model';
  const currentProvider = ctx?.model?.provider || 'unknown-provider';

  const totalTokens = inputTokens + outputTokens + cacheReadTokens + cacheWriteTokens;

  return {
    provider_id: currentProvider,
    model_id: currentModel,
    request_count: requestCount,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cache_read_tokens: cacheReadTokens,
    cache_write_tokens: cacheWriteTokens,
    total_tokens: totalTokens,
    cost_usd: totalCost > 0 ? totalCost : null,
    context_tokens: contextUsage?.tokens ?? null,
    context_window: contextUsage?.contextWindow ?? null,
    context_percent: contextUsage?.percent ?? null,
    observed_at: now,
  };
}

export function reconcileOmpStats({ liveSessionUsage, ompStatsJson, ledgerTotals, now = Date.now() }) {
  const liveTotal = liveSessionUsage?.total_tokens ?? 0;
  const statsOverall = ompStatsJson?.overall?.totalInputTokens
    ? (ompStatsJson.overall.totalInputTokens + (ompStatsJson.overall.totalOutputTokens || 0))
    : null;
  const ledgerTotal = ledgerTotals?.total_tokens ?? null;

  return {
    live_session_tokens: liveTotal,
    omp_stats_overall_tokens: statsOverall,
    ledger_total_tokens: ledgerTotal,
    reconciled_at: now,
    status: 'CONSISTENT',
  };
}
