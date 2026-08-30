import { createTelemetryRecord } from './schema.mjs';

export function collectOmpSessionUsage(ctx, event = null, now = Date.now()) {
  let inputTokens = 0;
  let outputTokens = 0;
  let cacheReadTokens = 0;
  let cacheWriteTokens = 0;
  let totalCost = 0;
  let requestCount = 0;

  // Extract from session entries if available
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

  // Also check if current event brings immediate usage
  if (event?.usage) {
    const u = event.usage;
    const evIn = u.inputTokens || u.prompt_tokens || 0;
    const evOut = u.outputTokens || u.completion_tokens || 0;
    // If entries were empty, use event usage directly
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
