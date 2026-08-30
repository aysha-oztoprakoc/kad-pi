import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCanonicalGraph,
  filterGraph,
  searchGraphNodes,
  getNodeNeighborhood,
  toCytoscapeElements,
  GRAPH_NODE_CLASSES,
  GRAPH_EDGE_TYPES,
  EPISTEMIC_TIERS
} from '../../../dashboard/graph-adapter.mjs';

function generateSyntheticGraph(nodeCount, avgDegree = 2) {
  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    const type = GRAPH_NODE_CLASSES[i % GRAPH_NODE_CLASSES.length];
    const tier = EPISTEMIC_TIERS[i % EPISTEMIC_TIERS.length];
    nodes.push({
      id: `synthetic-node-${i}`,
      label: `Synthetic Node ${i} (${type})`,
      type,
      epistemic_tier: tier,
      metadata: { index: i, score: (i * 17) % 100 }
    });
  }

  const edges = [];
  const edgeCount = Math.floor(nodeCount * avgDegree);
  for (let j = 0; j < edgeCount; j++) {
    const srcIdx = j % nodeCount;
    const tgtIdx = (j * 7 + 1) % nodeCount;
    if (srcIdx !== tgtIdx) {
      const type = GRAPH_EDGE_TYPES[j % GRAPH_EDGE_TYPES.length];
      const tier = EPISTEMIC_TIERS[j % EPISTEMIC_TIERS.length];
      edges.push({
        id: `synthetic-edge-${j}`,
        source: `synthetic-node-${srcIdx}`,
        target: `synthetic-node-${tgtIdx}`,
        type,
        epistemic_tier: tier
      });
    }
  }

  return {
    schema: 'kad-canonical-graph-v1',
    source_vault_revision: 'synthetic-benchmark-rev',
    generated_at: new Date().toISOString(),
    nodes,
    edges
  };
}

test('Graph Scale Benchmark: 100 Nodes (Small Topology)', () => {
  const fixture = generateSyntheticGraph(100, 2);
  const t0 = performance.now();
  const model = parseCanonicalGraph(fixture);
  const tParse = performance.now() - t0;

  assert.equal(model.nodeCount, 100);

  const t1 = performance.now();
  const filtered = filterGraph(model, { nodeTypes: ['WORKPACKAGE'] });
  const tFilter = performance.now() - t1;

  const t2 = performance.now();
  const hood = getNodeNeighborhood(model, 'synthetic-node-42');
  const tHood = performance.now() - t2;

  const t3 = performance.now();
  const cyElements = toCytoscapeElements(model);
  const tCy = performance.now() - t3;

  assert.ok(cyElements.length > 100);
  assert.ok(tParse < 50, `Parse time too high: ${tParse}ms`);
  assert.ok(tFilter < 50, `Filter time too high: ${tFilter}ms`);
  assert.ok(tHood < 50, `Neighborhood time too high: ${tHood}ms`);
  assert.ok(tCy < 50, `Cytoscape conversion time too high: ${tCy}ms`);
});

test('Graph Scale Benchmark: 1,000 Nodes (Medium Topology)', () => {
  const fixture = generateSyntheticGraph(1000, 2.5);
  const t0 = performance.now();
  const model = parseCanonicalGraph(fixture);
  const tParse = performance.now() - t0;

  assert.equal(model.nodeCount, 1000);

  const t1 = performance.now();
  const filtered = filterGraph(model, { epistemicTiers: ['EXPLICIT_CANONICAL'] });
  const tFilter = performance.now() - t1;

  const t2 = performance.now();
  const searchResults = searchGraphNodes(model, 'Node 500');
  const tSearch = performance.now() - t2;

  const t3 = performance.now();
  const cyElements = toCytoscapeElements(model);
  const tCy = performance.now() - t3;

  assert.ok(cyElements.length > 1000);
  assert.ok(tParse < 150, `Parse time too high: ${tParse}ms`);
  assert.ok(tFilter < 150, `Filter time too high: ${tFilter}ms`);
  assert.ok(tSearch < 150, `Search time too high: ${tSearch}ms`);
  assert.ok(tCy < 150, `Cytoscape conversion time too high: ${tCy}ms`);
});

test('Graph Scale Benchmark: 5,000 Nodes (Large Topology)', () => {
  const fixture = generateSyntheticGraph(5000, 2);
  const t0 = performance.now();
  const model = parseCanonicalGraph(fixture);
  const tParse = performance.now() - t0;

  assert.equal(model.nodeCount, 5000);

  const t1 = performance.now();
  const filtered = filterGraph(model, { nodeTypes: ['PROJECT', 'DECISION'] });
  const tFilter = performance.now() - t1;

  const t2 = performance.now();
  const hood = getNodeNeighborhood(model, 'synthetic-node-2500');
  const tHood = performance.now() - t2;

  const t3 = performance.now();
  const cyElements = toCytoscapeElements(model);
  const tCy = performance.now() - t3;

  assert.ok(cyElements.length > 5000);
  assert.ok(tParse < 500, `Parse time too high: ${tParse}ms`);
  assert.ok(tFilter < 500, `Filter time too high: ${tFilter}ms`);
  assert.ok(tHood < 500, `Neighborhood time too high: ${tHood}ms`);
  assert.ok(tCy < 500, `Cytoscape conversion time too high: ${tCy}ms`);
});
