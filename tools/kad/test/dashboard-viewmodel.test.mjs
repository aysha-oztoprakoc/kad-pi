import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  summarizeProjects,
  summarizeWorkpackages,
  summarizeResearchCorpus,
  summarizeTechnologyRegistry,
  buildWorkpackageStatusChartOptions,
  buildProjectClassificationChartOptions,
  createDegradedDashboardState
} from '../../../dashboard/adapter.mjs';

const MOCK_PROJECTS = {
  schema: 'kad-canonical-projects-v1',
  projects: [
    { id: 'kad-pi', name: 'KAD-PI', classification: 'CORE', status: 'ACTIVE' },
    { id: 'data_workspace', name: 'data_workspace', classification: 'ACTIVE_SUPPORTING', status: 'ACTIVE' },
    { id: 'DATA_REIN', name: 'DATA_REIN', classification: 'LEGACY', status: 'SUPERSEDED' }
  ]
};

const MOCK_WORKPACKAGES = {
  schema: 'kad-canonical-workpackages-v1',
  workpackages: [
    { wp_id: 'WP-001', title: 'Task 1', status: 'ACCEPTED' },
    { wp_id: 'WP-002', title: 'Task 2', status: 'ACCEPTED' },
    { wp_id: 'WP-010', title: 'Task 10', status: 'REVIEW' },
    { wp_id: 'WP-013', title: 'Task 13', status: 'IN_PROGRESS' }
  ]
};

const MOCK_RESEARCH = {
  schema: 'kad-research-corpus-v1',
  corpus: [
    { id: 'react', title: 'ReAct', year: 2022, epistemic_verification: 'SOURCE_FACT_VERIFIED' },
    { id: 'toolformer', title: 'Toolformer', year: 2023, epistemic_verification: 'SOURCE_FACT_VERIFIED' }
  ]
};

test('Dashboard View-Model Contract: summarizes project statistics deterministically', () => {
  const summary = summarizeProjects(MOCK_PROJECTS);
  assert.equal(summary.total, 3);
  assert.equal(summary.byClassification.CORE, 1);
  assert.equal(summary.byClassification.ACTIVE_SUPPORTING, 1);
  assert.equal(summary.byClassification.LEGACY, 1);
  assert.equal(summary.activeCount, 2);
});

test('Dashboard View-Model Contract: summarizes workpackage status breakdown', () => {
  const summary = summarizeWorkpackages(MOCK_WORKPACKAGES);
  assert.equal(summary.total, 4);
  assert.equal(summary.byStatus.ACCEPTED, 2);
  assert.equal(summary.byStatus.REVIEW, 1);
  assert.equal(summary.byStatus.IN_PROGRESS, 1);
  assert.equal(summary.completionRate, 50); // 2 / 4 = 50%
});

test('Dashboard View-Model Contract: summarizes research corpus bibliographic metadata', () => {
  const summary = summarizeResearchCorpus(MOCK_RESEARCH);
  assert.equal(summary.totalPapers, 2);
  assert.equal(summary.verifiedCount, 2);
  assert.deepEqual(summary.years, [2022, 2023]);
});

test('Dashboard View-Model Contract: builds ECharts option spec for workpackage status distribution', () => {
  const options = buildWorkpackageStatusChartOptions(MOCK_WORKPACKAGES);
  assert.ok(options);
  assert.equal(options.tooltip?.trigger, 'item');
  assert.ok(Array.isArray(options.series));
  assert.equal(options.series[0].type, 'pie');

  const data = options.series[0].data;
  assert.ok(data.some(d => d.name === 'ACCEPTED' && d.value === 2));
  assert.ok(data.some(d => d.name === 'REVIEW' && d.value === 1));
});

test('Dashboard View-Model Contract: builds ECharts option spec for project classification distribution', () => {
  const options = buildProjectClassificationChartOptions(MOCK_PROJECTS);
  assert.ok(options);
  assert.ok(Array.isArray(options.series));
  assert.equal(options.series[0].type, 'bar');

  assert.deepEqual(options.xAxis.data, ['CORE', 'ACTIVE_SUPPORTING', 'LEGACY']);
  assert.deepEqual(options.series[0].data, [1, 1, 1]);
});

test('Dashboard View-Model Contract: produces explicit degraded state on missing or invalid projection inputs', () => {
  const degraded = createDegradedDashboardState({
    graphError: 'Failed to fetch graph projection',
    runtimeError: 'Runtime status offline'
  });

  assert.equal(degraded.status, 'DEGRADED');
  assert.equal(degraded.graph.available, false);
  assert.equal(degraded.graph.error, 'Failed to fetch graph projection');
  assert.equal(degraded.runtime.available, false);
  assert.equal(degraded.runtime.error, 'Runtime status offline');
});
