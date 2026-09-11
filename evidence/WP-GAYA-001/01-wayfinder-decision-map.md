# Phase 1: Wayfinder Architectural Decision Map (D-GAYA)

* **Workpackage**: `WP-GAYA-001` (Gaya Deterministic Domain Kernel & Explorable System Atlas)
* **Topic**: Gaya ASCII Settlement Simulation Bootstrap & Implementation Sequencing
* **Source Handoff**: `/home/amdy/Downloads/GAYA_KAD_PI_MULTI_MODEL_ASCII_GAME_HANDOFF_2026-09-08.md`
* **Authority**: Wayfinder V2.0 + KAD Epistemic Evidence Gate
* **Protocol**: 5+1 Human Decision Protocol (`AUTHOR_DECLARED`)
* **Date**: 2026-09-08

---

## Decision D-GAYA-001: Bootstrap & Implementation Sequencing Strategy

* **Context**: The Gaya Technical Handoff specifies an ambitious multi-model settlement simulation combining Dwarf Fortress emergent life, RimWorld schedule/needs logistics, Factorio data recipes, Modded Minecraft modular rooms, and Gaya tabletop cosmology (Khan/Yorman, Síntese, YKT refuge). We must select the execution path and sequencing strategy that satisfies all KAD constitutional invariants while delivering immediate, verifiable progress.

* **Option 1 (Recommended)**: **Tracer-Bullet Zero-LLM Deterministic Kernel + Explorable System Atlas First**.
  - Build the pure deterministic ESM kernel in `tools/gaya/` (entities, commands, validators, append-only event ledger with SHA256 state hashing, 1-day scripted test run).
  - Concurrently build the explorable System Atlas (`docs/gaya/atlas/` or `interface/atlas/gaya/`) per `/skill:system-atlas` (`data.mjs` -> `atlas.html` + `SYSTEM.md` text twin).
  - Zero LLM required for Phase 1. Green replay gate before model adapters are introduced.

* **Option 2**: **Vertical Slice Terminal TUI + Kernel Co-development**.
  - Co-develop the interactive ASCII terminal renderer (keyboard loop, map view, choice selector, status pane, receipt log) alongside the kernel so human can play Ayşa/Lylia on Day 1 immediately.
  - Risk: couplings between early state representation and terminal rendering before replay semantics freeze.

* **Option 3**: **Full System Atlas & workctl Ticket Import First**.
  - Compile the complete architectural System Atlas, formal specifications, and import all 12 workpackages (`WP-GAYA-000` through `WP-GAYA-011`) into the workctl ledger before touching any simulation code.
  - Risk: front-loads ticket governance overhead without validating the core domain mechanics in running code.

* **Option 4**: **System Atlas + Content Registry & Lore Audit (WP-GAYA-000)**.
  - Build System Atlas and focus first exclusively on the Content Registry (encoding canon codex, Ayşa/Amethysta/Begonio sheets, rooms, explicit `UNKNOWN` bounds) before any state transition logic.
  - Risk: isolates static data from dynamic verification.

* **Option 5**: **End-to-End Simulation + Local Model Adapter Prototype**.
  - Build a minimal 3-room kernel and immediately wire the local KoboldCpp OpenAI-compatible adapters (Stheno 5001 / Qwen 5002) with grammar-constrained JSON action proposals.
  - Risk: introduces model variance and endpoint debugging before mechanical determinism is proven.

* **Option 6 (Custom Human Write-in)**: [Available via 5+1 protocol].

* **Resolution**: `[AUTHOR_DECLARED]` **Option 1 (Tracer-Bullet Kernel + System Atlas First)**.

---

## Constitutional Invariants Verification

The selected decision satisfies all KAD constitutional invariants:
1. **Mechanical Determinism (PRIME_DIRECTIVE)**: The kernel owns world state, rules, costs, legal actions, event order, and persistence. The exact same command tape and seed produce the identical state hash.
2. **Authority Separation**: Untrusted models (local Stheno, Qwen, Lumimaid, etc.) only produce action/dialogue proposals. Only the deterministic kernel validates and commits state transitions.
3. **Epistemic Provenance**: All data is explicitly categorized (`Approved canon`, `Proposed design`, `Simulated event`, `Character belief`, `Disputed claim`, `Unknown`). Unknowns remain `UNKNOWN` and cannot be fabricated.
4. **No LLM Required for Baseline**: The simulation functions fully under scripted controllers. Local model adapters attach as modular proposal controllers without changing the rules kernel.
5. **Architectural Transparency**: The System Atlas (`SYSTEM.md` and `atlas.html`) provides both an explorable isometric visualization for human operator review and a rigorous text twin for repository records.
