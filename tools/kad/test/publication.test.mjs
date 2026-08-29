import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizePublicProjection, validatePublicProjection } from '../publication.mjs';

const internal = {
  projection_id: 'kad-governed-wiki-v1',
  status: 'PARTIAL',
  source_count: 40,
  record_count: 56,
  status_projection: {
    status: 'PARTIAL',
    components: [
      {
        component: 'OpenViking',
        state: 'DEGRADED',
        source_ref: 'evidence/private/report.md',
        source_hash: 'a'.repeat(64),
        degraded_capabilities: ['semantic retrieval']
      }
    ]
  },
  records: [
    {
      id: 'record:public',
      title: 'Approved public concept',
      namespace: 'PROJECT',
      status: 'PASS',
      privacy_class: 'PUBLIC',
      source_ref: 'docs/public.md',
      source_hash: 'b'.repeat(64),
      description: 'Safe summary'
    },
    {
      id: 'record:internal',
      title: 'Internal operational trace',
      namespace: 'EVIDENCE',
      status: 'PASS',
      privacy_class: 'INTERNAL',
      source_ref: '/home/amdy/Work/private.md',
      source_hash: 'c'.repeat(64),
      description: 'Private'
    },
    {
      id: 'record:unknown',
      title: 'Unclassified record',
      namespace: 'PROJECT',
      status: 'UNKNOWN',
      privacy_class: 'UNKNOWN',
      source_ref: 'unknown.md',
      source_hash: 'd'.repeat(64),
      description: 'Do not publish'
    }
  ]
};

test('publication emits only explicitly PUBLIC records', () => {
  const output = sanitizePublicProjection(internal);
  assert.deepEqual(output.records.map(record => record.id), ['record:public']);
  assert.equal(output.records[0].source_ref, undefined);
  assert.equal(output.records[0].source_hash, undefined);
});

test('publication strips internal component details and local paths', () => {
  const output = sanitizePublicProjection(internal);
  assert.equal(output.component_summary.DEGRADED, 1);
  assert.equal(output.components, undefined);
  assert.doesNotMatch(JSON.stringify(output), /OpenViking|private|\/home\/amdy|source_hash|source_ref/);
});

test('candidate, sensitive, and unknown classes fail closed', () => {
  const source = { ...internal, records: [
    { ...internal.records[0], privacy_class: 'PUBLIC_CANDIDATE' },
    { ...internal.records[0], id: 'sensitive', privacy_class: 'SENSITIVE' },
    { ...internal.records[0], id: 'unknown', privacy_class: 'UNKNOWN' }
  ] };
  assert.deepEqual(sanitizePublicProjection(source).records, []);
});
test('ordinary research vocabulary is not mistaken for a secret', () => {
  const source = { ...internal, records: [{ ...internal.records[0], title: 'Traceable prompts and tokens', description: 'A public explanation of model boundaries.' }] };
  assert.equal(sanitizePublicProjection(source).records.length, 1);
});


test('invalid public output is rejected', () => {
  assert.throws(() => validatePublicProjection({ publication_class: 'PUBLIC', records: [{ id: 'bad', source_ref: 'secret' }] }), /publication boundary/);
  assert.doesNotThrow(() => validatePublicProjection(sanitizePublicProjection(internal)));
});

test('missing state produces bounded failure instead of healthy output', () => {
  assert.throws(() => sanitizePublicProjection(null), /internal projection is required/);
});
