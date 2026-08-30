import { createHash } from 'node:crypto';

/**
 * Deterministically stringifies an object with sorted keys.
 * Arrays preserve their original element order.
 * @param {*} value
 * @returns {string}
 */
export function canonicalJsonStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(item => canonicalJsonStringify(item)).join(',')}]`;
  }

  const keys = Object.keys(value).sort();
  const pairs = keys.map(k => `${JSON.stringify(k)}:${canonicalJsonStringify(value[k])}`);
  return `{${pairs.join(',')}}`;
}

/**
 * Calculates SHA256 hex digest of a string or buffer.
 * @param {string|Buffer} input
 * @returns {string} 'sha256:<hex>'
 */
export function sha256Digest(input) {
  const hash = createHash('sha256').update(input).digest('hex');
  return `sha256:${hash}`;
}

/**
 * Calculates deterministic hash for a raw question string.
 * @param {string} rawText
 * @returns {string}
 */
export function calculateQuestionHash(rawText) {
  if (typeof rawText !== 'string') {
    return 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  }
  return sha256Digest(rawText.trim());
}

/**
 * Calculates deterministic record_hash for an INTENT_DECISION_EVENT_V1.
 * Hashes all canonical fields excluding 'provenance.record_hash' and 'provenance.superseded_by'.
 * @param {object} event
 * @returns {string}
 */
export function calculateEventHash(event) {
  if (!event || typeof event !== 'object') {
    throw new Error('Event must be an object to calculate hash');
  }

  const payload = {
    schema_version: event.schema_version ?? 'INTENT_DECISION_EVENT_V1',
    decision_id: event.decision_id,
    domain_id: event.domain_id,
    question: event.question ? {
      raw_text: event.question.raw_text,
      question_hash: event.question.question_hash
    } : null,
    options: Array.isArray(event.options) ? event.options.map(opt => ({
      option_id: opt.option_id,
      order: opt.order,
      raw_label: opt.raw_label,
      raw_description: opt.raw_description ?? null,
      recommended: opt.recommended ?? null,
      default_selected: opt.default_selected ?? null
    })) : [],
    response: event.response ? {
      selected_option_id: event.response.selected_option_id,
      raw_note: event.response.raw_note ?? null,
      epistemic_class: event.response.epistemic_class,
      actor_id: event.response.actor_id
    } : null,
    facilitation: event.facilitation ? {
      protocol: event.facilitation.protocol,
      recommendation_present: event.facilitation.recommendation_present ?? false,
      recommended_option_id: event.facilitation.recommended_option_id ?? null
    } : null,
    provenance: event.provenance ? {
      session_id: event.provenance.session_id,
      source_type: event.provenance.source_type,
      source_event_id: event.provenance.source_event_id ?? null,
      captured_at: event.provenance.captured_at,
      host_id: event.provenance.host_id,
      supersedes: event.provenance.supersedes ?? null
    } : null
  };

  const canonical = canonicalJsonStringify(payload);
  return sha256Digest(canonical);
}

/**
 * Calculates deterministic hash for an INTENT_DECISION_NORMALIZATION_V1.
 * @param {object} norm
 * @returns {string}
 */
export function calculateNormalizationHash(norm) {
  if (!norm || typeof norm !== 'object') {
    throw new Error('Normalization must be an object to calculate hash');
  }

  const payload = {
    schema_version: norm.schema_version ?? 'INTENT_DECISION_NORMALIZATION_V1',
    decision_id: norm.decision_id,
    derived_from: {
      record_hash: norm.derived_from?.record_hash,
      decision_id: norm.derived_from?.decision_id
    },
    normalized_intent: norm.normalized_intent,
    epistemic_class: norm.epistemic_class,
    decision_class: norm.decision_class,
    change_cost: norm.change_cost,
    lock_in_risk: norm.lock_in_risk,
    governing_constraints: Array.isArray(norm.governing_constraints) ? [...norm.governing_constraints].sort() : [],
    normalization_provenance: {
      agent: norm.normalization_provenance?.agent,
      model: norm.normalization_provenance?.model,
      procedure_version: norm.normalization_provenance?.procedure_version,
      created_at: norm.normalization_provenance?.created_at
    }
  };

  const canonical = canonicalJsonStringify(payload);
  return sha256Digest(canonical);
}
