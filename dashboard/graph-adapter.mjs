/**
 * Sofia v3 Renderer-Independent Graph View-Model & Cytoscape Adapter
 *
 * Invariants:
 * 1. Canonical graph contract (kad-canonical-graph-v1) is renderer-independent.
 * 2. 3-Tier Epistemic authority is strictly preserved (EXPLICIT_CANONICAL, DETERMINISTIC_DERIVED, HEURISTIC_SUGGESTION).
 * 3. Cytoscape adapter generates pure presentation elements without mutating source projections.
 */

export const GRAPH_SCHEMA = 'kad-canonical-graph-v1';

export const GRAPH_NODE_CLASSES = Object.freeze([
  'PROJECT',
  'WORKPACKAGE',
  'DECISION',
  'CANONICAL_NOTE',
  'RESEARCH_PAPER',
  'RESEARCH_CLAIM',
  'AGENT',
  'TOOL',
  'SERVICE',
  'MODEL',
  'PROJECTION',
  'PROPOSAL'
]);

export const GRAPH_EDGE_TYPES = Object.freeze([
  'DEPENDS_ON',
  'DERIVED_FROM',
  'PRODUCES',
  'IMPLEMENTS',
  'VALIDATES',
  'EVIDENCES',
  'OWNS',
  'BLOCKS',
  'SUPERSEDES',
  'RELATES_TO'
]);

export const EPISTEMIC_TIERS = Object.freeze([
  'EXPLICIT_CANONICAL',
  'DETERMINISTIC_DERIVED',
  'HEURISTIC_SUGGESTION'
]);
export function parseCanonicalGraph(projection) {
  if (!projection || typeof projection !== 'object') {
    throw new Error('Malformed graph projection: expected an object');
  }
  if (projection.schema !== GRAPH_SCHEMA) {
    throw new Error(`Invalid graph projection schema: expected ${GRAPH_SCHEMA}, got ${projection.schema}`);
  }

  const rawNodes = Array.isArray(projection.nodes) ? projection.nodes : [];
  const rawEdges = Array.isArray(projection.edges) ? projection.edges : [];

  const nodes = rawNodes.map(node => {
    const id = String(node.kad_id || node.id || '');
    const label = String(node.title || node.label || node.kad_id || node.id || '');
    const type = String(node.type || 'CANONICAL_NOTE').toUpperCase();
    const epistemic_tier = String(node.epistemic_tier || node.epistemic_class || 'DETERMINISTIC_DERIVED').toUpperCase();
    return {
      id,
      label,
      type,
      epistemic_tier,
      metadata: node.metadata && typeof node.metadata === 'object' ? { ...node.metadata } : { ...node }
    };
  });

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  const edges = rawEdges.map((edge, idx) => ({
    id: String(edge.id || `e-${idx}`),
    source: String(edge.source || ''),
    target: String(edge.target || ''),
    type: edge.type || 'RELATES_TO',
    epistemic_tier: edge.epistemic_tier || 'DETERMINISTIC_DERIVED',
    metadata: edge.metadata && typeof edge.metadata === 'object' ? { ...edge.metadata } : {}
  }));

  const edgeMap = new Map(edges.map(e => [e.id, e]));

  return {
    schema: projection.schema,
    source_vault_revision: projection.source_vault_revision || 'unknown',
    generated_at: projection.generated_at || new Date().toISOString(),
    nodes,
    edges,
    get nodeCount() { return nodes.length; },
    get edgeCount() { return edges.length; },
    getNode(id) { return nodeMap.get(id) || null; },
    getEdge(id) { return edgeMap.get(id) || null; }
  };
}

export function filterGraph(graph, { nodeTypes = null, edgeTypes = null, epistemicTiers = null, query = null } = {}) {
  const allowedNodeTypes = nodeTypes ? new Set(nodeTypes) : null;
  const allowedEdgeTypes = edgeTypes ? new Set(edgeTypes) : null;
  const allowedTiers = epistemicTiers ? new Set(epistemicTiers) : null;
  const q = query ? String(query).toLowerCase().trim() : null;

  const filteredNodes = graph.nodes.filter(node => {
    if (allowedNodeTypes && !allowedNodeTypes.has(node.type)) return false;
    if (allowedTiers && !allowedTiers.has(node.epistemic_tier)) return false;
    if (q) {
      const matchId = node.id.toLowerCase().includes(q);
      const matchLabel = node.label.toLowerCase().includes(q);
      const matchType = node.type.toLowerCase().includes(q);
      if (!matchId && !matchLabel && !matchType) return false;
    }
    return true;
  });

  const activeNodeIds = new Set(filteredNodes.map(n => n.id));

  const filteredEdges = graph.edges.filter(edge => {
    if (!activeNodeIds.has(edge.source) || !activeNodeIds.has(edge.target)) return false;
    if (allowedEdgeTypes && !allowedEdgeTypes.has(edge.type)) return false;
    if (allowedTiers && !allowedTiers.has(edge.epistemic_tier)) return false;
    return true;
  });

  return {
    schema: graph.schema,
    source_vault_revision: graph.source_vault_revision,
    generated_at: graph.generated_at,
    nodes: filteredNodes,
    edges: filteredEdges,
    get nodeCount() { return filteredNodes.length; },
    get edgeCount() { return filteredEdges.length; }
  };
}

export function searchGraphNodes(graph, query) {
  if (!query || typeof query !== 'string') return [];
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return graph.nodes.filter(node => {
    if (node.id.toLowerCase().includes(q)) return true;
    if (node.label.toLowerCase().includes(q)) return true;
    if (node.type.toLowerCase().includes(q)) return true;
    if (node.metadata) {
      for (const val of Object.values(node.metadata)) {
        if (typeof val === 'string' && val.toLowerCase().includes(q)) return true;
        if (typeof val === 'number' && String(val).includes(q)) return true;
      }
    }
    return false;
  });
}

export function getNodeNeighborhood(graph, nodeId) {
  const center = (typeof graph.getNode === 'function') ? graph.getNode(nodeId) : graph.nodes.find(n => n.id === nodeId);
  if (!center) return null;

  const connectedEdges = graph.edges.filter(e => e.source === nodeId || e.target === nodeId);
  const neighborIds = new Set();
  for (const edge of connectedEdges) {
    if (edge.source !== nodeId) neighborIds.add(edge.source);
    if (edge.target !== nodeId) neighborIds.add(edge.target);
  }

  const neighbors = graph.nodes.filter(n => neighborIds.has(n.id));

  return {
    center,
    neighbors,
    edges: connectedEdges
  };
}

function tierToCssClass(tier) {
  return `tier-${String(tier || 'unknown').toLowerCase().replace(/_/g, '-')}`;
}

export function toCytoscapeElements(graph) {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph.edges) ? graph.edges : [];

  const cyNodes = nodes.map(node => ({
    group: 'nodes',
    data: {
      id: node.id,
      label: node.label,
      type: node.type,
      epistemic_tier: node.epistemic_tier,
      ...node.metadata
    },
    classes: `node-${node.type.toLowerCase().replace(/_/g, '-')} ${tierToCssClass(node.epistemic_tier)}`
  }));

  const cyEdges = edges.map(edge => ({
    group: 'edges',
    data: {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      epistemic_tier: edge.epistemic_tier,
      ...edge.metadata
    },
    classes: `edge-${edge.type.toLowerCase().replace(/_/g, '-')} ${tierToCssClass(edge.epistemic_tier)}`
  }));

  return [...cyNodes, ...cyEdges];
}
