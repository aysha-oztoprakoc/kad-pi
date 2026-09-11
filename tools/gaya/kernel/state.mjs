// Pure ESM Deterministic World State & Canonical Hashing
// Follows Section 7.2 (State transition) and Section 9.1 (World entities).

import { createHash } from 'node:crypto';
import { CANON_CODEX, REFUGE_ROOMS } from '../content/registry.mjs';

/**
 * Creates canonical deterministic JSON string with sorted keys and stable ordering.
 */
export function canonicalJson(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalJson).join(',')}]`;
  }
  const sortedKeys = Object.keys(obj).sort();
  const entries = sortedKeys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`);
  return `{${entries.join(',')}}`;
}

/**
 * Computes deterministic SHA256 hash of state.
 */
export function computeStateHash(state) {
  const normalized = {
    tick: state.tick,
    day: state.day,
    seed: state.seed,
    actors: state.actors,
    rooms: state.rooms,
    resources: state.resources,
    active_projects: state.active_projects,
    reservations: state.reservations
  };
  return createHash('sha256').update(canonicalJson(normalized)).digest('hex');
}

/**
 * Creates deep clone of state.
 */
export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

/**
 * Builds the initial standard Day 1 Refuge state.
 */
export function createInitialState(options = {}) {
  const seed = options.seed ?? 1337;

  // Initialize room states
  const rooms = {};
  for (const [roomId, def] of Object.entries(REFUGE_ROOMS)) {
    rooms[roomId] = {
      id: roomId,
      occupants: [],
      reservations: []
    };
  }

  // Initialize initial actors with canon positions
  const actors = {
    'actor.aysha': {
      id: 'actor.aysha',
      name: 'Ayşa Öztoprak',
      location_id: 'room.heartwood.commons',
      hp_current: 68,
      hp_max: 68,
      hunger: 0.15,
      fatigue: 0.2,
      khan_personal: 20,
      yorman_personal: 15,
      inventory: ['item.crosta_de_kravarius', 'item.nyr_blade', 'item.zhar_blade'],
      active_duty: 'commander'
    },
    'actor.amethysta': {
      id: 'actor.amethysta',
      name: 'Amethysta',
      location_id: 'room.heartwood.commons',
      hp_current: 42,
      hp_max: 42,
      hunger: 0.75, // Hungry on morning Day 1 per ASCII mock
      fatigue: 0.1,
      khan_personal: 5,
      yorman_personal: 10,
      inventory: [],
      active_duty: 'learner'
    },
    'actor.begonio': {
      id: 'actor.begonio',
      name: 'Begonio',
      location_id: 'room.mana.classroom',
      hp_current: 38,
      hp_max: 38,
      hunger: 0.3,
      fatigue: 0.15,
      khan_personal: 10,
      yorman_personal: 25,
      inventory: ['item.lesson_slate'],
      active_duty: 'teaching'
    },
    'actor.douglas': {
      id: 'actor.douglas',
      name: 'Douglas',
      location_id: 'room.douglas.salon',
      hp_current: 45,
      hp_max: 45,
      hunger: 0.2,
      fatigue: 0.1,
      khan_personal: 8,
      yorman_personal: 18,
      inventory: ['item.harpsichord_sheet'],
      active_duty: 'hospitality'
    }
  };

  // Place actors in initial rooms
  for (const [actorId, actor] of Object.entries(actors)) {
    if (rooms[actor.location_id]) {
      rooms[actor.location_id].occupants.push(actorId);
      rooms[actor.location_id].occupants.sort();
    }
  }

  // Initial resources
  const resources = {
    'resource.food_stock': 8,
    'resource.clean_water': 12,
    'resource.served_meals': 2,
    'resource.wood_timber': 20,
    'resource.stone_slabs': 15,
    'resource.chalk': 5,
    'resource.parchment': 5
  };

  const state = {
    tick: 0,
    day: 1,
    time_str: 'Day 1 08:00',
    seed,
    ruleset_version: 'gaya-sim-0.1',
    actors,
    rooms,
    resources,
    active_projects: [],
    reservations: []
  };

  return state;
}
