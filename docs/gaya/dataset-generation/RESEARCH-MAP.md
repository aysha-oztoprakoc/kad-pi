# Research frames for the Gaya dataset ISA

Status: RESEARCH_INFORMED_DESIGN, not a systematic review or proof of model quality. `train_eligible=false`; research and engineering instructions must not enter Gaya persona training by default.

## Evidence levels

- **PRIMARY_ABSTRACT_READ**: abstract fetched directly from the paper's arXiv record in this session; full paper methods were NOT audited.
- **BIBLIOGRAPHIC_IDENTITY_CHECKED**: CrossRef confirmed title/authors/DOI; no abstract or full paper was delivered. This establishes identity, not every theoretical claim.
- **LOCAL_RESEARCH_PLAN**: an explicit question or interpretation in the user's plan, not independently established empirical evidence.
- **PROPOSED_DESIGN / HYPOTHESIS**: our engineering choice or expected benefit requiring a local experiment.

A Consensus report/CSV/RIS is a search or synthesis artifact, not automatically a peer-reviewed paper, meta-analysis, or verified source. Citation counts are not evidence of correctness. “ISA” here means **Ideal State Artifact**, never instruction-set architecture. PIANO denotes agent architecture, not a musical task requirement.

## R1 — Seeded synthetic instruction generation

**Source:** Wang et al., *Self-Instruct: Aligning Language Models with Self-Generated Instructions* (2022), https://arxiv.org/abs/2212.10560. PRIMARY_ABSTRACT_READ.

**Supported at abstract level:** the method generates instructions, inputs and outputs, filters invalid/similar examples, then fine-tunes a pretrained model. Reported results concern its tested models/tasks, not Gaya or this hardware.

**Adaptation:** reviewed Gaya source records seed bounded tasks. Deterministic templates come first; local generation may propose paraphrases, scenarios and dialogue. Preserve source IDs, assumptions, generation configuration, raw outputs and rejection reasons. Every generated factual target still needs support.

**Experiment E1:** compare deterministic-only and source-conditioned local-generation variants on the same frozen source/split groups. Measure accepted unique examples, unsupported atomic claims, style diversity, rejection reasons, wall time and resource consumption. Never infer post-training improvement from generation yield.

**Limit:** Self-Instruct does not grant permission to invent canon, recursively train on unreviewed outputs, or use Gemini as a paid synthetic-data teacher. It does not establish a useful minimum row count for Gaya.

## R2 — Dataset documentation and lineage

**Source:** Gebru et al., *Datasheets for Datasets* (2018 preprint), https://arxiv.org/abs/1803.09010. PRIMARY_ABSTRACT_READ.

**Supported:** documenting motivation, composition, collection process and recommended uses improves communication and accountability. Documentation is not itself a quality guarantee.

**Adaptation:** release datasheet includes source coverage, revisions, languages, rights, approval criteria, intended local uses, excluded uses, generation/review processes, splits, lineage, metrics, unresolved conflicts and deletion/rebuild procedure.

**Experiment E2:** a consumer resolves a chosen training row back to an immutable source span and generation record; revoke one approved source and prove dependent rows are excluded from a new release while prior releases remain identifiable. Documentation-only checks cannot replace this operation.

## R3 — Oracles and semantic verification (Q6)

**Local locator:** `Plano de Pesquisa — Fundamentação Teórica da Harness KAD-PI (Consensus Pro).md:580-600`, plus the Q6 PDF/CSV/RIS in the same folder.

**Bibliographic lead checked:** Barr et al., *The Oracle Problem in Software Testing: A Survey*, IEEE TSE (2015), https://doi.org/10.1109/TSE.2014.2372785. BIBLIOGRAPHIC_IDENTITY_CHECKED; full text must be consulted before attributing a specific method/result.

**Adaptation:** distinguish exact format/hash/referential checks from partial semantic oracles and review. For formally specified mechanics, execute preconditions/effects; for prose, verify atomic factual claims against evidence or quarantine. Valid JSON is not factual verification.

**Experiment E3:** mutate source ID, entity direction, negation, numerical unit, ownership, visibility and route legality in otherwise valid rows. Report detection by fault type; preserve positive valid controls. Apply input-order permutation and serializer round-trip metamorphic checks. Zero escapes on this bounded adversarial suite is a gate, not a proof of universal correctness.

## R4 — Truth maintenance and contradictions (Q10)

**Local locator:** research plan `:748-770` and Q10 exports.

**Bibliographic lead checked:** Doyle, *A truth maintenance system*, Artificial Intelligence (1979), https://doi.org/10.1016/0004-3702(79)90008-0. BIBLIOGRAPHIC_IDENTITY_CHECKED.

**Adaptation:** explicit justifications connect source claims to derivatives. Keep candidate, approved, contested, rejected and superseded states; preserve narration, belief, negation, time and branch. When support changes, invalidate dependents. Do not install a full theorem prover or call this a complete ATMS/AGM implementation merely because it uses a dependency graph.

**Experiment E4:** conflicting character-sheet revisions and a narrated belief coexist without silent merging. Rejecting/revoking one source invalidates its descendants but preserves independent support and unrelated records. A model's proposed resolution cannot approve itself.

## R5 — Compression and character memory (Q11)

**Local locator:** research plan `:845-870` and Q11 exports.

**Source:** Jiang et al., *LLMLingua: Compressing Prompts for Accelerated Inference of Large Language Models* (2023), https://arxiv.org/abs/2310.05736. PRIMARY_ABSTRACT_READ. Its abstract reports compression results on specified benchmarks, not lossless preservation of Gaya mechanics.

**Adaptation:** retain exact source text and evidence; generate separately labeled L0/L1 summaries and actor-visible context. Resolve the existing L0 limit through source authority rather than inventing a new default. Keep identity, negation, numeric constraints, visibility and unresolved conflicts when relevant to the task.

**Experiment E5:** evaluate full evidence, deterministic selected facts and bounded summaries on frozen factual/relationship/action cases. Report actual tokenizer count and errors per category. Critical-field corruption blocks the compressed variant; absence of a qualified inference runtime blocks the model comparison, not deterministic export.

## R6 — Authority and visibility (Q13)

**Local locator:** research plan `:938-952` and Q13 exports. LOCAL_RESEARCH_PLAN; access-calculus references in those reports are leads, not full-text-verified claims in this handoff.

**Adaptation:** character/context permissions are enforced before retrieval/ranking and generation. Generation workers have bounded source read and staging-write capabilities. Author/narrator training is segregated from persona training. A character cannot gain a secret from a training target, retrieved citation, relationship explanation or compression summary.

**Experiment E6:** insert a unique secret canary outside an actor's visibility. Search exported actor prompts, targets, retrieved spans and summaries for leakage; exercise denied paths and prompt-injection-like source text as data. A dataset check alone cannot prove a future model will never disclose a memorized secret; use runtime controls and separate model/data scopes.

## R7 — Options and bounded action datasets (Q15)

**Local locator:** research plan `:795-815` and Q15 exports.

**Bibliographic lead checked:** Sutton, Precup and Singh, *Between MDPs and semi-MDPs: A framework for temporal abstraction in reinforcement learning* (1999), https://doi.org/10.1016/S0004-3702(99)00052-1. BIBLIOGRAPHIC_IDENTITY_CHECKED.

**Adaptation:** proposed action-example contract has initiation conditions, legal primitive transitions, termination conditions, a step bound and explicit failure receipts. This is a bounded scenario executor, not a requirement to build the game first or implement Option-Critic/RL training now.

**Experiment E7:** execute primitive versus macro representations of the same supported scenario and compare outcomes, resource accounting and termination. Include unavailable ingredients, inaccessible locations and failed initiation. Cooking/transmutation require explicit source/sink accounting; do not apply trade-only item-count conservation universally.

## R8 — Compute allocation and evaluation separation (Q12)

**Local locator:** research plan `:890-915` and Q12 exports. LOCAL_RESEARCH_PLAN.

**Adaptation:** bounded local generation followed by deterministic checks and independent review, with attempt limits and no automatic provider escalation. Compare accepted useful work per elapsed time and resource envelope, not raw token production. Gemini is the engineering builder, not the runtime lore authority or data-generation backend.

**Experiment E8:** report attempts, accepted unique rows, rejection causes and resource usage for a fixed seed set. Freeze budgets and criteria before the run. Self-rating by the generator cannot establish factual acceptance.

## Research acceptance rules

1. Builder records exact local source hashes and bibliography identities; obtains full-text passage/page evidence before promoting a report-derived assertion to SOURCE_DERIVED.
2. Experiments E1–E8 are design proposals, not previously measured benefits. No invented >30%, >80%, 2.5x or universal zero-error performance claims.
3. Freeze the held-out evaluation and thresholds before synthesis; do not tune the verifier against final test answers.
4. Model-training gains, Sid-style emergence and inference throughput remain UNKNOWN until separately exercised. They are not dataset-release claims.
5. Future model training requires separate resource admission, model/license compatibility and authorization. This handoff delivers data and consumer proofs, not weights.
