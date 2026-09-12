# ADR 0017: OMP Memory and Auto-Learning as Advisory Subsystems

## Context

The harness injects a generic KAD rule into this workspace: *"OMP auto-learning and memory mutation
remain disabled; KAD evidence gates own promotion."* The OMP orchestration preflight enforced the
literal wording with fixed values — `memory.backend` MUST be `off`, `autolearn.enabled` MUST be
`false`.

Two things then happened without the rule being revisited:

* 2026-09-08 (`1a738b5`): the operator enabled `memory.backend: mnemopi` (local SQLite long-term
  memory) and `autolearn.enabled: true` (managed skills + lesson capture), as part of an economical
  cascade decision.
* 2026-09-11: durable project memory moved to **ai-memory** as the wiki of record, with the KAD
  vault as the canonical zone layout.

The preflight has reported `MEMORY_NOT_OFF` and `AUTOLEARN_ENABLED` continuously since, and
`OMP_SETTINGS_COMPATIBILITY_MATRIX.json` has reported both rows `VERIFIED` / `PASS` with
`deviation: none` throughout — the matrix is a captured snapshot, so it described a posture that had
not existed for three days. Two artifacts disagreed with reality and with each other.

The property the invariant protects is **promotion authority**: nothing may move unreviewed material
into canon on the strength of a model's own judgment. Whether OMP keeps a local cognition store is
not that property.

## Decisions

1. **OMP memory (Mnemopi) and auto-learning stay enabled, as advisory subsystems.** They MAY record,
   recall, and mint managed skills in harness-local stores (`~/.omp/...`). They hold **no canonical
   write authority**: no learned lesson, recalled memory or minted skill may enter the vault, the
   work ledger, the evidence tree, `docs/state/`, or an ISA claim without a KAD evidence gate.

2. **Promotion remains owned by KAD.** Durable project knowledge goes to ai-memory and, when it
   becomes canon, through `bin/kad-wiki propose/approve`; work state changes go through `bin/workctl`;
   acceptance requires a durable evidence target. Auto-learned skills are never canon, and nothing in
   this decision lets them become canon.

3. **The gate changes from pinning values to verifying the boundary.** `inspectLearning` no longer
   requires `memory.backend == off` / `autolearn.enabled == false`. It now requires:
   - the posture is **declared** in `.omp/RULES.md` and **matches** `.omp/config.yml` — the existing
     posture check (`tools/kad/posture-check.mjs`), imported rather than reimplemented, so the two
     cannot drift again through a second parser;
   - `advisor.enabled` remains `false` (the advisor is a spend/authority surface of its own);
   - no OMP-managed store resolves inside project canon.
   The blocked set becomes `{POSTURE_UNDECLARED, POSTURE_DECLARATION_MISMATCH, ADVISOR_ENABLED,
   MANAGED_STORE_INSIDE_CANON}`; enabled memory and auto-learning are reported, not fatal.

4. **The settings matrix stops being able to lie.** The `memory.backend` and `autolearn.enabled` rows
   become `kad_policy: REQUIRES_HUMAN_POLICY` with the effective values observed from the live
   config, and `docs/state/test/state-artifacts.test.mjs` now compares every posture key's matrix
   `effective_value` against `.omp/config.yml`, so a `VERIFIED` claim on a stale value fails the
   suite instead of sitting in a document.

5. **This amends the injected invariant for this workspace.** The operative statement is the
   declared posture in `.omp/RULES.md` plus this ADR. The older wording is superseded here; the part
   that mattered — KAD evidence gates own promotion — is reaffirmed verbatim.

## Consequences

* The preflight stops blocking on an operator decision that was already taken, and starts failing
  when the declaration drifts from enforcement or when a managed store is pointed at canon.
* **Residual risk, recorded rather than mitigated:** learned skills and memories are model-authored.
  They are not reviewed, not versioned and not evidence-backed by KAD. The trust boundary is that
  they never enter canon; anything that must survive or be trusted belongs in ai-memory under a KAD
  gate.
* A reader who takes the injected invariant literally will find this ADR; the alternative — a gate
  that fails forever on a decision nobody revisits — is how the divergence went unnoticed for three
  days in the first place.
* Evidence: preflight tests for the declared, undeclared and canon-store paths; the live-posture
  test; the matrix↔config comparison test.

## Status

ACCEPTED — operator decision, 2026-09-12. Amends the injected KAD invariant wording for this
workspace; KAD promotion authority is reaffirmed, not relaxed. Epistemic class: `[DESIGN_DECISION]`
for the posture, `[OBSERVED]` for the boundary guard and the matrix comparison.
