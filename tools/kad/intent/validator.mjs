import { calculateEventHash, calculateQuestionHash } from './crypto.mjs';

const DECISION_ID_REGEX = /^DEC_ID_[0-9]{2}$/;
const ACTOR_ID_REGEX = /^actor\.[a-z0-9_.-]+$/;
const HOST_ID_REGEX = /^host\.[a-z0-9_.-]+$/;
const HASH_REGEX = /^sha256:[a-f0-9]{64}$/;

/**
 * Validates a single INTENT_DECISION_EVENT_V1 object.
 * @param {object} event
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateIntentEvent(event) {
  const errors = [];

  if (!event || typeof event !== 'object') {
    return { valid: false, errors: ['Event must be a non-null object'] };
  }

  // Schema version
  if (event.schema_version !== 'INTENT_DECISION_EVENT_V1') {
    errors.push(`Invalid schema_version: expected 'INTENT_DECISION_EVENT_V1', got '${event.schema_version}'`);
  }

  // Decision ID
  if (!event.decision_id || !DECISION_ID_REGEX.test(event.decision_id)) {
    errors.push(`Invalid decision_id format: '${event.decision_id}'. Must match '^DEC_ID_[0-9]{2}$'`);
  }

  // Domain ID
  if (!event.domain_id || typeof event.domain_id !== 'string' || event.domain_id.trim() === '') {
    errors.push('domain_id is required and must be a non-empty string');
  }

  // Question
  if (!event.question || typeof event.question !== 'object') {
    errors.push('question object is required');
  } else {
    if (!event.question.raw_text || typeof event.question.raw_text !== 'string' || event.question.raw_text.trim() === '') {
      errors.push('question.raw_text is required and must be non-empty');
    }
    if (!event.question.question_hash || !HASH_REGEX.test(event.question.question_hash)) {
      errors.push(`question.question_hash is invalid: '${event.question.question_hash}'`);
    } else if (event.question.raw_text) {
      const expectedQHash = calculateQuestionHash(event.question.raw_text);
      if (event.question.question_hash !== expectedQHash) {
        errors.push(`question.question_hash mismatch: expected '${expectedQHash}', got '${event.question.question_hash}'`);
      }
    }
  }

  // Options
  if (!Array.isArray(event.options) || event.options.length === 0) {
    errors.push('options must not be empty');
  } else {
    const seenOptionIds = new Set();
    const seenOrders = new Set();

    for (let i = 0; i < event.options.length; i++) {
      const opt = event.options[i];
      if (!opt || typeof opt !== 'object') {
        errors.push(`options[${i}] must be an object`);
        continue;
      }
      if (!opt.option_id || typeof opt.option_id !== 'string') {
        errors.push(`options[${i}].option_id is required`);
      } else if (seenOptionIds.has(opt.option_id)) {
        errors.push(`Duplicate option_id: '${opt.option_id}'`);
      } else {
        seenOptionIds.add(opt.option_id);
      }

      if (typeof opt.order !== 'number' || opt.order < 1) {
        errors.push(`options[${i}].order must be a positive integer`);
      } else if (seenOrders.has(opt.order)) {
        errors.push(`Duplicate option order: ${opt.order}`);
      } else {
        seenOrders.add(opt.order);
      }

      if (!opt.raw_label || typeof opt.raw_label !== 'string' || opt.raw_label.trim() === '') {
        errors.push(`options[${i}].raw_label is required`);
      }
    }
  }

  // Response
  if (!event.response || typeof event.response !== 'object') {
    errors.push('response object is required');
  } else {
    const optIds = Array.isArray(event.options) ? event.options.map(o => o.option_id) : [];
    if (!event.response.selected_option_id || typeof event.response.selected_option_id !== 'string') {
      errors.push('response.selected_option_id is required');
    } else if (optIds.length > 0 && !optIds.includes(event.response.selected_option_id)) {
      errors.push(`response.selected_option_id '${event.response.selected_option_id}' not found in options list`);
    }

    if (!['AUTHOR_DECLARED', 'RECONSTRUCTED'].includes(event.response.epistemic_class)) {
      errors.push(`Invalid response.epistemic_class: '${event.response.epistemic_class}'. Must be 'AUTHOR_DECLARED' or 'RECONSTRUCTED'`);
    }

    if (!event.response.actor_id || !ACTOR_ID_REGEX.test(event.response.actor_id)) {
      errors.push(`Invalid response.actor_id namespace: '${event.response.actor_id}'. Must start with 'actor.'`);
    }
    if (HOST_ID_REGEX.test(event.response.actor_id)) {
      errors.push(`response.actor_id cannot use host namespace: '${event.response.actor_id}'`);
    }
  }

  // Facilitation
  if (!event.facilitation || typeof event.facilitation !== 'object') {
    errors.push('facilitation object is required');
  } else {
    if (!event.facilitation.protocol || typeof event.facilitation.protocol !== 'string') {
      errors.push('facilitation.protocol is required');
    }
    if (typeof event.facilitation.recommendation_present !== 'boolean') {
      errors.push('facilitation.recommendation_present must be a boolean');
    }
  }

  // Provenance
  if (!event.provenance || typeof event.provenance !== 'object') {
    errors.push('provenance object is required');
  } else {
    if (!event.provenance.session_id || typeof event.provenance.session_id !== 'string') {
      errors.push('provenance.session_id is required');
    }

    if (!['SOURCE_CAPTURED', 'RECONSTRUCTED'].includes(event.provenance.source_type)) {
      errors.push(`Invalid provenance.source_type: '${event.provenance.source_type}'`);
    }

    if (event.provenance.source_type === 'SOURCE_CAPTURED') {
      if (!event.provenance.source_event_id || event.provenance.source_event_id.trim() === '') {
        errors.push("provenance.source_event_id is required when source_type is 'SOURCE_CAPTURED'");
      }
      if (event.provenance.session_id.toLowerCase().includes('reconstructed')) {
        errors.push("provenance.source_type cannot be 'SOURCE_CAPTURED' for reconstructed session");
      }
    }

    if (!event.provenance.captured_at || typeof event.provenance.captured_at !== 'string') {
      errors.push('provenance.captured_at is required');
    }

    if (!event.provenance.host_id || !HOST_ID_REGEX.test(event.provenance.host_id)) {
      errors.push(`Invalid provenance.host_id namespace: '${event.provenance.host_id}'. Must start with 'host.'`);
    }
    if (ACTOR_ID_REGEX.test(event.provenance.host_id)) {
      errors.push(`provenance.host_id cannot use actor namespace: '${event.provenance.host_id}'`);
    }

    if (!event.provenance.record_hash || !HASH_REGEX.test(event.provenance.record_hash)) {
      errors.push(`Invalid provenance.record_hash: '${event.provenance.record_hash}'`);
    } else {
      let expectedRecordHash;
      try {
        expectedRecordHash = calculateEventHash(event);
      } catch (err) {
        errors.push(`Failed to compute record_hash: ${err.message}`);
      }
      if (expectedRecordHash && event.provenance.record_hash !== expectedRecordHash) {
        errors.push(`provenance.record_hash mismatch: expected '${expectedRecordHash}', got '${event.provenance.record_hash}'`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a single INTENT_DECISION_NORMALIZATION_V1 object.
 * @param {object} norm
 * @param {Array<object>} [knownEvents]
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateIntentNormalization(norm, knownEvents = []) {
  const errors = [];

  if (!norm || typeof norm !== 'object') {
    return { valid: false, errors: ['Normalization must be a non-null object'] };
  }

  if (norm.schema_version !== 'INTENT_DECISION_NORMALIZATION_V1') {
    errors.push(`Invalid schema_version: expected 'INTENT_DECISION_NORMALIZATION_V1', got '${norm.schema_version}'`);
  }

  if (!norm.decision_id || !DECISION_ID_REGEX.test(norm.decision_id)) {
    errors.push(`Invalid decision_id format: '${norm.decision_id}'. Must match '^DEC_ID_[0-9]{2}$'`);
  }

  if (!norm.derived_from || typeof norm.derived_from !== 'object') {
    errors.push('derived_from object is required');
  } else {
    if (!norm.derived_from.record_hash || !HASH_REGEX.test(norm.derived_from.record_hash)) {
      errors.push(`derived_from.record_hash must be a valid sha256 hash, got '${norm.derived_from.record_hash}'`);
    }
    if (!norm.derived_from.decision_id || norm.derived_from.decision_id !== norm.decision_id) {
      errors.push(`derived_from.decision_id '${norm.derived_from.decision_id}' must match normalization decision_id '${norm.decision_id}'`);
    }
  }

  if (!norm.normalized_intent || typeof norm.normalized_intent !== 'string' || norm.normalized_intent.trim() === '') {
    errors.push('normalized_intent is required and must be non-empty');
  }

  if (!['DERIVED_FROM_AUTHOR_DECLARED', 'HUMAN_CONFIRMED_NORMALIZATION'].includes(norm.epistemic_class)) {
    errors.push(`Invalid epistemic_class: '${norm.epistemic_class}'. Model-derived normalization cannot be 'AUTHOR_DECLARED'`);
  }

  if (!['ARCHITECTURAL', 'OPERATIONAL', 'ECONOMIC', 'GOVERNANCE', 'RESEARCH'].includes(norm.decision_class)) {
    errors.push(`Invalid decision_class: '${norm.decision_class}'`);
  }

  if (!['LOW', 'MEDIUM', 'HIGH'].includes(norm.change_cost)) {
    errors.push(`Invalid change_cost: '${norm.change_cost}'`);
  }

  if (!['LOW', 'MEDIUM', 'HIGH'].includes(norm.lock_in_risk)) {
    errors.push(`Invalid lock_in_risk: '${norm.lock_in_risk}'`);
  }

  if (!Array.isArray(norm.governing_constraints)) {
    errors.push('governing_constraints must be an array');
  }

  if (!norm.normalization_provenance || typeof norm.normalization_provenance !== 'object') {
    errors.push('normalization_provenance object is required');
  } else {
    if (!norm.normalization_provenance.agent || typeof norm.normalization_provenance.agent !== 'string') {
      errors.push('normalization_provenance.agent is required');
    }
    if (!norm.normalization_provenance.model || typeof norm.normalization_provenance.model !== 'string') {
      errors.push('normalization_provenance.model is required');
    }
    if (!norm.normalization_provenance.procedure_version || typeof norm.normalization_provenance.procedure_version !== 'string') {
      errors.push('normalization_provenance.procedure_version is required');
    }
  }

  // Cross-reference checks against knownEvents if provided
  if (Array.isArray(knownEvents) && norm.derived_from?.record_hash) {
    const foundEvent = knownEvents.find(e => e.provenance?.record_hash === norm.derived_from.record_hash);
    if (!foundEvent) {
      errors.push(`Normalization references unknown event hash: '${norm.derived_from.record_hash}' not found in known events`);
    } else if (foundEvent.decision_id !== norm.decision_id) {
      errors.push(`Derived event decision_id '${foundEvent.decision_id}' does not match normalization decision_id '${norm.decision_id}'`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates an entire journal of events and normalizations enforcing append-only invariants,
 * hash integrity, supersessions, and normalization linkages.
 * @param {Array<object>} events
 * @param {Array<object>} normalizations
 * @returns {{ valid: boolean, errors: string[], stats: object }}
 */
export function validateIntentJournal(events = [], normalizations = []) {
  const errors = [];
  const eventsByHash = new Map();
  const eventsByDecisionId = new Map();

  // 1. Validate all events individually and check hash uniqueness & supersession
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const val = validateIntentEvent(ev);
    if (!val.valid) {
      errors.push(`Event[${i}] (${ev?.decision_id ?? 'unknown'}) invalid: ${val.errors.join('; ')}`);
      continue;
    }

    const hash = ev.provenance.record_hash;
    if (eventsByHash.has(hash)) {
      errors.push(`Duplicate event record_hash '${hash}' at index ${i}`);
    } else {
      eventsByHash.set(hash, ev);
    }

    const decId = ev.decision_id;
    if (eventsByDecisionId.has(decId)) {
      const priorEvents = eventsByDecisionId.get(decId);
      // If there is already an event for this decision_id, current event MUST have supersedes set!
      if (!ev.provenance.supersedes) {
        errors.push(`Duplicate decision event for '${decId}' at index ${i} without explicit supersedes link`);
      } else if (!eventsByHash.has(ev.provenance.supersedes)) {
        errors.push(`Event '${decId}' at index ${i} supersedes unknown hash '${ev.provenance.supersedes}'`);
      } else {
        const supersededEvent = eventsByHash.get(ev.provenance.supersedes);
        if (supersededEvent.decision_id !== decId) {
          errors.push(`Event '${decId}' supersedes event with different decision_id '${supersededEvent.decision_id}'`);
        }
      }
      priorEvents.push(ev);
    } else {
      eventsByDecisionId.set(decId, [ev]);
    }
  }

  // 2. Validate all normalizations and their links to valid events
  for (let i = 0; i < normalizations.length; i++) {
    const norm = normalizations[i];
    const val = validateIntentNormalization(norm, events);
    if (!val.valid) {
      errors.push(`Normalization[${i}] (${norm?.decision_id ?? 'unknown'}) invalid: ${val.errors.join('; ')}`);
    }
  }

  const activeEvents = [];
  for (const [decId, evList] of eventsByDecisionId.entries()) {
    // Active event is the latest non-superseded event in the sequence
    const latest = evList[evList.length - 1];
    activeEvents.push(latest);
  }

  return {
    valid: errors.length === 0,
    errors,
    stats: {
      total_events: events.length,
      active_events: activeEvents.length,
      superseded_events: events.length - activeEvents.length,
      total_normalizations: normalizations.length,
      unique_decision_ids: eventsByDecisionId.size
    }
  };
}
