---
name: kad-pre-push-checks
description: Use before pushing, force-pushing, marking a workpackage ready for review, or claiming checks pass on a KAD branch — inspect the outgoing diff first, then select the smallest covering check (python check.py, targeted node --test, make verify, kad doctor, kad-isa check all) without reflexively running the full suite.
---

# KAD Pre-Push Checks

Use this skill to run relevant local evidence once before a push or before claiming checks pass. There is no universal local baseline: every behavior change needs the narrowest available test or purpose-built check that would fail for its regression; add broader checks only for surfaces the diff actually reaches. Never reflexively run the full suite.

## Inspect the outgoing change

1. Confirm the checkout, branch, and worktree state.

```sh
git status --short --branch
git rev-parse --show-toplevel
git worktree list
```

2. Establish the diff scope against the integration base. KAD branch topology can fork (worktrees, cascading WPs); verify the base ref from `git branch --show-current`, `git log` ancestry, or worktree state rather than guessing, then:

```sh
git diff --stat <verified-base-ref>..HEAD
git diff --name-only <verified-base-ref>..HEAD
```

Include staged, unstaged, and untracked paths in the assessment of what the combined change can affect.

## Select relevant evidence

- **Tools code (`tools/`):** if the diff reaches `tools/game-stack/`, run `python check.py` there (Rust fmt/clippy/gdparse/gdformat/gdlint + Godot `--check-only` + native replay + headless smoke). For other `tools/` trees, run the owning targeted check.
- **Node tests:** run `node --test <path>` for the specific test file(s) owning the change (e.g. `tools/gaya/test/*.test.mjs`, `tools/kad/test/*.test.mjs`). Name the test file, not a directory, unless the change is cross-cutting.
- **State artifacts (`docs/state/`, `docs/generated/`, projections):** run `node --test docs/state/test/state-artifacts.test.mjs` after any state-artifact touch; it pins the compiled CSA/ISA/projection outputs.
- **Governance and ISA:** run `make verify`, `kad doctor`, or `kad-isa check all` when the diff reaches policies, skills, evidence gates, or ISA/CSA records. `make verify` is the aggregate; `kad doctor` diagnoses local skill/config state; `kad-isa check all` validates ISA records deterministically.
- **Gaya pipeline (`kad-rpg/kad-gaya/`, a separate repo):** run `python -m unittest tests.test_e2e_pipeline -v` there — do not run it from the KAD root, and do not modify `kad-rpg/` in KAD workpackages.
- **Docs, vault, evidence prose:** no suite owns prose; audit per `kad-trim-cot-leakage` when the prose is new, and re-run the state-artifacts test if any `docs/generated/` or projection source changed.
- **OMP config or model-surface changes:** run `omp config get <key>` to confirm effective config; do not print secrets.

Do not manually repeat a passing check merely because a commit or push follows, and do not run unrelated suites to pad evidence.

## Protect history-rewriting pushes

Before a standalone history rewrite, fetch the current remote branch and record its exact OID; publish with `--force-with-lease=<branch>:<observed-oid>` so a concurrent update aborts the push. Raw `--force` is never allowed. After any rewritten push, fetch the live heads again and re-audit review state; commit hashes from before the rewrite are not current evidence.

## Handle failures

If a relevant check fails before an ordinary push, stop and fix or explain the blocker. Do not push and hope CI differs. If a failure looks environment-specific, prove it: record the exact command, failing test, and environment mismatch; confirm the relevant non-environment evidence; prefer fixing cross-environment nondeterminism when the check is required. Never weaken a gate to obtain PASS — report the failure, do not fake it.

## Push procedure

1. Run the selected relevant checks once.
2. Commit normally and inspect any files changed by hooks before continuing.
3. Push normally, or use the exact lease for an authorized rewritten branch.
4. Verify the remote ref matches local `HEAD`.

```sh
git rev-parse HEAD origin/$(git branch --show-current)
```
