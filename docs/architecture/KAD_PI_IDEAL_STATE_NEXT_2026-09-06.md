---
artifact_id: KAD-PI-IDEAL-STATE-NEXT-2026-09-06
artifact_kind: DERIVED_DESIGN_PROPOSAL
status: PROPOSED_NOT_CANONICAL
created_date: 2026-09-06
primary_project: KAD-PI
scope: Next operational target, not the entire long-term destination
canonical_promotion: NOT_PERFORMED
implementation_status: NOT_IMPLEMENTED_BY_THIS_REVIEW
---

# KAD-PI — Next Ideal State: A Dependable Single-Node Engineering and Research Workstation

## 1. Decision in brief

**Build less system; close the loop on useful work.** The next state should let the operator complete bounded engineering work, recover cited knowledge, and resume safely after failure on one workstation—without first operating a memory platform, a distributed compute fabric, or an optimization laboratory.

The earlier ideal is substantially right about authority boundaries and wrong about how much machinery must exist before the system is useful. Its most consequential weakness is turning plausible integrations into prerequisites for completion. The current-state artifacts instead show a nearer problem: declarations, evidence, deployed software, and generated summaries do not consistently agree. [C06 §§7–14; I04 §§9, 12.6]

The next target is therefore:

1. **One dependable operator path:** project-scoped OMP, bounded by existing KAD work and execution contracts, with a verified runtime identity.
2. **One exact knowledge path:** existing canonical sources and the deterministic Librarian, with trustworthy citations and rebuildable optional views.
3. **One accountable completion path:** independent acceptance based on observed behavior and attributable evidence, not run success or confident prose.
4. **A useful degraded mode:** local inspection, exact retrieval, verification where dependencies are available, and durable handoff remain possible without WAN or optional models. Full-core autonomous offline operation remains a separate, unfulfilled target.

**No new external platform is required for this next state.** No hardware purchase, second host, semantic-memory adoption, optimizer, or alternative orchestrator is a completion dependency.

This is a recommended next target, not an accepted ADR, a work claim, an implementation authorization, or a claim that the target has been reached. Existing constitution, accepted decisions, leases, and gates remain binding. Deletion below means proposed removal from the active design or a bounded future implementation change; this review deletes no source, model, evidence, service, or historical artifact.

## 2. First principles: what the system is for

### The end, rather than the machinery

KAD-PI exists to increase the operator's engineering/research capability while preserving understanding, epistemic trust, and control. It is a personal system with a small trusted collaborator ring—not a multi-tenant service. It also supports creative research and a distinctive personal interface. None of those goals requires every possible subsystem to participate in every task. [C04 §5; C06 §§5, 12]

The practical unit of value is **a useful, accepted result whose basis the operator can reconstruct**. Examples are a correct code change, a source-grounded research answer, a recoverable paused task, or a deterministic world transition with optional narration. Counts of agents, tokens, roles, tests, workpackages, or installed technologies are not substitutes.

A useful decision rule is:

> Prefer the smallest mechanism that improves accepted useful work or answers a bounded research question, after counting operator attention, verification, recovery, privacy, resource use, and maintenance—not just inference price.

This is a design criterion, not a measured benefit or a new optimization engine. A research experiment can be worthwhile even when its result is negative; a research question does not automatically justify a permanent service.

### Goals preserved through simplification

| Durable goal | Next-state expression | What remains beyond this increment |
|---|---|---|
| Personal cognitive leverage and comprehensibility | Bounded work, cited answers, visible exceptions, resumable state | Broader autonomous delegation only after demonstrated reliability |
| Human authority and risk-tiered autonomy | Reuse existing claims, policy, trust domains, and independent acceptance | No new universal approval ceremony; existing higher-risk gates still apply |
| Local sovereignty and collaborator portability | Local sources, ledger, evidence, pinned runtime/configuration, and a reproducible handoff | Second-host operation and wider worker portability |
| Full-core autonomous offline capability | Prove useful deterministic continuity first and report unavailable cognition honestly | Qualification of a local engineering/controller capability and separately authorized whole-host outage testing |
| Governed research and downward distillation | Preserve primary sources and candidate lessons; keep execution separate from learning | Specialist training, automated optimizer loops, and larger research campaigns |
| Creative WORLD and the personal interface | Keep deterministic world authority, optional WORLD-only narration, existing visual identity and silent UI | No dashboard, theme, or creative-project dependency on core reliability completion |
| Protected attention and small-team collaboration | One active mutation owner per conflicting scope; focused context and explicit handoff | Additional workers when independent work and measured benefit warrant them |

The reports disagree on the meanings attached to several `DEC_ID_*` identifiers. This table preserves the substantive goals; it deliberately does not create a new canonical numbering scheme. Resolve historical intent identities against their original decision records before any canonical promotion. [C04 lines 184–213 versus C06 lines 187–214]

## 3. Evidence corrections before architectural conclusions

This review directly read the supplied reports and selected local authority/source files. It did not repeat the workstation audit, rerun the historical suites, query providers, or establish current endpoint health. Runtime statements below are **reported at the September 6 snapshot cutoff**, not newly observed live state. Direct source inspection establishes file content, not deployment or end-to-end conformance.

| Issue | Evidence and correction | Consequence for the next target |
|---|---|---|
| The earlier ideal changes constitutional vocabulary | I04 line 6 and §3 call PON “Proof of Need” and STC “Smallest Testable Change.” `PRIME_DIRECTIVE.md` §§3–4 defines **Notification-Oriented Paradigm** and **Spatiotemporal Composability**. | Retain proof-of-need and small-change discipline as ordinary engineering heuristics, not substitute definitions. PON selectivity and STC effect/dependency ownership still require behavioral proof. |
| Canary success is presented too close to operational closure | C06 §8 distinguishes the stock active OMP binary from the isolated patched canary; I04 §12.6 requires deployment. | Prove the chosen project launch path and its actual process behavior. Neither blindly downgrade to the old canary nor assume a newer stock version includes the fix. |
| Detailed receipts did not prevent synthetic measurements | C06's executive summary and §14 report benchmark provenance failure. Direct source inspection confirms `probe-runner.mjs` uses a simulator when no adapter is supplied and later sets `status: 'MEASURED'`. | Remove the implicit simulation-to-measurement path before using this evidence for routing, capacity, or purchasing. A hash chain preserves bytes, not the truth of their claims. |
| “The KnowledgePlane is missing” is too broad | I04 §2.4 calls a contract/wiki vertical missing. C04 §10 describes hashing, allowlisting, exact lookup and promotion controls; C06 §7 records accepted wiki/reconciliation work. Local reconciliation evidence records a completed migration. | Exercise the existing vertical and identify the precise failing contract. Repair that seam; do not rebuild an entire plane because an older narrative says it is absent. |
| “ai-memory rejected” is not established by the cited ADR | C06 §13 says rejected, citing ADR 0008; I04 proposes a canary. The inspected ADR 0008 does not mention ai-memory or reject that product. | Classify as **no adoption justified for this increment**, not an established permanent rejection. No upstream capability or license was re-audited here. |
| Two meanings of “Meta-Harness” are conflated | C06 §13 associates it with WP-041 refactoring; I04 §4.1 discusses an external offline optimization method. | Do not infer that the external research system was implemented because an internal refactor has a similar name. |
| Configuration flags are overextended into security assurance | C06 §11 infers broad secret exclusion from settings; C04 §11 warns filesystem containment is partially advisory. C06 §9 also pairs `NO_ELIGIBLE_LANE` with a fallback narrative. | A flag is not an absence-of-leaks proof, a lease is not an OS sandbox, and a fallback description is not an authorization receipt. Test each relevant boundary at the actual effect/dispatch point. |
| Milestone arithmetic is mistaken for readiness | C06 §14 calls 40/42 accepted “95% complete”; its matrix also says “7 tests,” while §7 lists seven commands executing multiple tests. | Report exact work state and verification scope. Do not infer system completeness from a percentage or conflate command count, test count, and exercised behavior. |
| Static authority indexes contain volatile state | The inspected canonical source index embeds old Git heads and lists Voyager where both reports list ReAct in the five-paper corpus. | Keep source ownership in the index; resolve current revisions and corpus membership from their actual owners. Approved metadata is not immunity from staleness. |

**Evidence precedence is claim-specific, not merely newest-document-wins.** A later process observation can supersede an earlier process observation. A later summary cannot silently rename human decisions, amend an ADR, or promote a hypothesis.

## 4. What is unnecessary or based on weak assumptions?

### 4.1 Technology-first sequencing

“Complete the contract, then canary ai-memory” assumes the memory adapter is the next source of value. The supplied ideal does not establish a KAD task that exact retrieval fails and the proposed adapter fixes. Starting with FTS and disabling auto-improvement is a valid way to bound a future experiment; it is not a reason the experiment must happen. [I04 §§2.4, 4.3, 9]

**Change:** begin with a real retrieval failure. Determine whether the cause is a missing source, bad identity, stale projection, permission filtering, query ergonomics, or ranking. Better ranking cannot recover evidence that was never collected. Add semantic retrieval only if the ranking failure survives cheaper corrections.

### 4.2 Generalized contracts before concrete gaps

I04 §7 proposes five new versioned envelopes/adapters. Existing ADR 0015 already names `KAD_WORKLOAD_V1` and `kad-execution-run-receipt-v1`, separates work from run state, and defines provider classes. Another common receipt can create a translation burden and two definitions of completion.

**Change:** reuse the existing contracts. Extend only fields needed by an observed boundary failure, under the normal schema/ADR process. Keep clear module seams without building a universal plugin framework or RPC layer for one implementation. The number of logical responsibilities does not prescribe a process count.

### 4.3 Optionality that does not reduce completion obligations

The earlier definition of done requires an ai-memory canary, multiple new contracts, and a Meta-Harness laboratory despite describing additions as optional. Each component brings setup, privacy, lifecycle, resource, recovery, and upgrade obligations. Being removable after installation is weaker than being unnecessary to install. [I04 §12.6]

**Change:** optional integrations disappear from the next-state definition of done. Their research notes remain reference material; no automatic workpackage chain remains active.

### 4.4 Free/local-first mistaken for cheapest useful execution

Zero marginal invoice cost does not imply low total cost. A local model that fails the task consumes attention and verification; remote service can violate a data boundary even when included in a subscription. Local and remote permission are not interchangeable. [C04 §§5, 9–10; ADR 0014]

**Change:** apply trust, capability, and spending eligibility first; prefer deterministic execution when sufficient; select among qualified allowed routes. An unavailable local model does not authorize a new remote destination, a different trust domain, or additional spend. Keep existing economic policy; simplify its operational surface rather than adding another router.

### 4.5 Scientific rigor mistaken for infrastructure volume

A universal metric suite, hardware matrix, counterfactual stream, and multi-agent review on every ordinary task would make the operator manage the measurement system. Conversely, deleting security tests because the system is personal would be false economy. Visibility, redaction, cancellation, config isolation, and promotion are different failure modes, not duplicates merely because they all concern safety. [I04 §§10–11; C04 §10]

**Change:** retain tests protecting distinct observable contracts. For a bounded experiment, collect the smallest measurements that decide its question; use the existing research tiers and required review gates. Consolidate repeated execution/reporting of the same check, not distinct invariants. Never weaken an accepted gate to make the reduced design pass.

### 4.6 Offline success mistaken for either “nothing works” or “full autonomy”

The current blocked experiment proves neither loss of all useful local operation nor full autonomous survival. A controller outage, an unavailable inference endpoint, and host-wide WAN loss are different conditions. [C06 §11.2]

**Change:** prove them separately, starting with isolated failure scenarios. Preserve the long-term full-core offline goal explicitly. A model that can narrate WORLD is not thereby qualified to plan code changes or authorize recovery.

## 5. Delete, defer, or keep

### Delete entirely from the active next-state design

| Removal | Why it can disappear | Replacement or preservation boundary |
|---|---|---|
| The mandatory ai-memory → memory A/B → optimizer/gateway roadmap | Technology selection precedes a demonstrated problem | A new experiment requires a concrete failing task, a bounded question, and a removal condition |
| The five new I04 contract families as a mandatory implementation bundle | They overlap existing workload, run-receipt and knowledge responsibilities | Use existing contracts; add only a demonstrated missing semantic field or operation |
| A second orchestration or work-authority layer | It cannot improve authority clarity by duplicating `workctl` | OMP run state stays transient; derived task views stay read-only |
| Always-on capture/consolidation, broad session ingestion, and autonomous doctrine mutation as default requirements | They create privacy, storage and promotion problems before proving recall benefit | Explicitly scoped source/lesson capture through existing governed paths; automatic learning remains disabled |
| Routine product-mining, harness bake-offs, and autonomous optimization jobs without a decision to resolve | Research activity becomes a standing maintenance obligation | Keep references in the archive; reopen only for a specific question |
| “Zero pending,” raw token throughput, fixed test totals, and accepted-WP percentage as readiness objectives | They reward closure theater or activity rather than trustworthy useful behavior | The observable acceptance matrix in §11 |
| Copied current Git heads, model availability, provider defaults and test totals across hand-maintained status pages | Multiple writers to the same fact produce drift | Resolve from the owning ledger/config/receipt; date frozen snapshots clearly |
| Detailed hardware shopping bands and a universal 25% RAM rule as acceptance criteria | They are heuristics, not measured requirements for this workload | Measure the retained workload and contention; choose limits before qualification and label provisional values |
| Whole-portfolio reconstruction as a prerequisite for each task or release | It repeatedly loads unrelated history and expands audit scope | Load the affected project's current source, authority and evidence; disclose lineage when relevant |

These removals change this proposal's target, not historical decisions. Where adoption would revoke an accepted experimental commitment—particularly ADR 0008's experimental dependencies or ADR 0015's planned provider positions—record a scoped decision change first. Deferring its execution is not rewriting its historical status.

### Concrete implementation deletion candidates—not performed here

- **Implicit benchmark simulation in the empirical runner:** remove the fallback from the production measurement path. If a simulator is needed by tests, keep it explicitly injected in test fixtures and ineligible for empirical promotion. Unknown adapter/measurement means unavailable or invalid, not fabricated quality, resource, or acceptance metrics. Preserve old receipts and append corrections linked to them. [Direct source: `tools/kad/compute/probe-runner.mjs`, lines 32–46, 76–87]
- **Duplicate active skill-discovery paths:** C06 §6.2 reports 37 shadowing collisions. Remove legacy directories from active discovery/context once references and ownership are checked; preserve unique historical content. Do not merge the governance and installer lockfiles merely because both are named locks—they describe different ownership. Delete physical duplicates only after confirming byte/content equivalence and absence of consumers.
- **Redundant status writers and projections:** retire manually maintained “current” copies. A projection used by no operator or task can be removed after dependency inspection; a used projection stays derived. Neither vault nor evidence gets deleted because a wiki or dashboard is dispensable.
- **Obsolete patch deployment branches:** after a project runtime with the fix is qualified, keep one supported project launch path. Remove obsolete runtime machinery only after upgrade/rollback evidence and the required historical artifact have been preserved. Do not replace the machine-wide binary as a shortcut.

This review has not performed a repository-wide caller inventory. These are grounded deletion targets, not a fabricated file-by-file safe-removal manifest. Future edits must inspect consumers and affected gates before deletion.

### Defer rather than delete the goal

| Deferred investment | Re-entry condition |
|---|---|
| ai-memory, semantic OpenViking expansion, graph-heavy memory | A retained, authorized retrieval task fails the exact baseline; a bounded candidate improves that query class with correct citations, privacy, and acceptable recovery cost |
| Meta-Harness optimization and broad harness comparison | A recurring harness failure/cost is isolated, manual correction is insufficient, and independent evaluation can distinguish improvement from overfitting |
| OmniRoute service | Direct transports demonstrably fail a required capability that a narrower fix cannot meet, and the gateway can conform without extra authority or unjustified resource cost |
| Warren, Beads, Pi expansion, additional worker runtimes | A concrete isolation, portability or independent-work need exceeds the existing executor; existing acceptance authority remains unchanged |
| TELL, distributed scheduling, hardware expansion | A retained workload cannot meet an explicit quality/latency/resource requirement on AMDY after simpler operating changes; actual host availability and operating cost are established |
| Local engineering/controller autonomy, LoRA/QLoRA, training | Correct model identity, allowed data, task-specific quality, abstention, containment and resource limits are empirically qualified |
| Whole-host WAN-disconnect experiment | Lower-risk tests pass and the human separately authorizes exact live scope and recovery arrangements at the point of risk |

No deferred item is a scheduled promise. A null experiment result can close a question without producing an integration.

### Keep because it carries real weight

Keep the constitution; PON causal selectivity; STC ownership and tracked effects; work/run separation; deterministic-first policy; local sources and evidence; exact Librarian; independent acceptance; scope/credential/spending enforcement; meaningful regression tests; failure visibility; recovery; human control of knowledge promotion. Preserve the frozen role ISA and existing required advisory gates unless formally revised. Fifteen roles are a capability vocabulary, not a requirement for fifteen processes or simultaneous model residency.

Keep existing creative/interface assets and working optional adapters where they are actually useful. Removing them from the critical path is not a judgment that their human value is zero.

## 6. Simplified target architecture

### One loop, existing owners

**Human intent → bounded work claim → authorized execution → candidate result and evidence → independent acceptance → durable handoff/knowledge proposal.**

This is a sequence of responsibilities, not a proposal for new services. Reuse the current KAD tools and contracts rather than introducing a new “kernel” implementation to satisfy this diagram in words.

| Responsibility | Existing owner / source | Smallest next-state requirement |
|---|---|---|
| Intent, scope and work lifecycle | Human authority; `workctl`; accepted KAD contracts | Each mutation is attributable to the authorized scope; a completed run cannot accept its own work |
| Run execution and working context | Project OMP launch path; existing executor facilities | Known binary/configuration; bounded children; visible actual route; cancellation; no unintended global writes |
| Route eligibility | KAD policy and current provider adapters | Exact allowed destination, capability, data class and spend; no new gateway; unavailable means reduced capability |
| Knowledge access | Canonical source ownership plus deterministic Librarian | Return authorized source spans and revision/hash, distinguish exact text from inference, expose conflicts or absence |
| Verification and acceptance | Existing deterministic verifiers plus required independent/human review | Evidence matches the behavior claimed; scope-specific gates remain enforceable |
| Durability and recovery | Work ledger, source repository, evidence store, existing handoff | Restart/replay can explain what was changed and what remains; backup restore is demonstrated |
| Optional presentation/research/WORLD | Existing bounded adapters and side projects | They can be absent without disabling the core; their own authority and qualification limits remain explicit |

### One owner per kind of truth—not one giant database

- Human decisions and accepted policy define what is authorized.
- The work ledger defines work state and ownership.
- Versioned source/configuration defines intended implementation; a process observation establishes what ran.
- Source artifacts and attributable observations support knowledge claims.
- Execution receipts describe runs, not acceptance; acceptance is its own controlled transition.
- Wiki, dashboard, indexes, summaries and context packs are derived views.

Do not collapse these into a universal memory store or rewrite all schemas into a common vocabulary. Use references between existing records. Retain timestamps and epistemic distinctions where they change interpretation; do not require every trivial lookup to emit a new full-size resource envelope.

### Narrow notification and lifecycle semantics

Use the existing change/event seams to invalidate affected context and reconcile affected capabilities. Keep PON causal relations distinct from STC capability/dependency relations. Avoid creating a new event bus simply to label the system PON-compliant.

Each effectful run declares dependencies and tracks owned processes, files and other effects. Recover managed effects within the controlled boundary; classify irreversible or external effects honestly. Compensation is not rollback, and a worktree is not a security sandbox. A failed optional model removes that capability, not the operator's access to sources or unrelated work.

## 7. Useful workflows the next state must demonstrate

These are proposed observable outcomes, not new canonical schema identifiers. Existing validators may support them but their names or green statuses alone do not establish completion.

### Engineering

Starting from an authorized work item, the operator launches the qualified project runtime, executes a bounded change, observes the relevant verification, and receives a candidate with source/runtime identity and evidence. Independent acceptance remains separate. An attempted write outside the granted scope is denied at the relevant enforcement boundary, including indirect tool/subprocess paths in the exercised scenario.

For the known persistence seam: ephemeral model changes and value-neutral assignments preserve configuration bytes; an explicitly authorized project assignment changes only that project; another project and the global configuration remain unchanged. Test the binary actually selected by the project launcher, not only an isolated patch build.

### Research and retrieval

A concrete project question returns exact cited source material and clearly separated synthesis. A conflicting or superseded source is identified rather than silently replaced. A forbidden source is not returned. An absent source yields an explicit unsupported/unknown result. Short research extracts are not represented as complete papers or as proof that their claims transfer to KAD.

With optional knowledge services absent, the same authorized exact-source path remains usable. If a projection is rebuilt, source bytes and authority are preserved. Repair the existing path if this fails; adoption of a particular backend is not the outcome.

### Pause, failure and return

When an allowed provider fails, the run either uses an explicitly eligible bounded alternative or stops cognition while preserving a durable handoff. A fresh session can identify the work scope, owned effects, verification already performed, remaining uncertainty and next authorized action without replaying the entire transcript.

Local read/verify/handoff operation remains useful when no model is available, but the system does not claim autonomous engineering. Stop/cancellation leaves no undeclared managed child process or write activity. Lost ownership blocks further mutation; unrelated authorized read-only work can continue.

### Creative use remains a separate valid path

The deterministic world engine owns state transitions; model narration remains untrusted presentation. A WORLD model outage may remove narration, not justify routing it into engineering or promoting its output to world truth. Existing aesthetic choices need not be redesigned to prove the engineering loop.

## 8. Operational boundaries and economics

**Single-node is an operating target, not permanent architectural lock-in.** Use AMDY first; TELL is not required to accept work or recover knowledge. Run local models on demand under their existing STC owner. Preserve model identity and qualification separately from byte presence and endpoint reachability.

Begin with one active mutation run per conflicting scope. Additional non-conflicting workers remain possible under existing policy; increase local model concurrency only after observing headroom under the real workload. Do not convert a fifteen-role specification into fifteen resident models.

Select a small representative set of real engineering/retrieval/handoff tasks before implementation changes. Reuse their ordinary receipts to compare:

- accepted outcome and correctness;
- operator intervention/active time and ability to explain the result;
- elapsed time and recovery effort;
- marginal spend and peak RAM/VRAM when relevant to the decision.

Record the selection, environment and limitations. A small sample supports an operational decision, not a population-wide efficiency claim. Do not add a telemetry service merely to obtain these measurements. A proposed improvement that saves model tokens but adds operator correction is not automatically beneficial.

For workload qualification, declare a latency/interaction tolerance and resource limits before the run, then observe normal load and bounded contention. Reject silent OOM, uncontrolled swapping, lost evidence, or unbounded children. The old 25% headroom target may be a provisional heuristic, but it cannot replace workload evidence or silently become a universal requirement.

Credentials, private research and raw session text stay within their authorized data classes. Unknown eligibility produces no dispatch. Unknown quota alone must not be translated into a newly authorized route; its handling follows the current policy. No provider trial, new paid spend, purchase, publication, or host-level network mutation is authorized by this report.

## 9. Transition sequence: repair before expansion

These are outcome groups for the existing work ledger, not newly minted or claimed workpackage IDs. Check current ownership before edits; this proposal does not close WP-043 or unblock EXP-001.

| Order | Bounded work | Completion evidence |
|---|---|---|
| 1. Repair evidence semantics | Remove implicit simulated measurement from the empirical path; append corrections and identify only dependent routing/capacity claims; reconcile misleading status wording and intent references | Missing real adapter cannot emit empirical success; original receipts remain recoverable; dependent claims are corrected or held, not silently relabeled as measured |
| 2. Qualify the actual operator path | Choose one project runtime whose source/binary and config are known; verify scope persistence, neutral writes, stop/children and upgrade replay | Receipts from the actual project launch path; isolated regression scenarios; explicit supported pin and recovery path |
| 3. Complete the existing useful vertical | Exercise engineering, exact retrieval, conflicting/forbidden/absent sources, acceptance and handoff; fix concrete gaps in existing contracts | Successful §7 scenarios and denial evidence, with exact source/runtime identity; no new memory service required |
| 4. Prove degraded operation and recovery | Isolate provider/optional-service loss; verify handoff and useful local mode; restore canonical material and work state into a disposable destination | Explicit tested failure boundary, no unapproved fallback/effects, readable restored evidence and sources; original environment unchanged |
| 5. Retire active duplication and accept the increment | Remove obsolete discovery/status/runtime paths after consumer checks; regenerate only needed views; independently review the acceptance matrix | One supported operator path, no duplicate active authority, traceable final state and explicit remaining blocked/unqualified targets |

Order 1 must precede any decision using the affected benchmark evidence. Runtime and retrieval repairs can proceed independently only when scopes and contracts do not overlap; end-to-end acceptance follows their integration. Whole-host outage qualification does not block this increment and remains separately governed.

**Next implementation starting point:** the empirical runner's implicit fallback and its dependent claims. It is a concrete source-level trust defect, not a reason to build a general provenance platform. In parallel work, a separately owned runtime qualification slice can address the deployment gap without editing the same contracts.

## 10. Graceful degradation

| Failure | Useful behavior retained | Required restriction |
|---|---|---|
| Remote provider, WAN or quota unavailable | Source inspection, exact local retrieval, installed deterministic checks, saved handoff | Cognition stops unless an already-authorized and qualified route remains; no new spend, provider, or trust domain |
| Local retrieval/engineering model unavailable or unqualified | Deterministic retrieval and other independently eligible capabilities | File presence is not qualification; WORLD-only Stheno does not become an engineering fallback |
| Semantic index, Zotero or optional memory adapter unavailable | Exact canonical-source access and authorized file exports | Mark unavailable/stale; do not return an empty success or imply semantic recall was exercised |
| Dashboard, wiki projection or desktop plugin absent | CLI, standard Markdown, ledger and source/evidence access | Presentation cannot be an acceptance or recovery dependency |
| STC activation or run cancellation fails partway | Tracked recovery plus explicit partial/failed receipt | No rollback claim beyond controlled effects; no undeclared surviving writer |
| Evidence provenance invalid or source contradiction unresolved | Unaffected claims/work remain usable | Quarantine the dependent claim/promotion, not the entire project; retain original evidence and correction links |
| Ledger integrity or mutation ownership uncertain | Inspection and recovery planning | No further mutation/acceptance until the relevant authority is restored |
| Resource pressure | Queue/reduce optional work, preserve operator control and evidence | No unbounded retries, hidden child spawning, or undeclared scope expansion |

An isolated provider-denial test proves provider-denial behavior. A process without network access proves only its isolated boundary. Neither is advertised as a host-wide outage drill or full-core autonomous offline qualification.

## 11. Acceptance matrix: when this next state is actually done

Every row below must have evidence appropriate to its claim. A documentation lint pass verifies document structure, not these outcomes. Keep failures and unknowns visible; no overall completion verdict while a required row is unsupported.

| Outcome | Required demonstration | Insufficient substitute |
|---|---|---|
| Honest empirical evidence | No execution adapter produces unavailable/invalid, not `MEASURED`; explicit simulation is excluded from promotion; at least one real adapter-bound run has raw output and reproducible provenance before any performance claim is restored | Schema-valid or hash-chained invented metrics |
| Qualified project runtime | Actual launcher resolves the qualified binary/config; ephemeral/no-op/project-isolation behavior and bounded stop are exercised; upgrade replay is documented | Tests passing on a different binary; version string alone |
| Bounded mutation and independent acceptance | Denied out-of-scope attempt; valid scoped work completes; a worker's “success” cannot accept work; loss of ownership prevents subsequent writes | A lease in a prompt, worktree creation, or a green run flag |
| Exact, authorized and epistemically honest retrieval | Exact citation checked against source revision; conflict/supersession, forbidden-source and absent-source cases; optional retrieval services absent | Plausible prose, nonempty search output, or embedding similarity |
| Rebuildable projections | Rebuild in a disposable copy retains canonical bytes and cited source identity; existing integrity gates pass | A new index exists |
| Useful failure and resumability | Exercise a real authorized task under bounded provider failure; observe no unapproved fallback; fresh session recovers work and uncertainty from durable state | Syntax validation of a fault harness; replaying the entire transcript |
| Recoverable owned effects and durable state | Cancellation/partial failure leaves no undeclared managed activity; backup restored to a separate location preserves sources, work state and evidence links | A cleanup function, backup filename, or unverifiable rollback claim |
| Reduced active complexity | One supported project execution path and one owner per fact; retired duplicates have no remaining consumers; deferred systems are absent from completion dependencies | A new facade hiding the same duplicate writers |
| Operator value | The preselected real tasks produce accepted results; the operator can locate why they were accepted and resume one; observed attention/correction tradeoffs are reviewed | Agent self-rating, token speed, WP counts, or an arbitrary efficiency percentage |
| Correct residual status | Work ledger, release claims and verification scope agree; full offline autonomy, local qualification and deferred experiments remain accurately labeled | Closing or archiving blocked work to manufacture “zero pending” |

Use the repository's existing verifier entrypoints and applicable behavioral suites after authorized implementation. The inspected `package.json` defines the KAD/workspace test command; the snapshot describes additional librarian, WORLD and constitution checks. Select the actual affected gates rather than assuming one aggregate count covers everything. New regressions should defend real failure modes; optional integrations need their conformance suites only if they are actually introduced.

Safety properties are hard constraints. The operator-value judgment remains human; a model cannot certify that it saved attention. This review does not claim an independent formal five-advisor acceptance process or any implementation test pass.

## 12. Source register, proposal status and review limits

### Primary supplied artifacts

- **[C06]** [Reconciled current state, September 6](KAD_PI_CONSOLIDATED_CURRENT_STATE_2026-09-06_184322Z.md). Primary documentary baseline for reported local state at `2026-09-06T18:43:22Z`. SHA-256: `df716af489e450900de0ae1d8dfad41ea4a8a4369f21d7b9192ff463a0c29c12`.
- **[C04]** [Earlier consolidated current state, September 4](KAD_PI_CONSOLIDATED_CURRENT_STATE_2026-09-04.md). Retained for human intent, research goals, lineage and caveats; its older runtime assertions do not override C06. SHA-256: `2955b356aad25da73993ac84510e67b9946eea8a4381419b4c2d2693e67f5ffd`.
- **[I04]** [Earlier ideal-state technology synthesis](KAD_PI_IDEAL_STATE_TECHNOLOGY_SYNTHESIS_2026-09-04.md). Proposal being challenged, particularly §§2.4, 3, 7, 9–12. SHA-256: `c30287cf713e5c78ce37947f57d976524ca309238f84c2de77a16accacba9743`.

### Local authority and source checks

The following files were read to avoid treating a derived report as constitutional or implementation authority:

- [PRIME_DIRECTIVE.md](../../Work/PRIME_DIRECTIVE.md), especially §§1, 3–8: correct PON/STC definitions, claim classification, managed-effect boundaries, deterministic-first execution and evidence. SHA-256: `fe02ae3f26da3c542df37bb811d5454e71ff3cda76c36511fe924698a22ccba1`.
- [ADR 0007](../../Work/docs/adr/0007-synthetic-knowledge-librarian-architecture.md), [ADR 0008](../../Work/docs/adr/0008-unified-context-knowledge-plane.md) and [ADR 0010](../../Work/docs/adr/0010-obsidian-knowledge-visualization-and-plugin-governance.md): historical Librarian architecture, canonical/derived knowledge boundary, experimental dependency commitments and zero-plugin operation.
- [ADR 0014](../../Work/docs/adr/0014-generalized-ideal-state-artifact-and-compute-fabric-governance.md) and [ADR 0015](../../Work/docs/adr/0015-unified-skills-role-isa-and-delegated-execution-governance.md): canonical ISA/economic governance, existing workload and receipt contracts, work/run separation and governed learning.
- [Reconciliation final evidence](../../Work/evidence/WP-KAD-CANONICAL-STATE-RECONCILIATION-010-R1/20-final-validation.md) and [decision record](../../Work/evidence/WP-KAD-CANONICAL-STATE-RECONCILIATION-010-R1/16-ask-user-decisions.md): historical migration/acceptance evidence and preservation of predecessor/side-project boundaries. Their test totals and Git state remain historical.
- [Canonical source index](../../Work/vault/00_Governance/CANONICAL_SOURCE_INDEX.md): source-ownership intent and directly inspected stale/contradictory metadata.
- [Empirical probe runner](../../Work/tools/kad/compute/probe-runner.mjs): directly inspected implicit simulator and unconditional measurement status.
- [Existing ISA validator](../../Work/tools/kad/isa.mjs), `lintIsa`, and [package scripts](../../Work/package.json): existing executable gate definitions were inspected, not run as proof of this proposed target.

### How to use this artifact

Use this as the replacement **planning recommendation** for the next increment. It does not supersede accepted canonical targets or erase the earlier reports. Before canonical adoption, reconcile disputed intent IDs, record any scoped ADR changes, and use the existing KAD promotion process. No new canonical ISA validator, contract namespace or workpackage ID is invented here.

All proposed design choices are recommendations; expected efficiency gains remain hypotheses. Current-state claims retain their source and time boundary. External technology behavior was not re-researched, so no decision here relies on fresh vendor benchmarks, licensing claims or service availability.

**Final recommendation:** make the existing trusted loop real, observable and recoverable before adding another layer. The next milestone is not “the ideal ecosystem is installed.” It is “I can finish useful work, inspect why it is trustworthy, and continue safely when the optional parts disappear.”
