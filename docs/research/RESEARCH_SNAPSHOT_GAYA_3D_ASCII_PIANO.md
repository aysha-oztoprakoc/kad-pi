---
kad_id: SNAP-GAYA-3D-ASCII-PIANO-001
title: "Research Snapshot: Deterministic 3D ASCII Text-RPG, PIANO Cognitive Architecture, and Gaya World Substrate on Consumer Hardware"
type: research_snapshot
version: 1.0.0
status: DRAFT_FOR_ASTRA_ISA
authority: CANONICAL_RESEARCH_GROUNDING
epistemic_class: SOURCE_DERIVED
review_status: PENDING_ASTRA_SYNTHESIS
visibility: project
context_eligible: true
train_eligible: true
publish: false
temporal_status: CURRENT
owner: "Human Project Lead & KAD Architecture"
date: 2026-09-08
related_adrs:
  - docs/adr/0004-model-agnostic-control-plane.md
  - docs/adr/0005-deterministic-first-and-epistemic-classification.md
  - docs/adr/0009-frontend-and-visualization-technology-stack.md
  - docs/adr/0013-aesthetic-directive-and-token-authority.md
  - docs/adr/0014-generalized-ideal-state-artifact-and-compute-fabric-governance.md
related_questions:
  - Q01 (Notification-Oriented Paradigm Foundations vs Event-Driven)
  - Q02 (Formal Operational Semantics & LTS)
  - Q03 (Assume-Guarantee Compositional Verification)
  - Q04 (Behavioral Session Types & Lifecycle Protocols)
  - Q05 (Empirical TDD & Test Oracle Theory)
  - Q08 (Fault Recovery & Runtime Tolerance)
  - Q10 (Truth Maintenance & Epistemic Boundaries)
  - Q11 (Context Compression & Memory Pruning)
  - Q12 (Inference-Time Test-Time Compute Allocation)
  - Q13 (Capability-Based Security & Authority Delegation)
  - Q14 (Fault Injection & Perturbation Resilience)
  - Q15 (Temporal Abstraction, SMDP Macro-Actions & Option Transfer)
literature_grounding:
  - Yang et al. (2024). "Project Sid: Many-Agent Simulations Toward AI Civilization." arXiv:2411.00114.
  - Park et al. (2023). "Generative Agents: Interactive Simulacra of Human Behavior." arXiv:2304.03442.
  - Bacon et al. (2016). "The Option-Critic Architecture." AAAI-17.
  - Barreto et al. (2021). "The Option Keyboard: Combining Skills in Reinforcement Learning." arXiv:2106.13105.
  - Linhares et al. (2020). "NOCA: A Notification-Oriented Computer Architecture." IEEE Access.
hardware_target:
  cpu: "AMD Ryzen 7 7700 8-Core Processor (16 Threads, AVX-512)"
  gpu: "AMD Radeon RX (Navi 44 / RDNA3) via ROCm / Vulkan"
  memory: "32 GB DDR5"
  cost_ceiling: "$0.00 / hour (100% Local Inference, Zero Remote API Tokens)"
---

# Research Snapshot: Deterministic 3D ASCII Text-RPG, PIANO Cognitive Architecture, and Gaya World Substrate on Consumer Hardware

## 1. Executive Thesis & Problem Statement

### 1.1 The Central Thesis
It is technically and mathematically feasible to execute a rich, persistent, text-based civilization simulation on standard consumer workstation hardware ($0.00 marginal spend, zero remote cloud token leakage) by combining:
1. **A Pure Deterministic Simulation Kernel**: State transitions, physical preconditions, inventory conservation, and causality are governed by an append-only cryptographic event ledger (SHA-256) operating in discrete ticks.
2. **A Real-Time 3D ASCII Viewport Engine**: A high-performance, non-blocking 3D rendering pipeline (raycasting/rasterization with depth buffering and aspect-ratio compensation) rendering directly to the terminal shell at 60 FPS with zero GPU bloat.
3. **The PIANO Architecture on Local SLMs**: The *Parallel Information Aggregation via Neural Orchestration* paradigm (Altera.AL / Project Sid, arXiv:2411.00114), where concurrent perception streams (Proprioception, Social, Memory, Action Awareness) are aggregated asynchronously by local quantized models (Qwen2.5-7B, Stheno-v3.2) proposing high-level macro-options arbitrated into valid atomic kernel commands.
4. **The Gaya RPG World Substrate**: Grounded in canonical tabletop lore (The YKT Refuge, Khan kinetic vitality vs Yorman abjuration, Síntese transmutations, and canonical personas).
5. **Rigorous Formal Grounding (Q1–Q15)**: Theoretical guarantees spanning Notification-Oriented Paradigms (P1), Labeled Transition Systems (P2), Assume-Guarantee contracts (P3), and SMDP Temporal Abstraction (P5/Q15).

### 1.2 Downstream Destination: Astra Ideal State Artifact (ISA)
This document serves as the **authoritative epistemic foundation** for Astra to compile into an **Ideal State Artifact (ISA)** work package (`ISA-GAYA-3D-ASCII-PIANO-001`). It articulates exact mathematical invariants, architectural seams, consumer compute limits, and verifiable acceptance criteria.

---

## 2. Theoretical Foundations & Research Mapping (Q1–Q15)

The architecture is structured around five foundational pillars validated in the KAD-PI research roadmap:

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                           FORMAL THEORETICAL FOUNDATION                               │
├──────────────────────────────┬──────────────────────────────┬─────────────────────────┤
│ Pillar 1: PON Decoupling     │ Pillar 2: LTS Kernel         │ Pillar 5: SMDP Options  │
│ (Q1, Q2, Q10)                │ (Q2, Q3, Q4, Q6)             │ (Q15, Q11, Q12)         │
│ • Perception != Arbitration  │ • State(t+1) = Apply(S, C)   │ • Macro-action hierarchy│
│ • Notification selectivity   │ • Inductive Invariants       │ • Option termination    │
│ • Non-blocking stream fan-in │ • Cryptographic hash-chain   │ • Context compression   │
└──────────────────────────────┴──────────────────────────────┴─────────────────────────┘
```

### 2.1 Pillar 1: Notification-Oriented Paradigm (PON / NOP) — Q1 & Q2
- **Literature**: Linhares et al. (2020), Simão et al. (2018).
- **Formalism**: In standard event-driven loops or LLM agents, polling creates quadratic latency ($O(N^2)$ token evaluations). In NOP, state entities notify interested causal rules only when relevant attributes mutate (Notifier $\to$ Premise $\to$ Rule $\to$ Action).
- **Architectural Seam**: The 4 perception modules in PIANO (Memory, Proprioception, Social, Action Awareness) emit notifications asynchronously. The Cognitive Controller (CC) evaluates choices only when a notification flags a threshold transition (e.g. `hunger > 0.8` or `peer_entered_room`).

### 2.2 Pillar 2: Operational Semantics & LTS Invariants — Q2, Q3 & Q4
- **Literature**: Plotkin (2004) Structural Operational Semantics; Honda, Vasconcelos, Gay (2010) Session Types.
- **Formalism**: The world state is a deterministic Labeled Transition System:
  $$\langle S, \mathcal{A}, \to, s_0 \rangle$$
  where each transition $s \xrightarrow{\alpha} s'$ is valid if and only if $\text{Precondition}(\alpha, s) = \text{true}$.
- **Core Invariant 1 (Inventory Conservation)**:
  $$\sum_{a \in \text{Actors}} \text{count}(i, a.\text{inv}) + \sum_{r \in \text{Rooms}} \text{count}(i, r.\text{inv}) + \text{res}(i) = K_i \quad \forall t$$
  Trade commands between agents cannot duplicate, destroy, or forge items out of thin air.
- **Core Invariant 2 (Session Protocol of Refuge Movement)**:
  Movement between connected 3D topological rooms follows a strict session type protocol preventing spatial teletransportation.

### 2.3 Pillar 3: Test Oracle Theory & Deterministic Replay — Q5 & Q6
- **Literature**: Weyuker (1982), Barr et al. (2015).
- **Implementation**: The simulation maintains an append-only ledger where every event is cryptographically linked:
  $$H_t = \text{SHA256}(H_{t-1} \parallel \text{Tick}_t \parallel \text{Cmd}_t \parallel \Delta \text{State}_t)$$
  Replaying the exact sequence of accepted command tapes from $s_0$ with identical PRNG seeds produces the exact state hash:
  $$\text{Replay}(\text{Tape}, \text{Seed}) \equiv H_{\text{target}}$$

### 2.4 Pillar 4: Action Awareness & Fault Tolerance — Q8, Q10 & Q14
- **Literature**: Doyle (1979) Truth Maintenance Systems (TMS); Yang et al. (2024) Project Sid Ablation Studies.
- **Ablation Finding**: Without Action Awareness, agents whose actions are rejected (e.g. trying to eat when the larder is empty) get stuck in degenerative infinite loops ("naive action spinning").
- **Implementation**: Every rejected command returns a structured receipt:
  $$\text{Receipt} = \langle \text{REJECTED}, \text{reason\_code}, \text{actor\_id}, \text{cmd\_id} \rangle$$
  The Action Awareness module records this in working memory, temporarily suppressing that action's urgency and activating fallback planning (e.g. foraging, cooking, or barter).

### 2.5 Pillar 5: Hierarchical Temporal Abstraction (SMDP Options) — Q15
- **Literature**: Sutton, Precup & Singh (1999) Semi-Markov Decision Processes; Bacon, Harb & Precup (2016) Option-Critic Architecture; Barreto et al. (2021) Option Keyboard.
- **Formalism**: An option $\omega = \langle \mathcal{I}_\omega, \pi_\omega, \beta_\omega \rangle$ consists of:
  - Initiation set $\mathcal{I}_\omega \subseteq \mathcal{S}$ (when the option can be triggered).
  - Internal policy $\pi_\omega: \mathcal{S} \times \mathcal{A} \to [0, 1]$ (decomposes the goal into atomic simulation steps).
  - Termination condition $\beta_\omega: \mathcal{S} \to [0, 1]$ (when the macro-goal is achieved or aborted).
- **Macro-Options in Gaya**:
  - $\omega_{\text{COOK}}$: Move to pantry $\to$ check recipe ingredients $\to$ perform cook transition $\to$ deliver meal.
  - $\omega_{\text{TRADE}}$: Locate peer $\to$ co-locate in commons $\to$ propose barter tuple $\to$ confirm mutual accept.
  - $\omega_{\text{VOTE}}$: Convene in Council Chamber $\to$ evaluate civic proposal $\to$ cast cryptographic ballot.
  - $\omega_{\text{MEME}}$: Select co-located peer $\to$ evaluate ideological affinity $\to$ execute dialogical transmission.

---

## 3. The 3D ASCII Terminal Viewport Engine

### 3.1 Mathematical Rendering Pipeline
To deliver a diegetic, retro-futuristic 3D experience directly inside the user's terminal without GPU windowing libraries, we define a pure software-rasterized 3D ASCII engine:

```
┌────────────────────────────────────────────────────────────────────────┐
│                     3D ASCII RENDER PIPELINE                           │
│                                                                        │
│   3D Room Geometry (Vertices / Walls / Obstacles / Actors)             │
│                              │                                         │
│                              ▼                                         │
│   Raycasting / DDA (Digital Differential Analyzer) or Vector Wireframe │
│                              │                                         │
│                              ▼                                         │
│   Depth Buffer (Z-Buffer Array[Width * Height])                        │
│                              │                                         │
│                              ▼                                         │
│   Aspect-Ratio Correction (Terminal Font Cell ~ 2:1 Height:Width)      │
│                              │                                         │
│                              ▼                                         │
│   Shading & Glyph Quantization (Density Mapping + ANSI TrueColor)      │
│                              │                                         │
│                              ▼                                         │
│   Double-Buffered Frame Diff Engine -> stdout (60 FPS, Zero Flicker)   │
└────────────────────────────────────────────────────────────────────────┘
```

#### A. Raycasting / DDA Equations
For first-person dungeon/room perspective inside the YKT Refuge:
- Player position $\vec{P} = (p_x, p_y)$, direction vector $\vec{D} = (d_x, d_y)$, camera plane $\vec{C} = (c_x, c_y)$.
- For each horizontal terminal column $x \in [0, W-1]$:
  $$\text{camera}_x = \frac{2x}{W} - 1, \quad \vec{R}_{\text{dir}} = \vec{D} + \vec{C} \cdot \text{camera}_x$$
- DDA calculates the exact distance $\text{dist}_{\perp}$ to the nearest wall surface, avoiding fish-eye distortion:
  $$\text{dist}_{\perp} = \frac{\text{step}_x - p_x + (1 - \text{step}_x)/2}{R_{\text{dir}, x}}$$
- Wall slice height on screen:
  $$h_{\text{wall}} = \left\lfloor \frac{H}{\text{dist}_{\perp}} \times \text{AspectFactor} \right\rfloor$$
  where $\text{AspectFactor} \approx 0.5$ compensates for standard monospace fonts being roughly twice as tall as they are wide.

#### B. Depth Quantization & Shading Palettes
Surfaces are shaded using depth and surface-normal orientation into ordered ASCII density ramps:
- **Grayscale Block Density Ramp**: `[" ", "░", "▒", "▓", "█"]`
- **Detailed ASCII Ramp**: `[" ", ".", ":", "-", "=", "+", "*", "#", "%", "@"]`
- **Edge & Wireframe Glyphs**: `["│", "─", "┌", "┐", "└", "┘", "┼", "╱", "╲"]`
- **Diegetic Palette (KAD Aesthetic Directive ISA-015)**:
  - Deep Oxblood / Crimson background: `#1a080a` / `#2b0d12`
  - High-contrast Cyan / Ice-Blue data: `#68d5e8` / `#38bdf8`
  - Sanctity Gold for consecrated objects (Síntese, Khan altars): `#e7ba72` / `#fbbf24`

#### C. Framebuffer Decoupling (60 FPS vs Simulation Ticks)
- **Render Thread / Loop**: Runs at a smooth 30–60 FPS using ANSI cursor control (`\x1b[H`, `\x1b[?25l`), computing delta frames so that only characters that changed since the previous frame are emitted over stdout.
- **Simulation Loop**: Advances at discrete time steps (e.g. 1 tick = 30 virtual minutes; or realtime 2 ticks/second).
- **Cognitive Model Loop**: Executes asynchronously in the background via local inference endpoints; it **never** blocks the terminal rendering loop.

---

## 4. Gaya RPG World Substrate: Setting, Topology & Canon

### 4.1 The Spatial Topology: O Refúgio YKT
The 3D environment models the Refuge inside a massive ancient hollowed tree and surrounding canopy terraces:

| Room ID | Canonical Name | 3D Coordinates / Level | Connected Neighbors | Key Interactive Features |
| :--- | :--- | :--- | :--- | :--- |
| `room.heartwood.commons` | Commons do Coração | $(0, 0, 0)$ Ground Level | Kitchen, Pantry, Salon, Residential | Central Hearth, Council Assembly Table |
| `room.heartwood.kitchen` | Cozinha do Refúgio | $(10, 0, 0)$ East Wing | Commons, Pantry | Cooking Stoves, Ingredient Processing |
| `room.heartwood.pantry` | Despensa de Suprimentos | $(10, 10, 0)$ North-East | Kitchen, Commons | Storage Crates, Food Stocks |
| `room.douglas.salon` | Salão de Douglas | $(-10, 0, 0)$ West Wing | Commons, Terrace | Harpsichord, Tea Set, Diplomatic Lounge |
| `room.mana.classroom` | Sala de Aulas de Mana | $(0, 0, 10)$ Upper Canopy | Commons, Practice Chamber | Blackboards, Mana Crystals, Lecture Desks |
| `room.mana.practice` | Câmara de Prática Mágica | $(0, 10, 10)$ Upper North | Classroom | Protective Wards, Transmutation Circles |
| `room.synthesis.chamber` | Câmara de Síntese | $(0, -10, -10)$ Root Level | Deep Roots | Crucible of Transmutation, Sacred Sap |
| `room.residential.bunk_a` | Dormitório dos Aprendizes | $(-10, 10, 0)$ North-West | Commons | Bunk Beds, Personal Storage Lockers |

### 4.2 The Canonical Cast & Vocational Specialization
Each agent is seeded with canonical traits, attributes, and starting roles from `vault/50_Projects/Gaya_RPG/characters/`:

1. **Ayşa Öztoprak** (Level 7 Leader/Companion):
   - *Archetype*: Resource steward, culinary anchor, martial guardian.
   - *PIANO Motivation*: High focus on colony vitality and food preservation.
   - *Starting Inventory*: `crosta_de_kravarius`, `nyr_blade`, `zhar_blade`.
2. **Amethysta** (Level 7 Young Dragonkin Apprentice):
   - *Archetype*: Combatant, dragon pupil, impulsive learner.
   - *PIANO Motivation*: Seeks lessons from Begonio, social connection with Douglas and Ayşa.
   - *Starting Inventory*: `manto_de_kravarius`, `gem_shard`.
3. **Begonio Nackle** (Level 7 Gnome Arcane Master):
   - *Archetype*: Scholar, esoteric mana instructor, theoretical researcher.
   - *PIANO Motivation*: Delivers lectures in the mana classroom, experiments with synthesis.
   - *Starting Inventory*: `lesson_slate`, `mana_crystal`.
4. **Douglas** (Level 8 Diplomat / Salon Host):
   - *Archetype*: Mediator, cultural curator, council convener.
   - *PIANO Motivation*: Organizes civic debates, hosts tea ceremonies, diffuses etiquette memes.
   - *Starting Inventory*: `harpsichord_sheet`, `gem_shard`.

### 4.3 Cosmic Memeplex: Khan vs Yorman vs Síntese
The cultural diffusion dynamics operate over three competing memetic forces:
- **`meme:khan_vitality`**: Expansive, affirmative kinetic transformation, boldness in exploration and physical production.
- **`meme:yorman_equilibrium`**: Abjuration, structured restraint, adherence to protocol, conservation of resources.
- **`meme:douglas_courtesy`**: Diplomatic etiquette, reciprocal altruism, peaceful conflict resolution through council dialogue.

---

## 5. PIANO Architecture on Consumer Workstation Hardware

### 5.1 The Hardware Budget & Inference Envelope
- **Workstation Profile**:
  - CPU: AMD Ryzen 7 7700 (8 cores, 16 threads, AVX-512 enabled).
  - GPU: AMD Radeon RX (Navi 44) with ROCm / Vulkan acceleration.
  - System Memory: 32 GB DDR5 RAM.
- **Local Model Routing & Resource Allocation**:
  - **Model 1 (Narrative / Roleplay Persona)**: Stheno-v3.2-8B (or Lumimaid 8B) on GPU port 5001. Allocated context: 2048 tokens; max generation: 128 tokens.
  - **Model 2 (Cognitive Planning & Formal Reasoning)**: Qwen2.5-7B-Instruct (4-bit QLoRA / GGUF) on GPU/CPU port 5002. Allocated context: 2048 tokens; max generation: 192 tokens.
  - **Deterministic Engine**: Pure Node.js ESM ($0.00 cost, 0 token consumption).

### 5.2 The 6-Module PIANO Orchestration Loop

```
┌────────────────────────────────────────────────────────────────────────┐
│                     PIANO CONCURRENT AGENT CORE                        │
│                                                                        │
│   [Perception Stream 1]  Proprioception Module                         │
│                          (HP, Hunger, Fatigue, Mana, Inventory)        │
│                                     │                                  │
│   [Perception Stream 2]  Social Awareness Module                       │
│                          (Co-located Peers, Affinity, History)         │
│                                     │                                  │
│   [Perception Stream 3]  Action Awareness Module (Ablation Guard)      │
│                          (Feedback from Last Action, Rejection Hold)   │
│                                     │                                  │
│   [Perception Stream 4]  Memory Module (Ledger + Meme Graph)           │
│                          (Episodic History, Adopted Cultural Memes)    │
│                                     │                                  │
│                                     ▼                                  │
│   [Decision Stage 5]     Hierarchical Planning Module (SMDP Options)   │
│                          (Evaluates Urgencies -> Proposes Option)      │
│                                     │                                  │
│                                     ▼                                  │
│   [Arbitration Stage 6]  Cognitive Controller (CC)                     │
│                          (Translates Option to Atomic Validated Cmd)   │
└─────────────────────────────────────┬──────────────────────────────────┘
                                      │ Emits Command: { type, ... }
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     GAYA DETERMINISTIC KERNEL                          │
│                                                                        │
│   1. Precondition Validator (validator.mjs) -> ACCEPT / REJECT         │
│   2. State Transition Engine (transition.mjs) -> Apply Delta           │
│   3. Append-Only Cryptographic Ledger (ledger.mjs) -> Commit SHA-256   │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Context Economy & OpenViking Hierarchical Compression
To prevent context explosion and maintain sub-second local inference on consumer hardware:
1. **L0 Compression (Macro)**: Working memory contains only current room ID, essential vital thresholds (boolean flags like `isStarving`, `isExhausted`), and co-located peer IDs.
2. **L1 Compression (Structural)**: Dialogue histories are compressed into semantic digest summaries when conversations conclude.
3. **L2 Retrieval (Granular)**: Detailed lore notes or recipe steps are pulled on-demand via the local RAG engine (`tools/kad/research-rag-query.mjs`) only when the agent initiates a specialized action (such as crafting or spellcasting).

---

## 6. The 4 Emergent Civilizational Phenomena (Replicating Project Sid)

| Emergent Phenomenon | Project Sid Benchmark (Altera.AL) | Gaya RPG Implementation Mechanics |
| :--- | :--- | :--- |
| **1. Emergent Economy & Barter** | Agents spontaneously invent trade networks, exchanging raw materials for crafted tools using item utility. | Ayesha exchanges harvested food for Begonio's mana crystals or Douglas's gem shards. Handled via `trade` action with strict conservation invariants. |
| **2. Role Specialization** | Agents adopt sustained vocational divisions of labor without explicit centralized assignment. | Douglas settles into diplomacy and council leadership; Begonio focuses on mana instruction; Ayesha specializes in culinary logistics and safety. |
| **3. Democratic Governance** | Agents formulate civic rules, convene town halls, and vote on common tax/resource distribution laws. | Council meetings convene at `room.heartwood.commons` or `room.douglas.salon`. Agents vote on resource allocations via `vote` commands recorded on the ledger. |
| **4. Cultural Meme Diffusion** | Belief systems, religious creeds, and social norms spread epidemically across interaction graphs. | During `talk` interactions, agents transmit cultural memes (`meme:khan_vitality`, `meme:yorman_equilibrium`). Adoption rates are tracked across cycles in working memory. |

---

## 7. Candidate Claims & Verification Matrix for Astra ISA

Below is the formal YAML Claims block designed for Astra to ingest and validate during ISA compilation:

```yaml
claims:
  - id: CLAIM-GAYA-3D-ASCII-RENDER-001
    statement: "The 3D ASCII terminal engine renders room geometry and actor billboards with depth buffering and aspect-ratio compensation at >=30 FPS with zero external GPU windowing dependencies."
    class: DETERMINISTIC_PROPERTY
    target_state: "tools/gaya/ui/ascii-3d-engine.mjs exists, compiles, and passes rendering benchmark with <=33ms frame times."
    validator: "node --test tools/gaya/test/ascii-3d-engine.test.mjs"
    surfaces: ["surface.terminal.omarchy", "surface.tell.server"]
    components: ["component.gaya.ui.ascii3d"]
    hosts: ["host.amdy"]
    severity: BLOCKING
    status: CANDIDATE

  - id: CLAIM-GAYA-PIANO-CONCURRENT-MODULES-002
    statement: "PIANO cognitive architecture executes 4 decoupled perception streams concurrently into an arbitration Cognitive Controller without deadlock or race conditions."
    class: REPRODUCIBLE_BEHAVIOR
    target_state: "PianoCognitiveController processes Proprioception, Social, Action Awareness, and Memory streams in <=10ms."
    validator: "node --test tools/gaya/test/piano-playground.test.mjs"
    surfaces: ["surface.gaya.simulation"]
    components: ["component.gaya.piano.core"]
    hosts: ["host.amdy"]
    severity: BLOCKING
    status: VERIFIED

  - id: CLAIM-GAYA-ACTION-AWARENESS-ABLATION-003
    statement: "Action awareness module suppresses immediate retry loops upon command rejection, transitioning the agent into fallback SMDP macro-options."
    class: EMPIRICAL_OBSERVATION
    target_state: "Rejected commands flag working memory and trigger alternative option selection within 1 tick."
    validator: "node --test tools/gaya/test/piano-playground.test.mjs"
    surfaces: ["surface.gaya.simulation"]
    components: ["component.gaya.piano.awareness"]
    hosts: ["host.amdy"]
    severity: CRITICAL
    status: VERIFIED

  - id: CLAIM-GAYA-EMERGENT-CIVILIZATION-004
    statement: "Multi-agent simulation over 24+ ticks exhibits non-zero emergent economy trades, democratic governance votes, and cultural meme diffusion across the agent network."
    class: REPRODUCIBLE_BEHAVIOR
    target_state: "Simulation stats verify tradesExecuted >= 5, votesRecorded >= 1, and distinct meme adopters >= 2."
    validator: "node --test tools/gaya/test/piano-playground.test.mjs"
    surfaces: ["surface.gaya.simulation"]
    components: ["component.gaya.piano.emergence"]
    hosts: ["host.amdy"]
    severity: HIGH
    status: VERIFIED

  - id: CLAIM-GAYA-DETERMINISTIC-REPLAY-EXACTNESS-005
    statement: "Two independent simulation runs initialized with identical seeds and executed over identical ticks produce bit-for-bit identical state hashes and cryptographic event ledgers."
    class: MATHEMATICAL_INVARIANT
    target_state: "computeStateHash(runA) === computeStateHash(runB) and ledgerA.verifyIntegrity() === true."
    validator: "node --test tools/gaya/test/piano-playground.test.mjs"
    surfaces: ["surface.gaya.kernel"]
    components: ["component.gaya.kernel.replay"]
    hosts: ["host.amdy"]
    severity: BLOCKING
    status: VERIFIED

  - id: CLAIM-GAYA-LOCAL-INFERENCE-ENVELOPE-006
    statement: "Local model interaction operates strictly within the workstation resource budget (AMDY Ryzen 7 7700 + Navi GPU, <=2048 context window, $0.00 token cost)."
    class: RESOURCE_CONSTRAINT
    target_state: "All model invocation payloads enforce max_tokens <= 192 and pre-inference context compression <= 2048."
    validator: "node --test tools/kad/test/runtime-resource-inspection.test.mjs"
    surfaces: ["surface.gaya.model_bridge"]
    components: ["component.kad.inference.adapter"]
    hosts: ["host.amdy"]
    severity: CRITICAL
    status: CANDIDATE
```

---

## 8. Verification & Acceptance Gates

Before Astra promotes this snapshot to an active Ideal State Artifact (ISA), the following gates must be deterministically satisfied:

1. **Gate 1 (Kernel & Replay Exactness)**:
   ```bash
   node --test tools/gaya/test/kernel.test.mjs
   node --test tools/gaya/test/one-day-scenario.test.mjs
   node --test tools/gaya/test/piano-playground.test.mjs
   ```
   *Requirement*: 100% pass rate, zero nondeterministic timestamps or unseeded random calls.
2. **Gate 2 (Research & Epistemic Traceability)**:
   ```bash
   node --test tools/kad/test/research*.test.mjs
   ```
   *Requirement*: All 51 research tests pass, proving that all claims derive from verified seeds.
3. **Gate 3 (3D ASCII Viewport Prototype)**:
   A minimal prototype of `tools/gaya/ui/ascii-3d-engine.mjs` demonstrating:
   - DDA / raycasting room perspective.
   - Character depth rendering.
   - Non-blocking keyboard input loop (WASD / Turn / Interact).
