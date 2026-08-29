#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LOCK_RELATIVE = '.agents/workspace/skills.lock.json';
const MATT_REPOSITORY = 'https://github.com/mattpocock/skills';
const MATT_REVISION = '6654f6b60cd9d5be8b54c6fafe44346dabeb3b76';
const BOARD_REPOSITORY = 'https://github.com/harryvondiesel-web/5-persona-advisory-board';
const BOARD_REVISION = 'fd58b80648c399f29b36d31739a0b07d459b43cf';

const SOURCES = [
  ['5-persona-advisory-board', BOARD_REPOSITORY, BOARD_REVISION, '.agents/upstream/5-persona-advisory-board/SKILL.md', '.agents/skills/5-persona-advisory-board/SKILL.md', '.agents/upstream/5-persona-advisory-board/LICENSE', 'VANILLA', 'frontmatter normalization only'],
  ['ask-matt', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/ask-matt/SKILL.md', '.agents/skills/ask-matt/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA + KAD OVERLAY', 'routing reference to Wayfinder and KAD advisory board'],
  ['code-review', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/code-review/SKILL.md', '.agents/skills/code-review/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA + CONFIG', 'canonical skill capability metadata'],
  ['codebase-design', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/codebase-design/SKILL.md', '.agents/skills/codebase-design/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA + CONFIG', 'canonical skill capability metadata'],
  ['diagnosing-bugs', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/diagnosing-bugs/SKILL.md', '.agents/skills/diagnosing-bugs/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA + CONFIG', 'canonical skill capability metadata'],
  ['domain-modeling', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/domain-modeling/SKILL.md', '.agents/skills/domain-modeling/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA + KAD OVERLAY', 'canonical skill capability metadata plus terminology authority boundary'],
  ['grill-with-docs', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/grill-with-docs/SKILL.md', '.agents/skills/grill-with-docs/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA + KAD OVERLAY', 'canonical skill capability metadata plus Wayfinder decision boundary'],
  ['implement', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/implement/SKILL.md', '.agents/skills/implement/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA + KAD OVERLAY', 'canonical skill capability metadata plus workctl claim and handoff boundary'],
  ['improve-codebase-architecture', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/improve-codebase-architecture/SKILL.md', '.agents/skills/improve-codebase-architecture/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA + CONFIG', 'canonical skill capability metadata'],
  ['prototype', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/prototype/SKILL.md', '.agents/skills/prototype/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA + KAD OVERLAY', 'experimental artifact boundary'],
  ['research', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/research/SKILL.md', '.agents/skills/research/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA + KAD OVERLAY', 'evidence-only decision boundary'],
  ['resolving-merge-conflicts', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/resolving-merge-conflicts/SKILL.md', '.agents/skills/resolving-merge-conflicts/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA', 'no local change'],
  ['setup-matt-pocock-skills', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/setup-matt-pocock-skills/SKILL.md', '.agents/skills/setup-matt-pocock-skills/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA', 'no local change'],
  ['tdd', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/tdd/SKILL.md', '.agents/skills/tdd/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA + KAD OVERLAY', 'canonical skill capability metadata plus conditional KAD acceptance checks'],
  ['to-spec', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/to-spec/SKILL.md', '.agents/skills/to-spec/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA + KAD OVERLAY', 'canonical skill capability metadata plus decision fidelity boundary'],
  ['to-tickets', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/to-tickets/SKILL.md', '.agents/skills/to-tickets/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA + KAD OVERLAY', 'canonical skill capability metadata plus deterministic workctl bridge'],
  ['triage', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/triage/SKILL.md', '.agents/skills/triage/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA + CONFIG', 'canonical skill capability metadata'],
  ['wayfinder', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/wayfinder/SKILL.md', '.agents/skills/wayfinder/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA + KAD OVERLAY', 'ask_user decision protocol and project-scoped KAD policy'],
  ['wizard', MATT_REPOSITORY, MATT_REVISION, '.agents/upstream/matt/skills/engineering/wizard/SKILL.md', '.agents/skills/wizard/SKILL.md', '.agents/upstream/matt/LICENSE', 'VANILLA', 'no local change'],
];

function absolute(root, relative) { return path.resolve(root, relative); }
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function readLock(root) { return JSON.parse(fs.readFileSync(absolute(root, LOCK_RELATIVE), 'utf8')); }
function frontmatter(file) {
  const content = fs.readFileSync(file, 'utf8').replaceAll('\r\n', '\n');
  const match = content.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) return null;
  const name = match[1].match(/^name:\s*([^\s#]+)\s*$/m)?.[1] ?? null;
  const description = match[1].match(/^description:\s*(.+)$/m)?.[1] ?? null;
  return { name, description };
}

export function buildLock(root = ROOT, verifiedAt = new Date().toISOString()) {
  return {
    version: 1,
    policy: 'External skill instructions are pinned and never auto-updated.',
    skills: SOURCES.map(([name, upstream, revision, sourcePath, executionPath, licensePath, localMode, delta]) => {
      const upstreamFile = absolute(root, sourcePath);
      const executionFile = absolute(root, executionPath);
      return {
        name,
        upstream,
        revision,
        source_path: sourcePath,
        execution_path: executionPath,
        upstream_sha256: sha256(upstreamFile),
        execution_sha256: sha256(executionFile),
        license: fs.existsSync(absolute(root, licensePath)) ? 'MIT' : 'UNKNOWN',
        license_path: licensePath,
        local_mode: localMode,
        local_delta: delta,
        verified_at: verifiedAt,
      };
    }),
  };
}

function checkEntry(root, entry) {
  const required = ['name', 'upstream', 'revision', 'source_path', 'execution_path', 'upstream_sha256', 'execution_sha256', 'license', 'local_mode', 'local_delta', 'verified_at'];
  const missing = required.filter((field) => !entry[field]);
  if (missing.length) return { name: entry.name ?? '<unknown>', status: 'UNPINNED', missing };
  const upstreamFile = absolute(root, entry.source_path);
  const executionFile = absolute(root, entry.execution_path);
  if (!fs.existsSync(upstreamFile) || !fs.existsSync(executionFile)) return { name: entry.name, status: 'UNKNOWN', reason: 'source or execution path missing' };
  const upstreamSha = sha256(upstreamFile);
  const executionSha = sha256(executionFile);
  const metadata = frontmatter(executionFile);
  if (!metadata || metadata.name !== entry.name || !metadata.description) return { name: entry.name, status: 'UNKNOWN', reason: 'invalid execution frontmatter' };
  if (upstreamSha !== entry.upstream_sha256) return { name: entry.name, status: 'UPSTREAM_CHANGED', upstream_sha256: upstreamSha, execution_sha256: executionSha };
  if (executionSha !== entry.execution_sha256) return { name: entry.name, status: 'LOCAL_DELTA', upstream_sha256: upstreamSha, execution_sha256: executionSha, locked_execution_sha256: entry.execution_sha256 };
  return { name: entry.name, status: executionSha === upstreamSha ? 'CURRENT' : 'LOCAL_DELTA', upstream_sha256: upstreamSha, execution_sha256: executionSha };
}

function workflowChecks(root) {
  const askMatt = absolute(root, '.agents/skills/ask-matt/SKILL.md');
  if (!fs.existsSync(askMatt)) return { errors: [], warnings: [] };
  const errors = [];
  const warnings = [];
  if (!fs.existsSync(absolute(root, 'tools/workspace/workflow-bridge.mjs'))) errors.push('KAD workflow bridge missing');
  if (!fs.existsSync(absolute(root, '.agents/skill-overlays/wayfinder-kad.md'))) errors.push('KAD Wayfinder overlay missing');
  const routing = fs.readFileSync(askMatt, 'utf8');
  const flow = ['/wayfinder', '/to-spec', '/to-tickets', '/implement', '/tdd', '/code-review'];
  let cursor = -1;
  for (const step of flow) {
    const next = routing.indexOf(step, cursor + 1);
    if (next < 0) { errors.push(`ask-matt routing reference missing: ${step}`); break; }
    cursor = next;
  }
  return { errors, warnings };
}

export function validateLock({ root = ROOT, lock = readLock(root) } = {}) {
  const errors = [];
  const entries = Array.isArray(lock.skills) ? lock.skills.map((entry) => checkEntry(root, entry)) : [];
  if (lock.version !== 1) errors.push('unsupported lock version');
  if (!Array.isArray(lock.skills) || lock.skills.length === 0) errors.push('skills lock must contain a non-empty skills array');
  const names = lock.skills?.map((entry) => entry.name) ?? [];
  if (new Set(names).size !== names.length) errors.push('skills lock contains duplicate names');
  for (const entry of entries) if (entry.status === 'UNPINNED') errors.push(`${entry.name}: missing ${entry.missing.join(', ')}`);
  const workflow = workflowChecks(root);
  errors.push(...workflow.errors);
  const warnings = entries.filter((entry) => ['LOCAL_DELTA', 'UPSTREAM_CHANGED', 'UNKNOWN'].includes(entry.status));
  warnings.push(...workflow.warnings.map((message) => ({ name: 'workflow', status: 'WARNING', reason: message })));
  return { status: errors.length ? 'FAIL' : warnings.length ? 'WARN' : 'PASS', errors, warnings, entries, workflow, counts: entries.reduce((counts, entry) => ({ ...counts, [entry.status]: (counts[entry.status] ?? 0) + 1 }), {}) };
}

export function runSkillGovernance(argv = process.argv.slice(2), root = ROOT) {
  const command = argv[0] ?? 'doctor';
  if (command === 'write-lock') {
    const lock = buildLock(root);
    const target = absolute(root, LOCK_RELATIVE);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${JSON.stringify(lock, null, 2)}\n`);
    return { code: 0, value: lock };
  }
  if (command !== 'doctor' && command !== 'validate') return { code: 1, error: `unknown skill governance command: ${command}` };
  try {
    const result = validateLock({ root });
    return { code: result.status === 'FAIL' ? 1 : 0, value: result };
  } catch (error) {
    return { code: 1, error: `skills lock: ${error.message}` };
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = runSkillGovernance();
  process.stdout.write(`${result.code === 0 ? JSON.stringify(result.value, null, 2) : result.error ?? JSON.stringify(result.value, null, 2)}\n`);
  process.exitCode = result.code;
}
