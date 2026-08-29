import { normalizeQuota, WATERMARKS } from './quota-state.mjs';

export const EXECUTION_CLASSES = Object.freeze(['DETERMINISTIC_EXISTING', 'DETERMINISTIC_NEW', 'LOCAL_TINY_SPECIALIST', 'LOCAL_SPECIALIST', 'LOCAL_GENERAL', 'REMOTE_FREE', 'REMOTE_SUBSCRIPTION', 'REMOTE_STRONG', 'HUMAN']);
const classRank = new Map(EXECUTION_CLASSES.map((value, index) => [value, index]));

export function createEconomicPolicy(input = {}) {
  return {
    execution_order: [...EXECUTION_CLASSES],
    quota: { stale_ttl_ms: 86400000, expiring_window_ms: 86400000, green_min_fraction: 0.5, yellow_min_fraction: 0.25, ...(input.quota ?? {}) },
    spend: { payg_authorized: false, allow_paid_fallback: false, allow_auto_topup: false, max_incremental_cost: 0, ...(input.spend ?? {}) },
    now: input.now ?? Date.now()
  };
}

export function normalizeLane(input = {}, policy = createEconomicPolicy(), now = policy.now) {
  const quota = normalizeQuota(input.quota, policy.quota, now);
  return { lane_id: input.lane_id, provider: input.provider ?? null, model: input.model ?? null, execution_class: input.execution_class ?? 'HUMAN', billing_class: input.billing_class ?? 'UNKNOWN', available: input.available !== false, authority_compatible: input.authority_compatible !== false, trust_domain: input.trust_domain ?? 'UNKNOWN', capabilities: [...(input.capabilities ?? [])], context_window: input.context_window ?? 0, deterministic: input.deterministic === true, local: input.local === true, proven: input.proven ?? null, payg: input.payg === true, marginal_cost: Number.isFinite(input.marginal_cost) ? input.marginal_cost : 0, quota, performance: { accepted_tasks: 0, rejected_tasks: 0, repairs: 0, input_tokens: 0, output_tokens: 0, wall_ms: 0, ...(input.performance ?? {}) } };
}

function eligible(lane, requirement, policy) {
  if (!lane.available) return 'UNAVAILABLE';
  if (lane.trust_domain !== requirement.trust_domain) return 'TRUST_DOMAIN_MISMATCH';
  if (!(requirement.capabilities ?? []).every(capability => lane.capabilities.includes(capability))) return 'CAPABILITY_INSUFFICIENT';
  if ((requirement.min_context ?? 0) > lane.context_window) return 'CONTEXT_INSUFFICIENT';
  if (requirement.model_scope && lane.quota.scope?.model && lane.quota.scope.model !== requirement.model_scope) return 'QUOTA_SCOPE_MISMATCH';
  if (!lane.authority_compatible) return 'AUTHORITY_INCOMPATIBLE';
  if (lane.payg && (!policy.spend.payg_authorized || !policy.spend.allow_paid_fallback)) return 'PAYG_NOT_AUTHORIZED';
  if (lane.marginal_cost > policy.spend.max_incremental_cost) return 'INCREMENTAL_COST_EXCEEDS_BUDGET';
  if (lane.quota.status === 'KNOWN' && lane.quota.remaining !== null && lane.quota.remaining <= 0) return 'QUOTA_EXHAUSTED';
  return null;
}

export function routeEconomically({ requirement, lanes = [], policy: suppliedPolicy, now, queued_work = false } = {}) {
  const policy = suppliedPolicy ?? createEconomicPolicy({ now });
  const normalized = lanes.map(lane => normalizeLane({ ...lane, quota: { ...(lane.quota ?? {}), useful_queued_work: queued_work } }, policy, now ?? policy.now));
  const rejections = [];
  const candidates = [];
  for (const lane of normalized) { const reason = eligible(lane, requirement, policy); if (reason) rejections.push({ lane_id: lane.lane_id, reason }); else candidates.push(lane); }
  if (!candidates.length) return { status: 'DEGRADED', selected_lane: null, reason_codes: ['NO_ELIGIBLE_LANE'], rejections, candidates: [], observation: { watermark: 'UNKNOWN', quota_unit: null } };
  const ranked = candidates.map(lane => {
    const expiring = lane.execution_class === 'REMOTE_SUBSCRIPTION' && lane.quota.watermark === WATERMARKS.EXPIRING && queued_work && lane.quota.remaining !== null && lane.quota.capacity !== null && lane.quota.remaining / lane.quota.capacity > policy.quota.green_min_fraction;
    return { lane, rank: expiring ? classRank.get('REMOTE_FREE') - 0.5 : (classRank.get(lane.execution_class) ?? classRank.get('HUMAN')), expiring };
  }).sort((a, b) => a.rank - b.rank || String(a.lane.lane_id).localeCompare(String(b.lane.lane_id)));
  const selected = ranked[0];
  const reason_codes = ['ELIGIBLE', `EXECUTION_CLASS_${selected.lane.execution_class}`, `WATERMARK_${selected.lane.quota.watermark}`];
  if (selected.expiring) reason_codes.push('USE_IT_OR_LOSE_IT_QUOTA');
  if (selected.lane.quota.watermark === WATERMARKS.UNKNOWN || selected.lane.quota.watermark === WATERMARKS.STALE) reason_codes.push(`QUOTA_${selected.lane.quota.watermark}`);
  return { status: 'ROUTED', selected_lane: selected.lane.lane_id, selected_execution_class: selected.lane.execution_class, reason_codes, rejections, candidates: ranked.map(item => item.lane.lane_id), observation: { lane_id: selected.lane.lane_id, watermark: selected.lane.quota.watermark, quota_unit: selected.lane.quota.unit, remaining: selected.lane.quota.remaining, capacity: selected.lane.quota.capacity, confidence: selected.lane.quota.confidence, effective_window_id: selected.lane.quota.effective_window_id ?? null, windows: selected.lane.quota.windows ?? [] } };
}

export function quotaNotification(previous, next) {
  if (previous.lane_id !== next.lane_id) return { type: 'quota.observed', affected_lane_ids: [next.lane_id] };
  if (previous.quota.watermark !== next.quota.watermark) return { type: 'quota.watermark.changed', lane_id: next.lane_id, affected_lane_ids: [next.lane_id], from: previous.quota.watermark, to: next.quota.watermark };
  if (JSON.stringify(previous.quota.windows ?? []) !== JSON.stringify(next.quota.windows ?? [])) {
    const before = new Set((previous.quota.windows ?? []).map(window => window.window_id));
    const after = new Set((next.quota.windows ?? []).map(window => window.window_id));
    const windowIds = [...new Set([...before, ...after])].filter(id => JSON.stringify((previous.quota.windows ?? []).find(window => window.window_id === id)) !== JSON.stringify((next.quota.windows ?? []).find(window => window.window_id === id)));
    return { type: 'quota.window.changed', lane_id: next.lane_id, window_ids: windowIds, affected_lane_ids: [next.lane_id] };
  }
  if (previous.quota.remaining !== next.quota.remaining) return { type: 'quota.observed', lane_id: next.lane_id, affected_lane_ids: [next.lane_id] };
  return { type: 'quota.unchanged', lane_id: next.lane_id, affected_lane_ids: [] };
}
