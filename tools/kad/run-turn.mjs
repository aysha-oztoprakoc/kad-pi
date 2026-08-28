#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runTurn } from './orchestrator.mjs';
import { createInitialState } from './state.mjs';

function parseArgs(argv) {
  const options = {
    input: '',
    stateFile: null,
    journal: null,
    json: false
  };

  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--input' && i + 1 < argv.length) {
      options.input = argv[++i];
    } else if (arg === '--state-file' && i + 1 < argv.length) {
      options.stateFile = argv[++i];
    } else if (arg === '--journal' && i + 1 < argv.length) {
      options.journal = argv[++i];
    } else if (arg === '--json') {
      options.json = true;
    } else {
      positional.push(arg);
    }
  }

  if (!options.input && positional.length > 0) {
    options.input = positional.join(' ');
  }

  return options;
}

// CLI Execution
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const options = parseArgs(process.argv.slice(2));

  if (!options.input) {
    console.error('Usage: node tools/kad/run-turn.mjs --input "<text>" [--state-file <path>] [--journal <path>] [--json]');
    console.error('Example: node tools/kad/run-turn.mjs --input "acquire key"');
    process.exit(1);
  }

  let initialState = createInitialState();
  if (options.stateFile && existsSync(options.stateFile)) {
    try {
      initialState = JSON.parse(readFileSync(options.stateFile, 'utf8'));
    } catch (err) {
      console.error(`Error loading state file: ${err.message}`);
      process.exit(1);
    }
  }

  try {
    const result = runTurn(options.input, initialState, {
      journalPath: options.journal ? resolve(options.journal) : undefined
    });

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('═══════════════════════════════════════════════════════════════════');
      console.log(' KAD WORLD TRANSITION TURN REPORT');
      console.log('═══════════════════════════════════════════════════════════════════');
      console.log(` Input:             "${result.input}"`);
      console.log(` Status:            ${result.status.toUpperCase()}`);
      console.log(` Candidate Intent:  ${JSON.stringify(result.candidate_intent)}`);

      if (result.accepted) {
        console.log(` Action / Target:   ${result.validation.action} -> ${result.validation.target} (Actor: ${result.validation.actor})`);
        console.log(` Outcome:           ${result.resolution.outcome}`);
        console.log(` Domain Event:      ${result.resolution.event_kind} (${result.resolution.from} -> ${result.resolution.to})`);
        console.log(` State Before:      ${JSON.stringify(result.state_before)}`);
        console.log(` State Diff:        ${JSON.stringify(result.state_diff)}`);
        console.log(` State After:       ${JSON.stringify(result.state_after)}`);
      } else {
        console.log(` Rejection Kind:    ${result.validation.failure_kind}`);
        console.log(` Rejection Detail:  ${result.validation.detail}`);
        console.log(` State Invariance:  UNCHANGED (${JSON.stringify(result.state_after)})`);
      }
      console.log('═══════════════════════════════════════════════════════════════════');
    }

    process.exit(result.accepted ? 0 : 2);
  } catch (err) {
    console.error(`Execution Error: ${err.message}`);
    process.exit(1);
  }
}
