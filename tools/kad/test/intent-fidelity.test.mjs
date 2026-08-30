import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import {
  calculateEventHash,
  calculateQuestionHash,
  canonicalJsonStringify,
  validateIntentEvent,
  validateIntentNormalization,
  validateIntentJournal,
  readIntentJournal,
  appendIntentEvent,
  appendIntentNormalization,
  compileAlignmentReport,
  verifyAlignmentReport,
  createIntentEvent,
  createIntentNormalization
} from '../intent/index.mjs';

const TEST_DIR = resolve(process.cwd(), '.tmp/test-intent-fidelity');

function setupTestEnv() {
  rmSync(TEST_DIR, { recursive: true, force: true });
  mkdirSync(TEST_DIR, { recursive: true });
}

test('WP-KAD-INTENT-FIDELITY-029: TDD Regression & Invariant Suite', async (t) => {
  setupTestEnv();

  await t.test('T01: valid DEC_ID_01 event and normalization -> PASS', () => {
    const rawQuestion = 'What is the primary, non-negotiable identity of KAD-PI to which all other capabilities are subordinated?';
    const qHash = calculateQuestionHash(rawQuestion);

    const event = createIntentEvent({
      decision_id: 'DEC_ID_01',
      domain_id: 'PROJECT_IDENTITY',
      question: {
        raw_text: rawQuestion,
        question_hash: qHash
      },
      options: [
        {
          option_id: 'opt_01',
          order: 1,
          raw_label: 'Personal Engineering OS & Research Lab',
          raw_description: 'Local-first cognitive workstation maximizing research throughput, formal systems engineering, and practical personal maintainability.',
          recommended: true,
          default_selected: true
        },
        {
          option_id: 'opt_02',
          order: 2,
          raw_label: 'Autonomous Agent Fleet Factory',
          raw_description: 'System for running dozens of independent agents with maximum delegation.',
          recommended: false,
          default_selected: false
        }
      ],
      response: {
        selected_option_id: 'opt_01',
        raw_note: 'Personal Engineering OS & Research Lab (note: KAD-PI is a local-first Personal Engineering Operating System and Research Laboratory).',
        epistemic_class: 'AUTHOR_DECLARED',
        actor_id: 'actor.project_lead'
      },
      facilitation: {
        protocol: 'ASK_ME_5_PLUS_1',
        recommendation_present: true,
        recommended_option_id: 'opt_01'
      },
      provenance: {
        session_id: 'session-2026-08-30-alignment',
        source_type: 'SOURCE_CAPTURED',
        source_event_id: 'ask-me-01',
        captured_at: '2026-08-30T18:00:00.000Z',
        host_id: 'host.amdy.workstation',
        supersedes: null,
        superseded_by: null
      }
    });

    const valEvent = validateIntentEvent(event);
    assert.equal(valEvent.valid, true, `Event validation failed: ${valEvent.errors.join('; ')}`);
    assert.ok(event.provenance.record_hash.startsWith('sha256:'));

    const normalization = createIntentNormalization({
      decision_id: 'DEC_ID_01',
      derived_from: {
        record_hash: event.provenance.record_hash,
        decision_id: 'DEC_ID_01'
      },
      normalized_intent: 'KAD-PI primary identity is Personal Engineering OS and Research Laboratory. All agent and automation capabilities are subordinated to amplifying personal research throughput.',
      epistemic_class: 'DERIVED_FROM_AUTHOR_DECLARED',
      decision_class: 'ARCHITECTURAL',
      change_cost: 'HIGH',
      lock_in_risk: 'HIGH',
      governing_constraints: ['LOCAL_FIRST', 'PERSONAL_LEAD_SUBORDINATION'],
      normalization_provenance: {
        agent: 'kad-researcher',
        model: 'gemini-3.7-flash-high',
        procedure_version: 'INTENT_NORMALIZATION_V1',
        created_at: '2026-08-30T18:10:00.000Z'
      }
    });

    const valNorm = validateIntentNormalization(normalization, [event]);
    assert.equal(valNorm.valid, true, `Normalization validation failed: ${valNorm.errors.join('; ')}`);
  });

  await t.test('T02: invalid decision ID format -> FAIL', () => {
    const invalidIds = ['DEC-01', 'decision_1', 'DEC_ID_1', 'dec_id_01', 'DEC_ID_001', 'DEC_ID_AB'];
    for (const id of invalidIds) {
      const event = createIntentEvent({
        decision_id: id,
        domain_id: 'PROJECT_IDENTITY',
        question: { raw_text: 'Test?', question_hash: calculateQuestionHash('Test?') },
        options: [{ option_id: 'opt_1', order: 1, raw_label: 'A' }],
        response: { selected_option_id: 'opt_1', raw_note: null, epistemic_class: 'AUTHOR_DECLARED', actor_id: 'actor.project_lead' },
        facilitation: { protocol: 'ASK_ME_5_PLUS_1', recommendation_present: false, recommended_option_id: null },
        provenance: { session_id: 's1', source_type: 'SOURCE_CAPTURED', source_event_id: 'e1', captured_at: '2026-08-30T18:00:00Z', host_id: 'host.amdy.workstation', supersedes: null, superseded_by: null }
      });
      const res = validateIntentEvent(event);
      assert.equal(res.valid, false, `ID ${id} should have been rejected`);
      assert.ok(res.errors.some(e => e.includes('decision_id')));
    }
  });

  await t.test('T03: raw option label modified during normalization -> source remains unchanged / misuse FAIL', () => {
    const event = createIntentEvent({
      decision_id: 'DEC_ID_02',
      domain_id: 'GOVERNANCE',
      question: { raw_text: 'Q?', question_hash: calculateQuestionHash('Q?') },
      options: [{ option_id: 'opt_1', order: 1, raw_label: 'Original Label' }],
      response: { selected_option_id: 'opt_1', raw_note: null, epistemic_class: 'AUTHOR_DECLARED', actor_id: 'actor.project_lead' },
      facilitation: { protocol: 'ASK_ME_5_PLUS_1', recommendation_present: false, recommended_option_id: null },
      provenance: { session_id: 's1', source_type: 'SOURCE_CAPTURED', source_event_id: 'e1', captured_at: '2026-08-30T18:00:00Z', host_id: 'host.amdy.workstation', supersedes: null, superseded_by: null }
    });

    // An invalid normalization that tries to mutate the source or pass mismatched hash
    const fakeRecordHash = 'sha256:0000000000000000000000000000000000000000000000000000000000000000';
    const normalization = createIntentNormalization({
      decision_id: 'DEC_ID_02',
      derived_from: {
        record_hash: fakeRecordHash,
        decision_id: 'DEC_ID_02'
      },
      normalized_intent: 'Altered option label interpretation',
      epistemic_class: 'DERIVED_FROM_AUTHOR_DECLARED',
      decision_class: 'GOVERNANCE',
      change_cost: 'LOW',
      lock_in_risk: 'LOW',
      governing_constraints: [],
      normalization_provenance: { agent: 'agent', model: 'model', procedure_version: 'v1', created_at: '2026-08-30T18:00:00Z' }
    });

    const val = validateIntentNormalization(normalization, [event]);
    assert.equal(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('unknown event hash') || e.includes('record_hash')));
  });

  await t.test('T04: raw human note modified -> FAIL (hash verification)', () => {
    const event = createIntentEvent({
      decision_id: 'DEC_ID_03',
      domain_id: 'HUMAN_ROLE',
      question: { raw_text: 'Q?', question_hash: calculateQuestionHash('Q?') },
      options: [{ option_id: 'opt_1', order: 1, raw_label: 'Label' }],
      response: { selected_option_id: 'opt_1', raw_note: 'Exact human note verbatim', epistemic_class: 'AUTHOR_DECLARED', actor_id: 'actor.project_lead' },
      facilitation: { protocol: 'ASK_ME_5_PLUS_1', recommendation_present: false, recommended_option_id: null },
      provenance: { session_id: 's1', source_type: 'SOURCE_CAPTURED', source_event_id: 'e1', captured_at: '2026-08-30T18:00:00Z', host_id: 'host.amdy.workstation', supersedes: null, superseded_by: null }
    });

    // Tamper with the raw note without re-calculating hash
    const tampered = JSON.parse(JSON.stringify(event));
    tampered.response.raw_note = 'Tampered human note';
    const val = validateIntentEvent(tampered);
    assert.equal(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('record_hash mismatch') || e.includes('hash')));
  });

  await t.test('T05: offered option omitted from captured event -> FAIL when source proves complete set', () => {
    const event = createIntentEvent({
      decision_id: 'DEC_ID_04',
      domain_id: 'FAILURE_CONDITION',
      question: { raw_text: 'Q?', question_hash: calculateQuestionHash('Q?') },
      options: [], // Omitted options!
      response: { selected_option_id: 'opt_1', raw_note: null, epistemic_class: 'AUTHOR_DECLARED', actor_id: 'actor.project_lead' },
      facilitation: { protocol: 'ASK_ME_5_PLUS_1', recommendation_present: false, recommended_option_id: null },
      provenance: { session_id: 's1', source_type: 'SOURCE_CAPTURED', source_event_id: 'e1', captured_at: '2026-08-30T18:00:00Z', host_id: 'host.amdy.workstation', supersedes: null, superseded_by: null }
    });
    const val = validateIntentEvent(event);
    assert.equal(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('options must not be empty') || e.includes('selected_option_id')));
  });

  await t.test('T06: option ordering changed -> FAIL (deterministic hash mismatch)', () => {
    const event = createIntentEvent({
      decision_id: 'DEC_ID_05',
      domain_id: 'AUTONOMY_BOUNDARIES',
      question: { raw_text: 'Q?', question_hash: calculateQuestionHash('Q?') },
      options: [
        { option_id: 'opt_1', order: 1, raw_label: 'First' },
        { option_id: 'opt_2', order: 2, raw_label: 'Second' }
      ],
      response: { selected_option_id: 'opt_1', raw_note: null, epistemic_class: 'AUTHOR_DECLARED', actor_id: 'actor.project_lead' },
      facilitation: { protocol: 'ASK_ME_5_PLUS_1', recommendation_present: false, recommended_option_id: null },
      provenance: { session_id: 's1', source_type: 'SOURCE_CAPTURED', source_event_id: 'e1', captured_at: '2026-08-30T18:00:00Z', host_id: 'host.amdy.workstation', supersedes: null, superseded_by: null }
    });

    const tampered = JSON.parse(JSON.stringify(event));
    tampered.options = [
      { option_id: 'opt_2', order: 1, raw_label: 'Second' },
      { option_id: 'opt_1', order: 2, raw_label: 'First' }
    ];
    const val = validateIntentEvent(tampered);
    assert.equal(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('record_hash mismatch')));
  });

  await t.test('T07: recommended/default metadata lost -> FAIL when present in source', () => {
    const eventWithMeta = createIntentEvent({
      decision_id: 'DEC_ID_06',
      domain_id: 'KNOWLEDGE_PROMOTION',
      question: { raw_text: 'Q?', question_hash: calculateQuestionHash('Q?') },
      options: [
        { option_id: 'opt_1', order: 1, raw_label: 'Opt1', recommended: true, default_selected: true }
      ],
      response: { selected_option_id: 'opt_1', raw_note: null, epistemic_class: 'AUTHOR_DECLARED', actor_id: 'actor.project_lead' },
      facilitation: { protocol: 'ASK_ME_5_PLUS_1', recommendation_present: true, recommended_option_id: 'opt_1' },
      provenance: { session_id: 's1', source_type: 'SOURCE_CAPTURED', source_event_id: 'e1', captured_at: '2026-08-30T18:00:00Z', host_id: 'host.amdy.workstation', supersedes: null, superseded_by: null }
    });

    const stripped = JSON.parse(JSON.stringify(eventWithMeta));
    stripped.options[0].recommended = undefined;
    stripped.options[0].default_selected = undefined;
    const val = validateIntentEvent(stripped);
    assert.equal(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('record_hash mismatch')));
  });

  await t.test('T08: normalized model text tagged AUTHOR_DECLARED -> FAIL', () => {
    const normalization = createIntentNormalization({
      decision_id: 'DEC_ID_07',
      derived_from: { record_hash: 'sha256:abcd', decision_id: 'DEC_ID_07' },
      normalized_intent: 'Model hallucinated summary',
      epistemic_class: 'AUTHOR_DECLARED', // FORBIDDEN: model summary cannot be AUTHOR_DECLARED
      decision_class: 'ECONOMIC',
      change_cost: 'LOW',
      lock_in_risk: 'LOW',
      governing_constraints: [],
      normalization_provenance: { agent: 'agent', model: 'gemini', procedure_version: 'v1', created_at: '2026-08-30T18:00:00Z' }
    });

    const val = validateIntentNormalization(normalization, []);
    assert.equal(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('epistemic_class') || e.includes('AUTHOR_DECLARED')));
  });

  await t.test('T09: DERIVED_FROM_AUTHOR_DECLARED normalization -> PASS', () => {
    const event = createIntentEvent({
      decision_id: 'DEC_ID_08',
      domain_id: 'SECURITY_DOMAINS',
      question: { raw_text: 'Q?', question_hash: calculateQuestionHash('Q?') },
      options: [{ option_id: 'opt_1', order: 1, raw_label: 'Opt1' }],
      response: { selected_option_id: 'opt_1', raw_note: null, epistemic_class: 'AUTHOR_DECLARED', actor_id: 'actor.project_lead' },
      facilitation: { protocol: 'ASK_ME_5_PLUS_1', recommendation_present: false, recommended_option_id: null },
      provenance: { session_id: 's1', source_type: 'SOURCE_CAPTURED', source_event_id: 'e1', captured_at: '2026-08-30T18:00:00Z', host_id: 'host.amdy.workstation', supersedes: null, superseded_by: null }
    });

    const norm = createIntentNormalization({
      decision_id: 'DEC_ID_08',
      derived_from: { record_hash: event.provenance.record_hash, decision_id: 'DEC_ID_08' },
      normalized_intent: 'Valid normalization derived from raw author declaration',
      epistemic_class: 'DERIVED_FROM_AUTHOR_DECLARED',
      decision_class: 'GOVERNANCE',
      change_cost: 'HIGH',
      lock_in_risk: 'HIGH',
      governing_constraints: ['TRUST_DOMAIN_SEPARATION'],
      normalization_provenance: { agent: 'kad-researcher', model: 'gemini-3.7-flash-high', procedure_version: 'v1', created_at: '2026-08-30T18:00:00Z' }
    });

    const val = validateIntentNormalization(norm, [event]);
    assert.equal(val.valid, true);
  });

  await t.test('T10: duplicate decision event without explicit revision/supersession -> FAIL', () => {
    const event1 = createIntentEvent({
      decision_id: 'DEC_ID_09',
      domain_id: 'EXECUTION_TOPOLOGY',
      question: { raw_text: 'Q?', question_hash: calculateQuestionHash('Q?') },
      options: [{ option_id: 'opt_1', order: 1, raw_label: 'A' }],
      response: { selected_option_id: 'opt_1', raw_note: null, epistemic_class: 'AUTHOR_DECLARED', actor_id: 'actor.project_lead' },
      facilitation: { protocol: 'ASK_ME_5_PLUS_1', recommendation_present: false, recommended_option_id: null },
      provenance: { session_id: 's1', source_type: 'SOURCE_CAPTURED', source_event_id: 'e1', captured_at: '2026-08-30T18:00:00Z', host_id: 'host.amdy.workstation', supersedes: null, superseded_by: null }
    });

    const event2 = createIntentEvent({
      decision_id: 'DEC_ID_09', // Duplicate decision_id without supersedes!
      domain_id: 'EXECUTION_TOPOLOGY',
      question: { raw_text: 'Q?', question_hash: calculateQuestionHash('Q?') },
      options: [{ option_id: 'opt_1', order: 1, raw_label: 'A' }],
      response: { selected_option_id: 'opt_1', raw_note: null, epistemic_class: 'AUTHOR_DECLARED', actor_id: 'actor.project_lead' },
      facilitation: { protocol: 'ASK_ME_5_PLUS_1', recommendation_present: false, recommended_option_id: null },
      provenance: { session_id: 's2', source_type: 'SOURCE_CAPTURED', source_event_id: 'e2', captured_at: '2026-08-30T19:00:00Z', host_id: 'host.amdy.workstation', supersedes: null, superseded_by: null }
    });

    const valJournal = validateIntentJournal([event1, event2], []);
    assert.equal(valJournal.valid, false);
    assert.ok(valJournal.errors.some(e => e.includes('duplicate') || e.includes('supersedes')));
  });

  await t.test('T11: missing source event hash in normalization -> FAIL', () => {
    const norm = createIntentNormalization({
      decision_id: 'DEC_ID_10',
      derived_from: { record_hash: null, decision_id: 'DEC_ID_10' },
      normalized_intent: 'Summary',
      epistemic_class: 'DERIVED_FROM_AUTHOR_DECLARED',
      decision_class: 'ARCHITECTURAL',
      change_cost: 'LOW',
      lock_in_risk: 'LOW',
      governing_constraints: [],
      normalization_provenance: { agent: 'a', model: 'm', procedure_version: 'v1', created_at: '2026-08-30T18:00:00Z' }
    });

    const val = validateIntentNormalization(norm, []);
    assert.equal(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('derived_from.record_hash')));
  });

  await t.test('T12: normalization references unknown event hash -> FAIL', () => {
    const norm = createIntentNormalization({
      decision_id: 'DEC_ID_11',
      derived_from: { record_hash: 'sha256:nonexistenthash1234567890', decision_id: 'DEC_ID_11' },
      normalized_intent: 'Summary',
      epistemic_class: 'DERIVED_FROM_AUTHOR_DECLARED',
      decision_class: 'ARCHITECTURAL',
      change_cost: 'LOW',
      lock_in_risk: 'LOW',
      governing_constraints: [],
      normalization_provenance: { agent: 'a', model: 'm', procedure_version: 'v1', created_at: '2026-08-30T18:00:00Z' }
    });

    const val = validateIntentNormalization(norm, []);
    assert.equal(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('unknown event hash') || e.includes('not found')));
  });

  await t.test('T13: actor.project_lead confused with host.amdy.workstation -> FAIL', () => {
    // Actor using host namespace
    const badActorEvent = createIntentEvent({
      decision_id: 'DEC_ID_12',
      domain_id: 'GITHUB_MODEL',
      question: { raw_text: 'Q?', question_hash: calculateQuestionHash('Q?') },
      options: [{ option_id: 'opt_1', order: 1, raw_label: 'A' }],
      response: { selected_option_id: 'opt_1', raw_note: null, epistemic_class: 'AUTHOR_DECLARED', actor_id: 'host.amdy.workstation' }, // FORBIDDEN: host in actor slot
      facilitation: { protocol: 'ASK_ME_5_PLUS_1', recommendation_present: false, recommended_option_id: null },
      provenance: { session_id: 's1', source_type: 'SOURCE_CAPTURED', source_event_id: 'e1', captured_at: '2026-08-30T18:00:00Z', host_id: 'host.amdy.workstation', supersedes: null, superseded_by: null }
    });
    const res1 = validateIntentEvent(badActorEvent);
    assert.equal(res1.valid, false);
    assert.ok(res1.errors.some(e => e.includes('actor_id namespace') || e.includes('actor.')));

    // Host using actor namespace
    const badHostEvent = createIntentEvent({
      decision_id: 'DEC_ID_12',
      domain_id: 'GITHUB_MODEL',
      question: { raw_text: 'Q?', question_hash: calculateQuestionHash('Q?') },
      options: [{ option_id: 'opt_1', order: 1, raw_label: 'A' }],
      response: { selected_option_id: 'opt_1', raw_note: null, epistemic_class: 'AUTHOR_DECLARED', actor_id: 'actor.project_lead' },
      facilitation: { protocol: 'ASK_ME_5_PLUS_1', recommendation_present: false, recommended_option_id: null },
      provenance: { session_id: 's1', source_type: 'SOURCE_CAPTURED', source_event_id: 'e1', captured_at: '2026-08-30T18:00:00Z', host_id: 'actor.project_lead', supersedes: null, superseded_by: null } // FORBIDDEN: actor in host slot
    });
    const res2 = validateIntentEvent(badHostEvent);
    assert.equal(res2.valid, false);
    assert.ok(res2.errors.some(e => e.includes('host_id namespace') || e.includes('host.')));
  });

  await t.test('T14: previously accepted raw event silently rewritten -> FAIL (journal hash chain verification)', () => {
    const journalPath = join(TEST_DIR, 'intent-journal-tamper.jsonl');
    const normPath = join(TEST_DIR, 'intent-normalizations-tamper.jsonl');

    const event1 = createIntentEvent({
      decision_id: 'DEC_ID_13',
      domain_id: 'RESEARCH_LIFECYCLE',
      question: { raw_text: 'Q1?', question_hash: calculateQuestionHash('Q1?') },
      options: [{ option_id: 'opt_1', order: 1, raw_label: 'A' }],
      response: { selected_option_id: 'opt_1', raw_note: null, epistemic_class: 'AUTHOR_DECLARED', actor_id: 'actor.project_lead' },
      facilitation: { protocol: 'ASK_ME_5_PLUS_1', recommendation_present: false, recommended_option_id: null },
      provenance: { session_id: 's1', source_type: 'SOURCE_CAPTURED', source_event_id: 'e1', captured_at: '2026-08-30T18:00:00Z', host_id: 'host.amdy.workstation', supersedes: null, superseded_by: null }
    });

    appendIntentEvent(journalPath, event1);

    // Tamper with the file directly by changing option label
    const content = readFileSync(journalPath, 'utf8');
    const tamperedContent = content.replace('"raw_label":"A"', '"raw_label":"MODIFIED_A"');
    writeFileSync(journalPath, tamperedContent);

    const { events } = readIntentJournal(journalPath);
    const val = validateIntentJournal(events, []);
    assert.equal(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('record_hash mismatch')));
  });

  await t.test('T15: generated report diverges from typed source -> FAIL (verify report)', () => {
    const event = createIntentEvent({
      decision_id: 'DEC_ID_14',
      domain_id: 'KNOWLEDGE_TOPOLOGY',
      question: { raw_text: 'Q14?', question_hash: calculateQuestionHash('Q14?') },
      options: [{ option_id: 'opt_1', order: 1, raw_label: 'Opt 1' }],
      response: { selected_option_id: 'opt_1', raw_note: null, epistemic_class: 'AUTHOR_DECLARED', actor_id: 'actor.project_lead' },
      facilitation: { protocol: 'ASK_ME_5_PLUS_1', recommendation_present: false, recommended_option_id: null },
      provenance: { session_id: 's1', source_type: 'SOURCE_CAPTURED', source_event_id: 'e1', captured_at: '2026-08-30T18:00:00Z', host_id: 'host.amdy.workstation', supersedes: null, superseded_by: null }
    });
    const norm = createIntentNormalization({
      decision_id: 'DEC_ID_14',
      derived_from: { record_hash: event.provenance.record_hash, decision_id: 'DEC_ID_14' },
      normalized_intent: 'Canonical knowledge plane',
      epistemic_class: 'DERIVED_FROM_AUTHOR_DECLARED',
      decision_class: 'ARCHITECTURAL',
      change_cost: 'MEDIUM',
      lock_in_risk: 'MEDIUM',
      governing_constraints: [],
      normalization_provenance: { agent: 'a', model: 'm', procedure_version: 'v1', created_at: '2026-08-30T18:00:00Z' }
    });

    const report = compileAlignmentReport([event], [norm], { date: '2026-08-30' });
    const tamperedReport = report + '\n<!-- Manually injected unexpected divergence -->\nExtra unauthorized table row';

    const verifyRes = verifyAlignmentReport(tamperedReport, [event], [norm], { date: '2026-08-30' });
    assert.equal(verifyRes.verified, false);
    assert.ok(verifyRes.errors.some(e => e.includes('divergence') || e.includes('mismatch')));
  });

  await t.test('T16: valid successor event explicitly superseding earlier decision -> PASS', () => {
    const event1 = createIntentEvent({
      decision_id: 'DEC_ID_15',
      domain_id: 'DISTILLATION_PIPELINE',
      question: { raw_text: 'Q15?', question_hash: calculateQuestionHash('Q15?') },
      options: [
        { option_id: 'opt_1', order: 1, raw_label: 'Strategy A' },
        { option_id: 'opt_2', order: 2, raw_label: 'Strategy B' }
      ],
      response: { selected_option_id: 'opt_1', raw_note: 'Initial choice', epistemic_class: 'AUTHOR_DECLARED', actor_id: 'actor.project_lead' },
      facilitation: { protocol: 'ASK_ME_5_PLUS_1', recommendation_present: false, recommended_option_id: null },
      provenance: { session_id: 's1', source_type: 'SOURCE_CAPTURED', source_event_id: 'e1', captured_at: '2026-08-30T18:00:00Z', host_id: 'host.amdy.workstation', supersedes: null, superseded_by: null }
    });

    const event2 = createIntentEvent({
      decision_id: 'DEC_ID_15',
      domain_id: 'DISTILLATION_PIPELINE',
      question: { raw_text: 'Q15 (Revised)?', question_hash: calculateQuestionHash('Q15 (Revised)?') },
      options: [
        { option_id: 'opt_1', order: 1, raw_label: 'Strategy A' },
        { option_id: 'opt_2', order: 2, raw_label: 'Strategy B' }
      ],
      response: { selected_option_id: 'opt_2', raw_note: 'Revised choice after empirical test', epistemic_class: 'AUTHOR_DECLARED', actor_id: 'actor.project_lead' },
      facilitation: { protocol: 'ASK_ME_5_PLUS_1', recommendation_present: false, recommended_option_id: null },
      provenance: { session_id: 's2', source_type: 'SOURCE_CAPTURED', source_event_id: 'e2', captured_at: '2026-08-30T19:00:00Z', host_id: 'host.amdy.workstation', supersedes: event1.provenance.record_hash, superseded_by: null }
    });

    const valJournal = validateIntentJournal([event1, event2], []);
    assert.equal(valJournal.valid, true, `Journal with valid supersession failed: ${valJournal.errors.join('; ')}`);
  });

  await t.test('T17: missing raw source fields marked UNKNOWN/RECONSTRUCTED rather than fabricated -> PASS', () => {
    const event = createIntentEvent({
      decision_id: 'DEC_ID_16',
      domain_id: 'CONTRADICTION_INVALIDATION',
      question: { raw_text: 'Q16?', question_hash: calculateQuestionHash('Q16?') },
      options: [
        { option_id: 'opt_1', order: 1, raw_label: 'Option 1', raw_description: null, recommended: null, default_selected: null }
      ],
      response: { selected_option_id: 'opt_1', raw_note: null, epistemic_class: 'AUTHOR_DECLARED', actor_id: 'actor.project_lead' },
      facilitation: { protocol: 'ASK_ME_5_PLUS_1', recommendation_present: false, recommended_option_id: null },
      provenance: { session_id: 'session-reconstructed', source_type: 'RECONSTRUCTED', source_event_id: null, captured_at: '2026-08-30T18:00:00Z', host_id: 'host.amdy.workstation', supersedes: null, superseded_by: null }
    });

    const val = validateIntentEvent(event);
    assert.equal(val.valid, true);
  });

  await t.test('T18: reconstructed data falsely labeled verbatim/raw -> FAIL', () => {
    const event = createIntentEvent({
      decision_id: 'DEC_ID_17',
      domain_id: 'NATIVE_PM_CAPABILITIES',
      question: { raw_text: 'Q17?', question_hash: calculateQuestionHash('Q17?') },
      options: [{ option_id: 'opt_1', order: 1, raw_label: 'Option 1' }],
      response: { selected_option_id: 'opt_1', raw_note: null, epistemic_class: 'AUTHOR_DECLARED', actor_id: 'actor.project_lead' },
      facilitation: { protocol: 'ASK_ME_5_PLUS_1', recommendation_present: false, recommended_option_id: null },
      provenance: {
        session_id: 'session-reconstructed',
        source_type: 'SOURCE_CAPTURED', // Inconsistency: source_event_id is null / reconstructed session marker but claims SOURCE_CAPTURED!
        source_event_id: null,
        captured_at: '2026-08-30T18:00:00Z',
        host_id: 'host.amdy.workstation',
        supersedes: null,
        superseded_by: null
      }
    });

    const val = validateIntentEvent(event);
    assert.equal(val.valid, false);
    assert.ok(val.errors.some(e => e.includes('source_type') || e.includes('source_event_id')));
  });
});
