---
name: implement
description: Implement a piece of work based on a spec or set of tickets.
disable-model-invocation: true
dependencies:
- tdd
- code-review
---

Implement the work described by the user in the spec or tickets.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work.

Commit your work to the current branch.

For `kad-pi`, implementation starts from a `READY` work item selected by `workctl next` and requires a valid mutating claim before any owned-path mutation. Use `workctl handoff` when stopping incomplete work; another harness resumes from the handoff and claim lifecycle, not from an untracked chat transcript.
