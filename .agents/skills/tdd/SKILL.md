---
name: tdd
description: Test-Driven Development discipline: Red (failing test) -> Green (minimal pass) -> Refactor (clean structure).
class: PROCESS_DISCIPLINE
version: 1.0.0
triggers:
  - tdd
  - write tests
  - red green refactor
  - test first
tools:
  - npm test
  - pytest
  - make verify
  - edit
  - write
  - read
  - bash
disposition: KEEP
---

# `tdd` — Test-Driven Development Discipline

Enforces the canonical Red-Green-Refactor cycle at public API seams.

## The Cycle
1. **RED**: Write a failing unit or integration test defining the observable contract at a public seam. Execute and observe the failure.
2. **GREEN**: Write the minimal code required to pass the test. Run and confirm green.
3. **REFACTOR**: Clean up structure, remove duplication, and optimize while keeping tests green.
4. **RECEIPT**: Capture test output as durable evidence.
