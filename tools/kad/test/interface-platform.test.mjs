import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildPublicProjection } from '../publication.mjs';

const ROOT = new URL('../../..', import.meta.url).pathname;
const read = path => readFileSync(join(ROOT, path), 'utf8');

test('public surface has the explanatory routes and shared design foundation', () => {
  for (const page of ['index.html', 'architecture.html', 'research.html', 'knowledge.html', 'local-ai.html', 'roadmap.html']) {
    const html = read(`site/${page}`);
    assert.match(html, /\.\.\/interface\/kad\.css/);
    assert.match(html, /aria-label="Public site"/);
  }
  assert.match(read('site/index.html'), /What is KAD|KAD-PI is a local-first/);
  assert.match(read('site/index.html'), /Evidence-gated|Deterministic authority/);
});

test('public surface contains no direct internal projection reference', () => {
  for (const page of ['index.html', 'architecture.html', 'research.html', 'knowledge.html', 'local-ai.html', 'roadmap.html', 'site.js']) {
    assert.doesNotMatch(read(`site/${page}`), /wiki\/generated\/kad-canonical\/project-state|source_hash|source_ref|\/home\/|credentials|api[_-]?key/i);
  }
});

test('dashboard is read-only and has required operator navigation', () => {
  const html = read('dashboard/index.html');
  assert.match(html, /LOCAL \/ READ-ONLY/);
  for (const view of ['overview', 'knowledge', 'agents', 'models', 'providers', 'evidence', 'research', 'system']) assert.match(html, new RegExp(`data-view="${view}"`));
  assert.match(read('dashboard/dashboard.js'), /snapshot \+ live observation/);
  assert.match(read('dashboard/dashboard.js'), /Current focus/);
});

test('public build remains deterministic and emits sanitized state', () => {
  const output = buildPublicProjection({ rootDir: ROOT });
  const persisted = JSON.parse(read('site/generated/public-state.json'));
  assert.equal(output.publication_class, 'PUBLIC');
  assert.equal(persisted.project.status, 'PARTIAL');
  assert.deepEqual(persisted.records, []);
  assert.doesNotMatch(JSON.stringify(persisted), /source_ref|source_hash|\/home\/|OpenViking|Needle/i);
});
