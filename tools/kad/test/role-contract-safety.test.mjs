import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadRoleContract,
  listRoleContracts,
  canRoleSpawnChild,
  canRoleMutate,
  verifyVerifierIndependence
} from '../role-contract.mjs';

test('Role Contract Schema: All 15 role contracts load and pass schema validation', () => {
  const contracts = listRoleContracts();
  assert.equal(contracts.length, 15, 'All 15 role contracts are registered');

  const expectedRoles = [
    'kad-master',
    'kad-builder',
    'kad-debugger',
    'kad-tester',
    'kad-reviewer',
    'kad-researcher',
    'kad-librarian',
    'kad-scout',
    'kad-local-extractor',
    'kad-world',
    'advisor-architecture',
    'advisor-security',
    'advisor-economics',
    'advisor-verification',
    'advisor-epistemic'
  ];

  const loadedRoles = contracts.map((c) => c.role).sort();
  assert.deepEqual(loadedRoles, expectedRoles.sort());
});

test('Role Safety: Non-builder roles have mutation_rights: NONE and cannot mutate files', () => {
  const readOnlyRoles = [
    'kad-master',
    'kad-debugger',
    'kad-reviewer',
    'kad-researcher',
    'kad-librarian',
    'kad-scout',
    'kad-local-extractor',
    'kad-world',
    'advisor-architecture',
    'advisor-security',
    'advisor-economics',
    'advisor-verification',
    'advisor-epistemic'
  ];

  for (const roleId of readOnlyRoles) {
    const contract = loadRoleContract(roleId);
    assert.equal(contract.mutation_rights, 'NONE', `Role ${roleId} must have mutation_rights: NONE`);
    const check = canRoleMutate(contract, 'src/index.ts', null, null);
    assert.equal(check.allowed, false, `Role ${roleId} must fail mutation check`);
    assert.ok(check.reason.includes('mutation_rights: NONE'));
  }
});

test('Role Safety: kad-builder requires active workctl claim and fusion_writer_lease', () => {
  const builder = loadRoleContract('kad-builder');
  assert.equal(builder.mutation_rights, 'EXCLUSIVE_OWNED_PATHS');
  assert.equal(builder.requires_claim, true);
  assert.equal(builder.requires_lease, 'fusion_writer_lease');

  // Case 1: No claim -> Rejection
  const noClaim = canRoleMutate(builder, 'src/index.ts', null, 'fusion_writer_lease');
  assert.equal(noClaim.allowed, false);
  assert.ok(noClaim.reason.includes('requires an active workctl mutating claim'));

  // Case 2: Claim exists but wrong lease -> Rejection
  const activeClaim = {
    active: true,
    owned_paths: ['src/']
  };
  const wrongLease = canRoleMutate(builder, 'src/index.ts', activeClaim, 'wrong_lease');
  assert.equal(wrongLease.allowed, false);
  assert.ok(wrongLease.reason.includes('requires lease'));

  // Case 3: Claim exists, valid lease, but path outside owned_paths -> Rejection
  const outsidePath = canRoleMutate(builder, 'docs/secret.md', activeClaim, 'fusion_writer_lease');
  assert.equal(outsidePath.allowed, false);
  assert.ok(outsidePath.reason.includes('outside the active claim\'s owned_paths'));

  // Case 4: Valid claim, lease, and path within owned_paths -> Allowed
  const validMutation = canRoleMutate(builder, 'src/index.ts', activeClaim, 'fusion_writer_lease');
  assert.equal(validMutation.allowed, true);
});

test('Role Safety: Spawn depth enforcement caps recursion at max depth 2', () => {
  const master = loadRoleContract('kad-master');
  const builder = loadRoleContract('kad-builder');
  const tester = loadRoleContract('kad-tester');
  const scout = loadRoleContract('kad-scout');

  // Depth 0 -> Depth 1: master -> builder (ALLOWED)
  const step1 = canRoleSpawnChild(master, builder, 0);
  assert.equal(step1.allowed, true);

  // Depth 1 -> Depth 2: builder -> tester (ALLOWED)
  const step2 = canRoleSpawnChild(builder, tester, 1);
  assert.equal(step2.allowed, true);

  // Depth 2 -> Depth 3: tester -> scout (REJECTED: Exceeds max depth 2)
  const step3 = canRoleSpawnChild(tester, scout, 2);
  assert.equal(step3.allowed, false);
  assert.ok(step3.reason.includes('depth limit exceeded'));
});

test('Role Safety: Role allowlist blocks unauthorized child role spawns', () => {
  const debuggerContract = loadRoleContract('kad-debugger');
  const builder = loadRoleContract('kad-builder');

  // kad-debugger can only spawn kad-scout, cannot spawn kad-builder
  const check = canRoleSpawnChild(debuggerContract, builder, 0);
  assert.equal(check.allowed, false);
  assert.ok(check.reason.includes('not permitted to spawn child role'));
});

test('Role Safety: Role cannot spawn an identical self-replica', () => {
  const builder = loadRoleContract('kad-builder');
  const check = canRoleSpawnChild(builder, builder, 1);
  assert.equal(check.allowed, false);
  assert.ok(check.reason.includes('cannot spawn an identical self-replica'));
});

test('Role Safety: Verifier independence check detects same-provider coupling', () => {
  const builderBinding = { role: 'kad-builder', provider: 'openai-codex', model: 'gpt-5.4-mini' };
  const verifierCoupled = { role: 'kad-reviewer', provider: 'openai-codex', model: 'gpt-5.6-luna' };
  const verifierIndependent = { role: 'kad-reviewer', provider: 'google-antigravity', model: 'gemini-3-flash' };

  // Coupled -> Rejected
  const coupledCheck = verifyVerifierIndependence(builderBinding, verifierCoupled);
  assert.equal(coupledCheck.independent, false);
  assert.ok(coupledCheck.reason.includes('Verifier independence violation'));

  // Independent -> Passed
  const independentCheck = verifyVerifierIndependence(builderBinding, verifierIndependent);
  assert.equal(independentCheck.independent, true);
});

test('Role Safety: Role contracts contain valid execution and offload semantics', () => {
  const contracts = listRoleContracts();
  const interactiveRoles = new Set([
    'kad-master',
    'advisor-architecture',
    'advisor-security',
    'advisor-economics',
    'advisor-verification',
    'advisor-epistemic'
  ]);

  for (const c of contracts) {
    assert.equal(typeof c.offload_allowed, 'boolean', `Role ${c.role} must define offload_allowed`);
    assert.equal(typeof c.detached_execution_safe, 'boolean', `Role ${c.role} must define detached_execution_safe`);
    assert.ok(Array.isArray(c.preferred_workload_providers), `Role ${c.role} must define preferred_workload_providers array`);
    assert.equal(typeof c.minimum_required_context, 'string', `Role ${c.role} must define minimum_required_context`);
    assert.equal(typeof c.expected_human_attention_savings, 'string', `Role ${c.role} must define expected_human_attention_savings`);
    assert.ok(Array.isArray(c.acceptance_evidence_requirements), `Role ${c.role} must define acceptance_evidence_requirements`);

    if (interactiveRoles.has(c.role)) {
      assert.equal(c.offload_allowed, false, `Interactive control role ${c.role} must not permit offload`);
      assert.equal(c.detached_execution_safe, false, `Interactive control role ${c.role} is not detached execution safe`);
    }
  }
});
