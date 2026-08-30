# Phase 1: Five-Advisor Adversarial Stress-Test Review

* **Workpackage**: `WP-KAD-SKILL-ROLE-FABRIC-024`
* **Target**: KAD-PI Unified Skills & Role ISA
* **Advisory Lenses**: Architecture, Security/Authority, Economics, Verification, Epistemic Risk

---

### 1. Architecture Advisor
* **Verdict**: **SUPPORT with Invariant Constraints**
* **Findings**:
  1. Consolidating 46 skills into 15 canonical concepts with explicit typed classes eliminates routing ambiguity while preserving deep-module and TDD engineering rigor.
  2. The separation between Cognitive Guidance (Skills), Deterministic Authority (`workctl`), and Transport (`OMP`) must be enforced at every layer.
  3. Recursive spawn depth must default to 2 to prevent cascading subagent explosion.

### 2. Security & Authority Advisor
* **Verdict**: **SUPPORT with Strict Mutation Isolation**
* **Findings**:
  1. `ROLE_CONTRACT_V1` must strictly enforce that ONLY `kad-builder` with an active `workctl` claim and `fusion_writer_lease` can execute file mutations.
  2. All other roles (`kad-reviewer`, `kad-researcher`, `kad-scout`, advisors) must operate strictly read-only.
  3. No subagent may escalate authority or grant itself additional permissions.

### 3. Economics & Resource Routing Advisor
* **Verdict**: **SUPPORT with Tokenmaxxing Guarantees**
* **Findings**:
  1. Capability-first tiering (`deterministic -> tiny -> local -> free remote -> standard -> frontier -> human`) maximizes utility while keeping marginal paid spend at exactly $0.
  2. The shadow observatory and economic router must continue to verify that free lanes and local workers handle commodity tasks before escalating to `@plan` (GPT-5.6-Luna).

### 4. Verification & Scientific Validity Advisor
* **Verdict**: **SUPPORT with Strict TDD Seams**
* **Findings**:
  1. Every canonical skill must have deterministic routing fixtures (`SHOULD_TRIGGER`, `SHOULD_NOT_TRIGGER`, `AMBIGUOUS`, `CONFLICT_WITH`).
  2. Role contracts must be tested against simulated failure modes (authority leakage, unauthorized mutation, spawn overflow, model degradation).
  3. All tests must run locally and offline with zero network dependency.

### 5. Epistemic Risk & Knowledge Advisor
* **Verdict**: **SUPPORT with Anti-Poisoning Invariant**
* **Findings**:
  1. The Obsidian Canonical Vault must remain the sole durable knowledge authority.
  2. Derived projections (OpenViking, wiki, dashboard) must always carry explicit provenance and `authority: false`.
  3. The self-evolution loop (`observe -> retro -> candidate -> Wayfinder -> advisory review -> verify -> human acceptance -> downward distillation`) prevents autonomous model drift.

---

### Advisory Consensus Summary
All 5 advisors recommend proceeding with the generation and freezing of the Unified Skills & Role ISA according to Decisions D024-001 through D024-004.
