import assert from 'node:assert/strict';
import { mkdirSync, lstatSync, readdirSync, readFileSync, readlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test, { after } from 'node:test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { Context } from '../../../tries/deepseek-harness-lab/vendor/cordis/lib/index.js';
import { mountKadPon } from '../src/pi-sdk-kad-pon.mjs';

const sdkRoot = process.env.KAD_PI_SDK_ROOT;
if (!sdkRoot) throw new Error('KAD_PI_SDK_ROOT must name the provenance-verified Pi SDK runtime');

const packageRoot = resolve(sdkRoot, 'node_modules/@earendil-works/pi-coding-agent');
const sdk = await import(pathToFileURL(resolve(packageRoot, 'dist/index.js')).href);
const packageJson = await import(pathToFileURL(resolve(packageRoot, 'package.json')).href, { with: { type: 'json' } });

assert.equal(packageJson.default.name, '@earendil-works/pi-coding-agent');
assert.equal(packageJson.default.version, '0.84.3');
assert.equal(typeof sdk.createAgentSession, 'function');
assert.equal(typeof sdk.SessionManager.inMemory, 'function');

const installedPiRoot = '/home/amdy/.local/share/mise/installs/pi/0.84.3/pi';
function distributionManifest(root, relative = '') {
  const directory = resolve(root, relative);
  return readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const entryRelative = relative ? `${relative}/${entry.name}` : entry.name;
      const entryPath = resolve(root, entryRelative);
      if (entry.isDirectory()) return distributionManifest(root, entryRelative);
      const stat = lstatSync(entryPath);
      if (entry.isSymbolicLink()) return [`L\t${entryRelative}\t${readlinkSync(entryPath)}`];
      if (entry.isFile()) return [`F\t${entryRelative}\t${stat.mode}\t${stat.size}\t${createHash('sha256').update(readFileSync(entryPath)).digest('hex')}`];
      return [`O\t${entryRelative}\t${stat.mode}`];
    });
}
const installedPiBefore = distributionManifest(installedPiRoot);
after(() => {
  assert.deepEqual(distributionManifest(installedPiRoot), installedPiBefore,
    'the integration must leave the complete mise-installed Pi 0.84.3 distribution untouched');
});

const agentDir = '/tmp/wp-kad-001-red-contract-agent';
mkdirSync(agentDir, { recursive: true });

async function createRealSdkFixture() {
  let networkProviderCalls = 0;
  let agentProviderBoundaryCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (...args) => {
    networkProviderCalls += 1;
    throw new Error(`provider/network invocation forbidden: ${String(args[0])}`);
  };

  const { session } = await sdk.createAgentSession({
    agentDir,
    cwd: '/tmp',
    sessionManager: sdk.SessionManager.inMemory(),
    noTools: 'all',
  });
  assert.equal(session.model?.provider, 'unknown', 'the real SDK fixture must not configure a provider');

  // Agent.streamFunction is Pi's actual provider-stream boundary. A model run
  // must cross it, so this test-only replacement fails closed before any SDK
  // provider abstraction can hide an invocation behind fetch.
  const realStreamFunction = session.agent.streamFunction;
  session.agent.streamFunction = (...args) => {
    agentProviderBoundaryCalls += 1;
    throw new Error(`provider stream invocation forbidden: ${String(args[0])}`);
  };

  let subscribeCalls = 0;
  let unsubscribeCalls = 0;
  let listenerReceipts = 0;
  const realSubscribe = session.subscribe.bind(session);
  session.subscribe = (listener) => {
    subscribeCalls += 1;
    const realUnsubscribe = realSubscribe((event) => {
      listenerReceipts += 1;
      return listener(event);
    });
    return () => {
      unsubscribeCalls += 1;
      return realUnsubscribe();
    };
  };

  return {
    session,
    modelCalls: () => ({ networkProviderCalls, agentProviderBoundaryCalls }),
    subscription: () => ({ subscribeCalls, unsubscribeCalls, listenerReceipts }),
    cleanup() {
      session.dispose();
      session.agent.streamFunction = realStreamFunction;
      globalThis.fetch = originalFetch;
    },
  };
}

function assertZeroModelCalls(fixture) {
  assert.deepEqual(fixture.modelCalls(), { networkProviderCalls: 0, agentProviderBoundaryCalls: 0 },
    'the fail-closed network and Agent provider-stream boundaries must both remain untouched');
}

function createHarness({ condition = (notification) => notification.payload.steering.includes('activate'), rule, sink } = {}) {
  const context = new Context();
  const journal = [];
  const observed = {
    adapterCallbacks: 0,
    notifications: [],
    conditionEvaluations: [],
    ruleActivations: 0,
    intents: [],
    sinkCalls: 0,
  };
  const resolvedRule = rule ?? ((notification) => ({
    id: `intent:${notification.id}`,
    type: 'kad.intent.record',
    source: 'kad-pon-rule',
    payload: { notificationId: notification.id },
    causationId: notification.id,
    correlationId: notification.correlationId,
  }));
  const resolvedSink = sink ?? ((intent) => {
    observed.sinkCalls += 1;
    return { acceptedIntentId: intent.id };
  });

  return {
    context,
    journal,
    observed,
    mount(session) {
      return mountKadPon({
        session,
        fiber: context.fiber,
        condition,
        rule(notification) {
          observed.ruleActivations += 1;
          return resolvedRule(notification);
        },
        sink(intent) {
          observed.intents.push(intent);
          return resolvedSink(intent);
        },
        journal,
        onAdapterCallback: () => { observed.adapterCallbacks += 1; },
        onNotification: (notification) => { observed.notifications.push(notification); },
        onCondition: (result) => { observed.conditionEvaluations.push(result); },
      });
    },
  };
}

async function steer(session, token) {
  await session.steer(token);
}

test('real Pi SDK queue_update translates once through the narrow PON causal path without a provider call', async () => {
  const fixture = await createRealSdkFixture();
  try {
    const harness = createHarness();
    const mounted = harness.mount(fixture.session);

    assert.equal(fixture.subscription().subscribeCalls, 1, 'mount must subscribe exactly once to the real SDK session');
    assert.ok(harness.context.fiber.getEffects().some(({ label }) => label === 'kad-pon.pi-sdk-subscription'),
      'the real SDK unsubscribe must be collected by a labeled Cordis Fiber.effect');

    await steer(fixture.session, 'activate');

    assert.equal(harness.observed.adapterCallbacks, 1, 'one real queue_update must reach the thin adapter once');
    assert.equal(harness.observed.notifications.length, 1, 'one adapter callback must produce one KadNotification');
    const [notification] = harness.observed.notifications;
    assert.deepEqual(Object.keys(notification).sort(), ['causationId', 'correlationId', 'id', 'payload', 'source', 'type'],
      'KadNotification must expose only its narrow typed transport fields');
    assert.equal(typeof notification.id, 'string');
    assert.equal(notification.type, 'pi.queue_update');
    assert.equal(notification.source, 'pi-sdk-0.84.3');
    assert.deepEqual(notification.payload.steering, ['activate']);
    assert.equal(notification.causationId, undefined);
    assert.equal(typeof notification.correlationId, 'string');
    assert.deepEqual(harness.observed.conditionEvaluations, [true], 'the relevant notification must evaluate C=true once');
    assert.equal(harness.observed.ruleActivations, 1, 'C=true must activate exactly one deterministic rule');
    assert.equal(harness.observed.intents.length, 1, 'the rule must yield exactly one typed ActionIntent');
    assert.deepEqual(Object.keys(harness.observed.intents[0]).sort(), ['causationId', 'correlationId', 'id', 'payload', 'source', 'type']);
    assert.equal(harness.observed.intents[0].type, 'kad.intent.record');
    assert.equal(harness.observed.sinkCalls, 1, 'the harmless sink must receive exactly one intended ActionIntent');
    assert.deepEqual(harness.journal.map(({ stage }) => stage),
      ['pi_sdk_event', 'kad_notification', 'condition_evaluation', 'rule_result', 'action_intent', 'sink_outcome'],
      'the append-only journal must reconstruct the complete causal chain');
    assertZeroModelCalls(fixture);

    await mounted.dispose();
  } finally {
    fixture.cleanup();
  }
});

test('false and irrelevant real SDK events never activate the target rule or sink', async () => {
  const fixture = await createRealSdkFixture();
  try {
    const harness = createHarness({ condition: (notification) => notification.payload.steering.includes('activate') });
    const mounted = harness.mount(fixture.session);

    await steer(fixture.session, 'ignore');
    assert.deepEqual(harness.observed.conditionEvaluations, [false], 'a relevant queue_update with C=false must be recorded as false');
    assert.equal(harness.observed.ruleActivations, 0, 'C=false must produce zero rule activations');
    assert.equal(harness.observed.intents.length, 0, 'C=false must produce zero ActionIntents');
    assert.equal(harness.observed.sinkCalls, 0, 'C=false must not invoke the sink');

    const beforeIrrelevant = structuredClone(harness.observed);
    const beforeIrrelevantReceipts = fixture.subscription().listenerReceipts;
    fixture.session.setSessionName('irrelevant-sdk-session-metadata');
    assert.equal(fixture.subscription().listenerReceipts, beforeIrrelevantReceipts + 1,
      'a distinct real SDK session_info_changed event must reach the actual subscription listener');
    assert.deepEqual(harness.observed, beforeIrrelevant,
      'the thin adapter must reject real non-queue_update SDK events before callback, notification, rule, intent, or sink work');
    assert.equal(harness.observed.ruleActivations, 0, 'an irrelevant real SDK notification must not activate the target rule');
    assert.equal(harness.observed.intents.length, 0, 'an irrelevant real SDK notification must produce zero ActionIntents');
    assert.equal(harness.observed.sinkCalls, 0, 'an irrelevant real SDK notification must not reach the sink');
    assertZeroModelCalls(fixture);

    await mounted.dispose();
  } finally {
    fixture.cleanup();
  }
});

test('Cordis-owned real unsubscribe produces post-dispose silence for the same real SDK event', async () => {
  const fixture = await createRealSdkFixture();
  try {
    const harness = createHarness();
    const mounted = harness.mount(fixture.session);
    await steer(fixture.session, 'activate');
    const before = structuredClone(harness.observed);

    await mounted.dispose();
    assert.equal(fixture.subscription().unsubscribeCalls, 1,
      'disposing the Cordis Fiber.effect must invoke the actual SDK unsubscribe exactly once');
    assert.equal(harness.context.fiber.getEffects().some(({ label }) => label === 'kad-pon.pi-sdk-subscription'), false,
      'the Cordis fiber must no longer retain the disposed subscription effect');

    await steer(fixture.session, 'activate');
    assert.equal(fixture.subscription().listenerReceipts, 1,
      'the actual Pi SDK listener itself must receive zero callbacks after its real unsubscribe');
    assert.deepEqual(harness.observed, before,
      'the same real SDK event after disposal must cause zero adapter, notification, rule, ActionIntent, and sink activity');
    assertZeroModelCalls(fixture);
  } finally {
    fixture.cleanup();
  }
});

test('rule and sink failures are journaled, not retried, and remain safely disposable through the explicit Cordis lifecycle', async (t) => {
  for (const [kind, options] of [
    ['rule', { rule: () => { throw new Error('injected rule failure'); } }],
    ['sink', { sink: () => { throw new Error('injected sink failure'); } }],
  ]) {
    await t.test(kind, async () => {
      const fixture = await createRealSdkFixture();
      try {
        const harness = createHarness(options);
        const mounted = harness.mount(fixture.session);
        await steer(fixture.session, 'activate');

        assert.equal(harness.observed.adapterCallbacks, 1, `${kind} failure must not leak/duplicate the adapter callback`);
        assert.equal(harness.observed.ruleActivations, 1, `${kind} failure must not be blindly retried`);
        assert.equal(harness.journal.at(-1).stage, `${kind}_failure`, `${kind} failure must be the terminal journal outcome`);
        assert.match(harness.journal.at(-1).error.message, new RegExp(`injected ${kind} failure`));
        assert.ok(harness.context.fiber.getEffects().some(({ label }) => label === 'kad-pon.pi-sdk-subscription'),
          `${kind} failure must leave the real subscription under the explicit Cordis effect lifecycle until disposal`);
        await mounted.dispose();
        assert.equal(fixture.subscription().unsubscribeCalls, 1, `${kind} failure must still clean up the actual SDK listener`);
        assertZeroModelCalls(fixture);
      } finally {
        fixture.cleanup();
      }
    });
  }
});
