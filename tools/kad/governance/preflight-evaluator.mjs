/**
 * KAD Governance Preflight Evaluator Pipeline
 *
 * Evaluates operational proposals through deterministic security, authority,
 * scope, STC lease, FinOps, evidence readiness, and anti-spoofing gates.
 *
 * Invariant: MODEL OUTPUT PROPOSES != DETERMINISTIC POLICY AUTHORIZES
 */

import path from 'node:path';

import {
  DECISION_OUTCOMES,
  REASON_CODES,
  RISK_TIERS,
  createGovernanceDecision,
  validateGovernancePreflightRequest,
} from './schema.mjs';

import {
  validateHumanAuthorizationReceipt,
  validateHumanAuthorizationReceiptV2,
} from './human-receipt.mjs';
import {
  resolveActivePolicy,
} from './policy-resolver.mjs';

/**
 * Evaluates a GOVERNANCE_PREFLIGHT_V1 request through the multi-stage governance pipeline.
 */
export function evaluateGovernancePreflight(request, options = {}) {
  const requestValidation = validateGovernancePreflightRequest(request);
  if (!requestValidation.valid) {
    return createGovernanceDecision({
      request_hash: request.provenance?.request_hash || null,
      decision: DECISION_OUTCOMES.DENY,
      reason_codes: [REASON_CODES.AUTHORITY_INSUFFICIENT],
      missing_requirements: requestValidation.errors,
      authority_level: 'FORBIDDEN',
    });
  }

  const opClass = request.operation.operation_class;
  const policy = resolveActivePolicy(request, options);
  const reasonCodes = [];
  const missingRequirements = [];

  // Gate 1: Forbidden Raw Secret Access
  if (opClass === 'RAW_SECRET_ACCESS') {
    return createGovernanceDecision({
      request_hash: request.provenance?.request_hash || null,
      decision: DECISION_OUTCOMES.DENY,
      reason_codes: [REASON_CODES.RAW_SECRET_ACCESS_FORBIDDEN],
      authority_level: 'FORBIDDEN',
    });
  }

  // Gate 2: Budget Self-Escalation Prohibition
  if (opClass === 'POLICY_MUTATION' && (request.operation.action?.includes('budget') || request.resource?.requested_increase_usd)) {
    return createGovernanceDecision({
      request_hash: request.provenance?.request_hash || null,
      decision: DECISION_OUTCOMES.DENY,
      reason_codes: [REASON_CODES.BUDGET_SELF_ESCALATION_FORBIDDEN],
      authority_level: 'FORBIDDEN',
    });
  }

  // Gate 3: Constitutional Contradiction Fail-Closed
  if (request.evidence?.has_unresolved_contradiction) {
    return createGovernanceDecision({
      request_hash: request.provenance?.request_hash || null,
      decision: DECISION_OUTCOMES.DENY,
      reason_codes: [REASON_CODES.CONSTITUTIONAL_CONTRADICTION_FAIL_CLOSED],
      authority_level: 'FORBIDDEN',
    });
  }

  // Gate 4: Constitutional Mutation Human-Only Protection
  if (opClass === 'CONSTITUTIONAL_MUTATION') {
    return createGovernanceDecision({
      request_hash: request.provenance?.request_hash || null,
      decision: DECISION_OUTCOMES.DENY,
      reason_codes: [REASON_CODES.CONSTITUTIONAL_MUTATION_HUMAN_ONLY],
      authority_level: 'HUMAN_ONLY',
      human_gate_required: true,
    });
  }

  // Gate 5: Risk Classification Downgrade Attempt
  if (policy.is_risk_downgrade_attempt) {
    return createGovernanceDecision({
      request_hash: request.provenance?.request_hash || null,
      decision: DECISION_OUTCOMES.DENY,
      reason_codes: [REASON_CODES.RISK_TIER_DOWNGRADE_FORBIDDEN],
      authority_level: policy.current_authority,
    });
  }

  // Gate 6: Main Merge Pre-Verification Check (Fails closed on missing independent verification)
  if (opClass === 'MAIN_MERGE' && !request.evidence?.independent_verification_ref) {
    return createGovernanceDecision({
      request_hash: request.provenance?.request_hash || null,
      decision: DECISION_OUTCOMES.DENY,
      reason_codes: [REASON_CODES.INDEPENDENT_VERIFICATION_MISSING],
      authority_level: 'DELEGATED_WITH_GATE',
    });
  }

  // Gate 7: Fake Human Approval Prose Rejection
  if (request.authority?.claimed_human_approval_in_prose && !request.evidence?.human_authorization_receipt) {
    return createGovernanceDecision({
      request_hash: request.provenance?.request_hash || null,
      decision: DECISION_OUTCOMES.REQUIRE_HUMAN,
      reason_codes: [REASON_CODES.FAKE_HUMAN_APPROVAL_PROSE_REJECTED, REASON_CODES.HUMAN_RECEIPT_MISSING],
      authority_level: 'HUMAN_PREAUTHORIZED',
      human_gate_required: true,
    });
  }

  // Gate 8: Human Authorization Receipt Validation
  let humanReceiptAuthorized = false;
  if (request.evidence?.human_authorization_receipt) {
    const receipt = request.evidence.human_authorization_receipt;
    const receiptVal = receipt.schema_version === 'HUMAN_AUTHORIZATION_RECEIPT_V2'
      ? validateHumanAuthorizationReceiptV2(receipt, {
        expectedWpId: request.work.workpackage_id,
        expectedOperationClass: opClass,
        expectedAction: request.operation.action_kind === 'ROLLBACK' ? undefined : request.operation.action,
        requestedAction: request.operation.action,
        expectedExecutor: request.actor.actor_id,
        requestedPaths: request.scope.requested_paths,
        now: request.provenance?.requested_at,
        actionKind: request.operation.action_kind,
      })
      : request.authority?.require_v2_delegation
        ? validateHumanAuthorizationReceiptV2(receipt, { requireDelegation: true })
        : validateHumanAuthorizationReceipt(receipt, {
          expectedWpId: request.work.workpackage_id,
          expectedOperationClass: opClass,
          expectedResourceRefs: request.operation.resource_refs,
          now: request.provenance?.requested_at,
        });

    if (!receiptVal.valid) {
      return createGovernanceDecision({
        request_hash: request.provenance?.request_hash || null,
        decision: DECISION_OUTCOMES.DENY,
        reason_codes: receiptVal.reason_codes,
        missing_requirements: receiptVal.errors,
        authority_level: 'HUMAN_PREAUTHORIZED',
      });
    }
    humanReceiptAuthorized = true;
  }

  // Gate 9: Missing Capability Enforcement Status (when not explicitly authorized by human receipt)
  if (!humanReceiptAuthorized && policy.enforcement_status === 'NOT_IMPLEMENTED') {
    return createGovernanceDecision({
      request_hash: request.provenance?.request_hash || null,
      decision: DECISION_OUTCOMES.REQUIRE_HUMAN,
      reason_codes: [REASON_CODES.CAPABILITY_NOT_IMPLEMENTED],
      missing_requirements: [`Capability ${policy.enforcement_capability} is not implemented`],
      authority_level: policy.current_authority,
      human_gate_required: true,
    });
  }

  // Gate 10: Unknown High-Risk Trust State
  if (request.risk?.unknown_risk_factors && (policy.canonical_risk_tier === RISK_TIERS.TIER_3_HIGH || policy.canonical_risk_tier === RISK_TIERS.TIER_4_CONSTITUTIONAL)) {
    return createGovernanceDecision({
      request_hash: request.provenance?.request_hash || null,
      decision: DECISION_OUTCOMES.BLOCKED,
      reason_codes: [REASON_CODES.UNKNOWN_HIGH_IMPACT_STATE],
      authority_level: 'HUMAN_ONLY',
      human_gate_required: true,
    });
  }

  // Gate 11: Operations requiring human receipt where none was provided
  if (policy.requires_human_receipt && !humanReceiptAuthorized) {
    if (opClass === 'CANONICAL_KNOWLEDGE_PROMOTION') {
      return createGovernanceDecision({
        request_hash: request.provenance?.request_hash || null,
        decision: DECISION_OUTCOMES.REQUIRE_HUMAN,
        reason_codes: [REASON_CODES.DOCTRINE_PROMOTION_HUMAN_ONLY, REASON_CODES.HUMAN_RECEIPT_MISSING],
        authority_level: 'HUMAN_ONLY',
        human_gate_required: true,
      });
    }

    if (request.evidence?.past_telemetry_success) {
      return createGovernanceDecision({
        request_hash: request.provenance?.request_hash || null,
        decision: DECISION_OUTCOMES.DENY,
        reason_codes: [REASON_CODES.PAST_SUCCESS_INSUFFICIENT_FOR_AUTHORITY, REASON_CODES.HUMAN_RECEIPT_MISSING],
        authority_level: 'HUMAN_PREAUTHORIZED',
        human_gate_required: true,
      });
    }

    return createGovernanceDecision({
      request_hash: request.provenance?.request_hash || null,
      decision: DECISION_OUTCOMES.REQUIRE_HUMAN,
      reason_codes: [REASON_CODES.HUMAN_RECEIPT_MISSING, REASON_CODES.HIGH_RISK_HUMAN_GATE_REQUIRED],
      authority_level: 'HUMAN_PREAUTHORIZED',
      human_gate_required: true,
    });
  }

  // Gate 12: If human receipt is valid and operation was human-authorized, grant ALLOW
  if (humanReceiptAuthorized) {
    const reasons = [REASON_CODES.AUTHORIZED_BY_HUMAN_RECEIPT];
    if (opClass === 'MAIN_MERGE') {
      reasons.unshift(REASON_CODES.MAIN_INTEGRATION_READY);
    }
    return createGovernanceDecision({
      request_hash: request.provenance?.request_hash || null,
      decision: DECISION_OUTCOMES.ALLOW,
      reason_codes: reasons,
      authority_level: 'HUMAN_PREAUTHORIZED',
    });
  }
  // Gate 9: FinOps Metered Call & Envelope Check
  if (opClass === 'METERED_API_CALL') {
    const isPaidAuthorized = typeof options.paidAuthorized === 'boolean' ? options.paidAuthorized : false;
    if (!isPaidAuthorized) {
      return createGovernanceDecision({
        request_hash: request.provenance?.request_hash || null,
        decision: DECISION_OUTCOMES.DENY,
        reason_codes: [REASON_CODES.BUDGET_NOT_AUTHORIZED],
        authority_level: 'DELEGATED_WITH_GATE',
        human_gate_required: true,
      });
    }

    const estimatedCost = request.resource?.estimated_cost_usd || 0;
    const remainingEnvelope = request.resource?.envelope_remaining_usd;
    if (typeof remainingEnvelope === 'number' && estimatedCost > remainingEnvelope) {
      return createGovernanceDecision({
        request_hash: request.provenance?.request_hash || null,
        decision: DECISION_OUTCOMES.DENY,
        reason_codes: [REASON_CODES.BUDGET_ENVELOPE_EXCEEDED],
        authority_level: 'DELEGATED_WITH_GATE',
        human_gate_required: true,
      });
    }

    return createGovernanceDecision({
      request_hash: request.provenance?.request_hash || null,
      decision: DECISION_OUTCOMES.ALLOW,
      reason_codes: [REASON_CODES.BUDGET_ENVELOPE_AUTHORIZED],
      authority_level: 'DELEGATED_WITH_GATE',
    });
  }


  // Gate 11: Workctl Claim & STC Lease Check (for mutations & local commits)
  if (policy.requires_stc_lease) {
    const hasClaim = typeof options.mockActiveClaim === 'boolean'
      ? options.mockActiveClaim
      : (request.work.lifecycle_state === 'IN_PROGRESS' || request.work.lifecycle_state === 'CLAIMED');

    if (!hasClaim) {
      return createGovernanceDecision({
        request_hash: request.provenance?.request_hash || null,
        decision: DECISION_OUTCOMES.DENY,
        reason_codes: [REASON_CODES.NO_ACTIVE_CLAIM, REASON_CODES.CAPABILITY_WITHOUT_AUTHORITY_DENIED],
        authority_level: 'AUTONOMOUS_WITHIN_LEASE',
      });
    }

    if (request.resource?.lease_valid === false || !request.resource?.stc_lease_ref) {
      return createGovernanceDecision({
        request_hash: request.provenance?.request_hash || null,
        decision: DECISION_OUTCOMES.DENY,
        reason_codes: [request.resource?.lease_valid === false ? REASON_CODES.STC_LEASE_EXPIRED : REASON_CODES.STC_LEASE_MISSING],
        authority_level: 'AUTONOMOUS_WITHIN_LEASE',
      });
    }

    // Scope check: requested_paths vs owned_paths with robust canonicalization (CWE-22 defense)
    const ownedPaths = request.scope.owned_paths || [];
    const requestedPaths = request.scope.requested_paths || [];
    const fakeRoot = '/workspace_root';

    for (const reqPath of requestedPaths) {
      const normalizedRawReq = String(reqPath || '').replace(/\\/g, '/');
      const canonicalReq = path.resolve(fakeRoot, normalizedRawReq).replace(/\\/g, '/');

      if (!canonicalReq.startsWith(fakeRoot)) {
        return createGovernanceDecision({
          request_hash: request.provenance?.request_hash || null,
          decision: DECISION_OUTCOMES.DENY,
          reason_codes: [REASON_CODES.PATH_OUTSIDE_SCOPE],
          missing_requirements: [`Requested path '${reqPath}' attempts directory traversal outside workspace`],
          authority_level: 'AUTONOMOUS_WITHIN_LEASE',
        });
      }

      const relativeCanonicalReq = canonicalReq.slice(fakeRoot.length).replace(/^\/+/, '');

      const isOwned = ownedPaths.some((owned) => {
        const normalizedRawOwned = String(owned || '').replace(/\\/g, '/');
        const canonicalOwned = path.resolve(fakeRoot, normalizedRawOwned).replace(/\\/g, '/');
        const relativeCanonicalOwned = canonicalOwned.slice(fakeRoot.length).replace(/^\/+/, '');
        const ownedDirectory = relativeCanonicalOwned ? `${relativeCanonicalOwned}/` : '';
        if (relativeCanonicalOwned === relativeCanonicalReq) return true;
        return Boolean(ownedDirectory) && relativeCanonicalReq.startsWith(ownedDirectory);
      });

      if (!isOwned) {
        return createGovernanceDecision({
          request_hash: request.provenance?.request_hash || null,
          decision: DECISION_OUTCOMES.DENY,
          reason_codes: [REASON_CODES.PATH_OUTSIDE_SCOPE],
          missing_requirements: [`Requested path '${reqPath}' is outside owned scope [${ownedPaths.join(', ')}]`],
          authority_level: 'AUTONOMOUS_WITHIN_LEASE',
        });
      }
    }

    return createGovernanceDecision({
      request_hash: request.provenance?.request_hash || null,
      decision: DECISION_OUTCOMES.ALLOW,
      reason_codes: [opClass === 'DERIVED_PROJECTION_REBUILD' ? REASON_CODES.AUTHORIZED_BY_POLICY : REASON_CODES.AUTHORIZED_WITHIN_LEASE],
      authority_level: 'AUTONOMOUS_WITHIN_LEASE',
    });
  }

  // Gate 12: Low-Risk Deterministic Policy (Reads, Projection Rebuilds)
  if (policy.current_authority === 'DETERMINISTIC_POLICY' || policy.current_authority === 'AUTONOMOUS_WITHIN_LEASE') {
    const isRead = opClass === 'READ_LOCAL' || opClass === 'PUBLIC_NETWORK_READ';
    return createGovernanceDecision({
      request_hash: request.provenance?.request_hash || null,
      decision: DECISION_OUTCOMES.ALLOW,
      reason_codes: [isRead ? REASON_CODES.READ_LOCAL_AUTONOMOUS : REASON_CODES.AUTHORIZED_BY_POLICY],
      authority_level: policy.current_authority,
    });
  }

  // Gate 13: Authorized by Human Receipt
  if (request.evidence?.human_authorization_receipt) {
    return createGovernanceDecision({
      request_hash: request.provenance?.request_hash || null,
      decision: DECISION_OUTCOMES.ALLOW,
      reason_codes: [REASON_CODES.AUTHORIZED_BY_HUMAN_RECEIPT],
      authority_level: 'HUMAN_PREAUTHORIZED',
    });
  }

  // Default Fallback
  return createGovernanceDecision({
    request_hash: request.provenance?.request_hash || null,
    decision: DECISION_OUTCOMES.REQUIRE_HUMAN,
    reason_codes: [REASON_CODES.HIGH_RISK_HUMAN_GATE_REQUIRED],
    authority_level: 'HUMAN_ONLY',
    human_gate_required: true,
  });
}

/**
 * Checks if a prior governance decision is still fresh and unexpired (TOCTOU defense).
 */
export function verifyDecisionFreshness(decision, now = Date.now()) {
  if (!decision || typeof decision !== 'object') return false;
  if (!decision.valid_until) return false;

  const validUntilTime = Date.parse(decision.valid_until);
  return now <= validUntilTime;
}
