---
doc_id: EVIDENCE_EPISTEMOLOGY
title: "Epistemology: Prime Directive, Evidence Ledgers & Scientific Reconstructability"
domain: EPISTEMOLOGY_EVIDENCE
epistemic_status: DESIGN_DECISION
source_documents:
  - PRIME_DIRECTIVE.md
  - wiki/KAD_PI_AGY_HANDOFF_2026-08-28.md
  - evidence/WP-KAD-001/final-report.md
retrieval_keywords:
  - Prime Directive
  - Epistemic Status
  - Reality Levels
  - Claim Ledger
  - Evidence
  - Scientific Reconstructability
  - STOP Conditions
---

# Epistemology: Prime Directive & Evidence Ledgers

## Executive Summary
This document specifies the epistemological governance framework of the KAD architecture. It enforces scientific honesty, immutable causal journaling, formal claim verification, and strict reality-level labeling to prevent simulated or hallucinated passes from entering canonical documentation.

---

## 1. Epistemic Classification Framework

Every architectural assertion, test result, and design document is tagged with its epistemic status:

| Epistemic Class | Definition | Verification Standard |
|---|---|---|
| `[SOURCE_DERIVED]` | Derived directly from academic literature (e.g. PON, STC, Cordis papers). | Citation of formal published source. |
| `[DESIGN_DECISION]` | Accepted architectural consensus for this project. | Documented in accepted ADR or PRIME_DIRECTIVE. |
| `[HYPOTHESIS]` | Expected benefit or optimization not yet experimentally proven. | Must not be treated as a fact or requirement. |
| `[EXPERIMENT]` | Temporary mechanism or probe introduced to test a hypothesis. | Bound to specific WorkPackage with teardown plan. |
| `[OBSERVED]` | Empirically measured behavior from executable runs on real systems. | Attributable log, hash, or reproducible run. |
| `[CONFIRMED]` | Verified across independent runs by adversarial reviewer. | Verified cryptographic manifest and audit sign-off. |

---

## 2. Reality Levels for Testing & Evidence

| Reality Level | Description | Example |
|---|---|---|
| `STATIC` | Type check, schema validation, AST analysis, or syntax linting. | TypeScript compiler or JSON schema validator. |
| `SIMULATED` | In-memory mock, mock EventEmitter, or synthetic test double. | `SimulatedPiRuntime extends EventEmitter`. |
| `INTEGRATION` | Multiple real system components communicating via standard contracts. | Provenance-verified Pi SDK session emitting into Cordis. |
| `LIVE_OBSERVED` | Real installed system binary executing against live environment. | Locally installed Pi CLI process invoked with smoke flags. |

> **Critical Invariant**: A manually constructed Pi-shaped mock is `SIMULATED`, never `INTEGRATION` or `LIVE_OBSERVED`.

---

## 3. Claim Ledger Schema (`claim-ledger.jsonl`)

```json
{
  "claim_id": "CLM-001-PI-LIFECYCLE",
  "claim": "Pi SDK AgentSession.subscribe provides unsubscription that eliminates post-dispose events.",
  "epistemic_class": "OBSERVED",
  "reality_level": "INTEGRATION",
  "evidence_paths": [
    "evidence/WP-KAD-001/runs/sdk-lifecycle-microproof.json",
    "kad-lab/exp-003-pi-tracer/test/sdk-kad-pon.contract.test.mjs"
  ],
  "verifier": "kad-tester",
  "reviewer": "kad-reviewer",
  "verdict": "PASS"
}
```

---

## 4. Scientific Reconstructability Invariants

* **[DESIGN_DECISION]** **Durable Evidence Over Conversational Context**: An agent claiming "PASS" is not evidence. An accepted outcome requires content-addressed artifacts, logs, exit codes, and hashes on disk.
* **[DESIGN_DECISION]** **Append-Only Causal Journals**: Every consequential run produces an append-only journal recording `causationId`, `correlationId`, `event_id`, timestamps, component versions, and before/after state hashes.
* **[DESIGN_DECISION]** **Truthful PARTIAL**: A small, trustworthy `PARTIAL` with honest evidence outranks a sophisticated false `PASS`.
