#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { normalizeProviderWindows, parseGitHubUsage, parseOpenRouterKey } from './remote-quota-observation.mjs';

const providers = ['openai-codex', 'opencode-go', 'github-copilot', 'openrouter'];
const now = Date.now();
function line(value) { process.stdout.write(`${JSON.stringify(value)}\n`); }
function authCheck(provider) {
  try { return JSON.parse(execFileSync('pi', ['auth', 'check', '--provider', provider, '--no-refresh', '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })); }
  catch { return { status: 'unavailable', provider }; }
}
function installed(command) { try { execFileSync('sh', ['-c', `command -v ${command}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); return true; } catch { return false; } }
function ghApi(args) {
  try { return { ok: true, output: execFileSync('gh', ['api', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) }; }
  catch (error) { return { ok: false, output: `${error.stdout ?? ''}\n${error.stderr ?? ''}`, status: error.status ?? null }; }
}
function httpStatus(output) { const match = output.match(/HTTP\/\d(?:\.\d)?\s+(\d{3})/i); return match ? Number(match[1]) : null; }
function safeWindow(window) { return { window_id: window.window_id, unit: window.unit, capacity: window.capacity, used: window.used, remaining: window.remaining, reset_at: window.reset_at, status: window.status, confidence: window.confidence, watermark: window.watermark, scope: window.scope }; }

for (const provider of providers) {
  const auth = authCheck(provider);
  line({ kind: 'provider_inventory', provider, auth_status: auth.status, auth_type: auth.authType ?? null, installed: provider === 'openai-codex' ? installed('codex') : provider === 'opencode-go' ? installed('opencode') : provider === 'github-copilot' ? installed('gh') : true, probe_time: now });
}

const openRouterAuth = JSON.parse(readFileSync(`${process.env.HOME}/.pi/agent/auth.json`, 'utf8')).openrouter;
if (!openRouterAuth?.access) {
  line({ kind: 'probe', provider: 'openrouter', surface: 'GET /api/v1/key', result: 'AUTH_MISSING', quota: null });
} else if (typeof openRouterAuth.expires === 'number' && openRouterAuth.expires < now) {
  line({ kind: 'probe', provider: 'openrouter', surface: 'GET /api/v1/key', result: 'AUTH_EXPIRED_NO_REFRESH', quota: null });
} else {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/key', { headers: { Authorization: `Bearer ${openRouterAuth.access}`, Accept: 'application/json' } });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      line({ kind: 'probe', provider: 'openrouter', surface: 'GET /api/v1/key', result: response.status === 401 || response.status === 403 ? 'AUTH_INSUFFICIENT' : 'PROBE_UNAVAILABLE', http_status: response.status, quota: null });
    } else {
      const data = body?.data ?? body ?? {};
      const windows = parseOpenRouterKey(data);
      const normalized = normalizeProviderWindows({ provider: 'openrouter', surface: 'GET /api/v1/key', windows, observed_at: now, now, raw: { data: { limit: data.limit ?? null, limit_remaining: data.limit_remaining ?? null, usage: data.usage ?? null, usage_daily: data.usage_daily ?? null, usage_weekly: data.usage_weekly ?? null, usage_monthly: data.usage_monthly ?? null, limit_reset: data.limit_reset ?? null, is_free_tier: data.is_free_tier ?? null } } });
      line({ kind: 'probe', provider: 'openrouter', surface: 'GET /api/v1/key', result: 'OBSERVED', http_status: response.status, response_fields: Object.keys(data).sort(), quota: { ...normalized, provenance: { ...normalized.provenance, raw_sanitized: undefined } } });
    }
  } catch (error) { line({ kind: 'probe', provider: 'openrouter', surface: 'GET /api/v1/key', result: 'PROBE_UNAVAILABLE', error_class: error.constructor.name, quota: null }); }
}

const ghUser = ghApi(['/user', '--jq', '.login']);
const ghLogin = ghUser.ok ? ghUser.output.trim() : null;
const ghScopesResponse = ghApi(['/user', '--include', '--silent']);
const ghScopes = (ghScopesResponse.output.match(/^x-oauth-scopes:\s*(.*)$/im)?.[1] ?? '').split(',').map(value => value.trim()).filter(Boolean);
const ghBilling = ghLogin ? ghApi([`/users/${encodeURIComponent(ghLogin)}/settings/billing/usage`, '--include']) : { ok: false, output: '', status: null };
const ghStatus = httpStatus(ghBilling.output) ?? ghBilling.status;
if (ghStatus === 200 && ghBilling.ok) {
  try {
    const body = JSON.parse(ghBilling.output.replace(/^HTTP[^\n]*\n(?:[^\n]*\n)*\n/s, ''));
    const windows = parseGitHubUsage(body);
    const normalized = normalizeProviderWindows({ provider: 'github-copilot', surface: 'GET /users/{user}/settings/billing/usage', windows, observed_at: now, now, raw: body });
    line({ kind: 'probe', provider: 'github-copilot', surface: 'GET /users/{user}/settings/billing/usage', result: 'OBSERVED', http_status: ghStatus, granted_scopes: ghScopes, quota: { ...normalized, provenance: { ...normalized.provenance, raw_sanitized: undefined } } });
  } catch { line({ kind: 'probe', provider: 'github-copilot', surface: 'GET /users/{user}/settings/billing/usage', result: 'PARSE_UNSUPPORTED', http_status: ghStatus, granted_scopes: ghScopes, quota: null }); }
} else {
  line({ kind: 'probe', provider: 'github-copilot', surface: 'GET /users/{user}/settings/billing/usage', result: ghStatus === 401 || ghStatus === 403 || !ghScopes.includes('plan') ? 'AUTH_INSUFFICIENT' : 'PROBE_UNAVAILABLE', http_status: ghStatus, granted_scopes: ghScopes, quota: null });
}

line({ kind: 'probe', provider: 'openai-codex', surface: 'interactive /status', result: 'PARSE_UNSUPPORTED', installed: installed('codex'), auth_status: authCheck('openai-codex').status, note: 'codex 0.150.1 is installed; bounded PTY status attempt produced no machine-readable allowance and timed out before any model task' });
line({ kind: 'probe', provider: 'opencode-go', surface: 'native allowance status', result: 'NOT_EXPOSED', installed: installed('opencode'), auth_status: authCheck('opencode-go').status, note: 'installed CLI exposes credentials and local statistics commands, not provider-owned current allowance state' });
