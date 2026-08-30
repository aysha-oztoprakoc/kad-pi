---
kad_id: kad-current-architecture
title: Current KAD-PI Architecture
type: architecture
authority: CANONICAL_KNOWLEDGE
epistemic_class: PROJECT_INFERENCE
review_status: APPROVED
visibility: project
context_eligible: true
train_eligible: false
publish: false
temporal_status: CURRENT
---

# Current KAD-PI System Architecture

## 1. Architectural Principles
1. **Evidence Before Inference**: Deterministic evidence outranks model completions and subjective claims.
2. **Authority Separation**: Canonical knowledge (`vault/`) is the sole human-authored truth source. Code, projections, and caches are derivative.
3. **Free-First Economic Routing**: Prioritizes deterministic compute, local models (STC-owned), and recurring free subscriptions before paid lanes. PAYG is strictly disabled by default.
4. **Epistemic Classification**: Every claim is explicitly typed (`SOURCE_FACT`, `DERIVED_SYNTHESIS`, `PROJECT_INFERENCE`, `UNKNOWN`).
5. **Anti-Poisoning**: Unreviewed material, draft proposals, raw dumps, and historical archives are strictly isolated from normal agent context.

---

## 2. Layered Architecture Diagram

```text
┌──────────────────────────────────────────────────────────────┐
│                    HUMAN OPERATOR / UX                       │
│    (Obsidian Vault, Home.md, Bases, TUI, bin/kad, Omarchy)   │
└──────────────────────────────┬───────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│                 GOVERNANCE & WORKSPACE LEDGER                │
│    (PRIME_DIRECTIVE.md, workctl claims, AUTHORITY.md)        │
└──────────────────────────────┬───────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│               CANONICAL KNOWLEDGE PLANE (VAULT)              │
│    (vault/30_Knowledge, 40_Decisions, 50_Projects, Librarian)│
└──────────────┬───────────────────────────────┬───────────────┘
               │ (Target-Bound Receipts)       │ (Governed Projections)
┌──────────────▼───────────────┐ ┌─────────────▼───────────────┐
│     EVALUATION & PROPOSALS   │ │     DERIVED RETRIEVAL       │
│  (80_Review/Pending & Receipt│ │ (wiki/, KnowledgePlane API) │
└──────────────────────────────┘ └─────────────┬───────────────┘
                                               │
┌──────────────────────────────────────────────▼───────────────┐
│              TELEMETRY & ECONOMIC CONTROL PLANE              │
│  (Shadow Evaluator, Observatory Journal, Readiness Gate)     │
└──────────────────────────────┬───────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│               MULTI-AGENT SWARM RUNTIME (STC/PON)            │
│  (Local Qwen, WORLD Stheno, OMP Harness Bridge, Fusion)      │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Core Boundaries
- **Mutating Claims**: File mutations require an active `workctl` mutating claim anchored to a specific Git commit.
- **Proposal Receipts**: Any mutation to canonical knowledge via agent proposal must produce a cryptographic receipt binding proposal hash, target paths, previous hashes, and revision.
- **Context Filtering**: Ordinary context queries return only `APPROVED`, `context_eligible === true` canonical notes from authorized zones.
