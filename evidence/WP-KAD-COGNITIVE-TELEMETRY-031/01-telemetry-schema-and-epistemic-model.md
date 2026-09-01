# WP-KAD-COGNITIVE-TELEMETRY-031: 01 - Telemetry Schema & Epistemic Model

## 1. Canonical Schema Contract: `KAD_OUTCOME_COST_TELEMETRY_V1`

The outcome and total-cost telemetry contract separates nine distinct operational dimensions:
1. **Work Context**: Workpackage identity, ticket link, run ID, work class, risk tier, provider class, execution mode, complexity weight, experiment metadata.
2. **Outcome State**: Acceptance boolean, acceptance revision (git commit SHA), acceptance evidence paths, rejection reason.
3. **Human Cognitive Attention & Friction**: Total intervention count, friction intervention count, strategic guidance events, manual retries, review rejections, context reorientation events, active minutes estimate and source, typed intervention list.
4. **Quality & Escaped Defects**: Escaped regressions, acceptance reversals, rollback count, post-acceptance defects.
5. **Execution Efficiency**: Agent runs, failed runs, retries, wall-clock duration in ms.
6. **Context Consumption**: Input tokens, output tokens, remote tokens, context packet bytes.
7. **Economic Metered Spend**: API cost in USD, metered spend class (`NONE`, `PRE_AUTHORIZED`, `UNAUTHORIZED`, `UNKNOWN`).
8. **Compute Utilization**: CPU time ms, GPU time ms, GPU peak VRAM bytes.
9. **Maintenance & Observer Overhead**: Maintenance minutes, telemetry overhead ms, collector CPU/wall ms, bytes written.
10. **Provenance & Integrity**: Observed at timestamp, collector ID, origin class, source refs, canonical SHA-256 record hash.

## 2. Epistemic Origin Classification

Every metric carries or maps to an explicit epistemic origin class:
- `DIRECTLY_OBSERVED`: Measured directly from hardware, OS, or live hooks (e.g. wall clock ms, collector CPU time, bytes written).
- `DERIVED_DETERMINISTIC`: Computed mathematically from authoritative receipts (e.g. failed runs, record hash, summary ratios).
- `HUMAN_REPORTED`: Explicitly entered or confirmed by human operator.
- `ESTIMATED`: Bounded heuristic estimation from partial signals.
- `RECONSTRUCTED`: Reconstructed post-hoc from historical evidence/receipts for workpackages completed before live instrumentation.
- `UNKNOWN`: Metric unobserved and non-computable.

### Core Invariant: `UNKNOWN != ZERO`
Missing metrics MUST remain `null` or `UNKNOWN` rather than defaulted to 0 or 0.0:
- Unknown metered spend is NOT `$0.00`.
- Unknown human attention is NOT `0 minutes`.
- Unknown token consumption is NOT `0 tokens`.
- Aggregators track explicit coverage percentages rather than skewing averages with fabricated zeros.

## 3. Human Intervention Taxonomy: Strategic Cognition vs Low-Leverage Friction

Interventions are classified into distinct categories and leverage tiers:

### High-Leverage Strategic Cognition (Desirable Oversight)
- `STRATEGIC_DESIGN`: Architecture decisions, scope boundaries, trade-off resolution.
- `RESEARCH_INTERPRETATION`: Evaluating findings, literature direction, experimental hypothesis formulation.
- `CONSTITUTIONAL_DECISION`: Governance choices, safety boundaries, authority tiers.
- `EXPECTED_REVIEW`: Planned milestone reviews and acceptance verifications.

### Low-Leverage Friction & Babysitting (Optimization Targets)
- `CORRECTIVE_INTERVENTION`: Steering agent away from bad edits mid-flight.
- `AGENT_BABYSITTING`: Manual supervision, re-prompting due to lost context.
- `RECOVERY`: Fixing broken repo state, unsticking stalled processes.
- `CONTEXT_RECONSTRUCTION`: Explaining context that agent lost or failed to retrieve.
- `MANUAL_RETRY`: Re-running failed commands or tasks manually.
- `PROVIDER_OVERRIDE`: Manually switching models/providers due to stall/failure.

## 4. Workload Stratification & Provider Neutrality

The workload schema is strictly vendor- and model-neutral:
- Work classes: `IMPLEMENTATION`, `DEBUGGING`, `VERIFICATION`, `RESEARCH`, `DOCUMENTATION`, `PROJECTION`, `BENCHMARK`, `GOVERNANCE`, `INFRASTRUCTURE`, `REFACTORING`.
- Risk tiers: `TIER_0_NO_RISK`, `TIER_1_LOW`, `TIER_2_MEDIUM`, `TIER_3_HIGH`, `TIER_4_CONSTITUTIONAL`.
- Provider classes: `LOCAL_DETERMINISTIC`, `LOCAL_INFERENCE`, `REMOTE_METERED`, `REMOTE_SUBSCRIPTION`, `HYBRID`, `UNKNOWN`.
- Workload contracts MUST NOT mandate vendor or model name as a workload property.
