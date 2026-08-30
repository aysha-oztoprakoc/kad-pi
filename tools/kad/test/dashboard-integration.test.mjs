import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  parseCanonicalGraph,
  filterGraph,
  searchGraphNodes,
  getNodeNeighborhood,
  toCytoscapeElements
} from '../../../dashboard/graph-adapter.mjs';
import {
  summarizeProjects,
  summarizeWorkpackages,
  summarizeResearchCorpus,
  summarizeTechnologyRegistry,
  buildWorkpackageStatusChartOptions,
  buildProjectClassificationChartOptions,
  createDegradedDashboardState
} from '../../../dashboard/adapter.mjs';

const PROJECTIONS_DIR = join(process.cwd(), 'vault/90_Derived/Projections');

function loadRealProjection(filename) {
  const content = readFileSync(join(PROJECTIONS_DIR, filename), 'utf-8');
  return JSON.parse(content);
}

test('Dashboard Integration: parses real KAD graph projection accurately', () => {
  const realGraph = loadRealProjection('graph.json');
  const model = parseCanonicalGraph(realGraph);

  assert.equal(model.schema, 'kad-canonical-graph-v1');
  assert.ok(model.nodeCount >= 30, `Expected at least 30 nodes, got ${model.nodeCount}`);
  assert.ok(model.edgeCount >= 20, `Expected at least 20 edges, got ${model.edgeCount}`);

  // Test real node retrieval
  const overviewNode = model.getNode('kad-pi-overview');
  assert.ok(overviewNode, 'Expected kad-pi-overview node in canonical graph');
  assert.equal(overviewNode.type, 'PROJECT');

  // Test neighborhood retrieval for kad-pi-overview
  const hood = getNodeNeighborhood(model, 'kad-pi-overview');
  assert.ok(hood);

  // Test Cytoscape element conversion
  const elements = toCytoscapeElements(model);
  assert.equal(elements.length, model.nodeCount + model.edgeCount);
  assert.ok(elements.some(el => el.data.id === 'kad-pi-overview' && el.classes.includes('node-project')));
});

test('Dashboard Integration: filters real KAD graph by node type and tier', () => {
  const realGraph = loadRealProjection('graph.json');
  const model = parseCanonicalGraph(realGraph);

  // Filter for workpackages only
  const workpackages = filterGraph(model, { nodeTypes: ['WORKPACKAGE'] });
  assert.ok(workpackages.nodes.length >= 5);
  assert.ok(workpackages.nodes.every(n => n.type === 'WORKPACKAGE'));

  // Search real node
  const results = searchGraphNodes(model, 'Observatory');
  assert.ok(results.length > 0);
  assert.ok(results.some(r => r.label.includes('Observatory') || r.id.includes('Observatory')));
});

test('Dashboard Integration: summarizes real KAD projects projection and builds chart', () => {
  const realProjects = loadRealProjection('projects.json');
  const summary = summarizeProjects(realProjects);

  assert.ok(summary.total >= 4);
  assert.ok(summary.activeCount >= 1);
  assert.ok(summary.byClassification.CORE >= 1);

  const chartOptions = buildProjectClassificationChartOptions(realProjects);
  assert.ok(chartOptions);
  assert.equal(chartOptions.series[0].type, 'bar');
  assert.ok(chartOptions.series[0].data.length > 0);
});

test('Dashboard Integration: summarizes real KAD workpackages and builds chart', () => {
  const realWorkpackages = loadRealProjection('workpackages.json');
  const summary = summarizeWorkpackages(realWorkpackages);

  assert.ok(summary.total >= 5);
  assert.ok(summary.acceptedCount >= 3);
  assert.ok(summary.completionRate > 0);

  const chartOptions = buildWorkpackageStatusChartOptions(realWorkpackages);
  assert.ok(chartOptions);
  assert.equal(chartOptions.series[0].type, 'pie');
  assert.ok(chartOptions.series[0].data.length > 0);
});

test('Dashboard Integration: summarizes real KAD research corpus', () => {
  const realResearch = loadRealProjection('research.json');
  const summary = summarizeResearchCorpus(realResearch);

  assert.ok(summary.totalPapers >= 5);
  assert.ok(summary.verifiedCount >= 5);
  assert.ok(summary.years.includes(2023));
  assert.ok(summary.years.includes(2024));
});

test('Dashboard Integration: summarizes real KAD technology registry', () => {
  const realTech = loadRealProjection('technology-registry.json');
  const summary = summarizeTechnologyRegistry(realTech);

  assert.ok(summary.total >= 8);
  assert.ok(summary.byDecision.KEEP >= 2);
  assert.ok(summary.byDecision.ADOPT >= 2);
});

test('Dashboard Integration: degraded state builder handles partial failures cleanly', () => {
  const partial = createDegradedDashboardState({
    graphError: 'Network timeout',
    runtimeError: null
  });

  assert.equal(partial.status, 'DEGRADED');
  assert.equal(partial.graph.available, false);
  assert.equal(partial.runtime.available, true);
});
