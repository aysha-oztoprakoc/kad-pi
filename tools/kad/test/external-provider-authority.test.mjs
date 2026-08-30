import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROVIDER_TAXONOMY_CLASSES,
  listExternalProviders,
  getExternalProvider,
  validateProviderOperation,
  checkExecutionLearningSeparation
} from '../external-providers.mjs';

test('Provider Taxonomy: All 5 canonical provider classes are defined and populated', () => {
  const expectedClasses = new Set([
    'WORKLOAD_PROVIDER',
    'INTENT_GRAPH_PROJECTION',
    'EXTERNAL_DOCTRINE_SOURCE',
    'RESEARCH_PROVIDER',
    'PRESENTATION_PROVIDER'
  ]);

  assert.deepEqual(PROVIDER_TAXONOMY_CLASSES, expectedClasses);

  const providers = listExternalProviders();
  assert.ok(providers.length >= 8, `Should have registered providers, got ${providers.length}`);

  const registeredClasses = new Set(providers.map(p => p.class));
  for (const exp of expectedClasses) {
    assert.ok(registeredClasses.has(exp), `Class ${exp} is populated in registry`);
  }
});

test('Warren Boundary: Subordinate workload provider with branch/artifact delivery only', () => {
  const warren = getExternalProvider('warren');
  assert.ok(warren, 'Warren is registered');
  assert.equal(warren.class, 'WORKLOAD_PROVIDER');
  assert.equal(warren.status, 'CANARY_PLANNED');
  assert.equal(warren.subordinate_to_workctl, true);
  assert.equal(warren.allows_autonomous_work_transition, false);
  assert.equal(warren.allows_autonomous_merge, false);
  assert.equal(warren.allows_canonical_tracker_authority, false);
  assert.equal(warren.allows_isa_authority, false);
  assert.ok(warren.permitted_delivery_modes.includes('BRANCH_ONLY'));
  assert.ok(warren.permitted_delivery_modes.includes('ARTIFACT_ONLY'));

  // Test operations
  const runOp = validateProviderOperation('warren', 'EXECUTE_RUN', { target: 'branch:feat/exp' });
  assert.equal(runOp.allowed, true);

  const mutateClaimOp = validateProviderOperation('warren', 'MUTATE_WORK_CLAIM', { task: 'WP-028' });
  assert.equal(mutateClaimOp.allowed, false);
  assert.ok(mutateClaimOp.reason.includes('cannot mutate canonical workctl state'));

  const directMergeOp = validateProviderOperation('warren', 'DIRECT_MAIN_MERGE', {});
  assert.equal(directMergeOp.allowed, false);
  assert.ok(directMergeOp.reason.includes('autonomous merge is prohibited'));
});

test('Beads Boundary: Read-only intent graph projection driven by workctl (workctl -> Beads ONLY)', () => {
  const beads = getExternalProvider('beads');
  assert.ok(beads, 'Beads is registered');
  assert.equal(beads.class, 'INTENT_GRAPH_PROJECTION');
  assert.equal(beads.status, 'SHADOW_CANARY');
  assert.equal(beads.authority_direction, 'WORKCTL_TO_BEADS_ONLY');
  assert.equal(beads.allows_canonical_claims, false);
  assert.equal(beads.allows_closure, false);
  assert.equal(beads.allows_priority_authority, false);
  assert.equal(beads.allows_work_lifecycle_mutation, false);
  assert.equal(beads.allows_knowledge_plane_replacement, false);

  // Permitted operations
  const graphQueryOp = validateProviderOperation('beads', 'QUERY_INTENT_GRAPH', {});
  assert.equal(graphQueryOp.allowed, true);

  const cycleDetectOp = validateProviderOperation('beads', 'DETECT_DEPENDENCY_CYCLES', {});
  assert.equal(cycleDetectOp.allowed, true);

  const schedRecOp = validateProviderOperation('beads', 'RECOMMEND_SCHEDULE', {});
  assert.equal(schedRecOp.allowed, true);

  // Forbidden operations
  const closeTaskOp = validateProviderOperation('beads', 'CLOSE_TASK', { task: 'WP-028' });
  assert.equal(closeTaskOp.allowed, false);
  assert.ok(closeTaskOp.reason.includes('cannot close tasks or mutate workctl state'));

  const setPriorityOp = validateProviderOperation('beads', 'SET_PRIORITY', { priority: 999 });
  assert.equal(setPriorityOp.allowed, false);
  assert.ok(setPriorityOp.reason.includes('cannot set canonical work priority'));
});

test('Agentic Engineering Boundary: External doctrine source for research; requires KAD evidence before promotion', () => {
  const ae = getExternalProvider('agentic-engineering');
  assert.ok(ae, 'Agentic Engineering is registered');
  assert.equal(ae.class, 'EXTERNAL_DOCTRINE_SOURCE');
  assert.equal(ae.status, 'ADOPT_RESEARCH_UPSTREAM');
  assert.equal(ae.epistemic_class, 'PRACTITIONER_DERIVED + HUMAN_REVIEWED + NON_PRIMARY');
  assert.equal(ae.requires_kad_evidence_for_promotion, true);
  assert.equal(ae.allows_direct_vendor_injection, false);

  // Permitted operations
  const researchOp = validateProviderOperation('agentic-engineering', 'GENERATE_RESEARCH_HYPOTHESIS', {});
  assert.equal(researchOp.allowed, true);

  const compareOp = validateProviderOperation('agentic-engineering', 'COMPARE_ARCHITECTURE', {});
  assert.equal(compareOp.allowed, true);

  // Forbidden operations: Direct promotion without evidence
  const promoteWithoutEvidence = validateProviderOperation('agentic-engineering', 'PROMOTE_TO_CANONICAL_DOCTRINE', {
    has_kad_evidence: false
  });
  assert.equal(promoteWithoutEvidence.allowed, false);
  assert.ok(promoteWithoutEvidence.reason.includes('requires empirical KAD evidence before promotion'));

  // Permitted operation: Promotion with verified evidence
  const promoteWithEvidence = validateProviderOperation('agentic-engineering', 'PROMOTE_TO_CANONICAL_DOCTRINE', {
    has_kad_evidence: true,
    evidence_ref: 'evidence/WP-KAD-028/FINAL_REPORT.md'
  });
  assert.equal(promoteWithEvidence.allowed, true);
});

test('Execution vs Learning Invariant: EXECUTION != LEARNING', () => {
  // Scenario 1: Worker attempts to mutate canonical doctrine during active execution run
  const activeExecutionMutatingDoctrine = checkExecutionLearningSeparation({
    context: 'EXECUTION_RUN',
    attempted_action: 'MUTATE_CANONICAL_DOCTRINE',
    role: 'kad-builder',
    target_path: 'PRIME_DIRECTIVE.md'
  });
  assert.equal(activeExecutionMutatingDoctrine.allowed, false);
  assert.ok(activeExecutionMutatingDoctrine.reason.includes('Workers must consume accepted knowledge and cannot rewrite canonical doctrine while executing'));

  // Scenario 2: Canonical learning flow: execution -> receipts -> retro -> distillation -> review -> accept -> KnowledgePlane
  const validDistillationFlow = checkExecutionLearningSeparation({
    context: 'DISTILLATION_PIPELINE',
    attempted_action: 'PROPOSE_CANDIDATE_KNOWLEDGE',
    role: 'kad-librarian',
    evidence_receipts: ['evidence/WP-KAD-028/FINAL_REPORT.md'],
    passed_review: true,
    target_path: 'vault/30_Knowledge/Candidate.md'
  });
  assert.equal(validDistillationFlow.allowed, true);
});
