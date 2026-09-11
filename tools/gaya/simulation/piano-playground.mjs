#!/usr/bin/env node
/**
 * tools/gaya/simulation/piano-playground.mjs
 * 
 * Replication of Project Sid (Altera.AL / arXiv:2411.00114) PIANO Architecture
 * (Parallel Information Aggregation via Neural Orchestration) integrated within
 * KAD-PI and Gaya RPG.
 * 
 * Features:
 * 1. Concurrent Cognitive Modules (Memory, Proprioception, Social Awareness, Action Awareness, Planning)
 * 2. Cognitive Controller (CC) with reactive arbitration (PON / Pilar 1) & formal transition (Pilar 2)
 * 3. Emergent Civilizational Dynamics:
 *    - Emergent Market Economy (gem/mana currency exchange)
 *    - Professional Specialization (dynamic role distribution)
 *    - Decentralized Governance (voting & dispute mediation)
 *    - Cultural & Memetic Transmission (Khan vs Yorman cosmological diffusion)
 * 4. Deterministic Ledger & State Verification (PRIME_DIRECTIVE compliant)
 */

import { createHash } from 'node:crypto';
import { createInitialState, computeStateHash, cloneState } from '../kernel/state.mjs';
import { EventLedger } from '../kernel/ledger.mjs';
import { applyTick } from '../kernel/transition.mjs';
import { REFUGE_ROOMS, APPROVED_RECIPES } from '../content/registry.mjs';

/**
 * Deterministic Mulberry32 PRNG
 */
export function createDeterministicRng(seed = 1337) {
  let s = Math.floor(seed) >>> 0;
  return function next() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Available Cultural Memes in Gaya RPG
export const GAYA_MEMEPLEX = Object.freeze({
  KHAN_VITALITY: {
    id: 'meme:khan_vitality',
    name: 'Vitalidade de Khan',
    description: 'Ação afirmativa, transformação cinética e expansão destemida.',
    energy: 'khan'
  },
  YORMAN_EQUILIBRIUM: {
    id: 'meme:yorman_equilibrium',
    name: 'Equilíbrio de Yorman',
    description: 'Ordem, contenção abjuradora e preservação metódica da estrutura.',
    energy: 'yorman'
  },
  DOUGLAS_COURTESY: {
    id: 'meme:douglas_courtesy',
    name: 'Cortesia do Refúgio',
    description: 'Diplomacia, hospitalidade mútua, consenso comunitário e música.',
    energy: 'neutral'
  },
  SINTESE_HARMONY: {
    id: 'meme:sintese_harmony',
    name: 'Harmonia da Síntese',
    description: 'Fusão alquímica dos opostos para transmutação do mundo.',
    energy: 'sintese'
  }
});

/**
 * Module 1: Memory Module
 * Handles working memory, episodic recalls from ledger, and relational affinity.
 */
export class PianoMemoryModule {
  constructor(actorId) {
    this.actorId = actorId;
    this.episodicLedger = [];
    this.socialAffinity = new Map(); // targetActorId -> score (-1.0 to 1.0)
    this.memesAdopted = new Set();
    this.activeGoals = [];
    this.lastTradeTick = -10;
    this.votedProposals = new Set();
  }

  recordEvent(event) {
    this.episodicLedger.push(event);
    if (this.episodicLedger.length > 50) {
      this.episodicLedger.shift();
    }
  }

  adjustAffinity(targetId, delta) {
    const current = this.socialAffinity.get(targetId) ?? 0.2;
    const updated = Math.max(-1.0, Math.min(1.0, current + delta));
    this.socialAffinity.set(targetId, updated);
  }

  hasMeme(memeId) {
    return this.memesAdopted.has(memeId);
  }

  adoptMeme(memeId) {
    this.memesAdopted.add(memeId);
  }
}

/**
 * Module 2: Proprioception & Internal State Module
 * Tracks vital physiological and energetic needs.
 */
export class PianoProprioceptionModule {
  constructor(actorId) {
    this.actorId = actorId;
  }

  evaluate(actorState, globalResources) {
    const hunger = actorState.hunger ?? 0;
    const fatigue = actorState.fatigue ?? 0;
    const hasMealsAvailable = (globalResources['resource.served_meals'] ?? 0) > 0;
    const foodStock = globalResources['resource.food_stock'] ?? 0;

    return {
      hungerLevel: hunger,
      fatigueLevel: fatigue,
      isStarving: hunger >= 0.7,
      isExhausted: fatigue >= 0.75,
      hasMealsAvailable,
      foodStock,
      khanMana: actorState.khan_personal ?? 0,
      yormanMana: actorState.yorman_personal ?? 0,
      inventory: [...(actorState.inventory || [])]
    };
  }
}

/**
 * Module 3: Action Awareness Module
 * Self-monitoring of execution feedback. Ablation disrupts social propagation!
 */
export class PianoActionAwarenessModule {
  constructor(actorId) {
    this.actorId = actorId;
    this.lastCommand = null;
    this.lastReceipt = null;
    this.consecutiveFailures = 0;
    this.blockedActions = new Map(); // reason_code -> tickExpiry
  }

  notifyReceipt(command, receipt, currentTick) {
    this.lastCommand = command;
    this.lastReceipt = receipt;

    if (receipt.status === 'REJECTED') {
      this.consecutiveFailures++;
      // Block this command type/reason for next 2 ticks to prevent naive spinning
      this.blockedActions.set(receipt.reason_code, currentTick + 2);
    } else {
      this.consecutiveFailures = 0;
    }
  }

  isTemporarilyBlocked(reasonCode, currentTick) {
    const expiry = this.blockedActions.get(reasonCode);
    if (!expiry) return false;
    if (currentTick >= expiry) {
      this.blockedActions.delete(reasonCode);
      return false;
    }
    return true;
  }
}

/**
 * Module 4: Social Awareness Module
 * Monitors co-located agents, active dialogues, and trading opportunities.
 */
export class PianoSocialAwarenessModule {
  constructor(actorId) {
    this.actorId = actorId;
  }

  observe(roomState, allActors) {
    const presentActors = (roomState.occupants || [])
      .filter((id) => id !== this.actorId)
      .map((id) => allActors[id])
      .filter(Boolean);

    return {
      coLocatedCount: presentActors.length,
      peers: presentActors,
      hasPeers: presentActors.length > 0
    };
  }
}

/**
 * Module 5: Planning Module (Hierarchical SMDP Options - Q15 / Barreto 2021)
 * Decomposes long-term duty into executable macro-actions.
 */
export class PianoPlanningModule {
  constructor(actorProfile) {
    this.profile = actorProfile;
    this.currentOption = null;
  }

  selectOption({ proprio, social, memory, actionAwareness, currentTick }) {
    // 1. Critical Survival Vitals
    if (proprio.isStarving && !actionAwareness.isTemporarilyBlocked('NO_PREPARED_MEALS_AVAILABLE', currentTick)) {
      return { type: 'OPTION_EAT', urgency: 1.0 };
    }
    if (proprio.isExhausted) {
      return { type: 'OPTION_REST', urgency: 0.9 };
    }

    // 2. Settlement Specialization Duty
    if (this.profile.duty === 'cook' && proprio.foodStock >= 2 && !proprio.hasMealsAvailable) {
      return { type: 'OPTION_COOK', urgency: 0.85 };
    }

    // Learner attends lesson if instructor is present
    if (this.profile.duty === 'learner' && social.hasPeers) {
      const instructor = social.peers.find((p) => p.active_duty === 'teaching');
      if (instructor) {
        return { type: 'OPTION_LESSON', instructorId: instructor.id, urgency: 0.8 };
      }
    }

    // 3. Decentralized Governance (Vote on community proposals if co-located in council chamber)
    const chamberRooms = ['room.heartwood.commons', 'room.douglas.salon'];
    const isCouncilChamber = chamberRooms.includes(this.profile.homeRoom) || social.hasPeers;
    const pendingProposal = 'proposal.refuge_common_accord';
    if (isCouncilChamber && social.hasPeers && !memory.votedProposals.has(pendingProposal)) {
      return { type: 'OPTION_VOTE', proposalId: pendingProposal, urgency: 0.75 };
    }

    // 4. Emergent Economy (Trade if carrying goods and cooldown satisfied)
    if (social.hasPeers && proprio.inventory.length > 0 && currentTick - memory.lastTradeTick >= 4) {
      const peerWithInventory = social.peers.find((p) => p.inventory && p.inventory.length > 0);
      if (peerWithInventory) {
        return { type: 'OPTION_TRADE', peer: peerWithInventory, urgency: 0.7 };
      }
    }

    // 5. Cultural & Memetic Transmission
    if (social.hasPeers && memory.memesAdopted.size > 0) {
      return { type: 'OPTION_MEME_TRANSMISSION', peer: social.peers[0], urgency: 0.6 };
    }

    // 6. Default Routine / Stroll
    return { type: 'OPTION_ROUTINE', urgency: 0.3 };
  }
}

/**
 * PIANO Cognitive Controller (CC)
 * The arbitration bottleneck coordinating parallel streams into a single valid command.
 */
export class PianoCognitiveController {
  constructor(agent, rng = null) {
    this.agent = agent;
    this.rng = rng || Math.random;
  }

  arbitrate(worldState) {
    const { actorId, profile } = this.agent;
    const actor = worldState.actors[actorId];
    if (!actor) return null;

    const currentRoom = REFUGE_ROOMS[actor.location_id];
    const roomState = worldState.rooms[actor.location_id];

    // 1. Run all 4 perception streams concurrently
    const proprio = this.agent.proprioception.evaluate(actor, worldState.resources);
    const social = this.agent.social.observe(roomState, worldState.actors);
    const actionAwareness = this.agent.actionAwareness;
    const memory = this.agent.memory;

    // 2. Run planning module over parallel aggregated information
    const option = this.agent.planner.selectOption({
      proprio,
      social,
      memory,
      actionAwareness,
      currentTick: worldState.tick
    });
    const cmdId = `piano-${actorId}-t${worldState.tick}`;

    // 3. Translate winning option to atomic Gaya command
    switch (option.type) {
      case 'OPTION_EAT': {
        const diningRooms = ['room.heartwood.commons', 'room.heartwood.kitchen'];
        if (!diningRooms.includes(actor.location_id)) {
          // Pathfind to commons
          const nextHop = this.findPath(actor.location_id, 'room.heartwood.commons');
          if (nextHop) {
            return { command_id: cmdId, actor_id: actorId, type: 'move', to_room_id: nextHop };
          }
        }
        if (proprio.hasMealsAvailable) {
          return { command_id: cmdId, actor_id: actorId, type: 'eat' };
        } else if (profile.canCook && actor.location_id === 'room.heartwood.kitchen') {
          return { command_id: cmdId, actor_id: actorId, type: 'cook' };
        }
        break;
      }

      case 'OPTION_COOK': {
        if (actor.location_id !== 'room.heartwood.kitchen') {
          const nextHop = this.findPath(actor.location_id, 'room.heartwood.kitchen');
          if (nextHop) {
            return { command_id: cmdId, actor_id: actorId, type: 'move', to_room_id: nextHop };
          }
        }
        return { command_id: cmdId, actor_id: actorId, type: 'cook' };
      }

      case 'OPTION_REST': {
        const isResidential = actor.location_id.startsWith('room.residential') || actor.location_id === 'room.douglas.salon';
        if (!isResidential) {
          const target = profile.homeRoom || 'room.residential.bunk_a';
          const nextHop = this.findPath(actor.location_id, target);
          if (nextHop) {
            return { command_id: cmdId, actor_id: actorId, type: 'move', to_room_id: nextHop };
          }
        }
        return { command_id: cmdId, actor_id: actorId, type: 'rest' };
      }

      case 'OPTION_LESSON': {
        if (actor.location_id !== 'room.mana.classroom' && actor.location_id !== 'room.mana.practice') {
          const nextHop = this.findPath(actor.location_id, 'room.mana.classroom');
          if (nextHop) {
            return { command_id: cmdId, actor_id: actorId, type: 'move', to_room_id: nextHop };
          }
        }
        const instructorId = option.instructorId || 'actor.begonio';
        return {
          command_id: cmdId,
          actor_id: actorId,
          type: 'lesson',
          instructor_id: instructorId,
          subject: 'khan_yorman_basics'
        };
      }

      case 'OPTION_VOTE': {
        const proposalId = option.proposalId || 'proposal.refuge_common_accord';
        memory.votedProposals.add(proposalId);
        return {
          command_id: cmdId,
          actor_id: actorId,
          type: 'vote',
          proposal_id: proposalId,
          choice: profile.voteChoice || 'YES'
        };
      }

      case 'OPTION_TRADE': {
        const peer = option.peer;
        const myItem = actor.inventory[0];
        const peerItem = peer.inventory[0];
        if (myItem && peerItem && myItem !== peerItem) {
          memory.lastTradeTick = worldState.tick;
          return {
            command_id: cmdId,
            actor_id: actorId,
            type: 'trade',
            target_actor_id: peer.id,
            offer_item: myItem,
            request_item: peerItem
          };
        }
        break;
      }

      case 'OPTION_MEME_TRANSMISSION': {
        const peer = option.peer;
        const meme = Array.from(memory.memesAdopted)[0];
        return {
          command_id: cmdId,
          actor_id: actorId,
          type: 'talk',
          target_actor_id: peer.id,
          topic: meme || 'refuge_welfare'
        };
      }

      case 'OPTION_ROUTINE': {
        // Socialize or explore adjacent room
        if (social.hasPeers && this.rng() < 0.4) {
          return {
            command_id: cmdId,
            actor_id: actorId,
            type: 'talk',
            target_actor_id: social.peers[0].id,
            topic: 'refuge_welfare'
          };
        }
        // Patrol / move to a connected room
        if (currentRoom.connections.length > 0 && this.rng() < 0.3) {
          const nextIdx = Math.floor(this.rng() * currentRoom.connections.length);
          const targetRoom = currentRoom.connections[nextIdx];
          return { command_id: cmdId, actor_id: actorId, type: 'move', to_room_id: targetRoom };
        }
        break;
      }
    }

    return null;
  }

  findPath(fromRoomId, toRoomId) {
    if (fromRoomId === toRoomId) return null;
    const queue = [[fromRoomId]];
    const visited = new Set([fromRoomId]);

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      if (current === toRoomId) {
        return path[1]; // First step towards target
      }

      const roomDef = REFUGE_ROOMS[current];
      if (roomDef && roomDef.connections) {
        for (const next of roomDef.connections) {
          if (!visited.has(next)) {
            visited.add(next);
            queue.push([...path, next]);
          }
        }
      }
    }
    return null;
  }
}

/**
 * Unified PIANO Agent
 */
export class PianoAgent {
  constructor(actorId, profile = {}, rng = null) {
    this.actorId = actorId;
    this.profile = profile;
    this.memory = new PianoMemoryModule(actorId);
    this.proprioception = new PianoProprioceptionModule(actorId);
    this.social = new PianoSocialAwarenessModule(actorId);
    this.actionAwareness = new PianoActionAwarenessModule(actorId);
    this.planner = new PianoPlanningModule(profile);
    this.cognitiveController = new PianoCognitiveController(this, rng);

    // Initial meme adoption
    if (profile.initialMemes) {
      for (const m of profile.initialMemes) {
        this.memory.adoptMeme(m);
      }
    }
  }
}

/**
 * Standard Gaya Canon Profiles for PIANO Simulation
 */
export function getStandardGayaProfiles() {
  return {
    'actor.aysha': {
      id: 'actor.aysha',
      name: 'Ayşa Öztoprak',
      duty: 'cook',
      canCook: true,
      homeRoom: 'room.residential.bunk_a',
      initialMemes: [GAYA_MEMEPLEX.KHAN_VITALITY.id, GAYA_MEMEPLEX.SINTESE_HARMONY.id]
    },
    'actor.amethysta': {
      id: 'actor.amethysta',
      name: 'Amethysta',
      duty: 'learner',
      canCook: false,
      homeRoom: 'room.residential.bunk_b',
      initialMemes: [GAYA_MEMEPLEX.DOUGLAS_COURTESY.id]
    },
    'actor.begonio': {
      id: 'actor.begonio',
      name: 'Begonio Nackle',
      duty: 'teaching',
      canCook: false,
      homeRoom: 'room.mana.classroom',
      initialMemes: [GAYA_MEMEPLEX.YORMAN_EQUILIBRIUM.id]
    },
    'actor.douglas': {
      id: 'actor.douglas',
      name: 'Douglas',
      duty: 'hospitality',
      canCook: false,
      homeRoom: 'room.douglas.salon',
      initialMemes: [GAYA_MEMEPLEX.DOUGLAS_COURTESY.id, GAYA_MEMEPLEX.YORMAN_EQUILIBRIUM.id]
    }
  };
}

/**
 * Full Civilization Simulation Playground Engine
 */
export class PianoCivilizationSimulation {
  constructor(options = {}) {
    this.seed = options.seed ?? 42;
    this.rng = createDeterministicRng(this.seed);
    this.state = createInitialState({ seed: this.seed });
    this.ledger = new EventLedger({ genesisHash: '0'.repeat(64) });
    this.agents = new Map();

    // Give actors initial barter items to kickstart economy
    this.state.actors['actor.amethysta'].inventory.push('item.gem_shard');
    this.state.actors['actor.begonio'].inventory.push('item.mana_crystal');

    // Initialize PIANO agents
    const profiles = options.profiles || getStandardGayaProfiles();
    for (const [id, profile] of Object.entries(profiles)) {
      if (this.state.actors[id]) {
        this.agents.set(id, new PianoAgent(id, profile, this.rng));
      }
    }

    // Telemetry and emergent stats
    this.stats = {
      tradesExecuted: 0,
      dialoguesConversed: 0,
      lessonsConducted: 0,
      mealsCooked: 0,
      mealsConsumed: 0,
      votesRecorded: 0,
      memeDiffusionTimeline: []
    };
  }

  step() {
    // 1. Gather commands concurrently from each agent's Cognitive Controller
    const commands = [];
    for (const agent of this.agents.values()) {
      const cmd = agent.cognitiveController.arbitrate(this.state);
      if (cmd) {
        commands.push(cmd);
      }
    }

    // 2. Submit to deterministic state transition
    const tickResult = applyTick(this.state, commands, this.ledger);

    // 3. Process receipts and feedback to Action Awareness and Memory
    for (const res of tickResult.receipts) {
      const agent = this.agents.get(res.command.actor_id);
      if (agent) {
        const receipt = res.status ? res : res.receipt;
        agent.actionAwareness.notifyReceipt(res.command, receipt, this.state.tick);
      }

      // Track emergent metrics
      if (res.status === 'ACCEPTED') {
        const cmd = res.command;
        if (cmd.type === 'trade') {
          this.stats.tradesExecuted++;
        } else if (cmd.type === 'cook') {
          this.stats.mealsCooked++;
        } else if (cmd.type === 'eat') {
          this.stats.mealsConsumed++;
        } else if (cmd.type === 'lesson') {
          this.stats.lessonsConducted++;
        } else if (cmd.type === 'vote') {
          this.stats.votesRecorded++;
        } else if (cmd.type === 'talk') {
          this.stats.dialoguesConversed++;
          // Cultural Transmission: receiver has chance to adopt meme
          if (cmd.topic && cmd.topic.startsWith('meme:')) {
            const targetAgent = this.agents.get(cmd.target_actor_id);
            if (targetAgent) {
              targetAgent.memory.adoptMeme(cmd.topic);
            }
          }
        }
      }
    }

    // 4. Record meme diffusion snapshot
    const memeSnapshot = { tick: this.state.tick };
    for (const memeKey of Object.keys(GAYA_MEMEPLEX)) {
      const memeId = GAYA_MEMEPLEX[memeKey].id;
      let count = 0;
      for (const agent of this.agents.values()) {
        if (agent.memory.hasMeme(memeId)) count++;
      }
      memeSnapshot[memeId] = count;
    }
    this.stats.memeDiffusionTimeline.push(memeSnapshot);

    return tickResult;
  }

  runTicks(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      results.push(this.step());
    }
    return results;
  }

  renderAsciiDashboard() {
    const lines = [];
    lines.push('╔══════════════════════════════════════════════════════════════════════════╗');
    lines.push(`║ GAYA RPG — PIANO CIVILIZATION PLAYGROUND (Project Sid Recreation)        ║`);
    lines.push(`║ Clock: ${this.state.time_str.padEnd(16)} Tick: ${String(this.state.tick).padEnd(6)} State Hash: ${computeStateHash(this.state).slice(0, 12)}... ║`);
    lines.push('╠══════════════════════════════════════════════════════════════════════════╣');
    lines.push('║ AGENTS & COGNITIVE STATUS:                                               ║');

    for (const [id, actor] of Object.entries(this.state.actors)) {
      const agent = this.agents.get(id);
      const memes = agent ? Array.from(agent.memory.memesAdopted).map((m) => m.replace('meme:', '')).join(',') : 'none';
      const inv = actor.inventory.map((i) => i.replace('item.', '')).join(', ') || 'empty';
      const vitals = `H:${Math.round(actor.hunger * 100)}% F:${Math.round(actor.fatigue * 100)}%`;
      const line = `║ • ${actor.name.padEnd(16)} | Room: ${actor.location_id.replace('room.', '').padEnd(18)} | ${vitals.padEnd(12)} ║`;
      lines.push(line);
      lines.push(`║   Inv: [${inv.slice(0, 32).padEnd(32)}] Memes: [${memes.slice(0, 20).padEnd(20)}] ║`);
    }

    lines.push('╠══════════════════════════════════════════════════════════════════════════╣');
    lines.push('║ EMERGENT CIVILIZATIONAL PHENOMENA:                                       ║');
    lines.push(`║ • Economy (Trades Executed):      ${String(this.stats.tradesExecuted).padEnd(6)} | Meals Cooked/Eaten: ${this.stats.mealsCooked}/${this.stats.mealsConsumed}   ║`);
    lines.push(`║ • Social (Dialogues / Lessons):   ${String(this.stats.dialoguesConversed).padEnd(6)} / ${String(this.stats.lessonsConducted).padEnd(6)} | Votes Recorded:     ${String(this.stats.votesRecorded).padEnd(6)}   ║`);

    const latestMemes = this.stats.memeDiffusionTimeline[this.stats.memeDiffusionTimeline.length - 1] || {};
    lines.push(`║ • Cultural Diffusion: Khan:${latestMemes['meme:khan_vitality'] ?? 0} | Yorman:${latestMemes['meme:yorman_equilibrium'] ?? 0} | Courtesy:${latestMemes['meme:douglas_courtesy'] ?? 0}     ║`);
    lines.push('╚══════════════════════════════════════════════════════════════════════════╝');
    return lines.join('\n');
  }
}

// CLI Execution Entry Point
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  let ticks = 24; // 12 hours default
  let seed = 42;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ticks' && i + 1 < args.length) ticks = parseInt(args[++i], 10);
    if (args[i] === '--seed' && i + 1 < args.length) seed = parseInt(args[++i], 10);
  }

  console.log(`Starting PIANO Civilization Playground for ${ticks} ticks (Seed: ${seed})...\n`);
  const sim = new PianoCivilizationSimulation({ seed });
  sim.runTicks(ticks);
  console.log(sim.renderAsciiDashboard());
}
