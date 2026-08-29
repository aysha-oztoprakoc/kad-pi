#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { DistillationStore, buildSteeringContext, exportDataset, replayWithAdapter, createRecord, rejectRecord, transition, verifyCandidate } from './distillation.mjs';

const [command, file, ...args] = process.argv.slice(2);
const root = process.env.KAD_DISTILL_DIR ?? 'evidence/distillation';
const store = new DistillationStore(root);
const load = path => JSON.parse(readFileSync(path, 'utf8'));
const save = record => { writeFileSync(file, JSON.stringify(record, null, 2) + '\n'); return record; };

try {
  let result;
  if (command === 'ingest') result = save(createRecord(load(file)));
  else if (command === 'verify') {
    const record = load(file);
    const candidate = record.state === 'RAW' ? { ...record, state: 'CANDIDATE', promotion: { ...record.promotion, state: 'CANDIDATE' } } : record;
    const verified = verifyCandidate(candidate);
    if (!verified.verified) throw new Error(verified.errors.join('; '));
    result = transition(verified.record, 'VERIFIED');
    save(result);
    console.log(JSON.stringify({ verified: true, state: result.state, id: result.id }));
    process.exit(0);
  }
  else if (command === 'promote') { const record = load(file); result = transition(record, 'GOLDEN', { promoted_by: args[0] ?? 'cli', promotion_evidence: [{ type: 'deterministic-gate', command: 'distill verify' }] }); store.put(result); console.log(JSON.stringify({ state: result.state, id: result.id })); process.exit(0); }
  else if (command === 'reject') { result = rejectRecord(load(file), { failure_class: args[0], failed_verifier: args[1] }); store.put(result); }
  else if (command === 'retrieve') { result = buildSteeringContext(store.list('GOLDEN'), load(file)); }
  else if (command === 'replay') { result = await Promise.all(store.list('GOLDEN').map(replayWithAdapter)); }
  else if (command === 'export') { result = exportDataset(store.list(), args[0] ?? 'runtime-steering'); if (file) writeFileSync(file, result); else process.stdout.write(result); process.exit(0); }
  else throw new Error('usage: ingest|verify|promote|reject|retrieve|replay|export <file>');
  console.log(JSON.stringify(result, null, 2));
} catch (error) { console.error(error.message); process.exitCode = 1; }
