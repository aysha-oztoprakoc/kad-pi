import { calculateEventHash, calculateQuestionHash } from './crypto.mjs';

export const INTENT_DECISION_EVENT_SCHEMA_V1 = {
  $id: 'https://kad-pi.internal/schemas/intent-decision-event-v1.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'IntentDecisionEventV1',
  type: 'object',
  required: [
    'schema_version',
    'decision_id',
    'domain_id',
    'question',
    'options',
    'response',
    'facilitation',
    'provenance'
  ],
  additionalProperties: false,
  properties: {
    schema_version: {
      type: 'string',
      enum: ['INTENT_DECISION_EVENT_V1']
    },
    decision_id: {
      type: 'string',
      pattern: '^DEC_ID_[0-9]{2}$'
    },
    domain_id: {
      type: 'string',
      pattern: '^[A-Z0-9_]+$'
    },
    question: {
      type: 'object',
      required: ['raw_text', 'question_hash'],
      additionalProperties: false,
      properties: {
        raw_text: { type: 'string', minLength: 1 },
        question_hash: { type: 'string', pattern: '^sha256:[a-f0-9]{64}$' }
      }
    },
    options: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['option_id', 'order', 'raw_label'],
        additionalProperties: false,
        properties: {
          option_id: { type: 'string', minLength: 1 },
          order: { type: 'integer', minimum: 1 },
          raw_label: { type: 'string', minLength: 1 },
          raw_description: { type: ['string', 'null'] },
          recommended: { type: ['boolean', 'null'] },
          default_selected: { type: ['boolean', 'null'] }
        }
      }
    },
    response: {
      type: 'object',
      required: ['selected_option_id', 'epistemic_class', 'actor_id'],
      additionalProperties: false,
      properties: {
        selected_option_id: { type: 'string', minLength: 1 },
        raw_note: { type: ['string', 'null'] },
        epistemic_class: {
          type: 'string',
          enum: ['AUTHOR_DECLARED', 'RECONSTRUCTED']
        },
        actor_id: {
          type: 'string',
          pattern: '^actor\\.[a-z0-9_.-]+$'
        }
      }
    },
    facilitation: {
      type: 'object',
      required: ['protocol', 'recommendation_present'],
      additionalProperties: false,
      properties: {
        protocol: { type: 'string', minLength: 1 },
        recommendation_present: { type: 'boolean' },
        recommended_option_id: { type: ['string', 'null'] }
      }
    },
    provenance: {
      type: 'object',
      required: [
        'session_id',
        'source_type',
        'captured_at',
        'host_id',
        'record_hash'
      ],
      additionalProperties: false,
      properties: {
        session_id: { type: 'string', minLength: 1 },
        source_type: {
          type: 'string',
          enum: ['SOURCE_CAPTURED', 'RECONSTRUCTED']
        },
        source_event_id: { type: ['string', 'null'] },
        captured_at: { type: 'string' },
        host_id: {
          type: 'string',
          pattern: '^host\\.[a-z0-9_.-]+$'
        },
        supersedes: { type: ['string', 'null'], pattern: '^(sha256:[a-f0-9]{64})?$' },
        superseded_by: { type: ['string', 'null'], pattern: '^(sha256:[a-f0-9]{64})?$' },
        record_hash: { type: 'string', pattern: '^sha256:[a-f0-9]{64}$' }
      }
    }
  }
};

export const INTENT_DECISION_NORMALIZATION_SCHEMA_V1 = {
  $id: 'https://kad-pi.internal/schemas/intent-decision-normalization-v1.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'IntentDecisionNormalizationV1',
  type: 'object',
  required: [
    'schema_version',
    'decision_id',
    'derived_from',
    'normalized_intent',
    'epistemic_class',
    'decision_class',
    'change_cost',
    'lock_in_risk',
    'governing_constraints',
    'normalization_provenance'
  ],
  additionalProperties: false,
  properties: {
    schema_version: {
      type: 'string',
      enum: ['INTENT_DECISION_NORMALIZATION_V1']
    },
    decision_id: {
      type: 'string',
      pattern: '^DEC_ID_[0-9]{2}$'
    },
    derived_from: {
      type: 'object',
      required: ['record_hash', 'decision_id'],
      additionalProperties: false,
      properties: {
        record_hash: { type: 'string', pattern: '^sha256:[a-f0-9]{64}$' },
        decision_id: { type: 'string', pattern: '^DEC_ID_[0-9]{2}$' }
      }
    },
    normalized_intent: { type: 'string', minLength: 1 },
    epistemic_class: {
      type: 'string',
      enum: ['DERIVED_FROM_AUTHOR_DECLARED', 'HUMAN_CONFIRMED_NORMALIZATION']
    },
    decision_class: {
      type: 'string',
      enum: ['ARCHITECTURAL', 'OPERATIONAL', 'ECONOMIC', 'GOVERNANCE', 'RESEARCH']
    },
    change_cost: {
      type: 'string',
      enum: ['LOW', 'MEDIUM', 'HIGH']
    },
    lock_in_risk: {
      type: 'string',
      enum: ['LOW', 'MEDIUM', 'HIGH']
    },
    governing_constraints: {
      type: 'array',
      items: { type: 'string', minLength: 1 }
    },
    normalization_provenance: {
      type: 'object',
      required: ['agent', 'model', 'procedure_version', 'created_at'],
      additionalProperties: false,
      properties: {
        agent: { type: 'string', minLength: 1 },
        model: { type: 'string', minLength: 1 },
        procedure_version: { type: 'string', minLength: 1 },
        created_at: { type: 'string' }
      }
    }
  }
};

/**
 * Creates and calculates the record hash for an Intent Decision Event.
 * @param {object} input
 * @returns {object}
 */
export function createIntentEvent(input) {
  const event = {
    schema_version: input.schema_version ?? 'INTENT_DECISION_EVENT_V1',
    decision_id: input.decision_id,
    domain_id: input.domain_id,
    question: {
      raw_text: input.question?.raw_text,
      question_hash: input.question?.question_hash ?? (input.question?.raw_text ? calculateQuestionHash(input.question.raw_text) : null)
    },
    options: Array.isArray(input.options) ? input.options.map((opt, idx) => ({
      option_id: opt.option_id ?? `opt_${String(idx + 1).padStart(2, '0')}`,
      order: opt.order ?? (idx + 1),
      raw_label: opt.raw_label,
      raw_description: opt.raw_description ?? null,
      recommended: opt.recommended ?? null,
      default_selected: opt.default_selected ?? null
    })) : [],
    response: {
      selected_option_id: input.response?.selected_option_id,
      raw_note: input.response?.raw_note ?? null,
      epistemic_class: input.response?.epistemic_class ?? 'AUTHOR_DECLARED',
      actor_id: input.response?.actor_id ?? 'actor.project_lead'
    },
    facilitation: {
      protocol: input.facilitation?.protocol ?? 'ASK_ME_5_PLUS_1',
      recommendation_present: input.facilitation?.recommendation_present ?? (input.options?.some(o => o.recommended) ?? false),
      recommended_option_id: input.facilitation?.recommended_option_id ?? (input.options?.find(o => o.recommended)?.option_id ?? null)
    },
    provenance: {
      session_id: input.provenance?.session_id ?? 'session-default',
      source_type: input.provenance?.source_type ?? 'SOURCE_CAPTURED',
      source_event_id: input.provenance?.source_event_id ?? null,
      captured_at: input.provenance?.captured_at ?? new Date().toISOString(),
      host_id: input.provenance?.host_id ?? 'host.amdy.workstation',
      supersedes: input.provenance?.supersedes ?? null,
      superseded_by: input.provenance?.superseded_by ?? null,
      record_hash: null
    }
  };

  event.provenance.record_hash = calculateEventHash(event);
  return event;
}

/**
 * Creates an Intent Decision Normalization.
 * @param {object} input
 * @returns {object}
 */
export function createIntentNormalization(input) {
  return {
    schema_version: input.schema_version ?? 'INTENT_DECISION_NORMALIZATION_V1',
    decision_id: input.decision_id,
    derived_from: {
      record_hash: input.derived_from?.record_hash,
      decision_id: input.derived_from?.decision_id ?? input.decision_id
    },
    normalized_intent: input.normalized_intent,
    epistemic_class: input.epistemic_class ?? 'DERIVED_FROM_AUTHOR_DECLARED',
    decision_class: input.decision_class ?? 'ARCHITECTURAL',
    change_cost: input.change_cost ?? 'MEDIUM',
    lock_in_risk: input.lock_in_risk ?? 'MEDIUM',
    governing_constraints: Array.isArray(input.governing_constraints) ? [...input.governing_constraints] : [],
    normalization_provenance: {
      agent: input.normalization_provenance?.agent ?? 'kad-researcher',
      model: input.normalization_provenance?.model ?? 'gemini-3.7-flash-high',
      procedure_version: input.normalization_provenance?.procedure_version ?? 'INTENT_NORMALIZATION_V1',
      created_at: input.normalization_provenance?.created_at ?? new Date().toISOString()
    }
  };
}
