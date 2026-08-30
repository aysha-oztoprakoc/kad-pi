---
kad_id: ISA-KAD-COMPUTE-FABRIC-001
title: KAD Compute Fabric Ideal State Artifact (ISA)
type: governance
domain: compute-fabric
version: 1.0.0
status: ACCEPTED
authority: CANONICAL_KNOWLEDGE
epistemic_class: PROJECT_INFERENCE
review_status: APPROVED
visibility: project
context_eligible: false
train_eligible: false
publish: false
temporal_status: CURRENT
owner: Human Project Lead & KAD Architecture
date: 2026-08-30
supersedes: []
related_adrs:
  - docs/adr/0001-notification-oriented-causality.md
  - docs/adr/0002-spatiotemporal-composability-cordis-ownership.md
  - docs/adr/0004-model-agnostic-control-plane.md
  - docs/adr/0005-deterministic-first-and-epistemic-classification.md
  - docs/adr/0014-generalized-ideal-state-artifact-and-compute-fabric-governance.md
affected_hosts:
  - host.amdy.workstation
  - host.tell.server
affected_components:
  - component.kad.economic_router
  - component.kad.telemetry_observatory
  - component.kad.resource_contract
  - component.kad.swarm_control_plane
  - component.kad.distillation
---

# KAD Compute Fabric Ideal State Artifact (ISA)

## 1. Identity
- **ISA ID**: `ISA-KAD-COMPUTE-FABRIC-001`
- **Title**: Canonical Compute Fabric Architecture, Cognition Routing & Self-Measuring Governance Specification
- **Scope**: Heterogeneous compute resource governance across developer workstation (`amdy`), homelab server (`tell`), local models (Qwen, Stheno), and remote inference providers.
- **Version**: `1.0.0`
- **Status**: `ACCEPTED`
- **Authority**: `CANONICAL_KNOWLEDGE` (Target architecture governed by Human Project Lead and canonical KAD Architecture; empirical claims validated deterministically).

---

## 2. Stated Goal

> **Build a self-measuring compute fabric that discovers the cheapest reliable way to complete each kind of cognition using whatever resources currently exist.**
>
> **Exploit aggressively. Depend conservatively. Measure empirically. Preserve evidence. Use stronger cognition only when cheaper cognition cannot satisfy the contract.**

---

## 3. Ideal State Description

The KAD compute fabric operates as a self-measuring, spatiotemporally composable (STC), notification-driven (PON) cognition substrate:
1. **Capability Abstraction**: Workloads express requirements in terms of *cognition classes*, *quality levels*, *context windows*, and *structural constraints*, completely decoupled from physical hosts, vendor APIs, or specific model identities.
2. **Empirical Self-Measurement**: Every inference execution profile is represented as an experimental tuple (`model × quant × runtime × devices × context × KV × speculation × threading × network`) continuously benchmarked across 11 empirical telemetry metrics:
   - `ttft_ms`: Time to first token in milliseconds.
   - `prefill_tok_per_sec`: Prompt processing throughput.
   - `decode_tok_per_sec`: Token generation throughput.
   - `peak_vram_bytes`: Peak video memory allocation.
   - `peak_ram_bytes`: Peak system memory allocation.
   - `network_transfer_bytes`: Ingress/egress bandwidth cost.
   - `failure_rate`: Ratio of failed to total execution attempts.
   - `task_acceptance_rate`: Fraction of task outputs accepted by deterministic validation.
   - `structured_output_validity`: Conformance to requested JSON/YAML schemas without repair.
   - `quality_score`: Empirical evaluation score on standard tasks.
   - `scarce_resource_cost`: Multi-dimensional cost weighting across money, quota, energy, and latency.
3. **Downward Migration Invariant**: Work naturally flows to the cheapest reliable execution tier—starting with deterministic tools, then tiny specialists, local models, free remote lanes, subscription quotas, and only escalating to frontier remote models or human intervention when necessary.
4. **Lifecycle Sanctity**: Every process, model weight allocation, GPU VRAM reservation, and RPC socket has explicit ownership with guaranteed LIFO teardown. Zero zombie processes or unmanaged resource leaks.
5. **Fail-Safe Degradation**: Subsystem or provider outages trigger graceful capability reduction without silent authority escalation or unauthorized spend.
---

## 4. Core Architectural Directives

### 4.1 PON (Notification-Oriented Paradigm)
- Meaningful state transitions emit typed punctual notifications:
  `NODE_AVAILABLE`, `NODE_OFFLINE`, `MODEL_READY`, `MODEL_UNLOADED`, `CAPABILITY_REMOVED`, `ROUTE_STALE`, `BENCHMARK_ACCEPTED`, `RESOURCE_EXHAUSTED`, `QUOTA_REFRESHED`.
- Components prefer event notification subscriptions over polling loops.

### 4.2 STC — Spatial Composability
- Tasks declare required capabilities, not machines or vendor names:
  ```yaml
  requires:
    cognition: reasoning
    quality: high
    context_tokens: 32768
    structured_output: true
    trust_domain: engineering
  ```
- Physical machines, container runtimes, and model instances are swappable capability providers.

### 4.3 STC — Temporal Composability
- Explicit lifecycle ownership is enforced for:
  - In-memory model weights and GPU context buffers.
  - Local runtime daemons and RPC sockets.
  - VRAM and RAM reservations.
  - Benchmark sessions and execution leases.
- Teardown is LIFO and leaves zero unowned residue.

### 4.4 TDD & Empirical Promotion
- Route promotion requires local empirical evidence recorded in immutable journals.
- Theoretical capabilities, vendor marketing, or model reputation constitute a `HYPOTHESIS`, never authorizing promotion.
- Negative benchmark results and execution failures are retained as durable negative evidence.

### 4.5 Graceful Degradation
- **Invariant**: *Degrade capability; never silently escalate authority or spend.*
- Canonical degradation cascade:
  ```text
  distributed large local
  → large local
  → small local
  → tiny specialist
  → free remote
  → cheap paid remote
  → frontier remote
  → human
  ```

### 4.6 TOKENMAXXING Objective
- Primary optimization objective:
  $$\text{Efficiency} = \frac{\text{accepted useful work}}{\text{scarce resources used}}$$
- Scarce resources include: remote provider quota, money, latency, VRAM, RAM, compute cycles, network bandwidth, energy, context tokens, and human attention.
- Optimization for raw token production or unbounded chat cycles is strictly prohibited (**No SLOPMAXXING**).

---

## 5. Heterogeneous Host Model

The experimental deployment spans heterogeneous hosts without forcing OS standardization:

```text
amdy:
  role: workstation / control plane / primary interactive inference
  OS: Omarchy 4 Quattro (Arch Linux)
  hardware: AMD Ryzen 7 7700 8-Core, AMD Radeon RX 9060 XT (16GB VRAM)
  profile: KAD_PROFILE_FULL

tell:
  role: server / homelab / heterogeneous batch inference
  OS: NixOS
  hardware: Headless server, x86_64, pooled compute
  profile: KAD_PROFILE_SERVER
```

Required boundary architecture:
```text
host-specific implementation (amdy / tell)
        ↓
canonical capability adapter
        ↓
KAD cognition policy
```

OS-specific tooling, package managers, and paths must never leak into generic cognition contracts.

---

## 6. Cognition Classes & Downward Routing Hierarchy

### 6.1 Cognition Taxonomy
Ten distinct, capability-oriented cognition classes define the task taxonomy:
1. `deterministic_transformation`: AST refactors, schema validation, string munging, formatting.
2. `classification_extraction`: Information extraction, entity recognition, intent labeling.
3. `retrieval_ranking`: BM25, semantic vector ranking, citation linking, graph filtering.
4. `summarization`: Context condensation, change logging, meeting/transcript distillation.
5. `structured_generation`: JSON schema adherence, YAML serialization, code boilerplate.
6. `coding_review`: Implementation diffs, syntax-aware refactoring, lint correction.
7. `planning_reasoning`: Multi-step workpackage breakdown, architectural pathfinding.
8. `research_synthesis`: Literature review, epistemic cross-referencing, hypothesis evaluation.
9. `verification_critique`: Adversarial stress-testing, claim auditing, security checks.
10. `simulation`: Agentic world modeling, stateful game-loop transitions, counterfactual projection.

### 6.2 Downward Precedence
When routing work, preference strictly follows the downward migration order:
```text
existing deterministic tool
→ justified deterministic tool
→ tiny specialist
→ small local model
→ strong local model
→ free remote
→ cheap paid remote
→ frontier remote
→ human
```
Correctness, authority boundaries, privacy/trust domains, and deadlines override cost.

---

## 7. Testable Claims

```yaml
claims:
  - id: ISA-KAD-COMPUTE-001
    statement: "Meaningful compute state transitions emit typed PON notifications rather than relying on active polling."
    class: DETERMINISTIC
    target_state: CANONICAL_TARGET
    validator: compute.pon.typed_notifications
    components: [component.kad.economic_router, component.kad.swarm_control_plane]
    severity: BLOCKER
    status: PASS
    evidence: "PRIME_DIRECTIVE.md Section 3 & tools/kad/pon-engine.mjs"

  - id: ISA-KAD-COMPUTE-002
    statement: "Tasks request spatial capability contracts (cognition, quality, context) rather than hardcoded machine identities."
    class: DETERMINISTIC
    target_state: CURRENT_CONFIRMED
    validator: compute.stc.spatial_capability_contracts
    components: [component.kad.resource_contract, component.kad.economic_router]
    severity: BLOCKER
    status: PASS
    evidence: "tools/kad/resource-contract.mjs & tools/kad/test/resource-contract.test.mjs"

  - id: ISA-KAD-COMPUTE-003
    statement: "Local models, runtimes, and worker processes enforce explicit temporal lifecycle ownership and LIFO teardown."
    class: DETERMINISTIC
    target_state: CURRENT_CONFIRMED
    validator: compute.stc.temporal_lifecycle_ownership
    components: [component.kad.swarm_control_plane]
    severity: BLOCKER
    status: PASS
    evidence: "tools/kad/swarm-workers.mjs & tools/kad/test/local-qwen-lifecycle.test.mjs"

  - id: ISA-KAD-COMPUTE-004
    statement: "Route promotion requires local empirical evidence; theoretical capability creates a hypothesis only."
    class: DETERMINISTIC
    target_state: CURRENT_CONFIRMED
    validator: compute.tdd.empirical_route_promotion
    components: [component.kad.telemetry_observatory]
    severity: BLOCKER
    status: PASS
    evidence: "tools/kad/test/readiness.test.mjs & tools/kad/telemetry/observatory.mjs"

  - id: ISA-KAD-COMPUTE-005
    statement: "Capability degradation gracefully steps through lower tiers without silently escalating authority or spend."
    class: DETERMINISTIC
    target_state: CURRENT_CONFIRMED
    validator: compute.degradation.fail_safe_hierarchy
    components: [component.kad.economic_router]
    severity: BLOCKER
    status: PASS
    evidence: "tools/kad/economic-router.mjs & tools/kad/test/economic-router.test.mjs"

  - id: ISA-KAD-COMPUTE-006
    statement: "System optimizes for useful work per scarce resource used and rejects ungrounded token generation (TOKENMAXXING)."
    class: DETERMINISTIC
    target_state: CURRENT_CONFIRMED
    validator: compute.tokenmaxxing.efficiency_metric
    components: [component.kad.telemetry_observatory]
    severity: HIGH
    status: PASS
    evidence: "tools/kad/telemetry/tokenmaxxing.mjs & tools/kad/test/telemetry.test.mjs"

  - id: ISA-KAD-COMPUTE-007
    statement: "Heterogeneous host definitions (AMDY vs TELL) adapt into canonical capability contracts without OS leakage."
    class: DETERMINISTIC
    target_state: CANONICAL_TARGET
    validator: compute.hosts.heterogeneous_adapter_boundary
    hosts: [host.amdy.workstation, host.tell.server]
    severity: HIGH
    status: PASS
    evidence: "vault/00_Governance/ISA-KAD-COMPUTE-FABRIC-001.md Section 5"

  - id: ISA-KAD-COMPUTE-008
    statement: "Ten distinct capability-oriented cognition classes define task classification and routing contracts."
    class: DETERMINISTIC
    target_state: CANONICAL_TARGET
    validator: compute.cognition.ten_class_taxonomy
    components: [component.kad.economic_router]
    severity: HIGH
    status: PASS
    evidence: "vault/00_Governance/ISA-KAD-COMPUTE-FABRIC-001.md Section 6"

  - id: ISA-KAD-COMPUTE-009
    statement: "Inference execution configurations are evaluated against the 9-dimensional experimental tuple schema."
    class: DETERMINISTIC
    target_state: CANONICAL_TARGET
    validator: compute.measurement.experimental_tuple_schema
    components: [component.kad.telemetry_observatory]
    severity: HIGH
    status: PASS
    evidence: "vault/00_Governance/ISA-KAD-COMPUTE-FABRIC-001.md Section 7"

  - id: ISA-KAD-COMPUTE-010
    statement: "Repeated accepted probabilistic work generates candidates for downward distillation and deterministic replacement."
    class: DETERMINISTIC
    target_state: CURRENT_CONFIRMED
    validator: compute.distillation.downward_migration_policy
    components: [component.kad.distillation]
    severity: HIGH
    status: PASS
    evidence: "tools/kad/distillation.mjs & tools/kad/test/distillation.test.mjs"

  - id: ISA-KAD-COMPUTE-011
    statement: "Presentation, observation, and telemetry layers have zero direct mutation authority over compute routing state."
    class: DETERMINISTIC
    target_state: CURRENT_CONFIRMED
    validator: compute.governance.zero_shell_mutation
    components: [component.kad.economic_router, component.kad.telemetry_observatory]
    severity: BLOCKER
    status: PASS
    evidence: "tools/kad/test/economic-shadow.test.mjs"

  - id: ISA-KAD-COMPUTE-012
    statement: "Canonical compute fabric architecture and self-measuring governance approved by Human Project Lead."
    class: HUMAN_REVIEW
    target_state: CANONICAL_TARGET
    validator: compute.architecture.human_governed_target
    components: [component.kad.economic_router, component.kad.swarm_control_plane]
    severity: BLOCKER
    status: PASS
    evidence: "WP-KAD-GENERALIZED-IDEAL-STATE-ARTIFACT-020 Acceptance"
```

---

## 8. Operational Constraints & Boundaries

1. **Deterministic Precedence**: Deterministic algorithms, parsers, schemas, and static analysis outrank probabilistic models for every applicable workload.
2. **Economic Bounding**: Paid API spend remains disabled by default (`paidAuthorized: false`). Quota exhaustion fails closed or drops to local/free tiers.
3. **Secret Isolation**: Provider API keys, credentials, and raw auth headers are redacted before telemetry recording or receipt generation.
4. **Telemetry Non-Mutating**: Observatories and telemetry stream collectors are strictly passive observers; telemetry events cannot directly mutate routing state.

---

## 9. Anti-Patterns & Anti-Goals

1. **SLOPMAXXING**: Optimizing for raw token output, chat verbosity, or speculative multi-agent circular reasoning.
2. **Zombie Compute**: Leaving detached worker processes, unmanaged VRAM allocations, or open TCP sockets running without owner fiber tracking.
3. **Silent Authority Escalation**: Falling back from a local failure to an unapproved paid remote tier or wider filesystem permissions.
4. **Host Standardization Dogma**: Forcing AMDY and TELL into identical operating systems or identical runtime paths.
5. **Reputation-Driven Promotion**: Promoting a route based on model marketing, synthetic benchmarks, or leaderboard hype without local empirical evidence.

---

## 10. Graceful Degradation Scenarios

- **Local GPU Memory Pressure (VRAM Exhaustion)**: Drops context window, activates quant quantization fallback, or routes to headless server (`tell`) before considering remote providers.
- **Server Node Offline (`tell` Unavailable)**: Local workstation (`amdy`) handles essential cognition tasks locally; non-critical batch jobs queue safely.
- **Free Remote Quota Exhausted**: Bounded local model takes over extraction/ranking tasks; tasks requiring unavailable frontier capabilities queue with status `BLOCKED` rather than silently incurring paid spend.
- **Telemetry Collector Failure**: Work execution continues safely; unmonitored sessions record local fallback receipts without blocking core computation.

---

## 11. Acceptance Matrix

| Claim ID | Class | Target State | Severity | Automated Validator | Status |
|---|---|---|---|---|---|
| `ISA-KAD-COMPUTE-001` | `DETERMINISTIC` | `CANONICAL_TARGET` | BLOCKER | `compute.pon.typed_notifications` | `PASS` |
| `ISA-KAD-COMPUTE-002` | `DETERMINISTIC` | `CURRENT_CONFIRMED` | BLOCKER | `compute.stc.spatial_capability_contracts` | `PASS` |
| `ISA-KAD-COMPUTE-003` | `DETERMINISTIC` | `CURRENT_CONFIRMED` | BLOCKER | `compute.stc.temporal_lifecycle_ownership` | `PASS` |
| `ISA-KAD-COMPUTE-004` | `DETERMINISTIC` | `CURRENT_CONFIRMED` | BLOCKER | `compute.tdd.empirical_route_promotion` | `PASS` |
| `ISA-KAD-COMPUTE-005` | `DETERMINISTIC` | `CURRENT_CONFIRMED` | BLOCKER | `compute.degradation.fail_safe_hierarchy` | `PASS` |
| `ISA-KAD-COMPUTE-006` | `DETERMINISTIC` | `CURRENT_CONFIRMED` | HIGH | `compute.tokenmaxxing.efficiency_metric` | `PASS` |
| `ISA-KAD-COMPUTE-007` | `DETERMINISTIC` | `CANONICAL_TARGET` | HIGH | `compute.hosts.heterogeneous_adapter_boundary` | `PASS` |
| `ISA-KAD-COMPUTE-008` | `DETERMINISTIC` | `CANONICAL_TARGET` | HIGH | `compute.cognition.ten_class_taxonomy` | `PASS` |
| `ISA-KAD-COMPUTE-009` | `DETERMINISTIC` | `CANONICAL_TARGET` | HIGH | `compute.measurement.experimental_tuple_schema` | `PASS` |
| `ISA-KAD-COMPUTE-010` | `DETERMINISTIC` | `CURRENT_CONFIRMED` | HIGH | `compute.distillation.downward_migration_policy` | `PASS` |
| `ISA-KAD-COMPUTE-011` | `DETERMINISTIC` | `CURRENT_CONFIRMED` | BLOCKER | `compute.governance.zero_shell_mutation` | `PASS` |
| `ISA-KAD-COMPUTE-012` | `HUMAN_REVIEW` | `CANONICAL_TARGET` | BLOCKER | `compute.architecture.human_governed_target` | `PASS` |

---

## 12. Provenance & Change Log

- **2026-08-30 (v1.0.0)**: Initial establishment of the canonical KAD Compute Fabric Ideal State Artifact (ISA) under WP-020, defining self-measuring cognition targets, heterogeneous host governance (AMDY vs TELL), and downward migration discipline.
