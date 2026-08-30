import crypto from 'node:crypto';
import path from 'node:path';

export const WORK_LIFECYCLE_STATES = new Set([
  'PROPOSED',
  'READY',
  'CLAIMED',
  'IN_PROGRESS',
  'BLOCKED',
  'REVIEW',
  'ACCEPTED',
  'REJECTED',
  'SUPERSEDED'
]);

export const WORKLOAD_LIFECYCLE_STATES = WORK_LIFECYCLE_STATES;

export const EXECUTION_RUN_STATES = new Set([
  'QUEUED',
  'RUNNING',
  'SUCCEEDED',
  'FAILED',
  'CANCELLED',
  'LOST'
]);
export const VALID_TRUST_DOMAINS = new Set(['control', 'engineering', 'research', 'audit', 'world']);
export const VALID_NETWORK_CLASSES = new Set(['OFFLINE', 'LOCAL_LOOPBACK', 'RESTRICTED_EGRESS', 'UNRESTRICTED']);
export const VALID_CREDENTIAL_CLASSES = new Set(['NONE', 'LOCAL_PROCESS', 'REDACTED_ENV']);
export const VALID_COMMAND_AUTHORITIES = new Set(['READONLY', 'EXCLUSIVE_MUTATION', 'WORKSPACE_LEASE']);
export const VALID_HUMAN_ESCALATION_POLICIES = new Set(['FAIL_CLOSED', 'WAYFINDER_ASK_ME', 'DEGRADE_LOCAL']);
export const VALID_BUDGET_CLASSES = new Set(['ZERO_MARGINAL_SPEND', 'SUBSCRIPTION_QUOTA', 'PAID_AUTHORIZED_METERED']);
export const VALID_DELIVERY_POLICIES = new Set(['BRANCH_ONLY', 'ARTIFACT_ONLY', 'DIRECT_WORKSPACE']);

export const VALID_CAPABILITY_CLASSES = new Set([
  'DETERMINISTIC',
  'TINY_SPECIALIST',
  'LOCAL_NARROW',
  'LOCAL_GENERAL',
  'FREE_REMOTE',
  'STANDARD_REMOTE',
  'INDEPENDENT_VERIFIER',
  'LITERATURE_SYNTHESIS',
  'FRONTIER_REASONING',
  'LOCAL_WORLD'
]);

/**
 * Validates a KAD_WORKLOAD_V1 contract against schema and authority invariants.
 */
export function validateWorkloadContract(workload) {
  const errors = [];

  if (!workload || typeof workload !== 'object') {
    return { valid: false, errors: ['Workload contract must be an object'] };
  }

  if (workload.schema !== 'kad-workload-v1') {
    errors.push(`Invalid or missing schema: expected 'kad-workload-v1', got '${workload.schema}'`);
  }

  // Model neutrality check: canonical workload definition must NOT contain vendor or model names
  if (workload.model_name || workload.model || workload.vendor) {
    errors.push('Model or vendor identities must not be placed in canonical workload contracts; binding occurs at dispatch in execution receipt.');
  }

  const requiredFields = [
    'workload_id',
    'workpackage_ref',
    'claim_ref',
    'role_contract_ref',
    'objective',
    'acceptance_criteria_ref',
    'source_revision',
    'mutation_scope',
    'trust_domain',
    'network_class',
    'credential_class',
    'command_authority',
    'human_escalation_policy',
    'requested_capability_class',
    'execution_provider',
    'host_resource_class',
    'timeout_seconds',
    'concurrency_limit',
    'budget_class',
    'delivery_policy',
    'required_receipts'
  ];

  for (const field of requiredFields) {
    if (workload[field] === undefined || workload[field] === null) {
      errors.push(`Missing required field '${field}' in workload contract`);
    }
  }

  if (workload.trust_domain && !VALID_TRUST_DOMAINS.has(workload.trust_domain)) {
    errors.push(`Invalid trust_domain: '${workload.trust_domain}'`);
  }

  if (workload.network_class && !VALID_NETWORK_CLASSES.has(workload.network_class)) {
    errors.push(`Invalid network_class: '${workload.network_class}'`);
  }

  if (workload.credential_class && !VALID_CREDENTIAL_CLASSES.has(workload.credential_class)) {
    errors.push(`Invalid credential_class: '${workload.credential_class}'`);
  }

  if (workload.command_authority && !VALID_COMMAND_AUTHORITIES.has(workload.command_authority)) {
    errors.push(`Invalid command_authority: '${workload.command_authority}'`);
  }

  if (workload.human_escalation_policy && !VALID_HUMAN_ESCALATION_POLICIES.has(workload.human_escalation_policy)) {
    errors.push(`Invalid human_escalation_policy: '${workload.human_escalation_policy}'`);
  }

  if (workload.requested_capability_class && !VALID_CAPABILITY_CLASSES.has(workload.requested_capability_class)) {
    errors.push(`Invalid requested_capability_class: '${workload.requested_capability_class}'`);
  }

  if (workload.budget_class && !VALID_BUDGET_CLASSES.has(workload.budget_class)) {
    errors.push(`Invalid budget_class: '${workload.budget_class}'`);
  }

  if (workload.delivery_policy && !VALID_DELIVERY_POLICIES.has(workload.delivery_policy)) {
    errors.push(`Invalid delivery_policy: '${workload.delivery_policy}'`);
  }

  if (workload.mutation_scope && !Array.isArray(workload.mutation_scope)) {
    errors.push('mutation_scope must be an array of paths');
  }

  if (workload.required_receipts && !Array.isArray(workload.required_receipts)) {
    errors.push('required_receipts must be an array of receipt names');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Creates a bounded KAD_WORKLOAD_V1 contract from active workpackage, claim, and role definitions.
 */
export function createWorkloadContract(workpackage, claim, roleContract, options = {}) {
  if (!workpackage || !claim || !roleContract) {
    throw new Error('createWorkloadContract requires workpackage, claim, and roleContract');
  }

  const requestedMutationScope = options.mutation_scope || workpackage.owned_paths || [];
  const claimOwnedPaths = claim.owned_paths || [];

  // Enforce mutation scope isolation
  for (const p of requestedMutationScope) {
    const isContained = claimOwnedPaths.some(owned => p.startsWith(owned) || owned.startsWith(p));
    if (!isContained) {
      throw new Error(`Requested mutation scope '${p}' escapes the active claim owned_paths: [${claimOwnedPaths.join(', ')}]`);
    }
  }

  const capabilityClass = options.requested_capability_class ||
    (roleContract.model_tier_preference ? roleContract.model_tier_preference[0] : 'STANDARD_REMOTE');

  return {
    schema: 'kad-workload-v1',
    workload_id: options.workload_id || `wl-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    workpackage_ref: workpackage.id,
    claim_ref: claim.claim_id || claim.task || 'unnamed-claim',
    role_contract_ref: roleContract.role,
    objective: options.objective || workpackage.title || 'Execute bounded task',
    acceptance_criteria_ref: options.acceptance_criteria_ref || workpackage.acceptance_criteria || [],
    source_revision: options.source_revision || workpackage.fixed_point || 'unknown',
    mutation_scope: requestedMutationScope,
    trust_domain: roleContract.trust_domain || workpackage.trust_domain || 'engineering',
    network_class: options.network_class || 'LOCAL_LOOPBACK',
    credential_class: options.credential_class || 'NONE',
    command_authority: roleContract.mutation_rights === 'EXCLUSIVE_OWNED_PATHS' ? 'EXCLUSIVE_MUTATION' : 'READONLY',
    human_escalation_policy: options.human_escalation_policy || 'WAYFINDER_ASK_ME',
    requested_capability_class: capabilityClass,
    execution_provider: options.execution_provider || 'omp-native-executor',
    host_resource_class: options.host_resource_class || 'host.amdy.workstation',
    timeout_seconds: options.timeout_seconds || 3600,
    concurrency_limit: options.concurrency_limit || 4,
    budget_class: options.budget_class || 'ZERO_MARGINAL_SPEND',
    delivery_policy: options.delivery_policy || 'DIRECT_WORKSPACE',
    required_receipts: options.required_receipts || ['telemetry_metrics', 'test_results', 'diff_patch']
  };
}

/**
 * Validates an execution run receipt returned by a delegated provider.
 * Enforces that execution run results provide evidence receipts but cannot autonomously mutate workpackage state.
 */
export function validateExecutionRunReceipt(receipt, workload) {
  const errors = [];
  const warnings = [];

  if (!receipt || typeof receipt !== 'object') {
    return { valid: false, errors: ['Receipt must be an object'], autonomous_work_mutation_allowed: false };
  }

  if (receipt.schema !== 'kad-execution-run-receipt-v1') {
    errors.push(`Invalid receipt schema: expected 'kad-execution-run-receipt-v1', got '${receipt.schema}'`);
  }

  if (!receipt.workload_id || (workload && receipt.workload_id !== workload.workload_id)) {
    errors.push('Receipt workload_id does not match dispatch workload contract');
  }

  if (!receipt.run_status || !EXECUTION_RUN_STATES.has(receipt.run_status)) {
    errors.push(`Invalid execution run_status: '${receipt.run_status}'`);
  }

  let autonomousMutationAllowed = false;
  if (receipt.claimed_work_transition) {
    warnings.push(
      `Receipt contains claimed_work_transition '${receipt.claimed_work_transition}'. autonomous work state mutation is forbidden; workctl alone authorizes transitions.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    autonomous_work_mutation_allowed: autonomousMutationAllowed
  };
}
