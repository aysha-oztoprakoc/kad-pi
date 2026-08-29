
export const RUNTIME_STATUS_SCHEMA = 'kad-runtime-status-v1';
export const RUNTIME_STATES = Object.freeze(['AVAILABLE', 'DEGRADED', 'UNAVAILABLE', 'UNKNOWN', 'STALE']);

export const SELECTED_RUNTIME = Object.freeze({
  runtime_id: 'stheno-v3.2',
  endpoint: 'http://127.0.0.1:5001/v1/models',
  endpoint_class: 'localhost-openai-models',
  expected_identity: 'L3-8B-Stheno-v3.2-Q4_K_M',
  capability: 'world',
  trust_domain: 'world',
  owner: 'external KoboldCpp process'
});

export function createRuntimeStatus(runtime = SELECTED_RUNTIME, { observedAt = new Date().toISOString(), state = 'UNKNOWN', reason = null } = {}) {
  if (!validRuntime(runtime)) throw new TypeError('runtime contract is invalid');
  return {
    schema: RUNTIME_STATUS_SCHEMA,
    runtime_id: runtime.runtime_id,
    observed_at: observedAt,
    state,
    capability: runtime.capability,
    trust_domain: runtime.trust_domain,
    endpoint_class: runtime.endpoint_class,
    identity: null,
    latency_ms: null,
    reason,
    source: 'runtime-probe'
  };
}

function validRuntime(runtime) {
  return runtime && typeof runtime.runtime_id === 'string' && typeof runtime.endpoint === 'string' && typeof runtime.expected_identity === 'string' && typeof runtime.capability === 'string' && typeof runtime.trust_domain === 'string' && typeof runtime.endpoint_class === 'string';
}

function responseIdentity(payload) {
  if (!payload || payload.object !== 'list' || !Array.isArray(payload.data)) return null;
  const identities = payload.data.filter(item => item && typeof item.id === 'string').map(item => item.id);
  return identities.find(identity => identity.toLowerCase().includes('stheno')) ?? identities[0] ?? null;
}

export async function observeRuntime({ runtime = SELECTED_RUNTIME, fetchImpl = fetch, timeoutMs = 1500, now = () => new Date().toISOString(), monotonic = () => globalThis.performance?.now?.() ?? Date.now() } = {}) {
  if (!validRuntime(runtime)) throw new TypeError('runtime contract is invalid');
  const observedAt = now();
  const started = monotonic();
  const result = createRuntimeStatus(runtime, { observedAt });
  const controller = new AbortController();
  let timer;
  const timedOut = new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(Object.assign(new Error('runtime probe timed out'), { name: 'AbortError' })); }, timeoutMs); });
  try {
    const response = await Promise.race([fetchImpl(runtime.endpoint, { signal: controller.signal, headers: { accept: 'application/json' }, cache: 'no-store' }), timedOut]);
    result.latency_ms = Math.max(0, Math.round(monotonic() - started));
    if (!response.ok) {
      result.state = 'DEGRADED';
      result.reason = `runtime health returned HTTP ${response.status}`;
      return result;
    }
    let payload;
    try { payload = await response.json(); } catch { result.reason = 'runtime health response was not valid JSON'; return result; }
    const identity = responseIdentity(payload);
    result.identity = identity;
    if (!identity) {
      result.reason = 'runtime health response did not contain an identity';
      return result;
    }
    if (!identity.toLowerCase().includes(runtime.expected_identity.toLowerCase())) {
      result.state = 'DEGRADED';
      result.reason = `runtime identity mismatch; expected ${runtime.expected_identity}`;
      return result;
    }
    const model = payload.data.find(item => item?.id === identity);
    const healthState = model?.status?.value;
    if (healthState !== 'loaded') {
      result.state = 'DEGRADED';
      result.reason = `runtime reports status ${typeof healthState === 'string' ? healthState : 'UNKNOWN'}`;
      return result;
    }
    result.state = 'AVAILABLE';
    return result;
  } catch (error) {
    result.latency_ms = Math.max(0, Math.round(monotonic() - started));
    result.reason = error?.name === 'AbortError' ? `runtime probe timed out after ${timeoutMs}ms` : 'runtime endpoint was unreachable';
    result.state = 'UNAVAILABLE';
    return result;
  } finally {
    clearTimeout(timer);
  }
}
export function runtimeTransition(previous, next) {
  const from = previous?.state;
  const to = next?.state;
  if (!RUNTIME_STATES.includes(from) || !RUNTIME_STATES.includes(to) || from === to) return null;
  if (from === 'AVAILABLE' && to === 'UNAVAILABLE') return 'AVAILABLE_TO_UNAVAILABLE';
  if (from === 'UNAVAILABLE' && to === 'AVAILABLE') return 'UNAVAILABLE_TO_AVAILABLE';
  if (from === 'AVAILABLE' && to === 'DEGRADED') return 'AVAILABLE_TO_DEGRADED';
  if (from !== 'STALE' && to === 'STALE') return 'FRESH_TO_STALE';
  return null;
}

export function applyStaleness(observation, { now = Date.now, maxAgeMs = 30000 } = {}) {
  if (!observation || typeof observation.observed_at !== 'string') return { ...observation, state: 'UNKNOWN', reason: 'observation timestamp is unavailable' };
  const age = now() - Date.parse(observation.observed_at);
  if (!Number.isFinite(age) || age < 0) return { ...observation, state: 'UNKNOWN', reason: 'observation timestamp is invalid' };
  if (age <= maxAgeMs || !['AVAILABLE', 'DEGRADED'].includes(observation.state)) return observation;
  return { ...observation, state: 'STALE', reason: `runtime observation exceeded stale threshold of ${maxAgeMs}ms` };
}

export function validateRuntimeStatus(value) {
  return Boolean(value && value.schema === RUNTIME_STATUS_SCHEMA && typeof value.runtime_id === 'string' && RUNTIME_STATES.includes(value.state) && typeof value.observed_at === 'string' && typeof value.capability === 'string' && typeof value.trust_domain === 'string' && typeof value.endpoint_class === 'string' && typeof value.source === 'string');
}
