# WP-DSH-SNAPSHOT-ADOPTION — Implementation Handoff

**Executor model**: `opencode-go/deepseek-v4-flash:high` (spawn with high thinking).
**Repo root**: `/home/amdy/Work` (KAD-PI main repo, branch `main`, fixed point `3a0b5b0`).
**Machine claim**: `.agents/work/WP-DSH-SNAPSHOT-ADOPTION.json`.

This is a self-contained plan. You do not have the parent conversation; everything you need is
here or reachable at the quoted paths. Work in this order: A → B → C. Commit nothing unless told
otherwise; the parent owns the commit boundary.

## Mission

Two concrete adoptions plus a repo analysis, all sourced from the DeepSeek Harness checkout that
already sits in this workspace (`tries/deepseek-harness-lab/`):

- **A.** Port three DeepSeek Harness skill patterns into the KAD skill corpus as KAD-flavored
  variants (avoid reinventing the wheel — adapt upstream's tested structure).
- **B.** Wire the deterministic local `snapcompact` compaction method so it is primary with local
  fallbacks.
- **C.** Analyze the repo (ISA, CSA, workpackages, plugin ecosystem) and write a ranked
  "next steps" report.

## Hard constraints (KAD invariants — read `.omp/RULES.md` and `PRIME_DIRECTIVE.md` first)

1. **Do not mutate `tries/deepseek-harness-lab/`.** It is upstream reference material, read-only.
2. **Do not weaken a gate to obtain PASS.** If a validation fails, report it; do not fake it.
3. **No paid spend, no secrets, no model-routing / memory / fallback-cascade changes.** This WP
   only adds skills, edits one config key, and writes a report.
4. **Deterministic evidence outranks model judgment.** Every claim in the report must cite a file
   or a command you actually ran.
5. **Do not touch the dual skill lockfiles** (`skills-lock.json`,
   `.agents/workspace/skills.lock.json`) — they are maintained by separate machinery. Skills are
   discovered non-recursively from `.agents/skills/<name>/SKILL.md`; adding directories is enough.

---

## Task A — Port three DSH skills into `.agents/skills/`

### Source of truth (read-only, adapt from these)

```
tries/deepseek-harness-lab/.agents/skills/dsh-trim-cot-leakage/SKILL.md
tries/deepseek-harness-lab/.agents/skills/dsh-archive-agent-notes/SKILL.md
tries/deepseek-harness-lab/.agents/skills/dsh-pre-push-checks/SKILL.md
tries/deepseek-harness-lab/AGENTS.md                      # their engineering conventions
```

Also skim `dsh-code-review`, `dsh-find-simplifications`, and `dsh-prose-standard` for wording
patterns — but only port the three named above.

### KAD skill format (mandatory)

A KAD skill is a directory `.agents/skills/<name>/SKILL.md` with YAML frontmatter. For native OMP
discovery, **`description` is required**. Model this on the existing `.agents/skills/code-review/`
or `.agents/skills/wayfinder/` skill (read one before writing). Frontmatter minimum:

```markdown
---
name: <skill-name>
description: <when to use it, one dense sentence>
---
```

The `description` is what the model matches against; make it triggerable from natural language
("when auditing prose for leaked reasoning", "when freezing or pruning agent notes",
"before pushing or claiming checks pass").

### A1 — `.agents/skills/kad-trim-cot-leakage/SKILL.md`

Adapt `dsh-trim-cot-leakage`. Keep the **one test** verbatim in spirit:

> For every suspect passage: could a reader at HEAD, with no session transcript, PR thread, or
> uncommitted draft, resolve every reference and verify every claim? If no, restate the surviving
> facts from the repository's vantage and delete the rest.

Keep the 8-class taxonomy but **replace every DSH-specific surface with KAD equivalents**:

| DSH surface | KAD equivalent |
|---|---|
| `(decision N)`, `audit C2`, `design §4.7` | `(D1)`, `WP-KAD-*` decision cites, CSA/ISA section numbers, workctl ledger refs |
| "a later PR in this stack" | "a later WP in this DAG", "a follow-up claim" |
| `pnpm`/`doc-sync`/`verify-type-equiv` gates | `python check.py`, `node --test`, `make verify`, `kad doctor`, `kad-isa check all` |
| `docs/`, Agent Notes | `docs/`, `vault/`, `evidence/`, `.agents/`, `tools/` |

Target surfaces to audit (name them explicitly in the skill): `docs/` (esp. `docs/state/`,
`docs/architecture/`, `docs/generated/`), `vault/`, `evidence/` reports, `.agents/`, and comments
in `tools/`. Add the KAD-specific keep rules: issue/WP references, evidence paths, measured bounds
(`(measured: …)`), counterfactual-present pins ("without X, Y happens").

### A2 — `.agents/skills/kad-archive-agent-notes/SKILL.md`

Adapt `dsh-archive-agent-notes`. Keep the core discipline: **notes are frozen when superseded —
never edited as current authority; move to an `archived/<kind>` location and update a manifest.**
Map their "Agent Notes" to KAD's durable-notes surfaces. Check what actually exists before writing
(`.agents/notes/` may be absent; `evidence/`, `docs/state/`, and `vault/` notes are the real
surfaces). If there is no existing KAD note-archiving convention, specify the minimal one the skill
will enforce: triage each note into *superseded → archive (frozen)*, *still-preventing-a-fallback →
keep*, *rejected/no-longer-useful → delete*, and require an updated manifest/link trail.

### A3 — `.agents/skills/kad-pre-push-checks/SKILL.md`

Adapt `dsh-pre-push-checks` to KAD's actual gates. The skill must say: **inspect the outgoing diff
first, then select the smallest covering check — never reflexively run the full suite.** Map to:

- `python check.py` — in `tools/game-stack/` only (Rust fmt/clippy/gdparse/gdformat/gdlint +
  Godot `--check-only` + native replay + headless smoke).
- `node --test <path>` — targeted Node tests (e.g. `tools/gaya/test/*.test.mjs`,
  `tools/kad/test/*.test.mjs`).
- `make verify` / `kad doctor` / `kad-isa check all` — governance and ISA checks.
- `node --test docs/state/test/state-artifacts.test.mjs` — after any state-artifact touch.
- `python -m unittest tests.test_e2e_pipeline -v` — in `kad-rpg/kad-gaya/` (note: separate repo).

Acceptance for A: all three SKILL.md files exist, each has `name` + `description` frontmatter, and
**grep shows zero residual DSH-only identifiers** (`dsh-`, `deepseek-harness`, `pnpm`, `doc-sync`,
`cordis`, `vitest`, `stacked PR`) in the new files. KAD terms (`WP-KAD-`, `check.py`, `kad doctor`)
must appear where sensible.

---

## Task B — Wire deterministic `snapcompact` as primary compaction

Read the current block in `.omp/config.yml` (key `compaction`). It currently has
`methodOrder: [snapcompact]` (single entry, no fallback).

Edit only the `compaction.methodOrder` list so `snapcompact` is first and local methods back it:

```yaml
compaction:
  enabled: true
  methodOrder:
    - snapcompact   # deterministic local bitmap compression (primary, local-first)
    - handoff       # disk handoff
    - shake         # structural shake
    - soft          # last resort
  # leave every other key (thresholdPercent: 70, midTurnEnabled, keepRecentTokens, etc.) untouched
```

Valid method tokens are `remote`, `snapcompact`, `handoff`, `shake`, `soft` (confirm with
`omp config get compaction.methodOrder` output or `omp config list`). **Do not add `remote`** —
KAD is local-first; provider-native compaction is deliberately excluded.

Rationale (record it in your final message): `snapcompact` is deterministic and local, matching
KAD's deterministic-first / local-first invariant; the trailing methods are ordered fallbacks if
the primary cannot produce a usable summary.

Validate:

```bash
omp config get compaction.methodOrder     # must print [snapcompact, handoff, shake, soft]
ruby -ryaml -e 'YAML.load_file(".omp/config.yml")'   # YAML parses; exit 0
```

Note: `snapcompact` rasterization uses the bundled `@oh-my-pi/pi-natives`; do not install the npm
package — it is built into the OMP binary.

---

## Task C — Analyze the repo and write next-steps report

This is the synthesis deliverable. Read these in order and keep provenance for every claim:

1. `docs/architecture/KAD_PI_IDEAL_STATE_V2.md` — the Ideal State Artifact: REQ-KAD-* registry
   (statuses IMPLEMENTED/PARTIAL/NOT_IMPLEMENTED), the gap matrix, experiment register, and the
   successor WP portfolio (WP-KAD-031..040).
2. `docs/state/CSA_KAD_PI_CURRENT.md` + `docs/state/CSA_ISA_GAP.md` — current state and gaps.
3. `docs/generated/progress-state.md` + `docs/generated/progress-state.json` — the projection this
   repo already compiles (workpackages, branches, commits, CSA snapshots, ISA status counts).
4. `vault/90_Derived/Projections/workpackages.json` — the WP export (55 entries).
5. `ls evidence/` — 95+ WP dossiers; reconcile with the projection (the generator already lists
   `EVIDENCE_ONLY` dirs that have no projection entry).

Then write `.scratch/dsh-adoption-next-steps.md` containing:

- **Current trajectory** — one paragraph: where KAD-PI is per the CSA/progress (ISA status counts,
  WP status histogram, branches/worktrees, recent commits).
- **Ranked next steps** — top 5–10, each with: `id`, `what`, `why` (tie to a REQ-KAD-* or a
  CSA gap), `blockers`, `rough scope` (paths), `evidence` (the file/command that supports it).
  Suggested lenses (use what actually applies after your read):
  1. ISA gaps with remediation WPs (`WP-KAD-*`) that are still OPEN — highest-leverage first.
  2. `BLOCKED`/`REVIEW` workpackages needing a human decision (e.g. `EXP-KAD-OFFLINE-SURVIVAL-001-R1`).
  3. Downward-distillation scaffolding (strong models → local models), given the current
     economical two-tier cascade and the goal of training local models later.
  4. Plugin ecosystem adoptions still pending (LSPs: `rust-analyzer-lsp`, `pyright-lsp`,
     `typescript-lsp`; security: `semgrep`, `security-guidance`; workflow: `commit-commands`) —
     recommend which, in what order, with one-line rationale each.
  5. Deeper DSH adoptions worth a future WP (capability-seam re-model of the `kad-*` extensions,
     "model-visible ⟺ logged" invariant, branded IDs, guard/hook bridges).
- **Risks / unknowns** — anything you could not verify and why.

Return a ≤20-line summary in your final message: what changed in A and B, validation results, and
the top 3 next steps from C.

## Working conventions

- Use the `read`, `glob`, `grep`, `edit` tools; never shell `grep`/`rg`/`ls`/`find`.
- Read a file before editing it. Smallest unique `old_string` for edits.
- Do not run the full test suite; run only the targeted validations listed above plus any single
  check the analysis requires.
- `kad-rpg/` is a separate git repo — do not modify it in this WP.

## Acceptance checklist (self-check before you stop)

- [ ] 3 new SKILL.md files present with name+description and zero DSH-only identifiers
- [ ] `.omp/config.yml` compaction.methodOrder = `[snapcompact, handoff, shake, soft]`, YAML valid
- [ ] `omp config get compaction.methodOrder` confirms the array
- [ ] `node --test docs/state/test/state-artifacts.test.mjs` still passes (9/9)
- [ ] `.scratch/dsh-adoption-next-steps.md` exists with ranked, evidence-backed next steps
