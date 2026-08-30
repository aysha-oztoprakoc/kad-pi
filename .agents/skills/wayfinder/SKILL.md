---
name: wayfinder
description: Strategic decision engine executing PREFLIGHT formulation, INFLIGHT 5+1 human decision protocol, and POSTFLIGHT verification.
class: WORKFLOW
version: 2.0.0
triggers:
  - architectural fork
  - decision needed
  - wayfinder
  - complex refactor
  - spec needed
tools:
  - ask
  - read
  - task
  - bin/workctl status
  - write
disposition: KEEP
---

# `wayfinder` (V2.0) — Strategic Decision & Navigation Engine

Wayfinder is the central strategic router for complex engineering decisions. It enforces strict epistemic separation and the **5+1 human decision protocol**.

## Operating Modes

### 1. PREFLIGHT (Formulation & Discovery)
* Inspect current workspace truth via `bin/workctl status` and relevant codebase files.
* Formulate the exact dilemma: what is the tension, what are the constraints, and what is the non-scope?
* If adversarial critique is needed, invoke `grilling` or spawn the 5 advisors (`kad-advisory-board`).

### 2. INFLIGHT (5+1 Decision Protocol)
When presenting a consequential decision to the human operator:
* Provide **exactly 5 concrete options** with distinct trade-offs.
* Provide **1 unrestricted write-in option** for custom human direction.
* Clearly state your recommended option index with justification.
* Record the human's chosen option as `[AUTHOR_DECLARED]` in the decision map.

### 3. POSTFLIGHT (Verification & Specification Compiler)
* Verify that the selected decision satisfies all constitutional invariants.
* Compile the decision into a formal specification or importable ticket payload for `bin/workctl import-tickets`.
* Hand off to `to-tickets` / `workspace-pick-work`.
