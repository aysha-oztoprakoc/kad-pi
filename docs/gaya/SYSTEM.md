# Gaya — The YKT Refuge — System Definition

_**This file is the living architectural source of truth for Gaya: The YKT Refuge.** The interactive atlas and SYSTEM.md twin are compiled from this data file._

_Question status: **0 open · 13 resolved**._

## One paragraph

Gaya: The YKT Refuge is a 2D ASCII settlement simulation combining Dwarf Fortress emergent life, RimWorld schedule/needs logistics, Factorio data-driven recipes, and modded Minecraft room structures with canonical Gaya tabletop cosmology. The distinctive technical architecture separates mechanical state authority from local LLM cognition: all available local models (Stheno, Qwen, Lumimaid, RP-Hero) act as pluggable actor controllers proposing structured actions, while a pure deterministic kernel validates, prices, and commits all state transitions into an append-only event ledger.

## Decisions locked

| Axis | Decision | ADR |
|---|---|---|
| Bootstrap Sequencing | Tracer-Bullet Zero-LLM Deterministic Kernel + Explorable System Atlas First (WP-000 + WP-001) | [D-GAYA-001](../../evidence/WP-GAYA-001/01-wayfinder-decision-map.md) |
| State Authority | Deterministic kernel owns state, rules, costs, legal actions, event order, and replay; models only propose | [ADR-0005](../adr/0005-deterministic-first-and-epistemic-classification.md) |
| Model Replay | Kernel replay uses strict command tapes; model evaluation uses cached proposal tapes or recorded decision fingerprints | [ADR-0004](../adr/0004-model-agnostic-control-plane.md) |
| Epistemic Provenance | Every record is labeled (Approved canon, Proposed design, Simulated event, Character belief, Unknown); unknowns remain UNKNOWN | [ADR-0003](../adr/0003-intent-authority-boundary.md) |
| Local Inference Fit | Pre-inference resource admission enforces context windows (2048) and output token caps before invoking local models | [ADR-0014](../adr/0014-generalized-ideal-state-artifact-and-compute-fabric-governance.md) |

## Cost model

| Resource Tier | Role | Hardware Target | Cost / Limit |
|---|---|---|---|
| **Deterministic Engine** | Kernel, state transitions, replay | AMDY CPU / Node ESM | $0.00 · 0 token overhead |
| **Local World Model** | Amethysta/Douglas RP personas | AMDY Vulkan GPU (Port 5001: Stheno-v3.2 8B) | $0.00 · 2048 ctx · 128 max tokens |
| **Local Retrieval Model** | Begonio instruction / Tactics | AMDY Vulkan GPU (Port 5002: Qwen3.5 9B) | $0.00 · 2048 ctx · 192 max tokens |
| **Remote Inference** | Emergency planning / Review only | Cloud reasoning models (Gemini 3.8 / Codex) | Governed spend · Zero direct simulation mutation |
## Deep dives

See [KAD-PI Technical Handoff: Gaya Multi-Model ASCII Game](/home/amdy/Downloads/GAYA_KAD_PI_MULTI_MODEL_ASCII_GAME_HANDOFF_2026-09-08.md) and [Evidence D-GAYA-001](../../evidence/WP-GAYA-001/01-wayfinder-decision-map.md).

## Reading order (the atlas chapters)

1. **The Deterministic Refuge Core** — At the foundation sits a pure deterministic state machine with an append-only ledger. _(adds K, S, E)_
2. **The Command & Validation Barrier** — No action touches world state without passing through the Action Validator. _(adds V, SC)_
3. **The Multi-Model Actor Fabric** — Local models propose actions; the kernel commits them. _(adds MR, FC, ST, QW)_
4. **Canon & Síntese Boundaries** — Protecting tabletop canon and governing cosmic transmutations. _(adds CAN, SIN)_
5. **Presentation & Control Surfaces** — Human interaction via terminal ASCII shell and optional SillyTavern extension. _(adds TUI, STE)_
6. **The Whole System** — The complete multi-model deterministic settlement simulation architecture.

## Structures

### Deterministic Simulation Core

#### K · Simulation Kernel

**In one line.** The authoritative state machine executing discrete time ticks and atomic command batches.

**What it does.** Maintains canonical world state, advances clock ticks, applies validated transactions, and notifies subscribers.

**How it's built.** Pure ESM function `State(t+1) = Apply(Ruleset, State(t), AcceptedCommands, RNG)` with zero side-effects outside event generation.

**Steps in execution.**

1. **Collect** — Gather pending commands from human, scripted routines, or model proposal buffers.
2. **Validate** — Send each command through the Action Validator for precondition and cost checks.
3. **Commit** — Execute atomic state transition and write committed event into the append-only ledger.
4. **Notify** — Emit PON facts and advance actor needs (hunger, fatigue, reservations).

**Questions.**

- ~~**Q-K1** Can an unvalidated action enter the kernel?~~ ✓ No. All inputs pass through the Action Validator barrier (D-GAYA-001).
- ~~**Q-K2** How is logical actor order determined?~~ ✓ Fixed deterministic ordering by actor ID and tick (2026-09-08).

#### S · World State & Snapshots

**In one line.** Normalized state tree containing rooms, residents, inventories, schedules, and reservations.

**What it does.** Holds the complete current state of the YKT Refuge. Supports snapshotting, forking, diffing, and restoration.

**How it's built.** JSON-serializable immutable state container with canonical key sorting and deterministic SHA256 hashing.

**Steps in execution.**

1. **Serialize** — Convert entities, rooms, needs, and resource pools into canonical JSON.
2. **Hash** — Compute sha256 digest of normalized state for replay comparison.
3. **Fork** — Clone state branch at current tick for counterfactual tournament comparison.

**Questions.**

- ~~**Q-S1** Does state persist across sessions?~~ ✓ Yes, via snapshot manager into SQLite/JSON run manifests (2026-09-08).

#### V · Action Validator

**In one line.** Precondition and economic gatekeeper rejecting unaffordable or illegal action proposals.

**What it does.** Checks whether an actor is alive, present in the room, has required items/skills, and whether resources are free.

**How it's built.** Pure function producing an explicit receipt: `ACCEPTED` or `REJECTED(reason_code)`.

**Steps in execution.**

1. **Preconditions** — Verify actor location, status, and target eligibility.
2. **Affordability** — Verify Khan/Yorman or material supplies and reserve inputs atomically.
3. **Receipt** — Return structured receipt with accepted event ID or rejection reason.

**Questions.**

- ~~**Q-V1** Can a model hallucinate an action?~~ ✓ Yes, but the validator rejects it with an explicit receipt and zero world mutation.

#### E · Event Ledger

**In one line.** Immutable append-only record of all committed facts with causation IDs and before/after hashes.

**What it does.** Provides the ground truth audit trail for settlement history, chronicle generation, and replay qualification.

**How it's built.** JSON event sequence where each event records `event_id`, `causation_id`, `before_hash`, `after_hash`.

**Steps in execution.**

1. **Append** — Record event immediately upon kernel state commit.
2. **Hash** — Chain state hashes to guarantee tampering is detectable.
3. **Project** — Feed presentation layers and chronicle generators without re-querying state.

**Questions.**

- ~~**Q-E1** Can history be edited?~~ ✓ Never. Corrections are new compensating events or forks (2026-09-08).

### Multi-Model Actor Fabric

#### MR · Model Registry

**In one line.** Inventory and health status of all available local LLMs on AMDY/TELL hardware.

**What it does.** Tracks model GGUF weights, KoboldCpp ports, verified context windows, output caps, and role qualifications.

**How it's built.** Dynamic JSON registry populated by active health probes against ports 5001, 5002, etc.

**Steps in execution.**

1. **Probe** — Check localhost port availability and model identity.
2. **Verify** — Read proven parameter bounds (Vulkan device, max tokens, context size).
3. **Authorize** — Grant actor controller permission (never file/kernel mutation authority).

**Questions.**

- ~~**Q-MR1** What if an endpoint goes offline?~~ ✓ Actor degrades deterministically to scripted policy or human pause (2026-09-08).

#### FC · Context & Fit Compiler

**In one line.** Pre-inference admission engine compiling actor observations into bounded prompts.

**What it does.** Filters world facts by actor perception scope and validates prompt size against model context limits.

**How it's built.** Enforces grammar-constrained output schema (gaya.action.v1) and rejects over-budget observations.

**Steps in execution.**

1. **Scope** — Filter state to what the character actually sees and knows.
2. **Pack** — Format legal choices and need meters into structured observation JSON.
3. **Admit** — Verify total token budget <= model context limit before dispatch.

**Questions.**

- ~~**Q-FC1** Can a model see another character’s secrets?~~ ✓ No. Observation filtering strips facts outside actor knowledge scope.

#### ST · Stheno v3.2 Local

**In one line.** Local 8B model (port 5001) specialized for expressive character dialogue and domestic life.

**What it does.** Controls personas like Amethysta, Douglas, or refuge residents during social and creative turns.

**How it's built.** KoboldCpp OpenAI-compatible endpoint with Llama-3 prompt template, temperature=0 for evaluation.

**Steps in execution.**

1. **Inference** — Receive observation prompt and return structured choice + dialogue draft.
2. **Propose** — Send gaya.action.v1 proposal to Action Validator.

**Questions.**

- ~~**Q-ST1** Can Stheno grant herself items?~~ ✓ No. Proposals only select from legal choice IDs generated by the kernel.

#### QW · Qwen 3.5 9B Local

**In one line.** Local 9B model (port 5002) specialized for tactical drills, resource logistics, and instruction.

**What it does.** Controls instructors like Begonio or tactical combat drills, proposing analytical decisions.

**How it's built.** KoboldCpp ChatML endpoint with reasoning effort controls and 192 output token limit.

**Steps in execution.**

1. **Analyze** — Evaluate combat formations or magic study lesson choices.
2. **Propose** — Return structured choice proposal with reason label.

#### SC · Scripted Policy

**In one line.** Zero-LLM deterministic fallback executing rule-based schedules and priority queues.

**What it does.** Powers the baseline game without requiring any GPU or local model. Serves as graceful degradation target.

**How it's built.** Rule table evaluating needs (if hunger > 0.7 -> eat; if fatigue > 0.8 -> rest; else work duty).

**Steps in execution.**

1. **Evaluate** — Check priority matrix against current needs and schedule.
2. **Submit** — Emit legal action command directly to validator.

**Questions.**

- ~~**Q-SC1** Is the game playable without models?~~ ✓ Yes. Option 1 delivers the full one-day refuge slice under scripted policy.

### Canon & Epistemic Boundaries

#### CAN · Gaya Canon Codex

**In one line.** Immutable repository of verified Gaya cosmology, character codexes, and epistemic labels.

**What it does.** Maintains Khan/Yorman definitions, Ayşa/Amethysta canon, and marks unapproved lore as UNKNOWN.

**How it's built.** Strict registry mapping IDs to canon status. Rejects fabricated city reserves or unapproved spells.

**Steps in execution.**

1. **Validate** — Verify entity claims against approved tabletop source documents.
2. **Filter** — Block game branches from altering canonical codex entries.

**Questions.**

- ~~**Q-CAN1** Can gameplay overwrite tabletop canon?~~ ✓ Never. Simulated events remain isolated to their run branch (2026-09-08).

#### SIN · Síntese Engine

**In one line.** Conceptual matter-manipulation engine governing Khan and Yorman expenditure.

**What it does.** Enforces Ayşa’s Yaark Nustraad rules: perception of skeins, eligibility predicates, approved recipes.

**How it's built.** Checks eligibility (inanimate or killed by Ayşa), debits Khan/Yorman pools, and produces approved items.

**Steps in execution.**

1. **Perceive** — Check if target skein is visible and eligible for manipulation.
2. **Recipe Check** — Verify requested craft has an approved recipe in the content registry.
3. **Transmute** — Spend Khan/Yorman and synthesize verified product into inventory.

**Questions.**

- ~~**Q-SIN1** Can Síntese synthesize arbitrary prompt ideas?~~ ✓ No. Only approved recipes in the content registry can execute.

### Presentation & Control Surfaces

#### TUI · ASCII Terminal Shell

**In one line.** Keyboard-driven terminal interface rendering the ASCII refuge map, status, and choice menu.

**What it does.** Renders Heartwood Commons, kitchen, dormitories, present actors, and displays context-sensitive menus.

**How it's built.** Pure Node.js stdout renderer using ANSI TrueColor/monospace with zero external heavy frameworks.

**Steps in execution.**

1. **Render** — Display ASCII map, actor positions, status meters, and log.
2. **Input** — Capture keyboard choice (1..9) and translate to command packet.
3. **Receipt** — Display action receipt and dialogue draft in separated text panels.

**Questions.**

- ~~**Q-TUI1** Is color required to play?~~ ✓ No. Symbols and text are fully readable in monochrome (2026-09-08).

#### STE · SillyTavern Adapter _(not switched on)_

**In one line.** Future extension exposing refuge dialogue and character cards into SillyTavern web UI.

**What it does.** Projects committed events into SillyTavern chat panels while reading live HP and inventory from the kernel.

**How it's built.** Local HTTP/WebSocket bridge syncing Gaya_Codex.json and Character Card V2 metadata.

**Steps in execution.**

1. **Sync** — Transmit committed state facts to SillyTavern character context.
2. **Chat** — Allow player to converse with NPC personas using local models.

**Questions.**

- ~~**Q-STE1** Can SillyTavern overwrite kernel state?~~ ✓ No. Kernel remains sole authority; SillyTavern is view/chat only.

## Flows (representative packets)

Payload shapes are what the design implies, not measured traffic.

### Single Actor Turn

| # | From → To | Packet | Representative payload |
|---|---|---|---|
| 1 | K → FC | observation | `{"actor_id":"npc.amethysta","hunger":0.72,"legal_choices":["eat.shared_meal","rest.short"]}` |
| 2 | FC → ST | prompt | `{"model":"stheno-local","max_tokens":128}` |
| 3 | ST → V | action proposal | `{"choice_id":"eat.shared_meal","dialogue_draft":"I am hungry. May I eat?"}` |
| 4 | V → K | validated command | `{"status":"ACCEPTED","cost":{"shared.food":1}}` |
| 5 | K → S | state mutation | `{"shared.food":3,"amethysta.hunger":0.1}` |
| 6 | K → E | event commit | `{"event_type":"meal.consumed","tick":42}` |
| 7 | E → TUI | receipt log | `{"text":"Amethysta ate a meal in the Heartwood Commons."}` |

### Síntese Transmutation Flow

| # | From → To | Packet | Representative payload |
|---|---|---|---|
| 1 | TUI → SIN | propose synthesis | `{"actor":"aysha","target":"molted_scales","recipe":"kravarius_reinforcement"}` |
| 2 | SIN → CAN | verify recipe | `{"recipe_id":"kravarius_reinforcement"}` |
| 3 | CAN → SIN | recipe verified | `{"approved":true,"cost_khan":10,"cost_yorman":5}` |
| 4 | SIN → V | submit transaction | `{"debit":{"khan":10,"yorman":5},"produce":"reinforced_shield"}` |
| 5 | V → K | execute synthesis | `{"status":"ACCEPTED"}` |
| 6 | K → E | commit event | `{"event_type":"sintese.completed"}` |

### Deterministic Replay Verification

| # | From → To | Packet | Representative payload |
|---|---|---|---|
| 1 | E → K | load command tape | `{"run_id":"run-001","command_count":50}` |
| 2 | K → S | reset to initial seed | `{"seed":1337,"tick":0}` |
| 3 | K → S | re-apply commands | `{"tick":50}` |
| 4 | S → K | compute state hash | `{"final_hash":"sha256:..."}` |
| 5 | K → E | verify event ledger hash | `{"match":true}` |

## Questions — index

Reference by ID. ✓ resolved (with date) · otherwise open.

- ~~**Q-K1**~~ (K) ✓ No. All inputs pass through the Action Validator barrier (D-GAYA-001).
- ~~**Q-K2**~~ (K) ✓ Fixed deterministic ordering by actor ID and tick (2026-09-08).
- ~~**Q-S1**~~ (S) ✓ Yes, via snapshot manager into SQLite/JSON run manifests (2026-09-08).
- ~~**Q-V1**~~ (V) ✓ Yes, but the validator rejects it with an explicit receipt and zero world mutation.
- ~~**Q-E1**~~ (E) ✓ Never. Corrections are new compensating events or forks (2026-09-08).
- ~~**Q-MR1**~~ (MR) ✓ Actor degrades deterministically to scripted policy or human pause (2026-09-08).
- ~~**Q-FC1**~~ (FC) ✓ No. Observation filtering strips facts outside actor knowledge scope.
- ~~**Q-ST1**~~ (ST) ✓ No. Proposals only select from legal choice IDs generated by the kernel.
- ~~**Q-SC1**~~ (SC) ✓ Yes. Option 1 delivers the full one-day refuge slice under scripted policy.
- ~~**Q-CAN1**~~ (CAN) ✓ Never. Simulated events remain isolated to their run branch (2026-09-08).
- ~~**Q-SIN1**~~ (SIN) ✓ No. Only approved recipes in the content registry can execute.
- ~~**Q-TUI1**~~ (TUI) ✓ No. Symbols and text are fully readable in monochrome (2026-09-08).
- ~~**Q-STE1**~~ (STE) ✓ No. Kernel remains sole authority; SillyTavern is view/chat only.

## What the platform gives vs what we own

**Platform gives:** KAD-PI workspace substrate, workctl lifecycle claims, local KoboldCpp Vulkan inference servers, SillyTavern asset sync script.

**We own:** Deterministic domain simulation kernel, command validators, append-only SHA256 event ledger, ASCII terminal renderer, local model observation/action compiler, Gaya content registry.

## Planned filesystem

```
tools/gaya/
  kernel/
    state.mjs
    transition.mjs
    validator.mjs
    ledger.mjs
  content/
    registry.mjs
    codex.mjs
    rooms.mjs
    recipes.mjs
  models/
    registry.mjs
    compiler.mjs
    adapter.mjs
    scripted-policy.mjs
  ui/
    ascii-terminal.mjs
    render.mjs
  test/
    kernel.test.mjs
    replay.test.mjs
    sintese.test.mjs
    model-contract.test.mjs
docs/gaya/
  atlas/
    data.mjs
    build.mjs
    template.html
  SYSTEM.md
  atlas.html
```

## How this file is maintained

Generated from `docs/gaya/atlas/data.mjs` by `node docs/gaya/atlas/build.mjs`, which also builds the interactive atlas (`atlas.html`). Edit the data file, rebuild, republish — never edit this file by hand.
