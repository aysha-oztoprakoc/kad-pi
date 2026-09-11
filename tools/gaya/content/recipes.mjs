// Síntese Eligibility Predicates and Approved Settlement Recipes
// Enforces Section 4.2 (Síntese) and Section 9.3 (Work and Production) of Handoff.

import { EPISTEMIC_STATUS } from './codex.mjs';

/**
 * Checks if a target entity or item is legally eligible for Síntese manipulation.
 * Invariants:
 * 1. Living things and active concepts cannot be manipulated merely because their skein is perceived.
 * 2. Only inanimate objects, raw materials, or entities explicitly killed by Ayşa are eligible.
 */
export function isSinteseTargetEligible(target, actorId = 'actor.aysha') {
  if (!target || typeof target !== 'object') return { eligible: false, reason: 'INVALID_TARGET' };
  if (actorId !== 'actor.aysha') return { eligible: false, reason: 'ONLY_AYSHA_WIELDS_SINTESE' };

  if (target.is_living === true) {
    if (target.killed_by !== actorId) {
      return { eligible: false, reason: 'LIVING_OR_UNCLAIMED_TARGET_INELIGIBLE' };
    }
  }

  if (target.is_inanimate === true || target.killed_by === actorId) {
    return { eligible: true, reason: 'ELIGIBLE_SKEIN' };
  }

  return { eligible: false, reason: 'TARGET_NOT_INANIMATE_OR_KILLED_BY_OPERATOR' };
}

export const APPROVED_RECIPES = Object.freeze({
  'recipe.kitchen.shared_meal': {
    id: 'recipe.kitchen.shared_meal',
    name: 'Prepare Heartwood Shared Meal',
    status: EPISTEMIC_STATUS.PROPOSED_DESIGN,
    station: 'cooking_hearth',
    location_id: 'room.heartwood.kitchen',
    duration_ticks: 2,
    inputs: {
      'resource.food_stock': 2,
      'resource.clean_water': 1
    },
    outputs: {
      'resource.served_meals': 4
    },
    description: 'Hearty roasted stew of tubers and smoked meats served at the central table.'
  },

  'recipe.mana.lesson_focus': {
    id: 'recipe.mana.lesson_focus',
    name: 'Prepare Lesson Focus Resonator',
    status: EPISTEMIC_STATUS.PROPOSED_DESIGN,
    station: 'slate_boards',
    location_id: 'room.mana.classroom',
    duration_ticks: 1,
    inputs: {
      'resource.chalk': 1,
      'resource.parchment': 1
    },
    outputs: {
      'item.lesson_slate': 1
    },
    description: 'Drawn diagrams of Khan matter and Yorman will for learner demonstration.'
  },

  'recipe.sintese.kravarius_reinforcement': {
    id: 'recipe.sintese.kravarius_reinforcement',
    name: 'Reinforce Defensive Weave (Síntese)',
    status: EPISTEMIC_STATUS.APPROVED_CANON,
    station: 'slate_working_slab',
    location_id: 'room.synthesis.chamber',
    duration_ticks: 3,
    requires_sintese: true,
    inputs: {
      'khan_personal': 5,
      'yorman_personal': 3
    },
    outputs: {
      'buff.kravarius_resilience': 1
    },
    description: 'Ayşa manipulates the skeins of Kravarius scales to knit a temporary protective ward.'
  }
});
