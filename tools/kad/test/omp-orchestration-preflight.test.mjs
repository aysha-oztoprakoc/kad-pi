import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { chmod, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectPreflight, canonicalReceipt } from '../omp-orchestration-preflight.mjs';
import { createOmpPreflightFixture, removeOmpPreflightFixture, ompObservation, fixtureOmpBinary, FIXTURE_OMP_VERSION, FIXTURE_STAGED_OMP_VERSION, DEFAULT_MODELS_YAML } from './fixtures/omp-preflight-root.mjs';

/**
 * Observations a fixture root implies, with the harness taken from that root.
 *
 * The preflight resolves the executing OMP from `OMP_BINARY`, then PATH, then the canary; a test
 * injects it so the verdict never depends on which OMP this host happens to have on PATH.
 */
const observedFor = (root, overrides = {}) => ({
  piVersion: '0.84.3',
  localInference: { ownership: 'INACTIVE', available: false },
  ...ompObservation(root),
  ...overrides
});

/**
 * The harness this machine would run, resolved the way the launcher and the receipt resolve it:
 * `mise which omp` first, then `omp` on PATH. A login shell puts a hand-installed copy ahead of
 * every mise path, so PATH alone answers a different binary than mise dispatches.
 *
 * `viaMise` distinguishes "mise provided this harness" from "some other copy answered PATH": the
 * provenance assertion below is only meaningful in the first case, and a checkout without mise must
 * still be able to run this test.
 */
function liveOmpObservation() {
  const versionOf = (binary) => {
    try { return execFileSync(binary, ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().match(/(\d+\.\d+\.\d+)/)?.[1] ?? null; } catch { return null; }
  };
  try {
    const dispatched = execFileSync('mise', ['which', 'omp'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const version = dispatched ? versionOf(dispatched) : null;
    if (version) return { ompBinary: dispatched, ompVersion: version, viaMise: true };
  } catch { /* no mise on this machine: fall through to PATH */ }
  try {
    const onPath = execFileSync('sh', ['-c', 'command -v omp'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const version = onPath ? versionOf(onPath) : null;
    return version ? { ompBinary: onPath, ompVersion: version, viaMise: false } : {};
  } catch { return {}; }
}

test('T1 valid OMP/KAD fixture is READY', async () => {
  const root = await createOmpPreflightFixture();
  try {
    const receipt = inspectPreflight({ root, observed: observedFor(root, { localInference: { ownership: 'OWNED', available: true, provider: 'kad-local-qwen', model: 'qwen-local' } }) });
    assert.equal(receipt.status, 'READY');
  } finally { await removeOmpPreflightFixture(root); }
});

test('T2 missing local retrieval role is DEGRADED', async () => {
  const root = await createOmpPreflightFixture({ role: 'missing' });
  try { assert.equal(inspectPreflight({ root, observed: observedFor(root) }).status, 'DEGRADED'); }
  finally { await removeOmpPreflightFixture(root); }
});

test('T3 WORLD role remains ineligible for engineering', async () => {
  const root = await createOmpPreflightFixture({ role: 'world' });
  try {
    const receipt = inspectPreflight({ root, observed: observedFor(root) });
    assert.equal(receipt.authority.world_engineering_eligible, false);
    assert.equal(receipt.status, 'DEGRADED');
  } finally { await removeOmpPreflightFixture(root); }
});

test('T4 a posture that diverges from its declaration blocks', async () => {
  const root = await createOmpPreflightFixture({ autolearn: true, declaration: { 'autolearn.enabled': 'false' } });
  try {
    const receipt = inspectPreflight({ root, observed: observedFor(root) });
    assert.equal(receipt.status, 'BLOCKED');
    assert.ok(receipt.failures.includes('POSTURE_DECLARATION_MISMATCH'), 'the mismatch is the blocking cause');
    assert.equal(receipt.learning.autolearn_enabled, true, 'autolearn itself is reported, not fatal');
  } finally { await removeOmpPreflightFixture(root); }
});

test('T5 unknown or unapproved PAYG surface blocks spend safety', async () => {
  const root = await createOmpPreflightFixture({ spend: 'unsafe' });
  try { assert.equal(inspectPreflight({ root, observed: observedFor(root) }).status, 'BLOCKED'); }
  finally { await removeOmpPreflightFixture(root); }
});

test('T6 missing OMP binary and launcher is clearly blocked', async () => {
  const root = await createOmpPreflightFixture({ omp: false });
  try { assert.equal(inspectPreflight({ root, observed: observedFor(root) }).status, 'BLOCKED'); }
  finally { await removeOmpPreflightFixture(root); }
});

test('T7 canonical receipt replays identically', async () => {
  const root = await createOmpPreflightFixture();
  try {
    const a = canonicalReceipt(inspectPreflight({ root, observed: observedFor(root) }));
    const b = canonicalReceipt(inspectPreflight({ root, observed: observedFor(root) }));
    assert.deepEqual(a, b);
    assert.equal(JSON.stringify(a), JSON.stringify(b));
  } finally { await removeOmpPreflightFixture(root); }
});

test('T9 a registered transport-only provider stays out of the local-inference census', async () => {
  const modelsYaml = `providers:
  kad-local-world:
    baseUrl: http://127.0.0.1:5001/v1
    auth: none
    models:
      - id: kad-local-s13
        contextWindow: 4096
  kad-local-qwen:
    baseUrl: http://127.0.0.1:5002/v1
    auth: none
    models:
      - id: qwen-local
        contextWindow: 4096
  zai-free:
    baseUrl: https://api.z.ai/api/paas/v4
    auth: none
    models:
      - id: glm-flash
        contextWindow: 4096
`;
  const root = await createOmpPreflightFixture({
    modelsYaml,
    externalProviders: {
      providers: [
        { id: 'zai-free-cloud', class: 'WORKLOAD_PROVIDER', status: 'ACTIVE', authority: 'TRANSPORT_ONLY', omp_provider: 'zai-free' }
      ]
    }
  });
  try {
    const receipt = inspectPreflight({
      root,
      observed: observedFor(root, {
        localInference: {
          resources: [
            { provider: 'kad-local-qwen', model: 'qwen-local', endpoint: 'http://127.0.0.1:5002/v1', endpoint_available: true, observed_identity: 'qwen-local', ownership: 'OWNED', capability_state: 'AVAILABLE' }
          ]
        }
      })
    });
    assert.deepEqual(receipt.local_inference.resources.map((r) => r.provider), ['kad-local-world', 'kad-local-qwen'], 'only loopback compute the harness can own is census material');
    assert.deepEqual(receipt.local_inference.failures, [], 'a declared transport never reads as an unowned local process');
    assert.equal(receipt.status, 'READY');
  } finally { await removeOmpPreflightFixture(root); }
});

test('T10 spend: declared fixed-cost lanes pass while metered and undeclared lanes block', async () => {
  const registry = {
    providers: [
      { id: 'vendor-sub', class: 'WORKLOAD_PROVIDER', status: 'ACTIVE', authority: 'TRANSPORT_ONLY', cost_class: 'FIXED_SUBSCRIPTION', omp_provider: 'vendor-sub' },
      { id: 'vendor-metered', class: 'WORKLOAD_PROVIDER', status: 'ACTIVE', authority: 'TRANSPORT_ONLY', cost_class: 'METERED', omp_provider: 'vendor-metered' }
    ]
  };
  const modelsYaml = `${DEFAULT_MODELS_YAML}  vendor-sub:
    auth: subscription
    models:
      - id: big-model
        contextWindow: 200000
  vendor-metered:
    auth: api-key
    models:
      - id: metered-model
        contextWindow: 200000
  vendor-unlisted:
    auth: api-key
    models:
      - id: mystery
        contextWindow: 200000
`;
  const spendFor = async (enabledModels) => {
    const root = await createOmpPreflightFixture({ modelsYaml, externalProviders: registry, enabledModels });
    try { return inspectPreflight({ root, observed: observedFor(root) }).spend; }
    finally { await removeOmpPreflightFixture(root); }
  };

  const approved = await spendFor(['kad-local-qwen/qwen-local', 'vendor-sub/*']);
  assert.equal(approved.approved_surface, true);
  assert.deepEqual(approved.lanes.map((lane) => [lane.provider, lane.cost_class]), [['kad-local-qwen', 'LOCAL'], ['vendor-sub', 'FIXED_SUBSCRIPTION']]);

  const metered = await spendFor(['kad-local-qwen/qwen-local', 'vendor-metered/*']);
  assert.equal(metered.approved_surface, false);
  assert.equal(metered.lanes.find((lane) => lane.provider === 'vendor-metered').cost_class, 'METERED');

  const undeclared = await spendFor(['kad-local-qwen/qwen-local', 'vendor-unlisted/*']);
  assert.equal(undeclared.approved_surface, false);
  assert.equal(undeclared.lanes.find((lane) => lane.provider === 'vendor-unlisted').cost_class, 'UNDECLARED');
});

test('T11 advisory memory and autolearn pass once declared and enforced', async () => {
  const root = await createOmpPreflightFixture({ memory: 'mnemopi', autolearn: true });
  try {
    const receipt = inspectPreflight({ root, observed: observedFor(root) });
    assert.deepEqual(receipt.learning.failures, [], 'an enabled advisory store is not a gate failure');
    assert.deepEqual(receipt.learning.advisory_systems, ['memory:mnemopi', 'autolearn']);
    assert.deepEqual(receipt.learning.posture.problems, []);
    assert.notEqual(receipt.status, 'BLOCKED');
  } finally { await removeOmpPreflightFixture(root); }
});

test('T12 an unresolvable harness version blocks instead of passing', async () => {
  const root = await createOmpPreflightFixture({ omp: false });
  try {
    // The binary exists and exits cleanly but reports nothing: the receipt must not vouch for it.
    const silent = join(root, 'silent-omp');
    await writeFile(silent, '#!/bin/sh\nexit 0\n');
    await chmod(silent, 0o755);
    const receipt = inspectPreflight({ root, observed: { piVersion: '0.84.3', ompBinary: silent, localInference: { ownership: 'INACTIVE', available: false } } });
    assert.equal(receipt.omp.version, 'UNKNOWN');
    assert.equal(receipt.status, 'BLOCKED');
    assert.ok(receipt.failures.includes('OMP_VERSION_UNKNOWN'), 'an unidentifiable harness is fatal');
    assert.ok(receipt.failures.includes('OMP_WRAPPER_MISSING'), 'no launcher was installed by the fixture');
  } finally { await removeOmpPreflightFixture(root); }
});

test('T13 a harness outside the mise install root degrades and is named', async () => {
  const root = await createOmpPreflightFixture();
  try {
    const external = join(root, 'hand-built-omp');
    await writeFile(external, '#!/bin/sh\necho "omp/18.2.0"\n');
    await chmod(external, 0o755);
    const receipt = inspectPreflight({ root, observed: { piVersion: '0.84.3', ompBinary: external, localInference: { ownership: 'INACTIVE', available: false } } });
    assert.equal(receipt.omp.version, '18.2.0', 'the version is read from the binary that would run');
    assert.equal(receipt.omp.source, 'unmanaged');
    assert.deepEqual(receipt.omp.provenance_failures, ['OMP_BINARY_NOT_MISE_MANAGED']);
    assert.equal(receipt.status, 'DEGRADED', 'unmanaged provenance degrades the receipt; it does not block it');
    assert.ok(!receipt.failures.includes('OMP_BINARY_NOT_MISE_MANAGED'), 'provenance is not reported as a blocking failure');
  } finally { await removeOmpPreflightFixture(root); }
});

test('T14 the superseded staged pin is reported as drift, never as the harness', async () => {
  const root = await createOmpPreflightFixture();
  try {
    const receipt = inspectPreflight({ root, observed: observedFor(root) });
    assert.equal(receipt.omp.version, FIXTURE_OMP_VERSION, 'the executed build, not the staged pin');
    assert.equal(receipt.omp.source, 'mise');
    assert.deepEqual(receipt.omp.staged_pin, { version: FIXTURE_STAGED_OMP_VERSION, path: '.tools/oh-my-pi/v18.0.9', superseded: true, drift: true });
    assert.match(receipt.omp.legacy_manifest.path, /install-manifest\.json$/);
    assert.equal(receipt.omp.legacy_manifest.superseded_by, 'docs/adr/0018-newest-mise-provided-omp-is-authoritative.md');
    assert.deepEqual(receipt.omp.failures, [], 'a stale pin is evidence, not a harness failure');
    assert.deepEqual(receipt.omp.provenance_failures, []);
  } finally { await removeOmpPreflightFixture(root); }
});

test('T15 a mise shim counts as mise provenance, and says which route was taken', async () => {
  const root = await createOmpPreflightFixture();
  try {
    // `command -v omp` returns the shim whenever the shims directory precedes the installs
    // directory on PATH, which is what a login shell does. The shim is a symlink to the mise
    // binary, so resolving it proves nothing about the build; provenance must still read as mise.
    const shim = join(root, 'mise-data', 'shims', 'omp');
    await mkdir(join(root, 'mise-data', 'shims'), { recursive: true });
    await writeFile(shim, '#!/bin/sh\necho "omp/18.2.0"\n');
    await chmod(shim, 0o755);
    const receipt = inspectPreflight({ root, observed: { piVersion: '0.84.3', ompBinary: shim, localInference: { ownership: 'INACTIVE', available: false } } });
    assert.equal(receipt.omp.source, 'mise');
    assert.equal(receipt.omp.via, 'shim');
    assert.equal(receipt.omp.version, '18.2.0', 'the version still comes from executing the harness');
    assert.deepEqual(receipt.omp.provenance_failures, []);
    assert.notEqual(receipt.status, 'BLOCKED');
  } finally { await removeOmpPreflightFixture(root); }
});

test('T16 an empty model surface fails rather than passing as clean', async () => {
  const root = await createOmpPreflightFixture({ enabledModels: [] });
  try {
    const receipt = inspectPreflight({ root, observed: observedFor(root) });
    assert.equal(receipt.spend.approved_surface, false, 'no declared lanes is not the same as no unapproved lanes');
    assert.deepEqual(receipt.spend.failures, ['OMP_MODEL_SURFACE_UNDECLARED']);
    assert.equal(receipt.status, 'BLOCKED');
  } finally { await removeOmpPreflightFixture(root); }
});

/**
 * T8 is the one deliberately config-coupled test in this file: it reads the live
 * checkout and pins the *consequence* of the posture declared in `.omp/RULES.md`, enforced by
 * `.omp/config.yml`, and of the cost class declared for every lane in
 * `config/external-providers.json` (ADR 0016 / ADR 0017).
 *
 * It fails when the posture moves without the declaration moving with it, when an undeclared or
 * metered provider is enabled, or when a managed store is pointed at canon — which is the point.
 * Changing the posture means changing the declaration in the same commit.
 */
test('T8 live posture: declared, enforced, and every enabled lane carries an approved cost class', () => {
  const repoRoot = fileURLToPath(new URL('../../..', import.meta.url));
  const live = liveOmpObservation();
  const receipt = inspectPreflight({
    root: repoRoot,
    observed: { ...live, piVersion: '0.84.3', localInference: { resources: [] } }
  });
  assert.deepEqual(receipt.learning.failures, [], 'the live posture must be declared and enforced');
  assert.equal(receipt.spend.approved_surface, true, 'no enabled lane may be undeclared or metered');
  for (const lane of receipt.spend.lanes) {
    assert.ok(['LOCAL', 'FIXED_SUBSCRIPTION', 'FREE_TIER'].includes(lane.cost_class), `${lane.pattern} carries ${lane.cost_class}`);
  }
  assert.ok(receipt.failures.every((failure) => failure.startsWith('OMP_')), `only harness resolution may block the live receipt: ${receipt.failures.join(', ')}`);
  if (live.ompVersion) {
    // `viaMise` is false when mise is absent and PATH had to answer; the mise-provenance claim
    // only holds when mise is the thing that dispatched the harness.
    if (live.viaMise) assert.equal(receipt.omp.source, 'mise', 'a mise-dispatched harness must receipt as mise (ADR 0018)');
    assert.notEqual(receipt.status, 'BLOCKED', `the live preflight must not block: ${receipt.failures.join(', ')}`);
  }
});
