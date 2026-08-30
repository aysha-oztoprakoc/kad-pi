/**
 * Compiles KAD_PI_IDEAL_STATE_V2.json and KAD_PI_IDEAL_STATE_V2.md
 * from canonical intent events and normalizations.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compileIdealStateData, renderIdealStateMarkdown } from './ideal-state-engine.mjs';

const root = process.cwd();
const eventsPath = resolve(root, 'evidence/intent/events.jsonl');
const normsPath = resolve(root, 'evidence/intent/normalizations.jsonl');
const outJsonPath = resolve(root, 'docs/architecture/KAD_PI_IDEAL_STATE_V2.json');
const outMdPath = resolve(root, 'docs/architecture/KAD_PI_IDEAL_STATE_V2.md');

const events = readFileSync(eventsPath, 'utf8').trim().split('\n').map(l => JSON.parse(l));
const normalizations = readFileSync(normsPath, 'utf8').trim().split('\n').map(l => JSON.parse(l));

const data = compileIdealStateData(events, normalizations);
writeFileSync(outJsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
const md = renderIdealStateMarkdown(data);
writeFileSync(outMdPath, md + '\n', 'utf8');

console.log(`[PASS] Successfully compiled Ideal State V2 artifacts:`);
console.log(`  - JSON: ${outJsonPath}`);
console.log(`  - MD:   ${outMdPath}`);
