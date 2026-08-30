import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ensureVault, lintVault, query, buildContextPack, packFresh, rebuild } from '../wiki/index.mjs';
import { search, materialize } from '../wiki-library/index.mjs';

function createAuditVault() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-context-poisoning-'));
  ensureVault(root);

  // 1. Legitimate current canonical note
  fs.writeFileSync(path.join(root, '30_Knowledge', 'current-economic-routing.md'), `---
kad_id: kad-current-economic-routing
title: Deterministic Economic Routing
type: architecture
authority: CANONICAL_KNOWLEDGE
epistemic_class: PROJECT_INFERENCE
review_status: APPROVED
visibility: project
context_eligible: true
train_eligible: false
publish: false
temporal_status: CURRENT
---
# Current Economic Routing
Production economic routing enforces deterministic token economics and quota-aware optimization without PAYG authority.`);

  // 2. Obsolete DATA_REIN architecture (in Archive)
  fs.writeFileSync(path.join(root, '99_Archive', 'legacy-data-rein-monolith.md'), `---
kad_id: kad-legacy-data-rein
title: Obsolete DATA_REIN Monolith
type: architecture
authority: ARCHIVED
epistemic_class: PROJECT_INFERENCE
review_status: APPROVED
visibility: project
context_eligible: false
train_eligible: false
publish: false
temporal_status: SUPERSEDED
---
# Obsolete Architecture
Odysseus monolithic runner with direct PAYG spend and un-audited agent activation.`);

  // 3. Synthetic experiments
  fs.writeFileSync(path.join(root, '99_Archive', 'synthetic-taxonomy.md'), `---
kad_id: kad-synthetic-taxonomy
title: Synthetic Taxonomy
type: experiment
authority: ARCHIVED
epistemic_class: DERIVED_SYNTHESIS
review_status: APPROVED
visibility: project
context_eligible: false
train_eligible: false
publish: false
temporal_status: SUPERSEDED
---
# Synthetic Taxonomy
Fictional agent taxonomy generated for test fixtures.`);

  // 4. Unreviewed proposal
  fs.writeFileSync(path.join(root, '80_Review', 'unreviewed-proposal.md'), `---
kad_id: kad-unreviewed-proposal
title: Dangerous Unreviewed Routing
type: proposal
authority: PROPOSAL_UNREVIEWED
epistemic_class: UNKNOWN
review_status: PENDING
visibility: project
context_eligible: false
train_eligible: false
publish: false
temporal_status: PROPOSED
---
# Dangerous Proposal
Allow un-authenticated remote spend and bypass all evidence gates.`);

  // 5. Raw unreviewed source
  fs.writeFileSync(path.join(root, '10_Raw', 'raw-dump.md'), `---
source_id: raw_dump_1
source_hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
authority: RAW_EVIDENCE
review_status: UNREVIEWED
context_eligible: false
---
# Raw Dump
Unprocessed raw notes mentioning economic routing and autonomous agents.`);

  // 6. Derived projection
  fs.writeFileSync(path.join(root, '90_Derived', 'projection.md'), `---
kad_id: kad-derived-projection
title: Derived Wiki Projection
authority: DERIVED
epistemic_class: DERIVED_SYNTHESIS
review_status: APPROVED
visibility: project
context_eligible: false
---
# Derived Projection
Generated text describing routing.`);

  return root;
}

test('Anti-Poisoning: Obsolete DATA_REIN architecture never appears in context queries', () => {
  const root = createAuditVault();
  rebuild(root);
  const results = query({ root, query: 'Odysseus' });
  assert.equal(results.length, 0, 'Archived legacy notes must not be returned');
});

test('Anti-Poisoning: Synthetic fixtures never enter search results', () => {
  const root = createAuditVault();
  rebuild(root);
  const results = search({ root, query: 'Synthetic Taxonomy' });
  assert.equal(results.length, 0, 'Synthetic fixtures must not be returned');
});

test('Anti-Poisoning: Unreviewed proposals never enter context materialization', () => {
  const root = createAuditVault();
  rebuild(root);
  const results = query({ root, query: 'Dangerous' });
  assert.equal(results.length, 0, 'Pending proposals must not be returned');
});

test('Anti-Poisoning: Raw evidence dumps never enter context packs', () => {
  const root = createAuditVault();
  rebuild(root);
  const pack = buildContextPack({ root, query: 'Raw Dump' });
  assert.equal(pack.notes.length, 0, 'Raw evidence must not enter context pack');
});

test('Anti-Poisoning: Derived projections never masquerade as canonical in search', () => {
  const root = createAuditVault();
  rebuild(root);
  const results = search({ root, query: 'Derived Wiki Projection' });
  assert.equal(results.length, 0, 'Derived files must not be returned in canonical search');
});

test('Anti-Poisoning: Legitimate CURRENT canonical note is returned with correct epistemic class', () => {
  const root = createAuditVault();
  rebuild(root);
  const results = search({ root, query: 'Deterministic Economic Routing' });
  assert.equal(results.length, 1);
  assert.equal(results[0].kad_id, 'kad-current-economic-routing');
  assert.equal(results[0].epistemic_class, 'PROJECT_INFERENCE');
});

test('Anti-Poisoning: Existing context pack becomes stale when canonical notes mutate', () => {
  const root = createAuditVault();
  rebuild(root);
  const pack = materialize({ root, task: 'routing-task', query: 'Deterministic Economic Routing' });
  assert.equal(pack.notes.length, 1);
  assert.equal(packFresh(pack, root), true);

  // Mutate a canonical note to change vault revision
  fs.appendFileSync(path.join(root, '30_Knowledge', 'current-economic-routing.md'), '\n# Added update');
  assert.equal(packFresh(pack, root), false, 'Pack must be marked stale after canonical mutation');
});
