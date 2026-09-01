import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import {
  TELEMETRY_OUTCOME_SCHEMA_VERSION,
  ORIGIN_CLASSES,
  INTERVENTION_CATEGORIES,
  INTERVENTION_LEVERAGE_TIERS,
  WORK_CLASSES,
  RISK_TIERS,
  PROVIDER_CLASSES,
  SPEND_CLASSES,
  createOutcomeTelemetryRecord,
  validateOutcomeTelemetryRecord,
  classifyIntervention,
  sanitizeTelemetryData,
  computeRecordHash,
  verifyRecordIntegrity,
} from '../telemetry/outcome-cost-schema.mjs';

import {
  OutcomeTelemetryStorage,
} from '../telemetry/storage.mjs';

import {
  aggregateOutcomeTelemetry,
  computeSummaryProfile,
} from '../telemetry/aggregator.mjs';

import {
  reconstructHistoricalTelemetry,
} from '../telemetry/historical-backfill.mjs';

import {
  analyzeArchitectureComplexity,
} from '../telemetry/complexity-analyzer.mjs';

test('T01: valid telemetry record -> PASS', () => {
  const record = createOutcomeTelemetryRecord({
    work: {
      workpackage_id: 'WP-KAD-IDEAL-STATE-V2-SEMANTIC-RECONCILIATION-030R',
      ticket_id: 'user:/WP-KAD-IDEAL-STATE-V2-SEMANTIC-RECONCILIATION-030R',
      run_id: 'run-030r-001',
      work_class: 'IMPLEMENTATION',
      risk_tier: 'TIER_2_MEDIUM',
      provider_class: 'LOCAL_DETERMINISTIC',
      started_at: '2026-08-30T21:00:00.000Z',
      ended_at: '2026-08-30T21:39:11.000Z',
    },
    outcome: {
      accepted: true,
      acceptance_revision: '15483b6c87757358ab046d50d94498c9fdfb1ebe',
      acceptance_evidence_refs: ['evidence/WP-KAD-IDEAL-STATE-V2-SEMANTIC-RECONCILIATION-030R/FINAL_REPORT.md'],
    },
    human: {
      intervention_count: 1,
      decision_events: 1,
      review_rejections: 0,
      manual_retries: 0,
      context_reorientation_events: 0,
      active_minutes_estimate: 15,
      active_minutes_source: 'HUMAN_REPORTED',
      interventions: [
        {
          category: 'STRATEGIC_DESIGN',
          description: 'Resolved economic envelope model',
          timestamp: '2026-08-30T21:10:00.000Z',
        },
      ],
    },
    quality: {
      escaped_regressions: 0,
      acceptance_reversals: 0,
      rollback_count: 0,
      post_acceptance_defects: 0,
    },
    execution: {
      agent_runs: 1,
      failed_runs: 0,
      retries: 0,
      wall_clock_ms: 2351000,
    },
    context: {
      input_tokens: null,
      output_tokens: null,
      remote_tokens: null,
      context_packet_bytes: 45000,
    },
    economic: {
      api_cost_usd: null,
      metered_spend_class: 'NONE',
    },
    compute: {
      cpu_time_ms: 45000,
      gpu_time_ms: null,
      gpu_peak_vram_bytes: null,
    },
    maintenance: {
      maintenance_minutes: 0,
      telemetry_overhead_ms: 12,
    },
    provenance: {
      observed_at: '2026-08-30T21:40:00.000Z',
      collector: 'kad-outcome-collector-v1',
      source_refs: ['evidence/WP-KAD-IDEAL-STATE-V2-SEMANTIC-RECONCILIATION-030R/'],
    },
  });

  const validation = validateOutcomeTelemetryRecord(record);
  assert.equal(validation.valid, true, `Validation failed: ${validation.errors?.join(', ')}`);
  assert.equal(record.schema_version, TELEMETRY_OUTCOME_SCHEMA_VERSION);
  assert.ok(record.provenance.record_hash.startsWith('sha256:'));
});

test('T02: missing mandatory provenance -> FAIL', () => {
  const invalidRecord = {
    schema_version: TELEMETRY_OUTCOME_SCHEMA_VERSION,
    work: {
      workpackage_id: 'WP-TEST-001',
      work_class: 'IMPLEMENTATION',
    },
    outcome: {
      accepted: true,
      acceptance_evidence_refs: ['evidence/test.md'],
    },
    provenance: {
      // Missing observed_at and collector and record_hash
    },
  };

  const validation = validateOutcomeTelemetryRecord(invalidRecord);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((e) => e.includes('provenance')));
});

test('T03: unknown numeric field represented as zero -> FAIL / semantic validation', () => {
  // If api_cost_usd is unknown, setting it to 0 without an observed origin violates UNKNOWN != ZERO
  const badRecord = createOutcomeTelemetryRecord({
    work: {
      workpackage_id: 'WP-TEST-002',
      work_class: 'IMPLEMENTATION',
    },
    outcome: {
      accepted: true,
      acceptance_evidence_refs: ['evidence/test.md'],
    },
    economic: {
      api_cost_usd: 0, // Fabricated zero when spend is UNKNOWN
      metered_spend_class: 'UNKNOWN',
    },
    provenance: {
      observed_at: new Date().toISOString(),
      collector: 'test-collector',
    },
  });

  const validation = validateOutcomeTelemetryRecord(badRecord);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((e) => e.includes('UNKNOWN') || e.includes('zero') || e.includes('economic')));
});

test('T04: UNKNOWN represented explicitly -> PASS', () => {
  const record = createOutcomeTelemetryRecord({
    work: {
      workpackage_id: 'WP-TEST-003',
      work_class: 'RESEARCH',
    },
    outcome: {
      accepted: true,
      acceptance_evidence_refs: ['evidence/research.md'],
    },
    context: {
      input_tokens: null, // explicitly unknown
      output_tokens: null,
      remote_tokens: null,
      context_packet_bytes: null,
    },
    economic: {
      api_cost_usd: null, // explicitly unknown
      metered_spend_class: 'UNKNOWN',
    },
    human: {
      active_minutes_estimate: null,
      active_minutes_source: 'UNKNOWN',
    },
    provenance: {
      observed_at: new Date().toISOString(),
      collector: 'test-collector',
      source_refs: ['evidence/research.md'],
    },
  });

  const validation = validateOutcomeTelemetryRecord(record);
  assert.equal(validation.valid, true, `Validation failed: ${validation.errors?.join(', ')}`);
  assert.equal(record.context.input_tokens, null);
  assert.equal(record.economic.api_cost_usd, null);
  assert.equal(record.human.active_minutes_source, 'UNKNOWN');
});

test('T05: raw secret-like field captured -> FAIL / sanitized', () => {
  const dirtyData = {
    workpackage_id: 'WP-TEST-004',
    apiKey: 'sk-ant-api03-12345678901234567890',
    authorization: 'Bearer secret_token_abc123',
    nested: {
      user_password: 'supersecretpassword',
      normal_field: 'normal_value',
    },
  };

  const sanitized = sanitizeTelemetryData(dirtyData);
  assert.equal(sanitized.apiKey, '[REDACTED]');
  assert.equal(sanitized.authorization, '[REDACTED]');
  assert.equal(sanitized.nested.user_password, '[REDACTED]');
  assert.equal(sanitized.nested.normal_field, 'normal_value');

  // Creating record with raw secrets must fail validation if unredacted
  const unredactedRecord = {
    schema_version: TELEMETRY_OUTCOME_SCHEMA_VERSION,
    work: {
      workpackage_id: 'WP-TEST-004',
      work_class: 'IMPLEMENTATION',
      auth_header: 'Bearer raw_token',
    },
    outcome: { accepted: true, acceptance_evidence_refs: ['evidence/test.md'] },
    provenance: { observed_at: new Date().toISOString(), collector: 'test', record_hash: 'sha256:123' },
  };

  const val = validateOutcomeTelemetryRecord(unredactedRecord);
  assert.equal(val.valid, false);
  assert.ok(val.errors.some((e) => e.includes('secret') || e.includes('auth')));
});

test('T06: accepted work without evidence reference -> FAIL where policy requires evidence', () => {
  const recordNoEvidence = createOutcomeTelemetryRecord({
    work: {
      workpackage_id: 'WP-TEST-005',
      work_class: 'IMPLEMENTATION',
    },
    outcome: {
      accepted: true,
      acceptance_evidence_refs: [], // Empty evidence for accepted work
    },
    provenance: {
      observed_at: new Date().toISOString(),
      collector: 'test-collector',
    },
  });

  const validation = validateOutcomeTelemetryRecord(recordNoEvidence);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((e) => e.includes('evidence')));
});

test('T07: failed run counted correctly -> PASS', () => {
  const record = createOutcomeTelemetryRecord({
    work: {
      workpackage_id: 'WP-TEST-006',
      work_class: 'DEBUGGING',
    },
    outcome: {
      accepted: false,
      rejection_reason: 'Test suite failed in verification step',
      acceptance_evidence_refs: [],
    },
    execution: {
      agent_runs: 3,
      failed_runs: 2,
      retries: 2,
      wall_clock_ms: 120000,
    },
    provenance: {
      observed_at: new Date().toISOString(),
      collector: 'test-collector',
      source_refs: ['logs/run.log'],
    },
  });

  assert.equal(record.execution.failed_runs, 2);
  assert.equal(record.execution.agent_runs, 3);
  const val = validateOutcomeTelemetryRecord(record);
  assert.equal(val.valid, true);
});

test('T08: retry increment -> PASS', () => {
  const record = createOutcomeTelemetryRecord({
    work: {
      workpackage_id: 'WP-TEST-007',
      work_class: 'IMPLEMENTATION',
    },
    outcome: {
      accepted: true,
      acceptance_evidence_refs: ['evidence/wp-test-007/report.md'],
    },
    execution: {
      agent_runs: 2,
      failed_runs: 1,
      retries: 1,
      wall_clock_ms: 60000,
    },
    human: {
      manual_retries: 1,
      interventions: [
        {
          category: 'MANUAL_RETRY',
          description: 'Re-triggered test suite after transient lock failure',
          timestamp: new Date().toISOString(),
        },
      ],
    },
    provenance: {
      observed_at: new Date().toISOString(),
      collector: 'test-collector',
      source_refs: ['evidence/wp-test-007/report.md'],
    },
  });

  assert.equal(record.execution.retries, 1);
  assert.equal(record.human.manual_retries, 1);
  assert.equal(record.human.interventions[0].category, 'MANUAL_RETRY');
});

test('T09: intervention classification preserved -> PASS', () => {
  const categories = [
    'STRATEGIC_DESIGN',
    'RESEARCH_INTERPRETATION',
    'CONSTITUTIONAL_DECISION',
    'EXPECTED_REVIEW',
    'CORRECTIVE_INTERVENTION',
    'AGENT_BABYSITTING',
    'RECOVERY',
    'CONTEXT_RECONSTRUCTION',
    'MANUAL_RETRY',
    'PROVIDER_OVERRIDE',
  ];

  for (const cat of categories) {
    const classification = classifyIntervention(cat);
    assert.ok(classification.tier, `Missing tier for ${cat}`);
    assert.equal(classification.category, cat);
  }
});

test('T10: strategic human decision not counted as low-leverage correction -> PASS', () => {
  const strategic = classifyIntervention('STRATEGIC_DESIGN');
  assert.equal(strategic.tier, INTERVENTION_LEVERAGE_TIERS.HIGH_LEVERAGE_STRATEGIC);
  assert.equal(strategic.is_friction, false);

  const research = classifyIntervention('RESEARCH_INTERPRETATION');
  assert.equal(research.tier, INTERVENTION_LEVERAGE_TIERS.HIGH_LEVERAGE_STRATEGIC);
  assert.equal(research.is_friction, false);

  const corrective = classifyIntervention('CORRECTIVE_INTERVENTION');
  assert.equal(corrective.tier, INTERVENTION_LEVERAGE_TIERS.LOW_LEVERAGE_FRICTION);
  assert.equal(corrective.is_friction, true);

  const babysitting = classifyIntervention('AGENT_BABYSITTING');
  assert.equal(babysitting.tier, INTERVENTION_LEVERAGE_TIERS.LOW_LEVERAGE_FRICTION);
  assert.equal(babysitting.is_friction, true);
});

test('T11: telemetry record references nonexistent WP/run -> FAIL where resolvable', () => {
  const record = createOutcomeTelemetryRecord({
    work: {
      workpackage_id: 'NONEXISTENT_WP_ID_THAT_DOES_NOT_EXIST_99999',
      work_class: 'IMPLEMENTATION',
    },
    outcome: {
      accepted: true,
      acceptance_evidence_refs: ['evidence/does-not-exist.md'],
    },
    provenance: {
      observed_at: new Date().toISOString(),
      collector: 'test-collector',
    },
  });

  // Strict reference check against workspace should fail or flag unresolved reference
  const validation = validateOutcomeTelemetryRecord(record, { checkWorkspaceReferences: true });
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((e) => e.includes('workpackage_id') || e.includes('reference')));
});

test('T12: provider metadata remains optional -> PASS', () => {
  const record = createOutcomeTelemetryRecord({
    work: {
      workpackage_id: 'WP-TEST-012',
      work_class: 'VERIFICATION',
      // provider_class omitted or UNKNOWN
    },
    outcome: {
      accepted: true,
      acceptance_evidence_refs: ['evidence/wp-test-012.md'],
    },
    provenance: {
      observed_at: new Date().toISOString(),
      collector: 'test-collector',
      source_refs: ['evidence/wp-test-012.md'],
    },
  });

  const val = validateOutcomeTelemetryRecord(record);
  assert.equal(val.valid, true);
  assert.equal(record.work.provider_class, 'UNKNOWN');
});

test('T13: workload semantics require vendor/model -> FAIL (provider neutrality)', () => {
  // Creating a workload definition that mandates vendor/model as a required workload property fails neutrality validation
  const nonNeutralWorkload = {
    work_class: 'IMPLEMENTATION',
    required_vendor: 'anthropic', // Violates vendor neutrality
    required_model: 'claude-3-5-sonnet',
  };

  const validation = validateOutcomeTelemetryRecord({
    schema_version: TELEMETRY_OUTCOME_SCHEMA_VERSION,
    work: {
      workpackage_id: 'WP-TEST-013',
      ...nonNeutralWorkload,
    },
    outcome: { accepted: true, acceptance_evidence_refs: ['evidence/test.md'] },
    provenance: { observed_at: new Date().toISOString(), collector: 'test', record_hash: 'sha256:123' },
  }, { enforceVendorNeutrality: true });

  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((e) => e.includes('neutrality') || e.includes('vendor') || e.includes('model')));
});

test('T14: rollback survives later acceptance -> PASS', () => {
  const record = createOutcomeTelemetryRecord({
    work: {
      workpackage_id: 'WP-TEST-014',
      work_class: 'IMPLEMENTATION',
    },
    outcome: {
      accepted: true,
      acceptance_evidence_refs: ['evidence/wp-test-014.md'],
    },
    quality: {
      escaped_regressions: 0,
      acceptance_reversals: 1, // Previously accepted then reverted
      rollback_count: 1,       // Rollback occurred
      post_acceptance_defects: 0,
    },
    provenance: {
      observed_at: new Date().toISOString(),
      collector: 'test-collector',
      source_refs: ['evidence/wp-test-014.md'],
    },
  });

  assert.equal(record.outcome.accepted, true);
  assert.equal(record.quality.rollback_count, 1);
  assert.equal(record.quality.acceptance_reversals, 1);

  const val = validateOutcomeTelemetryRecord(record);
  assert.equal(val.valid, true);
});

test('T15: observer overhead recorded -> PASS', () => {
  const record = createOutcomeTelemetryRecord({
    work: {
      workpackage_id: 'WP-TEST-015',
      work_class: 'BENCHMARK',
    },
    outcome: {
      accepted: true,
      acceptance_evidence_refs: ['evidence/wp-test-015.md'],
    },
    maintenance: {
      telemetry_overhead_ms: 15,
      collector_cpu_ms: 8,
      collector_wall_ms: 14,
      bytes_written: 1024,
    },
    provenance: {
      observed_at: new Date().toISOString(),
      collector: 'test-collector',
      source_refs: ['evidence/wp-test-015.md'],
    },
  });

  assert.equal(record.maintenance.telemetry_overhead_ms, 15);
  assert.equal(record.maintenance.collector_cpu_ms, 8);
  assert.equal(record.maintenance.bytes_written, 1024);
});

test('T16: historical reconstructed record classified RECONSTRUCTED -> PASS', () => {
  const reconstructed = reconstructHistoricalTelemetry({
    wp_id: 'WP-KAD-BASELINE-PUBLICATION-028A',
    status: 'ACCEPTED',
    fixed_point: '0ea896b54d799ca98fa3b45fe45f519655135807',
    evidence_target: 'evidence/WP-KAD-BASELINE-PUBLICATION-028A/',
  });

  assert.equal(reconstructed.provenance.origin_class, 'RECONSTRUCTED');
  assert.equal(reconstructed.outcome.accepted, true);
  assert.equal(reconstructed.outcome.acceptance_revision, '0ea896b54d799ca98fa3b45fe45f519655135807');
});

test('T17: reconstructed unknown metric fabricated -> FAIL', () => {
  const reconstructed = reconstructHistoricalTelemetry({
    wp_id: 'WP-KAD-BASELINE-PUBLICATION-028A',
    status: 'ACCEPTED',
    evidence_target: 'evidence/WP-KAD-BASELINE-PUBLICATION-028A/',
  });

  // Reconstructed record MUST NOT invent tokens or costs or human active minutes
  assert.equal(reconstructed.context.input_tokens, null);
  assert.equal(reconstructed.context.output_tokens, null);
  assert.equal(reconstructed.economic.api_cost_usd, null);
  assert.equal(reconstructed.human.active_minutes_estimate, null);
});

test('T18: WP fragmentation does not multiply accepted outcome value -> PASS', () => {
  // 1 large WP vs 10 micro-WPs with same total scope
  const singleLargeWp = createOutcomeTelemetryRecord({
    work: { workpackage_id: 'WP-LARGE-1', work_class: 'IMPLEMENTATION', complexity_weight: 10 },
    outcome: { accepted: true, acceptance_evidence_refs: ['evidence/1.md'] },
    human: { intervention_count: 2 },
    provenance: { observed_at: '2026-08-30T00:00:00Z', collector: 'test' },
  });

  const fragmentedWps = Array.from({ length: 10 }, (_, i) =>
    createOutcomeTelemetryRecord({
      work: { workpackage_id: `WP-MICRO-${i}`, work_class: 'IMPLEMENTATION', complexity_weight: 1 },
      outcome: { accepted: true, acceptance_evidence_refs: [`evidence/micro-${i}.md`] },
      human: { intervention_count: 1 }, // 1 intervention per micro-WP = 10 total interventions!
      provenance: { observed_at: '2026-08-30T00:00:00Z', collector: 'test' },
    })
  );

  const singleSummary = computeSummaryProfile([singleLargeWp]);
  const fragmentedSummary = computeSummaryProfile(fragmentedWps);

  // Both should show normalized complexity-weighted outcome value of 10
  assert.equal(singleSummary.total_normalized_value, 10);
  assert.equal(fragmentedSummary.total_normalized_value, 10);

  // Fragmented WPs reveal higher total human friction (10 interventions vs 2) rather than hiding it under "10 WPs done"
  assert.ok(fragmentedSummary.total_interventions > singleSummary.total_interventions);
});

test('T19: derived summary reproducible -> PASS', () => {
  const records = [
    createOutcomeTelemetryRecord({
      work: { workpackage_id: 'WP-A', work_class: 'IMPLEMENTATION' },
      outcome: { accepted: true, acceptance_evidence_refs: ['evidence/a.md'] },
      human: { intervention_count: 1 },
      provenance: { observed_at: '2026-08-30T00:00:00Z', collector: 'test' },
    }),
    createOutcomeTelemetryRecord({
      work: { workpackage_id: 'WP-B', work_class: 'RESEARCH' },
      outcome: { accepted: true, acceptance_evidence_refs: ['evidence/b.md'] },
      human: { intervention_count: 0 },
      provenance: { observed_at: '2026-08-30T01:00:00Z', collector: 'test' },
    }),
  ];

  const summary1 = JSON.stringify(computeSummaryProfile(records));
  const summary2 = JSON.stringify(computeSummaryProfile(records));
  assert.equal(summary1, summary2);
});

test('T20: corrupted record hash -> FAIL', () => {
  const record = createOutcomeTelemetryRecord({
    work: { workpackage_id: 'WP-TEST-020', work_class: 'IMPLEMENTATION' },
    outcome: { accepted: true, acceptance_evidence_refs: ['evidence/wp-test-020.md'] },
    provenance: { observed_at: '2026-08-30T00:00:00Z', collector: 'test' },
  });

  assert.equal(verifyRecordIntegrity(record), true);

  // Tamper with record data without updating hash
  const tamperedRecord = {
    ...record,
    outcome: {
      ...record.outcome,
      accepted: false, // Tampered!
    },
  };

  assert.equal(verifyRecordIntegrity(tamperedRecord), false);
  const val = validateOutcomeTelemetryRecord(tamperedRecord);
  assert.equal(val.valid, false);
  assert.ok(val.errors.some((e) => e.includes('hash') || e.includes('integrity')));
});
