import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runWorkctl } from './workctl.mjs';
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'workctl-'));
  fs.mkdirSync(path.join(root, '.agents', 'workspace'), { recursive: true });
  fs.mkdirSync(path.join(root, '.agents', 'work', 'claims'), { recursive: true });
  fs.mkdirSync(path.join(root, '.agents', 'work', 'handoffs'), { recursive: true });
  fs.mkdirSync(path.join(root, '.agents', 'skills', 'workspace-orient'), { recursive: true });
  fs.writeFileSync(path.join(root, '.agents', 'skills', 'workspace-orient', 'SKILL.md'), '---\nname: workspace-orient\n---\n');
  fs.writeFileSync(path.join(root, 'AGENTS.md'), '# Workspace\n');
  fs.writeFileSync(path.join(root, 'HEAD'), 'fixture');
  fs.writeFileSync(path.join(root, '.agents', 'workspace', 'projects.json'), JSON.stringify({
    version: 1,
    workspace: { id: 'workspace', primary_project: 'kad-pi' },
    projects: [{ id: 'kad-pi', name: 'KAD-PI', path: '.', kind: 'PRIMARY', git_root: '.', instruction_entrypoint: 'AGENTS.md', authority_entrypoints: ['AGENTS.md'], agent_enabled: true }]
  }));
  fs.writeFileSync(path.join(root, '.agents', 'workspace', 'tools.json'), JSON.stringify({ version: 1, tools: [] }));
  return root;
}

function task(root, overrides = {}) {
  const item = {
    id: 'WP-TEST-001', project: 'kad-pi', title: 'Fixture work', status: 'READY', priority: 10,
    spec_ref: 'spec.md', fixed_point: 'fixture-head', scope: ['src'], non_scope: ['vendor'],
    owned_paths: ['src/example.js'], required_capabilities: ['filesystem_write'], trust_domain: 'engineering',
    authority_required: 'project', validation: ['node --test'], evidence_target: 'evidence/test', blocked_by: [], blocks: [], ...overrides
  };
  fs.mkdirSync(path.join(root, 'src'), { recursive: true });
  fs.writeFileSync(path.join(root, '.agents', 'work', `${item.id}.json`), JSON.stringify(item, null, 2));
  return item;
}

test('next selects READY work deterministically and claim rejects a second mutator', () => {
  const root = fixture();
  task(root);
  const next = runWorkctl(['next'], { workspaceRoot: root });
  assert.equal(next.code, 0);
  assert.equal(next.value.id, 'WP-TEST-001');

  const first = runWorkctl(['claim', 'WP-TEST-001', '--actor', 'harness-a'], { workspaceRoot: root });
  assert.equal(first.code, 0);
  const second = runWorkctl(['claim', 'WP-TEST-001', '--actor', 'harness-b'], { workspaceRoot: root });
  assert.equal(second.code, 1);
  assert.match(second.error, /already claimed/);
});

test('read-only review does not reserve mutation paths and handoff/resume are chat-independent', () => {
  const root = fixture();
  task(root);
  const review = runWorkctl(['claim', 'WP-TEST-001', '--actor', 'reviewer', '--mode', 'readonly'], { workspaceRoot: root });
  assert.equal(review.code, 0);
  const mutator = runWorkctl(['claim', 'WP-TEST-001', '--actor', 'builder'], { workspaceRoot: root });
  assert.equal(mutator.code, 0);
  const handoff = runWorkctl(['handoff', 'WP-TEST-001', '--actor', 'builder'], { workspaceRoot: root });
  assert.equal(handoff.code, 0);
  const resumed = runWorkctl(['resume', 'WP-TEST-001'], { workspaceRoot: root });
  assert.equal(resumed.code, 0);
  assert.equal(resumed.value.task.id, 'WP-TEST-001');
  assert.equal(resumed.value.handoff.task, 'WP-TEST-001');

  assert.equal(resumed.value.execution, undefined);
});
test('separate CLI processes resume the same task without harness metadata', () => {
  const root = fixture();
  task(root);
  const cli = path.join(repoRoot, 'bin', 'workctl');
  const claim = spawnSync(cli, ['claim', 'WP-TEST-001', '--actor', 'harness-a'], { cwd: root, encoding: 'utf8' });
  assert.equal(claim.status, 0);
  const handoff = spawnSync(cli, ['handoff', 'WP-TEST-001', '--actor', 'harness-a'], { cwd: root, encoding: 'utf8' });
  assert.equal(handoff.status, 0);
  const resume = spawnSync(cli, ['resume', 'WP-TEST-001'], { cwd: root, encoding: 'utf8' });
  assert.equal(resume.status, 0);
  const value = JSON.parse(resume.stdout);
  assert.equal(value.handoff.task, 'WP-TEST-001');
  assert.equal(value.handoff.actor_label, undefined);
});

test('doctor detects task schema and project isolation violations', () => {
  const root = fixture();
  task(root, { owned_paths: ['../outside.js'] });
  const doctor = runWorkctl(['doctor'], { workspaceRoot: root });
  assert.equal(doctor.code, 1);
  assert.match(doctor.error, /owned path escapes project/);
});

test('terminal transition deactivates the mutating claim', () => {
  const root = fixture();
  task(root);
  assert.equal(runWorkctl(['claim', 'WP-TEST-001', '--actor', 'builder'], { workspaceRoot: root }).code, 0);
  assert.equal(runWorkctl(['transition', 'WP-TEST-001', 'IN_PROGRESS', '--actor', 'builder'], { workspaceRoot: root }).code, 0);
  assert.equal(runWorkctl(['transition', 'WP-TEST-001', 'REVIEW', '--actor', 'builder'], { workspaceRoot: root }).code, 0);
  assert.equal(runWorkctl(['transition', 'WP-TEST-001', 'ACCEPTED', '--actor', 'builder'], { workspaceRoot: root }).code, 0);
  assert.equal(runWorkctl(['release', 'WP-TEST-001', '--actor', 'builder'], { workspaceRoot: root }).code, 1);
  const claim = JSON.parse(fs.readFileSync(path.join(root, '.agents', 'work', 'claims', 'WP-TEST-001.json'), 'utf8'));
  assert.equal(claim.active, false);
});

test('handoff requires an active mutating claim and rejects unsafe review actors', () => {
  const root = fixture();
  task(root);
  const handoff = runWorkctl(['handoff', 'WP-TEST-001', '--actor', 'builder'], { workspaceRoot: root });
  assert.equal(handoff.code, 1);
  assert.match(handoff.error, /active mutating claim required/);
  const review = runWorkctl(['claim', 'WP-TEST-001', '--actor', '../escape', '--mode', 'readonly'], { workspaceRoot: root });
  assert.equal(review.code, 1);
  assert.match(review.error, /unsafe path characters/);
});
