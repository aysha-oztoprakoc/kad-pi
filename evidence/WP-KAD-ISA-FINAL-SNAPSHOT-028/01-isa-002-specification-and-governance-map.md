# ISA-KAD-SKILL-ROLE-002 / v1.1 Specification & Governance Map

**Document Identifier**: `ISA-KAD-SKILL-ROLE-002`  
**Version**: `1.1.0`  
**SHA256 Digest**: `dece6d53488e5820221d88f0bb0e3a0338699dbcffbe5ab486c1965d3130eb79`  
**Epistemic Precedence**: Scientific Directives & PRIME DIRECTIVE outrank runtime conventions.

---

## 1. Structural Summary of the New ISA

`ISA-KAD-SKILL-ROLE-002` establishes the sovereign boundary between KAD authority and external infrastructure:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          KAD SOVEREIGN DOMAIN                               │
│  • Human Intent & Acceptance                                                │
│  • Work Lifecycle (workctl)                                                 │
│  • Canonical Claims & Evidence (evidence/)                                  │
│  • KnowledgePlane & Vault Truth (vault/)                                    │
│  • ISA Authority & Epistemic Gates                                          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (Delegates Bounded Tasks via KAD_WORKLOAD_V1)
                                       │ (Receives Receipts via kad-execution-run-receipt-v1)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                       DELEGATED EXTERNAL DOMAIN                             │
│  • Physical Run Lifecycles (Warren, OMP Native, Pi Worker)                  │
│  • Graph Projections & Topology (Cytoscape, Beads)                          │
│  • Upstream Practitioner Doctrine (Agentic Engineering)                     │
│  • External Search & Metadata (DeepAPI, Zotero, CrossRef, OpenAlex)         │
│  • Presentation, TUIs & Themes (Sofia, Tell ANSI, Omarchy)                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Supersession & Evolution from ISA-001

1. **Two Distinct Lifecycles Formalized**:
   - `WORK_LIFECYCLE` (`READY -> CLAIMED -> IN_PROGRESS -> REVIEW -> ACCEPTED / BLOCKED`) vs `EXECUTION_RUN_LIFECYCLE` (`QUEUED -> RUNNING -> SUCCEEDED / FAILED / CANCELLED`).
   - Run results provide evidence receipts; they cannot autonomously mutate work state.

2. **5-Class External Provider Taxonomy**:
   - `WORKLOAD_PROVIDER`, `INTENT_GRAPH_PROJECTION`, `EXTERNAL_DOCTRINE_SOURCE`, `RESEARCH_PROVIDER`, `PRESENTATION_PROVIDER`.
   - Reconciles external infrastructure without polluting the 15-skill cognitive surface.

3. **Typed Transient Workload Contract (`KAD_WORKLOAD_V1`)**:
   - Model/vendor neutrality enforced: canonical work contracts contain zero vendor/model identities.
   - Dispatch binding occurs in execution receipts.

4. **Execution vs Learning Separation (`EXECUTION != LEARNING`)**:
   - Active workers consume immutable accepted doctrine.
   - Learning flows strictly through the governed distillation pipeline.

5. **Role Fabric Offload Semantics (`ROLE_CONTRACT_V2`)**:
   - Roles specify `offload_allowed`, `detached_execution_safe`, `preferred_workload_providers`, `minimum_required_context`, `expected_human_attention_savings`, and `acceptance_evidence_requirements`.
   - Control/advisory roles default to interactive only.
