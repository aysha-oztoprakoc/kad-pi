---
name: codebase-design
description: Deep module design: narrow public seams, hidden complexity, and clean dependency acyclicity.
class: PROCESS_DISCIPLINE
version: 1.0.0
triggers:
  - codebase design
  - module interface
  - refactor architecture
  - dependency structure
tools:
  - read
  - ask
  - make
disposition: KEEP
---

# `codebase-design` — Deep Module & Architecture Discipline

Design deep modules: simple, narrow interfaces that hide substantial internal complexity.

## Core Tenets
1. **Narrow Seams**: Expose only the minimal surface necessary. Keep internal state private.
2. **Dependency Acyclicity**: Enforce acyclic dependency graphs across modules.
3. **Information Hiding**: Prevent callers from needing to know internal implementation details.
