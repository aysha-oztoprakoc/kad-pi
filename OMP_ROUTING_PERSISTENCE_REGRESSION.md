# OMP Model-Routing & Persistence Regression Report

**Date**: 2026-09-03  
**Target Repository**: `github:can1357/oh-my-pi@18.0.11` (commit `b8ce33a58911c26bed1d48f0d9ba5e2e727c49a2`)  
**Workspace**: `<workspace-root>`  
**Author**: Incident Investigator + Builder + Verifier  
**Final Verdict**: `UPSTREAM_DEFECT_MITIGATED_LOCALLY`

---

## 1. Complete Test Surfaces & Evidence Receipts

| Test Surface | Executable / Engine | Tests Run | Pass | Fail | Assertions | Determinism |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Characterization Suite (T1–T13)** | Bun v1.4.0 (`coding-agent`) | 13 | **13** | 0 | 57 | 100% |
| **50-Cycle Stress Regression** | Bun v1.4.0 (`coding-agent`) | 1 | **1** | 0 | 206 | 100% |
| **KAD Cross-Project Integration** | Bun v1.4.0 (`coding-agent`) | 1 | **1** | 0 | 26 | 100% |
| **Existing Persistence & Side-Effects** | Bun v1.4.0 (`coding-agent`) | 178 | **178** | 0 | 727 | 100% |
| **Runtime Canary Verification (C1–C7)** | Canary Binary (`omp-patched-canary`) | 7 | **7** | 0 | 28 | 100% |
| **Canonical KAD Test Surface** | Node.js v20 (`tools/kad`, `workctl`, `docs/state`) | 790 | **790** | 0 | 790+ | 100% |
| **Doctor Diagnostics** | `bin/kad doctor` + `bin/workctl doctor` | 2 | **2** | 0 | Healthy | 100% |
| **Telemetry & Secret Integrity** | `bin/kad-telemetry` + `gitleaks` | 2 | **2** | 0 | Clean | 100% |

---

## 2. Characterization Suite Matrix (T1–T13)

**File**: `packages/coding-agent/test/model-routing-persistence-characterization.test.ts`

| Test ID | Scenario | Baseline (Stock) | Patched Result | Verified Architectural Invariant |
|---|---|:---:|:---:|---|
| **T1** | Temporary model switch | PASS | **PASS** | `setModelTemporary` never writes config |
| **T2** | Explicit project role assignment | PASS | **PASS** | Writes to project config only; global untouched |
| **T3** | Provider failure & fallback routing | PASS | **PASS** | `TurnRecovery` routes ephemerally; zero config write |
| **T4** | Retry budget exhaustion | PASS | **PASS** | Saturated retries produce zero config write |
| **T5** | Recovery after provider restoration | PASS | **PASS** | Restored primary produces zero config write |
| **T6** | Session start, restore & no-op assignment | **RED (FAIL)** | **GREEN (PASS)** | No semantic change → no rewrite; comments, mtime, hash preserved |
| **T7** | Storage-scope stability | PASS | **PASS** | `modelRoleStorage` remains `project`, never flips |
| **T8** | Project isolation | PASS | **PASS** | Project assignments never leak into neutral projects |
| **T9** | Explicit project role persistence | **RED (FAIL)** | **GREEN (PASS)** | In project mode, role persistence never pollutes global config |
| **T10** | Explicit global assignment from project-storage mode | **RED (FAIL)** | **GREEN (PASS)** | `storage=project` + `scope=global` → GLOBAL only (`GLOBAL=C`, `PROJECT=B`) |
| **T11** | Explicit project assignment from project-storage mode | PASS | **PASS** | `storage=project` + `scope=project` → PROJECT only (`GLOBAL=A`, `PROJECT=C`) |
| **T12** | Explicit normal assignment from global-storage mode | PASS | **PASS** | `storage=global` + `scope=global` → GLOBAL only (`GLOBAL=C`, `PROJECT=B`) |
| **T13** | Temporary / session-only selection under either storage setting | PASS | **PASS** | Zero config write under both `project` and `global` storage modes |

---

## 3. Runtime Canary Verification (C1–C7)

**Executable**: `bin/omp-patched-canary` (SHA256: `e0ff9cf2fc622d775597c970d6dcbba6b1ca93ea10c52ae2ad60b0ef9cc34ed3`)  
**Script**: `bun scripts/runtime-canary-suite.mjs`

- **C1: Binary version check** → `omp/18.0.11` (PASS)
- **C2: Config read produces zero mutation** → Global & Project SHA256 hashes 100% identical (PASS)
- **C3: Explicit project assignment** → Project hash changes; Global hash 100% invariant (PASS)
- **C4: Explicit global assignment while storage=project** → Global hash changes; Project hash 100% invariant (PASS)
- **C5: Value-neutral assignment** → Zero rewrite; comments, mtime, and SHA256 invariant (PASS)
- **C6: Temporary model switch** → Global & Project SHA256 hashes 100% invariant (PASS)
- **C7: Session startup & restart** → Global & Project SHA256 hashes 100% invariant (PASS)

---

## 4. Full Canonical KAD Project Surface Verification

1. **Test Suites**:
   ```bash
   node --test \
     tools/kad/test/*.test.mjs \
     tools/workspace/workctl.test.mjs \
     docs/state/test/*.test.mjs
   ```
   **Result**: **790 pass, 0 fail, 0 cancelled, 0 skipped** (`duration: 11.4s`).
2. **Health Diagnostics**:
   - `bin/kad doctor`: **PASS** (10/10 subsystems healthy).
   - `bin/workctl doctor`: **Healthy** (0 errors).
   - `bin/kad-telemetry validate`: **37/37 records valid**, 0 corrupted.
3. **Safety & Cleanliness**:
   - `git diff --check`: **Clean** (zero whitespace or conflict markers).
   - `gitleaks git --log-opts="-1 HEAD"`: **No leaks found**.
   - `git status --short`: Working tree contains only expected untracked reports and clean tracked baseline.

---

## 5. Source Code Changes Summary

Patch exported to `OMP_ROUTING_AUTH_FIX.patch` (220 lines):
- `packages/coding-agent/src/session/model-controls.ts`:
  Introduced `ModelRolePersistence` type. Removed ambient `modelRoleStorage` query inside `setModel`. Scope is strictly taken from explicit caller intent (`options.persistRole.scope`).
- `packages/coding-agent/src/session/agent-session.ts`:
  Exposed `SetModelOptions` and `ModelRolePersistence`.
- `packages/coding-agent/src/modes/controllers/selector-controller.ts`:
  Passed explicit `persistRole: { scope: targetScope, reason: "EXPLICIT_USER_ROLE_ASSIGNMENT" }`.
- `packages/coding-agent/src/modes/setup-wizard/scenes/model.ts`:
  Passed explicit `persistRole: { scope: projectScope ? "project" : "global", reason: "EXPLICIT_USER_ROLE_ASSIGNMENT" }`.
- `packages/coding-agent/src/config/settings.ts`:
  Added deep semantic equality check before writing YAML files in `#saveNow` and `#saveProjectNow`. Added structured audit telemetry for all role persistence events.

---

## 6. Upstream Pull Request Draft

**Repository**: `github:can1357/oh-my-pi`  
**Branch**: `fix/model-role-persistence-explicit-scope`  
**Title**: `fix(config): enforce explicit scope for model role persistence and prevent no-op YAML rewrites`

### Summary
1. **Explicit Role Persistence Scope**:
   In stock OMP, `ModelControls.setModel` had no awareness of project-level role persistence and always delegated `options.persist: true` to `settings.setModelRole()`, which wrote to the global configuration layer. Furthermore, attempting to infer storage scope from ambient `modelRoleStorage` breaks explicit global assignments when a project chooses project storage mode.
   This PR introduces `persistRole?: { scope: "global" | "project", reason: "EXPLICIT_USER_ROLE_ASSIGNMENT" }` to `SetModelOptions`. Active model changes remain separate from persistence. Lower-level model controls never infer persistence scope from ambient configuration.
2. **Comment Preservation & No-Op Write Guard**:
   `Settings.#saveNow` and `#saveProjectNow` now perform deep semantic comparison against a pre-mutation disk snapshot. If settings are unchanged, the disk write is bypassed, preserving user-authored YAML comments and file modification timestamps.
3. **Audit Logging**:
   Added structured audit telemetry to `Settings.setModelRole` and `setProjectModelRole`.
