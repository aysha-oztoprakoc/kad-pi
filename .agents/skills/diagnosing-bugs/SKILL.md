---
name: diagnosing-bugs
description: Root-cause diagnosis loop for hard bugs, race conditions, memory leaks, and regressions using DAP and minimal repros.
class: PROCESS_DISCIPLINE
version: 1.0.0
triggers:
  - diagnose
  - debug
  - failing test
  - crash
  - performance drop
tools:
  - debug
  - browser
  - read
  - grep
  - edit
  - bash
  - make
disposition: KEEP
---

# `diagnosing-bugs` — Root-Cause Diagnosis Loop

Systematic debugging loop for difficult defects, flaky tests, memory leaks, and race conditions.

## Diagnosis Steps
1. **Reproduce**: Construct a minimal, isolated reproduction script or test case.
2. **Inspect**: Use `debug` (DAP debugger), `grep`, or symbolized logs to observe actual state transitions.
3. **Hypothesize & Prove**: Formulate a falsifiable hypothesis and verify with a targeted probe.
4. **Fix & Verify**: Fix the root cause in source, verify the repro passes, and run regression suites.
