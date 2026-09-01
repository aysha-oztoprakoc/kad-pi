import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const stateDir = path.resolve(here, '..');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(stateDir, name), 'utf8'));

const CSA_STATE_CLASSES = new Set([
  'VERIFIED_CURRENT', 'VOLATILE_CURRENT', 'UNKNOWN', 'BLOCKED',
  'STALE', 'SUPERSEDED', 'REQUIRES_REVERIFICATION',
]);
const SETTING_CLASSES = new Set([
  'PASS_THROUGH', 'KAD_DEFAULT', 'KAD_RESTRICTED', 'KAD_WRAPPED',
  'NOT_APPLICABLE', 'REQUIRES_HUMAN_POLICY',
]);
const GAP_OWNERSHIP = new Set([
  'OWNED_BY_WP041', 'EXISTING_SUCCESSOR_WP', 'PROPOSE_SUCCESSOR_WP',
  'BLOCKED_BY_IN_FLIGHT_WORK', 'HUMAN_DECISION_REQUIRED', 'NO_ACTION_REQUIRED',
]);
const GAP_STATUS = new Set(['OPEN', 'RESOLVED', 'BASELINE', 'UNKNOWN']);

// Important mutable CURRENT facts that MUST carry provenance by contract.
// Omitting state_class does not exempt them from provenance.
const REQUIRED_EVIDENCE = [
  'repository', 'hosts.amdy', 'hosts.tell', 'harnesses.omp',
  'knowledge_plane', 'skills', 'compute', 'security',
];

function evidenceFor(node, trail) {
  if (!node || typeof node !== 'object') return null;
  if (!node.evidence || typeof node.evidence !== 'object') return null;
  const hasSource = typeof node.evidence.source === 'string';
  const hasProbe = ['command', 'hash', 'path'].some((k) => typeof node.evidence[k] === 'string');
  return hasSource && hasProbe ? node.evidence : null;
}

test('CSA: schema fields and identity are present', () => {
  const csa = readJson('CSA_KAD_PI_CURRENT.json');
  assert.equal(csa.schema, 'kad.csa/v1');
  assert.equal(csa.state, 'CURRENT');
  assert.ok(csa.repository?.head, 'repository.head must be present');
  assert.ok(csa.repository?.branch === 'main', 'branch must be main');
  assert.ok(Array.isArray(csa.unknowns), 'unknowns must be an array');
  assert.ok(Array.isArray(csa.deviations), 'deviations must be an array');
});

test('CSA: provenance is mandatory on important facts (not opt-in)', () => {
  const csa = readJson('CSA_KAD_PI_CURRENT.json');
  for (const key of REQUIRED_EVIDENCE) {
    assert.ok(csa[key], `CSA missing section ${key}`);
    assert.ok(evidenceFor(csa[key], key), `CSA section ${key} must carry evidence {source, command|hash|path}`);
  }
});

test('CSA: state_class always co-occurs with evidence', () => {
  const csa = readJson('CSA_KAD_PI_CURRENT.json');
  const walk = (node, trail = []) => {
    if (Array.isArray(node)) { node.forEach((v, i) => walk(v, [...trail, i])); return; }
    if (node && typeof node === 'object') {
      if (typeof node.state_class === 'string' && !evidenceFor(node, trail.join('.'))) {
        assert.fail(`fact at ${trail.join('.')} declares state_class but no evidence`);
      }
      for (const [k, v] of Object.entries(node)) walk(v, [...trail, k]);
    }
  };
  walk(csa);
});

test('CSA: state classes are valid enum values', () => {
  const csa = readJson('CSA_KAD_PI_CURRENT.json');
  const walk = (node) => {
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (node && typeof node === 'object') {
      if (typeof node.state_class === 'string') {
        assert.ok(CSA_STATE_CLASSES.has(node.state_class), `invalid state_class ${node.state_class}`);
      }
      for (const v of Object.values(node)) walk(v);
    }
  };
  walk(csa);
});

test('Settings matrix: exhaustive — equals the discovered OMP surface exactly', () => {
  const surface = readJson('schema/omp-settings-surface.json');
  const matrix = readJson('OMP_SETTINGS_COMPATIBILITY_MATRIX.json');
  const expected = Object.values(surface.sections).flat();
  const actual = matrix.settings.map((row) => row.setting_id);
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  assert.equal(expected.length, expectedSet.size, 'surface must be duplicate-free');
  const missing = [...expectedSet].filter((id) => !actualSet.has(id));
  const extra = [...actualSet].filter((id) => !expectedSet.has(id));
  const dupes = actual.filter((id, i) => actual.indexOf(id) !== i);
  assert.deepEqual(missing, [], 'matrix is missing settings');
  assert.deepEqual(extra, [], 'matrix has settings not in surface (grouped/invented)');
  assert.deepEqual(dupes, [], 'matrix has duplicate settings');
});

test('Settings matrix: every row is complete and validly classified', () => {
  const matrix = readJson('OMP_SETTINGS_COMPATIBILITY_MATRIX.json');
  const required = ['setting_id', 'omp_version', 'type', 'kad_policy', 'security_class', 'mutability', 'test_method', 'current_result', 'deviation', 'rationale'];
  for (const row of matrix.settings) {
    for (const field of required) {
      assert.ok(field in row, `setting ${row.setting_id} missing ${field}`);
    }
    assert.ok(SETTING_CLASSES.has(row.kad_policy), `setting ${row.setting_id} invalid kad_policy ${row.kad_policy}`);
  }
});

test('Settings matrix: no inferred upstream defaults', () => {
  const matrix = readJson('OMP_SETTINGS_COMPATIBILITY_MATRIX.json');
  for (const row of matrix.settings) {
    if (row.upstream_default === undefined) {
      assert.fail(`setting ${row.setting_id} has undefined upstream_default (must be verbatim or null, not inferred)`);
    }
  }
});

test('Gap model: post-WP gaps that WP-041 resolved are marked RESOLVED', () => {
  const gap = readJson('CSA_ISA_GAP.json');
  assert.equal(gap.schema, 'kad.csa-isa-gap/v1');
  const wp041Gaps = gap.gaps.filter((g) => g.ownership_status === 'OWNED_BY_WP041');
  assert.ok(wp041Gaps.length > 0, 'expected OWNED_BY_WP041 gaps');
  for (const g of wp041Gaps) {
    assert.equal(g.status, 'RESOLVED', `WP-041 gap ${g.gap_id} must be RESOLVED (was ${g.status})`);
    assert.ok(g.baseline, `gap ${g.gap_id} must record baseline pre-WP state`);
  }
  for (const g of gap.gaps) {
    assert.ok(GAP_STATUS.has(g.status), `gap ${g.gap_id} invalid status ${g.status}`);
    assert.ok(GAP_OWNERSHIP.has(g.ownership_status), `gap ${g.gap_id} invalid ownership ${g.ownership_status}`);
    assert.ok(g.evidence, `gap ${g.gap_id} missing evidence`);
  }
});
