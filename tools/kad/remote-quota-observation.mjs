import { createHash } from 'node:crypto';
import { normalizeQuota } from './quota-state.mjs';
import { redactProviderOutput } from './provider-quota-adapter.mjs';

export const REMOTE_QUOTA_PARSER_VERSION = 'remote-quota-observation-1';
const hash = value => createHash('sha256').update(value, 'utf8').digest('hex');

function objectInput(raw) {
  if (raw && typeof raw === 'object') return raw;
  try { return JSON.parse(String(raw)); } catch { return {}; }
}
function finite(value) { return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null; }
function providerWindow(input) {
  const capacity = finite(input.capacity);
  const used = finite(input.used);
  const remaining = finite(input.remaining);
  return { window_id: input.window_id ?? input.id ?? input.name ?? 'unknown', unit: input.unit ?? null, capacity, used, remaining, reset_at: input.reset_at ?? null, confidence: input.confidence ?? 'OBSERVED', status: input.status ?? (capacity !== null && (used !== null || remaining !== null) ? 'KNOWN' : 'UNKNOWN') };
}

export function parseOpenAiCodexStatus(raw) {
  const value = objectInput(raw);
  const windows = value.usage?.windows ?? value.windows ?? [];
  return Array.isArray(windows) ? windows.map(window => providerWindow({ ...window, window_id: window.window_id ?? window.id, unit: window.unit ?? 'percent' })) : [];
}

export function parseOpenRouterKey(raw) {
  const value = objectInput(raw).data ?? objectInput(raw);
  const limit = finite(value.limit);
  const limitRemaining = finite(value.limit_remaining);
  const shared = { unit: 'USD', confidence: 'OBSERVED', reset_at: value.limit_reset ?? null };
  return [
    providerWindow({ ...shared, window_id: 'key', capacity: limit, remaining: limitRemaining, used: finite(value.usage), status: limit !== null && limitRemaining !== null ? 'KNOWN' : 'UNKNOWN' }),
    providerWindow({ ...shared, window_id: 'daily', used: finite(value.usage_daily), status: 'UNKNOWN' }),
    providerWindow({ ...shared, window_id: 'weekly', used: finite(value.usage_weekly), status: 'UNKNOWN' }),
    providerWindow({ ...shared, window_id: 'monthly', used: finite(value.usage_monthly), status: 'UNKNOWN' }),
  ];
}

export function parseGitHubUsage(raw) {
  const value = objectInput(raw);
  const items = value.usageItems ?? value.data?.usageItems ?? [];
  return Array.isArray(items) ? items.map(item => providerWindow({
    window_id: item.window_id ?? item.sku ?? item.product ?? 'github-usage',
    unit: item.unit ?? item.unitType ?? null,
    used: finite(item.used ?? item.netQuantity ?? item.grossQuantity),
    capacity: null,
    remaining: null,
    confidence: 'OBSERVED',
    status: 'UNKNOWN',
  })) : [];
}

export function declaredOpenCodeGoPolicy() {
  return [
    { window_id: '5-hour', unit: 'USD', capacity: 12, used: null, remaining: null, reset_at: null, status: 'UNKNOWN', confidence: 'DECLARED' },
    { window_id: 'weekly', unit: 'USD', capacity: 30, used: null, remaining: null, reset_at: null, status: 'UNKNOWN', confidence: 'DECLARED' },
    { window_id: 'monthly', unit: 'USD', capacity: 60, used: null, remaining: null, reset_at: null, status: 'UNKNOWN', confidence: 'DECLARED' },
  ];
}

export function normalizeProviderWindows({ provider, surface, windows = [], model_scope = null, observed_at = Date.now(), policy = {}, now = observed_at, raw = null, availability = 'OBSERVED' } = {}) {
  const quota = normalizeQuota({ windows: windows.map(window => ({ ...window, scope: { model: model_scope, window: window.window_id } })), source: `${provider}/${surface}`, observed_at }, policy, now);
  const sanitized = raw === null ? null : redactProviderOutput(raw);
  return {
    ...quota,
    provenance: {
      provider: provider ?? 'UNKNOWN',
      surface: surface ?? 'UNKNOWN',
      availability,
      observation_mechanism: 'provider-owned read-only adapter',
      observed_at,
      raw_source_hash: sanitized === null ? null : hash(sanitized),
      parser_version: REMOTE_QUOTA_PARSER_VERSION,
      model_scope,
      window_count: quota.windows.length,
      raw_sanitized: sanitized,
    },
  };
}

export class BoundedQuotaProbeCache {
  constructor({ probe, ttl_ms = 86400000, now = () => Date.now() } = {}) {
    if (typeof probe !== 'function') throw new Error('probe function is required');
    this.probe = probe; this.ttl_ms = ttl_ms; this.now = now; this.cached = null;
  }
  observe({ force = false } = {}) {
    const current = this.now();
    if (!force && this.cached && current - this.cached.cached_at <= this.ttl_ms) return { ...this.cached.result, cache_status: 'FRESH_CACHE' };
    const result = this.probe();
    this.cached = { cached_at: current, result };
    return { ...result, cache_status: 'LIVE' };
  }
}

export function normalizeProviderProbeError({ provider, surface, status = null, error = null, now = Date.now(), policy = {} } = {}) {
  const availability = status === 401 || status === 403 ? 'AUTH_INSUFFICIENT' : 'PROBE_UNAVAILABLE';
  return {
    availability,
    quota: normalizeQuota({ windows: [{ window_id: 'unavailable', unit: null, capacity: null, used: null, remaining: null, status: 'UNKNOWN', confidence: 'UNKNOWN', observed_at: now }] }, policy, now),
    provenance: { provider: provider ?? 'UNKNOWN', surface: surface ?? 'UNKNOWN', availability, status, error_class: error?.constructor?.name ?? null, parser_version: REMOTE_QUOTA_PARSER_VERSION, observed_at: now },
  };
}
