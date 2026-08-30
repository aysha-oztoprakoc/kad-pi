import { routeEconomically, createEconomicPolicy, EXECUTION_CLASSES } from '../economic-router.mjs';
import { evaluateEconomicShadow } from './economic-shadow.mjs';

export function createEconomicViewModel({
  requirement = { trust_domain: 'engineering', capabilities: ['code_build'] },
  lanes = [],
  telemetryRecords = [],
  policy = null,
  now = Date.now(),
  queued_work = false,
} = {}) {
  const economicPolicy = createEconomicPolicy(policy || {});
  const routing = routeEconomically({
    requirement,
    lanes,
    policy: economicPolicy,
    now,
    queued_work,
  });

  const shadow = evaluateEconomicShadow({
    requirement,
    lanes,
    telemetryRecords,
    policy: economicPolicy,
    now,
    queued_work,
    actualRouting: routing,
  });
  const selectedLane = lanes.find((l) => l.lane_id === routing.selected_lane);
  const paidAuthorized = Boolean(economicPolicy.spend?.payg_authorized && economicPolicy.spend?.allow_paid_fallback);

  return {
    status: routing.status,
    selected_lane: routing.selected_lane,
    selected_provider: selectedLane?.provider ?? null,
    selected_model: selectedLane?.model ?? null,
    selected_execution_class: routing.selected_execution_class ?? selectedLane?.execution_class ?? 'UNKNOWN',
    paid_authorized: paidAuthorized,
    reason_codes: routing.reason_codes || [],
    rejections: routing.rejections || [],
    candidates: routing.candidates || [],
    quota_pressure: routing.observation?.watermark ?? 'UNKNOWN',
    observation: routing.observation || null,
    shadow: {
      recommended_lane: shadow.shadow_recommended_route,
      recommended_execution_class: shadow.shadow_recommended_class,
      same_or_different: shadow.same_or_different,
      reason_codes: shadow.reason_codes,
      telemetry_freshness: shadow.telemetry_freshness,
      epistemic_quality: shadow.epistemic_quality,
      candidate_lanes: shadow.candidate_lanes,
      quota_windows_considered: shadow.quota_windows_considered,
    },
  };
}
