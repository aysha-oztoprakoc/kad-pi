/**
 * TDD Regression & Traceability Invariant Test Suite for KAD-PI Ideal State V2
 * Workpackage: WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  compileIdealStateData,
  validateRequirementsRegistry,
  validateTraceabilityGraph,
  validateGapAnalysis,
  validateExperimentRegister,
  renderIdealStateMarkdown
} from '../intent/ideal-state-engine.mjs';

const root = process.cwd();
const eventsPath = resolve(root, 'evidence/intent/events.jsonl');
const normsPath = resolve(root, 'evidence/intent/normalizations.jsonl');

test('WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030: Ideal State V2 & Traceability Suite', async (t) => {
  const eventsRaw = readFileSync(eventsPath, 'utf8').trim().split('\n').map(l => JSON.parse(l));
  const normsRaw = readFileSync(normsPath, 'utf8').trim().split('\n').map(l => JSON.parse(l));

  await t.test('T01: all 24 intent decisions are loaded with valid record hashes', () => {
    assert.equal(eventsRaw.length, 24);
    assert.equal(normsRaw.length, 24);
    for (const ev of eventsRaw) {
      assert.ok(ev.provenance?.record_hash, `Missing record hash on ${ev.decision_id}`);
      assert.equal(ev.response.epistemic_class, 'AUTHOR_DECLARED');
    }
  });

  await t.test('T02: compileIdealStateData produces complete four-plane data structure', () => {
    const data = compileIdealStateData(eventsRaw, normsRaw);
    assert.ok(data);
    assert.ok(data.requirements && Array.isArray(data.requirements));
    assert.ok(data.traceability_graph && Array.isArray(data.traceability_graph));
    assert.ok(data.gap_matrix && Array.isArray(data.gap_matrix));
    assert.ok(data.experiments && Array.isArray(data.experiments));
    assert.ok(data.roadmaps);
    assert.ok(data.successor_workpackages && Array.isArray(data.successor_workpackages));
  });

  await t.test('T03: zero orphan intent decisions - every DEC_ID_01..24 maps to at least one requirement', () => {
    const data = compileIdealStateData(eventsRaw, normsRaw);
    const mappedDecisions = new Set();
    for (const req of data.requirements) {
      for (const ref of req.intent_refs) {
        mappedDecisions.add(ref);
      }
    }
    for (let i = 1; i <= 24; i++) {
      const decId = `DEC_ID_${String(i).padStart(2, '0')}`;
      assert.ok(mappedDecisions.has(decId), `Orphan intent decision detected: ${decId} has no mapped requirement!`);
    }
  });

  await t.test('T04: zero unreferenced requirements - every REQ has valid intent_refs and event record_hash', () => {
    const data = compileIdealStateData(eventsRaw, normsRaw);
    const eventHashMap = new Map(eventsRaw.map(e => [e.decision_id, e.provenance.record_hash]));

    for (const req of data.requirements) {
      assert.ok(req.requirement_id.startsWith('REQ-KAD-'), `Invalid requirement ID: ${req.requirement_id}`);
      assert.ok(req.intent_refs && req.intent_refs.length > 0, `Requirement ${req.requirement_id} has no intent_refs`);
      assert.ok(req.raw_event_refs && req.raw_event_refs.length > 0, `Requirement ${req.requirement_id} has no raw_event_refs`);
      assert.ok(['MUST', 'MUST_NOT', 'SHOULD', 'SHOULD_NOT', 'MAY'].includes(req.normative_level), `Invalid normative level for ${req.requirement_id}`);
      assert.equal(req.plane, 'TARGET');
      assert.ok(req.verification_strategy, `Missing verification strategy for ${req.requirement_id}`);

      // Verify that raw_event_refs match the exact hashes of intent_refs
      for (const decId of req.intent_refs) {
        const expectedHash = eventHashMap.get(decId);
        assert.ok(req.raw_event_refs.includes(expectedHash), `Requirement ${req.requirement_id} missing expected event hash for ${decId}`);
      }
    }
  });

  await t.test('T05: requirements registry validation passes without errors or duplicate IDs', () => {
    const data = compileIdealStateData(eventsRaw, normsRaw);
    const { valid, errors } = validateRequirementsRegistry(data.requirements, eventsRaw);
    assert.ok(valid, `Requirements registry validation failed: ${errors.join('; ')}`);
    assert.equal(errors.length, 0);
  });

  await t.test('T06: traceability graph includes all required relationship classes and full path connectivity', () => {
    const data = compileIdealStateData(eventsRaw, normsRaw);
    const { valid, errors } = validateTraceabilityGraph(data.traceability_graph);
    assert.ok(valid, `Traceability graph validation failed: ${errors.join('; ')}`);
    
    // Check relationship classes
    const rels = new Set(data.traceability_graph.map(e => e.relationship));
    assert.ok(rels.has('DERIVED_FROM'));
    assert.ok(rels.has('IMPLEMENTS'));
    assert.ok(rels.has('CONSTRAINS'));
    assert.ok(rels.has('DEPENDS_ON'));
    assert.ok(rels.has('VALIDATED_BY'));
  });

  await t.test('T07: current-to-target gap matrix covers all 16 architectural domains with repository evidence', () => {
    const data = compileIdealStateData(eventsRaw, normsRaw);
    const { valid, errors } = validateGapAnalysis(data.gap_matrix);
    assert.ok(valid, `Gap matrix validation failed: ${errors.join('; ')}`);
    assert.equal(data.gap_matrix.length >= 16, true, `Gap matrix must have at least 16 entries, got ${data.gap_matrix.length}`);

    for (const gap of data.gap_matrix) {
      assert.ok(gap.domain_id, 'Missing domain_id in gap item');
      assert.ok(gap.current_state, `Missing current_state in gap item ${gap.domain_id}`);
      assert.ok(gap.target_state, `Missing target_state in gap item ${gap.domain_id}`);
      assert.ok(gap.evidence_refs && gap.evidence_refs.length > 0, `Missing evidence_refs in gap item ${gap.domain_id}`);
      assert.ok(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(gap.risk_level), `Invalid risk level in ${gap.domain_id}`);
      assert.ok(['NOW', '3_MONTH', '6_MONTH', '12_MONTH', 'ULTIMATE'].includes(gap.target_horizon), `Invalid horizon in ${gap.domain_id}`);
    }
  });

  await t.test('T08: experiment register contains all mandatory research hypotheses and controls', () => {
    const data = compileIdealStateData(eventsRaw, normsRaw);
    const { valid, errors } = validateExperimentRegister(data.experiments);
    assert.ok(valid, `Experiment register validation failed: ${errors.join('; ')}`);

    const expIds = new Set(data.experiments.map(e => e.experiment_id));
    assert.ok(expIds.has('EXP-KAD-OFFLINE-SURVIVAL-001'), 'Missing offline survival experiment');
    assert.ok(expIds.has('EXP-KAD-WARREN-ASYNC-002'), 'Missing Warren async offload experiment');
    assert.ok(expIds.has('EXP-KAD-BEADS-GRAPH-003'), 'Missing Beads graph projection experiment');
    assert.ok(expIds.has('EXP-KAD-SEMANTIC-RETRIEVAL-004'), 'Missing semantic retrieval experiment');
    assert.ok(expIds.has('EXP-KAD-TELL-PERSISTENT-005'), 'Missing TELL persistent worker experiment');
    assert.ok(expIds.has('EXP-KAD-DISTILLATION-006'), 'Missing downward distillation experiment');

    for (const exp of data.experiments) {
      assert.ok(exp.hypothesis, `Missing hypothesis in ${exp.experiment_id}`);
      assert.ok(exp.baseline, `Missing baseline in ${exp.experiment_id}`);
      assert.ok(exp.candidate, `Missing candidate in ${exp.experiment_id}`);
      assert.ok(exp.metrics && exp.metrics.length > 0, `Missing metrics in ${exp.experiment_id}`);
      assert.ok(exp.disposition_taxonomy, `Missing disposition taxonomy in ${exp.experiment_id}`);
    }
  });

  await t.test('T09: renderIdealStateMarkdown compiles valid, non-empty, and normative markdown artifact', () => {
    const data = compileIdealStateData(eventsRaw, normsRaw);
    const md = renderIdealStateMarkdown(data);
    assert.ok(md && md.length > 5000, 'Rendered Markdown artifact is too short');
    assert.ok(md.includes('# KAD-PI IDEAL STATE ARTIFACT V2'), 'Missing main header');
    assert.ok(md.includes('## 1. Executive Summary & Constitutional Mission'), 'Missing Section 1');
    assert.ok(md.includes('## 2. Normative Requirement Registry'), 'Missing Section 2');
    assert.ok(md.includes('## 3. Four-Plane Architecture Specification'), 'Missing Section 3');
    assert.ok(md.includes('## 4. Current-to-Target Gap Analysis Matrix'), 'Missing Section 4');
    assert.ok(md.includes('## 5. Experiment Register & Hypothesis Contracts'), 'Missing Section 5');
    assert.ok(md.includes('## 6. Strategic Roadmaps (3-Month, 6-Month, 12-Month)'), 'Missing Section 6');
    assert.ok(md.includes('## 7. Successor Workpackage Portfolio'), 'Missing Section 7');
  });
});
