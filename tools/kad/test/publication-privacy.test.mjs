import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { filterPublicRecords, PUBLICATION_FILTER_SCHEMA } from '../../../site/adapter.mjs';
import { sanitizePublicProjection, validatePublicProjection } from '../publication.mjs';

test('Publication Boundary Contract: adapter defines schema and pure filter', () => {
  assert.equal(PUBLICATION_FILTER_SCHEMA, 'kad-public-adapter-v1');
  assert.equal(typeof filterPublicRecords, 'function');
});

test('Publication Boundary Contract: filterPublicRecords excludes non-approved and non-public records', () => {
  const records = [
    { id: 'REC-1', title: 'Public Approved Note', publish: true, visibility: 'public', review_status: 'APPROVED' },
    { id: 'REC-2', title: 'Private Note', publish: true, visibility: 'private', review_status: 'APPROVED' },
    { id: 'REC-3', title: 'Unpublished Note', publish: false, visibility: 'public', review_status: 'APPROVED' },
    { id: 'REC-4', title: 'Draft Note', publish: true, visibility: 'public', review_status: 'REVIEW' },
    { id: 'REC-5', title: 'Rejected Note', publish: true, visibility: 'public', review_status: 'REJECTED' },
    { id: 'REC-6', title: 'Unknown Status Note', publish: true, visibility: 'public', review_status: 'UNKNOWN' },
    { id: 'REC-7', title: 'Malformed Record' }
  ];

  const filtered = filterPublicRecords(records);
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'REC-1');
});
test('Publication Boundary Contract: validatePublicProjection rejects secret fields and private file paths', () => {
  const leakyProjection = {
    schema_version: 'kad-public-state-v1',
    publication_class: 'PUBLIC',
    projection_id: 'test-proj',
    project: { name: 'KAD-PI', status: 'PASS' },
    records: [
      {
        id: 'REC-01',
        title: 'Safe Note',
        token: 'sk-abcdef1234567890abcdef'
      }
    ]
  };

  assert.throws(() => {
    validatePublicProjection(leakyProjection);
  }, /secret-shaped field|private record field/);
});

test('Publication Boundary Contract: generated public-state.json strictly conforms to PUBLIC schema', () => {
  const statePath = join(process.cwd(), 'site', 'generated', 'public-state.json');
  if (!existsSync(statePath)) assert.fail('public-state.json missing');

  const content = JSON.parse(readFileSync(statePath, 'utf8'));
  assert.equal(content.publication_class, 'PUBLIC');
  assert.equal(content.schema_version, 'kad-public-state-v1');
  assert.ok(typeof content.project === 'object');
  assert.ok(Array.isArray(content.records));

  // Verify zero private leaks in records
  for (const record of content.records) {
    assert.ok(record.id || record.kad_id);
    assert.ok(record.title);
    assert.equal(record.visibility ?? 'public', 'public');
    assert.notEqual(record.visibility, 'private');
  }
});
