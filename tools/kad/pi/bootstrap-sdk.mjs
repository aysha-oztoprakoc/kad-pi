#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildArtifactManifest, resolveVerifiedPiSdk } from './sdk-resolver.mjs';

const root = resolve(process.env.KAD_ROOT ?? process.cwd());
const manifestPath = join(root, 'tools/kad/pi/sdk-provenance.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const packageName = '@earendil-works/pi-coding-agent';
const version = '0.84.3';
const offline = process.argv.includes('--offline');

function digest(path, algorithm = 'sha256') {
  return createHash(algorithm).update(readFileSync(path)).digest('hex');
}
function assertAccepted() {
  if (manifest.package !== packageName || manifest.version !== version) throw new Error('bootstrap manifest is not the accepted Pi SDK');
  if (!manifest.registry_sha1 || !manifest.registry_integrity) throw new Error('bootstrap manifest lacks registry provenance');
}
function npm(args, cwd) {
  const finalArgs = [...args, '--ignore-scripts', '--no-audit', '--no-fund'];
  if (offline) finalArgs.push('--offline');
  execFileSync('npm', finalArgs, { cwd, stdio: 'inherit' });
}

assertAccepted();
const sdkBase = join(root, '.tools/kad/pi-sdk');
const targetVersion = join(sdkBase, version);
const targetRuntime = join(targetVersion, 'runtime');
if (existsSync(targetRuntime) && manifest.artifact_manifest_sha256) {
  const resolved = resolveVerifiedPiSdk({ root, manifest });
  console.log(JSON.stringify({ status: 'already-verified', receipt: resolved.receipt }, null, 2));
  process.exit(0);
}
if (existsSync(targetVersion)) throw new Error(`refusing to overwrite existing unverified SDK: ${targetVersion}`);

mkdirSync(sdkBase, { recursive: true });
const stageBase = mkdtempSync(join(sdkBase, '.bootstrap-'));
const stageVersion = join(stageBase, version);
const stageRuntime = join(stageVersion, 'runtime');
const download = join(stageBase, 'download');
mkdirSync(stageRuntime, { recursive: true });
mkdirSync(download, { recursive: true });
try {
  npm(['pack', '--pack-destination', download, `${packageName}@${version}`], root);
  const tarballs = readdirSync(download).filter(name => name.endsWith('.tgz'));
  if (tarballs.length !== 1) throw new Error(`expected one npm tarball, found ${tarballs.length}`);
  const downloadedTarball = join(download, tarballs[0]);
  if (digest(downloadedTarball, 'sha1') !== manifest.registry_sha1) throw new Error('npm tarball SHA-1 does not match accepted registry provenance');
  if (digest(downloadedTarball) !== manifest.tarball_sha256) throw new Error('npm tarball SHA-256 does not match accepted provenance');
  if (digest(downloadedTarball, 'sha512') !== manifest.tarball_sha512) throw new Error('npm tarball SHA-512 does not match accepted provenance');

  const stableTarball = join(stageVersion, `${packageName.replace('@', '').replace('/', '-')}-${version}.tgz`);
  mkdirSync(stageVersion, { recursive: true });
  writeFileSync(stableTarball, readFileSync(downloadedTarball));
  writeFileSync(join(stageRuntime, 'package.json'), JSON.stringify({ private: true, dependencies: { [packageName]: version } }, null, 2) + '\n');
  npm(['install', '--save-exact', stableTarball], stageRuntime);

  const packageRoot = join(stageRuntime, 'node_modules', ...packageName.split('/'));
  const artifact = buildArtifactManifest({ runtimeRoot: stageRuntime, packageRoot, tarballPath: stableTarball, package: packageName, version });
  writeFileSync(join(stageRuntime, 'sdk-artifact-manifest.json'), JSON.stringify(artifact, null, 2) + '\n');
  const artifactManifestSha256 = digest(join(stageRuntime, 'sdk-artifact-manifest.json'));
  const finalizedManifest = { ...manifest, artifact_manifest_sha256: artifactManifestSha256 };

  // Verify the staged result before it becomes canonical or changes the repo manifest.
  resolveVerifiedPiSdk({ root, explicitRoot: stageRuntime, manifest: finalizedManifest });
  renameSync(stageVersion, targetVersion);
  writeFileSync(manifestPath, JSON.stringify(finalizedManifest, null, 2) + '\n');
  const resolved = resolveVerifiedPiSdk({ root, manifest: finalizedManifest });
  console.log(JSON.stringify({ status: 'bootstrapped', receipt: resolved.receipt }, null, 2));
} catch (error) {
  rmSync(stageBase, { recursive: true, force: true });
  throw error;
} finally {
  if (existsSync(stageBase)) rmSync(stageBase, { recursive: true, force: true });
}
