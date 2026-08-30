export function computeTokenmaxxingMetrics({
  sessionUsage = {},
  acceptedTickets = 0,
  passedTests = 0,
  commits = 0,
  localTokens = 0,
  remoteTokens = 0,
  freeTokens = 0,
  paidTokens = 0,
} = {}) {
  const inTokens = sessionUsage.inputTokens ?? sessionUsage.input_tokens ?? 0;
  const outTokens = sessionUsage.outputTokens ?? sessionUsage.output_tokens ?? 0;
  const cacheTokens = sessionUsage.cacheReadTokens ?? sessionUsage.cache_read_tokens ?? 0;
  const total = sessionUsage.totalTokens ?? sessionUsage.total_tokens ?? (inTokens + outTokens + cacheTokens);

  const cacheDenominator = inTokens + cacheTokens;
  const cacheHitRate = cacheDenominator > 0 ? cacheTokens / cacheDenominator : 0;

  const tokensPerAcceptedTicket = acceptedTickets > 0 ? total / acceptedTickets : null;
  const tokensPerPass = passedTests > 0 ? total / passedTests : null;
  const tokensPerCommit = commits > 0 ? total / commits : null;

  const localToRemoteRatio = remoteTokens > 0 ? localTokens / remoteTokens : null;
  const freeToPaidRatio = paidTokens > 0 ? freeTokens / paidTokens : null;

  return {
    total_tokens: total,
    cache_hit_rate: cacheHitRate,
    tokens_per_accepted_ticket: tokensPerAcceptedTicket,
    tokens_per_pass: tokensPerPass,
    tokens_per_commit: tokensPerCommit,
    local_to_remote_ratio: localToRemoteRatio,
    free_to_paid_ratio: freeToPaidRatio,
    summary_label: `Cache ${(cacheHitRate * 100).toFixed(0)}% · ${(total / 1000).toFixed(1)}k tok`,
  };
}
