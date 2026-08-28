# PRIME DIRECTIVE

> **React only to relevant change; declare what every component requires; track and recover what every component changes; prove behavior before trusting implementation; reduce capability safely when assumptions fail; and preserve enough evidence to reconstruct every consequential decision.**

`NOTIFY, DON'T POLL.`  
`DECLARE, DON'T REACH.`  
`TRACK, DON'T ASSUME CLEANUP.`  
`TEST, DON'T CLAIM.`  
`DEGRADE, DON'T ESCALATE AUTHORITY.`  
`RECORD, DON'T GUESS.`  

## 1. Purpose and Epistemic Status
This is the normative constitution for the Pi/KAD-PON/STC experimental harness.
Every important statement is classified by its epistemic status to explain *why* we believe it, while normative keywords (`MUST`, `SHOULD`, `MUST NOT`) govern *how strongly* it must be obeyed.

* `[SOURCE_DERIVED]`: Supported directly by PON/STC literature.
* `[DESIGN_DECISION]`: Accepted architecture for this project.
* `[HYPOTHESIS]`: Expected benefit not yet experimentally demonstrated.
* `[EXPERIMENT]`: Temporary mechanism introduced to test a hypothesis.
* `[OBSERVED]`: Measured behavior from actual implementation/evidence.

We `MUST NOT` silently promote `[HYPOTHESIS]` → `[FACT]` or a research idea to an architectural requirement. Scientific honesty is a prime directive.

## 2. Core Vocabulary
* **Notification**: A punctual signal that relevant state has changed.
* **State**: Factual-executional properties of a Fact Base Element.
* **Rule**: Logical-causal knowledge governing when an action occurs.
* **Effect**: A context-mediated mutation attributable to an owner. An effect claimed as managed/revertible `MUST` provide a valid inverse.
* **Coeffect (Dependency)**: What a component requires from its environment.
* **Context**: The runtime mediator of effects and coeffects.
* **Component**: The definition of dependencies, provided capabilities, and effectful activation.
* **Fiber**: An instantiated, scoped runtime instance of a component.
* **Capability**: A defined service/contract provided by a component.
* **WorkPackage**: A bounded unit of scoped execution.
* **Evidence**: Durable, attributable observations or artifacts from which claims and postconditions can be established.

## 3. PON Directives (Notification-Oriented Paradigm)
*Governs: Why and when something reacts.*

* **[DESIGN_DECISION]** Relevant state change `MUST` drive notification.
* **[DESIGN_DECISION]** Components `SHOULD` prefer direct notification over polling when dependencies are known.
* **[SOURCE_DERIVED]** Evaluation `MUST` apply only to affected causal dependencies.
* **[DESIGN_DECISION]** Causal relationships `MUST` be explicit and traceable.
* **[SOURCE_DERIVED]** A notification-driven system is not automatically deterministic. Ordering, idempotence, duplicate suppression, concurrency, retries, races, and cancellation `MUST` be governed by explicit policy.
* **[HYPOTHESIS]** PON efficiency and performance benefits will improve the harness.

## 4. STC Directives (Spatiotemporal Composability)
*Governs: What a component depends on (Spatial) and what it changes (Temporal).*

* **[DESIGN_DECISION]** Components `MUST` declare required dependencies and provided capabilities. Unnecessary ambient authority `MUST NOT` be used.
* **[DESIGN_DECISION]** Dependency changes `MUST` be handled reactively. Dependency identity and scope `MUST` remain observable.
* **[SOURCE_DERIVED]** Dependencies `MUST` activate before dependents. Dependents `MUST` deactivate before dependencies.
* **[DESIGN_DECISION]** Every effect claimed as managed/revertible `MUST` provide and register its inverse when applied. An irreversible or externally controlled effect `MUST` be explicitly classified as such and `MUST NOT` be reported as rolled back. Compensation is not rollback. Teardown derives from tracked effects, not unrelated cleanup code.
* **[DESIGN_DECISION]** Partial activation failure `MUST` unwind effects already performed. Teardown `MUST` leave no undeclared managed residue.
* **[DESIGN_DECISION]** The system boundary is strict: Rollback claims `MUST NOT` exceed the controlled system boundary. Cordis lifecycle isolation `!=` OS security isolation.
* **[DESIGN_DECISION]** PON causal dependencies and STC capability/dependency relations `MUST` remain distinct typed relations. They `MAY` share identities, scope, provenance, causation IDs, and telemetry, but `MUST NOT` be conflated into one dependency graph.
  * `PON: fact → premise/condition/rule`
  * `STC: component → required/provided capability`

## 5. TDD Directives (Test-Driven Development)
*Governs: What executable evidence proves required behavior.*

* **[DESIGN_DECISION]** The default loop `MUST` be: `RED` → `minimum GREEN` → `REFACTOR` → `VERIFY`.
* **[DESIGN_DECISION]** At pre-agreed seams, implementers `MUST` define observable behavior first and observe the failure before implementing. Refactor only while green.
* **[DESIGN_DECISION]** Tests `MUST` prove semantic behavior: notification selectivity, dependency lifecycle, revertibility, and graceful degradation.
* **[DESIGN_DECISION]** Deterministic evidence outranks model self-assessment.

## 6. Graceful Degradation Directives
*Governs: What safe useful behavior remains when expected capabilities fail.*

* **[DESIGN_DECISION]** Failure is a capability-state transition, not merely a caught exception.
* **[DESIGN_DECISION]** Canonical pattern: `FAILURE` → `CLASSIFY` → `RECOVER PARTIAL EFFECTS` → `REMOVE/REDUCE FAILED CAPABILITY` → `RECOMPUTE DEPENDENCIES` → `CONTINUE AT SAFEST USEFUL LEVEL`.
* **[DESIGN_DECISION]** A component failure `SHOULD` reduce only the capability and dependency region causally affected by that failure unless evidence demonstrates a wider unsafe state.
* **[DESIGN_DECISION]** Failure `MUST NOT` silently widen authority, widen filesystem/mutation scope, enable additional providers, bypass policy/tests, weaken sandboxing, or suppress required evidence.
* **[DESIGN_DECISION]** Recovery `MUST` be explicit and observable.
* **[DESIGN_DECISION]** No blind retries. A retry `MUST` be justified by changed state, changed inputs, explicit retry policy, or new evidence. Repeating a failed operation against an unchanged state is not graceful degradation.

## 7. Agent/Harness Directives
* **[DESIGN_DECISION]** `ROLE != MODEL` and `ROLE != PROVIDER`. Control logic `MUST NOT` require specific provider/model names.
* **[DESIGN_DECISION]** **Deterministic First**: Before invoking an LLM, attempt to resolve via state, policy, schema, static analysis, tests, cached evidence, or deterministic routing. Models provide cognition *only* where cognition is required.
* **[DESIGN_DECISION]** **STC Context Discipline**: Every item (skills, references, agents, model bindings) `MUST` use the narrowest valid scope (`global` → `workspace` → `project` → `session` → `work package` → `task/action`) and expire when its owning scope ends. Durable evidence is not conversational context.

## 8. Scientific Directives (Evidence & Telemetry)
*Governs: What the system is allowed to claim happened.*

* **[DESIGN_DECISION]** Every consequential run `MUST` be reconstructable from evidence.
* **[DESIGN_DECISION]** Preserve where practical: causal journal (append-only), artifacts (content-addressed/hashable), tests (command + result + environment), and derived summaries (explicitly derived, not authoritative source state).
* **[DESIGN_DECISION]** A model saying `PASS` is not evidence of PASS. An accepted result requires observable postconditions.

## 9. Global STOP Conditions
An agent `MUST` **STOP** and return evidence instead of improvising when:
1. An assumed architectural seam does not exist.
2. Required ownership cannot be established, or authority is ambiguous.
3. Mutation exceeds the authorized boundary.
4. Teardown/recovery cannot be proven.
5. Completing work requires weakening an invariant.
6. Tests contradict the implementation plan.
7. Required evidence cannot be produced.
8. A hypothesis would need to be silently treated as fact.
9. Continuing requires architectural redesign outside the current WorkPackage.

`UNKNOWN > guess`  
`STOP means STOP`

## 10. Canonical Execution Loop

**Standard Execution:**
`STATE CHANGE` → `PON NOTIFICATION` → `RELEVANT CONDITION/RULE` → `ACTION INTENT` → `POLICY / VALIDATION` → `STC-MANAGED EFFECT` → `CONTEXT CHANGE` → `DEPENDENCY RECONCILIATION` → `ACTIVATE / DEACTIVATE / NEUTRAL` → `EVIDENCE`

**Failure Execution:**
`FAILURE` → `RECOVER TRACKED EFFECTS` → `RECORD FAILURE` → `CAPABILITY CHANGE` → `NOTIFY DEPENDENTS` → `DEGRADE / DEACTIVATE` → `RECOMPUTE SAFE STATE` → `EVIDENCE`

---
*Progressive Disclosure References (when populated):*
`docs/prime-directive/PON.md`, `docs/prime-directive/STC.md`, `docs/prime-directive/TDD.md`, `docs/prime-directive/GRACEFUL_DEGRADATION.md`, `docs/prime-directive/SCIENTIFIC_METHOD.md`
