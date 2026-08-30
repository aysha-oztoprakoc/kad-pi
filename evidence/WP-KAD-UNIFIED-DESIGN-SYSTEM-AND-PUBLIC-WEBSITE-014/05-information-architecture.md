# Information Architecture - WP-KAD-UNIFIED-DESIGN-SYSTEM-AND-PUBLIC-WEBSITE-014

## 1. Public Site Navigation & Hierarchy

```text
KAD-PI PUBLIC BRIEF
├── Home (index.html)
│   ├── Hero & Mission Statement
│   ├── Current Platform Signals & Status
│   ├── 01 / Core Definition (Local-first, Evidence-gated, Deterministic)
│   ├── 02 / System Shape (Authority Flow Diagram)
│   ├── 03 / Four Operating Doctrines (PON, STC, TDD, GD)
│   └── 04 / Knowledge & Roadmap Portals
├── Architecture (architecture.html)
│   ├── Authority Separation Principle
│   ├── 01 / Pipeline (Source → KnowledgePlane → Policy → Resolver → Observation)
│   ├── 02 / Five Architectural Planes (Vault, Compiler, Workctl, Observatory, Presentation)
│   └── 03 / Accepted Technology Decisions (ADR-0009 through ADR-0012)
├── Research (research.html)
│   ├── Epistemic Discipline
│   ├── 01 / Four Research Tenets (Primary Source Grounding, Disentanglement, Zero Hallucination, Counterfactual)
│   └── 02 / Five-Paper Audited Literature Corpus (Schmidhuber, Toolformer, Reflexion, Self-Refine, SWE-bench)
├── Knowledge (knowledge.html)
│   ├── KnowledgePlane Architecture
│   ├── Canonical Sources vs Derived Projections vs Graceful Degradation
│   └── Interactive Public Knowledge Explorer (DOM-based search, category filtering)
├── Local AI (local-ai.html)
│   ├── Bounded Local AI Execution
│   ├── Observable Qualification Lifecycle (FILE_ONLY → LOADABLE → QUALIFIED → ACTIVE)
│   ├── Economic Routing & Tokenmaxxing
│   └── Hardware Acceleration (AMD ROCm / Navi 44 & Vulkan)
└── Roadmap (roadmap.html)
    ├── Observable Increments Principle
    └── Workpackage Execution Ledger (Completed WP-008..WP-013, Current WP-014, Planned WP-015..WP-017)
```

## 2. Navigational Invariants
- Every page contains accessible `<nav class="nav" aria-label="Main Navigation">` linking to all 6 canonical pages.
- Active page highlighted with `aria-current="page"`.
- Consistent brand header and provenance footer on every page.
