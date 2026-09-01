/**
 * KAD_OUTCOME_COST_TELEMETRY_V1 Schema & Epistemic Verification Subsystem
 *
 * Implements typed, local-first outcome and total-cost telemetry measuring:
 * - Outcome & Acceptance State
 * - Quality & Escaped Regressions / Rollbacks
 * - Human Cognitive Attention & Intervention Taxonomy (Strategic vs Low-Leverage Friction)
 * - Execution Performance & Retries
 * - Context & Token Consumption (when observed)
 * - Economic Metered Spend
 * - Compute Utilization
 * - Telemetry & Maintenance Overhead
 * - Epistemic Provenance & SHA-256 Record Integrity
 *
 * Governing requirements: REQ-KAD-COG-002, REQ-KAD-FIN-002
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const TELEMETRY_OUTCOME_SCHEMA_VERSION = 'KAD_OUTCOME_COST_TELEMETRY_V1';

export const ORIGIN_CLASSES = Object.freeze([
  'DIRECTLY_OBSERVED',
  'DERIVED_DETERMINISTIC',
  'HUMAN_REPORTED',
  'ESTIMATED',
  'RECONSTRUCTED',
  'UNKNOWN',
]);

export const INTERVENTION_CATEGORIES = Object.freeze([
  'STRATEGIC_DESIGN',
  'RESEARCH_INTERPRETATION',
  'CONSTITUTIONAL_DECISION',
  'EXPECTED_REVIEW',
  'CORRECTIVE_INTERVENTION',
  'AGENT_BABYSITTING',
  'RECOVERY',
  'CONTEXT_RECONSTRUCTION',
  'MANUAL_RETRY',
  'PROVIDER_OVERRIDE',
]);

export const INTERVENTION_LEVERAGE_TIERS = Object.freeze({
  HIGH_LEVERAGE_STRATEGIC: 'HIGH_LEVERAGE_STRATEGIC',
  LOW_LEVERAGE_FRICTION: 'LOW_LEVERAGE_FRICTION',
  UNCLASSIFIED: 'UNCLASSIFIED',
});

export const STRATEGIC_INTERVENTIONS = new Set([
  'STRATEGIC_DESIGN',
  'RESEARCH_INTERPRETATION',
  'CONSTITUTIONAL_DECISION',
  'EXPECTED_REVIEW',
]);

export const FRICTION_INTERVENTIONS = new Set([
  'CORRECTIVE_INTERVENTION',
  'AGENT_BABYSITTING',
  'RECOVERY',
  'CONTEXT_RECONSTRUCTION',
  'MANUAL_RETRY',
  'PROVIDER_OVERRIDE',
]);

export const WORK_CLASSES = Object.freeze([
  'IMPLEMENTATION',
  'DEBUGGING',
  'VERIFICATION',
  'RESEARCH',
  'DOCUMENTATION',
  'PROJECTION',
  'BENCHMARK',
  'GOVERNANCE',
  'INFRASTRUCTURE',
  'REFACTORING',
]);

export const RISK_TIERS = Object.freeze([
  'TIER_0_NO_RISK',
  'TIER_1_LOW',
  'TIER_2_MEDIUM',
  'TIER_3_HIGH',
  'TIER_4_CONSTITUTIONAL',
]);

export const PROVIDER_CLASSES = Object.freeze([
  'LOCAL_DETERMINISTIC',
  'LOCAL_INFERENCE',
  'REMOTE_METERED',
  'REMOTE_SUBSCRIPTION',
  'HYBRID',
  'UNKNOWN',
]);

export const SPEND_CLASSES = Object.freeze([
  'NONE',
  'PRE_AUTHORIZED',
  'UNAUTHORIZED',
  'UNKNOWN',
]);

const SECRET_KEY_PATTERN = /(auth|authorization|api[_-]?key|access[_-]?token|refresh[_-]?token|bearer|session|cookie|password|secret|private[_-]?key)/i;
const SECRET_VALUE_PATTERN = /(sk-[a-zA-Z0-9_\-]{20,}|Bearer\s+[a-zA-Z0-9_\-\.]{10,}|ghp_[a-zA-Z0-9]{20,}|gho_[a-zA-Z0-9]{20,})/i;

/**
 * Classifies a human intervention into strategic cognitive guidance vs low-leverage friction.
 */
export function classifyIntervention(category) {
  const normCategory = String(category || '').trim().toUpperCase();
  if (STRATEGIC_INTERVENTIONS.has(normCategory)) {
    return {
      category: normCategory,
      tier: INTERVENTION_LEVERAGE_TIERS.HIGH_LEVERAGE_STRATEGIC,
      is_strategic: true,
      is_friction: false,
      description: 'High-leverage cognitive guidance, research direction, or constitutional review',
    };
  }
  if (FRICTION_INTERVENTIONS.has(normCategory)) {
    return {
      category: normCategory,
      tier: INTERVENTION_LEVERAGE_TIERS.LOW_LEVERAGE_FRICTION,
      is_strategic: false,
      is_friction: true,
      description: 'Low-leverage friction, babysitting, error recovery, or manual retry',
    };
  }
  return {
    category: normCategory || 'UNCLASSIFIED',
    tier: INTERVENTION_LEVERAGE_TIERS.UNCLASSIFIED,
    is_strategic: false,
    is_friction: false,
    description: 'Unclassified human interaction',
  };
}

/**
 * Recursively sanitizes data, redacting secret keys and values.
 */
export function sanitizeTelemetryData(input, parentKey = '') {
  if (input === null || input === undefined) return input;
  if (typeof input === 'string') {
    if (SECRET_KEY_PATTERN.test(parentKey) || SECRET_VALUE_PATTERN.test(input)) {
      return '[REDACTED]';
    }
    return input;
  }
  if (typeof input === 'number' || typeof input === 'boolean') {
    return input;
  }
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeTelemetryData(item, parentKey));
  }
  if (typeof input === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      if (SECRET_KEY_PATTERN.test(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeTelemetryData(value, key);
      }
    }
    return sanitized;
  }
  return input;
}

/**
 * Deterministically canonicalizes an object for SHA-256 hashing.
 */
function canonicalizeForHash(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalizeForHash).join(',')}]`;
  }
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalizeForHash(obj[k])}`).join(',')}}`;
}

/**
 * Computes the SHA-256 record hash over canonicalized content (excluding provenance.record_hash).
 */
export function computeRecordHash(recordWithoutHash) {
  const { provenance, ...rest } = recordWithoutHash;
  const provenanceWithoutHash = provenance
    ? Object.fromEntries(Object.entries(provenance).filter(([k]) => k !== 'record_hash'))
    : {};

  const target = {
    ...rest,
    provenance: provenanceWithoutHash,
  };

  const canonicalJson = canonicalizeForHash(target);
  const hash = createHash('sha256').update(canonicalJson, 'utf8').digest('hex');
  return `sha256:${hash}`;
}

/**
 * Verifies the integrity of a telemetry record against its embedded record_hash.
 */
export function verifyRecordIntegrity(record) {
  if (!record || typeof record !== 'object') return false;
  if (!record.provenance || typeof record.provenance.record_hash !== 'string') return false;

  const expectedHash = computeRecordHash(record);
  return record.provenance.record_hash === expectedHash;
}

/**
 * Creates a normalized KAD_OUTCOME_COST_TELEMETRY_V1 record.
 */
export function createOutcomeTelemetryRecord(input = {}) {
  const sanitizedInput = sanitizeTelemetryData(input);

  const work = {
    workpackage_id: sanitizedInput.work?.workpackage_id || 'UNKNOWN_WP',
    ticket_id: sanitizedInput.work?.ticket_id ?? null,
    run_id: sanitizedInput.work?.run_id ?? null,
    work_class: sanitizedInput.work?.work_class || 'IMPLEMENTATION',
    risk_tier: sanitizedInput.work?.risk_tier || 'TIER_1_LOW',
    provider_class: sanitizedInput.work?.provider_class || 'UNKNOWN',
    execution_mode: sanitizedInput.work?.execution_mode || 'AUTONOMOUS_BOUNDED',
    complexity_weight: typeof sanitizedInput.work?.complexity_weight === 'number' ? sanitizedInput.work.complexity_weight : 1,
    started_at: sanitizedInput.work?.started_at ?? null,
    ended_at: sanitizedInput.work?.ended_at ?? null,
    experiment_id: sanitizedInput.work?.experiment_id ?? null,
    cohort: sanitizedInput.work?.cohort ?? null,
    trial_id: sanitizedInput.work?.trial_id ?? null,
    baseline_or_candidate: sanitizedInput.work?.baseline_or_candidate ?? null,
  };

  const outcome = {
    accepted: Boolean(sanitizedInput.outcome?.accepted),
    acceptance_revision: sanitizedInput.outcome?.acceptance_revision ?? null,
    acceptance_evidence_refs: Array.isArray(sanitizedInput.outcome?.acceptance_evidence_refs)
      ? [...sanitizedInput.outcome.acceptance_evidence_refs]
      : [],
    rejection_reason: sanitizedInput.outcome?.rejection_reason ?? null,
  };

  const rawInterventions = Array.isArray(sanitizedInput.human?.interventions)
    ? sanitizedInput.human.interventions
    : [];

  const classifiedInterventions = rawInterventions.map((item) => {
    const classification = classifyIntervention(item.category || item.type);
    return {
      category: classification.category,
      tier: classification.tier,
      is_friction: classification.is_friction,
      description: item.description || item.note || '',
      timestamp: item.timestamp || new Date().toISOString(),
    };
  });

  const frictionCount = classifiedInterventions.filter((i) => i.is_friction).length;
  const decisionEventsCount = classifiedInterventions.filter((i) => !i.is_friction).length;

  const human = {
    intervention_count: typeof sanitizedInput.human?.intervention_count === 'number'
      ? sanitizedInput.human.intervention_count
      : classifiedInterventions.length,
    friction_intervention_count: typeof sanitizedInput.human?.friction_intervention_count === 'number'
      ? sanitizedInput.human.friction_intervention_count
      : frictionCount,
    decision_events: typeof sanitizedInput.human?.decision_events === 'number'
      ? sanitizedInput.human.decision_events
      : decisionEventsCount,
    review_rejections: typeof sanitizedInput.human?.review_rejections === 'number'
      ? sanitizedInput.human.review_rejections
      : 0,
    manual_retries: typeof sanitizedInput.human?.manual_retries === 'number'
      ? sanitizedInput.human.manual_retries
      : 0,
    context_reorientation_events: typeof sanitizedInput.human?.context_reorientation_events === 'number'
      ? sanitizedInput.human.context_reorientation_events
      : 0,
    active_minutes_estimate: typeof sanitizedInput.human?.active_minutes_estimate === 'number'
      ? sanitizedInput.human.active_minutes_estimate
      : null,
    active_minutes_source: sanitizedInput.human?.active_minutes_source || (typeof sanitizedInput.human?.active_minutes_estimate === 'number' ? 'ESTIMATED' : 'UNKNOWN'),
    interventions: classifiedInterventions,
  };

  const quality = {
    escaped_regressions: typeof sanitizedInput.quality?.escaped_regressions === 'number'
      ? sanitizedInput.quality.escaped_regressions
      : 0,
    acceptance_reversals: typeof sanitizedInput.quality?.acceptance_reversals === 'number'
      ? sanitizedInput.quality.acceptance_reversals
      : 0,
    rollback_count: typeof sanitizedInput.quality?.rollback_count === 'number'
      ? sanitizedInput.quality.rollback_count
      : 0,
    post_acceptance_defects: typeof sanitizedInput.quality?.post_acceptance_defects === 'number'
      ? sanitizedInput.quality.post_acceptance_defects
      : 0,
  };

  const execution = {
    agent_runs: typeof sanitizedInput.execution?.agent_runs === 'number'
      ? sanitizedInput.execution.agent_runs
      : 1,
    failed_runs: typeof sanitizedInput.execution?.failed_runs === 'number'
      ? sanitizedInput.execution.failed_runs
      : 0,
    retries: typeof sanitizedInput.execution?.retries === 'number'
      ? sanitizedInput.execution.retries
      : 0,
    wall_clock_ms: typeof sanitizedInput.execution?.wall_clock_ms === 'number'
      ? sanitizedInput.execution.wall_clock_ms
      : null,
  };

  const context = {
    input_tokens: typeof sanitizedInput.context?.input_tokens === 'number'
      ? sanitizedInput.context.input_tokens
      : null,
    output_tokens: typeof sanitizedInput.context?.output_tokens === 'number'
      ? sanitizedInput.context.output_tokens
      : null,
    remote_tokens: typeof sanitizedInput.context?.remote_tokens === 'number'
      ? sanitizedInput.context.remote_tokens
      : null,
    context_packet_bytes: typeof sanitizedInput.context?.context_packet_bytes === 'number'
      ? sanitizedInput.context.context_packet_bytes
      : null,
  };

  const economic = {
    api_cost_usd: typeof sanitizedInput.economic?.api_cost_usd === 'number'
      ? sanitizedInput.economic.api_cost_usd
      : null,
    metered_spend_class: sanitizedInput.economic?.metered_spend_class || (typeof sanitizedInput.economic?.api_cost_usd === 'number' ? 'PRE_AUTHORIZED' : 'NONE'),
  };

  const compute = {
    cpu_time_ms: typeof sanitizedInput.compute?.cpu_time_ms === 'number'
      ? sanitizedInput.compute.cpu_time_ms
      : null,
    gpu_time_ms: typeof sanitizedInput.compute?.gpu_time_ms === 'number'
      ? sanitizedInput.compute.gpu_time_ms
      : null,
    gpu_peak_vram_bytes: typeof sanitizedInput.compute?.gpu_peak_vram_bytes === 'number'
      ? sanitizedInput.compute.gpu_peak_vram_bytes
      : null,
  };

  const maintenance = {
    maintenance_minutes: typeof sanitizedInput.maintenance?.maintenance_minutes === 'number'
      ? sanitizedInput.maintenance.maintenance_minutes
      : 0,
    telemetry_overhead_ms: typeof sanitizedInput.maintenance?.telemetry_overhead_ms === 'number'
      ? sanitizedInput.maintenance.telemetry_overhead_ms
      : 0,
    collector_cpu_ms: typeof sanitizedInput.maintenance?.collector_cpu_ms === 'number'
      ? sanitizedInput.maintenance.collector_cpu_ms
      : null,
    collector_wall_ms: typeof sanitizedInput.maintenance?.collector_wall_ms === 'number'
      ? sanitizedInput.maintenance.collector_wall_ms
      : null,
    bytes_written: typeof sanitizedInput.maintenance?.bytes_written === 'number'
      ? sanitizedInput.maintenance.bytes_written
      : null,
  };

  const provenance = {
    observed_at: sanitizedInput.provenance?.observed_at || new Date().toISOString(),
    collector: sanitizedInput.provenance?.collector || 'kad-outcome-cost-telemetry-v1',
    origin_class: sanitizedInput.provenance?.origin_class || 'DIRECTLY_OBSERVED',
    source_refs: Array.isArray(sanitizedInput.provenance?.source_refs)
      ? [...sanitizedInput.provenance.source_refs]
      : [],
  };

  const draftRecord = {
    schema_version: TELEMETRY_OUTCOME_SCHEMA_VERSION,
    work,
    outcome,
    human,
    quality,
    execution,
    context,
    economic,
    compute,
    maintenance,
    provenance,
  };

  const recordHash = computeRecordHash(draftRecord);
  draftRecord.provenance.record_hash = recordHash;

  return draftRecord;
}

/**
 * Validates a telemetry record for structural correctness, provenance, epistemic honesty,
 * Goodhart protections, secret absence, and workspace references.
 */
export function validateOutcomeTelemetryRecord(record, options = {}) {
  const errors = [];
  const warnings = [];

  if (!record || typeof record !== 'object') {
    return { valid: false, errors: ['Record must be a non-null object'], warnings };
  }

  // 1. Schema version
  if (record.schema_version !== TELEMETRY_OUTCOME_SCHEMA_VERSION) {
    errors.push(`Invalid schema_version: expected ${TELEMETRY_OUTCOME_SCHEMA_VERSION}, got ${record.schema_version}`);
  }

  // 2. Provenance
  if (!record.provenance || typeof record.provenance !== 'object') {
    errors.push('Missing mandatory provenance block');
  } else {
    if (!record.provenance.observed_at || typeof record.provenance.observed_at !== 'string') {
      errors.push('Missing mandatory provenance.observed_at timestamp');
    }
    if (!record.provenance.collector || typeof record.provenance.collector !== 'string') {
      errors.push('Missing mandatory provenance.collector string');
    }
    if (!record.provenance.record_hash || typeof record.provenance.record_hash !== 'string') {
      errors.push('Missing mandatory provenance.record_hash');
    } else {
      const calculatedHash = computeRecordHash(record);
      if (record.provenance.record_hash !== calculatedHash) {
        errors.push(`Corrupted record hash: expected ${calculatedHash}, got ${record.provenance.record_hash}`);
      }
    }
  }

  // 3. Work section & vendor neutrality
  if (!record.work || typeof record.work !== 'object') {
    errors.push('Missing mandatory work block');
  } else {
    if (!record.work.workpackage_id || typeof record.work.workpackage_id !== 'string') {
      errors.push('Missing mandatory work.workpackage_id');
    }
    if (options.enforceVendorNeutrality) {
      if (record.work.required_vendor || record.work.required_model) {
        errors.push('Vendor neutrality violation: work block must not mandate required_vendor or required_model');
      }
    }
    if (options.checkWorkspaceReferences && record.work.workpackage_id) {
      const wpId = record.work.workpackage_id;
      const cwd = options.cwd || process.cwd();
      const wpPath = path.join(cwd, '.agents', 'work', `${wpId}.json`);
      if (!fs.existsSync(wpPath)) {
        errors.push(`Referenced workpackage_id does not exist in workspace: ${wpId}`);
      }
    }
  }

  // 4. Outcome & Evidence requirement
  if (!record.outcome || typeof record.outcome !== 'object') {
    errors.push('Missing mandatory outcome block');
  } else {
    if (typeof record.outcome.accepted !== 'boolean') {
      errors.push('outcome.accepted must be a boolean');
    }
    if (record.outcome.accepted === true) {
      if (!Array.isArray(record.outcome.acceptance_evidence_refs) || record.outcome.acceptance_evidence_refs.length === 0) {
        errors.push('Accepted work must reference at least one acceptance evidence path in outcome.acceptance_evidence_refs');
      }
    }
  }

  // 5. UNKNOWN != ZERO Epistemic Validation
  if (record.economic) {
    if (record.economic.metered_spend_class === 'UNKNOWN' && record.economic.api_cost_usd === 0) {
      errors.push('Epistemic violation (UNKNOWN != ZERO): economic spend is UNKNOWN but api_cost_usd was set to zero');
    }
  }
  if (record.human) {
    if (record.human.active_minutes_source === 'UNKNOWN' && record.human.active_minutes_estimate === 0) {
      errors.push('Epistemic violation (UNKNOWN != ZERO): human active_minutes_source is UNKNOWN but estimate was set to zero');
    }
  }

  // 6. Secret Leaks
  const jsonStr = JSON.stringify(record);
  if (SECRET_VALUE_PATTERN.test(jsonStr)) {
    errors.push('Security violation: raw secret token pattern detected in telemetry record');
  }
  const checkKeysForSecret = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const [k, v] of Object.entries(obj)) {
      if (SECRET_KEY_PATTERN.test(k) && v !== '[REDACTED]') {
        errors.push(`Security violation: raw secret key detected: ${k}`);
      }
      if (typeof v === 'object') checkKeysForSecret(v);
    }
  };
  checkKeysForSecret(record);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
