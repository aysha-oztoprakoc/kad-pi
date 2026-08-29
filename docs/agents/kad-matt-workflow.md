# KAD-Matt Workflow

This document is the project-scoped overlay for vanilla Matt engineering skills. It changes governance boundaries, not engineering discipline.

## Pipeline

```text
idea -> decision -> spec -> ticket -> claim -> implement -> test -> review -> evidence
```

| Stage | Owner | Durable output |
| --- | --- | --- |
| Idea and exploration | Human + `grill-with-docs`, `domain-modeling`, `research`, `prototype` | sharpened language, cited evidence, or explicitly experimental result |
| Decision | Human, through Wayfinder and `ask_user` | five options plus one custom write-in; selected option recorded as `AUTHOR_DECLARED` |
| Specification | `to-spec` | accepted behavior, scope, trust boundary, evidence, and acceptance gates |
| Ticketing | `to-tickets` | tracer-bullet tickets with explicit blockers |
| Registration | `workctl` | `.agents/work/<id>.json`, created by deterministic ticket import |
| Claim | `workctl` | exclusive mutating claim or explicit read-only review mode |
| Implementation | Builder via `implement` | owned-path changes, using vanilla TDD where agreed |
| Test | Builder via `tdd` | red -> green -> refactor proof at public seams |
| Review | `code-review` | separate Standards and Specification findings |
| Evidence | Builder / project owner | fixed point, commands, outputs, failures, and decisions under `evidence/` |

## Boundaries

- Wayfinder owns the decision map; it does not implement work.
- `ask_user` asks the human. Advisors recommend; they do not authorize.
- `workctl` owns execution state, claims, handoffs, and readiness. The tracker and spec do not become a second execution database.
- A builder MUST have a valid mutating claim before changing an owned path. An incomplete task uses `workctl handoff`; another harness resumes from that record.
- Research informs decisions but cannot resolve them. Prototypes remain experimental until a human accepts the resulting decision.
- KAD overlays are active only for `kad-pi` or an explicit project opt-in. Unrelated projects retain vanilla Matt behavior plus workspace coordination.

## Ticket bridge

An accepted KAD ticket is represented as JSON with the work-contract fields (`id`, `project`, `title`, `fixed_point`, `scope`, `non_scope`, `owned_paths`, `required_capabilities`, `trust_domain`, `authority_required`, `validation`, `evidence_target`, `blocked_by`, `blocks`, and `priority`). Import it with:

```sh
bin/workctl import-tickets path/to/tickets.json
```

Import is deterministic, idempotent for identical records, and rejects duplicate/conflicting records, unknown blocker references, unsafe IDs, project-authority mismatches, and model/provider/harness-specific fields. `bin/workctl next` then returns only unblocked `READY` work.

## Zero-model rule

Registration, readiness, claim collision, handoff, resume, status, doctor, and drift checks are deterministic commands. No model, provider, or harness identity is required in a work contract.
