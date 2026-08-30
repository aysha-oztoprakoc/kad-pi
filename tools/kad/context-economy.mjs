import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';

export const CHECKPOINT_SCHEMA_VERSION = 'kad-context-checkpoint-v1';
export const contextPolicy = Object.freeze({
  contextPromotion: Object.freeze({ enabled: false }),
  compaction: Object.freeze({
    enabled: true,
    methodOrder: Object.freeze(['snapcompact']),
    thresholdPercent: 70,
    thresholdTokens: -1,
    midTurnEnabled: true,
    keepRecentTokens: 20000,
    autoContinue: true,
  }),
});

const sha256 = value => createHash('sha256').update(value).digest('hex');

function git(root, args) {
  try {
    return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return 'UNKNOWN';
  }
}

function fileReference(root, relativePath) {
  const path = resolve(root, relativePath);
  try {
    const content = readFileSync(path, 'utf8');
    return `${relativePath}#${sha256(content).slice(0, 16)}`;
  } catch {
    return `${relativePath}#MISSING`;
  }
}

function dirtyPaths(root) {
  const status = git(root, ['status', '--porcelain=v1']);
  if (status === 'UNKNOWN' || status === '') return status === 'UNKNOWN' ? ['UNKNOWN'] : [];
  return status.split('\n').map(line => line.slice(3).trim()).filter(Boolean).slice(0, 40);
}

function boundedList(values, fallback = 'none') {
  const items = Array.isArray(values) ? values.filter(value => typeof value === 'string' && value.trim()).slice(0, 8) : [];
  return items.length ? items.join('; ') : fallback;
}

export function repositorySnapshot(root = process.cwd()) {
  return {
    root: resolve(root),
    branch: git(root, ['branch', '--show-current']),
    head: git(root, ['rev-parse', 'HEAD']),
    dirty_paths: dirtyPaths(root),
  };
}

function readSwarmState(root, swarm_state_path = null) {
  try {
    const path = swarm_state_path ?? resolve(root, '.state', 'omp-kad', 'runtime', 'swarm-state.json');
    const state = JSON.parse(readFileSync(path, 'utf8'));
    const resources = Array.isArray(state.resources) ? state.resources.slice(0, 4).map(resource => `${resource.id}/${resource.trust_domain}/${resource.ownership}/${resource.state}`).join('; ') : 'none';
    return {
      completed: boundedList(state.completed_task_ids),
      pending: state.tasks_total === null || state.tasks_total === undefined ? 'UNKNOWN' : `${Math.max(0, state.tasks_total - (state.tasks_completed ?? 0))}`,
      resources,
    };
  } catch {
    return { completed: 'none', pending: 'UNKNOWN', resources: 'none' };
  }
}

export function buildContextCheckpoint({ root = process.cwd(), workpackage = 'UNKNOWN', gate = 'UNKNOWN', accepted = [], blocked = [], next_action = 'UNKNOWN', local_resources = {}, swarm_state_path = null } = {}) {
  const snapshot = repositorySnapshot(root);
  const swarm = readSwarmState(root, swarm_state_path);
  const lines = [
    'KAD CONTEXT CHECKPOINT v1',
    `schema: ${CHECKPOINT_SCHEMA_VERSION}`,
    '',
    'REPOSITORY',
    `root: ${snapshot.root}`,
    `branch: ${snapshot.branch}`,
    `HEAD: ${snapshot.head}`,
    `dirty_paths: ${boundedList(snapshot.dirty_paths)}`,
    '',
    'AUTHORITY',
    `prime_directive: ${fileReference(root, 'PRIME_DIRECTIVE.md')}`,
    `agent_rules: ${fileReference(root, '.omp/AGENTS.md')}`,
    `relevant_adrs: ${fileReference(root, 'docs/adr/0004-model-agnostic-control-plane.md')}; ${fileReference(root, 'docs/adr/0005-deterministic-first-and-epistemic-classification.md')}; ${fileReference(root, 'docs/adr/0008-unified-context-knowledge-plane.md')}`,
    '',
    'ACTIVE WORK',
    `workpackage: ${String(workpackage).slice(0, 160)}`,
    `gate: ${String(gate).slice(0, 160)}`,
    `accepted: ${boundedList(accepted)}`,
    `blocked: ${boundedList(blocked)}`,
    `next_action: ${String(next_action).slice(0, 240)}`,
    `swarm_completed: ${swarm.completed}`,
    `swarm_pending: ${swarm.pending}`,
    '',
    'LOCAL RESOURCES',
    `world: ${String(local_resources.world ?? 'registered; capability=world-simulation; trust_domain=world').slice(0, 180)}`,
    `retrieval: ${String(local_resources.retrieval ?? 'registered; capability=repository-fact-finding; trust_domain=retrieval').slice(0, 180)}`,
    `ownership_state: ${swarm.resources.slice(0, 240)}`,
    `other: ${String(local_resources.other ?? 'none qualified').slice(0, 180)}`,
    '',
    'ECONOMICS',
    'oracle_automatic: false',
    'openrouter: disabled',
    'new_paid_spend: forbidden',
    '',
    'EPISTEMIC RULES',
    'repository/evidence > compacted context',
    'UNKNOWN > GUESS',
    'model output proposes',
    'deterministic policy authorizes',
  ];
  return lines.join('\n');
}

export function recordContextCheckpoint(path, checkpoint) {
  if (typeof checkpoint !== 'string' || checkpoint.length === 0) throw new Error('checkpoint must be non-empty text');
  mkdirSync(dirname(path), { recursive: true });
  const entry = {
    schema_version: CHECKPOINT_SCHEMA_VERSION,
    timestamp: new Date().toISOString(),
    sha256: sha256(checkpoint),
    checkpoint,
  };
  appendFileSync(path, `${JSON.stringify(entry)}\n`, 'utf8');
  return entry;
}

export function parseCompactionReceipt(input = {}) {
  const finite = value => Number.isFinite(value) ? value : null;
  const action = ['context-full', 'remote', 'handoff', 'shake', 'snapcompact'].includes(input.action) ? input.action : 'UNKNOWN';
  return {
    timestamp: input.timestamp ?? new Date().toISOString(),
    strategy: action,
    automatic: input.automatic === true,
    tokens_before: finite(input.tokens_before),
    tokens_after: finite(input.tokens_after),
    git_head: input.git_head ?? 'UNKNOWN',
    checkpoint_schema_version: CHECKPOINT_SCHEMA_VERSION,
    success: input.success === true,
    failure: input.success === true ? null : (input.error ?? 'UNKNOWN'),
  };
}

export function recordCompactionReceipt(path, input = {}) {
  const receipt = parseCompactionReceipt(input);
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, `${JSON.stringify(receipt)}\n`, 'utf8');
  return receipt;
}

export function readLastCompactionReceipt(path) {
  if (!existsSync(path)) return null;
  try {
    const lines = readFileSync(path, 'utf8').trim().split('\n').filter(Boolean);
    return lines.length ? JSON.parse(lines.at(-1)) : null;
  } catch {
    return null;
  }
}

export function contextStatus({ root = process.cwd(), usage = null, swarm = 'UNKNOWN', receiptPath } = {}) {
  const snapshot = repositorySnapshot(root);
  const receipt = receiptPath ? readLastCompactionReceipt(receiptPath) : null;
  const percent = Number.isFinite(usage?.percent) ? `${usage.percent}%` : 'UNKNOWN';
  return [
    `context_usage: ${percent}`,
    `compaction_strategy: ${contextPolicy.compaction.methodOrder.join(' -> ')}`,
    `threshold: ${contextPolicy.compaction.thresholdPercent}%`,
    `recent_tokens: ${contextPolicy.compaction.keepRecentTokens}`,
    'remote_compaction: disabled (method not configured)',
    `git_HEAD: ${snapshot.head}`,
    `dirty_path_count: ${snapshot.dirty_paths[0] === 'UNKNOWN' ? 'UNKNOWN' : snapshot.dirty_paths.length}`,
    `local_swarm: ${swarm}`,
    `last_compaction_receipt: ${receipt ? JSON.stringify(receipt) : 'none'}`,
  ].join('\n');
}
