#!/usr/bin/env node
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadPiSdk, getSdkProvenance } from './sdk-loader.mjs';
import { PersistentSession } from '../session.mjs';
import { PonEngine } from '../pon-engine.mjs';
import { mountPiPersistentSessionAdapter } from '../pi-adapter.mjs';

function parseArgs(argv) {
  const options = {
    commands: [],
    journal: null,
    json: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--command' && i + 1 < argv.length) {
      options.commands.push(argv[++i]);
    } else if (arg === '--journal' && i + 1 < argv.length) {
      options.journal = argv[++i];
    } else if (arg === '--json') {
      options.json = true;
    } else if (!arg.startsWith('-')) {
      options.commands.push(arg);
    }
  }

  if (options.commands.length === 0) {
    options.commands = ['acquire key', 'move room_b', 'move room_a'];
  }

  return options;
}

export async function runPiWorld(options = {}) {
  const provenance = await getSdkProvenance();
  const { sdk } = await loadPiSdk();

  const agentDir = `/tmp/kad-pi-world-agent-${Date.now()}`;
  mkdirSync(agentDir, { recursive: true });

  const pon = new PonEngine();
  pon.registerRule({
    id: 'rule-keycard-alarm',
    name: 'Vault Keycard Clearance Alarm',
    premises: ['KeyRoom', 'entity:key:location'],
    condition: (diff) => diff.some(d => d.field === 'KeyRoom' && d.after === 'held'),
    action: () => ({ event_type: 'FACILITY_KEYCARD_ENGAGED', clearance_level: 2 })
  });

  const persistentSession = new PersistentSession({
    sessionId: `pi-runtime-${Date.now()}`,
    journalPath: options.journal ? resolve(options.journal) : undefined,
    ponEngine: pon
  });

  // Create real Pi SDK AgentSession
  const { session } = await sdk.createAgentSession({
    agentDir,
    cwd: '/tmp',
    sessionManager: sdk.SessionManager.inMemory(),
    noTools: 'all'
  });

  const turnResults = [];
  const adapter = mountPiPersistentSessionAdapter({
    session,
    persistentSession,
    onTurnComplete: (res) => {
      turnResults.push(res);
    }
  });

  try {
    for (const cmd of options.commands || []) {
      await session.steer(cmd);
    }
  } finally {
    await adapter.dispose();
    session.dispose();
    if (existsSync(agentDir)) {
      rmSync(agentDir, { recursive: true, force: true });
    }
  }

  return {
    provenance,
    turns_executed: turnResults.length,
    final_world_state: persistentSession.worldState,
    history: turnResults
  };
}

// CLI entry point
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const options = parseArgs(process.argv.slice(2));

  runPiWorld(options)
    .then((output) => {
      if (options.json) {
        console.log(JSON.stringify(output, null, 2));
      } else {
        console.log('═══════════════════════════════════════════════════════════════════');
        console.log(' KAD REAL PI HARNESS WORLD RUNTIME');
        console.log('═══════════════════════════════════════════════════════════════════');
        console.log(` SDK Package:       ${output.provenance.package} v${output.provenance.version}`);
        console.log(` Reality Level:     ${output.provenance.reality_level}`);
        console.log(` Turns Executed:    ${output.turns_executed}`);
        console.log('───────────────────────────────────────────────────────────────────');
        for (const t of output.history) {
          console.log(` [Turn ${t.turn_index}] Input: "${t.input}" -> Status: ${t.status.toUpperCase()}`);
          if (t.accepted) {
            console.log(`          State Diff: ${JSON.stringify(t.state_diff)}`);
            if (t.pon_reactions?.length > 0) {
              console.log(`          PON Reaction: ${t.pon_reactions.map(r => r.event_type).join(', ')}`);
            }
          }
        }
        console.log('═══════════════════════════════════════════════════════════════════');
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error(`Runtime Error: ${err.message}`);
      process.exit(1);
    });
}
