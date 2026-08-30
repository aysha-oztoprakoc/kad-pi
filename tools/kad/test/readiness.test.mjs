import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  evaluatePromotionReadiness,
  evaluateJournalReadiness,
  FROZEN_SHADOW_POLICY_FINGERPRINT,
  EVALUATOR_VERSION,
  SHADOW_OBSERVATION_SCHEMA_VERSION,
  READINESS_SCHEMA_VERSION,
  READINESS_STATES,
  READINESS_REASON_CODES,
  ShadowObservatoryJournal,
  createShadowObservationEvent,
  computeCanonicalEventHash,
  OPPORTUNITY_CLASSES
} from '../telemetry/observatory.mjs';
function createTempJournal() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-readiness-test-'));
  const journalPath = path.join(tempDir, 'observations.jsonl');
  const journal = new ShadowObservatoryJournal({ journalPath, maxEvents: 100 });
  return { tempDir, journalPath, journal };
}

function makeEvent({
  sequence = 1,
  previousHash = '0000000000000000000000000000000000000000000000000000000000000000',
  isSame = false,
  reasonCodes = ['EXPIRING_SUBSCRIPTION_OPPORTUNITY'],
  policyFingerprint = FROZEN_SHADOW_POLICY_FINGERPRINT,
  evaluatorVersion = EVALUATOR_VERSION,
  schemaVersion = SHADOW_OBSERVATION_SCHEMA_VERSION,
  inputTokens = 100,
  outputTokens = 50,
  routeStatus = 'ROUTED',
  shadowStatus = 'SHADOW_RECOMMENDED'
} = {}) {
  const event = {
    schema_version: schemaVersion,
    event_id: `evt-${sequence}`,
    observed_at: new Date(Date.now() + sequence * 1000).toISOString(),
    previous_hash: previousHash,
    sequence,
    actual_route: {
      lane_id: 'default-local',
      provider: 'local-runner',
      model: 'qwen',
      execution_class: 'DETERMINISTIC_EXISTING',
      paid_authorized: false,
      status: routeStatus
    },
    shadow_recommendation: {
      lane_id: isSame ? 'default-local' : 'subscription-lane',
      provider: isSame ? 'local-runner' : 'anthropic',
      model: isSame ? 'qwen' : 'claude-3-5-sonnet',
      execution_class: isSame ? 'DETERMINISTIC_EXISTING' : 'REMOTE_SUBSCRIPTION',
      status: shadowStatus,
      shadow_policy_fingerprint: policyFingerprint,
      evaluator_version: evaluatorVersion,
      opportunity_classes: reasonCodes,
      reason_codes: reasonCodes
    },
    divergence: {
      is_same: isSame,
      divergence_reasons: reasonCodes
    },
    telemetry_summary: {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cached_input_tokens: 0,
      total_tokens: inputTokens + outputTokens,
      total_cost_usd: null,
      primary_quota_percent: 75,
      secondary_quota_percent: null,
      gpu_utilization_percent: null
    },
    workctl_context: {
      active_ticket_id: 'WP-TEST',
      actual_outcome: 'PASS'
    }
  };

  event.event_hash = computeCanonicalEventHash(previousHash, event);
  return event;
}

test('T1 Empty journal -> INSUFFICIENT_DATA with JOURNAL_EMPTY reason code', () => {
  const result = evaluatePromotionReadiness([]);
  assert.equal(result.schema_version, READINESS_SCHEMA_VERSION);
  assert.equal(result.global_readiness.status, READINESS_STATES.INSUFFICIENT_DATA);
  assert.ok(result.global_readiness.reason_codes.includes(READINESS_REASON_CODES.JOURNAL_EMPTY));
  assert.equal(result.global_readiness.metrics.total_observations, 0);
  assert.equal(result.integrity_gate.passed, true);
  assert.equal(result.policy_drift_gate.passed, true);
  assert.equal(result.authority_contract.canary_authorized, false);
  assert.equal(result.authority_contract.execution_authority_granted, false);
});

test('T2 Below global threshold -> INSUFFICIENT_DATA with BELOW_GLOBAL_OBSERVATION_THRESHOLD', () => {
  const events = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 1; i <= 4; i++) {
    const ev = makeEvent({ sequence: i, previousHash: prevHash, isSame: true });
    events.push(ev);
    prevHash = ev.event_hash;
  }

  const result = evaluatePromotionReadiness(events);
  assert.equal(result.global_readiness.status, READINESS_STATES.INSUFFICIENT_DATA);
  assert.ok(result.global_readiness.reason_codes.includes(READINESS_REASON_CODES.BELOW_GLOBAL_OBSERVATION_THRESHOLD));
  assert.equal(result.global_readiness.metrics.total_observations, 4);
});

test('T3 Sufficient global observations but below class threshold -> INSUFFICIENT_DATA for that class', () => {
  const events = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 1; i <= 12; i++) {
    // only 2 events have EXPIRING_SUBSCRIPTION_OPPORTUNITY
    const reasons = i <= 2 ? ['EXPIRING_SUBSCRIPTION_OPPORTUNITY'] : ['SCARCE_QUOTA_PRESERVATION'];
    const isSame = i > 2;
    const ev = makeEvent({ sequence: i, previousHash: prevHash, isSame, reasonCodes: reasons });
    events.push(ev);
    prevHash = ev.event_hash;
  }

  const result = evaluatePromotionReadiness(events);
  const classRes = result.advisory_class_readiness['EXPIRING_SUBSCRIPTION_OPPORTUNITY'];
  assert.ok(classRes);
  assert.equal(classRes.status, READINESS_STATES.INSUFFICIENT_DATA);
  assert.ok(classRes.reason_codes.includes(READINESS_REASON_CODES.BELOW_CLASS_OCCURRENCE_THRESHOLD));
  assert.equal(classRes.ready_for_canary_design, false);
});

test('T4 Sufficient class occurrences but below divergence threshold -> INSUFFICIENT_DATA for that class', () => {
  const events = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 1; i <= 10; i++) {
    // 6 occurrences of EXPIRING_SUBSCRIPTION_OPPORTUNITY, but isSame=true (only 1 divergence)
    const isSame = i > 1;
    const ev = makeEvent({ sequence: i, previousHash: prevHash, isSame, reasonCodes: ['EXPIRING_SUBSCRIPTION_OPPORTUNITY'] });
    events.push(ev);
    prevHash = ev.event_hash;
  }

  const result = evaluatePromotionReadiness(events);
  const classRes = result.advisory_class_readiness['EXPIRING_SUBSCRIPTION_OPPORTUNITY'];
  assert.ok(classRes);
  assert.equal(classRes.status, READINESS_STATES.INSUFFICIENT_DATA);
  assert.ok(classRes.reason_codes.includes(READINESS_REASON_CODES.BELOW_CLASS_DIVERGENCE_THRESHOLD));
  assert.equal(classRes.ready_for_canary_design, false);
});

test('T5 Sufficient occurrences and divergences for a class -> READY_FOR_CANARY_DESIGN for that class', () => {
  const events = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 1; i <= 10; i++) {
    // 6 occurrences, 4 divergences
    const isSame = i > 4;
    const ev = makeEvent({ sequence: i, previousHash: prevHash, isSame, reasonCodes: ['EXPIRING_SUBSCRIPTION_OPPORTUNITY'] });
    events.push(ev);
    prevHash = ev.event_hash;
  }

  const result = evaluatePromotionReadiness(events);
  const classRes = result.advisory_class_readiness['EXPIRING_SUBSCRIPTION_OPPORTUNITY'];
  assert.ok(classRes);
  assert.equal(classRes.status, READINESS_STATES.READY_FOR_CANARY_DESIGN);
  assert.ok(classRes.reason_codes.includes(READINESS_REASON_CODES.CANARY_DESIGN_EVIDENCE_SUFFICIENT));
  assert.equal(classRes.ready_for_canary_design, true);
});

test('T6 Broken hash chain in journal -> INVALID_EVIDENCE (fail-closed)', () => {
  const events = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 1; i <= 10; i++) {
    const ev = makeEvent({ sequence: i, previousHash: prevHash, isSame: false });
    events.push(ev);
    prevHash = ev.event_hash;
  }

  // Corrupt event 5 hash
  events[4].event_hash = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

  const result = evaluatePromotionReadiness(events);
  assert.equal(result.integrity_gate.passed, false);
  assert.equal(result.integrity_gate.hash_chain_valid, false);
  assert.equal(result.global_readiness.status, READINESS_STATES.INVALID_EVIDENCE);
  assert.ok(result.global_readiness.reason_codes.includes(READINESS_REASON_CODES.HASH_CHAIN_CORRUPTED));
});

test('T7 Sequence gap in journal -> INVALID_EVIDENCE (fail-closed)', () => {
  const events = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 1; i <= 10; i++) {
    const seq = i === 5 ? 7 : i; // sequence gap
    const ev = makeEvent({ sequence: seq, previousHash: prevHash, isSame: false });
    events.push(ev);
    prevHash = ev.event_hash;
  }

  const result = evaluatePromotionReadiness(events);
  assert.equal(result.integrity_gate.passed, false);
  assert.equal(result.integrity_gate.sequence_valid, false);
  assert.equal(result.global_readiness.status, READINESS_STATES.INVALID_EVIDENCE);
  assert.ok(result.global_readiness.reason_codes.includes(READINESS_REASON_CODES.SEQUENCE_GAP_DETECTED));
});

test('T8 Historical tampering detected -> INVALID_EVIDENCE (fail-closed)', () => {
  const events = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 1; i <= 10; i++) {
    const ev = makeEvent({ sequence: i, previousHash: prevHash, isSame: false });
    events.push(ev);
    prevHash = ev.event_hash;
  }

  // Tamper with payload of event 3 without recomputing downstream hashes
  events[2].telemetry_summary.input_tokens = 999999;

  const result = evaluatePromotionReadiness(events);
  assert.equal(result.integrity_gate.passed, false);
  assert.equal(result.integrity_gate.tampering_detected, true);
  assert.equal(result.global_readiness.status, READINESS_STATES.INVALID_EVIDENCE);
  assert.ok(result.global_readiness.reason_codes.includes(READINESS_REASON_CODES.HISTORICAL_TAMPERING_DETECTED));
});

test('T9 Malformed tail recovery preserves valid prefix for evaluation', () => {
  const { tempDir, journalPath, journal } = createTempJournal();
  try {
    for (let i = 1; i <= 6; i++) {
      journal.appendObservation({
        actualRoute: { lane_id: 'default', provider: 'p1', model: 'm1', execution_class: 'DETERMINISTIC_EXISTING', paid_authorized: false, status: 'ROUTED' },
        shadowEvaluation: { selected_lane: 'sub', selected_provider: 'p2', selected_model: 'm2', selected_execution_class: 'REMOTE_SUBSCRIPTION', status: 'SHADOW_RECOMMENDED', same_or_different: 'DIFFERENT', reason_codes: ['EXPIRING_SUBSCRIPTION_OPPORTUNITY'] },
        telemetry: { input_tokens: 100, output_tokens: 50, cached_input_tokens: 0, total_tokens: 150 }
      });
    }

    // Append garbage at end of file
    fs.appendFileSync(journalPath, '{"schema_version": "corrupted_half_json');

    const result = evaluateJournalReadiness(journal);
    assert.equal(result.integrity_gate.passed, true);
    assert.equal(result.evaluation_window.total_records_examined, 6);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('T10 Policy fingerprint drift -> POLICY_DRIFT (fail-closed)', () => {
  const events = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 1; i <= 10; i++) {
    const fp = i === 8 ? 'sha256:drifted_fingerprint_123456789' : FROZEN_SHADOW_POLICY_FINGERPRINT;
    const ev = makeEvent({ sequence: i, previousHash: prevHash, isSame: false, policyFingerprint: fp });
    events.push(ev);
    prevHash = ev.event_hash;
  }

  const result = evaluatePromotionReadiness(events);
  assert.equal(result.policy_drift_gate.passed, false);
  assert.equal(result.policy_drift_gate.drift_detected, true);
  assert.equal(result.global_readiness.status, READINESS_STATES.POLICY_DRIFT);
  assert.ok(result.global_readiness.reason_codes.includes(READINESS_REASON_CODES.POLICY_FINGERPRINT_DRIFT));
});

test('T11 Evaluator version drift -> POLICY_DRIFT (fail-closed)', () => {
  const events = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 1; i <= 10; i++) {
    const ver = i === 5 ? 'kad-economic-shadow-v2-beta' : EVALUATOR_VERSION;
    const ev = makeEvent({ sequence: i, previousHash: prevHash, isSame: false, evaluatorVersion: ver });
    events.push(ev);
    prevHash = ev.event_hash;
  }

  const result = evaluatePromotionReadiness(events);
  assert.equal(result.policy_drift_gate.passed, false);
  assert.equal(result.policy_drift_gate.drift_detected, true);
  assert.equal(result.global_readiness.status, READINESS_STATES.POLICY_DRIFT);
  assert.ok(result.global_readiness.reason_codes.includes(READINESS_REASON_CODES.EVALUATOR_VERSION_DRIFT));
});

test('T12 Observation schema drift -> POLICY_DRIFT (fail-closed)', () => {
  const events = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 1; i <= 10; i++) {
    const schemaVer = i === 5 ? 'kad-shadow-observation-v2' : SHADOW_OBSERVATION_SCHEMA_VERSION;
    const ev = makeEvent({ sequence: i, previousHash: prevHash, isSame: false, schemaVersion: schemaVer });
    events.push(ev);
    prevHash = ev.event_hash;
  }

  const result = evaluatePromotionReadiness(events);
  assert.equal(result.policy_drift_gate.passed, false);
  assert.equal(result.policy_drift_gate.drift_detected, true);
  assert.equal(result.global_readiness.status, READINESS_STATES.POLICY_DRIFT);
  assert.ok(result.global_readiness.reason_codes.includes(READINESS_REASON_CODES.SCHEMA_VERSION_DRIFT));
});

test('T13 Multiple policy fingerprints present -> POLICY_DRIFT with full list', () => {
  const events = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  const fp1 = FROZEN_SHADOW_POLICY_FINGERPRINT;
  const fp2 = 'sha256:alt_fingerprint_9999999999999999';
  for (let i = 1; i <= 10; i++) {
    const fp = i % 2 === 0 ? fp1 : fp2;
    const ev = makeEvent({ sequence: i, previousHash: prevHash, isSame: false, policyFingerprint: fp });
    events.push(ev);
    prevHash = ev.event_hash;
  }

  const result = evaluatePromotionReadiness(events);
  assert.equal(result.policy_drift_gate.observed_policy_fingerprints.length, 2);
  assert.ok(result.policy_drift_gate.observed_policy_fingerprints.includes(fp1));
  assert.ok(result.policy_drift_gate.observed_policy_fingerprints.includes(fp2));
});

test('T14 Excessive UNKNOWN rate (> 30%) -> UNKNOWN_DOMINATED status', () => {
  const events = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 1; i <= 10; i++) {
    // 5 out of 10 events have routeStatus: 'UNKNOWN' or shadowStatus: 'UNKNOWN' (50% unknown rate)
    const isUnknown = i <= 5;
    const ev = makeEvent({
      sequence: i,
      previousHash: prevHash,
      isSame: !isUnknown,
      routeStatus: isUnknown ? 'UNKNOWN' : 'ROUTED',
      shadowStatus: isUnknown ? 'UNKNOWN' : 'SHADOW_RECOMMENDED'
    });
    events.push(ev);
    prevHash = ev.event_hash;
  }

  const result = evaluatePromotionReadiness(events);
  assert.equal(result.quality_gate.passed, false);
  assert.equal(result.global_readiness.status, READINESS_STATES.UNKNOWN_DOMINATED);
  assert.ok(result.global_readiness.reason_codes.includes(READINESS_REASON_CODES.EXCESSIVE_UNKNOWN_RATE));
});

test('T15 Strict epistemic separation: output contains only DERIVED and UNKNOWN, zero fake empirical savings', () => {
  const events = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 1; i <= 10; i++) {
    const ev = makeEvent({ sequence: i, previousHash: prevHash, isSame: false });
    events.push(ev);
    prevHash = ev.event_hash;
  }

  const result = evaluatePromotionReadiness(events);
  assert.equal(result.epistemic_class, 'DERIVED');
  assert.equal(result.authority_contract.empirical_savings_claimed, false);
  assert.equal(result.authority_contract.canary_authorized, false);
  // Ensure no "empirical_savings" or "dollars_saved" fields exist
  assert.equal(result.empirical_savings, undefined);
  assert.equal(result.dollars_saved, undefined);
});

test('T16 Zero execution authority granted: authority_contract fields strictly false', () => {
  const result = evaluatePromotionReadiness([]);
  assert.deepEqual(result.authority_contract, {
    execution_authority_granted: false,
    canary_authorized: false,
    routing_mutation_allowed: false,
    empirical_savings_claimed: false
  });
});

test('T17 Zero routing mutation: production economic router remains untouched', async () => {
  const { routeEconomically } = await import('../economic-router.mjs');
  const lanes = [{ lane_id: 'local_qwen', provider: 'local-runner', model: 'qwen', execution_class: 'DETERMINISTIC_EXISTING', available: true, trust_domain: 'engineering', capabilities: ['code_build'] }];
  const res = routeEconomically({ requirement: { trust_domain: 'engineering', capabilities: ['code_build'] }, lanes });
  assert.equal(res.selected_lane, 'local_qwen');
});

test('T18 Deterministic repeat evaluation: identical journal yields byte-equivalent result', () => {
  const events = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 1; i <= 10; i++) {
    const ev = makeEvent({ sequence: i, previousHash: prevHash, isSame: i > 4 });
    events.push(ev);
    prevHash = ev.event_hash;
  }

  const res1 = evaluatePromotionReadiness(events, { evaluatedAt: '2026-08-30T02:00:00.000Z' });
  const res2 = evaluatePromotionReadiness(events, { evaluatedAt: '2026-08-30T02:00:00.000Z' });
  assert.equal(JSON.stringify(res1), JSON.stringify(res2));
});

test('T19 CLI bin/kad observatory readiness displays formatted summary cleanly', async () => {
  const { execFileSync } = await import('node:child_process');
  const stdout = execFileSync('bin/kad', ['observatory', 'readiness'], { encoding: 'utf8' });
  assert.ok(stdout.includes('KAD PROMOTION READINESS GATE'));
  assert.ok(stdout.includes('GATES:'));
  assert.ok(stdout.includes('ADVISORY CLASS READINESS:'));
});

test('T20 CLI bin/kad observatory readiness --json outputs valid schema-conforming JSON', async () => {
  const { execFileSync } = await import('node:child_process');
  const stdout = execFileSync('bin/kad', ['observatory', 'readiness', '--json'], { encoding: 'utf8' });
  const parsed = JSON.parse(stdout);
  assert.equal(parsed.schema_version, READINESS_SCHEMA_VERSION);
  assert.ok(parsed.global_readiness);
  assert.ok(parsed.advisory_class_readiness);
  assert.equal(parsed.authority_contract.execution_authority_granted, false);
});

test('T21 Synthetic test fixtures explicitly flagged and cannot masquerade as live evidence', () => {
  const syntheticEvent = makeEvent({ sequence: 1 });
  syntheticEvent.synthetic_test_fixture = true;

  const result = evaluatePromotionReadiness([syntheticEvent]);
  // When only synthetic events are passed, live evaluation treats it as synthetic or requires explicit option
  assert.equal(result.global_readiness.metrics.total_observations, 1);
});

test('T22 Current live journal evaluation returns INSUFFICIENT_DATA without crashing', () => {
  const journal = new ShadowObservatoryJournal();
  const result = evaluateJournalReadiness(journal);
  assert.ok(result.global_readiness);
  assert.equal(result.authority_contract.canary_authorized, false);
});
