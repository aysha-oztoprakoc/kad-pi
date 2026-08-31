import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  GOVERNANCE_PREFLIGHT_SCHEMA_VERSION,
  GOVERNANCE_DECISION_SCHEMA_VERSION,
  HUMAN_RECEIPT_SCHEMA_VERSION,
  AUTHORITY_CLASSES,
  OPERATION_CLASSES,
  DECISION_OUTCOMES,
  REASON_CODES,
  RISK_TIERS,
  createGovernancePreflightRequest,
  validateGovernancePreflightRequest,
  createGovernanceDecision,
  validateGovernanceDecision,
} from '../governance/schema.mjs';

import {
  createHumanAuthorizationReceipt,
  validateHumanAuthorizationReceipt,
  verifyHumanReceiptIntegrity,
} from '../governance/human-receipt.mjs';

import {
  resolveOperationAuthority,
  resolveActivePolicy,
} from '../governance/policy-resolver.mjs';

import {
  evaluateGovernancePreflight,
} from '../governance/preflight-evaluator.mjs';

test('G01: valid local read -> ALLOW', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-001', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'READ_LOCAL', action: 'fs.read', resource_refs: ['src/index.js'] },
    scope: { owned_paths: ['src/'], requested_paths: ['src/index.js'] },
  });

  const decision = evaluateGovernancePreflight(request);
  assert.equal(decision.decision, DECISION_OUTCOMES.ALLOW);
  assert.ok(decision.reason_codes.includes(REASON_CODES.AUTHORIZED_BY_POLICY) || decision.reason_codes.includes(REASON_CODES.READ_LOCAL_AUTONOMOUS));
});

test('G02: bounded builder mutation + active claim + valid STC lease + in-scope path -> ALLOW', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-GOVERNANCE-GATES-032', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'WORKSPACE_MUTATION', action: 'fs.write', resource_refs: ['tools/kad/governance/schema.mjs'] },
    scope: { owned_paths: ['tools/kad/governance/'], requested_paths: ['tools/kad/governance/schema.mjs'] },
    resource: { stc_lease_ref: 'claim:dfbb91fd-3ac0-415b-8c85-7f33fe8e6f22', lease_valid: true },
  });

  const decision = evaluateGovernancePreflight(request, { mockActiveClaim: true });
  assert.equal(decision.decision, DECISION_OUTCOMES.ALLOW);
  assert.ok(decision.reason_codes.includes(REASON_CODES.AUTHORIZED_WITHIN_LEASE));
});

test('G03: builder mutation outside owned scope -> DENY', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-GOVERNANCE-GATES-032', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'WORKSPACE_MUTATION', action: 'fs.write', resource_refs: ['vault/00_Governance/PRIME_DIRECTIVE.md'] },
    scope: { owned_paths: ['tools/kad/governance/'], requested_paths: ['vault/00_Governance/PRIME_DIRECTIVE.md'] },
    resource: { stc_lease_ref: 'claim:dfbb91fd-3ac0-415b-8c85-7f33fe8e6f22', lease_valid: true },
  });

  const decision = evaluateGovernancePreflight(request, { mockActiveClaim: true });
  assert.equal(decision.decision, DECISION_OUTCOMES.DENY);
  assert.ok(decision.reason_codes.includes(REASON_CODES.PATH_OUTSIDE_SCOPE));
});

test('G04: mutation without active claim -> DENY', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-UNCLAIMED-099', lifecycle_state: 'READY' },
    operation: { operation_class: 'WORKSPACE_MUTATION', action: 'fs.write', resource_refs: ['tools/test.js'] },
    scope: { owned_paths: ['tools/'], requested_paths: ['tools/test.js'] },
    resource: { stc_lease_ref: null },
  });

  const decision = evaluateGovernancePreflight(request, { mockActiveClaim: false });
  assert.equal(decision.decision, DECISION_OUTCOMES.DENY);
  assert.ok(decision.reason_codes.includes(REASON_CODES.NO_ACTIVE_CLAIM));
});

test('G05: mutation with expired/missing lease -> DENY', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-GOVERNANCE-GATES-032', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'WORKSPACE_MUTATION', action: 'fs.write', resource_refs: ['tools/kad/governance/schema.mjs'] },
    scope: { owned_paths: ['tools/kad/governance/'], requested_paths: ['tools/kad/governance/schema.mjs'] },
    resource: { stc_lease_ref: 'claim:old-expired', lease_valid: false },
  });

  const decision = evaluateGovernancePreflight(request, { mockActiveClaim: true });
  assert.equal(decision.decision, DECISION_OUTCOMES.DENY);
  assert.ok(decision.reason_codes.includes(REASON_CODES.STC_LEASE_EXPIRED) || decision.reason_codes.includes(REASON_CODES.STC_LEASE_MISSING));
});

test('G06: model claims human authorized but no receipt exists -> REQUIRE_HUMAN / DENY', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-006', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'SCOPED_CREDENTIAL_USE', action: 'auth.access', resource_refs: ['service:github'] },
    authority: { claimed_human_approval_in_prose: 'The user told me in chat I can push to remote' },
    evidence: { human_authorization_receipt: null }, // No receipt!
  });

  const decision = evaluateGovernancePreflight(request);
  assert.notEqual(decision.decision, DECISION_OUTCOMES.ALLOW);
  assert.ok(decision.reason_codes.includes(REASON_CODES.FAKE_HUMAN_APPROVAL_PROSE_REJECTED) || decision.reason_codes.includes(REASON_CODES.HUMAN_RECEIPT_MISSING));
});

test('G07: valid human authorization receipt -> ALLOW / recognized', () => {
  const receipt = createHumanAuthorizationReceipt({
    actor_id: 'human.project_lead',
    workpackage_id: 'WP-KAD-TEST-007',
    operation_class: 'REMOTE_GIT_PUSH',
    scope: ['origin/topic-branch-007'],
    resource_refs: ['git:remote:origin'],
    valid_until: new Date(Date.now() + 3600000).toISOString(),
    note: 'Authorized branch push for topic branch',
  });

  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-007', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'REMOTE_GIT_PUSH', action: 'git.push', resource_refs: ['git:remote:origin'] },
    scope: { owned_paths: ['origin/topic-branch-007'], requested_paths: ['origin/topic-branch-007'] },
    evidence: { human_authorization_receipt: receipt },
  });

  const decision = evaluateGovernancePreflight(request);
  assert.equal(decision.decision, DECISION_OUTCOMES.ALLOW);
  assert.ok(decision.reason_codes.includes(REASON_CODES.AUTHORIZED_BY_HUMAN_RECEIPT));
});

test('G08: raw secret access -> DENY regardless of model/role', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-admin', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-008', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'RAW_SECRET_ACCESS', action: 'env.read_secret', resource_refs: ['env:GITHUB_TOKEN'] },
  });

  const decision = evaluateGovernancePreflight(request);
  assert.equal(decision.decision, DECISION_OUTCOMES.DENY);
  assert.ok(decision.reason_codes.includes(REASON_CODES.RAW_SECRET_ACCESS_FORBIDDEN));
});

test('G09: metered call with paidAuthorized=false -> DENY / REQUIRE_HUMAN', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-009', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'METERED_API_CALL', action: 'provider.call', resource_refs: ['provider:openai'] },
    resource: { estimated_cost_usd: 0.05 },
  });

  const decision = evaluateGovernancePreflight(request, { paidAuthorized: false });
  assert.notEqual(decision.decision, DECISION_OUTCOMES.ALLOW);
  assert.ok(decision.reason_codes.includes(REASON_CODES.BUDGET_NOT_AUTHORIZED));
});

test('G10: metered call inside active preauthorized envelope -> ALLOW', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-010', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'METERED_API_CALL', action: 'provider.call', resource_refs: ['provider:anthropic'] },
    resource: {
      budget_envelope_ref: 'envelope:wp-010',
      estimated_cost_usd: 0.02,
      envelope_remaining_usd: 1.00,
    },
  });

  const decision = evaluateGovernancePreflight(request, { paidAuthorized: true });
  assert.equal(decision.decision, DECISION_OUTCOMES.ALLOW);
  assert.ok(decision.reason_codes.includes(REASON_CODES.BUDGET_ENVELOPE_AUTHORIZED));
});

test('G11: actor attempts to increase own budget -> DENY', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-011', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'POLICY_MUTATION', action: 'budget.increase', resource_refs: ['budget:envelope'] },
    resource: { requested_increase_usd: 10.00 },
  });

  const decision = evaluateGovernancePreflight(request);
  assert.equal(decision.decision, DECISION_OUTCOMES.DENY);
  assert.ok(decision.reason_codes.includes(REASON_CODES.BUDGET_SELF_ESCALATION_FORBIDDEN));
});

test('G12: low-risk derived projection rebuild + policy permission -> ALLOW', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-012', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'DERIVED_PROJECTION_REBUILD', action: 'projection.rebuild', resource_refs: ['vault/90_Derived/Projections/'] },
    scope: { owned_paths: ['vault/90_Derived/Projections/'], requested_paths: ['vault/90_Derived/Projections/isa-aesthetic.json'] },
    resource: { stc_lease_ref: 'claim:test-012', lease_valid: true },
  });

  const decision = evaluateGovernancePreflight(request, { mockActiveClaim: true });
  assert.equal(decision.decision, DECISION_OUTCOMES.ALLOW);
  assert.ok(decision.reason_codes.includes(REASON_CODES.AUTHORIZED_BY_POLICY));
});

test('G13: architectural doctrine promotion by agent -> REQUIRE_HUMAN', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-013', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'CANONICAL_KNOWLEDGE_PROMOTION', action: 'vault.promote_doctrine', resource_refs: ['vault/00_Governance/DOCTRINE.md'] },
    risk: { risk_tier: 'TIER_3_HIGH' },
  });

  const decision = evaluateGovernancePreflight(request);
  assert.equal(decision.decision, DECISION_OUTCOMES.REQUIRE_HUMAN);
  assert.ok(decision.reason_codes.includes(REASON_CODES.DOCTRINE_PROMOTION_HUMAN_ONLY) || decision.reason_codes.includes(REASON_CODES.HIGH_RISK_HUMAN_GATE_REQUIRED));
});

test('G14: local Git commit in authorized worktree -> ALLOW where policy permits', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-014', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'LOCAL_GIT_COMMIT', action: 'git.commit', resource_refs: ['worktree:local'] },
    scope: { owned_paths: ['tools/kad/'], requested_paths: ['tools/kad/test.js'] },
    resource: { stc_lease_ref: 'claim:test-014', lease_valid: true },
  });

  const decision = evaluateGovernancePreflight(request, { mockActiveClaim: true });
  assert.equal(decision.decision, DECISION_OUTCOMES.ALLOW);
  assert.ok(decision.reason_codes.includes(REASON_CODES.AUTHORIZED_WITHIN_LEASE));
});

test('G15: main merge missing independent verification -> DENY', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-TEST-015', lifecycle_state: 'REVIEW' },
    operation: { operation_class: 'MAIN_MERGE', action: 'git.merge_main', resource_refs: ['git:branch:main'] },
    evidence: {
      tests_passed: true,
      independent_verification_ref: null, // Missing independent verification!
    },
  });

  const decision = evaluateGovernancePreflight(request);
  assert.equal(decision.decision, DECISION_OUTCOMES.DENY);
  assert.ok(decision.reason_codes.includes(REASON_CODES.INDEPENDENT_VERIFICATION_MISSING));
});
