# Five-Advisor Adversarial Review: Compute Fabric Architecture (WP-021 Phase 3)

## 1. Context Read
KAD-PI requires establishing the canonical Compute Fabric Ideal State Architecture, defining OMP plugin admission governance, resolving critical architectural tradeoffs, and implementing a deterministic empirical benchmark probe runner measuring local AMD ROCm GPU and system telemetry.

---

## 2. Independent Advisor Reviews

### Advisor 1 — Distributed Systems Architect
- **Proposed Architecture**: Asymmetric hierarchical topology: Workstation (`amdy`) as primary cognitive coordinator and high-interactivity ROCm node; Server (`tell`) as background deterministic/retrieval worker node over isolated local RPC.
- **Strongest Supporting Argument**: Node identity abstraction allows dynamic compute expansion without altering task definitions or cognition schemas.
- **Strongest Objection / Blind Spot**: Distributed scheduling over heterogeneous network links introduces latency variance, socket failures, and serialization overhead that can easily outweigh local execution savings.
- **Must NOT Implement**: Full distributed consensus cluster, Raft/Paxos daemons, or dynamic remote process migration in this increment.
- **Measurable Acceptance Criteria**: Remote capability descriptor parses in <1ms with zero network polling when idle.

### Advisor 2 — PON/STC Deterministic Systems Architect
- **Proposed Architecture**: Event-driven capability registry where node availability and runtime state emit typed PON notifications (`NODE_AVAILABLE`, `MODEL_READY`, etc.) and all worker processes enforce strict LIFO lifecycle teardown.
- **Strongest Supporting Argument**: Explicit spatiotemporal composability ensures zero zombie inference processes, zero VRAM context leaks, and zero background polling.
- **Strongest Objection / Blind Spot**: If notification delivery fails or becomes unordered, dependent components may deadlock or execute against stale capabilities.
- **Must NOT Implement**: Polling loops for GPU or node discovery; implicit background daemons with untracked lifecycles.
- **Measurable Acceptance Criteria**: 100% of benchmark sessions register cleanup handlers; teardown verification passes with 0 leaked child processes or allocated VRAM buffers.

### Advisor 3 — Local AI / AMD GPU Experimental Engineer
- **Proposed Architecture**: Direct hardware-grounded probe using ROCm/HIP execution harness and structured `amdgpu_top` JSON telemetry capture on AMD Navi 44 GPU.
- **Strongest Supporting Argument**: Theoretical model performance is meaningless without empirical measurement of TTFT, prefill rate, decode tokens/sec, and peak VRAM allocation across real context sizes.
- **Strongest Objection / Blind Spot**: Thermal throttling, background desktop compositor load, and ROCm version variances act as major benchmark confounders unless explicitly controlled.
- **Must NOT Implement**: Benchmarking without measuring thermal/clock baselines; treating single-shot runs as universal model truth.
- **Measurable Acceptance Criteria**: Probe runner outputs structured JSON with all 11 telemetry metrics across 9-tuple experimental configurations with <5% variance across repeat runs.

### Advisor 4 — TDD / Scientific Evidence Reviewer
- **Proposed Architecture**: Epistemic separation separating empirical receipts (`[MEASURED]`), statistical summaries (`[DERIVED]`), and routing suggestions (`[HEURISTIC]`). Immutable JSONL evidence journal with SHA-256 hash chaining.
- **Strongest Supporting Argument**: Scientific integrity requires that experimental probe results cannot be modified or self-promoted without deterministic verification.
- **Strongest Objection / Blind Spot**: Over-instrumentation could generate massive evidence ledgers that consume storage without providing actionable routing signal.
- **Must NOT Implement**: Unreproducible synthetic benchmarks; claiming route promotion readiness without empirical evidence receipts.
- **Measurable Acceptance Criteria**: All probe runs compile byte-reproducible evidence receipts containing exact model hash, quantization tag, context length, and raw telemetry samples.

### Advisor 5 — Adversarial Architecture + TOKENMAXXING Reviewer
- **Proposed Architecture**: Radical minimalism: pure ESM probe runner reusing existing `tools/kad/telemetry/` primitives, zero external framework bloat, and downward migration preference where deterministic code replaces LLM calls.
- **Strongest Supporting Argument**: The objective function $\frac{\text{accepted useful work}}{\text{scarce resources used}}$ must ruthlessly eliminate unnecessary layers, duplicate message queues, and speculative runtime frameworks.
- **Strongest Objection / Blind Spot**: Premature optimization might reject necessary observability infrastructure before understanding true system bottlenecks.
- **Must NOT Implement**: Third-party distributed frameworks (Ray, Celery, Redis, Kafka); complex multi-agent orchestration where a single deterministic script suffices.
- **Measurable Acceptance Criteria**: Probe runner codebase is <500 lines of pure ESM; execution adds <2MB memory overhead.

---

## 3. Advisor Convergence Matrix

| Decision Area | Advisor 1 (Distributed) | Advisor 2 (PON/STC) | Advisor 3 (Local GPU) | Advisor 4 (TDD / Evidence) | Advisor 5 (TOKENMAX) | Conflict / Consensus |
|---|---|---|---|---|---|---|
| **Topology & Coordination** | Asymmetric Hub-and-Spoke | Event-Driven STC Hub | Local-First Primary | Provenance-Tracked | Minimalist Script Hub | **CONSENSUS**: AMDY as local primary coordinator; TELL as headless capability provider. |
| **Capability Representation** | Abstract Contract | STC Spatial Contract | Hardware-Bounded | Epistemically Typed | Pure JSON Schemas | **CONSENSUS**: Decouple task contracts from physical hardware. |
| **Lifecycle & Teardown** | RPC Heartbeat | Strict LIFO Teardown | Explicit VRAM Eviction | Verified Teardown | Zero Zombie Residue | **CONSENSUS**: Mandatory LIFO teardown with zero leaked resources. |
| **OMP Plugin Admission** | Isolated Adapters | Interception Ordering | Zero GPU Contention | Verifiable Boundaries | Non-Authoritative Observers | **CONSENSUS**: Plugins must remain replaceable observers; Option B preferred. |
| **Benchmarking Methodology** | Multi-node Latency | Event-triggered | 9-Tuple $\times$ 11 Metrics | Hash-Chained Evidence | Work / Resource Ratio | **CONSENSUS**: Comprehensive 9-tuple schema evaluated against 11 metrics. |
