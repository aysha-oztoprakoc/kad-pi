# KAD Compute Fabric Ideal State Architecture (V1)

- **Document ID**: `KAD-COMPUTE-FABRIC-IDEAL-STATE-V1`
- **Version**: `1.0.0`
- **Status**: `FROZEN`
- **Authority**: `CANONICAL_KNOWLEDGE` (Human Project Lead Approved via `D021-001` .. `D021-004`)
- **Governing Directives**: `PRIME_DIRECTIVE.md`, ADR 0001, ADR 0002, ADR 0004, ADR 0005, ADR 0014, `ISA-KAD-COMPUTE-FABRIC-001`

---

## 1. Purpose
The KAD Compute Fabric is a self-measuring, spatiotemporally composable (STC), notification-driven (PON) cognition substrate whose primary purpose is to:
> **Discover and execute the cheapest reliable way to complete each kind of cognition using whatever heterogeneous resources currently exist.**

## 2. Non-Goals
The Compute Fabric explicitly DOES NOT:
1. Operate as a general distributed operating system or unmanaged cluster manager;
2. Authorize unmetered, un-gated paid API spend or bypass operator budget policies;
3. Mutate canonical vault knowledge or task state outside of governed `workctl` claims;
4. Couple task capability definitions to specific vendor identities, hostnames, or operating systems;
5. Grant third-party OMP extensions canonical knowledge ownership or autonomous routing authority.

---

## 3. Invariants
1. **Model Output Proposes; Deterministic Policy Authorizes; Human Resolves Architecture**: Models suggest completions and candidate routes; pure code validates schemas and enforces economic policy; humans decide architectural boundaries.
2. **Capability Abstraction**: Workloads express requirements in terms of *cognition classes*, *quality levels*, *context windows*, and *structural constraints*, completely decoupled from physical hosts or model identities.
3. **Downward Migration Preference**: Tasks naturally flow to the lowest sufficient tier: Deterministic Tool → Tiny Specialist → Local Model → Free Remote → Subscription Remote → Paid Remote → Human.
4. **Lifecycle Sanctity**: Every process, model weight allocation, GPU context buffer, and socket enforces explicit ownership and strict LIFO teardown. Zero zombie processes or VRAM residue.
5. **Fail-Safe Degradation**: Subsystem or provider outages trigger graceful capability reduction without silent authority escalation or unauthorized spend.
6. **TOKENMAXXING Metric**: System optimizes the efficiency ratio $\frac{\text{accepted useful work}}{\text{scarce resources used}}$, rejecting ungrounded looping animations or artificial token burn (**SLOPMAXXING**).

---

## 4. Topology & Node Coordination (`D021-001`)
- **Topology**: Asymmetric Coordinator Hub with Host-Agnostic Capability Contracts.
  - **Workstation (`host.amdy.workstation`)**: Default coordinator node and primary interactive execution host with local AMD ROCm GPU acceleration (Navi 44 / `amdgpu_top`).
  - **Headless Server (`host.tell.server`)**: Headless capability provider (CPU / AVX-512) operating over pure 16-color ANSI / 24-bit TrueColor monospace TUI with 0ms motion and zero GUI/audio dependencies.
- **Fail-Closed Coordination**: Loss of AMDY workstation degrades distributed execution rather than silently promoting TELL.
- **Future Seam**: Preserves clean capability seams allowing future nodes (e.g. additional servers or mobile nodes) to satisfy capability contracts without altering task definitions or cognition schemas.

---

## 5. Authority Matrix

| Layer / Component | May Read | May Render | May Propose | May Mutate | Must Never Mutate |
|---|---|---|---|---|---|
| **Human Project Lead** | All | All | Architectural Direction | Governance & Claims | N/A (Sole Authority) |
| **KAD Policy & `workctl`** | Vault, Claims, State | CLI / Doctor output | Work Lifecycle Transitions | Active Claims & Tasks | Unclaimed repository paths |
| **Compute Fabric Router** | Resource contracts, Telemetry | TUI / Status meters | Execution Route Recommendations | Ephemeral in-memory route | Canonical vault, production policy |
| **Probe Runner** | GPU & System telemetry | Progress / Tabular receipts | Empirical Evidence Records | `evidence/` receipts | Routing policy, canonical vault |
| **OMP Extensions / Plugins** | Subscribed runtime events | UI overlays (terminal/HUD) | Tool calls & link suggestions | Sandbox memory only | Canonical knowledge, routing policy |

---

## 6. Standardized 10-Class Cognition Taxonomy

1. `deterministic_transformation`: Code compilation, formatting, schema validation, data parsing.
2. `classification_extraction`: Structured JSON entity extraction, classification, tagging.
3. `retrieval_ranking`: Semantic search, dense retrieval, passage re-ranking.
4. `summarization`: Context compression, transcript summarization, progress rollups.
5. `structured_generation`: YAML/JSON spec generation against strict schemas.
6. `coding_review`: AST-aware code editing, test generation, patch review.
7. `planning_reasoning`: Multi-step task decomposition, dependency graph resolution.
8. `research_synthesis`: Literature review, multi-source claim verification.
9. `verification_critique`: Adversarial stress-testing, claim falsification, invariant auditing.
10. `simulation`: Agentic world modeling, state transition emulation.

---

## 7. OMP Capability Admission Governance (`D021-002`)
Every runtime extension or optional plugin must pass the **Full Lifecycle Admission Contract**:
```text
DISCOVER → SANDBOX → MEASURE → VERIFY → PROMOTE_NARROWLY → DEGRADE_SAFELY → REPLACE_FREELY
```

### Core Admission Invariants:
1. **Third-Party Plugin Non-Authority**: No third-party extension may own canonical KAD truth, routing authority, work lifecycle, or knowledge authority.
2. **Deterministic Declaration**: Every extension must declare compatibility, authority (observe/derive/block/mutate/persist/authorize), state class, interception points, mutation permissions/claim requirements, failure/degradation behavior, evidence requirements, rollback, and deterministic precedence.
3. **Survival Invariant**: If every third-party extension disappeared, canonical KAD state and operations must remain 100% operational.
4. **Deferred Canaries**: WP-021 establishes the generic typed admission contract; live plugin canaries are deferred to follow-on experimental workpackages.

---

## 8. Deterministic Interception Precedence (`D021-003`)
When multiple extensions or hooks intercept lifecycle events, execution follows strict ISA-governed priority:

```text
1. AUTHORITY_SECURITY       (Authorization, trust domain, spend caps, claim verification)
         ↓
2. CONTEXT_SAFETY           (Context window bounds, anti-poisoning filters, secret redaction)
         ↓
3. EDIT_WRITE_SAFETY        (File locks, AST verification, target-bound receipts)
         ↓
4. LOOP_REDUNDANCY_GUARD    (Repetitive execution circuit breaker, cycle prevention)
         ↓
5. TELEMETRY_DIAGNOSTICS    (Passive observation, telemetry capture, metrics recording)
         ↓
6. PRESENTATION_UI          (Terminal rendering, HUD overlay, status meters - non-authoritative)
```

**Precedence Rules**:
- Earlier stages may veto later execution; later stages MUST NOT override or weaken earlier decisions.
- Secondary ordering within the same stage uses deterministic KAD metadata—never npm load order.
- Unresolved handler conflicts fail closed and emit an error receipt.

---

## 9. Empirical Benchmarking Model (`D021-004`)

### 9.1 Experimental Configuration 9-Tuple:
$$\text{Tuple} = (\text{model} \times \text{quant} \times \text{runtime} \times \text{devices} \times \text{context} \times \text{KV} \times \text{speculation} \times \text{threading} \times \text{network})$$

1. `model`: Exact model identifier and content hash (e.g. `Qwen/Qwen2.5-Coder-7B-Instruct`).
2. `quant`: Quantization format (e.g. `FP16`, `Q4_K_M`, `Q8_0`).
3. `runtime`: Execution engine (e.g. `rocm-hip`, `llama.cpp`, `ollama`, `vllm`).
4. `devices`: Target hardware devices (e.g. `amdgpu:0 [Navi 44]`, `cpu:x86_64`).
5. `context`: Workload context length in tokens (`1024`, `4096`, `8192`, `16384`, `32768`).
6. `KV`: Key-Value cache quantization and management (`fp16`, `q8_0`, `q4_0`).
7. `speculation`: Speculative decoding configuration (`none`, `draft_model`, `prompt_lookup`).
8. `threading`: CPU thread allocation / GPU compute stream concurrency.
9. `network`: Transport protocol (`local_memory`, `unix_socket`, `loopback_http`, `lan_rpc`).

### 9.2 Empirical 11 Telemetry Metrics:
1. `ttft_ms`: Time to first token in milliseconds.
2. `prefill_tok_per_sec`: Prompt evaluation throughput.
3. `decode_tok_per_sec`: Generation throughput.
4. `peak_vram_bytes`: Peak GPU VRAM allocated during run.
5. `peak_ram_bytes`: Peak system memory consumed.
6. `network_transfer_bytes`: Ingress/egress bandwidth consumed.
7. `failure_rate`: Ratio of failed attempts to total runs.
8. `task_acceptance_rate`: Fraction of outputs passing deterministic verification.
9. `structured_output_validity`: Schema adherence score (0.0 to 1.0) without repair.
10. `quality_score`: Empirical benchmark quality score.
11. `scarce_resource_cost`: Multi-dimensional cost weighting across quota, energy, and latency.

### 9.3 Confounder Control:
- Separate warm-up runs from measured runs.
- Capture thermal baseline (`amdgpu_top` temperature and power draw).
- Measure and record desktop compositor/background GPU utilization before runs.

---

## 10. Promotion Criteria
A compute execution route transitions from `HYPOTHESIS` to `PROMOTED` ONLY when:
1. At least 10 independent empirical probe runs are recorded in immutable evidence ledgers;
2. Task acceptance rate $\ge 98\%$ on deterministic verification;
3. Structured output validity $= 100\%$;
4. Scarce resource cost dominates all alternative sufficient routes;
5. Zero unmanaged lifecycle residue or VRAM leaks observed across all repetitions.
