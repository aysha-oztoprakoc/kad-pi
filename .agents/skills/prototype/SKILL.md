---
name: prototype
description: Throwaway experimental probe validating UI feel or architectural feasibility without mutating the production ledger.
class: CAPABILITY_FRONTEND
version: 1.0.0
triggers:
  - prototype
  - experiment
  - spike
  - test idea
tools:
  - task
  - write
  - read
  - browser
disposition: KEEP
---

# `prototype` — Disposable Experimental Probe

Build throwaway prototypes to answer empirical questions or validate UI aesthetics.

## Invariants
1. **Explicitly Disposable**: Prototype code is experimental and must never be merged directly into production without TDD refactoring.
2. **Zero Ledger Mutation**: Prototypes cannot mutate the canonical work ledger or project state.
