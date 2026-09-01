import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import {
  TELEMETRY_OUTCOME_SCHEMA_VERSION,
  ORIGIN_CLASSES,
  createOutcomeTelemetryRecord,
  validateOutcomeTelemetryRecord,
} from '../telemetry/outcome-cost-schema.mjs';

import {
  OutcomeTelemetryStorage,
} from '../telemetry/storage.mjs';

import {
  aggregateOutcomeTelemetry,
  computeSummaryProfile,
  generateVectorProfile,
} from '../telemetry/aggregator.mjs';

import {
  analyzeArchitectureComplexity,
} from '../telemetry/complexity-analyzer.mjs';

test('G01: Single scalar score rejected in favor of multi-dimensional vector profiles', () => {
  const records = [
    createOutcomeTelemetryRecord({
      work: { workpackage_id: 'WP-1', work_class: 'IMPLEMENTATION' },
      outcome: { accepted: true, acceptance_evidence_refs: ['evidence/1.md'] },
      human: { intervention_count: 3, manual_retries: 1 },
      execution: { agent_runs: 4, failed_runs: 1, wall_clock_ms: 60000 },
      provenance: { observed_at: '2026-08-30T00:00:00Z', collector: 'test' },
    }),
  ];

  const profile = computeSummaryProfile(records);

  // Assert NO artificial scalar "kad_score" or "total_score"
  assert.equal(profile.kad_score, undefined);
  assert.equal(profile.total_score, undefined);
  assert.equal(profile.overall_grade, undefined);

  // Assert multi-dimensional vectors exist
  assert.ok(profile.vectors.human_friction);
  assert.ok(profile.vectors.quality);
  assert.ok(profile.vectors.execution_efficiency);
  assert.ok(profile.vectors.economic_coverage);
});

test('G02: Zero-cost trap prevented when cost data is missing', () => {
  const records = [
    createOutcomeTelemetryRecord({
      work: { workpackage_id: 'WP-1', work_class: 'IMPLEMENTATION' },
      outcome: { accepted: true, acceptance_evidence_refs: ['evidence/1.md'] },
      economic: { api_cost_usd: 1.50, metered_spend_class: 'PRE_AUTHORIZED' },
      provenance: { observed_at: '2026-08-30T00:00:00Z', collector: 'test' },
    }),
    createOutcomeTelemetryRecord({
      work: { workpackage_id: 'WP-2', work_class: 'IMPLEMENTATION' },
      outcome: { accepted: true, acceptance_evidence_refs: ['evidence/2.md'] },
      economic: { api_cost_usd: null, metered_spend_class: 'UNKNOWN' }, // Missing cost!
      provenance: { observed_at: '2026-08-30T01:00:00Z', collector: 'test' },
    }),
  ];

  const profile = computeSummaryProfile(records);

  // Missing cost record must NOT be averaged as $0.00 (which would give $0.75 average)
  // Instead: observed average is $1.50 with cost_data_coverage: 50%
  assert.equal(profile.vectors.economic_coverage.records_with_cost, 1);
  assert.equal(profile.vectors.economic_coverage.records_total, 2);
  assert.equal(profile.vectors.economic_coverage.coverage_percent, 50);
  assert.equal(profile.vectors.economic_coverage.observed_mean_cost_usd, 1.50);
});

test('G03: Zero-human-time trap prevented when active minutes are unobserved', () => {
  const records = [
    createOutcomeTelemetryRecord({
      work: { workpackage_id: 'WP-1', work_class: 'IMPLEMENTATION' },
      outcome: { accepted: true, acceptance_evidence_refs: ['evidence/1.md'] },
      human: { active_minutes_estimate: 30, active_minutes_source: 'HUMAN_REPORTED' },
      provenance: { observed_at: '2026-08-30T00:00:00Z', collector: 'test' },
    }),
    createOutcomeTelemetryRecord({
      work: { workpackage_id: 'WP-2', work_class: 'RESEARCH' },
      outcome: { accepted: true, acceptance_evidence_refs: ['evidence/2.md'] },
      human: { active_minutes_estimate: null, active_minutes_source: 'UNKNOWN' },
      provenance: { observed_at: '2026-08-30T01:00:00Z', collector: 'test' },
    }),
  ];

  const profile = computeSummaryProfile(records);
  assert.equal(profile.vectors.human_friction.minutes_coverage_percent, 50);
  assert.equal(profile.vectors.human_friction.observed_mean_minutes, 30);
});

test('G04: Storage persistence, querying, and integrity verification', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-telemetry-storage-test-'));
  try {
    const storage = new OutcomeTelemetryStorage({ storageDir: tempDir });

    const rec1 = createOutcomeTelemetryRecord({
      work: { workpackage_id: 'WP-STORAGE-1', work_class: 'IMPLEMENTATION' },
      outcome: { accepted: true, acceptance_evidence_refs: ['evidence/1.md'] },
      provenance: { observed_at: '2026-08-30T00:00:00Z', collector: 'test' },
    });

    const rec2 = createOutcomeTelemetryRecord({
      work: { workpackage_id: 'WP-STORAGE-2', work_class: 'RESEARCH' },
      outcome: { accepted: false, rejection_reason: 'Incomplete evidence', acceptance_evidence_refs: [] },
      provenance: { observed_at: '2026-08-30T01:00:00Z', collector: 'test' },
    });

    storage.appendRecord(rec1);
    storage.appendRecord(rec2);

    const all = storage.listRecords();
    assert.equal(all.length, 2);

    const implRecords = storage.queryRecords({ work_class: 'IMPLEMENTATION' });
    assert.equal(implRecords.length, 1);
    assert.equal(implRecords[0].work.workpackage_id, 'WP-STORAGE-1');

    const integrity = storage.verifyAllRecords();
    assert.equal(integrity.total, 2);
    assert.equal(integrity.valid, 2);
    assert.equal(integrity.corrupted, 0);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('G05: Architecture complexity analyzer computes honest system complexity proxies', () => {
  const complexity = analyzeArchitectureComplexity(process.cwd());

  assert.ok(typeof complexity.authoritative_store_count === 'number');
  assert.ok(typeof complexity.persistent_daemon_count === 'number');
  assert.ok(typeof complexity.persistent_database_count === 'number');
  assert.ok(typeof complexity.provider_adapter_count === 'number');
  assert.ok(typeof complexity.schema_count === 'number');
  assert.ok(typeof complexity.mandatory_cli_surface_count === 'number');
  assert.ok(typeof complexity.manual_sync_edge_count === 'number');

  assert.ok(complexity.provenance.origin_class, 'DERIVED_DETERMINISTIC');
  assert.ok(complexity.details.stores.length > 0);
  assert.ok(complexity.details.cli_surfaces.length > 0);
});
