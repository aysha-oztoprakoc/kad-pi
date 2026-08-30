# Next Workpackage Briefs

## RECOMMENDED

### WP-KAD-KNOWLEDGE-PLANE-WIKI-VERTICAL-001 — Contract and Governed Wiki Projection

**Objective**

Specify and implement the smallest KAD-owned KnowledgePlane contract that produces a governed wiki projection and a deterministic cited project-knowledge command, then exercise independent OpenViking and Needle adapter slices without transferring authority.

**Why now**

The human selected a governed wiki projection as the next 1–2-workpackage milestone, a usable wiki/research assistant for the next month, and a deterministic cited command as the next-week workflow. Latest evidence identifies the missing KAD contract as the prerequisite for safe OpenViking/Needle integration.

**Scope**

- Define typed records/contracts for canonical source references, provenance/source hashes, trust domain, epistemic class, acceptance state, stale/degraded state, and projection identity.
- Implement one allowlisted, deterministic projection from existing canonical artifacts to human-readable and machine-readable wiki nodes.
- Implement one deterministic cited project-knowledge command using exact source/Librarian retrieval as the correctness path.
- Preserve source artifacts; make projection rebuildable and read-only with respect to canonical sources.
- Add bounded exact fallback when semantic/index capability is unavailable or stale.
- Add independent OpenViking adapter probe behind the contract, with explicit lifecycle ownership, failure/degradation, and no authority promotion.
- Add independent Needle adapter probe behind the contract, with grammar/schema validation, malformed/low-confidence escalation, and no authority promotion.
- Exercise the two adapters sequentially, not concurrently; either adapter may be unavailable without invalidating the deterministic path.
- Record provenance-bearing evidence receipts and accepted/degraded states.

**Non-scope**

- No dashboard, public website, or broad GitHub redesign.
- No full-repository semantic ingestion, automatic memory promotion, or wiki-as-source-of-truth behavior.
- No authority, trust-domain, routing-policy, provider, permission, or spend expansion.
- No new framework, distributed service, or unnecessary second process.
- No model downloads, training, LoRA/QLoRA, autonomous code/tool/architecture mutation, or policy evolution.
- No claim that OpenViking or Needle is qualified beyond the observed gates.
- No broad context-service redesign or general CMS/RAG platform.

**Dependencies**

- `PRIME_DIRECTIVE.md`, `CONTEXT.md`, ADR 0008, and existing deterministic Librarian/source artifacts.
- Existing context-economy, model-store, and lifecycle seams where reused.
- OpenViking runtime and Needle runtime only as separately owned experimental dependencies.
- Human review for scope, evidence interpretation, and any public-facing material.

**Acceptance gates**

1. RED-first deterministic tests exist and fail before contract implementation.
2. Projection output is reproducible from an allowlisted source set and includes source references, provenance, epistemic class, and acceptance state.
3. Rebuilding/reindexing cannot mutate or delete canonical source artifacts.
4. Trust-domain filtering and authorization fail closed; no cross-domain retrieval.
5. The cited command returns exact source citations and a deterministic result for a bounded fixture.
6. Stale/unavailable semantic state falls back to exact retrieval and visibly reports degraded capability.
7. OpenViking probe has explicit owner/lifecycle/cancellation/recovery evidence and safe degradation.
8. Needle probe rejects malformed, ambiguous, low-confidence, and unauthorized outputs or escalates to a qualified fallback without widening authority.
9. Neither adapter can promote a memory, accept evidence, alter routing, or grant capability.
10. The two adapters are exercised sequentially and independently; deterministic projection remains valid if either is disabled.
11. Evidence receipt records commands, results, source hashes/refs, runtime identities, failures, and acceptance status.
12. A human can run the cited command as the usable daily workflow without a dashboard or public site.

**Expected evidence**

- Contract/schema and deterministic test results.
- Projection fixture, generated human/machine-readable nodes, and source-preservation hash comparison.
- Command output with citations and degraded fallback output.
- Trust-domain, stale-index, and memory-promotion negative fixtures.
- Separate OpenViking and Needle adapter receipts, lifecycle/failure matrices, and runtime identities.
- Final accepted/degraded status with no unsupported capability claims.

## ALTERNATIVE A

### WP-KAD-LOCAL-SPECIALIST-QUALIFICATION-001 — Qualify One Bounded Worker

**Objective:** Qualify Needle 2 or one existing specialized local worker on fixed KAD fixtures with resource, lifecycle, malformed/low-confidence, trust, and escalation gates.

**Cost of choosing:** Delays the governed wiki/research assistant and leaves the central KnowledgePlane projection contract less exercised. Current Needle confidence is uncalibrated; Qwen availability is degraded.

## ALTERNATIVE B

### WP-KAD-PON-STC-EVIDENCE-001 — Lifecycle and Notification Experiment

**Objective:** Compare one bounded baseline against explicit STC lifecycle/recovery and PON notification selectivity, measuring token/context effects and local-first escalation.

**Cost of choosing:** Highest direct research value for the selected hypotheses, but delays the human's usable cited knowledge workflow and may produce evidence without a durable user-facing capability.
