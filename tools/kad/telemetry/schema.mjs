import { createHash } from 'node:crypto';

export const TELEMETRY_SCHEMA_VERSION = 'kad-telemetry-v1';

export const EPISTEMIC_STATES = Object.freeze([
  'AUTHORITATIVE_REMOTE',
  'AUTHORITATIVE_LOCAL',
  'OBSERVED',
  'DERIVED',
  'MANUAL',
  'STALE',
  'UNKNOWN',
  'DEGRADED',
]);

export const METRIC_UNITS = Object.freeze({
  input_tokens: 'tokens',
  output_tokens: 'tokens',
  cached_input_tokens: 'tokens',
  cached_output_tokens: 'tokens',
  reasoning_tokens: 'tokens',
  total_tokens: 'tokens',
  requests: 'requests',
  messages: 'messages',
  credits: 'credits',
  cost: 'USD',
  rate_limit: 'requests_per_minute',
  gpu_utilization: 'percent',
  vram_used: 'MiB',
  vram_total: 'MiB',
  temperature: 'C',
  power: 'W',
  local_tokens_per_second: 'tokens_per_second',
});

const secretKeyPattern = /(authorization|api[_-]?key|access[_-]?token|refresh[_-]?token|session|cookie|password|secret)/i;

export function redactSecrets(value, key = '') {
  if (secretKeyPattern.test(key)) return '[REDACTED]';
  if (Array.isArray(value)) return value.map((item) => redactSecrets(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, redactSecrets(v, k)])
    );
  }
  if (typeof value === 'string') {
    return value.replace(/(Bearer\s+|token\s*[:=]\s*|key\s*[:=]\s*|cookie\s*[:=]\s*)[^\s,;]+/gi, '$1[REDACTED]');
  }
  return value;
}

export function createTelemetryRecord(input = {}) {
  const providerId = input.provider_id ?? 'unknown-provider';
  const modelId = input.model_id ?? null;
  const metric = input.metric ?? 'total_tokens';
  const unit = input.unit ?? (METRIC_UNITS[metric] ?? 'units');

  const quotaLimit = Number.isFinite(input.quota?.limit) && input.quota.limit >= 0 ? input.quota.limit : null;
  const quotaUsed = Number.isFinite(input.quota?.used) && input.quota.used >= 0 ? input.quota.used : null;
  let quotaRemaining = Number.isFinite(input.quota?.remaining) && input.quota.remaining >= 0 ? input.quota.remaining : null;

  const sourceClass = input.source?.class ?? input.state ?? 'UNKNOWN';
  let state = EPISTEMIC_STATES.includes(input.state) ? input.state : sourceClass;

  if (quotaRemaining === null && quotaLimit !== null && quotaUsed !== null && quotaUsed <= quotaLimit) {
    quotaRemaining = quotaLimit - quotaUsed;
    if (state === 'UNKNOWN') state = 'DERIVED';
  }

  if (quotaLimit === null || quotaRemaining === null) {
    if (state === 'AUTHORITATIVE_REMOTE' && quotaLimit === null) {
      // If limit is not exposed by remote, remaining is unknown unless explicitly given
      if (quotaRemaining === null) state = 'UNKNOWN';
    }
  }

  const observedAt = Number.isFinite(input.observed_at) ? input.observed_at : Date.now();
  const staleTtlMs = input.stale_after ? input.stale_after - observedAt : 300000;
  const staleAfter = Number.isFinite(input.stale_after) ? input.stale_after : observedAt + staleTtlMs;

  const record = {
    schema_version: TELEMETRY_SCHEMA_VERSION,
    provider_id: providerId,
    model_id: modelId,
    metric,
    unit,
    window: {
      kind: input.window?.kind ?? 'session',
      start: input.window?.start ?? null,
      end: input.window?.end ?? null,
      resets_at: input.window?.resets_at ?? null,
    },
    quota: {
      limit: quotaLimit,
      used: quotaUsed,
      remaining: quotaRemaining,
    },
    source: {
      class: sourceClass,
      adapter: input.source?.adapter ?? 'unknown',
      evidence_ref: input.source?.evidence_ref ? String(input.source.evidence_ref) : null,
    },
    observed_at: observedAt,
    stale_after: staleAfter,
    state,
    ...(input.metadata ? { metadata: redactSecrets(input.metadata) } : {}),
  };

  return redactSecrets(record);
}

export function validateTelemetryRecord(record) {
  if (!record || typeof record !== 'object') return false;
  if (record.schema_version !== TELEMETRY_SCHEMA_VERSION) return false;
  if (typeof record.provider_id !== 'string') return false;
  if (typeof record.metric !== 'string') return false;
  if (typeof record.unit !== 'string') return false;
  if (!EPISTEMIC_STATES.includes(record.state)) return false;
  if (!Number.isFinite(record.observed_at)) return false;
  return true;
}

export function checkStaleness(record, now = Date.now()) {
  if (!record || typeof record !== 'object') return record;
  if (record.stale_after && now > record.stale_after && record.state !== 'UNKNOWN') {
    return {
      ...record,
      state: 'STALE',
    };
  }
  return record;
}

export function normalizeTelemetryObservation(rawObservation, policy = {}, now = Date.now()) {
  const record = createTelemetryRecord({
    ...rawObservation,
    observed_at: rawObservation.observed_at ?? now,
  });
  return checkStaleness(record, now);
}

const CLASS_AUTHORITY_RANK = {
  AUTHORITATIVE_REMOTE: 1,
  AUTHORITATIVE_LOCAL: 2,
  OBSERVED: 3,
  DERIVED: 4,
  MANUAL: 5,
  STALE: 6,
  UNKNOWN: 7,
  DEGRADED: 8,
};

export function reconcileTelemetry(observations = [], now = null) {
  if (!observations.length) {
    return {
      effective: createTelemetryRecord({ state: 'UNKNOWN' }),
      provenance: [],
      delta: { used: null, remaining: null },
    };
  }

  const effectiveNow = Number.isFinite(now) ? now : (observations.length ? Math.max(0, ...observations.map((o) => o.observed_at || 0)) : Date.now());
  const evaluated = observations.map((obs) => checkStaleness(obs, effectiveNow));
  const sorted = [...evaluated].sort((a, b) => {
    const rankA = CLASS_AUTHORITY_RANK[a.state] ?? 99;
    const rankB = CLASS_AUTHORITY_RANK[b.state] ?? 99;
    if (rankA !== rankB) return rankA - rankB;
    return (b.observed_at ?? 0) - (a.observed_at ?? 0);
  });

  const effective = sorted[0];
  let deltaRemaining = null;
  let deltaUsed = null;

  if (sorted.length > 1 && sorted[0].quota.remaining !== null && sorted[1].quota.remaining !== null) {
    deltaRemaining = Math.abs(sorted[0].quota.remaining - sorted[1].quota.remaining);
  }
  if (sorted.length > 1 && sorted[0].quota.used !== null && sorted[1].quota.used !== null) {
    deltaUsed = Math.abs(sorted[0].quota.used - sorted[1].quota.used);
  }

  return {
    effective,
    provenance: evaluated,
    delta: {
      used: deltaUsed,
      remaining: deltaRemaining,
    },
  };
}
