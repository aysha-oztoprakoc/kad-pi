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

const MOCK_GRAPH_PROJECTION = {
  schema: 'kad-canonical-graph-v1',
  source_vault_revision: 'test-rev-123',
  generated_at: '2026-08-30T00:00:00.000Z',
  nodes: [
    { id: 'kad-pi', label: 'KAD-PI', type: 'PROJECT', epistemic_tier: 'EXPLICIT_CANONICAL', metadata: { status: 'ACTIVE' } },
    { id: 'WP-001', label: 'Workspace Substrate', type: 'WORKPACKAGE', epistemic_tier: 'EXPLICIT_CANONICAL', metadata: { status: 'ACCEPTED' } },
    { id: 'ADR-0001', label: 'Unified Knowledge Model', type: 'DECISION', epistemic_tier: 'EXPLICIT_CANONICAL', metadata: { status: 'ACCEPTED' } },
    { id: 'note-runtime', label: 'Runtime Status Note', type: 'CANONICAL_NOTE', epistemic_tier: 'DETERMINISTIC_DERIVED', metadata: { path: '50_Projects/KAD-PI/Architecture/Runtime.md' } },
    { id: 'paper-react', label: 'ReAct Paper', type: 'RESEARCH_PAPER', epistemic_tier: 'EXPLICIT_CANONICAL', metadata: { year: 2022 } },
    { id: 'agent-suggested', label: 'Heuristic Cluster', type: 'PROPOSAL', epistemic_tier: 'HEURISTIC_SUGGESTION', metadata: { confidence: 0.7 } }
  ],
  edges: [
    { id: 'e1', source: 'WP-001', target: 'kad-pi', type: 'IMPLEMENTS', epistemic_tier: 'EXPLICIT_CANONICAL' },
    { id: 'e2', source: 'WP-001', target: 'ADR-0001', type: 'VALIDATES', epistemic_tier: 'EXPLICIT_CANONICAL' },
    { id: 'e3', source: 'note-runtime', target: 'kad-pi', type: 'DERIVED_FROM', epistemic_tier: 'DETERMINISTIC_DERIVED' },
    { id: 'e4', source: 'agent-suggested', target: 'paper-react', type: 'RELATES_TO', epistemic_tier: 'HEURISTIC_SUGGESTION' }
  ]
};

test('Graph Adapter Contract: parses canonical graph schema and retains all nodes and edges', () => {
  const model = parseCanonicalGraph(MOCK_GRAPH_PROJECTION);
  assert.equal(model.schema, 'kad-canonical-graph-v1');
  assert.equal(model.source_vault_revision, 'test-rev-123');
  assert.equal(model.nodeCount, 6);
  assert.equal(model.edgeCount, 4);

  const wpNode = model.getNode('WP-001');
  assert.ok(wpNode);
  assert.equal(wpNode.label, 'Workspace Substrate');
  assert.equal(wpNode.type, 'WORKPACKAGE');
  assert.equal(wpNode.epistemic_tier, 'EXPLICIT_CANONICAL');
});

test('Graph Adapter Contract: rejects or handles malformed graph projection gracefully', () => {
  assert.throws(() => parseCanonicalGraph(null), /Malformed graph projection/);
  assert.throws(() => parseCanonicalGraph({ schema: 'invalid-schema' }), /Invalid graph projection schema/);

  // Handles missing edges/nodes array by defaulting to empty arrays
  const partial = parseCanonicalGraph({ schema: 'kad-canonical-graph-v1', nodes: [] });
  assert.equal(partial.nodeCount, 0);
  assert.equal(partial.edgeCount, 0);
});

test('Graph Adapter Contract: filters nodes and edges by node type and epistemic tier', () => {
  const model = parseCanonicalGraph(MOCK_GRAPH_PROJECTION);

  // Filter by node type
  const wpOnly = filterGraph(model, { nodeTypes: ['WORKPACKAGE'] });
  assert.equal(wpOnly.nodes.length, 1);
  assert.equal(wpOnly.nodes[0].id, 'WP-001');
  assert.equal(wpOnly.edges.length, 0); // Connected edges filtered out since target not in node set

  // Filter by epistemic tier (exclude heuristic suggestions)
  const canonicalOnly = filterGraph(model, { epistemicTiers: ['EXPLICIT_CANONICAL', 'DETERMINISTIC_DERIVED'] });
  assert.equal(canonicalOnly.nodes.length, 5);
  assert.ok(!canonicalOnly.nodes.some(n => n.id === 'agent-suggested'));
  assert.equal(canonicalOnly.edges.length, 3);
});

test('Graph Adapter Contract: searches nodes by ID, label, and metadata text', () => {
  const model = parseCanonicalGraph(MOCK_GRAPH_PROJECTION);

  const search1 = searchGraphNodes(model, 'ReAct');
  assert.equal(search1.length, 1);
  assert.equal(search1[0].id, 'paper-react');

  const search2 = searchGraphNodes(model, 'ADR-');
  assert.equal(search2.length, 1);
  assert.equal(search2[0].id, 'ADR-0001');

  const searchEmpty = searchGraphNodes(model, 'non-existent-query');
  assert.equal(searchEmpty.length, 0);
});

test('Graph Adapter Contract: extracts 1-hop neighborhood for a given node', () => {
  const model = parseCanonicalGraph(MOCK_GRAPH_PROJECTION);

  const hood = getNodeNeighborhood(model, 'WP-001');
  assert.equal(hood.center.id, 'WP-001');
  assert.equal(hood.neighbors.length, 2); // kad-pi, ADR-0001
  assert.ok(hood.neighbors.some(n => n.id === 'kad-pi'));
  assert.ok(hood.neighbors.some(n => n.id === 'ADR-0001'));
  assert.equal(hood.edges.length, 2);
});

test('Graph Adapter Contract: converts graph model to Cytoscape.js compatible element structure', () => {
  const model = parseCanonicalGraph(MOCK_GRAPH_PROJECTION);
  const elements = toCytoscapeElements(model);

  assert.ok(Array.isArray(elements));
  assert.equal(elements.length, 10); // 6 nodes + 4 edges

  const cyNode = elements.find(el => el.data.id === 'WP-001');
  assert.ok(cyNode);
  assert.equal(cyNode.data.label, 'Workspace Substrate');
  assert.equal(cyNode.data.type, 'WORKPACKAGE');
  assert.equal(cyNode.data.epistemic_tier, 'EXPLICIT_CANONICAL');
  assert.equal(cyNode.classes, 'node-workpackage tier-explicit-canonical');

  const cyEdge = elements.find(el => el.data.id === 'e1');
  assert.ok(cyEdge);
  assert.equal(cyEdge.data.source, 'WP-001');
  assert.equal(cyEdge.data.target, 'kad-pi');
  assert.equal(cyEdge.data.type, 'IMPLEMENTS');
  assert.equal(cyEdge.classes, 'edge-implements tier-explicit-canonical');
});
