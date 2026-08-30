# Project Graph Export Record — WP-KAD-CANONICAL-PROJECTION-SYNCHRONIZATION-011

## 1. Export Metadata
- **Target Path**: `vault/90_Derived/Projections/graph.json`
- **Schema**: `kad-canonical-graph-v1`
- **Generator**: `exportProjectGraph` in `tools/kad/wiki/projection.mjs`

## 2. Invariants
- Nodes represent governed vault markdown files with verified frontmatter properties.
- Edges represent explicit bidirectional / unidirectional wikilinks (`[[Target|Label]]`) discovered in the note text.
- No LLM-inferred or speculative edges are included.
- Validated via `tools/kad/test/projection-compiler.test.mjs`.
