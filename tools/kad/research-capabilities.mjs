import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const RESEARCH_CAPABILITY_SCHEMA_VERSION = 'kad-research-capabilities-v1';

export const CAPABILITY_NAMES = Object.freeze([
  'paper_search',
  'semantic_search',
  'deep_review',
  'structured_extraction',
  'api_search',
  'bulk_export',
  'citation_graph',
  'full_text'
]);

export const CONSTRAINT_CLASSES = Object.freeze([
  'manual_only',
  'free_quota',
  'monthly_quota',
  'unlimited',
  'requires_api_key',
  'requires_paid_tier',
  'currently_unavailable'
]);

export const OBSERVATION_STATES = Object.freeze([
  'AVAILABLE',
  'DEGRADED',
  'UNAVAILABLE',
  'QUOTA_EXHAUSTED',
  'STALE',
  'UNAUTHORIZED',
  'MISSING'
]);

export const SUPPORT_MODES = Object.freeze([
  'local',
  'manual',
  'hosted',
  'api'
]);

export class ResearchCapabilityError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ResearchCapabilityError';
  }
}

export class ResearchCapabilityValidationError extends ResearchCapabilityError {
  constructor(message) {
    super(message);
    this.name = 'ResearchCapabilityValidationError';
  }
}

function parseTime(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'string') {
    const ms = Date.parse(val);
    if (Number.isFinite(ms)) return ms;
  }
  return null;
}

export class ResearchCapabilityProfile {
  constructor(input = {}) {
    if (!input || typeof input !== 'object') {
      throw new ResearchCapabilityValidationError('Capability profile must be an object');
    }

    const schemaVersion = input.schema_version ?? RESEARCH_CAPABILITY_SCHEMA_VERSION;
    if (schemaVersion !== RESEARCH_CAPABILITY_SCHEMA_VERSION) {
      throw new ResearchCapabilityValidationError(
        `Unsupported schema version: '${schemaVersion}'. Expected '${RESEARCH_CAPABILITY_SCHEMA_VERSION}'`
      );
    }
    this.schema_version = schemaVersion;

    if (!input.provider_id || typeof input.provider_id !== 'string' || !input.provider_id.trim()) {
      throw new ResearchCapabilityValidationError('provider_id is required');
    }
    this.provider_id = String(input.provider_id).trim().toLowerCase();

    this.display_name = input.display_name ? String(input.display_name).trim() : this.provider_id;
    this.description = input.description ? String(input.description).trim() : '';
    this.trust_domain = input.trust_domain ? String(input.trust_domain).trim() : 'research';

    const rawCapabilities = input.capabilities ?? {};
    if (typeof rawCapabilities !== 'object' || Array.isArray(rawCapabilities)) {
      throw new ResearchCapabilityValidationError('capabilities must be an object keyed by capability name');
    }

    const normalizedCapabilities = {};
    for (const [capName, capDef] of Object.entries(rawCapabilities)) {
      if (!CAPABILITY_NAMES.includes(capName)) {
        throw new ResearchCapabilityValidationError(
          `Unknown or invalid capability '${capName}'. Allowed: ${CAPABILITY_NAMES.join(', ')}`
        );
      }

      if (typeof capDef !== 'object' || capDef === null) {
        throw new ResearchCapabilityValidationError(`Capability definition for '${capName}' must be an object`);
      }

      const supported = capDef.supported !== false;
      const rawConstraints = Array.isArray(capDef.constraint_classes) ? capDef.constraint_classes : [];
      for (const c of rawConstraints) {
        if (!CONSTRAINT_CLASSES.includes(c)) {
          throw new ResearchCapabilityValidationError(
            `Invalid constraint class '${c}' for capability '${capName}'. Allowed: ${CONSTRAINT_CLASSES.join(', ')}`
          );
        }
      }

      let supportMode = capDef.support_mode ?? 'hosted';
      if (!SUPPORT_MODES.includes(supportMode)) {
        supportMode = 'hosted';
      }

      normalizedCapabilities[capName] = Object.freeze({
        supported,
        constraint_classes: Object.freeze([...new Set(rawConstraints)]),
        support_mode: supportMode,
        metadata: capDef.metadata && typeof capDef.metadata === 'object' ? Object.freeze({ ...capDef.metadata }) : {}
      });
    }

    this.capabilities = Object.freeze(normalizedCapabilities);
    this.provenance = input.provenance && typeof input.provenance === 'object'
      ? Object.freeze({ ...input.provenance })
      : Object.freeze({ origin: 'declared', created_at: new Date().toISOString() });

    Object.freeze(this);
  }
}

export class ResearchCapabilityObservation {
  constructor(input = {}) {
    if (!input || typeof input !== 'object') {
      throw new ResearchCapabilityValidationError('Capability observation must be an object');
    }

    if (!input.provider_id || typeof input.provider_id !== 'string') {
      throw new ResearchCapabilityValidationError('provider_id is required');
    }
    this.provider_id = String(input.provider_id).trim().toLowerCase();

    if (!input.capability || !CAPABILITY_NAMES.includes(input.capability)) {
      throw new ResearchCapabilityValidationError(
        `Invalid or missing capability '${input.capability}'. Allowed: ${CAPABILITY_NAMES.join(', ')}`
      );
    }
    this.capability = input.capability;

    const state = input.state ?? 'AVAILABLE';
    if (!OBSERVATION_STATES.includes(state)) {
      throw new ResearchCapabilityValidationError(
        `Invalid observation state '${state}'. Allowed: ${OBSERVATION_STATES.join(', ')}`
      );
    }
    this.state = state;

    const observedAtMs = parseTime(input.observed_at) ?? Date.now();
    this.observed_at = new Date(observedAtMs).toISOString();

    const staleAfterMs = parseTime(input.stale_after);
    this.stale_after = staleAfterMs ? new Date(staleAfterMs).toISOString() : null;

    if (input.quota && typeof input.quota === 'object') {
      const remaining = typeof input.quota.remaining === 'number' && Number.isFinite(input.quota.remaining)
        ? input.quota.remaining
        : null;
      const capacity = typeof input.quota.capacity === 'number' && Number.isFinite(input.quota.capacity)
        ? input.quota.capacity
        : null;
      const resetAtMs = parseTime(input.quota.reset_at);

      this.quota = Object.freeze({
        remaining,
        capacity,
        unit: input.quota.unit ? String(input.quota.unit) : null,
        reset_at: resetAtMs ? new Date(resetAtMs).toISOString() : null
      });
    } else {
      this.quota = null;
    }

    this.reason = input.reason ? String(input.reason) : null;
    this.provenance = input.provenance && typeof input.provenance === 'object'
      ? Object.freeze({ ...input.provenance })
      : Object.freeze({ method: 'observation', observed_at: this.observed_at });

    Object.freeze(this);
  }
}

export function validateCapabilityProfile(input) {
  return input instanceof ResearchCapabilityProfile ? input : new ResearchCapabilityProfile(input);
}

export function validateCapabilityObservation(input) {
  return input instanceof ResearchCapabilityObservation ? input : new ResearchCapabilityObservation(input);
}

export function parseCapabilityManifest(rawText, options = {}) {
  if (typeof rawText !== 'string') {
    throw new ResearchCapabilityValidationError('Manifest raw text must be a string');
  }
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    throw new ResearchCapabilityValidationError(`Malformed manifest JSON: ${err.message}`);
  }
  return new ResearchCapabilityProfile(parsed);
}

export function serializeCapabilityManifest(profile) {
  const normalized = validateCapabilityProfile(profile);
  return JSON.stringify(normalized, null, 2);
}

export function evaluateCapabilityState(profile, observation, options = {}) {
  const nowMs = typeof options.now === 'number' ? options.now : parseTime(options.now) ?? Date.now();
  const defaultStaleTtlMs = options.defaultStaleTtlMs ?? 86400000;
  const targetCap = options.capability || observation?.capability;

  if (!profile) {
    return 'MISSING';
  }

  if (targetCap) {
    const capDef = profile.capabilities[targetCap];
    if (!capDef || capDef.supported === false) {
      return 'UNAVAILABLE';
    }
  }

  if (!observation) {
    return 'MISSING';
  }

  if (observation.state !== 'AVAILABLE') {
    return observation.state;
  }

  // Check quota remaining if present
  if (observation.quota && typeof observation.quota.remaining === 'number' && observation.quota.remaining <= 0) {
    return 'QUOTA_EXHAUSTED';
  }

  // Check staleness
  const observedAtMs = parseTime(observation.observed_at);
  const staleAfterMs = parseTime(observation.stale_after);

  if (staleAfterMs && nowMs > staleAfterMs) {
    return 'STALE';
  }

  if (observedAtMs && nowMs - observedAtMs > defaultStaleTtlMs) {
    return 'STALE';
  }

  return 'AVAILABLE';
}

export function evaluateEconomicAdmission({ capability, profile, observation, policy = {}, now = Date.now() }) {
  const normalizedProfile = validateCapabilityProfile(profile);
  const nowMs = typeof now === 'number' ? now : parseTime(now) ?? Date.now();
  const effectiveState = evaluateCapabilityState(normalizedProfile, observation, { now: nowMs, capability });

  if (effectiveState !== 'AVAILABLE' && effectiveState !== 'DEGRADED') {
    return {
      eligible: false,
      reason: effectiveState,
      effective_state: effectiveState
    };
  }

  const capDef = normalizedProfile.capabilities[capability];
  const constraints = capDef?.constraint_classes || [];

  const requiresPaid = constraints.includes('requires_paid_tier');
  const requiresApiKey = constraints.includes('requires_api_key');

  const paygAuthorized = policy.spend?.payg_authorized === true;
  const allowPaidFallback = policy.spend?.allow_paid_fallback === true;

  if (requiresPaid && (!paygAuthorized || !allowPaidFallback)) {
    return {
      eligible: false,
      reason: 'PAID_NOT_AUTHORIZED',
      effective_state: effectiveState
    };
  }

  if (requiresApiKey && policy.credentials && !policy.credentials[normalizedProfile.provider_id]) {
    return {
      eligible: false,
      reason: 'UNAUTHORIZED',
      effective_state: effectiveState
    };
  }

  return {
    eligible: true,
    reason: 'ELIGIBLE',
    effective_state: effectiveState,
    support_mode: capDef?.support_mode || 'hosted'
  };
}

export function selectResearchCapabilityRoute({ capability, candidates = [], policy = {}, now = Date.now() }) {
  if (!capability || !CAPABILITY_NAMES.includes(capability)) {
    throw new ResearchCapabilityValidationError(`Invalid capability name: '${capability}'`);
  }

  const nowMs = typeof now === 'number' ? now : parseTime(now) ?? Date.now();
  const rejections = [];
  const eligibleCandidates = [];

  for (const candidate of candidates) {
    const admission = evaluateEconomicAdmission({
      capability,
      profile: candidate.profile,
      observation: candidate.observation,
      policy,
      now: nowMs
    });

    if (admission.eligible) {
      eligibleCandidates.push({
        profile: candidate.profile,
        observation: candidate.observation,
        admission
      });
    } else {
      rejections.push({
        provider_id: candidate.profile?.provider_id || 'unknown',
        reason: admission.reason,
        effective_state: admission.effective_state
      });
    }
  }

  if (eligibleCandidates.length === 0) {
    return {
      status: 'DEGRADED',
      selected: null,
      reason: 'NO_ELIGIBLE_CAPABILITY',
      rejections,
      candidates: []
    };
  }

  // Sort eligible candidates deterministically:
  // 1. Manual / local / deterministic first
  // 2. Free / unlimited before paid
  // 3. Alphabetical provider_id for tie-breaking
  eligibleCandidates.sort((a, b) => {
    const aMode = a.admission.support_mode;
    const bMode = b.admission.support_mode;
    const modeRank = { manual: 0, local: 1, hosted: 2, api: 3 };
    const aRank = modeRank[aMode] ?? 99;
    const bRank = modeRank[bMode] ?? 99;
    if (aRank !== bRank) return aRank - bRank;

    const aConstraints = a.profile.capabilities[capability]?.constraint_classes || [];
    const bConstraints = b.profile.capabilities[capability]?.constraint_classes || [];
    const aPaid = aConstraints.includes('requires_paid_tier');
    const bPaid = bConstraints.includes('requires_paid_tier');
    if (aPaid !== bPaid) return aPaid ? 1 : -1;

    return a.profile.provider_id.localeCompare(b.profile.provider_id);
  });

  const selected = eligibleCandidates[0];
  return {
    status: 'ROUTED',
    selected: selected.profile.provider_id,
    selected_candidate: selected,
    rejections,
    candidates: eligibleCandidates.map(c => c.profile.provider_id)
  };
}

export function registerResearchCapabilities(registry, profile, observations = [], options = {}) {
  const normalizedProfile = validateCapabilityProfile(profile);
  const caps = Object.entries(normalizedProfile.capabilities)
    .filter(([_, def]) => def.supported)
    .map(([name, _]) => name);

  if (caps.length === 0) return;

  const isLocal = Object.values(normalizedProfile.capabilities).some(
    def => def.support_mode === 'local' || def.support_mode === 'manual'
  );

  const isDeterministic = Object.values(normalizedProfile.capabilities).some(
    def => def.support_mode === 'manual' || def.constraint_classes.includes('manual_only')
  );

  registry.register({
    id: normalizedProfile.provider_id,
    trust_domain: normalizedProfile.trust_domain,
    capabilities: caps,
    local: isLocal,
    deterministic: isDeterministic,
    priority: isDeterministic ? 10 : isLocal ? 5 : 0,
    context_window: options.context_window ?? 4096,
    available: true
  });

  for (const obs of observations) {
    const normalizedObs = validateCapabilityObservation(obs);
    if (normalizedObs.state !== 'AVAILABLE') {
      registry.setAvailability(normalizedProfile.provider_id, false, normalizedObs.reason || normalizedObs.state);
    }
  }
}

export class ResearchCapabilityPlane {
  #profiles = new Map();
  #observations = new Map(); // key: `${provider_id}:${capability}`

  constructor(options = {}) {
    this.trustDomain = options.trustDomain || 'research';
  }

  addProfile(profile) {
    const normalized = validateCapabilityProfile(profile);
    this.#profiles.set(normalized.provider_id, normalized);
    return normalized;
  }

  getProfile(provider_id) {
    return this.#profiles.get(String(provider_id).trim().toLowerCase()) || null;
  }

  recordObservation(observation) {
    const normalized = validateCapabilityObservation(observation);
    const key = `${normalized.provider_id}:${normalized.capability}`;
    this.#observations.set(key, normalized);
    return normalized;
  }

  getObservation(provider_id, capability) {
    const key = `${String(provider_id).trim().toLowerCase()}:${capability}`;
    return this.#observations.get(key) || null;
  }

  getEffectiveState(provider_id, capability, now = Date.now()) {
    const profile = this.getProfile(provider_id);
    const observation = this.getObservation(provider_id, capability);
    return evaluateCapabilityState(profile, observation, { now, capability });
  }

  routeCapability(capability, options = {}) {
    const candidates = [];
    for (const profile of this.#profiles.values()) {
      const observation = this.getObservation(profile.provider_id, capability);
      candidates.push({ profile, observation });
    }

    return selectResearchCapabilityRoute({
      capability,
      candidates,
      policy: options.policy,
      now: options.now
    });
  }

  loadProfilesFromDir(dirPath) {
    if (!existsSync(dirPath)) return 0;
    const entries = readdirSync(dirPath);
    let loaded = 0;
    for (const entry of entries) {
      if (entry.endsWith('.json') || entry.endsWith('.yaml') || entry.endsWith('.yml')) {
        try {
          const raw = readFileSync(join(dirPath, entry), 'utf8');
          const profile = parseCapabilityManifest(raw);
          this.addProfile(profile);
          loaded++;
        } catch (err) {
          // ignore or record load failure
        }
      }
    }
    return loaded;
  }

  profiles() {
    return [...this.#profiles.values()];
  }

  observations() {
    return [...this.#observations.values()];
  }
}
