// Full 1-Day Scripted Settlement Simulation (Day 1 08:00 to Day 2 08:00)
// Implements the executive handoff milestone: meals, sleep, work, Begonio lesson,
// tactical drill, Douglas mediation, Síntese transmutation, and complete save/replay cycle.
// Zero LLM required.

import { createInitialState, computeStateHash, cloneState } from '../kernel/state.mjs';
import { EventLedger } from '../kernel/ledger.mjs';
import { applyTick } from '../kernel/transition.mjs';

/**
 * Generates the deterministic 1-day command schedule.
 * Map: tick -> array of commands.
 */
export function getOneDayScriptedSchedule() {
  return [
    // Tick 1 (08:30): Amethysta eats morning meal in Commons
    {
      tick: 1,
      commands: [
        { command_id: 'cmd-d1-01', actor_id: 'actor.amethysta', type: 'eat' }
      ]
    },
    // Tick 2 (09:00): Ayşa moves to kitchen to restock meals
    {
      tick: 2,
      commands: [
        { command_id: 'cmd-d1-02', actor_id: 'actor.aysha', type: 'move', to_room_id: 'room.heartwood.kitchen' }
      ]
    },
    // Tick 3 (09:30): Ayşa cooks shared meals
    {
      tick: 3,
      commands: [
        { command_id: 'cmd-d1-03', actor_id: 'actor.aysha', type: 'cook' }
      ]
    },
    // Tick 4 (10:00): Ayşa returns to Commons
    {
      tick: 4,
      commands: [
        { command_id: 'cmd-d1-04', actor_id: 'actor.aysha', type: 'move', to_room_id: 'room.heartwood.commons' }
      ]
    },
    // Tick 5 (10:30): Begonio & Amethysta prepare for Mana lesson
    {
      tick: 5,
      commands: [
        { command_id: 'cmd-d1-05', actor_id: 'actor.begonio', type: 'move', to_room_id: 'room.mana.practice' },
        { command_id: 'cmd-d1-06', actor_id: 'actor.amethysta', type: 'move', to_room_id: 'room.mana.classroom' }
      ]
    },
    // Tick 6 (11:00): Amethysta enters practice chamber; Begonio conducts lesson
    {
      tick: 6,
      commands: [
        { command_id: 'cmd-d1-07', actor_id: 'actor.amethysta', type: 'move', to_room_id: 'room.mana.practice' },
        { command_id: 'cmd-d1-08', actor_id: 'actor.amethysta', type: 'lesson', instructor_id: 'actor.begonio', subject: 'khan_yorman_basics' }
      ]
    },
    // Tick 8 (12:00): Return to Commons for lunch
    {
      tick: 8,
      commands: [
        { command_id: 'cmd-d1-09', actor_id: 'actor.amethysta', type: 'move', to_room_id: 'room.mana.classroom' },
        { command_id: 'cmd-d1-10', actor_id: 'actor.begonio', type: 'move', to_room_id: 'room.mana.classroom' }
      ]
    },
    {
      tick: 9,
      commands: [
        { command_id: 'cmd-d1-11', actor_id: 'actor.amethysta', type: 'move', to_room_id: 'room.heartwood.commons' },
        { command_id: 'cmd-d1-12', actor_id: 'actor.begonio', type: 'move', to_room_id: 'room.heartwood.commons' }
      ]
    },
    // Tick 12 (14:00): Ayşa moves to Combat Terrace and drills
    {
      tick: 12,
      commands: [
        { command_id: 'cmd-d1-13', actor_id: 'actor.aysha', type: 'move', to_room_id: 'room.combat.terrace' }
      ]
    },
    {
      tick: 13,
      commands: [
        { command_id: 'cmd-d1-14', actor_id: 'actor.aysha', type: 'drill', drill_type: 'lightning_barrier' }
      ]
    },
    // Tick 16 (16:00): Social mediation with Douglas
    {
      tick: 16,
      commands: [
        { command_id: 'cmd-d1-15', actor_id: 'actor.aysha', type: 'move', to_room_id: 'room.heartwood.commons' }
      ]
    },
    {
      tick: 17,
      commands: [
        { command_id: 'cmd-d1-16', actor_id: 'actor.aysha', type: 'move', to_room_id: 'room.douglas.salon' }
      ]
    },
    {
      tick: 18,
      commands: [
        { command_id: 'cmd-d1-17', actor_id: 'actor.aysha', type: 'talk', target_actor_id: 'actor.douglas', topic: 'refuge_discipline' }
      ]
    },
    // Tick 22 (19:00): Síntese transmutation in Synthesis Chamber
    {
      tick: 22,
      commands: [
        { command_id: 'cmd-d1-18', actor_id: 'actor.aysha', type: 'move', to_room_id: 'room.heartwood.commons' }
      ]
    },
    {
      tick: 23,
      commands: [
        { command_id: 'cmd-d1-19', actor_id: 'actor.aysha', type: 'move', to_room_id: 'room.synthesis.chamber' }
      ]
    },
    {
      tick: 24,
      commands: [
        { command_id: 'cmd-d1-20', actor_id: 'actor.aysha', type: 'sintese', recipe_id: 'recipe.sintese.kravarius_reinforcement' }
      ]
    },
    // Tick 28 (22:00): Ayşa & Amethysta retire for night rest
    {
      tick: 28,
      commands: [
        { command_id: 'cmd-d1-21', actor_id: 'actor.aysha', type: 'move', to_room_id: 'room.heartwood.commons' },
        { command_id: 'cmd-d1-22', actor_id: 'actor.amethysta', type: 'move', to_room_id: 'room.residential.hall' }
      ]
    },
    {
      tick: 29,
      commands: [
        { command_id: 'cmd-d1-23', actor_id: 'actor.aysha', type: 'move', to_room_id: 'room.residential.hall' },
        { command_id: 'cmd-d1-24', actor_id: 'actor.amethysta', type: 'move', to_room_id: 'room.residential.amethysta' }
      ]
    },
    {
      tick: 30,
      commands: [
        { command_id: 'cmd-d1-25', actor_id: 'actor.aysha', type: 'move', to_room_id: 'room.residential.aysha' },
        { command_id: 'cmd-d1-26', actor_id: 'actor.amethysta', type: 'rest' }
      ]
    },
    {
      tick: 31,
      commands: [
        { command_id: 'cmd-d1-27', actor_id: 'actor.aysha', type: 'rest' }
      ]
    }
  ];
}

/**
 * Runs the full 1-Day scripted simulation from tick 0 to tick 48.
 * Returns the final state, event ledger, command tape, and state hashes.
 */
export function runOneDaySimulation(options = {}) {
  const seed = options.seed ?? 1337;
  const state = createInitialState({ seed });
  const ledger = new EventLedger(options.runId ?? 'run-oneday-001');

  const schedule = getOneDayScriptedSchedule();
  const scheduleByTick = new Map(schedule.map((s) => [s.tick, s.commands]));
  const fullCommandTape = [];
  const tickSnapshots = [];

  const initialHash = computeStateHash(state);

  // Advance 48 ticks (24 hours)
  for (let tick = 1; tick <= 48; tick++) {
    const commands = scheduleByTick.get(tick) ?? [];
    for (const cmd of commands) {
      fullCommandTape.push({ tick, command: cmd });
    }
    const result = applyTick(state, commands, ledger);
    tickSnapshots.push({
      tick: result.tick,
      clock: result.clock,
      state_hash: result.state_hash
    });
  }

  const finalHash = computeStateHash(state);
  const ledgerVerification = ledger.verifyIntegrity();

  return {
    initial_hash: initialHash,
    final_hash: finalHash,
    ledger_hash: ledger.computeLedgerHash(),
    event_count: ledger.getEvents().length,
    command_count: fullCommandTape.length,
    final_clock: state.time_str,
    final_day: state.day,
    state,
    ledger,
    fullCommandTape,
    tickSnapshots,
    ledgerVerification
  };
}

/**
 * Replays a simulation from a recorded command tape and verifies deterministic state hash match.
 */
export function replaySimulationTape(initialSeed, commandTape, expectedFinalHash) {
  const state = createInitialState({ seed: initialSeed });
  const ledger = new EventLedger('replay-run-001');

  const tapeByTick = new Map();
  for (const entry of commandTape) {
    if (!tapeByTick.has(entry.tick)) {
      tapeByTick.set(entry.tick, []);
    }
    tapeByTick.get(entry.tick).push(entry.command);
  }

  for (let tick = 1; tick <= 48; tick++) {
    const commands = tapeByTick.get(tick) ?? [];
    applyTick(state, commands, ledger);
  }

  const replayFinalHash = computeStateHash(state);
  const match = replayFinalHash === expectedFinalHash;

  return {
    match,
    replayFinalHash,
    expectedFinalHash,
    ledger_hash: ledger.computeLedgerHash(),
    event_count: ledger.getEvents().length
  };
}
