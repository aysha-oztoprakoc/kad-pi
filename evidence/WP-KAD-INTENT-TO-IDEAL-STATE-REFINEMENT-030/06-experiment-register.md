# Experiment Register & Empirical Qualification Contracts (WP-030)

**Workpackage ID**: `WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030`  
**Plane**: `EXPERIMENT PLANE`  
**Total Experiments Registered**: 6 Experiments  

---

## 1. Experiment Overview Matrix

| Experiment ID | Title | Domain | Candidate Provider / Method | Disposition Options |
|---|---|---|---|---|
| **`EXP-KAD-OFFLINE-SURVIVAL-001`** | Full Offline Autonomous Engineering Survival | `LOCAL_FIRST_OFFLINE_BOUNDARY` | 100% Disconnected Local LLM + Tools | `ADOPT`, `ADOPT_NARROW`, `DEFER` |
| **`EXP-KAD-WARREN-ASYNC-002`** | Warren Detached Asynchronous Workload | `EXECUTION_TOPOLOGY` | Warren Detached Job Worker | `ADOPT`, `MINE_IDEAS`, `REMOVE` |
| **`EXP-KAD-BEADS-GRAPH-003`** | Beads Shadow Intent-Graph Projection | `CONTEXT_PLANE_CAPABILITIES` | Beads Graph Layout Projection | `ADOPT_NARROW`, `MINE_IDEAS`, `REMOVE` |
| **`EXP-KAD-SEMANTIC-RETRIEVAL-004`** | OpenViking / Needle Semantic Retrieval | `CONTEXT_PLANE_CAPABILITIES` | Local Vector Embedding Index | `ADOPT`, `ADOPT_NARROW`, `REMOVE` |
| **`EXP-KAD-TELL-PERSISTENT-005`** | TELL Persistent Headless Worker Offload | `LOCAL_COMPUTE_HARDWARE_ROLES`| Headless Batch Runner on TELL | `ADOPT`, `ADOPT_NARROW`, `DEFER` |
| **`EXP-KAD-DISTILLATION-006`** | Downward Distillation of Trajectories | `DISTILLATION_LEARNING_PIPELINE`| Trajectory Pattern Linter Generator | `ADOPT`, `MINE_IDEAS`, `DEFER` |

---

## 2. Detailed Experiment Contracts

### EXP-KAD-OFFLINE-SURVIVAL-001: Full Offline Autonomous Engineering Survival
* **Hypothesis**: KAD-PI can execute end-to-end multi-step engineering and research workpackages completely offline using local deterministic tools, local models, and the local Knowledge Vault with zero network degradation.
* **Baseline**: Online execution using frontier remote models and connected web search APIs.
* **Candidate**: 100% disconnected environment (WAN severed) using Ollama/Qwen local inference and local Zotero/Markdown corpus.
* **Independent Variable**: Network connectivity state (CONNECTED vs SEVERED).
* **Controlled Variables**: Workpackage specification, Acceptance test suite, Hardware compute node (AMDY).
* **Confounders**: Local model quantization quality, Local corpus coverage limitations.
* **Metrics**: Task completion rate (%), Test pass rate (%), Execution latency (seconds), Human interventions required.
* **Acceptance Threshold**: 100% test pass on offline-capable workpackages; zero unauthorized outbound network attempts.

### EXP-KAD-WARREN-ASYNC-002: Warren Detached Asynchronous Workload Provider
* **Hypothesis**: Offloading long-running, non-interactive batch tasks to Warren reduces human cognitive context switching without violating STC lease bounds.
* **Baseline**: Sequential foreground execution in interactive OMP sessions.
* **Candidate**: Asynchronous detached job submission to Warren worker with workctl status callbacks.
* **Metrics**: Interactive session availability (%), Task throughput (jobs/hr), STC lease collision rate (%).
* **Acceptance Threshold**: Zero STC lease violations; >30% reduction in interactive session blocking time.

### EXP-KAD-BEADS-GRAPH-003: Beads Shadow Intent-Graph Projection
* **Hypothesis**: Projecting workpackage dependency graphs and decision trees into Beads graph format provides actionable visual insight without competing with workctl lifecycle authority.
* **Baseline**: Standard workctl CLI status reports and Mermaid Markdown diagrams.
* **Candidate**: Beads graph projection generated as derived artifact in `vault/90_Derived/Projections/`.
* **Acceptance Threshold**: 100% deterministic compilation from workctl; zero mutation authority granted to Beads.

### EXP-KAD-SEMANTIC-RETRIEVAL-004: OpenViking / Needle Semantic Knowledge Retrieval
* **Hypothesis**: Local semantic embedding indices accelerate relevant context retrieval for complex architecture queries without hallucinating unverified connections.
* **Baseline**: Deterministic ripgrep, AST grep, and frontmatter property queries.
* **Candidate**: Local OpenViking/Needle vector index over canonical Vault Markdown.
* **Acceptance Threshold**: Recall@5 > 85% with zero unverified document claims admitted into canonical context.

### EXP-KAD-TELL-PERSISTENT-005: TELL Persistent Headless Worker Integration
* **Hypothesis**: Offloading continuous test runs, multi-model evaluation sweeps, and distillation to TELL server keeps AMDY workstation responsive.
* **Baseline**: Executing all verification and benchmarking locally on AMDY workstation.
* **Candidate**: Dispatching batch workloads to TELL server over SSH/secure transport.
* **Acceptance Threshold**: Zero test result divergence between AMDY and TELL; >50% reduction in AMDY workstation load during eval sweeps.

### EXP-KAD-DISTILLATION-006: Downward Distillation of Validated Trajectories
* **Hypothesis**: Analyzing historical causal journals and test failures allows offline distillation into deterministic linters and specialist prompts that permanently eliminate repeated mistakes.
* **Baseline**: Ad-hoc prompt steering and manual debugging across successive workpackages.
* **Candidate**: Automated pattern extraction from causal journals producing deterministic checks.
* **Acceptance Threshold**: >40% reduction in repeated test-fix cycles on recurring task classes.
