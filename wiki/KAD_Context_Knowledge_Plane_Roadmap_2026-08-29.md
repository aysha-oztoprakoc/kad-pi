---
doc_id: KAD_CONTEXT_KNOWLEDGE_ROADMAP_2026_08_29
title: "KAD-PI Canonical Context, Knowledge and Local-Specialist Plane Roadmap"
domain: KAD_KNOWLEDGE
epistemic_status: DESIGN_DECISION
source_documents:
  - PRIME_DIRECTIVE.md
  - CONTEXT.md
  - docs/adr/0007-synthetic-knowledge-librarian-architecture.md
  - docs/adr/0008-unified-context-knowledge-plane.md
  - wiki/KAD_Implementation_Plan.md
retrieval_keywords:
  - OpenViking
  - Knowledge Plane
  - KnowledgePlane
  - Needle 2
  - Context Compiler
  - Wiki
  - Memory Policy
  - Provenance
  - Tokenmaxxing
  - Graceful Degradation
---

# KAD-PI Canonical Context, Knowledge and Local-Specialist Plane Roadmap

**Updated:** 2026-08-29
**Status:** Canonical roadmap and design boundary
**Authority:** KAD owns authority, acceptance, trust, policy, routing, and evidence. This document does not grant runtime capability or replace source artifacts.

## 1. North star

KAD-PI evolves from a local-agent experimentation harness into a governed, context-efficient meta-harness with a unified knowledge plane. The target is not one increasingly autonomous general LLM. Work should move toward the safest qualified tier:

```text
deterministic mechanisms
→ constrained tiny specialists
→ bounded local models
→ cheap remote models
→ strong remote models
→ human
```

Correctness, provenance, authority, recoverability, and scientific evidence remain non-negotiable. The governing principles are PON, STC, TDD, and GD. The canonical failure doctrine is:

```text
DEGRADE, DON'T ESCALATE AUTHORITY.
```

## 2. Four-plane architecture

### 2.1 Authority and evidence plane

Durable authoritative sources are:

- repository artifacts;
- `PRIME_DIRECTIVE.md`;
- accepted ADRs and specifications;
- executable tests and deterministic gates;
- evidence receipts;
- human-authored canonical material;
- accepted research artifacts.

They outrank embeddings, summaries, memories, wiki projections, retrieval results, model inference, compaction archives, and agent recollection.

```text
SOURCE > DERIVATION
EVIDENCE > MEMORY
EXACT ARTIFACT > SEMANTIC RECONSTRUCTION
UNKNOWN > GUESS
```

### 2.2 KAD knowledge plane

The KAD-owned boundary is:

```text
KAD
 │
 └── KnowledgePlane interface
        │
        └── OpenViking adapter (experimental)
```

OpenViking may provide durable context indexing, hierarchical organization, semantic retrieval, progressive L0/L1/L2 context, resource storage/indexing, memory-candidate storage, skill discovery, useful relations, and retrieval traces. It must not become an independent KAD authority layer.

KAD retains ownership of authority, epistemic classification, acceptance, trust domains, capability policy, resource lifecycle, economic routing, task contracts, agent identity, wiki semantics, and promotion rules.

The deterministic Librarian remains the exact lookup path, bootstrap importer, integrity verifier, and fallback retrieval path. It is not discarded when semantic retrieval is introduced.

### 2.3 OMP working-context plane

OMP owns volatile conversational working memory:

- current conversation and recent raw history;
- tool-loop state;
- compaction, snapcompact, and handoff;
- live model context and mid-turn maintenance.

KAD owns durable semantic project knowledge:

- accepted project state and retrievable history;
- wiki, research, decisions, evidence pointers, and skills;
- shared and agent-scoped knowledge.

The interaction is:

```text
KAD knowledge
      ↓
bounded retrieval
      ↓
OMP working context
      ↓
work
      ↓
accepted durable artifact
      ↓
KAD ingestion/indexing
```

Compaction is context maintenance, not knowledge promotion.

### 2.4 Resource and capability plane

A capability router chooses the safest qualified resource tier. Failure removes or reduces the affected capability, recomputes dependencies, and continues only through a safe reduced path. Failure must not silently enable spending, permissions, providers, authority, or a broader trust domain.

## 3. Source truth and derived state

Source artifacts are durable truth. The following are rebuildable derived state:

```text
vector indexes
semantic summaries
L0 / L1 context
embeddings
retrieval caches
context packets
agent memories
wiki projections
```

Loss or staleness of derived state may degrade retrieval but must not destroy or mutate canonical truth. Reindexing is therefore a read-derived operation with explicit provenance, source references, source hashes where applicable, and observable stale/refresh state.

## 4. KAD wiki and provenance

The wiki is the human-visible projection of KAD knowledge state, not merely documentation. Initial namespaces are:

```text
PROJECT ARCHITECTURE DECISIONS RESEARCH TECHNOLOGIES EXPERIMENTS
MODELS PROVIDERS AGENTS CAPABILITIES SKILLS EVIDENCE FAILURES
WORLD GLOSSARY ROADMAP
```

A meaningful wiki node should preserve, when applicable:

```text
id, title, type, epistemic_class, authority_class
source_refs, source_hashes, created_at, updated_at
supersedes, superseded_by, related, trust_domain
confidence_if_applicable, acceptance_state
```

Deterministic metadata extraction is preferred. LLM-authored summaries are derived artifacts and must retain their provenance and epistemic classification.

## 5. Agent-scoped knowledge and context compilation

The knowledge plane supports both shared project knowledge and agent-scoped knowledge. Agents do not receive the entire database by default. Context is compiled through:

```text
agent identity
role
capabilities
trust domain
task and authority
token budget
resource budget
current phase
```

The conceptual pipeline is:

```text
Knowledge Plane
      ↓
policy filter
      ↓
retrieval
      ↓
L0
      ↓
selected L1
      ↓
exact L2 where required
      ↓
bounded context packet
      ↓
agent
```

Passive context injection must be trust-aware, provenance-preserving, bounded, secret-free, and subject to explicit principal/capability checks. A compilation failure degrades to bounded exact context or fails closed.

## 6. Context economy

The existing policy remains in force:

```text
contextPromotion = disabled
snapcompact preferred
70% compaction threshold
20K recent context retained
mid-turn maintenance enabled
deterministic KAD checkpoint
/kad-context observational command
```

The roadmap adds dynamic context budgets, strict provenance for tool and external content, bounded memory injection, recoverable pending state, separation of authoritative and inferred memory, and explicit capability checks. These mechanisms must be generalized into KAD-native interfaces rather than copying another harness wholesale.

## 7. Memory policy

OpenViking auto-memory cannot directly create KAD truth. The required pipeline is:

```text
conversation / event
      ↓
candidate extraction
      ↓
PROPOSED_MEMORY / INFERRED
      ↓
provenance attachment
      ↓
validation and corroboration
      ↓
accepted or rejected
```

The knowledge plane should support at least:

```text
AUTHOR_DECLARED DOCUMENT_DERIVED OBSERVED INFERRED HYPOTHESIS
PROPOSED ACCEPTED REJECTED UNKNOWN SUPERSEDED
```

No component may promote its own inference into `ACCEPTED`.

## 8. Needle 2 tiny-specialist tier

Needle 2 is a first-class experimental tiny-specialist tier. It does not replace general local models. It is restricted to bounded work such as:

- tool selection and query classification;
- context classification and retrieval strategy selection;
- metadata extraction and schema mapping;
- artifact/wiki categorization;
- resource selection and capability-class classification;
- structured extraction from bounded packets.

The contract is:

```text
input
 ↓
Needle
 ↓
grammar-valid proposal
 ↓
confidence signal
 ↓
deterministic validator
 ↓
ACCEPT or ESCALATE
```

Grammar validity proves syntax only. Needle confidence is routing evidence, not epistemic authority. Malformed or low-confidence output escalates to a qualified fallback; it never broadens authority.

OpenViking retrieves bounded packets. Needle classifies or extracts. KAD validates. OMP consumes.

## 9. Skills and advisory board

`SKILL.md` remains the portable source artifact. OpenViking representation is an index/projection, and the OMP-loaded skill is the execution view. The database must not become the only copy.

Install and experiment with `harryvondiesel-web/5-persona-advisory-board` as an advisory skill while preserving the upstream skill first. A KAD technical lens may be added later with approximately these personas:

```text
Determinism
Epistemics
Security / Authority
Token Economics
Systems / STC
```

Use the board for major ADRs, dependency adoption, authority changes, security boundaries, research hypotheses, and large or irreversible migrations. Its output is `ADVISORY`, not `EVIDENCE`, `ACCEPTANCE`, or `AUTHORITY`. Disagreement produces a probe or question, not an automatic decision.

## 10. PON, STC, TDD, and GD application

Useful bounded notifications include:

```text
ARTIFACT_ACCEPTED ARTIFACT_CHANGED INDEX_STALE INDEX_REFRESH_REQUESTED
INDEX_REFRESHED MEMORY_PROPOSED MEMORY_ACCEPTED MEMORY_REJECTED
CONTEXT_REQUESTED CONTEXT_COMPILED CONTEXT_COMPACTED SKILL_ADDED
AGENT_TASK_REQUESTED CAPABILITY_MATCHED RESOURCE_ACTIVATED
RESULT_VALIDATED WIKI_NODE_UPDATED
```

Notifications must trigger bounded reactions; no event framework is justified where an existing seam already provides equivalent behavior.

Explicit STC owners are required for the OpenViking service, embedding runtime, reranker, Needle runtime, local LLM runtime, index jobs, ingestion jobs, swarm tasks, context packets, and compaction lifecycle. Each operation declares owner, start, deadline, resource, state, cancellation, cleanup, and recovery. Long probabilistic work must not hold deterministic locks unnecessarily.

Important knowledge-plane invariants begin RED and prove observable behavior:

- retrieval cannot cross trust domains;
- derived memory cannot self-promote;
- stale semantic indexes have exact fallback;
- OpenViking unavailability degrades safely;
- Needle malformed or low-confidence output escalates;
- wiki nodes preserve provenance;
- reindexing does not mutate canonical sources;
- compaction does not promote memory;
- agents receive only authorized context.

The canonical failure sequence is:

```text
FAILURE
   ↓
remove failed capability
   ↓
recompute capability graph
   ↓
choose safe reduced path
   ↓
continue or stop
```

Examples: OpenViking unavailable uses the deterministic Librarian; semantic retrieval unavailable uses exact source lookup; Needle unavailable uses a deterministic classifier or qualified larger worker; stale embeddings mark semantic retrieval `DEGRADED`; wiki rendering failure leaves raw artifacts valid; context compilation failure returns bounded exact context or fails closed.

## 11. External project boundary

Direct experimental dependencies are:

```text
OpenViking
Needle 2
harryvondiesel-web/5-persona-advisory-board
```

Lumina, NVIDIA Switchyard, and TLDR Radio are inspiration/reference only for provenance, trust-aware injection, memory separation, recoverable compaction, tool admission, stage-aware routing, decision receipts, explicit terminal states, positive identification, idempotent retries, cancellation, and test-the-test discipline. They must not be installed into the KAD control path merely for reuse.

## 12. Learning loop and token economy

Only accepted evidence enters the learning pipeline:

```text
TASK
 ↓
execution
 ↓
evidence
 ↓
acceptance
 ↓
knowledge plane
 ↓
repeated pattern detection
 ↓
candidate deterministic mechanism or tiny-specialist dataset
 ↓
evaluation
 ↓
migration downward
```

`TOKENMAXXING` means maximizing accepted reusable work per scarce remote token, local compute second, and human-attention unit. It does not mean maximizing raw token production.

## 13. Staged execution roadmap

This is an experiment sequence, not permission to install every dependency at once:

1. **Record the boundary:** adopt this roadmap and ADR 0008; keep the deterministic Librarian and source artifacts authoritative.
2. **Specify the adapter:** define a KAD `KnowledgePlane` contract for exact retrieval, semantic retrieval, ingestion candidates, provenance, stale state, and bounded context compilation.
3. **Probe OpenViking:** run an isolated OpenViking experiment behind the adapter; measure indexing, retrieval, progressive disclosure, provenance retention, rebuildability, and failure degradation.
4. **Build governed ingestion:** classify artifacts deterministically where possible; store memory candidates as proposed/inferred; validate and corroborate before acceptance.
5. **Compile bounded context:** enforce identity, role, capability, trust-domain, authority, task, and resource filters; preserve exact L2 access when required.
6. **Probe Needle 2:** evaluate bounded classifiers/extractors on fixed packets with malformed, low-confidence, cross-domain, and ambiguous fixtures; require deterministic validation and safe escalation.
7. **Project the wiki:** generate human-visible nodes with provenance and acceptance state while preserving source artifacts and rebuild paths.
8. **Evaluate advisory use:** preserve upstream skill compatibility and use the five-persona board only for qualifying architecture decisions.
9. **Close evidence gates:** record deterministic receipts and runtime observations for each capability before promoting it from experiment to accepted integration.

No OpenViking, Needle, or advisory-board runtime success is claimed by this roadmap. Those claims require separate live evidence.

## 14. Target architecture

```text
                      HUMAN
                        │
                        ▼
                     OMP/KAD
                  Meta-Harness
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
 Context Compiler   Policy Engine    Swarm Coordinator
       │                │                │
       ▼                │                │
 KAD Knowledge Plane    │                │
   OpenViking-backed    │                │
       │                │                │
  ┌────┼─────┐          │                │
  │    │     │          │                │
 Wiki Memory Skills      │                │
  │    │     │          │                │
  └────┼─────┘          │                │
       ▼                ▼                ▼
        Resource / Capability Router
                    │
    ┌───────────────┼──────────────────┐
    │               │                  │
 deterministic   Needle 2          local LLMs
   mechanisms     specialists       Qwen/Stheno/...
    │               │                  │
    └───────────────┼──────────────────┘
                    ▼
              Acceptance Gate
                    │
                    ▼
                 Evidence
                    │
                    └──────────────► Knowledge Plane
```

The database helps agents remember. OMP helps them think now. Needle makes tiny constrained decisions cheaply. The repository and evidence determine what is true. KAD determines what is allowed.

## 15. Human-shaped strategic direction

The strategic wayfinding workpackage selected a multi-purpose project identity: governed research platform, daily AI workstation, local agent swarm/engineering harness, and knowledge/research assistant. Public portfolio/academic presentation is secondary. The operating model is mixed human review, ChatGPT web advisory/review/steering, and OMP bounded automation. Research validity is the near-term tie-breaker.

Three tracks may proceed in parallel, but foundation precedes user-facing delivery:

```text
RESEARCH      ENGINEERING      INTERFACE
   \              |               /
    \             |              /
     shared evidence + safety contracts
```

The selected near-term capability is a governed wiki projection plus a deterministic cited project-knowledge command. The next implementation workpackage is:

```text
KAD KnowledgePlane contract
→ deterministic governed wiki projection
→ cited daily command
→ independent sequential OpenViking and Needle probes
```

OpenViking and Needle remain separate experimental adapters behind the KAD-owned contract. They must be independently degradable and must not promote derived state, accept evidence, widen authority, widen trust domains, or enable spend.

Human-selected temporary non-goals for this phase:

- no autonomous authority or policy mutation;
- no new paid APIs or PAYG escalation;
- no new framework or distributed architecture;
- no dashboard-first build;
- no public website redesign yet.

The exact interview, trade-offs, alternatives, and acceptance-gated brief are recorded in `evidence/WP-KAD-STRATEGIC-WAYFINDING-001/REPORT.md` and `NEXT-WP-BRIEF.md`. This strategic overlay does not grant runtime capability or authorize implementation by itself.
