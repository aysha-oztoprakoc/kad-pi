# KAD Cognitive Attention, Intervention Friction & Outcome Cost Telemetry Baseline Report

**Generated At**: `2026-08-30T22:03:03.776Z`
**Schema Version**: `KAD_COGNITIVE_TELEMETRY_BASELINE_V1`

---

## 1. Executive Summary

| Dimension | Measured Value | Epistemic Origin |
| :--- | :--- | :--- |
| **Total Workpackages Evaluated** | `37` | `DERIVED_DETERMINISTIC` |
| **Prospective Observations** | `0` | `DIRECTLY_OBSERVED` |
| **Historical Reconstructions** | `37` | `RECONSTRUCTED` |
| **Accepted Workpackages** | `30` | `DERIVED_DETERMINISTIC` |
| **Clean Outcome Rate** | `81.1%` | `DERIVED_DETERMINISTIC` |
| **Total Recorded Interventions** | `0` | `OBSERVED / REPORTED` |
| **Low-Leverage Friction Ratio** | `0.0%` | `DERIVED_DETERMINISTIC` |

---

## 2. Telemetry Coverage & Missing Data Matrix

In accordance with the invariant **`UNKNOWN != ZERO`**, missing observations are explicitly tracked as missing coverage rather than fabricated defaults:

- **Human Active Minutes Coverage**: `0.0%`
- **Economic Metered Cost Coverage**: `0.0%`
- **Context Token Count Coverage**: `0.0%`
- **Execution Wall Clock Coverage**: `0.0%`

---

## 3. Workload & Stratification Profile

### Work Class Distribution
```json
{
  "GOVERNANCE": 3,
  "IMPLEMENTATION": 17,
  "PROJECTION": 3,
  "DEBUGGING": 4,
  "BENCHMARK": 1,
  "DOCUMENTATION": 3,
  "RESEARCH": 6
}
```

### Epistemic Origin Distribution
```json
{
  "RECONSTRUCTED": 37
}
```

---

## 4. Multi-Dimensional Vector Profiles

### A. Human Cognitive Attention & Friction Vector
- **Total Interventions**: `0`
- **Friction Interventions (Babysitting/Correction/Retry)**: `0`
- **Strategic Guidance Events (Design/Research/Constitutional)**: `0`
- **Manual Retries**: `0`
- **Friction per Accepted Outcome**: `0.00`
- **Observed Mean Human Active Minutes**: `UNKNOWN`

### B. Quality & Outcome Vector
- **Accepted WPs**: `30`
- **Rejected / In-Progress WPs**: `7`
- **Escaped Regressions**: `0`
- **Acceptance Reversals**: `0`
- **Rollback Events**: `0`
- **Post-Acceptance Defects**: `0`

### C. Execution Efficiency Vector
- **Total Agent Execution Runs**: `37`
- **Failed Runs**: `0`
- **Failed Run Rate**: `0.0%`
- **Total Retries**: `0`
- **Mean Wall Clock Time**: `UNKNOWN`

### D. Economic & Context Vectors
- **Total Observed Metered Cost**: `UNKNOWN / ZERO METERED SPEND`
- **Observed Mean Cost per Unit**: `N/A`

---

## 5. Architectural Complexity Snapshot

Structural complexity proxies measuring system comprehensibility:

| Structural Component | Count | Description |
| :--- | :--- | :--- |
| **Authoritative Stores** | `4` | Canonical Vault, Workctl Ledger, Intent Journal, Git |
| **Persistent Daemons** | `1` | Interface HTTP/SSE Server |
| **Persistent Databases** | `2` | SQLite Stores |
| **Provider Adapters** | `4` | OMP, Codex, Antigravity, Qwen, Zotero, OpenViking |
| **Active Schemas** | `8` | Telemetry, Intent, ISA, Workload, Role schemas |
| **Mandatory CLI Surfaces** | `14` | bin/kad, bin/workctl, bin/kad-telemetry, etc. |
| **Manual Sync Edges** | `4` | Projections, intent reports, ISA validation |

---

## 6. Observer-Effect Accounting

Telemetry collection overhead measured during operation:
- **Total Telemetry Overhead (Wall-Clock)**: `0 ms`
- **Collector CPU Time**: `0.00 ms`
- **Total Bytes Written**: `0 bytes`

---

## 7. Prospective Baseline Window & Limitations

### Baseline Collection Window
- **Target Sample Size**: 15-20 representative work units across IMPLEMENTATION, DEBUGGING, RESEARCH, and GOVERNANCE
- **Inclusion Criteria**:
  - Must have explicit workctl task ledger claim and acceptance receipt
  - Must record typed human interventions (distinguishing strategic vs friction)
  - Must record execution attempts, failures, and retries
  - Must measure wall-clock elapsed time and observer overhead
- **Exclusion Criteria**:
  - Unbounded exploratory prompt loops outside workctl leases
  - Workpackages aborted due to external workstation outages or manual Git branch resets without workctl record

### Epistemic Limitations & Non-Authority Invariants
- Historical reconstruction cannot retroactively observe exact human active minutes or unmetered token counts without fabrication; these remain UNKNOWN.
- Human cognitive fatigue is captured via proxy indicators (intervention frequency, manual retries, babysitting events) rather than direct biometric measurement.
- Telemetry supplies empirical evidence for future hypothesis testing; it does NOT possess authority to mutate routing or governance policy automatically.
