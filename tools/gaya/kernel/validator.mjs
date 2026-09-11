// Command Precondition & Economic Legality Validator
// Enforces Section 7.2 (Invariants), Section 8.5 (Receipts), and Section 9.

import { REFUGE_ROOMS, APPROVED_RECIPES, isSinteseTargetEligible } from '../content/registry.mjs';

/**
 * Validates a proposed action command against the current simulation state.
 * Returns a deterministic receipt with status ACCEPTED or REJECTED(reason_code).
 */
export function validateCommand(state, command) {
  if (!command || typeof command !== 'object') {
    return { status: 'REJECTED', reason_code: 'MALFORMED_COMMAND' };
  }

  const { actor_id, type } = command;
  const actor = state.actors[actor_id];
  if (!actor) {
    return { status: 'REJECTED', reason_code: 'ACTOR_NOT_FOUND', actor_id };
  }

  switch (type) {
    case 'move': {
      const { to_room_id } = command;
      const currentRoom = REFUGE_ROOMS[actor.location_id];
      const targetRoom = REFUGE_ROOMS[to_room_id];

      if (!targetRoom) {
        return { status: 'REJECTED', reason_code: 'UNKNOWN_DESTINATION_ROOM', to_room_id };
      }
      if (actor.location_id === to_room_id) {
        return { status: 'REJECTED', reason_code: 'ALREADY_AT_LOCATION', to_room_id };
      }
      if (!currentRoom.connections.includes(to_room_id)) {
        return {
          status: 'REJECTED',
          reason_code: 'NO_DIRECT_ROUTE',
          current: actor.location_id,
          target: to_room_id
        };
      }
      return { status: 'ACCEPTED', reason_code: 'ROUTE_CLEAR' };
    }

    case 'eat': {
      // Must be at dining area or kitchen
      const allowedRooms = ['room.heartwood.commons', 'room.heartwood.kitchen'];
      if (!allowedRooms.includes(actor.location_id)) {
        return { status: 'REJECTED', reason_code: 'NO_FOOD_SERVICE_IN_ROOM', location: actor.location_id };
      }
      if ((state.resources['resource.served_meals'] ?? 0) <= 0) {
        return { status: 'REJECTED', reason_code: 'NO_PREPARED_MEALS_AVAILABLE' };
      }
      return {
        status: 'ACCEPTED',
        reason_code: 'MEAL_AVAILABLE',
        cost: { 'resource.served_meals': 1 }
      };
    }

    case 'cook': {
      if (actor.location_id !== 'room.heartwood.kitchen') {
        return { status: 'REJECTED', reason_code: 'REQUIRES_KITCHEN_HEARTH' };
      }
      const recipe = APPROVED_RECIPES['recipe.kitchen.shared_meal'];
      if (!recipe) {
        return { status: 'REJECTED', reason_code: 'UNAPPROVED_RECIPE' };
      }
      for (const [res, qty] of Object.entries(recipe.inputs)) {
        if ((state.resources[res] ?? 0) < qty) {
          return { status: 'REJECTED', reason_code: 'INSUFFICIENT_INGREDIENTS', missing: res };
        }
      }
      return {
        status: 'ACCEPTED',
        reason_code: 'INGREDIENTS_AVAILABLE',
        recipe_id: recipe.id,
        cost: recipe.inputs,
        outputs: recipe.outputs
      };
    }

    case 'rest': {
      const isResidential = actor.location_id.startsWith('room.residential') || actor.location_id === 'room.douglas.salon';
      if (!isResidential) {
        return { status: 'REJECTED', reason_code: 'NO_REST_FACILITY_IN_ROOM' };
      }
      return { status: 'ACCEPTED', reason_code: 'REST_PERMITTED' };
    }

    case 'lesson': {
      const { instructor_id, subject } = command;
      if (actor_id !== 'actor.amethysta' && actor_id !== 'actor.aysha') {
        return { status: 'REJECTED', reason_code: 'LEARNER_NOT_ELIGIBLE' };
      }
      const instructor = state.actors[instructor_id];
      if (!instructor) {
        return { status: 'REJECTED', reason_code: 'INSTRUCTOR_NOT_FOUND' };
      }
      if (actor.location_id !== 'room.mana.practice' && actor.location_id !== 'room.mana.classroom') {
        return { status: 'REJECTED', reason_code: 'LESSON_REQUIRES_MANA_SCHOOL' };
      }
      if (instructor.location_id !== actor.location_id) {
        return { status: 'REJECTED', reason_code: 'INSTRUCTOR_NOT_CO_LOCATED' };
      }
      return { status: 'ACCEPTED', reason_code: 'LESSON_AUTHORIZED', subject: subject ?? 'khan_yorman_basics' };
    }

    case 'drill': {
      if (actor.location_id !== 'room.combat.terrace') {
        return { status: 'REJECTED', reason_code: 'DRILL_REQUIRES_COMBAT_TERRACE' };
      }
      return { status: 'ACCEPTED', reason_code: 'DRILL_AUTHORIZED' };
    }

    case 'sintese': {
      if (actor_id !== 'actor.aysha') {
        return { status: 'REJECTED', reason_code: 'ONLY_AYSHA_WIELDS_SINTESE' };
      }
      if (actor.location_id !== 'room.synthesis.chamber') {
        return { status: 'REJECTED', reason_code: 'REQUIRES_SYNTHESIS_CHAMBER' };
      }
      const { recipe_id } = command;
      const recipe = APPROVED_RECIPES[recipe_id];
      if (!recipe || !recipe.requires_sintese) {
        return { status: 'REJECTED', reason_code: 'UNAPPROVED_SINTESE_RECIPE' };
      }
      if ((actor.khan_personal ?? 0) < recipe.inputs.khan_personal) {
        return { status: 'REJECTED', reason_code: 'INSUFFICIENT_KHAN' };
      }
      if ((actor.yorman_personal ?? 0) < recipe.inputs.yorman_personal) {
        return { status: 'REJECTED', reason_code: 'INSUFFICIENT_YORMAN' };
      }
      return {
        status: 'ACCEPTED',
        reason_code: 'SINTESE_AFFORDABLE',
        cost: recipe.inputs,
        outputs: recipe.outputs
      };
    }

    case 'talk': {
      const { target_actor_id } = command;
      const target = state.actors[target_actor_id];
      if (!target) {
        return { status: 'REJECTED', reason_code: 'TARGET_NOT_FOUND' };
      }
      if (actor.location_id !== target.location_id) {
        return { status: 'REJECTED', reason_code: 'TARGET_NOT_CO_LOCATED' };
      }
      return { status: 'ACCEPTED', reason_code: 'CONVERSATION_PERMITTED' };
    }

    case 'trade': {
      const { target_actor_id, offer_item, request_item } = command;
      const target = state.actors[target_actor_id];
      if (!target) {
        return { status: 'REJECTED', reason_code: 'TARGET_NOT_FOUND' };
      }
      if (actor.location_id !== target.location_id) {
        return { status: 'REJECTED', reason_code: 'TARGET_NOT_CO_LOCATED' };
      }
      if (offer_item && !actor.inventory.includes(offer_item)) {
        return { status: 'REJECTED', reason_code: 'ACTOR_LACKS_OFFERED_ITEM', item: offer_item };
      }
      if (request_item && !target.inventory.includes(request_item)) {
        return { status: 'REJECTED', reason_code: 'TARGET_LACKS_REQUESTED_ITEM', item: request_item };
      }
      return {
        status: 'ACCEPTED',
        reason_code: 'TRADE_AUTHORIZED',
        offer_item: offer_item ?? null,
        request_item: request_item ?? null
      };
    }

    case 'vote': {
      const { proposal_id, choice } = command;
      const validChambers = ['room.heartwood.commons', 'room.douglas.salon'];
      if (!validChambers.includes(actor.location_id)) {
        return { status: 'REJECTED', reason_code: 'VOTING_REQUIRES_COUNCIL_CHAMBER', location: actor.location_id };
      }
      if (!proposal_id || !choice) {
        return { status: 'REJECTED', reason_code: 'INVALID_VOTE_SPEC' };
      }
      return {
        status: 'ACCEPTED',
        reason_code: 'VOTE_RECORDED',
        proposal_id,
        choice
      };
    }

    default:
      return { status: 'REJECTED', reason_code: 'UNKNOWN_COMMAND_TYPE', type };
  }
}
