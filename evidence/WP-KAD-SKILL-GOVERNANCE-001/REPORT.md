# WP-KAD-SKILL-GOVERNANCE-001 REPORT

## VERDICT

PASS. Deterministic gates pass. The lock doctor reports explicit `LOCAL_DELTA` for adapted execution views and no errors; this is expected provenance state, not untracked drift.

## FIXED POINT

Initial fixed point: `7dded4743a103fa39368ea13bcf679cec37d572b`.
Initial worktree was already dirty in unrelated KAD/wiki, download, and scratch paths. Those paths were not staged or changed by this workpackage.

## UPSTREAM SOURCES

- `harryvondiesel-web/5-persona-advisory-board` at `fd58b80648c399f29b36d31739a0b07d459b43cf`; `SKILL.md` SHA-256 `9c3079e838d92967af5936f99591d9c3908a816d0e49faae9341087f0acc52ae`; MIT.
- `mattpocock/skills` at `6654f6b60cd9d5be8b54c6fafe44346dabeb3b76`; 17 engineering skills tracked individually; MIT.
- Revisions were verified with `git ls-remote HEAD refs/heads/main`.

## SKILL PROVENANCE LOCK

`.agents/workspace/skills.lock.json` records repository, revision, source snapshot, execution path, upstream and execution SHA-256, license, local mode, delta rationale, and verification timestamp for all 18 tracked external skills. `.agents/upstream/` stores the minimal pinned SKILL.md/license snapshots. `node tools/workspace/skill-governance.mjs validate` and `bin/workctl skills doctor` provide deterministic validation and never auto-update instructions.

## FIVE-PERSONA UPSTREAM ANALYSIS

Upstream CRIT, interview-first behavior, shared evidence across five lenses, forced disagreement, advisory boundary, and practical next action were preserved. The local vanilla copy only normalizes the quoted frontmatter name because workctl's parser requires a directory-matching scalar.

## KAD ADVISORY BOARD

`.agents/skills/kad-advisory-board/SKILL.md` is a project-scoped derivative. It keeps CRIT and replaces generic business lenses with Epistemic Integrity, Authority & Safety, Systems & Lifecycle, Economy & Determinism, and Research & Long-Horizon Value. The review artifact records the required five-lens invocation on this architecture decision.

## KAD FIVE LENSES

All five lenses use the same evidence and emit View, Blind spot, and Recommendation. Disagreement is required. Output is advisory and cannot declare human authority, accept evidence, alter trust/policy, or start implementation.

## MATT UPSTREAM BASELINE

Matt's vanilla engineering flow remains: ask-matt → Wayfinder/grilling/research/prototype → to-spec → to-tickets → implement → tdd → code-review, with retro available where useful. The matrix audits all 17 installed upstream engineering skills and lists 19 local extensions separately.

## MATT SKILL MATRIX

See `matt-skill-matrix.json`. Default treatment is VANILLA. Only ask-matt, Wayfinder, and the KAD derivative receive first-pass KAD behavior; existing capability metadata changes are recorded as `VANILLA + CONFIG`.

## VANILLA WORKFLOW PRESERVATION

The explicit routing fixture proves the ordered Wayfinder → to-spec → to-tickets → implement → tdd → code-review path. No Matt skill was replaced wholesale.

## WAYFINDER UPSTREAM

Wayfinder remains a shared decision-map manager and index: destination, decision tickets, fog, frontier, blockers, and map pointers. It remains planning by default and hands off to to-spec rather than executing work.

## WAYFINDER KAD DELTA

The local patch loads `.agents/skill-overlays/wayfinder-kad.md` only for `kad-pi` or explicit opt-in. It requires canonical ask_user for HITL decisions, exactly five generated choices plus one custom choice, records `AUTHOR_DECLARED`, and leaves execution state to workctl.

## ASK-ME 5+1 PROTOCOL

`tools/workspace/decision-protocol.mjs` rejects fewer or more than five generated options, rejects duplicate options, always appends one custom/write-in option, allows one recommendation without selecting it, and preserves exact custom text.

## HUMAN AUTHORITY

An unresolved HITL request cannot resolve without an `ANSWERED` response. The resolver records the selected option, options presented, timestamp, source ticket, consequences, and `AUTHOR_DECLARED`. Model recommendation is not authoritative.

## DECISION MAP

The map stores only a ticket pointer and short gist. Full resolution remains on the decision ticket. Resolved decisions update the map only after human response; unavailable interaction remains blocked.

## WORKCTL SEPARATION

Wayfinder decision state and workctl execution state have separate deterministic update functions and fixtures. A decision does not create an implementation claim; a workctl transition does not rewrite the map.

## PROJECT ISOLATION

KAD policy is restricted to the `kad-pi` project or explicit opt-in. Side projects retain vanilla Matt behavior by default.

## UPDATE / DRIFT MODEL

A future update compares a new upstream snapshot with the locked revision, reports `CURRENT`, `LOCAL_DELTA`, `UPSTREAM_CHANGED`, `UNPINNED`, or `UNKNOWN`, then requires an explicit replay/review/update-lock step. No bootstrap or doctor operation overwrites local customizations.

## TESTS

- Governance fixtures: 9/9 passed.
- Full regression: `make test` completed successfully, including prime directive, librarian, ask_user, kad-lab, workspace governance, and KAD suites.
- Skill doctor: healthy with explicit expected local-delta warnings and no frontmatter issues.

## SECURITY

No provider/model/economic authority, paid spend, secret access, automatic download, shell authority, or cross-project mutation was introduced. Security details are in `security-review.json`.

## CODE REVIEW

Two-axis review was run against the fixed point. Initial concrete reporting defects were corrected; required evidence and vanilla-flow fixture were added. Final review is PASS. See `code-review.md`.

## FILES CHANGED

Implementation commit contains the deterministic protocol/doctor, workctl integration, KAD derivative and overlay, ask-matt/Wayfinder patches, pinned snapshots/lock, and governance tests. Evidence is contained in this directory. Pre-existing dirty paths were not staged.

## COMMITS

- `7f1131f feat(skills): add KAD governance layer`
- Evidence commit follows after this report is written.

## REMAINING SKILLS TO ADAPT

No broad edits in this workpackage. Review individually, defaulting to KEEP VANILLA: ask-matt (completed first pass), grill-with-docs, domain-modeling, research, to-spec, to-tickets, implement, tdd, diagnosing-bugs, codebase-design, code-review, prototype, retro, triage, wizard, resolving-merge-conflicts, and local extensions.

## NEXT RECOMMENDED SKILL WP

Review `ask-matt` and `grill-with-docs` composition together, then separately qualify domain-modeling/research evidence handoff. Do not start a new adaptation until the corresponding vanilla baseline, authority seam, and deterministic acceptance fixture are identified.
