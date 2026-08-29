import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, unlinkSync } from 'node:fs';
import { buildContextCheckpoint, contextPolicy, parseCompactionReceipt, recordCompactionReceipt } from '../context-economy.mjs';

const root = process.cwd();

test('checkpoint is deterministic, bounded, and excludes generated checkpoint recursion', () => {
  const first = buildContextCheckpoint({ root, workpackage: 'WP-TEST', gate: 'GREEN', accepted: ['typed state'], blocked: [], next_action: 'run tests' });
  const second = buildContextCheckpoint({ root, workpackage: 'WP-TEST', gate: 'GREEN', accepted: ['typed state'], blocked: [], next_action: 'run tests' });
  assert.equal(first, second);
  assert.match(first, /^KAD CONTEXT CHECKPOINT v1/m);
  assert.match(first, /repository\/evidence > compacted context/);
  assert.ok(first.length < 9000);
  assert.doesNotMatch(first, /KAD CONTEXT CHECKPOINT v1[\s\S]*KAD CONTEXT CHECKPOINT v1/);
});

test('policy uses only the installed v18 method-order equivalent', () => {
  assert.deepEqual(contextPolicy, {
    contextPromotion: { enabled: false },
    compaction: {
      enabled: true,
      methodOrder: ['snapcompact'],
      thresholdPercent: 70,
      thresholdTokens: -1,
      midTurnEnabled: true,
      keepRecentTokens: 20000,
      autoContinue: true,
    },
  });
});

test('receipt parser preserves unavailable token counts as null', () => {
  const receipt = parseCompactionReceipt({ action: 'snapcompact', automatic: true, tokens_before: 123, tokens_after: undefined, git_head: 'abc', success: true });
  assert.equal(receipt.tokens_before, 123);
  assert.equal(receipt.tokens_after, null);
  assert.equal(receipt.strategy, 'snapcompact');
  assert.equal(receipt.checkpoint_schema_version, 'kad-context-checkpoint-v1');
});

test('receipt writer appends bounded JSONL without model work', () => {
  const path = `/tmp/kad-context-economy-${process.pid}.jsonl`;
  const receipt = recordCompactionReceipt(path, { action: 'snapcompact', automatic: false, success: false, error: 'probe' });
  assert.equal(receipt.success, false);
  const lines = readFileSync(path, 'utf8').trim().split('\n');
  assert.equal(lines.length, 1);
  assert.equal(JSON.parse(lines[0]).failure, 'probe');
  unlinkSync(path);
});
