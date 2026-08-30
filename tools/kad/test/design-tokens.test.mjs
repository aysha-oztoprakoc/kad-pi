import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const TOKENS_PATH = join(ROOT, 'interface', 'tokens.css');
const FOUNDATION_PATH = join(ROOT, 'interface', 'foundation.css');
const COMPONENTS_PATH = join(ROOT, 'interface', 'components.css');
const KAD_CSS_PATH = join(ROOT, 'interface', 'kad.css');

test('Design System Contract: modular CSS architecture files exist', () => {
  assert.ok(existsSync(TOKENS_PATH), 'interface/tokens.css must exist');
  assert.ok(existsSync(FOUNDATION_PATH), 'interface/foundation.css must exist');
  assert.ok(existsSync(COMPONENTS_PATH), 'interface/components.css must exist');
  assert.ok(existsSync(KAD_CSS_PATH), 'interface/kad.css must exist');
});

test('Design System Contract: tokens.css contains required semantic token families', () => {
  if (!existsSync(TOKENS_PATH)) assert.fail('tokens.css missing');
  const content = readFileSync(TOKENS_PATH, 'utf8');

  // Surface & color tokens
  assert.match(content, /--ink:\s*#/, 'Must define --ink');
  assert.match(content, /--paper:\s*#/, 'Must define --paper');
  assert.match(content, /--line:\s*#/, 'Must define --line');
  assert.match(content, /--line-hot:\s*#/, 'Must define --line-hot');

  // Semantic status tokens
  assert.match(content, /--green:\s*#/, 'Must define --green');
  assert.match(content, /--amber:\s*#/, 'Must define --amber');
  assert.match(content, /--cyan:\s*#/, 'Must define --cyan');
  assert.match(content, /--red-deep:\s*#|--red:\s*#/, 'Must define red accent');

  // Spacing & typography tokens
  assert.match(content, /--font-sans:/, 'Must define --font-sans');
  assert.match(content, /--font-mono:/, 'Must define --font-mono');
  assert.match(content, /--space-/, 'Must define semantic spacing tokens');
  assert.match(content, /--focus-ring:/, 'Must define --focus-ring token');
});

test('Design System Contract: foundation.css contains resets and accessibility rules', () => {
  if (!existsSync(FOUNDATION_PATH)) assert.fail('foundation.css missing');
  const content = readFileSync(FOUNDATION_PATH, 'utf8');

  assert.match(content, /box-sizing:\s*border-box/, 'Must have box-sizing reset');
  assert.match(content, /prefers-reduced-motion/, 'Must handle reduced-motion media query');
  assert.match(content, /:focus-visible/, 'Must style focus-visible state');
  assert.match(content, /\.skip-link/, 'Must include accessible skip-link styles');
});

test('Design System Contract: components.css contains shared UI primitives', () => {
  if (!existsSync(COMPONENTS_PATH)) assert.fail('components.css missing');
  const content = readFileSync(COMPONENTS_PATH, 'utf8');

  assert.match(content, /\.shell/, 'Must define .shell container');
  assert.match(content, /\.panel/, 'Must define .panel card');
  assert.match(content, /\.button/, 'Must define .button primitive');
  assert.match(content, /\.status/, 'Must define .status pill');
  assert.match(content, /\.data-table/, 'Must define .data-table');
  assert.match(content, /\.flow/, 'Must define .flow process visualizer');
});

test('Design System Contract: kad.css aggregates modular CSS layers without duplicate roots', () => {
  if (!existsSync(KAD_CSS_PATH)) assert.fail('kad.css missing');
  const content = readFileSync(KAD_CSS_PATH, 'utf8');

  assert.match(content, /@import\s+['"]\.\/tokens\.css['"]/, 'kad.css must import tokens.css');
  assert.match(content, /@import\s+['"]\.\/foundation\.css['"]/, 'kad.css must import foundation.css');
  assert.match(content, /@import\s+['"]\.\/components\.css['"]/, 'kad.css must import components.css');
});
