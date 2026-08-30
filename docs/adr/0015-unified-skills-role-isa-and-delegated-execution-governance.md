# ADR 0015: Unified Skills & Role ISA (V1.1.0), Delegated Execution Governance & Pre-GitHub Baseline Freeze

## Context
As KAD-PI approaches operationalization on GitHub, the repository requires a canonical architectural freeze of its cognitive skills, typed roles, and external execution infrastructure. 

Previously, `ISA-KAD-SKILL-ROLE-001` (WP-024) successfully unified the cognitive skill surface into 15 canonical skills and introduced the `ROLE_CONTRACT_V1` engine. However, external infrastructure—such as the Warren factory-floor candidate, Beads intent graph projection, and Agentic Engineering upstream doctrine—remained ambiguously integrated, creating the risk of external systems usurping canonical work lifecycle authority or corrupting in-flight doctrine.

To resolve these ambiguities before remote GitHub integration, `ISA-KAD-SKILL-ROLE-002 / v1.1` was formulated under **WP-KAD-ISA-FINAL-SNAPSHOT-028**.

## Decisions

1. **Adoption of ISA-KAD-SKILL-ROLE-002 / v1.1**:
   - Supersede `ISA-KAD-SKILL-ROLE-001` with `ISA-KAD-SKILL-ROLE-002` (v1.1.0).
   - Codify the sovereign invariant: KAD may delegate execution, retrieval, graph projection, research, analytics, and presentation. External systems may own their transient internal run state, but **MUST NOT** become authoritative over human intent, work lifecycle, canonical claims, evidence, acceptance, knowledge truth, or ISA authority.

2. **Formal Lifecycle Separation (`WORK_LIFECYCLE != EXECUTION_RUN_LIFECYCLE`)**:
   - **Work Lifecycle**: Exclusively owned and transitioned by `bin/workctl` (`READY -> CLAIMED -> IN_PROGRESS -> REVIEW -> ACCEPTED / BLOCKED / REJECTED / SUPERSEDED`).
   - **Execution Run Lifecycle**: Owned by the delegated execution provider (`QUEUED -> RUNNING -> SUCCEEDED / FAILED / CANCELLED / LOST`).
   - A single workpackage may dispatch `0..N` execution runs.
   - Run results generate structured evidence receipts (`kad-execution-run-receipt-v1`); receipts **MUST NOT** autonomously mutate canonical work state.

3. **External Provider Taxonomy (5 Classes)**:
   - Reconcile external infrastructure into 5 distinct classes without expanding the 15-skill cognitive catalog:
     - `WORKLOAD_PROVIDER`: Physical run lifecycle management (OMP Native Executor, Pi Worker Runtime, Local Process Runner, and Warren).
     - `INTENT_GRAPH_PROJECTION`: Read-only DAG analysis, dependency cycles, and scheduling projections (Sofia Cytoscape, Beads).
     - `EXTERNAL_DOCTRINE_SOURCE`: Upstream practitioner research (Agentic Engineering). Epistemic class: `PRACTITIONER_DERIVED + HUMAN_REVIEWED + NON_PRIMARY`. Requires empirical KAD evidence before promotion.
     - `RESEARCH_PROVIDER`: External search and corpus extraction (DeepAPI, Zotero, CrossRef, OpenAlex, OpenViking).
     - `PRESENTATION_PROVIDER`: Read-only UI, TUIs, and desktop styling (Sofia v3, Tell ANSI TUI, Omarchy Cyberdeck Theme, Obsidian Bridge) with zero shell mutation authority.

4. **External Infrastructure Positions**:
   - **Warren**: Positioned as `WORKLOAD_PROVIDER` (`CANARY_PLANNED / LIKELY_ADOPT`). Subordinate to `workctl`, branch/artifact delivery only, no autonomous merge, no tracker authority, no ISA authority.
   - **Beads**: Positioned as `INTENT_GRAPH_PROJECTION` (`SHADOW_CANARY / MINE`). Authority direction is strictly `workctl -> Beads` (never `Beads -> workctl`). Prohibited from claiming tasks, closing tasks, or setting work priority.
   - **Agentic Engineering**: Positioned as `EXTERNAL_DOCTRINE_SOURCE` (`ADOPT_RESEARCH_UPSTREAM`). Non-primary practitioner research; consequential claims require local evidence; zero unreviewed source code vendoring.

5. **Execution vs Learning Separation (`EXECUTION != LEARNING`)**:
   - Dispatched workers consume immutable accepted doctrine during execution.
   - Active workers **MUST NOT** continuously rewrite canonical doctrine while performing assigned tasks.
   - Knowledge evolution follows a strict governed pipeline: `execution -> receipts/evidence -> evaluation/retro -> dedicated distillation -> candidate knowledge -> 5-advisor review -> experiment/evidence -> human acceptance -> KnowledgePlane`.

6. **Typed Transient Workload Contract (`KAD_WORKLOAD_V1`)**:
   - Dispatched workloads are defined by a model-neutral contract containing workload ID, workpackage ref, claim ref, role contract ref, objective, acceptance criteria, source revision, mutation scope, trust domain, network/credential class, command authority, escalation policy, capability class, execution provider, host resource class, timeout, concurrency, budget class, delivery policy, and required receipts.
   - Model and vendor identities are strictly excluded from authoritative work definitions; model binding occurs at dispatch and is recorded in the execution receipt.

7. **Role Fabric Evolution (`ROLE_CONTRACT_V2`)**:
   - Role contracts are extended with execution and offload semantics: `offload_allowed`, `detached_execution_safe`, `preferred_workload_providers`, `minimum_required_context`, `expected_human_attention_savings`, and `acceptance_evidence_requirements`.
   - Human-facing architectural/control roles (`kad-master`, `advisor-*`) remain strictly interactive (`offload_allowed: false`).

8. **Pre-GitHub Baseline Freeze & Phase Handoff**:
   - Freeze the canonical pre-GitHub repository state.
   - Strict hard stop: Do not configure remote GitHub repository governance, push commits, or mutate the local canonical Vault/Wiki in this workpackage.
   - Handoff follows the strict 3-phase sequence: Phase A (GitHub Operationalization) -> Phase B (Canonical Git Commit & Push) -> Phase C (Vault/Wiki Projection).

## Consequences

- **Positive**:
  - Eliminates ambiguity regarding external infrastructure boundaries and prevents authority inversion.
  - Decouples physical execution runs from canonical work authorization.
  - Protects canonical knowledge from in-flight corruption during active worker execution.
  - Establishes a clean, auditable pre-GitHub baseline.
- **Negative / Trade-offs**:
  - Workload dispatch requires creating and validating typed `KAD_WORKLOAD_V1` contracts.
  - External tools (Beads, Warren) cannot be used as primary workflow drivers; adapters must conform to unidirectional `workctl` authority.
