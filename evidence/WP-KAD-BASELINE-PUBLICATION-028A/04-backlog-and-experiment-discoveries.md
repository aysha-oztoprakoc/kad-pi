# Backlog & Experiment Discoveries Firewall (WP-028A)

**Workpackage ID**: `WP-KAD-BASELINE-PUBLICATION-028A`  
**Date**: 2026-08-30  
**Status**: `ROUTED_TO_BACKLOG_AND_EXPERIMENT_PLANE`  

---

## 1. Governance Firewall Principle

In accordance with KAD architectural invariants, all emergent ideas, operational observations, and potential enhancements discovered during the publication of the frozen `WP-028` baseline are routed strictly to the **Backlog / Experiment Plane** rather than contaminating the active publication workpackage.

---

## 2. Cataloged Backlog Proposals (`BACKLOG_PROPOSAL`)

### 1. `BP-028A-01`: GitHub Repository Ruleset & Enterprise Governance Configuration
* **Description**: If the repository is ever upgraded to GitHub Pro or transitioned to a public open-source tier (as evaluated under `DEC_ID_21`), configure declarative branch rulesets requiring status check `verify`, linear history enforcement, and signed commit verification.
* **Current Status**: `BACKLOG_PROPOSAL` (Private free tier currently enforces governance via `bin/workctl` STC leases and automated push/PR CI).

### 2. `BP-028A-02`: Dependabot Vulnerability Triage
* **Description**: Remote GitHub push reported 1 moderate vulnerability in dependencies (`cytoscape` / `echarts`). Triage and update package locks in a future maintenance workpackage.
* **Current Status**: `BACKLOG_PROPOSAL` (Zero runtime network exposure in core KAD).

---

## 3. Cataloged Candidate Experiments (`EXPERIMENT_CANDIDATE`)

### 1. `EXP-028A-01`: WAN Disconnection / Offline Fault-Injection Probe
* **Description**: Conduct a controlled WAN disconnect experiment to empirically validate `FULL_OFFLINE_SURVIVAL` across workctl claims, local inference, and test execution.
* **Current Status**: `EXPERIMENT_CANDIDATE` (Scheduled following intent fidelity substrate).

### 2. `EXP-028A-02`: Counterfactual Warren Runtime Benchmark
* **Description**: Benchmark Warren detached execution provider against baseline local worker on real KAD workloads to isolate actual human attention and throughput savings.
* **Current Status**: `EXPERIMENT_CANDIDATE` (Gated on telemetry instrumentation).

---

## 4. Successor Frontier Confirmation

The intended next workpackage frontier remains strictly:
`WP-KAD-INTENT-FIDELITY-029` (Two-Tier Intent Architecture, Append-Only Journal & `bin/kad-intent` Validator).
