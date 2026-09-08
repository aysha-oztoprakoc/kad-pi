#!/usr/bin/env node
/**
 * KAD-PI progress-state compiler (deterministic).
 *
 * Compiles a single machine-readable projection of "work done toward the Ideal
 * State Artifact" from the repository's own durable artifacts:
 *   - git branches, worktrees, and commit history
 *   - workpackages (vault projection + evidence/ workpackage dirs)
 *   - Current State Artifact snapshots (docs/state/CSA_KAD_PI_CURRENT*)
 *   - ISA requirement registry (docs/architecture/KAD_PI_IDEAL_STATE_V2.md)
 *
 * Outputs:
 *   docs/generated/progress-state.json  (schema: kad-progress-state-v1)
 *   docs/generated/progress-state.md    (human-readable summary)
 *
 * This compiler is read-only with respect to authority: it never mutates the
 * vault, evidence, or workctl state. It is the "downstream projection" surface
 * that GitHub Actions publishes so a later OMP session can resume the goal.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..', '..');

const STATE_DIR = join(ROOT, 'docs', 'state');
const ISA_PATH = join(ROOT, 'docs', 'architecture', 'KAD_PI_IDEAL_STATE_V2.md');
const WP_PROJECTION = join(ROOT, 'vault', '90_Derived', 'Projections', 'workpackages.json');
const EVIDENCE_DIR = join(ROOT, 'evidence');
const OUT_DIR = join(ROOT, 'docs', 'generated');

function git(args, fallback = '') {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return fallback;
  }
}

function lines(text) {
  return text ? text.split('\n').filter((l) => l.length > 0) : [];
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function collectBranches() {
  const raw = git(['branch', '-a', '--format=%(refname:short)', '--no-color']);
  return lines(raw).filter((b) => b && b !== 'origin' && b !== 'origin/HEAD' && !b.endsWith('/HEAD'));
}

function collectWorktrees() {
  // porcelain: each worktree is a block of "worktree <path>", "HEAD <sha>", "branch <ref>".
  const raw = lines(git(['worktree', 'list', '--porcelain']));
  const trees = [];
  let current = null;
  for (const line of raw) {
    if (line.startsWith('worktree ')) {
      current = { path: line.slice('worktree '.length), head: null, branch: null };
      trees.push(current);
    } else if (line.startsWith('HEAD ') && current) {
      current.head = line.slice('HEAD '.length);
    } else if (line.startsWith('branch ') && current) {
      current.branch = line.slice('branch '.length);
    }
  }
  return trees;
}

function collectCommits() {
  const total = Number(git(['rev-list', '--all', '--count'], '0')) || 0;
  const log = lines(git(['log', '-n', '60', '--all', '--date=short', '--pretty=format:%h|%ad|%s|%D']));
  const entries = log.map((line) => {
    const [hash, date, ...rest] = line.split('|');
    const subject = rest.slice(0, -1).join('|');
    const refs = rest.length > 1 ? rest[rest.length - 1] : '';
    return { hash, date, subject, refs: refs.trim() };
  });
  return { total, recent: entries };
}

function collectCsaSnapshots() {
  const files = readdirSync(STATE_DIR)
    .filter((f) => /^CSA_KAD_PI_CURRENT(_.*)?\.md$/.test(f))
    .sort();
  return files.map((file) => {
    const text = readFileSync(join(STATE_DIR, file), 'utf8');
    const generated =
      (text.match(/\*\*Generated\*\*:?\s*`?([^`*\n]+)`?/) || [])[1]?.trim() ||
      (text.match(/\*\*Timestamp\*\*:?\s*`?([^`*\n]+)`?/) || [])[1]?.trim() ||
      'UNKNOWN';
    const cutoff =
      (text.match(/\*\*Evidence cutoff\*\*:?\s*`([a-f0-9]+)`/) || [])[1] ||
      (text.match(/\*\*Base Commit\*\*:?\s*`([a-f0-9]+)`/) || [])[1] ||
      'UNKNOWN';
    const head =
      (text.match(/\| HEAD \| `([a-f0-9]+)` \|/) || [])[1] || cutoff;
    return { file, generated, evidence_cutoff: cutoff, head };
  });
}

function collectWorkpackages() {
  const projection = readJson(WP_PROJECTION);
  const projected = Array.isArray(projection?.workpackages) ? projection.workpackages : [];
  const byId = new Map(projected.map((wp) => [wp.wp_id, wp]));

  const evidenceDirs = existsSync(EVIDENCE_DIR)
    ? readdirSync(EVIDENCE_DIR, { withFileTypes: true })
        .filter((e) => e.isDirectory() && /^WP-|^EXP-KAD-/.test(e.name))
        .map((e) => e.name)
    : [];

  const statuses = {};
  const items = [];
  for (const wp of projected) {
    const status = wp.status ?? 'UNKNOWN';
    statuses[status] = (statuses[status] ?? 0) + 1;
    items.push({
      id: wp.wp_id,
      project: wp.project ?? 'kad-pi',
      title: wp.title ?? '',
      status,
      priority: wp.priority ?? null,
      evidence: wp.evidence_target ?? null,
      source: 'projection'
    });
  }
  for (const dir of evidenceDirs) {
    if (!byId.has(dir)) {
      statuses['EVIDENCE_ONLY'] = (statuses['EVIDENCE_ONLY'] ?? 0) + 1;
      items.push({ id: dir, project: 'kad-pi', title: '(evidence dir without projection entry)', status: 'EVIDENCE_ONLY', priority: null, evidence: `evidence/${dir}/`, source: 'evidence-dir' });
    }
  }
  return { total: items.length, statuses, items };
}

function collectIsaProgress() {
  const text = existsSync(ISA_PATH) ? readFileSync(ISA_PATH, 'utf8') : '';
  const statuses = {};
  // Requirement registry rows: | **`REQ-KAD-XXX-001`** | `DOMAIN` | `MUST` | ... | `STATUS` |
  for (const line of text.split('\n')) {
    if (!line.includes('`REQ-KAD-')) continue;
    const cells = line.split('|').map((c) => c.trim());
    const status = (cells[cells.length - 2] || '').replace(/`/g, '').trim();
    if (/^[A-Z][A-Z0-9_]*$/.test(status)) statuses[status] = (statuses[status] ?? 0) + 1;
  }
  const total = Object.values(statuses).reduce((a, b) => a + b, 0);
  return { total, statuses };
}

function build() {
  const generatedAt = new Date().toISOString();
  const head = git(['rev-parse', 'HEAD']);
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const remote = git(['config', '--get', 'remote.origin.url'], 'UNKNOWN');
  const data = {
    schema: 'kad-progress-state-v1',
    generated_at: generatedAt,
    repository: { root: ROOT, branch, head, remote },
    branches: collectBranches(),
    worktrees: collectWorktrees(),
    commits: collectCommits(),
    workpackages: collectWorkpackages(),
    csa_snapshots: collectCsaSnapshots(),
    isa_progress: collectIsaProgress()
  };
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, 'progress-state.json'), `${JSON.stringify(data, null, 2)}\n`);
  writeFileSync(join(OUT_DIR, 'progress-state.md'), renderMarkdown(data));
  return data;
}

function renderMarkdown(d) {
  const wp = d.workpackages;
  const isa = d.isa_progress;
  const snap = d.csa_snapshots;
  const commits = d.commits;
  const out = [];
  out.push('# KAD-PI Progress toward Ideal State Artifact');
  out.push('');
  out.push(`**Generated**: ${d.generated_at} · **HEAD**: \`${d.repository.head}\` · **Branch**: ${d.repository.branch}`);
  out.push(`**Remote**: ${d.repository.remote}`);
  out.push('');
  out.push('## ISA requirement registry');
  out.push('');
  out.push(`| Status | Count |`);
  out.push('|---|---|');
  for (const [status, count] of Object.entries(isa.statuses).sort()) {
    out.push(`| \`${status}\` | ${count} |`);
  }
  out.push(`| **Total** | ${isa.total} |`);
  out.push('');
  out.push('## Workpackages');
  out.push('');
  out.push(`| Status | Count |`);
  out.push('|---|---|');
  for (const [status, count] of Object.entries(wp.statuses).sort()) {
    out.push(`| \`${status}\` | ${count} |`);
  }
  out.push(`| **Total** | ${wp.total} |`);
  out.push('');
  out.push('## Worktrees');
  out.push('');
  if (d.worktrees.length === 0) {
    out.push('_(none)_');
  } else {
    out.push('| Path | Branch | HEAD |');
    out.push('|---|---|---|');
    for (const t of d.worktrees) out.push(`| ${t.path} | ${t.branch ?? 'detached'} | ${t.head ?? '?'} |`);
  }
  out.push('');
  out.push('## Branches');
  out.push('');
  out.push(d.branches.map((b) => `- \`${b}\``).join('\n'));
  out.push('');
  out.push('## Current State Artifact snapshots');
  out.push('');
  out.push('| Snapshot | Generated | Evidence cutoff | HEAD |');
  out.push('|---|---|---|---|');
  for (const s of snap) out.push(`| ${s.file} | ${s.generated} | \`${s.evidence_cutoff}\` | \`${s.head}\` |`);
  out.push('');
  out.push('## Recent commits (all refs)');
  out.push('');
  out.push(`Total commits: ${commits.total}`);
  out.push('');
  out.push('| Hash | Date | Subject | Refs |');
  out.push('|---|---|---|---|');
  for (const c of commits.recent) out.push(`| \`${c.hash}\` | ${c.date} | ${c.subject} | ${c.refs} |`);
  out.push('');
  out.push('> This artifact is a deterministic downstream projection compiled from git,');
  out.push('> `vault/90_Derived/Projections/workpackages.json`, `evidence/`, and `docs/state/`.');
  out.push('> It holds no lifecycle or promotion authority. Regenerate with `bin/kad-progress`.');
  return out.join('\n') + '\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = build();
  process.stdout.write(`progress-state: ${data.workpackages.total} workpackages, ${data.isa_progress.total} ISA requirements, ${data.commits.total} commits, ${data.csa_snapshots.length} CSA snapshots\n`);
}
