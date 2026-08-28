import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, unlinkSync, existsSync } from 'node:fs';

import {
  PersistentSession,
  PonEngine,
  StcScope,
  createDeclarativeWorld,
  computeWorldHash,
  replayJournal,
  generateTurnDataset,
  mountPiPersistentSessionAdapter
} from '../index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '../../..');
const TEST_SESSION_JOURNAL = resolve('/tmp/kad-session-journal-' + Date.now() + '.jsonl');

test('WP-KAD-003 Persistent Multi-Turn World + PON Causal Reaction Graph', async (t) => {
  t.after(() => {
    if (existsSync(TEST_SESSION_JOURNAL)) {
      unlinkSync(TEST_SESSION_JOURNAL);
    }
  });

  await t.test('Lane A & B — Multi-turn persistent state continuity (turn N state_after == turn N+1 state_before)', () => {
    const session = new PersistentSession({
      sessionId: 'test-session-001',
      journalPath: TEST_SESSION_JOURNAL
    });

    // Turn 1: Acquire key in room_a
    const t1 = session.executeTurn('acquire key');
    assert.equal(t1.accepted, true);
    assert.equal(t1.turn_index, 1);
    assert.equal(t1.world_state.entities.key.held_by, 'player');
    assert.equal(t1.world_state.entities.player.location, 'room_a');

    // Turn 2: Move to room_b while holding key
    const t2 = session.executeTurn('move room_b');
    assert.equal(t2.accepted, true);
    assert.equal(t2.turn_index, 2);
    // Crucial state continuity invariant:
    assert.equal(t2.state_before_hash, t1.state_after_hash, 'Turn 2 state_before must equal Turn 1 state_after');
    assert.equal(t2.world_state.entities.player.location, 'room_b');
    assert.equal(t2.world_state.entities.key.held_by, 'player', 'Player must still hold the key in room_b');

    // Turn 3: Rejected action (teleport moon)
    const t3 = session.executeTurn('teleport to the moon');
    assert.equal(t3.accepted, false);
    assert.equal(t3.turn_index, 3);
    assert.equal(t3.state_before_hash, t2.state_after_hash);
    assert.equal(t3.state_after_hash, t2.state_after_hash, 'Rejected action must leave world state hash invariant');
    assert.equal(t3.world_state.entities.player.location, 'room_b');

    // Turn 4: Move back to room_a
    const t4 = session.executeTurn('move room_a');
    assert.equal(t4.accepted, true);
    assert.equal(t4.turn_index, 4);
    assert.equal(t4.state_before_hash, t3.state_after_hash);
    assert.equal(t4.world_state.entities.player.location, 'room_a');
  });

  await t.test('Lane C — PON Selective Premise Evaluation (Evaluates affected premises ONLY; never scans all rules)', () => {
    const pon = new PonEngine();
    let alarmEvaluated = false;
    let crateSensorEvaluated = false;
    let healthAlertEvaluated = false;

    // Rule 1: Subscribed to KeyRoom changes
    pon.registerRule({
      id: 'rule-key-alarm',
      name: 'Vault Key Alarm',
      premises: ['KeyRoom', 'entity:key:location'],
      condition: (diff, state) => {
        alarmEvaluated = true;
        return diff.some(d => d.field === 'KeyRoom' && d.after === 'held');
      },
      action: () => ({ event_type: 'SECURITY_ALARM_TRIPPED', severity: 'HIGH' })
    });

    // Rule 2: Subscribed to Crate changes
    pon.registerRule({
      id: 'rule-crate-sensor',
      name: 'Heavy Crate Weight Sensor',
      premises: ['CrateRoom', 'entity:crate:location'],
      condition: (diff, state) => {
        crateSensorEvaluated = true;
        return false;
      },
      action: () => ({ event_type: 'CRATE_MOVED' })
    });

    // Rule 3: Subscribed to Player Health changes
    pon.registerRule({
      id: 'rule-health-alert',
      name: 'Biometric Monitor Alert',
      premises: ['entity:player:properties:health'],
      condition: (diff, state) => {
        healthAlertEvaluated = true;
        return false;
      },
      action: () => ({ event_type: 'CRITICAL_VITALS' })
    });

    const world = createDeclarativeWorld();
    // Simulate StateDiff modifying ONLY KeyRoom
    const diff = [{ field: 'KeyRoom', before: 'room_a', after: 'held' }];

    const reactions = pon.processStateDiff(diff, world);

    // Assert Selectivity:
    assert.equal(alarmEvaluated, true, 'Rule 1 premise MUST be evaluated');
    assert.equal(crateSensorEvaluated, false, 'Rule 2 premise MUST NOT be evaluated when crate did not change');
    assert.equal(healthAlertEvaluated, false, 'Rule 3 premise MUST NOT be evaluated when health did not change');

    assert.equal(reactions.length, 1);
    assert.equal(reactions[0].event_type, 'SECURITY_ALARM_TRIPPED');

    const metrics = pon.getMetrics();
    assert.equal(metrics.evaluated_premises_count, 1);
    assert.equal(metrics.unaffected_rules_skipped, 2, 'Must prove 2 unaffected rules were skipped without condition evaluation');
    assert.equal(metrics.activated_rules_count, 1);
  });

  await t.test('Lane D — STC Lifecycle Ownership & Reverse Order Teardown (LIFO)', async () => {
    const rootScope = new StcScope('root-world');
    const childScope = rootScope.createChild('zone-room-a');

    const teardownOrder = [];

    // Effect 1 on root
    rootScope.registerEffect('root-power-grid', () => {
      teardownOrder.push('root-power-grid');
    });

    // Effect 2 on child
    childScope.registerEffect('room-a-camera-feed', () => {
      teardownOrder.push('room-a-camera-feed');
    });

    // Effect 3 on child
    childScope.registerEffect('room-a-door-lock', () => {
      teardownOrder.push('room-a-door-lock');
    });

    assert.equal(childScope.activeEffectsCount, 2);
    assert.equal(rootScope.activeEffectsCount, 1);

    // Dispose root scope
    await rootScope.dispose();

    // Invariant: Dependents teardown before dependencies, and effects unwind in LIFO order:
    // child effects: door-lock (last) -> camera-feed (first) -> root effect: power-grid
    assert.deepEqual(teardownOrder, [
      'room-a-door-lock',
      'room-a-camera-feed',
      'root-power-grid'
    ]);

    assert.equal(rootScope.active, false);
    assert.equal(childScope.active, false);
  });

  await t.test('Lane E — Deterministic Multi-Turn Journal Replay', () => {
    const replayJournalPath = resolve('/tmp/kad-replay-test-' + Date.now() + '.jsonl');
    try {
      const session = new PersistentSession({
        sessionId: 'session-for-replay',
        journalPath: replayJournalPath
      });

      session.executeTurn('acquire key');
      session.executeTurn('move room_b');
      session.executeTurn('teleport moon'); // rejected
      session.executeTurn('move room_a');

      // Now replay the entire multi-turn sequence
      const replayReport = replayJournal(replayJournalPath);

      assert.equal(replayReport.verified, true);
      assert.equal(replayReport.turns_replayed, 4);
      assert.equal(replayReport.details.length, 4);
      assert.ok(replayReport.details.every(d => d.match_before && d.match_after && d.match_status));
    } finally {
      if (existsSync(replayJournalPath)) unlinkSync(replayJournalPath);
    }
  });

  await t.test('Lane F — Evidence Dataset Generation', () => {
    const datasetJournalPath = resolve('/tmp/kad-ds-journal-' + Date.now() + '.jsonl');
    const datasetOutputPath = resolve('/tmp/kad-dataset-out-' + Date.now() + '.jsonl');

    try {
      const session = new PersistentSession({
        sessionId: 'session-for-ds',
        journalPath: datasetJournalPath
      });

      session.executeTurn('acquire key');
      session.executeTurn('move room_b');

      const rows = generateTurnDataset(datasetJournalPath, datasetOutputPath);
      assert.equal(rows.length, 2);

      const [row1, row2] = rows;
      assert.ok(row1.dataset_id);
      assert.equal(row1.turn_index, 1);
      assert.equal(row1.input_text, 'acquire key');
      assert.equal(row1.validation_status, 'accepted');
      assert.equal(row1.resolution.event_kind, 'ObjectAcquired');

      assert.equal(row2.turn_index, 2);
      assert.equal(row2.input_text, 'move room_b');
      assert.equal(row2.resolution.event_kind, 'PlayerMoved');

      assert.ok(existsSync(datasetOutputPath));
    } finally {
      if (existsSync(datasetJournalPath)) unlinkSync(datasetJournalPath);
      if (existsSync(datasetOutputPath)) unlinkSync(datasetOutputPath);
    }
  });

  await t.test('Lane G — Pi SDK Session Persistent Adapter & Teardown Silence (SIMULATED)', async () => {
    let subscriberCallback = null;
    let unsubscribed = false;

    const mockSession = {
      subscribe(fn) {
        subscriberCallback = fn;
        return () => {
          unsubscribed = true;
          subscriberCallback = null;
        };
      }
    };

    const session = new PersistentSession({ sessionId: 'pi-persistent-test' });
    const turnedResults = [];

    const adapter = mountPiPersistentSessionAdapter({
      session: mockSession,
      persistentSession: session,
      onTurnComplete: (res) => turnedResults.push(res)
    });

    assert.ok(subscriberCallback, 'Adapter must subscribe');

    // Turn 1
    subscriberCallback({
      type: 'queue_update',
      steering: ['acquire key']
    });
    assert.equal(turnedResults.length, 1);
    assert.equal(turnedResults[0].world_state.entities.key.held_by, 'player');

    // Turn 2
    subscriberCallback({
      type: 'queue_update',
      steering: ['move room_b']
    });
    assert.equal(turnedResults.length, 2);
    assert.equal(turnedResults[1].world_state.entities.player.location, 'room_b');
    assert.equal(turnedResults[1].world_state.entities.key.held_by, 'player');

    // Dispose
    await adapter.dispose();
    assert.equal(unsubscribed, true);

    // Post-dispose event must be silent
    if (subscriberCallback) {
      subscriberCallback({
        type: 'queue_update',
        steering: ['move room_a']
      });
    }
    assert.equal(turnedResults.length, 2, 'No events should be processed after disposal');
  });

  await t.test('Lane H — Adversarial Attacks & Resilience', async () => {
    // Attack 1: Over-notification prevention
    const pon = new PonEngine();
    let triggered = false;
    pon.registerRule({
      id: 'isolated-rule',
      name: 'Isolated Rule',
      premises: ['non_existent_fact'],
      condition: () => { triggered = true; return true; },
      action: () => ({ type: 'SHOULD_NOT_FIRE' })
    });

    const events = pon.processStateDiff([{ field: 'KeyRoom', before: 'room_a', after: 'held' }], createDeclarativeWorld());
    assert.equal(triggered, false, 'Isolated rule must not be triggered by unrelated diff');
    assert.equal(events.length, 0);

    // Attack 2: Inactive scope rejects new effect registration
    const scope = new StcScope('test-inactive');
    await scope.dispose();
    assert.throws(() => {
      scope.registerEffect('leak-effect', () => {});
    }, /Cannot register effect.*inactive scope/);
  });
});
