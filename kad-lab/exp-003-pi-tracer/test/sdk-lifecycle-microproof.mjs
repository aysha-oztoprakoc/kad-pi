import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sdkRoot = process.env.KAD_PI_SDK_ROOT;
const output = process.env.KAD_PI_MICROPROOF_OUTPUT;

if (!sdkRoot || !output) throw new Error('KAD_PI_SDK_ROOT and KAD_PI_MICROPROOF_OUTPUT are required');

const packageRoot = resolve(sdkRoot, 'node_modules/@earendil-works/pi-coding-agent');
const sdk = await import(pathToFileURL(resolve(packageRoot, 'dist/index.js')).href);
const packageJson = await import(pathToFileURL(resolve(packageRoot, 'package.json')).href, { with: { type: 'json' } });

assert.equal(packageJson.default.name, '@earendil-works/pi-coding-agent');
assert.equal(packageJson.default.version, '0.84.3');
assert.equal(typeof sdk.createAgentSession, 'function');
assert.equal(typeof sdk.SessionManager.inMemory, 'function');

let providerCalls = 0;
const originalFetch = globalThis.fetch;
globalThis.fetch = async (...args) => {
  providerCalls += 1;
  throw new Error(`provider/network invocation forbidden: ${String(args[0])}`);
};

try {
  const agentDir = '/tmp/wp-kad-001-sdk-microproof-agent';
  mkdirSync(agentDir, { recursive: true });
  const { session } = await sdk.createAgentSession({
    agentDir,
    cwd: '/tmp',
    sessionManager: sdk.SessionManager.inMemory(),
    noTools: 'all',
  });

  assert.equal(session.model?.provider, 'unknown', 'micro-proof must not use a configured provider model');
  assert.equal(typeof session.subscribe, 'function');
  assert.equal(typeof session.dispose, 'function');

  let callbackCount = 0;
  const events = [];
  const unsubscribe = session.subscribe((event) => {
    if (event.type === 'queue_update') {
      callbackCount += 1;
      events.push({ type: event.type, steering: event.steering, followUp: event.followUp });
    }
  });

  await session.steer('kad-sdk-lifecycle-token');
  assert.equal(callbackCount, 1, 'first SDK steer must reach the real subscribed listener exactly once');
  unsubscribe();
  await session.steer('kad-sdk-lifecycle-token');
  assert.equal(callbackCount, 1, 'same SDK event after unsubscribe must not reach listener');
  assert.equal(providerCalls, 0, 'zero provider/network invocations are fail-closed');

  session.dispose();
  writeFileSync(output, `${JSON.stringify({
    package: packageJson.default.name,
    version: packageJson.default.version,
    event: events[0],
    callbackCount,
    providerCalls,
    model: session.model ? { provider: session.model.provider, id: session.model.id } : null,
    unsubscribeType: typeof unsubscribe,
    disposed: true,
  })}\n`);
} finally {
  globalThis.fetch = originalFetch;
}
