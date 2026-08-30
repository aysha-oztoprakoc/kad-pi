# KAD-PI Unified Skills & Role ISA (V1.1.0)

* **Document Identifier**: `ISA-KAD-SKILL-ROLE-002`
* **Version**: `1.1.0`
* **Status**: `ACCEPTED_SNAPSHOT`
* **Authority**: Wayfinder + KAD Epistemic Evidence Gate + Pre-GitHub Freeze (WP-028)
* **Supersedes**: `ISA-KAD-SKILL-ROLE-001` (v1.0.0)
* **Constitutional Precedence**: `PRIME_DIRECTIVE.md` outranks OMP conventions.
* **Governing Rule**: *Repository evidence is authoritative. Research proposes. Deterministic policy authorizes.*

---

## 1. Constitutional Architecture & Invariants

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        TIER 1: HUMAN & EPISTEMIC GOVERNANCE                            │
│  [Human Operator] ──(ask_user: 5+1)──> [Wayfinder V2] ──> [5-Advisor Board]           │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ (AUTHOR_DECLARED Selection & Human Intent)
┌──────────────────────────────────────────▼─────────────────────────────────────────────┐
│                    TIER 2: WORKSPACE COORDINATION & LEDGER LIFECYCLE                   │
│   [Planning Compiler] ──> [workctl import] ──> [workctl claim] ──> [STC Lease]         │
│   • WORK_LIFECYCLE: READY -> CLAIMED -> IN_PROGRESS -> REVIEW -> ACCEPTED/BLOCKED     │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ (Mutating Claim + fusion_writer_lease)
┌──────────────────────────────────────────▼─────────────────────────────────────────────┐
│                 TIER 3: COGNITIVE GUIDANCE & TYPED ROLES (ROLE_CONTRACT_V2)            │
│  [kad-builder] ──> [kad-tester] ──> [kad-reviewer] ──> [kad-evidence-gate]             │
│  • Role Offload Semantics: preferred_workload_providers, offload_allowed, safe_context │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ (KAD_WORKLOAD_V1 Typed Transient Contract)
┌──────────────────────────────────────────▼─────────────────────────────────────────────┐
│                  TIER 4: DELEGATED EXECUTION SUBSTRATE & PROVIDERS                     │
│  • WORKLOAD_PROVIDERS: OMP Native Executor (Active), Pi Worker (Active), Warren (Canary)│
│  • INTENT_GRAPH_PROJECTIONS: Cytoscape (Active), Beads (Shadow Canary, workctl -> Beads)│
│  • EXTERNAL_DOCTRINE_SOURCE: Agentic Engineering Upstream (Research Only)             │
│  • EXECUTION_RUN_LIFECYCLE: QUEUED -> RUNNING -> SUCCEEDED / FAILED / CANCELLED        │
│  • Invariant: EXECUTION != LEARNING (Workers consume doctrine, distillation updates)   │
│  • Single Knowledge Authority: KAD KnowledgePlane / Canonical Obsidian Vault           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Sovereign Invariants:
1. **Constitutional Delegation Boundary**: KAD may delegate execution, retrieval, graph projection, research, analytics, and presentation. External systems may own their transient internal state, but **MUST NOT** become authoritative over:
   - Human intent;
   - Work lifecycle;
   - Canonical claims;
   - Canonical evidence;
   - Work acceptance;
   - Project knowledge truth;
   - ISA authority.
2. **Lifecycle Separation Invariant**: `WORK_LIFECYCLE != EXECUTION_RUN_LIFECYCLE`.
   - Work lifecycle is owned exclusively by `workctl`.
   - Execution-run lifecycle is owned by the delegated execution provider.
   - Run results provide evidence receipts; they **MUST NOT** autonomously mutate canonical work state.
3. **Execution vs Learning Invariant**: `EXECUTION != LEARNING`. Workers consume accepted knowledge while executing; workers **MUST NOT** continuously rewrite canonical doctrine while performing assigned tasks. Learning flows strictly through the governed distillation pipeline.
4. **Cognitive vs Authoritative Separation**: Skills provide cognitive guidance; they do not possess mutating authority over project lifecycle or claims.
5. **Deterministic Lifecycle Authority**: `bin/workctl` and deterministic KAD code own work lifecycle, tickets, claims, state transitions, and acceptance.
6. **Transport Subordination**: OMP and external execution providers own run transport, NOT KAD lifecycle semantics.
7. **Model Proposes, Policy Authorizes**: Probabilistic model output is a candidate proposal; deterministic policy gates authorize.
8. **Zero-Model Work Ledger**: Work contracts in `.agents/work/` and `KAD_WORKLOAD_V1` definitions contain zero vendor, provider, or model identities. Dispatch binding belongs in the execution receipt.
9. **TOKENMAXXING & Local-First**: Local and free deterministic execution outranks cloud inference. Strong cloud models are reserved strictly for genuine ambiguity.
10. **Single Knowledge Authority**: The Canonical Obsidian Vault (`vault/`) and KAD KnowledgePlane are the sole durable truth authority. All vector indexes, graph projections, OpenViking stores, and views are derived and have `authority: false`.

---

## 2. Section A: Canonical Skill Surface (15 Concepts)

The canonical cognitive-skill catalog remains strictly 15 skills across 6 typed classes:

| # | Canonical Skill | Class | Core Intent & Operational Responsibility | Primary Tools / CLIs |
|---|---|---|---|---|
| 1 | **`ask-matt`** | `WORKFLOW` | Meta-skill router: inspects user intent and routes to the optimal skill, role, or discipline. | `bin/workctl status`, `read`, `ask`. |
| 2 | **`wayfinder`** | `WORKFLOW` | Strategic decision engine: executes PREFLIGHT, INFLIGHT (5+1 ask-me), and POSTFLIGHT verification. | `ask` (5+1 protocol), `read`, `task`, `write`. |
| 3 | **`implement`** | `PROCESS_DISCIPLINE` | Engineering implementation: executes code edits on claimed files within `fusion_writer_lease`. | `bin/workctl claim`, `edit`, `write`, `lsp`, `ast_edit`. |
| 4 | **`research`** | `WORKFLOW` | High-trust research fabric: investigates primary sources with full citation provenance. | `read`, `task` (scout), `write`, DeepAPI / Web. |
| 5 | **`human-runbook`** | `CAPABILITY_FRONTEND` | Interactive bash wizard generator for procedures only a human can perform (secrets, cloud). | `write`, `edit`, `ask`, `bash`. |
| 6 | **`handoff`** | `HARNESS_ADAPTER` | Durable continuation generator bridging to `workctl handoff` and multi-harness resumes. | `bin/workctl handoff`, `git diff`, `write`. |
| 7 | **`tdd`** | `PROCESS_DISCIPLINE` | Test-Driven Development discipline: Red -> Green -> Refactor at public seams. | `npm test`, `pytest`, `make verify`, `edit`. |
| 8 | **`diagnosing-bugs`** | `PROCESS_DISCIPLINE` | Root-cause diagnosis loop for race conditions, leaks, and regressions using DAP and repros. | `debug` (DAP), `browser`, `grep`, `read`, `bash`. |
| 9 | **`code-review`** | `PROCESS_DISCIPLINE` | Dual-axis review evaluating Standards (style, lint, types) and Specification (ticket fulfill). | `git diff`, `git log`, `task` (parallel reviewers). |
| 10 | **`codebase-design`** | `PROCESS_DISCIPLINE` | Deep module design: narrow public seams, hidden complexity, and clean dependency acyclicity. | `read`, `ask`, `make`, `dependency-cruiser`. |
| 11 | **`domain-modeling`** | `PROCESS_DISCIPLINE` | Domain vocabulary modeler: formalizes bounded contexts, entities, and `CONTEXT.md`. | `edit`, `write`, `read`. |
| 12 | **`grilling`** | `PROCESS_DISCIPLINE` | Relentless adversarial Socratic interview (1 question/turn) attacking plan assumptions. | `ask` (Socratic constraint), `write`. |
| 13 | **`prototype`** | `CAPABILITY_FRONTEND` | Throwaway experimental probe validating UI/architectural feel without mutating ledger. | `task`, `write`, `read`, `browser`. |
| 14 | **`kad-advisory-board`**| `POLICY_FRONTEND` | 5-lens adversarial review (Architecture, Security, Economics, Verification, Epistemic Risk). | `ask`, `read`, `task` (parallel advisors), `write`. |
| 15 | **`skill-governance`** | `POLICY_FRONTEND` | Manages skills lockfile (`skills.lock.json`), schema validation, doctor diagnostics, and audits. | `bin/workctl skills doctor`, `read`, `write`. |

---

## 3. Section B: Migration & Supersession Matrix (ISA-001 -> ISA-002)

| Component / Subsystem | ISA-001 (v1.0.0) Baseline | ISA-002 (v1.1.0) Target | Supersession Justification |
|---|---|---|---|
| **Lifecycle Model** | Monolithic execution in OMP turns | Formal separation: `WORK_LIFECYCLE != EXECUTION_RUN_LIFECYCLE` | Decouples physical execution runs from work authorization. |
| **External Providers** | Implicit OMP-only execution transport | 5-class External Provider Taxonomy (`WORKLOAD`, `GRAPH_PROJECTION`, `DOCTRINE_SOURCE`, `RESEARCH`, `PRESENTATION`) | Unifies infrastructure without diluting cognitive skills. |
| **Workload Contract** | Ad-hoc subagent prompt payloads | Typed `KAD_WORKLOAD_V1` contract with receipt validation | Enforces model neutrality and boundary verification. |
| **Warren Integration** | Unclassified | `WORKLOAD_PROVIDER` (`CANARY_PLANNED / LIKELY_ADOPT`), branch/artifact delivery only, subordinate to `workctl` | Factory-floor candidate; KAD retains authority over meaning. |
| **Beads Integration** | Unclassified | `INTENT_GRAPH_PROJECTION` (`SHADOW_CANARY`), `workctl -> Beads` authority direction ONLY | Prevents shadow task tracker from usurping `workctl`. |
| **Agentic Engineering** | Informal reference | `EXTERNAL_DOCTRINE_SOURCE` (`ADOPT_RESEARCH_UPSTREAM`, non-primary, requires evidence for promotion) | Establishes research upstream without code vendoring. |
| **Learning Pipeline** | Informal distillation notes | Strict invariant: `EXECUTION != LEARNING` with governed distillation pipeline | Prevents in-flight doctrine corruption by active workers. |
| **Role Fabric** | `ROLE_CONTRACT_V1` | `ROLE_CONTRACT_V2` with execution and offload semantics | Governs detached execution safety and context scoping. |
| **Offload Policy** | Implicit | Explicit positive vs negative factor evaluation matrix | Eliminates offload for the sake of offload. |

---

## 4. Section C: Typed Skill Classes

1. **`PROCESS_DISCIPLINE`**: Enforces verifiable engineering methodology (`implement`, `tdd`, `code-review`, `diagnosing-bugs`, `codebase-design`, `domain-modeling`, `grilling`).
2. **`WORKFLOW`**: Orchestrates multi-step decision or research lifecycles (`ask-matt`, `wayfinder`, `research`).
3. **`POLICY_FRONTEND`**: Bridges cognitive turns to deterministic policy verifiers (`kad-advisory-board`, `skill-governance`, `kad-evidence-gate`, `workspace-doctor`, `workspace-pick-work`, `workspace-finish`).
4. **`CAPABILITY_FRONTEND`**: User-facing interfaces for tools and experimental prototypes (`human-runbook`, `prototype`, `kad-wiki`, `deepapi`).
5. **`HARNESS_ADAPTER`**: Connects cognitive instructions to host runtime lifecycles (`handoff`, `workspace-orient`, `workspace-handoff`).
6. **`PRESENTATION`**: Manages visual, TUI, and desktop styling surfaces (`omarchy`).

---

## 5. Section D: Role Fabric & Execution Semantics (`ROLE_CONTRACT_V2`)

Each role contract defines immutable boundaries, mutation rights, and execution offload semantics:

```json
{
  "$schema": "kad-role-contract-v2",
  "role": "kad-builder",
  "trust_domain": "engineering",
  "mutation_rights": "EXCLUSIVE_OWNED_PATHS",
  "requires_claim": true,
  "requires_lease": "fusion_writer_lease",
  "max_spawn_depth": 2,
  "allowed_child_roles": ["kad-tester", "kad-scout", "kad-debugger"],
  "model_tier_preference": ["STANDARD_REMOTE", "LOCAL_GENERAL"],
  "tools_allowlist": ["edit", "write", "read", "lsp", "ast_edit", "npm", "make", "git", "workctl"],
  "verifier_independent": false,
  "offload_allowed": true,
  "detached_execution_safe": true,
  "preferred_workload_providers": ["omp-native-executor", "pi-worker", "warren"],
  "minimum_required_context": "BOUNDED_WORKPACKAGE",
  "expected_human_attention_savings": "HIGH_UNATTENDED",
  "acceptance_evidence_requirements": ["DETERMINISTIC_TESTS", "DIFF_PATCH", "DOUBLE_AXIS_REVIEW"]
}
```

### The 15 Logical Roles & Execution Profiles:

1. **`kad-master`**: Primary orchestrator. Non-mutating (`mutation_rights: NONE`). Interactive only (`offload_allowed: false`, `detached_execution_safe: false`). Minimum context: `FULL_CONSTITUTIONAL`. Model tier: `FRONTIER_REASONING` (`@plan`).
2. **`kad-builder`**: Primary implementation worker. Possesses exclusive mutating authority over claimed paths. Offload capable (`offload_allowed: true`, `detached_execution_safe: true`). Preferred providers: `omp-native-executor`, `pi-worker`, `warren`. Context: `BOUNDED_WORKPACKAGE`. Model tier: `STANDARD_REMOTE` / `LOCAL_GENERAL` (`@task`).
3. **`kad-debugger`**: Diagnostic specialist using DAP debugger and repro scripts. Non-mutating. Offload capable (`offload_allowed: true`). Context: `BOUNDED_WORKPACKAGE`. Model tier: `STANDARD_REMOTE` / `LOCAL_GENERAL` (`@task`).
4. **`kad-tester`**: Independent test author and runner. Verifies public seams via TDD. Offload capable (`offload_allowed: true`, `detached_execution_safe: true`). Preferred providers: `omp-native-executor`, `pi-worker`, `warren`. Context: `BOUNDED_WORKPACKAGE`. Model tier: `STANDARD_REMOTE` / `LOCAL_GENERAL` (`@task`).
5. **`kad-reviewer`**: Independent verifier. Dual-axis Standards + Spec auditor. Strictly independent from builder. Offload capable (`offload_allowed: true`). Context: `WORKSPACE_TOPOLOGY`. Model tier: `INDEPENDENT_VERIFIER` (`@verifier`).
6. **`kad-researcher`**: Literature and source investigator. Extracts verified facts and citations. Offload capable (`offload_allowed: true`). Context: `TASK_ONLY`. Model tier: `LITERATURE_SYNTHESIS` (`@research`).
7. **`kad-librarian`**: KnowledgePlane and Obsidian vault curator. Validates notes, projections, and backlinks. Interactive only (`offload_allowed: false`). Context: `FULL_CONSTITUTIONAL`. Model tier: `STANDARD_REMOTE`.
8. **`kad-scout`**: Lightweight exploratory agent for directory mapping and pattern discovery. Offload capable (`offload_allowed: true`). Context: `TASK_ONLY`. Model tier: `TINY_SPECIALIST` / `FREE_REMOTE` (`@smol`).
9. **`kad-local-extractor`**: Local Qwen worker for structured JSON extraction. Offload capable (`offload_allowed: true`). Context: `TASK_ONLY`. Model tier: `LOCAL_NARROW` (`@local_retrieval`).
10. **`kad-world`**: Stheno persistent local world simulation. Strictly isolated from engineering. Interactive / local only (`offload_allowed: false`). Context: `TASK_ONLY`. Model tier: `LOCAL_WORLD` (`@world`).
11. **`advisor-architecture`**: Advisory specialist on system structure and seam design. Non-mutating. Interactive only (`offload_allowed: false`). Model tier: `INDEPENDENT_VERIFIER`.
12. **`advisor-security`**: Advisory specialist on trust domains and mutation leases. Non-mutating. Interactive only (`offload_allowed: false`). Model tier: `INDEPENDENT_VERIFIER`.
13. **`advisor-economics`**: Advisory specialist on token expenditure and TOKENMAXXING. Non-mutating. Interactive only (`offload_allowed: false`). Model tier: `INDEPENDENT_VERIFIER`.
14. **`advisor-verification`**: Advisory specialist on test completeness and TDD seams. Non-mutating. Interactive only (`offload_allowed: false`). Model tier: `INDEPENDENT_VERIFIER`.
15. **`advisor-epistemic`**: Advisory specialist on knowledge provenance and anti-poisoning. Non-mutating. Interactive only (`offload_allowed: false`). Model tier: `INDEPENDENT_VERIFIER`.

### Spawn Hierarchy & Independence Rules:
- **Max Recursive Spawn Depth**: `2` (Level 0: User/Master -> Level 1: Subagent -> Level 2: Leaf Scout/Tester).
- **No Self-Replication**: A subagent cannot spawn an identical role.
- **Verifier Independence**: `kad-reviewer` and the 5 advisors **MUST NOT** be spawned with the same model/provider family as the active `kad-builder` on that workpackage.

---

## 6. Section E: Two Distinct Lifecycles

```text
CANONICAL WORK LIFECYCLE (Owned exclusively by workctl)
┌───────────┐     ┌───────────┐     ┌───────────────┐     ┌────────────┐     ┌────────────┐
│   READY   │ ──> │  CLAIMED  │ ──> │  IN_PROGRESS  │ ──> │   REVIEW   │ ──> │  ACCEPTED  │
└───────────┘     └───────────┘     └───────────────┘     └────────────┘     └────────────┘
      │                                                           │                 ▲
      ▼                                                           ▼                 │
┌───────────┐                                               ┌────────────┐          │
│  BLOCKED  │                                               │  REJECTED  │ ─────────┘
└───────────┘                                               └────────────┘

                                ▲
                                │ (Evidence Receipts Submitted via workctl release)
                                │
DELEGATED EXECUTION-RUN LIFECYCLE (Owned by Delegated Provider)
┌───────────┐     ┌───────────┐     ┌───────────────┐
│  QUEUED   │ ──> │  RUNNING  │ ──> │   SUCCEEDED   │ ──> [Evidence Receipts Generated]
└───────────┘     └───────────┘     └───────────────┘
      │                                     │
      ▼                                     ▼
┌───────────┐                       ┌───────────────┐
│ CANCELLED │                       │ FAILED / LOST │
└───────────┘                       └───────────────┘
```

1. **Work Lifecycle**: Exclusively owned and authorized by `workctl`. Only human decisions and deterministic policy verifiers can transition a workpackage between states.
2. **Execution Run Lifecycle**: Owned by the execution provider (OMP, Pi runtime, Warren). Tracks the physical execution of a dispatched workload.
3. **Cardinality**: A single workpackage may generate `0..N` execution runs.
4. **Receipt Integrity**: Execution runs generate structured execution receipts (`kad-execution-run-receipt-v1`). A receipt provides evidence; it **NEVER** directly mutates canonical work state.

---

## 7. Section F: External Provider Taxonomy & Positions

### 1. `WORKLOAD_PROVIDER`
- **Role**: Physical lifecycle management of delegated execution runs.
- **Active Providers**:
  - `omp-native-executor`: Rich interactive controller for active human sessions.
  - `pi-worker`: Local deterministic worker substrate for multi-turn episodes.
  - `local-process-runner`: Deterministic CLI execution runner.
- **Warren Position (`CANARY_PLANNED / LIKELY_ADOPT`)**:
  - Warren may own the physical lifecycle of delegated factory-floor runs; KAD owns their meaning and acceptance.
  - Subordinate to `workctl`.
  - Delivery mode: **Branch-only or Artifact-only**.
  - Prohibited: Autonomous merge, canonical work transitions, tracker authority, ISA authority.
  - Pi workers are the currently justified worker path. Warren installation remains a separate evidence-gated workpackage.

### 2. `INTENT_GRAPH_PROJECTION`
- **Role**: Read-only projection and graph analysis of dependencies and scheduling.
- **Active Providers**:
  - `cytoscape-adapter`: In-browser interactive semantic graph explorer.
- **Beads Position (`SHADOW_CANARY / MINE`)**:
  - Authority direction: **`workctl -> Beads` ONLY**.
  - Permitted: DAG queries, cycle detection, dependency analysis, scheduling recommendations, visualization.
  - Prohibited: Task claims, task closure, priority authority, work lifecycle mutation, canonical memory, KnowledgePlane replacement.

### 3. `EXTERNAL_DOCTRINE_SOURCE`
- **Role**: External practitioner literature, architecture comparison, and workflow research.
- **Agentic Engineering Position (`ADOPT_RESEARCH_UPSTREAM`)**:
  - Epistemic status: `PRACTITIONER_DERIVED + HUMAN_REVIEWED + NON_PRIMARY`.
  - Permitted: Hypothesis generation, architecture comparison, context engineering research, evaluation design.
  - Invariant: Consequential claims require empirical KAD evidence before promotion to accepted doctrine. Zero unreviewed code vendoring.

### 4. `RESEARCH_PROVIDER`
- **Role**: External corpus retrieval, bibliography normalization, and academic graph querying.
- **Active Providers**: `deepapi`, `zotero-local`, `crossref`, `openalex`, `openviking-derived`.

### 5. `PRESENTATION_PROVIDER`
- **Role**: Read-only viewmodels, TUI palettes, desktop themes, and status dashboards.
- **Active Providers**: `sofia-v3`, `tell-ansi-tui`, `omarchy-cyberdeck-theme`, `obsidian-bridge`.
- **Invariant**: Presentation layers possess **zero shell mutation authority**.

---

## 8. Section G: Typed Transient Workload Contract (`KAD_WORKLOAD_V1`)

Workloads dispatched to execution providers are encapsulated in a typed, model-neutral contract:

```json
{
  "schema": "kad-workload-v1",
  "workload_id": "wl-2026-08-30-001",
  "workpackage_ref": "WP-KAD-ISA-FINAL-SNAPSHOT-028",
  "claim_ref": "claim-028",
  "role_contract_ref": "kad-builder",
  "objective": "Implement ISA-KAD-SKILL-ROLE-002 and freeze baseline snapshot",
  "acceptance_criteria_ref": ["AC-01-LIFECYCLE-SEPARATION", "AC-02-PROVIDER-TAXONOMY"],
  "source_revision": "0ea896b54d799ca98fa3b45fe45f519655135807",
  "mutation_scope": ["docs/architecture/", "tools/kad/", "config/"],
  "trust_domain": "engineering",
  "network_class": "LOCAL_LOOPBACK",
  "credential_class": "NONE",
  "command_authority": "EXCLUSIVE_MUTATION",
  "human_escalation_policy": "WAYFINDER_ASK_ME",
  "requested_capability_class": "STANDARD_REMOTE",
  "execution_provider": "omp-native-executor",
  "host_resource_class": "host.amdy.workstation",
  "timeout_seconds": 3600,
  "concurrency_limit": 4,
  "budget_class": "ZERO_MARGINAL_SPEND",
  "delivery_policy": "DIRECT_WORKSPACE",
  "required_receipts": ["telemetry_metrics", "test_results", "diff_patch"]
}
```

### Execution Run Receipt (`kad-execution-run-receipt-v1`):
```json
{
  "schema": "kad-execution-run-receipt-v1",
  "receipt_id": "rcpt-2026-08-30-001",
  "workload_id": "wl-2026-08-30-001",
  "execution_provider": "omp-native-executor",
  "run_status": "SUCCEEDED",
  "dispatched_model_binding": {
    "provider": "google-antigravity",
    "model": "gemini-3.7-flash",
    "tier": "FREE_REMOTE"
  },
  "started_at": "2026-08-30T12:00:00.000Z",
  "completed_at": "2026-08-30T12:05:00.000Z",
  "exit_code": 0,
  "receipts": {
    "test_results": { "total": 19, "passed": 19, "failed": 0 },
    "diff_patch": "..."
  }
}
```

---

## 9. Section H: Execution vs Learning Invariant (`EXECUTION != LEARNING`)

Workers consume accepted knowledge while executing. Workers **MUST NOT** continuously rewrite canonical doctrine while performing their assigned work.

```text
[Execution Run] ──> [Evidence Receipts] ──> [Retrospective / Evaluation]
                                                      │
                                                      ▼
[KnowledgePlane] <── [Human Acceptance] <── [Distillation & Verification]
```

### Governed Learning Sequence:
1. **Execution**: Dispatched workers execute bounded tasks against immutable accepted doctrine.
2. **Receipts / Evidence**: Outputs, diffs, tests, and telemetry are captured in append-only evidence journals.
3. **Evaluation / Retro**: Post-flight evaluation measures divergence, errors, or performance gaps.
4. **Dedicated Distillation**: Off-line distillation extracts reusable heuristics or candidate knowledge.
5. **Advisory / Wayfinder Review**: Proposed candidate knowledge is stress-tested through the 5-advisor board.
6. **Empirical Verification**: Candidate is tested against regression test suites.
7. **Human Acceptance**: Human Project Lead authorizes promotion (`AUTHOR_DECLARED`).
8. **KnowledgePlane Incorporation**: Accepted knowledge is committed to the canonical Obsidian vault.

---

## 10. Section I: Offload Policy & Economics

Work is delegated to external or detached providers **ONLY** when delegation demonstrably improves the system.

### Decision Matrix:
| Evaluation Dimension | Positive Factor (Favors Offload) | Negative Factor (Favors Local/Interactive) |
|---|---|---|
| **Duration & Attention** | Long unattended execution (>10 min), human attention saved. | Short interactive feedback loop (<1 min), human in loop required. |
| **Task Independence** | Bounded, decoupled, single-module scope. | Tightly coupled, cross-cutting architectural refactor. |
| **Verification** | Deterministic tests, automated linters, clear oracle. | Ambiguous subjective acceptance, qualitative human review. |
| **Resource & Cost** | Utilizes existing free quota or paid subscription. | Incurs unapproved marginal PAYG spend. |
| **Trust & Credentials** | Zero secrets required, local loopback network. | Requires private keys, production credentials, wide network. |
| **Merge Safety** | Isolated branch delivery, low merge collision risk. | High merge contention on shared hot paths. |

**Constitutional Rule**: The mere availability of Warren or any other workload provider is **not itself justification for offloading**.

---

## 11. Section J: Authority Matrix & Invariants

| System / Component | Canonical Authority Scope | Subordinate To | Permitted Mutations | Forbidden Operations |
|---|---|---|---|---|
| **Human Project Lead** | Constitutional Intent, Final Acceptance | None | Entire Workspace | Unrecorded silent mutation |
| **`bin/workctl`** | Work Lifecycle, Tickets, Claims, Priority | Human Intent | `.agents/work/`, Leases | Autonomous code generation |
| **KAD KnowledgePlane** | Sole Durable Project Truth, Vault | Human Acceptance | `vault/`, `docs/` | Model self-promotion |
| **Role Contracts** | Spatiotemporal Boundaries, Tool Permissions | ISA & Governance | Runtime Execution | Self-expansion of rights |
| **STC Lease Manager** | Worktree Mutation Concurrency | `workctl` Claims | Lockfiles, Leases | Ambiguous lease grant |
| **Goal Engine** | Bounded Task Decomposition | Role Contracts | Workload Packets | Unbounded loops |
| **OMP Harness** | Interactive Session & Subagent Transport | `workctl` & ISA | Subagent Runtimes | Autonomous ledger mutation |
| **Warren** | Physical Execution Run Lifecycle | `workctl` & Workload | Branch / Artifact Diffs | Ledger mutation, auto-merge |
| **Beads** | Derived Graph Query & Scheduling Projection | `workctl` State | Ephemeral Projections | Task claims, closing tasks |
| **Agentic Engineering**| Upstream Practitioner Research | Evidence Gates | None (External Source) | Direct code vendoring |
| **Research Providers** | External Corpus Retrieval & Extraction | Research API | Derived Candidates | Canonical promotion |
| **Presentation Layer** | Views, Dashboards, Monospace TUIs, Themes | KnowledgePlane | None (Read-Only) | Shell mutation, command execution |
