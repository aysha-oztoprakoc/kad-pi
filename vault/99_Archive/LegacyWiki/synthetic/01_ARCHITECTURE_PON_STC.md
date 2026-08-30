---
doc_id: ARCH_PON_STC
title: "Architecture: Notification-Oriented Paradigm (PON) & Spatiotemporal Composability (STC)"
domain: PON_STC_CORE
epistemic_status: SOURCE_DERIVED
source_documents:
  - wiki/DSH_PON_CORDIS_HANDOFF_2026-08-25.md
  - wiki/KAD_PI_AGY_HANDOFF_2026-08-28.md
  - PRIME_DIRECTIVE.md
retrieval_keywords:
  - Notification-Oriented Paradigm
  - PON
  - Spatiotemporal Composability
  - STC
  - Cordis
  - Fiber
  - Context
  - Causal Rule
  - Managed Effect
  - Coeffect
---

# Architecture: PON & Spatiotemporal Composability (STC)

## Executive Summary
This document specifies the dual-engine foundation of the KAD architecture: **PON (Notification-Oriented Paradigm)** governs *why and when* causal execution reacts to state changes, while **STC (Spatiotemporal Composability)** mediated by **Cordis** governs *what and where* components depend upon, mutate, and release during their lifecycle.

---

## 1. Notification-Oriented Paradigm (PON)

### Core Axiom
> `NOTIFY, DON'T POLL.` State mutations drive direct, targeted notifications exclusively to causally linked evaluation units.

### Causal Execution Pathway
```text
State Mutation / Event
  │
  ▼
Fact Base Delta
  │
  ▼
Evaluate Affected Premises Only (Selective Causal Knowledge)
  │
  ▼
Condition Evaluation (Boolean Conjunction of Premises)
  │
  ▼
Rule Activation (Guarded by Condition State)
  │
  ▼
ActionIntent Emission (Pure Data Payload)
```

### Invariants
* **[DESIGN_DECISION]** Polling loops are strictly prohibited. State changes must push punctual notifications.
* **[SOURCE_DERIVED]** Evaluation must apply only to affected causal dependencies. Unrelated rules are never evaluated.
* **[DESIGN_DECISION]** Rules emit pure, typed `ActionIntent` objects; rules MUST NOT execute ambient side-effects or direct tool/network calls.
* **[SOURCE_DERIVED]** Notification order, idempotence, duplicate suppression, and cancellation must be governed by deterministic policy.

---

## 2. Spatiotemporal Composability (STC) & Cordis

### Core Axiom
> `DECLARE, DON'T REACH. TRACK, DON'T ASSUME CLEANUP.`

### Dual Dimensions of STC
1. **Spatial Composability (Coeffects / Dependencies)**:
   - What a component requires from its environment to function.
   - Declared as explicit capability requirements on the Cordis `Context`.
   - Ambient imports and undeclared global reach are prohibited.
2. **Temporal Composability (Effects / Lifetimes)**:
   - What a component mutates in its environment.
   - Every effect claimed as managed/revertible MUST register its inverse upon application.
   - Deactivation unwinds effects in strict reverse order of activation.

### Lifecycle State Machine
```text
[UNLOADED] ──(load)──► [RESOLVING_DEPENDENCIES]
                             │
                             ├─(missing dep)─► [FAILED_INACTIVE]
                             │
                             ▼
                     [ACTIVATING_EFFECTS]
                             │
                             ├─(partial failure)─► [UNWINDING_PARTIAL] ──► [INACTIVE]
                             │
                             ▼
                         [ACTIVE]
                             │
                             ▼ (teardown / dispose)
                     [UNWINDING_EFFECTS]
                             │
                             ▼
                        [DISPOSED]
```

### Invariants
* **[DESIGN_DECISION]** Dependencies must activate before dependents. Dependents must deactivate before dependencies.
* **[DESIGN_DECISION]** Rollback != Compensation. Rollback is the exact execution of a registered inverse within the controlled system boundary.
* **[DESIGN_DECISION]** Cordis lifecycle isolation != OS security isolation. Cordis governs component lifetimes, not security boundaries.
* **[DESIGN_DECISION]** PON causal dependencies (`fact → premise → condition → rule`) and STC capability relations (`component → required/provided capability`) are distinct typed relations and MUST NOT be conflated.

---

## 3. Canonical Execution & Degradation Loops

### Standard Execution Loop
```text
STATE CHANGE
  → PON NOTIFICATION
  → RELEVANT RULE
  → ACTION INTENT
  → POLICY VALIDATION
  → STC-MANAGED EFFECT
  → CONTEXT CHANGE
  → DEPENDENCY RECONCILIATION
  → EVIDENCE LOGGING
```

### Graceful Degradation Loop
```text
COMPONENT FAILURE
  → CLASSIFY FAILURE
  → UNWIND TRACKED EFFECTS (Partial Rollback)
  → REMOVE/REDUCE FAILED CAPABILITY
  → RECOMPUTE DEPENDENCIES
  → CONTINUE AT SAFEST USEFUL LEVEL
  → RECORD EVIDENCE
```
