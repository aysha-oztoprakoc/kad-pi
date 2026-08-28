export function createTaskBudget(input = {}) {
  return { max_input_tokens: input.max_input_tokens ?? null, max_output_tokens: input.max_output_tokens ?? null, max_model_calls: input.max_model_calls ?? 1, max_repairs: input.max_repairs ?? 0, deadline_ms: input.deadline_ms ?? null, model_calls: 0, repairs: 0 };
}

export function recordModelCall(budget, { repair = false } = {}) {
  const allowed = budget.model_calls < budget.max_model_calls && (!repair || budget.repairs < budget.max_repairs);
  if (allowed) { budget.model_calls += 1; if (repair) budget.repairs += 1; }
  return { allowed, reason: allowed ? null : repair ? 'REPAIR_BUDGET_EXHAUSTED' : 'MODEL_CALL_BUDGET_EXHAUSTED', budget };
}
