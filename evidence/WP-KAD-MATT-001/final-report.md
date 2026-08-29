# WP-KAD-MATT-001 — Evidence-gated KAD-native skill distillation

## Verdict: DEFER

### Baseline

- Branch: `main`
- HEAD: `27ed3c67016e330b658aa9be2b049b4020912109` (`27ed3c6`)
- Remote: `origin/main` at the same accepted commit
- Working tree: **DIRTY before this experiment**. Existing modifications include `evidence/WP-KAD-002/causal-journal.jsonl`, router changes, and an uncommitted WP-KAD-005 distillation implementation. They were not overwritten or claimed as this experiment's implementation.
- Known baseline: accepted steering snapshot and CI run `33181184744`.

Baseline commands passed: `python3 validate_prime_directive.py`; Librarian verify and tests; capability contract tests; `cd kad-lab && make test` (14/14); `node --test tools/kad/test/*.test.mjs` (45/45, including the pre-existing dirty candidate tests); world and multi-turn suites passed.

## Discovery and matrix

Matt material is already copied under both `agent/skills/` (ignored mirror) and tracked `.agents/skills/`, with provenance in `skills-lock.json`. No automatic updater or upstream installation was used. Existing `handoff`, `to-spec`, TDD, review, setup, and writing skills were inspected. WP-SKILL-002 already classifies the corpus and provides prior evidence. See `capability-matrix.md`.

## Candidate selection and frozen contract

The smallest useful seam was **candidate distillation/evidence gating**: it recurs in the current dirty KAD work, has deterministic receipts and promotion boundaries, and can gain a narrow conditional skill without replacing Pi, PON, STC, routing, or existing skills. The frozen hypothesis, A/B definition, measurements, acceptance, and rejection rules are in `experimental-contract.md`.

## RED

Before this change there was no KAD-native evidence-gate skill or deterministic test for its invocation boundary. The closest local Matt-derived writing skill was 10,862 bytes and described document mechanics, not KAD provenance, verifier receipts, or promotion authority.

## Bounded implementation

- `.agents/skills/kad-evidence-gate/SKILL.md`: conditional, model-independent pointer and invariant process: scope, classify, record, verify, promote/reject, evidence, STOP conditions.
- `.agents/skills/kad-evidence-gate/references/contract.md`: progressive-disclosure reference pointing to executable KAD authority rather than copying it.
- `tools/kad/test/kad-evidence-gate-skill.test.mjs`: deterministic contract test for pointer presence, required process/gates, authority files, and provider independence.

The skill is an adaptation of Matt's progressive disclosure/context-pointer and process-determinism ideas. It is not a copy and does not add a router, provider binding, dependency, or authority.

## GREEN and regression evidence

The new contract test passed. Full KAD tests passed 46/46; baseline constitutional, Librarian, capability, C++ and world suites passed. Candidate skill/reference/test hashes and measurements are in `results.json`.

## A/B results

| Metric | Baseline A | Candidate B |
|---|---:|---:|
| KAD-specific evidence gate | absent | present |
| Skill bytes | 10,862 | 2,180 |
| Candidate contract test | absent | PASS |
| Deterministic regression | PASS baseline | PASS |
| Invocation precision | NOT_MEASURED | NOT_MEASURED |
| Process reproducibility | NOT_MEASURED | NOT_MEASURED |
| Model/token/remote telemetry | NOT_MEASURED | NOT_MEASURED |

The byte observation is a document-size observation, not a claim of model-context or token savings. No equivalent agent executions were run, so nontrivial workflow benefit and reproducibility are unproven.

## Distillation assessment

- Progressive disclosure: **ADAPT** as a KAD pointer, not a duplicated constitution.
- Process determinism: **ADAPT**, with deterministic verifier receipts as the final gate.
- Small composable skills: **DUPLICATE/ADAPT**; the existing skill ecosystem already supplies this.
- Handoff and `to-spec`: **DUPLICATE** for this seam.
- Setup/upstream mutation behavior: **REJECT** as runtime behavior.
- Provenance pinning: **ADOPT** via existing `skills-lock.json`.

Long-term home of this capability: **RULE/REFERENCE + deterministic verifier**, with a thin skill only as conditional operational guidance. It should not become a model or generalized router.

## Promotion decision

**DEFER.** The implementation is green and safely bounded, but the frozen acceptance claim requires an equivalent agent A/B experiment measuring invocation and workflow outcomes. The positive byte/test observations do not establish that benefit.

## Next smallest experiment

Run one fixed, replayable distillation task through baseline A and candidate B with the same harness and record invocation, loaded references, tool calls, verifier receipts, repair count, and final acceptance.
