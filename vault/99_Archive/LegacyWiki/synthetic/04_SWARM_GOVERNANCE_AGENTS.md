---
doc_id: SWARM_GOVERNANCE
title: "Governance: Agent Swarm Architecture & Antigravity (AGY) Workflows"
domain: SWARM_GOVERNANCE
epistemic_status: DESIGN_DECISION
source_documents:
  - wiki/KAD_PI_AGY_HANDOFF_2026-08-28.md
  - .agents/agents/kad-master/agent.md
  - PRIME_DIRECTIVE.md
retrieval_keywords:
  - Antigravity
  - AGY
  - Swarm
  - kad-master
  - kad-researcher
  - kad-builder
  - kad-tester
  - kad-reviewer
  - Flash explores and proves
  - Pro decides
  - WorkPackage
---

# Governance: Agent Swarm Architecture & AGY Workflows

## Executive Summary
This document specifies the multi-agent swarm architecture operating on top of Google Antigravity (AGY). The swarm enforces strict role specializations, authority hierarchies, bounded mutation scopes, and model-agnostic execution policies following the axiom: **"Flash explores and proves; Pro decides."**

---

## 1. Role Taxonomy & Responsibility Matrix

| Subagent Name | Role Title | Model Tier | Mutation Scope | Authority & Responsibilities |
|---|---|---|---|---|
| `kad-master` | Master Architect & Coordinator | `pro` (High Reasoning) | Authorized Write | Architecture design, task decomposition, worker dispatch, conflict resolution, final synthesis, and acceptance. |
| `kad-researcher` | Evidence Investigator | `flash` | Read-Only | Codebase discovery, AST symbol tracing, API contract exploration, provenance auditing. Returns paths, lines, and `UNKNOWN` markers. |
| `kad-builder` | Bounded Implementer | `flash` | Bounded Workspace | Implements minimal green code for approved designs. No architecture changes. Follows `RED → minimum GREEN → REFACTOR`. |
| `kad-tester` | Deterministic Verifier | `flash` | Test Suites Only | Authors RED tests, injects failure modes, verifies lifecycle teardown, measures performance, generates manifests. |
| `kad-reviewer` | Adversarial Auditor | `flash` | Read-Only | Evaluates PRs and outputs against PRIME DIRECTIVE. Attempts to falsify claims. Detects simulation pretending to be live, leaked listeners, and scope drift. |

---

## 2. Swarm Execution Workflow

```text
               ┌──────────────────────────────────────────────┐
               │                  kad-master                  │
               │   Decomposes objective into WorkPackages      │
               └──────┬────────────────────────────────┬──────┘
                      │                                │
        (Parallel Read-Only Tasks)      (Parallel Verification Design)
                      ▼                                ▼
         ┌─────────────────────────┐      ┌─────────────────────────┐
         │     kad-researcher      │      │       kad-tester        │
         │  Gathers facts & paths  │      │    Authors RED tests    │
         └────────────┬────────────┘      └────────────┬────────────┘
                      │                                │
                      └───────────────┬────────────────┘
                                      ▼
               ┌──────────────────────────────────────────────┐
               │                  kad-master                  │
               │   Validates RED test and freezes architecture│
               └──────────────────────┬───────────────────────┘
                                      │ (Bounded Implementation Task)
                                      ▼
               ┌──────────────────────────────────────────────┐
               │                 kad-builder                  │
               │     Implements minimum GREEN patch           │
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼
               ┌──────────────────────────────────────────────┐
               │                 kad-reviewer                 │
               │     Adversarial audit & falsification check  │
               └──────────────────────┬───────────────────────┘
                                      │ (Audit Report)
                                      ▼
               ┌──────────────────────────────────────────────┐
               │                  kad-master                  │
               │     Final acceptance, commit & evidence seal │
               └──────────────────────────────────────────────┘
```

---

## 3. Governance Invariants & STOP Conditions

### Core Directives
* **[DESIGN_DECISION]** `ROLE != MODEL` and `ROLE != PROVIDER`. Control logic must never require specific model names.
* **[DESIGN_DECISION]** **Delegation Over Inlining**: Master delegates disjoint tasks rather than consuming all context tokens reading the entire codebase directly.
* **[DESIGN_DECISION]** **Single Writer Rule**: Multiple workers must never mutate the same target file concurrently.
* **[DESIGN_DECISION]** **Escalate the Task, Not the Swarm**: If a Flash worker encounters high-risk ambiguity or fails twice, escalate only that specific subtask to Pro reasoning.

### Global STOP Conditions
A worker or master MUST immediately **STOP** and report evidence when:
1. An assumed architectural seam does not exist on disk.
2. Mutation would exceed the pre-authorized boundary.
3. Teardown or rollback cannot be proven deterministically.
4. Passing requires treating a `[HYPOTHESIS]` as an established `[FACT]`.
5. Completing the task requires modifying core invariants outside the current WorkPackage.
