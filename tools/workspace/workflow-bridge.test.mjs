import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { importTickets, ticketToWorkItem } from './workflow-bridge.mjs';
import { runWorkctl } from './workctl.mjs';
const ticket = (overrides = {}) => ({
  id: 'ticket-alpha', project: 'kad-pi', title: 'Build the vertical slice', status: 'ready-for-agent', priority: 20,
  spec_ref: 'spec:alpha', fixed_point: 'abc123', scope: ['src'], non_scope: ['vendor'], owned_paths: ['src'],
  required_capabilities: ['filesystem_write'], trust_domain: 'engineering', authority_required: 'kad-pi-project',
  validation: ['node --test'], evidence_target: 'evidence/alpha', blocked_by: [], blocks: [], ...overrides,
});

test('ticket import produces a work item and is idempotent', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-bridge-'));
  const first = importTickets([ticket()], { root });
  const second = importTickets([ticket()], { root });
  assert.deepEqual(first.imported, ['ticket-alpha']);
  assert.deepEqual(second.imported, []);
  assert.deepEqual(second.existing, ['ticket-alpha']);
  const item = JSON.parse(fs.readFileSync(path.join(root, '.agents/work/ticket-alpha.json'), 'utf8'));
  assert.equal(item.status, 'READY');
  assert.equal(item.source_ticket, 'ticket-alpha');
});

test('ticket import validates blockers before writing any item', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-bridge-'));
  assert.throws(() => importTickets([ticket({ blocked_by: ['missing'] })], { root }), /unknown work item missing/);
  assert.equal(fs.existsSync(path.join(root, '.agents/work/ticket-alpha.json')), false);
});

test('ticket import accepts a blocker already registered in workctl', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-bridge-'));
  importTickets([ticket({ id: 'blocker' })], { root });
  const result = importTickets([ticket({ blocked_by: ['blocker'] })], { root });
  assert.deepEqual(result.imported, ['ticket-alpha']);
});

test('ticket contracts reject provider, model, and harness coupling', () => {
  assert.throws(() => ticketToWorkItem(ticket({ model: 'some-model' })), /not allowed/);
  assert.throws(() => ticketToWorkItem(ticket({ provider: 'some-provider' })), /not allowed/);
  assert.throws(() => ticketToWorkItem(ticket({ harness: 'some-harness' })), /not allowed/);
});

test('workctl CLI imports accepted tickets and exposes READY work', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-bridge-'));
  fs.mkdirSync(path.join(root, '.agents/workspace'), { recursive: true });
  fs.writeFileSync(path.join(root, '.agents/workspace/projects.json'), JSON.stringify({
    version: 1,
    projects: [{ id: 'kad-pi', name: 'KAD Pi', path: '.', kind: 'PRIMARY', instruction_entrypoint: null }],
  }));
  fs.writeFileSync(path.join(root, 'tickets.json'), JSON.stringify({ tickets: [ticket()] }));
  const imported = runWorkctl(['import-tickets', 'tickets.json'], { workspaceRoot: root });
  assert.equal(imported.code, 0);
  assert.deepEqual(imported.value.imported, ['ticket-alpha']);
  const next = runWorkctl(['next'], { workspaceRoot: root });
  assert.equal(next.code, 0);
  assert.equal(next.value.id, 'ticket-alpha');
});

test('ticket import rejects conflicting existing work state', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-bridge-'));
  importTickets([ticket()], { root });
  assert.throws(() => importTickets([ticket({ title: 'Changed after registration' })], { root }), /already exists with different work contract/);
});
