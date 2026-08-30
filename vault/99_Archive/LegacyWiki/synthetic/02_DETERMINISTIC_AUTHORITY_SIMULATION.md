---
doc_id: SIM_AUTHORITY_CORE
title: "Simulation & Core: Deterministic Authority Boundary & World Simulation"
domain: KAD_SIMULATION
epistemic_status: DESIGN_DECISION
source_documents:
  - wiki/KAD_Implementation_Plan.md
  - kad-lab/README.md
  - PRIME_DIRECTIVE.md
retrieval_keywords:
  - Authority Boundary
  - CandidateIntent
  - ValidatedIntent
  - Validator
  - Resolver
  - StateDiff
  - GameState
  - RPG
  - KHAYN // ABHEL : DYSKORDIA
  - EXPERIMENT-001
---

# Simulation & Core: Deterministic Authority Boundary

## Executive Summary
This document specifies the authority boundary separating non-deterministic probabilistic language models (interpreters) from the deterministic simulation core. The engine guarantees that untrusted player inputs and LLM proposals cannot directly mutate canonical game state without passing through deterministic schema validation, entity resolution, and atomic state diff application.

---

## 1. The Authority Boundary Architecture

```text
               PROBABILISTIC DOMAIN (Untrusted / Natural Language)
                                │
                          Raw User Input
                                │
                                ▼
                    Probabilistic Interpreter (LLM)
                                │
                                ▼
                         CandidateIntent
══════════════════════════════════════════════════════════════════════════
                         AUTHORITY BOUNDARY
══════════════════════════════════════════════════════════════════════════
               DETERMINISTIC DOMAIN (Trusted / Formal Verification)
                                │
                                ▼
                       Deterministic Validator
                                │
                   ┌────────────┴────────────┐
                   ▼ (Rejected)              ▼ (Accepted)
             RejectionEvent            ValidatedIntent
                                             │
                                             ▼
                                   Deterministic Resolver
                                             │
                                ┌────────────┼────────────┐
                                ▼            ▼            ▼
                             Event       StateDiff    GameState_after
```

---

## 2. Intent Data Contract & Schema

### CandidateIntent (Untrusted)
```json
{
  "verb": "Acquire",
  "target_entity": "key_brass_01",
  "source_entity": "room_a",
  "parameters": {
    "manner": "stealthily"
  },
  "raw_provenance": "I quickly pick up the brass key from the floor."
}
```

### ValidatedIntent (Pure & Authorized)
```json
{
  "verb": "Acquire",
  "actor_id": "player_01",
  "target_id": "key_brass_01",
  "source_id": "room_a",
  "validation_timestamp_mono": 1048576
}
```

### StateDiff (Atomic Mutation)
```json
{
  "entity_id": "player_01",
  "added_inventory": ["key_brass_01"],
  "removed_inventory": []
}
```

---

## 3. Core Validation & Resolution Invariants

* **[DESIGN_DECISION]** **Strict Schema Enforcement**: Missing verbs, multiple target entities, invented fields, or unknown entity IDs are rejected immediately.
* **[DESIGN_DECISION]** **Authority Leak Prevention**: If an LLM outputs simulation outcomes (e.g. `success: true` or `state_after: ...`), the Validator strips or rejects the payload.
* **[OBSERVED]** **State Invariance on Rejection**: A rejected `CandidateIntent` leaves `GameState` strictly byte-for-byte identical to `GameState_before`.
* **[DESIGN_DECISION]** **Atomic State Transition**: `GameState_after = apply(GameState_before, StateDiff)`. All transitions are replayable and deterministic.
* **[SOURCE_DERIVED]** **Zero Runtime LLM Inside Resolver**: The `Resolver` and `Validator` execute purely in deterministic code (C++20 / TypeScript) with zero runtime model invocations.

---

## 4. Worldbuilding & RPG Setting: KHAYN // ABHEL : DYSKORDIA (K.A.D.)

### Setting Pillars
- **Cyberpunk & Supernatural Synthesis**: Urban Brazil, Salvador street mythology, digital demiurges, constellation networks, and occult algorithmic factions.
- **Entities**: Players, Factions (DATA, ABHEL, KHAYN, DYSKORDIA), Artifacts (keys, cyberdecks, nodes), and Spatial Locales (rooms, matrix subnets).
- **Synthetic Interaction Pipeline**: LLM generates natural dialogue and intent proposals; Deterministic Resolver verifies and commits canon facts.
