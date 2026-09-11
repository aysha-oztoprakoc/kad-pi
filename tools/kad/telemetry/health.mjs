import { observeRuntime } from '../runtime-status.mjs';
import { AI_MEMORY_BASE_URL } from '../knowledge-plane-adapters.mjs';

export async function probeZoteroHealth(fetchImpl = fetch, timeoutMs = 800) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetchImpl('http://127.0.0.1:23119/api/users/0/items?limit=1', {
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    if (res.ok || res.status === 403) {
      return { state: 'AVAILABLE', status_code: res.status };
    }
    return { state: 'DEGRADED', reason: `HTTP ${res.status}` };
  } catch (error) {
    return { state: 'UNAVAILABLE', reason: 'connection refused / loopback offline' };
  }
}

export async function probeAiMemoryHealth(fetchImpl = fetch, timeoutMs = 800, token = process.env.AI_MEMORY_AUTH_TOKEN) {
  if (!token) return { state: 'DEGRADED', reason: 'AI_MEMORY_AUTH_TOKEN is not configured' };
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetchImpl(`${AI_MEMORY_BASE_URL}/admin/status`, {
      headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    if (res.ok) {
      let version = null;
      try {
        version = (await res.json())?.version ?? null;
      } catch {
        version = null;
      }
      return { state: 'AVAILABLE', status_code: res.status, version };
    }
    if (res.status === 401 || res.status === 403) {
      return { state: 'DEGRADED', reason: `ai-memory rejected the bearer token (HTTP ${res.status})` };
    }
    return { state: 'DEGRADED', reason: `HTTP ${res.status}` };
  } catch {
    return { state: 'UNAVAILABLE', reason: 'ai-memory server offline' };
  }
}

export async function collectServiceHealth({
  probes = {},
  now = Date.now(),
} = {}) {
  const defaultProbes = {
    ai_memory: () => probeAiMemoryHealth(),
    zotero: () => probeZoteroHealth(),
    needle: async () => ({ state: 'UNAVAILABLE', reason: 'Needle 2 not configured' }),
    local_runtime: async () => {
      try {
        const obs = await observeRuntime({ timeoutMs: 800 });
        return { state: obs.state, reason: obs.reason, identity: obs.identity };
      } catch (err) {
        return { state: 'UNAVAILABLE', reason: err.message };
      }
    },
  };

  const activeProbes = { ...defaultProbes, ...probes };
  const services = {};

  for (const [name, probeFn] of Object.entries(activeProbes)) {
    try {
      services[name] = await probeFn();
    } catch (error) {
      services[name] = { state: 'DEGRADED', reason: error.message };
    }
  }

  const allAvailable = Object.values(services).every((s) => s.state === 'AVAILABLE');
  const anyDegraded = Object.values(services).some((s) => s.state === 'DEGRADED');
  const globalState = allAvailable ? 'AVAILABLE' : anyDegraded ? 'DEGRADED' : 'OPERATIONAL_WITH_FALLBACKS';

  return {
    state: globalState,
    services,
    observed_at: now,
  };
}
