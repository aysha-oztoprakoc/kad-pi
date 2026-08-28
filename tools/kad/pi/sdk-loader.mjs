import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Default locations to search for the provenance-verified Pi SDK runtime.
 */
const DEFAULT_SDK_SEARCH_PATHS = [
  process.env.KAD_PI_SDK_ROOT,
  '/tmp/wp-kad-001-sdk/runtime',
  '/home/amdy/Work/kad-lab/exp-003-pi-tracer/node_modules/@earendil-works/pi-coding-agent'
].filter(Boolean);

/**
 * Resolves and verifies the official @earendil-works/pi-coding-agent SDK package.
 *
 * @param {string} [customSdkRoot]
 * @returns {Promise<{ sdk: object, packageJson: object, sdkRoot: string, packageRoot: string }>}
 */
export async function loadPiSdk(customSdkRoot = null) {
  const searchPaths = customSdkRoot ? [customSdkRoot] : DEFAULT_SDK_SEARCH_PATHS;
  let resolvedRoot = null;
  let packageRoot = null;

  for (const candidate of searchPaths) {
    if (!candidate) continue;

    // Check if candidate is the SDK root directory containing node_modules
    const directPackage = resolve(candidate, 'node_modules/@earendil-works/pi-coding-agent');
    if (existsSync(resolve(directPackage, 'package.json'))) {
      resolvedRoot = candidate;
      packageRoot = directPackage;
      break;
    }

    // Check if candidate is directly the package directory
    if (existsSync(resolve(candidate, 'package.json'))) {
      const pkg = JSON.parse(readFileSync(resolve(candidate, 'package.json'), 'utf8'));
      if (pkg.name === '@earendil-works/pi-coding-agent') {
        resolvedRoot = candidate;
        packageRoot = candidate;
        break;
      }
    }
  }

  if (!packageRoot) {
    throw new Error(
      `Could not locate provenance-verified @earendil-works/pi-coding-agent SDK. ` +
      `Please set KAD_PI_SDK_ROOT to the verified runtime directory (e.g. /tmp/wp-kad-001-sdk/runtime).`
    );
  }

  const packageJsonUrl = pathToFileURL(resolve(packageRoot, 'package.json')).href;
  const entrypointUrl = pathToFileURL(resolve(packageRoot, 'dist/index.js')).href;

  const packageJsonModule = await import(packageJsonUrl, { with: { type: 'json' } });
  const packageJson = packageJsonModule.default || packageJsonModule;

  // Provenance verification asserts
  assert.equal(
    packageJson.name,
    '@earendil-works/pi-coding-agent',
    `SDK package name must be @earendil-works/pi-coding-agent, got: ${packageJson.name}`
  );

  const sdk = await import(entrypointUrl);

  assert.equal(
    typeof sdk.createAgentSession,
    'function',
    'SDK must export createAgentSession function'
  );
  assert.equal(
    typeof sdk.SessionManager?.inMemory,
    'function',
    'SDK must export SessionManager.inMemory function'
  );

  return {
    sdk,
    packageJson,
    sdkRoot: resolvedRoot,
    packageRoot
  };
}

/**
 * Returns provenance metadata for the active SDK runtime.
 * @param {string} [customSdkRoot]
 * @returns {Promise<object>}
 */
export async function getSdkProvenance(customSdkRoot = null) {
  const { packageJson, sdkRoot, packageRoot } = await loadPiSdk(customSdkRoot);
  return {
    package: packageJson.name,
    version: packageJson.version,
    sdkRoot,
    packageRoot,
    provenance_status: 'CONFIRMED',
    reality_level: 'INTEGRATION'
  };
}
