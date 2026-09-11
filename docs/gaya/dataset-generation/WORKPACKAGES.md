# Builder workpackages — Gaya dataset generation one

Frame sections and shared execution policy are rendered from `workpackages.json`, the canonical plan source. These are proposed implementation contracts, NOT registered workctl tasks. `fixed_point: null` and unresolved bindings are not runnable placeholders. Frame 00 records prerequisites; only separately authorized governance may enroll projects and register project-scoped tasks.

The prior preflight and `evidence/GAYA-DATASET-HANDOFF-001/` remain historical snapshots. This refactor is recorded in `evidence/GAYA-DATASET-WP-REFACTOR-001/review.json`; old deliverable hashes are not assertions about the revised plan. The pasted handoff TODO is not a frame definition. IDs/titles below remain canonical.

## Read order and success definition

1. `CSA-GAYA-DATASET-001.md` — latest named parent CSA plus bounded project evidence.
2. `ISA-GAYA-DATASET-G1-001.md` — target, records, required families, gates and boundaries.
3. `RESEARCH-MAP.md` — bounded evidence and experiments R1–R8/E1–E8.
4. This file/current frame; open only the frame's source sections and relevant existing callers.

Complete the dataset release and consumer proofs, not the game or model training. Do not stop at schema scaffolding or a toy exporter. If a genuine external gate blocks completion, finish independent reachable work and report the precise blocker without calling the overall target qualified.

## Dependency order

```text
00 preflight → 01 contracts → 02 ingestion → 03 knowledge → 04 visuals
  → 05 frozen evaluation → 06 synthesis → 07 exports → 08 qualification → 09 acceptance
```

Frame 04 consumes Frame 03's resolved entity IDs; its complete contract is not independent of 03. Media inspection can happen earlier read-only, but cannot qualify 04. The complete frames are sequential. Any future parallel decomposition requires authorized disjoint contracts and paths before dispatch, not simultaneous claims on broad staging/test directories.

## Builder execution frame (repeat for each workpackage)

- **Orient:** state ID, goal, current gate, exact inputs and owned mutation boundary in a short visible note. Read actual source bodies and caller contracts; never infer an implementation from comments or a prior model report.
- **Ground:** list the precise supporting source/case and the expected observable result. Separate observed facts, design decisions, hypotheses and unknowns.
- **Claim:** after enrollment/fixed-point/dependency resolution, use the existing workctl show/claim lifecycle. Respect active leases. Never weaken project-kind or fixed-point checks.
- **Implement:** smallest coherent change at an existing seam; migrate callers, avoid shims and duplicate pipelines. Do not create invented canon to fill a field.
- **Prove:** RED/GREEN for a real bug or agreed contract seam; deterministic isolated tests; exercise the actual CLI/consumer on real corpus material in staging. Unit tests do not prove service/UI integration.
- **Record:** exact command/scenario, versions/config/input hashes, output, pass/fail/block, affected rows/sources, unresolved limitations and evidence paths. Model prose saying PASS is never a receipt.
- **Advance:** integrate next eligible frame. Builder-complete, independently verified and author-accepted are separate states. Use `bin/workctl handoff <registered-id> --actor <actual-owner>` for durable continuation.

When context is compacted, resume from the current frame and evidence, not from a model-generated recollection of completed work. Do not repeatedly reread the entire corpus or paste it into prompts.

## Target CLI contract (not implemented at handoff time)

Working directory: `/home/amdy/Work/kad-rpg/kad-gaya`. Use the observed project Python environment; do not assume a global environment or install one silently.

```text
python -m pipeline.dataset_cli inspect --config <validated-config.json>
python -m pipeline.dataset_cli run --config <validated-config.json> --output <new-run-directory>
python -m pipeline.dataset_cli verify --release <release-directory>
python -m pipeline.dataset_cli replay --release <release-directory> --output <new-replay-directory>
```

These are target acceptance interfaces, NOT commands already proven to work. Frame 01 implements inspect and safe dispatch; frames 02–05 implement their run stages, 06 synthesis/replay, 07 exports and 08 domain qualification/verify. Until a stage exists its dispatch must fail explicitly, never report a successful no-op. Frame 09 binds the existing domain evaluator to native KAD checks. The final CLI must implement all four commands; intermediate frame acceptance cannot be advertised as CLI completion.

- `inspect`: read-only capability/source/config report; no inference or output-directory creation.
- `run`: only the config's explicitly declared stages, admitted capabilities and fresh destination. Refuse collisions, out-of-scope paths, source tampering, missing prerequisites and unspecified generation budgets.
- `verify`: read-only structural/semantic qualification with per-gate PASS/FAIL/BLOCKED and nonzero exit unless all requested gates genuinely pass. It does not grant human approval.
- `replay`: consumes frozen source/review/configuration identity and response tapes; performs no inference/network calls and compares claimed deterministic payload hashes.

The validated config declares corpus discovery/exclusion policy, source/revision/rights approvals, stage prerequisites, required family coverage, split policy/seed, schema/template/compiler versions, scoped local capability request, budgets, consumer identities and destination ownership. Do not encode credentials or model-provider fallback chains.

## Target release layout

```text
<new-run-directory>/
  release.json                 # sealed payload manifest: config/input hashes, files, coverage
  sources.jsonl                # originals + explicit dispositions and lineage
  claims.jsonl                 # structured support, polarity/time/scope/review state
  review-decisions.jsonl        # revision-bound approvals/rejections, not model votes
  examples.jsonl               # normalized accepted examples; no unreviewed positives
  splits.json                  # frozen family assignment + overlap policy
  generation/                  # immutable requests/responses/rejections when applicable
  training/<scope>/<split>.jsonl
  training/provenance.jsonl    # lossless row-to-evidence sidecar
  game/world.json
  game/assets.jsonl
  rag/records.jsonl
  qualification/results.json  # evidence envelope, outside sealed payload hash set
  qualification/acceptance.json # external authorized receipt bound to payload manifest hash
```

Names may be aligned to an existing consumer convention before frame 01 freezes contracts; all semantic outputs remain mandatory. Source assets may be content-addressed references instead of duplicated large images, provided the declared consumer resolves them and release integrity detects missing/changed bytes. Pending/rejected rows belong outside positive training; preserve an auditable rejection ledger. Operational timestamps/logs are separate from byte-identical content payloads. Define an explicit payload-file set: the manifest never hashes itself, and review/acceptance receipts and final check results are outside that set. Seal the candidate payload before independent review; bind receipts to that manifest hash; only a final check with authorized acceptance may label it qualified. Sealed is not COMPLETE or accepted.

## Native KAD registration and verification

- Inspect native projects/status/show before consequential execution; no claim is implied by this plan.
- Frame 00 owns only workspace preflight evidence. Enrollment and registration are external prerequisites, not Frame 00 implementation effects. A dated preflight report can be reviewed without declaring current authority resolved.
- Frames 01–08 target the nested `kad-rpg` project only after legitimate enrollment. Frame 09 targets `kad-pi` for native validator integration. Resolve each project's own current fixed point; never bind every frame to the nested repository's historical HEAD.
- `owned_paths` are **project-relative**. `inputs` and `evidence_target` are workspace-relative. Nested-project receipts are first written inside owned staging; their workspace evidence copies require separate narrow workspace ownership. A parent evidence claim grants no authority over nested-project code.
- Materialize native fields through authorized governance: `depends_on` maps to `blocked_by`, reverse edges to `blocks`; resolve scope, non_scope, capabilities, trust domain, authority, validation and fixed point. Native `workctl` requires blockers to be ACCEPTED before readiness/claim. Registration alone does not unlock frames.
- A BLOCKED frame cannot be advanced just because some artifacts exist. Continue only within eligible ownership; further independent mutation needs an explicitly authorized contract decomposition. Never mark a blocked task ACCEPTED merely to unblock the next task.
- The original native ISA lint failure on 11 unregistered IDs is historical evidence, not a passing result or a reason to rerun unchanged failing checks. Frame 09 registers real semantic adapters only under authorized workspace ownership, then runs `node bin/kad-isa lint docs/gaya/dataset-generation/ISA-GAYA-DATASET-G1-001.md` and `node bin/kad-isa check docs/gaya/dataset-generation/ISA-GAYA-DATASET-G1-001.md` from the workspace root.
- Domain qualification and payload sealing precede the authorized acceptance receipt; the final native check includes that receipt. Missing receipt remains BLOCKED. Do not invent a circular dependency requiring final acceptance-check PASS before a reviewer may accept the sealed payload.
- No substitute passing validators, shell execution from ISA Markdown, canonical promotion or weakened gates.

## Shared execution policy

- **builder_role**: Engineering builder through existing KAD-authorized transport; model/provider selection belongs to dispatch, not native work contracts.
- **integration_owner**: One active mutation owner per project-scoped claim; independent reviewers do not share mutation ownership.
- **validation_execution**: Sequential owner: RED/GREEN at agreed seams, actual smoke, then relevant integrated suite. Concurrent workers: skip all build/lint/test commands until integration barrier.
- **path_bases**: File inputs are workspace-relative; owned_paths are relative to project_root; evidence_target is workspace-relative and grants no write authority.
- **evidence_ownership**: Frames 00 and 09 own their workspace evidence. Frames 01–08 write receipts within their claimed kad-gaya/dataset_runs/ directory. Copying receipts to workspace evidence_target requires a separately authorized narrow kad-pi evidence claim. Never use ../ or claim the parent to bypass nested-project enrollment.
- **native_registration**: External authorized governance materializes project-scoped contracts; this plan does not register or enable projects. Map depends_on to blocked_by and derive reciprocal blocks. Supply native required fields including required_capabilities, trust_domain, authority_required, validation, scope and non_scope. Resolve fixed_point separately for each project root at registration and revalidate before claim.
- **dependency_semantics**: depends_on is a completion prerequisite, not just artifact availability. Native workctl requires ACCEPTED blockers. Partial receipts never advance native state. Independent continuation requires an already eligible claim or explicitly authorized decomposition with separate acceptance criteria; do not bypass unresolved blockers.
- **acceptance_semantics**: Frame acceptance proves only its bounded deliverable. gates lists evidence contributions, not automatic gate PASS. Preflight completion, implementation completion, fresh-local-generation qualification, independent review and authorized release acceptance remain separate.
- **scope_resolution**: Before native registration narrow broad test/staging paths and include every actually affected caller. Missing ownership requires an authorized scope amendment before editing, never a compatibility shim or an undeclared write.

## Per-workpackage frames

### WP-GAYA-DATASET-G1-00 — Review preflight evidence and specify authority prerequisites

**State:** PROPOSED. **Depends on:** none; authority preflight still mandatory.

**Goal:** Deliver a bounded read-only current-state and authority prerequisite report; enrollment and task registration are external decisions, not effects owned by this frame.

**Project root (workspace-relative):** `.`. **Binding:** kad-pi; explicit narrow workspace ownership required; no nested-project mutation authority. **Fixed point:** unresolved (`null`).

**Entry conditions:**

- Read-only inspection is permitted; new workspace evidence requires authorized non-conflicting scope.
- Existing preflight reports are observations to reconcile, not native ACCEPTED state.

**Inputs and evidence:**

- docs/gaya/dataset-generation/CSA-GAYA-DATASET-001.md
- docs/gaya/dataset-generation/ISA-GAYA-DATASET-G1-001.md
- docs/gaya/dataset-generation/RESEARCH-MAP.md
- docs/state/CSA_KAD_PI_CURRENT.json
- .agents/workspace/projects.json
- PRIME_DIRECTIVE.md
- evidence/WP-GAYA-DATASET-G1/00-preflight/preflight-report.json
- evidence/WP-GAYA-DATASET-G1/00-preflight/preflight-report.md

**Proposed owned paths (project-relative; resolve and narrow before registration):**

- evidence/WP-GAYA-DATASET-G1/00-preflight/

**Non-goals:**

- Do not replay the old correction plan's unrelated OMP configuration recovery.
- Do not enroll an UNKNOWN project, claim the parent as a bypass, change providers, or run bulk ingestion without the required authority.

**Implementation sequence:**

1. Read current authority, applicable accepted ADRs, evidence and executable gates. Reuse existing preflight receipts as dated observations; refresh only changed inputs or capability claims needed by the next action. Preserve historical evidence rather than rewriting it as current PASS.
2. Use existing workctl project/status/show inspection to identify project ownership and active leases. Record the authorized decision needed for enrollment; do not apply registry changes or register tasks from this evidence-only frame.
3. Record observed project roots and revisions with observation time. The reported 0389137746b0e92a34013e7cf72abfbf0679c1e4 is historical evidence, not a fixed point for every frame. Specify separate nested-project implementation and workspace evidence/registry ownership before external registration.
4. Inspect Python environment, dependency metadata, parsers, qualified local generation/vision, model tokenizer/context, resource limits and consumer availability without downloads or stopping services. Configured is not observed.
5. Create a source policy separating originals from code, staging, DBs, projections and generated releases. Account for excluded files and unsupported formats; do not preselect only convenient sources.
6. Build the research ledger from exact report/source hashes. Keep primary abstract, bibliographic metadata and full-text-verified claims distinct. Translate R1–R8 into frozen local experiments; no claimed literature-derived speedup.

**Acceptance criteria:**

- An auditable current-state delta distinguishes dated preflight observations from fresh observations, stale inputs and unresolved prerequisites.
- A decision table names each missing authority, affected frames, permitted read-only continuation and required decision evidence; preflight completion does not unlock mutation or pass GAYA-G1-01.
- Source scope, required dataset families, research evidence levels and downstream-only training/game goals are recorded.

**Required proof:**

- Read-only command receipts with versions and outcomes, no secrets.
- A source-disposition sample containing original lore, a historical revision, an image, code and a generated DB.

**Stop/degradation conditions:**

- Unknown ownership, missing scope approval or changed authority: block mutation, not the independent read-only investigation.

**Research:** R2, R8. **ISA gates (evidence contributions):** GAYA-G1-01.

**Evidence directory (workspace-relative, separately owned when outside project):** `evidence/WP-GAYA-DATASET-G1/00-preflight/`.

---

### WP-GAYA-DATASET-G1-01 — Extend shared contracts and safe entrypoint

**State:** PROPOSED. **Depends on:** WP-GAYA-DATASET-G1-00.

**Goal:** Establish a single validated contract from source evidence to dataset release using existing Python seams.

**Project root (workspace-relative):** `kad-rpg`. **Binding:** REQUIRES_AUTHORIZED_OWNERSHIP_RESOLUTION. **Fixed point:** unresolved (`null`).

**Entry conditions:**

- Frame 00 report accepted through authorized work lifecycle; nested project legitimately enrolled.
- Current nested-project fixed point, non-conflicting claim and local receipt destination resolved; workspace evidence requires separate ownership.

**Inputs and evidence:**

- kad-rpg/kad-gaya/pipeline/schemas.py
- kad-rpg/kad-gaya/pipeline/deterministic.py
- kad-rpg/kad-gaya/extract_and_ingest_gaya.py
- kad-rpg/kad-gaya/training/sharegpt_exporter.py

**Proposed owned paths (project-relative; resolve and narrow before registration):**

- kad-gaya/pipeline/schemas.py
- kad-gaya/pipeline/dataset_cli.py
- kad-gaya/tests/
- kad-gaya/extract_and_ingest_gaya.py
- kad-gaya/dataset_runs/

**Non-goals:**

- Do not create a second generic workflow engine or duplicate domain schema library.
- Do not execute the bulk script to test imports; first eliminate or isolate its top-level effects.

**Implementation sequence:**

1. Inspect existing callers and tests; use available language-server references before exported API changes. Extend compatible schemas for the semantic records in ISA section 3.1.
2. Separate source extraction, claim approval, context visibility, training eligibility and release qualification. Define explicit status enums, locator kinds, numeric units, versioning, stable IDs and typed validation errors.
3. Make source locators resolvable to exact bytes/regions and preserve normalized-to-original mappings. Disallow arbitrary confidence as a substitute for review.
4. Implement real read-only inspect and shared CLI configuration, dispatch and prerequisite checks. run/verify/replay reject unavailable stages with explicit nonzero reasons, never successful no-ops. Stage implementations and positive smoke proofs belong to frames 02–08; frame 01 does not claim the final CLI is complete.
5. Define fresh owned staging, path containment, a recovery journal and manifest lifecycle. Separate payload sealing from qualification and authorized acceptance. Freeze payload hashes before review; keep review receipts external to the hashed payload to avoid self-referential hashes. No COMPLETE before all required evidence; per-file rename is not multi-artifact atomicity.
6. Safely refactor imports/orchestration boundaries where necessary, migrate callers without obsolete shims, and preserve existing source/DB/projection bytes.

**Acceptance criteria:**

- Invalid records, stale locators and out-of-scope paths fail closed with specific reasons.
- Unicode names, quotes, newlines, units and source offsets round-trip without factual truncation.
- Inspect/import has no writes to original corpus assets, live vaults, DBs or runtime stores.
- inspect exercises the real corpus read-only; invalid config, output collisions and unavailable-stage dispatch fail closed. Positive run/replay/export/qualification proofs remain mandatory in their owning frames.

**Required proof:**

- Adversarial schema/path/locator cases with valid controls and source hashes before/after.
- Actual inspect command against a representative real-corpus configuration.

**Stop/degradation conditions:**

- If the schema change conflicts with another writer, serialize through the integration owner; do not fork contracts.

**Research:** R2, R3, R4. **ISA gates (evidence contributions):** GAYA-G1-01, GAYA-G1-02, GAYA-G1-10.

**Evidence directory (workspace-relative, separately owned when outside project):** `evidence/WP-GAYA-DATASET-G1/01-contracts/`.

---

### WP-GAYA-DATASET-G1-02 — Qualify complete source and document ingestion

**State:** PROPOSED. **Depends on:** WP-GAYA-DATASET-G1-01.

**Goal:** Account for the full declared corpus and preserve evidence locators through heterogeneous extraction.

**Project root (workspace-relative):** `kad-rpg`. **Binding:** REQUIRES_AUTHORIZED_OWNERSHIP_RESOLUTION. **Fixed point:** unresolved (`null`).

**Entry conditions:**

- Frame 01 contracts accepted; frozen discovery policy and fresh owned staging available.
- Converters admitted per format; unavailable formats remain accounted for with explicit blockers.

**Inputs and evidence:**

- kad-rpg/kad-gaya/ingestion/corpus_ingestor.py
- Original corpus and policy from frame 00
- Schemas from frame 01

**Proposed owned paths (project-relative; resolve and narrow before registration):**

- kad-gaya/ingestion/
- kad-gaya/dataset_runs/
- kad-gaya/tests/
- kad-gaya/pipeline/dataset_cli.py

**Non-goals:**

- Do not recursively ingest generated output as new source material.
- Do not label blank/scanned PDF output as successful factual extraction.

**Implementation sequence:**

1. Replace immediate-file-only assumptions with the frozen discovery policy, sorted traversal, symlink boundary checks and a full source/exclusion manifest. Count by actual content/format and disposition.
2. Group identical bytes and explicit revision families; preserve compressed/original alternatives without assuming the newest filename is canonical.
3. Exercise UTF-8 Markdown/text/JSON, PDF layout, DOCX, ODT and ODG with exact source mappings. Preserve original text and numeric/table structure; record parser/version and unsupported constructs.
4. Separate scanned/image pages from text extraction. Use OCR only if locally qualified and authorized; preserve page/image, bbox, engine/version and critical-value review. If unavailable, retain explicit review-pending status.
5. Keep image assets indexed without claiming semantic extraction. Expose documents and media through the same source IDs for frame 04.
6. Run full deterministic extraction for every in-scope supported source in new staging, not only representative parser probes. Reconcile discovered = processed + pending + rejected + excluded with one terminal disposition per source and reason codes distinguishing unattempted, parser-failed, unsupported and review-pending material. Keep format/category, processing disposition and canon/train eligibility separate.
7. Wire this frame's stage into dataset_cli run under its declared prerequisites and exercise the actual command in a new owned staging directory; do not claim later stages implemented.

**Acceptance criteria:**

- Every in-scope source is accounted for; no source silently disappears on parser failure.
- Representative actual formats produce resolvable locators; empty/scanned/error cases have truthful status.
- Code, DB/projections, previous releases and manifests cannot feed the positive lore corpus.
- Repeated ingestion with identical source policy produces identical content artifacts.

**Required proof:**

- Full census and per-format disposition report.
- Per-source extraction receipts for the complete frozen inventory, plus locator walkthroughs for real DOCX, tabular PDF, editable office document, Unicode text and images; genuine scanned pages where present. Fixtures prove fallback behavior only, not real corpus coverage.

**Stop/degradation conditions:**

- Missing converter/permission blocks affected formats; do not omit them or install packages without approval.

**Research:** R2, R3. **ISA gates (evidence contributions):** GAYA-G1-01, GAYA-G1-03.

**Evidence directory (workspace-relative, separately owned when outside project):** `evidence/WP-GAYA-DATASET-G1/02-ingestion/`.

---

### WP-GAYA-DATASET-G1-03 — Extract grounded entities, relations and reviewed seeds

**State:** PROPOSED. **Depends on:** WP-GAYA-DATASET-G1-02.

**Goal:** Build versioned supported Gaya knowledge records rather than exporting hardcoded lore or unchecked regex claims.

**Project root (workspace-relative):** `kad-rpg`. **Binding:** REQUIRES_AUTHORIZED_OWNERSHIP_RESOLUTION. **Fixed point:** unresolved (`null`).

**Entry conditions:**

- Frame 02 extraction and locator receipts accepted; source identities are frozen.
- Canon/rights decisions have named authority; missing decisions quarantine affected candidates.

**Inputs and evidence:**

- Extracted source manifest and spans
- kad-rpg/kad-gaya/pipeline/deterministic.py
- Existing source-based approval records if available

**Proposed owned paths (project-relative; resolve and narrow before registration):**

- kad-gaya/pipeline/deterministic.py
- kad-gaya/dataset_runs/
- kad-gaya/tests/
- kad-gaya/pipeline/dataset_cli.py

**Non-goals:**

- Do not treat source ownership, generated prose, filename recency or an LLM judge as canon approval.
- Do not convert all related-entity links into friendship or infer unknown identities from generic nouns.

**Implementation sequence:**

1. Resolve named entities with reviewed aliases and source spans; preserve original Unicode and ambiguity. Retain entity-definition versus item-instance distinctions.
2. Extract bounded factual candidates with direction, polarity, time, perspective, branch and exact supporting text. Outside supported grammar, abstain or use separately admitted local candidate extraction.
3. Support typed relationships and evidence paths. Friendship need not be symmetric or transitive; enemy-of-enemy is not a canonical friend. A third-party query returns the path, not an invented direct edge.
4. Separate historical character-sheet values from current approved revisions; retain inconsistent sources as conflicts pending review. Record source precedence only from explicit authority.
5. Create the source-backed seed registry through existing review mechanisms. Apply rights and train/context eligibility independently; quarantine unsupported, denied and ambiguous facts.
6. Link every derivative to support. A changed/rejected source invalidates dependent rows without deleting unrelated accepted support.
7. Wire this frame's stage into dataset_cli run under its declared prerequisites and exercise the actual command in a new owned staging directory; do not claim later stages implemented.

**Acceptance criteria:**

- Lylia é mãe de Sofia is not inverted; Lylia não carrega Nyr does not become positive possession.
- Desertion is not current affiliation; generic floresta/brigada/dragão mentions remain generic; Gaia and Gaya are not silently merged.
- Actor-specific beliefs and narrator-level accounts remain distinguishable from objective facts.
- Review-backed seed records cover the required families where sources support them; unresolved families are explicitly blocked.

**Required proof:**

- Source-located real examples and independently reviewed expected relations/attributes.
- Negative controls, contradictory sheet revisions, alias collisions and source-revocation propagation.

**Stop/degradation conditions:**

- No author/reviewer decision for a consequential canon conflict: retain candidates and continue independent records; never fabricate a decision.

**Research:** R3, R4, R6. **ISA gates (evidence contributions):** GAYA-G1-02, GAYA-G1-04.

**Evidence directory (workspace-relative, separately owned when outside project):** `evidence/WP-GAYA-DATASET-G1/03-knowledge/`.

---

### WP-GAYA-DATASET-G1-04 — Ground visual references and spatial associations

**State:** PROPOSED. **Depends on:** WP-GAYA-DATASET-G1-03.

**Goal:** Preserve the user's image-based knowledge and connect it to entities without hallucinated appearance or map topology.

**Project root (workspace-relative):** `kad-rpg`. **Binding:** REQUIRES_AUTHORIZED_OWNERSHIP_RESOLUTION. **Fixed point:** unresolved (`null`).

**Entry conditions:**

- Frame 03 entity identities accepted; frame 02 media inventory remains hash-resolvable.
- Local vision admission is needed for model interpretation, not explicit reviewed source associations.

**Inputs and evidence:**

- Media/source inventory and shared schemas
- Original images, map/screenshot assets and document regions
- Resolved entity IDs and reviewed seed registry from frame 03

**Proposed owned paths (project-relative; resolve and narrow before registration):**

- kad-gaya/ingestion/media_references.py
- kad-gaya/dataset_runs/
- kad-gaya/tests/
- kad-gaya/pipeline/dataset_cli.py

**Non-goals:**

- Do not generate replacement art or infer a portrait identity from an anonymous filename.
- Do not add precise 3D coordinates or doors because the downstream game will need them.

**Implementation sequence:**

1. Reuse available media handling; add only the missing asset-association seam. Record hashes, dimensions, original paths, regions and extraction provenance.
2. Derive explicit associations from document embedding, labels, reviewed text and author-provided references. Keep guessed captions or local VLM interpretations as candidates.
3. If local OCR/vision is required, inspect its real structured-output and resource capability through KAD/STC; do not route engineering extraction to Stheno WORLD.
4. Preserve current-versus-old portrait/revision distinctions, including named historical references, without automatic precedence from filenames.
5. Build reviewed text-image pairs for characters/items/places where supported, preserving conflicting depictions. Represent map containment/adjacency and units only when evidenced.
6. Exercise a real asset lookup and a source-region-to-entity walkthrough; integrate resolved entity IDs after frame 03 before split freeze.
7. Wire this frame's stage into dataset_cli run under its declared prerequisites and exercise the actual command in a new owned staging directory; do not claim later stages implemented.

**Acceptance criteria:**

- Each accepted visual pair resolves to exact original media and approved association/description.
- Unlabeled/conflicting images remain unresolved; generated captions cannot promote facts.
- Map/text discrepancies and unknown spatial fields remain visible rather than silently reconciled.
- All required visual categories are covered or explicitly blocked; asset tracking alone is not complete visual extraction.

**Required proof:**

- Actual portrait, item illustration and location/map-region walkthroughs where present; missing categories reported with inventory evidence.
- A changed image hash invalidates the old association; media paths survive relocation via manifest-relative resolution.

**Stop/degradation conditions:**

- Missing qualified vision or review blocks only unresolved visual interpretation, not text ingestion; full visual acceptance remains blocked.

**Research:** R2, R3, R4. **ISA gates (evidence contributions):** GAYA-G1-05.

**Evidence directory (workspace-relative, separately owned when outside project):** `evidence/WP-GAYA-DATASET-G1/04-visual/`.

---

### WP-GAYA-DATASET-G1-05 — Freeze evaluation, splits and scenario oracles

**State:** PROPOSED. **Depends on:** WP-GAYA-DATASET-G1-04.

**Goal:** Define observable correctness and leakage boundaries before synthetic expansion can contaminate evaluation.

**Project root (workspace-relative):** `kad-rpg`. **Binding:** REQUIRES_AUTHORIZED_OWNERSHIP_RESOLUTION. **Fixed point:** unresolved (`null`).

**Entry conditions:**

- Frames 03–04 reviewed seeds and visual associations accepted with immutable identities.
- Independent oracle/review authority and threshold decision owner identified before synthesis.

**Inputs and evidence:**

- Reviewed seed registry
- Visual associations
- Research experiments R1–R8
- Existing Gaya kernel rules where source-compatible

**Proposed owned paths (project-relative; resolve and narrow before registration):**

- kad-gaya/training/splits.py
- kad-gaya/pipeline/scenario_oracles.py
- kad-gaya/dataset_runs/
- kad-gaya/tests/
- kad-gaya/pipeline/dataset_cli.py

**Non-goals:**

- Do not randomly split generated rows or show held-out answers to the generator.
- Do not build a renderer or invent unsupported mechanics to create behavioral examples.

**Implementation sequence:**

1. Freeze source duplicate/revision/scenario families and split policy before generating paraphrases. Define source-held-out versus same-canon task-held-out evaluations explicitly.
2. Reject cross-partition multi-source examples; if grouping collapses most corpus into one family, report this and design a legitimate held-out task set instead of claiming source independence.
3. Define per-family observable targets and known-answer cases independently from the generation outputs. Keep source offsets and concise evidence rationales, not hidden chain of thought.
4. Implement bounded scenario oracles for supported movement, ownership, resource transitions and option termination, reusing actual kernel contracts where compatible. Record assumptions and rules; distinguish trade conservation from transformations with source/sink accounting.
5. Preregister critical zero-tolerance gates, review sampling/thresholds, budgets/attempt limits, family coverage goals and duplicate thresholds based on measured corpus size/risk. Human authority resolves consequential thresholds; no retroactive lowering.
6. Freeze secret-canary tests across actor prompt/target/retrieval/summary surfaces and semantic mutations for negation, units, direction and unsupported relations.
7. Wire this frame's stage into dataset_cli run under its declared prerequisites and exercise the actual command in a new owned staging directory; do not claim later stages implemented.

**Acceptance criteria:**

- Split/benchmark manifests are hashed before synthesis and stay isolated from generator seed input.
- All scenario outcomes are executable under explicit rules and terminate within bounds.
- Coverage targets, sample design, metric denominators and release thresholds are preregistered rather than chosen after results.

**Required proof:**

- Partition collision and multi-source bridge rejection; secret canary exclusion with positive visible controls.
- Real source-supported valid/invalid action pairs, including failed initiation and recovery.

**Stop/degradation conditions:**

- No defensible expected outcome or independent review basis: quarantine that scenario; do not use generator self-agreement as its oracle.

**Research:** R3, R5, R6, R7. **ISA gates (evidence contributions):** GAYA-G1-06, GAYA-G1-07, GAYA-G1-09.

**Evidence directory (workspace-relative, separately owned when outside project):** `evidence/WP-GAYA-DATASET-G1/05-evaluation-design/`.

---

### WP-GAYA-DATASET-G1-06 — Generate and replay bounded synthetic examples

**State:** PROPOSED. **Depends on:** WP-GAYA-DATASET-G1-05.

**Goal:** Produce the actual G1 synthetic examples from grounded seeds with admitted local generation and deterministic replay.

**Project root (workspace-relative):** `kad-rpg`. **Binding:** REQUIRES_AUTHORIZED_OWNERSHIP_RESOLUTION. **Fixed point:** unresolved (`null`).

**Entry conditions:**

- Frame 05 splits, oracles, review criteria and budgets accepted and hashed before generation.
- Deterministic compilation requires no LLM daemon. Fresh local synthesis additionally requires observed KAD/STC admission; absence stays BLOCKED without waiving the ISA requirement.

**Inputs and evidence:**

- Frozen generation plan, seeds, schemas and splits
- Dated local capability evidence; admission required for inference only, not deterministic compilation
- Existing orchestrator and KAD runtime admission seams

**Proposed owned paths (project-relative; resolve and narrow before registration):**

- kad-gaya/training/synthetic_builder.py
- kad-gaya/pipeline/dataset_cli.py
- kad-gaya/dataset_runs/
- kad-gaya/tests/

**Non-goals:**

- Do not call Gemini or any remote provider as a synthetic-data teacher.
- Do not train weights, synthesize ungrounded canon, fabricate preference labels or inflate rows with trivial paraphrases.

**Implementation sequence:**

1. Compile deterministic reference/action/abstention tasks first using the same normalized example contract as local-generated rows.
2. For semantic diversity, use only observed, authorized local roles with bounded prompts, context/output limits and resource ownership. Include only source/knowledge-scope-eligible material.
3. Generate candidate dialogue, paraphrases and explicit-assumption situations across all required families. Record exact prompt/template/model/runtime/tokenizer/config IDs and raw outputs with lineage.
4. Apply schemas, source support, actor scope, scenario execution and duplicate filters; ambiguous prose stays review-pending. Validate negative examples for their intended contrast label rather than exporting them as positive facts.
5. Enforce maximum attempts and stop on unchanged-input failures per declared policy. No provider fallback or hidden download. Record rejection reasons and admitted useful yield.
6. Implement resume/replay from immutable proposal tapes. Freeze stable content ordering and IDs; separate wall-clock diagnostic metadata. Exercise two independent processes with varied Python hash seeds/output paths.

**Acceptance criteria:**

- Actual accepted synthetic examples and rejection evidence exist for every supported required family.
- A recorded run compiles identically across processes without calling a model during replay.
- A live local synthesis smoke is observed if the capability is available; if not, deterministic output is useful but fresh-local-generation qualification is BLOCKED.
- Generator self-scores never constitute factual approval.

**Required proof:**

- Full small real-source pilot under the preregistered budget, then the frozen release-sized plan after pilot acceptance.
- A denied secret, unsupported target, duplicate and invalid action are rejected for the correct reasons; valid controls remain accepted.

**Stop/degradation conditions:**

- Missing authorized local generation, exhausted declared resources or inadequate factual support: record exact blocked gates, preserve tapes and continue deterministic reachable work.

**Research:** R1, R3, R6, R8. **ISA gates (evidence contributions):** GAYA-G1-07, GAYA-G1-10.

**Evidence directory (workspace-relative, separately owned when outside project):** `evidence/WP-GAYA-DATASET-G1/06-synthesis/`.

---

### WP-GAYA-DATASET-G1-07 — Export training, game and scoped retrieval bundles

**State:** PROPOSED. **Depends on:** WP-GAYA-DATASET-G1-06.

**Goal:** Prove the dataset can be consumed by both model-adaptation tooling and game construction without mixing authority domains.

**Project root (workspace-relative):** `kad-rpg`. **Binding:** REQUIRES_AUTHORIZED_OWNERSHIP_RESOLUTION. **Fixed point:** unresolved (`null`).

**Entry conditions:**

- Frame 06 accepted through native dependencies; partial deterministic artifacts alone do not satisfy a blocked native dependency.
- Named offline consumers, tokenizer/assets and rights available for each claimed compatibility proof.

**Inputs and evidence:**

- Validated normalized examples and frozen source/review/split identities from frame 06; final release qualification is performed in frame 08
- kad-rpg/kad-gaya/training/sharegpt_exporter.py
- Existing storage/projection adapters and selected consumer contracts

**Proposed owned paths (project-relative; resolve and narrow before registration):**

- kad-gaya/training/sharegpt_exporter.py
- kad-gaya/training/release_exporter.py
- kad-gaya/pipeline/dataset_cli.py
- kad-gaya/dataset_runs/
- kad-gaya/tests/

**Non-goals:**

- Do not populate live OpenViking/Obsidian/SillyTavern stores or alter game engine selection.
- Do not call JSON parse success a training-framework or vision-consumer smoke.

**Implementation sequence:**

1. Extend the existing exporter eligibility boundary and migrate callers. Export internal normalized rows plus the actual selected trainer format; preserve forbidden consumer metadata in a lossless keyed sidecar.
2. Separate persona/world-planner/narrator outputs by declared knowledge scope. Exclude unauthorized sources, rejected positive claims and engineering/research instruction contamination.
3. Export game-content definitions, item instances, places, typed relationships, media refs and source-supported rules from the same release, not by asking a model to invent a world DB.
4. Export retrievable source chunks and derived context summaries with visibility filters applied before lookup/ranking; keep indexes rebuildable and offline unless separately authorized.
5. Load training rows through the selected real consumer parser/tokenizer in no-training mode. Load actual images for any claimed multimodal consumer. If unavailable, qualify only internal format and leave consumer gate blocked.
6. Import the portable game bundle into an executable offline content loader and exercise entity/route/rule lookup. Query a scoped retrieval record back to source. Resolve sidecar lineage for examples from each split/family.

**Acceptance criteria:**

- Training parser/tokenizer, game loader and scoped retrieval smoke outputs are recorded separately.
- All game references and media paths resolve; unknown geography remains unknown/proposed.
- A revoked/disallowed fact is absent from positive exports across every consumer, not just ShareGPT.

**Required proof:**

- Actual no-training consumer loads, real asset decoding when applicable, game-content traversal and source lookup.
- Hash comparison across repeat exports and eligibility exclusion controls.

**Stop/degradation conditions:**

- Missing consumer dependency/license/model asset: report exact compatibility blocker; do not download or silently substitute an easier consumer.

**Research:** R2, R5, R6. **ISA gates (evidence contributions):** GAYA-G1-05, GAYA-G1-08, GAYA-G1-10.

**Evidence directory (workspace-relative, separately owned when outside project):** `evidence/WP-GAYA-DATASET-G1/07-consumers/`.

---

### WP-GAYA-DATASET-G1-08 — Qualify semantics, leakage and failure recovery

**State:** PROPOSED. **Depends on:** WP-GAYA-DATASET-G1-07.

**Goal:** Evaluate the real release against frozen criteria using deterministic gates and independent bounded semantic review.

**Project root (workspace-relative):** `kad-rpg`. **Binding:** REQUIRES_AUTHORIZED_OWNERSHIP_RESOLUTION. **Fixed point:** unresolved (`null`).

**Entry conditions:**

- Frame 07 exports and consumer receipts accepted; frame 05 criteria remain frozen.
- Independent reviewer is authorized and distinct from generator; mutation/fault cases use owned scratch copies.

**Inputs and evidence:**

- Frozen evaluation from frame 05
- Real release and generation tapes
- Consumer smoke receipts

**Proposed owned paths (project-relative; resolve and narrow before registration):**

- kad-gaya/training/qualification.py
- kad-gaya/pipeline/dataset_cli.py
- kad-gaya/tests/
- kad-gaya/dataset_runs/

**Non-goals:**

- Do not tune against held-out answers, loosen legitimate failing assertions or mark samples correct using their generator.
- Do not claim model improvements or Sid emergence without training/simulation experiments outside this scope.

**Implementation sequence:**

1. Implement the domain qualification evaluator and complete verify dispatch against frozen release inputs before executing the adversarial suite. Reuse it from the frame 09 adapter; do not create a second acceptance engine. Run affected tests after integration, retaining behavior-based regressions rather than tautological or source-text assertions.
2. Execute E1–E8 applicable deterministic experiments and separately report any local-model comparisons that are genuinely run. Optional research ablation unavailability must not masquerade as core functional failure or success.
3. Run exact/near-duplicate and partition-family analysis, secret-canary scans, evidence locator checks, entity/negation/unit/route mutations and valid controls.
4. Inject interruption before and during export finalization, source change/revocation, malformed local output and stale media references using owned scratch copies only. Never alter original corpus assets or immutable prior releases to exercise a fault. Prove no false COMPLETE and no damage to existing artifacts.
5. Have an independent permitted reviewer examine the preregistered semantic sample and high-risk seed decisions. Record disagreements, denominator, confidence/limitations and concrete rejected examples; model review alone cannot grant human canon authority.
6. Rebuild from recorded inputs in a new process/output root and compare all claimed reproducible bytes. Diagnose failures at their source, preserving the frozen oracle; if changing criteria is scientifically necessary, version a new experiment without hiding the old result.

**Acceptance criteria:**

- Every critical adversarial case is detected with valid controls passing; exact evidence/eligibility/split/replay gates hold.
- Review coverage and quality measurements satisfy preregistered criteria or explicitly fail/block release.
- Source changes and interrupted writes preserve old complete releases and cannot produce false current acceptance.

**Required proof:**

- Machine-readable per-gate outcomes with artifact hashes and actual command/scenario output.
- Independent semantic review receipt and errors by family/phenomenon, not just aggregate PASS or row counts.

**Stop/degradation conditions:**

- A failed critical gate blocks release. Fix implementation, not the gate. Missing independent/human authority remains an explicit acceptance blocker.

**Research:** R1, R2, R3, R4, R5, R6, R7, R8. **ISA gates (evidence contributions):** GAYA-G1-02, GAYA-G1-03, GAYA-G1-04, GAYA-G1-05, GAYA-G1-06, GAYA-G1-07, GAYA-G1-09, GAYA-G1-10.

**Evidence directory (workspace-relative, separately owned when outside project):** `evidence/WP-GAYA-DATASET-G1/08-qualification/`.

---

### WP-GAYA-DATASET-G1-09 — Bind native ISA gates and hand off qualified release

**State:** PROPOSED. **Depends on:** WP-GAYA-DATASET-G1-08.

**Goal:** Deliver an evidence-backed release with native KAD validation, accurate status and consumer-ready continuation.

**Project root (workspace-relative):** `.`. **Binding:** kad-pi; explicit narrow workspace ownership required; no nested-project mutation authority. **Fixed point:** unresolved (`null`).

**Entry conditions:**

- Frame 08 domain qualification and independent semantic review accepted; sealed nested-project payload is read-only input.
- Workspace fixed point and explicit kad-pi registry claim resolved separately from kad-rpg enrollment; authorized acceptance remains an external decision.

**Inputs and evidence:**

- All qualification artifacts
- tools/kad/isa.mjs
- ISA claim-to-validator contract
- Existing KAD review/acceptance machinery

**Proposed owned paths (project-relative; resolve and narrow before registration):**

- tools/kad/isa.mjs
- tools/kad/gaya-dataset-qualification.mjs
- tools/kad/test/
- docs/gaya/dataset-generation/
- evidence/WP-GAYA-DATASET-G1/09-release/

**Non-goals:**

- Do not add generic always-pass validators, shell-execution-from-Markdown or file-exists acceptance.
- Do not self-promote this ISA into the canonical vault, train models, publish data or commit.

**Implementation sequence:**

1. After explicit ownership for the narrow registry change, implement the planned validator IDs using the existing allowlisted ISA registry. Use a small shared release-validation adapter rather than eleven duplicated engines.
2. Registry validators verify actual release payloads, source/review/config hashes, recorded results and independent acceptance scope. Recompute deterministic invariants where possible. Bind external review/acceptance receipts to the sealed payload manifest hash; the payload must not include its own receipt or final check result. Missing acceptance yields BLOCKED, not a circular requirement to pass check before requesting review.
3. Prove negative controls: altered data hash, stale receipt, missing review, missing required family and all-BLOCKED results cannot pass. Keep project governance unchanged beyond the declared domain adapter.
4. Run native lint after real validator registration. Run diagnostic check against the sealed release, retaining genuine missing-review BLOCKED results; run final check again only after new authorized acceptance evidence is available. Structural lint alone is not semantic acceptance.
5. Write the release datasheet, source/row/family counts, split policy, metrics, limitations, rerun commands, consumer versions and separate training/game next-step contracts. Reflect actually changed behavior in existing documentation.
6. After domain smoke and deterministic qualification, request independent authorized acceptance of the sealed payload through existing authority. Then run final native check including that receipt; only full success permits qualified-release labeling. Record a workctl handoff, preserve evidence and user sources, and remove only owned throwaway artifacts. Builder completion never grants acceptance.

**Acceptance criteria:**

- Native ISA lint/check operate on real registered semantic gates; all blocking release claims have fresh evidence and authorized acceptance.
- A release can be consumed/replayed from its documented inputs; required families and exclusions are explicit.
- No original corpus/DB/live projection mutation, remote data generation, model training, publication or commit occurred; authorized code edits and staging/evidence writes are reported separately.
- If any gate is blocked/failed, deliver reachable artifacts and an exact blocker matrix without labeling G1 qualified.

**Required proof:**

- Native lint/check output and adversarial validator controls tied to release hashes.
- Final deliverable manifest, independent review/acceptance receipts and reproducible consumer commands.

**Stop/degradation conditions:**

- Registry ownership or acceptance authority unavailable: retain a validated domain release report but native integration/overall acceptance remains BLOCKED; do not borrow another passing validator.

**Research:** R2, R3, R8. **ISA gates (evidence contributions):** GAYA-G1-01, GAYA-G1-02, GAYA-G1-03, GAYA-G1-04, GAYA-G1-05, GAYA-G1-06, GAYA-G1-07, GAYA-G1-08, GAYA-G1-09, GAYA-G1-10, GAYA-G1-11.

**Evidence directory (workspace-relative, separately owned when outside project):** `evidence/WP-GAYA-DATASET-G1/09-release/`.

---

## Final builder response contract

Return: (1) artifact paths and hashes; (2) discovered/processed/pending/rejected/excluded source counts, with category and eligibility reported separately; (3) accepted/rejected rows by family, scope and split; (4) all 11 ISA gate results with evidence; (5) actual consumer/replay commands and observed outputs; (6) independent review/acceptance status; (7) exact blockers and their missing authority/source/capability, affected frames and permitted continuation; (8) top three next actions. Report original corpus mutation separately from authorized implementation edits and staging/evidence writes. State whether training, inference, publication or commits occurred. Do not equate a completed workpackage with an accepted release.
