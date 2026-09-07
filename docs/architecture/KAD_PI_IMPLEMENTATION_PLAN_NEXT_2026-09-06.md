---
artifact_id: KAD-PI-IMPLEMENTATION-PLAN-NEXT-2026-09-06
artifact_kind: IMPLEMENTATION_HANDOFF_PLAN
status: PROPOSED_NOT_CANONICAL
created_date: 2026-09-06
primary_project: KAD-PI
requested_implementer: Gemini 3.8 Flash High
planner_role: Planning and source inspection only
implementation_performed: false
canonical_promotion: NOT_PERFORMED
target_artifact: KAD_PI_IDEAL_STATE_NEXT_2026-09-06.md
target_sha256: 25fb967c28503186bcdf51add6f936ebac9b7fc5a5fef61cc00763bce9089127
---

# KAD-PI: Implementation Plan for the Dependable Single-Node Workstation

## 1. Execution brief

**Implement the existing trusted loop, not another platform.** The destination is the bounded next state in [the supplied ideal-state artifact](KAD_PI_IDEAL_STATE_NEXT_2026-09-06.md): finish useful engineering work, retrieve cited knowledge, inspect trustworthy receipts, and continue safely after failure on one workstation.

This document is a proposed execution plan for **Gemini 3.8 Flash High**, as requested by the user. It is not permission to mutate the repository, accept work, change canonical doctrine, publish, spend money, or interrupt the host network. Planning labels P00–P13 below are local document identifiers, not imported workpackage IDs.

**Start at P00.** Do not start by installing a memory service, upgrading every dependency, rebuilding the skill corpus, or declaring all old work complete. Existing history and accepted decisions are inputs to reconcile, not material to erase.

### Fixed constraints

- KAD owns intent, authority, acceptance, evidence and promotion. OMP is the primary interactive harness, not a second sovereign control plane.
- PON means **Notification-Oriented Paradigm**; STC means **Spatiotemporal Composability**. Do not copy the incorrect expansions from the older technology synthesis.
- Execution run success is not work acceptance. Mutation, independent verification and acceptance remain distinct authorities.
- Work contracts remain model/provider/harness-neutral. Bind the requested executor at dispatch and record the actual provider/model/reasoning configuration in the run receipt.
- The inspected project configuration names `google-antigravity/gemini-3-flash`; this does **not** establish availability of the requested “Gemini 3.8 Flash High.” Resolve the exact supported identity and High setting before executing. If unavailable, report the mismatch to the user; never silently substitute or relabel another model.
- Do not enable paid fallback, new outbound destinations, broader permission, another trust domain or an unqualified local model to make a task pass.
- The next-state proposal does not repeal accepted ADRs. Any required change to accepted policy must be proposed, explicitly accepted through the existing process, and recorded before dependent mutations.
- Deterministic checks precede model inference. Stheno remains WORLD-only; local retrieval remains separately qualified and STC-owned.

### Completion definition

Complete means all ten target acceptance outcomes in ideal-state §11 have current, reproducible evidence, with their authority boundaries intact. A source fix, a green aggregate suite, a status page or a model's review alone is insufficient. Optional experiments can remain disabled or blocked; a required safety, operator-value or recovery outcome cannot be waived by renaming it optional.

## 2. Grounding and evidence boundary

The plan was grounded in the supplied next-state artifact, current-state reports and local source inspection. Source observations below are not runtime reproductions. The planner did not modify code, configuration, work records, skills, historical evidence or the canonical vault, and did not run the project test suite.

### Material observations affecting the order of work

| Observation | Source anchor | Planning consequence |
|---|---|---|
| The project wrapper pins `v18.0.9`; its exit cleanup can recursively remove `$HOME/.omp` if absent at startup. | `bin/omp-kad`, especially lines 4–5 and 41–54 | P03 must qualify the actual launcher and remove directory-wide cleanup, not merely preserve the old canary verdict. |
| The latest report distinguishes stock runtime from the isolated patched canary; the checked `/tmp/oh-my-pi/.../model-controls.ts` path is absent now. | Latest current-state report §8; `OMP_ROUTING_AUTH_FIX.patch`; `scripts/runtime-canary-suite.mjs` | Recover a durable exact source/build pin. A checked-in patch or executable is not proof of deployed behavior. |
| Canary cases import source from an ephemeral checkout; the startup case checks configuration hashes but not the whole desired runtime boundary. | `scripts/runtime-canary-suite.mjs` | Separate source regressions, binary provenance and actual project-launcher interaction. No blanket reuse of “7/7 PASS.” |
| No-adapter probes fabricate inference metrics and return `MEASURED`. Environment failure substitutes plausible temperatures/power/versions; missing metrics normalize to apparent success. | `tools/kad/compute/probe-runner.mjs`, `confounder.mjs`, `metrics.mjs` | P01 closes all three false-observation paths before new benchmark evidence. |
| Evidence chain validation checks sequence and previous links without recomputing each receipt digest. Probe tests use a historical evidence directory. | `tools/kad/compute/evidence-recorder.mjs`; `tools/kad/test/compute-probe.test.mjs` | P01 isolates tests first; P02 repairs integrity and quarantines unsupported claims without rewriting old receipts. |
| Some ISA checks prove document structure; a human-review validator returns `pass: true` without reading an actual human decision. | `tools/kad/isa.mjs`, registry entries around lines 415–468 | P02 and P05 distinguish structural validity, empirical qualification and human acceptance. |
| WP-043 is CLAIMED and an active claim exists under `.agents/work/claims/`, owned by `deepseek-v4-flash`, including the ledger and `.omp/config.yml`. | `.agents/work/WP-KAD-PROJECT-CLOSURE-AND-ZERO-PENDING-BASELINE-043.json`; corresponding claim | P00 resolves ownership before new claims/imports/config edits. It is not a missing-claim case. Do not inspect only the legacy `.agents/claims/` location. |
| Workspace doctor returned healthy with a stale-candidate warning for WP-043 and multiple skill LOCAL_DELTA warnings. | Read-only `bin/workctl doctor` observation | “Healthy” is not permission to steal a stale claim or normalize all skill hashes. |
| `validateLeaseOwnership` uses symmetric path overlap; direct validation does not check expiration. | `tools/workspace/stc-lease.mjs:109–133` | P04 makes membership directional, expiration-aware and safe under actual filesystem resolution. |
| Knowledge retrieval reads every allowlisted source before trust filtering, trims/joins excerpt text and attaches a first-to-last line locator while calling it exact. | `tools/kad/knowledge-plane.mjs:195–235` | P07 authorizes before reading and returns byte-faithful spans with matching hashes/locators. |
| More than one knowledge projection surface exists; canonical vault CLI also invokes initialization before dispatch. | `tools/kad/knowledge-plane.mjs`; `wiki-projection.mjs`; `tools/kad/wiki/index.mjs`; `bin/kad-wiki` | P08 assigns output ownership and makes inspection/rebuild avoid canonical initialization side effects. Do not delete all wiki machinery indiscriminately. |
| Canonical proposal approval uses environment flags and an actor string as guards; work transition code principally checks actor ownership and state grammar. | `tools/kad/wiki/index.mjs:46–69`; `tools/workspace/workctl.mjs:242–254` | P05 must trace trusted approval provenance and close actual acceptance bypasses. Hash integrity alone is not human authorization. |
| Local inference teardown tests `ChildProcess.killed` after sending a signal. | `tools/kad/local-inference-capability.mjs:44–51` | P09 must wait for actual exit, deal with descendants, and prove cleanup; a sent signal is not a terminated process. |

The supplied next-state SHA-256 is pinned above. Revalidate source anchors against the checkout before editing; line numbers are planning locators, not durable identities. The latest current-state report is historical evidence, not a substitute for a fresh runtime pin.

## 3. Admission, ownership and scope conversion

### P00 must resolve these gates before implementation

1. Read `PRIME_DIRECTIVE.md`, applicable accepted ADRs/evidence, then executable gates. Relevant decisions include ADRs 0005, 0007, 0008, 0010, 0014 and 0015.
2. Establish current source revision, intentional dirty paths, active claims and leases, available runtime artifacts and the exact requested executor identity. Keep credentials and prompt contents out of evidence.
3. Resolve the live WP-043 claim through its actual owner or an explicitly authorized recovery process. Stale age is not recovery authority. Do not impersonate `deepseek-v4-flash`, remove its claim file, or declare the old closure accepted to obtain access.
4. Obtain the scoped authority required to translate this proposal into work records. The explicit target is a bounded next-state milestone, not a promise to achieve the old “zero pending” baseline. Resolve any accepted closure prerequisite conflict openly rather than editing its meaning silently.
5. Select actual work IDs using the existing ledger conventions. Import through `bin/workctl import-tickets <file>` only after overlap resolution. Each record needs `id`, `project`, `title`, `spec_ref`, `fixed_point`, `scope`, `non_scope`, `owned_paths`, `required_capabilities`, `trust_domain`, `authority_required`, `validation`, `evidence_target`, `blocked_by`, `blocks`, and `priority`, consistent with `tools/workspace/workflow-bridge.mjs`.
6. Record an explicit P00–P13 → actual work-ID map. Bind exact mutation paths, tests and evidence paths before claiming; refine broad module-family locators below into concrete files. Do not assign all of `tools/`, `vault/`, or `.agents/` to every task.
7. Authorize any accepted-ADR changes separately. This report stays a proposal unless promoted through the canonical process. Preserve its input hash and the human decision receipt reference in the work specification.
8. Before implementation changes, select a small representative set of actual engineering, retrieval and handoff tasks. Record their expected outcomes, current operator intervention/correction burden, elapsed/recovery time and available resource/spend observations. Do not rerun a known unsafe path for a baseline. Declare interaction/latency tolerances and resource limits before the later runs; missing baseline data stays unknown. P11 and the human acceptance review compare these same tasks, not easier post-change substitutes.

**Known command grammar:** `bin/workctl status`, `next --project kad-pi`, `show <ID>`, `claim <ID> --actor <label>`, `handoff <ID> --actor <label>`, and `transition <ID> <STATE> --actor <label>`. Inspect implementation before using mutation commands. In particular, current `release` can return active work to READY; do not append it mechanically after a REVIEW/ACCEPTED transition. An actor label is identification, not authentication.

The blocked `EXP-KAD-OFFLINE-SURVIVAL-001-R1` remains separate. Its record requires fresh human authorization for live network fault injection and forbids automatic resume. No step below authorizes route deletion, firewall changes, a network-interface shutdown or a privilege grant.

## 4. Sequence and shared contracts

### Dependency table

| Task | Depends on | Deliverable |
|---|---|---|
| P00 | None | Authorized scope, ownership resolution, executor and work-ID mapping |
| P01 | P00 | Honest probe/metric semantics and isolated tests |
| P02 | P01 | Verified receipt integrity and corrected current qualification |
| P03 | P00 | Reproducible, project-local, exercised OMP launch path |
| P04 | P00 | Correct writer lease enforcement and safe lifecycle renewal |
| P05 | P02, P04 | Evidence-backed acceptance and canonical promotion boundary |
| P06 | P03, P04 | Enforced tool/dispatch authority and safe route degradation |
| P07 | P00 | Authorized exact retrieval and faithful citation spans |
| P08 | P05, P07 | Rebuildable projections with non-overlapping output ownership |
| P09 | P04, P06 | Observable cancellation and tracked process cleanup |
| P10 | P05, P08, P09 | Durable handoff and tested fresh-directory recovery |
| P11 | P02–P10 | Integrated smoke proof and ten-row acceptance evidence collection |
| P12 | P11 | Safe retirement of redundant active machinery and documentation cutover |
| P13 | P12 | Final regression, independent verification and human acceptance package |

Default execution is sequential by one implementing agent. Independent source work in P01/P03/P04/P07 can proceed concurrently only under disjoint approved claims. P02 and P05 share `tools/kad/isa.mjs`; serialize that mutation. P04 and P10 share workspace lifecycle files; serialize them. P07 and P08 share knowledge files; serialize them. No integration/full-suite command runs against half-applied concurrent changes.

### Contracts to agree before those edits

- **Evidence:** Extend existing probe and run receipts rather than inventing a parallel journal. Distinguish observed values, explicit simulation, unavailable fields and failed operations. Hashing proves content integrity, not origin, measurement validity or human approval.
- **Knowledge:** Keep the existing KAD-owned KnowledgePlane seam. A result includes source identity, content hash/revision, exact span locator, authority/acceptance/trust classification, freshness and any degradation reason. Quoted source is separate from inference. Reuse existing field vocabulary wherever possible.
- **Execution:** Preserve `KAD_WORKLOAD_V1` and existing execution receipt validation. A dispatch binds an authorized claim/lease, capability, destination, data class and spend ceiling. Retries remain under the same bounds. Run receipts cannot accept work.
- **Recovery:** Preserve existing work/handoff and STC ownership formats. Recovery declares completed effects, uncommitted effects, evidence, remaining work and blockers; it never assumes that a success message means an effect or its inverse occurred.
- **Qualification:** Structural/schema checks, source presence, measured behavior, independent verification and human acceptance are separately reported. Reuse current project status semantics; do not add a second project-wide lifecycle enum.

## 5. Bounded implementation tasks

### P00 — Admit the refactor without stealing authority

**Targets:** Relevant work/claim/lease records, current policy decisions and the execution binding record. Repository code is out of scope.

**Action:** Complete §3, including the user-requested model binding. Establish an additive evidence location under each admitted work item. Preserve a before-state manifest of affected source/configuration/evidence paths. Request only decisions that cannot be resolved from current authority and tools.

**Acceptance:** Every mutable task has an actual work ID, a current fixed point, non-overlapping owned paths, authority and validation requirements. WP-043 ownership is explicitly resolved or relevant tasks remain BLOCKED. No implementation begins under an invented label or guessed permission.

**Failure behavior:** Finish read-only preparation, document the exact missing authorization and next responsible owner. Do not weaken claim checks. Optional unavailable tools do not authorize a different executor.

### P01 — Remove invented empirical observations

**Targets:** `tools/kad/compute/probe-runner.mjs`, `confounder.mjs`, `metrics.mjs`, existing `tools/kad/test/compute-probe.test.mjs`, and actual consumers discovered before the edit.

**RED first:** Move the test evidence destination to a unique temporary fixture before running the existing probe suite. Prove historical evidence is unchanged. Reproduce: missing adapter returns `MEASURED`; failed telemetry receives plausible defaults; omitted quality/acceptance values appear successful.

**Changes:**

1. Require an explicitly identified real execution adapter for measured results. Keep deterministic fake samples only in fixtures or a clearly labeled simulation path; that path cannot feed empirical admission.
2. Preserve unavailable metrics as unavailable, with reason and provenance. Do not convert unknown to zero, a nominal temperature, success rate 1, or a guessed runtime/driver version.
3. Validate finite values, required dimensions, sample counts, repetitions/warmups and metric-specific ranges. Missing prerequisites produce an explicit non-measured outcome. Zero measured repetitions cannot become an average.
4. Derived cost is computed only from adequately observed inputs under its documented method; disclose partial coverage rather than silently completing it.
5. A runtime measurement records actual adapter/model/runtime identity and relevant configuration, sample outcomes, measurement method and timestamps. The caller's desired tuple is not proof of the observed device/model.
6. Update every consumer that currently assumes all numeric fields exist. Do not repair tests by merely changing their expected success string.

**Proof:** Focused regression failures become passing; then execute the public probe with no adapter and observe refusal/non-measured output. If an already authorized real local adapter is available, perform one bounded probe and retain its raw output. Otherwise mark live benchmarking unqualified; do not install a model merely to complete this task.

**Acceptance:** No default, mock, missing telemetry or malformed sample can be represented as empirical evidence. Test runs never append to historical journals.

### P02 — Make evidence verification mean what it claims

**Targets:** `tools/kad/compute/evidence-recorder.mjs`, relevant ISA compute validators in `tools/kad/isa.mjs`, existing compute/ISA tests, current consumers and new corrective evidence. Historical journals/reports are read-only.

**RED first:** Demonstrate a payload alteration that passes current chain-link validation. Exercise malformed JSON, missing/duplicate/out-of-order records, truncated final writes, an altered tail and explicit simulation receipts. Use isolated fixtures.

**Changes:** Recompute each digest from the same defined payload serialization as the writer; verify sequence/link/schema constraints and fail closed on corrupt tails. Do not append a fresh apparent genesis after parse failure. Respect the one-writer scope or use the existing journal serialization mechanism where concurrent append is admitted. Preserve the existing format if sound; if evolution is unavoidable, version it explicitly and never silently reinterpret old bytes.

Document the limit: a locally editable hash chain can detect internal inconsistency, not independently prove authorship or prevent complete rewriting. Where rollback/truncation detection is claimed, bind the expected head/count to a separately retained acceptance receipt. Do not call an unanchored chain tamper-proof.

Keep structure validators as structure validators. Change current qualification consumers so source text, a valid schema or the existence of a receipt is insufficient for a runtime PASS. Separate P05's human decision checks from empirical checks.

**Historical correction:** Add a bounded correction referencing affected WP-021 receipts, hashes, unsupported measurement claims and dependent current views. Classify each claim by available provenance, not by whether its number resembles a mock. Preserve original journals and accepted work history; update current qualification/decision pointers through the proper authority process. Historical acceptance does not make performance data valid.

**Proof:** Tampered/corrupt/unqualified data is rejected; a valid fixture verifies; current status cannot promote a simulated result. Run the actual verifier CLI/API against a copied journal and observe explicit rejection reasons.

### P03 — Qualify one project OMP launch path

**Targets:** `bin/omp-kad`, `scripts/runtime-canary-suite.mjs`, `OMP_ROUTING_AUTH_FIX.patch`, affected project-only OMP configuration, and a separately owned, durable OMP source/build location. Global OMP installation/configuration is out of scope.

**RED first:** In disposable HOME/XDG/project roots, capture the current wrapper behavior and model-role mutation regression. Do not test directory deletion against the real home. Include a preexisting global directory and a directory created by an unrelated concurrent process.

**Changes:**

1. Identify the exact recoverable source revision/build inputs corresponding to the desired runtime. Recover the patch source into a durable managed location; do not rely on `/tmp/oh-my-pi`. If a newer pinned source already fixes the defect, prove that and omit the obsolete patch instead of stacking fixes.
2. Build and record source revision, patch identity if needed, executable digest, version and launch arguments. Verify from the actual executable, not a filename.
3. Choose the qualified project binary in `bin/omp-kad`; fail explicitly on missing/mismatched artifacts. No silent switch to stock or a global binary.
4. Remove recursive cleanup of `$HOME/.omp`. Isolate all runtime writes before launch; cleanup may remove only individually tracked owned effects. A wrapper must never infer ownership of an entire directory from an earlier absence check.
5. Keep temporary model choices session-only. Only explicit role assignment writes the intended project/global scope; project no-op writes preserve bytes/comments and sibling role changes. Do not change the user's model choices as a migration shortcut.
6. Rewrite canary prerequisites to use the pinned source and fixture roots; distinguish source tests from compiled binary tests. Check process exit, fixture ownership and teardown, not just hashes.

**Proof:** Exercise `bin/omp-kad` interactively with isolated state: start, inspect actual route, temporarily select a model, restart, cancel, and explicitly assign a fixture-only project role. Verify expected project writes and zero unexpected global writes including absent-path cases. Record relevant process/binary identity and config hashes. Provider calls require eligible routing and approved spend; a no-call selector test is not provider qualification.

**Acceptance:** The operator's documented project command uses the proven artifact. Source tests, canary executable and active wrapper are not conflated. Runtime role/config behavior is reproducible from retained inputs.

### P04 — Make writer leases directional and lifecycle-safe

**Targets:** `tools/workspace/stc-lease.mjs`, `tools/workspace/workctl.mjs`, affected workload mutation validation and existing lease/workctl tests.

**RED first:** Lease `a/b` must not authorize `a`; expired/released leases must not authorize writes; traversal and a symlink escaping an owned root must be rejected. Include simultaneous overlapping acquisition and re-claim/resume after prior claim release.

**Changes:** Use directional containment for authorization, overlap only for collision detection. Resolve paths against the declared root with existing-ancestor handling for new files. Validate active state, expiration, actor/task binding and ownership at use, not only at acquisition/listing. Make acquisition atomic against overlapping writers using an existing serialization primitive where available; a check-then-write scan is insufficient.

Repair the existing lifecycle's safe re-acquisition/renewal path if exclusive claim-file creation prevents it. Preserve prior claim records/evidence. Do not delete a released record as a routine workaround or implement force-steal based only on time. Lease loss is a capability revocation consumed by P06/P09, not a passive warning.

**Proof:** Focused boundary/concurrency regressions; invoke the actual claim/lease boundary in a fixture and attempt forbidden writes through the supported effector. If the effector is not wired yet, record this limited result and complete that proof in P06.

**Acceptance:** A claim on a descendant never grants an ancestor, and revoked/expired authority cannot support subsequent effects. Renewal and conflict handling have a deterministic, evidence-preserving outcome.

### P05 — Separate verification, approval and acceptance

**Targets:** Work transition code, existing `tools/kad/governance/` receipt/policy mechanisms, `tools/kad/isa.mjs`, `tools/kad/wiki/index.mjs` approval/application paths, and their existing adversarial tests.

**RED first:** Attempt work ACCEPTED without the required independent evidence; attempt canonical promotion using a worker success receipt or self-declared human actor; attempt approval after scope/content changes. These must fail through the real entrypoints, not only a schema helper.

**Changes:** Reuse existing governance receipt semantics and the trusted interactive approval channel. Bind approvals to the exact action, source revision/content hashes, targets, authority, lifetime and any required one-use constraints. A digest, CLI `--actor`, caller-provided issuer name or unset agent environment variable is not human authentication. Do not create a homegrown signing service or accept a worker-written receipt as proof of a human action.

Require applicable deterministic results and independent verification for REVIEW/ACCEPTED as prescribed by current policy; acceptance requires the actual authorized decision. Remove unconditional human-review PASS. Keep work/run lifecycle separation. Validate the same constraints on canonical apply as on approval so stale proposals cannot alter new source bytes.

If the current harness lacks a trusted way to attest the required human action, keep acceptance/promotion fail-closed and identify that integration as a required unresolved gate—not a permission for Gemini to manufacture approval. Source repair can still proceed under admitted mutation scope.

**Proof:** Negative cases rejected through workctl and wiki approval/application in isolated repositories; positive transition uses a genuinely authorized human decision at the point of risk, not a simulated approval in the real ledger. Fixture approvals establish test behavior only.

**Acceptance:** Implementer can submit evidence but cannot self-accept significant work or self-promote canonical knowledge. Hash-valid but unauthorized/stale receipts do not pass.

### P06 — Enforce authority at actual tool and dispatch boundaries

**Targets:** `tools/kad/workload-contract.mjs`, `external-providers.mjs`, `economic-router.mjs`, `resource-contract.mjs`, existing governance/preflight integration and the actual OMP tool/subprocess dispatch paths found in the pinned source. `tools/kad/telemetry/control-plane-runtime.mjs` is a presentation/integration locator, not evidence that enforcement exists.

**Changes:** Trace one real tool call from work claim to policy check to subprocess/file/network effect. Close uncovered entrypoints at the narrowest existing shared boundary. Bind each effect to current lease, capability, trust domain, allowed destination/data class, resource bounds and spend; validate again before effect after queued work or revocation. Route selection alone must not be able to grant missing authority.

Use the existing host-supported execution isolation facility to enforce filesystem and network limits for unconstrained shell/child processes; declarations, environment variables and post-hoc diffs are insufficient containment. Keep mutation credentials, canonical acceptance and ledger authority outside the worker's writable scope. Verify descendant containment. If the required isolation is unavailable, disable unbounded execution and expose the restricted supported capability; do not describe advisory-only execution as bounded.

Default unknown cost/eligibility/provenance to ineligible where policy requires assurance; inspect `normalizeLane` defaults carefully. Record selected and actual routes separately, plus provider/model identity and authorized fallback reason. Unknown quota remains unknown, not “FREE.” Missing/stale eligibility never enables PAYG or a larger trust domain.

No new gateway, optimizer or duplicate routing policy. Optional telemetry stays observational. Policy checks must run before dispatch; reports of blocked attempts must not leak secret content.

**Proof:** From the actual launcher, run a harmless bounded fixture task that attempts sibling-path mutation, a symlink escape, indirect shell/descendant bypass, an unapproved local test endpoint, and a post-revocation write. Check absence of effects, not just denial strings. With a chosen provider unavailable and optional services off, show deterministic/local eligible work continuing or an explicit safe stop, with no unapproved request or spend. Fixtures can simulate provider loss; real outages need their own evidence label.

**Acceptance:** The claimed execution boundary is enforced end-to-end, including descendants. Unsupported broader authority is visibly unavailable. The operator can inspect the actual route without secrets.

### P07 — Make exact retrieval authorized and byte-faithful

**Targets:** `tools/kad/knowledge-plane.mjs`, `knowledge-plane-adapters.mjs`, `context-compiler.mjs`, relevant `tools/librarian/librarian.mjs` behavior, `tools/kad/wiki/index.mjs` query/context consumers, existing knowledge/context tests and `bin/kad-knowledge`.

**RED first:** Test noncontiguous matching lines and whitespace preservation; change source bytes between indexing and retrieval; include a forbidden-domain source whose read would fail; attempt traversal/symlink access; query a derived summary whose source is absent; request an unknown answer.

**Changes:** Authorize source identity/domain/visibility before opening files or scoring text. Enforce canonical path bounds, including symlinks. Build content, hash and locators from one observed byte snapshot. Either return contiguous exact spans or individually located spans; never join separated, trimmed lines and label the result one exact contiguous quote.

Separate source quotation from generated answer/inference and discovery metadata. A catalog hit at `#L1` is discovery, not evidence for an arbitrary claim. Re-resolve derived index references against permitted canonical sources and refuse stale/unresolvable exact claims. Preserve conflicts rather than silently selecting whichever summary scores highest. Return an explicit no-answer outcome without fabricating facts.

Use the current owner map and active sources; do not bulk-ingest the entire workspace or restore the legacy wiki as authority. Context compilation applies the same source authorization, reference integrity and resource bounds. Optional semantic adapters supply candidates only and can be absent; do not implement a memory backend.

**Proof:** Run a declared query set through the actual CLI/context path: exact policy clause, work decision, accepted evidence, conflicting/superseded versions, nonexistent claim, forbidden source, stale projection and semantic-off mode. Independently resolve every cited span and compare bytes/hash. Record citation correctness and unsupported-answer behavior per case, not only a blended retrieval score.

**Acceptance:** All returned exact citations resolve to authorized source bytes. No unauthorized file is read to produce a result. Empty/unsupported answers and conflicts are explicit. No model is required for this baseline.

### P08 — Give every projection one output owner

**Targets:** `tools/kad/knowledge-plane.mjs`, `wiki-projection.mjs`, `tools/kad/wiki/index.mjs`, `tools/kad/wiki/projection.mjs`, `bin/kad-wiki`, relevant callers and generated-index tests.

**Changes:** Inventory the actual input/output ownership of legacy librarian artifacts, KnowledgePlane projections, curated projections and canonical-vault rebuilds. Retain distinct useful views but assign one authoritative generator per output path. Remove duplicate writers, not unrelated semantic responsibilities. Reuse accepted canonical source ownership; volatile revision/runtime status belongs in generated views rather than hand-maintained authoritative notes.

Make status/query/lint paths read-only; initialization is explicit rather than a side effect of inspection. A rebuild writes only declared derived paths. Validate output containment and reject arbitrary canonical/output overlap. Deleting obsolete generated files is allowed only inside the owned generated namespace; never recursively clean a mixed human/generated directory.

Regenerate from source ownership metadata and receipts without promoting raw/synthetic/unreviewed material. Derived manifests retain source identity/hash/classification and missing/stale/degraded state. Avoid inventing an index platform or new contract family.

**Proof:** In a disposable copy, record canonical hashes, remove only declared derived output, rebuild, and run P07's queries. Repeat rebuild with no relevant source change and verify deterministic substantive output. Canonical bytes remain unchanged; required sources missing yields explicit failure/partial status. Optional OpenViking, Needle, dashboards and presentation services can all be absent.

**Acceptance:** Derived output can be discarded and rebuilt without losing or modifying human/canonical material. Exact knowledge access survives the optional layer's absence.

### P09 — Prove cancellation and cleanup under failure

**Targets:** `tools/kad/stc-scope.mjs`, `local-inference-capability.mjs`, actual owned execution lifecycle adapters, related PON capability notifications and existing lifecycle/resource tests.

**RED first:** Use a harmless owned process with a child and a process that ignores the first termination signal. Cancel during activation and during work; inject a failing cleanup inverse; dispose twice; revoke a lease. Use controlled clocks for unit timing and bounded real processes for the smoke scenario.

**Changes:** Track owned process groups/handles and wait for actual exit. Escalate termination only within the verified owned scope after its bounded grace period; `process.killed` is not proof of exit. Never kill an externally controlled provider or unrelated process. Unwind effects in the existing STC order, continue necessary cleanup when an inverse fails, and retain explicit recovery debt rather than claiming a clean stop.

Signal capability loss to affected dependents, not the whole ecosystem. Admission/resource limits must keep interactive control responsive and reject overload before launching unbounded children. Reuse current contracts and lifecycle notifications; no scheduler replacement or general event-bus redesign. Bounded startup health probing is not a reason for an unrelated PON rewrite.

Before the workload run, use P00's declared interaction tolerance and resource limits. Observe both ordinary use and bounded contention; measure response/cancellation latency and peak RAM/VRAM when relevant using existing tools. Reject uncontrolled swapping, OOM, lost evidence and unbounded retries/children. Do not convert the old 25% headroom heuristic into a universal gate or add a telemetry service.

**Proof:** Execute actual cancellation through the project runtime against the owned process tree. Observe child exit, released leases/temporary paths, remaining external processes and capability state. Repeat under activation failure and cleanup failure. No canary is allowed to leave a provider or test service running silently.

**Acceptance:** Cancellation visibly stops owned work and descendants, or reports precise unresolved cleanup and blocks unsafe reuse. Independent deterministic/knowledge functions remain available when an optional provider is withdrawn.

### P10 — Make handoff and restore operational

**Targets:** `tools/workspace/workctl.mjs` handoff/resume paths, existing handoff schema/consumers, documented project startup/rebuild procedures, and one narrowly scoped restore rehearsal if no suitable existing mechanism is found. No general backup product.

**Changes:** Write handoff before giving up an active claim. Populate real completed/remaining work, current revision, dirty owned paths, evidence, failed operations, cleanup debt and next safe action; do not leave template-only fields. Resume compares the recorded fixed point and affected content with reality and obtains current authority rather than reviving an expired lease. Never reapply an already completed effect just because the old process disappeared.

Define the minimal backup manifest: source/configuration, work and handoff records, accepted knowledge, evidence and required runtime build identities. Distinguish indispensable user data from reproducible derived output. Record external local dependencies honestly. Secrets require a separately approved protected recovery channel; do not copy auth databases or credentials into evidence/backups intended for publication.

Implement or reuse a small restore procedure that targets a fresh user-owned directory, checks manifest/content integrity, regenerates only disposable projections and verifies launch prerequisites. Do not overwrite the active checkout or restore into `$HOME/.omp`. Document what cannot be reconstructed without the protected credential/material source. Do not claim offline model execution if weights/runtime assets were not retained and exercised.

**Proof:** Interrupt a bounded real task after a recorded effect, close the session, and resume using only durable handoff—not this conversation. Restore the minimal backup to a fresh directory with no optional services, regenerate projections, run a cited query and a bounded deterministic task, and verify no duplicated effect. Record restored/missing/degraded capabilities.

**Acceptance:** Another authorized session can reconstruct state and continue safely. Backup is called qualified only after this restore, not after archive creation or a list of files.

### P11 — Exercise the integrated next-state acceptance matrix

**Targets:** Real project command surfaces, a bounded nontrivial work item, and additive acceptance evidence. No new product feature is introduced to manufacture a demo.

Run the scenarios in §6 using the representative tasks selected before changes in P00. Use the actual qualified launcher and supported effect/retrieval/acceptance paths. Include at least one real owned failure/recovery, not only a mocked function test. Service/provider simulation remains explicitly labeled; a stopped optional test endpoint is not a completed host WAN-survival experiment. Review observed operator attention/correction/recovery tradeoffs with the human; Gemini cannot self-certify saved attention.

Preserve ideal-state §7's separate creative workflow: exercise the existing deterministic WORLD path with narration unavailable and confirm state-transition authority remains deterministic, with no WORLD-to-engineering fallback. Use existing fixtures/suites and presentation; do not redesign the creative system or provision Stheno for this check.

Capture commands/actions, source/config/binary pins, exact input scope, result artifact hashes, negative-effect observations, cleanup outcome and independent verification. Report mixed results per scenario. Any failed mandatory outcome returns its owning task to repair; do not issue milestone PASS and put the failure in a footnote.

**Acceptance:** Integrated engineering/retrieval/failure/recovery smoke evidence is reproducible with no unexplained authority/spend/global-write excursion. Collect S1–S10 results; S8's final retirement proof belongs to P12 and S10's final ledger reconciliation to P13. Human-review-dependent judgments remain pending until genuinely reviewed. This task is not an early overall milestone PASS.

### P12 — Retire only what the proven cutover makes unnecessary

**Targets:** Superseded callers/writers/launch artifacts, in-scope generated status documents, current operating instructions and relevant changelog/work evidence. Activate this task only after the P11 smoke evidence exists.

Produce a deletion manifest from actual callers and output ownership. Delete obsolete duplicate writers, unused shims and superseded patch/canary paths once replacement provenance and rollback material are retained outside the active launch path. Remove duplicate current-status declarations from active projections, not historical evidence or human-authored decisions.

Remove from the active milestone: memory canary prerequisites, Meta-Harness/OmniRoute/OMO adoption obligations, a full hardware-profile matrix, TELL/multi-host expansion, automatic optimizer promotion and “zero pending everywhere” completion logic. Where these exist only as proposals, edit the active roadmap disposition rather than pretending software was uninstalled. Preserve useful dormant adapters unless dependency/caller evidence proves they should be removed. Disable optional startup only under explicit owned config scope.

Retain research/creative goals, WORLD boundaries, Pi portability and later offline qualification as separate bounded work, not core dependencies. Reconcile skill LOCAL_DELTA one entry at a time by provenance; never rebuild a lockfile merely to erase warnings. Do not rewrite the entire skills system for this refactor.

Update current docs for the actual launch command, source/derived ownership, evidence statuses, blocked gates, recovery procedure and known limitations. Preserve old receipts and supersession links. Remove throwaway scripts after retaining proof; keep only regression tests that defend a plausible behavioral failure.

**Proof:** Run focused affected consumers and repeat impacted P11 scenarios after deletion. No stale caller/import/generated-output owner remains; archived experiments no longer appear as core readiness requirements. If removing an artifact would lose unique history or recovery material, retain it with an explicit non-active disposition.

### P13 — Finish with independent review and scoped acceptance

**Targets:** Task validation lists, final evidence index, handoff and authorized lifecycle transitions.

Run the final validation ladder in §7 once against the settled integrated state. Have an independent verifier review the implementation and execute the decisive checks. Required verification/acceptance independence is not satisfied by Gemini opening a second self-review section. The requested Gemini implementation binding does not abolish the existing independent-verifier policy; resolve its permitted binding without secretly substituting a different implementer.

Collect human acceptance for the exact next-state milestone and any canonical changes through P05. Produce a concise status table of accepted, blocked and intentionally out-of-scope capabilities. Record known optional limitations and the next safe action. Complete/release claims using the actual lifecycle semantics, without resetting accepted work to READY. Publishing or pushing is a separate expressly authorized action.

**Acceptance:** All required tasks/scenarios and validation requirements have evidence and correct lifecycle state. No self-certification, silent waiver or false offline/benchmark qualification appears in the completion report.

## 6. Target acceptance coverage

These scenario IDs are test-plan labels, not new runtime contracts.

| Scenario | Ideal-state §11 criterion | Exercise and required observation | Owning tasks |
|---|---|---|---|
| S1 | Honest empirical evidence | Missing real adapter is non-measured; explicit simulation cannot promote; invalid evidence fails verification. Before restoring any performance claim, retain at least one actual adapter-bound run with raw output and reproducible provenance; otherwise the claim stays unqualified. | P01, P02, P11 |
| S2 | Qualified project runtime | Actual project command resolves the pinned binary/configuration; exercise ephemeral/no-op/project-isolation behavior, another project/global preservation, bounded stop and reproducible upgrade/rollback procedure. | P03, P09, P11 |
| S3 | Bounded mutation and independent acceptance | Claim → real bounded edit → deterministic verification → independent review → genuine human acceptance. Deny out-of-scope, indirect bypass and post-lease-loss effects; worker success cannot accept work. | P00, P04–P06, P11, P13 |
| S4 | Exact, authorized and epistemically honest retrieval | Optional adapters absent; independently compare every cited span/hash; conflict/supersession, forbidden-source and absent-source cases remain explicit. Separate quotations from synthesis. | P07, P08, P11 |
| S5 | Rebuildable projections | Capture canonical hashes; discard only declared generated data; rebuild and re-query in a disposable copy; canonical bytes/cited identity unchanged and existing integrity gates pass. | P05, P07, P08, P11 |
| S6 | Useful failure and resumability | Exercise a real authorized task under bounded provider failure; no unapproved fallback; fresh session reconstructs work and uncertainty from durable handoff without transcript replay. | P06, P09–P11 |
| S7 | Recoverable owned effects and durable state | Cancellation/partial failure leaves no undeclared managed activity; restore backup to a separate location and verify sources, work state and evidence links, without duplicate effects or changes to the original environment. | P09–P11 |
| S8 | Reduced active complexity | One supported project execution path and one owner per fact/output; retired duplicates have no callers; deferred systems are not core completion dependencies. Preliminary inventory at P11, final proof after P12. | P03, P08, P11, P12 |
| S9 | Operator value | P00's preselected real tasks produce accepted outcomes; operator locates their acceptance evidence and resumes one; human reviews attention/correction/recovery tradeoffs plus observed elapsed time, spend and relevant resource use. No invented savings percentage. | P00, P09–P11, P13 |
| S10 | Correct residual status | Final work ledger, claims and validation scope agree; actual runtime provenance matches; offline autonomy/local qualification/deferred experiments and unresolved human gates stay accurately labeled. Finalize after retirement and acceptance. | P02, P03, P05, P08, P11–P13 |

S6 proves the bounded failures actually exercised, not host-wide disconnected autonomy. The blocked WAN experiment can be resumed later only with its own exact current authorization and rollback gate. Do not make WAN mutation a hidden dependency for completing ordinary refactor tasks.

### Coverage of the rest of the target

- Ideal §§1–4, first-principles goals/critique: preserved in §1 and P00; no new platform prerequisite.
- Ideal §5, deletion: P12's evidence-backed retirement and active-roadmap pruning.
- Ideal §6, simplification: existing owners/contracts in §4, enforced by P03/P06/P08; no parallel authority system.
- Ideal §7, useful workflows: engineering/retrieval/failure/resume covered by P03–P11; creative deterministic-state/narration separation explicitly exercised in P11 without a redesign.
- Ideal §8, operational boundaries and economics: P00 preselects real tasks/tolerances, P06 enforces eligibility/spend, P09 measures normal load/bounded contention, and S9 requires human operator-value review.
- Ideal §9, repair-first transition: P01/P02 precede any affected empirical decision; runtime/retrieval scopes can proceed independently; deletion follows integrated smoke proof.
- Ideal §10, graceful degradation: S4–S7 and P06/P09/P10 preserve exact local operation, restrict dispatch, track partial recovery and block uncertain ownership; unrelated valid work remains available.
- Ideal §11, ten acceptance criteria: S1–S10 reproduce all ten source outcome names with explicit owning tasks and required proof.
- Ideal §12, source register/proposal limits: P00 authority reconciliation, §8 source references and separately blocked offline experiment. The input has no §13.

## 7. Validation and evidence instructions for Gemini

### Per repair

1. Inspect symbols, actual callers and existing test conventions before touching exports. Use LSP references where available; otherwise document the bounded search. Do not import another abstraction merely because a helper name looks convenient.
2. Establish a failing regression for each demonstrated defect in isolated fixtures. Fix source and its affected consumers; run focused tests. Do not run the current probe test against historical evidence before P01 isolation.
3. Execute the changed CLI/runtime path and retain its observed output. Unit results do not prove the compiled launcher, tool mediation, human authorization, process cleanup or restore.
4. Attach additive evidence under the actual admitted work item's `evidence_target`; never overwrite an old acceptance report to make it agree with new code.
5. Record exact scope and limits. `BLOCKED`, `UNKNOWN`, non-measured and explicit refusal are valid truthful outcomes, not runtime PASS.

### Final ladder after integration

Inspect targets for side effects before running. `bin/kad-wiki` currently initializes the vault before read-like commands; P08 must repair that or those checks must use an isolated copy.

- Run the focused changed-module regressions, including compute, leases/workctl, knowledge/context/projections, governance/acceptance and lifecycle boundaries.
- Run `make verify` for constitution/librarian integrity. It is not the entire test surface.
- Run `npm test` for the package-defined KAD/workctl test selection and `make test` for the additional Makefile-defined librarian/workspace/explicit subsystem checks. They overlap; neither name alone proves all local tests were included. Follow the registered task's validation list and keep the executed test inventory.
- Inspect `make test`'s nested `kad-lab` target before execution; do not assume fixture/network behavior is safe from the target name. Required unsafe/unavailable validation remains explicitly blocked, never replaced by a smaller green command without approved scope change.
- Run `bin/workctl doctor`, `bin/kad doctor`, and the now-read-only `bin/kad-wiki lint` on the final intended state. Explain remaining provenance warnings instead of refreshing locks to hide them.
- Run `make test-pi-integration` only if the Pi seam is affected or claimed as qualified. Its source/runtime prerequisite is external to the ordinary suite; missing it is a stated qualification gap. Do not turn an untouched optional worker into a core install requirement.
- Run S1–S10 on the final code/binary/config pins; repeat impacted scenarios after P12 deletion. Perform source/build/runtime review separately from behavioral results.
- Run any additional declared work-contract checks. Independent verification and human acceptance remain required even if every automated command exits zero.

No new comprehensive benchmark corpus, infrastructure inventory, UI dashboard or blanket “all machines” gate is needed. Small targeted adversarial fixtures are required where they defend the changed authority/evidence boundaries.

### Minimal evidence per task

Reuse existing receipt schemas and store a concise index, not a new evidence framework:

- Actual work ID, source fixed point and affected source/configuration hashes.
- RED reproduction and GREEN result, including command/action, exit/result, stdout/stderr artifact reference and fixture scope.
- Real smoke actions and observed artifact/effect/process state; distinguish simulations and live measurements.
- Provenance references for the actual binary, model/provider, route and approved authority; never raw secrets or full private prompts.
- Negative checks for unauthorized effects, historical/canonical preservation and cleanup debt where relevant.
- Independent verifier evidence and exact human decision reference where required.
- Remaining limitations, superseded claim links and the next safe action.

## 8. Decision boundaries, non-goals and source index

### Decisions the implementer must not make autonomously

- Reinterpret/replace accepted constitutional or ADR policy.
- Steal stale claims, impersonate their owner, force canonical acceptance or erase a failed evidence trail.
- Select a different model than the user's requested executor without resolving the mismatch.
- Deploy globally, change global OMP settings, publish/push, install optional services, buy hardware or authorize paid fallback.
- Grant privileges, alter host networking, disclose credentials or convert a test approval into a real human decision.
- Delete human-authored canonical notes, raw evidence, research history or side projects because they are absent from the next milestone.

### Intentionally not built

No ai-memory canary, replacement KnowledgePlane, vector-store requirement, Meta-Harness optimization loop, OmniRoute gateway, OMO control plane, TELL/multi-host fabric, workload matrix for hardware purchasing, new skill framework or generic backup service. Existing optional components remain optional unless demonstrated unsafe or redundant in the active core. Their eventual value remains an experiment, not a refactor acceptance condition.

### Primary planning inputs

1. [Next ideal state](KAD_PI_IDEAL_STATE_NEXT_2026-09-06.md), pinned by SHA-256 in frontmatter.
2. [Latest reconciled current state](KAD_PI_CONSOLIDATED_CURRENT_STATE_2026-09-06_184322Z.md), especially §§7–11; historical runtime claims require fresh observation.
3. [Earlier current state](KAD_PI_CONSOLIDATED_CURRENT_STATE_2026-09-04.md), provenance/history only where not superseded.
4. [Earlier technology synthesis](KAD_PI_IDEAL_STATE_TECHNOLOGY_SYNTHESIS_2026-09-04.md), the superseded near-term expansion proposal, not new authority.

### Authority and implementation anchors

Paths below are relative to `/home/amdy/Work` and were inspected directly or located by deterministic tools:

- `PRIME_DIRECTIVE.md`; `CONTEXT.md`; `docs/adr/0005-deterministic-first-and-epistemic-classification.md`; `docs/adr/0007-synthetic-knowledge-librarian-architecture.md`; `docs/adr/0008-unified-context-knowledge-plane.md`; `docs/adr/0010-obsidian-knowledge-visualization-and-plugin-governance.md`; `docs/adr/0014-generalized-ideal-state-artifact-and-compute-fabric-governance.md`; `docs/adr/0015-unified-skills-role-isa-and-delegated-execution-governance.md`.
- `tools/workspace/workctl.mjs`; `tools/workspace/workflow-bridge.mjs`; `tools/workspace/stc-lease.mjs`; `.agents/workspace/projects.json`; `.agents/work/WP-KAD-PROJECT-CLOSURE-AND-ZERO-PENDING-BASELINE-043.json`; `.agents/work/claims/WP-KAD-PROJECT-CLOSURE-AND-ZERO-PENDING-BASELINE-043.json`; `.agents/work/EXP-KAD-OFFLINE-SURVIVAL-001-R1.json`.
- `bin/omp-kad`; `.omp/config.yml`; `OMP_ROUTING_AUTH_FIX.patch`; `scripts/runtime-canary-suite.mjs`; `bin/omp-patched-canary` (artifact presence is not runtime qualification).
- `tools/kad/compute/probe-runner.mjs`; `tools/kad/compute/confounder.mjs`; `tools/kad/compute/metrics.mjs`; `tools/kad/compute/evidence-recorder.mjs`; `tools/kad/test/compute-probe.test.mjs`; `tools/kad/isa.mjs`.
- `tools/kad/workload-contract.mjs`; `tools/kad/external-providers.mjs`; `tools/kad/economic-router.mjs`; `tools/kad/resource-contract.mjs`; `tools/kad/governance/human-receipt.mjs`; `tools/kad/stc-scope.mjs`; `tools/kad/local-inference-capability.mjs`; `tools/kad/telemetry/control-plane-runtime.mjs`.
- `tools/kad/knowledge-plane.mjs`; `tools/kad/knowledge-plane-adapters.mjs`; `tools/kad/context-compiler.mjs`; `tools/librarian/librarian.mjs`; `tools/kad/wiki-projection.mjs`; `tools/kad/wiki/index.mjs`; `tools/kad/wiki/projection.mjs`; `bin/kad-knowledge`; `bin/kad-wiki`.
- `Makefile`; `package.json`; `tools/workspace/workctl.test.mjs`; `tools/kad/test/stc-lease.test.mjs`; `tools/kad/test/runtime-resource-inspection.test.mjs`; `tools/kad/test/resource-contract.test.mjs`.
- `evidence/WP-KAD-COMPUTE-FABRIC-EXPERIMENTAL-PROBE-021/`; `evidence/WP-KAD-OMP-002/`; `evidence/WP-KAD-OMP-METAHARNESS-REFACTOR-041/`; `evidence/WP-KAD-CANONICAL-STATE-RECONCILIATION-010-R1/`; `vault/00_Governance/CANONICAL_SOURCE_INDEX.md`.

## 9. Copyable implementation handoff

> Implement the plan in `/home/amdy/Downloads/reports/KAD_PI_IMPLEMENTATION_PLAN_NEXT_2026-09-06.md`, targeting the hash-pinned next ideal state. You are the requested Gemini 3.8 Flash High implementer; confirm the exact dispatch identity rather than substituting an existing alias. Start with P00 and current authority/claim inspection. Do not implement under another actor's stale claim. Convert planning labels to real model-neutral work contracts only through the authorized ledger process. Reuse KAD's existing seams; establish isolated RED receipts, fix each scoped source defect, and prove actual CLI/runtime behavior. Do not edit historical evidence, mutate global configuration, enable paid fallback, resume WAN fault injection, publish, or self-accept. Keep unqualified behavior explicit. Complete S1–S10, perform the evidence-backed deletion cutover, obtain independent verification and actual human acceptance, and leave a durable handoff with exact remaining blockers if any required gate cannot be crossed.

**Bottom line:** fix truthfulness and actual boundaries first; prove useful work and recovery next; delete redundant active machinery only after the cutover is observed. More components and more green declarations are not the milestone.
