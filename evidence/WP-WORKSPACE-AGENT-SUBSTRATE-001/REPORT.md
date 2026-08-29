# WP-WORKSPACE-AGENT-SUBSTRATE-001 REPORT

## VERDICT

PARTIAL: the portable zero-model coordination substrate, registry, work contract, claims, handoff/resume, skills, doctor, and targeted fixtures are implemented and verified. Full acceptance remains partial only because native skill discovery for non-OMP harnesses was not empirically confirmed and upstream Matt revisions are not pinned in the local lock. All reachable implementation, regression, review, and evidence gates pass.

## FIXED POINT

`7f241585d8fb147f566def39d88e0670d1785852` at start. Pre-existing dirty paths were preserved; this work owns only paths listed in the durable task contract.

## WAYFINDER DECISION

The map is `.scratch/WP-WORKSPACE-AGENT-SUBSTRATE-001/map.md`. Research tickets established `.agents/skills/` as canonical, KAD as primary, nested DATA_WORKSPACE and Technopagan as enrolled side projects, a JSON work/claim contract, and paired handoffs. The map's closed ticket index is the architecture pointer.

## WORKSPACE MODEL

Workspace coordinates. Projects authorize. The root registry discovers project roots and instruction entrypoints; project-specific policy is not copied into side projects.

## PROJECT REGISTRY

`.agents/workspace/projects.json` records KAD-PI, DATA_WORKSPACE, Technopagan Netrunner, a DeepSeek reference checkout, and two conservative UNKNOWN paths. UNKNOWN/REFERENCE entries are not mutation-claimable.

## PRIMARY PROJECT

KAD-PI at the workspace root. Authority entrypoints are `PRIME_DIRECTIVE.md`, `CONTEXT.md`, and `docs/adr`.

## SIDE PROJECTS

`data-workspace` and `technopagan-netrunner` are independent nested repositories with observed project-local validation commands. They retain their own authority.

## SKILL INVENTORY

`bin/workctl skills status` inventories `.agents/skills`, `.claude/skills`, and `agent/skills`, reports names and duplicate locations, and declares `.agents/skills` canonical. Legacy duplicate views are read-only/shadowed; no duplicate is silently selected.

## UPSTREAM SKILL UPDATES

Current upstream Matt source was directly read for `code-review`; local skills are treated as trusted installed copies. A safe `skills check-updates` command reports deferred rather than auto-updating. Revision pinning and a full upstream diff remain partial.

## MATT SKILLS

`skills-lock.json` identifies Matt Pockock GitHub provenance for the installed engineering set. No local modifications were made to upstream skill copies in this work.

## SKILL COLLISIONS

Existing `.agents/skills` and `agent/skills` duplicates are explicit collisions with canonical precedence and legacy shadowing in CLI output. Resolution is recorded, not hidden.

## CANONICAL SKILL ROOT

`.agents/skills/`.

## HARNESS COMPATIBILITY

Observed installed versions: Pi 0.84.3, OMP 18.0.10, OpenCode 1.18.23, Codex CLI 0.150.1, Claude Code 2.1.251, Gemini CLI 0.57.0, Antigravity 2.10.0. OMP is configured to discover project skills. Other native Agent Skills root contracts were not evidenced; all use the generic CLI fallback.

## HARNESS ADAPTERS

No adapter was fabricated. `bin/workctl` is the universal fallback. Native adapters remain deferred until a documented local seam is verified.

## GENERIC FALLBACK

`bin/workctl` delegates to `tools/workspace/workctl.mjs` and provides bootstrap, projects, status, next, show, claim, release, transition, handoff, resume, skills status/check-updates, and doctor.

## ROOT AGENTS ENTRYPOINT

`AGENTS.md` contains startup, precedence, safety, and durable-state pointers without embedding KAD doctrine.

## WORK CONTRACT

`.agents/work/WP-WORKSPACE-AGENT-SUBSTRATE-001.json` contains project, fixed point, scope/non-scope, owned paths, capability requirements, authority, validation, evidence, dependencies, and state.

## STATE MACHINE

Implemented states are `PROPOSED`, `READY`, `CLAIMED`, `IN_PROGRESS`, `BLOCKED`, `REVIEW`, `ACCEPTED`, `REJECTED`, and `SUPERSEDED`; `transition` enforces the small transition graph.

## CLAIM SYSTEM

Claims are exclusive JSON files created under a workspace lock plus `wx`. They enforce fixed-point match, project enrollment, task state, and ancestor/descendant owned-path conflicts. Read-only reviews write separate records and do not reserve mutation paths. No auto-steal; doctor reports `STALE_CANDIDATE`.

## HANDOFF

`handoff` writes paired JSON and Markdown state including fixed point, current HEAD, scope, ownership, dirty paths, validation, evidence, blockers, and next action.

## RESUME

`resume` reads the task, project instructions, and handoff without mutating state or requiring execution metadata/chat history.

## CROSS-HARNESS TEST

The targeted test runs claim, handoff, and resume through separate CLI processes with different actor identity and no required harness field.

## CHAT-INDEPENDENCE TEST

Resume is asserted from only fixture registry, task, Git-compatible fixed point, and handoff artifacts; no transcript or execution metadata is loaded.

## PROJECT ISOLATION

Doctor rejects `../` owned paths. Registry marks unknown/reference paths read-only. KAD authority entrypoints are not present in side-project contracts.

## TOOL MANIFEST

`.agents/workspace/tools.json` records observed KAD tools and side-project validation commands with scope, mutation, determinism, authority, and dependencies.

## KAD INTEGRATION

Existing `bin/kad-*`, Librarian, `make verify`, and `make test` are referenced as adapters/tools. No KnowledgePlane, router, or evidence authority was duplicated.

## SIDE-PROJECT INTEGRATION

Only observed validation commands and project-local entrypoints are registered. No side-project files were modified.

## MODEL AGNOSTICISM

Required task fields contain semantic capabilities only. Model identity is absent from the contract and CLI core.

## PROVIDER AGNOSTICISM

No provider is required by work selection, claims, handoff, resume, or doctor.

## HARNESS AGNOSTICISM

Harness identity is observational actor metadata only. Unsupported harnesses call the same CLI.

## TOKENMAXXING

Shared guidance prefers deterministic registry, Git, schemas, tests, and evidence before model inference; it identifies SLOPMAXXING as duplicate discovery, irrelevant context, unnecessary agents/calls, unsupported claims, and decorative reports.

## PON

Coordination uses explicit state transitions and durable records; it does not add a new event framework or polling service.

## STC

Claims carry owner, start, state, owned paths, handoff, and explicit release/transition lifecycle. No invisible indefinite ownership is introduced.

## SECURITY

Path confinement, no auto-steal, no secret fields, no remote update in bootstrap, project enrollment checks, and explicit legacy skill precedence are implemented. The CLI does not expose workspace state through KAD publication.

## TESTS

Passed targeted Node tests: 6/6, including claim cleanup, terminal release protection, active-claim handoff, and unsafe actor rejection. Passed executable smoke commands: bootstrap, projects, status, next, show, skills status, skills check-updates, and doctor. Passed `make verify`, `make test`, and `git diff --check`.

## CODE REVIEW

Two-axis review recorded in `code-review.md`. Standards and Spec both pass after addressing claim lifecycle, path normalization, actor-path safety, CRLF frontmatter, CLI option parsing, and transition bypass findings. The pre-existing external skill frontmatter mismatch remains a doctor warning.

## FILES CHANGED

New owned files are under `AGENTS.md`, `.agents/workspace/`, `.agents/work/`, `.agents/skills/workspace-*`, `bin/workctl`, `tools/workspace/`, and this evidence directory. Existing unrelated dirty paths remain untouched.

## COMMITS

No bounded commit created yet.

## REMAINING PARTIALS

Empirical native discovery probes for non-OMP harnesses and full upstream skill revision/update report remain intentionally deferred. The bounded commit follows after final state transition and evidence refresh.

## NEXT RECOMMENDED WORKPACKAGE

Use the canonical workspace registry and `bin/workctl` fallback from another harness; add native adapters only when a local documented discovery seam is empirically verified.
