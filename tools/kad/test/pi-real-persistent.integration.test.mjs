import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, existsSync, unlinkSync } from 'node:fs';

import { Context } from '../../../tries/deepseek-harness-lab/vendor/cordis/lib/index.js';
import { loadPiSdk } from '../pi/sdk-loader.mjs';
import { PersistentSession } from '../session.mjs';
import { PonEngine } from '../pon-engine.mjs';
import { mountPiPersistentSessionAdapter } from '../pi-adapter.mjs';
import { computeWorldHash } from '../world-model.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '../../..');
const TEST_AGENT_DIR = `/tmp/wp-kad-004-real-pi-test-agent-${Date.now()}`;
mkdirSync(TEST_AGENT_DIR, { recursive: true });

async function createRealPiSdkFixture() {
  const { sdk, packageJson, sdkRoot, packageRoot } = await loadPiSdk();

  let networkCalls = 0;
  let agentStreamCalls = 0;

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (...args) => {
    networkCalls++;
    throw new Error(`Forbidden network/provider invocation: ${String(args[0])}`);
  };

  const { session } = await sdk.createAgentSession({
    agentDir: TEST_AGENT_DIR,
    cwd: '/tmp',
    sessionManager: sdk.SessionManager.inMemory(),
    noTools: 'all'
  });

  // Guard agent stream boundary to ensure zero provider calls
  const originalStreamFunction = session.agent?.streamFunction;
  if (session.agent) {
    session.agent.streamFunction = (...args) => {
      agentStreamCalls++;
      throw new Error(`Forbidden agent stream invocation: ${String(args[0])}`);
    };
  }

  let subscribeCalls = 0;
  let unsubscribeCalls = 0;
  const originalSubscribe = session.subscribe.bind(session);

  session.subscribe = (listener) => {
    subscribeCalls++;
    const rawUnsub = originalSubscribe(listener);
    return () => {
      unsubscribeCalls++;
      return rawUnsub();
    };
  };

  return {
    sdk,
    session,
    packageJson,
    sdkRoot,
    packageRoot,
    getProviderCalls: () => ({ networkCalls, agentStreamCalls }),
    getSubscriptionStats: () => ({ subscribeCalls, unsubscribeCalls }),
    cleanup() {
      session.dispose();
      if (session.agent && originalStreamFunction) {
        session.agent.streamFunction = originalStreamFunction;
      }
      globalThis.fetch = originalFetch;
    }
  };
}

test('WP-KAD-004 Real Pi Harness Persistent World Runtime (INTEGRATION)', async (t) => {
  await t.test('1. Provenance & Fail-Closed Provider Isolation Verification', async () => {
    const fixture = await createRealPiSdkFixture();
    try {
      assert.equal(fixture.packageJson.name, '@earendil-works/pi-coding-agent');
      assert.equal(fixture.packageJson.version, '0.84.3');
      assert.equal(typeof fixture.sdk.createAgentSession, 'function');
      assert.equal(typeof fixture.session.subscribe, 'function');
      assert.equal(typeof fixture.session.steer, 'function');
      assert.deepEqual(fixture.getProviderCalls(), { networkCalls: 0, agentStreamCalls: 0 });
    } finally {
      fixture.cleanup();
    }
  });

  await t.test('2. Sequential Real Pi Steer Multi-Turn Persistent State Continuity', async () => {
    const fixture = await createRealPiSdkFixture();
    const journalPath = resolve(`/tmp/wp004-real-journal-${Date.now()}.jsonl`);

    try {
      const pon = new PonEngine();
      let alarmEvaluations = 0;
      let crateSensorEvaluations = 0;

      // Subscribed to Key changes
      pon.registerRule({
        id: 'rule-keycard-alarm',
        name: 'Vault Keycard Sensor',
        premises: ['KeyRoom', 'entity:key:location'],
        condition: (diff) => {
          alarmEvaluations++;
          return diff.some(d => d.field === 'KeyRoom' && d.after === 'held');
        },
        action: () => ({ event_type: 'FACILITY_KEYCARD_ENGAGED' })
      });

      // Subscribed to Crate changes (should NOT be evaluated when key moves)
      pon.registerRule({
        id: 'rule-crate-sensor',
        name: 'Heavy Crate Sensor',
        premises: ['CrateRoom', 'entity:crate:location'],
        condition: () => {
          crateSensorEvaluations++;
          return false;
        },
        action: () => ({ event_type: 'CRATE_MOVED' })
      });

      const context = new Context();
      const persistentSession = new PersistentSession({
        sessionId: 'real-pi-persistent-session-001',
        journalPath,
        ponEngine: pon
      });

      const turnResults = [];
      const adapter = mountPiPersistentSessionAdapter({
        session: fixture.session,
        context,
        fiber: context.fiber,
        persistentSession,
        onTurnComplete: (res) => {
          turnResults.push(res);
        }
      });

      assert.equal(fixture.getSubscriptionStats().subscribeCalls, 1, 'Mount must subscribe to real SDK session');
      assert.ok(
        context.fiber.getEffects().some(({ label }) => label === 'kad-pon.pi-persistent-subscription'),
        'Subscription must be tracked under Cordis Fiber effect'
      );

      // Turn 1: Real SDK steer -> acquire key
      await fixture.session.steer('acquire key');
      assert.equal(turnResults.length, 1);
      assert.equal(turnResults[0].turn_index, 1);
      assert.equal(turnResults[0].accepted, true);
      assert.equal(turnResults[0].world_state.entities.key.held_by, 'player');
      assert.equal(alarmEvaluations, 1, 'Keycard rule must evaluate condition');
      assert.equal(crateSensorEvaluations, 0, 'Crate sensor rule must NOT evaluate condition (PON selectivity)');

      // Turn 2: Real SDK steer -> move room_b
      await fixture.session.steer('move room_b');
      assert.equal(turnResults.length, 2);
      assert.equal(turnResults[1].turn_index, 2);
      assert.equal(turnResults[1].accepted, true);
      assert.equal(turnResults[1].state_before_hash, turnResults[0].state_after_hash, 'Turn 2 before must equal Turn 1 after');
      assert.equal(turnResults[1].world_state.entities.player.location, 'room_b');
      assert.equal(turnResults[1].world_state.entities.key.held_by, 'player');

      // Turn 3: Real SDK steer -> move room_a
      await fixture.session.steer('move room_a');
      assert.equal(turnResults.length, 3);
      assert.equal(turnResults[2].turn_index, 3);
      assert.equal(turnResults[2].accepted, true);
      assert.equal(turnResults[2].state_before_hash, turnResults[1].state_after_hash, 'Turn 3 before must equal Turn 2 after');
      assert.equal(turnResults[2].world_state.entities.player.location, 'room_a');

      // Assert zero provider calls
      assert.deepEqual(fixture.getProviderCalls(), { networkCalls: 0, agentStreamCalls: 0 });

      // Teardown via adapter
      await adapter.dispose();
      assert.equal(fixture.getSubscriptionStats().unsubscribeCalls, 1, 'Disposing adapter must invoke real SDK unsubscribe');

      // Post-dispose steer event must be completely silent
      await fixture.session.steer('move room_b');
      assert.equal(turnResults.length, 3, 'Zero events should be processed after disposal');
      assert.equal(persistentSession.worldState.entities.player.location, 'room_a', 'World state must not mutate post-dispose');
    } finally {
      fixture.cleanup();
      if (existsSync(journalPath)) unlinkSync(journalPath);
    }
  });

  await t.test('3. Real Failure Test PI-F1: Irrelevant SDK Event Rejected Early', async () => {
    const fixture = await createRealPiSdkFixture();
    try {
      const context = new Context();
      const persistentSession = new PersistentSession({ sessionId: 'f1-session' });
      const beforeHash = computeWorldHash(persistentSession.worldState);

      let callbacks = 0;
      const adapter = mountPiPersistentSessionAdapter({
        session: fixture.session,
        context,
        persistentSession,
        onTurnComplete: () => { callbacks++; }
      });

      // Trigger a real non-queue_update event (session_info_changed)
      fixture.session.setSessionName('irrelevant-session-metadata');

      assert.equal(callbacks, 0, 'Irrelevant event must be rejected before turn execution');
      assert.equal(persistentSession.turnIndex, 0);
      assert.equal(computeWorldHash(persistentSession.worldState), beforeHash);

      await adapter.dispose();
    } finally {
      fixture.cleanup();
    }
  });

  await t.test('4. Real Failure Test PI-F2: Deterministic Rejection Through Real Pi Steer', async () => {
    const fixture = await createRealPiSdkFixture();
    try {
      const context = new Context();
      const persistentSession = new PersistentSession({ sessionId: 'f2-session' });
      const beforeHash = computeWorldHash(persistentSession.worldState);

      const turnResults = [];
      const adapter = mountPiPersistentSessionAdapter({
        session: fixture.session,
        context,
        persistentSession,
        onTurnComplete: (res) => turnResults.push(res)
      });

      // Steer unsupported command
      await fixture.session.steer('teleport to the moon');

      assert.equal(turnResults.length, 1);
      assert.equal(turnResults[0].accepted, false);
      assert.equal(turnResults[0].status, 'rejected');
      assert.equal(turnResults[0].state_before_hash, beforeHash);
      assert.equal(turnResults[0].state_after_hash, beforeHash);
      assert.equal(computeWorldHash(persistentSession.worldState), beforeHash, 'World state strictly invariant');

      await adapter.dispose();
    } finally {
      fixture.cleanup();
    }
  });

  await t.test('5. Real Failure Test PI-F3: PON Rule Failure Handled Without Session Disruption', async () => {
    const fixture = await createRealPiSdkFixture();
    try {
      const pon = new PonEngine();
      pon.registerRule({
        id: 'failing-rule',
        name: 'Faulty Rule',
        premises: ['KeyRoom', 'entity:key:location'],
        condition: () => true,
        action: () => {
          throw new Error('INJECTED_PON_RULE_ERROR');
        }
      });

      const context = new Context();
      const persistentSession = new PersistentSession({
        sessionId: 'f3-session',
        ponEngine: pon
      });

      const turnResults = [];
      const adapter = mountPiPersistentSessionAdapter({
        session: fixture.session,
        context,
        persistentSession,
        onTurnComplete: (res) => turnResults.push(res)
      });

      // Should complete turn without unhandled exception crashing the adapter
      await fixture.session.steer('acquire key');
      assert.equal(turnResults.length, 1);
      assert.equal(turnResults[0].accepted, true);
      assert.equal(turnResults[0].world_state.entities.key.held_by, 'player');

      await adapter.dispose();
    } finally {
      fixture.cleanup();
    }
  });

  await t.test('6. Real Failure Test PI-F4: Journal Commit Failure Prevents State Advance (NO JOURNAL -> NO COMMIT)', async () => {
    const fixture = await createRealPiSdkFixture();
    try {
      const context = new Context();
      const persistentSession = new PersistentSession({ sessionId: 'f4-session' });
      const beforeHash = computeWorldHash(persistentSession.worldState);

      const adapter = mountPiPersistentSessionAdapter({
        session: fixture.session,
        context,
        persistentSession
      });

      // Inject failing journal directly into executeTurn options
      const originalExecuteTurn = persistentSession.executeTurn.bind(persistentSession);
      persistentSession.executeTurn = (input) => {
        return originalExecuteTurn(input, {
          journalAppender: () => {
            throw new Error('INJECTED_PI_JOURNAL_FAIL');
          }
        });
      };

      // When steer fires, executeTurn throws synchronously inside the subscriber, rejecting session.steer()
      await assert.rejects(
        () => fixture.session.steer('acquire key'),
        /INJECTED_PI_JOURNAL_FAIL/
      );

      // The external persistent session world state did NOT advance to 'held'
      assert.equal(persistentSession.worldState.entities.key.location, 'room_a');
      assert.equal(persistentSession.worldState.entities.key.held_by, null);
      assert.equal(computeWorldHash(persistentSession.worldState), beforeHash);

      await adapter.dispose();
    } finally {
      fixture.cleanup();
    }
  });
});
