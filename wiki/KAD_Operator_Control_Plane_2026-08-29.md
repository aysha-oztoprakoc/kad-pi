# KAD Operator Control Plane Architecture & Telemetry Specification (2026-08-29)

## Executive Summary

This architecture specification formalizes the **KAD-PI Operator Control Plane**, implemented as an OMP-native extension (`kad-control-plane`) and normalized telemetry substrate. It addresses the fundamental requirement of giving the operator comprehensive, live, deterministic visibility into model execution, provider quotas, economic authorization, workctl claims, GPU performance, and service health without ever fabricating unknown metrics.

---

## 1. Epistemic Provenance and Honesty Constitution

In alignment with the KAD Prime Directive (`TEST, DON'T CLAIM`, `RECORD, DON'T GUESS`), the telemetry layer treats all numeric information as **scientific observations** with explicit epistemic properties:

1. **Anti-Fabrication Invariant**: If a provider exposes no machine-readable quota or limit, the control plane MUST display `UNKNOWN`. Converting incomparable metrics (e.g. 50 requests/day or 20 messages/week) into a synthetic token count is strictly prohibited.
2. **Epistemic States**:
   * `AUTHORITATIVE_REMOTE`: Official remote provider quota/usage endpoint.
   * `AUTHORITATIVE_LOCAL`: Local OS/hardware counters.
   * `OBSERVED`: Empirical measurement from turn/message events.
   * `DERIVED`: Deterministic mathematical deduction from valid facts.
   * `MANUAL`: Versioned human declaration.
   * `STALE`: Observation older than specified TTL.
   * `UNKNOWN`: Unobservable or unexposed metric.
   * `DEGRADED`: Telemetry probe failure.
3. **Deterministic Reconciliation**: When multiple observations exist (e.g., local derived estimate vs authoritative provider check), the higher authority is designated `effective`, while all observations and their delta are preserved for auditability.

---

## 2. Component Architecture

```text
+---------------------------------------------------------------+
|                       Oh My Pi (OMP)                         |
|  +---------------------------------------------------------+  |
|  |           Extension: kad-control-plane                  |  |
|  |  +-------------------+  +----------------------------+  |  |
|  |  |   Compact Meter   |  |   Detailed Overlay Panel   |  |  |
|  |  +-------------------+  +----------------------------+  |  |
|  |  +---------------------------------------------------+  |  |
|  |  | Commands: /kad, /kad-status, /kad-tokens, ...     |  |  |
|  |  | Tools: kad_telemetry, kad_policy_status           |  |  |
|  |  +---------------------------------------------------+  |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|                    KAD Telemetry Substrate                    |
|  +-------------------+  +-------------------+  +-----------+  |
|  | Schema & Ledger   |  | Provider Adapters |  | System    |  |
|  | (kad-telemetry-v1)|  | (OMP / Remote)    |  | (amdgpu)  |  |
|  +-------------------+  +-------------------+  +-----------+  |
|  +-------------------+  +-------------------+  +-----------+  |
|  | Economic Adapter  |  | Workctl Adapter   |  | Health    |  |
|  | (Router View)     |  | (Active Claim)    |  | (Services)|  |
|  +-------------------+  +-------------------+  +-----------+  |
+---------------------------------------------------------------+
```

---

## 3. Developer Toolchain & Quality Gates

The KAD developer toolchain provides fast, local, reproducible quality and security enforcement:

* **Task Runner (`Justfile`)**:
  * `just verify`: Prime directive budget check, librarian verification, KAD doctor, workctl doctor.
  * `just test`: Full regression test suite.
  * `just security`: Local secret scanning (Gitleaks) and vulnerability scanning (Trivy).
  * `just lint`: Shell script formatting and linting (`shellcheck`, `shfmt`).
  * `just bench`: Hyperfine CLI latency benchmarks.
* **Pre-commit Runner (`.pre-commit-config.yaml` / `prek`)**:
  * Fast local pre-commit hooks running in under 600ms.
  * Local Gitleaks staged protection.
  * Prime Directive token and line budget validator.
  * Diagnostic doctors.
* **Context7 MCP (`.omp/mcp.json`)**:
  * Official `@upstash/context7-mcp` configured project-scoped for library documentation access.

---

## 4. Operator Interaction Model

* **Status Bar / Footer**:
  * `KAD │ 182k tok │ FREE ✓ │ P:72% │ GPU 5.8/8.0G │ WP:CLI-002 ✓`
* **Modal Panel (`/kad` or `ctrl+k`)**:
  * Complete multi-section dashboard displaying Overview, Tokens & Quotas, Local Compute & GPU, Service Health, Workctl Claim, and Tokenmaxxing metrics.
* **CLI Transport (`bin/kad` & `bin/kad-doctor`)**:
  * Standalone script access for automated scripts, terminal inspection, and future window manager status bars.
