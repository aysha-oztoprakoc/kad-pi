import fs from 'node:fs';
import path from 'node:path';

export const MAX_RECURSIVE_SPAWN_DEPTH = 2;

export const VALID_TRUST_DOMAINS = new Set(['control', 'engineering', 'research', 'audit', 'world']);
export const VALID_MUTATION_RIGHTS = new Set(['NONE', 'EXCLUSIVE_OWNED_PATHS', 'WORKSPACE_LEASE']);
export const VALID_MODEL_TIERS = new Set([
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
 * Validate a ROLE_CONTRACT_V1 object against schema invariants.
 * @param {object} contract
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateRoleContract(contract) {
  const errors = [];
  if (!contract || typeof contract !== 'object') {
    return { valid: false, errors: ['Role contract must be an object'] };
  }

  if (contract.schema !== 'kad-role-contract-v1') {
    errors.push(`Invalid schema: expected 'kad-role-contract-v1', got '${contract.schema}'`);
  }

  if (!contract.role || typeof contract.role !== 'string' || !/^[a-z0-9-]+$/.test(contract.role)) {
    errors.push(`Invalid role identifier: '${contract.role}'`);
  }

  if (!VALID_TRUST_DOMAINS.has(contract.trust_domain)) {
    errors.push(`Invalid trust_domain: '${contract.trust_domain}'`);
  }

  if (!VALID_MUTATION_RIGHTS.has(contract.mutation_rights)) {
    errors.push(`Invalid mutation_rights: '${contract.mutation_rights}'`);
  }

  if (typeof contract.requires_claim !== 'boolean') {
    errors.push('requires_claim must be a boolean');
  }

  if (typeof contract.max_spawn_depth !== 'number' || contract.max_spawn_depth < 0 || contract.max_spawn_depth > 4) {
    errors.push(`Invalid max_spawn_depth: '${contract.max_spawn_depth}' (must be 0-4)`);
  }

  if (!Array.isArray(contract.allowed_child_roles)) {
    errors.push('allowed_child_roles must be an array');
  }

  if (!Array.isArray(contract.model_tier_preference) || contract.model_tier_preference.length === 0) {
    errors.push('model_tier_preference must be a non-empty array');
  } else {
    for (const tier of contract.model_tier_preference) {
      if (!VALID_MODEL_TIERS.has(tier)) {
        errors.push(`Invalid model_tier: '${tier}'`);
      }
    }
  }

  if (!Array.isArray(contract.tools_allowlist)) {
    errors.push('tools_allowlist must be an array');
  }

  if (typeof contract.verifier_independent !== 'boolean') {
    errors.push('verifier_independent must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Load a role contract from config/roles/
 * @param {string} roleId
 * @param {{ root?: string }} options
 * @returns {object}
 */
export function loadRoleContract(roleId, options = {}) {
  const root = options.root ?? process.cwd();
  const filePath = path.join(root, 'config', 'roles', `${roleId}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Role contract not found for role '${roleId}' at ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(content);
  const validation = validateRoleContract(parsed);
  if (!validation.valid) {
    throw new Error(`Invalid role contract for '${roleId}': ${validation.errors.join('; ')}`);
  }
  return parsed;
}

/**
 * List all available role contracts in config/roles/
 * @param {{ root?: string }} options
 * @returns {object[]}
 */
export function listRoleContracts(options = {}) {
  const root = options.root ?? process.cwd();
  const dirPath = path.join(root, 'config', 'roles');
  if (!fs.existsSync(dirPath)) return [];
  const entries = fs.readdirSync(dirPath);
  const contracts = [];
  for (const entry of entries) {
    if (entry.endsWith('.json') && entry !== 'schema.json') {
      const roleId = path.basename(entry, '.json');
      try {
        contracts.push(loadRoleContract(roleId, options));
      } catch {
        // Skip invalid non-contract files
      }
    }
  }
  return contracts;
}

/**
 * Check if parent role is permitted to spawn a child role at the given recursive depth.
 * @param {object} parentContract
 * @param {object} childContract
 * @param {number} currentDepth - Depth of parent (0 = Root session)
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canRoleSpawnChild(parentContract, childContract, currentDepth = 0) {
  // 1. Prevent self-replication
  if (parentContract.role === childContract.role) {
    return {
      allowed: false,
      reason: `Role '${parentContract.role}' cannot spawn an identical self-replica`
    };
  }

  // 2. Max depth check
  const nextDepth = currentDepth + 1;
  if (nextDepth > MAX_RECURSIVE_SPAWN_DEPTH) {
    return {
      allowed: false,
      reason: `Spawn depth limit exceeded: next depth ${nextDepth} exceeds maximum ${MAX_RECURSIVE_SPAWN_DEPTH}`
    };
  }

  if (nextDepth > (parentContract.max_spawn_depth ?? MAX_RECURSIVE_SPAWN_DEPTH)) {
    return {
      allowed: false,
      reason: `Parent role '${parentContract.role}' limits max spawn depth to ${parentContract.max_spawn_depth}`
    };
  }

  // 3. Child role allowlist check
  if (!parentContract.allowed_child_roles || !parentContract.allowed_child_roles.includes(childContract.role)) {
    return {
      allowed: false,
      reason: `Parent role '${parentContract.role}' is not permitted to spawn child role '${childContract.role}'`
    };
  }
  return { allowed: true };
}

/**
 * Check if a role has mutating authority over a specific target path.
 * @param {object} roleContract
 * @param {string} targetPath
 * @param {object|null} activeClaim
 * @param {string|null} activeLease
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canRoleMutate(roleContract, targetPath, activeClaim = null, activeLease = null) {
  if (!roleContract) {
    return { allowed: false, reason: 'Role contract is required' };
  }

  if (roleContract.mutation_rights === 'NONE') {
    return {
      allowed: false,
      reason: `Role '${roleContract.role}' has mutation_rights: NONE and cannot mutate filesystem`
    };
  }

  if (roleContract.requires_claim && (!activeClaim || !activeClaim.active)) {
    return {
      allowed: false,
      reason: `Role '${roleContract.role}' requires an active workctl mutating claim to write files`
    };
  }

  if (roleContract.requires_lease && roleContract.requires_lease !== activeLease) {
    return {
      allowed: false,
      reason: `Role '${roleContract.role}' requires lease '${roleContract.requires_lease}', got '${activeLease}'`
    };
  }

  if (roleContract.mutation_rights === 'EXCLUSIVE_OWNED_PATHS') {
    if (!activeClaim || !Array.isArray(activeClaim.owned_paths)) {
      return {
        allowed: false,
        reason: 'Active claim contains no owned_paths definition'
      };
    }
    const normalizedTarget = path.normalize(targetPath).replace(/^\.\//, '');
    const isOwned = activeClaim.owned_paths.some((owned) => {
      const normalizedOwned = path.normalize(owned).replace(/^\.\//, '');
      return normalizedTarget.startsWith(normalizedOwned) || normalizedOwned.startsWith(normalizedTarget);
    });
    if (!isOwned) {
      return {
        allowed: false,
        reason: `Target path '${targetPath}' is outside the active claim's owned_paths`
      };
    }
  }

  return { allowed: true };
}

/**
 * Verify verifier independence between a builder and a reviewer/advisor.
 * @param {object} builderBinding - e.g. { role: 'kad-builder', provider: 'openai-codex', model: 'gpt-5.4-mini' }
 * @param {object} verifierBinding - e.g. { role: 'kad-reviewer', provider: 'google-antigravity', model: 'gemini-3-flash' }
 * @returns {{ independent: boolean, reason?: string }}
 */
export function verifyVerifierIndependence(builderBinding, verifierBinding) {
  if (!builderBinding || !verifierBinding) {
    return { independent: false, reason: 'Both builder and verifier bindings are required' };
  }

  if (builderBinding.provider && verifierBinding.provider && builderBinding.provider === verifierBinding.provider) {
    return {
      independent: false,
      reason: `Verifier independence violation: Builder and Verifier share same provider family '${builderBinding.provider}'`
    };
  }

  return { independent: true };
}
