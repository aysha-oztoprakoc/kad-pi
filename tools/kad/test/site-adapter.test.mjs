import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterPublicRecords,
  searchPublicRecords,
  filterRecordsByType,
  summarizePublicState,
  PUBLICATION_FILTER_SCHEMA
} from '../../../site/adapter.mjs';

test('Site Adapter: searchPublicRecords filters deterministically on title and query', () => {
  const records = [
    { id: 'WP-01', title: 'Architecture Engine', description: 'Core system rules', type: 'PROJECT' },
    { id: 'WP-02', title: 'Telemetry Bridge', description: 'Usage and quota telemetry', type: 'DECISION' },
    { id: 'WP-03', title: 'Research Corpus', description: 'Five-paper evaluation', type: 'RESEARCH_PAPER' }
  ];

  const resArchitecture = searchPublicRecords(records, 'architecture');
  assert.equal(resArchitecture.length, 1);
  assert.equal(resArchitecture[0].id, 'WP-01');

  const resTelemetry = searchPublicRecords(records, 'telemetry');
  assert.equal(resTelemetry.length, 1);
  assert.equal(resTelemetry[0].id, 'WP-02');

  const resAll = searchPublicRecords(records, '');
  assert.equal(resAll.length, 3);
});

test('Site Adapter: filterRecordsByType filters records by type/namespace', () => {
  const records = [
    { id: 'REC-1', title: 'A', type: 'PROJECT' },
    { id: 'REC-2', title: 'B', type: 'RESEARCH_PAPER' },
    { id: 'REC-3', title: 'C', type: 'PROJECT' }
  ];

  const projects = filterRecordsByType(records, 'PROJECT');
  assert.equal(projects.length, 2);
  assert.deepEqual(projects.map(p => p.id), ['REC-1', 'REC-3']);

  const papers = filterRecordsByType(records, 'RESEARCH_PAPER');
  assert.equal(papers.length, 1);
  assert.equal(papers[0].id, 'REC-2');

  const all = filterRecordsByType(records, 'ALL');
  assert.equal(all.length, 3);
});

test('Site Adapter: summarizePublicState formats structured summary cleanly', () => {
  const rawState = {
    schema_version: 'kad-public-state-v1',
    publication_class: 'PUBLIC',
    project: {
      name: 'KAD-PI',
      status: 'ACTIVE',
      source_count: 62,
      record_count: 62
    },
    records: [
      { id: 'KAD-01', title: 'Home', publish: true, visibility: 'public', review_status: 'APPROVED' }
    ]
  };

  const summary = summarizePublicState(rawState);
  assert.equal(summary.projectName, 'KAD-PI');
  assert.equal(summary.status, 'ACTIVE');
  assert.equal(summary.sourceCount, 62);
  assert.equal(summary.recordCount, 62);
  assert.equal(summary.publicRecords.length, 1);
});
