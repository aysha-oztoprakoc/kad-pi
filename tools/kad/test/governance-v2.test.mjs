import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HUMAN_RECEIPT_V2_SCHEMA_VERSION,
  REASON_CODES,
  createGovernancePreflightRequest,
  validateGovernancePreflightRequest,
  DECISION_OUTCOMES,
} from '../governance/schema.mjs';
import {
  createHumanAuthorizationReceiptV2,
  validateHumanAuthorizationReceiptV2,
  verifyHumanReceiptIntegrity,
} from '../governance/human-receipt.mjs';
import { evaluateGovernancePreflight } from '../governance/preflight-evaluator.mjs';
const base = () => createHumanAuthorizationReceiptV2({
  receipt_id: 'har-v2-test-001',
  issuer: { subject_type: 'ACTOR', subject_id: 'actor.project_lead' },
  authorized_subject: { subject_type: 'ROLE_OR_ACTOR', subject_id: 'role.kad-builder' },
  work_context: { workpackage_id: 'WP-KAD-GOVERNANCE-AUTHORIZATION-SEMANTICS-032R', experiment_id: 'EXP-KAD-OFFLINE-SURVIVAL-001-R3' },
  operation: { operation_class: 'INFRASTRUCTURE_MUTATION', action: 'route.delete.default' },
  resources: ['host.amdy.workstation', 'network-interface:enp7s0', 'route:ipv4-default-via-192.168.0.1'],
  scope: { canonical_paths: ['evidence/EXP-KAD-OFFLINE-SURVIVAL-001/'] },

  validity: { not_before: '2026-08-30T23:00:00.000Z', action_valid_until: '2026-08-31T00:00:00.000Z' },
  rollback: { authorized: true, action: 'route.replace.default', recovery_deadline: '2026-08-31T00:05:00.000Z' },
  provenance: { human_event_ref: 'ask-me-r2-authorization', record_hash: 'sha256:human-event' },
});

const validate = (receipt, extra = {}) => validateHumanAuthorizationReceiptV2(receipt, {
  expectedWpId: 'WP-KAD-GOVERNANCE-AUTHORIZATION-SEMANTICS-032R',
  expectedExperimentId: 'EXP-KAD-OFFLINE-SURVIVAL-001-R3',
  expectedOperationClass: 'INFRASTRUCTURE_MUTATION',
  expectedResourceRefs: ['host.amdy.workstation'],
  expectedExecutor: 'role.kad-builder',
  now: '2026-08-30T23:10:00.000Z',
  ...extra,
});

test('V2 A01/A02: issuer and exact authorized subject validate', () => {
  const receipt = base();
  assert.equal(receipt.schema_version, HUMAN_RECEIPT_V2_SCHEMA_VERSION);
  assert.equal(validate(receipt).valid, true);
});

test('V2 A03/A26: executor substitution and R1 ambiguous actor are denied', () => {
  const receipt = base();
  assert.ok(validate(receipt, { expectedExecutor: 'actor.experiment-lead' }).reason_codes.includes(REASON_CODES.AUTHORIZED_SUBJECT_MISMATCH));
  const ambiguous = { ...receipt, actor_id: 'actor.project_lead' };
  assert.equal(verifyHumanReceiptIntegrity(ambiguous), false);
  assert.equal(ambiguous.authorized_subject.subject_id, 'role.kad-builder');
});

test('V2 A08/A09/A10/A11/A12: protected bindings are integrity-covered', () => {
  for (const mutate of [
    (r) => { r.issuer.subject_id = 'actor.other'; },
    (r) => { r.authorized_subject.subject_id = 'role.other'; },
    (r) => { r.work_context.experiment_id = 'other'; },
    (r) => { r.operation.action = 'route.other'; },
    (r) => { r.resources[0] = 'host.other'; },
  ]) {
    const receipt = base(); mutate(receipt);
    assert.equal(verifyHumanReceiptIntegrity(receipt), false);
  }
});

test('V2 A13-A15: canonical paths equate slash and reject prefix/traversal', () => {
  assert.equal(validate(base(), { requestedPaths: ['evidence/EXP-KAD-OFFLINE-SURVIVAL-001'] }).valid, true);
  assert.equal(validate(base(), { requestedPaths: ['evidence/EXP-KAD-OFFLINE-SURVIVAL-001-extra'] }).reason_codes.includes(REASON_CODES.ROLLBACK_SCOPE_MISMATCH), true);
  assert.equal(validate(base(), { requestedPaths: ['evidence/EXP-KAD-OFFLINE-SURVIVAL-001/../secret'] }).valid, false);
});

test('V2 A16-A21: primary expiry denies while exact rollback and safe release remain allowed', () => {
  const receipt = base();
  assert.ok(validate(receipt, { now: '2026-08-31T00:01:00.000Z' }).reason_codes.includes(REASON_CODES.PRIMARY_ACTION_EXPIRED));
  assert.equal(validate(receipt, { now: '2026-08-31T00:01:00.000Z', actionKind: 'ROLLBACK', requestedAction: 'route.replace.default' }).valid, true);
  assert.ok(validate(receipt, { now: '2026-08-31T00:06:00.000Z', actionKind: 'ROLLBACK', requestedAction: 'route.replace.default' }).reason_codes.includes(REASON_CODES.ROLLBACK_WINDOW_EXPIRED));
  assert.equal(validate(receipt, { now: '2026-08-31T00:01:00.000Z', actionKind: 'SAFE_DEESCALATION', requestedAction: 'claim.release' }).valid, true);
  assert.equal(validate(receipt, { now: '2026-08-31T00:01:00.000Z', actionKind: 'SAFE_DEESCALATION', requestedAction: 'route.other' }).valid, false);
});

test('V2 A05/A06/A07/A23/A24/A25: no redelegation, legacy ambiguity, forbidden ops, stale policy', () => {
  const receipt = base();
  assert.ok(validate(receipt, { actionKind: 'REDELEGATE' }).reason_codes.includes(REASON_CODES.REDELEGATION_FORBIDDEN));
  assert.ok(validate({ schema_version: 'HUMAN_AUTHORIZATION_RECEIPT_V1' }, { requireDelegation: true }).reason_codes.includes(REASON_CODES.LEGACY_RECEIPT_DELEGATION_AMBIGUOUS));
  const raw = createHumanAuthorizationReceiptV2({ ...base(), operation: { operation_class: 'RAW_SECRET_ACCESS', action: 'secret.read' } });
  assert.ok(validateHumanAuthorizationReceiptV2(raw, { expectedOperationClass: 'RAW_SECRET_ACCESS' }).reason_codes.includes(REASON_CODES.RAW_SECRET_ACCESS_FORBIDDEN));
  assert.ok(validate(receipt, { policy_version: 'OTHER_POLICY' }).reason_codes.includes(REASON_CODES.POLICY_VERSION_MISMATCH));
});

test('V2 preflight integration binds executor, action, resource, work, and scope', () => {
  const receipt = createHumanAuthorizationReceiptV2({
    ...base(),
    work_context: { workpackage_id: 'WP-KAD-GOVERNANCE-AUTHORIZATION-SEMANTICS-032R', experiment_id: null },
  });
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'role.kad-builder', actor_class: 'AGENT_ROLE' },
    work: { workpackage_id: 'WP-KAD-GOVERNANCE-AUTHORIZATION-SEMANTICS-032R', lifecycle_state: 'IN_PROGRESS' },
    operation: { operation_class: 'INFRASTRUCTURE_MUTATION', action: 'route.delete.default', resource_refs: ['host.amdy.workstation'] },
    scope: { owned_paths: ['evidence/EXP-KAD-OFFLINE-SURVIVAL-001/'], requested_paths: ['evidence/EXP-KAD-OFFLINE-SURVIVAL-001'] },
    evidence: { human_authorization_receipt: receipt },
    provenance: { requested_at: '2026-08-30T23:10:00.000Z' },
  });
  const decision = evaluateGovernancePreflight(request);
  assert.equal(decision.decision, DECISION_OUTCOMES.ALLOW);
});

test('V2 request integrity rejects payload mutation with stale hash', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'actor.project_lead' },
    operation: { operation_class: 'INFRASTRUCTURE_MUTATION', action: 'route.replace.default' },
  });
  request.operation.action = 'route.delete.default';
  const validation = validateGovernancePreflightRequest(request);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('Request integrity hash mismatch'));
});

test('V2 scope containment accepts directory ownership without trailing slash', () => {
  const request = createGovernancePreflightRequest({
    actor: { actor_id: 'actor.builder' },
    operation: { operation_class: 'WORKSPACE_MUTATION', action: 'edit' },
    scope: { owned_paths: ['tools'], requested_paths: ['tools/index.js'] },
    resource: { stc_lease_ref: 'lease-1', lease_valid: true },
  });
  const decision = evaluateGovernancePreflight(request);
  assert.notEqual(decision.reason_codes.includes(REASON_CODES.PATH_OUTSIDE_SCOPE), true);
});
