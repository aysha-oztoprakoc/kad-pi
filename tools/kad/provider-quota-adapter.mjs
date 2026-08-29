import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { normalizeQuota } from './quota-state.mjs';

export const QUOTA_ADAPTER_VERSION = 'provider-quota-adapter-1';
const hash = value => createHash('sha256').update(value, 'utf8').digest('hex');
const secretKey = /(authorization|api[_-]?key|access[_-]?token|refresh[_-]?token|session|cookie|password|secret)/i;

function redactValue(value, key = '') {
  if (secretKey.test(key)) return '[REDACTED]';
  if (Array.isArray(value)) return value.map(item => redactValue(item));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, redactValue(item, name)]));
  if (typeof value === 'string') return value.replace(/(Bearer\s+|token\s*[:=]\s*|key\s*[:=]\s*|cookie\s*[:=]\s*)[^\s,;]+/gi, '$1[REDACTED]');
  return value;
}

export function redactProviderOutput(raw) {
  const value = typeof raw === 'string' ? raw : JSON.stringify(raw);
  try { return JSON.stringify(redactValue(JSON.parse(value))); } catch { return redactValue(value); }
}

function parseRaw(raw) {
  if (raw && typeof raw === 'object') return { value: raw, warnings: [] };
  try { return { value: JSON.parse(String(raw)), warnings: [] }; } catch { return { value: {}, warnings: ['raw output is not valid JSON'] }; }
}

export function normalizeRawProviderQuota({ provider, surface, raw, model_scope = null, window_scope = null, observed_at = Date.now(), policy = {}, now = observed_at } = {}) {
  const parsed = parseRaw(raw);
  const sanitized = redactProviderOutput(raw);
  const candidate = parsed.value?.quota;
  const windows = Array.isArray(parsed.value?.windows) ? parsed.value.windows : Array.isArray(candidate?.windows) ? candidate.windows : null;
  const validQuota = candidate && typeof candidate === 'object' && Number.isFinite(candidate.remaining) && Number.isFinite(candidate.capacity) && candidate.capacity > 0 && typeof candidate.unit === 'string';
  const quotaInput = windows ? { windows, observed_at, source: `${provider}/${surface}`, useful_queued_work: false } : validQuota ? { ...candidate, status: candidate.status ?? 'KNOWN', observed_at: candidate.observed_at ?? observed_at, source: candidate.source ?? `${provider}/${surface}`, scope: { model: model_scope, window: window_scope } } : { status: 'UNKNOWN', unit: null, remaining: null, capacity: null, observed_at, scope: { model: model_scope, window: window_scope } };
  const quota = normalizeQuota(quotaInput, policy, now);
  return { ...quota, provenance: { provider: provider ?? 'UNKNOWN', surface: surface ?? 'UNKNOWN', observation_mechanism: 'provider-owned read-only adapter', command_identity: null, observed_at, raw_source_hash: hash(sanitized), parser_version: QUOTA_ADAPTER_VERSION, normalization_version: 'quota-state-1', model_scope, window_scope, freshness_ttl_ms: policy.stale_ttl_ms ?? 86400000, parse_warnings: [...parsed.warnings, ...(windows || validQuota ? [] : ['quota dimension not exposed or not machine-readable'])], raw_sanitized: sanitized } };
}

export class ProviderQuotaAdapter {
  constructor({ providerId, surfaceId, modelScope = null, windowScope = null, command = 'pi', args = ['auth', 'check', '--provider', providerId, '--no-refresh', '--json'], runner = (file, argv) => execFileSync(file, argv, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }), now = () => Date.now(), policy = {} } = {}) {
    if (!providerId || !surfaceId) throw new Error('providerId and surfaceId are required');
    this.providerId = providerId; this.surfaceId = surfaceId; this.modelScope = modelScope; this.windowScope = windowScope; this.command = command; this.args = args; this.runner = runner; this.now = now; this.policy = policy;
  }
  observe() {
    const observedAt = this.now();
    try {
      const raw = this.runner(this.command, this.args);
      const result = normalizeRawProviderQuota({ provider: this.providerId, surface: this.surfaceId, raw, model_scope: this.modelScope, window_scope: this.windowScope, observed_at: observedAt, policy: this.policy, now: observedAt });
      result.provenance.command_identity = `${this.command} ${this.args.join(' ')}`;
      return result;
    } catch {
      const result = normalizeRawProviderQuota({ provider: this.providerId, surface: this.surfaceId, raw: {}, model_scope: this.modelScope, window_scope: this.windowScope, observed_at: observedAt, policy: this.policy, now: observedAt });
      result.provenance.command_identity = `${this.command} ${this.args.join(' ')}`;
      result.provenance.parse_warnings = ['provider command unavailable'];
      return result;
    }
  }
}
