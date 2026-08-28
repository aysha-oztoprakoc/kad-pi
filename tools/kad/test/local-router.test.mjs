import assert from 'node:assert/strict';
import test from 'node:test';
import process from 'node:process';
import { CapabilityRegistry } from '../local-router.mjs';
import { LocalInferenceCapability } from '../local-inference-capability.mjs';
import { validateLocalResult } from '../pi/local-worker.mjs';

test('local-first router filters by declared capability and trust domain', () => {
  const registry = new CapabilityRegistry();
  registry.register({ id: 'local-extractor', local: true, priority: 1, context_window: 2048, trust_domain: 'retrieval', capabilities: ['structured-extraction'] });
  registry.register({ id: 'world-model', local: true, priority: 0, context_window: 4096, trust_domain: 'world', capabilities: ['structured-extraction'] });
  assert.deepEqual(registry.choose({ trust_domain: 'retrieval', capabilities: ['structured-extraction'], min_context: 100 }), { status: 'ROUTED', selected: 'local-extractor', candidates: ['local-extractor'] });
  assert.equal(registry.choose({ trust_domain: 'engineering', capabilities: ['structured-extraction'] }).status, 'DEGRADED');
});

test('failed capability disappears without authority escalation', () => {
  const registry = new CapabilityRegistry();
  registry.register({ id: 'tell-worker', local: true, context_window: 2048, trust_domain: 'retrieval', capabilities: ['classification'] });
  registry.register({ id: 'amdy-worker', local: true, context_window: 2048, trust_domain: 'retrieval', capabilities: ['classification'] });
  registry.setAvailability('tell-worker', false, 'endpoint failure');
  assert.equal(registry.choose({ trust_domain: 'retrieval', capabilities: ['classification'] }).selected, 'amdy-worker');
  assert.equal(registry.snapshot().find(r => r.id === 'tell-worker').available, false);
});

test('WORLD resources cannot satisfy retrieval or engineering requirements', () => {
  const registry = new CapabilityRegistry();
  registry.register({ id: 'stheno-local', local: true, context_window: 2048, trust_domain: 'world', capabilities: ['structured-extraction'] });
  assert.deepEqual(registry.eligible({ trust_domain: 'retrieval', capabilities: ['structured-extraction'] }), []);
  assert.deepEqual(registry.eligible({ trust_domain: 'engineering', capabilities: ['structured-extraction'] }), []);
  registry.register({ id: 'stheno-retrieval-proven', local: true, context_window: 2048, trust_domain: 'retrieval', capabilities: ['structured-extraction'], empirical_basis: 'separate benchmark' });
  assert.deepEqual(registry.eligible({ trust_domain: 'retrieval', capabilities: ['structured-extraction'] }).map(r => r.id), ['stheno-retrieval-proven']);
});

test('STC-owned local inference advertises then tears down its capability', async () => {
  const registry = new CapabilityRegistry();
  const port = 51239;
  const server = "require('node:http').createServer((q,r)=>{r.writeHead(200);r.end('ok')}).listen(" + port + ",'127.0.0.1')";
  const capability = new LocalInferenceCapability({ command: process.execPath, args: ['-e', server], endpoint: `http://127.0.0.1:${port}`, healthPath: '/', registry, resource: { id: 'owned-worker', trust_domain: 'retrieval', capabilities: ['classification'], context_window: 2048 } });
  const activation = await capability.activate();
  assert.equal(activation.ownership, 'OWNED');
  assert.equal(registry.choose({ trust_domain: 'retrieval', capabilities: ['classification'] }).selected, 'owned-worker');
  await capability.dispose();
  assert.equal(registry.snapshot().find(r => r.id === 'owned-worker').available, false);
  assert.equal(capability.state, 'DISPOSED');
});

test('partial STC activation fails closed and does not advertise capability', async () => {
  const registry = new CapabilityRegistry();
  const capability = new LocalInferenceCapability({ endpoint: 'http://127.0.0.1:51240', registry, resource: { id: 'broken-worker', trust_domain: 'retrieval', capabilities: ['classification'] }, startupTimeoutMs: 100 });
  await assert.rejects(() => capability.activate(), /health check failed/);
  assert.equal(capability.state, 'DISPOSED');
  assert.deepEqual(registry.snapshot(), []);
});

test('bounded local Pi result has deterministic acceptance', () => {
  assert.equal(validateLocalResult('READY').accepted, true);
  assert.equal(validateLocalResult('READY\n').accepted, true);
  assert.equal(validateLocalResult('I think READY').accepted, false);
});
