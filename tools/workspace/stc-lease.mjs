import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function leaseDir(root) {
  const dir = path.join(root, '.agents', 'work', 'leases');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function normalizePath(p) {
  if (typeof p !== 'string' || p.includes('\0')) {
    throw new Error(`Invalid path: ${p}`);
  }
  const normalized = path.normalize(p).replace(/^\.\//, '').replace(/\/+$/, '');
  if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
    throw new Error(`Invalid path (traversal rejected): ${p}`);
  }
  return normalized;
}

function pathOverlaps(p1, p2) {
  const n1 = normalizePath(p1);
  const n2 = normalizePath(p2);
  return n1 === n2 || n1.startsWith(n2 + '/') || n2.startsWith(n1 + '/');
}

function pathContains(leasedPath, targetPath) {
  const nLeased = normalizePath(leasedPath);
  const nTarget = normalizePath(targetPath);
  return nTarget === nLeased || nTarget.startsWith(nLeased + '/');
}

function withLeaseLock(dir, callback) {
  const lock = path.join(dir, '.lease.lock');
  let fd;
  try {
    fd = fs.openSync(lock, 'wx');
  } catch {
    throw new Error('concurrent lease operation in progress');
  }
  try {
    return callback();
  } finally {
    fs.closeSync(fd);
    try { fs.unlinkSync(lock); } catch {}
  }
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

  return withLeaseLock(dir, () => {
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
  });
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

  // Validate expiration
  if (lease.expires_at) {
    const expiresTime = Date.parse(lease.expires_at);
    if (Number.isFinite(expiresTime) && Date.now() > expiresTime) {
      lease.active = false;
      lease.expired_at = new Date().toISOString();
      try {
        fs.writeFileSync(leaseFile, JSON.stringify(lease, null, 2) + '\n', 'utf8');
      } catch {}
      return { valid: false, reason: `Lease ${leaseId} has expired (expired at ${lease.expires_at})` };
    }
  }

  // Validate actor binding if provided
  if (options.actor && lease.actor !== options.actor) {
    return { valid: false, reason: `Lease ${leaseId} actor mismatch: leased to '${lease.actor}', requested by '${options.actor}'` };
  }

  // Validate task binding if provided
  if (options.taskId && lease.task !== options.taskId) {
    return { valid: false, reason: `Lease ${leaseId} task mismatch: leased for '${lease.task}', requested for '${options.taskId}'` };
  }

  let normalizedTarget;
  try {
    normalizedTarget = normalizePath(targetPath);
  } catch (err) {
    return { valid: false, reason: `Invalid target path: ${err.message}` };
  }

  // Directional containment: leased path must contain target path!
  const isCovered = lease.leased_paths.some((p) => {
    try {
      return pathContains(p, normalizedTarget);
    } catch {
      return false;
    }
  });

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
