/**
 * Launcher profiles: `bin/omp-kad` and `bin/omp-kad --unattended`.
 *
 * ADR 0019 keeps `retry.waitForUsageReset: true` interactive — waiting through a provider-stated
 * usage reset is resume behaviour a human asked for and can abort. An unattended run has nobody to
 * abort it, so the launcher must be able to select the bounded profile without editing the tracked
 * project config. These tests pin the wiring: which state directory each profile uses, that the
 * profile config is installed where the agent reads it, and that the flag never reaches the harness.
 *
 * The profile's *effect* (`omp config get retry.waitForUsageReset` answering false under the
 * profile's agent directory) was verified by observation on 2026-09-12 and is re-runnable with:
 *   PI_CODING_AGENT_DIR=.state/omp-kad/unattended omp config get retry.waitForUsageReset
 * It is not asserted here: that would make the suite depend on a harness binary being installed.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, lstatSync, mkdtempSync, readFileSync, readlinkSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '../../..');
const LAUNCHER = join(ROOT, 'bin/omp-kad');
const INTERACTIVE_CONFIG = join(ROOT, 'config/omp-interactive.yml');
const UNATTENDED_CONFIG = join(ROOT, 'config/omp-unattended.yml');

/** Run the launcher with a stub harness that prints the state directory it was given. */
function launch(args) {
  const scratch = mkdtempSync(join(tmpdir(), 'omp-kad-profile-'));
  const stub = join(scratch, 'stub-omp');
  writeFileSync(stub, '#!/usr/bin/env bash\nprintf "AGENT_DIR=%s\\nARGS=%s\\n" "${PI_CODING_AGENT_DIR}" "$*"\n');
  chmodSync(stub, 0o755);
  try {
    const result = spawnSync(LAUNCHER, args, {
      cwd: ROOT,
      env: { ...process.env, OMP_BINARY: stub },
      encoding: 'utf8'
    });
    return { status: result.status, stdout: result.stdout, stderr: result.stderr };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

function field(stdout, name) {
  const match = stdout.match(new RegExp(`^${name}=(.*)$`, 'm'));
  assert.ok(match, `stub output must contain ${name}:\n${stdout}`);
  return match[1];
}

test('launcher: default profile uses the agent state directory and passes arguments through', () => {
  const { status, stdout, stderr } = launch(['--version']);
  assert.equal(status, 0, stderr);
  assert.equal(field(stdout, 'AGENT_DIR'), join(ROOT, '.state/omp-kad/agent'));
  assert.equal(field(stdout, 'ARGS'), '--version');
  assert.equal(stderr.includes('unattended profile'), false, 'default profile must not announce itself');
});

test('launcher: --unattended selects its own state directory, strips the flag, and announces itself', () => {
  const { status, stdout, stderr } = launch(['--unattended', '--version']);
  assert.equal(status, 0, stderr);
  assert.equal(field(stdout, 'AGENT_DIR'), join(ROOT, '.state/omp-kad/unattended'));
  assert.equal(field(stdout, 'ARGS'), '--version', 'the harness must not receive --unattended');
  assert.match(stderr, /unattended profile/);
});

test('launcher: each profile installs its committed config where the agent reads it', () => {
  launch([]);
  const interactive = join(ROOT, '.state/omp-kad/agent/config.yml');
  assert.ok(lstatSync(interactive).isSymbolicLink(), `${interactive} must be a symlink to the tracked profile`);
  assert.equal(readlinkSync(interactive), INTERACTIVE_CONFIG);

  launch(['--unattended']);
  const unattended = join(ROOT, '.state/omp-kad/unattended/config.yml');
  assert.ok(lstatSync(unattended).isSymbolicLink(), `${unattended} must be a symlink to the tracked profile`);
  assert.equal(readlinkSync(unattended), UNATTENDED_CONFIG);
});

test('launcher: the profiles declare opposite wait postures', () => {
  // The value the run actually resolves is what matters; the file is the declaration it resolves
  // from. A key spelled differently here would silently leave the wait enabled or disabled.
  const interactive = readFileSync(INTERACTIVE_CONFIG, 'utf8');
  assert.match(interactive, /^retry:\s*$/m, 'the interactive profile must set keys under the retry block');
  assert.match(interactive, /^\s+waitForUsageReset:\s*true\s*$/m, 'interactive sessions wait out a stated reset');

  const unattended = readFileSync(UNATTENDED_CONFIG, 'utf8');
  assert.match(unattended, /^retry:\s*$/m, 'the unattended profile must set keys under the retry block');
  assert.match(unattended, /^\s+waitForUsageReset:\s*false\s*$/m, 'unattended runs must not sleep through a reset');
});
