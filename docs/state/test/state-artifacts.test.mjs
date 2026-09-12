import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { inspectPosture } from '../../../tools/kad/posture-check.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const stateDir = path.resolve(here, '..');
const repoRoot = path.resolve(here, '../..');
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
const COMPAT_VALUES = new Set(['PASS', 'FAIL', 'N/A', 'DORMANT']);
const SCHEMA_DEFAULT_KINDS = new Set(['literal', 'constant', 'undefined', 'unknown', 'arithmetic', 'literal-array', 'literal-object', 'literal-array-raw', 'literal-object-raw']);

const REQUIRED_EVIDENCE = [
  'repository', 'hosts.amdy', 'hosts.tell', 'harnesses.omp',
  'knowledge_plane', 'skills', 'compute', 'security',
];

function evidenceFor(node) {
  if (!node || typeof node !== 'object' || !node.evidence) return null;
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
    assert.ok(evidenceFor(csa[key]), `CSA section ${key} must carry evidence {source, command|hash|path}`);
  }
});

test('CSA: state_class always co-occurs with evidence', () => {
  const csa = readJson('CSA_KAD_PI_CURRENT.json');
  const walk = (node, trail = []) => {
    if (Array.isArray(node)) { node.forEach((v, i) => walk(v, [...trail, i])); return; }
    if (node && typeof node === 'object') {
      if (typeof node.state_class === 'string' && !evidenceFor(node)) {
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
      if (typeof node.state_class === 'string') assert.ok(CSA_STATE_CLASSES.has(node.state_class), `invalid state_class ${node.state_class}`);
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
  assert.equal(expected.length, new Set(expected).size, 'surface must be duplicate-free');
  assert.deepEqual([...new Set(expected)].filter((id) => !actual.includes(id)), [], 'matrix missing settings');
  assert.deepEqual(actual.filter((id) => !new Set(expected).has(id)), [], 'matrix has settings not in surface');
  assert.deepEqual(actual.filter((id, i) => actual.indexOf(id) !== i), [], 'matrix has duplicate settings');
});

test('Settings matrix: schema_default and effective_value are distinct fields with distinct provenance', () => {
  const matrix = readJson('OMP_SETTINGS_COMPATIBILITY_MATRIX.json');
  for (const row of matrix.settings) {
    assert.ok('schema_default' in row, `${row.setting_id} missing schema_default`);
    assert.ok('effective_value' in row, `${row.setting_id} missing effective_value`);
    assert.ok('schema_default_kind' in row, `${row.setting_id} missing schema_default_kind`);
    assert.ok('effective_source' in row, `${row.setting_id} missing effective_source`);
    assert.ok(SCHEMA_DEFAULT_KINDS.has(row.schema_default_kind), `${row.setting_id} invalid schema_default_kind ${row.schema_default_kind}`);
    assert.notEqual(row.effective_source, 'schema', `${row.setting_id} effective_source must be runtime, not schema`);
  }
});

test('Settings matrix: every row classified with dual compatibility', () => {
  const matrix = readJson('OMP_SETTINGS_COMPATIBILITY_MATRIX.json');
  for (const row of matrix.settings) {
    assert.ok(SETTING_CLASSES.has(row.kad_policy), `${row.setting_id} invalid kad_policy ${row.kad_policy}`);
    assert.ok(COMPAT_VALUES.has(row.default_compatibility), `${row.setting_id} invalid default_compatibility ${row.default_compatibility}`);
    assert.ok(COMPAT_VALUES.has(row.effective_compatibility), `${row.setting_id} invalid effective_compatibility ${row.effective_compatibility}`);
  }
});

test('Settings matrix: no effective value silently copied into schema_default', () => {
  const matrix = readJson('OMP_SETTINGS_COMPATIBILITY_MATRIX.json');
  for (const row of matrix.settings) {
    // schema_default is source-derived (never 'copied'/'inferred'); effective_value is runtime-derived.
    assert.notEqual(row.schema_default_kind, 'copied', `${row.setting_id} schema_default_kind must not be copied`);
    assert.equal(row.effective_source, 'omp config list --json', `${row.setting_id} effective_source must be runtime`);
  }
});

test('Settings matrix: the posture rows match the config the harness actually runs', () => {
  // This matrix reported memory.backend = "off" and autolearn.enabled = false as VERIFIED for
  // three days after .omp/config.yml had moved, because a captured snapshot cannot notice. The
  // posture keys are the rows that were wrong, so they are the rows that get compared.
  const posture = inspectPosture({ root: path.resolve(here, '../../..') });
  assert.equal(posture.ok, true, `the declared posture must be enforced: ${posture.failures.join('; ')}`);
  const matrix = readJson('OMP_SETTINGS_COMPATIBILITY_MATRIX.json');
  for (const [key, enforced] of Object.entries(posture.observed)) {
    const row = matrix.settings.find((entry) => entry.setting_id === key);
    assert.ok(row, `${key} must have a matrix row`);
    assert.equal(String(row.effective_value), enforced, `${key}: matrix records ${row.effective_value}, config enforces ${enforced}`);
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

/**
 * How far HEAD may advance past the commit the CSA records. Committing the CSA itself
 * necessarily moves HEAD one commit past the state it describes, so a lag of one is
 * structural; anything beyond that means the artifact is describing a checkout that is
 * no longer the one on disk.
 */
const MAX_CSA_LAG = 1;

test('CSA: the recorded repository state is live, not historical', () => {
  // The artifact declares `state: CURRENT`. Before 2026-09-11 that claim went
  // unchecked: the CSA named 3a0b5b0 while HEAD was six commits ahead with 466 fewer
  // dirty paths, and every reader treated it as current. This assertion makes the
  // claim falsifiable, so the CSA is refreshed instead of quietly ageing.
  const csa = readJson('CSA_KAD_PI_CURRENT.json');
  const git = (...args) => execFileSync('git', ['-C', repoRoot, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']
  }).trim();

  const head = git('rev-parse', 'HEAD');
  const recorded = csa.repository.head;
  assert.match(recorded, /^[0-9a-f]{40}$/, 'repository.head must be a full commit id');
  execFileSync('git', ['-C', repoRoot, 'cat-file', '-e', `${recorded}^{commit}`], { stdio: 'ignore' });

  const newer = Number(git('rev-list', '--count', `${recorded}..${head}`));
  assert.ok(
    newer <= MAX_CSA_LAG,
    `CSA records ${recorded.slice(0, 8)} but HEAD is ${head.slice(0, 8)}, ${newer} commits newer. `
    + 'Refresh docs/state/CSA_KAD_PI_CURRENT.{md,json} in the same commit as the work that moved HEAD.'
  );
  assert.equal(csa.repository.branch, git('rev-parse', '--abbrev-ref', 'HEAD'), 'CSA branch must match the checkout');
  assert.equal(csa.state, 'CURRENT');
});
