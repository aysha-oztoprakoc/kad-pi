---
name: handoff
description: Durable continuation generator bridging to workctl handoff and multi-harness resumes.
class: HARNESS_ADAPTER
version: 1.0.0
triggers:
  - handoff
  - pause task
  - resume later
  - context exhaustion
tools:
  - bin/workctl handoff
  - git diff
  - write
disposition: KEEP
---

# `handoff` — Durable Continuation Handoff

Records full durable continuation state so another agent, human, or harness (OMP, Claude Code) can resume work with zero conversational context.

## Actions
1. Run `bin/workctl handoff <TASK_ID>` to record touched files, pending tests, and next actions into `.agents/work/handoffs/<TASK_ID>.md` and `.json`.
2. Ensure working tree status is cleanly captured (`git status`, `git diff`).
