import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateWorkloadContract,
  createWorkloadContract,
  validateExecutionRunReceipt,
  WORKLOAD_LIFECYCLE_STATES,
  EXECUTION_RUN_STATES,
  WORK_LIFECYCLE_STATES
} from '../workload-contract.mjs';

test('Workload Contract: Schema validates a conformant KAD_WORKLOAD_V1 object', () => {
  const validWorkload = {
    schema: 'kad-workload-v1',
    workload_id: 'wl-2026-08-30-001',
    workpackage_ref: 'WP-KAD-ISA-FINAL-SNAPSHOT-028',
    claim_ref: 'claim-028',
    role_contract_ref: 'kad-builder',
    objective: 'Implement ISA-KAD-SKILL-ROLE-002 and freeze baseline snapshot',
    acceptance_criteria_ref: [
      'AC-01-LIFECYCLE-SEPARATION',
      'AC-02-PROVIDER-TAXONOMY',
      'AC-03-WORKLOAD-CONTRACT'
    ],
    source_revision: '0ea896b54d799ca98fa3b45fe45f519655135807',
    mutation_scope: [
      'docs/architecture/',
      'tools/kad/',
      'config/',
      'evidence/WP-KAD-ISA-FINAL-SNAPSHOT-028/'
    ],
    trust_domain: 'engineering',
    network_class: 'LOCAL_LOOPBACK',
    credential_class: 'NONE',
    command_authority: 'EXCLUSIVE_MUTATION',
    human_escalation_policy: 'WAYFINDER_ASK_ME',
    requested_capability_class: 'STANDARD_REMOTE',
    execution_provider: 'omp-native-executor',
    host_resource_class: 'host.amdy.workstation',
    timeout_seconds: 3600,
    concurrency_limit: 4,
    budget_class: 'ZERO_MARGINAL_SPEND',
    delivery_policy: 'DIRECT_WORKSPACE',
    required_receipts: [
      'telemetry_metrics',
      'test_results',
      'evidence_artifacts',
      'diff_patch'
    ]
  };

  const res = validateWorkloadContract(validWorkload);
  assert.equal(res.valid, true, `Workload should be valid: ${res.errors.join(', ')}`);
});

test('Workload Contract: Rejects invalid or missing required fields', () => {
  const invalidWorkload = {
    schema: 'kad-workload-v1',
    workload_id: 'wl-invalid'
  };

  const res = validateWorkloadContract(invalidWorkload);
  assert.equal(res.valid, false);
  assert.ok(res.errors.length > 0);
  assert.ok(res.errors.some(e => e.includes('workpackage_ref')));
  assert.ok(res.errors.some(e => e.includes('role_contract_ref')));
});

test('Lifecycle Invariant: WORK_LIFECYCLE != EXECUTION_RUN_LIFECYCLE', () => {
  // 1. Work lifecycle states (owned exclusively by workctl)
  assert.ok(WORK_LIFECYCLE_STATES.has('READY'));
  assert.ok(WORK_LIFECYCLE_STATES.has('CLAIMED'));
  assert.ok(WORK_LIFECYCLE_STATES.has('IN_PROGRESS'));
  assert.ok(WORK_LIFECYCLE_STATES.has('REVIEW'));
  assert.ok(WORK_LIFECYCLE_STATES.has('ACCEPTED'));
  assert.ok(WORK_LIFECYCLE_STATES.has('BLOCKED'));
  assert.ok(WORK_LIFECYCLE_STATES.has('REJECTED'));
  assert.ok(WORK_LIFECYCLE_STATES.has('SUPERSEDED'));

  // 2. Execution run states (owned by execution provider)
  assert.ok(EXECUTION_RUN_STATES.has('QUEUED'));
  assert.ok(EXECUTION_RUN_STATES.has('RUNNING'));
  assert.ok(EXECUTION_RUN_STATES.has('SUCCEEDED'));
  assert.ok(EXECUTION_RUN_STATES.has('FAILED'));
  assert.ok(EXECUTION_RUN_STATES.has('CANCELLED'));
  assert.ok(EXECUTION_RUN_STATES.has('LOST'));

  // Sets must be distinct and non-conflated
  for (const s of EXECUTION_RUN_STATES) {
    assert.equal(WORK_LIFECYCLE_STATES.has(s), false, `Execution state ${s} must not be a work lifecycle state`);
  }
});

test('Lifecycle Invariant: Execution run receipt cannot autonomously mutate workpackage state', () => {
  const workload = {
    schema: 'kad-workload-v1',
    workload_id: 'wl-2026-08-30-002',
    workpackage_ref: 'WP-KAD-ISA-FINAL-SNAPSHOT-028',
    claim_ref: 'claim-028',
    role_contract_ref: 'kad-builder',
    objective: 'Run build and tests',
    acceptance_criteria_ref: ['AC-01'],
    source_revision: '0ea896b',
    mutation_scope: ['tools/kad/'],
    trust_domain: 'engineering',
    network_class: 'LOCAL_LOOPBACK',
    credential_class: 'NONE',
    command_authority: 'EXCLUSIVE_MUTATION',
    human_escalation_policy: 'WAYFINDER_ASK_ME',
    requested_capability_class: 'STANDARD_REMOTE',
    execution_provider: 'omp-native-executor',
    host_resource_class: 'host.amdy.workstation',
    timeout_seconds: 600,
    concurrency_limit: 1,
    budget_class: 'ZERO_MARGINAL_SPEND',
    delivery_policy: 'DIRECT_WORKSPACE',
    required_receipts: ['test_results', 'diff_patch']
  };

  const receipt = {
    schema: 'kad-execution-run-receipt-v1',
    receipt_id: 'rcpt-001',
    workload_id: 'wl-2026-08-30-002',
    execution_provider: 'omp-native-executor',
    run_status: 'SUCCEEDED',
    dispatched_model_binding: {
      provider: 'antigravity',
      model: 'gemini-3.7-flash',
      tier: 'FREE_REMOTE'
    },
    started_at: '2026-08-30T12:00:00.000Z',
    completed_at: '2026-08-30T12:05:00.000Z',
    exit_code: 0,
    receipts: {
      test_results: { passed: 10, failed: 0 },
      diff_patch: 'diff --git a/... b/...'
    },
    claimed_work_transition: 'ACCEPTED' // Illegal autonomous mutation attempt!
  };

  const validation = validateExecutionRunReceipt(receipt, workload);
  assert.equal(validation.valid, true, 'Receipt structure is valid');
  assert.equal(validation.autonomous_work_mutation_allowed, false, 'Autonomous work mutation is strictly blocked');
  assert.ok(validation.warnings.some(w => w.includes('autonomous work state mutation is forbidden')));
});

test('Workload Invariant: Model identity MUST NOT become authoritative workload state', () => {
  const workloadWithModel = {
    schema: 'kad-workload-v1',
    workload_id: 'wl-invalid-model',
    workpackage_ref: 'WP-028',
    claim_ref: 'claim-028',
    role_contract_ref: 'kad-builder',
    objective: 'Test',
    acceptance_criteria_ref: ['AC-01'],
    source_revision: '0ea896b',
    mutation_scope: [],
    trust_domain: 'engineering',
    network_class: 'LOCAL_LOOPBACK',
    credential_class: 'NONE',
    command_authority: 'READONLY',
    human_escalation_policy: 'WAYFINDER_ASK_ME',
    requested_capability_class: 'STANDARD_REMOTE',
    execution_provider: 'omp-native-executor',
    host_resource_class: 'host.amdy.workstation',
    timeout_seconds: 600,
    concurrency_limit: 1,
    budget_class: 'ZERO_MARGINAL_SPEND',
    delivery_policy: 'DIRECT_WORKSPACE',
    required_receipts: ['test_results'],
    model_name: 'gpt-5.6-luna' // FORBIDDEN!
  };

  const res = validateWorkloadContract(workloadWithModel);
  assert.equal(res.valid, false);
  assert.ok(res.errors.some(e => e.includes('Model or vendor identities must not be placed in canonical workload contracts')));
});

test('Workload Invariant: Mutation scope must remain within active claim owned paths', () => {
  const activeClaim = {
    task: 'WP-KAD-ISA-FINAL-SNAPSHOT-028',
    owned_paths: ['tools/kad/', 'docs/architecture/']
  };

  const workpackage = {
    id: 'WP-KAD-ISA-FINAL-SNAPSHOT-028',
    title: 'Final Snapshot',
    fixed_point: '0ea896b',
    owned_paths: ['tools/kad/', 'docs/architecture/'],
    acceptance_criteria: ['AC-01'],
    trust_domain: 'engineering'
  };

  const roleContract = {
    role: 'kad-builder',
    trust_domain: 'engineering',
    mutation_rights: 'EXCLUSIVE_OWNED_PATHS',
    model_tier_preference: ['STANDARD_REMOTE']
  };

  // Case A: Valid subset
  const workloadA = createWorkloadContract(workpackage, activeClaim, roleContract, {
    objective: 'Implement contracts',
    mutation_scope: ['tools/kad/']
  });
  const resA = validateWorkloadContract(workloadA);
  assert.equal(resA.valid, true);

  // Case B: Escalating mutation path outside claim
  assert.throws(() => {
    createWorkloadContract(workpackage, activeClaim, roleContract, {
      objective: 'Tamper with private paths',
      mutation_scope: ['vault/00_Governance/', 'tools/kad/']
    });
  }, /escapes the active claim owned_paths/);
});
