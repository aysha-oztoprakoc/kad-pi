import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolveVerifiedPiSdk } from './sdk-resolver.mjs';

/**
 * Load the accepted Pi SDK from KAD's canonical, content-verified runtime.
 * An explicit root is permitted only when it carries the same provenance
 * receipt; there is no global, PATH, or ephemeral /tmp fallback.
 *
 * @param {string|null} [customSdkRoot]
 * @returns {Promise<{ sdk: object, packageJson: object, sdkRoot: string, packageRoot: string, provenance: object }>}
 */
export async function loadPiSdk(customSdkRoot = null) {
  const resolved = resolveVerifiedPiSdk({ explicitRoot: customSdkRoot || undefined });
  const sdk = await import(pathToFileURL(`${resolved.packageRoot}/dist/index.js`).href);

  assert.equal(typeof sdk.createAgentSession, 'function', 'SDK must export createAgentSession function');
  assert.equal(typeof sdk.SessionManager?.inMemory, 'function', 'SDK must export SessionManager.inMemory function');

  return {
    sdk,
    packageJson: resolved.packageJson,
    sdkRoot: resolved.sdkRoot,
    packageRoot: resolved.packageRoot,
    provenance: resolved.provenance,
  };
}

/**
 * Returns provenance metadata for the active SDK runtime.
 * @param {string|null} [customSdkRoot]
 * @returns {Promise<object>}
 */
export async function getSdkProvenance(customSdkRoot = null) {
  const { provenance } = await loadPiSdk(customSdkRoot);
  return provenance;
}
