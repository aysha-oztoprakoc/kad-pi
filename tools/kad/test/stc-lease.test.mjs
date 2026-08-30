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
