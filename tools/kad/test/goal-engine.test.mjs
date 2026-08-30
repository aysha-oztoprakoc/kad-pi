import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGoal,
  stepGoal,
  abortGoal,
  MAX_GOAL_ITERATIONS
} from '../goal-engine.mjs';

test('Goal Engine: Create and satisfy bounded goal contract', () => {
  const goal = createGoal({
    title: 'Implement and test user login endpoint',
    success_criteria: ['unit_tests_pass', 'integration_tests_pass'],
    max_iterations: 4
  });

  assert.equal(goal.status, 'INITIALIZED');
  assert.equal(goal.max_iterations, 4);
  assert.equal(goal.current_iteration, 0);

  // Step 1: Satisfies unit_tests_pass
  stepGoal(goal, {
    action: 'Run unit test suite',
    result: 'All 10 unit tests pass',
    success: true,
    satisfied_criteria: ['unit_tests_pass']
  });

  assert.equal(goal.status, 'IN_PROGRESS');
  assert.equal(goal.current_iteration, 1);
  assert.equal(goal.steps.length, 1);

  // Step 2: Satisfies integration_tests_pass -> SATISFIED
  stepGoal(goal, {
    action: 'Run integration test suite',
    result: 'All integration scenarios pass',
    success: true,
    satisfied_criteria: ['integration_tests_pass']
  });

  assert.equal(goal.status, 'SATISFIED');
  assert.equal(goal.current_iteration, 2);
  assert.ok(goal.completed_at);
});

test('Goal Engine: Iteration cap termination prevents infinite looping', () => {
  const goal = createGoal({
    title: 'Attempt difficult convergence',
    success_criteria: ['impossible_criterion'],
    max_iterations: 3
  });

  // Step 1
  stepGoal(goal, { action: 'Attempt 1', success: false });
  assert.equal(goal.status, 'IN_PROGRESS');

  // Step 2
  stepGoal(goal, { action: 'Attempt 2', success: false });
  assert.equal(goal.status, 'IN_PROGRESS');

  // Step 3 (reaches max_iterations 3)
  stepGoal(goal, { action: 'Attempt 3', success: false });
  assert.equal(goal.status, 'FAILED_ITERATION_CAP');
  assert.ok(goal.escalation_reason.includes('Reached maximum iteration limit'));
  assert.ok(goal.completed_at);

  // Stepping a finished goal throws
  assert.throws(
    () => {
      stepGoal(goal, { action: 'Attempt 4' });
    },
    /Cannot step goal in terminal state/
  );
});

test('Goal Engine: Abort goal transitions to ABORTED state', () => {
  const goal = createGoal({
    title: 'Task to be aborted',
    success_criteria: ['some_criterion'],
    max_iterations: 5
  });

  abortGoal(goal, 'User manual cancellation');
  assert.equal(goal.status, 'ABORTED');
  assert.equal(goal.escalation_reason, 'User manual cancellation');
});
