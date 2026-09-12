#!/usr/bin/env node
/**
 * Deterministic check: `.omp/RULES.md` declares the harness posture and `.omp/config.yml`
 * enforces it. Fails when the two disagree, so a posture change cannot land in one file
 * alone and an unrecorded widening is impossible to merge silently.
 *
 * Read-only. Exits 0 when every declared key matches, 1 otherwise.
 *
 * `inspectPosture` is exported so the OMP orchestration preflight asks the same question
 * instead of parsing RULES.md a second time (ADR 0017 §3): one parser, one verdict.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The posture keys: dotted `section.key` paths that MUST be declared in RULES.md and
 * present in config.yml. Adding a posture knob means adding it here first.
 */
export const POSTURE_KEYS = [
  'tools.approvalMode',
  'memory.backend',
  'autolearn.enabled',
  'secrets.enabled',
  'ttsr.enabled',
  'recap.enabled'
];

function read(file) {
  try {
    return readFileSync(file, 'utf8');
  } catch (error) {
    return { error };
  }
}

/** Reads `section.key` from a two-level YAML mapping without a YAML dependency. */
function configValue(text, dotted) {
  const dot = dotted.indexOf('.');
  const section = dotted.slice(0, dot);
  const key = dotted.slice(dot + 1);
  const lines = text.split('\n');
  const start = lines.findIndex((line) => line === `${section}:`);
  if (start === -1) return undefined;
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === '') continue;
    if (!/^\s/.test(line)) break;
    const match = line.match(new RegExp(`^\\s+${key}:\\s*(.+?)\\s*$`));
    if (match) return match[1].replace(/^["']|["']$/g, '');
  }
  return undefined;
}

/** Reads the fenced `yaml` declaration block from RULES.md. */
function declaredValues(text) {
  const block = text.match(/```yaml\n([\s\S]*?)```/);
  if (!block) return undefined;
  const values = new Map();
  for (const line of block[1].split('\n')) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_.]*):\s*(\S+)\s*$/);
    if (match) values.set(match[1], match[2].replace(/^["']|["']$/g, ''));
  }
  return values;
}

/**
 * @returns {{rules: string, config: string, declared: Record<string,string>,
 *            observed: Record<string,string>, problems: Array<{code:string,key:string|null,detail:string}>,
 *            failures: string[], ok: boolean}}
 */
export function inspectPosture({ root = process.cwd() } = {}) {
  const rulesPath = resolve(root, '.omp/RULES.md');
  const configPath = resolve(root, '.omp/config.yml');
  const problems = [];
  const declared = {};
  const observed = {};
  const rules = read(rulesPath);
  const config = read(configPath);
  if (rules.error) problems.push({ code: 'POSTURE_FILE_UNREADABLE', key: '.omp/RULES.md', detail: `cannot read .omp/RULES.md: ${rules.error.message}` });
  if (config.error) problems.push({ code: 'POSTURE_FILE_UNREADABLE', key: '.omp/config.yml', detail: `cannot read .omp/config.yml: ${config.error.message}` });
  if (!problems.length) {
    const values = declaredValues(rules);
    if (!values) {
      problems.push({ code: 'POSTURE_UNDECLARED', key: null, detail: 'RULES.md carries no ```yaml posture block; the posture is undeclared' });
    } else {
      for (const key of POSTURE_KEYS) {
        if (!values.has(key)) {
          problems.push({ code: 'POSTURE_KEY_UNDECLARED', key, detail: `${key}: not declared in RULES.md` });
          continue;
        }
        const enforced = configValue(config, key);
        if (enforced === undefined) {
          problems.push({ code: 'POSTURE_KEY_UNENFORCED', key, detail: `${key}: not present in .omp/config.yml` });
          continue;
        }
        declared[key] = values.get(key);
        observed[key] = enforced;
        if (values.get(key) !== enforced) {
          problems.push({ code: 'POSTURE_DECLARATION_MISMATCH', key, detail: `${key}: declared "${values.get(key)}" but enforced "${enforced}"` });
        }
      }
      for (const key of values.keys()) {
        if (key !== 'posture' && !POSTURE_KEYS.includes(key)) {
          problems.push({ code: 'POSTURE_KEY_UNKNOWN', key, detail: `${key}: declared but not a known posture key` });
        }
      }
    }
  }
  return { rules: rulesPath, config: configPath, declared, observed, problems, failures: problems.map((problem) => problem.detail), ok: problems.length === 0 };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const verdict = inspectPosture();
  if (!verdict.ok) {
    process.stderr.write(`POSTURE MISMATCH: ${verdict.failures.length} problem(s)\n`);
    for (const failure of verdict.failures) process.stderr.write(`  - ${failure}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`POSTURE DECLARED AND ENFORCED: ${POSTURE_KEYS.length}/${POSTURE_KEYS.length} keys agree\n`);
    for (const key of POSTURE_KEYS) process.stdout.write(`  ${key} = ${verdict.observed[key]}\n`);
  }
}
