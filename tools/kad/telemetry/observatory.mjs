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
export const FROZEN_SHADOW_POLICY_NAME = 'kad-shadow-policy-frozen-v1';
export const FROZEN_EVALUATOR_VERSION = 'kad-economic-shadow-v1';

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
