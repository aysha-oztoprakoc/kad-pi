import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  GOVERNANCE_PREFLIGHT_SCHEMA_VERSION,
  GOVERNANCE_DECISION_SCHEMA_VERSION,
  DECISION_OUTCOMES,
  REASON_CODES,
  createGovernancePreflightRequest,
} from '../governance/schema.mjs';

import {
  createHumanAuthorizationReceipt,
} from '../governance/human-receipt.mjs';

import {
  evaluateGovernancePreflight,
  verifyDecisionFreshness,
} from '../governance/preflight-evaluator.mjs';

test('G16: main merge with full required evidence -> readiness decision according to current authority', () => {
  const receipt = createHumanAuthorizationReceipt({
    actor_id: 'human.project_lead',
    workpackage_id: 'WP-KAD-TEST-016',
    operation_class: 'MAIN_MERGE',
    scope: ['main'],
    resource_refs: ['git:branch:main'],
    valid_until: new Date(Date.now() + 3600000).toISOString(),
    note: 'Authorized merge following green validation and independent review',
  });

  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-016', lifecycle_state: 'REVIEW' },
    operation: { operation_class: 'MAIN_MERGE', action: 'git.merge_main', resource_refs: ['git:branch:main'] },
    evidence: {
      tests_passed: true,
      independent_verification_ref: 'evidence/WP-KAD-TEST-016/07-independent-verification.md',
      human_authorization_receipt: receipt,
    },
  });

  const decision = evaluateGovernancePreflight(request);
  assert.equal(decision.decision, DECISION_OUTCOMES.ALLOW);
  assert.ok(decision.reason_codes.includes(REASON_CODES.MAIN_INTEGRATION_READY));
});

test('G17: constitutional mutation by agent -> DENY / HUMAN_ONLY', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-017', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'CONSTITUTIONAL_MUTATION', action: 'mutate.prime_directive', resource_refs: ['PRIME_DIRECTIVE.md'] },
    scope: { owned_paths: ['PRIME_DIRECTIVE.md'], requested_paths: ['PRIME_DIRECTIVE.md'] },
  });

  const decision = evaluateGovernancePreflight(request);
  assert.equal(decision.decision, DECISION_OUTCOMES.DENY);
  assert.ok(decision.reason_codes.includes(REASON_CODES.CONSTITUTIONAL_MUTATION_HUMAN_ONLY));
});

test('G18: unknown high-risk trust state -> BLOCKED / REQUIRE_HUMAN', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-018', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'INFRASTRUCTURE_MUTATION', action: 'deploy.host', resource_refs: ['host:tell'] },
    risk: { risk_tier: 'TIER_3_HIGH', unknown_risk_factors: true },
  });

  const decision = evaluateGovernancePreflight(request);
  assert.notEqual(decision.decision, DECISION_OUTCOMES.ALLOW);
  assert.ok(decision.reason_codes.includes(REASON_CODES.UNKNOWN_HIGH_IMPACT_STATE) || decision.reason_codes.includes(REASON_CODES.HIGH_RISK_HUMAN_GATE_REQUIRED));
});

test('G19: unknown irrelevant metric -> must not block unrelated low-risk operation', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-019', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'READ_LOCAL', action: 'fs.read', resource_refs: ['docs/README.md'] },
    scope: { owned_paths: ['docs/'], requested_paths: ['docs/README.md'] },
  });

  // Even if economic quota or GPU telemetry is UNKNOWN, local read proceeds
  const decision = evaluateGovernancePreflight(request, { mockTelemetryUnknown: true });
  assert.equal(decision.decision, DECISION_OUTCOMES.ALLOW);
  assert.ok(decision.reason_codes.includes(REASON_CODES.AUTHORIZED_BY_POLICY) || decision.reason_codes.includes(REASON_CODES.READ_LOCAL_AUTONOMOUS));
});

test('G20: target authority exists but enforcement capability absent -> DENY / REQUIRE_HUMAN', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-020', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'SCOPED_CREDENTIAL_USE', action: 'auth.delegate', resource_refs: ['credential:broker'] },
    authority: { target_authority: 'DELEGATED_WITH_GATE' },
  });

  // CAPABILITY_BROKER_V1 is NOT_IMPLEMENTED, so target authority cannot be exercised autonomously
  const decision = evaluateGovernancePreflight(request, { capabilityStatus: { CAPABILITY_BROKER_V1: 'NOT_IMPLEMENTED' } });
  assert.notEqual(decision.decision, DECISION_OUTCOMES.ALLOW);
  assert.ok(decision.reason_codes.includes(REASON_CODES.CAPABILITY_NOT_IMPLEMENTED));
});

test('G21: expired human authorization receipt -> DENY', () => {
  const expiredReceipt = createHumanAuthorizationReceipt({
    actor_id: 'human.project_lead',
    workpackage_id: 'WP-KAD-TEST-021',
    operation_class: 'REMOTE_GIT_PUSH',
    scope: ['origin/topic-021'],
    resource_refs: ['git:remote:origin'],
    valid_until: new Date(Date.now() - 3600000).toISOString(), // Expired 1 hour ago!
    note: 'Old authorization',
  });

  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-021', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'REMOTE_GIT_PUSH', action: 'git.push', resource_refs: ['git:remote:origin'] },
    scope: { owned_paths: ['origin/topic-021'], requested_paths: ['origin/topic-021'] },
    evidence: { human_authorization_receipt: expiredReceipt },
  });

  const decision = evaluateGovernancePreflight(request);
  assert.equal(decision.decision, DECISION_OUTCOMES.DENY);
  assert.ok(decision.reason_codes.includes(REASON_CODES.HUMAN_RECEIPT_EXPIRED));
});

test('G22: authorization for WP-A reused on WP-B -> DENY (confused deputy WP mismatch)', () => {
  const receiptForWpA = createHumanAuthorizationReceipt({
    actor_id: 'human.project_lead',
    workpackage_id: 'WP-KAD-A',
    operation_class: 'REMOTE_GIT_PUSH',
    scope: ['origin/topic-a'],
    resource_refs: ['git:remote:origin'],
    valid_until: new Date(Date.now() + 3600000).toISOString(),
    note: 'Authorized for WP-A',
  });

  const requestOnWpB = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-B', lifecycle_state: 'IN_PROGRESS' }, // Different WP!
    operation: { operation_class: 'REMOTE_GIT_PUSH', action: 'git.push', resource_refs: ['git:remote:origin'] },
    scope: { owned_paths: ['origin/topic-b'], requested_paths: ['origin/topic-b'] },
    evidence: { human_authorization_receipt: receiptForWpA },
  });

  const decision = evaluateGovernancePreflight(requestOnWpB);
  assert.equal(decision.decision, DECISION_OUTCOMES.DENY);
  assert.ok(decision.reason_codes.includes(REASON_CODES.CONFUSED_DEPUTY_WP_MISMATCH));
});

test('G23: authorization for resource A reused on resource B -> DENY (confused deputy resource mismatch)', () => {
  const receiptForResourceA = createHumanAuthorizationReceipt({
    actor_id: 'human.project_lead',
    workpackage_id: 'WP-KAD-TEST-023',
    operation_class: 'AUTHENTICATED_READ',
    scope: ['repo/data-workspace'],
    resource_refs: ['resource:data-workspace'],
    valid_until: new Date(Date.now() + 3600000).toISOString(),
    note: 'Authorized for data-workspace only',
  });

  const requestForResourceB = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-023', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'AUTHENTICATED_READ', action: 'read', resource_refs: ['resource:private-vault'] }, // Different resource!
    scope: { owned_paths: ['repo/data-workspace'], requested_paths: ['repo/private-vault'] },
    evidence: { human_authorization_receipt: receiptForResourceA },
  });

  const decision = evaluateGovernancePreflight(requestForResourceB);
  assert.equal(decision.decision, DECISION_OUTCOMES.DENY);
  assert.ok(decision.reason_codes.includes(REASON_CODES.CONFUSED_DEPUTY_RESOURCE_MISMATCH) || decision.reason_codes.includes(REASON_CODES.PATH_OUTSIDE_SCOPE));
});

test('G24: provider capable of operation but lacks authority -> DENY (CAPABILITY != AUTHORITY)', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'provider.openai-gpt4o', actor_class: 'EXTERNAL_PROVIDER' },
    work: { workpackage_id: 'WP-KAD-TEST-024', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'WORKSPACE_MUTATION', action: 'fs.write', resource_refs: ['tools/index.js'] },
    scope: { owned_paths: ['tools/'], requested_paths: ['tools/index.js'] },
    resource: { stc_lease_ref: null }, // Provider has no lease/claim
  });

  const decision = evaluateGovernancePreflight(request, { mockActiveClaim: false });
  assert.equal(decision.decision, DECISION_OUTCOMES.DENY);
  assert.ok(decision.reason_codes.includes(REASON_CODES.CAPABILITY_WITHOUT_AUTHORITY_DENIED) || decision.reason_codes.includes(REASON_CODES.NO_ACTIVE_CLAIM));
});

test('G25: telemetry says previous success but current authority absent -> DENY', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-025', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'REMOTE_GIT_PUSH', action: 'git.push', resource_refs: ['git:remote:origin'] },
    evidence: {
      past_telemetry_success: true, // Claiming it succeeded in WP-030 does not grant current authority
      human_authorization_receipt: null,
    },
  });

  const decision = evaluateGovernancePreflight(request);
  assert.notEqual(decision.decision, DECISION_OUTCOMES.ALLOW);
  assert.ok(decision.reason_codes.includes(REASON_CODES.PAST_SUCCESS_INSUFFICIENT_FOR_AUTHORITY) || decision.reason_codes.includes(REASON_CODES.HUMAN_RECEIPT_MISSING));
});

test('G26: denial emits typed reason codes -> PASS', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-026', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'RAW_SECRET_ACCESS', action: 'read_secret', resource_refs: ['secret:key'] },
  });

  const decision = evaluateGovernancePreflight(request);
  assert.equal(decision.decision, DECISION_OUTCOMES.DENY);
  assert.ok(Array.isArray(decision.reason_codes));
  assert.ok(decision.reason_codes.length > 0);
  assert.equal(typeof decision.reason_codes[0], 'string');
});

test('G27: governance gate produces decision receipts without mutating workctl lifecycle directly', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-027', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'READ_LOCAL', action: 'fs.read', resource_refs: ['src/index.js'] },
    scope: { owned_paths: ['src/'], requested_paths: ['src/index.js'] },
  });

  const decision = evaluateGovernancePreflight(request);
  assert.equal(decision.schema_version, GOVERNANCE_DECISION_SCHEMA_VERSION);
  assert.ok(decision.decision_hash.startsWith('sha256:'));
  // Verifies decision is an evaluation receipt, not a workctl state change command
  assert.equal(decision.workpackage_id, undefined); // Does not contain task lifecycle mutation fields
});

test('G28: operation after decision expiry -> re-evaluate / DENY stale decision (TOCTOU defense)', () => {
  const pastDecision = {
    schema_version: GOVERNANCE_DECISION_SCHEMA_VERSION,
    decision: DECISION_OUTCOMES.ALLOW,
    reason_codes: [REASON_CODES.AUTHORIZED_WITHIN_LEASE],
    evaluated_at: new Date(Date.now() - 300000).toISOString(),
    valid_until: new Date(Date.now() - 60000).toISOString(), // Expired 1 minute ago
    decision_hash: 'sha256:mock123',
  };

  const isFresh = verifyDecisionFreshness(pastDecision);
  assert.equal(isFresh, false);
});

test('G29: risk classification downgrade attempted by executor -> DENY', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-029', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'CONSTITUTIONAL_MUTATION', action: 'mutate', resource_refs: ['vault/00_Governance/PRIME_DIRECTIVE.md'] },
    risk: { risk_tier: 'TIER_1_LOW' }, // Agent falsely claims constitutional mutation is TIER_1_LOW!
  });

  const decision = evaluateGovernancePreflight(request);
  assert.equal(decision.decision, DECISION_OUTCOMES.DENY);
  assert.ok(decision.reason_codes.includes(REASON_CODES.RISK_TIER_DOWNGRADE_FORBIDDEN) || decision.reason_codes.includes(REASON_CODES.CONSTITUTIONAL_MUTATION_HUMAN_ONLY));
});

test('G30: conflicting constitutional evidence -> fail closed on affected operation', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-030', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'POLICY_MUTATION', action: 'policy.override', resource_refs: ['config/policy.json'] },
    evidence: {
      has_unresolved_contradiction: true,
    },
  });

  const decision = evaluateGovernancePreflight(request);
  assert.equal(decision.decision, DECISION_OUTCOMES.DENY);
  assert.ok(decision.reason_codes.includes(REASON_CODES.CONSTITUTIONAL_CONTRADICTION_FAIL_CLOSED));
});

test('G31: relative path traversal attempt in scope check -> DENY (CWE-22 defense)', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-031', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'WORKSPACE_MUTATION', action: 'fs.write', resource_refs: ['tools/kad/governance/../../secret.json'] },
    scope: { owned_paths: ['tools/kad/governance/'], requested_paths: ['tools/kad/governance/../../secret.json'] },
    resource: { stc_lease_ref: 'claim:test-031', lease_valid: true },
  });

  const decision = evaluateGovernancePreflight(request, { mockActiveClaim: true });
  assert.equal(decision.decision, DECISION_OUTCOMES.DENY);
  assert.ok(decision.reason_codes.includes(REASON_CODES.PATH_OUTSIDE_SCOPE));
});
