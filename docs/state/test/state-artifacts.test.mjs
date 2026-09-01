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

test('CSA: schema fields and identity are present', () => {
  const csa = readJson('CSA_KAD_PI_CURRENT.json');
  assert.equal(csa.schema, 'kad.csa/v1');
  assert.equal(csa.state, 'CURRENT');
  assert.ok(csa.repository?.head, 'repository.head must be present');
  assert.ok(csa.repository?.branch === 'main', 'branch must be main');
  assert.ok(Array.isArray(csa.unknowns), 'unknowns must be an array');
  assert.ok(Array.isArray(csa.deviations), 'deviations must be an array');
});

test('CSA: provenance model — every fact carries source evidence', () => {
  const csa = readJson('CSA_KAD_PI_CURRENT.json');
  const walk = (node, trail = []) => {
    if (Array.isArray(node)) { node.forEach((v, i) => walk(v, [...trail, i])); return; }
    if (node && typeof node === 'object') {
      if (typeof node.state_class === 'string' && typeof node.evidence === 'undefined') {
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

test('Settings matrix: every setting is classified and complete', () => {
  const matrix = readJson('OMP_SETTINGS_COMPATIBILITY_MATRIX.json');
  assert.ok(Array.isArray(matrix.settings), 'settings must be an array');
  assert.ok(matrix.settings.length > 0, 'settings must not be empty');
  const required = ['setting_id', 'omp_version', 'type', 'kad_policy', 'security_class', 'mutability', 'test_method', 'current_result', 'deviation', 'rationale'];
  for (const row of matrix.settings) {
    for (const field of required) {
      assert.ok(field in row, `setting ${row.setting_id} missing ${field}`);
    }
    assert.ok(SETTING_CLASSES.has(row.kad_policy), `setting ${row.setting_id} has invalid kad_policy ${row.kad_policy}`);
  }
});

test('Settings matrix: no applicable setting remains unclassified', () => {
  const matrix = readJson('OMP_SETTINGS_COMPATIBILITY_MATRIX.json');
  const unclassified = matrix.settings.filter((row) => !row.kad_policy || row.kad_policy === 'NOT_APPLICABLE' && row.rationale === undefined);
  assert.equal(unclassified.length, 0, 'found settings without classification rationale');
});

test('Gap model: consumes CSA and ISA; valid ownership enums', () => {
  const gap = readJson('CSA_ISA_GAP.json');
  assert.equal(gap.schema, 'kad.csa-isa-gap/v1');
  assert.ok(Array.isArray(gap.gaps), 'gaps must be an array');
  for (const g of gap.gaps) {
    assert.ok(g.gap_id, 'gap_id required');
    assert.ok(g.domain, `gap ${g.gap_id} missing domain`);
    assert.ok(g.owner, `gap ${g.gap_id} missing owner`);
    assert.ok(GAP_OWNERSHIP.has(g.ownership_status), `gap ${g.gap_id} invalid ownership_status ${g.ownership_status}`);
    assert.ok(g.evidence, `gap ${g.gap_id} missing evidence`);
  }
});
