/**
 * KAD-PI Counterfactual Observatory & Longitudinal Divergence Journal
 *
 * Captures, hashes, persists, and aggregates actual vs shadow economic routing decisions
 * without granting shadow execution authority or making unsupported empirical savings claims.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

export const OBSERVATION_SCHEMA_VERSION = 'kad-shadow-observation-v1';
export const SHADOW_OBSERVATION_SCHEMA_VERSION = 'kad-shadow-observation-v1';
export const FROZEN_SHADOW_POLICY_NAME = 'kad-shadow-policy-frozen-v1';
export const FROZEN_EVALUATOR_VERSION = 'kad-economic-shadow-v1';
export const EVALUATOR_VERSION = 'kad-economic-shadow-v1';
export const READINESS_SCHEMA_VERSION = 'kad-promotion-readiness-v1';

export const READINESS_STATES = Object.freeze({
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
  INVALID_EVIDENCE: 'INVALID_EVIDENCE',
  POLICY_DRIFT: 'POLICY_DRIFT',
  UNKNOWN_DOMINATED: 'UNKNOWN_DOMINATED',
  READY_FOR_CANARY_DESIGN: 'READY_FOR_CANARY_DESIGN'
});

export const READINESS_REASON_CODES = Object.freeze({
  JOURNAL_EMPTY: 'JOURNAL_EMPTY',
  BELOW_GLOBAL_OBSERVATION_THRESHOLD: 'BELOW_GLOBAL_OBSERVATION_THRESHOLD',
  BELOW_CLASS_OCCURRENCE_THRESHOLD: 'BELOW_CLASS_OCCURRENCE_THRESHOLD',
  BELOW_CLASS_DIVERGENCE_THRESHOLD: 'BELOW_CLASS_DIVERGENCE_THRESHOLD',
  HASH_CHAIN_CORRUPTED: 'HASH_CHAIN_CORRUPTED',
  SEQUENCE_GAP_DETECTED: 'SEQUENCE_GAP_DETECTED',
  HISTORICAL_TAMPERING_DETECTED: 'HISTORICAL_TAMPERING_DETECTED',
  POLICY_FINGERPRINT_DRIFT: 'POLICY_FINGERPRINT_DRIFT',
  EVALUATOR_VERSION_DRIFT: 'EVALUATOR_VERSION_DRIFT',
  SCHEMA_VERSION_DRIFT: 'SCHEMA_VERSION_DRIFT',
  EXCESSIVE_UNKNOWN_RATE: 'EXCESSIVE_UNKNOWN_RATE',
  CANARY_DESIGN_EVIDENCE_SUFFICIENT: 'CANARY_DESIGN_EVIDENCE_SUFFICIENT'
});

export const OPPORTUNITY_CLASSES = Object.freeze([
  'EXPIRING_SUBSCRIPTION_OPPORTUNITY',
  'SCARCE_QUOTA_PRESERVATION',
  'PAID_AUTHORITY_BARRIER',
  'STALE_TELEMETRY_SUPPRESSED',
  'UNKNOWN_QUOTA_NEUTRAL',
  'LIMIT_REACHED_AVOIDANCE',
  'SCOPE_MISMATCH'
]);

export const DEFAULT_READINESS_THRESHOLDS = Object.freeze({
  global: {
    min_total_observations: 10,
    min_comparable_observations: 5,
    max_unknown_rate: 0.30
  },
  classes: {
    EXPIRING_SUBSCRIPTION_OPPORTUNITY: { min_occurrences: 5, min_divergences: 3 },
    SCARCE_QUOTA_PRESERVATION: { min_occurrences: 5, min_divergences: 3 },
    PAID_AUTHORITY_BARRIER: { min_occurrences: 5, min_divergences: 3 },
    STALE_TELEMETRY_SUPPRESSED: { min_occurrences: 5, min_divergences: 3 },
    UNKNOWN_QUOTA_NEUTRAL: { min_occurrences: 5, min_divergences: 3 },
    LIMIT_REACHED_AVOIDANCE: { min_occurrences: 5, min_divergences: 3 },
    SCOPE_MISMATCH: { min_occurrences: 5, min_divergences: 3 }
  }
});
export const DEFAULT_FROZEN_SHADOW_PARAMS = Object.freeze({
  EXPIRING_URGENCY_THRESHOLD: 0.75,
  EXPIRING_TIME_HORIZON_MS: 86400000,
  GREEN_THRESHOLD: 0.50,
  YELLOW_THRESHOLD: 0.25,
  SUBSCRIPTION_OPPORTUNITY_BOOST: 1.5,
  PRESERVE_SCARCE_QUOTA_PENALTY: 1.5,
  STALE_PENALTY_OFFSET: 2.0,
  DEFAULT_EXPIRING_WINDOW_MS: 86400000
});

export const FROZEN_SHADOW_POLICY_FINGERPRINT = computePolicyFingerprint(DEFAULT_FROZEN_SHADOW_PARAMS);

export function computePolicyFingerprint(params = {}) {
  const merged = { ...DEFAULT_FROZEN_SHADOW_PARAMS, ...params };
  const sortedKeys = Object.keys(merged).sort();
  const canonicalObj = {};
  for (const k of sortedKeys) {
    canonicalObj[k] = merged[k];
  }
  canonicalObj.evaluator_version = FROZEN_EVALUATOR_VERSION;
  canonicalObj.policy_name = FROZEN_SHADOW_POLICY_NAME;
  canonicalObj.scope_rules = {
    MODEL_SPECIFIC: 'record.model_id === lane.model',
    PROVIDER_WIDE: 'record.model_id === null',
    ACCOUNT_WIDE: "record.provider_id === '*'"
  };
  canonicalObj.binding_window_rule = 'min(remaining_fraction), tie: min(window_duration_ms)';

  const payload = JSON.stringify(canonicalObj);
  return 'sha256:' + crypto.createHash('sha256').update(payload).digest('hex');
}

export function sanitizeObservationData(input) {
  if (!input || typeof input !== 'object') return {};
  const cleaned = {};
  const prohibitedKeys = new Set([
    'prompt', 'completion', 'messages', 'message', 'chain_of_thought',
    'cot', 'thought', 'user_prompt', 'system_prompt', 'assistant_response',
    'api_key', 'apiKey', 'token', 'authorization', 'headers', 'cookie', 'cookies',
    'auth', 'password', 'secret', 'key'
  ]);

  for (const [key, value] of Object.entries(input)) {
    const lower = key.toLowerCase();
    if (prohibitedKeys.has(lower) || lower.includes('secret') || lower.includes('token') && typeof value === 'string') {
      continue;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      cleaned[key] = sanitizeObservationData(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

function canonicalizeForHash(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalizeForHash(item)).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys.map(k => JSON.stringify(k) + ':' + canonicalizeForHash(obj[k]));
  return '{' + pairs.join(',') + '}';
}

export function computeCanonicalEventHash(previousHash, eventWithoutHash) {
  const hashable = {
    previous_hash: previousHash,
    canonical_event: eventWithoutHash
  };
  const payload = canonicalizeForHash(hashable);
  return 'sha256:' + crypto.createHash('sha256').update(payload).digest('hex');
}

export function createShadowObservationEvent(input = {}) {
  const sanitized = sanitizeObservationData(input);
  const now = Number.isFinite(input.observed_at) ? input.observed_at : Date.now();
  const eventId = input.event_id || `evt-${crypto.randomBytes(8).toString('hex')}`;
  const prod = sanitized.production_route || {
    execution_class: 'UNKNOWN',
    provider: 'unknown',
    model: 'unknown',
    status: 'UNKNOWN'
  };

  const shadowEval = sanitized.shadow_evaluation || {};
  const shadowRecommendedRoute = shadowEval.shadow_recommended_route || shadowEval.recommended_lane?.provider || null;
  const shadowRecommendedClass = shadowEval.shadow_recommended_class || shadowEval.recommended_execution_class || 'UNKNOWN';

  let shadowProvider = shadowEval.recommended_lane?.provider || null;
  let shadowModel = shadowEval.recommended_lane?.model || null;
  if (!shadowProvider && typeof shadowRecommendedRoute === 'string') {
    shadowProvider = shadowRecommendedRoute;
  }

  const shadowRoute = {
    execution_class: shadowRecommendedClass,
    provider: shadowProvider,
    model: shadowModel
  };

  const isSame = shadowEval.same_or_different ? (shadowEval.same_or_different === 'SAME') : (
    prod.execution_class === shadowRoute.execution_class &&
    (prod.provider === shadowRoute.provider || (!prod.provider && !shadowRoute.provider)) &&
    (prod.model === shadowRoute.model || (!prod.model && !shadowRoute.model))
  );

  const sameOrDiff = isSame ? 'SAME' : 'DIFFERENT';
  const divergenceReasons = isSame ? [] : (Array.isArray(shadowEval.reason_codes) ? shadowEval.reason_codes : []);

  const actualTokens = sanitized.actual_tokens || {
    input_tokens: null,
    output_tokens: null,
    cached_input_tokens: null,
    total_tokens: null
  };

  const event = {
    schema_version: OBSERVATION_SCHEMA_VERSION,
    event_id: eventId,
    sequence: Number.isInteger(input.sequence) ? input.sequence : 1,
    observed_at: now,
    previous_hash: input.previous_hash || 'GENESIS',
    event_hash: '',
    session_id: String(sanitized.session_id || 'session-default'),
    workctl_ticket_id: sanitized.workctl_ticket_id || null,
    production_route: {
      execution_class: prod.execution_class,
      provider: prod.provider,
      model: prod.model,
      status: prod.status || 'ROUTED'
    },
    shadow_route: shadowRoute,
    same_or_different: sameOrDiff,
    divergence_reasons: divergenceReasons,
    quota_windows_considered: Number.isInteger(shadowEval.quota_windows_considered) ? shadowEval.quota_windows_considered : 0,
    binding_window: shadowEval.binding_window ? {
      window_duration_ms: shadowEval.binding_window.window_duration_ms || 0,
      remaining_fraction: shadowEval.binding_window.remaining_fraction ?? null,
      used_fraction: shadowEval.binding_window.used_fraction ?? null,
      scope: shadowEval.binding_window.scope || 'UNKNOWN'
    } : null,
    epistemic_states: {
      production: 'OBSERVED',
      shadow: 'COUNTERFACTUAL',
      telemetry: 'OBSERVED'
    },
    freshness: sanitized.freshness || 'FRESH',
    paid_authorized: Boolean(sanitized.paid_authorized),
    shadow_policy_fingerprint: sanitized.shadow_policy_fingerprint || FROZEN_SHADOW_POLICY_FINGERPRINT,
    actual_tokens: {
      input_tokens: Number.isInteger(actualTokens.input_tokens) ? actualTokens.input_tokens : null,
      output_tokens: Number.isInteger(actualTokens.output_tokens) ? actualTokens.output_tokens : null,
      cached_input_tokens: Number.isInteger(actualTokens.cached_input_tokens) ? actualTokens.cached_input_tokens : null,
      total_tokens: Number.isInteger(actualTokens.total_tokens) ? actualTokens.total_tokens : null
    }
  };

  if (sanitized.actual_cost_usd !== undefined) {
    event.actual_cost_usd = sanitized.actual_cost_usd;
  }
  if (sanitized.actual_outcome !== undefined) {
    event.actual_outcome = sanitized.actual_outcome;
  }
  if (sanitized.production_policy_fingerprint) {
    event.production_policy_fingerprint = sanitized.production_policy_fingerprint;
  }

  // Compute event_hash
  const eventWithoutHash = { ...event };
  delete eventWithoutHash.event_hash;
  event.event_hash = computeCanonicalEventHash(event.previous_hash, eventWithoutHash);

  return event;
}

export function resolveDefaultJournalPath() {
  const xdgState = process.env.XDG_STATE_HOME || path.join(os.homedir(), '.local', 'state');
  return path.join(xdgState, 'kad-pi', 'shadow-observatory', 'observations.jsonl');
}

export class ShadowObservatoryJournal {
  constructor(options = {}) {
    this.journalPath = options.journalPath || resolveDefaultJournalPath();
    this.maxEvents = options.maxEvents || 5000;
    this._ensureStorage();
  }

  _ensureStorage() {
    const dir = path.dirname(this.journalPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  _getTailRecord() {
    if (!fs.existsSync(this.journalPath)) return null;
    const content = fs.readFileSync(this.journalPath, 'utf8').trim();
    if (!content) return null;
    const lines = content.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (!line) continue;
      try {
        return JSON.parse(line);
      } catch {
        // malformed line
      }
    }
    return null;
  }

  appendObservation(rawEventInput) {
    this._ensureStorage();
    const tail = this._getTailRecord();
    const sequence = tail ? tail.sequence + 1 : 1;
    const previousHash = tail ? tail.event_hash : 'GENESIS';

    const event = createShadowObservationEvent({
      ...rawEventInput,
      sequence,
      previous_hash: previousHash
    });

    const line = JSON.stringify(event) + '\n';
    fs.appendFileSync(this.journalPath, line, 'utf8');

    this._enforceRetention();
    return event;
  }

  _enforceRetention() {
    if (!fs.existsSync(this.journalPath)) return;
    const content = fs.readFileSync(this.journalPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    if (lines.length <= this.maxEvents) return;

    const trimmed = lines.slice(lines.length - this.maxEvents);
    fs.writeFileSync(this.journalPath, trimmed.join('\n') + '\n', 'utf8');
  }

  readObservations(options = {}) {
    if (!fs.existsSync(this.journalPath)) return [];
    const content = fs.readFileSync(this.journalPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    const records = [];

    for (const line of lines) {
      try {
        const rec = JSON.parse(line);
        if (options.experiment_id && rec.experiment_id !== options.experiment_id) continue;
        if (options.since && rec.observed_at < options.since) continue;
        records.push(rec);
      } catch {
        // Skip corrupted line
      }
    }

    if (options.limit && Number.isInteger(options.limit) && options.limit > 0) {
      return records.slice(-options.limit);
    }
    return records;
  }

  verifyJournalIntegrity() {
    if (!fs.existsSync(this.journalPath)) {
      return { valid: true, record_count: 0, errors: [] };
    }
    const content = fs.readFileSync(this.journalPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    const errors = [];
    let expectedPrevHash = 'GENESIS';
    let expectedSeq = 1;

    for (let i = 0; i < lines.length; i++) {
      let rec;
      try {
        rec = JSON.parse(lines[i]);
      } catch (err) {
        errors.push(`Line ${i + 1}: MALFORMED_JSON (${err.message})`);
        continue;
      }

      if (i === 0 && rec.sequence !== 1) {
        // In case retention pruned earliest lines, check sequence continuity from head
        expectedSeq = rec.sequence;
        expectedPrevHash = rec.previous_hash;
      }

      if (rec.sequence !== expectedSeq) {
        errors.push(`Line ${i + 1}: SEQUENCE_MISMATCH (expected ${expectedSeq}, found ${rec.sequence})`);
      }

      if (rec.previous_hash !== expectedPrevHash) {
        errors.push(`Line ${i + 1}: PREVIOUS_HASH_MISMATCH / TAMPER_DETECTED (expected ${expectedPrevHash}, found ${rec.previous_hash})`);
      }

      const copy = { ...rec };
      const storedHash = copy.event_hash;
      delete copy.event_hash;
      const recomputedHash = computeCanonicalEventHash(rec.previous_hash, copy);

      if (storedHash !== recomputedHash) {
        errors.push(`Line ${i + 1}: HASH_MISMATCH / TAMPER_DETECTED (stored ${storedHash}, computed ${recomputedHash})`);
      }

      expectedPrevHash = storedHash;
      expectedSeq = rec.sequence + 1;
    }

    return {
      valid: errors.length === 0,
      record_count: lines.length,
      errors
    };
  }

  recoverMalformedTail() {
    if (!fs.existsSync(this.journalPath)) {
      return { recovered: false, truncated_bytes: 0 };
    }
    const raw = fs.readFileSync(this.journalPath);
    let lastValidNewline = -1;

    for (let i = raw.length - 1; i >= 0; i--) {
      if (raw[i] === 0x0a) { // '\n'
        const candidate = raw.subarray(0, i + 1).toString('utf8');
        const lines = candidate.split('\n').filter(l => l.trim().length > 0);
        let allValid = true;
        for (const line of lines) {
          try {
            JSON.parse(line);
          } catch {
            allValid = false;
            break;
          }
        }
        if (allValid) {
          lastValidNewline = i + 1;
          break;
        }
      }
    }

    if (lastValidNewline === -1 && raw.length > 0) {
      fs.writeFileSync(this.journalPath, '');
      return { recovered: true, truncated_bytes: raw.length };
    }

    if (lastValidNewline < raw.length) {
      const truncatedBytes = raw.length - lastValidNewline;
      fs.truncateSync(this.journalPath, lastValidNewline);
      return { recovered: true, truncated_bytes: truncatedBytes };
    }

    return { recovered: false, truncated_bytes: 0 };
  }
}

export function aggregateObservations(observations = [], options = {}) {
  const total = observations.length;
  let comparable = 0;
  let agreementCount = 0;
  let divergenceCount = 0;

  const opportunityCounts = {
    EXPIRING_SUBSCRIPTION_OPPORTUNITY: 0,
    SCARCE_QUOTA_PRESERVATION: 0,
    PAID_AUTHORITY_BARRIER: 0,
    STALE_TELEMETRY_SUPPRESSED: 0,
    UNKNOWN_QUOTA_NEUTRAL: 0,
    LIMIT_REACHED_AVOIDANCE: 0,
    SCOPE_MISMATCH: 0
  };

  const actualTokens = {
    input_tokens: 0,
    output_tokens: 0,
    cached_input_tokens: 0,
    total_tokens: 0
  };

  let passesCount = 0;
  let acceptedTicketsCount = 0;
  const seenTickets = new Set();

  for (const obs of observations) {
    comparable++;
    if (obs.same_or_different === 'SAME') {
      agreementCount++;
    } else {
      divergenceCount++;
      if (Array.isArray(obs.divergence_reasons)) {
        for (const reason of obs.divergence_reasons) {
          if (opportunityCounts[reason] !== undefined) {
            opportunityCounts[reason]++;
          }
        }
      }
    }

    if (obs.actual_tokens) {
      if (Number.isInteger(obs.actual_tokens.input_tokens)) {
        actualTokens.input_tokens += obs.actual_tokens.input_tokens;
      }
      if (Number.isInteger(obs.actual_tokens.output_tokens)) {
        actualTokens.output_tokens += obs.actual_tokens.output_tokens;
      }
      if (Number.isInteger(obs.actual_tokens.cached_input_tokens)) {
        actualTokens.cached_input_tokens += obs.actual_tokens.cached_input_tokens;
      }
      if (Number.isInteger(obs.actual_tokens.total_tokens)) {
        actualTokens.total_tokens += obs.actual_tokens.total_tokens;
      }
    }

    if (obs.actual_outcome === 'PASS') passesCount++;
    if (obs.workctl_ticket_id && (obs.actual_outcome === 'ACCEPTED' || obs.actual_outcome === 'PASS')) {
      if (!seenTickets.has(obs.workctl_ticket_id)) {
        seenTickets.add(obs.workctl_ticket_id);
        acceptedTicketsCount++;
      }
    }
  }

  const divergenceRate = comparable > 0 ? (divergenceCount / comparable) : 0;
  const cacheHitRate = actualTokens.total_tokens > 0 ? (actualTokens.cached_input_tokens / actualTokens.total_tokens) : 0;

  return {
    total_observations: total,
    comparable_observations: comparable,
    agreement_count: agreementCount,
    divergence_count: divergenceCount,
    divergence_rate: Math.round(divergenceRate * 1000) / 1000,
    opportunity_counts: opportunityCounts,
    actual_tokens: actualTokens,
    tokenmaxxing_metrics: {
      cache_hit_rate: Math.round(cacheHitRate * 1000) / 1000,
      actual_tokens_per_pass: passesCount > 0 ? Math.round(actualTokens.total_tokens / passesCount) : null,
      actual_tokens_per_accepted_ticket: acceptedTicketsCount > 0 ? Math.round(actualTokens.total_tokens / acceptedTicketsCount) : null
    },
    counterfactual_empirical_savings: 'UNKNOWN',
    counterfactual_quality_delta: 'UNKNOWN',
    counterfactual_pass_rate: 'UNKNOWN',
    epistemic_classification: {
      actual_tokens: 'OBSERVED',
      rates_and_counts: 'DERIVED',
      opportunity_counts: 'DERIVED',
      hypothetical_savings: 'UNKNOWN'
    }
  };
}

export function exportObservatorySnapshot(journal, targetDir, metadata = {}) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const observations = journal.readObservations();
  const integrity = journal.verifyJournalIntegrity();
  const aggregates = aggregateObservations(observations);
  const experimentId = metadata.experiment_id || `exp-${Date.now()}`;
  const exportedAt = metadata.fixed_timestamp || Date.now();

  const snapshot = {
    export_schema_version: 'kad-observatory-export-v1',
    experiment_id: experimentId,
    exported_at: exportedAt,
    evaluator_version: FROZEN_EVALUATOR_VERSION,
    policy_fingerprint: FROZEN_SHADOW_POLICY_FINGERPRINT,
    total_observations: aggregates.total_observations,
    comparable_observations: aggregates.comparable_observations,
    agreement_count: aggregates.agreement_count,
    divergence_count: aggregates.divergence_count,
    divergence_rate: aggregates.divergence_rate,
    opportunity_counts: aggregates.opportunity_counts,
    actual_tokens: aggregates.actual_tokens,
    tokenmaxxing_metrics: aggregates.tokenmaxxing_metrics,
    counterfactual_empirical_savings: 'UNKNOWN',
    integrity: {
      valid: integrity.valid,
      record_count: integrity.record_count,
      errors: integrity.errors
    },
    sample_divergences: observations.filter(o => o.same_or_different === 'DIFFERENT').slice(-10)
  };

  const snapshotPath = path.join(targetDir, 'snapshot.json');
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');

  return {
    snapshot_path: snapshotPath,
    total_exported: observations.length,
    integrity_valid: integrity.valid
  };
}

export function evaluatePromotionReadiness(events = [], options = {}) {
  const evaluatedAt = options.evaluatedAt || new Date().toISOString();
  const expectedPolicyFingerprint = options.policyFingerprint || FROZEN_SHADOW_POLICY_FINGERPRINT;
  const expectedEvaluatorVersion = options.evaluatorVersion || EVALUATOR_VERSION;
  const expectedSchemaVersion = options.schemaVersion || SHADOW_OBSERVATION_SCHEMA_VERSION;
  const thresholds = {
    global: { ...DEFAULT_READINESS_THRESHOLDS.global, ...(options.thresholds?.global || {}) },
    classes: { ...DEFAULT_READINESS_THRESHOLDS.classes, ...(options.thresholds?.classes || {}) }
  };

  const totalExamined = events.length;
  const start = totalExamined > 0 ? (events[0].observed_at ? (typeof events[0].observed_at === 'number' ? new Date(events[0].observed_at).toISOString() : String(events[0].observed_at)) : null) : null;
  const end = totalExamined > 0 ? (events[totalExamined - 1].observed_at ? (typeof events[totalExamined - 1].observed_at === 'number' ? new Date(events[totalExamined - 1].observed_at).toISOString() : String(events[totalExamined - 1].observed_at)) : null) : null;

  // 1. Integrity gate
  let hashChainValid = true;
  let sequenceValid = true;
  let tamperingDetected = false;
  const integrityErrors = [];

  let expectedPrevHash = totalExamined > 0 ? events[0].previous_hash : '0000000000000000000000000000000000000000000000000000000000000000';
  let expectedSeq = totalExamined > 0 ? events[0].sequence : 1;

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (ev.sequence !== expectedSeq) {
      sequenceValid = false;
      integrityErrors.push(`Event ${i + 1}: SEQUENCE_MISMATCH (expected ${expectedSeq}, found ${ev.sequence})`);
    }

    if (ev.previous_hash !== expectedPrevHash) {
      hashChainValid = false;
      tamperingDetected = true;
      integrityErrors.push(`Event ${i + 1}: PREVIOUS_HASH_MISMATCH (expected ${expectedPrevHash}, found ${ev.previous_hash})`);
    }

    const copy = { ...ev };
    const storedHash = copy.event_hash;
    delete copy.event_hash;
    const computedHash = computeCanonicalEventHash(ev.previous_hash, copy);

    if (storedHash !== computedHash) {
      hashChainValid = false;
      tamperingDetected = true;
      integrityErrors.push(`Event ${i + 1}: HASH_MISMATCH (stored ${storedHash}, computed ${computedHash})`);
    }

    expectedPrevHash = ev.event_hash;
    expectedSeq = ev.sequence + 1;
  }

  const integrityPassed = hashChainValid && sequenceValid && !tamperingDetected && integrityErrors.length === 0;

  // 2. Policy drift gate
  const observedPolicyFingerprintsSet = new Set();
  const observedEvaluatorVersionsSet = new Set();
  const observedSchemaVersionsSet = new Set();

  for (const ev of events) {
    const fp = ev.shadow_recommendation?.shadow_policy_fingerprint || ev.shadow_policy_fingerprint || null;
    if (fp) observedPolicyFingerprintsSet.add(fp);

    const evVer = ev.shadow_recommendation?.evaluator_version || ev.evaluator_version || null;
    if (evVer) observedEvaluatorVersionsSet.add(evVer);

    if (ev.schema_version) observedSchemaVersionsSet.add(ev.schema_version);
  }

  const observedPolicyFingerprints = Array.from(observedPolicyFingerprintsSet);
  const observedEvaluatorVersions = Array.from(observedEvaluatorVersionsSet);
  const observedSchemaVersions = Array.from(observedSchemaVersionsSet);

  let driftDetected = false;
  const driftReasons = [];

  if (observedPolicyFingerprints.some(fp => fp !== expectedPolicyFingerprint) || observedPolicyFingerprints.length > 1) {
    driftDetected = true;
    driftReasons.push(READINESS_REASON_CODES.POLICY_FINGERPRINT_DRIFT);
  }
  if (observedEvaluatorVersions.some(v => v !== expectedEvaluatorVersion) || observedEvaluatorVersions.length > 1) {
    driftDetected = true;
    driftReasons.push(READINESS_REASON_CODES.EVALUATOR_VERSION_DRIFT);
  }
  if (observedSchemaVersions.some(s => s !== expectedSchemaVersion) || observedSchemaVersions.length > 1) {
    driftDetected = true;
    driftReasons.push(READINESS_REASON_CODES.SCHEMA_VERSION_DRIFT);
  }

  const policyDriftPassed = !driftDetected;

  // 3. Quality gate
  let unknownCount = 0;
  for (const ev of events) {
    const actualStatus = ev.actual_route?.status || ev.production_route?.status || null;
    const shadowStatus = ev.shadow_recommendation?.status || null;
    if (actualStatus === 'UNKNOWN' || shadowStatus === 'UNKNOWN') {
      unknownCount++;
    }
  }

  const unknownRate = totalExamined > 0 ? (unknownCount / totalExamined) : 0;
  const qualityPassed = unknownRate <= thresholds.global.max_unknown_rate;

  // 4. Metrics & Per-advisory-class analysis
  let comparableCount = 0;
  let totalDivergences = 0;
  const classStats = {};

  for (const cls of OPPORTUNITY_CLASSES) {
    classStats[cls] = { occurrences: 0, divergences: 0 };
  }

  for (const ev of events) {
    comparableCount++;
    const isSame = ev.divergence ? ev.divergence.is_same : (ev.same_or_different === 'SAME');
    if (!isSame) {
      totalDivergences++;
    }

    const reasons = ev.divergence?.divergence_reasons || ev.shadow_recommendation?.opportunity_classes || ev.divergence_reasons || [];
    for (const r of reasons) {
      if (classStats[r]) {
        classStats[r].occurrences++;
        if (!isSame) {
          classStats[r].divergences++;
        }
      }
    }
  }

  const divergenceRate = comparableCount > 0 ? (totalDivergences / comparableCount) : 0;

  // Per-advisory-class readiness map
  const advisoryClassReadiness = {};
  let anyClassReady = false;

  for (const cls of OPPORTUNITY_CLASSES) {
    const stat = classStats[cls];
    const clsThreshold = thresholds.classes[cls] || { min_occurrences: 5, min_divergences: 3 };
    const clsDivergenceRate = stat.occurrences > 0 ? (stat.divergences / stat.occurrences) : 0;

    let clsStatus = READINESS_STATES.INSUFFICIENT_DATA;
    const clsReasons = [];
    let clsReady = false;

    if (!integrityPassed) {
      clsStatus = READINESS_STATES.INVALID_EVIDENCE;
      clsReasons.push(READINESS_REASON_CODES.HASH_CHAIN_CORRUPTED);
    } else if (driftDetected) {
      clsStatus = READINESS_STATES.POLICY_DRIFT;
      clsReasons.push(...driftReasons);
    } else if (stat.occurrences < clsThreshold.min_occurrences) {
      clsStatus = READINESS_STATES.INSUFFICIENT_DATA;
      clsReasons.push(READINESS_REASON_CODES.BELOW_CLASS_OCCURRENCE_THRESHOLD);
    } else if (stat.divergences < clsThreshold.min_divergences) {
      clsStatus = READINESS_STATES.INSUFFICIENT_DATA;
      clsReasons.push(READINESS_REASON_CODES.BELOW_CLASS_DIVERGENCE_THRESHOLD);
    } else {
      clsStatus = READINESS_STATES.READY_FOR_CANARY_DESIGN;
      clsReasons.push(READINESS_REASON_CODES.CANARY_DESIGN_EVIDENCE_SUFFICIENT);
      clsReady = true;
      anyClassReady = true;
    }

    advisoryClassReadiness[cls] = {
      status: clsStatus,
      reason_codes: clsReasons,
      occurrences: stat.occurrences,
      divergences: stat.divergences,
      divergence_rate: Math.round(clsDivergenceRate * 1000) / 1000,
      ready_for_canary_design: clsReady,
      thresholds: clsThreshold
    };
  }

  // Global status determination
  let globalStatus = READINESS_STATES.INSUFFICIENT_DATA;
  const globalReasonCodes = [];

  if (!integrityPassed) {
    globalStatus = READINESS_STATES.INVALID_EVIDENCE;
    if (tamperingDetected) globalReasonCodes.push(READINESS_REASON_CODES.HISTORICAL_TAMPERING_DETECTED);
    if (!hashChainValid) globalReasonCodes.push(READINESS_REASON_CODES.HASH_CHAIN_CORRUPTED);
    if (!sequenceValid) globalReasonCodes.push(READINESS_REASON_CODES.SEQUENCE_GAP_DETECTED);
  } else if (driftDetected) {
    globalStatus = READINESS_STATES.POLICY_DRIFT;
    globalReasonCodes.push(...driftReasons);
  } else if (!qualityPassed) {
    globalStatus = READINESS_STATES.UNKNOWN_DOMINATED;
    globalReasonCodes.push(READINESS_REASON_CODES.EXCESSIVE_UNKNOWN_RATE);
  } else if (totalExamined === 0) {
    globalStatus = READINESS_STATES.INSUFFICIENT_DATA;
    globalReasonCodes.push(READINESS_REASON_CODES.JOURNAL_EMPTY);
  } else if (totalExamined < thresholds.global.min_total_observations || comparableCount < thresholds.global.min_comparable_observations) {
    globalStatus = READINESS_STATES.INSUFFICIENT_DATA;
    globalReasonCodes.push(READINESS_REASON_CODES.BELOW_GLOBAL_OBSERVATION_THRESHOLD);
  } else if (anyClassReady) {
    globalStatus = READINESS_STATES.READY_FOR_CANARY_DESIGN;
    globalReasonCodes.push(READINESS_REASON_CODES.CANARY_DESIGN_EVIDENCE_SUFFICIENT);
  } else {
    globalStatus = READINESS_STATES.INSUFFICIENT_DATA;
    globalReasonCodes.push(READINESS_REASON_CODES.BELOW_CLASS_OCCURRENCE_THRESHOLD);
  }

  return {
    schema_version: READINESS_SCHEMA_VERSION,
    evaluated_at: evaluatedAt,
    evaluation_window: {
      start,
      end,
      total_records_examined: totalExamined
    },
    integrity_gate: {
      passed: integrityPassed,
      hash_chain_valid: hashChainValid,
      sequence_valid: sequenceValid,
      tampering_detected: tamperingDetected,
      errors: integrityErrors
    },
    policy_drift_gate: {
      passed: policyDriftPassed,
      drift_detected: driftDetected,
      expected_policy_fingerprint: expectedPolicyFingerprint,
      observed_policy_fingerprints: observedPolicyFingerprints,
      expected_evaluator_version: expectedEvaluatorVersion,
      observed_evaluator_versions: observedEvaluatorVersions
    },
    quality_gate: {
      passed: qualityPassed,
      unknown_rate: Math.round(unknownRate * 1000) / 1000,
      max_unknown_rate: thresholds.global.max_unknown_rate,
      corrupt_records_count: integrityErrors.length
    },
    global_readiness: {
      status: globalStatus,
      reason_codes: globalReasonCodes,
      metrics: {
        total_observations: totalExamined,
        comparable_observations: comparableCount,
        divergence_count: totalDivergences,
        divergence_rate: Math.round(divergenceRate * 1000) / 1000
      }
    },
    advisory_class_readiness: advisoryClassReadiness,
    epistemic_class: 'DERIVED',
    authority_contract: {
      execution_authority_granted: false,
      canary_authorized: false,
      routing_mutation_allowed: false,
      empirical_savings_claimed: false
    }
  };
}

export function evaluateJournalReadiness(journal, options = {}) {
  const observations = journal.readObservations(options);
  return evaluatePromotionReadiness(observations, options);
}
