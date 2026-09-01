/**
 * KAD Outcome & Cognitive Telemetry Baseline Reporter
 *
 * Generates prospective baseline protocols, baseline evaluation reports,
 * and coverage matrices distinguishing PROSPECTIVE_OBSERVATIONS,
 * HISTORICAL_RECONSTRUCTIONS, and MISSING_DATA.
 *
 * Invariant: Measures before optimizing; reports limitations and missing data honestly.
 */

import { computeSummaryProfile } from './aggregator.mjs';
import { analyzeArchitectureComplexity } from './complexity-analyzer.mjs';

/**
 * Compiles a structured baseline report from telemetry records and architecture state.
 */
export function compileBaselineReport(records = [], options = {}) {
  const cwd = options.cwd || process.cwd();
  const summary = computeSummaryProfile(records, options);
  const complexity = analyzeArchitectureComplexity(cwd);

  const prospectiveRecords = records.filter((r) => r.provenance?.origin_class === 'DIRECTLY_OBSERVED');
  const reconstructedRecords = records.filter((r) => r.provenance?.origin_class === 'RECONSTRUCTED');
  const otherRecords = records.filter((r) => r.provenance?.origin_class !== 'DIRECTLY_OBSERVED' && r.provenance?.origin_class !== 'RECONSTRUCTED');

  const prospectiveSummary = computeSummaryProfile(prospectiveRecords);
  const reconstructedSummary = computeSummaryProfile(reconstructedRecords);

  const report = {
    schema_version: 'KAD_COGNITIVE_TELEMETRY_BASELINE_V1',
    generated_at: new Date().toISOString(),
    executive_summary: {
      total_workpackages_evaluated: records.length,
      prospective_observations_count: prospectiveRecords.length,
      historical_reconstructions_count: reconstructedRecords.length,
      other_records_count: otherRecords.length,
      accepted_workpackages: summary.vectors.quality.accepted,
      clean_outcome_rate_percent: summary.vectors.quality.clean_outcome_rate,
      total_recorded_interventions: summary.vectors.human_friction.total_interventions,
      low_leverage_friction_ratio: summary.vectors.human_friction.low_leverage_friction_ratio,
    },
    coverage_matrix: {
      human_active_minutes_coverage_percent: summary.vectors.human_friction.minutes_coverage_percent,
      economic_cost_coverage_percent: summary.vectors.economic_coverage.coverage_percent,
      context_tokens_coverage_percent: summary.vectors.context_coverage.coverage_percent,
      execution_wall_clock_coverage_percent: summary.total_records > 0
        ? (summary.vectors.execution_efficiency.records_with_wall_clock / summary.total_records) * 100
        : 0,
    },
    work_class_stratification: summary.stratification.work_classes,
    risk_tier_stratification: summary.stratification.risk_tiers,
    provider_class_stratification: summary.stratification.provider_classes,
    origin_class_stratification: summary.stratification.origin_classes,
    vectors: summary.vectors,
    stratum_profiles: {
      prospective: prospectiveSummary,
      reconstructed: reconstructedSummary,
    },
    architecture_complexity: {
      authoritative_stores: complexity.authoritative_store_count,
      persistent_daemons: complexity.persistent_daemon_count,
      persistent_databases: complexity.persistent_database_count,
      provider_adapters: complexity.provider_adapter_count,
      schemas: complexity.schema_count,
      mandatory_cli_surfaces: complexity.mandatory_cli_surface_count,
      manual_sync_edges: complexity.manual_sync_edge_count,
    },
    observer_overhead: {
      total_telemetry_overhead_ms: summary.vectors.maintenance_and_observer.total_telemetry_overhead_ms,
      collector_cpu_ms: summary.vectors.maintenance_and_observer.collector_cpu_ms,
      collector_wall_ms: summary.vectors.maintenance_and_observer.collector_wall_ms,
      bytes_written: summary.vectors.maintenance_and_observer.bytes_written,
    },
    baseline_window_recommendation: {
      target_prospective_sample_size: '15-20 representative work units across IMPLEMENTATION, DEBUGGING, RESEARCH, and GOVERNANCE',
      inclusion_criteria: [
        'Must have explicit workctl task ledger claim and acceptance receipt',
        'Must record typed human interventions (distinguishing strategic vs friction)',
        'Must record execution attempts, failures, and retries',
        'Must measure wall-clock elapsed time and observer overhead',
      ],
      exclusion_criteria: [
        'Unbounded exploratory prompt loops outside workctl leases',
        'Workpackages aborted due to external workstation outages or manual Git branch resets without workctl record',
      ],
    },
    epistemic_limitations: [
      'Historical reconstruction cannot retroactively observe exact human active minutes or unmetered token counts without fabrication; these remain UNKNOWN.',
      'Human cognitive fatigue is captured via proxy indicators (intervention frequency, manual retries, babysitting events) rather than direct biometric measurement.',
      'Telemetry supplies empirical evidence for future hypothesis testing; it does NOT possess authority to mutate routing or governance policy automatically.',
    ],
  };

  return report;
}

/**
 * Formats a baseline report into clean human-readable Markdown.
 */
export function formatBaselineReportMarkdown(report) {
  return `# KAD Cognitive Attention, Intervention Friction & Outcome Cost Telemetry Baseline Report

**Generated At**: \`${report.generated_at}\`
**Schema Version**: \`${report.schema_version}\`

---

## 1. Executive Summary

| Dimension | Measured Value | Epistemic Origin |
| :--- | :--- | :--- |
| **Total Workpackages Evaluated** | \`${report.executive_summary.total_workpackages_evaluated}\` | \`DERIVED_DETERMINISTIC\` |
| **Prospective Observations** | \`${report.executive_summary.prospective_observations_count}\` | \`DIRECTLY_OBSERVED\` |
| **Historical Reconstructions** | \`${report.executive_summary.historical_reconstructions_count}\` | \`RECONSTRUCTED\` |
| **Accepted Workpackages** | \`${report.executive_summary.accepted_workpackages}\` | \`DERIVED_DETERMINISTIC\` |
| **Clean Outcome Rate** | \`${report.executive_summary.clean_outcome_rate_percent.toFixed(1)}%\` | \`DERIVED_DETERMINISTIC\` |
| **Total Recorded Interventions** | \`${report.executive_summary.total_recorded_interventions}\` | \`OBSERVED / REPORTED\` |
| **Low-Leverage Friction Ratio** | \`${(report.executive_summary.low_leverage_friction_ratio * 100).toFixed(1)}%\` | \`DERIVED_DETERMINISTIC\` |

---

## 2. Telemetry Coverage & Missing Data Matrix

In accordance with the invariant **\`UNKNOWN != ZERO\`**, missing observations are explicitly tracked as missing coverage rather than fabricated defaults:

- **Human Active Minutes Coverage**: \`${report.coverage_matrix.human_active_minutes_coverage_percent.toFixed(1)}%\`
- **Economic Metered Cost Coverage**: \`${report.coverage_matrix.economic_cost_coverage_percent.toFixed(1)}%\`
- **Context Token Count Coverage**: \`${report.coverage_matrix.context_tokens_coverage_percent.toFixed(1)}%\`
- **Execution Wall Clock Coverage**: \`${report.coverage_matrix.execution_wall_clock_coverage_percent.toFixed(1)}%\`

---

## 3. Workload & Stratification Profile

### Work Class Distribution
\`\`\`json
${JSON.stringify(report.work_class_stratification, null, 2)}
\`\`\`

### Epistemic Origin Distribution
\`\`\`json
${JSON.stringify(report.origin_class_stratification, null, 2)}
\`\`\`

---

## 4. Multi-Dimensional Vector Profiles

### A. Human Cognitive Attention & Friction Vector
- **Total Interventions**: \`${report.vectors.human_friction.total_interventions}\`
- **Friction Interventions (Babysitting/Correction/Retry)**: \`${report.vectors.human_friction.friction_interventions}\`
- **Strategic Guidance Events (Design/Research/Constitutional)**: \`${report.vectors.human_friction.strategic_interventions}\`
- **Manual Retries**: \`${report.vectors.human_friction.manual_retries}\`
- **Friction per Accepted Outcome**: \`${report.vectors.human_friction.friction_per_accepted_outcome !== null ? report.vectors.human_friction.friction_per_accepted_outcome.toFixed(2) : 'N/A'}\`
- **Observed Mean Human Active Minutes**: \`${report.vectors.human_friction.observed_mean_minutes !== null ? report.vectors.human_friction.observed_mean_minutes.toFixed(1) : 'UNKNOWN'}\`

### B. Quality & Outcome Vector
- **Accepted WPs**: \`${report.vectors.quality.accepted}\`
- **Rejected / In-Progress WPs**: \`${report.vectors.quality.rejected}\`
- **Escaped Regressions**: \`${report.vectors.quality.escaped_regressions}\`
- **Acceptance Reversals**: \`${report.vectors.quality.acceptance_reversals}\`
- **Rollback Events**: \`${report.vectors.quality.rollback_count}\`
- **Post-Acceptance Defects**: \`${report.vectors.quality.post_acceptance_defects}\`

### C. Execution Efficiency Vector
- **Total Agent Execution Runs**: \`${report.vectors.execution_efficiency.agent_runs}\`
- **Failed Runs**: \`${report.vectors.execution_efficiency.failed_runs}\`
- **Failed Run Rate**: \`${report.vectors.execution_efficiency.failed_run_rate_percent.toFixed(1)}%\`
- **Total Retries**: \`${report.vectors.execution_efficiency.retries}\`
- **Mean Wall Clock Time**: \`${report.vectors.execution_efficiency.mean_wall_clock_ms !== null ? `${report.vectors.execution_efficiency.mean_wall_clock_ms} ms` : 'UNKNOWN'}\`

### D. Economic & Context Vectors
- **Total Observed Metered Cost**: \`${report.vectors.economic_coverage.total_observed_cost_usd !== null ? `$${report.vectors.economic_coverage.total_observed_cost_usd.toFixed(4)}` : 'UNKNOWN / ZERO METERED SPEND'}\`
- **Observed Mean Cost per Unit**: \`${report.vectors.economic_coverage.observed_mean_cost_usd !== null ? `$${report.vectors.economic_coverage.observed_mean_cost_usd.toFixed(4)}` : 'N/A'}\`

---

## 5. Architectural Complexity Snapshot

Structural complexity proxies measuring system comprehensibility:

| Structural Component | Count | Description |
| :--- | :--- | :--- |
| **Authoritative Stores** | \`${report.architecture_complexity.authoritative_stores}\` | Canonical Vault, Workctl Ledger, Intent Journal, Git |
| **Persistent Daemons** | \`${report.architecture_complexity.persistent_daemons}\` | Interface HTTP/SSE Server |
| **Persistent Databases** | \`${report.architecture_complexity.persistent_databases}\` | SQLite Stores |
| **Provider Adapters** | \`${report.architecture_complexity.provider_adapters}\` | OMP, Codex, Antigravity, Qwen, Zotero, OpenViking |
| **Active Schemas** | \`${report.architecture_complexity.schemas}\` | Telemetry, Intent, ISA, Workload, Role schemas |
| **Mandatory CLI Surfaces** | \`${report.architecture_complexity.mandatory_cli_surfaces}\` | bin/kad, bin/workctl, bin/kad-telemetry, etc. |
| **Manual Sync Edges** | \`${report.architecture_complexity.manual_sync_edges}\` | Projections, intent reports, ISA validation |

---

## 6. Observer-Effect Accounting

Telemetry collection overhead measured during operation:
- **Total Telemetry Overhead (Wall-Clock)**: \`${report.observer_overhead.total_telemetry_overhead_ms} ms\`
- **Collector CPU Time**: \`${report.observer_overhead.collector_cpu_ms !== null ? `${report.observer_overhead.collector_cpu_ms.toFixed(2)} ms` : 'N/A'}\`
- **Total Bytes Written**: \`${report.observer_overhead.bytes_written !== null ? `${report.observer_overhead.bytes_written} bytes` : 'N/A'}\`

---

## 7. Prospective Baseline Window & Limitations

### Baseline Collection Window
- **Target Sample Size**: ${report.baseline_window_recommendation.target_prospective_sample_size}
- **Inclusion Criteria**:
${report.baseline_window_recommendation.inclusion_criteria.map((c) => `  - ${c}`).join('\n')}
- **Exclusion Criteria**:
${report.baseline_window_recommendation.exclusion_criteria.map((c) => `  - ${c}`).join('\n')}

### Epistemic Limitations & Non-Authority Invariants
${report.epistemic_limitations.map((l) => `- ${l}`).join('\n')}
`;
}
