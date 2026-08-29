import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createEpisode } from './episode.mjs';
import { canonicalize } from './distillation.mjs';
import { normalizeEconomicReceipt } from './accepted-work-economics.mjs';

const supportedLocalCapabilities = new Set(['repository-fact-finding', 'structured-extraction']);
const hash = value => createHash('sha256').update(value, 'utf8').digest('hex');
const now = () => Date.now();

export function normalizeWorkRequest(input = {}) {
  const capability = input.capability ?? input.required_capability;
  if (!input.task_id || !input.role || !input.trust_domain || !capability || !input.question) throw new Error('task_id, role, trust_domain, capability, and question are required');
  if (!Array.isArray(input.source_paths) || input.source_paths.length === 0) throw new Error('bounded source_paths are required');
  return {
    task_id: input.task_id,
    role: input.role,
    capability,
    trust_domain: input.trust_domain,
    question: input.question,
    source_paths: [...new Set(input.source_paths)],
    max_facts: Math.max(1, Math.min(10, input.max_facts ?? 3)),
    min_context: input.min_context ?? 0,
    budget: { max_input_tokens: input.budget?.max_input_tokens ?? null, max_output_tokens: input.budget?.max_output_tokens ?? null, max_model_calls: input.budget?.max_model_calls ?? 1, max_repairs: input.budget?.max_repairs ?? 1, deadline_ms: input.budget?.deadline_ms ?? null }
  };
}

export function compileTaskPacket(requestInput, sources) {
  const request = normalizeWorkRequest(requestInput);
  const allowed = new Map((sources ?? []).map(source => [source.path, source]));
  const selected = request.source_paths.map(path => {
    const source = allowed.get(path);
    if (!source) throw new Error(`requested source is unavailable: ${path}`);
    const content = String(source.content ?? readFileSync(path, 'utf8'));
    return { path, sha256: hash(content), excerpt: content.slice(0, 12000) };
  });
  const packet = {
    task_id: request.task_id,
    role: request.role,
    capability: request.capability,
    trust_domain: request.trust_domain,
    sources: selected,
    question: request.question,
    output_schema: { task_id: 'string', facts: 'array', unknowns: 'array', conflicts: 'array' },
    limits: { max_facts: request.max_facts, allowed_source_paths: selected.map(source => source.path) },
    budget: request.budget
  };
  return { ...packet, packet_sha256: hash(canonicalize(packet)) };
}

export function selectControllerLane(lanes = []) {
  const eligible = lanes.filter(lane => lane?.role === 'controller' && lane.available !== false && lane.approved === true && lane.payg !== true && lane.billing_class === 'SUBSCRIPTION_BACKED');
  if (!eligible.length) return { status: 'DEGRADED', reason: 'no approved non-PAYG controller lane', selected_lane: null, candidates: [] };
  eligible.sort((a, b) => String(a.expires_at ?? '9999').localeCompare(String(b.expires_at ?? '9999')) || String(a.id).localeCompare(String(b.id)));
  const selected = eligible[0];
  return { status: 'ROUTED', selected_lane: { role: 'controller', id: selected.id, provider: selected.provider ?? 'UNKNOWN', model: selected.model ?? 'UNKNOWN', execution_class: selected.execution_class ?? 'REMOTE_SUBSCRIPTION', billing_class: selected.billing_class, quota_snapshot: selected.quota_snapshot ?? null, quota_state: selected.quota_state ?? null }, candidates: eligible.map(lane => lane.id), reason_codes: ['APPROVED', 'NON_PAYG', 'SUBSCRIPTION_BACKED', 'CAPABILITY_SUFFICIENT'] };
}

function parseJson(text) {
  try { return { ok: true, value: JSON.parse(text) }; } catch { return { ok: false, value: null }; }
}

function balancedObjectCandidates(text) {
  const candidates = [];
  for (let start = 0; start < text.length; start += 1) {
    if (text[start] !== '{') continue;
    let curly = 0;
    let square = 0;
    let quoted = false;
    let escaped = false;
    for (let index = start; index < text.length; index += 1) {
      const character = text[index];
      if (quoted) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === '"') quoted = false;
        continue;
      }
      if (character === '"') { quoted = true; continue; }
      if (character === '{') curly += 1;
      else if (character === '}') curly -= 1;
      else if (character === '[') square += 1;
      else if (character === ']') square -= 1;
      if (curly < 0 || square < 0) break;
      if (curly === 0 && square === 0) {
        const candidateText = text.slice(start, index + 1);
        const parsed = parseJson(candidateText);
        if (parsed.ok && parsed.value && typeof parsed.value === 'object' && !Array.isArray(parsed.value)) candidates.push({ start, end: index + 1, value: parsed.value });
        break;
      }
    }
  }
  return candidates.filter(candidate => !candidates.some(other => other !== candidate && other.start <= candidate.start && other.end >= candidate.end));
}

export function normalizeWorkerOutput(output) {
  const original = typeof output === 'string' ? output : JSON.stringify(output ?? null);
  const trimmed = original.trim();
  const reasoningWrapperDetected = /<(?:think|analysis)>[\s\S]*?<\/(?:think|analysis)>/i.test(trimmed);
  const result = { raw_hash: hash(original), classification: 'UNKNOWN', success: false, changed: false, reasoning_wrapper_detected: reasoningWrapperDetected, value: null };
  if (!trimmed) return { ...result, classification: 'EMPTY' };
  const exact = parseJson(trimmed);
  if (exact.ok) return { ...result, classification: original === trimmed ? 'VALID_JSON' : 'WHITESPACE', success: true, changed: original !== trimmed, value: exact.value };
  const fenced = trimmed.match(/^```(?:json)?[\t ]*\r?\n?([\s\S]*?)\r?\n?```$/i);
  if (fenced) {
    const parsed = parseJson(fenced[1].trim());
    if (parsed.ok) return { ...result, classification: 'FENCED_JSON', success: true, changed: true, value: parsed.value };
  }
  const candidates = balancedObjectCandidates(trimmed);
  if (candidates.length === 1) {
    const candidate = candidates[0];
    const prefix = trimmed.slice(0, candidate.start).replace(/<(?:think|analysis)>[\s\S]*?<\/(?:think|analysis)>/ig, '').trim();
    const suffix = trimmed.slice(candidate.end).trim();
    const allowedPrefix = prefix === '' || /^(?:result|answer|output|json)\s*:?[\s]*$/i.test(prefix);
    const allowedSuffix = suffix === '' || /^(?:done|end)\.?$/i.test(suffix);
    if (allowedPrefix && allowedSuffix) return { ...result, classification: reasoningWrapperDetected ? 'VISIBLE_REASONING_WRAPPER' : 'UNIQUE_WRAPPED_JSON', success: true, changed: true, value: candidate.value };
    return { ...result, classification: 'WRAPPER_TEXT' };
  }
  if (candidates.length > 1) return { ...result, classification: 'MULTIPLE_JSON_VALUES' };
  if (/[{[]/.test(trimmed)) return { ...result, classification: 'TRUNCATED_JSON' };
  return { ...result, classification: 'WRAPPER_TEXT' };
}

export function validateWorkerResult(output, packet) {
  const normalization = normalizeWorkerOutput(output);
  const value = normalization.value;
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) errors.push('output is not a JSON object');
  if (!value || value.task_id !== packet.task_id) errors.push('task_id mismatch');
  if (!Array.isArray(value?.facts) || !Array.isArray(value?.unknowns) || !Array.isArray(value?.conflicts)) errors.push('required arrays are missing');
  if (Array.isArray(value?.facts) && value.facts.length > packet.limits.max_facts) errors.push('fact limit exceeded');
  const allowed = new Map(packet.sources.map(source => [source.path, source.excerpt]));
  for (const fact of value?.facts ?? []) {
    if (!fact || typeof fact.claim !== 'string' || !fact.claim.trim()) errors.push('fact claim is empty');
    if (!allowed.has(fact?.source_path)) errors.push(`fact source is outside packet: ${fact?.source_path ?? 'UNKNOWN'}`);
    else if (typeof fact.evidence !== 'string' || !fact.evidence || !allowed.get(fact.source_path).includes(fact.evidence)) errors.push(`fact evidence is not present in source: ${fact.source_path}`);
  }
  return { accepted: errors.length === 0, value, errors, normalization };
}

function event(type, taskId, data = {}) { return { type, task_id: taskId, ...data }; }
function baseEpisode(request, packet, route, validation, outcome, telemetry, trajectory) {
  const economicReceipt = telemetry.remote_lane ? normalizeEconomicReceipt({
    task_id: request.task_id,
    episode_id: `episode-${request.task_id}`,
    equivalence_key: `${request.trust_domain}/${request.capability}`,
    semantic_role: telemetry.remote_lane.role ?? 'controller',
    provider: telemetry.remote_lane.provider,
    model: telemetry.remote_lane.model,
    execution_class: telemetry.remote_lane.execution_class ?? 'REMOTE_SUBSCRIPTION',
    trust_domain: request.trust_domain,
    capability: request.capability,
    usage: { input_tokens: telemetry.remote_input_tokens, cached_input_tokens: telemetry.remote_cached_input_tokens, output_tokens: telemetry.remote_output_tokens, reasoning_tokens: telemetry.remote_reasoning_tokens },
    provider_reported_cost: telemetry.remote_provider_reported_cost,
    cost_provenance: telemetry.remote_provider_reported_cost === null ? null : 'PROVIDER_REPORTED',
    billing_class: telemetry.remote_lane.billing_class,
    cache: telemetry.remote_cache,
    quota_snapshot: telemetry.remote_lane.quota_snapshot ?? telemetry.remote_lane.quota_state ?? null,
    performance: { latency_ms: telemetry.latency_ms, compiled_context_bytes: telemetry.context_bytes },
    validation: validation?.result,
    accepted: outcome.accepted,
    acceptance_authority: 'KAD_VALIDATOR',
    accepted_artifact_hash: validation?.accepted ? hash(canonicalize(validation.value)) : null,
    repairs: telemetry.repairs,
    escalations: telemetry.escalations,
    model_calls: telemetry.controller_invocations,
    observation_confidence: telemetry.remote_input_tokens !== null || telemetry.remote_output_tokens !== null ? 'OBSERVED' : 'UNKNOWN',
    provenance: { source: 'KAD swarm controller response metadata', usage_source: 'controller telemetry', provider_metadata_observed: telemetry.remote_input_tokens !== null || telemetry.remote_output_tokens !== null },
  }) : null;
  const episode = createEpisode({
    episode_id: `episode-${request.task_id}`,
    causation: { event_id: `event-${request.task_id}`, pon_event: 'work.requested' },
    task: { task_id: request.task_id, domain: request.trust_domain.toUpperCase(), task_class: request.capability, objective: request.question, trust_domain: request.trust_domain },
    state: { available_capabilities: ['controller', request.capability], unavailable_capabilities: [], scope: 'task' },
    context: { available_refs: packet?.sources.map(source => source.path) ?? request.source_paths, selected_refs: packet?.sources.map(source => source.path) ?? [], selected_bytes: packet?.sources.reduce((sum, source) => sum + Buffer.byteLength(source.excerpt), 0) ?? 0, selected_tokens: null, provenance: packet?.sources.map(source => ({ path: source.path, sha256: source.sha256 })) ?? [] },
    decision: { actor_role: 'CAPABILITY_ROUTER', required_capability: request.capability, selected_resource: route?.selected_resource ?? null, reason_code: route?.reason_code ?? 'bounded-contract' },
    resolution: { selected_execution_class: route?.selected_resource ? 'LOCAL_SPECIALIST' : 'REMOTE_CHEAP', capability_id: route?.selected_resource ?? route?.selected_lane ?? null, model_avoided: false, reason_code: route?.reason_code ?? 'bounded-contract' },
    trajectory,
    validation: { validator: 'schema-source-evidence-validator', result: validation?.result ?? 'UNKNOWN', tests: validation?.errors ?? [], postconditions: validation?.accepted ? ['schema-valid', 'source-evidence-valid'] : [] },
    outcome: { accepted: outcome.accepted, remote_escalation: outcome.remote_escalation ?? false },
    economics: { local_input_tokens: telemetry.local_input_tokens ?? null, local_output_tokens: telemetry.local_output_tokens ?? null, remote_input_tokens: telemetry.remote_input_tokens ?? null, remote_output_tokens: telemetry.remote_output_tokens ?? null, wall_ms: telemetry.latency_ms ?? telemetry.wall_ms ?? null, tool_calls: telemetry.deterministic_tool_invocations ?? null },
    teacher: { used: Boolean(route?.selected_lane), provider: route?.selected_lane?.provider ?? null, model: route?.selected_lane?.model ?? null },
    evidence_refs: packet ? packet.sources.map(source => `${source.path}#${source.sha256}`) : []
  });
  if (economicReceipt) {
    episode.economics.economic_receipt = economicReceipt;
    episode.economics.quota_snapshot_id = economicReceipt.economics.quota_snapshot_id;
  }
  return episode;
}

export async function executeSwarm({ request: requestInput, sources, controller, registry, worker, max_repairs = 1, emit = () => {}, resume = null }) {
  const started = now();
  const request = normalizeWorkRequest(requestInput);
  const events = [event('work.requested', request.task_id), event('requirement.classified', request.task_id, { role: request.role, trust_domain: request.trust_domain, capability: request.capability })];
  const telemetry = { controller_invocations: 0, remote_lane: null, remote_input_tokens: null, remote_cached_input_tokens: null, remote_output_tokens: null, remote_reasoning_tokens: null, remote_provider_reported_cost: null, remote_cache: null, remote_cost: null, local_invocations: 0, model_repair_calls: 0, validation_calls: 0, deterministic_normalization_attempts: 0, deterministic_normalization_successes: 0, normalization_history: [], deterministic_tool_invocations: 1, repairs: 0, escalations: 0, accepted: false, latency_ms: null, context_bytes: 0, failure_reason: null };
  const route = selectControllerLane(controller?.lanes);
  telemetry.route = route;
  emit(events[0]); emit(events[1]);
  if (route.status !== 'ROUTED') {
    telemetry.failure_reason = 'CONTROLLER_UNAVAILABLE';
    const result = { status: 'DEGRADED', failure_reason: telemetry.failure_reason, events, telemetry, episode: baseEpisode(request, null, null, { result: 'UNKNOWN' }, { accepted: false }, telemetry, events) };
    return { ...result, dispose: async () => {} };
  }
  if (!supportedLocalCapabilities.has(request.capability)) {
    telemetry.failure_reason = 'UNSUPPORTED_LOCAL_CAPABILITY';
    const result = { status: 'DEGRADED', failure_reason: telemetry.failure_reason, events, telemetry, episode: baseEpisode(request, null, route, { result: 'UNKNOWN' }, { accepted: false }, telemetry, events) };
    return { ...result, dispose: async () => {} };
  }
  events.push(event('route.selected', request.task_id, { role: 'controller', lane: route.selected_lane.id })); emit(events.at(-1));
  let controllerResult;
  telemetry.remote_lane = route.selected_lane;
  if (resume?.controller_result) {
    controllerResult = resume.controller_result;
    telemetry.controller_invocations = resume.telemetry?.controller_invocations ?? 0;
    telemetry.new_remote_controller_calls = 0;
    telemetry.resumed_from_episode_id = resume.parent_episode_id ?? null;
    telemetry.remote_input_tokens = resume.telemetry?.remote_input_tokens ?? resume.telemetry?.input_tokens ?? null;
    telemetry.remote_cached_input_tokens = resume.telemetry?.remote_cached_input_tokens ?? resume.telemetry?.cached_input_tokens ?? null;
    telemetry.remote_output_tokens = resume.telemetry?.remote_output_tokens ?? resume.telemetry?.output_tokens ?? null;
    telemetry.remote_reasoning_tokens = resume.telemetry?.remote_reasoning_tokens ?? resume.telemetry?.reasoning_tokens ?? null;
    telemetry.remote_provider_reported_cost = Number.isFinite(resume.telemetry?.remote_provider_reported_cost) ? resume.telemetry.remote_provider_reported_cost : null;
    telemetry.remote_cache = resume.telemetry?.remote_cache ?? resume.telemetry?.cache ?? null;
    telemetry.remote_cost = resume.telemetry?.remote_cost ?? resume.telemetry?.cost ?? null;
  } else {
    controllerResult = await controller.execute({ ...request, source_manifest: request.source_paths });
    telemetry.controller_invocations = 1;
    telemetry.new_remote_controller_calls = 1;
    telemetry.remote_input_tokens = controllerResult.telemetry?.input_tokens ?? null;
    telemetry.remote_cached_input_tokens = controllerResult.telemetry?.cached_input_tokens ?? null;
    telemetry.remote_output_tokens = controllerResult.telemetry?.output_tokens ?? null;
    telemetry.remote_reasoning_tokens = controllerResult.telemetry?.reasoning_tokens ?? null;
    telemetry.remote_provider_reported_cost = Number.isFinite(controllerResult.telemetry?.provider_reported_cost) ? controllerResult.telemetry.provider_reported_cost : null;
    telemetry.remote_cache = controllerResult.telemetry?.cache ?? null;
    telemetry.remote_cost = controllerResult.telemetry?.cost ?? null;
  }
  const plan = controllerResult.plan ?? {};
  const controllerCompleted = event('controller.completed', request.task_id, { lane: route.selected_lane.id, plan });
  events.push(controllerCompleted); emit(controllerCompleted);
  const planPaths = plan.source_paths ?? request.source_paths;
  if (planPaths.some(path => !request.source_paths.includes(path))) {
    telemetry.failure_reason = 'CONTROLLER_SCOPE_VIOLATION';
    return { status: 'DEGRADED', failure_reason: telemetry.failure_reason, events, telemetry, episode: baseEpisode(request, null, route, { result: 'FAIL', errors: [telemetry.failure_reason] }, { accepted: false }, telemetry, events), dispose: async () => {} };
  }
  const packet = compileTaskPacket({ ...request, question: plan.question ?? request.question, max_facts: plan.max_facts ?? request.max_facts, source_paths: planPaths }, sources);
  telemetry.context_bytes = packet.sources.reduce((sum, source) => sum + Buffer.byteLength(source.excerpt), 0);
  events.push(event('capability.requested', request.task_id, { capability: request.capability, trust_domain: request.trust_domain }));
  const selected = registry.choose({ trust_domain: request.trust_domain, capabilities: [request.capability], min_context: request.min_context });
  if (selected.status !== 'ROUTED' || selected.selected !== worker?.resource_id) {
    telemetry.failure_reason = 'TRUST_DOMAIN_UNAVAILABLE';
    return { status: 'DEGRADED', failure_reason: telemetry.failure_reason, events, telemetry, packet, episode: baseEpisode(request, packet, { selected_resource: selected.selected ?? null, reason_code: telemetry.failure_reason }, { result: 'FAIL', errors: [telemetry.failure_reason] }, { accepted: false }, telemetry, events), dispose: async () => {} };
  }
  events.push(event('worker.started', request.task_id, { resource_id: worker.resource_id })); emit(events.at(-1));
  let workerResult = await worker.execute(packet);
  telemetry.local_invocations = 1;
  telemetry.local_input_tokens = workerResult.telemetry?.input_tokens ?? null;
  telemetry.local_output_tokens = workerResult.telemetry?.output_tokens ?? null;
  let validation = validateWorkerResult(workerResult?.output ?? workerResult, packet);
  telemetry.validation_calls += 1;
  telemetry.deterministic_normalization_attempts += 1;
  if (validation.normalization.success) telemetry.deterministic_normalization_successes += 1;
  telemetry.normalization_history.push({ raw_hash: validation.normalization.raw_hash, classification: validation.normalization.classification, success: validation.normalization.success, reasoning_wrapper_detected: validation.normalization.reasoning_wrapper_detected });
  let cleanup = workerResult?.dispose;
  const repairBudget = Math.min(max_repairs, request.budget.max_repairs);
  if (!validation.accepted && repairBudget > 0) {
    telemetry.repairs = 1;
    telemetry.model_repair_calls = 1;
    events.push(event('repair.requested', request.task_id, { reason: 'deterministic-validation-failed', bounded_to: 1 }));
    workerResult = await worker.execute({ ...packet, repair: { previous_errors: validation.errors } });
    telemetry.local_invocations++;
    telemetry.local_input_tokens = telemetry.local_input_tokens === null ? (workerResult.telemetry?.input_tokens ?? null) : telemetry.local_input_tokens;
    telemetry.local_output_tokens = telemetry.local_output_tokens === null ? (workerResult.telemetry?.output_tokens ?? null) : telemetry.local_output_tokens;
    validation = validateWorkerResult(workerResult?.output ?? workerResult, packet);
    telemetry.validation_calls += 1;
    telemetry.deterministic_normalization_attempts += 1;
    if (validation.normalization.success) telemetry.deterministic_normalization_successes += 1;
    telemetry.normalization_history.push({ raw_hash: validation.normalization.raw_hash, classification: validation.normalization.classification, success: validation.normalization.success, reasoning_wrapper_detected: validation.normalization.reasoning_wrapper_detected });
    cleanup = workerResult?.dispose ?? cleanup;
  }
  telemetry.latency_ms = now() - started;
  telemetry.accepted = validation.accepted;
  const workerCompleted = event('worker.completed', request.task_id, { resource_id: worker.resource_id, validation: validation.accepted ? 'PASS' : 'FAIL' });
  events.push(workerCompleted); emit(workerCompleted);
  const validationEvent = event(validation.accepted ? 'validation.passed' : 'validation.failed', request.task_id, { validator: 'schema-source-evidence-validator', errors: validation.errors });
  events.push(validationEvent); emit(validationEvent);
  let controllerConsumption = null;
  if (validation.accepted && !resume?.skip_consumption && typeof controller.consume === 'function') {
    controllerConsumption = await controller.consume({ request, packet, result: validation.value });
    telemetry.controller_invocations++;
    telemetry.new_remote_controller_calls++;
    const inputTokens = controllerConsumption.telemetry?.input_tokens;
    const cachedInputTokens = controllerConsumption.telemetry?.cached_input_tokens;
    const outputTokens = controllerConsumption.telemetry?.output_tokens;
    const reasoningTokens = controllerConsumption.telemetry?.reasoning_tokens;
    telemetry.remote_input_tokens = telemetry.remote_input_tokens === null || inputTokens == null ? (telemetry.remote_input_tokens ?? inputTokens ?? null) : telemetry.remote_input_tokens + inputTokens;
    telemetry.remote_output_tokens = telemetry.remote_output_tokens === null || outputTokens == null ? (telemetry.remote_output_tokens ?? outputTokens ?? null) : telemetry.remote_output_tokens + outputTokens;
    telemetry.remote_cached_input_tokens = telemetry.remote_cached_input_tokens !== null && cachedInputTokens != null ? telemetry.remote_cached_input_tokens + cachedInputTokens : null;
    telemetry.remote_reasoning_tokens = telemetry.remote_reasoning_tokens !== null && reasoningTokens != null ? telemetry.remote_reasoning_tokens + reasoningTokens : null;
    if (Number.isFinite(controllerConsumption.telemetry?.provider_reported_cost) && telemetry.remote_provider_reported_cost !== null) telemetry.remote_provider_reported_cost += controllerConsumption.telemetry.provider_reported_cost;
    if (controllerConsumption.telemetry?.cache) telemetry.remote_cache = telemetry.remote_cache ?? controllerConsumption.telemetry.cache;
    if (controllerConsumption.telemetry?.cost && telemetry.remote_cost) telemetry.remote_cost = Object.fromEntries(['input', 'output', 'cacheRead', 'cacheWrite', 'total'].map(key => [key, (telemetry.remote_cost[key] ?? 0) + (controllerConsumption.telemetry.cost[key] ?? 0)]));
    if (controllerConsumption.consumed !== true) { telemetry.failure_reason = 'CONTROLLER_CONSUMPTION_FAILED'; validation = { ...validation, accepted: false, errors: [...validation.errors, telemetry.failure_reason] }; }
    const consumedEvent = event(controllerConsumption.consumed === true ? 'controller.consumed' : 'controller.consumption_failed', request.task_id, { accepted: controllerConsumption.consumed === true });
    events.push(consumedEvent); emit(consumedEvent);
  }
  const status = validation.accepted ? 'ACCEPTED' : 'DEGRADED';
  const outcomeEvent = event(validation.accepted ? 'result.accepted' : 'result.rejected', request.task_id, { status });
  events.push(outcomeEvent); emit(outcomeEvent);
  const result = { status, failure_reason: validation.accepted ? null : (telemetry.failure_reason ?? 'LOCAL_VALIDATION_FAILED'), request, packet, controller: { lane: route.selected_lane, plan: controllerResult.plan ?? null, consumption: controllerConsumption }, worker: { resource_id: worker.resource_id, provider: worker.resource_id, output: validation.value }, validation: { result: validation.accepted ? 'PASS' : 'FAIL', errors: validation.errors }, events, telemetry, episode: baseEpisode(request, packet, { ...route, selected_resource: worker.resource_id, reason_code: 'LOCAL_SPECIALIST_SUPPORTED' }, { ...validation, result: validation.accepted ? 'PASS' : 'FAIL' }, { accepted: validation.accepted }, telemetry, events), dispose: async () => { await cleanup?.(); } };
  result.episode.economics.latency_ms = telemetry.latency_ms;
  return result;
}

export function canonicalSwarmReceipt(result) {
  return canonicalize({ status: result.status, failure_reason: result.failure_reason, request: result.request, packet: result.packet && { task_id: result.packet.task_id, packet_sha256: result.packet.packet_sha256, sources: result.packet.sources.map(source => ({ path: source.path, sha256: source.sha256 })) }, controller: result.controller, worker: result.worker && { resource_id: result.worker.resource_id, output: result.worker.output }, validation: result.validation, telemetry: result.telemetry, events: result.events, episode: result.episode });
}
