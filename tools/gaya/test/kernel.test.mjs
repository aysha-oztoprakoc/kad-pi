import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, computeStateHash, cloneState } from '../kernel/state.mjs';
import { validateCommand } from '../kernel/validator.mjs';
import { EventLedger } from '../kernel/ledger.mjs';
import { executeCommand, applyTick } from '../kernel/transition.mjs';

test('Kernel - Deterministic State Hashing', () => {
  const s1 = createInitialState({ seed: 42 });
  const s2 = createInitialState({ seed: 42 });

  const h1 = computeStateHash(s1);
  const h2 = computeStateHash(s2);

  assert.equal(h1, h2, 'Identical initial states produce identical SHA256 hash');
  assert.equal(typeof h1, 'string');
  assert.equal(h1.length, 64);
});

test('Kernel - Command Validation and Rejection Invariants', () => {
  const state = createInitialState();

  // Legal move from Commons to Kitchen
  const legalMove = {
    command_id: 'cmd-001',
    actor_id: 'actor.aysha',
    type: 'move',
    to_room_id: 'room.heartwood.kitchen'
  };
  const r1 = validateCommand(state, legalMove);
  assert.equal(r1.status, 'ACCEPTED');

  // Illegal move: disconnected room
  const illegalMove = {
    command_id: 'cmd-002',
    actor_id: 'actor.aysha',
    type: 'move',
    to_room_id: 'room.heartwood.pantry' // Not directly connected to commons
  };
  const r2 = validateCommand(state, illegalMove);
  assert.equal(r2.status, 'REJECTED');
  assert.equal(r2.reason_code, 'NO_DIRECT_ROUTE');

  // Non-existent actor
  const invalidActor = {
    command_id: 'cmd-003',
    actor_id: 'actor.nonexistent',
    type: 'move',
    to_room_id: 'room.heartwood.kitchen'
  };
  const r3 = validateCommand(state, invalidActor);
  assert.equal(r3.status, 'REJECTED');
  assert.equal(r3.reason_code, 'ACTOR_NOT_FOUND');
});

test('Kernel - Command Execution and State Mutation', () => {
  const state = createInitialState();
  const ledger = new EventLedger('test-run-001');

  // Execute move
  const moveCmd = {
    command_id: 'cmd-010',
    actor_id: 'actor.aysha',
    type: 'move',
    to_room_id: 'room.heartwood.kitchen'
  };
  const resMove = executeCommand(state, moveCmd, ledger);
  assert.equal(resMove.status, 'ACCEPTED');
  assert.equal(state.actors['actor.aysha'].location_id, 'room.heartwood.kitchen');
  assert.ok(state.rooms['room.heartwood.kitchen'].occupants.includes('actor.aysha'));
  assert.ok(!state.rooms['room.heartwood.commons'].occupants.includes('actor.aysha'));

  // Amethysta eats a meal in Commons
  const initialMeals = state.resources['resource.served_meals'];
  const initialHunger = state.actors['actor.amethysta'].hunger;
  const eatCmd = {
    command_id: 'cmd-011',
    actor_id: 'actor.amethysta',
    type: 'eat'
  };
  const resEat = executeCommand(state, eatCmd, ledger);
  assert.equal(resEat.status, 'ACCEPTED');
  assert.equal(state.resources['resource.served_meals'], initialMeals - 1);
  assert.ok(state.actors['actor.amethysta'].hunger < initialHunger);
});

test('Kernel - Replay Exactness Gate (PRIME_DIRECTIVE)', () => {
  const initialState = createInitialState({ seed: 9999 });
  const runState = cloneState(initialState);
  const ledger1 = new EventLedger('run-tape-001');

  const commandTape = [
    { command_id: 't-01', actor_id: 'actor.amethysta', type: 'eat' },
    { command_id: 't-02', actor_id: 'actor.aysha', type: 'move', to_room_id: 'room.heartwood.kitchen' },
    { command_id: 't-03', actor_id: 'actor.aysha', type: 'cook' },
    { command_id: 't-04', actor_id: 'actor.aysha', type: 'move', to_room_id: 'room.heartwood.commons' },
    { command_id: 't-05', actor_id: 'actor.begonio', type: 'move', to_room_id: 'room.mana.practice' },
    { command_id: 't-06', actor_id: 'actor.amethysta', type: 'move', to_room_id: 'room.mana.classroom' },
    { command_id: 't-07', actor_id: 'actor.amethysta', type: 'move', to_room_id: 'room.mana.practice' },
    { command_id: 't-08', actor_id: 'actor.amethysta', type: 'lesson', instructor_id: 'actor.begonio', subject: 'khan_yorman_basics' }
  ];

  // Run 1: Apply commands across ticks
  for (let t = 0; t < commandTape.length; t++) {
    applyTick(runState, [commandTape[t]], ledger1);
  }
  const finalHash1 = computeStateHash(runState);
  const ledgerHash1 = ledger1.computeLedgerHash();

  // Run 2: Replay exact tape from clone of initial state
  const replayState = cloneState(initialState);
  const ledger2 = new EventLedger('run-tape-001');

  for (let t = 0; t < commandTape.length; t++) {
    applyTick(replayState, [commandTape[t]], ledger2);
  }
  const finalHash2 = computeStateHash(replayState);
  const ledgerHash2 = ledger2.computeLedgerHash();

  assert.equal(finalHash1, finalHash2, 'Final state hash after replay must match initial run exactly');
  assert.equal(ledgerHash1, ledgerHash2, 'Event ledger hash after replay must match initial run exactly');
  assert.equal(ledger1.getEvents().length, ledger2.getEvents().length);
});
