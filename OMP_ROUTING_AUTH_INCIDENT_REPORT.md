# OMP ROUTING / AUTH INCIDENT REPORT

- **Date**: 2026-09-01 (incident window ~21:56Z–23:10Z; report written ~23:15Z)
- **Reporter**: human (project lead)
- **Investigator**: OMP harness session (`omp` pid 17351, model `opencode-go/deepseek-v4-flash`)
- **Context**: incident occurred during `WP-KAD-PROJECT-CLOSURE-AND-ZERO-PENDING-BASELINE-043` (now suspended per directive)
- **Method**: read-only forensics — no configuration, credential, network, or Git mutation performed

---

## VERDICT

```text
ROOT CAUSE: OMP session model-application events persisted the active model binding
           (opencode-go/deepseek-v4-flash) into CONFIGURATION without explicit human
           selection, during and after an intermittent network/DNS outage.

CREDENTIALS: NOT lost, NOT modified, NOT expired. Provider failures during the incident
           were NETWORK (DNS) failures, not authentication failures.

CURRENT STATE: network recovered (all providers reachable); global config polluted with
           modelRoles.default + modelRoleStorage: global + session settings;
           project config intact in value (re-serialized, comments stripped).

CLASSIFICATION: CONFIRMED OMP ROUTING-PERSISTENCE BUG (candidate) —
           transient model application persisted routing policy;
           modelRoleStorage silently flipped to global.
```

---

## TIMELINE (all times UTC; local = UTC−3)

| Time (UTC) | Event | Evidence |
|---|---|---|
| 21:54:06Z | WP-043 Phase A commits land (config D1+D5, telemetry D3, lifecycle D4/D7/D8) | git `ac8b7f7`,`e3f309b`,`ad7c762` |
| 21:56:50Z | **Outage begins**: `ZAI usage fetch error: getaddrinfo ETIMEOUT api.z.ai` | log `1531555` |
| ~22:00–22:02Z | ZAI returns HTTP 500 `当前用户不存在coding plan` (account-level, separate issue) | logs `1544494`,`1550686` |
| **22:02:01Z** | **GLOBAL config write #1**: `~/.omp/agent/config.yml` gains `modelRoles.default: opencode-go/deepseek-v4-flash:high` | config mtime |
| 22:15:44Z | `agent.db` / `history.db` / `models.db` cluster write (session state; DB not deleted) | mtimes |
| 22:22:20Z | Session `omp` pid 17351 starts (post-incident restart; hosts this harness) | process start |
| 22:25:11–13Z | Two `Computer tool retained after model change` events (model deepseek-v4-flash) | log `17351:59,61` |
| **22:25:13.864Z** | **PROJECT config re-serialized** (`.omp/config.yml`, 100ms after model-change event; comments stripped, values unchanged) | config mtime + log |
| 22:45:42Z | **`agent turn ended with provider error: opencode-go/deepseek-v4-flash, getaddrinfo ETIMEOUT opencode.ai`**; automatic-retry scheduled | log `17351` |
| 22:46:02Z+ | Retry loop continues (ETIMEOUT opencode.ai), `agent.continue source: automatic-retry` | log `17351` |
| 22:48–22:58Z | Usage polls: `OpenCode Go usage fetch error: getaddrinfo ETIMEOUT opencode.ai` | logs `104206`…`137278` |
| **23:03:05Z** | **GLOBAL config write #2**: appends `modelRoleStorage: global`, `personality`, `steeringMode`, `tools.approvalMode: yolo`, `memory.backend: off`, `edit.mode: hashline` | config mtime |
| 23:03:39Z | OpenCode usage poll SUCCEEDS (`limits: 3`) — DNS recovered | log `194671` |
| ~23:10Z | All providers reachable (opencode 200, z.ai 200, google 404-root, DNS resolves) | live probes |

---

## CURRENT MODEL ROLE LAYERS

| Layer | `modelRoles.default` | `modelRoleStorage` | Provenance |
|---|---|---|---|
| OMP schema default | (unset) | global | schema |
| Global config `~/.omp/agent/config.yml` | **`opencode-go/deepseek-v4-flash:high`** | **`global`** (incident-appended) | **incident write** (22:02:01Z + 23:03:05Z) — no human command found |
| Project config `.omp/config.yml` | `opencode-go/deepseek-v4-flash:high` | `project` | **human decision D1** (WP-043, committed `ac8b7f7`) — bootstrap/canary |
| Effective (in `/home/amdy/Work`) | deepseek-v4-flash (project wins) | `project` | — |
| Effective (outside project) | deepseek-v4-flash (global now sets it) | `global` | **incident-driven** |

The PROJECT default being deepseek-v4-flash is the human-authorized WP-043 D1 canary (committed). The GLOBAL default + `modelRoleStorage: global` are incident-injected and were never human-selected.

---

## CURRENT AUTH STATE

- Credential files **untouched**: `~/.omp/agent/.env` (mtime 08-29), `~/.omp/agent/secret-placeholder.key` (08-29). No `.env`/key/`agent.db` deletion or overwrite.
- `agent.db`: exists, 864,256 bytes, mtime 22:15:44Z (session-state write), sha256 `6cc10e9ab4c07f69f01b18b605d0c6c33cff71f89bfa73303ae4ed5dbe7b1628`. Contents NOT printed.
- No OAuth/login tokens read or printed during investigation.
- Provider classification (as of 23:10Z):
  - `opencode-go`: NETWORK_RECOVERED (HTTP 200; usage fetch OK). No 401/403 observed — the incident errors were DNS timeouts.
  - `google-antigravity`: NETWORK_RECOVERED (endpoint reachable). No auth error observed in logs.
  - `zai-free` / `zai`: NETWORK_RECOVERED, but **account error**: HTTP 500 `当前用户不存在coding plan` on usage fetch (persistent since ~22:00Z) — provider-account issue, unrelated to this incident.
  - `openai-codex`: not exercised in logs.
  - local providers (world/qwen): world endpoint was AVAILABLE earlier; OMP model-discovery patterns (`kad-local-world/*`) did not match at session start (endpoint not exposed via OMP discovery; declared via models.yml — pre-existing condition, not incident-caused).

**Conclusion**: "credentials not functioning" after restart = provider calls failed on DNS during the outage. No credential mutation occurred.

---

## NETWORK STATE

- Incident pattern: **intermittent DNS resolution failures** (`getaddrinfo ETIMEOUT`) affecting api.z.ai (21:56–22:16Z) and opencode.ai (22:45–22:58Z). GitHub remained reachable throughout (raw.githubusercontent fetches succeeded ~22:00Z).
- Failure class: **DNS FAILURE (intermittent)** — not TCP/TLS, not HTTP, not 401/403.
- Current (23:10Z): DNS resolves for opencode.ai, api.z.ai, generativelanguage.googleapis.com, api.openai.com; HTTP reachable. Recovered.
- No network mutation performed during investigation.

---

## ROOT CAUSE

**OMP persisted session model-application events into configuration without explicit human selection, during an outage-driven restart/retry sequence:**

1. The session model (`opencode-go/deepseek-v4-flash`) was applied at session/model initialization (log: `Computer tool retained after model change`, 22:25:11/13Z) — each application event writes the model binding to config.
2. The PROJECT config write (22:25:13.864Z) was value-neutral (the canary was already committed) but re-serialized the file (comments stripped) — proving the write-on-apply behavior.
3. A GLOBAL-scope write (23:03:05Z) additionally persisted `modelRoleStorage: global` plus session settings into `~/.omp/agent/config.yml` — flipping the storage scope so that subsequent model applications from any non-project session persist to the GLOBAL config.
4. No human command exists for these writes: shell history shows no `omp config set`; no session log records a user model-selection command; the writes correlate with automated session-init/retry/recovery events.
5. Net effect: `NETWORK FAILURE → transient model application/fallback → GLOBAL/PROJECT routing policy persisted` — violating the invariant that transient fallback must not persist routing policy.

Certainty: config mutation without human command = CONFIRMED from evidence. Exact code path inside the compiled `omp` binary = not directly observable; the mechanism is identified at the session-model-application level. Marked as upstream bug candidate pending OMP source/maintainer confirmation.

---

## CONFIG MUTATIONS OBSERVED

| Path | Time | Delta | Author |
|---|---|---|---|
| `~/.omp/agent/config.yml` (global) | 22:02:01Z | + `modelRoles.default: opencode-go/deepseek-v4-flash:high` | automatic (no human command) |
| `.omp/config.yml` (project) | 22:25:13.864Z | re-serialized; comments removed; values unchanged | session model-application (value-neutral) |
| `~/.omp/agent/config.yml` (global) | 23:03:05Z | + `modelRoleStorage: global`, `personality`, `steeringMode`, `tools.approvalMode: yolo`, `memory.backend: off`, `edit.mode: hashline` | automatic (no human command) |

No other config surfaces mutated. `.gitignore`/`skills-lock.json`/work-item changes in the repo are WP-043 work, unrelated to the incident.

## CREDENTIAL MUTATIONS OBSERVED

**None.** No credential file created, deleted, replaced, or re-encoded. `agent.db` was written (session state) but not removed or re-initialized.

---

## WP-043 IMPACT

- WP-043 is **suspended** per directive. Nothing published: repo is ahead 8 of origin/main (0 behind), all commits local.
- Committed state intact at `ad7c762`: D1+D5 config (canary + security posture), D3 telemetry ignore, D4/D7/D8 lifecycle closure (40 ACCEPTED, EXP BLOCKED, WP-043 CLAIMED), prep artifacts.
- Working tree: `.omp/config.yml` differs from commit only by the incident's comment-stripping re-serialization (values identical); `skills-lock.json` modified (system-atlas adoption incomplete); `.agents/skills/system-atlas/` untracked (adoption in progress, upstream provenance established: `f7005f2`, hash mismatch characterized).
- D6 (global harness merge) was authorized by the human but NOT yet executed — the incident's global pollution must be cleaned as part of any D6 execution.

---

## SAFE RECOVERY PLAN (proposal — NOT executed)

Ordered by dependency; each step requires authorization before execution.

1. **Authentication** — no action needed: credentials intact, network recovered. Verify with one real provider call once DNS stability is confirmed (no 401/403 observed anywhere in the incident).
2. **Restore global config** — remove the incident-injected keys from `~/.omp/agent/config.yml`: `modelRoles.default`, `modelRoleStorage: global`, and the appended session-settings block (`personality`, `steeringMode`, `tools.approvalMode`, `memory`, `edit.mode`). Restore pre-incident global = providers + setupVersion + modelRoles.advisor + secrets + disabledProviders + compaction + theme + autolearn + astGrep/computer/checkpoint/vault/github/security. Take a timestamped backup first (outside Git). This restores `modelRoleStorage` to default (project sessions store in project; no accidental global writes).
3. **Project config** — keep the committed D1 canary + D5 security posture (`ac8b7f7`); optionally restore the committed file over the re-serialized working copy (cosmetic; values identical).
4. **Fallback policy** — verify `retry.fallbackChains` in the project config (unchanged); confirm no fallback experiment ran (none observed in logs).
5. **ZAI account** — separate finding: usage fetch returns 500 `当前用户不存在coding plan`. Requires provider-side check (not an OMP issue).
6. **WP-043 resume** — after incident close and with the global config restored, resume at the suspension point: finish system-atlas adoption (D2), execute the D6 global harness merge **on the restored pre-incident global config**, complete deliverables, full test suite, human acceptance, fast-forward publication.
7. **Upstream report** — file the routing-persistence bug with OMP: session model-application writes `modelRoles.default`/`modelRoleStorage` to config without a human-selection guard.

---

## UPSTREAM BUG CANDIDATE

```text
CONFIRMED OMP ROUTING-PERSISTENCE BUG (candidate)
Invariant violated: NETWORK FAILURE → TRANSIENT FALLBACK → MUST NOT PERSIST
                    GLOBAL/PROJECT ROUTING POLICY
Mechanism: session model-application events persist modelRoles.default into the active
           config layer; a recovery/session-init path additionally persisted
           modelRoleStorage: global into the global config.
Impact: session/fallback model becomes a persistent GLOBAL default; scope of future
        model-role persistence silently widens to global.
Requires: OMP source/maintainer confirmation of the exact write path; a guard that model
          application without explicit human selection never writes routing policy,
          and modelRoleStorage never flips scope automatically.
```

## REGRESSION TEST REQUIRED

1. **No-persist-on-apply**: start a session with a model equal to the configured default → assert config files (global + project) are byte-unchanged.
2. **No-persist-on-network-error**: induce a provider DNS failure mid-turn with automatic retry → assert no config write occurs.
3. **Storage-scope stability**: assert `modelRoleStorage` never changes from its human-set value as a side effect of session init/recovery.
4. **Restart idempotence**: restart a session after a provider outage → assert global config unchanged.
5. These tests should be RED against the current binary before any fix, then GREEN after.

---

## SOURCE-CONFIRMED RECONCILIATION & RESOLUTION (2026-09-03)

### 1. Forensic Observation vs Source-Confirmed Root Cause

- **Historical Forensic Hypothesis**:
  > *"Model/session application during retry/recovery enters a persistence path intended only for explicit role assignment."*
- **Source-Confirmed Investigation Result**:
  **INCORRECT / INACCURATE.**
  Source code analysis of `packages/coding-agent/src/session/turn-recovery.ts` confirms that all retry/recovery paths (`applyRetryFallbackCandidate`, `#tryFireworksFastFallback`, `#maybeRestoreRetryFallbackPrimary`) explicitly set `role = EPHEMERAL_MODEL_CHANGE_ROLE` ("fallback") and invoke `setModelWithProviderSessionReset()`. They never call `setModelRole` or `setProjectModelRole`. Retry and recovery routing is strictly ephemeral in memory and does NOT persist to disk.

- **Actual Source-Confirmed Mechanisms**:
  1. **Ambiguous `session.setModel` Persistence Routing**: `modelControls.setModel` unconditionally delegated `options.persist: true` to `settings.setModelRole()`, which in `settings.ts` always writes to `~/.omp/agent/config.yml` (global), ignoring `modelRoleStorage: project`.
  2. **Unconditional Project Config Re-serialization**: `#saveProjectNow()` in `settings.ts` unconditionally executed `YAML.stringify` on `setProjectModelRole`, rewriting `.omp/config.yml` and stripping comments even when the value had not changed.
  3. **Model Hub Schema Default Scope Bias**: `modelRoleStorage` defaults to `"global"` in schema. When not explicitly configured in global config, interactive model selection in Model Hub assigns with `targetScope = "global"`, persisting to the user's global configuration.

### 2. Fix Applied
- **`model-controls.ts` & `agent-session.ts`**: Introduced explicit `ModelRolePersistence` (`{ scope: "global" | "project", reason: "EXPLICIT_USER_ROLE_ASSIGNMENT" }`). Removed ambient `modelRoleStorage` scope inference inside `setModel()`. Enforced invariant: `ACTIVE MODEL CHANGE ≠ ROLE PERSISTENCE`.
- **`selector-controller.ts` & `setup-wizard`**: Explicitly pass `targetScope` inside `persistRole`.
- **`settings.ts`**: Capture `loadedSnapshot` before mutation and skip `#writeYamlAtomically` when `Bun.deepEquals(projectSettings, loadedSnapshot)` (enforcing `NO SEMANTIC CHANGE → NO CONFIG FILE WRITE`). Preserves comments and mtime on value-neutral assignments.
- **`settings.ts`**: Added structured audit logging for all role persistence events.

### 3. Regression Coverage
- **Characterization Tests (T1–T13)**: 13/13 PASS (T6, T9, and T10 were verified RED on baseline, now GREEN).
- **50-Cycle Stress Regression**: 50 failure/retry/recovery cycles verified with zero config hash drift (206/206 assertions pass).
- **Phase 9 KAD Integration**: Cross-project isolation and inheritance verified against `/home/amdy/Work` and a neutral side project.
- **Runtime Canary Verification (C1–C7)**: 7/7 PASS using standalone compiled binary `omp-patched-canary` against isolated fixtures.
- **Canonical KAD Test Surface**: 790/790 PASS (0 fail, 0 cancelled, 0 skipped).
- **Diagnostics**: `bin/kad doctor` PASS, `bin/workctl doctor` Healthy, `bin/kad-telemetry validate` 37/37 valid, `gitleaks` clean, `git diff --check` clean.

### 4. Artifacts Delivered
- `OMP_ROUTING_AUTH_ROOT_CAUSE.md` — Complete root cause analysis distinguishing correlation, behavior, and cause.
- `OMP_ROUTING_AUTH_FIX.patch` — Unified 220-line upstreamable patch against OMP 18.0.11.
- `OMP_ROUTING_PERSISTENCE_REGRESSION.md` — Regression receipts, scope matrix, and upstream PR draft.
- `PATCH_DEPLOYMENT_RECEIPT.md` — Complete binary identities, build receipt, runtime canary evidence, and rollback guide.
- `bin/omp-patched-canary` — Standalone compiled patched canary binary.

### 5. Final Verdict
`UPSTREAM_DEFECT_MITIGATED_LOCALLY`

The upstream defect has been completely mitigated via a bounded, tested, and verified local canary binary (`bin/omp-patched-canary`). Stock OMP installation remains untouched. KAD baseline configuration is restored and verified clean. WP-043 is now ready to safely resume upon human authorization.
