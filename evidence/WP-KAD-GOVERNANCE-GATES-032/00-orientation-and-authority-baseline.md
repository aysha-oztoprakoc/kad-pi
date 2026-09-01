# WP-KAD-GOVERNANCE-GATES-032: 00 - Orientation & Authority Baseline

## 1. Executive Context & Workpackage Claim
- **Workpackage ID**: `WP-KAD-GOVERNANCE-GATES-032`
- **Title**: Deterministic Governance Gates, Authority Tiering, Pre-Flight Verification & Protected Mutation Admission
- **Governing Baseline**: `WP-KAD-COGNITIVE-TELEMETRY-031` (`origin/main = 15483b6`)
- **Governing Requirements**: `REQ-KAD-AUTH-001`, `REQ-KAD-AUTH-002`, `REQ-KAD-COG-001`, `REQ-KAD-COG-002`, `REQ-KAD-FIN-001`, `REQ-KAD-FIN-002`
- **Actor**: `gemini-3.7-flash-high`
- **Claim Status**: `ACTIVE` mutating lease under `.agents/work/claims/WP-KAD-GOVERNANCE-GATES-032.json`

## 2. Core Authority Invariants
1. **Model Output Proposes $\neq$ Deterministic Policy Authorizes**: Models and providers submit operational proposals; deterministic governance policy resolves admission.
2. **Capability $\neq$ Authority**: Possessing a technical tool, network access, or an API credential does NOT grant authority to use it.
3. **Target Authority $\neq$ Current Active Enforcement**: A target delegated policy does not become autonomous if the underlying capability broker is not implemented.
4. **Work Lifecycle $\neq$ Execution Run Lifecycle**: Task state is owned by `workctl`; governance decisions are evaluation receipts.
5. **Mutator $\neq$ Sole Verifier $\neq$ Acceptance Authority**: Authorizing, implementing, and verifying remain separated across independent entities.
6. **Telemetry Observes $\neq$ Telemetry Authorizes**: Telemetry measures governance friction and decisions without automated policy feedback.

## 3. Pre-Flight Diagnostic Baseline
- `npm test`: 741 PASS (prior to WP-032 implementation)
- `bin/workctl doctor`: HEALTHY
- `bin/kad doctor`: PASS (all 9 checks PASS)
- `bin/kad-telemetry validate`: 37/37 records valid
- `bin/workctl skills doctor`: WARN (16 local delta tracking, 0 errors)
