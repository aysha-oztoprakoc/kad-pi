# Regression & Diagnostic Validation Report — WP-KAD-CANONICAL-PROJECTION-SYNCHRONIZATION-011

## 1. Full Test Suite Execution
- **Command**: `node --test tools/kad/test/*.test.mjs tools/workspace/workctl.test.mjs`
- **Total Tests**: 564 tests across 28 test suites
- **Passed**: 564
- **Failed**: 0
- **Cancelled / Skipped**: 0
- **Duration**: ~10.4 seconds

## 2. Doctor Diagnostics
- **`./bin/workctl doctor`**: `healthy` (0 errors)
- **`./bin/kad doctor`**: `PASS` (all runtimes, toolchains, and services healthy)
- **`./bin/kad-wiki lint --json`**: `ok: true` (62 governed notes indexed, 0 errors)

## 3. Projection Compilation
- **`./bin/kad-wiki rebuild`**: Recompiled all projections cleanly (manifest, lexical index, graph, projects, workpackages, research, sofia projection, repo docs, public site state, root README).
