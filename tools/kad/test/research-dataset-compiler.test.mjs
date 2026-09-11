import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  parseMarkdownResearchNote,
  compileFormalReasoningSftRow,
  compileEpistemicDpoRow,
  compilePianoPolicySftRow,
  compileVaultResearchDatasets,
  DATASET_FORMATS
} from '../research-dataset-compiler.mjs';

test('Research Dataset Compiler - Markdown Parsing and Section Extraction', () => {
  const sampleNote = `---
type: paper
citekey: Linhares2020NOCA
title: "NOCA: A Notification-Oriented Computer Architecture"
question_id: Q01
evidence_status: source_derived
---
# 1. Formal Specification
Transition system with notification selectivity guarantees.

# 2. Theorems & Invariants
Theorem 1: No polling overhead; deterministic state evaluation.

# 4. Assumptions & Limitations
Requires hardware or kernel level notification registers.
`;

  const { frontmatter, sections } = parseMarkdownResearchNote(sampleNote);
  assert.equal(frontmatter.citekey, 'Linhares2020NOCA');
  assert.equal(frontmatter.question_id, 'Q01');
  assert.ok(sections.has('1. formal specification'));
  assert.ok(sections.has('2. theorems & invariants'));
  assert.ok(sections.has('4. assumptions & limitations'));

  const sftRow = compileFormalReasoningSftRow(frontmatter, sections);
  assert.equal(sftRow.dataset, DATASET_FORMATS.SFT_FORMAL);
  assert.ok(sftRow.output.includes('Transition system with notification selectivity guarantees'));
  assert.ok(sftRow.output.includes('Theorem 1: No polling overhead'));

  const dpoRow = compileEpistemicDpoRow(frontmatter, sections);
  assert.equal(dpoRow.dataset, DATASET_FORMATS.DPO_EPISTEMIC);
  assert.ok(dpoRow.chosen.includes('strictly under the following boundary conditions'));
  assert.ok(dpoRow.rejected.includes('universal framework that can be directly applied'));
});

test('Research Dataset Compiler - PIANO Agent Policy SFT Generation', () => {
  const agentEvent = {
    actorId: 'actor.aysha',
    tick: 12,
    proprioception: { hunger: 0.85, fatigue: 0.2 },
    social: { peers: ['actor.amethysta'] },
    actionAwareness: { lastActionRejected: false },
    memory: { lastMealTick: 4 },
    selectedOption: { type: 'OPTION_COOK', urgency: 0.95 },
    emittedCommand: { type: 'cook', actor_id: 'actor.aysha' },
    invariantAudit: 'PASSED_PRECONDITIONS'
  };

  const sftRow = compilePianoPolicySftRow(agentEvent);
  assert.equal(sftRow.dataset, DATASET_FORMATS.SFT_PIANO);
  assert.ok(sftRow.instruction.includes('PIANO Cognitive Controller'));
  const parsedInput = JSON.parse(sftRow.input);
  assert.equal(parsedInput.actor_id, 'actor.aysha');
  assert.equal(parsedInput.streams.proprioception.hunger, 0.85);

  const parsedOutput = JSON.parse(sftRow.output);
  assert.equal(parsedOutput.selected_option.type, 'OPTION_COOK');
  assert.equal(parsedOutput.atomic_command.type, 'cook');
});

test('Research Dataset Compiler - End-to-End Vault Compilation', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'kad-ds-test-'));
  const outDir = join(tmp, 'training');
  const res = compileVaultResearchDatasets({
    outputDir: outDir
  });

  assert.ok(res.sftFormalCount >= 1, 'Should compile at least the Yang 2024 Project Sid paper');
  assert.ok(res.dpoEpistemicCount >= 1, 'Should compile at least the Yang 2024 Project Sid DPO pair');

  const formalContent = readFileSync(join(outDir, 'kad_sft_formal_reasoning.jsonl'), 'utf8');
  assert.ok(formalContent.trim().length > 0);
  const firstFormal = JSON.parse(formalContent.trim().split('\n')[0]);
  assert.equal(firstFormal.dataset, DATASET_FORMATS.SFT_FORMAL);

  const dpoContent = readFileSync(join(outDir, 'kad_dpo_epistemic_grounding.jsonl'), 'utf8');
  assert.ok(dpoContent.trim().length > 0);
  const firstDpo = JSON.parse(dpoContent.trim().split('\n')[0]);
  assert.equal(firstDpo.dataset, DATASET_FORMATS.DPO_EPISTEMIC);
});
