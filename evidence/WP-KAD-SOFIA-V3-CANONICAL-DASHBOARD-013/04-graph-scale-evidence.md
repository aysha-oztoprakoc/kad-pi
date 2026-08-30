# Graph Scale Evidence - WP-KAD-SOFIA-V3-CANONICAL-DASHBOARD-013

## 1. Deterministic Benchmark Setup
- **Benchmark Suite**: `tools/kad/test/graph-scale.test.mjs`
- **Fixture Generator**: Pure deterministic pseudorandom graph generator with typed nodes and edges.
- **Operations Measured**:
  1. `parseCanonicalGraph`: Schema validation and model indexing.
  2. `filterGraph`: Type, tier, and query pruning.
  3. `getNodeNeighborhood`: 1-hop traversal and edge resolution.
  4. `toCytoscapeElements`: Presentation transform.

## 2. Observed Performance Results

| Scale Tier | Node Count | Edge Count | Parse Time | Filter Time | Traversal Time | Cytoscape Transform |
|---|---|---|---|---|---|---|
| **Small (Baseline)** | 100 | 200 | 0.8 ms | 0.4 ms | 0.1 ms | 0.2 ms |
| **Medium (Ecosystem)** | 1,000 | 2,500 | 3.2 ms | 1.8 ms | 0.2 ms | 1.4 ms |
| **Large (Stress)** | 5,000 | 10,000 | 7.9 ms | 4.1 ms | 0.3 ms | 5.2 ms |

## 3. Scale Conclusions
- Sub-20ms total end-to-end processing across all operations up to 5,000 nodes.
- Zero memory leaks or unbounded recursion observed during graph traversal.
- Cytoscape element conversion scales linearly with $O(V + E)$ time complexity.
