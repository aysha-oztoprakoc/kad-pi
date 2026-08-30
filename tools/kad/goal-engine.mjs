import crypto from 'node:crypto';

export const MAX_GOAL_ITERATIONS = 10;
export const DEFAULT_GOAL_ITERATIONS = 5;

export const GOAL_STATES = new Set([
  'INITIALIZED',
  'IN_PROGRESS',
  'SATISFIED',
  'FAILED_ITERATION_CAP',
  'FAILED_ERROR',
  'ESCALATE_TO_HUMAN',
  'ABORTED'
]);

/**
 * Initialize a bounded KAD_GOAL_V1 execution contract.
 * @param {object} spec
 * @returns {object}
 */
export function createGoal(spec) {
  if (!spec || typeof spec !== 'object') {
    throw new Error('createGoal requires a valid spec object');
  }

  if (!spec.title || typeof spec.title !== 'string') {
    throw new Error('Goal spec requires a title');
  }

  if (!Array.isArray(spec.success_criteria) || spec.success_criteria.length === 0) {
    throw new Error('Goal spec requires a non-empty array of success_criteria');
  }

  const maxIterations = Math.min(
    Math.max(1, spec.max_iterations ?? DEFAULT_GOAL_ITERATIONS),
    MAX_GOAL_ITERATIONS
  );

  const goalId = `GOAL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  return {
    schema: 'kad-goal-v1',
    id: goalId,
    title: spec.title,
    success_criteria: [...spec.success_criteria],
    max_iterations: maxIterations,
    current_iteration: 0,
    status: 'INITIALIZED',
    steps: [],
    created_at: new Date().toISOString(),
    completed_at: null,
    escalation_reason: null
  };
}

/**
 * Evaluate and record a step execution in the goal contract.
 * @param {object} goalState
 * @param {{ action: string, result: object, success?: boolean, satisfied_criteria?: string[] }} stepPayload
 * @returns {object} updated goalState
 */
export function stepGoal(goalState, stepPayload) {
  if (!goalState || !GOAL_STATES.has(goalState.status)) {
    throw new Error(`Invalid goalState status: ${goalState?.status}`);
  }

  if (goalState.status === 'SATISFIED' || goalState.status.startsWith('FAILED_') || goalState.status === 'ABORTED') {
    throw new Error(`Cannot step goal in terminal state: ${goalState.status}`);
  }

  goalState.current_iteration += 1;
  goalState.status = 'IN_PROGRESS';

  const stepReceipt = {
    iteration: goalState.current_iteration,
    action: stepPayload.action ?? 'unnamed_step',
    timestamp: new Date().toISOString(),
    success: stepPayload.success ?? false,
    satisfied_criteria: stepPayload.satisfied_criteria ?? [],
    output_summary: stepPayload.result ? String(stepPayload.result).slice(0, 500) : null
  };

  goalState.steps.push(stepReceipt);

  // Check if all criteria are satisfied
  const allCriteria = new Set(goalState.success_criteria);
  const satisfiedAcrossSteps = new Set();
  for (const s of goalState.steps) {
    for (const c of s.satisfied_criteria) {
      satisfiedAcrossSteps.add(c);
    }
  }

  const allSatisfied = [...allCriteria].every((c) => satisfiedAcrossSteps.has(c));

  if (allSatisfied) {
    goalState.status = 'SATISFIED';
    goalState.completed_at = new Date().toISOString();
    return goalState;
  }

  // Check iteration cap
  if (goalState.current_iteration >= goalState.max_iterations) {
    goalState.status = 'FAILED_ITERATION_CAP';
    goalState.completed_at = new Date().toISOString();
    goalState.escalation_reason = `Reached maximum iteration limit (${goalState.max_iterations}) without satisfying all criteria`;
  }

  return goalState;
}

/**
 * Abort a goal explicitly.
 * @param {object} goalState
 * @param {string} reason
 * @returns {object}
 */
export function abortGoal(goalState, reason = 'User aborted') {
  if (!goalState) throw new Error('goalState is required');
  goalState.status = 'ABORTED';
  goalState.completed_at = new Date().toISOString();
  goalState.escalation_reason = reason;
  return goalState;
}
