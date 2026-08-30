import { observeRuntime } from '../runtime-status.mjs';

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

export async function probeOpenVikingHealth(fetchImpl = fetch, timeoutMs = 800) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetchImpl('http://127.0.0.1:8080/health', {
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    if (res.ok) {
      return { state: 'AVAILABLE', status_code: res.status };
    }
    return { state: 'DEGRADED', reason: `HTTP ${res.status}` };
  } catch {
    return { state: 'UNAVAILABLE', reason: 'OpenViking server offline' };
  }
}

export async function collectServiceHealth({
  probes = {},
  now = Date.now(),
} = {}) {
  const defaultProbes = {
    openviking: () => probeOpenVikingHealth(),
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
