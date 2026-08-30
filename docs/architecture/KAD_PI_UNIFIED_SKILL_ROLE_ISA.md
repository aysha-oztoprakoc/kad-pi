# KAD-PI Unified Skills & Role ISA (V1.0.0)

* **Document Identifier**: `ISA-KAD-SKILL-ROLE-001`
* **Version**: `1.0.0`
* **Status**: `FROZEN_TARGET`
* **Authority**: Wayfinder + KAD Epistemic Evidence Gate (WP-024)
* **Constitutional Precedence**: `PRIME_DIRECTIVE.md` outranks OMP conventions.

---

## 1. Constitutional Architecture & Invariants

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        TIER 1: HUMAN & EPISTEMIC GOVERNANCE                            │
│  [Human Operator] ──(ask_user: 5+1)──> [Wayfinder V2] ──> [5-Advisor Board]           │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ (AUTHOR_DECLARED Selection)
┌──────────────────────────────────────────▼─────────────────────────────────────────────┐
│                    TIER 2: WORKSPACE COORDINATION & LEDGER LIFECYCLE                   │
│   [Planning Compiler] ──> [workctl import] ──> [workctl claim] ──> [STC Lease]         │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ (Mutating Claim + fusion_writer_lease)
┌──────────────────────────────────────────▼─────────────────────────────────────────────┐
│                 TIER 3: COGNITIVE GUIDANCE & TYPED ROLES (ROLE_CONTRACT_V1)            │
│  [kad-builder] ──> [kad-tester] ──> [kad-reviewer] ──> [kad-evidence-gate]             │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ (Capability-First Resource Routing)
┌──────────────────────────────────────────▼─────────────────────────────────────────────┐
│                          TIER 4: EXECUTION SUBSTRATE & RUNTIME                         │
│  • Resource Tiers: Deterministic -> Tiny -> Local -> Free -> Standard -> Frontier     │
│  • OMP Transport: task native executor (Max Spawn Depth: 2)                            │
│  • Mutation Gate: fusion_writer_lease (Default Deny)                                   │
│  • Single Knowledge Authority: KAD KnowledgePlane / Canonical Obsidian Vault           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Invariants:
1. **Cognitive vs Authoritative Separation**: Skills provide cognitive guidance; they do not possess mutating authority over project lifecycle or claims.
2. **Deterministic Lifecycle Authority**: `bin/workctl` and deterministic KAD code own work lifecycle, tickets, claims, state transitions, and acceptance.
3. **Transport Subordination**: OMP owns execution and subagent transport, NOT KAD lifecycle semantics.
4. **Model Proposes, Policy Authorizes**: Probabilistic model output is a candidate proposal; deterministic policy gates authorize.
5. **Zero-Model Work Ledger**: Work contracts in `.agents/work/` contain no vendor, provider, or model identities.
6. **TOKENMAXXING & Local-First**: Local and free deterministic execution outranks cloud inference. Strong cloud models are reserved strictly for genuine ambiguity.
7. **Single Knowledge Authority**: The Canonical Obsidian Vault (`vault/`) and KAD KnowledgePlane are the sole durable truth authority. All vector indexes, OpenViking stores, and projections are derived and have `authority: false`.

---

## 2. Section A: Canonical Skill Surface (15 Concepts)

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

## 3. Section B: Complete Skill Migration & Merge Matrix

| Legacy / Reviewed Skill | Disposition | Target Canonical Skill / Subsystem | Justification & Mechanism |
|---|---|---|---|
| `5-persona-advisory-board` | `MERGE` | `kad-advisory-board` | Merged into 5-lens KAD advisory architecture. |
| `ask-matt` | `KEEP` | `ask-matt` | Retained as canonical skill router. |
| `claude-handoff` | `MERGE` | `handoff` | Absorbed as Claude Code export adapter. |
| `code-review` | `KEEP` | `code-review` | Retained as canonical dual-axis reviewer. |
| `codebase-design` | `KEEP` | `codebase-design` | Retained as canonical deep module design discipline. |
| `diagnosing-bugs` | `KEEP` | `diagnosing-bugs` | Retained as canonical root-cause debugging loop. |
| `domain-modeling` | `KEEP` | `domain-modeling` | Retained as canonical domain modeler. |
| `git-guardrails-claude-code` | `DETERMINISTIC_CODE` | `workctl` / Git Hooks | Enforced deterministically by `workctl` and pre-commit hooks. |
| `grill-me` | `MERGE` | `grilling` | Merged into unified Socratic grilling engine. |
| `grill-with-docs` | `MERGE` | `grilling` | Merged as contemporaneous ADR authoring mode in `grilling`. |
| `grilling` | `KEEP` | `grilling` | Retained as canonical adversarial interrogation engine. |
| `handoff` | `KEEP` | `handoff` | Retained as canonical durable handoff skill. |
| `implement` | `KEEP` | `implement` | Retained as canonical implementation discipline. |
| `implement-spec` | `ABSORB` | `implement` | Absorbed directly into `implement`. |
| `improve-codebase-architecture` | `MERGE` | `codebase-design` | Merged into `codebase-design` static analysis rules. |
| `kad-advisory-board` | `KEEP` | `kad-advisory-board` | Retained as canonical 5-lens advisory board. |
| `kad-evidence-gate` | `POLICY_FRONTEND` | `kad-evidence-gate` | Retained as policy pointer to deterministic evidence verifiers. |
| `kad-wiki` | `CAPABILITY_FRONTEND` | `kad-wiki` | Retained as frontend for `bin/kad-knowledge` and `bin/kad-wiki`. |
| `loop-me` | `RETIRE` | Bounded `KAD_GOAL_V1` | Unbounded loops prohibited; replaced by bounded goal engine. |
| `migrate-to-shoehorn` | `PROCEDURE` | `implement` | Retained as specialized TS test refactoring procedure. |
| `prototype` | `KEEP` | `prototype` | Retained as canonical disposable prototype skill. |
| `research` | `KEEP` | `research` | Retained as canonical high-trust research fabric. |
| `resolving-merge-conflicts` | `PROCEDURE` | `implement` | Retained as AST-aware git conflict procedure. |
| `retro` | `MERGE` | `skill-governance` / `distillation.mjs` | Merged into deterministic distillation pipeline. |
| `scaffold-exercises` | `OPTIONAL` | `teach` / External | Retained as non-core optional educational utility. |
| `setup-matt-pocock-skills` | `RETIRE` | `skill-governance` | Replaced by deterministic skill governance tooling. |
| `setup-pre-commit` | `PROCEDURE` | `implement` | Retained as tooling setup procedure. |
| `setup-ts-deep-modules` | `PROCEDURE` | `codebase-design` | Retained as TS configuration procedure. |
| `tdd` | `KEEP` | `tdd` | Retained as canonical TDD engineering discipline. |
| `teach` | `OPTIONAL` | Educational Subsystem | Retained as optional tutorial authoring skill. |
| `to-questionnaire` | `MERGE` | `domain-modeling` | Merged as requirements discovery mode in `domain-modeling`. |
| `to-spec` | `MERGE` | `wayfinder` (Spec Mode) | Merged into Wayfinder planning compiler. |
| `to-tickets` | `DETERMINISTIC_CODE` | `bin/workctl import-tickets` | Ticket decomposition and import handled deterministically. |
| `triage` | `MERGE` | `ask-matt` / `wayfinder` | Triaging folded into skill router and Wayfinder preflight. |
| `wait-what` | `MERGE` | `code-review` | Merged as Skeptical Logic Analyzer in `code-review`. |
| `wayfinder` | `KEEP` | `wayfinder` | Retained as canonical strategic decision router. |
| `wizard` | `MERGE` | `human-runbook` | Merged into canonical interactive human runbook generator. |
| `workspace-doctor` | `POLICY_FRONTEND` | `bin/workctl doctor` | Frontend for deterministic workspace doctor. |
| `workspace-finish` | `POLICY_FRONTEND` | `bin/workctl release` | Frontend for deterministic claim release. |
| `workspace-handoff` | `HARNESS_ADAPTER` | `bin/workctl handoff` | Frontend for deterministic continuation persistence. |
| `workspace-orient` | `HARNESS_ADAPTER` | `bin/workctl orient` | Frontend for deterministic orientation bootstrap. |
| `workspace-pick-work` | `POLICY_FRONTEND` | `bin/workctl claim` | Frontend for deterministic ticket claim. |
| `writing-beats` | `RETIRE` | Prose Authoring | Non-engineering narrative skill retired. |
| `writing-for-agents` | `MERGE` | `skill-governance` | Merged as skill authoring standard in `skill-governance`. |
| `writing-fragments` | `MERGE` | `writing-shape` | Micro-prose rules folded into `writing-shape`. |
| `writing-shape` | `OPTIONAL` | Technical Writing | Optional documentation styling skill. |
| `deepapi` | `CAPABILITY_FRONTEND` | Global DeepAPI Tooling | Global tool bridge for high-trust search/scraping. |
| `omarchy` | `PRESENTATION` | Host Desktop Subsystem | Host desktop and Hyprland styling manager. |
| `diagnose-crash` | `PROCEDURE` | `diagnosing-bugs` | Host core dump analysis procedure under `diagnosing-bugs`. |

---

## 4. Section C: Typed Skill Classes

1. **`PROCESS_DISCIPLINE`**: Enforces verifiable engineering methodology (`implement`, `tdd`, `code-review`, `diagnosing-bugs`, `codebase-design`, `domain-modeling`, `grilling`).
2. **`WORKFLOW`**: Orchestrates multi-step decision or research lifecycles (`ask-matt`, `wayfinder`, `research`).
3. **`POLICY_FRONTEND`**: Bridges cognitive turns to deterministic policy verifiers (`kad-advisory-board`, `skill-governance`, `kad-evidence-gate`, `workspace-doctor`, `workspace-pick-work`, `workspace-finish`).
4. **`CAPABILITY_FRONTEND`**: User-facing interfaces for tools and experimental prototypes (`human-runbook`, `prototype`, `kad-wiki`, `deepapi`).
5. **`HARNESS_ADAPTER`**: Connects cognitive instructions to host runtime lifecycles (`handoff`, `workspace-orient`, `workspace-handoff`).
6. **`PRESENTATION`**: Manages visual, TUI, and desktop styling surfaces (`omarchy`).

---

## 5. Section D: Role Fabric (`ROLE_CONTRACT_V1`)

### Role Contract Schema (`ROLE_CONTRACT_V1`):
Each agent spawned in the system is governed by an immutable contract:
```json
{
  "$schema": "kad-role-contract-v1",
  "role": "kad-builder",
  "trust_domain": "engineering",
  "mutation_rights": "EXCLUSIVE_OWNED_PATHS",
  "requires_claim": true,
  "requires_lease": "fusion_writer_lease",
  "max_spawn_depth": 2,
  "allowed_child_roles": ["kad-tester", "kad-scout"],
  "model_tier_preference": ["STANDARD_REMOTE", "LOCAL_GENERAL"],
  "tools_allowlist": ["edit", "write", "read", "lsp", "ast_edit", "npm", "make"],
  "verifier_independent": false
}
```

### The 15 Logical Roles:
1. **`kad-master`**: Primary orchestrator. Directs decomposition and review. Non-mutating (`mutation_rights: NONE`). Model tier: `FRONTIER_REASONING` (`@plan`).
2. **`kad-builder`**: Primary implementation worker. Possesses exclusive mutating authority over claimed paths. Requires active `workctl` claim and `fusion_writer_lease`. Model tier: `STANDARD_REMOTE` / `LOCAL_GENERAL` (`@task`).
3. **`kad-debugger`**: Root-cause diagnostic specialist. Non-mutating probe using DAP debugger and reproduction scripts. Model tier: `STANDARD_REMOTE` (`@task`).
4. **`kad-tester`**: Independent test author and runner. Verifies public seams via TDD. Model tier: `STANDARD_REMOTE` / `LOCAL_GENERAL` (`@task`).
5. **`kad-reviewer`**: Independent verifier. Dual-axis Standards + Spec auditor. Must be independent from builder. Non-mutating. Model tier: `INDEPENDENT_VERIFIER` (`@verifier`).
6. **`kad-researcher`**: High-trust literature and source investigator. Extracts verified facts and citations. Model tier: `LITERATURE_SYNTHESIS` (`@research`).
7. **`kad-librarian`**: KnowledgePlane and Obsidian vault curator. Validates notes, projections, and backlinks. Model tier: `STANDARD_REMOTE`.
8. **`kad-scout`**: Fast, lightweight read-only exploratory agent for directory mapping and broad pattern discovery. Model tier: `TINY_SPECIALIST` / `FREE_REMOTE` (`@smol`).
9. **`kad-local-extractor`**: Local Qwen bounded worker for structured JSON and entity extraction. Model tier: `LOCAL_NARROW` (`@local_retrieval`).
10. **`kad-world`**: Stheno persistent local world simulation. Strictly isolated from engineering tasks. Model tier: `LOCAL_WORLD` (`@world`).
11. **`advisor-architecture`**: Advisory specialist on system structure, modularity, and seam design. Non-mutating. Model tier: `INDEPENDENT_VERIFIER`.
12. **`advisor-security`**: Advisory specialist on trust domains, mutation leases, credential redaction, and attack surfaces. Non-mutating. Model tier: `INDEPENDENT_VERIFIER`.
13. **`advisor-economics`**: Advisory specialist on token expenditure, local-first routing, and TOKENMAXXING. Non-mutating. Model tier: `INDEPENDENT_VERIFIER`.
14. **`advisor-verification`**: Advisory specialist on test completeness, TDD seams, and deterministic reproduction. Non-mutating. Model tier: `INDEPENDENT_VERIFIER`.
15. **`advisor-epistemic`**: Advisory specialist on knowledge provenance, claim classification, and anti-poisoning. Non-mutating. Model tier: `INDEPENDENT_VERIFIER`.

### Spawn Hierarchy & Depth Rules:
- **Max Recursive Spawn Depth**: **`2`** (Level 0: User/Master $	o$ Level 1: Subagent $	o$ Level 2: Leaf Scout/Tester).
- **No Self-Replication**: A subagent cannot spawn an identical role.
- **Verifier Independence**: `kad-reviewer` and the 5 advisors MUST NOT be spawned with the same model/provider family as the active `kad-builder` on that workpackage.

---

## 6. Section E: Capability-First Resource Routing

```text
Deterministic Code / Tool (workctl, make, git)
  └─► Tiny Specialist / Scout (glm-4.7-flash, tiny regex)
        └─► Local Narrow Model (Qwen-2.5-Coder on AMDY)
              └─► Local General Model (Local Ollama / Stheno)
                    └─► Free / Cheap Remote Lane (Antigravity / Gemini Flash)
                          └─► Standard Remote Lane (Codex Mini / GPT-5.4-Mini)
                                └─► Strong Frontier Reasoning (GPT-5.6-Luna / Claude Opus)
                                      └─► Human Operator (Wayfinder 5+1 Protocol)
```

1. **Deterministic-First**: If a task can be resolved via static analysis, tests, schema validation, or `workctl`, no model is invoked.
2. **Local Qualification Invariant**: A local model receives ONLY roles for which it has empirically demonstrated passing benchmarks (e.g. Qwen for bounded JSON extraction, not for security architecture).
3. **Zero Marginal Spend**: Paid API spend (`PAYG`) remains disabled by default; subscription and free allocations are prioritized.

---

## 7. Section F: Context & Knowledge Authority

1. **Sole Durable Truth Authority**: The Canonical Obsidian Vault (`vault/`) and KAD KnowledgePlane.
2. **Projections are Derived**: OpenViking trees, Vector embeddings, wiki pages (`wiki/`), and dashboard viewmodels (`dashboard/`) are strictly derived projections with `authority: false`.
3. **STC Context Packets**: Context is packaged into bounded, immutable `ContextPackets` scoped strictly to the active workpackage claim.
4. **Anti-Poisoning**: Unreviewed proposals, raw scratchpads, and rejected candidates fail closed and NEVER enter context packs for production roles.

---

## 8. Section G: Governed Self-Evolution Loop

```text
Observe Performance / Telemetry
  └─► Blameless Retrospective (retro)
        └─► Generate Evolution Candidate
              └─► Wayfinder 5+1 Decision
                    └─► 5-Advisor Stress-Test
                          └─► Bounded Experiment (prototype)
                                └─► Measure Telemetry & Receipts
                                      └─► Epistemic Evidence Verification
                                            └─► Human Acceptance (AUTHOR_DECLARED)
                                                  └─► Narrow Promotion (skills.lock.json)
                                                        └─► Downward Distillation (to deterministic code)
```

No model possesses the authority to autonomously rewrite skills, constitutional rules, or role contracts. Every promotion requires deterministic evidence receipts and explicit human approval.
