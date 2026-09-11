---
kad_id: ISA-GAYA-DATASET-G1-001
title: As Crônicas de Gaya — First-generation synthetic dataset Ideal State Artifact
type: governance_proposal
domain: generic
version: 1.0.0
status: DRAFT_VALIDATOR_BINDING_PENDING
authority: PROPOSED_TARGET
epistemic_class: PROJECT_INFERENCE
review_status: PENDING_INDEPENDENT_REVIEW
visibility: project
context_eligible: true
train_eligible: false
publish: false
temporal_status: CURRENT
owner: Human Project Lead; Gemini engineering builder under KAD
date: 2026-09-09
related_adrs: [0004-model-agnostic-control-plane, 0005-deterministic-first-and-epistemic-classification, 0014-generalized-ideal-state-artifact-and-compute-fabric-governance]
---

# As Crônicas de Gaya — Dataset-first Ideal State Artifact

## 1. Identity

- **Goal ID:** `ISA-GAYA-DATASET-G1-001`.
- **Current state:** `CSA-GAYA-DATASET-001.md`, supplementing the latest `docs/state/CSA_KAD_PI_CURRENT.json` at preparation time.
- **Builder:** Gemini 3.8 Flash with high reasoning, selected interactively through the authorized OMP route. This is a transport preference, not a new routing policy, runtime role or teacher-model requirement.
- **Implementation frames:** `WORKPACKAGES.md` and its machine-readable source `workpackages.json`.
- **Research:** `RESEARCH-MAP.md`; all untested applications remain proposed designs/hypotheses.
- **Authoritative inputs:** `/home/amdy/Work/kad-rpg/kad-gaya` original corpus, with explicit source/revision decisions; research directory is methodology evidence, not Gaya canon.
- **Artifact lifecycle:** draft outside `vault/00_Governance` to avoid automatic canonical discovery. This handoff does not self-approve canon or implementation. Native validator binding is a known initial blocker, not an excuse to weaken lint.

## 2. Stated Goal

> Build and qualify a source-grounded, reproducibly compiled synthetic dataset release from the existing As Crônicas de Gaya collection, using the existing extraction pipeline. Produce separate, traceable exports for first-generation local model adaptation, character-scoped retrieval, and structured game construction. Preserve the distinction between original sources, approved facts, beliefs, proposed scenarios, generated expression and simulation outcomes.

The first release is complete when every blocking gate below is evidenced and reviewed. Row volume alone is never completion. A review-pending corpus inventory or a few sample templates is not the qualified release. Conversely, no arbitrary large row count justifies repeated paraphrases or invented content.

A full 3D ASCII game, trained model weights, RL loop and reproduction of Project Sid are downstream projects. This ISA must not reverse the user's dataset-first order.

## 3. Ideal State Description

```text
Original corpus + source media              Academic research evidence
              |                                      |
              v                                      v
     Fingerprinted source inventory         Methods / hypotheses / oracles
              |                                      |
              +----> Extraction into candidates <-----+
                               |
                     Evidence + review decisions
                               |
                Versioned supported knowledge records
                               |
             Frozen source-family splits and evaluation
                               |
       Deterministic tasks + bounded local synthetic proposals
                               |
        Semantic checks / mechanical oracles / independent review
                               |
              Immutable qualified dataset release
                   /              |              \
         Training exports     RAG records     Game-content bundle
                               |
                  Later game/model experiments
```

### 3.1 Trust and representation contracts

Reuse/extend `pipeline/schemas.py` rather than invent a competing schema subsystem. The following are semantic contracts, not mandated new class names:

| Record | Required information and invariant |
|---|---|
| Source document | Stable content identity, SHA-256, original relative path, format, size, revision/duplicate family, provenance/rights status, source-versus-derived disposition. Discovery never promotes canon. |
| Evidence span | Source hash and revision, exact quotation or source-region reference, locator kind and extraction mapping. PDF page/region where available; text offsets with encoding; DOCX/ODF part/paragraph locator. A valid hash alone does not prove the quote supports the claim. |
| Extraction record | Parser/OCR/model identity and version, extraction status, fidelity limits, source-to-extracted mapping, errors and review needs. Empty text is not silent success. |
| Entity | Stable identity, original Unicode names, reviewed aliases, category, source-backed attributes; generic mentions and ambiguous aliases remain unresolved. No name-based accidental merges. |
| Claim/relationship | Subject, predicate, object/value, polarity, temporal interval, perspective/epistemic state, branch, visibility, supporting/conflicting evidence IDs. Direction and negation survive normalization. |
| Review decision | Reviewer/authority, exact claim revision, decision/reason and evidence references; immutable history. Source ownership is not proof that every historical version is current. |
| Media asset | Asset hash, original path, dimensions/format, depicted-entity associations and evidence, crop/region/coordinate system when needed, approved visual description separately from proposed caption. Anonymous filenames never establish identity. |
| Scenario | Explicit assumptions, source-supported rule IDs, initial state, actor-visible observation, allowed actions, initiation/termination conditions, deterministic step bound and expected outcome from an executable oracle. |
| Synthetic example | Family, task/prompt/target, evidence and entity IDs, source-family/split ID, scenario assumptions, knowledge scope, generator/template version, raw response reference, acceptance reasons and eligibility. No hidden chain-of-thought collection; optional concise rationale cites visible evidence only. |
| Generation run | Input/configuration hashes, seed/order, model/runtime/tokenizer identity if used, admitted resource envelope, prompts/responses or tapes, attempts/rejections, compiler versions. Never store credentials or unrelated private context. |
| Release manifest | Sealed payload hashes, split mapping, source/review/config identities, compiler identity, family counts, exact exclusion reasons, rights/usage limitations and consumer compatibility. Evaluation and authorized acceptance receipts refer to this manifest hash from outside its payload hash set; neither the manifest itself nor its final acceptance/check result is recursively hashed into the payload. |

Serialize deterministic payloads with fixed ordering, stable IDs and canonical numeric/Unicode policies. Original source bytes remain unchanged. Wall-clock diagnostics belong in a separate provenance envelope, not in content whose reproducible hash is claimed.

### 3.2 Epistemic lifecycle

`SOURCE → EXTRACTION → CANDIDATE → APPROVED / CONTESTED / REJECTED / SUPERSEDED`.

`APPROVED + explicit assumptions → SYNTHETIC_DERIVED → VALIDATED_EXAMPLE`.

A validated synthetic example is not a new canonical fact. Simulated events have run/branch scope. Character beliefs have perspective scope. Unknown, contested and rejected assertions may appear only in explicitly labeled abstention/contrast tasks with supported targets; they must never be exported as positive facts. Their sources still obey rights and visibility policy.

Training eligibility is independent from context eligibility, review state, publication permission and schema validity. Propagate source revocation to dependent rows and rebuild a new release; do not alter an old release in place.

### 3.3 Dataset families and downstream outputs

1. Grounded lore/reference Q&A, including source-supported unknown answers.
2. Character identity, behavior/style examples and actor-knowledge boundaries.
3. Direct/directional relationships and bounded evidence-path reasoning; friend-of-friend is not automatically friend.
4. Items, ownership and supported mechanics; definitions distinct from unique instances.
5. Spatial containment, adjacency and route tasks only where supported. Coordinates not in sources remain unknown/proposed, not invented canon.
6. Visual entity-reference pairs and reviewed captions/regions. Text-only exports may carry media IDs; do not claim vision-model readiness until the target consumer loads actual images.
7. Bounded situational decisions, rejection/recovery and macro-action examples checked by executable rules.
8. Memory/context summaries, contradictions and abstention, with exact support preserved outside lossy summaries.

Every family must be implemented and exercised on source-supported material, or explicitly BLOCKED with the missing source/approval/capability. Silent omission is prohibited; a blocked required family prevents full acceptance. Volume/coverage quotas are frozen after inventory and before bulk generation, not guessed here. The builder may not mark complete by lowering them after seeing results.

Outputs derive from one normalized release:

- **Training:** internal examples plus ShareGPT or the actual selected consumer format, separated by model role/knowledge scope. Preserve provenance in a lossless sidecar if the consumer disallows metadata fields. No indiscriminate mixing of narrator secrets into persona training.
- **Game content:** portable structured entities/items/locations/relationships/rules/assets with referential validation. This is an offline consumer/import proof, not the game renderer.
- **RAG:** source-linked chunks and scoped summaries; no requirement to publish into the live vault or index. Live-service compatibility is claimed only if separately exercised in authorized staging.

## 4. Research and Engineering Principles

- R1/R2: grounded seed generation with filtering and dataset documentation; do not copy headline paper improvements as local acceptance targets.
- R3/R4: explicit support and partial oracles; no JSON-equals-truth, no self-approved conflict resolution.
- R5/R6: exact evidence plus bounded derived context, with permissions applied before retrieval/generation.
- R7: mechanically checked bounded actions without requiring a completed game first.
- R8: deterministic-first, admitted local generation and bounded attempts; no hidden paid teacher calls.
- Preserve PON causal dependencies and STC capability dependencies as different relations. File-change notifications may invalidate affected artifacts; no new event framework is required for this offline builder.
- Reuse working components. Fix the real extraction/export boundary and migrate affected callers; do not create an independent hardcoded lore database.

## 5. Reproducibility and Split Policy

**Guaranteed target:** same source/review/configuration versions and recorded generator outputs produce byte-identical exported payloads and content manifests in separate processes and directories.

**Not guaranteed:** new GPU/model inference produces identical text merely because seed/temperature match. Cache or record responses and replay them; report fresh-generation variability separately.

Freeze document-version/duplicate families before split assignment and before paraphrasing. Split by source/scenario family, not random rows. Perform exact and near-duplicate checks, with versioned algorithms/thresholds. Multi-source examples may not bridge incompatible train/validation/test partitions; exclude or regroup them before the split freeze.

Distinguish source-held-out generalization tests from same-canon task-held-out behavior tests. Shared entities may be legitimate in the latter, but the overlap must be declared. If one consolidated codex dominates a connected source family, do not split its paraphrases and claim independent evaluation; report limitations and prepare separately authored held-out cases with proper authorization.

## 6. Execution and Ownership

Run `WORKPACKAGES.md` frames 00–09 through existing workctl mechanisms, after ownership is legitimately resolved. Plans stay PROPOSED until actual fixed point, project identity, dependencies and ownership are observed. The current `kad-rpg-unknown` registry state is a preflight blocker, not permission to bypass enrollment via the parent project.

Default to one Gemini integration owner. After the shared schema frame, independent text and visual source processing can run concurrently only with disjoint outputs and declared contracts. Workers skip build/lint/test execution while concurrent mutations are in flight; the integration owner validates after convergence. Do not assume this handoff grants additional remote-agent spend.

## 7. Testable Claims

The following validator IDs are **planned contract names**, not present capabilities. Native lint is expected to fail on these IDs until frame 09 implements real allowlisted validators in the existing registry. Do not bind unrelated validators, execute shell strings from this YAML, add a stub returning success, or mark the draft accepted just to obtain green output. A semantic validator must validate actual release data/evidence integrity, not file existence or prose containing PASS.

```yaml
claims:
  - id: GAYA-G1-01
    statement: "Source inventory is complete within its frozen discovery scope and excludes derived feedback with explicit reasons."
    class: DETERMINISTIC
    target_state: CANONICAL_TARGET
    validator: gaya.dataset.source_inventory
    severity: BLOCKING
    status: PENDING
  - id: GAYA-G1-02
    statement: "Evidence, review state, visibility and training eligibility remain distinct and resolve to immutable source revisions."
    class: HYBRID
    target_state: CANONICAL_TARGET
    validator: gaya.dataset.provenance
    severity: BLOCKING
    status: PENDING
  - id: GAYA-G1-03
    statement: "Supported documents preserve source locators and explicit extraction failure or OCR review status."
    class: HYBRID
    target_state: CANONICAL_TARGET
    validator: gaya.dataset.extraction
    severity: BLOCKING
    status: PENDING
  - id: GAYA-G1-04
    statement: "Entity identities, relationship direction, negation, temporal revisions and conflicts survive extraction and qualification."
    class: HYBRID
    target_state: CANONICAL_TARGET
    validator: gaya.dataset.knowledge
    severity: BLOCKING
    status: PENDING
  - id: GAYA-G1-05
    statement: "Visual references link source assets and reviewed regions or descriptions without inventing canon or geometry."
    class: HYBRID
    target_state: CANONICAL_TARGET
    validator: gaya.dataset.visual
    severity: BLOCKING
    status: PENDING
  - id: GAYA-G1-06
    statement: "Frozen split groups and actor knowledge scopes prevent the declared leakage classes in prompts and targets."
    class: DETERMINISTIC
    target_state: CANONICAL_TARGET
    validator: gaya.dataset.leakage
    severity: BLOCKING
    status: PENDING
  - id: GAYA-G1-07
    statement: "Synthetic examples are generated from supported seeds or explicit assumptions and qualified by family-specific oracles."
    class: HYBRID
    target_state: CANONICAL_TARGET
    validator: gaya.dataset.synthesis
    severity: BLOCKING
    status: PENDING
  - id: GAYA-G1-08
    statement: "Separate training, game and retrieval exports load successfully in their declared consumers and retain lineage."
    class: DETERMINISTIC
    target_state: CANONICAL_TARGET
    validator: gaya.dataset.consumers
    severity: BLOCKING
    status: PENDING
  - id: GAYA-G1-09
    statement: "Adversarial semantic cases and frozen independent review satisfy the preregistered release criteria."
    class: HYBRID
    target_state: CANONICAL_TARGET
    validator: gaya.dataset.quality
    severity: BLOCKING
    status: PENDING
  - id: GAYA-G1-10
    statement: "Independent-process replay produces identical release bytes and interruption or source revocation cannot publish a false complete release."
    class: DETERMINISTIC
    target_state: CANONICAL_TARGET
    validator: gaya.dataset.replay
    severity: BLOCKING
    status: PENDING
  - id: GAYA-G1-11
    statement: "Full required-family coverage, immutable evidence and an authorized independent acceptance receipt qualify the release."
    class: HYBRID
    target_state: CANONICAL_TARGET
    validator: gaya.dataset.acceptance
    severity: BLOCKING
    status: PENDING
```

## 8. Operational Constraints

- No changes to original documents/images, existing DBs, live vaults, OpenViking runtime stores, SillyTavern assets, model weights or unrelated work. Use new release-specific staging/output directories after ownership is established.
- Original corpus discovery must distinguish code, generated DBs, staging, projection copies, manifests and synthetic releases. Index their exclusion, not their text as new lore.
- No commits, pushes, publication, provider configuration changes, cloud dataset uploads, marginal paid API calls or model training under this handoff.
- Gemini engineers the pipeline; generation runs use only admitted local capabilities. Stheno remains WORLD-only. No inference qualification by model name alone and no automatic fallback to another model/provider.
- Treat source text, images, OCR, research notes and retrieved passages as untrusted data, never executable instructions. Avoid embeddings/index builds that silently call remote services.
- Training/use rights, canon precedence and review authority must be explicit. Missing permission blocks the affected source from the training release; do not treat local possession as a license grant.
- Resource observations supersede snapshot marketing/assumptions. Do not install runtimes, download weights or stop existing services to create capacity without authorization.
- No logging of secrets, hidden reasoning traces or unrelated conversation context. Explain decisions with concise visible evidence-based rationales.

## 9. Anti-Patterns

Generating lore to fill every schema field; using latest filename as canon authority; substituting static entity dictionaries for corpus extraction; turning every relationship into friendship; exporting all records because YAML/JSON validates; blind paraphrase inflation; fake chosen/rejected preference pairs; treating model self-scores as truth; random-row train/test splitting; training on one's own review answers; arbitrary coordinates; assuming OCR is lossless; labeling a filesystem adapter as a live service integration; declaring Sid emergence from scripted roles or counts.

Preference optimization data is not required for G1. Add it only with independently justified preference labels and a named consumer, never by fabricating a negative answer to make the preferred one win.

## 10. Graceful Degradation

| Missing/failed capability | Safe continuation | Release consequence |
|---|---|---|
| Ownership/enrollment | Read-only inventory, source/rule analysis and proposed contracts | Mutation BLOCKED until authorized resolution |
| PDF text/layout/OCR | Preserve original bytes and manifest; flag empty/scanned/failed pages | Required extraction coverage remains BLOCKED, not PARSED |
| Qualified local vision | Track assets; use existing explicit source links and approved descriptions | Unresolved required visual interpretation blocks full visual qualification |
| Local generation | Deterministic supported example compiler and recorded-response replay | Do not claim fresh local synthesis; required local-generation gate remains BLOCKED |
| Canon/rights review | Retain candidates and conflict report outside positive training | Affected rows excluded; required-family coverage can remain BLOCKED |
| Consumer unavailable | Emit internal normalized release and documented adapter boundary | Actual consumer compatibility NOT VERIFIED; gate remains BLOCKED |
| Interrupted write/stale source | Keep incomplete staging and recovery journal; never advertise COMPLETE | Resume/rebuild into a new release; preserve prior complete releases |

A blocked gate does not justify abandoning independent work, but the final report must not call the overall deliverable complete. Do not weaken a gate, fake data or widen authority to obtain PASS.

## 11. Acceptance Matrix

| Gate | Evidence required | Owner frame |
|---|---|---|
| GAYA-G1-01 | Enumerated source/exclusion manifest, stable duplicate/revision groups, source hashes and discovery coverage reconciliation | 00–02 |
| GAYA-G1-02 | Schema/locator round-trip, rejected/candidate eligibility probes, source revocation propagation and review records | 01,03,08 |
| GAYA-G1-03 | Real supported-format corpus extraction with resolvable locators; explicit empty/scanned/error accounting | 02,08 |
| GAYA-G1-04 | Negation, direction, Unicode aliases, temporal and third-party relationship checks; independently reviewed seed records | 03,08 |
| GAYA-G1-05 | Real image and document-region association walkthroughs, disputed/superseded visual cases and media consumer proof | 04,07,08 |
| GAYA-G1-06 | Frozen split hashes, duplicate-family isolation, multi-source bridging checks and secret-canary exclusions | 05,08 |
| GAYA-G1-07 | Source-grounded generated examples per required family, raw generator tapes, rule execution and rejection reasons | 05–06,08 |
| GAYA-G1-08 | Actual training parser/tokenizer load without training, game-bundle import, retrieval scope lookup and lineage sidecar resolution | 07 |
| GAYA-G1-09 | Frozen adversarial suite, independent review method/sample, measured numerators/denominators and unresolved defects | 08 |
| GAYA-G1-10 | Two-process byte/hash comparison with identical recorded inputs, varied process ordering/hash seed; interrupted export and source-change probes | 06–08 |
| GAYA-G1-11 | Required-family coverage table, artifact digests, all gate results, independent authorized acceptance and native ISA check | 09 |

Default critical gates are zero schema/referential violations, zero positive exports from disallowed/revoked claims, zero split-family collisions and zero secret-canary/critical-semantic escapes in the declared test suite. Human-review coverage and quality thresholds must be preregistered in frame 05 using corpus risk/size, with justified sample design and confidence intervals where meaningful. These defaults are design requirements, not literature-reported performance.

Full-source inventory is mandatory; exhaustive human checking of every generated paraphrase is not implied. Automatic validators handle mechanically decidable contracts; ambiguous factual targets remain quarantined. Report what proportion of accepted rows received independent semantic review and why the remaining acceptance is justified.

The proposed frames use project-scoped ownership: 00 for workspace preflight evidence, 01–08 for enrolled nested-project implementation, and 09 for explicitly authorized workspace registry integration. Frame 04 consumes Frame 03 entity identities. Native readiness requires accepted dependencies, not a pasted completion checklist. Deterministic continuation without local inference does not waive the fresh-local-generation requirement in section 10.

Qualification has an explicit order: seal candidate payload → domain validation and independent semantic review → authorized acceptance receipt bound to the sealed manifest hash → final native check. Payload sealing alone never grants acceptance. Missing review remains BLOCKED; do not require final check PASS as a prerequisite for requesting the very receipt that check must validate.

## 12. Provenance and Change Log

2026-09-09: Created as a draft dataset-first target from the latest named workspace CSA, bounded corpus/code observations and the user's latest clarifications. Supersedes only the earlier proposed game-first sequencing for this deliverable, not historical evidence or unrelated approved workpackages. No implementation claims are promoted by writing this ISA.

2026-09-09: Refactored the proposed workpackage contracts after the preflight handoff: separated project roots and evidence ownership, corrected the visual/entity dependency, bounded staged CLI completion, and clarified non-recursive acceptance receipts. All ten frame IDs, eleven blocking claim definitions and draft/unregistered status are retained. Historical evidence is unchanged; see `evidence/GAYA-DATASET-WP-REFACTOR-001/review.json` for plan-only verification.
