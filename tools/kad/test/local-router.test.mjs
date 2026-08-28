import assert from 'node:assert/strict';
import test from 'node:test';
import { CapabilityRegistry } from '../local-router.mjs';
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

test('bounded local Pi result has deterministic acceptance', () => {
  assert.equal(validateLocalResult('READY').accepted, true);
  assert.equal(validateLocalResult('READY\n').accepted, true);
  assert.equal(validateLocalResult('I think READY').accepted, false);
});
