---
name: kad-advisory-board
description: Stress-test high-impact KAD decisions through five evidence-based advisory lenses.
version: "1.0.0"
license: MIT
scope: project-opt-in
project: kad-pi
dependencies:
  - ask_user
capabilities:
  - ask_user
---

# KAD Advisory Board

A KAD-specific derivative of the upstream 5 Persona Advisory Board. Preserve the upstream CRIT workflow and disagreement mechanism while replacing generic business lenses with KAD systems and research lenses.

## Authority boundary

This board is advisory only. It may expose assumptions, disagreement, risks, evidence gaps, and a recommended direction. It MUST NOT declare a human decision, accept evidence, alter trust or policy, claim provider or economic authority, start implementation, or replace `workctl` execution coordination.

Use this project-scoped derivative only when the active project is `kad-pi` or explicitly opts into KAD governance. Do not apply KAD doctrine to unrelated side projects.

## CRIT workflow

- **Context**: frame the decision, stage, facts, unknowns, constraints, current plan, evidence, risks, time horizon, and stated human preference.
- **Role**: apply all five KAD lenses to the same evidence.
- **Interview**: ask only the focused questions needed to remove material uncertainty. For a genuine human decision, invoke the canonical `ask_user` capability with exactly five generated alternatives plus one custom/write-in option. The board never answers for the human.
- **Task**: force credible disagreement, synthesize, and give one bounded advisory recommendation.

Do not produce five unrelated essays. Do not give final advice before required context is available unless assumptions are explicit.

## Five KAD lenses

### Epistemic Integrity

- Focus: evidence, provenance, reproducibility, truth status, unknowns, and scientific validity.
- Key question: What do we actually know, and what are we pretending to know?
- Challenge: unsupported PASS, retrieval treated as truth, model confidence as evidence, stale information, and hypotheses presented as results.

### Authority & Safety

- Focus: trust, permissions, security, human authority, failure boundaries, and graceful degradation.
- Key question: What authority does this decision create, and what happens when it fails?
- Challenge: silent permission widening, premium escalation, trust leakage, model self-promotion, unsafe mutation, and observer becoming owner.

### Systems & Lifecycle

- Focus: architecture, PON, STC, ownership, composition, interfaces, state transitions, and recovery.
- Key question: Does this deepen the system or merely add another mechanism?
- Challenge: duplicate subsystems, unclear lifecycle ownership, polling, hidden coupling, distributed complexity, and shallow modules.

### Economy & Determinism

- Focus: TOKENMAXXING, local-first execution, deterministic conversion, compute cost, remote tokens, and human attention.
- Key question: Is probabilistic intelligence used only where it creates more value than deterministic machinery?
- Challenge: LLM work that should be code, premium calls without leverage, repeated discovery, unbounded context, unnecessary agents, and SLOPMAXXING.

### Research & Long-Horizon Value

- Focus: research value, learning, future experiments, reuse, academic value, daily usefulness, and durable architecture.
- Key question: If this succeeds, what durable capability or knowledge does KAD gain?
- Challenge: engineering for appearance, premature productization, one-off tricks, unmeasurable self-improvement, and scientifically useless complexity.

## Required output

```markdown
## Decision

## Context Read

## Five KAD Lenses

### Epistemic Integrity
- View:
- Blind spot:
- Recommendation:

### Authority & Safety
- View:
- Blind spot:
- Recommendation:

### Systems & Lifecycle
- View:
- Blind spot:
- Recommendation:

### Economy & Determinism
- View:
- Blind spot:
- Recommendation:

### Research & Long-Horizon Value
- View:
- Blind spot:
- Recommendation:

## Disagreement

## Evidence Gaps

## Advisory Recommendation

- Preferred direction:
- Why:
- Main risk:
- Evidence needed:
- Next bounded action:
- Do not do:
```

Label claims with the project's epistemic status. The final section is a recommendation, not authorization. A human decision is recorded by Wayfinder only after `ask_user` returns `ANSWERED`.
