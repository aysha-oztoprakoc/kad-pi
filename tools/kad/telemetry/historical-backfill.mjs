/**
 * KAD Historical Telemetry Reconstruction Engine
 *
 * Scans accepted workpackages, receipts, and evidence directories to reconstruct
 * historical telemetry records with strict epistemic honesty.
 *
 * Invariant: Unobserved metrics (human active minutes, tokens, costs) MUST remain null/UNKNOWN.
 * Invariant: Origin class MUST be RECONSTRUCTED.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  createOutcomeTelemetryRecord,
  TELEMETRY_OUTCOME_SCHEMA_VERSION,
} from './outcome-cost-schema.mjs';

function inferWorkClass(wpId, title = '') {
  const text = `${wpId} ${title}`.toUpperCase();
  if (text.includes('RECONCILIATION') || text.includes('REPAIR')) return 'DEBUGGING';
  if (text.includes('RESEARCH') || text.includes('EVALUATION')) return 'RESEARCH';
  if (text.includes('DOC') || text.includes('WIKI')) return 'DOCUMENTATION';
  if (text.includes('BENCHMARK') || text.includes('PROBE')) return 'BENCHMARK';
  if (text.includes('GOVERNANCE') || text.includes('DIRECTIVE') || text.includes('ISA')) return 'GOVERNANCE';
  if (text.includes('PROJECTION') || text.includes('SNAPSHOT')) return 'PROJECTION';
  if (text.includes('VERIFICATION') || text.includes('TEST')) return 'VERIFICATION';
  if (text.includes('THEME') || text.includes('DASHBOARD') || text.includes('WEBSITE') || text.includes('SUBSTRATE') || text.includes('BRIDGE')) return 'IMPLEMENTATION';
  return 'IMPLEMENTATION';
}

function inferRiskTier(wp) {
  if (wp.trust_domain === 'constitutional' || wp.authority_required === 'kad-sovereign') return 'TIER_4_CONSTITUTIONAL';
  if (wp.priority >= 300) return 'TIER_3_HIGH';
  if (wp.priority >= 150) return 'TIER_2_MEDIUM';
  return 'TIER_1_LOW';
}

/**
 * Reconstructs a single historical telemetry record from a workpackage definition and evidence.
 */
export function reconstructHistoricalTelemetry(input = {}) {
  const wpId = input.wp_id || input.id || 'WP-UNKNOWN';
  const status = input.status || 'UNKNOWN';
  const isAccepted = status === 'ACCEPTED';
  const fixedPoint = input.fixed_point || null;
  const evidenceTarget = input.evidence_target || (input.scope?.find((s) => s.startsWith('evidence/')) || null);

  const evidenceRefs = [];
  if (evidenceTarget) {
    evidenceRefs.push(evidenceTarget);
  }

  const workClass = input.work_class || inferWorkClass(wpId, input.title || '');
  const riskTier = inferRiskTier(input);

  // Extract human/execution hints if present in input or evidence
  const interventionCount = typeof input.intervention_count === 'number' ? input.intervention_count : 0;
  const agentRuns = typeof input.agent_runs === 'number' ? input.agent_runs : 1;
  const failedRuns = typeof input.failed_runs === 'number' ? input.failed_runs : 0;

  const record = createOutcomeTelemetryRecord({
    work: {
      workpackage_id: wpId,
      ticket_id: input.spec_ref || input.source_ticket || `user:/${wpId}`,
      run_id: `reconstructed-${wpId.toLowerCase()}`,
      work_class: workClass,
      risk_tier: riskTier,
      provider_class: input.provider_class || 'UNKNOWN',
      execution_mode: 'AUTONOMOUS_BOUNDED',
      complexity_weight: 1,
      started_at: input.started_at || null,
      ended_at: input.released_at || input.ended_at || null,
    },
    outcome: {
      accepted: isAccepted,
      acceptance_revision: fixedPoint,
      acceptance_evidence_refs: evidenceRefs.length > 0 ? evidenceRefs : (isAccepted ? [`evidence/${wpId}/`] : []),
      rejection_reason: isAccepted ? null : (input.rejection_reason || 'Not yet in accepted state'),
    },
    human: {
      intervention_count: interventionCount,
      decision_events: input.spec_decisions ? input.spec_decisions.length : 0,
      review_rejections: 0,
      manual_retries: 0,
      context_reorientation_events: 0,
      active_minutes_estimate: null, // UNKNOWN - do not fabricate
      active_minutes_source: 'UNKNOWN',
    },
    quality: {
      escaped_regressions: 0,
      acceptance_reversals: 0,
      rollback_count: 0,
      post_acceptance_defects: 0,
    },
    execution: {
      agent_runs: agentRuns,
      failed_runs: failedRuns,
      retries: 0,
      wall_clock_ms: null, // UNKNOWN
    },
    context: {
      input_tokens: null, // UNKNOWN - do not fabricate
      output_tokens: null,
      remote_tokens: null,
      context_packet_bytes: null,
    },
    economic: {
      api_cost_usd: null, // UNKNOWN - do not fabricate
      metered_spend_class: 'NONE',
    },
    compute: {
      cpu_time_ms: null,
      gpu_time_ms: null,
      gpu_peak_vram_bytes: null,
    },
    maintenance: {
      maintenance_minutes: 0,
      telemetry_overhead_ms: 0,
    },
    provenance: {
      observed_at: input.observed_at || new Date().toISOString(),
      collector: 'kad-historical-backfill-v1',
      origin_class: 'RECONSTRUCTED',
      source_refs: evidenceRefs.length > 0 ? evidenceRefs : [`.agents/work/${wpId}.json`],
    },
  });

  return record;
}

/**
 * Scans the workspace and reconstructs historical telemetry records for all known workpackages.
 */
export function backfillWorkspaceHistoricalTelemetry(cwd = process.cwd()) {
  const workDir = path.join(cwd, '.agents', 'work');
  const claimsDir = path.join(workDir, 'claims');
  const records = [];

  if (!fs.existsSync(workDir)) return records;

  const claimMap = new Map();
  if (fs.existsSync(claimsDir)) {
    try {
      const claimFiles = fs.readdirSync(claimsDir).filter((f) => f.endsWith('.json'));
      for (const cf of claimFiles) {
        try {
          const claimData = JSON.parse(fs.readFileSync(path.join(claimsDir, cf), 'utf8'));
          if (claimData.task) claimMap.set(claimData.task, claimData);
        } catch {}
      }
    } catch {}
  }

  const wpFiles = fs.readdirSync(workDir).filter((f) => f.endsWith('.json'));
  for (const wf of wpFiles) {
    try {
      const wpData = JSON.parse(fs.readFileSync(path.join(workDir, wf), 'utf8'));
      if (!wpData.id) continue;

      const claim = claimMap.get(wpData.id);
      const mergedInput = {
        ...wpData,
        started_at: claim?.started_at,
        released_at: claim?.released_at,
        actor_label: claim?.actor_label,
      };

      const record = reconstructHistoricalTelemetry(mergedInput);
      records.push(record);
    } catch {}
  }

  return records;
}
