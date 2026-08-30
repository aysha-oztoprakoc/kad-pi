import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SITE_PAGES = [
  'index.html',
  'architecture.html',
  'research.html',
  'knowledge.html',
  'local-ai.html',
  'roadmap.html'
];

test('Static Site Contract: all canonical site pages exist and contain required landmarks', () => {
  for (const pageName of SITE_PAGES) {
    const pagePath = join(ROOT, 'site', pageName);
    assert.ok(existsSync(pagePath), `site/${pageName} must exist`);

    const html = readFileSync(pagePath, 'utf8');

    // DOCTYPE and HTML lang
    assert.match(html, /<!doctype\s+html>/i, `${pageName} must have <!doctype html>`);
    assert.match(html, /<html\s+lang=["']en["']/i, `${pageName} must have <html lang="en">`);
    assert.match(html, /<meta\s+charset=["']utf-8["']/i, `${pageName} must specify utf-8`);
    assert.match(html, /<meta\s+name=["']viewport["']/i, `${pageName} must have viewport meta`);
    assert.match(html, /<title>[^<]+<\/title>/i, `${pageName} must have title`);
    assert.match(html, /<meta\s+name=["']description["']/i, `${pageName} must have description meta`);

    // Semantic landmarks
    assert.match(html, /<header\s+class=["'][^"']*site-header[^"']*["']>/, `${pageName} must have <header class="site-header">`);
    assert.match(html, /<nav\s+class=["'][^"']*nav[^"']*["']/, `${pageName} must have <nav class="nav">`);
    assert.match(html, /<main(\s+id=["']main-content["'])?>|<main\s+id=["']main-content["']/, `${pageName} must have <main>`);
    assert.match(html, /<footer\s+class=["'][^"']*footer[^"']*["']>/, `${pageName} must have <footer class="footer">`);

    // Accessible skip navigation link
    assert.match(html, /<a\s+class=["']skip-link["']\s+href=["']#main-content["']>/, `${pageName} must have accessible skip link`);

    // Zero external CDN links
    assert.doesNotMatch(html, /https?:\/\/(?:cdn|unpkg|cdnjs|jsdelivr|fonts\.googleapis)/i, `${pageName} must not link to external CDNs`);

    // Zero raw API daemon links
    assert.doesNotMatch(html, /localhost:\d+|127\.0\.0\.1:\d+/i, `${pageName} must not hard-code local daemon ports`);
  }
});

test('Static Site Contract: shared navigation links cover all canonical pages', () => {
  for (const pageName of SITE_PAGES) {
    const pagePath = join(ROOT, 'site', pageName);
    const html = readFileSync(pagePath, 'utf8');

    for (const targetPage of SITE_PAGES) {
      assert.ok(html.includes(`href="${targetPage}"`) || html.includes(`href="./${targetPage}"`), `${pageName} navigation must link to ${targetPage}`);
    }
  }
});
