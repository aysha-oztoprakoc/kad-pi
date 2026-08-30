# Agentic Graph Contract Record — WP-KAD-TECHNOLOGY-STACK-AND-AGENTIC-VISUALIZATION-ARCHITECTURE-012

## 1. Typed Graph Invariants
- **Node Classes**: `PROJECT`, `WORKPACKAGE`, `DECISION`, `CANONICAL_NOTE`, `RESEARCH_PAPER`, `RESEARCH_CLAIM`, `AGENT`, `TOOL`, `SERVICE`, `MODEL`, `PROJECTION`.
- **Typed Edge Taxonomy**:
  - `DEPENDS_ON` (Runtime requirement)
  - `DERIVED_FROM` (Provenance lineage)
  - `PRODUCES` (Artifact output)
  - `IMPLEMENTS` (ADR realization)
  - `VALIDATES` (Verification test/gate)
  - `EVIDENCES` (Observation support)
  - `OWNS` (Authority boundary)
  - `BLOCKS` (Execution blocker)
  - `SUPERSEDES` (Version replacement)
  - `RELATES_TO` (Conceptual association)
- **Authority Tiers**:
  - `EXPLICIT_CANONICAL`: Human-authored in note frontmatter / ADR.
  - `DETERMINISTIC_DERIVED`: Compiled from imports, wikilinks, task links.
  - `HEURISTIC_SUGGESTION`: Agent suggestions (must remain unpromoted until reviewed).
