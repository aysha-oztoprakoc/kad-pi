# WP-KAD-MATT-WORKFLOW-ADAPTATION-001 REPORT

## VERDICT

**PASS**, with expected `LOCAL_DELTA` warnings from the provenance doctor. No doctor errors, unsafe findings, or failed regression gates remain.

## FIXED POINT

`376daac8c9e395fbdbe123e4b71d08584d78d245` (`2026-08-29` working fixed point). Pre-existing unrelated dirty paths were not staged.

## UPSTREAM BASELINE

Matt skills pinned to `6654f6b60cd9d5be8b54c6fafe44346dabeb3b76`; advisory board pinned to `fd58b80648c399f29b36d31739a0b07d459b43cf`. MIT license files and source hashes are recorded in `.agents/workspace/skills.lock.json`. Upstream content was not replaced.

## WORKFLOW ARCHITECTURE

`idea -> decision -> spec -> ticket -> claim -> implement -> test -> review -> evidence`. Wayfinder owns decisions; `workctl` owns execution state, claims, and handoffs.

## SKILL MATRIX

`ask-matt`, Wayfinder, grilling, domain-modeling, research, prototype, to-spec, to-tickets, implement, TDD, and code-review retain vanilla behavior with small KAD boundary sections. Diagnosing bugs, merge conflict resolution, wizard, and setup remain vanilla.

## ASK-MATT

Routes instead of implementing: strategic decisions to advisory board/Wayfinder; foggy work to Wayfinder; unclear requirements to grill/domain-modeling; missing facts to research; sharp implementation to to-spec/to-tickets/implement/TDD/code-review; hard bugs to diagnosing-bugs.

## WAYFINDER INTEGRATION

The project overlay applies only to `kad-pi` or explicit opt-in. Wayfinder records the decision map and delegates human input to canonical `ask_user`.

## GRILL-WITH-DOCS

Grilling sharpens and records; it does not resolve authority decisions. Unresolved decisions return to Wayfinder.

## DOMAIN-MODELING

Terminology changes are classified as `NEW`, `REFINEMENT`, `CONFLICT`, `SUPERSESSION_CANDIDATE`, or `UNKNOWN`; authority terms do not silently overwrite canonical sources.

## RESEARCH

Research returns cited evidence and truth status. It cannot make a human decision.

## PROTOTYPE

Prototype output remains experimental and outside the production work ledger until a human accepts the resulting decision.

## HUMAN 5+1 DECISIONS

`decision-protocol.mjs` enforces exactly five distinct generated options plus one custom option. `ANSWERED` is required; the selected result is `AUTHOR_DECLARED`; recommendations never override it.

## TO-SPEC

`deriveSpecFromDecision` carries the selected option, decision reference, authority, scope, non-scope, and acceptance into a spec. Unresolved decisions are not silently treated as ready.

## DECISION -> SPEC FIDELITY

Fixture: recommendation `OPTION_2`, human selection `OPTION_4`; observed spec selection remains `OPTION_4`.

## TO-TICKETS

Tickets remain tracer-bullet vertical slices with explicit blockers. Accepted JSON tickets preserve scope, non-scope, owned paths, acceptance criteria, validation, evidence, and authority fields.

## TICKET -> WORKCTL BRIDGE

`bin/workctl import-tickets <file>` and `bin/workctl tickets import <file>` validate and register work items deterministically. Import is idempotent for identical records and rejects conflicts, unknown blockers, unsafe IDs, and model/provider/harness coupling. `workctl next` returns only unblocked `READY` work.

## IMPLEMENT

A builder must claim a mutating work item before owned-path mutation. Claims are exclusive; read-only review claims do not reserve mutation paths. Handoff records fixed point, dirty paths, remaining validation, and next action; resume is chat-independent.

## CLAIM / HANDOFF

Unsafe item IDs are rejected. Claim conflicts resolve project-owned paths to absolute paths. Stale claims cannot be handed off.

## TDD

Vanilla red -> green -> refactor remains the loop. KAD checks are conditional acceptance checks at the same public seams.

## CODE-REVIEW

Two independent axes passed: Standards and Specification. Security review passed with no residual findings. The advisory board did not replace code review.

## ADVISORY BOARD BOUNDARY

The upstream CRIT process was applied to the architecture question. Recommendation: thin project-scoped overlay/composition. It cannot authorize implementation, claims, transitions, handoffs, merges, or releases. The external background provider invocation failed authentication; the local advisory result is recorded as advisory input, not a deterministic gate.

## PROJECT ISOLATION

KAD overlay is available for `kad-pi`, unavailable for an unopted-in side project, and available for an explicitly opted-in side project. No KAD ontology is injected globally.

## MODEL / PROVIDER / HARNESS AGNOSTICISM

Work contracts contain capability and trust requirements, not model, provider, or harness identity. Forbidden coupling keys are rejected. Registration, readiness, claim, handoff, resume, status, doctor, and drift checks are zero-model deterministic operations.

## UPSTREAM UPDATEABILITY

Pinned snapshots, source hashes, execution hashes, local delta descriptions, and a replay procedure are recorded. Future updates compare upstream to the lock, replay the minimal delta, run gates, review, and then update the lock.

## TESTS

`make test` passed. Targeted workflow tests passed: 23 tests across workctl, bridge, and governance; 13 workctl/bridge tests; 10 governance tests. `bin/workctl doctor` is healthy. Skill doctor has no errors and reports explicit expected local deltas. `git diff --check` passed.

## SECURITY

Unsafe work-item IDs, path traversal, relative claim comparison, authority bypass, project isolation, and provider/model/harness coupling were reviewed. Final security review: PASS, no residual findings.

## CODE REVIEW

Standards: PASS. Specification: PASS. Review was against the fixed point above and the archived workpackage specification.

## FILES CHANGED

Implementation: `tools/workspace/workflow-bridge.mjs`, `tools/workspace/decision-protocol.mjs`, `tools/workspace/workctl.mjs`, `tools/workspace/skill-governance.mjs`, and tests. Skills: `ask-matt`, `grill-with-docs`, `domain-modeling`, `research`, `prototype`, `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`; Wayfinder overlay; Makefile. Docs/evidence: `docs/agents/kad-matt-workflow.md` and this evidence package.

## COMMITS

`f3b9e2e feat(skills): adapt Matt workflow to KAD`.

## REMAINING MATT SKILLS

Keep vanilla by default: diagnosing-bugs, retro, triage, wizard, resolving-merge-conflicts, improve-codebase-architecture, and local extensions. Evaluate each in a separate bounded workpackage.

## NEXT RECOMMENDED WP

`WP-KAD-MATT-SPECIALIST-SKILLS-001`: evaluate diagnosing-bugs, retro, triage, wizard, resolving-merge-conflicts, and improve-codebase-architecture independently. Default decision: KEEP VANILLA.

## EXPLICIT QUESTIONS

- **Does ask-matt route instead of implement?** Yes.
- **Who owns strategic decisions?** The human, through Wayfinder and `ask_user`.
- **Who asks the human?** Canonical `ask_user`.
- **Who records the human choice?** Wayfinder records the decision; the protocol marks it `AUTHOR_DECLARED`.
- **Who owns execution state?** `workctl`.
- **Can grilling make a human decision autonomously?** No.
- **Can research make a human decision autonomously?** No.
- **Can the advisory board authorize work?** No.
- **Can to-spec override a human-selected Wayfinder option?** No.
- **Can to-tickets invent scope absent from the spec?** No; scope is carried from the accepted spec and ticket blockers are explicit.
- **Can generated implementation tickets enter workctl deterministically?** Yes, through the validated import bridge.
- **Can a ticket name a capability without naming a model?** Yes.
- **Can implement mutate without a claim?** No.
- **Can two builders own the same mutating ticket?** No; the second claim is rejected.
- **Can unfinished implementation resume under another harness?** Yes, from the durable handoff and lifecycle records.
- **Does TDD remain RED -> GREEN -> REFACTOR?** Yes.
- **Does code-review remain Standards + Specification?** Yes.
- **Does KAD governance extend rather than replace Matt engineering discipline?** Yes.
- **Can an unrelated side project keep mostly vanilla Matt behavior?** Yes.
- **How large is the KAD delta relative to upstream?** Small and explicit: routing/boundary sections, protocol, bridge, tests, and overlay; upstream content remains intact.
- **Can a future Matt upstream update be replayed without reconstructing customization manually?** Yes; the lock and delta matrix define the replay path.
- **Is the entire idea -> decision -> spec -> ticket -> implementation -> review path coherent?** Yes, with deterministic workctl state and recorded evidence at each consequential boundary.
