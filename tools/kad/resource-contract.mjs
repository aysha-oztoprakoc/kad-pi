const UNKNOWN = 'UNKNOWN';

function finitePositive(value) {
  return Number.isFinite(value) && value > 0;
}

function limitValue(value) {
  return finitePositive(value) ? value : null;
}

function classifyEqual(values) {
  const known = values.filter(value => value !== null && value !== undefined && value !== UNKNOWN);
  if (known.length === 0) return UNKNOWN;
  return new Set(known).size === 1 ? 'CONSISTENT' : 'INCONSISTENT';
}

export function normalizeResourceContract(input = {}) {
  return {
    resource_id: input.resource_id,
    trust_domain: input.trust_domain,
    capabilities: [...(input.capabilities ?? [])],
    effective_context_window: limitValue(input.effective_context_window),
    effective_max_output_tokens: limitValue(input.effective_max_output_tokens),
    evidence: [...(input.evidence ?? [])],
    confidence: input.confidence ?? UNKNOWN,
  };
}

export function derivePiOpenAIRequestContract({ model, prompt_tokens = 0, requested_output_tokens = null, context_safety_tokens = 4096 } = {}) {
  if (!model) throw new Error('model is required');
  const contextWindow = limitValue(model.contextWindow);
  const requested = requested_output_tokens ?? model.maxTokens ?? null;
  let piClampedMaxTokens = limitValue(requested);
  if (contextWindow !== null) {
    const available = contextWindow - prompt_tokens - context_safety_tokens;
    piClampedMaxTokens = Math.min(piClampedMaxTokens ?? 1, Math.max(1, available));
  }
  const request = {};
  const field = model.compat?.maxTokensField === 'max_tokens' ? 'max_tokens' : 'max_completion_tokens';
  if (piClampedMaxTokens !== null) request[field] = piClampedMaxTokens;
  if (model.samplingParams && typeof model.samplingParams === 'object') Object.assign(request, model.samplingParams);
  const effectiveMaxOutputTokens = limitValue(request.max_tokens ?? request.max_completion_tokens);
  return {
    request,
    pi_clamped_max_tokens: piClampedMaxTokens,
    effective_max_output_tokens: effectiveMaxOutputTokens,
    evidence: 'Pi 0.84.3 openai-completions buildBaseOptions clamps maxTokens, then buildParams merges model/options samplingParams last',
  };
}

export function compareDeclarations({ task_budget = {}, pi_model = {}, omp_model = {}, kobold_runtime = {}, effective_request = {} } = {}) {
  const taskInput = task_budget.max_input_tokens ?? null;
  const taskOutput = task_budget.max_output_tokens ?? null;
  const piContext = pi_model.contextWindow ?? pi_model.context_window ?? null;
  const piOutput = pi_model.maxTokens ?? pi_model.max_tokens ?? pi_model.samplingParams?.max_tokens ?? null;
  const ompContext = omp_model.contextWindow ?? omp_model.context_window ?? null;
  const ompOutput = omp_model.maxTokens ?? omp_model.max_tokens ?? null;
  const runtimeContext = kobold_runtime.context_window ?? kobold_runtime.contextsize ?? null;
  const effectiveOutput = effective_request.max_tokens ?? effective_request.max_completion_tokens ?? effective_request.effective_max_output_tokens ?? null;
  return {
    task_budget: { max_input_tokens: taskInput, max_output_tokens: taskOutput },
    pi_model: { contextWindow: piContext, maxTokens: piOutput },
    omp_model: { contextWindow: ompContext, maxTokens: ompOutput },
    kobold_runtime: { context_window: runtimeContext },
    effective_request: { max_tokens: effectiveOutput },
    classifications: {
      context_window: classifyEqual([piContext, ompContext, runtimeContext]),
      max_output_tokens: classifyEqual([taskOutput, piOutput, ompOutput, effectiveOutput]),
      task_budget_gt_worker_context: taskInput !== null && runtimeContext !== null ? (taskInput > runtimeContext ? 'INCONSISTENT' : 'CONSISTENT') : UNKNOWN,
      task_budget_gt_worker_output: taskOutput !== null && effectiveOutput !== null ? (taskOutput > effectiveOutput ? 'INCONSISTENT' : 'CONSISTENT') : UNKNOWN,
      omp_vs_pi: classifyEqual([piContext, ompContext]) === 'CONSISTENT' && classifyEqual([piOutput, ompOutput]) === 'CONSISTENT' ? 'CONSISTENT' : 'INCONSISTENT',
      pi_vs_runtime: runtimeContext === null ? UNKNOWN : (piContext === runtimeContext ? 'CONSISTENT' : 'INCONSISTENT'),
    },
  };
}

export function preflightResourceContract({ resource, required_prompt_tokens, required_output_reserve, requested_output_tokens = required_output_reserve, bounded_local_execution = true } = {}) {
  const contract = normalizeResourceContract(resource ?? {});
  if (bounded_local_execution && contract.effective_context_window === null) return { ok: false, reason: 'EFFECTIVE_CONTEXT_UNKNOWN', code: 'LOCAL_TASK_BUDGET_UNSATISFIABLE', contract };
  if (bounded_local_execution && contract.effective_max_output_tokens === null) return { ok: false, reason: 'EFFECTIVE_OUTPUT_UNKNOWN', code: 'LOCAL_TASK_OUTPUT_UNSATISFIABLE', contract };
  const prompt = required_prompt_tokens ?? null;
  const reserve = required_output_reserve ?? requested_output_tokens ?? null;
  if (prompt !== null && reserve !== null && contract.effective_context_window !== null && prompt + reserve > contract.effective_context_window) return { ok: false, reason: 'PROMPT_PLUS_RESERVE_EXCEEDS_CONTEXT', code: 'LOCAL_TASK_BUDGET_UNSATISFIABLE', required_prompt_tokens: prompt, required_output_reserve: reserve, effective_context_window: contract.effective_context_window, contract };
  if (requested_output_tokens !== null && contract.effective_max_output_tokens !== null && requested_output_tokens > contract.effective_max_output_tokens) return { ok: false, reason: 'REQUESTED_OUTPUT_EXCEEDS_RESOURCE_MAX', code: 'LOCAL_TASK_OUTPUT_UNSATISFIABLE', requested_output_tokens, effective_max_output_tokens: contract.effective_max_output_tokens, contract };
  return { ok: true, reason: null, code: null, required_prompt_tokens: prompt, required_output_reserve: reserve, requested_output_tokens, contract };
}

export function classifyOutputLimitSaturation({ observed_output_tokens, effective_max_output_tokens } = {}) {
  if (!finitePositive(observed_output_tokens) || !finitePositive(effective_max_output_tokens)) return 'UNKNOWN';
  return observed_output_tokens === effective_max_output_tokens ? 'OBSERVED' : 'NOT_PROVEN';
}

export function normalizeFinishReason(input = {}) {
  const raw = input.finish_reason ?? input.stop_reason ?? input.stopReason ?? null;
  if (raw === null || raw === undefined) return { finish_reason: UNKNOWN, stop_reason: UNKNOWN, truncated: UNKNOWN, length_limit_hit: UNKNOWN };
  const normalized = String(raw).toLowerCase();
  const length = normalized === 'length' || normalized === 'max_tokens';
  return { finish_reason: raw, stop_reason: raw, truncated: length, length_limit_hit: length };
}
