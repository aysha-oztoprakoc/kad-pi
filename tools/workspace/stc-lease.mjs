import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function leaseDir(root) {
  const dir = path.join(root, '.agents', 'work', 'leases');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function normalizePath(p) {
  return path.normalize(p).replace(/^\.\//, '').replace(/\/+$/, '');
}

function pathOverlaps(p1, p2) {
  const n1 = normalizePath(p1);
  const n2 = normalizePath(p2);
  return n1 === n2 || n1.startsWith(n2 + '/') || n2.startsWith(n1 + '/');
}

/**
 * Acquire an STC-managed workspace lease.
 * @param {string} taskId
 * @param {string} actor
 * @param {string[]} pathsToLease
 * @param {{ root?: string, timeoutMs?: number }} options
 * @returns {object}
 */
export function acquireWorkspaceLease(taskId, actor, pathsToLease, options = {}) {
  const root = options.root ?? process.cwd();
  const dir = leaseDir(root);

  if (!taskId || !actor || !Array.isArray(pathsToLease) || pathsToLease.length === 0) {
    throw new Error('acquireWorkspaceLease requires taskId, actor, and non-empty pathsToLease');
  }

  const normalizedPaths = pathsToLease.map(normalizePath);
  const activeLeases = listActiveLeases(options);

  // Check for path overlap with other active leases
  for (const existing of activeLeases) {
    if (existing.task !== taskId) {
      for (const p of normalizedPaths) {
        for (const ep of existing.leased_paths) {
          if (pathOverlaps(p, ep)) {
            throw new Error(`Path collision: '${p}' is already leased by active task '${existing.task}' (lease ${existing.lease_id})`);
          }
        }
      }
    }
  }

  const leaseId = crypto.randomUUID();
  const leaseRecord = {
    schema: 'kad-stc-lease-v1',
    lease_id: leaseId,
    task: taskId,
    actor,
    leased_paths: normalizedPaths,
    acquired_at: new Date().toISOString(),
    expires_at: options.timeoutMs ? new Date(Date.now() + options.timeoutMs).toISOString() : null,
    active: true
  };

  const leaseFile = path.join(dir, `${leaseId}.json`);
  fs.writeFileSync(leaseFile, JSON.stringify(leaseRecord, null, 2) + '\n', 'utf8');

  return leaseRecord;
}

/**
 * Release an STC workspace lease.
 * @param {string} leaseId
 * @param {{ root?: string, actor?: string }} options
 * @returns {object}
 */
export function releaseWorkspaceLease(leaseId, options = {}) {
  const root = options.root ?? process.cwd();
  const dir = leaseDir(root);
  const leaseFile = path.join(dir, `${leaseId}.json`);

  if (!fs.existsSync(leaseFile)) {
    throw new Error(`Lease not found: ${leaseId}`);
  }

  const lease = JSON.parse(fs.readFileSync(leaseFile, 'utf8'));
  if (!lease.active) {
    return lease;
  }

  if (options.actor && lease.actor !== options.actor) {
    throw new Error(`Lease release actor mismatch: only '${lease.actor}' can release this lease`);
  }

  lease.active = false;
  lease.released_at = new Date().toISOString();
  fs.writeFileSync(leaseFile, JSON.stringify(lease, null, 2) + '\n', 'utf8');

  return lease;
}

/**
 * Validate that a target path is covered by an active lease.
 * @param {string} leaseId
 * @param {string} targetPath
 * @param {{ root?: string }} options
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateLeaseOwnership(leaseId, targetPath, options = {}) {
  const root = options.root ?? process.cwd();
  const dir = leaseDir(root);
  const leaseFile = path.join(dir, `${leaseId}.json`);

  if (!fs.existsSync(leaseFile)) {
    return { valid: false, reason: `Lease ${leaseId} not found` };
  }

  const lease = JSON.parse(fs.readFileSync(leaseFile, 'utf8'));
  if (!lease.active) {
    return { valid: false, reason: `Lease ${leaseId} is inactive/released` };
  }

  const normalizedTarget = normalizePath(targetPath);
  const isCovered = lease.leased_paths.some((p) => pathOverlaps(normalizedTarget, p));

  if (!isCovered) {
    return {
      valid: false,
      reason: `Target path '${targetPath}' is outside the leased paths of lease ${leaseId}`
    };
  }

  return { valid: true };
}

/**
 * List all active leases.
 * @param {{ root?: string }} options
 * @returns {object[]}
 */
export function listActiveLeases(options = {}) {
  const root = options.root ?? process.cwd();
  const dir = leaseDir(root);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir);
  const leases = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      try {
        const lease = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
        if (lease && lease.active) {
          // Check expiration
          if (lease.expires_at && new Date(lease.expires_at) < new Date()) {
            lease.active = false;
            lease.expired = true;
            fs.writeFileSync(path.join(dir, file), JSON.stringify(lease, null, 2) + '\n', 'utf8');
          } else {
            leases.push(lease);
          }
        }
      } catch {
        // Skip corrupt files
      }
    }
  }

  return leases;
}
