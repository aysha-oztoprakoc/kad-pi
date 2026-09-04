# OMP 18.0.11 Model-Routing & Configuration Persistence Root Cause Analysis

**Date**: 2026-09-03  
**Target Repository**: `github:can1357/oh-my-pi@18.0.11`  
**Workspace**: `<workspace-root>`  
**Author**: Incident Investigator + Builder + Verifier  
**Classification**: Root Cause Investigation & Architectural Analysis

---

## 1. Epistemic Classification Framework

To eliminate narrative bias and preserve factual integrity, all findings are categorized into three strict epistemic tiers:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ 1. FORENSIC CORRELATION                                                  │
│    Temporal alignment between provider DNS errors and configuration      │
│    mutation on disk. Observed in session logs and git diffs.             │
├──────────────────────────────────────────────────────────────────────────┤
│ 2. SOURCE-CONFIRMED BEHAVIOR                                             │
│    Deterministic call-path analysis of oh-my-pi 18.0.11 source code.    │
│    Proves what code CAN and CANNOT execute during failure and recovery.  │
├──────────────────────────────────────────────────────────────────────────┤
│ 3. PROVEN INCIDENT CAUSE                                                 │
│    Mechanism proven by source verification, failure reproduction,        │
│    and isolated runtime canary execution.                                │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Forensic Correction: Turn Recovery is Ephemeral

### Initial Forensic Correlation
During `WP-KAD-PROJECT-CLOSURE-AND-ZERO-PENDING-BASELINE-043`, an intermittent network outage occurred (`getaddrinfo ETIMEOUT api.z.ai` at 21:56:50Z, `ETIMEOUT opencode.ai` at 22:45:42Z). Initial forensics hypothesized:
> *"Session model-application during retry/recovery entered a persistence path intended only for explicit role assignment, writing `modelRoles.default` to disk."*

### Source-Confirmed Behavior
**INCORRECT / REFUTED BY SOURCE CODE.**  
Comprehensive tracing of `packages/coding-agent/src/session/turn-recovery.ts` proves:
1. When a retryable transport/DNS error occurs, `TurnRecovery.#tryRetryModelFallback()` resolves a candidate model from `retry.fallbackChains`.
2. `TurnRecovery.applyRetryFallbackCandidate()` invokes:
   ```typescript
   await this.session.setModelWithProviderSessionReset(candidateModel);
   this.sessionManager.appendModelChange(candidateSelector, "fallback", true);
   ```
3. When provider health recovers or cooldown expires, `#maybeRestoreRetryFallbackPrimary()` restores the primary model:
   ```typescript
   await this.session.setModelWithProviderSessionReset(primaryModel);
   this.sessionManager.appendModelChange(primarySelector, "fallback");
   ```
4. **Neither path ever calls `setModelRole`, `setProjectModelRole`, `#queueSave`, or `#queueProjectSave`.**  
   Fallback and recovery routes are assigned role `EPHEMERAL_MODEL_CHANGE_ROLE` (`"fallback"`). They reside solely in memory and in the append-only session transcript. **They never write to disk.**

---

## 3. Proven Incident Causes & Defect Reclassification

The incident was caused by a combination of upstream architectural defects, an intentional upstream default that conflicted with KAD's project isolation policy, and human/operator recovery actions during the outage window.

### Defect 1: Ambiguous `session.setModel` Persistence Routing
- **Epistemic Class**: `ACTUAL_UPSTREAM_DEFECT`
- **Location**: `packages/coding-agent/src/session/model-controls.ts:235`
- **Mechanism**: In stock OMP 18.0.11, `ModelControls.setModel` had:
  ```typescript
  if (options?.persist) {
      this.#host.settings.setModelRole(role, formattedValue);
  }
  ```
  `Settings.setModelRole` unconditionally mutates `this.#global` and writes to `~/.omp/agent/config.yml`. When callers invoked `session.setModel(..., { persist: true })` from within a project repository, `model-controls.ts` completely ignored `modelRoleStorage` and wrote machine-wide configuration.
- **Architectural Correction**:
  Enforce the invariant:
  ```text
  ACTIVE MODEL CHANGE ≠ ROLE PERSISTENCE
  ONLY EXPLICIT USER ROLE ASSIGNMENT MAY PERSIST A ROLE
  ```
  Persistence scope must be explicit and cannot be inferred from ambient configuration. Introduced `SetModelOptions.persistRole: ModelRolePersistence` (`{ scope: "global" | "project", reason: "EXPLICIT_USER_ROLE_ASSIGNMENT" }`). When omitted, `setModel` operates strictly in memory.

---

### Defect 2: Unconditional No-Op Project Config Re-serialization
- **Epistemic Class**: `ACTUAL_UPSTREAM_DEFECT`
- **Location**: `packages/coding-agent/src/config/settings.ts:2596` (`#saveProjectNow`)
- **Mechanism**: When `setProjectModelRole` was invoked—even with a value identical to what was already on disk—`#saveProjectNow` unconditionally called `#writeYamlAtomically(writePath, projectSettings)`.
  Because `YAML.stringify` does not preserve AST comment trivia, this write:
  1. Stripped all user comments (including KAD's D5 security posture comments).
  2. Modified file `mtime` and generated a dirty git state without any semantic change.
- **Architectural Correction**:
  Enforce the invariant:
  ```text
  NO SEMANTIC CONFIG CHANGE → NO FILE WRITE
  ```
  In `#saveProjectNow` and `#saveNow`, capture `loadedSnapshot` before mutation and perform deep semantic equality (`Bun.deepEquals(projectSettings, loadedSnapshot)`). If semantically unchanged, abort write operations immediately, preserving comments, mtime, and byte-level hash invariance.

---

### Defect 3: Interactive Model Selection Default Bias
- **Epistemic Class**: `UPSTREAM_INTENTIONAL_DEFAULT` + `KAD_POLICY_MISMATCH`
- **Location**: `packages/coding-agent/src/config/settings-schema.ts:644`, `modes/components/model-hub.ts:801`
- **Analysis**:
  - `modelRoleStorage` defaults to `"global"` in schema. Upstream OMP is designed as a personal coding assistant where user preferences follow the user across directories. This default is **intentional upstream behavior**, not a bug.
  - However, KAD operates under strict project-level isolation doctrine (`modelRoleStorage: "project"`). When `~/.omp/agent/config.yml` lacked an explicit `modelRoleStorage: project` directive, the upstream runtime defaulted to `"global"`.
  - During the incident window (22:01:56Z–22:02:05Z), an interactive `/model` command was executed. Under `modelRoleStorage: "global"`, `ModelHubComponent` and `SelectorController.onAssign` automatically set `targetScope = "global"` and invoked `session.setModel(..., { persist: true })`. This executed `settings.setModelRole()`, materializing `opencode-go/deepseek-v4-flash:high` into `~/.omp/agent/config.yml`.
- **Resolution**:
  KAD explicitly enforces `modelRoleStorage: project` in both `~/.omp/agent/config.yml` and `~/Work/.omp/config.yml`.

---

## 4. Model-Changing Lifecycle Classification Matrix

| Path Name | Primary Caller | `may_change_active_model` | `may_change_role` | `may_write_global_config` | `may_write_project_config` | `requires_explicit_user_intent` | Epistemic Classification |
|---|---|:---:|:---:|:---:|:---:|:---:|---|
| **`TEMPORARY`** | Alt+P, `/switch`, `setModelTemporary` | YES | NO (`"temporary"`) | **NO** | **NO** | YES | Verified Ephemeral |
| **`EXPLICIT_ROLE_ASSIGNMENT`** | Model Hub, `/model` assign | YES | YES | **YES** (if scope=global) | **YES** (if scope=project) | YES | Proven Persistence Path |
| **`RESTORE`** | `createAgentSession`, `switchSession` | YES | NO | **NO** | **NO** | NO | Verified Ephemeral |
| **`FALLBACK`** | `TurnRecovery.applyRetryFallbackCandidate` | YES | NO (`"fallback"`) | **NO** | **NO** | NO | Verified Ephemeral |
| **`RETRY`** | `TurnRecovery.handleRetryableError` | NO | NO | **NO** | **NO** | NO | Verified Ephemeral |
| **`RECOVERY`** | `TurnRecovery.#maybeRestoreRetryFallbackPrimary` | YES | NO (`"fallback"`) | **NO** | **NO** | NO | Verified Ephemeral |
| **`STARTUP_INITIALIZATION`** | `createAgentSession` initial model | YES | NO (`"default"`) | **NO** | **NO** | NO | Verified Ephemeral |

---

## 5. Architectural Invariants Enforced by Patch

1. **Explicit Scope Invariant**:
   `ONLY EXPLICIT USER ROLE ASSIGNMENT MAY PERSIST A ROLE.`
   Lower-level `setModel` never infers persistence destination from ambient settings. The UI/controller must pass `persistRole: { scope: "global" | "project", reason: "EXPLICIT_USER_ROLE_ASSIGNMENT" }`.
2. **Semantic Equality Write Guard**:
   `NO SEMANTIC CONFIG CHANGE → NO FILE WRITE.`
   Neither global nor project YAML files are written if the effective in-memory state is deeply equal to the disk snapshot. User comments, formatting, and filesystem timestamps remain untouched.
3. **Audit Provenance**:
   All role persistence operations emit structured debug logs recording role, scope, previous value, new value, and authority.
