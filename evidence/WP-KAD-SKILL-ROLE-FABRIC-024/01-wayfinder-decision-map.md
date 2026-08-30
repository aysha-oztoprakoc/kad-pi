# Phase 1: Wayfinder Architectural Decision Map (D024)

* **Workpackage**: `WP-KAD-SKILL-ROLE-FABRIC-024`
* **Topic**: Canonical KAD-PI Unified Skills & Role ISA Formulation
* **Authority**: Wayfinder + KAD Epistemic Evidence Gate
* **Protocol**: 5+1 Decision Protocol (`AUTHOR_DECLARED`)

---

## Decision D024-001: Canonical Skill Surface Scope & Consolidation Strategy

* **Context**: Current repository has 46 skills in `.agents/skills/`, leading to cognitive fragmentation, overlapping triggers, and redundant prompt overhead. We must consolidate into a disciplined, high-signal surface of 12–15 canonical concepts.
* **Option A**: Keep all 46 skills as distinct directories and only add metadata annotations. (High token overhead, frequent routing collision).
* **Option B**: Aggressively delete 35 skills without mapping their proven mechanisms into canonical concepts. (Loss of valuable patterns like deep module design and Socratic grilling).
* **Option C (Recommended)**: Consolidate into 15 canonical skills with typed classes (`PROCESS_DISCIPLINE`, `WORKFLOW`, `POLICY_FRONTEND`, `CAPABILITY_FRONTEND`, `HARNESS_ADAPTER`, `PRESENTATION`). Map all legacy/reviewed skills into `KEEP`, `MERGE`, `ABSORB`, `PROCEDURE`, `REFERENCE`, `POLICY_FRONTEND`, `CAPABILITY_FRONTEND`, `HARNESS_ADAPTER`, `DETERMINISTIC_CODE`, or `RETIRE`.
* **Option D**: Introduce a dynamic runtime skill compiler that generates skills on the fly from prompt text. (Violates deterministic lockfile and immutability invariants).
* **Option E**: Defer skill consolidation and only implement role contracts. (Leaves cognitive substrate fragmented).
* **Option F (Custom Human Selection)**: Explicitly selected Option C with strict lockfile verification.

* **Resolution**: `[AUTHOR_DECLARED]` **Option C**.

---

## Decision D024-002: Role Contract Architecture (`ROLE_CONTRACT_V1`) & Spawn Hierarchy

* **Context**: OMP provides generic subagent spawning (`task`), but lack of typed role contracts allows un-gated mutation, arbitrary spawn recursion, and authority leakage.
* **Option A**: Unconstrained subagent spawning with ambient model authority. (Dangerous, non-deterministic).
* **Option B**: Single monolithic agent role with all capabilities enabled. (No separation of concerns, violates verifier independence).
* **Option C (Recommended)**: Define `ROLE_CONTRACT_V1` with 15 typed logical roles (master, builder, debugger, tester, reviewer, researcher, librarian, scout, local-extractor, world, and 5 advisory roles). Enforce max spawn depth of 2, strict mutation lease requirements, and independent verifiers.
* **Option D**: Restrict to flat 1-level execution with zero subagents allowed. (Cripples parallel verification and scout exploration).
* **Option E**: Hardcode role contracts to specific proprietary model vendor names. (Violates PRIME_DIRECTIVE invariant `ROLE != MODEL`).
* **Option F (Custom Human Selection)**: Explicitly selected Option C.

* **Resolution**: `[AUTHOR_DECLARED]` **Option C**.

---

## Decision D024-003: Model & Resource Routing Hierarchy

* **Context**: We need capability-first routing that maximizes TOKENMAXXING (useful work per scarce resource used) and enforces deterministic-first and local-first execution.
* **Option A**: Route all requests to frontier cloud reasoning models regardless of task difficulty. (SLOPMAXXING, expensive, high latency).
* **Option B**: Force all tasks to local models regardless of capability fit or context limits. (High failure rate on complex reasoning).
* **Option C (Recommended)**: Strict capability-first tier hierarchy: `deterministic -> tiny specialist -> local narrow model -> local general model -> free/cheap remote -> standard remote -> strong reasoning -> human`. Local models only bound to roles they have empirically qualified for.
* **Option D**: Pure probabilistic cost-optimizer without trust domain or security boundaries. (Security violation).
* **Option E**: Static random load balancing. (Non-deterministic).
* **Option F (Custom Human Selection)**: Explicitly selected Option C.

* **Resolution**: `[AUTHOR_DECLARED]` **Option C**.

---

## Decision D024-004: Context Authority & Knowledge Plane Boundary

* **Context**: Various context systems exist (Obsidian vault, OpenViking, Needle, RAG, wiki). We must ensure zero competing truth authorities.
* **Option A**: Allow each skill or tool to maintain its own independent database of record. (Context poisoning, state drift).
* **Option B (Recommended)**: Canonical Obsidian Vault / KAD KnowledgePlane is the sole durable truth authority. All other systems (OpenViking, vector indexes, wiki projections, Sofia viewmodels) are strictly derived, regenerable projections with `authority: false`.
* **Option C**: Make OMP session history the canonical knowledge base. (Non-durable, lost across compaction).
* **Option D**: Rely entirely on remote cloud search engines. (Privacy violation, zero local persistence).
* **Option E**: Ephemeral in-memory context only. (No cross-session learning).
* **Option F (Custom Human Selection)**: Explicitly selected Option B.

* **Resolution**: `[AUTHOR_DECLARED]` **Option B**.
