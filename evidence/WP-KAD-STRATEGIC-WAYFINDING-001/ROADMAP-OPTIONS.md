# Roadmap Options — Draft for Human Decision

Status: derived from repository evidence and six interview rounds. Options are advisory until the human explicitly accepts a direction.

## Shared constraints

- Three bounded tracks may run in parallel, but foundation gates precede user-facing delivery.
- No new framework, distributed architecture, new paid API/PAYG escalation, autonomous authority/policy mutation, dashboard-first build, or public website redesign.
- KAD remains authority for acceptance, trust, routing, lifecycle, and evidence.
- The wiki is a human/machine-readable projection, never the source of truth.

## Option A — Governed knowledge foundation (recommended)

**Goal:** Reach the selected near-term target: a usable, cited wiki/research assistant built on a KAD-owned contract.

1. Specify the smallest KnowledgePlane contract: canonical source refs, provenance/source hashes, trust-domain and acceptance-state fields, exact retrieval, projection, stale/degraded state, and bounded context output.

2. Implement one deterministic wiki projection vertical slice from existing canonical artifacts; preserve source files and rebuildability.
3. Expose one human-reviewed daily workflow: ask a bounded project question, receive a machine-readable/human-readable projection with citations, and fall back to exact Librarian/source retrieval when semantic state is unavailable.
4. Add two independently bounded experimental slices—OpenViking and Needle—behind the contract and failure gates, exercised sequentially and without shared authority; either may degrade or be disabled without invalidating the deterministic projection.
5. Use the resulting accepted traces to select later local-worker and PON/STC experiments; defer dashboard and public site until contracts are stable.

**Advantages:** Directly matches the human's KnowledgePlane minimum, next-month wiki assistant, agent-facing GitHub/wiki needs, safety boundary, and evidence-first weighting. Leaves reusable schema and provenance seams for all tracks.

**Cost:** Requires careful contract/projection design before visible polish; first vertical slice must serve both machine and human forms.

**Risk:** Projection scope can expand into a general CMS or RAG system. Control by allowlisting sources and keeping one generated/read-only projection path.

**Dependencies:** Existing Librarian and canonical artifacts; accepted ADR/PRIME boundaries; deterministic validator/test seam; independent OpenViking and Needle runtime boundaries behind the contract.

**Delayed:** Dashboard, public website, broad GitHub redesign, broad model collection, autonomous learning.

**Research value:** High for provenance, fallback, trust filtering, lifecycle degradation, and PON/STC notifications around artifact/index changes.

**Daily utility:** High after the first narrow cited-question workflow.

## Option B — Local specialist and PON/STC research first

**Goal:** Maximize research validity and local-compute evidence before building a knowledge-facing workflow.

**Sequence:**

1. Define fixed fixtures, baselines, and lifecycle/economic measurements.
2. Qualify one specialized bounded worker, likely Needle 2 or a deterministic-plus-local worker, with malformed, low-confidence, ambiguous, cross-domain, and resource-fit cases.
3. Run a controlled PON/STC comparison for lifecycle recovery, notification selectivity, and local-first escalation.
4. Store accepted results in the existing evidence/wiki artifacts.
5. Return to the KnowledgePlane contract and governed wiki projection after the research seam is measured.

**Advantages:** Strongest direct evidence for the selected PON/STC hypotheses and local bounded-worker strategy; resolves current Needle confidence and lifecycle unknowns.

**Cost:** Delays the human's usable wiki/research assistant and leaves the central knowledge contract less exercised.

**Risk:** Research infrastructure can become the product; local-model qualification may be blocked by current endpoint/runtime limitations and produce little daily utility.

**Dependencies:** Fixed experiment fixtures, validators, resource observations, and runtime ownership; no new paid spend.

**Delayed:** Governed wiki projection, daily knowledge workflow, dashboard/site work.

**Research value:** Very high if the experiment is tightly controlled and evidence is accepted.

**Daily utility:** Low to medium until the results are integrated into a workflow.

## Option C — Mixed-harness bounded workstation first

**Goal:** Improve the actual human-reviewed workflow across browser advisory and OMP automation while preserving foundation constraints.

**Sequence:**

1. Define one bounded daily task spanning human review, browser advisory, OMP automation, and evidence receipt.
2. Add only the minimum typed contract needed to route, compile context, execute, validate, and recover that task.
3. Use existing Luna/subscription-backed advisory and existing local/OMP seams; no new providers or paid lanes.
4. Add a narrow wiki projection as the task's durable output and source-linked review surface.
5. Measure token usage, lifecycle behavior, and escalation; generalize only after accepted evidence.

**Advantages:** Fastest path to the requested usable daily workflow and tests the mixed interaction model directly. Avoids building a dashboard and creates evidence from real use.

**Cost:** May produce a task-specific seam before the broader KnowledgePlane contract is fully explicit; requires disciplined scope control.

**Risk:** The workflow can conceal missing knowledge/provenance contracts or optimize one path prematurely. It may also mix browser advisory and OMP automation in ways that are hard to reproduce.

**Dependencies:** Existing OMP/Pi integration, deterministic routing/validation, bounded source allowlist, and a human-defined daily task.

**Delayed:** General wiki backend/projection capabilities, broad local qualification, public presentation.

**Research value:** Medium to high for real-workflow telemetry and PON/STC recovery, lower for general KnowledgePlane semantics.

**Daily utility:** High earliest, but narrower than Option A's reusable assistant.

## Selection tension

Option A best satisfies the selected KnowledgePlane minimum and next-month target. Option B best maximizes immediate research validity but delays utility. Option C best satisfies next-week daily utility but carries the highest risk of a task-shaped contract. The recommendation is to choose Option A while designing its first projection slice as the usable daily workflow demanded by the next-week horizon.
