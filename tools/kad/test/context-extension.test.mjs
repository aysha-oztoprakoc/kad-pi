import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildContextCheckpoint } from '../context-economy.mjs';
import kadContextEconomy from '../../../.omp/extensions/kad-context-economy.js';

function fakeExtension() {
  const handlers = new Map();
  const commands = new Map();
  const statuses = [];
  const notices = [];
  const pi = {
    on(name, handler) { handlers.set(name, handler); },
    registerCommand(name, command) { commands.set(name, command); },
  };
  kadContextEconomy(pi);
  return { handlers, commands, statuses, notices };
}

test('extension registers deterministic compaction hooks and kad-context command', async () => {
  const extension = fakeExtension();
  assert.ok(extension.handlers.has('session.compacting'));
  assert.ok(extension.handlers.has('auto_compaction_start'));
  assert.ok(extension.handlers.has('auto_compaction_end'));
  assert.ok(extension.commands.has('kad-context'));
  const result = extension.handlers.get('session.compacting')({}, { cwd: process.cwd() });
  assert.equal(result.context.length, 1);
  assert.match(result.context[0], /^KAD CONTEXT CHECKPOINT v1/m);
  assert.equal(result.preserveData.kad_context_checkpoint.source, 'deterministic-filesystem-and-git-state');
});

test('compaction hook archives the checkpoint locally before runtime compaction', () => {
  const extension = fakeExtension();
  const root = mkdtempSync(join(tmpdir(), 'kad-context-archive-'));
  extension.handlers.get('session.compacting')({}, { cwd: root });
  const archive = readFileSync(join(root, '.state', 'omp-kad', 'runtime', 'context-checkpoints.jsonl'), 'utf8').trim();
  assert.match(archive, /"schema_version":"kad-context-checkpoint-v1"/);
  assert.match(archive, /KAD CONTEXT CHECKPOINT v1/);
});

test('kad-context command is observational and does not require a model', async () => {
  const extension = fakeExtension();
  const messages = [];
  await extension.commands.get('kad-context').handler('', {
    cwd: process.cwd(),

    getContextUsage: () => ({ tokens: 10, contextWindow: 100, percent: 10 }),
    ui: { notify: message => messages.push(message) },
  });
  assert.equal(messages.length, 1);
  assert.match(messages[0], /context_usage: 10%/);
  assert.match(messages[0], /remote_compaction: disabled/);
});
test('checkpoint reconstructs swarm progress and ownership from durable state', () => {
  const statePath = join(mkdtempSync(join(tmpdir(), 'kad-context-state-')), 'swarm-state.json');
  writeFileSync(statePath, JSON.stringify({ tasks_total: 2, tasks_completed: 1, completed_task_ids: ['qwen-task'], resources: [{ id: 'qwen', trust_domain: 'retrieval', ownership: 'OWNED', state: 'AVAILABLE' }, { id: 'stheno', trust_domain: 'world', ownership: 'EXTERNAL', state: 'ACTIVE' }] }));
  const checkpoint = buildContextCheckpoint({ root: process.cwd(), swarm_state_path: statePath });
  assert.match(checkpoint, /swarm_completed: qwen-task/);
  assert.match(checkpoint, /swarm_pending: 1/);
  assert.ok(checkpoint.includes('stheno/world/EXTERNAL/ACTIVE'));
});

test('automatic compaction lifecycle writes a normalized receipt', () => {
  const extension = fakeExtension();
  const root = mkdtempSync(join(tmpdir(), 'kad-context-receipt-'));
  const ctx = { cwd: root, getContextUsage: () => ({ tokens: 100 }) };
  extension.handlers.get('auto_compaction_start')({ action: 'snapcompact' }, ctx);
  extension.handlers.get('auto_compaction_end')({ action: 'snapcompact', aborted: false, skipped: false }, ctx);
  const lines = readFileSync(join(root, '.state', 'omp-kad', 'runtime', 'compaction-receipts.jsonl'), 'utf8').trim().split('\n');
  const receipt = JSON.parse(lines.at(-1));
  assert.equal(receipt.strategy, 'snapcompact');
  assert.equal(receipt.automatic, true);
  assert.equal(receipt.tokens_before, 100);
  assert.equal(receipt.success, true);
});
