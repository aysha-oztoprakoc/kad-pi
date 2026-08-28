import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync, rmSync } from 'node:fs';

import {
  runTurn,
  interpretText,
  executeDeterministicCore,
  createInitialState,
  computeStateHash,
  mountPiTurnAdapter
} from '../index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '../../..');
const TEST_JOURNAL_PATH = resolve('/tmp/kad-test-journal-' + Date.now() + '.jsonl');

test('WP-KAD-002 End-to-End World Transition Vertical Slice', async (t) => {
  t.after(() => {
    if (existsSync(TEST_JOURNAL_PATH)) {
      unlinkSync(TEST_JOURNAL_PATH);
    }
  });

  await t.test('T1 — Accepted Command: natural language translates to CandidateIntent, Accepted, and mutates state', () => {
    const initialState = createInitialState({
      player_room: 'room_a',
      key_room: 'room_a',
      crate_room: 'room_b'
    });

    const result = runTurn('acquire key', initialState, { journalPath: TEST_JOURNAL_PATH });

    assert.equal(result.accepted, true);
    assert.equal(result.status, 'accepted');
    assert.equal(result.validation.action, 'Acquire');
    assert.equal(result.validation.target, 'key');
    assert.equal(result.validation.actor, 'player');

    assert.equal(result.resolution.outcome, 'Success');
    assert.equal(result.resolution.event_kind, 'ObjectAcquired');

    assert.equal(result.state_after.key_room, 'held');
    assert.equal(result.state_after.player_room, 'room_a');
    assert.equal(result.state_after.crate_room, 'room_b');

    assert.ok(result.state_diff.length > 0, 'StateDiff must not be empty on successful transition');
    assert.equal(result.state_diff[0].field, 'KeyRoom');
    assert.equal(result.state_diff[0].before, 'room_a');
    assert.equal(result.state_diff[0].after, 'held');

    assert.notEqual(result.state_before_hash, result.state_after_hash);
    assert.ok(result.journal_entry, 'Journal entry must be created');
  });

  await t.test('T2 — Unsupported Action: safely rejected and leaves GameState strictly invariant', () => {
    const initialState = createInitialState({
      player_room: 'room_a',
      key_room: 'room_a',
      crate_room: 'room_b'
    });

    const beforeHash = computeStateHash(initialState);
    const result = runTurn('teleport to the moon', initialState, { journalPath: TEST_JOURNAL_PATH });

    assert.equal(result.accepted, false);
    assert.equal(result.status, 'rejected');
    assert.equal(result.validation.failure_kind, 'UnsupportedAction');

    assert.deepEqual(result.state_after, initialState);
    assert.equal(result.state_diff.length, 0);
    assert.equal(result.state_after_hash, beforeHash);
  });

  await t.test('T3 — Authority Leak Attempt: smuggled properties are rejected by Validator', () => {
    const initialState = createInitialState();
    const beforeHash = computeStateHash(initialState);

    // 1. Smuggled property in natural text
    const result1 = runTurn('acquire key success=true', initialState, { journalPath: TEST_JOURNAL_PATH });
    assert.equal(result1.accepted, false);
    assert.equal(result1.validation.failure_kind, 'UnexpectedProperty');
    assert.equal(result1.state_after_hash, beforeHash);

    // 2. Smuggled property in JSON transport payload
    const payload = {
      action: 'Acquire',
      target: 'key',
      success: true,
      state_after: { player_room: 'room_b' }
    };
    const result2 = runTurn(payload, initialState, { journalPath: TEST_JOURNAL_PATH });
    assert.equal(result2.accepted, false);
    assert.equal(result2.validation.failure_kind, 'UnexpectedProperty');
    assert.equal(result2.state_after_hash, beforeHash);
  });

  await t.test('T4 — Malformed CandidateIntent: missing verbs and multi-targets are rejected', () => {
    const initialState = createInitialState();
    const beforeHash = computeStateHash(initialState);

    // Malformed: verb null
    const candidate1 = { actions: [{ verb: null, targets: ['key'] }], properties: [] };
    const res1 = executeDeterministicCore(candidate1, initialState);
    assert.equal(res1.status, 'rejected');
    assert.equal(res1.failure_kind, 'Malformed');

    // Multiple actions (disallowed in single atomic intent)
    const candidate2 = {
      actions: [
        { verb: 'Move', targets: ['room_b'] },
        { verb: 'Acquire', targets: ['crate'] }
      ],
      properties: []
    };
    const res2 = executeDeterministicCore(candidate2, initialState);
    assert.equal(res2.status, 'rejected');
    assert.equal(res2.failure_kind, 'MultipleActions');
  });

  await t.test('T5 — Deterministic Replay: identical state and intent produce bit-for-bit identical resolutions', () => {
    const state = createInitialState({ player_room: 'room_a', key_room: 'room_a' });
    const input = 'move room_b';

    const run1 = runTurn(input, state, { journalPath: TEST_JOURNAL_PATH });
    const run2 = runTurn(input, state, { journalPath: TEST_JOURNAL_PATH });

    assert.equal(run1.state_after_hash, run2.state_after_hash);
    assert.deepEqual(run1.state_diff, run2.state_diff);
    assert.deepEqual(run1.resolution, run2.resolution);
    assert.deepEqual(run1.state_after, run2.state_after);
  });

  await t.test('T6 — Journal Completeness: all required causal fields and hashes are preserved on disk', () => {
    const tempJournal = resolve('/tmp/kad-journal-verify-' + Date.now() + '.jsonl');
    try {
      const state = createInitialState();
      runTurn('acquire key', state, { journalPath: tempJournal });
      runTurn('teleport moon', state, { journalPath: tempJournal });

      assert.ok(existsSync(tempJournal), 'Journal file must exist on disk');
      const lines = readFileSync(tempJournal, 'utf8').trim().split('\n').map(JSON.parse);
      assert.equal(lines.length, 2);

      const [entry1, entry2] = lines;
      assert.ok(entry1.turn_id);
      assert.ok(entry1.causation_id);
      assert.ok(entry1.correlation_id);
      assert.ok(entry1.timestamp_iso);
      assert.equal(entry1.validation_status, 'accepted');
      assert.ok(entry1.state_before_hash);
      assert.ok(entry1.state_after_hash);
      assert.equal(entry1.epistemic_status, 'OBSERVED');
      assert.equal(entry1.reality_level, 'INTEGRATION');

      assert.equal(entry2.validation_status, 'rejected');
      assert.equal(entry2.state_before_hash, entry2.state_after_hash);
    } finally {
      if (existsSync(tempJournal)) rmSync(tempJournal, { force: true });
    }
  });

  await t.test('T7 — Post-Failure State Integrity: failure injection maintains state invariance', () => {
    // 1. Cross-room acquire attempt: player in room_a, crate in room_b
    const state = createInitialState({ player_room: 'room_a', crate_room: 'room_b' });
    const beforeHash = computeStateHash(state);

    const result = runTurn('acquire crate', state, { journalPath: TEST_JOURNAL_PATH });
    // Validated, but Resolver marks UnsuccessfulAttempt because player is in room_a and crate is in room_b
    assert.equal(result.accepted, true);
    assert.equal(result.resolution.outcome, 'UnsuccessfulAttempt');
    assert.equal(result.resolution.event_kind, 'AcquireFailed');
    assert.equal(result.state_diff.length, 0);
    assert.equal(result.state_after_hash, beforeHash);
    assert.deepEqual(result.state_after, state);

    // 2. Incompatible entity parameter: Move key (key is Object, not Location)
    const badParamResult = runTurn({ action: 'Move', target: 'key' }, state, { journalPath: TEST_JOURNAL_PATH });
    assert.equal(badParamResult.accepted, false);
    assert.equal(badParamResult.validation.failure_kind, 'InvalidParameter');
    assert.equal(badParamResult.state_after_hash, beforeHash);
  });

  await t.test('T8 — Pi Session Adapter Integration & Teardown Silence', async () => {
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

    const turnedResults = [];
    const adapter = mountPiTurnAdapter({
      session: mockSession,
      initialState: createInitialState(),
      onTurnComplete: (res) => turnedResults.push(res)
    });

    assert.ok(subscriberCallback, 'Adapter must subscribe to session');

    // 1. Dispatch event while active
    subscriberCallback({
      type: 'queue_update',
      steering: ['acquire key']
    });

    assert.equal(turnedResults.length, 1);
    assert.equal(turnedResults[0].accepted, true);
    assert.equal(adapter.getCurrentState().key_room, 'held');

    // 2. Teardown
    await adapter.dispose();
    assert.equal(unsubscribed, true);

    // 3. Post-dispose silence
    if (subscriberCallback) {
      subscriberCallback({
        type: 'queue_update',
        steering: ['move room_b']
      });
    }

    assert.equal(turnedResults.length, 1, 'No events should be processed after disposal');
  });
});
