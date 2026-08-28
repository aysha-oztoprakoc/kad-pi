import { createHash } from 'node:crypto';

/**
 * Creates canonical initial state.
 * @param {object} overrides
 * @returns {object}
 */
export function createInitialState(overrides = {}) {
  return {
    player_room: overrides.player_room || 'room_a',
    key_room: overrides.key_room !== undefined ? overrides.key_room : 'room_a',
    crate_room: overrides.crate_room !== undefined ? overrides.crate_room : 'room_b'
  };
}

/**
 * Computes deterministic SHA-256 hash of canonical state.
 * @param {object} state
 * @returns {string}
 */
export function computeStateHash(state) {
  const canonicalString = JSON.stringify({
    player_room: state.player_room,
    key_room: state.key_room === null ? 'held' : state.key_room,
    crate_room: state.crate_room === null ? 'held' : state.crate_room
  });
  return createHash('sha256').update(canonicalString).digest('hex');
}

/**
 * Deep clones state
 * @param {object} state
 * @returns {object}
 */
export function cloneState(state) {
  return {
    player_room: state.player_room,
    key_room: state.key_room,
    crate_room: state.crate_room
  };
}

/**
 * Verifies if two states are semantically equal
 * @param {object} a
 * @param {object} b
 * @returns {boolean}
 */
export function isStateEqual(a, b) {
  if (!a || !b) return false;
  const aKey = a.key_room === null ? 'held' : a.key_room;
  const bKey = b.key_room === null ? 'held' : b.key_room;
  const aCrate = a.crate_room === null ? 'held' : a.crate_room;
  const bCrate = b.crate_room === null ? 'held' : b.crate_room;

  return (
    a.player_room === b.player_room &&
    aKey === bKey &&
    aCrate === bCrate
  );
}
