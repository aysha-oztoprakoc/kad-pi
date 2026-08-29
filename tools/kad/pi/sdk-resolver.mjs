import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve as pathResolve } from 'node:path';

const PACKAGE = '@earendil-works/pi-coding-agent';
const DEFAULT_MANIFEST = 'tools/kad/pi/sdk-provenance.json';

function digestFile(path, algorithm = 'sha256') {
  return createHash(algorithm).update(readFileSync(path)).digest('hex');
}

function inside(parent, child) {
  const p = pathResolve(parent);
  const c = pathResolve(child);
  return c === p || c.startsWith(`${p}/`);
}

function filesUnder(root, current = root) {
  const result = [];
  for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
    const path = join(current, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`SDK provenance rejects symbolic link: ${path}`);
    if (entry.isDirectory()) result.push(...filesUnder(root, path));
    else if (entry.isFile()) result.push(path);
    else throw new Error(`SDK provenance rejects special file: ${path}`);
  }
  return result;
}

function packageFiles(packageRoot) {
  return filesUnder(packageRoot).map(path => ({
    path: relative(packageRoot, path).split('\\').join('/'),
    sha256: digestFile(path),
  }));
}

function treeDigest(files) {
  return createHash('sha256').update(JSON.stringify(files)).digest('hex');
}

/** Build the content-addressed receipt written by the bootstrapper. */
export function buildArtifactManifest({ runtimeRoot, packageRoot, tarballPath, package: packageName = PACKAGE, version }) {
  const files = packageFiles(packageRoot);
  const lockfile = join(runtimeRoot, 'package-lock.json');
  return {
    schema_version: 1,
    package: packageName,
    version,
    tarball_path: tarballPath ? relative(runtimeRoot, tarballPath).split('\\').join('/') : null,
    tarball_sha1: tarballPath ? digestFile(tarballPath, 'sha1') : null,
    tarball_sha256: tarballPath ? digestFile(tarballPath) : null,
    tarball_sha512: tarballPath ? digestFile(tarballPath, 'sha512') : null,
    package_json_sha256: digestFile(join(packageRoot, 'package.json')),
    package_tree_sha256: treeDigest(files),
    package_files: files,
    package_lock_sha256: existsSync(lockfile) ? digestFile(lockfile) : null,
  };
}

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`SDK provenance ${label} is unreadable: ${error.message}`);
  }
}

function fail(message) {
  throw new Error(`SDK provenance verification failed: ${message}`);
}

function verifyPackageTree(packageRoot, artifact) {
  if (!existsSync(packageRoot)) fail(`package root is absent: ${packageRoot}`);
  const actual = packageFiles(packageRoot);
  if (JSON.stringify(actual) !== JSON.stringify(artifact.package_files)) fail('package file inventory or digest changed');
  if (treeDigest(actual) !== artifact.package_tree_sha256) fail('package tree digest changed');
}

function verifyCandidate({ sdkRoot, expected, artifact, artifactPath }) {
  if (artifact.package !== expected.package) fail(`artifact package is ${artifact.package}, expected ${expected.package}`);
  if (artifact.version !== expected.version) fail(`artifact version is ${artifact.version}, expected ${expected.version}`);
  if (artifact.package !== PACKAGE) fail(`only ${PACKAGE} is accepted`);
  if (artifact.version !== '0.84.3') fail(`only the accepted SDK version 0.84.3 is accepted`);

  const packageRoot = pathResolve(sdkRoot, 'node_modules', ...expected.package.split('/'));
  const packageJsonPath = join(packageRoot, 'package.json');
  if (!existsSync(packageJsonPath)) fail(`package.json is absent: ${packageJsonPath}`);
  const packageJson = readJson(packageJsonPath, 'package.json');
  if (packageJson.name !== expected.package) fail(`package name is ${packageJson.name}`);
  if (packageJson.version !== expected.version) fail(`package version is ${packageJson.version}`);
  if (packageJson.main !== './dist/index.js') fail(`unexpected package entrypoint ${packageJson.main}`);
  if (!existsSync(join(packageRoot, 'dist', 'index.js'))) fail('dist/index.js is absent');
  if (digestFile(packageJsonPath) !== artifact.package_json_sha256) fail('package.json digest changed');

  verifyPackageTree(packageRoot, artifact);
  const lockfile = join(sdkRoot, 'package-lock.json');
  if (artifact.package_lock_sha256 !== null) {
    if (!existsSync(lockfile)) fail('package-lock.json is absent');
    if (digestFile(lockfile) !== artifact.package_lock_sha256) fail('package-lock.json digest changed');
  }

  if (expected.registry_sha1 !== undefined && expected.registry_sha1 !== artifact.tarball_sha1) fail('artifact tarball SHA-1 does not match accepted registry provenance');
  if (expected.registry_integrity !== undefined && artifact.tarball_sha512 !== null) {
    const computedIntegrity = `sha512-${Buffer.from(artifact.tarball_sha512, 'hex').toString('base64')}`;
    if (expected.registry_integrity !== computedIntegrity) fail('artifact tarball integrity does not match accepted registry provenance');
  }
  if (expected.tarball_sha256 !== artifact.tarball_sha256 || expected.tarball_sha512 !== artifact.tarball_sha512) {
    fail('artifact tarball digest does not match the accepted provenance manifest');
  }
  if (artifact.tarball_path !== null) {
    const tarballPath = pathResolve(sdkRoot, artifact.tarball_path);
    if (!inside(dirname(sdkRoot), tarballPath) && !inside(sdkRoot, tarballPath)) fail('tarball path escapes the SDK artifact');
    if (!existsSync(tarballPath)) fail(`tarball is absent: ${tarballPath}`);
    if (digestFile(tarballPath, 'sha1') !== expected.registry_sha1) fail('tarball SHA-1 mismatch');
    if (digestFile(tarballPath) !== expected.tarball_sha256) fail('tarball SHA-256 mismatch');
    if (digestFile(tarballPath, 'sha512') !== expected.tarball_sha512) fail('tarball SHA-512 mismatch');
  } else if (expected.tarball_sha256 !== null || expected.tarball_sha512 !== null) {
    fail('accepted tarball digest exists but artifact has no tarball');
  }

  return { packageRoot, packageJson };
}

/**
 * Resolve only the canonical KAD SDK or an explicitly requested, equivalently
 * verified root. There is intentionally no global, /tmp, or PATH fallback.
 */
export function resolveVerifiedPiSdk({ root = process.cwd(), explicitRoot = process.env.KAD_PI_SDK_ROOT, manifestPath = null, manifest = null } = {}) {
  const expected = manifest ?? readJson(pathResolve(root, manifestPath ?? DEFAULT_MANIFEST), 'manifest');
  if (expected.package !== PACKAGE) fail(`manifest package is ${expected.package}`);
  if (expected.version !== '0.84.3') fail(`manifest version is ${expected.version}`);
  const sdkRoot = pathResolve(explicitRoot ?? pathResolve(root, expected.canonical_root));
  const artifactPath = pathResolve(sdkRoot, expected.artifact_manifest ?? 'sdk-artifact-manifest.json');
  if (!existsSync(artifactPath)) fail(`artifact manifest is absent: ${artifactPath}`);
  const actualArtifactHash = digestFile(artifactPath);
  if (actualArtifactHash !== expected.artifact_manifest_sha256) fail('artifact manifest digest mismatch');
  const artifact = readJson(artifactPath, 'artifact manifest');
  const { packageRoot, packageJson } = verifyCandidate({ sdkRoot, expected, artifact, artifactPath });
  const provenance = {
    package: packageJson.name,
    version: packageJson.version,
    sdkRoot,
    packageRoot,
    tarball_sha256: artifact.tarball_sha256,
    tarball_sha512: artifact.tarball_sha512,
    artifact_manifest_sha256: actualArtifactHash,
    provenance_status: 'CONFIRMED',
    reality_level: 'INTEGRATION',
  };
  return {
    sdkRoot,
    packageRoot,
    packageJson,
    artifact,
    provenance,
    receipt: { ...provenance },
  };
}