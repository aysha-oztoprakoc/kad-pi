import { spawnSync, execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '../..');
const KAD_LAB_DIR = resolve(ROOT_DIR, 'kad-lab');
const CLI_PATH = resolve(KAD_LAB_DIR, 'build/kad_engine_cli');

/**
 * Ensures the C++ deterministic engine binary is built.
 */
export function ensureEngineBinary() {
  if (!existsSync(CLI_PATH)) {
    try {
      execFileSync('make', ['-C', KAD_LAB_DIR, 'cli'], {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } catch (err) {
      throw new Error(`Failed to compile C++ deterministic engine at ${CLI_PATH}: ${err.message}`);
    }
  }
}

/**
 * Converts CandidateIntent and GameState to the strict line protocol.
 * @param {object} candidate
 * @param {object} state
 * @returns {string}
 */
export function toLineProtocol(candidate, state) {
  const lines = [
    state.player_room || 'room_a',
    state.key_room === null ? 'held' : (state.key_room || 'room_a'),
    state.crate_room === null ? 'held' : (state.crate_room || 'room_b'),
    String((candidate.actions || []).length)
  ];

  for (const action of candidate.actions || []) {
    if (action.verb === null || action.verb === undefined || action.verb === '') {
      lines.push('1', '', String((action.targets || []).length));
    } else {
      lines.push('0', String(action.verb), String((action.targets || []).length));
    }
    for (const target of action.targets || []) {
      lines.push(String(target));
    }
  }

  lines.push(String((candidate.properties || []).length));
  for (const [k, v] of candidate.properties || []) {
    lines.push(String(k), String(v));
  }

  return lines.join('\n') + '\n';
}

/**
 * Executes the C++20 authoritative Validator and Resolver.
 * @param {object} candidate
 * @param {object} state
 * @param {object} options
 * @returns {object}
 */
export function executeDeterministicCore(candidate, state, options = {}) {
  ensureEngineBinary();
  const inputProtocol = toLineProtocol(candidate, state);

  const res = spawnSync(CLI_PATH, [], {
    input: inputProtocol,
    encoding: 'utf8'
  });

  if (res.error) {
    throw new Error(`Execution of deterministic engine failed: ${res.error.message}`);
  }

  const rawStdout = (res.stdout || '').trim();
  const lastLine = rawStdout.split('\n').filter(Boolean).pop() || '';

  try {
    const parsed = JSON.parse(lastLine);
    return parsed;
  } catch (err) {
    throw new Error(
      `Engine produced invalid JSON output. Stderr: "${res.stderr}", Raw Output: "${rawStdout.slice(0, 300)}"`
    );
  }
}
