# KAD-PI Next Step Roadmap: Workstation Consolidation & Ideal State Finalization

**Document ID**: `ROADMAP-KAD-PI-CONSOLIDATION-2026-09-06`  
**Status**: `PROPOSED_ACTIONABLE`  
**Primary Target**: Achieve the canonical **Dependable Single-Node Engineering & Research Workstation** baseline specified in `KAD_PI_IDEAL_STATE_NEXT_2026-09-06.md`.  
**Starting Baseline**: Commit `337a420` + uncommitted WP-044..056 implementation (+1048/-382 lines, 39 untracked files).  

---

## Phase 1: Ingestion & Canonical Promotion of External Reports
- **Objective**: Bring the external reports into repository version control and the canonical knowledge fabric.
- **Actions**:
  1. Ingest `/home/amdy/Downloads/reports/KAD_PI_IDEAL_STATE_NEXT_2026-09-06.md` into `docs/architecture/KAD_PI_IDEAL_STATE_NEXT_2026-09-06.md`.
  2. Ingest `/home/amdy/Downloads/reports/KAD_PI_IMPLEMENTATION_PLAN_NEXT_2026-09-06.md` into `docs/architecture/KAD_PI_IMPLEMENTATION_PLAN_NEXT_2026-09-06.md`.
  3. Verify SHA256 integrity of both imported files against the declared digests.
  4. Register the new ideal state milestone in `vault/00_Governance/CANONICAL_SOURCE_INDEX.md` and rebuild projections via `bin/kad-wiki rebuild`.

## Phase 2: State Documentation & Gap Model Synchronization
- **Objective**: Synchronize `docs/state/` with current reality so automated tests and human operators see zero drift.
- **Actions**:
  1. Update `docs/state/CSA_KAD_PI_CURRENT.json` and `docs/state/CSA_KAD_PI_CURRENT.md` to reflect post-WP-056 state (`798/798 tests pass`, WP-044..056 `ACCEPTED`).
  2. Update `docs/state/CSA_ISA_GAP.json` and `docs/state/CSA_ISA_GAP.md`, marking resolved gaps (e.g., probe metric honesty, lease directionality, process cancellation, exact retrieval) as `RESOLVED`.
  3. Execute `node --test docs/state/test/state-artifacts.test.mjs` to ensure 100% schema and provenance compliance.

## Phase 3: Structured Atomic Git Commit Sequence
- **Objective**: Transition 28 modified files and 39 untracked files from volatile working tree debt into clean, reviewable, bisectable Git commits.
- **Actions**:
  1. **Commit A (Core Infrastructure & Process Safety)**:
     - Paths: `tools/kad/compute/*`, `bin/omp-kad`, `scripts/runtime-canary-suite.mjs`, `tools/kad/local-inference-capability.mjs`, `tools/kad/stc-scope.mjs`.
     - Message: `feat(core): enforce honest probe metrics, safe OMP launch, and process group cancellation (WP-044, WP-046, WP-052)`
  2. **Commit B (Leasing, Governance & Economic Routing)**:
     - Paths: `tools/workspace/stc-lease.mjs`, `tools/workspace/workctl.mjs`, `tools/kad/economic-router.mjs`, `tools/kad/workload-contract.mjs`, `tools/kad/isa.mjs`.
     - Message: `feat(governance): enforce directional writer leases, actor role separation, and fail-closed routing (WP-045, WP-047, WP-048, WP-049)`
  3. **Commit C (Knowledge Plane & Projection Unification)**:
     - Paths: `tools/kad/knowledge-plane.mjs`, `tools/kad/wiki-projection.mjs`, `bin/kad-wiki`, `vault/90_Derived/Projections/*`.
     - Message: `feat(knowledge): enforce byte-faithful exact retrieval and single-writer projection ownership (WP-050, WP-051)`
  4. **Commit D (Test Regressions & Invariant Hardening)**:
     - Paths: `tools/kad/test/*`, `tools/workspace/workctl.test.mjs`.
     - Message: `test(regression): add comprehensive behavioral suites for P01-P13 contracts (798/798 PASS)`
  5. **Commit E (Workpackage Ledger & Acceptance Evidence)**:
     - Paths: `.agents/work/WP-KAD-*.json`, `.agents/work/claims/WP-KAD-*.json`, `evidence/WP-KAD-*/`.
     - Message: `chore(ledger): record accepted workpackages and evidence dossiers for WP-044 through WP-056`
  6. **Commit F (Canonical State & Next-State Promotion)**:
     - Paths: `docs/state/*`, `docs/architecture/KAD_PI_IDEAL_STATE_NEXT_2026-09-06.md`, `README.md`.
     - Message: `docs(architecture): consolidate current state artifact and promote next ideal state baseline`

## Phase 4: Full-Ladder Verification
- **Objective**: Confirm end-to-end repository health across all deterministic verifiers before pushing.
- **Actions**:
  1. `npm test` (798 tests must pass).
  2. `make verify` (token budget <= 1500 tokens, librarian PASS).
  3. `bin/kad doctor` (10/10 PASS).
  4. `bin/workctl doctor` (status: healthy, 0 errors).
  5. `bin/kad-isa check all` (all claims PASS).
  6. `bin/kad-wiki lint` (0 errors).
  7. `git diff --check` (clean).

## Phase 5: Remote Synchronization (Fast-Forward Only)
- **Objective**: Publish the finalized, verified milestone to `origin/main`.
- **Actions**:
  1. Verify remote tracking branch has not diverged: `git fetch origin main && git status`.
  2. Push with fast-forward only: `git push origin main`.
  3. Monitor GitHub Actions CI to confirm remote pass on exact pushed SHA.

## Phase 6: Human Acceptance & Sovereign Handoff
- **Objective**: Formally hand off the single-node dependable workstation baseline to the human operator.
- **Actions**:
  1. Review final receipts in `evidence/WP-KAD-FINAL-REGRESSION-INDEPENDENT-VERIFICATION-056/01-final-acceptance-package.json`.
  2. Obtain human operator sign-off (`[AUTHOR_DECLARED]`).
  3. Keep `EXP-KAD-OFFLINE-SURVIVAL-001-R1` strictly `BLOCKED` until a dedicated, separately authorized network fault injection window is scheduled.
