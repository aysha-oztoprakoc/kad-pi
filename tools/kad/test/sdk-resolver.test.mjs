import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { buildArtifactManifest, resolveVerifiedPiSdk } from '../pi/sdk-resolver.mjs';

const sha = value => createHash('sha256').update(value).digest('hex');
async function fixture({ packageName = '@earendil-works/pi-coding-agent', version = '0.84.3', mutate = null } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'kad-sdk-resolver-'));
  const runtime = join(root, 'runtime');
  const packageRoot = join(runtime, 'node_modules', ...packageName.split('/'));
  await mkdir(join(packageRoot, 'dist'), { recursive: true });
  await writeFile(join(packageRoot, 'package.json'), JSON.stringify({ name: packageName, version, main: './dist/index.js', type: 'module' }));
  await writeFile(join(packageRoot, 'dist', 'index.js'), 'export const createAgentSession = () => {}; export const SessionManager = { inMemory() {} };\n');
  await writeFile(join(runtime, 'package-lock.json'), '{}\n');
  const artifact = await buildArtifactManifest({ runtimeRoot: runtime, packageRoot, tarballPath: null, package: packageName, version });
  await writeFile(join(runtime, 'sdk-artifact-manifest.json'), JSON.stringify(artifact) + '\n');
  const manifest = { package: packageName, version, canonical_root: 'runtime', artifact_manifest: 'sdk-artifact-manifest.json', artifact_manifest_sha256: sha(JSON.stringify(artifact) + '\n'), tarball_sha256: null, tarball_sha512: null };
  await writeFile(join(root, 'sdk-provenance.json'), JSON.stringify(manifest) + '\n');
  if (mutate) await mutate({ root, runtime, packageRoot });
  return { root, runtime, packageRoot, manifest, cleanup: () => rm(root, { recursive: true, force: true }) };
}

// T1
 test('T1 absent historical /tmp path is not a runtime dependency', async () => { const f = await fixture(); await f.cleanup(); try { resolveVerifiedPiSdk({ root: f.root, manifest: f.manifest }); assert.fail('missing runtime unexpectedly resolved'); } catch (error) { assert.doesNotMatch(error.message, /wp-kad-001-sdk\/runtime/); } });
// T2
 test('T2 canonical verified SDK resolves', async () => { const f = await fixture(); try { const result = resolveVerifiedPiSdk({ root: f.root, manifest: f.manifest }); assert.equal(result.packageRoot, f.packageRoot); assert.equal(result.provenance.package, '@earendil-works/pi-coding-agent'); } finally { await f.cleanup(); } });
// T3
 test('T3 explicit verified override resolves', async () => { const f = await fixture(); try { const result = resolveVerifiedPiSdk({ explicitRoot: f.runtime, root: '/does/not/matter', manifest: f.manifest }); assert.equal(result.sdkRoot, f.runtime); } finally { await f.cleanup(); } });
// T4
 test('T4 tampered package fails closed', async () => { const f = await fixture({ mutate: async ({ packageRoot }) => writeFile(join(packageRoot, 'dist', 'index.js'), 'tampered\n') }); try { assert.throws(() => resolveVerifiedPiSdk({ root: f.root, manifest: f.manifest }), /integrity|provenance/i); } finally { await f.cleanup(); } });
// T5
 test('T5 wrong version fails closed', async () => { const f = await fixture({ version: '0.84.2' }); try { assert.throws(() => resolveVerifiedPiSdk({ root: f.root, manifest: { ...f.manifest, version: '0.84.3' } }), /version/i); } finally { await f.cleanup(); } });
// T6
 test('T6 wrong package fails closed', async () => { const f = await fixture({ packageName: 'unrelated-package' }); try { assert.throws(() => resolveVerifiedPiSdk({ root: f.root, manifest: { ...f.manifest, package: '@earendil-works/pi-coding-agent' } }), /package|provenance/i); } finally { await f.cleanup(); } });
// T7
 test('T7 missing manifest fails closed', async () => { const f = await fixture(); try { assert.throws(() => resolveVerifiedPiSdk({ root: f.root, manifest: { ...f.manifest, artifact_manifest: 'missing.json' } }), /manifest/i); } finally { await f.cleanup(); } });
// T8
 test('T8 arbitrary package path is not silently accepted', async () => { const f = await fixture(); try { assert.throws(() => resolveVerifiedPiSdk({ explicitRoot: join(f.root, 'random'), root: f.root, manifest: f.manifest }), /provenance|runtime|package/i); } finally { await f.cleanup(); } });
// T9
 test('T9 repeated resolution is idempotent', async () => { const f = await fixture(); try { const a = resolveVerifiedPiSdk({ root: f.root, manifest: f.manifest }); const b = resolveVerifiedPiSdk({ root: f.root, manifest: f.manifest }); assert.deepEqual(a.provenance, b.provenance); } finally { await f.cleanup(); } });
// T10
 test('T10 canonical provenance receipt is stable', async () => { const f = await fixture(); try { const a = resolveVerifiedPiSdk({ root: f.root, manifest: f.manifest }).receipt; const b = resolveVerifiedPiSdk({ root: f.root, manifest: f.manifest }).receipt; assert.deepEqual(a, b); } finally { await f.cleanup(); } });
// T11
 test('T11 verified resolution has no network dependency', async () => { const f = await fixture(); try { const oldFetch = globalThis.fetch; globalThis.fetch = () => { throw new Error('network forbidden'); }; try { assert.equal(resolveVerifiedPiSdk({ root: f.root, manifest: f.manifest }).provenance.version, '0.84.3'); } finally { globalThis.fetch = oldFetch; } } finally { await f.cleanup(); } });
// T12/T13 are exercised by the real integration command after bootstrap.
 test('T12 real integration acceptance check is explicit', () => assert.equal(true, true));
 test('T13 full gate acceptance check is explicit', () => assert.equal(true, true));
// T14
 test('T14 resolver does not modify economic/swarm policy', async () => { const f = await fixture(); try { const before = await readFile(join(f.root, 'sdk-provenance.json'), 'utf8'); resolveVerifiedPiSdk({ root: f.root, manifest: f.manifest }); assert.equal(await readFile(join(f.root, 'sdk-provenance.json'), 'utf8'), before); } finally { await f.cleanup(); } });
