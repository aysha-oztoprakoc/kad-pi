import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  acquireWorkspaceLease,
  releaseWorkspaceLease,
  validateLeaseOwnership,
  listActiveLeases
} from '../../workspace/stc-lease.mjs';

test('STC Lease: Acquire, validate, and release lifecycle', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-stc-test-'));

  try {
    // 1. Acquire lease
    const lease = acquireWorkspaceLease('WP-TEST-001', 'actor-1', ['src/auth/'], { root: tmpRoot });
    assert.ok(lease.lease_id, 'Lease has an ID');
    assert.equal(lease.active, true);
    assert.deepEqual(lease.leased_paths, ['src/auth']);

    // 2. Validate ownership
    const validCheck = validateLeaseOwnership(lease.lease_id, 'src/auth/login.ts', { root: tmpRoot });
    assert.equal(validCheck.valid, true);

    const invalidCheck = validateLeaseOwnership(lease.lease_id, 'src/billing/pay.ts', { root: tmpRoot });
    assert.equal(invalidCheck.valid, false);
    assert.ok(invalidCheck.reason.includes('outside the leased paths'));

    // 3. List active leases
    const activeList = listActiveLeases({ root: tmpRoot });
    assert.equal(activeList.length, 1);
    assert.equal(activeList[0].lease_id, lease.lease_id);

    // 4. Release lease
    const released = releaseWorkspaceLease(lease.lease_id, { root: tmpRoot, actor: 'actor-1' });
    assert.equal(released.active, false);
    assert.ok(released.released_at);

    // 5. Active list is now empty
    const postReleaseList = listActiveLeases({ root: tmpRoot });
    assert.equal(postReleaseList.length, 0);
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test('STC Lease: Overlapping path collision is rejected', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-stc-collision-'));

  try {
    acquireWorkspaceLease('WP-TEST-001', 'actor-1', ['src/common/'], { root: tmpRoot });

    assert.throws(
      () => {
        acquireWorkspaceLease('WP-TEST-002', 'actor-2', ['src/common/utils.ts'], { root: tmpRoot });
      },
      /Path collision/,
      'Overlapping path must throw path collision error'
    );
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test('P04 RED: Directional containment: child path lease must NOT authorize parent directory or root', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-stc-directional-'));

  try {
    // Lease a specific file: src/auth/login.ts
    const lease = acquireWorkspaceLease('WP-TEST-001', 'actor-1', ['src/auth/login.ts'], { root: tmpRoot });

    // It MUST authorize exact file
    const exactCheck = validateLeaseOwnership(lease.lease_id, 'src/auth/login.ts', { root: tmpRoot });
    assert.equal(exactCheck.valid, true);

    // It MUST NOT authorize parent directory src/auth
    const parentCheck = validateLeaseOwnership(lease.lease_id, 'src/auth', { root: tmpRoot });
    assert.equal(parentCheck.valid, false, 'Leasing child file must NOT authorize parent directory');

    // It MUST NOT authorize grand-parent directory src
    const grandParentCheck = validateLeaseOwnership(lease.lease_id, 'src', { root: tmpRoot });
    assert.equal(grandParentCheck.valid, false, 'Leasing child file must NOT authorize grand-parent');

    // It MUST NOT authorize root
    const rootCheck = validateLeaseOwnership(lease.lease_id, '.', { root: tmpRoot });
    assert.equal(rootCheck.valid, false, 'Leasing child file must NOT authorize root');
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test('P04 RED: Expired lease must NOT authorize writes', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-stc-expired-'));

  try {
    // Lease with 10ms timeout
    const lease = acquireWorkspaceLease('WP-TEST-001', 'actor-1', ['src/auth/'], { root: tmpRoot, timeoutMs: 10 });

    // Immediately valid
    assert.equal(validateLeaseOwnership(lease.lease_id, 'src/auth/login.ts', { root: tmpRoot }).valid, true);

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 25));

    const expiredCheck = validateLeaseOwnership(lease.lease_id, 'src/auth/login.ts', { root: tmpRoot });
    assert.equal(expiredCheck.valid, false, 'Expired lease must fail validation');
    assert.ok(expiredCheck.reason.includes('expired'), 'Reason must declare expiration');
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test('P04 RED: Path traversal and escaping owned root must be rejected', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-stc-traversal-'));

  try {
    const lease = acquireWorkspaceLease('WP-TEST-001', 'actor-1', ['src/auth/'], { root: tmpRoot });

    const traversalCheck = validateLeaseOwnership(lease.lease_id, '../../etc/passwd', { root: tmpRoot });
    assert.equal(traversalCheck.valid, false, 'Path traversal outside root must be rejected');

    const innerTraversalCheck = validateLeaseOwnership(lease.lease_id, 'src/auth/../../outside.txt', { root: tmpRoot });
    assert.equal(innerTraversalCheck.valid, false, 'Normalized traversal escaping leased path must be rejected');
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test('P04 RED: Actor binding validation rejects unauthorized actor', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-stc-actor-'));

  try {
    const lease = acquireWorkspaceLease('WP-TEST-001', 'actor-1', ['src/auth/'], { root: tmpRoot });

    const mismatchCheck = validateLeaseOwnership(lease.lease_id, 'src/auth/login.ts', { root: tmpRoot, actor: 'imposter-actor' });
    assert.equal(mismatchCheck.valid, false, 'Actor mismatch must fail validation');
    assert.ok(mismatchCheck.reason.includes('actor mismatch'));
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test('P04 RED: Re-acquisition after release succeeds cleanly without conflict', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-stc-reacquire-'));

  try {
    const lease1 = acquireWorkspaceLease('WP-TEST-001', 'actor-1', ['src/foo/'], { root: tmpRoot });
    releaseWorkspaceLease(lease1.lease_id, { root: tmpRoot, actor: 'actor-1' });

    // Second task can re-acquire the released path cleanly
    const lease2 = acquireWorkspaceLease('WP-TEST-002', 'actor-2', ['src/foo/'], { root: tmpRoot });
    assert.ok(lease2.lease_id);
    assert.equal(lease2.active, true);
    assert.equal(validateLeaseOwnership(lease2.lease_id, 'src/foo/bar.ts', { root: tmpRoot }).valid, true);
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});
