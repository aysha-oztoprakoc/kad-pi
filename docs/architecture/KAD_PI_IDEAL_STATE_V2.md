# KAD-PI IDEAL STATE ARTIFACT V2

**Artifact Version**: `2.0.0`
**Compiled Date**: `2026-08-30`
**Governing Authority**: `PRIME_DIRECTIVE.md` & `INTENT_DECISION_EVENT_V1` Ledger
**Historical Baseline**: `ISA-KAD-SKILL-ROLE-002 v1.1` (Preserved Invariant)
**Epistemic Status**: `CANONICAL TARGET ARCHITECTURE`

---

## 1. Executive Summary & Constitutional Mission

KAD-PI is an advanced, local-first **Personal Engineering Operating System and Scientific Research Laboratory** designed to maximize human cognitive leverage, epistemic integrity, scientific reproducibility, and practical engineering maintainability.

### Constitutional Core Principles:
1. **Human Epistemic Sovereignty**: The project lead (`actor.project_lead`) retains exclusive authority over charter, scope, policy, capital, and canonical doctrine. Models propose; deterministic policy authorizes.
2. **TOKENMAXXING over SLOPMAXXING**: Optimize accepted useful work and durable learning per scarce unit of human cognitive attention, remote quota, compute, and money. Raw token speed is explicitly subordinated to correctness.
3. **Downward Distillation (EXECUTION != LEARNING)**: Execution is strictly decoupled from learning. Validated execution trajectories are distilled offline into deterministic tools, tests, schemas, and compact local specialists.
4. **Verification Independence**: `MUTATOR != SOLE VERIFIER != ACCEPTANCE AUTHORITY`. No mutating agent may self-certify architectural or code changes.
5. **Local-First Baseline Sovereignty**: Core engineering, research, verification, and work package execution MUST remain fully operational offline with zero network connectivity.

---

## 2. Normative Requirement Registry

| Requirement ID | Domain | Normative | Statement | Intent Ref | Target Horizon | Status |
|---|---|---|---|---|---|---|
| **`REQ-KAD-ID-001`** | `PROJECT_IDENTITY` | `MUST` | KAD-PI MUST function primarily as a local-first Personal Engineering Operating System and Scientific Research Laboratory, prioritizing human cognitive leverage, formal systems engineering, scientific repeatability, and practical personal maintainability over multi-tenant SaaS or autonomous factory topologies. | `DEC_ID_01` | `NOW` | `PARTIAL` |
| **`REQ-KAD-ID-002`** | `TARGET_STAKEHOLDER` | `MUST` | The system MUST be optimized exclusively for the sole project lead (AMDY), with portable and reproducible architecture allowing trusted collaborators (2-5 peers) to inspect or replicate isolated components without turning KAD into an enterprise multi-user suite. | `DEC_ID_02` | `NOW` | `IMPLEMENTED` |
| **`REQ-KAD-ID-003`** | `OPEN_SOURCE_ACADEMIC_DESTINATION` | `MUST` | KAD-PI MUST maintain a private core repository for personal engineering and publish open research, specifications, benchmarks, and standalone tools only through governed, staged extraction. | `DEC_ID_21` | `6_MONTH` | `PARTIAL` |
| **`REQ-KAD-COG-001`** | `SOVEREIGN_HUMAN_ROLE` | `MUST` | The project lead MUST retain sole sovereign authority as Strategic Governor and Research Director over charter, scope, risk tolerance, financial expenditure, canonical knowledge doctrine, and policy changes, while delegating bounded routine implementation and validation to agents. | `DEC_ID_03` | `NOW` | `PARTIAL` |
| **`REQ-KAD-COG-002`** | `FAILURE_CONDITION` | `MUST` | The system MUST treat loss of human cognitive leverage, degradation of epistemic trust, unvetted provider lock-in, or increasing human cognitive fatigue as a definitive architectural failure condition regardless of raw token throughput. | `DEC_ID_04` | `NOW` | `PARTIAL` |
| **`REQ-KAD-AUTH-001`** | `AUTONOMY_BOUNDARIES` | `MUST` | Agents MUST operate under a Tier-Tiered Bounded Autonomy model where research, planning, localized code edits, and test generation are autonomous within an active STC workctl lease, while main branch merges, external network access, and policy mutations require explicit human or policy approval. | `DEC_ID_05` | `NOW` | `PARTIAL` |
| **`REQ-KAD-AUTH-002`** | `KNOWLEDGE_PROMOTION_GOVERNANCE` | `MUST` | Models and agents MUST propose knowledge changes only; canonical knowledge promotion into the KnowledgePlane Vault MUST be authorized exclusively by human review or deterministic evidence gates. | `DEC_ID_06` | `NOW` | `IMPLEMENTED` |
| **`REQ-KAD-PM-001`** | `NATIVE_PM_CAPABILITIES` | `MUST` | KAD-PI MUST embed a lean, high-leverage, deterministic Project Management Kernel within workctl that natively manages WBS/DAG dependency graphs, STC lease claims, quality gates, and decision/risk registers, while deliberately rejecting bureaucratic enterprise agile frameworks. | `DEC_ID_17` | `3_MONTH` | `PARTIAL` |
| **`REQ-KAD-PM-002`** | `WORKPACKAGE_DECOMPOSITION_AUTHORITY` | `MUST` | Workpackages MUST be hierarchically decomposed with explicit acceptance contracts, where strategic goals are set by the human, typed WBS packages are proposed by planning roles, and execution leases are validated against DAG dependencies before dispatch. | `DEC_ID_18` | `3_MONTH` | `PARTIAL` |
| **`REQ-KAD-QUAL-001`** | `QUALITY_GATES_AND_VERIFICATION_INDEPENDENCE` | `MUST` | The system MUST enforce strict verification independence under the constitutional invariant: MUTATOR != SOLE VERIFIER != ACCEPTANCE AUTHORITY. Implementing agents cannot self-certify significant architectural or code mutations. | `DEC_ID_19` | `NOW` | `IMPLEMENTED` |
| **`REQ-KAD-RES-001`** | `RESEARCH_OPERATING_LIFECYCLE` | `MUST` | KAD-PI MUST execute external scientific research through a strict tiered epistemic pipeline: Question -> Source Extraction -> Provenance Validation -> Claim Triangulation -> Empirical Verification -> Advisor Review -> Human Promotion. | `DEC_ID_13` | `3_MONTH` | `PARTIAL` |
| **`REQ-KAD-KNOW-001`** | `KNOWLEDGE_PLANE_STORAGE_TOPOLOGY` | `MUST` | The KnowledgePlane MUST maintain the canonical Obsidian Vault (human-readable Markdown with structured frontmatter) as the sole durable source of truth; vector databases, semantic embeddings, and graph indices MUST remain rebuildable derived projections. | `DEC_ID_14` | `NOW` | `IMPLEMENTED` |
| **`REQ-KAD-KNOW-002`** | `CONTRADICTION_INVALIDATION_MANAGEMENT` | `MUST` | The KnowledgePlane MUST manage epistemic conflicts, stale doctrines, and invalidated claims through explicit contradiction journaling; affected claims MUST fail closed on dependent execution paths while preserving historical provenance. | `DEC_ID_16` | `3_MONTH` | `PARTIAL` |
| **`REQ-KAD-CTX-001`** | `CONTEXT_PLANE_CAPABILITIES` | `MUST` | Context retrieval MUST be decoupled from proprietary vendor APIs through stable capability interfaces (SemanticIndexProvider, GraphProjectionProvider, ContextCompiler); candidate providers such as OpenViking or Needle MUST undergo empirical benchmarking before adoption. | `DEC_ID_14` | `6_MONTH` | `NOT_IMPLEMENTED` |
| **`REQ-KAD-DIST-001`** | `DISTILLATION_LEARNING_PIPELINE` | `MUST` | KAD-PI MUST strictly enforce EXECUTION != LEARNING through an offline evidence-gated distillation pipeline that extracts repeated validated execution trajectories into deterministic tools, tests, linters, schemas, or compact local specialists. | `DEC_ID_15` | `6_MONTH` | `PARTIAL` |
| **`REQ-KAD-SEC-001`** | `SECURITY_TRUST_DOMAINS` | `MUST` | Security boundaries MUST enforce strict multi-domain isolation across AMDY Workstation, TELL Server, Local Sandbox, Remote APIs, and Knowledge Vault with zero ambient credential inheritance; raw secret access by agent prompts MUST be strictly forbidden. | `DEC_ID_08` | `3_MONTH` | `PARTIAL` |
| **`REQ-KAD-COMP-001`** | `LOCAL_COMPUTE_HARDWARE_ROLES` | `MUST` | The compute fabric MUST operate an asymmetric dual-node topology: AMDY Workstation handles interactive controller tasks, GUI presentation, and fast local steering; TELL Server handles headless batch execution, distillation pipelines, and multi-model benchmarking. | `DEC_ID_11, DEC_ID_23` | `6_MONTH` | `PARTIAL` |
| **`REQ-KAD-EXEC-001`** | `EXECUTION_TOPOLOGY` | `MUST` | KAD-PI MUST separate execution runtimes from work lifecycle authority using the KAD_WORKLOAD_V1 abstraction; OMP serves as primary interactive controller, Pi as portable worker runtime, and Warren as an optional evidence-gated detached offload provider. | `DEC_ID_09` | `3_MONTH` | `PARTIAL` |
| **`REQ-KAD-GIT-001`** | `GITHUB_OPERATING_MODEL` | `MUST` | Canonical work lifecycle authority MUST remain local to Git and workctl; GitHub MUST function strictly as a downstream collaboration, publication, and remote CI verification projection. | `DEC_ID_12` | `NOW` | `IMPLEMENTED` |
| **`REQ-KAD-FIN-001`** | `ECONOMIC_FINOPS_GOVERNANCE` | `MUST` | Financial governance MUST enforce zero-marginal metered API spend by default, executing tasks on local compute and fixed subscriptions unless an explicit human lease with a capped budget is granted per workpackage. | `DEC_ID_07` | `NOW` | `IMPLEMENTED` |
| **`REQ-KAD-FIN-002`** | `SCARCE_RESOURCE_FINOPS_OPTIMIZATION` | `MUST` | Operational FinOps telemetry MUST optimize resources according to the strict priority: Human Attention > Epistemic Integrity > Maintainability > Money/Quota > Local Compute Cycles. | `DEC_ID_20` | `3_MONTH` | `PARTIAL` |
| **`REQ-KAD-OFFLINE-001`** | `LOCAL_FIRST_OFFLINE_BOUNDARY` | `MUST` | KAD-PI MUST maintain full core engineering, research, knowledge, verification, and work package execution capabilities completely offline using deterministic tools, local models, and the local Knowledge Vault. | `DEC_ID_10` | `3_MONTH` | `PARTIAL` |
| **`REQ-KAD-HORIZON-001`** | `THREE_MONTH_DESTINATION_TARGET` | `MUST` | The 3-month operational destination MUST achieve a robust single-node Personal Engineering OS & Empirical Research Substrate with rock-solid workctl, full offline operation, and baseline telemetry. | `DEC_ID_22` | `3_MONTH` | `PARTIAL` |
| **`REQ-KAD-HORIZON-002`** | `SIX_MONTH_DESTINATION_TARGET` | `MUST` | The 6-month intermediate destination MUST achieve an operational Asymmetric Dual-Node Compute Fabric (AMDY + TELL) with governed asynchronous workload pipelines, downward distillation, and Warren canary offload. | `DEC_ID_23` | `6_MONTH` | `NOT_IMPLEMENTED` |
| **`REQ-KAD-HORIZON-003`** | `TWELVE_MONTH_DESTINATION_TARGET` | `MUST` | The 12-month ultimate ideal state destination MUST achieve a mature, self-distilling Personal Engineering OS & Publishable Scientific Research Laboratory, producing high-quality publishable research artifacts and reproducible specifications. | `DEC_ID_24` | `12_MONTH` | `NOT_IMPLEMENTED` |

---

## 3. Four-Plane Architecture Specification

Every system capability is classified under the Four-Plane Model:
* **`INTENT PLANE`**: Authoritative human intent (`INTENT_DECISION_EVENT_V1`, `AUTHOR_DECLARED`).
* **`CURRENT PLANE`**: Repository-confirmed and empirically observed state (`ISA-002 v1.1`, `workctl`, test receipts).
* **`TARGET PLANE`**: Target architectural requirements (`REQ-KAD-*`, `DERIVED_FROM_AUTHOR_DECLARED`).
* **`EXPERIMENT PLANE`**: Unproven architectural hypotheses (`EXP-KAD-*`, `HYPOTHESIS`).

---

## 4. Current-to-Target Gap Analysis Matrix

| Domain | Current State | Target State | Gap Description | Risk | Horizon | Remediation WP / Experiment |
|---|---|---|---|---|---|---|
| **`PROJECT_IDENTITY`** | KAD-PI operates as a personal engineering repository with emerging research capabilities, but lacks formal single-operator identity boundaries in all subsystem contracts. | Rigid personal engineering OS & research lab boundaries enforced across all tools and agent roles. | Subsystems occasionally scaffold multi-user or enterprise abstractions that must be pruned. | `MEDIUM` | `NOW` | `WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030` |
| **`TARGET_STAKEHOLDER`** | Optimized for project lead AMDY with single-user filesystem and local Git bindings. | Formalized 2-5 collaborator isolation with zero multi-tenancy overhead. | Collaborator export and replication packaging needs structured definition. | `LOW` | `3_MONTH` | `WP-KAD-COLLABORATOR-PACKAGING-035` |
| **`SOVEREIGN_HUMAN_ROLE`** | Human executes workctl commands and responds to ask-me prompts, but some agent tools lack explicit human confirmation gates for sensitive actions. | Adaptive cognitive engagement (CO-DESIGN, GATED, ASYNC, EXCEPTION_ONLY) with guaranteed human sovereignty over canonical knowledge, spend, and charter. | Automated policy enforcement of human approval gates on sensitive branches. | `HIGH` | `3_MONTH` | `WP-KAD-GOVERNANCE-GATES-032` |
| **`FAILURE_CONDITION`** | Failure defined in principles but lacks automated telemetry detecting human cognitive fatigue or escaped complexity. | Automated human intervention and cognitive overhead telemetry actively reporting friction. | Observatory tracks model tokens and compute, but does not yet quantify human intervention friction. | `MEDIUM` | `3_MONTH` | `WP-KAD-COGNITIVE-TELEMETRY-031` |
| **`AUTONOMY_BOUNDARIES`** | STC lease mechanism exists in workctl but is partially advisory for subagent execution trees. | Strict capability-enforced STC worktree sandboxes with deterministic boundary violation rejection. | Subagents can theoretically attempt out-of-scope edits if prompt steering fails; requires deterministic filesystem sandboxing. | `HIGH` | `3_MONTH` | `WP-KAD-STC-SANDBOX-HARDENING-033` |
| **`KNOWLEDGE_PROMOTION_GOVERNANCE`** | Librarian role and wiki linters guard vault, but promotion from research candidates to canonical notes requires manual human review. | Automated multi-stage evidence gating pipeline verifying empirical receipts before queuing notes for human signature. | Formal transition state machine between research candidate and canonical vault doctrine. | `HIGH` | `3_MONTH` | `WP-KAD-KNOWLEDGE-LIFECYCLE-034` |
| **`ECONOMIC_FINOPS_GOVERNANCE`** | Economic router enforces zero paid API spend by default via local policy; metered calls fail closed. | Granular per-workpackage paid API spend lease system with cryptographic quota tracking. | Metered spend requires manual toggle; needs workpackage-scoped programmatic budget caps. | `MEDIUM` | `3_MONTH` | `WP-KAD-FINOPS-LEASE-036` |
| **`SECURITY_TRUST_DOMAINS`** | Environment variables used locally; gitleaks and trivy integrated into doctor suite. | Formal capability-scoped credential broker with zero ambient prompt visibility and host-level isolation. | Credential broker abstraction needs implementation to prevent ambient token exposure in subagent shells. | `CRITICAL` | `3_MONTH` | `WP-KAD-CAPABILITY-BROKER-037` |
| **`EXECUTION_TOPOLOGY`** | OMP operates as primary interactive controller; Pi exists as portable runner; Warren is planned canary. | Full tiered execution substrate with evidence-gated asynchronous workload offload to Warren. | Warren offload provider requires empirical qualification under EXP-KAD-WARREN-ASYNC-002. | `MEDIUM` | `6_MONTH` | `EXP-KAD-WARREN-ASYNC-002` |
| **`LOCAL_FIRST_OFFLINE_BOUNDARY`** | Core tools run locally on Linux workstation; local LLM execution tested via Ollama/llama.cpp. | Formally verified WAN-disconnected operational baseline capable of completing complex workpackages offline. | WAN fault-injection experiment (EXP-KAD-OFFLINE-SURVIVAL-001) required to establish offline empirical proof. | `HIGH` | `3_MONTH` | `EXP-KAD-OFFLINE-SURVIVAL-001` |
| **`LOCAL_COMPUTE_HARDWARE_ROLES`** | AMDY workstation operational; TELL server profile defined (WP-018) and compute probe tested (WP-021). | Persistent asynchronous batch workload offload to TELL over secure node transport. | Headless daemon and workload router across AMDY <-> TELL requires empirical qualification. | `MEDIUM` | `6_MONTH` | `EXP-KAD-TELL-PERSISTENT-005` |
| **`GITHUB_OPERATING_MODEL`** | Local Git is sovereign; GitHub remote synchronized as downstream projection with CI status check protection (WP-028A). | Automated GitHub issue/PR import gateway preserving local workctl authority. | Automated bidirectional sync without granting GitHub authority to mutate local workctl state. | `MEDIUM` | `6_MONTH` | `WP-KAD-GITHUB-PROJECTION-038` |
| **`RESEARCH_OPERATING_LIFECYCLE`** | Zotero local adapter (WP-005) and real-corpus research evaluation (WP-006) operational. | Fully integrated R0-R4 claim-sensitive research workflow with automated citation graph triangulation. | Automated claim extraction and triangulation pipeline across local research corpus. | `HIGH` | `3_MONTH` | `WP-KAD-RESEARCH-WORKFLOW-039` |
| **`KNOWLEDGE_PLANE_STORAGE_TOPOLOGY`** | Markdown Vault in vault/ is canonical; wiki lint and projection synchronization verified (WP-010, WP-011). | Unified KnowledgePlane with schema-validated properties, rebuildable projections, and zero data loss. | Context plane indexing and search acceleration layers require formal integration. | `LOW` | `NOW` | `WP-KAD-KNOWLEDGE-LIFECYCLE-034` |
| **`DISTILLATION_LEARNING_PIPELINE`** | Observatory records execution telemetry and causal journals (WP-002, WP-021). | Offline trajectory pattern analyzer distilling repeated execution failures into deterministic linters and tools. | Automated distillation pipeline converting validated episodes into new regression fixtures and tools. | `HIGH` | `6_MONTH` | `EXP-KAD-DISTILLATION-006` |
| **`CONTRADICTION_INVALIDATION_MANAGEMENT`** | Epistemic status tags exist in metadata; manual dispute recording in vault notes. | Structured contradiction journal with automated fail-closed dependency invalidation. | Contradiction journaling engine linking conflicting claims to downstream blocking gates. | `HIGH` | `3_MONTH` | `WP-KAD-CONTRADICTION-JOURNAL-040` |

---

## 5. Experiment Register & Hypothesis Contracts

### EXP-KAD-OFFLINE-SURVIVAL-001: Full Offline Autonomous Engineering & Research Survival Fault-Injection Benchmark

* **Domain**: `LOCAL_FIRST_OFFLINE_BOUNDARY`
* **Hypothesis**: KAD-PI can execute end-to-end multi-step engineering and research workpackages completely offline using local deterministic tools, local models, and the local Knowledge Vault with zero network degradation.
* **Baseline**: Online execution using frontier remote models and connected web search APIs.
* **Candidate**: 100% disconnected environment (WAN severed) using Ollama/Qwen local inference and local Zotero/Markdown corpus.
* **Independent Variable**: Network connectivity state (CONNECTED vs SEVERED).
* **Controlled Variables**: Workpackage specification, Acceptance test suite, Hardware compute node (AMDY)
* **Confounders**: Local model quantization quality, Local corpus coverage limitations
* **Metrics**: Task completion rate (%); Test pass rate (%); Execution latency (seconds); Human interventions required
* **Acceptance Threshold**: 100% test pass on offline-capable workpackages; zero unauthorized outbound network attempts.
* **Disposition Taxonomy**:
  - **`ADOPT`**: Offline operation validated as primary baseline with zero regressions.
  - **`ADOPT_NARROW`**: Adopt offline baseline for engineering/code, retain online fallback for broad literature search.
  - **`DEFER`**: Local model capability insufficient; defer until stronger local weights available.

### EXP-KAD-WARREN-ASYNC-002: Warren Detached Asynchronous Workload Provider Qualification

* **Domain**: `EXECUTION_TOPOLOGY`
* **Hypothesis**: Offloading long-running, non-interactive batch tasks (distillation, fuzzing, multi-model evaluation) to Warren reduces human cognitive context switching without violating STC lease bounds.
* **Baseline**: Sequential foreground execution in interactive OMP sessions.
* **Candidate**: Asynchronous detached job submission to Warren worker with workctl status callbacks.
* **Independent Variable**: Execution runtime (OMP Foreground vs Warren Detached).
* **Controlled Variables**: Task workload complexity, STC lease boundaries, Acceptance criteria
* **Confounders**: Process coordination overhead, Log retrieval latency
* **Metrics**: Interactive session availability (%); Task throughput (jobs/hr); STC lease collision rate (%)
* **Acceptance Threshold**: Zero STC lease violations; >30% reduction in interactive session blocking time.
* **Disposition Taxonomy**:
  - **`ADOPT`**: Warren promoted to standard WORKLOAD_PROVIDER for background batch queues.
  - **`MINE_IDEAS`**: Adopt detached job schema into lightweight local background runner; discard Warren runtime.
  - **`REMOVE`**: Warren introduces unmanageable complexity; reject dependency.

### EXP-KAD-BEADS-GRAPH-003: Beads Shadow Intent-Graph Projection Evaluation

* **Domain**: `CONTEXT_PLANE_CAPABILITIES`
* **Hypothesis**: Projecting workpackage dependency graphs and decision trees into Beads graph format provides actionable visual insight without competing with workctl lifecycle authority.
* **Baseline**: Standard workctl CLI status reports and Mermaid Markdown diagrams.
* **Candidate**: Beads graph projection generated as derived artifact in vault/90_Derived/Projections/.
* **Independent Variable**: Graph visualization format (CLI/Markdown vs Beads JSON).
* **Controlled Variables**: Workpackage dependency DAG, Repository state
* **Confounders**: Visualization rendering overhead, Schema drift between workctl and Beads
* **Metrics**: Graph rendering accuracy (100%); Human comprehension speed (seconds); Authority collision count (must be 0)
* **Acceptance Threshold**: 100% deterministic compilation from workctl; zero mutation authority granted to Beads.
* **Disposition Taxonomy**:
  - **`ADOPT_NARROW`**: Adopt Beads strictly as read-only derived visualization projection.
  - **`MINE_IDEAS`**: Port graph layout algorithms into native Sofia v3 Cytoscape explorer; discard Beads.
  - **`REMOVE`**: Zero measurable comprehension gain; reject projection.

### EXP-KAD-SEMANTIC-RETRIEVAL-004: OpenViking / Needle Semantic Knowledge Retrieval Benchmark

* **Domain**: `CONTEXT_PLANE_CAPABILITIES`
* **Hypothesis**: Local semantic embedding indices accelerate relevant context retrieval for complex architecture queries without hallucinating unverified connections.
* **Baseline**: Deterministic ripgrep, AST grep, and frontmatter property queries.
* **Candidate**: Local OpenViking/Needle vector index over canonical Vault Markdown.
* **Independent Variable**: Retrieval method (Deterministic Keyword vs Semantic Vector).
* **Controlled Variables**: Query benchmark suite, Vault corpus content
* **Confounders**: Embedding model latency, Index staleness
* **Metrics**: Retrieval Recall@5; Precision@5; Query latency (ms); Context token economy
* **Acceptance Threshold**: Recall@5 > 85% with zero unverified document claims admitted into canonical context.
* **Disposition Taxonomy**:
  - **`ADOPT`**: Integrate semantic index as rebuildable derived projection provider.
  - **`ADOPT_NARROW`**: Use semantic retrieval for exploratory search only; require deterministic paths for code/governance.
  - **`REMOVE`**: Excessive memory/latency overhead; rely on deterministic search.

### EXP-KAD-TELL-PERSISTENT-005: TELL Persistent Headless Worker Integration & Evaluation

* **Domain**: `LOCAL_COMPUTE_HARDWARE_ROLES`
* **Hypothesis**: Offloading continuous test runs, multi-model evaluation sweeps, and distillation to TELL server keeps AMDY workstation responsive and accelerates iteration cycles.
* **Baseline**: Executing all verification and benchmarking locally on AMDY workstation.
* **Candidate**: Dispatching batch workloads to TELL server over SSH/secure transport.
* **Independent Variable**: Execution host (AMDY Local vs TELL Server).
* **Controlled Variables**: Test suite size, Model evaluation workloads
* **Confounders**: Network transfer latency, NixOS environment differences
* **Metrics**: AMDY GPU/CPU utilization (%); Benchmark execution wall time (s); Sync failure rate (%)
* **Acceptance Threshold**: Zero test result divergence between AMDY and TELL; >50% reduction in AMDY workstation load during eval sweeps.
* **Disposition Taxonomy**:
  - **`ADOPT`**: TELL established as canonical PERSISTENT_EXECUTION_NODE for batch workloads.
  - **`ADOPT_NARROW`**: Use TELL for nightly evaluations only; keep active test cycles on AMDY.
  - **`DEFER`**: Network/sync overhead exceeds benefits; defer dual-node operations.

### EXP-KAD-DISTILLATION-006: Downward Distillation of Validated Execution Trajectories

* **Domain**: `DISTILLATION_LEARNING_PIPELINE`
* **Hypothesis**: Analyzing historical causal journals and test failures allows offline distillation into deterministic linters and specialist prompts that permanently eliminate repeated mistakes.
* **Baseline**: Ad-hoc prompt steering and manual debugging across successive workpackages.
* **Candidate**: Automated pattern extraction from causal journals producing deterministic checks and role contract fixtures.
* **Independent Variable**: Feedback mechanism (Manual Prompting vs Distilled Deterministic Checks).
* **Controlled Variables**: Task types, Model capability class
* **Confounders**: Variability in workpackage domains
* **Metrics**: Repeated error rate (%); Token consumption per matched workpackage; Human intervention rate
* **Acceptance Threshold**: >40% reduction in repeated test-fix cycles on recurring task classes.
* **Disposition Taxonomy**:
  - **`ADOPT`**: Formalize offline distillation engine as standard post-milestone workflow.
  - **`MINE_IDEAS`**: Extract manual distillation checklists for human review; discard automated generator.
  - **`DEFER`**: Insufficient execution history; defer until 50+ workpackage episodes recorded.

---

## 6. Strategic Roadmaps (3-Month, 6-Month, 12-Month)

### 3_MONTH Horizon: Robust Single-Node Personal Engineering OS & Empirical Research Substrate

**Strategic Focus**: Boring reliability, single-node stabilization, knowledge hygiene, full offline proof, baseline telemetry, and security boundaries.

**Key Milestones**:
- [ ] **M1: Full Offline Operational Baseline (EXP-KAD-OFFLINE-SURVIVAL-001 PASS)**
- [ ] **M2: Lean Deterministic PM Kernel & WBS/DAG Validation in workctl**
- [ ] **M3: Strict Multi-Domain Security Sandbox & Capability Broker Prototype**
- [ ] **M4: KnowledgePlane Contradiction Journal & Lifecycle State Machine**
- [ ] **M5: Human Cognitive Attention & Intervention Telemetry Baseline**

### 6_MONTH Horizon: Asymmetric Dual-Node Compute Fabric (AMDY + TELL) & Governed Asynchronous Pipelines

**Strategic Focus**: Headless TELL offload, downward distillation engine, Warren async offload canary, semantic retrieval qualification.

**Key Milestones**:
- [ ] **M6: Asymmetric Dual-Node Compute Fabric Operational (AMDY interactive + TELL batch)**
- [ ] **M7: Downward Distillation Pipeline Eliminating Repeated Execution Errors**
- [ ] **M8: Warren Detached Asynchronous Workload Canary Qualification**
- [ ] **M9: ContextPlane Semantic Retrieval Benchmarking & Projection Integration**
- [ ] **M10: Staged Open Research & Specification Publishing Framework**

### 12_MONTH Horizon: Mature Self-Distilling Personal Engineering OS & Publishable Scientific Research Laboratory

**Strategic Focus**: High-throughput human-AI co-design, publishable academic artifacts, reproducible benchmarks, and trusted collaborator replication.

**Key Milestones**:
- [ ] **M11: Fully Self-Distilling Engineering & Research Operating System**
- [ ] **M12: Submission-Ready Academic Research Artifacts & Reproducible ISAs**
- [ ] **M13: Trusted-Ring Multi-Node Portability & Replication Package**
- [ ] **M14: Formal Evaluation of Long-Term Open Source Framework Staging**

---

## 7. Successor Workpackage Portfolio

### WP-KAD-COGNITIVE-TELEMETRY-031: Human Cognitive Attention, Intervention Friction & Outcome Cost Telemetry Baseline

* **Why Now**: Required by REQ-KAD-COG-002 and REQ-KAD-FIN-002 to establish empirical baseline before compute fabric expansion.
* **Intent References**: `DEC_ID_04, DEC_ID_20`
* **Dependencies**: `WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030`
* **Scope**: `tools/kad/telemetry/, tools/kad/observatory/, tools/kad/test/telemetry*.test.mjs`
* **Non-Scope**: `commercial telemetry SaaS, active keyloggers, paid API spend`
* **Authority Class**: `engineering` | **Risk Level**: `MEDIUM`
* **Acceptance Evidence**: Observatory records human intervention count, friction events, and task wall time with zero passive overhead.
* **Execution Provider**: `OMP` (LOCAL_DETERMINISTIC)

### WP-KAD-GOVERNANCE-GATES-032: Deterministic Governance Gates, Human Signature Verification & Main Merge Protection

* **Why Now**: Required by REQ-KAD-COG-001 and REQ-KAD-AUTH-001 to enforce human sovereignty on sensitive transitions.
* **Intent References**: `DEC_ID_03, DEC_ID_05`
* **Dependencies**: `WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030`
* **Scope**: `bin/workctl, tools/workspace/governance-gates.mjs, tools/kad/test/governance*.test.mjs`
* **Non-Scope**: `enterprise RBAC, OAuth servers, multi-user auth`
* **Authority Class**: `governance` | **Risk Level**: `HIGH`
* **Acceptance Evidence**: Direct unapproved merges, unauthorized spend leases, and unverified knowledge promotions fail closed deterministically.
* **Execution Provider**: `OMP` (LOCAL_DETERMINISTIC)

### WP-KAD-STC-SANDBOX-HARDENING-033: STC Worktree Sandboxing, Subagent Isolation & Capability Lease Enforcement

* **Why Now**: Required by REQ-KAD-AUTH-001 and REQ-KAD-SEC-001 to prevent subagent authority leakage.
* **Intent References**: `DEC_ID_05, DEC_ID_08`
* **Dependencies**: `WP-KAD-GOVERNANCE-GATES-032`
* **Scope**: `tools/workspace/stc-lease.mjs, tools/kad/test/stc-lease*.test.mjs`
* **Non-Scope**: `root privilege escalation, container virtualization`
* **Authority Class**: `engineering` | **Risk Level**: `HIGH`
* **Acceptance Evidence**: Out-of-scope filesystem edits and unauthorized command executions fail closed with explicit lease violation receipts.
* **Execution Provider**: `OMP` (LOCAL_DETERMINISTIC)

### WP-KAD-KNOWLEDGE-LIFECYCLE-034: KnowledgePlane State Machine, Epistemic Gating & Rebuildable Projection Pipeline

* **Why Now**: Required by REQ-KAD-AUTH-002 and REQ-KAD-KNOW-001 to formalize promotion pipeline from candidate to doctrine.
* **Intent References**: `DEC_ID_06, DEC_ID_14`
* **Dependencies**: `WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030`
* **Scope**: `tools/kad/wiki/, bin/kad-wiki, vault/00_Governance/`
* **Non-Scope**: `new vector databases, proprietary cloud RAG`
* **Authority Class**: `epistemic` | **Risk Level**: `HIGH`
* **Acceptance Evidence**: All vault transitions follow explicit state machine (CANDIDATE -> VERIFIED -> PROMOTED) with 100% rebuildable projections.
* **Execution Provider**: `OMP` (LOCAL_DETERMINISTIC)

### WP-KAD-CONTRADICTION-JOURNAL-040: Structured Contradiction Journal, Epistemic Conflict Invalidation & Fail-Closed Gating

* **Why Now**: Required by REQ-KAD-KNOW-002 to prevent stale or contradictory claims from polluting execution plans.
* **Intent References**: `DEC_ID_16`
* **Dependencies**: `WP-KAD-KNOWLEDGE-LIFECYCLE-034`
* **Scope**: `tools/kad/wiki/contradictions.mjs, tools/kad/test/contradictions.test.mjs, vault/00_Governance/`
* **Non-Scope**: `probabilistic conflict resolution`
* **Authority Class**: `epistemic` | **Risk Level**: `HIGH`
* **Acceptance Evidence**: Conflicting claims are journaled, tagged CONTESTED, and block downstream dependent automated actions until resolved.
* **Execution Provider**: `OMP` (LOCAL_DETERMINISTIC)

