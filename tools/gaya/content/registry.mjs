// Unified Gaya Content Registry
// Single entry point for immutable content lookups with epistemic provenance.

import { CANON_CODEX, EPISTEMIC_STATUS } from './codex.mjs';
import { REFUGE_ROOMS } from './rooms.mjs';
import { APPROVED_RECIPES, isSinteseTargetEligible } from './recipes.mjs';

export { CANON_CODEX, REFUGE_ROOMS, APPROVED_RECIPES, EPISTEMIC_STATUS, isSinteseTargetEligible };

export function getEntity(id) {
  const pools = [CANON_CODEX.actors, CANON_CODEX.items, CANON_CODEX.cosmology];
  for (const pool of pools) {
    if (pool[id]) return pool[id];
    const stripped = id.replace(/^(actor|item|cosmology)\./, '');
    if (pool[stripped]) return pool[stripped];
    for (const val of Object.values(pool)) {
      if (val.id === id) return val;
    }
  }
  return null;
}

export function getRoom(id) {
  return REFUGE_ROOMS[id] ?? null;
}

export function getRecipe(id) {
  return APPROVED_RECIPES[id] ?? null;
}

export function isCanonApproved(record) {
  return record?.status === EPISTEMIC_STATUS.APPROVED_CANON;
}

export function isUnknown(record) {
  return record?.status === EPISTEMIC_STATUS.UNKNOWN;
}
