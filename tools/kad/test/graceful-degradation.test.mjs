import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCanonicalGraph,
  filterGraph
} from '../../../dashboard/graph-adapter.mjs';
import {
  summarizeProjects,
  summarizeWorkpackages,
  createDegradedDashboardState
} from '../../../dashboard/adapter.mjs';
import {
  createRuntimeStatus,
  applyStaleness,
  validateRuntimeStatus
} from '../runtime-status.mjs';

test('Graceful Degradation Case 1: Graph parser fails closed without crashing on null/corrupt input', () => {
  assert.throws(() => parseCanonicalGraph(null), /Malformed graph projection/);
  assert.throws(() => parseCanonicalGraph({ schema: 'corrupt-v99' }), /Invalid graph projection schema/);

  // Clean fallback model for empty projection
  const empty = parseCanonicalGraph({ schema: 'kad-canonical-graph-v1', nodes: [], edges: [] });
  assert.equal(empty.nodeCount, 0);
  assert.equal(empty.edgeCount, 0);
  const filtered = filterGraph(empty, { query: 'anything' });
  assert.equal(filtered.nodeCount, 0);
});

test('Graceful Degradation Case 2: Summary functions survive empty or missing projection objects', () => {
  const projSummary = summarizeProjects(null);
  assert.equal(projSummary.total, 0);
  assert.equal(projSummary.activeCount, 0);

  const wpSummary = summarizeWorkpackages({});
  assert.equal(wpSummary.total, 0);
  assert.equal(wpSummary.completionRate, 0);
});

test('Graceful Degradation Case 3: Runtime status probe unavailable creates explicit UNAVAILABLE state', () => {
  const offlineStatus = createRuntimeStatus(undefined, {
    observedAt: new Date().toISOString(),
    state: 'UNAVAILABLE',
    reason: 'Connection refused on localhost probe'
  });

  assert.equal(offlineStatus.state, 'UNAVAILABLE');
  assert.equal(offlineStatus.reason, 'Connection refused on localhost probe');
  assert.equal(validateRuntimeStatus(offlineStatus), true);

  // Stale detection
  const staleStatus = applyStaleness(createRuntimeStatus(undefined, {
    observedAt: new Date(Date.now() - 60000).toISOString(),
    state: 'AVAILABLE'
  }), { maxAgeMs: 30000 });

  assert.equal(staleStatus.state, 'STALE');
  assert.match(staleStatus.reason, /exceeded stale threshold/);
});

test('Graceful Degradation Case 4: Multi-projection error isolation produces composite degraded state', () => {
  const state = createDegradedDashboardState({
    graphError: 'Failed to load graph.json (404)',
    runtimeError: 'Runtime daemon offline'
  });

  assert.equal(state.status, 'DEGRADED');
  assert.equal(state.graph.available, false);
  assert.equal(state.graph.error, 'Failed to load graph.json (404)');
  assert.equal(state.runtime.available, false);
  assert.equal(state.runtime.error, 'Runtime daemon offline');
});

test('Graceful Degradation Case 5: Missing optional projection does not poison unaffected subsystems', () => {
  const validProjects = {
    schema: 'kad-canonical-projects-v1',
    projects: [{ project_id: 'kad-pi', name: 'KAD-PI', role: 'CORE', status: 'ACTIVE' }]
  };
  const missingWorkpackages = null;

  const pSummary = summarizeProjects(validProjects);
  const wpSummary = summarizeWorkpackages(missingWorkpackages);

  assert.equal(pSummary.total, 1);
  assert.equal(pSummary.activeCount, 1);
  assert.equal(wpSummary.total, 0);
});
