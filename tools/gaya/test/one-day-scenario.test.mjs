import test from 'node:test';
import assert from 'node:assert/strict';
import { runOneDaySimulation, replaySimulationTape } from '../simulation/one-day-scenario.mjs';
import { canonicalJson, computeStateHash } from '../kernel/state.mjs';

test('1-Day Scenario - Execution and Progression', () => {
  const sim = runOneDaySimulation({ seed: 1337, runId: 'test-oneday-run' });

  assert.equal(sim.state.tick, 48, 'Simulation advances exactly 48 ticks');
  assert.equal(sim.final_clock, 'Day 2 08:00', 'Simulation ends at Day 2 08:00');
  assert.equal(sim.state.day, 2);
  assert.equal(sim.command_count, 27, 'All 27 scheduled commands executed');
  assert.ok(sim.event_count >= 75, 'Ledger recorded tick and action events');

  // Verify ledger integrity
  assert.equal(sim.ledgerVerification.valid, true);

  // Check character progression
  const aysha = sim.state.actors['actor.aysha'];
  const amethysta = sim.state.actors['actor.amethysta'];

  // Ayşa spent 5 Khan and 3 Yorman on Síntese (starting was 20 and 15)
  assert.equal(aysha.khan_personal, 15, 'Khan debited by Síntese');
  assert.equal(aysha.yorman_personal, 12, 'Yorman debited by Síntese');

  // Ayşa is resting in her quarters at end of day
  assert.equal(aysha.location_id, 'room.residential.aysha');
  assert.equal(amethysta.location_id, 'room.residential.amethysta');

  // Fatigue was relieved by night rest
  assert.ok(aysha.fatigue <= 0.5, 'Ayşa fatigue reduced by rest');
  assert.ok(amethysta.fatigue <= 0.5, 'Amethysta fatigue reduced by rest');

  // Kitchen inventory check: cooked meals produced served meals
  assert.ok(sim.state.resources['resource.served_meals'] > 0);
});

test('1-Day Scenario - Deterministic Replay Gate (PRIME_DIRECTIVE)', () => {
  // First run
  const run1 = runOneDaySimulation({ seed: 20260908, runId: 'run-primary' });

  // Replay from tape
  const replay = replaySimulationTape(20260908, run1.fullCommandTape, run1.final_hash);

  assert.equal(replay.match, true, 'Replayed simulation tape produces identical final state hash');
  assert.equal(replay.replayFinalHash, run1.final_hash);
  assert.equal(replay.ledger_hash, run1.ledger_hash, 'Replayed ledger hash matches original run');
});

test('1-Day Scenario - State Serialization Round-Trip Invariant', () => {
  const sim = runOneDaySimulation({ seed: 777 });

  const serialized = canonicalJson(sim.state);
  const restored = JSON.parse(serialized);

  const hashOriginal = computeStateHash(sim.state);
  const hashRestored = computeStateHash(restored);

  assert.equal(hashOriginal, hashRestored, 'Canonical serialization round-trip preserves state hash');
});
