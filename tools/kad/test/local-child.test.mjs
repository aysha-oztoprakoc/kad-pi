import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLocalChildInvocation, validateLocalChildOutput } from '../pi/local-child.mjs';

test('local child inherits project-scoped Pi config and selects the local provider', () => {
  const invocation = buildLocalChildInvocation({ cwd: '/repo', agentDir: '/repo/.pi/agent', model: 'kad-local/qwen-local' });
  assert.equal(invocation.env.PI_CODING_AGENT_DIR, '/repo/.pi/agent');
  assert.deepEqual(invocation.args.slice(0, 6), ['--mode', 'json', '-p', '--no-session', '--model', 'kad-local/qwen-local']);
  assert.equal(invocation.args.at(-1), 'Task: bounded extraction');
});

test('local child output uses the deterministic READY validator', () => {
  assert.deepEqual(validateLocalChildOutput('\nREADY\n'), { accepted: true, value: 'READY', expected: 'READY' });
  assert.equal(validateLocalChildOutput('READY plus unsupported claim').accepted, false);
});
