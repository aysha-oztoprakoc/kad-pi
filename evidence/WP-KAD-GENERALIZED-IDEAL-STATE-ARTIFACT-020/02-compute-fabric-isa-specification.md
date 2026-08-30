# Compute Fabric ISA Specification

## Target Objective
> **Build a self-measuring compute fabric that discovers the cheapest reliable way to complete each kind of cognition using whatever resources currently exist.**
>
> **Exploit aggressively. Depend conservatively. Measure empirically. Preserve evidence. Use stronger cognition only when cheaper cognition cannot satisfy the contract.**

## Directives Codified

### 1. PON (Notification-Oriented Paradigm)
- Typed state transitions emit punctual notifications:
  `NODE_AVAILABLE`, `NODE_OFFLINE`, `MODEL_READY`, `MODEL_UNLOADED`, `CAPABILITY_REMOVED`, `ROUTE_STALE`, `BENCHMARK_ACCEPTED`, `RESOURCE_EXHAUSTED`, `QUOTA_REFRESHED`.
- Asynchronous notification preferred over active polling loops.

### 2. STC — Spatial Composability
- Tasks request capabilities, not physical machines or vendor identities:
  ```yaml
  requires:
    cognition: reasoning
    quality: high
    context_tokens: 32768
    structured_output: true
    trust_domain: engineering
  ```
- Hosts and model runtimes are interchangeable capability implementations.

### 3. STC — Temporal Composability
- Strict lifecycle ownership for model weights in VRAM, runtime daemons, context allocations, GPU reservations, and benchmark sessions.
- LIFO teardown guarantees zero zombie processes or unmanaged resource residue.

### 4. TDD & Empirical Promotion
- Route promotion requires local empirical evidence in append-only journals.
- Theoretical claims or provider marketing constitute a `HYPOTHESIS`, never authorizing promotion.
- Negative benchmark results are durable evidence.

### 5. Graceful Degradation
- **Invariant**: *Degrade capability; never silently escalate authority or spend.*
- Standard cascade:
  `distributed large local` → `large local` → `small local` → `tiny specialist` → `free remote` → `cheap paid remote` → `frontier remote` → `human`.

### 6. TOKENMAXXING
- Primary objective: $\text{Efficiency} = \frac{\text{accepted useful work}}{\text{scarce resources used}}$.
- Rejection of ungrounded chat loops and raw token burn (**No SLOPMAXXING**).

### 7. Heterogeneous Host Model
- Workstation (`amdy`: Omarchy 4 / Arch Linux, AMD Ryzen 7 7700, Radeon RX 9060 XT 16GB VRAM) and server (`tell`: NixOS, headless server).
- Boundary: `host implementation` → `capability adapter` → `KAD cognition policy`. Zero OS leakage into cognition contracts.

### 8. 10-Class Cognition Taxonomy
1. `deterministic_transformation`
2. `classification_extraction`
3. `retrieval_ranking`
4. `summarization`
5. `structured_generation`
6. `coding_review`
7. `planning_reasoning`
8. `research_synthesis`
9. `verification_critique`
10. `simulation`

### 9. Self-Measurement 9-Tuple
- Tuple: $\text{model} \times \text{quant} \times \text{runtime} \times \text{devices} \times \text{context} \times \text{KV} \times \text{speculation} \times \text{threading} \times \text{network}$
- Measured metrics: TTFT, prefill tok/s, decode tok/s, peak VRAM/RAM, network transfer cost, failure rate, task acceptance rate, structured output validity, quality score, scarce resource cost.

### 10. Downward Learning Invariant
- $\text{frontier remote} \rightarrow \text{large local} \rightarrow \text{small local} \rightarrow \text{specialist} \rightarrow \text{deterministic tool}$.
- Repeated probabilistic work becomes candidate for downward distillation or deterministic replacement.
