# ADR 0012: Agentic Graph Engineering and Typed Relationship Contract

* **Status**: ACCEPTED
* **Date**: 2026-08-30
* **Author**: KAD-PI Architecture & Implementation Team
* **Authority**: Wayfinder + KAD Human Decision Gate
* **Supercedes**: None
* **Related ADRs**: ADR 0008 (Unified Knowledge Plane), ADR 0009 (Frontend & Visualization Stack)

---

## Context
The KAD ecosystem comprises projects, workpackages, decisions (ADRs), canonical notes, research papers, claims, agents, tools, models, and runtime services. We need an explicit, typed graph schema that connects these entities while strictly distinguishing human-authored facts from compiler-derived relationships and heuristic agent suggestions.

## Decision

### 1. Node Taxonomy
Nodes in the KAD ecosystem graph belong to standard entity classes:
* `PROJECT`: Top-level and subprojects (`kad-pi`, `data_workspace`, `technopagan-netrunner`).
* `WORKPACKAGE`: Execution items tracked by `workctl` (`WP-001` .. `WP-012`).
* `DECISION`: Architectural decision records (`ADR 0001` .. `ADR 0012`).
* `CANONICAL_NOTE`: Governed knowledge notes in `vault/`.
* `RESEARCH_PAPER`: Bibliographic sources in research corpus.
* `RESEARCH_CLAIM`: Epistemically audited factual claims.
* `AGENT`: Declared agent roles (`kad-master`, `scout`, `librarian`).
* `TOOL` / `SERVICE`: Executable tools and background runtime daemons.
* `MODEL`: Qualified foundation and local models (`gemini-3.7-flash`, `stheno-13b`).
* `PROJECTION`: Derived read-only compiled views (`graph.json`, `projects.json`).

### 2. Typed Edge Taxonomy
Relationships between entities are represented by explicit typed edges:
* `DEPENDS_ON`: Functional or runtime dependency (A requires B to execute).
* `DERIVED_FROM`: Provenance/projection lineage (A was compiled/generated from B).
* `PRODUCES`: Artifact generation (Tool/WP A outputs artifact B).
* `IMPLEMENTS`: Realization (Code/system A implements specification/ADR B).
* `VALIDATES`: Verification (Test/gate A verifies component B).
* `EVIDENCES`: Epistemic support (Receipt/observation A evidences claim B).
* `OWNS`: Authority boundary (Subsystem A owns path/domain B).
* `BLOCKS`: Execution blocker (Item A prevents item B from proceeding).
* `SUPERSEDES`: Replacement (New artifact A replaces deprecated artifact B).
* `RELATES_TO`: Associative conceptual link (General wikilink connection).

### 3. Epistemic Edge Authority Classes
Every edge in the graph MUST carry an explicit authority classification:
* **`EXPLICIT_CANONICAL`**: Explicitly authored by a human in note frontmatter (`depends_on`, `supersedes`) or accepted ADRs.
* **`DETERMINISTIC_DERIVED`**: Extracted deterministically by compiler/linters from wikilinks (`[[target]]`), code imports (`import ... from '...'`), or workctl task links.
* **`HEURISTIC_SUGGESTION`**: Inferred by an AI agent, semantic embedding, or graph clustering algorithm.

**Invariant**: `HEURISTIC_SUGGESTION` edges MUST NOT be serialized into canonical notes or treated as authoritative facts without human review and explicit promotion.

### 4. Graph Interchange Format
The canonical graph is compiled into `vault/90_Derived/Projections/graph.json` under schema `kad-canonical-graph-v1`:
```json
{
  "schema": "kad-canonical-graph-v1",
  "source_vault_revision": "<sha256>",
  "generated_at": "<ISO8601>",
  "nodes": [
    {
      "id": "kad-current-architecture",
      "label": "Current Architecture",
      "type": "architecture",
      "authority": "CANONICAL_KNOWLEDGE",
      "epistemic_class": "PROJECT_INFERENCE",
      "path": "50_Projects/KAD-PI/Architecture/Current-Architecture.md"
    }
  ],
  "edges": [
    {
      "source": "kad-current-architecture",
      "target": "kad-pi-overview",
      "type": "RELATES_TO",
      "authority_class": "DETERMINISTIC_DERIVED"
    }
  ]
}
```

## Consequences

### Positive
- One unified graph contract shared by Obsidian, Sofia v3, Cytoscape visualizations, and OMP agent tools.
- Prevents hallucinated or probabilistic connections from masquerading as canonical truth.
- High testability and deterministic compilation.
