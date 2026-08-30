---
kad_id: kad-pi-overview
title: KAD-PI Project Overview
type: project
authority: CANONICAL_KNOWLEDGE
epistemic_class: PROJECT_INFERENCE
review_status: APPROVED
visibility: project
context_eligible: true
train_eligible: false
publish: false
temporal_status: CURRENT
---

# KAD-PI Project Record

## 1. Project Identity & Mission
- **Project Name**: KAD-PI
- **Repository Root**: `/home/amdy/Work`
- **Current HEAD**: `ca1f56a020a3416eeffa3d49f3c34f113b536902`
- **Branch**: `main`
- **Remote Synchronization**: Ahead of `origin/main` by 57 commits (`LOCAL_AHEAD_UNPUSHED`).
- **Core Mission**: Establish a deterministic, evidence-gated, free-first local AI knowledge and multi-agent execution system governed by the KAD Prime Directive.

---

## 2. Active Components & Subsystems
- **Governance & Prime Directive**: `PRIME_DIRECTIVE.md`, `00_Governance/AUTHORITY.md`, `CONTEXT.md`.
- **Operator Control Plane**: `tools/kad/telemetry/control-plane-runtime.mjs`, `bin/kad`, `bin/kad-doctor`.
- **Economic Routing & Quota Bridge**: `tools/kad/telemetry/economic-shadow.mjs`, `tools/kad/telemetry/omp-usage-adapter.mjs`.
- **Counterfactual Observatory**: `tools/kad/telemetry/observatory.mjs` (append-only divergence journal).
- **Promotion Readiness Gate**: `tools/kad/telemetry/readiness.mjs` (per-advisory-class threshold evaluator).
- **Governed KnowledgePlane**: `tools/kad/knowledge-plane.mjs`, `tools/kad/wiki/`, `bin/kad-wiki`.
- **Canonical Obsidian Vault**: `vault/` (Single human-editable knowledge ground-truth).
- **Research Workflow Engine**: `tools/kad/research.mjs`, `bin/kad-knowledge` (Audited 5-paper corpus).
- **Local Swarm Runtime**: `tools/kad/swarm.mjs`, STC lifecycle manager, PON causal engine (`tools/kad/pon-engine.mjs`).
- **Workspace Agent Substrate**: `tools/workspace/workctl.mjs`, `bin/workctl` (Deterministic workpackage ledger).

---

## 3. Accepted Workpackages
1. `WP-WORKSPACE-AGENT-SUBSTRATE-001`: Portable workspace agent substrate.
2. `WP-KAD-RESEARCH-API-001` through `WP-KAD-RESEARCH-ZOTERO-005`: Canonical research engine stack.
3. `WP-KAD-RESEARCH-REAL-CORPUS-EVALUATION-006` & `006-R1`: Epistemic claim audit and 5-source real corpus.
4. `WP-KAD-OPERATOR-CONTROL-PLANE-001`: Operator telemetry and security toolchain.
5. `WP-KAD-USAGE-BRIDGE-002`: Native OMP 18.0.10 quota telemetry bridge.
6. `WP-KAD-ECONOMIC-ROUTER-SHADOW-003`: Deterministic shadow economic evaluator.
7. `WP-KAD-COUNTERFACTUAL-OBSERVATORY-004`: Tamper-evident longitudinal divergence journal.
8. `WP-KAD-COUNTERFACTUAL-PROMOTION-READINESS-005`: Deterministic promotion readiness gate.
9. `WP-KAD-KNOWLEDGE-PLANE-SEED-PROMOTION-007`: Governed scientific evidence promotion.
10. `WP-KAD-FUSION-OMP-ADAPTATION-007A`: Pinned Fusion harness adaptation.
11. `WP-KAD-CANONICAL-OBSIDIAN-LIBRARIAN-008`: Canonical Obsidian librarian.
12. `WP-KAD-LOCAL-WIKI-CONTEXT-LIBRARY-009`: Local context library.

---

## 4. Current Workpackage in Progress
- `WP-KAD-CANONICAL-STATE-RECONCILIATION-010-R1`: Full `/Work` inventory, legacy reconciliation, and canonical vault synchronization.

---

## 5. Machine & Runtime Environment
- **Host**: `amdy` (Linux 7.1.9-arch1-2, AMD Ryzen 7 7700 8-Core, AMD Radeon RX 9060 XT 16GB).
- **Local Models**: `Qwen2.5-Coder-7B-Instruct-GGUF` (retrieval/coding), `Stheno-v3.2-8B-GGUF` (WORLD simulation).
- **Remote Model Policy**: Free/Subscription-first (OpenCode Go, Codex, Antigravity/Gemini), zero implicit PAYG spend.
