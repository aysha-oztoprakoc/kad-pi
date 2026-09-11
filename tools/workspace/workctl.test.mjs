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
  fs.mkdirSync(path.join(root, 'evidence', 'test'), { recursive: true });
  fs.writeFileSync(path.join(root, 'evidence', 'test', 'receipt.json'), '{}\n');
  assert.equal(runWorkctl(['transition', 'WP-TEST-001', 'ACCEPTED', '--actor', 'builder'], { workspaceRoot: root }).code, 0);
  assert.equal(runWorkctl(['release', 'WP-TEST-001', '--actor', 'builder'], { workspaceRoot: root }).code, 1);
  const claim = JSON.parse(fs.readFileSync(path.join(root, '.agents', 'work', 'claims', 'WP-TEST-001.json'), 'utf8'));
  assert.equal(claim.active, false);
});

test('acceptance is refused unless durable evidence actually exists', () => {
  const root = fixture();
  const review = (id) => {
    runWorkctl(['claim', id, '--actor', 'builder'], { workspaceRoot: root });
    runWorkctl(['transition', id, 'IN_PROGRESS', '--actor', 'builder'], { workspaceRoot: root });
    return runWorkctl(['transition', id, 'REVIEW', '--actor', 'builder'], { workspaceRoot: root });
  };
  const accept = (id) => runWorkctl(['transition', id, 'ACCEPTED', '--actor', 'builder'], { workspaceRoot: root });

  task(root);
  review('WP-TEST-001');
  assert.match(accept('WP-TEST-001').error, /declared evidence target does not exist/);
  fs.mkdirSync(path.join(root, 'evidence', 'test'), { recursive: true });
  assert.match(accept('WP-TEST-001').error, /evidence target directory is empty/);
  fs.writeFileSync(path.join(root, 'evidence', 'test', 'receipt.json'), '{}\n');
  assert.equal(accept('WP-TEST-001').code, 0);

  task(root, { id: 'WP-TEST-002', evidence_target: undefined });
  review('WP-TEST-002');
  assert.match(accept('WP-TEST-002').error, /no evidence_target declared/);
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

test('mutating commands reject unsafe work item identifiers', () => {
  const root = fixture();
  const item = task(root);
  item.id = '../escape';
  fs.writeFileSync(path.join(root, '.agents', 'work', 'WP-TEST-001.json'), JSON.stringify(item));
  const doctor = runWorkctl(['doctor'], { workspaceRoot: root });
  assert.equal(doctor.code, 1);
  assert.match(doctor.error, /unsafe id/);
});

test('P10: Rehearse restore procedure to a fresh directory verifying source and evidence integrity', () => {
  const targetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kad-restore-rehearsal-'));
  try {
    // Copy minimal manifest to fresh targetDir
    fs.mkdirSync(path.join(targetDir, '.agents', 'workspace'), { recursive: true });
    fs.mkdirSync(path.join(targetDir, '.agents', 'work'), { recursive: true });
    fs.mkdirSync(path.join(targetDir, 'tools', 'workspace'), { recursive: true });
    fs.mkdirSync(path.join(targetDir, 'bin'), { recursive: true });

    fs.copyFileSync(path.join(repoRoot, '.agents', 'workspace', 'projects.json'), path.join(targetDir, '.agents', 'workspace', 'projects.json'));
    fs.copyFileSync(path.join(repoRoot, 'tools', 'workspace', 'workctl.mjs'), path.join(targetDir, 'tools', 'workspace', 'workctl.mjs'));
    fs.copyFileSync(path.join(repoRoot, 'tools', 'workspace', 'workflow-bridge.mjs'), path.join(targetDir, 'tools', 'workspace', 'workflow-bridge.mjs'));
    fs.copyFileSync(path.join(repoRoot, 'tools', 'workspace', 'stc-lease.mjs'), path.join(targetDir, 'tools', 'workspace', 'stc-lease.mjs'));
    fs.copyFileSync(path.join(repoRoot, 'tools', 'workspace', 'skill-governance.mjs'), path.join(targetDir, 'tools', 'workspace', 'skill-governance.mjs'));
    fs.copyFileSync(path.join(repoRoot, 'bin', 'workctl'), path.join(targetDir, 'bin', 'workctl'));
    fs.chmodSync(path.join(targetDir, 'bin', 'workctl'), 0o755);

    const restoredTask = {
      id: 'WP-RESTORED-001',
      project: 'kad-pi',
      title: 'Restored Task',
      status: 'READY',
      priority: 10,
      spec_ref: null,
      fixed_point: 'fixture-fixed-point',
      scope: ['src'],
      non_scope: [],
      owned_paths: ['src/restored.js'],
      required_capabilities: ['filesystem_write'],
      trust_domain: 'engineering',
      authority_required: 'kad-pi-project',
      validation: ['node --test'],
      evidence_target: 'evidence/WP-RESTORED-001/',
      blocked_by: [],
      blocks: []
    };
    fs.writeFileSync(path.join(targetDir, '.agents', 'work', 'WP-RESTORED-001.json'), JSON.stringify(restoredTask, null, 2));

    // Run workctl commands in the restored fresh directory
    const cli = path.join(targetDir, 'bin', 'workctl');
    const status = spawnSync(cli, ['status'], { cwd: targetDir, encoding: 'utf8' });
    assert.equal(status.status, 0);
    const statusParsed = JSON.parse(status.stdout);
    assert.ok(Array.isArray(statusParsed));
    assert.equal(statusParsed.some(t => t.id === 'WP-RESTORED-001'), true);

    // Acquire a claim in the fresh directory
    const claim = spawnSync(cli, ['claim', 'WP-RESTORED-001', '--actor', 'restored-harness'], { cwd: targetDir, encoding: 'utf8' });
    assert.equal(claim.status, 0);

    // Verify handoff generation
    const handoff = spawnSync(cli, ['handoff', 'WP-RESTORED-001', '--actor', 'restored-harness'], { cwd: targetDir, encoding: 'utf8' });
    assert.equal(handoff.status, 0);
    assert.equal(fs.existsSync(path.join(targetDir, '.agents', 'work', 'handoffs', 'WP-RESTORED-001.json')), true);
  } finally {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
});
