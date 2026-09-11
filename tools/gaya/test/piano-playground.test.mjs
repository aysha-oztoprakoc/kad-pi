import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PianoAgent,
  PianoCivilizationSimulation,
  GAYA_MEMEPLEX,
  getStandardGayaProfiles
} from '../simulation/piano-playground.mjs';
import { computeStateHash } from '../kernel/state.mjs';

test('PIANO Modules - Parallel Information Aggregation in Cognitive Controller', () => {
  const agent = new PianoAgent('actor.aysha', {
    id: 'actor.aysha',
    duty: 'cook',
    canCook: true,
    initialMemes: [GAYA_MEMEPLEX.KHAN_VITALITY.id]
  });

  // Verify all 5 concurrent modules are initialized
  assert.ok(agent.memory);
  assert.ok(agent.proprioception);
  assert.ok(agent.social);
  assert.ok(agent.actionAwareness);
  assert.ok(agent.planner);
  assert.ok(agent.cognitiveController);

  assert.ok(agent.memory.hasMeme(GAYA_MEMEPLEX.KHAN_VITALITY.id));
  assert.equal(agent.memory.hasMeme(GAYA_MEMEPLEX.YORMAN_EQUILIBRIUM.id), false);
});

test('PIANO Action Awareness - Prevents Naive Action Spinning Upon Rejection', () => {
  const agent = new PianoAgent('actor.amethysta', {
    id: 'actor.amethysta',
    duty: 'learner'
  });

  const cmd = { actor_id: 'actor.amethysta', type: 'eat' };
  const rejectedReceipt = { status: 'REJECTED', reason_code: 'NO_PREPARED_MEALS_AVAILABLE' };

  agent.actionAwareness.notifyReceipt(cmd, rejectedReceipt, 5);

  assert.equal(agent.actionAwareness.consecutiveFailures, 1);
  assert.equal(agent.actionAwareness.isTemporarilyBlocked('NO_PREPARED_MEALS_AVAILABLE', 5), true);
  assert.equal(agent.actionAwareness.isTemporarilyBlocked('NO_PREPARED_MEALS_AVAILABLE', 6), true);
  assert.equal(agent.actionAwareness.isTemporarilyBlocked('NO_PREPARED_MEALS_AVAILABLE', 7), false);
});

test('Emergent Civilizational Dynamics - Economy, Governance, and Cultural Diffusion', () => {
  const sim = new PianoCivilizationSimulation({ seed: 1337 });

  const initialInventoryTotal = Object.values(sim.state.actors).reduce(
    (acc, a) => acc + a.inventory.length,
    0
  );

  // Run 24 ticks (12 hours of settlement life)
  sim.runTicks(24);

  // 1. Economic Activity: Trades executed without losing or duplicating items (conservation law)
  assert.ok(sim.stats.tradesExecuted >= 1, `Expected trades, got ${sim.stats.tradesExecuted}`);
  const finalInventoryTotal = Object.values(sim.state.actors).reduce(
    (acc, a) => acc + a.inventory.length,
    0
  );
  assert.equal(finalInventoryTotal, initialInventoryTotal, 'Total inventory items must be conserved during trades');

  // 2. Governance: Votes recorded on settlement accord
  assert.ok(sim.stats.votesRecorded >= 1, `Expected votes cast, got ${sim.stats.votesRecorded}`);
  const ballot = sim.state.active_projects.find((p) => p.type === 'governance_ballot');
  assert.ok(ballot, 'Expected governance ballot project in state');
  assert.ok(Object.keys(ballot.votes).length >= 1, 'Expected recorded votes in ballot');

  // 3. Cultural Diffusion: Memes spread to peers
  const latestDiffusion = sim.stats.memeDiffusionTimeline[sim.stats.memeDiffusionTimeline.length - 1];
  assert.ok(latestDiffusion['meme:yorman_equilibrium'] >= 2, 'Yorman meme should diffuse to multiple actors');
  assert.ok(latestDiffusion['meme:douglas_courtesy'] >= 2, 'Courtesy meme should diffuse to multiple actors');

  // 4. Ledger & Hashes: Every tick and event recorded in ledger
  assert.ok(sim.ledger.events.length > 24, 'Ledger should record both ticks and sub-actions');
  const validChain = sim.ledger.verifyIntegrity();
  assert.equal(validChain.valid, true, 'Ledger cryptographic hash-chain must be intact');
});

test('Deterministic Replay Exactness Gate (PRIME_DIRECTIVE)', () => {
  const seed = 999;
  const simA = new PianoCivilizationSimulation({ seed });
  const simB = new PianoCivilizationSimulation({ seed });

  simA.runTicks(16);
  simB.runTicks(16);

  const hashA = computeStateHash(simA.state);
  const hashB = computeStateHash(simB.state);

  assert.equal(hashA, hashB, 'Two identical PIANO runs with same seed must yield identical state hash');
  assert.equal(simA.ledger.events.length, simB.ledger.events.length, 'Ledger length must match exactly');
  assert.equal(simA.stats.tradesExecuted, simB.stats.tradesExecuted, 'Economic metrics must match exactly');
  assert.equal(simA.stats.votesRecorded, simB.stats.votesRecorded, 'Governance metrics must match exactly');
});
