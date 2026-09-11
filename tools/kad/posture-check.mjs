#!/usr/bin/env node
/**
 * Deterministic check: `.omp/RULES.md` declares the harness posture and `.omp/config.yml`
 * enforces it. Fails when the two disagree, so a posture change cannot land in one file
 * alone and an unrecorded widening is impossible to merge silently.
 *
 * Read-only. Exits 0 when every declared key matches, 1 otherwise.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const RULES = resolve(ROOT, '.omp/RULES.md');
const CONFIG = resolve(ROOT, '.omp/config.yml');

/**
 * The posture keys: dotted `section.key` paths that MUST be declared in RULES.md and
 * present in config.yml. Adding a posture knob means adding it here first.
 */
const POSTURE_KEYS = [
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

const failures = [];

const rules = read(RULES);
const config = read(CONFIG);
if (rules.error) failures.push(`cannot read .omp/RULES.md: ${rules.error.message}`);
if (config.error) failures.push(`cannot read .omp/config.yml: ${config.error.message}`);

if (!failures.length) {
  const declared = declaredValues(rules);
  if (!declared) {
    failures.push('RULES.md carries no ```yaml posture block; the posture is undeclared');
  } else {
    for (const key of POSTURE_KEYS) {
      if (!declared.has(key)) {
        failures.push(`${key}: not declared in RULES.md`);
        continue;
      }
      const enforced = configValue(config, key);
      if (enforced === undefined) {
        failures.push(`${key}: not present in .omp/config.yml`);
        continue;
      }
      if (declared.get(key) !== enforced) {
        failures.push(`${key}: declared "${declared.get(key)}" but enforced "${enforced}"`);
      }
    }
    for (const key of declared.keys()) {
      if (key !== 'posture' && !POSTURE_KEYS.includes(key)) {
        failures.push(`${key}: declared but not a known posture key`);
      }
    }
  }
}

if (failures.length) {
  process.stderr.write(`POSTURE MISMATCH: ${failures.length} problem(s)\n`);
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`POSTURE DECLARED AND ENFORCED: ${POSTURE_KEYS.length}/${POSTURE_KEYS.length} keys agree\n`);
  for (const key of POSTURE_KEYS) process.stdout.write(`  ${key} = ${configValue(config, key)}\n`);
}
