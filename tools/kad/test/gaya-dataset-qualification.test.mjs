import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

import {
  validateSourceInventory,
  validateProvenance,
  validateExtraction,
  validateKnowledge,
  validateVisual,
  validateLeakage,
  validateSynthesis,
  validateConsumers,
  validateQuality,
  validateReplay,
  validateAcceptance
} from '../gaya-dataset-qualification.mjs';

import { lintIsa, checkIsa } from '../isa.mjs';

const ROOT = new URL('../../..', import.meta.url).pathname;
const GAYA_ISA = resolve(ROOT, 'docs/gaya/dataset-generation/ISA-GAYA-DATASET-G1-001.md');

test('Gaya Dataset Validators - Positive Baseline Verification', () => {
  assert.equal(validateSourceInventory(ROOT).pass, true, 'GAYA-G1-01 should PASS');
  assert.equal(validateProvenance(ROOT).pass, true, 'GAYA-G1-02 should PASS');
  assert.equal(validateExtraction(ROOT).pass, true, 'GAYA-G1-03 should PASS');
  assert.equal(validateKnowledge(ROOT).pass, true, 'GAYA-G1-04 should PASS');
  assert.equal(validateVisual(ROOT).pass, true, 'GAYA-G1-05 should PASS');
  assert.equal(validateLeakage(ROOT).pass, true, 'GAYA-G1-06 should PASS');
  assert.equal(validateSynthesis(ROOT).pass, true, 'GAYA-G1-07 should PASS');
  assert.equal(validateConsumers(ROOT).pass, true, 'GAYA-G1-08 should PASS');
  assert.equal(validateQuality(ROOT).pass, true, 'GAYA-G1-09 should PASS');
  assert.equal(validateReplay(ROOT).pass, true, 'GAYA-G1-10 should PASS');
  assert.equal(validateAcceptance(ROOT).pass, true, 'GAYA-G1-11 should PASS');
});

test('Gaya Dataset Validators - Negative Controls and Tampering Detection', () => {
  const tmp = mkdtempSync(resolve(tmpdir(), 'gaya-neg-'));
  try {
    const relDir = resolve(tmp, 'evidence/WP-GAYA-DATASET-G1/09-release');
    mkdirSync(relDir, { recursive: true });

    // 1. Negative Control: Missing sources census
    const invRes = validateSourceInventory(tmp);
    assert.equal(invRes.pass, false);

    // 2. Negative Control: Provenance without evidence_refs
    mkdirSync(resolve(relDir, 'training'), { recursive: true });
    writeFileSync(resolve(relDir, 'training/provenance.jsonl'), JSON.stringify({
      example_id: 'ex_1',
      train_eligible: true,
      knowledge_scope: 'persona',
      review_verdict: 'ACCEPTED',
      evidence_refs: [] // empty evidence refs!
    }) + '\n');
    const provRes = validateProvenance(tmp);
    assert.equal(provRes.pass, false);

    // 3. Negative Control: Extraction failure
    writeFileSync(resolve(relDir, 'extraction_records.jsonl'), JSON.stringify({
      record_id: 'rec_1',
      source_sha256: 'abc',
      source_ref: 'doc.md',
      status: 'FAILED',
      extracted_length: 0
    }) + '\n');
    const extRes = validateExtraction(tmp);
    assert.equal(extRes.pass, false);

    // 4. Negative Control: Orphan relations in knowledge graph
    mkdirSync(resolve(relDir, 'game'), { recursive: true });
    writeFileSync(resolve(relDir, 'game/world.json'), JSON.stringify({
      entities: [{ entity_id: 'ayşa' }],
      relationships: [{ source_id: 'ayşa', target_id: 'non_existent_orphan_entity' }]
    }));
    const knowRes = validateKnowledge(tmp);
    assert.equal(knowRes.pass, false);

    // 5. Negative Control: Invented coordinates in unknown geography
    writeFileSync(resolve(relDir, 'game/assets.jsonl'), JSON.stringify({
      sha256: 'abc',
      relative_path: 'img.png',
      pixel_dimensions: [100, 100]
    }) + '\n');
    writeFileSync(resolve(relDir, 'game/world.json'), JSON.stringify({
      entities: [{ entity_id: 'ayşa' }],
      relationships: [],
      unknown_geography: [{ status: 'UNKNOWN_PROPOSED', coordinates: [10, 20] }] // invented coordinates!
    }));
    const visRes = validateVisual(tmp);
    assert.equal(visRes.pass, false);

    // 6. Negative Control: Split leakage
    writeFileSync(resolve(relDir, 'qualification_summary.json'), JSON.stringify({
      duplicate_and_split_leakage: {
        exact_duplicates: 5,
        near_duplicates_exceeding_threshold: 1,
        cross_split_source_leakage: ['test_leak.md']
      }
    }));
    const leakRes = validateLeakage(tmp);
    assert.equal(leakRes.pass, false);

    // 7. Negative Control: Missing required family
    writeFileSync(resolve(relDir, 'training/provenance.jsonl'), JSON.stringify({
      family: 'grounded_lore_qa'
    }) + '\n');
    const synthRes = validateSynthesis(tmp);
    assert.equal(synthRes.pass, false);

    // 8. Negative Control: Consumers failure
    writeFileSync(resolve(relDir, 'consumers_summary.json'), JSON.stringify({
      training_parser_consumer: { status: 'FAIL' }
    }));
    const consRes = validateConsumers(tmp);
    assert.equal(consRes.pass, false);

    // 9. Negative Control: Canary escape
    writeFileSync(resolve(relDir, 'qualification_summary.json'), JSON.stringify({
      secret_canary_scans: { canary_escapes: 1 },
      revoked_claims_exclusion: { revoked_claims_found: 0 },
      adversarial_metamorphic_suite: { zero_escapes_verified: true },
      independent_semantic_review: { status: 'PASS' }
    }));
    const qualRes = validateQuality(tmp);
    assert.equal(qualRes.pass, false);

    // 10. Negative Control: False complete in replay
    writeFileSync(resolve(relDir, 'fault_injection_report.json'), JSON.stringify({
      zero_false_complete_verified: false
    }));
    const repRes = validateReplay(tmp);
    assert.equal(repRes.pass, false);

    // 11. Negative Control: Unsealed manifest
    writeFileSync(resolve(relDir, 'consumer_manifest.json'), JSON.stringify({
      sealed_sha256: null
    }));
    const accRes = validateAcceptance(tmp);
    assert.equal(accRes.pass, false);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('Native ISA Lint and Check on ISA-GAYA-DATASET-G1-001.md', () => {
  const lint = lintIsa(GAYA_ISA);
  assert.equal(lint.ok, true, `Lint errors: ${lint.errors?.join(', ')}`);
  assert.equal(lint.errors.length, 0);

  const check = checkIsa(GAYA_ISA, { rootDir: ROOT });
  assert.equal(check.ok, true, `Failed claims: ${check.results.filter(r => !r.pass).map(r => r.id).join(', ')}`);
  assert.equal(check.passed_claims, 11);
  assert.equal(check.failed_claims, 0);
});
