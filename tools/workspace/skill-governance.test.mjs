import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  createAdvisoryResult,
  createDecisionRequest,
  deriveSpecFromDecision,
  recordDecisionOnMap,
  recordWorkctlState,
  resolveDecision,
  shouldApplyKadOverlay,
} from './decision-protocol.mjs';
import { validateLock } from './skill-governance.mjs';

const fiveOptions = ['Conservative seam', 'Balanced overlay', 'Maximum capability', 'Independent adapter', 'Defer and measure'];

 test('5+1 requests contain exactly five generated options and one custom option', () => {
  const request = createDecisionRequest({ question: 'How should this skill be adapted?', generatedOptions: fiveOptions, recommendedIndex: 1 });
  assert.equal(request.status, 'WAITING_USER');
  assert.equal(request.options.length, 6);
  assert.equal(request.options.filter((option) => option.generated).length, 5);
  assert.equal(request.options.filter((option) => option.allowCustom).length, 1);
  assert.equal(request.options.filter((option) => option.recommended).length, 1);
});

test('HITL cannot resolve without ask_user response and records human authority', () => {
  const request = createDecisionRequest({ question: 'Pick an architecture', generatedOptions: fiveOptions, recommendedIndex: 1, sourceTicket: 'decision-architecture' });
  assert.throws(() => resolveDecision(request, { status: 'UNAVAILABLE' }), /ANSWERED/);
  const decision = resolveDecision(request, { status: 'ANSWERED', selection: 'OPTION_4', answer: 'ignored', decidedAt: '2026-08-29T00:00:00.000Z' });
  assert.equal(decision.humanSelection, 'OPTION_4');
  assert.equal(decision.authority, 'AUTHOR_DECLARED');
  assert.equal(decision.optionsPresented[1].recommended, true);
});

test('custom option preserves exact write-in text', () => {
  const request = createDecisionRequest({ question: 'Choose a route', generatedOptions: fiveOptions, sourceTicket: 'decision-custom' });
  const custom = 'Use a local adapter and revisit remote providers after the evidence gate.';
  const decision = resolveDecision(request, { status: 'ANSWERED', selection: 'CUSTOM', answer: custom });
  assert.equal(decision.customResponse, custom);
  assert.equal(decision.humanSelection, 'CUSTOM');
});

test('recommendation does not override a different human choice', () => {
  const request = createDecisionRequest({ question: 'Choose one', generatedOptions: fiveOptions, recommendedIndex: 1, sourceTicket: 'decision-choice' });
  const decision = resolveDecision(request, { status: 'ANSWERED', selection: 'OPTION_4' });
  assert.equal(decision.humanSelection, 'OPTION_4');
  assert.notEqual(decision.humanSelection, 'OPTION_2');
});

test('spec preserves the human-selected option rather than the recommendation', () => {
  const decision = resolveDecision(
    createDecisionRequest({ question: 'Pick architecture', generatedOptions: fiveOptions, recommendedIndex: 1 }),
    { status: 'ANSWERED', selection: 'OPTION_4' },
  );
  const spec = deriveSpecFromDecision(decision, { problem: 'Need a seam', solution: 'Use the selected seam', acceptance: ['behavior works'] });
  assert.equal(spec.selected_option, 'OPTION_4');
  assert.notEqual(spec.selected_option, 'OPTION_2');
  assert.equal(spec.authority, 'AUTHOR_DECLARED');
});

test('Wayfinder map and workctl execution state remain separate owners', () => {
  const decision = resolveDecision(
    createDecisionRequest({ question: 'Choose one', generatedOptions: fiveOptions, sourceTicket: 'decision-separation' }),
    { status: 'ANSWERED', selection: 'OPTION_1' },
  );
  const map = recordDecisionOnMap({ decisions: [] }, decision, 'Human selected the conservative seam.');
  const workctl = recordWorkctlState({ tasks: [{ id: 'implementation-1', status: 'READY' }] }, { task: 'implementation-1', status: 'CLAIMED' });
  assert.deepEqual(map.decisions, [{ ticket: 'decision-separation', gist: 'Human selected the conservative seam.' }]);
  assert.deepEqual(workctl.tasks, [{ id: 'implementation-1', status: 'CLAIMED' }]);
  assert.equal(map.tasks, undefined);
  assert.equal(workctl.decisions, undefined);
});

test('advisory result cannot carry authority or execution mutations', () => {
  const advisory = createAdvisoryResult({ recommendation: 'Use a thin overlay.', lenses: fiveOptions, disagreement: 'The ambitious option increases authority.' });
  assert.equal(advisory.kind, 'ADVISORY');
  assert.equal(advisory.authority, undefined);
  assert.equal(advisory.policy, undefined);
  assert.equal(advisory.startedImplementation, undefined);
});

test('KAD overlay is isolated unless project is KAD or explicitly opts in', () => {
  assert.equal(shouldApplyKadOverlay({ projectId: 'kad-pi' }), true);
  assert.equal(shouldApplyKadOverlay({ projectId: 'side-project' }), false);
  assert.equal(shouldApplyKadOverlay({ projectId: 'side-project', optedIn: true }), true);
});

test('skill doctor distinguishes pinned local deltas from changed upstream snapshots', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-governance-'));
  fs.mkdirSync(path.join(root, 'upstream'), { recursive: true });
  fs.mkdirSync(path.join(root, 'local'), { recursive: true });
  fs.writeFileSync(path.join(root, 'upstream', 'SKILL.md'), '---\nname: demo\ndescription: demo\n---\nbase\n');
  fs.writeFileSync(path.join(root, 'local', 'SKILL.md'), '---\nname: demo\ndescription: demo\n---\nlocal\n');
  const lock = {
    version: 1,
    skills: [{
      name: 'demo', upstream: 'https://example.invalid/demo', revision: 'abc',
      source_path: 'upstream/SKILL.md', execution_path: 'local/SKILL.md',
      upstream_sha256: 'wrong', execution_sha256: 'wrong', license: 'MIT',
      local_mode: 'VANILLA + KAD OVERLAY', local_delta: 'test', verified_at: '2026-08-29T00:00:00.000Z',
    }],
  };
  const result = validateLock({ root, lock });
  assert.equal(result.status, 'WARN');
  assert.equal(result.entries[0].status, 'UPSTREAM_CHANGED');
});
test('adapted routing preserves the vanilla engineering flow', () => {
  const routing = fs.readFileSync(path.resolve('.agents/skills/ask-matt/SKILL.md'), 'utf8');
  const flow = ['/wayfinder', '/to-spec', '/to-tickets', '/implement', '/tdd', '/code-review'];
  let cursor = -1;
  const governance = validateLock();
  assert.deepEqual(governance.workflow.errors, []);
  for (const step of flow) {
    const next = routing.indexOf(step, cursor + 1);
    assert.notEqual(next, -1, `${step} missing from vanilla flow`);
    assert.ok(next > cursor, `${step} out of order`);
    cursor = next;
  }
  for (const skill of ['wayfinder', 'to-spec', 'to-tickets', 'implement', 'tdd', 'code-review']) {
    const content = fs.readFileSync(path.resolve(`.agents/skills/${skill}/SKILL.md`), 'utf8');
    assert.match(content, /^name:/m);
  }
});
