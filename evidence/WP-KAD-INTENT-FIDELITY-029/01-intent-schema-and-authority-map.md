# Intent Schema & Authority Architecture Map (WP-029)

**Workpackage ID**: `WP-KAD-INTENT-FIDELITY-029`  
**Date**: 2026-08-30  
**Specification**: `INTENT_DECISION_EVENT_V1` & `INTENT_DECISION_NORMALIZATION_V1`  

---

## 1. Governing Constitutional Invariant

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ CONSTITUTIONAL INVARIANT:                                               │
│                                                                         │
│ Human intent MUST be captured losslessly before model interpretation.   │
│ Models may normalize or analyze intent, but a model-produced            │
│ normalization MUST NEVER become the only durable representation of      │
│ what the human selected or wrote.                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. Two-Tier Data Architecture

```text
HUMAN UI EVENT (ask_user / ask-me 5+1)
       ↓
LOSSLESS CAPTURE: INTENT_DECISION_EVENT_V1
       • Raw Question + Question Hash (sha256)
       • Complete Option Array (IDs, Orders, Raw Labels, Descriptions, Recommendations)
       • Raw Human Selection + Raw Note verbatim
       • Epistemic Class: AUTHOR_DECLARED (or RECONSTRUCTED)
       • Provenance: Session, Actor ID, Host ID, Record Hash (sha256)
       ↓
OPTIONAL NORMALIZATION: INTENT_DECISION_NORMALIZATION_V1
       • Derived from exact Event Record Hash
       • Normalized Intent Statement
       • Epistemic Class: DERIVED_FROM_AUTHOR_DECLARED
       • Taxonomy: Decision Class, Change Cost, Lock-In Risk, Governing Constraints
       • Normalization Provenance: Agent, Model, Procedure Version
       ↓
DETERMINISTIC COMPILATION & VERIFICATION (bin/kad-intent)
       • Compiles canonical Markdown Decision Register / Alignment Report
       • Verifies zero semantic or text divergence against typed ledger
```

## 3. Epistemic Class Separation

| Artifact Level | Epistemic Class | Mutability | Authoring Agent |
|---|---|---|---|
| **Raw Event** | `AUTHOR_DECLARED` | Immutable | Human Project Lead (`actor.project_lead`) |
| **Reconstructed Event** | `RECONSTRUCTED` | Immutable | Historical Log Recovery (`actor.project_lead`) |
| **Model Normalization** | `DERIVED_FROM_AUTHOR_DECLARED` | Derived | AI Research/Architecture Role |
| **Human Confirmed Normalization**| `HUMAN_CONFIRMED_NORMALIZATION`| Confirmed | Explicit Human Confirmation |

## 4. Identity & Namespace Isolation Invariants

* **Actor Namespace**: `actor.<id>` (e.g. `actor.project_lead`, `actor.collaborator.<id>`)
* **Host Namespace**: `host.<id>` (e.g. `host.amdy.workstation`, `host.tell.server`)
* **Decision Identifier**: `^DEC_ID_[0-9]{2}$` (e.g. `DEC_ID_01` through `DEC_ID_24`)
* **Semantic Domain**: `domain_id` (e.g. `PROJECT_IDENTITY`, `GOVERNANCE_BOUNDARIES`)
* **Namespace Cross-Check**: Actor IDs in host slots or Host IDs in actor slots are strictly rejected.
