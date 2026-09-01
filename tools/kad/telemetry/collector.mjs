/**
 * KAD Outcome & Friction Passive Telemetry Collector
 *
 * Observes workctl lifecycle states, intent events, test results, and operator interventions
 * without taking authority over task lifecycle or introducing a shadow state machine.
 *
 * Invariant: Telemetry observes workctl / execution evidence; it does NOT create competing lifecycle state.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  createOutcomeTelemetryRecord,
  classifyIntervention,
  validateOutcomeTelemetryRecord,
} from './outcome-cost-schema.mjs';
import { OutcomeTelemetryStorage } from './storage.mjs';

export class OutcomeTelemetryCollector {
  constructor({ cwd = process.cwd(), storage = null } = {}) {
    this.cwd = cwd;
    this.storage = storage || new OutcomeTelemetryStorage({ cwd });
  }

  /**
   * Passively builds an outcome telemetry record by inspecting existing workctl, claim, and evidence state.
   */
  inspectWorkpackageState(wpId) {
    const workDir = path.join(this.cwd, '.agents', 'work');
    const wpFile = path.join(workDir, `${wpId}.json`);
    const claimFile = path.join(workDir, 'claims', `${wpId}.json`);

    if (!fs.existsSync(wpFile)) {
      throw new Error(`Workpackage file not found: ${wpFile}`);
    }

    const wpData = JSON.parse(fs.readFileSync(wpFile, 'utf8'));
    let claimData = null;
    if (fs.existsSync(claimFile)) {
      try {
        claimData = JSON.parse(fs.readFileSync(claimFile, 'utf8'));
      } catch {}
    }

    const isAccepted = wpData.status === 'ACCEPTED';
    const evidenceTarget = wpData.evidence_target || (wpData.scope?.find((s) => s.startsWith('evidence/')) || null);
    const evidenceRefs = [];
    if (evidenceTarget) {
      evidenceRefs.push(evidenceTarget);
    }

    return {
      wp: wpData,
      claim: claimData,
      isAccepted,
      evidenceRefs,
    };
  }

  /**
   * Records a complete outcome telemetry observation for a workpackage.
   */
  recordOutcome(wpId, options = {}) {
    const startTime = Date.now();
    const cpuStart = process.cpuUsage();

    const { wp, claim, isAccepted, evidenceRefs } = this.inspectWorkpackageState(wpId);

    const rawRecord = {
      work: {
        workpackage_id: wp.id,
        ticket_id: wp.spec_ref || wp.source_ticket || `user:/${wp.id}`,
        run_id: options.run_id || `run-${wp.id.toLowerCase()}-${Date.now()}`,
        work_class: options.work_class || wp.work_class || 'IMPLEMENTATION',
        risk_tier: options.risk_tier || wp.risk_tier || 'TIER_1_LOW',
        provider_class: options.provider_class || 'LOCAL_DETERMINISTIC',
        execution_mode: options.execution_mode || 'AUTONOMOUS_BOUNDED',
        started_at: claim?.started_at || options.started_at || null,
        ended_at: claim?.released_at || options.ended_at || new Date().toISOString(),
        experiment_id: options.experiment_id || null,
        cohort: options.cohort || null,
        trial_id: options.trial_id || null,
        baseline_or_candidate: options.baseline_or_candidate || null,
      },
      outcome: {
        accepted: typeof options.accepted === 'boolean' ? options.accepted : isAccepted,
        acceptance_revision: options.acceptance_revision || wp.fixed_point || null,
        acceptance_evidence_refs: options.acceptance_evidence_refs || (evidenceRefs.length > 0 ? evidenceRefs : (isAccepted ? [`evidence/${wp.id}/`] : [])),
        rejection_reason: options.rejection_reason || null,
      },
      human: {
        intervention_count: options.human?.intervention_count ?? (options.interventions ? options.interventions.length : 0),
        decision_events: options.human?.decision_events ?? (wp.spec_decisions ? wp.spec_decisions.length : 0),
        review_rejections: options.human?.review_rejections ?? 0,
        manual_retries: options.human?.manual_retries ?? 0,
        context_reorientation_events: options.human?.context_reorientation_events ?? 0,
        active_minutes_estimate: options.human?.active_minutes_estimate ?? null,
        active_minutes_source: options.human?.active_minutes_source || (options.human?.active_minutes_estimate ? 'HUMAN_REPORTED' : 'UNKNOWN'),
        interventions: options.interventions || [],
      },
      quality: {
        escaped_regressions: options.quality?.escaped_regressions ?? 0,
        acceptance_reversals: options.quality?.acceptance_reversals ?? 0,
        rollback_count: options.quality?.rollback_count ?? 0,
        post_acceptance_defects: options.quality?.post_acceptance_defects ?? 0,
      },
      execution: {
        agent_runs: options.execution?.agent_runs ?? 1,
        failed_runs: options.execution?.failed_runs ?? 0,
        retries: options.execution?.retries ?? 0,
        wall_clock_ms: options.execution?.wall_clock_ms ?? null,
      },
      context: {
        input_tokens: options.context?.input_tokens ?? null,
        output_tokens: options.context?.output_tokens ?? null,
        remote_tokens: options.context?.remote_tokens ?? null,
        context_packet_bytes: options.context?.context_packet_bytes ?? null,
      },
      economic: {
        api_cost_usd: options.economic?.api_cost_usd ?? null,
        metered_spend_class: options.economic?.metered_spend_class || (options.economic?.api_cost_usd ? 'PRE_AUTHORIZED' : 'NONE'),
      },
      compute: {
        cpu_time_ms: options.compute?.cpu_time_ms ?? null,
        gpu_time_ms: options.compute?.gpu_time_ms ?? null,
        gpu_peak_vram_bytes: options.compute?.gpu_peak_vram_bytes ?? null,
      },
      maintenance: {
        maintenance_minutes: options.maintenance?.maintenance_minutes ?? 0,
        telemetry_overhead_ms: options.maintenance?.telemetry_overhead_ms ?? 0,
      },
      provenance: {
        observed_at: new Date().toISOString(),
        collector: 'kad-outcome-collector-v1',
        origin_class: options.origin_class || 'DIRECTLY_OBSERVED',
        source_refs: evidenceRefs.length > 0 ? evidenceRefs : [`.agents/work/${wp.id}.json`],
      },
    };

    const wallMs = Date.now() - startTime;
    const cpuDiff = process.cpuUsage(cpuStart);
    rawRecord.maintenance.collector_wall_ms = wallMs;
    rawRecord.maintenance.collector_cpu_ms = (cpuDiff.user + cpuDiff.system) / 1000;
    rawRecord.maintenance.telemetry_overhead_ms = wallMs;

    const record = createOutcomeTelemetryRecord(rawRecord);
    const storeResult = this.storage.appendRecord(record);

    return {
      record,
      store_result: storeResult,
    };
  }
}
