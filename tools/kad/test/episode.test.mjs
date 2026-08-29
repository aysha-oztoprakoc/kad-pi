import test from 'node:test';
import assert from 'node:assert/strict';
import { createEpisode, validateEpisode } from '../episode.mjs';

test('episode represents deterministic execution without fake model provenance', () => {
  const episode = createEpisode({ task: { task_id: 't1', domain: 'ENGINEERING', task_class: 'git-status', objective: 'inspect changes', trust_domain: 'ENGINEERING' }, resolution: { selected_execution_class: 'DETERMINISTIC_EXISTING', capability_id: 'git.status', model_avoided: true }, validation: { result: 'PASS', validator: 'git-status-parser' } });
  assert.equal(episode.teacher.used, false);
  assert.equal(episode.worker, undefined);
  assert.equal(episode.training_eligibility.eligible, false);
  assert.equal(validateEpisode(episode).valid, true);
});
