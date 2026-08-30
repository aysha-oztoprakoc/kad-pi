# ADR 0014: Generalized Ideal State Artifact (ISA) Architecture & Canonical Compute Fabric Governance

## Context
Following the successful establishment of the KAD Aesthetic Ideal State Artifact (**WP-015** / ADR 0013), KAD-PI required extending the ISA pattern beyond visual aesthetics into core architectural and operational domains—specifically the **compute fabric**, cognition routing, and empirical self-measurement.

Previously, ISA validation was tightly coupled to aesthetic tokens and single-file processing. To prevent creating fragmented, duplicate validator subsystems or prematurely implementing complex runtime schedulers before defining their governed targets, a generalized, multi-domain ISA architecture was required.

## Decisions

1. **Generalized ISA Architecture & Domain Adapters**:
   - Generalize the ISA contract into a universal governance primitive located in `vault/00_Governance/ISA-KAD-<DOMAIN>-<NNN>.md`.
   - Support domain adapters (`aesthetic`, `compute-fabric`, and extensible generic adapters) that validate domain-specific structures while enforcing universal governance sections.
   - Maintain 100% backward compatibility with `ISA-KAD-AESTHETIC-001`.

2. **Epistemic State Separation**:
   - Every claim in an ISA must explicitly declare its target/current epistemic state:
     - `CANONICAL_TARGET`: Governed specification and requirement for future implementation.
     - `CURRENT_CONFIRMED`: Verifiably implemented and evidenced in current repository state.
     - `DERIVED`: Synthesized from canonical knowledge or verified metrics.
     - `HEURISTIC`: Probabilistic advisory or empirical suggestion.
     - `UNKNOWN`: Unobserved or unmeasured parameter awaiting experimentation.
     - `BLOCKED`: Dependency or gate condition unsatisfied.
   - Desired capabilities must never be represented as implemented without empirical evidence.

3. **Allowlisted Validator Registry (Zero Arbitrary Shell Execution)**:
   - All deterministic validators are pure JavaScript functions registered in `VALIDATOR_REGISTRY` in `tools/kad/isa.mjs`.
   - Execution of arbitrary shell strings from Markdown is strictly prohibited.
   - Validators fail closed on missing paths, malformed schemas, or unexpected errors.

4. **Multi-ISA Discovery & Machine Projections**:
   - `bin/kad-isa` and `tools/kad/isa.mjs` automatically discover active ISAs in `vault/00_Governance/`.
   - Derived projections are compiled to `vault/90_Derived/Projections/isa-<domain>.json` alongside a composite registry at `vault/90_Derived/Projections/isa-registry.json`.
   - Presentation layers (Sofia v3, public website, CLI) remain read-only observers of compiled projections with zero vault mutation authority.

5. **Establishment of Canonical Compute Fabric ISA (`ISA-KAD-COMPUTE-FABRIC-001`)**:
   - **Mission**: *Build a self-measuring compute fabric that discovers the cheapest reliable way to complete each kind of cognition using whatever resources currently exist.*
   - **PON**: Typed state transition notifications (`NODE_AVAILABLE`, `MODEL_READY`, `CAPABILITY_REMOVED`, `ROUTE_STALE`, etc.) preferred over polling.
   - **STC Spatial**: Workloads request abstract capability contracts (cognition class, quality, context tokens, structured output, trust domain), never hardcoded host or vendor names.
   - **STC Temporal**: Explicit lifecycle ownership and LIFO teardown for models, VRAM allocations, runtimes, RPC daemons, and benchmark sessions with zero zombie processes.
   - **TDD & Empirical Promotion**: Local empirical evidence in append-only journals is mandatory for route promotion; model marketing or theory creates only a hypothesis.
   - **Graceful Degradation**: *Degrade capability; never silently escalate authority or spend.*
   - **TOKENMAXXING**: Objective function $\frac{\text{accepted useful work}}{\text{scarce resources used}}$ enforced; raw token burn and ungrounded loops (**SLOPMAXXING**) prohibited.
   - **Heterogeneous Host Boundary**: Workstation (`amdy` on Omarchy 4) and server (`tell` on NixOS) maintain host-specific implementations adapting into canonical capability contracts without OS leaking into cognition schemas.
   - **10-Class Cognition Taxonomy**: Standardized classes (`deterministic_transformation`, `classification_extraction`, `retrieval_ranking`, `summarization`, `structured_generation`, `coding_review`, `planning_reasoning`, `research_synthesis`, `verification_critique`, `simulation`) with downward routing preference.
   - **Self-Measurement Tuple**: Experimental configuration tuple ($\text{model} \times \text{quant} \times \text{runtime} \times \text{devices} \times \text{context} \times \text{KV} \times \text{speculation} \times \text{threading} \times \text{network}$) tracked across 11 empirical metrics.
   - **Downward Learning**: Repeated accepted probabilistic tasks become candidates for downward distillation or deterministic replacement.

## Consequences

- **Positive**:
  - Reusable governance primitive across all current and future KAD domains.
  - Compute fabric target state is codified and machine-validated without premature code bloat or distributed scheduler complexity.
  - Complete audibility and traceability via `bin/kad-isa` CLI.
  - Zero shell command injection vulnerabilities.
- **Negative / Trade-offs**:
  - New validators must be explicitly added to `VALIDATOR_REGISTRY` before being referenced in ISA claims.
  - Claim definitions require explicit epistemic status classification.
