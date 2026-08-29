import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

test('canonical model store exists and is ignored by Git', () => {
  const root = resolve(import.meta.dirname, '../../..');
  assert.equal(existsSync(resolve(root, '.models')), true);
  assert.doesNotThrow(() => execFileSync('git', ['check-ignore', '-q', '.models/metadata/registry.json'], { cwd: root }));
});
