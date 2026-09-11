# WP-GAYA-001: Gaya Settlement Simulation Deterministic Kernel and Replay Qualification

* **Workpackage**: `WP-GAYA-001`
* **Project**: `kad-pi`
* **Status**: `COMPLETED / ACCEPTANCE READY`
* **Fixed Point**: `2f2ae35383a57a955cd9b5626dbe9f62d0bf9f31`
* **Claim Actor**: `kad-builder`
* **Date**: 2026-09-08
* **Source Handoff**: `/home/amdy/Downloads/GAYA_KAD_PI_MULTI_MODEL_ASCII_GAME_HANDOFF_2026-09-08.md`

---

## 1. Executive Summary

This workpackage successfully bootstraps **Gaya: The YKT Refuge** following the human operator's `[AUTHOR_DECLARED]` choice of **Option 1: Tracer-Bullet Zero-LLM Deterministic Kernel + Explorable System Atlas First** under the Wayfinder V2.0 5+1 decision protocol.

The core product promise has been proven:
> A settlement simulation where world state, legality, resource transactions, event sequencing, and history are strictly governed by a pure deterministic ESM kernel with 100% mechanical replayability. Zero LLMs are required for the simulation baseline, guaranteeing that upcoming local model actor controllers (Stheno, Qwen, Lumimaid, RP-Hero) operate as untrusted proposal generators against an immutable mechanical authority.

---

## 2. Delivered Artifacts

1. **Explorable Architecture System Atlas (`docs/gaya/atlas/` & `docs/gaya/SYSTEM.md`)**:
   - `docs/gaya/atlas/data.mjs`: Single source of truth defining all 13 system structures, 4 groups, 3 flows, 6 progressive disclosure chapters, and 5 locked architectural decisions.
   - `docs/gaya/SYSTEM.md`: Generated comprehensive text twin.
   - `docs/gaya/atlas.html`: Standalone interactive isometric atlas viewable in browser.
2. **Gaya Content Registry & Canon Boundaries (`tools/gaya/content/`)**:
   - `codex.mjs`: Explicit epistemic classifications (`APPROVED_CANON`, `PROPOSED_DESIGN`, `UNKNOWN`). Preserves Ayşa, Amethysta, Begonio, Douglas, Proisb, Lylia. Marks city Khan/Yorman reserve as strictly `UNKNOWN`.
   - `rooms.mjs`: Topological room graph of the YKT Refuge (Heartwood, Kitchen, Pantry, Bough Quarters, Mana School, Combat Terrace, Salon, Synthesis Chamber).
   - `recipes.mjs`: Síntese eligibility predicates (inanimate or killed by Ayşa) and approved recipes.
   - `registry.mjs`: Unified lookup facade.
3. **Pure ESM Deterministic Domain Kernel (`tools/gaya/kernel/`)**:
   - `state.mjs`: Canonical state serialization and SHA256 state hashing.
   - `validator.mjs`: Command precondition and economic legality barrier rejecting unaffordable or illegal actions with structured receipts.
   - `ledger.mjs`: Append-only cryptographic event ledger linking before/after state hashes with causation IDs.
   - `transition.mjs`: Discrete tick progression (`State(t+1) = Apply(...)`) and deterministic command execution.
4. **1-Day Scripted Simulation Scenario (`tools/gaya/simulation/one-day-scenario.mjs`)**:
   - Executes 48 discrete ticks (Day 1 08:00 to Day 2 08:00).
   - Features meals, cooking, Begonio mana lesson, tactical combat drill, Douglas mediation, Síntese transmutation, and night rest.
5. **Interactive ASCII Terminal UI (`tools/gaya/ui/ascii-terminal.mjs` & `bin/gaya`)**:
   - Terminal renderer matching Section 6 ASCII frame mock with status sidebar, fatigue meter, receipt log, and numbered choices.
   - CLI tool (`bin/gaya`) supporting `--frame`, `--replay`, and full simulation execution.
6. **Deterministic Verification Suite (`tools/gaya/test/`)**:
   - `content.test.mjs`: Invariant tests for canon/unknown separation and Síntese eligibility.
   - `kernel.test.mjs`: Deterministic hashing, validation rejection, and command execution.
   - `one-day-scenario.test.mjs`: Full 48-tick progression, serialization round-trip, and exact replay gate verification.

---

## 3. Acceptance Criteria Verification

| Criterion | Target | Measured Result | Verdict |
|---|---|---|---|
| **Deterministic domain state kernel** | State container with normalized entities and SHA256 state hashing | `computeStateHash` generates deterministic 64-char SHA256 hex | **PASS** |
| **Command validator** | Rejects unaffordable or illegal actions with structured receipts | Verified rejection for invalid routes, missing ingredients, unknown actors with zero state mutation | **PASS** |
| **Append-only event ledger** | Chains state before/after hashes with stable causation IDs | Sequential `evt-000001`..`evt-000075` verified with unbroken sequence and ledger hash | **PASS** |
| **One-day refuge scenario** | Executes successfully under zero-LLM scripted policy | 48 ticks executed from Day 1 08:00 to Day 2 08:00 with 27/27 commands accepted | **PASS** |
| **Replay exactness gate** | Replay of accepted command tape produces identical state hash | Original hash `1f59ccd4...` == Replayed hash `1f59ccd4...` | **PASS (EXACT)** |
| **Gaya System Atlas** | `atlas.html` and `SYSTEM.md` compile cleanly with zero errors | `node docs/gaya/atlas/build.mjs` exits cleanly (13 structures, 5 decisions) | **PASS** |

---

## 4. Test Receipts

```bash
$ node --test tools/gaya/test/*.test.mjs
✔ Content Registry - Canon vs Unknown Epistemic Separation (4.164985ms)
✔ Content Registry - Refuge Room Connectivity (0.128396ms)
✔ Content Registry - Síntese Eligibility Predicate Invariants (0.106383ms)
✔ Kernel - Deterministic State Hashing (1.40498ms)
✔ Kernel - Command Validation and Rejection Invariants (0.203109ms)
✔ Kernel - Command Execution and State Mutation (0.579901ms)
✔ Kernel - Replay Exactness Gate (PRIME_DIRECTIVE) (3.573383ms)
✔ 1-Day Scenario - Execution and Progression (10.3607ms)
✔ 1-Day Scenario - Deterministic Replay Gate (PRIME_DIRECTIVE) (6.950579ms)
✔ 1-Day Scenario - State Serialization Round-Trip Invariant (4.040707ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
```

---

## 5. Next Steps for Subsequent Workpackages

With the deterministic mechanical core verified:
1. **WP-GAYA-002 (Persistence & Branch Control)**: Add SQLite persistence adapter and fork/diff capabilities to the event ledger.
2. **WP-GAYA-003 (Interactive ASCII Shell)**: Connect the keyboard event loop to `renderAsciiFrame` in `bin/gaya` for real-time playability.
3. **WP-GAYA-005 (Local Model Registry & Adapters)**: Wire active local model endpoints (Port 5001 Stheno-v3.2, Port 5002 Qwen3.5 9B) via grammar-constrained observation/action proposal compilers.
