#!/usr/bin/env node
/**
 * Refresh the repository block of the Current State Artifact.
 *
 * The CSA claims `state: CURRENT`, and the test suite enforces that claim by failing when the
 * recorded HEAD falls more than one commit behind. Nothing regenerated it though — every refresh
 * was hand-written Python in an agent's shell, which is how the artifact ended up naming a commit
 * six commits behind with 466 fewer dirty paths while every reader treated it as live.
 *
 * Two rules this encodes:
 *
 * - **Dirty means "a human has changes to review".** `evidence/WP-KAD-002/causal-journal.jsonl` is
 *   machine-appended by `workctl` and the doctors, so the tree is dirty again after nearly every
 *   command. A `dirty: true` that is always true is noise the reader learns to skip, so the
 *   machine-appended paths are excluded from the count and named in `dirty_paths_excluded` rather
 *   than silently dropped.
 * - **The markdown is part of the artifact.** Rewriting only the JSON would leave the human view
 *   stating a different HEAD, which is the drift this tool exists to prevent. Every field it
 *   rewrites is asserted to have matched; a pattern that no longer matches fails loudly instead of
 *   quietly updating nothing.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const CSA_JSON_PATH = 'docs/state/CSA_KAD_PI_CURRENT.json';
export const CSA_MARKDOWN_PATH = 'docs/state/CSA_KAD_PI_CURRENT.md';

export const MACHINE_APPENDED = ['evidence/WP-KAD-002/causal-journal.jsonl'];
export const MACHINE_APPENDED_RULE = 'machine-appended by workctl and the doctors; listed here so the exclusion is declared, not silent';

/** Porcelain entries as repository-relative paths; a rename reports the path that now exists. */
export function parsePorcelain(raw) {
  return raw
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const entry = line.slice(3).trim();
      const renamed = entry.includes(' -> ') ? entry.split(' -> ')[1] : entry;
      return renamed.replace(/^"|"$/g, '');
    });
}

export function classifyDirty(paths, machineAppended = MACHINE_APPENDED) {
  const excluded = [];
  const reviewable = [];
  for (const path of paths) {
    if (machineAppended.includes(path)) excluded.push(path);
    else reviewable.push(path);
  }
  return { dirty: reviewable.length > 0, count: reviewable.length, paths: reviewable, excluded };
}

export function computeRepositoryState({ root, machineAppended = MACHINE_APPENDED }) {
  const git = (args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();
  const porcelain = execFileSync('git', ['-C', root, 'status', '--porcelain', '--untracked-files=all'], {
    encoding: 'utf8'
  });
  const classified = classifyDirty(parsePorcelain(porcelain), machineAppended);

  let divergence = null;
  for (const ref of ['origin/main', '@{upstream}']) {
    try {
      divergence = Number(git(['rev-list', '--count', `${ref}..HEAD`]));
      break;
    } catch {
      // no such ref on this checkout: try the next, and leave the recorded value alone if none resolves
    }
  }

  return {
    head: git(['rev-parse', 'HEAD']),
    branch: git(['rev-parse', '--abbrev-ref', 'HEAD']),
    divergence,
    dirty: classified.dirty,
    dirty_paths: classified.count,
    dirty_paths_excluded: classified.excluded,
    dirty_paths_excluded_rule: MACHINE_APPENDED_RULE
  };
}

function replaceOnce(text, pattern, replacement, label) {
  if (!pattern.test(text)) throw new Error(`csa-refresh: ${label} not found in ${CSA_MARKDOWN_PATH}; refusing to rewrite nothing`);
  return text.replace(pattern, replacement);
}

export function renderMarkdown(markdown, state, generatedAt) {
  let text = markdown;
  text = replaceOnce(text, /\*\*Generated\*\*: [^\n]+/, `**Generated**: ${generatedAt}`, 'the generated line');
  text = replaceOnce(text, /\*\*Evidence cutoff\*\*: `[0-9a-f]+`/, `**Evidence cutoff**: \`${state.head}\``, 'the evidence cutoff');
  text = replaceOnce(text, /\| HEAD \| `[0-9a-f]+` \|/, `| HEAD | \`${state.head.slice(0, 7)}\` |`, 'the HEAD row');
  text = replaceOnce(text, /\| Branch \| `[^`]+` \|/, `| Branch | \`${state.branch}\` |`, 'the branch row');
  if (state.divergence !== null) {
    text = replaceOnce(
      text,
      /\| Divergence \| `\d+`[^|]*\|/,
      `| Divergence | \`${state.divergence}\` (ahead, unpushed) |`,
      'the divergence row'
    );
  }
  text = replaceOnce(
    text,
    /\| Dirty \| `(?:true|false)` \([^)]*\) \|/,
    `| Dirty | \`${state.dirty}\` (${state.dirty_paths} paths${state.dirty_paths_excluded.length ? `, ${state.dirty_paths_excluded.length} machine-appended excluded` : ''}) |`,
    'the dirty row'
  );
  return text;
}

function main(args) {
  const root = process.cwd();
  const jsonPath = join(root, CSA_JSON_PATH);
  const markdownPath = join(root, CSA_MARKDOWN_PATH);
  const state = computeRepositoryState({ root });
  const generatedAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const csa = JSON.parse(readFileSync(jsonPath, 'utf8'));

  const updated = {
    ...csa,
    generated_at: generatedAt,
    evidence_cutoff: state.head,
    repository: { ...csa.repository, ...state, ...(state.divergence === null ? { divergence: csa.repository.divergence } : {}) }
  };

  if (args.includes('--dry-run')) {
    process.stdout.write(`${JSON.stringify({ dry_run: true, repository: updated.repository }, null, 2)}\n`);
    return 0;
  }

  writeFileSync(jsonPath, `${JSON.stringify(updated, null, 2)}\n`);
  writeFileSync(markdownPath, renderMarkdown(readFileSync(markdownPath, 'utf8'), state, generatedAt));
  process.stdout.write(`${JSON.stringify({ dry_run: false, files: [CSA_JSON_PATH, CSA_MARKDOWN_PATH], repository: updated.repository }, null, 2)}\n`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = main(process.argv.slice(2));
}
