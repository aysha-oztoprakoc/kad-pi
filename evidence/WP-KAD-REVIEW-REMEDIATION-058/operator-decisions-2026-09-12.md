# Operator decisions — 2026-09-12

Eleven decisions taken by the operator in response to the workspace review questionnaire, what each
one produced, and the evidence that it holds. Answers were given as `1A 2A 3A 4B(+repro) 5B 6A 7C
8B+C 9C 10A 11C`.

## 1A — publish the unpushed commits

Pushed to `origin/main` after every decision landed (see the push receipt in the repository history).

## 2A — acceptance is an authority decision

Recorded in `AGENTS.md` (shared contracts) and in the `spec_decisions` of
`WP-KAD-VERIFICATION-APPROVAL-ACCEPTANCE-SEPARATION-048`. Mechanism:
`bin/workctl accept` requires `--authority "<who decided, and on what basis>"` and an
`independent-review*.json` receipt in the evidence target (`tools/workspace/workctl.mjs`); a claim
cannot authorise the transition, and no claim can exist for an item in `REVIEW` because claims are
created in `READY` and `REVIEW → READY` is not a legal transition.

## 3A — delete the PATH shadow

`~/.local/bin/omp` (200,111,584 bytes, `omp/18.1.14`, sha256 `27dd66cb6a2c3fff…`) deleted. It
preceded every mise path in a login shell, so a bare `omp` ran one release behind. Nothing in the
shell profiles or mise config referenced it. A bare `omp` now resolves to mise's build; the launcher
and the preflight already resolved through mise (ADR 0018).

## 4B — drop the superseded staged pin, keep the canary, re-run the defect reproduction

- `.tools/oh-my-pi/v18.0.9` (193,979,592 bytes, sha256 `55304008876a61f4…`) deleted. The preflight
  reports `staged_pin: null` and stays DEGRADED for the retrieval reason only.
- **Reproduction** against stock OMP **18.1.18** (`mise which omp`), running the project's own suite
  with `CANARY_BIN` pointed at it:
  `CANARY_BIN=$(mise which omp) node scripts/runtime-canary-suite.mjs` → **C2 (config read produces
  zero mutation) PASS, C3 (value-neutral operation preserves mtime, SHA256 and comments) PASS**, C1
  FAIL by design (it pins the canary's identity), every other check PASS. The mutation behaviour the
  P03 patch exists to prevent **does not reproduce** on 18.1.18.
- The suite itself was asserting the superseded pin: C4 compared the launcher's output against the
  literal `omp/18.0.11`, and C6 asserted a digest refusal the launcher was never asked to perform
  (the gate is opt-in for non-canary binaries). Both now test the contract: C4 compares against the
  binary the launcher actually dispatches, C4b covers strict-digest acceptance, C6 sets
  `OMP_STRICT_DIGEST=1`. Result: **9/9 PASS**, and 8/9 against stock (only the identity check fails).

## 5B — retire `wiki/` by substituting its live inputs

Done on 2026-09-12. `wiki/` had three kinds of content, and each got a different treatment:

1. **Live inputs** (read by code at runtime) moved inside the repository:
   - `wiki/synthetic/` → **`.agents/knowledge/synthetic/`** — the librarian's `TAXONOMY.json`,
     `CATALOG.json` and `RETRIEVAL_INDEX.jsonl`, plus the synthetic documents they index.
   - the remaining root documents (including the two the curated allowlist names as sources) →
     **`.agents/knowledge/`**, keeping the old layout so the move is one rule: `wiki/X` →
     `.agents/knowledge/X`. Their internal cross-references and the corpus' own path fields were
     rewritten the same way; the librarian's `verify` step inside `make verify` passes again (28
     documents, 32 cards, 23 concepts, 0 errors).
   - `wiki/generated/` → **`docs/generated/`** — the canonical projection
     (`bin/kad-knowledge rebuild`) and the knowledge plane, both regenerable outputs; the
     publication pipeline and the interface server now read them there.
   - `wiki/research/CATALOG.json` → **`docs/research/CATALOG.json`** — the research corpus store the
     research CLI loads and appends to.
2. **Already preserved before deletion.** `vault/90_Derived/KnowledgePlane/migration-manifest.json`
   records all **75** files of the tree with their classification (12 ARCHIVE, 44 DERIVED_ONLY, 8
   MIGRATE_CANONICAL, 11 REVIEW_REQUIRED) and destinations in the wiki of record
   (`.ai-memory/wiki/01a090eb-…/`). Every one of the 75 destinations was verified present in the
   record **before** `wiki/` was removed (`missing=0`), so the retirement loses no content: the
   record keeps the historical copies, and the working tree keeps what code actually reads.
3. **Retired.** The tree itself is gone; `P7` in `WP-KAD-REVIEW-REMEDIATION-058` moves from PARTIAL
   to RESOLVED, and the deviation note that recorded the blocker is replaced by its resolution.

### The prune (2026-09-12, after the migration)

The migration parked 56 files under the vault's `LegacyWiki` trees — 44 regenerable projections
(`90_Derived/LegacyWiki/generated/…`) and 12 synthetic copies (`99_Archive/LegacyWiki/synthetic/…`).
Both classes have a live home now, so they were pruned:

- `tools/kad/wiki/migration.mjs` grew `pruneLegacyCopies()`. It removes a copy **only** where its
  survivor exists — `docs/generated/<old_path without the generated/ prefix>` for `DERIVED_ONLY`,
  `.agents/knowledge/<old_path>` for `ARCHIVE` — records `PRUNED` with the removed hash and the
  survivor path per entry, and removes each `LegacyWiki` directory once nothing is left in it. A
  copy without a survivor is refused, never deleted: the guard is the operation.
- Run against the wiki of record (`.ai-memory/vault-path`): **56 pruned, 0 refused**, both
  directories removed, prune block recorded in `migration-manifest.json`.
- `bin/kad-memory publish` regenerated the committed mirror with **0 drift**, so `vault/` lost the
  same 56 files and picked up the record's current projections and session pages.

The copies were safe to drop because they were duplicates, not originals: all 12 synthetic files
have live counterparts in `.agents/knowledge/synthetic/`, and the 44 projections are regenerable
(`bin/kad-knowledge rebuild`), 37 of them already stale against the manifest's recorded hash
because the projection was rebuilt after the archive was taken.


## 6A — keep project-scoped model roles, and make the mismatch fixable

`modelRoleStorage: project` stays: the cascade is versioned and shared by every harness in this
directory. OMP writes role changes into the tracked `.omp/config.yml`, so the matrix goes stale and
the suite says so — `make models-sync` re-syncs the rows the repository declares and re-renders the
markdown view.

## 7C — split the wait profiles

`bin/omp-kad` gained `--unattended`, which selects `.state/omp-kad/unattended` and installs
`config/omp-unattended.yml` as that profile's agent-dir config. Interactive keeps
`retry.waitForUsageReset: true`; unattended takes `false` and fails fast.

**Finding while implementing it.** The launcher redirects `PI_CODING_AGENT_DIR`, so the
machine-global agent config (`~/.omp/agent/config.yml`, which sets `waitForUsageReset: true`) is
**not read on KAD runs** — KAD had been running with the built-in default (`false`), the opposite of
what ADR 0019 recorded for the ambient flow, and the setting that decided it lived outside the
repository. Both profiles now declare their posture in-repo. Measured:

```
$ PI_CODING_AGENT_DIR=.state/omp-kad/agent      omp config get retry.waitForUsageReset  -> true
$ PI_CODING_AGENT_DIR=.state/omp-kad/unattended omp config get retry.waitForUsageReset  -> false
```

`tools/kad/test/launcher-profiles.test.mjs` (4 tests) pins the wiring; ADR 0019 carries the
amendment.

## 8B+C — declare the matrix baseline and its skew

`docs/state/OMP_SETTINGS_COMPATIBILITY_MATRIX.json` gained a `baseline` block (declared OMP version,
source revision, observed runtime, the skew note naming `retry.waitForUsageReset` as the
unclassified setting that now decides the launcher profiles, and the re-capture procedure). The
markdown companion is now *rendered* from the JSON by `make models-sync` — it had drifted to stating
`retry.maxDelayMs: 300000` and `retry.usageReservePct: 10` long after the JSON said `0` and `5`. Two
new tests: the baseline must declare itself, and the declared runtime must still be the observed one
(so running a newer harness fails `npm test` until `make models-sync` or a re-capture).

## 9C — declare local retrieval on demand

`config/omp-steady-state.json` declares `local_retrieval.mode: "on-demand"`. The preflight now
reports `degraded_causes` and the gate prints the reason it is degraded; the intended state reads as
`LOCAL_RETRIEVAL_ON_DEMAND` while a misdeclared or unowned role still reports
`LOCAL_RETRIEVAL_UNAVAILABLE` (`intended: false`). Status semantics are unchanged: DEGRADED stays
DEGRADED, BLOCKED still fails `make verify`.

## 10A — guard the frozen bundle

`kad-rpg/kad-gaya/tests/test_bundle_integrity.py`: every digest in `manifest.json["sha256"]` must
match, the file set must be exactly the manifest's keys plus `manifest.json`, and the counters the
layout makes checkable must agree. Verified by mutation — appending one byte to a copy of
`IMPORT.txt` fails `test_01` with the expected and actual digests — and the frozen bundle is
untouched. `kad-rpg` suite: 80 tests OK.

## 11C — exclude the machine-appended journal from the dirty count

`tools/kad/csa-refresh.mjs` declares `MACHINE_APPENDED = ['evidence/WP-KAD-002/causal-journal.jsonl']`
and computes the CSA's repository block: `dirty_paths` counts only what a human has to review, and
`dirty_paths_excluded` names what was excluded, so the exclusion is declared rather than silent.
`make csa` refreshes both the JSON and the markdown (every rewritten field is asserted to have
matched, so the tool cannot quietly update nothing). The CSA previously had no committed refresher at
all — every refresh was hand-written Python, which is how it came to name a commit six commits behind
with 466 fewer dirty paths while every reader treated it as live.
