import assert from 'node:assert/strict';
import test from 'node:test';
import { execFile } from 'node:child_process';
import { chmod, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { createOmpPreflightFixture, removeOmpPreflightFixture, fixtureOmpBinary, FIXTURE_OMP_VERSION } from './fixtures/omp-preflight-root.mjs';

const execFileAsync = promisify(execFile);
const gate = fileURLToPath(new URL('../preflight-gate.mjs', import.meta.url));

/**
 * Runs the gate as a subprocess, the way `make verify` does.
 *
 * The environment is composed rather than inherited wholesale: the fixture's `fake-bin` (which
 * stubs `pi`) is always on PATH, and `path_prefix` lets a test put its own stubs ahead of the
 * host's toolchain. `OMP_BINARY` and `MISE_DATA_DIR` are injected because the gate derives the
 * harness from its environment; leaving them out would make these assertions depend on this host.
 */
async function runGate(root, { pathPrefix = null, ...overrides } = {}) {
  const path = [pathPrefix, join(root, 'fake-bin'), process.env.PATH].filter(Boolean).join(':');
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [gate], {
      env: {
        ...process.env,
        KAD_PREFLIGHT_ROOT: root,
        OMP_BINARY: fixtureOmpBinary(root),
        MISE_DATA_DIR: join(root, 'mise-data'),
        PATH: path,
        ...overrides
      }
    });
    return { code: 0, stdout, stderr };
  } catch (error) {
    return { code: error.code, stdout: error.stdout ?? '', stderr: error.stderr ?? '' };
  }
}

test('the gate passes a usable checkout and names the harness it receipted', async () => {
  const root = await createOmpPreflightFixture();
  try {
    const { code, stdout } = await runGate(root);
    assert.equal(code, 0, 'a non-blocking receipt must not fail the gate');
    assert.match(stdout, new RegExp(`^OMP PREFLIGHT (READY|DEGRADED): omp ${FIXTURE_OMP_VERSION.replace(/\./g, '\\.')} \\(mise\\)`));
  } finally { await removeOmpPreflightFixture(root); }
});

test('the gate fails on a blocking receipt and prints the cause', async () => {
  const root = await createOmpPreflightFixture({ spend: 'unsafe' });
  try {
    const { code, stderr } = await runGate(root);
    assert.equal(code, 1, 'a blocking receipt must fail the gate');
    assert.match(stderr, /OMP PREFLIGHT BLOCKED: /);
    assert.match(stderr, /"approved_surface": false/, 'the blocking cause is the unapproved spend surface');
  } finally { await removeOmpPreflightFixture(root); }
});

test('the harness is the build mise dispatches, not whatever PATH resolves first', async () => {
  const root = await createOmpPreflightFixture();
  try {
    // A hand-installed copy earlier on PATH is the situation this host is actually in: in a login
    // shell `command -v omp` answers a binary one release behind the mise build.
    const fakeBin = join(root, 'fake-bin');
    await mkdir(fakeBin, { recursive: true });
    const mise = join(fakeBin, 'mise');
    await writeFile(mise, `#!/bin/sh\n[ "$1" = which ] && echo ${fixtureOmpBinary(root)}\n`);
    await chmod(mise, 0o755);
    const shadow = join(fakeBin, 'omp');
    await writeFile(shadow, '#!/bin/sh\necho "omp/0.0.1-shadow"\n');
    await chmod(shadow, 0o755);

    const { code, stdout, stderr } = await runGate(root, {
      pathPrefix: fakeBin,
      OMP_BINARY: '',
      MISE_DATA_DIR: join(root, 'mise-data')
    });
    assert.equal(code, 0, `gate exited ${code} instead of passing: ${stderr.slice(0, 600)}`);
    assert.match(stdout, new RegExp(`omp ${FIXTURE_OMP_VERSION.replace(/\./g, '\\.')} \\(mise\\)`), 'the mise build is the harness');
    assert.ok(!stdout.includes('0.0.1-shadow'), 'the PATH shadow is never the harness');
    assert.match(stdout, /OMP_PATH_SHADOW:/, 'and the shadow is still reported rather than hidden');
  } finally { await removeOmpPreflightFixture(root); }
});

test('a harness outside the mise install root warns without failing the gate', async () => {
  const root = await createOmpPreflightFixture();
  try {
    const external = join(root, 'hand-built-omp');
    await writeFile(external, '#!/bin/sh\necho "omp/18.2.0"\n');
    await chmod(external, 0o755);
    const { code, stdout } = await runGate(root, { OMP_BINARY: external });
    assert.equal(code, 0, 'deviation from the declared harness degrades, it does not block');
    assert.match(stdout, /OMP_BINARY_NOT_MISE_MANAGED/, 'the deviation is printed rather than swallowed');
  } finally { await removeOmpPreflightFixture(root); }
});
