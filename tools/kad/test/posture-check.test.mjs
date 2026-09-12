import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { inspectPosture, POSTURE_KEYS } from '../posture-check.mjs';

/**
 * `.omp/RULES.md` declares the posture; `.omp/config.yml` enforces it. This parser is shared by
 * `bin/`-level checking and by the OMP orchestration preflight, so a divergence here is a
 * divergence in both gates at once.
 */
const AGREED = {
  'tools.approvalMode': 'yolo',
  'memory.backend': 'mnemopi',
  'autolearn.enabled': 'true',
  'secrets.enabled': 'false',
  'ttsr.enabled': 'false',
  'recap.enabled': 'false'
};

function fixture({ config = {}, declared = {}, declarationBlock = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-posture-'));
  fs.mkdirSync(path.join(root, '.omp'), { recursive: true });
  const effective = { ...AGREED, ...config };
  const sections = new Map();
  for (const [key, value] of Object.entries(effective)) {
    if (value === undefined) continue;
    const [section, name] = key.split('.');
    sections.set(section, [...(sections.get(section) ?? []), `  ${name}: ${value}`]);
  }
  fs.writeFileSync(path.join(root, '.omp', 'config.yml'), [...sections].map(([section, lines]) => `${section}:\n${lines.join('\n')}\n`).join(''));
  const declaredValues = { ...AGREED, ...declared };
  const body = declarationBlock
    ? `\n\`\`\`yaml\nposture:\n${Object.entries(declaredValues).map(([key, value]) => `  ${key}: ${value}`).join('\n')}\n\`\`\`\n`
    : '\nNo posture is declared here.\n';
  fs.writeFileSync(path.join(root, '.omp', 'RULES.md'), `# KAD invariants\n\nKAD authority outranks OMP.${body}`);
  return root;
}

test('an agreed posture reports every key with no problems', () => {
  const verdict = inspectPosture({ root: fixture() });
  assert.equal(verdict.ok, true);
  assert.deepEqual(verdict.problems, []);
  assert.deepEqual(Object.keys(verdict.observed).sort(), [...POSTURE_KEYS].sort());
  assert.equal(verdict.observed['memory.backend'], 'mnemopi');
});

test('a declared value that the config does not enforce is a mismatch, named by key', () => {
  const verdict = inspectPosture({ root: fixture({ declared: { 'autolearn.enabled': 'false' } }) });
  assert.equal(verdict.ok, false);
  assert.deepEqual(verdict.problems.map((problem) => problem.code), ['POSTURE_DECLARATION_MISMATCH']);
  assert.equal(verdict.problems[0].key, 'autolearn.enabled');
  assert.equal(verdict.declared['autolearn.enabled'], 'false');
  assert.equal(verdict.observed['autolearn.enabled'], 'true');
});

test('a file with no posture block is undeclared rather than silently passing', () => {
  const verdict = inspectPosture({ root: fixture({ declarationBlock: false }) });
  assert.equal(verdict.ok, false);
  assert.deepEqual(verdict.problems.map((problem) => problem.code), ['POSTURE_UNDECLARED']);
});

test('a posture key missing from the config is unenforced, and an unknown key is rejected', () => {
  const missing = inspectPosture({ root: fixture({ config: { 'recap.enabled': undefined } }) });
  assert.ok(missing.problems.some((problem) => problem.code === 'POSTURE_KEY_UNENFORCED' && problem.key === 'recap.enabled'), JSON.stringify(missing.problems));

  const unknown = inspectPosture({ root: fixture({ declared: { 'telemetry.export': 'true' } }) });
  assert.equal(unknown.ok, false);
  assert.deepEqual(unknown.problems.map((problem) => problem.code), ['POSTURE_KEY_UNKNOWN']);
  assert.equal(unknown.problems[0].key, 'telemetry.export');
});

test('an unreadable rules file fails closed', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-posture-'));
  const verdict = inspectPosture({ root });
  assert.equal(verdict.ok, false);
  assert.deepEqual(verdict.problems.map((problem) => problem.code), ['POSTURE_FILE_UNREADABLE', 'POSTURE_FILE_UNREADABLE']);
});
