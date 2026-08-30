# Context Ledger: WP-KAD-RESERVED-ROADMAP-RECONCILIATION-016-019

## 1. Executive Mission
Reconcile the four reserved workpackage identifiers (`WP-016`, `WP-017`, `WP-018`, `WP-019`) against:
- ADR 0014 (Generalized Ideal State Artifact & Compute Fabric Governance)
- Canonical Compute Fabric ISA (`ISA-KAD-COMPUTE-FABRIC-001`)
- Canonical Aesthetic ISA (`ISA-KAD-AESTHETIC-001`)
- Current repository/vault truth and KAD-PI roadmap.

## 2. Inviolable Governance Principles
- **Preserve Reserved Identifiers**: Under no circumstances convert reserved identifiers `WP-016..019` into obsolete identifiers or renumber them.
- **Epistemic State Separation**: Explicitly distinguish `CANONICAL_TARGET` governance specifications from `CURRENT_CONFIRMED` empirical evidence.
- **Authority Isolation**: Presentation layers (Obsidian, Quickshell, Sofia v3, TUI) and transport layers (SSE) remain strictly read-only observers of canonical knowledge and telemetry with zero direct mutation authority.
- **Deterministic Validation First**: All reconciliation decisions are backed by deterministic schema validators, doctor diagnostics, and reproducible test suites.

## 3. Historical Provenance & Lineage Ledger
1. **WP-012/013 Era**:
   - Initial provisional reservation:
     - `WP-015`: Obsidian Bridge Plugin & Visual Workspace Integration
     - `WP-016`: Live SSE Telemetry Stream & Real-Time Control Plane
     - `WP-017`: Agentic Graph Query Engine & OMP Tools
2. **WP-015 Execution**:
   - `WP-015` claimed, executed, and accepted as **Human-Guided Aesthetic Architecture & Ideal State Artifact (ISA) Establishment** (ADR 0013, `ISA-KAD-AESTHETIC-001`).
   - Planned Obsidian bridge plugin shifted to `WP-KAD-OBSIDIAN-BRIDGE-PLUGIN-016`.
   - Planned roadmap shifted:
     - `WP-016`: Obsidian Bridge Plugin & Visual Workspace Integration
     - `WP-017`: AMDY Omarchy & Quickshell KAD Cyberdeck Theme Implementation
     - `WP-018`: TELL Server Monospace ANSI Profile & TUI Hardening
     - `WP-019`: Live SSE Telemetry Stream & Real-Time Control Plane
3. **WP-020 Execution**:
   - `WP-020` claimed, executed, and accepted as **Generalized Ideal State Artifact (ISA) Architecture & Canonical Compute Fabric Governance** (ADR 0014, `ISA-KAD-COMPUTE-FABRIC-001`, multi-domain ISA validation engine).
4. **Current Reconciliation (This Task)**:
   - Formally codify `.agents/work/` JSON contracts for `WP-016`, `WP-017`, `WP-018`, and `WP-019`.
   - Update scopes, dependencies, prerequisites, authority boundaries, and acceptance criteria.
   - Separate telemetry observation from control authority in `WP-019`.
   - Separate server profile hardening from distributed compute benchmark execution in `WP-018`.
   - Establish explicit dependency DAG, ISA alignment matrix, and authority matrix.
   - Synchronize roadmap documentation across `docs/architecture/NEXT_WORKPACKAGE_ROADMAP.md` and `site/roadmap.html`.
