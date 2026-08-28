import { createHash } from 'node:crypto';

/**
 * Creates a declarative world topology state.
 *
 * @param {object} [config]
 * @returns {object} Declarative WorldState
 */
export function createDeclarativeWorld(config = {}) {
  const locations = config.locations || {
    room_a: {
      id: 'room_a',
      name: 'Workshop Alpha',
      description: 'A cluttered netrunner staging room with terminal benches.',
      exits: { east: 'room_b' }
    },
    room_b: {
      id: 'room_b',
      name: 'Storage Vault Beta',
      description: 'A reinforced storage vault with magnetic racks.',
      exits: { west: 'room_a' }
    }
  };

  const entities = config.entities || {
    player: {
      id: 'player',
      name: 'Operator',
      kind: 'actor',
      location: 'room_a',
      held_by: null,
      properties: { health: 100, inventory_limit: 5 }
    },
    key: {
      id: 'key',
      name: 'Access Keycard',
      kind: 'object',
      location: 'room_a',
      held_by: null,
      properties: { weight: 1, security_clearance: 2 }
    },
    crate: {
      id: 'crate',
      name: 'Cargo Container',
      kind: 'object',
      location: 'room_b',
      held_by: null,
      properties: { weight: 20, locked: false }
    }
  };

  return {
    topology_id: config.topology_id || 'kad-micro-v1',
    schema_version: '1.0.0',
    locations,
    entities
  };
}

/**
 * Computes deterministic SHA-256 hash of declarative WorldState.
 * Sorts all keys deterministically.
 *
 * @param {object} worldState
 * @returns {string}
 */
export function computeWorldHash(worldState) {
  const canonicalLocations = Object.keys(worldState.locations || {})
    .sort()
    .reduce((acc, locId) => {
      const loc = worldState.locations[locId];
      acc[locId] = {
        id: loc.id,
        name: loc.name,
        exits: Object.keys(loc.exits || {}).sort().reduce((eAcc, dir) => {
          eAcc[dir] = loc.exits[dir];
          return eAcc;
        }, {})
      };
      return acc;
    }, {});

  const canonicalEntities = Object.keys(worldState.entities || {})
    .sort()
    .reduce((acc, entId) => {
      const ent = worldState.entities[entId];
      acc[entId] = {
        id: ent.id,
        kind: ent.kind,
        location: ent.location,
        held_by: ent.held_by,
        properties: Object.keys(ent.properties || {}).sort().reduce((pAcc, pKey) => {
          pAcc[pKey] = ent.properties[pKey];
          return pAcc;
        }, {})
      };
      return acc;
    }, {});

  const canonicalObj = {
    topology_id: worldState.topology_id,
    schema_version: worldState.schema_version,
    locations: canonicalLocations,
    entities: canonicalEntities
  };

  return createHash('sha256').update(JSON.stringify(canonicalObj)).digest('hex');
}

/**
 * Deep clones WorldState.
 * @param {object} worldState
 * @returns {object}
 */
export function cloneWorldState(worldState) {
  return JSON.parse(JSON.stringify(worldState));
}

/**
 * Computes minimal StateDiff between two WorldStates.
 * @param {object} before
 * @param {object} after
 * @returns {Array<object>} StateDiff
 */
export function computeWorldDiff(before, after) {
  const diffs = [];

  for (const entId of Object.keys(after.entities || {})) {
    const bEnt = before.entities?.[entId];
    const aEnt = after.entities[entId];

    if (!bEnt) {
      diffs.push({ field: `entity:${entId}:created`, before: null, after: aEnt });
      continue;
    }

    if (bEnt.location !== aEnt.location) {
      diffs.push({
        field: `entity:${entId}:location`,
        entity_id: entId,
        before: bEnt.location,
        after: aEnt.location
      });
    }

    if (bEnt.held_by !== aEnt.held_by) {
      diffs.push({
        field: `entity:${entId}:held_by`,
        entity_id: entId,
        before: bEnt.held_by,
        after: aEnt.held_by
      });
    }

    for (const pKey of Object.keys(aEnt.properties || {})) {
      if (bEnt.properties?.[pKey] !== aEnt.properties[pKey]) {
        diffs.push({
          field: `entity:${entId}:property:${pKey}`,
          entity_id: entId,
          property: pKey,
          before: bEnt.properties?.[pKey] ?? null,
          after: aEnt.properties[pKey]
        });
      }
    }
  }

  return diffs;
}

/**
 * Applies StateDiff to WorldState.
 * @param {object} worldState
 * @param {Array<object>} diffChanges
 * @returns {object}
 */
export function applyWorldDiff(worldState, diffChanges) {
  const state = cloneWorldState(worldState);

  for (const change of diffChanges) {
    if (change.field.endsWith(':created') && change.after) {
      state.entities[change.after.id] = cloneWorldState({ entities: { [change.after.id]: change.after } }).entities[change.after.id];
    } else if (change.field.endsWith(':location')) {
      if (state.entities[change.entity_id]) {
        state.entities[change.entity_id].location = change.after;
      }
    } else if (change.field.endsWith(':held_by')) {
      if (state.entities[change.entity_id]) {
        state.entities[change.entity_id].held_by = change.after;
      }
    } else if (change.property) {
      if (state.entities[change.entity_id]) {
        state.entities[change.entity_id].properties[change.property] = change.after;
      }
    }
  }

  return state;
}
