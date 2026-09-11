// Pure ESM Deterministic State Transition Function
// Follows Section 7.2 (State transition): State(t+1) = Apply(Ruleset, State(t), Commands, RNG)

import { computeStateHash } from './state.mjs';
import { validateCommand } from './validator.mjs';
import { REFUGE_ROOMS } from '../content/registry.mjs';

/**
 * Formats day and tick into human-readable clock string.
 * Tick 0 = Day 1 08:00. Each tick is 30 minutes. 48 ticks = 24 hours.
 */
export function formatClock(tick, startHour = 8) {
  const totalMinutes = startHour * 60 + tick * 30;
  const day = Math.floor(totalMinutes / (24 * 60)) + 1;
  const minuteOfDay = totalMinutes % (24 * 60);
  const hour = Math.floor(minuteOfDay / 60);
  const min = minuteOfDay % 60;
  const hh = String(hour).padStart(2, '0');
  const mm = String(min).padStart(2, '0');
  return `Day ${day} ${hh}:${mm}`;
}

/**
 * Executes a single validated command, mutating state and recording the event in the ledger.
 */
export function executeCommand(state, command, ledger) {
  const beforeHash = computeStateHash(state);
  const receipt = validateCommand(state, command);

  if (receipt.status === 'REJECTED') {
    ledger.append({
      tick: state.tick,
      event_type: 'action.rejected',
      causation_id: command.command_id ?? null,
      actor_ids: [command.actor_id],
      location_ids: [state.actors[command.actor_id]?.location_id ?? 'unknown'],
      before_hash: beforeHash,
      after_hash: beforeHash,
      payload: { command, reason_code: receipt.reason_code, receipt }
    });
    return { status: 'REJECTED', receipt };
  }

  const { actor_id, type } = command;
  const actor = state.actors[actor_id];
  let committedEvent = null;

  switch (type) {
    case 'move': {
      const fromRoom = actor.location_id;
      const toRoom = command.to_room_id;

      // Remove from current room
      state.rooms[fromRoom].occupants = state.rooms[fromRoom].occupants.filter((id) => id !== actor_id);
      // Add to new room
      state.rooms[toRoom].occupants.push(actor_id);
      state.rooms[toRoom].occupants.sort();
      actor.location_id = toRoom;

      const afterHash = computeStateHash(state);
      committedEvent = ledger.append({
        tick: state.tick,
        event_type: 'actor.moved',
        causation_id: command.command_id ?? null,
        actor_ids: [actor_id],
        location_ids: [fromRoom, toRoom],
        before_hash: beforeHash,
        after_hash: afterHash,
        payload: { from: fromRoom, to: toRoom }
      });
      break;
    }

    case 'eat': {
      state.resources['resource.served_meals'] -= 1;
      actor.hunger = Math.max(0, Math.round((actor.hunger - 0.6) * 100) / 100);

      const afterHash = computeStateHash(state);
      committedEvent = ledger.append({
        tick: state.tick,
        event_type: 'meal.consumed',
        causation_id: command.command_id ?? null,
        actor_ids: [actor_id],
        location_ids: [actor.location_id],
        before_hash: beforeHash,
        after_hash: afterHash,
        payload: { hunger_after: actor.hunger, remaining_meals: state.resources['resource.served_meals'] }
      });
      break;
    }

    case 'cook': {
      for (const [res, qty] of Object.entries(receipt.cost)) {
        state.resources[res] -= qty;
      }
      for (const [res, qty] of Object.entries(receipt.outputs)) {
        state.resources[res] = (state.resources[res] ?? 0) + qty;
      }

      const afterHash = computeStateHash(state);
      committedEvent = ledger.append({
        tick: state.tick,
        event_type: 'cooking.finished',
        causation_id: command.command_id ?? null,
        actor_ids: [actor_id],
        location_ids: [actor.location_id],
        before_hash: beforeHash,
        after_hash: afterHash,
        payload: { recipe_id: receipt.recipe_id, produced: receipt.outputs }
      });
      break;
    }

    case 'rest': {
      actor.fatigue = Math.max(0, Math.round((actor.fatigue - 0.5) * 100) / 100);

      const afterHash = computeStateHash(state);
      committedEvent = ledger.append({
        tick: state.tick,
        event_type: 'rest.completed',
        causation_id: command.command_id ?? null,
        actor_ids: [actor_id],
        location_ids: [actor.location_id],
        before_hash: beforeHash,
        after_hash: afterHash,
        payload: { fatigue_after: actor.fatigue }
      });
      break;
    }

    case 'lesson': {
      const { instructor_id, subject } = command;
      actor.fatigue = Math.min(1.0, Math.round((actor.fatigue + 0.15) * 100) / 100);

      const afterHash = computeStateHash(state);
      committedEvent = ledger.append({
        tick: state.tick,
        event_type: 'lesson.completed',
        causation_id: command.command_id ?? null,
        actor_ids: [actor_id, instructor_id],
        location_ids: [actor.location_id],
        before_hash: beforeHash,
        after_hash: afterHash,
        payload: { subject, instructor: instructor_id, learner: actor_id }
      });
      break;
    }

    case 'drill': {
      actor.fatigue = Math.min(1.0, Math.round((actor.fatigue + 0.2) * 100) / 100);

      const afterHash = computeStateHash(state);
      committedEvent = ledger.append({
        tick: state.tick,
        event_type: 'drill.executed',
        causation_id: command.command_id ?? null,
        actor_ids: [actor_id],
        location_ids: [actor.location_id],
        before_hash: beforeHash,
        after_hash: afterHash,
        payload: { drill_type: command.drill_type ?? 'formation_barrier' }
      });
      break;
    }

    case 'sintese': {
      actor.khan_personal -= receipt.cost.khan_personal;
      actor.yorman_personal -= receipt.cost.yorman_personal;

      const afterHash = computeStateHash(state);
      committedEvent = ledger.append({
        tick: state.tick,
        event_type: 'sintese.transmuted',
        causation_id: command.command_id ?? null,
        actor_ids: [actor_id],
        location_ids: [actor.location_id],
        before_hash: beforeHash,
        after_hash: afterHash,
        payload: { recipe_id: command.recipe_id, spent: receipt.cost, gained: receipt.outputs }
      });
      break;
    }

    case 'talk': {
      const afterHash = computeStateHash(state);
      committedEvent = ledger.append({
        tick: state.tick,
        event_type: 'dialogue.conversed',
        causation_id: command.command_id ?? null,
        actor_ids: [actor_id, command.target_actor_id],
        location_ids: [actor.location_id],
        before_hash: beforeHash,
        after_hash: afterHash,
        payload: { topic: command.topic ?? 'refuge_welfare' }
      });
      break;
    }

    case 'trade': {
      const { target_actor_id, offer_item, request_item } = command;
      const target = state.actors[target_actor_id];
      if (offer_item) {
        const idx = actor.inventory.indexOf(offer_item);
        if (idx !== -1) {
          actor.inventory.splice(idx, 1);
          target.inventory.push(offer_item);
          target.inventory.sort();
        }
      }
      if (request_item) {
        const idx = target.inventory.indexOf(request_item);
        if (idx !== -1) {
          target.inventory.splice(idx, 1);
          actor.inventory.push(request_item);
          actor.inventory.sort();
        }
      }
      actor.inventory.sort();

      const afterHash = computeStateHash(state);
      committedEvent = ledger.append({
        tick: state.tick,
        event_type: 'market.trade_executed',
        causation_id: command.command_id ?? null,
        actor_ids: [actor_id, target_actor_id].sort(),
        location_ids: [actor.location_id],
        before_hash: beforeHash,
        after_hash: afterHash,
        payload: {
          initiator: actor_id,
          counterparty: target_actor_id,
          offered: offer_item ?? null,
          received: request_item ?? null
        }
      });
      break;
    }

    case 'vote': {
      const { proposal_id, choice } = command;
      let project = state.active_projects.find((p) => p.id === proposal_id);
      if (!project) {
        project = { id: proposal_id, type: 'governance_ballot', votes: {} };
        state.active_projects.push(project);
        state.active_projects.sort((a, b) => a.id.localeCompare(b.id));
      }
      project.votes[actor_id] = choice;

      const afterHash = computeStateHash(state);
      committedEvent = ledger.append({
        tick: state.tick,
        event_type: 'governance.vote_cast',
        causation_id: command.command_id ?? null,
        actor_ids: [actor_id],
        location_ids: [actor.location_id],
        before_hash: beforeHash,
        after_hash: afterHash,
        payload: { proposal_id, choice, voter: actor_id }
      });
    }
  }

  return { status: 'ACCEPTED', event: committedEvent };
}

/**
 * Advances the simulation by one discrete tick (30 minutes).
 */
export function applyTick(state, commands = [], ledger) {
  const beforeHash = computeStateHash(state);
  state.tick += 1;
  state.time_str = formatClock(state.tick);
  state.day = Math.floor(state.tick / 48) + 1;

  // Background needs progression: hunger increases every 2 ticks
  if (state.tick % 2 === 0) {
    for (const actor of Object.values(state.actors)) {
      actor.hunger = Math.min(1.0, Math.round((actor.hunger + 0.05) * 100) / 100);
    }
  }

  // Sort commands deterministically by actor_id
  const sortedCommands = [...commands].sort((a, b) => a.actor_id.localeCompare(b.actor_id));

  // Execute sorted commands
  const receipts = [];
  for (const cmd of sortedCommands) {
    const res = executeCommand(state, cmd, ledger);
    receipts.push({ command: cmd, ...res });
  }

  const afterHash = computeStateHash(state);
  ledger.append({
    tick: state.tick,
    event_type: 'tick.advanced',
    causation_id: null,
    actor_ids: Object.keys(state.actors),
    location_ids: [],
    before_hash: beforeHash,
    after_hash: afterHash,
    payload: { clock: state.time_str, processed_commands: receipts.length }
  });

  return { tick: state.tick, clock: state.time_str, state_hash: afterHash, receipts };
}
