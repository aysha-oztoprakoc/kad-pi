# KAD-PI Domain Context

Ubiquitous language and canonical vocabulary for the KAD / PON / STC / Pi experimental harness, simulation engine, and agent swarm architecture.

## Notification & Causality (PON)

**Notification**:
A punctual, typed signal that relevant state or an environmental fact has changed.
_Avoid_: Event stream, broadcast, message queue message

**Fact**:
A factual-executional property or state primitive within the Fact Base.
_Avoid_: Global variable, ambient state

**Premise**:
A logical unit evaluating whether a specific fact condition holds true.
_Avoid_: If-statement, filter predicate

**Condition**:
A composite logical conjunction of premises that guards rule activation.
_Avoid_: Guard clause, business logic check

**Rule**:
Logical-causal knowledge defining which action intent is produced when its guarding condition becomes satisfied.
_Avoid_: Event handler, callback, observer hook

**ActionIntent**:
A pure, typed data proposal produced by an activated rule before validation or effect execution.
_Avoid_: Mutation, effect, command execution

## Spatiotemporal Composability (STC & Cordis)

**Effect**:
A context-mediated mutation attributable to an owner that registers its inverse when applied.
_Avoid_: Side effect, unmanaged mutation

**Coeffect**:
A declared dependency or capability required by a component from its runtime environment.
_Avoid_: Global import, ambient dependency

**Fiber**:
An instantiated, scoped runtime instance of a component whose lifecycle is governed by a Context.
_Avoid_: Plugin instance, worker thread, process

**Context**:
The runtime mediator of effects, coeffects, capability resolution, and lifecycle disposal.
_Avoid_: Service locator, global registry

**Capability**:
A defined contract or service provided by a component into the Context.
_Avoid_: Service class, utility module

## Simulation & Authority Boundary

**CandidateIntent**:
An untrusted, probabilistic proposal produced by an LLM interpreter from raw input.
_Avoid_: Player action, executed command

**Validator**:
A deterministic, pure boundary engine verifying CandidateIntent schemas, references, and preconditions.
_Avoid_: Semantic checker, LLM grader

**ValidatedIntent**:
A verified, schema-compliant intent authorized for canonical state resolution.
_Avoid_: Validated command, executed intent

**Resolver**:
The deterministic engine computing state transitions and generating events from ValidatedIntents.
_Avoid_: Game loop, mutation handler

**StateDiff**:
An explicit, complete delta of modified fields transitioning GameState_before to GameState_after.
_Avoid_: Patch, partial update

**GameState**:
The immutable canonical snapshot of all world simulation entities, rooms, and attributes.
_Avoid_: World state, database record

## Agent Swarm & Governance

**WorkPackage**:
A bounded unit of scoped, self-contained execution with explicit input paths, mutation authority, and acceptance criteria.
_Avoid_: Ticket, user story, sprint task

**Evidence**:
Durable, attributable observations, logs, or hashes from which claims and postconditions are independently verified.
_Avoid_: Model self-report, test pass claim

**EpistemicClass**:
The explicit classification of a claim or invariant (`SOURCE_DERIVED`, `DESIGN_DECISION`, `HYPOTHESIS`, `EXPERIMENT`, `OBSERVED`).
_Avoid_: Confidence score, belief level

**Librarian**:
An autonomous cataloging and retrieval agent operating over structured synthetic knowledge bases to resolve queries with deterministic citations.
_Avoid_: RAG prompt, search bot

**KnowledgePlane**:
A KAD-owned interface for durable project knowledge, retrieval, governed ingestion, provenance, and bounded context compilation. An OpenViking adapter may implement it experimentally; it is not an authority layer.

**SourceArtifact**:
A durable repository, directive, accepted decision, specification, test, evidence receipt, human-authored canonical artifact, or accepted research artifact that outranks derived state.

**DerivedState**:
Rebuildable indexes, embeddings, summaries, context packets, retrieval caches, memory candidates, or wiki projections that may accelerate access but cannot replace or mutate source artifacts.

**ContextPacket**:
A bounded, policy-filtered selection of L0/L1/L2 knowledge compiled for an identified agent, role, task, trust domain, authority, and resource budget.

**MemoryCandidate**:
An extracted or inferred knowledge proposal carrying provenance and an explicit non-accepted state until KAD validation and corroboration accepts or rejects it.

**TinySpecialist**:
A constrained model tier, such as Needle 2, that classifies, routes, or extracts from bounded packets. Syntax and confidence guide routing; neither grants epistemic authority.

**TrustDomain**:
An explicit boundary governing which knowledge, capabilities, principals, and context may be combined or exposed.

**AcceptanceState**:
The explicit lifecycle state of a candidate or artifact (`PROPOSED`, `ACCEPTED`, `REJECTED`, `UNKNOWN`, or `SUPERSEDED`); acceptance requires deterministic evidence and cannot be self-granted by an inference.
