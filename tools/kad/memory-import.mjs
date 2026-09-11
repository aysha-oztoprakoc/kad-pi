#!/usr/bin/env node
/**
 * tools/kad/memory-import.mjs — deterministic OKF v0.2 frontmatter normaliser.
 *
 * ai-memory's OKF v0.2 rule is: every `.md` that is not a reserved name
 * (`index.md`, `_meta.md`, `log.md`, `bootstrap.md`) must carry YAML frontmatter
 * with a non-empty `type`. The KAD vault predates that rule — some pages carry
 * rich KAD frontmatter without a `type`, some carry none at all.
 *
 * This pass is deterministic and idempotent: it only ever ADDS a missing `type`
 * (and import provenance when a page had no frontmatter whatsoever). It never
 * rewrites, reorders, or drops an existing key.
 *
 * Usage:
 *   node tools/kad/memory-import.mjs --root <dir>            # apply
 *   node tools/kad/memory-import.mjs --root <dir> --check    # report only
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';

/** Reserved names the OKF bundle treats specially; they must not be touched. */
export const RESERVED_NAMES = new Set(['index.md', '_meta.md', 'log.md', 'bootstrap.md']);

/**
 * Zone-to-type mapping. OKF `type` is a free-form label describing what kind of
 * concept a page holds, so it is derived from the zone that owns the page rather
 * than from its filename.
 */
export const ZONE_TYPES = [
  ['00_Governance/', 'Rule'],
  ['10_Raw/', 'Source Capture'],
  ['20_Sources/', 'Source'],
  ['30_Knowledge/', 'Concept'],
  ['40_Decisions/', 'Decision'],
  ['40_Research/Papers/', 'Concept'],
  ['40_Research/Claims/', 'Claim'],
  ['40_Research/Questions/', 'Question'],
  ['40_Research/Syntheses/', 'Synthesis'],
  ['50_Projects/', 'State'],
  ['60_Operations/', 'Procedure'],
  ['70_Queries/', 'Query'],
  ['80_Review/', 'Pending Note'],
  ['90_Derived/', 'Derived Artifact'],
  ['99_Archive/', 'Archived Note'],
  ['00_Home/', 'Note']
];

/** Substrate-generated monthly event ledgers (`log-YYYY-MM.md`). */
const SUBSTRATE_LEDGER = /^log-\d{4}-\d{2}\.md$/;

export function typeForPath(relPath) {
  const normalised = relPath.split('\\').join('/');
  if (SUBSTRATE_LEDGER.test(normalised.split('/').pop())) return 'Log';
  for (const [prefix, type] of ZONE_TYPES) {
    if (normalised.startsWith(prefix)) return type;
  }
  return 'Note';
}

/** Splits leading YAML frontmatter from a page body, when present. */
function splitFrontmatter(text) {
  if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) return { frontmatter: null, body: text };
  const end = text.indexOf('\n---', 4);
  if (end < 0) return { frontmatter: null, body: text };
  const afterDelimiter = text.indexOf('\n', end + 1);
  if (afterDelimiter < 0) return { frontmatter: text.slice(4, end), body: '' };
  return { frontmatter: text.slice(4, end), body: text.slice(afterDelimiter + 1) };
}

const hasNonEmptyKey = (frontmatter, key) =>
  new RegExp(`^${key}:[ \\t]*\\S`, 'm').test(frontmatter);

/**
 * YAML characters that cannot start a plain scalar, plus constructs that are
 * structurally meaningful and must therefore never be quoted.
 */
const YAML_INDICATORS = new Set(['-', '?', ':', ',', '[', ']', '{', '}', '#', '&', '*', '!', '|', '>', '%', '@', '`']);

const isFlowCollection = (v) => /^[[{].*[\]}]$/.test(v);
const isBlockScalar = (v) => /^[|>][+-]?[0-9]?$/.test(v);
const isQuoted = (v) => v.length >= 2 && ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")));

/**
 * A plain scalar is unsafe when it starts with a YAML indicator, contains a
 * colon-space sequence (which YAML reads as a nested mapping), contains a
 * space-hash sequence (which YAML reads as a comment), or is a lone structural
 * indicator. `parseFrontmatter` in tools/kad/wiki/index.mjs is a lenient regex
 * reader and never noticed these; strict OKF parsers reject them.
 */
function needsQuoting(v) {
  if (v === '' || isQuoted(v) || isFlowCollection(v) || isBlockScalar(v)) return false;
  if (YAML_INDICATORS.has(v[0])) return true;
  return /:\s|:$|\s#/.test(v);
}

const quoteYaml = (v) => `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

/**
 * Quotes every unsafe plain scalar inside a frontmatter block. Only the value
 * portion of `key: value` lines and `- value` sequence items is touched; compact
 * mappings inside a sequence (`- key: value`) are left intact.
 */
export function normaliseFrontmatterScalars(frontmatter) {
  const quoted = [];
  const text = frontmatter.split('\n').map((line) => {
    let match = line.match(/^(\s*[A-Za-z_][\w.-]*:[ \t]+)(\S.*)$/);
    if (match && needsQuoting(match[2])) {
      quoted.push(match[2]);
      return match[1] + quoteYaml(match[2]);
    }
    match = line.match(/^(\s*-[ \t]+)(\S.*)$/);
    if (match && !/^[A-Za-z_][\w.-]*:[ \t]/.test(match[2]) && needsQuoting(match[2])) {
      quoted.push(match[2]);
      return match[1] + quoteYaml(match[2]);
    }
    return line;
  }).join('\n');
  return { text, quoted };
}

/**
 * Computes the normalised page text, or null when nothing needs to change.
 */
export function normalisePage(relPath, text, timestamp) {
  const { frontmatter, body } = splitFrontmatter(text);
  const type = typeForPath(relPath);

  if (frontmatter === null) {
    // Unprovenanced page: give it a type and record where it came from.
    const header = [
      '---',
      `type: ${type}`,
      'generated:',
      '  by: process:kad-memory-import',
      `  at: ${timestamp}`,
      '---',
      '',
      ''
    ].join('\n');
    return { text: `${header}${text}`, added: ['type', 'generated'] };
  }

  const added = [];
  const scalars = normaliseFrontmatterScalars(frontmatter);
  let normalised = scalars.text;
  if (scalars.quoted.length) added.push(`${scalars.quoted.length} yaml-scalar(s) quoted`);

  if (!hasNonEmptyKey(normalised, 'type')) {
    normalised = `${normalised}\ntype: ${type}`;
    added.push('type');
  }

  if (!added.length) return null;
  return { text: `---\n${normalised}\n---\n${body}`, added };
}

/** Recursively collects normalisable markdown pages, skipping VCS internals. */
export function collectPages(root) {
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.git' || entry.name === '.obsidian' || entry.name === 'node_modules') return [];
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (!entry.name.endsWith('.md')) return [];
    if (RESERVED_NAMES.has(entry.name)) return [];
    return [full];
  });
  return existsSync(root) ? walk(root) : [];
}

export function runImport({ root, check = false, timestamp = new Date().toISOString() }) {
  const pages = collectPages(root);
  const changed = [];
  for (const page of pages) {
    const text = readFileSync(page, 'utf8');
    const result = normalisePage(relative(root, page), text, timestamp);
    if (!result) continue;
    changed.push({ path: relative(root, page), added: result.added });
    if (!check) writeFileSync(page, result.text);
  }
  return { root: resolve(root), scanned: pages.length, changed, applied: !check };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const rootIndex = args.indexOf('--root');
  const root = resolve(rootIndex >= 0 ? args[rootIndex + 1] : 'vault');
  const check = args.includes('--check');
  const result = runImport({ root, check });
  console.log(`scanned ${result.scanned} pages under ${result.root}`);
  console.log(`${result.applied ? 'normalised' : 'would normalise'} ${result.changed.length} pages`);
  for (const change of result.changed) console.log(`  ${change.path} (+${change.added.join(', ')})`);
}
