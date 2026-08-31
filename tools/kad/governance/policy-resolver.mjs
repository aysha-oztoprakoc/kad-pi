/**
 * KAD Governance Policy Resolver
 *
 * Resolves authority requirements, risk tiers, and capability availability.
 *
 * Invariant: TARGET_AUTHORITY != CURRENT_ACTIVE_ENFORCEMENT
 * Invariant: CAPABILITY != AUTHORITY
 */

import {
  AUTHORITY_CLASSES,
  OPERATION_CLASSES,
  RISK_TIERS,
  REASON_CODES,
} from './schema.mjs';

export const CANONICAL_OPERATION_POLICIES = Object.freeze({
  READ_LOCAL: {
    target_authority: 'AUTONOMOUS_WITHIN_LEASE',
    current_authority: 'AUTONOMOUS_WITHIN_LEASE',
    default_risk_tier: RISK_TIERS.TIER_0_NO_RISK,
    enforcement_capability: 'FS_READ_NATIVE',
    enforcement_status: 'IMPLEMENTED',
    requires_human_receipt: false,
    requires_stc_lease: false,
  },
  PUBLIC_NETWORK_READ: {
    target_authority: 'DELEGATED_WITH_GATE',
    current_authority: 'DELEGATED_WITH_GATE',
    default_risk_tier: RISK_TIERS.TIER_1_LOW,
    enforcement_capability: 'RESTRICTED_EGRESS',
    enforcement_status: 'IMPLEMENTED',
    requires_human_receipt: false,
    requires_stc_lease: false,
  },
  AUTHENTICATED_READ: {
    target_authority: 'DELEGATED_WITH_GATE',
    current_authority: 'HUMAN_PREAUTHORIZED',
    default_risk_tier: RISK_TIERS.TIER_2_MEDIUM,
    enforcement_capability: 'CAPABILITY_BROKER_V1',
    enforcement_status: 'NOT_IMPLEMENTED', // Capability absent -> fallback closed to human receipt
    requires_human_receipt: true,
    requires_stc_lease: false,
  },
  WORKSPACE_MUTATION: {
    target_authority: 'AUTONOMOUS_WITHIN_LEASE',
    current_authority: 'AUTONOMOUS_WITHIN_LEASE',
    default_risk_tier: RISK_TIERS.TIER_1_LOW,
    enforcement_capability: 'WORKCTL_STC_LEASE',
    enforcement_status: 'IMPLEMENTED',
    requires_human_receipt: false,
    requires_stc_lease: true,
  },
  LOCAL_GIT_COMMIT: {
    target_authority: 'AUTONOMOUS_WITHIN_LEASE',
    current_authority: 'AUTONOMOUS_WITHIN_LEASE',
    default_risk_tier: RISK_TIERS.TIER_1_LOW,
    enforcement_capability: 'WORKCTL_STC_LEASE',
    enforcement_status: 'IMPLEMENTED',
    requires_human_receipt: false,
    requires_stc_lease: true,
  },
  REMOTE_GIT_PUSH: {
    target_authority: 'DELEGATED_WITH_GATE',
    current_authority: 'HUMAN_PREAUTHORIZED',
    default_risk_tier: RISK_TIERS.TIER_2_MEDIUM,
    enforcement_capability: 'GIT_REMOTE_GUARD',
    enforcement_status: 'IMPLEMENTED',
    requires_human_receipt: true,
    requires_stc_lease: true,
  },
  PR_CREATE: {
    target_authority: 'DELEGATED_WITH_GATE',
    current_authority: 'HUMAN_PREAUTHORIZED',
    default_risk_tier: RISK_TIERS.TIER_2_MEDIUM,
    enforcement_capability: 'GITHUB_API_GATE',
    enforcement_status: 'IMPLEMENTED',
    requires_human_receipt: true,
    requires_stc_lease: true,
  },
  MAIN_MERGE: {
    target_authority: 'DELEGATED_WITH_GATE',
    current_authority: 'HUMAN_PREAUTHORIZED',
    default_risk_tier: RISK_TIERS.TIER_3_HIGH,
    enforcement_capability: 'INDEPENDENT_VERIFICATION_GATE',
    enforcement_status: 'IMPLEMENTED',
    requires_human_receipt: true,
    requires_stc_lease: false,
    requires_independent_verification: true,
  },
  RELEASE_PUBLISH: {
    target_authority: 'HUMAN_ONLY',
    current_authority: 'HUMAN_ONLY',
    default_risk_tier: RISK_TIERS.TIER_4_CONSTITUTIONAL,
    enforcement_capability: 'HUMAN_SOVEREIGN_GATE',
    enforcement_status: 'IMPLEMENTED',
    requires_human_receipt: true,
    requires_stc_lease: false,
  },
  CANONICAL_KNOWLEDGE_PROMOTION: {
    target_authority: 'DELEGATED_WITH_GATE',
    current_authority: 'HUMAN_ONLY',
    default_risk_tier: RISK_TIERS.TIER_3_HIGH,
    enforcement_capability: 'EVIDENCE_GATE_V1',
    enforcement_status: 'IMPLEMENTED',
    requires_human_receipt: true,
    requires_stc_lease: false,
  },
  DERIVED_PROJECTION_REBUILD: {
    target_authority: 'DETERMINISTIC_POLICY',
    current_authority: 'DETERMINISTIC_POLICY',
    default_risk_tier: RISK_TIERS.TIER_0_NO_RISK,
    enforcement_capability: 'DETERMINISTIC_COMPILER',
    enforcement_status: 'IMPLEMENTED',
    requires_human_receipt: false,
    requires_stc_lease: true,
  },
  METERED_API_CALL: {
    target_authority: 'DELEGATED_WITH_GATE',
    current_authority: 'DELEGATED_WITH_GATE',
    default_risk_tier: RISK_TIERS.TIER_2_MEDIUM,
    enforcement_capability: 'FINOPS_ECONOMIC_ROUTER',
    enforcement_status: 'IMPLEMENTED',
    requires_human_receipt: false,
    requires_budget_envelope: true,
  },
  SCOPED_CREDENTIAL_USE: {
    target_authority: 'DELEGATED_WITH_GATE',
    current_authority: 'HUMAN_PREAUTHORIZED',
    default_risk_tier: RISK_TIERS.TIER_3_HIGH,
    enforcement_capability: 'CAPABILITY_BROKER_V1',
    enforcement_status: 'NOT_IMPLEMENTED', // Target != Active
    requires_human_receipt: true,
  },
  RAW_SECRET_ACCESS: {
    target_authority: 'FORBIDDEN',
    current_authority: 'FORBIDDEN',
    default_risk_tier: RISK_TIERS.TIER_4_CONSTITUTIONAL,
    enforcement_capability: 'SECRET_SANITIZATION_GATE',
    enforcement_status: 'IMPLEMENTED',
    requires_human_receipt: false,
  },
  INFRASTRUCTURE_MUTATION: {
    target_authority: 'HUMAN_ONLY',
    current_authority: 'HUMAN_ONLY',
    default_risk_tier: RISK_TIERS.TIER_3_HIGH,
    enforcement_capability: 'HOST_MUTATION_GUARD',
    enforcement_status: 'IMPLEMENTED',
    requires_human_receipt: true,
  },
  POLICY_MUTATION: {
    target_authority: 'HUMAN_ONLY',
    current_authority: 'HUMAN_ONLY',
    default_risk_tier: RISK_TIERS.TIER_4_CONSTITUTIONAL,
    enforcement_capability: 'POLICY_INTEGRITY_GUARD',
    enforcement_status: 'IMPLEMENTED',
    requires_human_receipt: true,
  },
  CONSTITUTIONAL_MUTATION: {
    target_authority: 'HUMAN_ONLY',
    current_authority: 'HUMAN_ONLY',
    default_risk_tier: RISK_TIERS.TIER_4_CONSTITUTIONAL,
    enforcement_capability: 'CONSTITUTIONAL_IMMUTABILITY_GUARD',
    enforcement_status: 'IMPLEMENTED',
    requires_human_receipt: true,
  },
});

/**
 * Resolves the effective active authority and constraints for an operation.
 */
export function resolveOperationAuthority(operationClass, overrides = {}) {
  const basePolicy = CANONICAL_OPERATION_POLICIES[operationClass];
  if (!basePolicy) {
    return {
      operation_class: operationClass,
      target_authority: 'HUMAN_ONLY',
      current_authority: 'HUMAN_ONLY',
      default_risk_tier: RISK_TIERS.TIER_3_HIGH,
      enforcement_status: 'UNKNOWN',
      requires_human_receipt: true,
    };
  }

  // Check capability overrides (e.g. testing missing capabilities)
  let currentAuthority = basePolicy.current_authority;
  let enforcementStatus = basePolicy.enforcement_status;

  if (overrides.capabilityStatus && overrides.capabilityStatus[basePolicy.enforcement_capability]) {
    enforcementStatus = overrides.capabilityStatus[basePolicy.enforcement_capability];
    if (enforcementStatus === 'NOT_IMPLEMENTED') {
      currentAuthority = 'HUMAN_ONLY';
    }
  }

  return {
    operation_class: operationClass,
    target_authority: basePolicy.target_authority,
    current_authority: currentAuthority,
    default_risk_tier: basePolicy.default_risk_tier,
    enforcement_capability: basePolicy.enforcement_capability,
    enforcement_status: enforcementStatus,
    requires_human_receipt: basePolicy.requires_human_receipt || currentAuthority === 'HUMAN_ONLY' || currentAuthority === 'HUMAN_PREAUTHORIZED',
    requires_stc_lease: Boolean(basePolicy.requires_stc_lease),
    requires_budget_envelope: Boolean(basePolicy.requires_budget_envelope),
    requires_independent_verification: Boolean(basePolicy.requires_independent_verification),
  };
}

export function resolveActivePolicy(request, options = {}) {
  const opClass = request.operation?.operation_class;
  const policy = resolveOperationAuthority(opClass, options);

  // Derive canonical risk tier, preventing agent from self-downgrading
  const declaredRisk = request.risk?.risk_tier;
  const canonicalRisk = policy.default_risk_tier;

  const isDowngradeAttempt = declaredRisk && (
    (canonicalRisk === RISK_TIERS.TIER_4_CONSTITUTIONAL && declaredRisk !== RISK_TIERS.TIER_4_CONSTITUTIONAL) ||
    (canonicalRisk === RISK_TIERS.TIER_3_HIGH && (declaredRisk === RISK_TIERS.TIER_1_LOW || declaredRisk === RISK_TIERS.TIER_0_NO_RISK))
  );

  return {
    ...policy,
    canonical_risk_tier: canonicalRisk,
    is_risk_downgrade_attempt: Boolean(isDowngradeAttempt),
  };
}
