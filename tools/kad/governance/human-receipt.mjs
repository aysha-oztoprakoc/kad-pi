/**
 * KAD Human Authorization Receipt Subsystem
 *
 * Implements tamper-resistant human authorization receipts to prevent models
 * from claiming human approval via unverified prose.
 */

import path from 'node:path';
import {
  HUMAN_RECEIPT_SCHEMA_VERSION,
  HUMAN_RECEIPT_V2_SCHEMA_VERSION,
  GOVERNANCE_POLICY_VERSION,
  OPERATION_CLASSES,
  REASON_CODES,
  computeGovernanceHash,
  canonicalizeForHash,
} from './schema.mjs';
/**
 * Creates a signed/hashed HUMAN_AUTHORIZATION_RECEIPT_V1.
 */
export function createHumanAuthorizationReceipt(input = {}) {
  const issuedAt = input.issued_at || new Date().toISOString();
  // Default validity: 2 hours if not specified
  const ttlMs = typeof input.ttl_ms === 'number' ? input.ttl_ms : 7200000;
  const validUntil = input.valid_until || new Date(Date.parse(issuedAt) + ttlMs).toISOString();

  const receipt = {
    schema_version: HUMAN_RECEIPT_SCHEMA_VERSION,
    receipt_id: input.receipt_id || `har-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actor_id: input.actor_id || 'human.project_lead',
    workpackage_id: input.workpackage_id || 'WP-UNKNOWN',
    operation_class: input.operation_class || 'WORKSPACE_MUTATION',
    scope: Array.isArray(input.scope) ? [...input.scope] : [],
    resource_refs: Array.isArray(input.resource_refs) ? [...input.resource_refs] : [],
    note: input.note || '',
    issued_at: issuedAt,
    valid_until: validUntil,
  };

  const target = { ...receipt };
  receipt.receipt_hash = computeGovernanceHash(target);
  return receipt;
}

/**
 * Verifies the integrity of a human authorization receipt.
 */
export function verifyHumanReceiptIntegrity(receipt) {
  if (!receipt || typeof receipt !== 'object') return false;
  if (!receipt.receipt_hash) return false;

  const target = { ...receipt };
  delete target.receipt_hash;
  const expectedHash = computeGovernanceHash(target);
  return receipt.receipt_hash === expectedHash;
}

/**
 * Validates a human authorization receipt against an operation request and constraints.
 */
export function validateHumanAuthorizationReceipt(receipt, options = {}) {
  const errors = [];
  const reasonCodes = [];

  if (!receipt || typeof receipt !== 'object') {
    return {
      valid: false,
      errors: ['Missing human authorization receipt'],
      reason_codes: [REASON_CODES.HUMAN_RECEIPT_MISSING],
    };
  }

  if (receipt.schema_version !== HUMAN_RECEIPT_SCHEMA_VERSION) {
    errors.push(`Invalid schema_version: expected '${HUMAN_RECEIPT_SCHEMA_VERSION}', got '${receipt.schema_version}'`);
    reasonCodes.push(REASON_CODES.HUMAN_RECEIPT_TAMPERED);
  }

  if (!verifyHumanReceiptIntegrity(receipt)) {
    errors.push('Human receipt failed cryptographic integrity check (hash mismatch)');
    reasonCodes.push(REASON_CODES.HUMAN_RECEIPT_TAMPERED);
  }

  // Expiration check
  const now = options.now ? Date.parse(options.now) : Date.now();
  const validUntilTime = Date.parse(receipt.valid_until || 0);
  if (now > validUntilTime) {
    errors.push(`Human receipt expired at ${receipt.valid_until} (current: ${new Date(now).toISOString()})`);
    reasonCodes.push(REASON_CODES.HUMAN_RECEIPT_EXPIRED);
  }

  // Confused Deputy: Workpackage mismatch
  if (options.expectedWpId && receipt.workpackage_id !== options.expectedWpId) {
    errors.push(`Confused deputy: receipt is bound to '${receipt.workpackage_id}', but request is for '${options.expectedWpId}'`);
    reasonCodes.push(REASON_CODES.CONFUSED_DEPUTY_WP_MISMATCH);
  }

  // Confused Deputy: Operation class mismatch
  if (options.expectedOperationClass && receipt.operation_class !== options.expectedOperationClass) {
    errors.push(`Confused deputy: receipt is for operation '${receipt.operation_class}', but request is for '${options.expectedOperationClass}'`);
    reasonCodes.push(REASON_CODES.CONFUSED_DEPUTY_SCOPE_MISMATCH);
  }

  // Confused Deputy: Resource mismatch
  if (options.expectedResourceRefs && Array.isArray(options.expectedResourceRefs)) {
    for (const reqRes of options.expectedResourceRefs) {
      const isCovered = receipt.resource_refs.some((r) => r === reqRes || reqRes.startsWith(r) || r === '*');
      if (!isCovered) {
        errors.push(`Confused deputy: requested resource '${reqRes}' is not authorized in human receipt`);
        reasonCodes.push(REASON_CODES.CONFUSED_DEPUTY_RESOURCE_MISMATCH);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    reason_codes: reasonCodes,
  };
}

const ISSUER_GRANTS = Object.freeze({
  'actor.project_lead': new Set(OPERATION_CLASSES.filter((op) => op !== 'RAW_SECRET_ACCESS' && op !== 'CONSTITUTIONAL_MUTATION')),
});

function canonicalScopePath(value) {
  if (typeof value !== 'string' || value.includes('\0') || value.startsWith('/')) throw new Error(`invalid authorization scope path: ${value}`);
  const raw = value.replace(/\\/g, '/');
  if (raw.split('/').includes('..')) throw new Error(`authorization scope traversal: ${value}`);
  const normalized = path.posix.normalize(raw);
  if (normalized === '..' || normalized.startsWith('../') || normalized.includes('/../')) throw new Error(`authorization scope escapes root: ${value}`);
  return normalized === '.' ? '' : normalized.replace(/\/+$/, '');
}

export function canonicalizeAuthorizationScope(paths = []) {
  if (!Array.isArray(paths)) throw new Error('authorization scope must be an array');
  return [...new Set(paths.map(canonicalScopePath))].sort();
}

function hashAction(action) {
  if (typeof action !== 'string' || !action) return null;
  return computeGovernanceHash({ action });
}

export function createHumanAuthorizationReceiptV2(input = {}) {
  const operation = {
    operation_class: input.operation?.operation_class,
    action: input.operation?.action,
    action_hash: input.operation?.action_hash || hashAction(input.operation?.action),
  };
  const rollbackAction = input.rollback?.action;
  const receipt = {
    schema_version: HUMAN_RECEIPT_V2_SCHEMA_VERSION,
    receipt_id: input.receipt_id || `har-v2-${Date.now()}`,
    issuer: { subject_type: input.issuer?.subject_type, subject_id: input.issuer?.subject_id },
    authorized_subject: { subject_type: input.authorized_subject?.subject_type, subject_id: input.authorized_subject?.subject_id },
    work_context: {
      workpackage_id: input.work_context?.workpackage_id ?? null,
      experiment_id: input.work_context?.experiment_id ?? null,
    },
    operation,
    resources: [...(input.resources || [])],
    scope: { canonical_paths: canonicalizeAuthorizationScope(input.scope?.canonical_paths || []) },
    validity: {
      not_before: input.validity?.not_before,
      action_valid_until: input.validity?.action_valid_until,
    },
    rollback: {
      authorized: input.rollback?.authorized === true,
      action: rollbackAction,
      action_hash: input.rollback?.action_hash || hashAction(rollbackAction),
      recovery_deadline: input.rollback?.recovery_deadline,
    },
    delegation: { redelegation_allowed: false },
    policy: {
      policy_version: input.policy?.policy_version || GOVERNANCE_POLICY_VERSION,
      policy_hash: input.policy?.policy_hash || computeGovernanceHash({ policy_version: input.policy?.policy_version || GOVERNANCE_POLICY_VERSION }),
    },
    provenance: {
      human_event_ref: input.provenance?.human_event_ref,
      record_hash: input.provenance?.record_hash,
    },
  };
  receipt.receipt_hash = computeGovernanceHash(receipt);
  return receipt;
}

function fail(reason_codes, errors = []) {
  return { valid: false, errors, reason_codes };
}

export function validateHumanAuthorizationReceiptV2(receipt, options = {}) {
  if (!receipt || receipt.schema_version !== HUMAN_RECEIPT_V2_SCHEMA_VERSION) {
    return fail([REASON_CODES.LEGACY_RECEIPT_DELEGATION_AMBIGUOUS], ['Delegated execution requires HUMAN_AUTHORIZATION_RECEIPT_V2']);
  }
  const errors = [];
  const reasons = [];
  const target = { ...receipt };
  delete target.receipt_hash;
  if (!receipt.receipt_hash || receipt.receipt_hash !== computeGovernanceHash(target)) {
    errors.push('Receipt integrity hash mismatch'); reasons.push(REASON_CODES.HUMAN_RECEIPT_TAMPERED);
  }
  const issuer = receipt.issuer?.subject_id;
  const subject = receipt.authorized_subject?.subject_id;
  if (receipt.issuer?.subject_type !== 'ACTOR' || !issuer || !ISSUER_GRANTS[issuer]) reasons.push(REASON_CODES.AUTHORIZATION_ISSUER_INVALID);
  else if (!ISSUER_GRANTS[issuer].has(receipt.operation?.operation_class)) reasons.push(REASON_CODES.ISSUER_AUTHORITY_INSUFFICIENT);
  if (!['ROLE_OR_ACTOR', 'ACTOR'].includes(receipt.authorized_subject?.subject_type) || !subject) reasons.push(REASON_CODES.AUTHORIZED_SUBJECT_MISMATCH);
  if (options.expectedExecutor && subject !== options.expectedExecutor) reasons.push(REASON_CODES.AUTHORIZED_SUBJECT_MISMATCH);
  if (receipt.delegation?.redelegation_allowed !== false || options.actionKind === 'REDELEGATE') reasons.push(REASON_CODES.REDELEGATION_FORBIDDEN);
  if (options.expectedWpId && receipt.work_context?.workpackage_id !== options.expectedWpId) reasons.push(REASON_CODES.WORK_CONTEXT_MISMATCH);
  if (options.expectedExperimentId && receipt.work_context?.experiment_id !== options.expectedExperimentId) reasons.push(REASON_CODES.WORK_CONTEXT_MISMATCH);
  if (options.expectedOperationClass && receipt.operation?.operation_class !== options.expectedOperationClass) reasons.push(REASON_CODES.RESOURCE_BINDING_MISMATCH);
  if (options.expectedAction && receipt.operation?.action !== options.expectedAction && (options.actionKind || 'PRIMARY') === 'PRIMARY') reasons.push(REASON_CODES.RESOURCE_BINDING_MISMATCH);
  if (options.expectedResourceRefs?.some((r) => !receipt.resources?.includes(r))) reasons.push(REASON_CODES.RESOURCE_BINDING_MISMATCH);
  if (receipt.operation?.action_hash !== hashAction(receipt.operation?.action)) reasons.push(REASON_CODES.HUMAN_RECEIPT_TAMPERED);
  if (receipt.rollback?.action_hash !== hashAction(receipt.rollback?.action)) reasons.push(REASON_CODES.HUMAN_RECEIPT_TAMPERED);
  if (receipt.operation?.operation_class === 'RAW_SECRET_ACCESS' || receipt.operation?.operation_class === 'CONSTITUTIONAL_MUTATION') reasons.push(REASON_CODES.RAW_SECRET_ACCESS_FORBIDDEN);
  const now = Date.parse(options.now || new Date().toISOString());
  const notBefore = Date.parse(receipt.validity?.not_before);
  const actionUntil = Date.parse(receipt.validity?.action_valid_until);
  const recoveryUntil = Date.parse(receipt.rollback?.recovery_deadline);
  const actionKind = options.actionKind || 'PRIMARY';
  if (Number.isNaN(now) || Number.isNaN(notBefore) || now < notBefore) reasons.push(REASON_CODES.AUTHORIZATION_EXPIRED);
  if (actionKind === 'PRIMARY') {
    if (Number.isNaN(actionUntil) || now > actionUntil) reasons.push(REASON_CODES.PRIMARY_ACTION_EXPIRED);
  }
  if (actionKind === 'ROLLBACK') {
    if (!receipt.rollback?.authorized) reasons.push(REASON_CODES.ROLLBACK_NOT_AUTHORIZED);
    if (receipt.rollback?.authorized && !receipt.rollback?.action) reasons.push(REASON_CODES.ROLLBACK_NOT_AUTHORIZED);
    if (options.expectedAction && options.expectedAction !== receipt.rollback.action) reasons.push(REASON_CODES.ROLLBACK_SCOPE_MISMATCH);
    if (options.requestedAction && options.requestedAction !== receipt.rollback.action) reasons.push(REASON_CODES.ROLLBACK_SCOPE_MISMATCH);
    if (Number.isNaN(recoveryUntil) || now > recoveryUntil) reasons.push(REASON_CODES.ROLLBACK_WINDOW_EXPIRED);
  }
  if (actionKind === 'SAFE_DEESCALATION' && options.requestedAction !== 'claim.release') reasons.push(REASON_CODES.ROLLBACK_SCOPE_MISMATCH);
  const expectedPolicyHash = computeGovernanceHash({ policy_version: receipt.policy?.policy_version });
  if (receipt.policy?.policy_hash !== expectedPolicyHash) reasons.push(REASON_CODES.POLICY_VERSION_MISMATCH);
  if (options.policy_version && options.policy_version !== receipt.policy?.policy_version) reasons.push(REASON_CODES.POLICY_VERSION_MISMATCH);
  if (options.policy_hash && options.policy_hash !== receipt.policy?.policy_hash) reasons.push(REASON_CODES.POLICY_VERSION_MISMATCH);
  if (options.requestedPaths) {
    try {
      const owned = receipt.scope?.canonical_paths || [];
      const requested = canonicalizeAuthorizationScope(options.requestedPaths);
      if (requested.some((req) => !owned.some((base) => base === '' || req === base || req.startsWith(`${base}/`)))) reasons.push(REASON_CODES.ROLLBACK_SCOPE_MISMATCH);
    } catch (err) { errors.push(err.message); reasons.push(REASON_CODES.ROLLBACK_SCOPE_MISMATCH); }
  }
  if (reasons.length && !errors.length) errors.push(...[...new Set(reasons)].map((reason) => `Authorization validation failed: ${reason}`));
  return { valid: errors.length === 0 && reasons.length === 0, errors, reason_codes: [...new Set(reasons)] };
}
