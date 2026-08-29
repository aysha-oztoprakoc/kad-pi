import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const skillPath = '.agents/skills/kad-evidence-gate/SKILL.md';
const referencePath = '.agents/skills/kad-evidence-gate/references/contract.md';

test('KAD evidence gate is a conditional pointer with executable evidence invariants', () => {
  const skill = readFileSync(skillPath, 'utf8');
  const reference = readFileSync(referencePath, 'utf8');
  assert.ok(skill.startsWith('---\n'));
  assert.match(skill, /Do not invoke for ordinary implementation/);
  assert.match(skill, /references\/contract\.md/);
  for (const step of ['Scope', 'Classify', 'Record', 'Verify', 'Promote or reject', 'Leave evidence']) assert.match(skill, new RegExp(`\\*\\*${step}\\*\\*`));
  for (const term of ['deterministic', 'provenance', 'STOP', 'GOLDEN', 'REJECTED']) assert.match(skill, new RegExp(term, 'i'));
  assert.ok(existsSync('PRIME_DIRECTIVE.md'));
  assert.ok(existsSync('CONTEXT.md'));
  assert.ok(existsSync('tools/kad/distillation.mjs'));
  assert.match(reference, /tools\/kad\/distillation\.mjs.*authoritative/);
  assert.doesNotMatch(skill + reference, /OpenAI|Anthropic|Gemini|Luna|Qwen|Stheno/);
});
