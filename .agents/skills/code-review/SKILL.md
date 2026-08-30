---
name: code-review
description: Dual-axis code review evaluating Standards (style, types, lint) and Specification (ticket fulfill) with skeptical analysis.
class: PROCESS_DISCIPLINE
version: 1.0.0
triggers:
  - code review
  - review changes
  - review diff
  - pr review
tools:
  - git diff
  - git log
  - task
  - read
disposition: KEEP
---

# `code-review` — Dual-Axis Code Review

Evaluates code modifications along two distinct axes using independent verifier roles (`kad-reviewer`).

## Axes of Review
1. **Standards Axis**: Code style, typing rigor, error handling, performance invariants, and test coverage.
2. **Specification Axis**: Did the implementation fulfill exactly what the workpackage contract and spec asked for, with zero unauthorized scope expansion?
3. **Skeptical Logic Analysis**: Look for impossible states, hidden race conditions, and deceptive code smells.
