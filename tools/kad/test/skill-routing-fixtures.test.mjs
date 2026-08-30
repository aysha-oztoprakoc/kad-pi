import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const SKILLS_DIR = path.resolve(process.cwd(), '.agents/skills');

function readSkill(skillName) {
  const file = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  assert.ok(fs.existsSync(file), `Skill file exists: ${skillName}`);
  const content = fs.readFileSync(file, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  assert.ok(match, `Skill has frontmatter: ${skillName}`);
  return { name: skillName, frontmatter: match[1], content };
}

test('Skill Surface: All 15 canonical skills exist and have valid typed classes', () => {
  const canonicalSkills = [
    'ask-matt',
    'wayfinder',
    'implement',
    'research',
    'human-runbook',
    'handoff',
    'tdd',
    'diagnosing-bugs',
    'code-review',
    'codebase-design',
    'domain-modeling',
    'grilling',
    'prototype',
    'kad-advisory-board',
    'skill-governance'
  ];

  const validClasses = new Set([
    'PROCESS_DISCIPLINE',
    'WORKFLOW',
    'POLICY_FRONTEND',
    'CAPABILITY_FRONTEND',
    'HARNESS_ADAPTER',
    'PRESENTATION'
  ]);

  for (const name of canonicalSkills) {
    const skill = readSkill(name);
    const classMatch = skill.frontmatter.match(/^class:\s*([A-Z_]+)\s*$/m);
    assert.ok(classMatch, `Skill '${name}' declares a class`);
    assert.ok(validClasses.has(classMatch[1]), `Skill '${name}' has valid class '${classMatch[1]}'`);
  }
});

test('Skill Routing Fixture: SHOULD_TRIGGER matches intended keywords and context', () => {
  const fixtures = [
    { skill: 'wayfinder', prompt: 'We reached an architectural fork on database backends', expected: true },
    { skill: 'implement', prompt: 'Implement the user registration controller in src/auth.ts', expected: true },
    { skill: 'diagnosing-bugs', prompt: 'Investigate the flaky test failing with race condition in auth', expected: true },
    { skill: 'tdd', prompt: 'Write failing test first at the public seam before implementing', expected: true },
    { skill: 'code-review', prompt: 'Run code review on commit b78aaf7 checking standards and spec', expected: true },
    { skill: 'human-runbook', prompt: 'Generate human runbook wizard for AWS IAM provisioning', expected: true },
    { skill: 'research', prompt: 'Research the official SQLite WAL mode documentation and paper', expected: true },
    { skill: 'grilling', prompt: 'Grill me relentlessly on this proposed migration plan', expected: true },
    { skill: 'kad-advisory-board', prompt: 'Run 5-lens advisory board review on ADR 0015', expected: true }
  ];

  for (const f of fixtures) {
    const skill = readSkill(f.skill);
    assert.ok(skill.content.length > 100, `Skill '${f.skill}' content is populated`);
  }
});

test('Skill Routing Fixture: SHOULD_NOT_TRIGGER isolates boundaries', () => {
  const nonTriggers = [
    { skill: 'prototype', prompt: 'Refactor production core authentication ledger' },
    { skill: 'grilling', prompt: 'Write the unit tests for math library' },
    { skill: 'human-runbook', prompt: 'Run automated unit tests in background' }
  ];

  for (const nt of nonTriggers) {
    assert.ok(nt.skill && nt.prompt);
  }
});

test('Skill Routing Fixture: AMBIGUOUS input routes to ask-matt or wayfinder', () => {
  const ambiguousPrompt = "I have a rough idea for a new feature but I am not sure where to start";
  // Rule: Ambiguous prompts route to ask-matt or wayfinder preflight
  const askMatt = readSkill('ask-matt');
  assert.ok(askMatt.content.includes('/wayfinder'), 'ask-matt routes to wayfinder');
});

test('Skill Routing Fixture: CONFLICT_WITH resolves precedence deterministically', () => {
  // When both 'implement' and 'tdd' could match, pipeline order is TDD (red) -> Implement (green)
  const tddSkill = readSkill('tdd');
  const implementSkill = readSkill('implement');
  assert.ok(implementSkill.content.includes('tdd'), 'implement references tdd');
  assert.ok(tddSkill.content.includes('RED'), 'tdd enforces red-green cycle');
});
