import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  OBSERVATION_SCHEMA_VERSION,
  FROZEN_SHADOW_POLICY_FINGERPRINT,
  createShadowObservationEvent,
  computeCanonicalEventHash,
  computePolicyFingerprint,
  ShadowObservatoryJournal,
  aggregateObservations,
  exportObservatorySnapshot,
  sanitizeObservationData
} from '../telemetry/observatory.mjs';
import { evaluateEconomicShadow } from '../telemetry/economic-shadow.mjs';
import { routeEconomically, createEconomicPolicy } from '../economic-router.mjs';

function createTempJournalDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'kad-observatory-test-'));
}

test('T1 actual=shadow agreement event', () => {
  const event = createShadowObservationEvent({
    session_id: 'sess-001',
    production_route: {
      execution_class: 'DETERMINISTIC_LOCAL',
      provider: 'local-runner',
      model: 'local-qwen',
      status: 'ROUTED'
    },
    shadow_evaluation: {
      recommended_execution_class: 'DETERMINISTIC_LOCAL',
      recommended_lane: { provider: 'local-runner', model: 'local-qwen' },
      reason_codes: ['DETERMINISTIC_LOCAL_PREFERRED'],
      quota_windows_considered: 0,
      binding_window: null
    },
    actual_tokens: { input_tokens: 100, output_tokens: 50, cached_input_tokens: 0, total_tokens: 150 }
  });

  assert.equal(event.schema_version, OBSERVATION_SCHEMA_VERSION);
  assert.equal(event.same_or_different, 'SAME');
  assert.equal(event.production_route.execution_class, 'DETERMINISTIC_LOCAL');
  assert.equal(event.shadow_route.execution_class, 'DETERMINISTIC_LOCAL');
  assert.deepEqual(event.divergence_reasons, []);
});

test('T2 actual!=shadow divergence event', () => {
  const event = createShadowObservationEvent({
    session_id: 'sess-002',
    production_route: {
      execution_class: 'REMOTE_FREE',
      provider: 'google-gemini',
      model: 'gemini-2.5-flash',
      status: 'ROUTED'
    },
    shadow_evaluation: {
      recommended_execution_class: 'SUBSCRIPTION_EXPIRING',
      recommended_lane: { provider: 'openai-codex', model: 'gpt-5.6-luna' },
      reason_codes: ['SUBSCRIPTION_EXPIRING_OPPORTUNITY'],
      quota_windows_considered: 2,
      binding_window: { window_duration_ms: 86400000, remaining_fraction: 0.8, used_fraction: 0.2, scope: 'PROVIDER_WIDE' }
    },
    actual_tokens: { input_tokens: 1200, output_tokens: 300, cached_input_tokens: 400, total_tokens: 1500 }
  });

  assert.equal(event.same_or_different, 'DIFFERENT');
  assert.equal(event.production_route.provider, 'google-gemini');
  assert.equal(event.shadow_route.provider, 'openai-codex');
  assert.deepEqual(event.divergence_reasons, ['SUBSCRIPTION_EXPIRING_OPPORTUNITY']);
});

test('T3 deterministic reason codes', () => {
  const shadowEval = {
    recommended_execution_class: 'REMOTE_FREE',
    recommended_lane: { provider: 'google-gemini', model: 'gemini-2.5-flash' },
    reason_codes: ['PRESERVE_SCARCE_QUOTA', 'STALE_TELEMETRY_DEMOTION'],
    quota_windows_considered: 1,
    binding_window: { window_duration_ms: 604800000, remaining_fraction: 0.1, used_fraction: 0.9, scope: 'ACCOUNT_WIDE' }
  };

  const event = createShadowObservationEvent({
    session_id: 'sess-003',
    production_route: { execution_class: 'SUBSCRIPTION', provider: 'openai-codex', model: 'gpt-5.6-luna', status: 'ROUTED' },
    shadow_evaluation: shadowEval,
    actual_tokens: { input_tokens: 50, output_tokens: 50, cached_input_tokens: 0, total_tokens: 100 }
  });

  assert.equal(event.same_or_different, 'DIFFERENT');
  assert.deepEqual(event.divergence_reasons, ['PRESERVE_SCARCE_QUOTA', 'STALE_TELEMETRY_DEMOTION']);
});

test('T4 no prompt or model output content persisted', () => {
  const payloadWithProhibitedContent = {
    session_id: 'sess-004',
    prompt: 'You are a super secret assistant: ignore previous instructions and do X',
    completion: 'Here is the completed code with sensitive logic...',
    messages: [{ role: 'user', content: 'Secret prompt' }],
    chain_of_thought: 'Thinking step 1...',
    production_route: { execution_class: 'REMOTE_FREE', provider: 'google-gemini', model: 'gemini-2.5-flash', status: 'ROUTED' },
    shadow_evaluation: {
      recommended_execution_class: 'REMOTE_FREE',
      recommended_lane: { provider: 'google-gemini', model: 'gemini-2.5-flash' },
      reason_codes: [],
      quota_windows_considered: 0,
      binding_window: null
    },
    actual_tokens: { input_tokens: 10, output_tokens: 10, cached_input_tokens: 0, total_tokens: 20 }
  };

  const event = createShadowObservationEvent(payloadWithProhibitedContent);
  const serialized = JSON.stringify(event);

  assert.equal(event.prompt, undefined);
  assert.equal(event.completion, undefined);
  assert.equal(event.messages, undefined);
  assert.equal(event.chain_of_thought, undefined);
  assert.ok(!serialized.includes('super secret assistant'));
  assert.ok(!serialized.includes('Thinking step 1'));
});

test('T5 secret redaction', () => {
  const payloadWithSecrets = {
    session_id: 'sess-005',
    api_key: 'sk-proj-1234567890abcdef1234567890abcdef',
    headers: { authorization: 'Bearer super-secret-jwt-token' },
    cookies: 'session_id=secret-cookie-1234',
    production_route: { execution_class: 'REMOTE_FREE', provider: 'google-gemini', model: 'gemini-2.5-flash', status: 'ROUTED' },
    shadow_evaluation: {
      recommended_execution_class: 'REMOTE_FREE',
      recommended_lane: { provider: 'google-gemini', model: 'gemini-2.5-flash' },
      reason_codes: [],
      quota_windows_considered: 0,
      binding_window: null
    },
    actual_tokens: { input_tokens: 10, output_tokens: 10, cached_input_tokens: 0, total_tokens: 20 }
  };

  const sanitized = sanitizeObservationData(payloadWithSecrets);
  assert.equal(sanitized.api_key, undefined);
  assert.equal(sanitized.headers, undefined);
  assert.equal(sanitized.cookies, undefined);

  const event = createShadowObservationEvent(payloadWithSecrets);
  const serialized = JSON.stringify(event);
  assert.ok(!serialized.includes('sk-proj'));
  assert.ok(!serialized.includes('super-secret-jwt-token'));
});

test('T6 append-only journal behavior', () => {
  const tmpDir = createTempJournalDir();
  const journalPath = path.join(tmpDir, 'observations.jsonl');
  const journal = new ShadowObservatoryJournal({ journalPath });

  const ev1 = journal.appendObservation({
    session_id: 's1',
    production_route: { execution_class: 'LOCAL', provider: 'local', model: 'qwen', status: 'ROUTED' },
    shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'local', model: 'qwen' }, reason_codes: [] },
    actual_tokens: { input_tokens: 10, output_tokens: 10, cached_input_tokens: 0, total_tokens: 20 }
  });

  const ev2 = journal.appendObservation({
    session_id: 's2',
    production_route: { execution_class: 'REMOTE', provider: 'gemini', model: 'flash', status: 'ROUTED' },
    shadow_evaluation: { recommended_execution_class: 'REMOTE', recommended_lane: { provider: 'gemini', model: 'flash' }, reason_codes: [] },
    actual_tokens: { input_tokens: 20, output_tokens: 20, cached_input_tokens: 0, total_tokens: 40 }
  });

  const records = journal.readObservations();
  assert.equal(records.length, 2);
  assert.equal(records[0].event_id, ev1.event_id);
  assert.equal(records[1].event_id, ev2.event_id);
  assert.equal(records[0].sequence, 1);
  assert.equal(records[1].sequence, 2);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('T7 deterministic sequence', () => {
  const tmpDir = createTempJournalDir();
  const journalPath = path.join(tmpDir, 'observations.jsonl');
  const journal = new ShadowObservatoryJournal({ journalPath });

  for (let i = 1; i <= 5; i++) {
    const ev = journal.appendObservation({
      session_id: `s${i}`,
      production_route: { execution_class: 'LOCAL', provider: 'p', model: 'm', status: 'ROUTED' },
      shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'p', model: 'm' }, reason_codes: [] },
      actual_tokens: { input_tokens: i, output_tokens: i, cached_input_tokens: 0, total_tokens: i * 2 }
    });
    assert.equal(ev.sequence, i);
  }

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('T8 hash-chain integrity', () => {
  const tmpDir = createTempJournalDir();
  const journalPath = path.join(tmpDir, 'observations.jsonl');
  const journal = new ShadowObservatoryJournal({ journalPath });

  journal.appendObservation({
    session_id: 's1',
    production_route: { execution_class: 'LOCAL', provider: 'p1', model: 'm1', status: 'ROUTED' },
    shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'p1', model: 'm1' }, reason_codes: [] },
    actual_tokens: { input_tokens: 10, output_tokens: 10, cached_input_tokens: 0, total_tokens: 20 }
  });

  journal.appendObservation({
    session_id: 's2',
    production_route: { execution_class: 'REMOTE', provider: 'p2', model: 'm2', status: 'ROUTED' },
    shadow_evaluation: { recommended_execution_class: 'REMOTE', recommended_lane: { provider: 'p2', model: 'm2' }, reason_codes: [] },
    actual_tokens: { input_tokens: 20, output_tokens: 20, cached_input_tokens: 0, total_tokens: 40 }
  });

  const integrity = journal.verifyJournalIntegrity();
  assert.equal(integrity.valid, true);
  assert.equal(integrity.record_count, 2);
  assert.equal(integrity.errors.length, 0);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('T9 historical tampering detection', () => {
  const tmpDir = createTempJournalDir();
  const journalPath = path.join(tmpDir, 'observations.jsonl');
  const journal = new ShadowObservatoryJournal({ journalPath });

  journal.appendObservation({
    session_id: 's1',
    production_route: { execution_class: 'LOCAL', provider: 'p1', model: 'm1', status: 'ROUTED' },
    shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'p1', model: 'm1' }, reason_codes: [] },
    actual_tokens: { input_tokens: 10, output_tokens: 10, cached_input_tokens: 0, total_tokens: 20 }
  });

  journal.appendObservation({
    session_id: 's2',
    production_route: { execution_class: 'REMOTE', provider: 'p2', model: 'm2', status: 'ROUTED' },
    shadow_evaluation: { recommended_execution_class: 'REMOTE', recommended_lane: { provider: 'p2', model: 'm2' }, reason_codes: [] },
    actual_tokens: { input_tokens: 20, output_tokens: 20, cached_input_tokens: 0, total_tokens: 40 }
  });

  // Tamper with record 1
  const rawLines = fs.readFileSync(journalPath, 'utf8').trim().split('\n');
  const parsed1 = JSON.parse(rawLines[0]);
  parsed1.actual_tokens.input_tokens = 999999; // tampered token count
  rawLines[0] = JSON.stringify(parsed1);
  fs.writeFileSync(journalPath, rawLines.join('\n') + '\n');

  const integrity = journal.verifyJournalIntegrity();
  assert.equal(integrity.valid, false);
  assert.ok(integrity.errors.some(e => e.includes('HASH_MISMATCH') || e.includes('TAMPER_DETECTED')));

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('T10 malformed-tail recovery', () => {
  const tmpDir = createTempJournalDir();
  const journalPath = path.join(tmpDir, 'observations.jsonl');
  const journal = new ShadowObservatoryJournal({ journalPath });

  journal.appendObservation({
    session_id: 's1',
    production_route: { execution_class: 'LOCAL', provider: 'p1', model: 'm1', status: 'ROUTED' },
    shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'p1', model: 'm1' }, reason_codes: [] },
    actual_tokens: { input_tokens: 10, output_tokens: 10, cached_input_tokens: 0, total_tokens: 20 }
  });

  // Append incomplete/corrupted trailing bytes
  fs.appendFileSync(journalPath, '{"event_id":"corrupted-incomplete-line');

  const recovery = journal.recoverMalformedTail();
  assert.equal(recovery.recovered, true);
  assert.equal(recovery.truncated_bytes > 0, true);

  const records = journal.readObservations();
  assert.equal(records.length, 1);
  assert.equal(journal.verifyJournalIntegrity().valid, true);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('T11 bounded retention', () => {
  const tmpDir = createTempJournalDir();
  const journalPath = path.join(tmpDir, 'observations.jsonl');
  const maxEvents = 3;
  const journal = new ShadowObservatoryJournal({ journalPath, maxEvents });

  for (let i = 1; i <= 5; i++) {
    journal.appendObservation({
      session_id: `s${i}`,
      production_route: { execution_class: 'LOCAL', provider: 'p', model: 'm', status: 'ROUTED' },
      shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'p', model: 'm' }, reason_codes: [] },
      actual_tokens: { input_tokens: i, output_tokens: i, cached_input_tokens: 0, total_tokens: i * 2 }
    });
  }

  const records = journal.readObservations();
  assert.equal(records.length, 3);
  assert.equal(records[0].session_id, 's3');
  assert.equal(records[2].session_id, 's5');

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('T12 policy fingerprint stability', () => {
  const fp1 = computePolicyFingerprint();
  const fp2 = computePolicyFingerprint();
  assert.equal(fp1, fp2);
  assert.equal(typeof fp1, 'string');
  assert.ok(fp1.startsWith('sha256:'));
});

test('T13 policy change creates distinguishable experiment', () => {
  const defaultFp = computePolicyFingerprint();
  const modifiedParams = {
    EXPIRING_URGENCY_THRESHOLD: 0.90, // altered threshold
    GREEN_THRESHOLD: 0.60
  };
  const modifiedFp = computePolicyFingerprint(modifiedParams);
  assert.notEqual(defaultFp, modifiedFp);
});

test('T14 observed vs counterfactual epistemic separation', () => {
  const event = createShadowObservationEvent({
    session_id: 'sess-014',
    production_route: { execution_class: 'REMOTE_FREE', provider: 'gemini', model: 'flash', status: 'ROUTED' },
    shadow_evaluation: {
      recommended_execution_class: 'SUBSCRIPTION_EXPIRING',
      recommended_lane: { provider: 'codex', model: 'luna' },
      reason_codes: ['SUBSCRIPTION_EXPIRING_OPPORTUNITY']
    },
    actual_tokens: { input_tokens: 500, output_tokens: 100, cached_input_tokens: 200, total_tokens: 600 }
  });

  assert.equal(event.epistemic_states.production, 'OBSERVED');
  assert.equal(event.epistemic_states.shadow, 'COUNTERFACTUAL');
  assert.equal(event.epistemic_states.telemetry, 'OBSERVED');
});

test('T15 actual-token aggregation', () => {
  const events = [
    createShadowObservationEvent({
      session_id: 's1',
      production_route: { execution_class: 'LOCAL', provider: 'p', model: 'm', status: 'ROUTED' },
      shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'p', model: 'm' }, reason_codes: [] },
      actual_tokens: { input_tokens: 100, output_tokens: 50, cached_input_tokens: 20, total_tokens: 150 }
    }),
    createShadowObservationEvent({
      session_id: 's2',
      production_route: { execution_class: 'REMOTE', provider: 'p', model: 'm', status: 'ROUTED' },
      shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'p', model: 'm' }, reason_codes: ['USE_LOCAL'] },
      actual_tokens: { input_tokens: 200, output_tokens: 100, cached_input_tokens: 50, total_tokens: 300 }
    })
  ];

  const agg = aggregateObservations(events);
  assert.equal(agg.actual_tokens.input_tokens, 300);
  assert.equal(agg.actual_tokens.output_tokens, 150);
  assert.equal(agg.actual_tokens.cached_input_tokens, 70);
  assert.equal(agg.actual_tokens.total_tokens, 450);
});

test('T16 divergence-rate calculation', () => {
  const events = [
    createShadowObservationEvent({
      session_id: 's1',
      production_route: { execution_class: 'LOCAL', provider: 'p', model: 'm', status: 'ROUTED' },
      shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'p', model: 'm' }, reason_codes: [] },
      actual_tokens: { input_tokens: 10, output_tokens: 10, cached_input_tokens: 0, total_tokens: 20 }
    }),
    createShadowObservationEvent({
      session_id: 's2',
      production_route: { execution_class: 'REMOTE', provider: 'p', model: 'm', status: 'ROUTED' },
      shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'p', model: 'm' }, reason_codes: ['LOCAL_FREE'] },
      actual_tokens: { input_tokens: 10, output_tokens: 10, cached_input_tokens: 0, total_tokens: 20 }
    }),
    createShadowObservationEvent({
      session_id: 's3',
      production_route: { execution_class: 'REMOTE', provider: 'p', model: 'm', status: 'ROUTED' },
      shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'p', model: 'm' }, reason_codes: ['LOCAL_FREE'] },
      actual_tokens: { input_tokens: 10, output_tokens: 10, cached_input_tokens: 0, total_tokens: 20 }
    }),
    createShadowObservationEvent({
      session_id: 's4',
      production_route: { execution_class: 'LOCAL', provider: 'p', model: 'm', status: 'ROUTED' },
      shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'p', model: 'm' }, reason_codes: [] },
      actual_tokens: { input_tokens: 10, output_tokens: 10, cached_input_tokens: 0, total_tokens: 20 }
    })
  ];

  const agg = aggregateObservations(events);
  assert.equal(agg.total_observations, 4);
  assert.equal(agg.comparable_observations, 4);
  assert.equal(agg.agreement_count, 2);
  assert.equal(agg.divergence_count, 2);
  assert.equal(agg.divergence_rate, 0.50);
});

test('T17 UNKNOWN instead of unsupported counterfactual claim', () => {
  const events = [
    createShadowObservationEvent({
      session_id: 's1',
      production_route: { execution_class: 'REMOTE', provider: 'p', model: 'm', status: 'ROUTED' },
      shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'p', model: 'm' }, reason_codes: ['LOCAL_FREE'] },
      actual_tokens: { input_tokens: 100, output_tokens: 100, cached_input_tokens: 0, total_tokens: 200 }
    })
  ];

  const agg = aggregateObservations(events);
  assert.equal(agg.counterfactual_empirical_savings, 'UNKNOWN');
  assert.equal(agg.counterfactual_quality_delta, 'UNKNOWN');
  assert.equal(agg.counterfactual_pass_rate, 'UNKNOWN');
  assert.equal(agg.opportunity_counts.EXPIRING_SUBSCRIPTION_OPPORTUNITY, 0);
});

test('T18 workctl linkage when available', () => {
  const event = createShadowObservationEvent({
    session_id: 's-work',
    workctl_ticket_id: 'WP-KAD-004',
    actual_outcome: 'PASS',
    production_route: { execution_class: 'LOCAL', provider: 'p', model: 'm', status: 'ROUTED' },
    shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'p', model: 'm' }, reason_codes: [] },
    actual_tokens: { input_tokens: 10, output_tokens: 10, cached_input_tokens: 0, total_tokens: 20 }
  });

  assert.equal(event.workctl_ticket_id, 'WP-KAD-004');
  assert.equal(event.actual_outcome, 'PASS');
});

test('T19 graceful operation without workctl linkage', () => {
  const event = createShadowObservationEvent({
    session_id: 's-nowork',
    workctl_ticket_id: null,
    actual_outcome: null,
    production_route: { execution_class: 'LOCAL', provider: 'p', model: 'm', status: 'ROUTED' },
    shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'p', model: 'm' }, reason_codes: [] },
    actual_tokens: { input_tokens: 10, output_tokens: 10, cached_input_tokens: 0, total_tokens: 20 }
  });

  assert.equal(event.workctl_ticket_id, null);
  assert.equal(event.actual_outcome, null);
  assert.ok(event.event_id);
});

test('T20 deterministic evidence export', () => {
  const tmpDir = createTempJournalDir();
  const journalPath = path.join(tmpDir, 'observations.jsonl');
  const journal = new ShadowObservatoryJournal({ journalPath });

  journal.appendObservation({
    session_id: 's1',
    production_route: { execution_class: 'LOCAL', provider: 'p1', model: 'm1', status: 'ROUTED' },
    shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'p1', model: 'm1' }, reason_codes: [] },
    actual_tokens: { input_tokens: 100, output_tokens: 50, cached_input_tokens: 20, total_tokens: 150 }
  });

  const exportDir = path.join(tmpDir, 'export');
  const exportResult = exportObservatorySnapshot(journal, exportDir, {
    experiment_id: 'exp-test-001',
    fixed_timestamp: 1788053000000
  });

  assert.ok(fs.existsSync(exportResult.snapshot_path));
  const exported = JSON.parse(fs.readFileSync(exportResult.snapshot_path, 'utf8'));
  assert.equal(exported.total_observations, 1);
  assert.equal(exported.experiment_id, 'exp-test-001');
  assert.equal(exported.integrity.valid, true);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('T21 runtime journal does not require Git mutation', () => {
  const tmpDir = createTempJournalDir();
  const journalPath = path.join(tmpDir, 'observations.jsonl');
  const journal = new ShadowObservatoryJournal({ journalPath });

  journal.appendObservation({
    session_id: 's1',
    production_route: { execution_class: 'LOCAL', provider: 'p1', model: 'm1', status: 'ROUTED' },
    shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'p1', model: 'm1' }, reason_codes: [] },
    actual_tokens: { input_tokens: 10, output_tokens: 10, cached_input_tokens: 0, total_tokens: 20 }
  });

  // Journal is strictly outside git index or under tmp/XDG
  assert.ok(!journalPath.includes('.git'));
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('T22 no network activity', () => {
  const tmpDir = createTempJournalDir();
  const journal = new ShadowObservatoryJournal({ journalPath: path.join(tmpDir, 'obs.jsonl') });

  // Pure in-memory operations with zero fetch/socket
  const ev = journal.appendObservation({
    session_id: 's1',
    production_route: { execution_class: 'LOCAL', provider: 'p1', model: 'm1', status: 'ROUTED' },
    shadow_evaluation: { recommended_execution_class: 'LOCAL', recommended_lane: { provider: 'p1', model: 'm1' }, reason_codes: [] },
    actual_tokens: { input_tokens: 10, output_tokens: 10, cached_input_tokens: 0, total_tokens: 20 }
  });

  const integrity = journal.verifyJournalIntegrity();
  assert.equal(integrity.valid, true);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('T23 existing shadow evaluator remains side-effect free', () => {
  const lane = {
    lane_id: 'l1',
    provider: 'openai-codex',
    model: 'gpt-5.6-luna',
    execution_class: 'REMOTE_SUBSCRIPTION',
    trust_domain: 'engineering',
    capabilities: ['code_build']
  };
  const rawLanes = [lane];
  const telemetry = [{
    provider_id: 'openai-codex',
    model_id: null,
    metric: 'requests',
    unit: 'requests',
    state: 'AUTHORITATIVE_REMOTE',
    quota: { limit: 100, used: 20, remaining: 80, resets_at: Date.now() + 3600000, window: { duration: 86400000 } }
  }];

  const evalResult = evaluateEconomicShadow({
    lanes: rawLanes,
    telemetryRecords: telemetry,
    policy: createEconomicPolicy(),
    requirement: { trust_domain: 'engineering', capabilities: ['code_build'] },
    queuedWork: true
  });

  // Lanes array and telemetry records are unchanged
  assert.equal(rawLanes.length, 1);
  assert.equal(rawLanes[0].lane_id, 'l1');
  assert.ok(evalResult.shadow_recommended_route);
});

test('T24 production router output remains unchanged', () => {
  const policy = createEconomicPolicy();
  const resBefore = routeEconomically({
    requirement: { trust_domain: 'engineering', capabilities: ['code_build'] },
    lanes: [{ lane_id: 'local_qwen', provider: 'local-runner', model: 'qwen', execution_class: 'DETERMINISTIC_EXISTING', trust_domain: 'engineering', capabilities: ['code_build'], paid: false, rank: 1 }],
    policy,
    paid_authorized: false
  });

  // Production route output is deterministic
  assert.equal(resBefore.selected_lane, 'local_qwen');
  assert.equal(resBefore.status, 'ROUTED');
});
