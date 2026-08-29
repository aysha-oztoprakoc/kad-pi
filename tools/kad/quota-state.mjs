export const WATERMARKS = Object.freeze({ GREEN: 'GREEN', YELLOW: 'YELLOW', RED: 'RED', EXPIRING: 'EXPIRING', UNKNOWN: 'UNKNOWN', STALE: 'STALE' });
export const QUOTA_STATUSES = Object.freeze(['KNOWN', 'UNKNOWN', 'STALE']);
export const QUOTA_CONFIDENCE = Object.freeze(['OBSERVED', 'CALCULATED', 'DECLARED', 'UNKNOWN']);

function asTime(value) {
  if (Number.isFinite(value)) return value;
  if (typeof value === 'string') { const parsed = Date.parse(value); return Number.isFinite(parsed) ? parsed : null; }
  return null;
}

function baseUnknown(input, observedAt, confidence) {
  return {
    window_id: input.window_id ?? null,
    unit: typeof input.unit === 'string' ? input.unit : null,
    capacity: Number.isFinite(input.capacity) && input.capacity > 0 ? input.capacity : null,
    used: Number.isFinite(input.used) && input.used >= 0 ? input.used : null,
    remaining: null,
    reset_at: input.reset_at ?? null,
    status: 'UNKNOWN',
    observed_at: observedAt,
    source: input.source ?? null,
    confidence,
    watermark: WATERMARKS.UNKNOWN,
    scope: input.scope ?? null,
  };
}

export function normalizeQuotaWindow(input = {}, policy = {}, now = Date.now()) {
  const observedAt = asTime(input.observed_at);
  const staleTtl = policy.stale_ttl_ms ?? 86400000;
  const declared = input.confidence === 'DECLARED';
  let confidence = QUOTA_CONFIDENCE.includes(input.confidence) ? input.confidence : (input.status === 'KNOWN' ? 'OBSERVED' : 'UNKNOWN');
  const capacity = Number.isFinite(input.capacity) && input.capacity > 0 ? input.capacity : null;
  const used = Number.isFinite(input.used) && input.used >= 0 ? input.used : null;
  let remaining = Number.isFinite(input.remaining) && input.remaining >= 0 ? input.remaining : null;
  const unitCompatible = typeof input.unit === 'string' && (input.used_unit === undefined || input.used_unit === input.unit);
  const scopeCompatible = input.used_scope === undefined || input.scope === undefined || JSON.stringify(input.used_scope) === JSON.stringify(input.scope);
  if (remaining === null && used !== null && capacity !== null && unitCompatible && scopeCompatible && !declared && used <= capacity) {
    remaining = capacity - used;
    confidence = 'CALCULATED';
  }
  if (declared && remaining === null) return baseUnknown(input, observedAt, 'DECLARED');
  let status = QUOTA_STATUSES.includes(input.status) ? input.status : (remaining !== null && capacity !== null ? 'KNOWN' : 'UNKNOWN');
  if (remaining === null || capacity === null || typeof input.unit !== 'string') status = 'UNKNOWN';
  if (declared) status = 'UNKNOWN';
  const stale = status === 'STALE' || !observedAt || now - observedAt > staleTtl;
  if (stale && status === 'KNOWN') status = 'STALE';
  let watermark = status === 'UNKNOWN' ? WATERMARKS.UNKNOWN : stale ? WATERMARKS.STALE : null;
  if (watermark === null) {
    const fraction = remaining / capacity;
    watermark = fraction > (policy.green_min_fraction ?? 0.5) ? WATERMARKS.GREEN : fraction >= (policy.yellow_min_fraction ?? 0.25) ? WATERMARKS.YELLOW : WATERMARKS.RED;
    const resetAt = asTime(input.reset_at);
    if (resetAt && resetAt >= now && resetAt - now <= (policy.expiring_window_ms ?? 86400000) && fraction > (policy.green_min_fraction ?? 0.5) && input.useful_queued_work === true) watermark = WATERMARKS.EXPIRING;
  }
  return { window_id: input.window_id ?? null, unit: typeof input.unit === 'string' ? input.unit : null, capacity, used, remaining, reset_at: input.reset_at ?? null, status, observed_at: observedAt, source: input.source ?? null, confidence, watermark, scope: input.scope ?? null };
}

function unknownEffective(windows, watermark = WATERMARKS.UNKNOWN) {
  return { status: watermark === WATERMARKS.STALE ? 'STALE' : 'UNKNOWN', unit: null, capacity: null, used: null, remaining: null, reset_at: null, observed_at: null, source: null, confidence: 'UNKNOWN', watermark, scope: null, effective_window_id: null, windows };
}

export function effectiveQuota(windows = []) {
  if (!windows.length) return unknownEffective(windows);
  const exhausted = windows.find(window => window.status === 'KNOWN' && window.remaining !== null && window.remaining <= 0);
  if (exhausted) return { ...exhausted, effective_window_id: exhausted.window_id, windows };
  const known = windows.filter(window => window.status === 'KNOWN' && window.remaining !== null && window.capacity !== null);
  if (!known.length) return unknownEffective(windows, windows.some(window => window.status === 'STALE') ? WATERMARKS.STALE : WATERMARKS.UNKNOWN);
  const units = new Set(known.map(window => window.unit));
  if (units.size !== 1 || windows.some(window => window.status === 'UNKNOWN' || window.status === 'STALE')) return unknownEffective(windows, windows.some(window => window.status === 'STALE') ? WATERMARKS.STALE : WATERMARKS.UNKNOWN);
  const selected = [...known].sort((a, b) => a.remaining / a.capacity - b.remaining / b.capacity || String(a.window_id).localeCompare(String(b.window_id)))[0];
  return { ...selected, effective_window_id: selected.window_id, windows };
}

export function normalizeQuotaWindows(windows = [], policy = {}, now = Date.now()) {
  return windows.map(window => normalizeQuotaWindow(window, policy, now));
}

export function normalizeQuota(input = {}, policy = {}, now = Date.now()) {
  if (Array.isArray(input.windows)) {
    const windows = normalizeQuotaWindows(input.windows.map(window => ({ ...window, observed_at: window.observed_at ?? input.observed_at, source: window.source ?? input.source, useful_queued_work: window.useful_queued_work ?? input.useful_queued_work })), policy, now);
    return effectiveQuota(windows);
  }
  const one = normalizeQuotaWindow(input, policy, now);
  return { ...one, effective_window_id: one.window_id, windows: [one] };
}
