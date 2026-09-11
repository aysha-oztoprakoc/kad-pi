// YKT Refuge Room Graph and Facility Definitions
// Follows Section 4.4 and Section 4.5 of the Technical Handoff.

import { EPISTEMIC_STATUS } from './codex.mjs';

export const REFUGE_ROOMS = Object.freeze({
  'room.arrival.terrace': {
    id: 'room.arrival.terrace',
    name: 'Landing Terrace',
    zone: 'Arrival',
    status: EPISTEMIC_STATUS.PROPOSED_DESIGN,
    description: 'Suspended stone terrace catching valley winds, equipped with heavy cargo hoists.',
    connections: ['room.heartwood.commons'],
    facilities: ['cargo_hoist', 'observation_post']
  },

  'room.heartwood.commons': {
    id: 'room.heartwood.commons',
    name: 'Heartwood Commons',
    zone: 'Heartwood',
    status: EPISTEMIC_STATUS.PROPOSED_DESIGN,
    description: 'The central bough and public square of the refuge. Great hearth with long wooden tables.',
    connections: [
      'room.arrival.terrace',
      'room.heartwood.kitchen',
      'room.residential.hall',
      'room.mana.classroom',
      'room.combat.terrace',
      'room.douglas.salon',
      'room.synthesis.chamber'
    ],
    facilities: ['great_hearth', 'dining_tables', 'announcement_board']
  },

  'room.heartwood.kitchen': {
    id: 'room.heartwood.kitchen',
    name: 'Kitchen & Preparation Hearth',
    zone: 'Heartwood',
    status: EPISTEMIC_STATUS.PROPOSED_DESIGN,
    description: 'Warm hearth with roasting spits, herb drying racks, and prep tables.',
    connections: ['room.heartwood.commons', 'room.heartwood.pantry'],
    facilities: ['cooking_hearth', 'butcher_block']
  },

  'room.heartwood.pantry': {
    id: 'room.heartwood.pantry',
    name: 'Refuge Larder & Pantry',
    zone: 'Heartwood',
    status: EPISTEMIC_STATUS.PROPOSED_DESIGN,
    description: 'Cool root cellar preserving dried meats, tubers, salt grains, and tea canisters.',
    connections: ['room.heartwood.kitchen'],
    facilities: ['cold_storage', 'grain_bins']
  },

  'room.residential.hall': {
    id: 'room.residential.hall',
    name: 'Residential Bough Avenue',
    zone: 'Residential',
    status: EPISTEMIC_STATUS.PROPOSED_DESIGN,
    description: 'Quiet curving wooden corridor branching into family and learner quarters.',
    connections: ['room.heartwood.commons', 'room.residential.aysha', 'room.residential.amethysta'],
    facilities: ['lantern_alcove', 'wash_basin']
  },

  'room.residential.aysha': {
    id: 'room.residential.aysha',
    name: 'Ayşa’s Quarters',
    zone: 'Residential',
    status: EPISTEMIC_STATUS.PROPOSED_DESIGN,
    description: 'Austere officer’s room with weapon racks, a desk of field maps, and heavy blankets.',
    connections: ['room.residential.hall'],
    facilities: ['officer_bed', 'weapon_rack', 'armor_stand']
  },

  'room.residential.amethysta': {
    id: 'room.residential.amethysta',
    name: 'Amethysta’s Quarters',
    zone: 'Residential',
    status: EPISTEMIC_STATUS.PROPOSED_DESIGN,
    description: 'Sunlit bough room lined with smooth colored river stones, soft cushions, and sketch scrolls.',
    connections: ['room.residential.hall'],
    facilities: ['nesting_cushions', 'mineral_shelf']
  },

  'room.mana.classroom': {
    id: 'room.mana.classroom',
    name: 'Mana Instruction Classroom',
    zone: 'Mana School',
    status: EPISTEMIC_STATUS.PROPOSED_DESIGN,
    description: 'Tiered wooden benches, slate blackboards showing Khan/Yorman diagrams, and Begonio’s lectern.',
    connections: ['room.heartwood.commons', 'room.mana.practice'],
    facilities: ['lectern', 'slate_boards', 'chalk_cabinet']
  },

  'room.mana.practice': {
    id: 'room.mana.practice',
    name: 'Warded Practice Chamber',
    zone: 'Mana School',
    status: EPISTEMIC_STATUS.PROPOSED_DESIGN,
    description: 'Reinforced runic root dome for casting drills and energy absorption exercises.',
    connections: ['room.mana.classroom'],
    facilities: ['ward_circle', 'mana_resonance_crystals']
  },

  'room.combat.terrace': {
    id: 'room.combat.terrace',
    name: 'Combat Terrace & Drill Course',
    zone: 'Combat Terrace',
    status: EPISTEMIC_STATUS.PROPOSED_DESIGN,
    description: 'Spacious open terrace paved with interlocking root slabs. Wooden practice dummies and cover barriers.',
    connections: ['room.heartwood.commons'],
    facilities: ['drill_dummies', 'archery_butts', 'sparring_ring']
  },

  'room.douglas.salon': {
    id: 'room.douglas.salon',
    name: 'Courtesy Salon & Music Hall',
    zone: 'Douglas’s Bough',
    status: EPISTEMIC_STATUS.PROPOSED_DESIGN,
    description: 'Polished resonant floorboards, comfortable divans, lute stands, and tea services.',
    connections: ['room.heartwood.commons'],
    facilities: ['harpsichord', 'tea_table', 'sheet_music_archive']
  },

  'room.synthesis.chamber': {
    id: 'room.synthesis.chamber',
    name: 'Síntese Working Chamber',
    zone: 'Synthesis Chamber',
    status: EPISTEMIC_STATUS.PROPOSED_DESIGN,
    description: 'Secluded chamber isolated from living timber where Ayşa inspects skeins and transmutes matter.',
    connections: ['room.heartwood.commons'],
    facilities: ['slate_working_slab', 'sample_vault', 'resonance_crucible']
  }
});
