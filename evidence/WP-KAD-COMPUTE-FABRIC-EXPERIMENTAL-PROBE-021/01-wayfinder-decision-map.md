# Wayfinder Decision Map: KAD Compute Fabric Architecture (WP-021)

## Destination
Establish the canonical Compute Fabric Ideal State Architecture, OMP capability admission framework, resolve material human architectural choices (`D021-*`), and implement the deterministic empirical benchmark probe runner measuring local ROCm and system telemetry.

## Notes
- **Domain**: Heterogeneous compute resource governance, cognition routing abstraction, local inference benchmarking, and OMP capability admission.
- **Governing Authorities**: `PRIME_DIRECTIVE.md`, ADR 0001, ADR 0002, ADR 0004, ADR 0005, ADR 0014, `ISA-KAD-COMPUTE-FABRIC-001`.
- **Standing Invariant**: *Model proposes. Deterministic policy authorizes. Human resolves architecture.*

---

## 1. Classification of Architectural Topics

| Topic | Category | Epistemic Classification | Governing Rule / Architectural Stance |
|---|---|---|---|
| **Compute Fabric Purpose** | `INVARIANT` | `CANONICAL_TARGET` | Build a self-measuring compute fabric discovering the cheapest reliable cognition route (`ISA-KAD-COMPUTE-FABRIC-001` Section 2). |
| **Compute Fabric Non-Purpose** | `INVARIANT` | `CANONICAL_TARGET` | NOT a distributed OS, NOT un-sandboxed daemon orchestration, NOT an autonomous spending machine. |
| **AMDY Workstation Role** | `INVARIANT` | `CURRENT_CONFIRMED` | Primary sovereign workstation (`host.amdy.workstation`), dual monitors, local ROCm GPU acceleration (`amdgpu_top`), interactive development. |
| **TELL Server Role** | `INVARIANT` | `CURRENT_CONFIRMED` | Headless NixOS homelab server (`host.tell.server`), CPU/AVX-512 compute node, 0ms TUI, zero GUI/audio dependencies. |
| **Host Identity Decoupling** | `INVARIANT` | `CANONICAL_TARGET` | Tasks request abstract capability contracts; physical host names never leak into cognition policy schemas. |
| **Cognition Taxonomy** | `INVARIANT` | `CANONICAL_TARGET` | 10 standardized cognition classes (`deterministic_transformation`, `classification_extraction`, `retrieval_ranking`, `summarization`, `structured_generation`, `coding_review`, `planning_reasoning`, `research_synthesis`, `verification_critique`, `simulation`). |
| **Worker & Model Lifecycle** | `INVARIANT` | `CURRENT_CONFIRMED` | Strict LIFO teardown for models, VRAM context buffers, and worker processes (`tools/kad/swarm-workers.mjs`). |
| **PON Notification Semantics** | `INVARIANT` | `CURRENT_CONFIRMED` | Typed punctual state notifications (`NODE_AVAILABLE`, `MODEL_READY`, `CAPABILITY_REMOVED`, `ROUTE_STALE`, `QUOTA_REFRESHED`). No polling. |
| **STC Spatial Composability** | `INVARIANT` | `CURRENT_CONFIRMED` | Explicit declaration of required capabilities and trust domain (`trust_domain: engineering`). |
| **STC Temporal Composability** | `INVARIANT` | `CURRENT_CONFIRMED` | Explicit scoped ownership; zero zombie processes or unmanaged resource residue. |
| **Graceful Degradation** | `INVARIANT` | `CANONICAL_TARGET` | Downward migration cascade: distributed local → large local → small local → tiny specialist → free remote → cheap paid remote → frontier remote → human. Never escalate authority on failure. |
| **TOKENMAXXING Objective** | `INVARIANT` | `CURRENT_CONFIRMED` | Objective $\frac{\text{accepted useful work}}{\text{scarce resources used}}$ strictly enforced; ungrounded token loops (**SLOPMAXXING**) prohibited. |
| **OMP Plugin Admission Contract** | `ARCHITECTURAL_DECISION` | `PROJECT_INFERENCE` | Third-party OMP extensions must be sandboxed, measured, and replaceable without corrupting canonical knowledge. |
| **Plugin Interception Precedence** | `ARCHITECTURAL_DECISION` | `PROJECT_INFERENCE` | Deterministic ordering: 1. Authority/Security -> 2. Context -> 3. Edit Safety -> 4. Loop Guard -> 5. Diagnostics -> 6. Presentation. |
| **Empirical 9-Tuple Schema** | `ARCHITECTURAL_DECISION` | `CANONICAL_TARGET` | Experimental configuration represented as ($\text{model} \times \text{quant} \times \text{runtime} \times \text{devices} \times \text{context} \times \text{KV} \times \text{speculation} \times \text{threading} \times \text{network}$). |
| **Empirical 11 Telemetry Metrics** | `ARCHITECTURAL_DECISION` | `CANONICAL_TARGET` | `ttft_ms`, `prefill_tok_per_sec`, `decode_tok_per_sec`, `peak_vram_bytes`, `peak_ram_bytes`, `network_transfer_bytes`, `failure_rate`, `task_acceptance_rate`, `structured_output_validity`, `quality_score`, `scarce_resource_cost`. |
| **Local ROCm Empirical Reality** | `EMPIRICAL_QUESTION` | `UNKNOWN` | Measured TTFT and decode tokens/sec for Qwen 2.5 Coder on Navi 44 GPU under variable context (1k, 4k, 8k, 16k tokens). |
| **Multi-Node RPC Latency Overhead** | `EMPIRICAL_QUESTION` | `UNKNOWN` | Real network roundtrip and serialization cost between AMDY and TELL over local LAN. |
| **Probe Runner Seam** | `IMPLEMENTATION_DETAIL` | `PROJECT_INFERENCE` | Pure ESM runner in `tools/kad/compute/probe-runner.mjs` with mockable hardware telemetry adapter. |
| **Dynamic Remote Heterogeneous Scheduling** | `FUTURE_OPTION` | `UNKNOWN` | Automated multi-host distributed tensor parallelism across heterogeneous WAN nodes. |
| **Autonomous Model Distillation Pipeline** | `FUTURE_OPTION` | `UNKNOWN` | Continuous automated fine-tuning of local models from accepted episode transcripts. |
