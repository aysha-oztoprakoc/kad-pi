// Gaya Content Registry & Epistemic Boundaries
// Enforces Section 3 (Provenance) and Section 4 (Canon) of the Technical Handoff.

export const EPISTEMIC_STATUS = Object.freeze({
  APPROVED_CANON: 'APPROVED_CANON',
  PROPOSED_DESIGN: 'PROPOSED_DESIGN',
  SIMULATED_EVENT: 'SIMULATED_EVENT',
  CHARACTER_BELIEF: 'CHARACTER_BELIEF',
  DISPUTED_CLAIM: 'DISPUTED_CLAIM',
  UNKNOWN: 'UNKNOWN'
});

export const CANON_CODEX = Object.freeze({
  cosmology: {
    khan: {
      id: 'cosmology.khan',
      name: 'Khan (Knaerethum)',
      status: EPISTEMIC_STATUS.APPROVED_CANON,
      description: 'Cosmic primordial of tangible matter, physical existence, and manifested substance.',
      provenance: 'Gaya Tabletop Canon / As Crônicas de Gaya'
    },
    yorman: {
      id: 'cosmology.yorman',
      name: 'Yorman (Eorarmethum)',
      status: EPISTEMIC_STATUS.APPROVED_CANON,
      description: 'Cosmic primordial of possibility, abstract consciousness, will, and soul.',
      provenance: 'Gaya Tabletop Canon / As Crônicas de Gaya'
    },
    roukash: {
      id: 'cosmology.roukash_tashtael',
      name: 'Roukash Tashtael',
      status: EPISTEMIC_STATUS.APPROVED_CANON,
      description: 'Third Primordial energy Titan associated with abyss and nothingness. Proisb patron deity.',
      direct_action_allowed: false,
      provenance: 'Gaya Tabletop Canon'
    },
    city_khan_yorman_reserve: {
      id: 'cosmology.city_reserve',
      name: 'City-Scale Khan/Yorman Reserve',
      status: EPISTEMIC_STATUS.UNKNOWN,
      description: 'Total reserve from the converted city used to raise the YKT refuge tree. Exact quantities remain UNKNOWN.',
      quantity: null,
      provenance: 'Deliberately uninvented per Handoff Section 4.1'
    }
  },

  actors: {
    aysha: {
      id: 'actor.aysha',
      name: 'Ayşa Öztoprak',
      titles: ['Trovão Lampejante', 'Lampejo Trovejante', 'Fulgor Negro'],
      status: EPISTEMIC_STATUS.APPROVED_CANON,
      role: 'Primary Player Persona / Builder / Síntese Operator',
      species: 'Amethyst Dragonborn',
      class: 'Dragoon (Cavaleiro do Dragão) Level 7',
      equipment: ['item.crosta_de_kravarius', 'item.nyr_blade', 'item.zhar_blade'],
      pending_crafts: ['item.manto_de_kravarius'],
      stats: { hp_max: 68, hp_current: 68, khan_personal: 20, yorman_personal: 15 },
      provenance: 'Gaya Canon Character Sheet V2'
    },
    amethysta: {
      id: 'actor.amethysta',
      name: 'Amethysta',
      status: EPISTEMIC_STATUS.APPROVED_CANON,
      role: 'Learner / Daughter of Ayşa',
      presentation: 'Halfling child presentation (12yo) / Young Amethyst Dragon',
      weapon_allowed: false,
      combat_style: 'Psionic / Innate violet lightning breath and cantrips only',
      stats: { hp_max: 42, hp_current: 42, hunger: 0.2, fatigue: 0.1 },
      provenance: 'Gaya Canon Character Sheet V2'
    },
    begonio: {
      id: 'actor.begonio',
      name: 'Begonio',
      status: EPISTEMIC_STATUS.APPROVED_CANON,
      role: 'Evocation Wizard / Khan & Yorman Instructor',
      provenance: 'Gaya Canon'
    },
    douglas: {
      id: 'actor.douglas',
      name: 'Douglas',
      status: EPISTEMIC_STATUS.APPROVED_CANON,
      role: 'Bard / Manners Teacher / Host / Mediator',
      persuasion_forces_player: false,
      provenance: 'Gaya Canon'
    },
    proisb: {
      id: 'actor.proisb',
      name: 'Proisb',
      status: EPISTEMIC_STATUS.APPROVED_CANON,
      role: 'Religious Instructor & Roukash Devotee',
      teachings_are_beliefs: true,
      provenance: 'Gaya Canon'
    },
    lylia: {
      id: 'actor.lylia',
      name: 'Lylia, Centelha de Sofia',
      status: EPISTEMIC_STATUS.APPROVED_CANON,
      role: 'Alternate Player Persona / Shepherd Druid 3 / Divine Soul Sorcerer 3',
      provenance: 'Gaya Canon Character Sheet V2'
    }
  },

  items: {
    crosta_de_kravarius: {
      id: 'item.crosta_de_kravarius',
      name: 'Crosta de Kravarius',
      status: EPISTEMIC_STATUS.APPROVED_CANON,
      type: 'armor',
      crafted: true,
      owner: 'actor.aysha',
      description: 'Half-plate forged from elder dragon Kravarius molted scales.'
    },
    nyr_blade: {
      id: 'item.nyr_blade',
      name: 'Nyr',
      status: EPISTEMIC_STATUS.APPROVED_CANON,
      type: 'weapon',
      crafted: true,
      owner: 'actor.aysha',
      aspect: 'Yorman (lunar, reflective)'
    },
    zhar_blade: {
      id: 'item.zhar_blade',
      name: 'Zhar',
      status: EPISTEMIC_STATUS.APPROVED_CANON,
      type: 'weapon',
      crafted: true,
      owner: 'actor.aysha',
      aspect: 'Khan (solar, kinetic)'
    },
    manto_de_kravarius: {
      id: 'item.manto_de_kravarius',
      name: 'Manto de Kravarius',
      status: EPISTEMIC_STATUS.PROPOSED_DESIGN,
      type: 'pending_craft',
      crafted: false,
      intended_recipient: 'actor.amethysta',
      description: 'Proposed enchanted mantle redirecting damage across the bond. Must not be treated as already crafted.'
    }
  }
});
