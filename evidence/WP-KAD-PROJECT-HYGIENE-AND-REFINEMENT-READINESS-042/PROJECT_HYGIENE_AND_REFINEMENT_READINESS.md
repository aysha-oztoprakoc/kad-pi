# PROJECT HYGIENE AND REFINEMENT-READINESS — KAD-PI

## WORKPACKAGE
`WP-KAD-PROJECT-HYGIENE-AND-REFINEMENT-READINESS-042`

## IDENTIFIER
Selected by deterministic namespace collision scan across workctl, `.agents/work/`, `evidence/`, `docs/state/`, `docs/adr/`, `docs/architecture/`, `vault/`, `tools/`, and repository references. Scanned `WP-KAD-033`…`WP-KAD-042`: **all free**. `041` occupied by the accepted WP-041 baseline. `032R` exists as an evidence sub-identity of `WP-KAD-GOVERNANCE-GATES-032` (no work item). No identifier renamed.

## BASELINE
- Repository root: `/home/amdy/Work`
- Branch: `main`
- Local HEAD: `6077630598980c7876395ef80a07e047d61824a6`
- Remote: `origin` = `https://github.com/aysha-oztoprakoc/kad-pi.git`; remote HEAD = `6077630598980c7876395ef80a07e047d61824a6`
- Divergence: `0 ahead / 0 behind` (verified after `git fetch origin --prune`)
- Stash: none. Worktrees: none (single, at root). Tags: none.
- WP-041 accepted baseline artifacts (`docs/state/CSA_KAD_PI_CURRENT.*`, `CSA_ISA_GAP.*`, `OMP_SETTINGS_COMPATIBILITY_MATRIX.*`, `MODEL_ROUTING_DECISION.md`, `SKILL_SEMANTIC_DISPOSITION.md`, `evidence/WP-KAD-OMP-METAHARNESS-REFACTOR-041/*`) present and unchanged at HEAD.

## POSTURE
`READ_ONLY_HYGIENE_RECONCILIATION` → `HYGIENE_PLAN` → `BOUNDED_MAINTENANCE_MUTATION`. All reconnaissance deterministic; every mutation below carries evidence, bounded scope, verification, and rollback.

---

# VERDICT

```text
REFINEMENT_READY_WITH_KNOWN_DEFERRED_ITEMS
```

Repository is coherent, tests are green (781/781), accepted baseline intact, every dirty path has known owner/authority/lifecycle, and unknown residue is zero. Deferred items are policy/lifecycle decisions that belong to the human and to successors — not hygiene defects.

---

# 1. Repository Hygiene

## 1.1 Remote relationship — HEALTHY
`main` == `origin/main` == remote HEAD `6077630`. Freshly verified after fetch. No push/pull needed.

## 1.2 Dirty state — every path classified (see §11 and the action ledger)

| Path | State | Class | Action |
|---|---|---|---|
| `.omp/config.yml` | M | RUNTIME_EFFECTIVE / POLICY_CONSISTENT | HUMAN_DECISION (commit vs revert) |
| `evidence/WP-KAD-002/causal-journal.jsonl` | M | EVIDENCE (append-only, runtime-written) | COMMIT (M1) |
| `evidence/WP-KAD-COMPUTE-FABRIC-EXPERIMENTAL-PROBE-021/test-receipts/probe-journal.jsonl` | M | DERIVED_REGENERABLE (hash-identical) | COMMIT (M1) |
| `skills-lock.json` | M | UNRECONCILED_SKILL_STATE | ROUTE_TO_SUCCESSOR (no mutation) |
| `vault/90_Derived/Projections/isa-aesthetic.json` | M | DERIVED_REGENERABLE | COMMIT (M1) |
| `vault/90_Derived/Projections/isa-compute-fabric.json` | M | DERIVED_REGENERABLE | COMMIT (M1) |
| `vault/90_Derived/Projections/isa-registry.json` | M | DERIVED_REGENERABLE | COMMIT (M1) |
| `.agents/skills/system-atlas/` | ?? | UNRECONCILED_SKILL_STATE | ROUTE_TO_SUCCESSOR (no mutation) |
| `.agents/telemetry/` | ?? | RUNTIME_STATE (derived, backfill-regenerable) | HUMAN_DECISION (ignore vs commit) |
| `.agents/work/EXP-KAD-OFFLINE-SURVIVAL-001-R1.json` | ?? | LEDGER_RECORD | COMMIT (M1) |
| `.agents/work/claims/EXP-KAD-OFFLINE-SURVIVAL-001-R1.json` | ?? | LEDGER_RECORD | COMMIT (M1) |
| `.tmp/` | ?? | TEMPORARY (test scratch) | IGNORE_RULE `.tmp/` (M2) |
| `evidence/EXP-KAD-OFFLINE-SURVIVAL-001/` | ?? | EVIDENCE (canonical experiment record) | COMMIT (M1) |

Ignored inventory (29 top-level `!!` entries) reviewed: all intentional and pre-existing (workspace projects, build artifacts, `.tools/oh-my-pi`, `.state/omp-kad`, `.models/`, env/secrets, scratch, external CLI binaries, `.obsidian/`). No new hiding introduced except the documented `.tmp/` rule (M2).

# 2. Work / Claims Hygiene

- workctl inventory: **40 work items** — 33 `ACCEPTED`, 6 `REVIEW` (`WP-KAD-SOFIA-V3-CANONICAL-DASHBOARD-013`, `WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015`, `WP-KAD-GENERALIZED-IDEAL-STATE-ARTIFACT-020`, `WP-KAD-COMPUTE-FABRIC-EXPERIMENTAL-PROBE-021`, `WP-KAD-CANONICAL-PROJECTION-SYNCHRONIZATION-011`, `WP-KAD-CANONICAL-STATE-RECONCILIATION-010-R1`), 1 `READY` (`EXP-KAD-OFFLINE-SURVIVAL-001-R1`).
- **All 40 claims released** (`active: false`); **zero active mutating claims** — no stale claim can unexpectedly authorize work. `workctl doctor` healthy.
- ACCEPTED items agree with git: WP-041 transitioned to ACCEPTED at HEAD (`6077630`); all other work-item records tracked and clean.
- 6 `REVIEW` items are executed with committed evidence and released claims; lifecycle awaits acceptance authority → **HUMAN_DECISION** (§13).
- `EXP-KAD-OFFLINE-SURVIVAL-001-R1`: `READY`, priority 1, fixed_point `15483b6c`, scope `evidence/EXP-KAD-OFFLINE-SURVIVAL-001/`. Claim released 2026-08-30T22:50:50Z. Experiment is **BLOCKED on human authorization**; no network mutation ever executed. Records + evidence committed in M1; experiment status unchanged.
- Ledger gaps: `WP-KAD-RESEARCH-ZOTERO-005` has no evidence dir (minor); `WP-KAD-GOVERNANCE-AUTHORIZATION-SEMANTICS-032R` evidence dir exists as sub-identity of 032 (accepted).

# 3. Configuration Hygiene

Project `.omp/config.yml` fully read; `.omp/models.yml` declares only localhost STC-owned endpoints (world :5001, qwen :5002, no credentials). Effective project settings: memory/autolearn/contextPromotion off, advisor off, compaction on, skills on, openrouter disabled, task agent model overrides per KAD roles.

- `.omp/config.yml` dirty change: `modelRoles.default` `google-antigravity/gemini-3.7-flash:high` → `opencode-go/deepseek-v4-flash:high`. mtime 2026-09-01T20:36:33Z, 5.5 min after WP-041 claim release (20:30:52Z). Directionally consistent with accepted `MODEL_ROUTING_DECISION.md` (bootstrap/canary: role `kad-builder` → `opencode-go/deepseek-v4-flash`; bindings are runtime routing decisions, not architectural identity). The current session itself runs `opencode-go/deepseek-v4-flash`. Not part of any committed baseline → **HUMAN_DECISION**.
- Global `~/.omp/agent/config.yml` diverges from project: `secrets.enabled: true`, `autolearn.enabled: true`, `compaction.enabled: false`, `modelRoles.advisor: gemini-3.7-flash:high`, broad webSearch provider list. WP-041 already flagged global-config divergence for human. Project config wins for project sessions; `secrets.enabled` effective value is `true` → REQUIRES_HUMAN_POLICY.
- Accepted matrix rows (WP-041 baseline, not rebuilt): `tools.approvalMode` effective `yolo` — REQUIRES_HUMAN_POLICY; `secrets.enabled` effective `true` — REQUIRES_HUMAN_POLICY; `ttsr.*` enabled — KAD_RESTRICTED (FAIL compat); `recap.*` enabled — KAD_RESTRICTED (FAIL compat).

# 4. Generated Artifact Hygiene

| Artifact | Generator | Reproducible | Current | Action |
|---|---|---|---|---|
| `vault/90_Derived/Projections/isa-*.json` ×3 | `tools/kad/isa.mjs` (committed regen history: 030R, 041) | yes (diff = `generated_at` only) | regen 2026-09-01T20:26:49Z | COMMIT (M1) |
| `.../probe-journal.jsonl` | `tools/kad/compute/evidence-recorder.mjs` | yes — receipts byte-identical (`abf8ebfd…`, `ba062385…`), chain verified (seq2.previous_hash == seq1.receipt_hash) | regenerated at 20:26:49Z and again 20:48:59Z by a runtime probe | COMMIT (M1) |
| `evidence/WP-KAD-002/causal-journal.jsonl` | WP-002 demo turns (causal machinery); appended by runtime probes (`kad-runtime-status` exercised it at 20:49:00Z during this workpackage) | append-only; hash-chain intact | 144 lines | COMMIT (M1) |
| `.agents/telemetry/` (37 outcome records) | `kad-telemetry backfill`, single snapshot 2026-08-30T21:51:28Z | yes | stale snapshot | HUMAN_DECISION (ignore vs commit) |
| `.tmp/test-intent-fidelity/` | `tools/kad/test/intent-fidelity.test.mjs` (tamper probe) | regenerated by tests | scratch | IGNORE_RULE `.tmp/` (M2) |

Projection files carry only `generated_at`, no `generator`/`version` field — improvement candidate routed to projection tooling successor.

# 5. Skills / Plugin Hygiene

- 49 skills tracked in `.agents/skills/` (project). Exactly one untracked: `.agents/skills/system-atlas/` (installed 2026-08-31, source `inkboard/system-atlas`).

- **Two tracked lockfiles with different schemas and authority**:
  - `.agents/workspace/skills.lock.json` — KAD skill-governance lock (19 entries, `skills` as array; the schema `tools/workspace/skill-governance.mjs` and `workctl skills` actually validate). 16 of 19 entries report `LOCAL_DELTA` vs installed content. This lockfile drives the doctor warnings.
  - `skills-lock.json` (repo root) — OMP skill-installer lock (38 entries, `skills` as map with `source`/`skillPath`/`computedHash`). Dirty: `system-atlas` entry added 2026-08-31; **computedHash `ca484cdd…` does not match installed `SKILL.md` sha256 `18c89dcf…`**.
- 10 tracked KAD skills (`kad-*`, `workspace-*`, `skill-governance`, `human-runbook`) are registered in **neither** lockfile.
- No global lockfile exists (`~/.agents` has no `skills*.json`); global skill dir (`~/.agents/skills/`) holds additional skills (deepapi, diagnose-crash, find-skills, omarchy, …) — project/global split is directory-based, not lockfile-governed.
- Plugin references clean: `.omp/controllers.json` (no external plugin paths), `.omp/mcp.json` (context7 MCP only), `.omp/extensions/` present.
- Per WP-041 boundary: no executable skill rationalization performed. All findings (dual-lockfile authority, hash mismatch, LOCAL_DELTA, unregistered skills) classified and routed to successor (§14).
# 6. Evidence / Knowledge Hygiene

- 78 evidence directories. Work↔evidence cross-check: every accepted/review WP has an evidence dir except `WP-KAD-RESEARCH-ZOTERO-005` (minor gap, no action). Legacy/archival dirs (pre-workctl era) intentionally consolidated in `8f16c1a`.
- EXP evidence: `status=BLOCKED`, `offline_phase_entered=false`, `fault_injection=NOT_ATTEMPTED`, 47 evidence files, receipts manifest consistent; R3 authorization preflight PASS (hard stop before execution); R4 C5 PASS (`ROUTE_CLEAN`, `RUNTIME_READY`, `ROLLBACK_ASSURED`); LIVE A001/A002 `ABORTED_SAFE`; no route deletion, interface change, or privileged mutation performed anywhere in the chain. Accepted as canonical experiment record.
- No broken commit references found; WP-041 extraction receipt references `b8ce33a5` (ancestor of HEAD, valid).
- `docs/state/` inventory: `CSA_KAD_PI_CURRENT.{md,json}`, `CSA_ISA_GAP.{md,json}`, `OMP_SETTINGS_COMPATIBILITY_MATRIX.{md,json}`, `MODEL_ROUTING_DECISION.md`, `SKILL_SEMANTIC_DISPOSITION.md`, `schema/*` (4 schemas), `test/state-artifacts.test.mjs` — all present; WP-041 baseline valid.
- ADRs reviewed: 0004 (model-agnostic control plane), 0005 (deterministic-first), 0011 (OMP toolchain architecture), 0013 (aesthetic directive), 0014 (ISA compute fabric). No ADR conflict with observed state.
- Vault/OpenViking: not mutated; projection surface coherent (Phase D).

# 7. Tooling Hygiene

- `bin/kad-doctor`: **PASS** — extension registered, workctl clean, economic policy active (paidAuthorized false), observatory journal valid (12 events), readiness gate active (UNKNOWN_DOMINATED, canary not authorized — expected), outcome telemetry valid (37 records), governance gates active (17 classes), trivy 0.74.0, gitleaks 8.30.1, amdgpu_top 0.11.5.
- `bin/workctl doctor`: **healthy** (16 skill LOCAL_DELTA warnings — routed, §5).
- `bin/kad` / `bin/kad-governance` / `bin/kad-telemetry` / `bin/kad-runtime-status`: entrypoints + help + version behavior verified.
- Tooling note (no defect action): `kad-telemetry validate <dir>` returned `total: 0` at the live telemetry path while `kad-doctor` validates the same 37 records — path-semantics mismatch between commands; routed to tooling successor.
- No tool rewritten. No style refactor.

# 8. Runtime / Compute Health

| Surface | State | Evidence |
|---|---|---|
| world endpoint `127.0.0.1:5001` (Stheno v3.2) | AVAILABLE | `kad-runtime-status`: state AVAILABLE, 23ms, `koboldcpp/L3-8B-Stheno-v3.2-Q4_K_M` loaded |
| local_retrieval `127.0.0.1:5002` (Qwen) | UNAVAILABLE | no response on `/v1/models`; NOT_REQUIRED for current routing |
| GPU RX 9060 XT | AVAILABLE (idle) | amdgpu_top: all blocks 0%; ROCm userspace version null (driver-level only) |
| Economic router | DEGRADED (accepted) | `kad status`: `NO_ELIGIBLE_LANE`, paid_authorized false — local-first policy state, not a defect |
| CPU/RAM | healthy (no anomaly observed during recon) | — |

No mutation of TELL, systemd, firewall, drivers, ROCm, or privileged state performed.

# 9. Security / Authority Findings

- `tools.approvalMode` effective `yolo`: **REQUIRES_HUMAN_POLICY** (accepted matrix; already flagged by WP-041).
- `secrets.enabled` effective `true` (global config): **REQUIRES_HUMAN_POLICY**.
- `context7` npx (network-capable tool) + global-config divergence: already flagged by WP-041 for human.
- No secrets found in prompts/skills/vault/evidence/git surfaces (doctor: secret handling clean; gitleaks 8.30.1 present in toolchain).
- No security gate weakened by this workpackage. All security-sensitive deviations explicitly classified and routed (§13–14).

# 10. Test & Verification Results

- `npm test` (`node --test tools/kad/test/*.test.mjs tools/workspace/workctl.test.mjs`): **781 tests, 781 pass, 0 fail, 0 skipped** (10.3s, exit 0). Includes WP-002 E2E vertical slice, workctl lifecycle, governance, workload-contract and state-artifact suites.
- `git diff --check`: clean (run as part of M1 verification).
- `bin/kad-doctor`: PASS; `bin/workctl doctor`: healthy.
- No new maintenance guard added (none demonstrated RED-required this pass; guards are successor material).

Both mutations below were published in a single local commit `affe828` (parent `6077630`, not pushed — push requires explicit publication authorization). The `.gitignore` M2 content inside the commit contains the corrected rules (`.scratch/` preserved, `.tmp/` added, no duplicates; `git check-ignore` verified).

## M1 — Commit reconciliation of evidence + ledger residue (COMMIT_ACCEPTED)
Purpose: publish WP-041 verification residue (regenerated deterministic projections/journals) and EXP offline-survival ledger/evidence records so tracked state matches the work ledger and evidence surface.
Files:
- `vault/90_Derived/Projections/isa-aesthetic.json`
- `vault/90_Derived/Projections/isa-compute-fabric.json`
- `vault/90_Derived/Projections/isa-registry.json`
- `evidence/WP-KAD-002/causal-journal.jsonl`
- `evidence/WP-KAD-COMPUTE-FABRIC-EXPERIMENTAL-PROBE-021/test-receipts/probe-journal.jsonl`
- `evidence/EXP-KAD-OFFLINE-SURVIVAL-001/` (47 files)
- `.agents/work/EXP-KAD-OFFLINE-SURVIVAL-001-R1.json`
- `.agents/work/claims/EXP-KAD-OFFLINE-SURVIVAL-001-R1.json`
Evidence: diffs are `generated_at`/timestamp-only or append-only journal entries; probe receipt hashes byte-identical across regenerations (reproducibility proven); experiment evidence self-consistent (`BLOCKED`, `NOT_ATTEMPTED`, receipts manifest); all other work items/claims tracked by convention. No code, config, or policy changed.
Verification: `git diff --check`; `git status` clean except documented items; test suite unaffected (no source change).
Rollback: `git revert <commit>`.

## M2 — Documented ignore rule for test scratch (IGNORE_RULE_CANDIDATE)
Purpose: `.tmp/` is runtime test scratch (writer `tools/kad/test/intent-fidelity.test.mjs`, tamper probe, zero canonical value, regenerated on every test run); matches existing ignored scratch pattern (`.scratch/`, `build/`).
File: `.gitignore` — appended `.tmp/`.
Verification: `git status` no longer shows `.tmp/`; content untouched on disk.
Rollback: remove the line.

No other mutation. Nothing deleted, no resets, no stash, no history rewrite, no force push, no global config change, no security setting change.

# 12. Items Intentionally Left Untouched

| Item | Why it remains |
|---|---|
| `.omp/config.yml` (default model) | Routing binding change; consistent with accepted decision but not itself accepted baseline. Commit/revert is a human call. |
| `skills-lock.json` + `.agents/skills/system-atlas/` | Hash semantics + LOCAL_DELTA + install ownership belong to the executable skill rationalization successor; WP-041 boundary forbids skill mutation here. |
| `.agents/telemetry/` | Live runtime store, backfill-regenerable; ignore-vs-commit is an evidence-retention policy choice. |
| 6 REVIEW work items | Lifecycle acceptance is human authority. |
| `docs/state/*` accepted baseline | No demonstrated defect; unchanged per doctrine. |
| Global `~/.omp/agent/config.yml` | Global config; human policy domain (WP-041 flagged). |
| qwen endpoint / GPU / network / TELL | No authorization to mutate privileged/system state; runtime left as found. |
| Legacy/archival evidence dirs | Intentionally consolidated history (`8f16c1a`); deleting would destroy provenance. |

# 13. Human Decisions Required

1. `.omp/config.yml` default model `opencode-go/deepseek-v4-flash:high` — commit as project routing baseline, or revert to `gemini-3.7-flash:high`? (Evidence: MODEL_ROUTING_DECISION canary direction; current session routing; mtime post-WP-041.)
2. `skills-lock.json` + `system-atlas` — complete the install (regenerate hash/commit), remove it, or defer to skill rationalization successor?
3. `.agents/telemetry/` — commit as evidence snapshot, add ignore rule, or leave unversioned?
4. 6 REVIEW work items (013, 015, 020, 021, 011, 010-R1) — transition to ACCEPTED, or retain REVIEW?
5. `tools.approvalMode` (`yolo`) and `secrets.enabled` (`true`) — accept current values as policy, or change (security policy decision; matrix marks REQUIRES_HUMAN_POLICY).
6. Global config divergence (`~/.omp/agent/config.yml`: autolearn on, compaction off, advisor binding, broad search providers) — reconcile or accept per-session.
7. `EXP-KAD-OFFLINE-SURVIVAL-001-R1` — authorize R5 continuation (network fault injection requires HUMAN_AUTHORIZATION_RECEIPT_V2), or close/archive the experiment.

# 14. Successor Work Candidates

No successor WP numbers assigned (fresh collision scan required at assignment time). Candidates, in evidence-derived priority:
1. **EXECUTABLE SKILL RATIONALIZATION** — lockfile hash verification (system-atlas mismatch + 16 LOCAL_DELTA), project/global skill split policy, lockfile semantics.
2. **SECURITY POLICY RESOLUTION** — approvalMode, secrets.enabled, context7 npx, global-config authority.
3. **MODEL / ROLE EMPIRICAL ROUTING FABRIC** — routing decision expiry, default-role binding acceptance, empirical Role×Model benchmarks.
4. **PROJECTION / TOOLING REFINEMENT** — generator name/version in projections, `kad-telemetry validate` path semantics, ZOTERO-005 evidence gap.
5. **WORKCTL LIFECYCLE COMPLETION** — REVIEW acceptances, EXP continuation, telemetry retention policy.

# 15. Refinement-Readiness Proof

Acceptance-gate checklist (all checked against fresh evidence):

- [x] current repo + remote relationship freshly verified (fetch + rev-list + ls-remote)
- [x] no unexplained dirty tracked files (all 8 classified; 5 committed in M1, 1 human-decision, 1 successor, 1 ignore-rule)
- [x] no unexplained untracked project files (all classified; EXP + ledger committed, telemetry human-decision, system-atlas successor, `.tmp/` ignored)
- [x] all remaining residue has ownership/classification (action ledger)
- [x] no stale mutating claim can unexpectedly authorize work (0 active claims)
- [x] workctl lifecycle agrees with accepted/published work (33 ACCEPTED committed; 6 REVIEW documented; EXP READY documented)
- [x] accepted WP-041 baseline remains valid (HEAD unchanged, artifacts intact, extraction receipt references ancestor commit)
- [x] generated projections have known generators/authority (isa.mjs / evidence-recorder.mjs / causal machinery)
- [x] lockfiles and installed skill state reconciled — **reported, not fixed** (successor; boundary respected)
- [x] OMP project/global/effective configuration understood
- [x] security-sensitive deviations explicitly classified (approvalMode, secrets, context7, global config)
- [x] core KAD tooling passes doctor/validation (kad-doctor PASS, workctl doctor healthy)
- [x] deterministic regression suite green (781/781)
- [x] no source/projection reproducibility failures (probe receipts byte-identical across regenerations)
- [x] runtime-critical dependencies have known health (world AVAILABLE; qwen down but not required; GPU idle)
- [x] no secrets exposed
- [x] no destructive maintenance action remains implicit (nothing deleted; M1/M2 fully specified with rollback)
- [x] unresolved policy choices surfaced to human (§13)
- [x] successor work separated from hygiene work (§14)

Final principle honored: accumulated state transformed to known → owned → reproducible → verified → maintainable state. The correct amount of mutation was applied — no cosmetic cleanup, no feature work.
