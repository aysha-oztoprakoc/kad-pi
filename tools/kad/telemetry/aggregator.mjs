/**
 * KAD Outcome Telemetry Multi-Dimensional Aggregator & Vector Profiler
 *
 * Provides Goodhart-resistant vector profiling, stratifying telemetry
 * across work classes, risk tiers, provider classes, and epistemic origin.
 *
 * Invariant: Rejects artificial single scalar scores (e.g. KAD_SCORE=87).
 */

import { classifyIntervention } from './outcome-cost-schema.mjs';

/**
 * Computes a multi-dimensional summary profile from a collection of outcome telemetry records.
 */
export function computeSummaryProfile(records = [], options = {}) {
  const list = Array.isArray(records) ? records : [];

  let totalNormalizedValue = 0;
  let totalInterventions = 0;
  let frictionInterventions = 0;
  let strategicInterventions = 0;
  let decisionEvents = 0;
  let manualRetries = 0;
  let contextReorientations = 0;
  let reviewRejections = 0;

  let totalMinutesObserved = 0;
  let recordsWithMinutes = 0;

  let acceptedCount = 0;
  let rejectedCount = 0;
  let escapedRegressions = 0;
  let acceptanceReversals = 0;
  let rollbackCount = 0;
  let postAcceptanceDefects = 0;

  let totalAgentRuns = 0;
  let totalFailedRuns = 0;
  let totalRetries = 0;
  let totalWallClockMs = 0;
  let recordsWithWallClock = 0;

  let totalCostUsd = 0;
  let recordsWithCost = 0;
  const spendClassCounts = { NONE: 0, PRE_AUTHORIZED: 0, UNAUTHORIZED: 0, UNKNOWN: 0 };

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let recordsWithTokens = 0;

  let totalMaintenanceMinutes = 0;
  let totalTelemetryOverheadMs = 0;
  let totalCollectorWallMs = 0;
  let totalCollectorCpuMs = 0;
  let totalBytesWritten = 0;

  const workClassDistribution = {};
  const originClassDistribution = {};
  const riskTierDistribution = {};
  const providerClassDistribution = {};

  for (const rec of list) {
    // 1. Value / Scope weighting (anti-fragmentation)
    const weight = typeof rec.work?.complexity_weight === 'number' ? rec.work.complexity_weight : 1;
    if (rec.outcome?.accepted) {
      totalNormalizedValue += weight;
      acceptedCount++;
    } else {
      rejectedCount++;
    }

    // 2. Distributions
    const wClass = rec.work?.work_class || 'UNKNOWN';
    workClassDistribution[wClass] = (workClassDistribution[wClass] || 0) + 1;

    const oClass = rec.provenance?.origin_class || 'UNKNOWN';
    originClassDistribution[oClass] = (originClassDistribution[oClass] || 0) + 1;

    const rTier = rec.work?.risk_tier || 'UNKNOWN';
    riskTierDistribution[rTier] = (riskTierDistribution[rTier] || 0) + 1;

    const pClass = rec.work?.provider_class || 'UNKNOWN';
    providerClassDistribution[pClass] = (providerClassDistribution[pClass] || 0) + 1;

    // 3. Human metrics
    totalInterventions += rec.human?.intervention_count || 0;
    frictionInterventions += rec.human?.friction_intervention_count || 0;
    decisionEvents += rec.human?.decision_events || 0;
    manualRetries += rec.human?.manual_retries || 0;
    contextReorientations += rec.human?.context_reorientation_events || 0;
    reviewRejections += rec.human?.review_rejections || 0;

    // Interventions list if detailed
    if (Array.isArray(rec.human?.interventions)) {
      for (const item of rec.human.interventions) {
        if (item.is_friction === false) {
          strategicInterventions++;
        }
      }
    }

    if (typeof rec.human?.active_minutes_estimate === 'number') {
      totalMinutesObserved += rec.human.active_minutes_estimate;
      recordsWithMinutes++;
    }

    // 4. Quality
    escapedRegressions += rec.quality?.escaped_regressions || 0;
    acceptanceReversals += rec.quality?.acceptance_reversals || 0;
    rollbackCount += rec.quality?.rollback_count || 0;
    postAcceptanceDefects += rec.quality?.post_acceptance_defects || 0;

    // 5. Execution
    totalAgentRuns += rec.execution?.agent_runs || 1;
    totalFailedRuns += rec.execution?.failed_runs || 0;
    totalRetries += rec.execution?.retries || 0;
    if (typeof rec.execution?.wall_clock_ms === 'number') {
      totalWallClockMs += rec.execution.wall_clock_ms;
      recordsWithWallClock++;
    }

    // 6. Economic
    if (typeof rec.economic?.api_cost_usd === 'number') {
      totalCostUsd += rec.economic.api_cost_usd;
      recordsWithCost++;
    }
    const spendClass = rec.economic?.metered_spend_class || 'UNKNOWN';
    spendClassCounts[spendClass] = (spendClassCounts[spendClass] || 0) + 1;

    // 7. Context
    if (typeof rec.context?.input_tokens === 'number' || typeof rec.context?.output_tokens === 'number') {
      totalInputTokens += rec.context?.input_tokens || 0;
      totalOutputTokens += rec.context?.output_tokens || 0;
      recordsWithTokens++;
    }

    // 8. Maintenance & Observer
    totalMaintenanceMinutes += rec.maintenance?.maintenance_minutes || 0;
    totalTelemetryOverheadMs += rec.maintenance?.telemetry_overhead_ms || 0;
    if (typeof rec.maintenance?.collector_wall_ms === 'number') totalCollectorWallMs += rec.maintenance.collector_wall_ms;
    if (typeof rec.maintenance?.collector_cpu_ms === 'number') totalCollectorCpuMs += rec.maintenance.collector_cpu_ms;
    if (typeof rec.maintenance?.bytes_written === 'number') totalBytesWritten += rec.maintenance.bytes_written;
  }

  const totalRecords = list.length;
  const acceptanceRate = totalRecords > 0 ? (acceptedCount / totalRecords) * 100 : 0;
  const failedRunRate = totalAgentRuns > 0 ? (totalFailedRuns / totalAgentRuns) * 100 : 0;
  const lowLeverageFrictionRatio = totalInterventions > 0 ? (frictionInterventions / totalInterventions) : 0;

  const minutesCoverage = totalRecords > 0 ? (recordsWithMinutes / totalRecords) * 100 : 0;
  const costCoverage = totalRecords > 0 ? (recordsWithCost / totalRecords) * 100 : 0;
  const tokenCoverage = totalRecords > 0 ? (recordsWithTokens / totalRecords) * 100 : 0;

  return {
    total_records: totalRecords,
    total_normalized_value: totalNormalizedValue,
    total_interventions: totalInterventions,
    acceptance_rate_percent: acceptanceRate,
    vectors: {
      human_friction: {
        total_interventions: totalInterventions,
        friction_interventions: frictionInterventions,
        strategic_interventions: strategicInterventions,
        decision_events: decisionEvents,
        manual_retries: manualRetries,
        context_reorientations: contextReorientations,
        review_rejections: reviewRejections,
        low_leverage_friction_ratio: lowLeverageFrictionRatio,
        friction_per_accepted_outcome: acceptedCount > 0 ? (frictionInterventions / acceptedCount) : null,
        records_with_minutes: recordsWithMinutes,
        minutes_coverage_percent: minutesCoverage,
        observed_mean_minutes: recordsWithMinutes > 0 ? (totalMinutesObserved / recordsWithMinutes) : null,
      },
      quality: {
        accepted: acceptedCount,
        rejected: rejectedCount,
        acceptance_rate_percent: acceptanceRate,
        escaped_regressions: escapedRegressions,
        acceptance_reversals: acceptanceReversals,
        rollback_count: rollbackCount,
        post_acceptance_defects: postAcceptanceDefects,
        clean_outcome_rate: totalRecords > 0 ? ((acceptedCount - acceptanceReversals - rollbackCount) / totalRecords) * 100 : 0,
      },
      execution_efficiency: {
        agent_runs: totalAgentRuns,
        failed_runs: totalFailedRuns,
        failed_run_rate_percent: failedRunRate,
        retries: totalRetries,
        records_with_wall_clock: recordsWithWallClock,
        mean_wall_clock_ms: recordsWithWallClock > 0 ? Math.round(totalWallClockMs / recordsWithWallClock) : null,
      },
      economic_coverage: {
        records_total: totalRecords,
        records_with_cost: recordsWithCost,
        coverage_percent: costCoverage,
        total_observed_cost_usd: recordsWithCost > 0 ? totalCostUsd : null,
        observed_mean_cost_usd: recordsWithCost > 0 ? totalCostUsd / recordsWithCost : null,
        spend_classes: spendClassCounts,
      },
      context_coverage: {
        records_with_tokens: recordsWithTokens,
        coverage_percent: tokenCoverage,
        total_input_tokens: recordsWithTokens > 0 ? totalInputTokens : null,
        total_output_tokens: recordsWithTokens > 0 ? totalOutputTokens : null,
      },
      maintenance_and_observer: {
        total_maintenance_minutes: totalMaintenanceMinutes,
        total_telemetry_overhead_ms: totalTelemetryOverheadMs,
        collector_wall_ms: totalCollectorWallMs,
        collector_cpu_ms: totalCollectorCpuMs,
        bytes_written: totalBytesWritten,
      },
    },
    stratification: {
      work_classes: workClassDistribution,
      risk_tiers: riskTierDistribution,
      provider_classes: providerClassDistribution,
      origin_classes: originClassDistribution,
    },
    provenance: {
      generated_at: new Date().toISOString(),
      evaluator: 'kad-outcome-aggregator-v1',
      record_count: totalRecords,
    },
  };
}

export function aggregateOutcomeTelemetry(records = [], options = {}) {
  return computeSummaryProfile(records, options);
}

export function generateVectorProfile(records = [], options = {}) {
  return computeSummaryProfile(records, options);
}
