import { routeEconomically, createEconomicPolicy, EXECUTION_CLASSES } from '../economic-router.mjs';

export function createEconomicViewModel({
  requirement = { trust_domain: 'engineering', capabilities: ['code_build'] },
  lanes = [],
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
  };
}
