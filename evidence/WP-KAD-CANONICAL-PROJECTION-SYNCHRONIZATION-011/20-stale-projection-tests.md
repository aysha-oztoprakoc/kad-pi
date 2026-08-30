# Stale Projection & Invalidation Test Record — WP-KAD-CANONICAL-PROJECTION-SYNCHRONIZATION-011

## 1. Test Invariants
- **Test File**: `tools/kad/test/projection-compiler.test.mjs`
- **Test Case**: `Projection Compiler: Sofia v3 adapter retains complete provenance and detects stale revision`
- **Mechanism**:
  1. Compiles initial projection at vault revision $R_1$.
  2. `isProjectionFresh(projection, vaultRoot)` returns `true`.
  3. Mutates vault content (creating revision $R_2 \neq R_1$).
  4. `isProjectionFresh(projection, vaultRoot)` returns `false`.
  5. Running `./bin/kad-wiki rebuild` re-compiles projections and restores freshness.

## 2. Test Execution
- Executed via `node --test tools/kad/test/projection-compiler.test.mjs`
- Result: **PASS** (100% deterministic detection).
