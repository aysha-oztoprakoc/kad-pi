# WP-KAD-COGNITIVE-TELEMETRY-031: 02 - Event Source & Integration Map

## 1. Non-Competing Lifecycle Authority Principle

Telemetry in KAD-PI is an **observational evidence plane**, NOT a lifecycle state machine:
- `workctl` remains the sole authority for task readiness, claims, STC leases, transitions, and reviews.
- `Intent Fidelity Journal` remains the sole authority for architectural intent decisions.
- `Git` remains the sole authority for code versioning and commit fixed points.
- `Telemetry` observes receipts, claims, execution artifacts, and doctor diagnostics.

## 2. Event Sources & Observational Adapters

| Event Source | Observable Evidence | Telemetry Normalization |
| :--- | :--- | :--- |
| **Workctl Ledger** (`.agents/work/`) | Task status, fixed point SHA, scope, ownership | `work.workpackage_id`, `outcome.accepted`, `work.work_class` |
| **Workctl Claims** (`.agents/work/claims/`) | Actor label, lease timestamps, mode | `work.started_at`, `work.ended_at`, `work.execution_mode` |
| **Workctl Reviews** (`.agents/work/reviews/`) | Review rejections, human review notes | `human.review_rejections`, `human.interventions` |
| **Test Runners** (`npm test`, `node --test`) | Agent runs, failures, retries, duration | `execution.agent_runs`, `execution.failed_runs`, `execution.wall_clock_ms` |
| **OMP Usage Bridge** (`tools/kad/telemetry/`) | Codex, Antigravity, OMP subscription quotas | `economic.api_cost_usd`, `economic.metered_spend_class` |
| **System Metrics** (`amdgpu_top`, `process.cpuUsage()`) | Hardware utilization, VRAM, CPU time | `compute.cpu_time_ms`, `compute.gpu_time_ms`, `compute.gpu_peak_vram_bytes` |
| **Collector Execution** (`process.hrtime`, `fs`) | Collector wall clock, CPU time, bytes written | `maintenance.telemetry_overhead_ms`, `maintenance.bytes_written` |

## 3. Storage Architecture

Telemetry is stored in local append-only files under `.agents/telemetry/outcomes/`:
- `outcomes.jsonl`: Append-only JSONL log containing all recorded observations.
- `records/<wp_id>_<timestamp>.json`: Individual human-readable and queryable records.
- Integrity verification: Every record embeds a SHA-256 digest covering all canonical fields.
