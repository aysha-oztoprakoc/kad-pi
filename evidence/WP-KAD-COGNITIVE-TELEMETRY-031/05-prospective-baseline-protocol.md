# WP-KAD-COGNITIVE-TELEMETRY-031: 05 - Prospective Baseline Protocol

## 1. Objective
Establish a formal, reproducible protocol for collecting prospective telemetry across future KAD-PI engineering and research workpackages to enable defensible counterfactual experiment comparisons.

## 2. Prospective Baseline Window Specification
- **Target Sample Size**: 15–20 representative accepted work units.
- **Workload Coverage**:
  - `IMPLEMENTATION` (at least 5 units)
  - `DEBUGGING / REPAIR` (at least 3 units)
  - `RESEARCH / EVALUATION` (at least 3 units)
  - `GOVERNANCE / ISA` (at least 2 units)
  - `BENCHMARK / PROBE` (at least 2 units)

## 3. Inclusion & Exclusion Criteria

### Inclusion Criteria
1. Work unit must be initiated through an explicit `workctl claim` with an active STC lease.
2. Operator interactions must be recorded with explicit intervention classifications (`STRATEGIC_DESIGN`, `EXPECTED_REVIEW`, `CORRECTIVE_INTERVENTION`, `AGENT_BABYSITTING`, etc.).
3. Execution attempts, failures, and retries must be captured.
4. Wall-clock elapsed time and observer overhead must be recorded.
5. Workpackage acceptance must reference verifiable evidence under `evidence/`.

### Exclusion Criteria
1. Ad-hoc terminal prompt loops outside workctl leases.
2. Work aborted due to workstation power failure or manual git resets without a workctl record.
3. Untracked manual file edits made without recorded intervention.

## 4. Counterfactual Experiment Integration
Future experiments (e.g. OMP-native vs Warren, AMDY-local vs TELL-detached, simple retrieval vs ContextPlane) will attach the following metadata to telemetry records:
- `work.experiment_id`: Unique experiment identifier (e.g. `EXP-KAD-OFFLINE-SURVIVAL-001`).
- `work.cohort`: Cohort identifier (e.g. `CONTROL`, `EXPERIMENTAL_CANARY`).
- `work.trial_id`: Trial sequence number.
- `work.baseline_or_candidate`: `BASELINE` or `CANDIDATE`.

This allows the aggregator to compute matched-work-class delta vectors between baseline and candidate approaches.
