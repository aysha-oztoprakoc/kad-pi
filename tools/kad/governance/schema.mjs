/**
 * KAD Governance Gates & Preflight Contract Schemas
 *
 * Implements typed contracts for:
 * - GOVERNANCE_PREFLIGHT_V1
 * - GOVERNANCE_DECISION_V1
 * - HUMAN_AUTHORIZATION_RECEIPT_V1
 *
 * Invariant: MODEL OUTPUT PROPOSES != DETERMINISTIC POLICY AUTHORIZES
 * Invariant: CAPABILITY != AUTHORITY
 */

import { createHash } from 'node:crypto';

export const GOVERNANCE_PREFLIGHT_SCHEMA_VERSION = 'GOVERNANCE_PREFLIGHT_V1';
export const GOVERNANCE_DECISION_SCHEMA_VERSION = 'GOVERNANCE_DECISION_V1';
export const HUMAN_RECEIPT_SCHEMA_VERSION = 'HUMAN_AUTHORIZATION_RECEIPT_V1';
export const HUMAN_RECEIPT_V2_SCHEMA_VERSION = 'HUMAN_AUTHORIZATION_RECEIPT_V2';
export const GOVERNANCE_POLICY_VERSION = 'KAD_GOVERNANCE_POLICY_V1';

export const AUTHORITY_CLASSES = Object.freeze([
  'HUMAN_ONLY',
  'HUMAN_PREAUTHORIZED',
  'DETERMINISTIC_POLICY',
  'DELEGATED_WITH_GATE',
  'AUTONOMOUS_WITHIN_LEASE',
  'FORBIDDEN',
]);

export const OPERATION_CLASSES = Object.freeze([
  'READ_LOCAL',
  'PUBLIC_NETWORK_READ',
  'AUTHENTICATED_READ',
  'WORKSPACE_MUTATION',
  'LOCAL_GIT_COMMIT',
  'REMOTE_GIT_PUSH',
  'PR_CREATE',
  'MAIN_MERGE',
  'RELEASE_PUBLISH',
  'CANONICAL_KNOWLEDGE_PROMOTION',
  'DERIVED_PROJECTION_REBUILD',
  'METERED_API_CALL',
  'SCOPED_CREDENTIAL_USE',
  'RAW_SECRET_ACCESS',
  'INFRASTRUCTURE_MUTATION',
  'POLICY_MUTATION',
  'CONSTITUTIONAL_MUTATION',
]);

export const DECISION_OUTCOMES = Object.freeze({
  ALLOW: 'ALLOW',
  DENY: 'DENY',
  REQUIRE_HUMAN: 'REQUIRE_HUMAN',
  BLOCKED: 'BLOCKED',
  IN_DOUBT: 'IN_DOUBT',
});

export const RISK_TIERS = Object.freeze({
  TIER_0_NO_RISK: 'TIER_0_NO_RISK',
  TIER_1_LOW: 'TIER_1_LOW',
  TIER_2_MEDIUM: 'TIER_2_MEDIUM',
  TIER_3_HIGH: 'TIER_3_HIGH',
  TIER_4_CONSTITUTIONAL: 'TIER_4_CONSTITUTIONAL',
});

export const REASON_CODES = Object.freeze({
  // Authorizations
  AUTHORIZED_BY_POLICY: 'AUTHORIZED_BY_POLICY',
  AUTHORIZED_WITHIN_LEASE: 'AUTHORIZED_WITHIN_LEASE',
  AUTHORIZED_BY_HUMAN_RECEIPT: 'AUTHORIZED_BY_HUMAN_RECEIPT',
  READ_LOCAL_AUTONOMOUS: 'READ_LOCAL_AUTONOMOUS',
  BUDGET_ENVELOPE_AUTHORIZED: 'BUDGET_ENVELOPE_AUTHORIZED',
  MAIN_INTEGRATION_READY: 'MAIN_INTEGRATION_READY',
  AUTHORITY_INSUFFICIENT: 'AUTHORITY_INSUFFICIENT',
  CAPABILITY_NOT_IMPLEMENTED: 'CAPABILITY_NOT_IMPLEMENTED',
  CAPABILITY_WITHOUT_AUTHORITY_DENIED: 'CAPABILITY_WITHOUT_AUTHORITY_DENIED',
  UNKNOWN_HIGH_IMPACT_STATE: 'UNKNOWN_HIGH_IMPACT_STATE',
  RISK_TIER_DOWNGRADE_FORBIDDEN: 'RISK_TIER_DOWNGRADE_FORBIDDEN',
  CONFUSED_DEPUTY_WP_MISMATCH: 'CONFUSED_DEPUTY_WP_MISMATCH',
  CONFUSED_DEPUTY_SCOPE_MISMATCH: 'CONFUSED_DEPUTY_SCOPE_MISMATCH',
  CONFUSED_DEPUTY_RESOURCE_MISMATCH: 'CONFUSED_DEPUTY_RESOURCE_MISMATCH',

  // Scope and Claims
  NO_ACTIVE_CLAIM: 'NO_ACTIVE_CLAIM',
  PATH_OUTSIDE_SCOPE: 'PATH_OUTSIDE_SCOPE',
  STC_LEASE_MISSING: 'STC_LEASE_MISSING',
  STC_LEASE_EXPIRED: 'STC_LEASE_EXPIRED',

  // Prohibitions & Human-only
  RAW_SECRET_ACCESS_FORBIDDEN: 'RAW_SECRET_ACCESS_FORBIDDEN',
  CONSTITUTIONAL_MUTATION_HUMAN_ONLY: 'CONSTITUTIONAL_MUTATION_HUMAN_ONLY',
  DOCTRINE_PROMOTION_HUMAN_ONLY: 'DOCTRINE_PROMOTION_HUMAN_ONLY',
  HIGH_RISK_HUMAN_GATE_REQUIRED: 'HIGH_RISK_HUMAN_GATE_REQUIRED',

  // FinOps
  BUDGET_NOT_AUTHORIZED: 'BUDGET_NOT_AUTHORIZED',
  BUDGET_SELF_ESCALATION_FORBIDDEN: 'BUDGET_SELF_ESCALATION_FORBIDDEN',
  BUDGET_ENVELOPE_EXCEEDED: 'BUDGET_ENVELOPE_EXCEEDED',

  // Evidence & Verification
  EVIDENCE_MISSING: 'EVIDENCE_MISSING',
  INDEPENDENT_VERIFICATION_MISSING: 'INDEPENDENT_VERIFICATION_MISSING',
  CONSTITUTIONAL_CONTRADICTION_FAIL_CLOSED: 'CONSTITUTIONAL_CONTRADICTION_FAIL_CLOSED',
  PAST_SUCCESS_INSUFFICIENT_FOR_AUTHORITY: 'PAST_SUCCESS_INSUFFICIENT_FOR_AUTHORITY',

  // Human Receipt & Anti-Spoofing
  FAKE_HUMAN_APPROVAL_PROSE_REJECTED: 'FAKE_HUMAN_APPROVAL_PROSE_REJECTED',
  HUMAN_RECEIPT_MISSING: 'HUMAN_RECEIPT_MISSING',
  HUMAN_RECEIPT_EXPIRED: 'HUMAN_RECEIPT_EXPIRED',
  HUMAN_RECEIPT_TAMPERED: 'HUMAN_RECEIPT_TAMPERED',
  AUTHORIZATION_ISSUER_INVALID: 'AUTHORIZATION_ISSUER_INVALID',
  AUTHORIZED_SUBJECT_MISMATCH: 'AUTHORIZED_SUBJECT_MISMATCH',
  ISSUER_AUTHORITY_INSUFFICIENT: 'ISSUER_AUTHORITY_INSUFFICIENT',
  REDELEGATION_FORBIDDEN: 'REDELEGATION_FORBIDDEN',
  LEGACY_RECEIPT_DELEGATION_AMBIGUOUS: 'LEGACY_RECEIPT_DELEGATION_AMBIGUOUS',
  AUTHORIZATION_EXPIRED: 'AUTHORIZATION_EXPIRED',
  PRIMARY_ACTION_EXPIRED: 'PRIMARY_ACTION_EXPIRED',
  ROLLBACK_NOT_AUTHORIZED: 'ROLLBACK_NOT_AUTHORIZED',
  ROLLBACK_SCOPE_MISMATCH: 'ROLLBACK_SCOPE_MISMATCH',
  ROLLBACK_WINDOW_EXPIRED: 'ROLLBACK_WINDOW_EXPIRED',
  WORK_CONTEXT_MISMATCH: 'WORK_CONTEXT_MISMATCH',
  RESOURCE_BINDING_MISMATCH: 'RESOURCE_BINDING_MISMATCH',
  POLICY_VERSION_MISMATCH: 'POLICY_VERSION_MISMATCH',
});

/**
 * Deterministically canonicalizes an object for SHA-256 hashing.
 */
export function canonicalizeForHash(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalizeForHash).join(',')}]`;
  }
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalizeForHash(obj[k])}`).join(',')}}`;
}

export function computeGovernanceHash(obj) {
  const canonical = canonicalizeForHash(obj);
  const hash = createHash('sha256').update(canonical, 'utf8').digest('hex');
  return `sha256:${hash}`;
}

/**
 * Creates a GOVERNANCE_PREFLIGHT_V1 request object.
 */
export function createGovernancePreflightRequest(input = {}) {
  const request = {
    schema_version: GOVERNANCE_PREFLIGHT_SCHEMA_VERSION,
    request_id: input.request_id || `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actor: {
      actor_id: input.actor?.actor_id || 'unknown-actor',
      actor_class: input.actor?.actor_class || 'AGENT_ROLE',
    },
    work: {
      workpackage_id: input.work?.workpackage_id || 'WP-UNKNOWN',
      ticket_id: input.work?.ticket_id ?? null,
      run_id: input.work?.run_id ?? null,
      lifecycle_state: input.work?.lifecycle_state || 'IN_PROGRESS',
    },
    operation: {
      operation_class: input.operation?.operation_class || 'WORKSPACE_MUTATION',
      action: input.operation?.action || 'unspecified_action',
      action_kind: input.operation?.action_kind || 'PRIMARY',
      resource_refs: Array.isArray(input.operation?.resource_refs) ? [...input.operation.resource_refs] : [],
    },
    scope: {
      owned_paths: Array.isArray(input.scope?.owned_paths) ? [...input.scope.owned_paths] : [],
      requested_paths: Array.isArray(input.scope?.requested_paths) ? [...input.scope.requested_paths] : [],
    },
    authority: {
      required_level: input.authority?.required_level || null,
      target_authority: input.authority?.target_authority || null,
      claimed_human_approval_in_prose: input.authority?.claimed_human_approval_in_prose || null,
      require_v2_delegation: Boolean(input.authority?.require_v2_delegation),
    },
    risk: {
      risk_tier: input.risk?.risk_tier || null,
      reversible: typeof input.risk?.reversible === 'boolean' ? input.risk.reversible : true,
      containment_ref: input.risk?.containment_ref || null,
      unknown_risk_factors: Boolean(input.risk?.unknown_risk_factors),
    },
    evidence: {
      tests_passed: input.evidence?.tests_passed ?? null,
      independent_verification_ref: input.evidence?.independent_verification_ref || null,
      human_authorization_receipt: input.evidence?.human_authorization_receipt || null,
      has_unresolved_contradiction: Boolean(input.evidence?.has_unresolved_contradiction),
      past_telemetry_success: Boolean(input.evidence?.past_telemetry_success),
    },
    resource: {
      stc_lease_ref: input.resource?.stc_lease_ref || null,
      lease_valid: typeof input.resource?.lease_valid === 'boolean' ? input.resource.lease_valid : null,
      budget_envelope_ref: input.resource?.budget_envelope_ref || null,
      estimated_cost_usd: typeof input.resource?.estimated_cost_usd === 'number' ? input.resource.estimated_cost_usd : 0,
      envelope_remaining_usd: typeof input.resource?.envelope_remaining_usd === 'number' ? input.resource.envelope_remaining_usd : null,
      requested_increase_usd: typeof input.resource?.requested_increase_usd === 'number' ? input.resource.requested_increase_usd : null,
    },
    provenance: {
      requested_at: input.provenance?.requested_at || new Date().toISOString(),
    },
  };

  const draft = { ...request };
  draft.provenance.request_hash = computeGovernanceHash(draft);
  return draft;
}
/**
 * Validates a GOVERNANCE_PREFLIGHT_V1 request.
 */
export function validateGovernancePreflightRequest(request) {
  const errors = [];
  if (!request || typeof request !== 'object') return { valid: false, errors: ['Request must be an object'] };
  if (request.schema_version !== GOVERNANCE_PREFLIGHT_SCHEMA_VERSION) {
    errors.push(`Invalid schema_version: expected '${GOVERNANCE_PREFLIGHT_SCHEMA_VERSION}', got '${request.schema_version}'`);
  }
  if (!request.actor?.actor_id) errors.push('Missing actor.actor_id');
  if (!request.operation?.operation_class) errors.push('Missing operation.operation_class');
  if (!OPERATION_CLASSES.includes(request.operation?.operation_class)) {
    errors.push(`Unknown operation_class: '${request.operation?.operation_class}'`);
  }
  const suppliedHash = request.provenance?.request_hash;
  const unsignedRequest = structuredClone(request);
  if (unsignedRequest.provenance) delete unsignedRequest.provenance.request_hash;
  if (!suppliedHash) errors.push('Missing provenance.request_hash');
  else if (suppliedHash !== computeGovernanceHash(unsignedRequest)) errors.push('Request integrity hash mismatch');
  return { valid: errors.length === 0, errors };
}

/**
 * Creates a GOVERNANCE_DECISION_V1 decision object.
 */
export function createGovernanceDecision(input = {}) {
  const evaluatedAt = input.evaluated_at || new Date().toISOString();
  // Decisions are short-lived (default 5 minutes) to defend against TOCTOU stale authorization
  const ttlMs = typeof input.ttl_ms === 'number' ? input.ttl_ms : 300000;
  const validUntil = input.valid_until || new Date(Date.parse(evaluatedAt) + ttlMs).toISOString();

  const decision = {
    schema_version: GOVERNANCE_DECISION_SCHEMA_VERSION,
    request_hash: input.request_hash || null,
    decision: input.decision || DECISION_OUTCOMES.DENY,
    reason_codes: Array.isArray(input.reason_codes) ? [...input.reason_codes] : [],
    evaluated_policy: input.evaluated_policy || GOVERNANCE_POLICY_VERSION,
    authority_level: input.authority_level || 'FORBIDDEN',
    missing_requirements: Array.isArray(input.missing_requirements) ? [...input.missing_requirements] : [],
    human_gate_required: Boolean(input.human_gate_required),
    evaluated_at: evaluatedAt,
    valid_until: validUntil,
  };

  const draft = { ...decision };
  draft.decision_hash = computeGovernanceHash(draft);
  return draft;
}

/**
 * Validates a GOVERNANCE_DECISION_V1 decision.
 */
export function validateGovernanceDecision(decision) {
  const errors = [];
  if (!decision || typeof decision !== 'object') return { valid: false, errors: ['Decision must be an object'] };

  if (decision.schema_version !== GOVERNANCE_DECISION_SCHEMA_VERSION) {
    errors.push(`Invalid schema_version: expected '${GOVERNANCE_DECISION_SCHEMA_VERSION}', got '${decision.schema_version}'`);
  }
  if (!Object.values(DECISION_OUTCOMES).includes(decision.decision)) {
    errors.push(`Invalid decision outcome: '${decision.decision}'`);
  }
  if (!Array.isArray(decision.reason_codes) || decision.reason_codes.length === 0) {
    errors.push('Decision must have at least one typed reason code');
  }
  if (!decision.decision_hash) {
    errors.push('Missing decision_hash');
  } else {
    const target = { ...decision };
    delete target.decision_hash;
    const calculated = computeGovernanceHash(target);
    if (decision.decision_hash !== calculated) {
      errors.push(`Corrupted decision hash: expected ${calculated}, got ${decision.decision_hash}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
