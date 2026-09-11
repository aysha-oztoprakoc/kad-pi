import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CANON_CODEX,
  REFUGE_ROOMS,
  APPROVED_RECIPES,
  EPISTEMIC_STATUS,
  getEntity,
  getRoom,
  getRecipe,
  isCanonApproved,
  isUnknown,
  isSinteseTargetEligible
} from '../content/registry.mjs';

test('Content Registry - Canon vs Unknown Epistemic Separation', () => {
  const aysha = getEntity('actor.aysha');
  assert.ok(aysha, 'Ayşa exists in codex');
  assert.equal(aysha.status, EPISTEMIC_STATUS.APPROVED_CANON);
  assert.equal(isCanonApproved(aysha), true);

  const cityReserve = getEntity('cosmology.city_reserve');
  assert.ok(cityReserve, 'City reserve exists in codex');
  assert.equal(cityReserve.status, EPISTEMIC_STATUS.UNKNOWN);
  assert.equal(isUnknown(cityReserve), true);
  assert.equal(cityReserve.quantity, null, 'Unknown quantity must remain null, never fabricated');

  const manto = getEntity('item.manto_de_kravarius');
  assert.ok(manto, 'Manto de Kravarius exists');
  assert.equal(manto.status, EPISTEMIC_STATUS.PROPOSED_DESIGN);
  assert.equal(manto.crafted, false, 'Manto must NOT be marked as already crafted');
});

test('Content Registry - Refuge Room Connectivity', () => {
  const commons = getRoom('room.heartwood.commons');
  assert.ok(commons, 'Heartwood Commons exists');
  assert.ok(commons.connections.includes('room.heartwood.kitchen'));
  assert.ok(commons.connections.includes('room.mana.classroom'));

  const kitchen = getRoom('room.heartwood.kitchen');
  assert.ok(kitchen.connections.includes('room.heartwood.commons'));
  assert.ok(kitchen.connections.includes('room.heartwood.pantry'));
});

test('Content Registry - Síntese Eligibility Predicate Invariants', () => {
  // Inanimate scrap is eligible
  const scrap = { id: 'material.wood_scraps', is_inanimate: true };
  const res1 = isSinteseTargetEligible(scrap, 'actor.aysha');
  assert.equal(res1.eligible, true);

  // Living deer is NOT eligible
  const deer = { id: 'entity.wild_deer', is_living: true, killed_by: null };
  const res2 = isSinteseTargetEligible(deer, 'actor.aysha');
  assert.equal(res2.eligible, false);
  assert.equal(res2.reason, 'LIVING_OR_UNCLAIMED_TARGET_INELIGIBLE');

  // Beast killed by Ayşa is eligible
  const huntedBoar = { id: 'entity.boar', is_living: false, killed_by: 'actor.aysha' };
  const res3 = isSinteseTargetEligible(huntedBoar, 'actor.aysha');
  assert.equal(res3.eligible, true);

  // Other actors cannot perform Síntese
  const res4 = isSinteseTargetEligible(scrap, 'actor.begonio');
  assert.equal(res4.eligible, false);
  assert.equal(res4.reason, 'ONLY_AYSHA_WIELDS_SINTESE');
});
