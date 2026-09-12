#!/usr/bin/env node
/**
 * Sync and render the OMP settings matrix.
 *
 * The matrix is a *capture* of the OMP 18.0.11 settings surface, and a capture cannot notice the
 * config moving: twelve rows were still stating a previous model cascade as VERIFIED three days
 * after `.omp/config.yml` had changed, and the markdown companion had drifted further still —
 * it showed `retry.maxDelayMs: 300000` and `retry.usageReservePct: 10` long after the project
 * declared `0` and `5`. A snapshot that is read as current is worse than no snapshot.
 *
 * So the rows whose key `.omp/config.yml` declares are re-synced from the running harness
 * (`omp config list --json`, which resolves the same project layer the harness itself uses), and
 * the markdown view is rendered from the JSON rather than maintained beside it. Rows the project
 * does not declare describe machine-global facts this repository cannot verify, and are left as
 * reported by the capture.
 *
 * Two things this tool deliberately does NOT do: invent a `schema_default` it cannot source (a row
 * without one is reported as unclassified instead), and touch `effective_source` — the value comes
 * from the harness, so the provenance stays "runtime, not schema", which is what the matrix's own
 * tests assert.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseSimpleYaml } from './context-compiler.mjs';

export const MATRIX_JSON_PATH = 'docs/state/OMP_SETTINGS_COMPATIBILITY_MATRIX.json';
export const MATRIX_MARKDOWN_PATH = 'docs/state/OMP_SETTINGS_COMPATIBILITY_MATRIX.md';

/** Resolve a dotted setting id against the parsed project config, as the tests do. */
export function resolveDeclared(config, settingId) {
  return settingId.split('.').reduce(
    (value, key) => (value && typeof value === 'object' && key in value ? value[key] : undefined),
    config
  );
}

/** Every dotted path the project config declares, objects included. */
export function declaredPaths(config, prefix = '') {
  const paths = [];
  if (!config || typeof config !== 'object') return paths;
  for (const [key, value] of Object.entries(config)) {
    const id = prefix ? `${prefix}.${key}` : key;
    paths.push(id);
    if (value && typeof value === 'object' && !Array.isArray(value)) paths.push(...declaredPaths(value, id));
  }
  return paths;
}

/**
 * The harness's own view of every setting, including the project layer's overrides. One call: the
 * per-key `omp config get` would be 498 processes.
 */
export function readLiveSettings(root) {
  const raw = execFileSync('omp', ['config', 'list', '--json'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const parsed = JSON.parse(raw);
  const settings = new Map();
  for (const [key, entry] of Object.entries(parsed)) settings.set(key, entry?.value);
  return settings;
}

export function readRuntimeVersion(root) {
  return execFileSync('mise', ['which', 'omp'], { cwd: root, encoding: 'utf8' }).trim();
}

function ompVersion(root) {
  return execFileSync('omp', ['--version'], { cwd: root, encoding: 'utf8' }).trim().replace(/^omp\//, '');
}

/**
 * @returns {{changes: Array<{setting_id: string, from: unknown, to: unknown}>, unclassified: string[], compared: number}}
 */
export function syncMatrix({ matrix, config, live, runtimeVersion, observedAt }) {
  const changes = [];
  const compared = [];
  for (const row of matrix.settings) {
    if (resolveDeclared(config, row.setting_id) === undefined) continue;
    if (!live.has(row.setting_id)) continue;
    const observed = live.get(row.setting_id);
    compared.push(row.setting_id);
    if (JSON.stringify(observed) !== JSON.stringify(row.effective_value)) {
      changes.push({ setting_id: row.setting_id, from: row.effective_value, to: observed });
    }
    row.effective_value = observed;
    row.current_result = 'VERIFIED';
  }

  const rowIds = new Set(matrix.settings.map((row) => row.setting_id));
  const ancestors = (id) => id.split('.').slice(0, -1).map((_, index, parts) => parts.slice(0, index + 1).join('.'));
  // A declared path is classified if it is a row itself, or any row covers it from above (a
  // `modelRoles` row covers `modelRoles.default`) or from below (a `retry.maxDelayMs` row covers
  // its parent block). What is left over is a setting this repository declares and the capture
  // cannot describe at all — `retry.waitForUsageReset` is the live example, and it now decides the
  // launcher profiles (ADR 0019 amendment). Naming it is the point; pretending it is covered is not.
  const descendants = (id) => [...rowIds].filter((rowId) => rowId.startsWith(`${id}.`));
  const unclassified = declaredPaths(config).filter(
    (id) => !rowIds.has(id) && !ancestors(id).some((ancestor) => rowIds.has(ancestor)) && descendants(id).length === 0
  );

  matrix.baseline = { ...(matrix.baseline ?? {}), observed_runtime_version: runtimeVersion, observed_at: observedAt };
  return { changes, unclassified: [...new Set(unclassified)].sort(), compared: compared.length };
}

const SENTINELS = new Set(['UNKNOWN', 'UNSET']);

function cell(value) {
  if (typeof value === 'string' && SENTINELS.has(value)) return value;
  const text = JSON.stringify(value) ?? String(value);
  const clipped = text.length > 32 ? `${text.slice(0, 31)}…` : text;
  // A literal pipe or newline inside a value would break the table it is rendered into.
  return clipped.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

export function renderMarkdown(matrix) {
  const groups = new Map();
  for (const row of matrix.settings) {
    const prefix = row.setting_id.includes('.') ? `${row.setting_id.split('.')[0]}.*` : row.setting_id;
    if (!groups.has(prefix)) groups.set(prefix, []);
    groups.get(prefix).push(row);
  }

  const lines = [
    '# OMP Settings Compatibility Matrix',
    '',
    `**Schema**: \`${matrix.schema}\` · **OMP**: ${matrix.omp_version} · **Source revision**: \`${matrix.source_revision}\``,
    '',
    'Rendered by `make models-sync` from `docs/state/OMP_SETTINGS_COMPATIBILITY_MATRIX.json` — edit the JSON, not this file.',
    '',
    `**Baseline.** ${matrix.baseline?.skew_note ?? ''}`,
    '',
    `**Observed runtime**: ${matrix.baseline?.observed_runtime_version ?? 'UNKNOWN'} on ${matrix.baseline?.observed_at ?? 'UNKNOWN'}.`,
    '',
    `**Re-capture.** ${matrix.baseline?.recapture_procedure ?? ''}`,
    ''
  ];

  for (const [prefix, rows] of [...groups.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    lines.push(
      `## \`${prefix}\``,
      '',
      '| Setting | Schema default | Effective | KAD policy | Default compat | Effective compat |',
      '|---|---|---|---|---|---|'
    );
    for (const row of rows) {
      lines.push(
        `| ${row.setting_id} | ${cell(row.schema_default)} | ${cell(row.effective_value)} | ${row.kad_policy} `
        + `| ${row.default_compatibility} | ${row.effective_compatibility} |`
      );
    }
    lines.push('');
  }

  return lines.join('\n');
}

function main(args) {
  const root = process.cwd();
  const jsonPath = join(root, MATRIX_JSON_PATH);
  const markdownPath = join(root, MATRIX_MARKDOWN_PATH);
  const matrix = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const config = parseSimpleYaml(readFileSync(join(root, '.omp', 'config.yml'), 'utf8'));

  matrix.baseline = {
    declared_omp_version: matrix.omp_version,
    declared_source_revision: matrix.source_revision,
    skew_note:
      `These rows describe the OMP ${matrix.omp_version} surface at source revision ${matrix.source_revision}. `
      + 'Settings introduced after that revision have no row and are therefore unclassified — `retry.waitForUsageReset` '
      + 'is the live example, and it now decides the launcher profiles (ADR 0019 amendment). Rows whose key '
      + '`.omp/config.yml` declares are re-synced from the running harness; the rest are the capture as reported.',
    recapture_procedure:
      'Run `make models-sync` after any project-declared setting changes. A full re-capture against a newer OMP build '
      + 'means re-deriving `settings` from that build\'s `omp config list --json` and settings schema, re-classifying '
      + 'every row, and updating `omp_version` and `source_revision` — it is a review, not a sync.',
    ...(matrix.baseline ?? {})
  };

  const runtimeVersion = ompVersion(root);
  const result = syncMatrix({
    matrix,
    config,
    live: readLiveSettings(root),
    runtimeVersion,
    observedAt: new Date().toISOString().slice(0, 10)
  });

  if (args.includes('--dry-run')) {
    process.stdout.write(`${JSON.stringify({ dry_run: true, ...result, files: [] }, null, 2)}\n`);
    return 0;
  }

  writeFileSync(jsonPath, `${JSON.stringify(matrix, null, 2)}\n`);
  writeFileSync(markdownPath, renderMarkdown(matrix));
  process.stdout.write(
    `${JSON.stringify({ dry_run: false, ...result, files: [MATRIX_JSON_PATH, MATRIX_MARKDOWN_PATH] }, null, 2)}\n`
  );
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = main(process.argv.slice(2));
}
