import {
  routeEconomically,
  createEconomicPolicy,
  EXECUTION_CLASSES,
} from '../economic-router.mjs';

const classRank = new Map(EXECUTION_CLASSES.map((value, index) => [value, index]));

export const SHADOW_CONSTANTS = Object.freeze({
  GREEN_THRESHOLD: 0.50,
  YELLOW_THRESHOLD: 0.25,
  EXPIRING_URGENCY_THRESHOLD: 0.75,
  DEFAULT_EXPIRING_WINDOW_MS: 86400000,
  SUBSCRIPTION_OPPORTUNITY_OFFSET: -1.5,
  SCARCE_LONG_WINDOW_OFFSET: 1.5,
  STALE_PENALTY_OFFSET: 2.0,
});

/**
 * Matches a telemetry record to a candidate lane by provider, model, or account-wide scope.
 *
 * @param {object} lane
 * @param {object} record
 * @returns {boolean}
 */
export function matchTelemetryScope(lane, record) {
  if (!lane || !record || typeof record !== 'object') return false;

  // Account-wide match
  if (record.provider_id === '*' || record.scope?.kind === 'account') {
    return true;
  }

  // Provider mismatch
  if (record.provider_id !== lane.provider) {
    return false;
  }

  // Model-specific match / mismatch
  if (record.model_id !== null && record.model_id !== undefined) {
    return record.model_id === lane.model;
  }

  if (record.scope?.model !== null && record.scope?.model !== undefined) {
    return record.scope.model === lane.model;
  }

  // Provider-wide default matches all models of this provider
  return true;
}

/**
 * Calculates the binding (most constraining) telemetry quota window for a given lane.
 *
 * @param {object} lane
 * @param {Array<object>} telemetryRecords
 * @param {object} options
 * @returns {object}
 */
export function calculateBindingWindow(lane, telemetryRecords = [], { now = Date.now(), policy = {} } = {}) {
  const safeRecords = Array.isArray(telemetryRecords) ? telemetryRecords.filter(Boolean) : [];
  const matching = safeRecords.filter((rec) => matchTelemetryScope(lane, rec));

  if (!matching.length) {
    return {
      remaining_fraction: null,
      used_fraction: null,
      quota_pressure: null,
      reset_at: null,
      time_until_reset_ms: null,
      window_duration_ms: null,
      expiry_fraction: null,
      reset_urgency: null,
      window_kind: null,
      allowed: true,
      limit_reached: false,
      freshness: 'UNKNOWN',
      epistemic_class: 'UNKNOWN',
      binding_record: null,
      matching_count: 0,
    };
  }

  const normalizedWindows = matching.map((rec) => {
    const limit = Number.isFinite(rec.quota?.limit) && rec.quota.limit > 0 ? rec.quota.limit : null;
    const used = Number.isFinite(rec.quota?.used) && rec.quota.used >= 0 ? rec.quota.used : null;
    const remaining = Number.isFinite(rec.quota?.remaining) && rec.quota.remaining >= 0 ? rec.quota.remaining : null;
    const unit = rec.unit ?? 'tokens';

    let remainingFraction = null;
    let usedFraction = null;

    if (limit !== null && remaining !== null && limit > 0) {
      remainingFraction = Math.max(0, Math.min(1, remaining / limit));
    } else if (unit === 'percent' && remaining !== null) {
      remainingFraction = Math.max(0, Math.min(1, remaining / 100));
    }

    if (limit !== null && used !== null && limit > 0) {
      usedFraction = Math.max(0, Math.min(1, used / limit));
    } else if (unit === 'percent' && used !== null) {
      usedFraction = Math.max(0, Math.min(1, used / 100));
    }

    const quotaPressure = remainingFraction !== null ? 1.0 - remainingFraction : null;
    const resetAt = rec.window?.resets_at ? Number(rec.window.resets_at) : null;
    const timeUntilResetMs = resetAt ? Math.max(0, resetAt - now) : null;

    let windowDurationMs = rec.window?.durationMs ? Number(rec.window.durationMs) : null;
    if (!windowDurationMs && rec.window?.kind) {
      if (rec.window.kind === '5h') windowDurationMs = 18000000;
      else if (rec.window.kind === '7d') windowDurationMs = 604800000;
      else if (rec.window.kind === 'daily') windowDurationMs = 86400000;
      else if (rec.window.kind === 'monthly') windowDurationMs = 2592000000;
    }

    let expiryFraction = null;
    if (timeUntilResetMs !== null && windowDurationMs && windowDurationMs > 0) {
      expiryFraction = Math.max(0, Math.min(1, timeUntilResetMs / windowDurationMs));
    }

    let resetUrgency = 0.0;
    if (expiryFraction !== null) {
      resetUrgency = 1.0 - expiryFraction;
    } else if (timeUntilResetMs !== null && timeUntilResetMs <= (policy.expiring_window_ms ?? SHADOW_CONSTANTS.DEFAULT_EXPIRING_WINDOW_MS)) {
      resetUrgency = 0.8;
    }

    const allowed = rec.metadata?.allowed !== false;
    const limitReached = Boolean(rec.metadata?.limitReached) || (remainingFraction !== null && remainingFraction <= 0 && rec.metadata?.allowed === false);

    const isStale = rec.state === 'STALE' || (rec.observed_at && now - rec.observed_at > (policy.stale_ttl_ms ?? 86400000));
    const freshness = isStale ? 'STALE' : (rec.state || 'UNKNOWN');
    const epistemicClass = rec.source?.class || rec.state || 'UNKNOWN';

    return {
      remaining_fraction: remainingFraction,
      used_fraction: usedFraction,
      quota_pressure: quotaPressure,
      reset_at: resetAt,
      time_until_reset_ms: timeUntilResetMs,
      window_duration_ms: windowDurationMs,
      expiry_fraction: expiryFraction,
      reset_urgency: resetUrgency,
      window_kind: rec.window?.kind ?? null,
      allowed,
      limit_reached: limitReached,
      freshness,
      epistemic_class: epistemicClass,
      binding_record: rec,
      matching_count: matching.length,
    };
  });

  // Bottleneck selection:
  // 1. Any window with limit_reached === true or remaining_fraction === 0 is binding
  const blocked = normalizedWindows.find((w) => w.limit_reached === true || (w.remaining_fraction !== null && w.remaining_fraction <= 0 && w.allowed === false));
  if (blocked) return blocked;

  // 2. Select window with minimum remaining_fraction among those with known fractions
  const withFractions = normalizedWindows.filter((w) => w.remaining_fraction !== null);
  if (withFractions.length > 0) {
    withFractions.sort((a, b) => {
      const diff = a.remaining_fraction - b.remaining_fraction;
      if (Math.abs(diff) > 0.0001) return diff;
      return (a.window_duration_ms ?? Infinity) - (b.window_duration_ms ?? Infinity);
    });
    return withFractions[0];
  }

  // 3. Default to first matching record
  return normalizedWindows[0];
}

/**
 * Scores a candidate lane for shadow evaluation with deterministic inspectable adjustments.
 *
 * @param {object} lane
 * @param {object} bindingWindow
 * @param {object} options
 * @returns {object}
 */
export function scoreLaneShadow(lane, bindingWindow, { policy = createEconomicPolicy(), now = Date.now(), queued_work = false } = {}) {
  const baseRank = classRank.get(lane.execution_class) ?? classRank.get('HUMAN');
  const adjustments = [];

  // Hard safety invariant checks
  if (lane.available === false) {
    return {
      lane_id: lane.lane_id,
      eligible: false,
      rejection_reason: 'UNAVAILABLE',
      base_rank: baseRank,
      effective_rank: baseRank + 1000,
      adjustments: [],
      binding_window: bindingWindow,
    };
  }

  if (lane.payg && (!policy.spend?.payg_authorized || !policy.spend?.allow_paid_fallback)) {
    return {
      lane_id: lane.lane_id,
      eligible: false,
      rejection_reason: 'PAYG_NOT_AUTHORIZED',
      base_rank: baseRank,
      effective_rank: baseRank + 1000,
      adjustments: [],
      binding_window: bindingWindow,
    };
  }

  if (bindingWindow.limit_reached === true) {
    return {
      lane_id: lane.lane_id,
      eligible: false,
      rejection_reason: 'RATE_LIMIT_REACHED',
      base_rank: baseRank,
      effective_rank: baseRank + 1000,
      adjustments: [],
      binding_window: bindingWindow,
    };
  }

  if (bindingWindow.allowed === false) {
    return {
      lane_id: lane.lane_id,
      eligible: false,
      rejection_reason: 'DISALLOWED_BY_PROVIDER',
      base_rank: baseRank,
      effective_rank: baseRank + 1000,
      adjustments: [],
      binding_window: bindingWindow,
    };
  }

  // Subscription opportunity boost (Use-it-or-lose-it)
  if (lane.execution_class === 'REMOTE_SUBSCRIPTION') {
    const isAbundant = bindingWindow.remaining_fraction !== null && bindingWindow.remaining_fraction >= (policy.quota?.green_min_fraction ?? SHADOW_CONSTANTS.GREEN_THRESHOLD);
    const isImminent = (bindingWindow.reset_urgency !== null && bindingWindow.reset_urgency >= SHADOW_CONSTANTS.EXPIRING_URGENCY_THRESHOLD) ||
      (bindingWindow.time_until_reset_ms !== null && bindingWindow.time_until_reset_ms <= (policy.quota?.expiring_window_ms ?? SHADOW_CONSTANTS.DEFAULT_EXPIRING_WINDOW_MS));

    if (isAbundant && isImminent && queued_work === true) {
      adjustments.push({
        reason_code: 'SUBSCRIPTION_EXPIRING_OPPORTUNITY',
        offset: SHADOW_CONSTANTS.SUBSCRIPTION_OPPORTUNITY_OFFSET,
        description: 'Abundant subscription quota expiring soon during queued workload; elevated rank ahead of remote free',
      });
    }

    const isScarce = bindingWindow.remaining_fraction !== null && bindingWindow.remaining_fraction < (policy.quota?.yellow_min_fraction ?? SHADOW_CONSTANTS.YELLOW_THRESHOLD);
    const isDistant = bindingWindow.reset_urgency !== null && bindingWindow.reset_urgency < SHADOW_CONSTANTS.EXPIRING_URGENCY_THRESHOLD;

    if (isScarce && isDistant) {
      adjustments.push({
        reason_code: 'PRESERVE_SCARCE_QUOTA',
        offset: SHADOW_CONSTANTS.SCARCE_LONG_WINDOW_OFFSET,
        description: 'Scarce quota with distant reset window; demoted to preserve quota for interactive requests',
      });
    }
  }

  // Epistemic UNKNOWN handling
  if (bindingWindow.epistemic_class === 'UNKNOWN' || bindingWindow.remaining_fraction === null) {
    adjustments.push({
      reason_code: 'UNKNOWN_QUOTA_NEUTRAL',
      offset: 0.0,
      description: 'Unknown quota evaluated neutrally without synthetic bonuses or penalties',
    });
  }

  // Stale telemetry penalty
  if (bindingWindow.freshness === 'STALE' || bindingWindow.epistemic_class === 'STALE') {
    adjustments.push({
      reason_code: 'STALE_TELEMETRY_DEMOTION',
      offset: SHADOW_CONSTANTS.STALE_PENALTY_OFFSET,
      description: 'Stale telemetry demoted below fresh authoritative lanes',
    });
  }

  const totalOffset = adjustments.reduce((acc, a) => acc + a.offset, 0);
  const effectiveRank = baseRank + totalOffset;

  return {
    lane_id: lane.lane_id,
    eligible: true,
    rejection_reason: null,
    base_rank: baseRank,
    effective_rank: effectiveRank,
    adjustments,
    binding_window: bindingWindow,
  };
}

/**
 * Pure side-effect-free shadow economic evaluator.
 *
 * @param {object} params
 * @returns {object}
 */
export function evaluateEconomicShadow({
  requirement = { trust_domain: 'engineering', capabilities: ['code_build'] },
  lanes = [],
  telemetryRecords = [],
  policy: suppliedPolicy = null,
  now = Date.now(),
  queued_work = false,
  actualRouting = null,
} = {}) {
  const policy = suppliedPolicy ?? createEconomicPolicy({ now });

  // 1. Get baseline actual routing without side effects
  const actualRouteResult = actualRouting ?? routeEconomically({
    requirement,
    lanes,
    policy,
    now,
    queued_work,
  });

  const actualRoute = actualRouteResult.selected_lane ?? null;
  const actualClass = actualRouteResult.selected_execution_class ?? 'UNKNOWN';

  // 2. Evaluate requirement compatibility for each lane
  const rejections = [];
  const candidates = [];
  const quotaWindowsConsidered = [];
  const windowsRejectedByScope = [];

  // Log all telemetry records by scope matching
  const safeRecords = Array.isArray(telemetryRecords) ? telemetryRecords.filter(Boolean) : [];
  for (const rec of safeRecords) {
    const matchingLanes = lanes.filter((l) => matchTelemetryScope(l, rec));
    if (matchingLanes.length > 0) {
      quotaWindowsConsidered.push({
        provider_id: rec.provider_id,
        model_id: rec.model_id ?? null,
        window: rec.window?.kind ?? 'unknown',
        matched_lanes: matchingLanes.map((l) => l.lane_id),
      });
    } else {
      windowsRejectedByScope.push({
        provider_id: rec.provider_id,
        model_id: rec.model_id ?? null,
        reason: 'NO_MATCHING_LANE_SCOPE',
      });
    }
  }

  for (const lane of lanes) {
    if (!lane || typeof lane !== 'object') continue;

    // Check basic capability and trust requirements
    if (lane.trust_domain && requirement.trust_domain && lane.trust_domain !== requirement.trust_domain) {
      rejections.push({ lane_id: lane.lane_id, reason: 'TRUST_DOMAIN_MISMATCH' });
      continue;
    }

    if (requirement.capabilities && !requirement.capabilities.every((c) => (lane.capabilities ?? []).includes(c))) {
      rejections.push({ lane_id: lane.lane_id, reason: 'CAPABILITY_INSUFFICIENT' });
      continue;
    }

    if (requirement.min_context && (lane.context_window ?? 0) < requirement.min_context) {
      rejections.push({ lane_id: lane.lane_id, reason: 'CONTEXT_INSUFFICIENT' });
      continue;
    }

    if (lane.authority_compatible === false) {
      rejections.push({ lane_id: lane.lane_id, reason: 'AUTHORITY_INCOMPATIBLE' });
      continue;
    }

    const bindingWindow = calculateBindingWindow(lane, safeRecords, { now, policy });
    const score = scoreLaneShadow(lane, bindingWindow, { policy, now, queued_work });

    if (!score.eligible) {
      rejections.push({ lane_id: lane.lane_id, reason: score.rejection_reason });
    } else {
      candidates.push({ lane, score });
    }
  }

  // 3. Produce recommendation
  if (!candidates.length) {
    return {
      status: 'DEGRADED',
      actual_route: actualRoute,
      actual_execution_class: actualClass,
      shadow_recommended_route: null,
      shadow_recommended_class: 'UNKNOWN',
      same_or_different: actualRoute === null ? 'SAME' : 'DIFFERENT',
      candidate_lanes: [],
      rejections,
      reason_codes: ['NO_ELIGIBLE_LANE'],
      quota_windows_considered: quotaWindowsConsidered,
      windows_rejected_by_scope: windowsRejectedByScope,
      economic_factors: { queued_work, now },
      policy_constraints: {
        payg_authorized: policy.spend?.payg_authorized ?? false,
        allow_paid_fallback: policy.spend?.allow_paid_fallback ?? false,
      },
      paid_authorized: Boolean(policy.spend?.payg_authorized && policy.spend?.allow_paid_fallback),
      telemetry_freshness: safeRecords.length > 0 ? (safeRecords.some((r) => r.state === 'STALE') ? 'STALE' : 'FRESH') : 'UNKNOWN',
      epistemic_quality: safeRecords.length > 0 ? (safeRecords.every((r) => r.source?.class === 'AUTHORITATIVE_REMOTE') ? 'AUTHORITATIVE_REMOTE' : 'MIXED') : 'UNKNOWN',
    };
  }

  // Rank candidates
  candidates.sort((a, b) => {
    const diff = a.score.effective_rank - b.score.effective_rank;
    if (Math.abs(diff) > 0.0001) return diff;
    return String(a.lane.lane_id).localeCompare(String(b.lane.lane_id));
  });

  const selectedCandidate = candidates[0];
  const shadowRecommendedRoute = selectedCandidate.lane.lane_id;
  const shadowRecommendedClass = selectedCandidate.lane.execution_class;
  const sameOrDifferent = actualRoute === shadowRecommendedRoute ? 'SAME' : 'DIFFERENT';

  const reasonCodes = [
    'SHADOW_RECOMMENDED',
    `EXECUTION_CLASS_${shadowRecommendedClass}`,
  ];

  for (const adj of selectedCandidate.score.adjustments) {
    reasonCodes.push(adj.reason_code);
  }

  return {
    status: 'ROUTED',
    actual_route: actualRoute,
    actual_execution_class: actualClass,
    shadow_recommended_route: shadowRecommendedRoute,
    shadow_recommended_class: shadowRecommendedClass,
    same_or_different: sameOrDifferent,
    candidate_lanes: candidates.map((c) => ({
      lane_id: c.lane.lane_id,
      execution_class: c.lane.execution_class,
      base_rank: c.score.base_rank,
      effective_rank: c.score.effective_rank,
      adjustments: c.score.adjustments,
      binding_window: c.score.binding_window,
    })),
    rejections,
    reason_codes: reasonCodes,
    quota_windows_considered: quotaWindowsConsidered,
    windows_rejected_by_scope: windowsRejectedByScope,
    economic_factors: {
      queued_work,
      now,
      effective_rank: selectedCandidate.score.effective_rank,
    },
    policy_constraints: {
      payg_authorized: policy.spend?.payg_authorized ?? false,
      allow_paid_fallback: policy.spend?.allow_paid_fallback ?? false,
    },
    paid_authorized: Boolean(policy.spend?.payg_authorized && policy.spend?.allow_paid_fallback),
    telemetry_freshness: safeRecords.length > 0 ? (safeRecords.some((r) => r.state === 'STALE') ? 'STALE' : 'FRESH') : 'UNKNOWN',
    epistemic_quality: safeRecords.length > 0 ? (safeRecords.every((r) => r.source?.class === 'AUTHORITATIVE_REMOTE') ? 'AUTHORITATIVE_REMOTE' : 'MIXED') : 'UNKNOWN',
  };
}
