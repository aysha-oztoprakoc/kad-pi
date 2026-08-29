export const WATERMARKS = Object.freeze({ GREEN: 'GREEN', YELLOW: 'YELLOW', RED: 'RED', EXPIRING: 'EXPIRING', UNKNOWN: 'UNKNOWN', STALE: 'STALE' });

export function normalizeQuota(input = {}, policy = {}, now = Date.now()) {
  const status = ['KNOWN', 'UNKNOWN', 'STALE'].includes(input.status) ? input.status : 'UNKNOWN';
  const remaining = Number.isFinite(input.remaining) ? input.remaining : null;
  const capacity = Number.isFinite(input.capacity) && input.capacity > 0 ? input.capacity : null;
  const observedAt = Number.isFinite(input.observed_at) ? input.observed_at : (input.observed_at ? Date.parse(input.observed_at) : null);
  const staleTtl = policy.stale_ttl_ms ?? 86400000;
  let watermark = status === 'UNKNOWN' ? WATERMARKS.UNKNOWN : status === 'STALE' || !observedAt || now - observedAt > staleTtl ? WATERMARKS.STALE : null;
  if (watermark === null && remaining !== null && capacity !== null) {
    const fraction = remaining / capacity;
    watermark = fraction > (policy.green_min_fraction ?? 0.5) ? WATERMARKS.GREEN : fraction >= (policy.yellow_min_fraction ?? 0.25) ? WATERMARKS.YELLOW : WATERMARKS.RED;
    const resetAt = input.reset_at ? (Number.isFinite(input.reset_at) ? input.reset_at : Date.parse(input.reset_at)) : null;
    if (resetAt && resetAt >= now && resetAt - now <= (policy.expiring_window_ms ?? 86400000) && fraction > (policy.green_min_fraction ?? 0.5) && input.useful_queued_work === true) watermark = WATERMARKS.EXPIRING;
  }
  return { status, unit: input.unit ?? null, remaining, capacity, reset_at: input.reset_at ?? null, observed_at: observedAt, source: input.source ?? null, confidence: input.confidence ?? (status === 'KNOWN' ? 'OBSERVED' : 'UNKNOWN'), watermark, scope: input.scope ?? null };
}
