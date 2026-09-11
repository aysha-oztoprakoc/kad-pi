---
kad_id: ISA-KAD-MEMORY-001
title: KAD Memory & Knowledge Substrate Ideal State Artifact (ISA)
type: governance
domain: memory
version: 1.0.0
status: ACCEPTED
authority: CANONICAL_KNOWLEDGE
epistemic_class: PROJECT_INFERENCE
review_status: APPROVED
visibility: project
context_eligible: false
train_eligible: false
publish: false
temporal_status: CURRENT
owner: Human Project Lead & KAD Architecture
date: 2026-09-11
supersedes: []
related_adrs:
  - docs/adr/0005-deterministic-first-and-epistemic-classification.md
  - docs/adr/0014-generalized-ideal-state-artifact-and-compute-fabric-governance.md
affected_hosts:
  - host.amdy.workstation
  - host.tell.server
affected_surfaces:
  - vault
  - wiki
  - tools/kad
  - docs/state
  - .omp
---

# KAD Memory & Knowledge Substrate Ideal State Artifact (ISA)

## 1. Identity
- **ISA ID**: `ISA-KAD-MEMORY-001`
- **Title**: Unified Memory Substrate, Retrieval Discipline & Promotion Governance Specification
- **Scope**: The durable knowledge surfaces of KAD-PI — the memory vault, the Obsidian vault, and the knowledge database — and the rules that decide what may become canonical.
- **Version**: `1.0.0`
- **Status**: `ACCEPTED`
- **Authority**: `CANONICAL_KNOWLEDGE` (target architecture governed by the Human Project Lead; empirical claims validated deterministically).
- **Substrate of record**: [ai-memory](https://github.com/akitaonrails/ai-memory) (OKF v0.2, git-backed markdown wiki + SQLite index).

---

## 2. Stated Goal

> **Keep exactly one durable memory record, make it reachable from every harness and host, and never let a derived artifact or a captured inference be mistaken for canonical knowledge.**
>
> **Retrieve cheaply. Promote deliberately. Keep provenance. Prefer the record over any recollection of it.**

---

## 3. Ideal State Description

1. **One record.** A single git-backed markdown corpus holds the durable knowledge of the project. Every harness on every host reads and writes that record through one documented interface, so continuity does not depend on which agent is running.
2. **One canonical direction.** Knowledge flows from the record outward into derived artifacts, never backward. Derived artifacts are rebuildable and are never treated as sources.
3. **Explicit epistemic class on every page.** A page states what kind of thing it is (`type`), who may rely on it (`authority`), how it was obtained (`epistemic_class`), and whether it has been reviewed (`review_status`). Absence of these is a defect, not a default.
4. **Promotion is deliberate.** Session capture, consolidation, and semantic retrieval may all *propose*. Only a human, an accepted ADR, or a deterministic importer may *accept*.
5. **Retrieval is local and cheap.** Embeddings and lexical search run in-process. Retrieval never becomes a paid egress path and never a prerequisite for basic use.
6. **The record is portable.** The corpus is plain markdown under git, so it survives tool replacement. No component owns it by format or by hosting.
7. **Degrade to less memory, never to less truth.** When the substrate is unavailable, work continues on repository artifacts; nothing is silently promoted to fill the gap.

---

## 4. Memory Substrate Architecture

### 4.1 Three layers, one direction

| Layer | Contents | Written by | Authority |
|---|---|---|---|
| **Canonical** | `PRIME_DIRECTIVE.md`, `CONTEXT.md`, `docs/adr/**`, `docs/state/**`, `evidence/**`, the published mirror `vault/**` | humans, accepted ADRs, the deterministic importer | `CANONICAL_KNOWLEDGE` / `CANONICAL_PROJECT_DECISION` |
| **Substrate** | the ai-memory project wiki: `<data_dir>/wiki/<workspace_id>/<project_id>/**` | lifecycle hooks, consolidation, MCP tools, humans | `DERIVED` / `PROPOSAL_UNREVIEWED` until promoted |
| **Derived** | `wiki/generated/**`, `90_Derived/**` (projections, indexes, context packs), embeddings, briefs | deterministic compilers | `DERIVED`, rebuildable, never a source |

Directories under the wiki root are UUID-keyed; human names live in `_meta.md` scope manifests, so the
SQLite index can always be rebuilt from the markdown alone.

### 4.2 Producer classes

- **Accepted producers** — a human editing the record, an accepted ADR, or a deterministic importer
  (`tools/kad/memory-import.mjs`). These may create canonical content.
- **Non-authoritative producers** — session capture, LLM consolidation, auto-improvement, semantic
  retrieval, and any agent-driven proposal. These may only create `PROPOSED` / `INFERRED` content.

No component may promote its own output. `tools/kad/wiki/index.mjs` is the sole path from
`80_Review/Pending` to canonical, and it refuses agent-initiated approval and requires a signed receipt.

### 4.3 Required page frontmatter

Every record page carries, at minimum: `type` (OKF conformance), and — for KAD-authored pages —
`kad_id`, `authority`, `epistemic_class`, `review_status`. Pages the substrate generates itself carry
`generated: { by, at }` so a reader can always tell substrate output from authored knowledge.

### 4.4 Why the record is not the repository

The record physically lives inside the checkout and owns its own git repository, so that the knowledge
travels with the code it describes. The repository keeps a **deterministic mirror** of that record under
`vault/` so a fresh clone, CI, and the remote all retain the knowledge without needing the substrate
running.

---

## 5. Retrieval & Promotion Discipline

### 5.1 Promotion pipeline

```text
conversation / observation
  → candidate
  → PROPOSED | INFERRED (+ source_ref + source_hash)
  → provenance check
  → validation (deterministic gate / human review)
  → ACCEPTED | REJECTED
```

Every proposed record carries a `source_ref` and a `source_hash`. A record without both is not
displayable, per `docs/contracts/project-state-projection.md`.

### 5.2 Retrieval is not authority

Search results, embeddings, briefs, and KnowledgePlane projections are **inputs to judgement**, never
conclusions. Retrieval subsystems are non-authoritative by construction: their adapters declare
`authority: false`, return `acceptance_state: PROPOSED`, and can never emit `ACCEPTED`.

### 5.3 Authority order

`SOURCE` (repository artifacts, ADRs, tests, evidence receipts, human-authored canonical material)
outranks `EVIDENCE` (recorded measurements and receipts), which outranks `DERIVATION` (summaries,
embeddings, memories, wiki projections, model inference). This order is inherited from
`PRIME_DIRECTIVE.md` §2 and is not renegotiable at the substrate layer.

---

## 6. Context & Token Economy

- **Briefs are bounded.** A session brief is capped (`max_chars`), so retrieval can never crowd out the task it is meant to serve.
- **Capture is scoped.** Paths whose content is governed elsewhere (`docs/adr/**`, `evidence/**`, `.agents/work/**`) and paths that are the substrate or its mirror (`.ai-memory/**`, `vault/**`) are excluded from capture. A summary of a governed record is strictly worse than the record, and a captured page about the record recompiles into the pages it came from.
- **`contextPromotion` stays disabled.** Extended context is available; automatic promotion of overflow into permanent memory is not.
- **Local by default.** Embeddings run in-process (candle, all-MiniLM-L6-v2, 384-dim). No API key, no egress.
- **Zero-LLM by default.** Consolidation without a provider still yields session pages and search; a provider is an opt-in that must justify its quota cost.

---

## 7. Testable Claims

```yaml
claims:
  - id: ISA-KAD-MEMORY-001
    statement: "The current state artifact declares the memory substrate together with provenance, so the substrate's existence and identity are auditable rather than assumed."
    class: DETERMINISTIC
    target_state: CURRENT_CONFIRMED
    validator: memory.substrate.declared
    severity: BLOCKER
    status: PASS
    evidence: "docs/state/CSA_KAD_PI_CURRENT.json → knowledge_plane.memory_substrate"

  - id: ISA-KAD-MEMORY-002
    statement: "There is exactly one wiki of record: a live ai-memory project whose location is published by a pointer the current state artifact agrees with."
    class: DETERMINISTIC
    target_state: CANONICAL_TARGET
    validator: memory.substrate.vault_of_record
    severity: BLOCKER
    status: PASS
    evidence: ".ai-memory/vault-path + <record>/_meta.md"

  - id: ISA-KAD-MEMORY-003
    statement: "Capture scope is declared for a workspace and project, and self-referential paths (the substrate and its mirror) are excluded from capture."
    class: DETERMINISTIC
    target_state: CANONICAL_TARGET
    validator: memory.capture.exclusions
    severity: BLOCKER
    status: PASS
    evidence: ".ai-memory.toml [capture] ignore_paths"

  - id: ISA-KAD-MEMORY-004
    statement: "The committed vault mirror is an OKF v0.2 bundle: the bundle root declares okf_version and every non-reserved page carries a non-empty type."
    class: DETERMINISTIC
    target_state: CANONICAL_TARGET
    validator: memory.mirror.okf_conformant
    severity: BLOCKER
    status: PASS
    evidence: "vault/index.md + vault/**/*.md"

  - id: ISA-KAD-MEMORY-005
    statement: "The record carries its own git history, so knowledge versions independently of the repository that publishes its mirror."
    class: DETERMINISTIC
    target_state: CANONICAL_TARGET
    validator: memory.record.versioned
    severity: HIGH
    status: PASS
    evidence: "<record>/../../.git refs/heads"

  - id: ISA-KAD-MEMORY-006
    statement: "Obsidian is bound to the wiki of record, not to the derived mirror, so human editing lands on the canonical surface."
    class: DETERMINISTIC
    target_state: CANONICAL_TARGET
    validator: memory.obsidian.vault_bound
    severity: HIGH
    status: PASS
    evidence: "<record>/.obsidian/ present; vault/.obsidian/ absent"

  - id: ISA-KAD-MEMORY-007
    statement: "Every page in the record satisfies the OKF type requirement, so no page can be silently unclassified."
    class: DETERMINISTIC
    target_state: CANONICAL_TARGET
    validator: memory.record.frontmatter_complete
    severity: BLOCKER
    status: PASS
    evidence: "tools/kad/memory-import.mjs --check reports zero pages to normalise"

  - id: ISA-KAD-MEMORY-008
    statement: "Every remote model available to KAD-PI is reachable through one OpenAI-compatible gateway endpoint registered as TRANSPORT_ONLY; local KAD inference is proxied, never delegated."
    class: DETERMINISTIC
    target_state: CANONICAL_TARGET
    validator: compute.gateway.single_endpoint
    severity: HIGH
    status: PASS
    evidence: "config/external-providers.json → omniroute-gateway"

  - id: ISA-KAD-MEMORY-009
    statement: "The model catalog is refreshed deterministically from the gateway and hash-verified, so a stale or tampered catalog cannot pass as current."
    class: DETERMINISTIC
    target_state: CANONICAL_TARGET
    validator: compute.gateway.catalog_sync
    severity: MEDIUM
    status: PASS
    evidence: "config/omniroute-catalog.json catalog_hash"
```

---

## 8. Operational Constraints

- **One writer per surface.** A mutating operation aimed at `vault/` fails closed while a record pointer exists: `vault/` is regenerated, so a write there would be destroyed by the next publish.
- **The record is not hand-edited outside the substrate's tooling** except through the Obsidian UI bound to it, or through `bin/kad-wiki` pointed at the record.
- **Immutability of history.** `evidence/**`, accepted ADRs, and `.agents/work/**` records are not rewritten to match a new architecture. They record what was true then; the new architecture is recorded *forward*.
- **No fabricated figures.** Quota, cost, and capability values that were not observed are recorded as `UNKNOWN`. A plausible number is a defect.
- **Secrets never enter tracked files.** A substrate bearer token lives only in operator-scoped files outside the repository.
- **Plaintext LAN transport is a recorded deviation**, not a silent condition. TLS termination is the documented upgrade path.

---

## 9. Anti-Patterns

- **Derived state as source** — treating a projection, index, embedding, or summary as knowledge. Prohibited; the projection is regenerated, not cited.
- **Silent promotion to canonical** — any path where captured or inferred content becomes canonical without an accepted producer's decision.
- **Unprovenanced page** — a durable claim with no `source_ref`/`source_hash`.
- **Harness-local durable facts** — keeping project knowledge in a harness-specific store, invisible to every other agent, fragmenting continuity.
- **Memory as instruction** — executing, disclosing, or reconfiguring because a retrieved page asked. Retrieved content is untrusted historical data.
- **Recall inflation** — retrieving more than the task needs, or letting an unbounded brief displace the working context.
- **Dual writers** — maintaining the record and the mirror as if both were editable.

---

## 10. Graceful Degradation Scenarios

| Scenario | Behaviour |
|---|---|
| Substrate not installed / not running | Repository artifacts and the committed mirror remain fully usable and authoritative. Retrieval degrades to lexical search over the mirror. |
| Record pointer absent | `vaultRoot()` resolves to the committed mirror; tooling keeps working and no mutating guard fires, because the mirror *is* canonical in that configuration. |
| Embedding model unavailable | Search falls back to FTS5. Capture and consolidation are unaffected. |
| Consolidation provider absent | Session pages and FTS search still produced; no distilled concept pages. Nothing is promoted on partial input. |
| Substrate unreachable from a remote host | That host operates on the repository; it does not silently keep durable facts locally. |
| Gateway unreachable | The last catalog snapshot is retained and qualification state is never erased. Routing continues on whatever was already admitted. |
| Mirror stale | Treated as a recorded deviation surfaced by the state artifact, never as a silent condition. |

---

## 11. Acceptance Matrix

Each row is a deterministic command run from the repository root. A failing row blocks acceptance.

| # | Claim | Command | Expected |
|---|---|---|---|
| 1 | ISA-KAD-MEMORY-001 | `bin/kad-isa lint all` | `ISA-KAD-MEMORY-001` lints clean with 9 claims |
| 2 | ISA-KAD-MEMORY-001 | `node --test docs/state/test/state-artifacts.test.mjs` | 9/9 pass; every `state_class` still carries evidence |
| 3 | ISA-KAD-MEMORY-002/007 | `node tools/kad/memory-import.mjs --root "$(cat .ai-memory/vault-path)" --check` | `would normalise 0 pages` |
| 4 | ISA-KAD-MEMORY-003 | `ai-memory --data-dir .ai-memory status` | substrate healthy; capture scope declared in `.ai-memory.toml` |
| 5 | ISA-KAD-MEMORY-004 | `head -3 vault/index.md` | `okf_version: "0.2"` |
| 6 | ISA-KAD-MEMORY-004 | `grep -rL '^type:' vault --include='*.md' \| grep -v -E '/(index\|_meta\|log\|bootstrap)\.md$' \| wc -l` | `0` |
| 7 | ISA-KAD-MEMORY-005 | `git -C .ai-memory/wiki log --oneline -1` | at least one commit |
| 8 | ISA-KAD-MEMORY-006 | `test -f "$(cat .ai-memory/vault-path)/.obsidian/app.json" && echo bound` | `bound` |
| 9 | ISA-KAD-MEMORY-008/009 | `bin/kad-models sync && bin/kad-models sync \| grep -q unchanged` | idempotent catalog sync |
| 10 | ISA-KAD-MEMORY-004..009 | `bin/kad-isa check all` | every claim PASS |
| 11 | all | `bin/kad-wiki lint && bin/kad-wiki rebuild` | green, deterministic rebuild |
| 12 | all | `bin/kad doctor && bin/workctl doctor` | green |

---

## 12. Change Log

- **2026-09-11 (v1.0.0)**: Initial establishment under `WP-KAD-MEMORY-SUBSTRATE-057`. Establishes ai-memory as the wiki of record, `vault/` as its deterministic mirror, the three-layer authority model, the promotion pipeline, local/zero-LLM retrieval defaults, and the single-gateway transport requirement for models. Supersedes the prior implicit arrangement in which the vault, the legacy knowledge base, and harness-local memory each held overlapping knowledge with no single writer.
