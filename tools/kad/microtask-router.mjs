import { createHash } from 'node:crypto';
import { canonicalize, hashCanonical } from './distillation.mjs';
import { createEconomicPolicy, routeEconomically } from './economic-router.mjs';
import { compileResourceAwareTaskPacket, requiredOutputReserve } from './context-compiler.mjs';
import { normalizeResourceContract, preflightResourceContract } from './resource-contract.mjs';

export const EXECUTION_CLASSES = Object.freeze(['DETERMINISTIC', 'LOCAL_SPECIALIST', 'LOCAL_GENERAL', 'REMOTE_FREE', 'REMOTE_SUBSCRIPTION', 'REMOTE_STRONG', 'REMOTE_REQUIRED', 'HUMAN_REQUIRED']);
export const ESCALATION_REASONS = Object.freeze([
  'NO_LOCAL_CAPABILITY', 'LOCAL_RESOURCE_UNAVAILABLE', 'LOCAL_RESOURCE_FIT_FAILED',
  'LOCAL_RESOURCE_CONTRACT_MISSING', 'LOCAL_CONTEXT_COMPILE_FAILED', 'LOCAL_VALIDATION_FAILED',
  'LOCAL_OUTPUT_CONTRACT_FAILED', 'AUTHORITY_REQUIRES_REMOTE', 'SECURITY_REQUIRES_REMOTE',
  'ARCHITECTURE_REQUIRES_REMOTE', 'AMBIGUITY_REQUIRES_STRONGER_REASONING',
  'DETERMINISTIC_PATH_AVAILABLE', 'LOCAL_ACCEPTED', 'REMOTE_NOT_AUTHORIZED',
]);

const hash = value => createHash('sha256').update(String(value), 'utf8').digest('hex');
const has = (list, value) => Array.isArray(list) && list.includes(value);
const isKnownPositive = value => Number.isInteger(value) && value >= 0;

function requiredAuthorityReason(task) {
  if (task.security_sensitive) return 'SECURITY_REQUIRES_REMOTE';
  if (task.architecture_decision) return 'ARCHITECTURE_REQUIRES_REMOTE';
  if (task.authority_required || task.mutation || task.acceptance_authority) return 'AUTHORITY_REQUIRES_REMOTE';
  if (task.ambiguous) return 'AMBIGUITY_REQUIRES_STRONGER_REASONING';
  return null;
}

export function classifyMicrotask(task = {}) {
  const authorityReason = requiredAuthorityReason(task);
  const sourceCount = Array.isArray(task.source_paths) ? new Set(task.source_paths).size : task.source_count ?? null;
  const bounded = task.read_only === true && task.mutation !== true && sourceCount !== null && Number.isInteger(sourceCount) && sourceCount >= 1 && sourceCount <= 16 && task.output_bound === true && task.validator === true;
  const outputShape = task.output_schema?.type ?? 'UNKNOWN';
  const execution_class = authorityReason ? 'REMOTE_REQUIRED' : bounded ? 'LOCAL_SPECIALIST' : 'REMOTE_REQUIRED';
  return {
    task_id: task.task_id ?? null,
    required_trust_domain: task.trust_domain ?? 'UNKNOWN',
    required_capability: task.capability ?? task.required_capability ?? 'UNKNOWN',
    execution_class,
    complexity: { source_count: sourceCount, expected_output_shape: outputShape, mutation: task.mutation === true, authority_required: Boolean(task.authority_required || task.acceptance_authority), read_only: task.read_only === true, bounded_output: task.output_bound === true },
    economic_policy: { prefer_deterministic: true, prefer_local: true, remote_allowed: task.remote_allowed !== false },
    authority_reason: authorityReason,
    bounded_local_shape: bounded,
  };
}

function resourceContract(resource) {
  return resource?.resource_contract ?? resource ?? {};
}

function hasExplicitProvenContract(resource) {
  const contract = normalizeResourceContract(resourceContract(resource));
  return Boolean(contract.resource_id && contract.model_identity && contract.runtime_argv_sha256 && contract.runtime_configuration_sha256 && contract.evidence.length > 0 && contract.confidence !== 'UNKNOWN');
}

function resourceMatches(resource, task) {
  const contract = normalizeResourceContract(resourceContract(resource));
  return contract.trust_domain === task.trust_domain && has(contract.capabilities, task.capability);
}

function outputReserve(task) {
  return task.output_reserve ?? requiredOutputReserve({ max_facts: task.max_facts ?? 1, max_claim_bytes: task.max_claim_bytes ?? 160, max_evidence_bytes: task.max_evidence_bytes ?? 220 });
}

function fitLocalResource(resource, task) {
  const contract = resourceContract(resource);
  if (!hasExplicitProvenContract(resource)) return { ok: false, reason_code: 'LOCAL_RESOURCE_CONTRACT_MISSING', reason: 'explicit proven resource contract is required' };
  const prompt = task.compiled_prompt_tokens ?? task.context_tokens ?? 0;
  const fit = preflightResourceContract({ resource: contract, required_prompt_tokens: prompt, required_output_reserve: outputReserve(task), requested_output_tokens: task.budget?.max_output_tokens ?? outputReserve(task) });
  return fit.ok ? { ok: true, contract: fit.contract, fit } : { ok: false, reason_code: 'LOCAL_RESOURCE_FIT_FAILED', reason: fit.reason, fit };
}

function remoteRoute(task, lanes, policy, reason) {
  if (task.remote_allowed === false) return { execution_class: 'REMOTE_REQUIRED', invoke: false, reason_code: reason ?? 'REMOTE_NOT_AUTHORIZED', candidates: [] };
  const route = routeEconomically({ requirement: { trust_domain: task.trust_domain, capabilities: [task.capability], min_context: task.compiled_prompt_tokens ?? task.context_tokens ?? 0 }, lanes, policy });
  if (route.status !== 'ROUTED') return { execution_class: 'REMOTE_REQUIRED', invoke: false, reason_code: reason ?? 'NO_LOCAL_CAPABILITY', candidates: route.rejections ?? [] };
  return { execution_class: route.selected_execution_class, invoke: true, selected_resource: route.selected_lane, reason_code: reason ?? 'NO_LOCAL_CAPABILITY', candidates: route.candidates, quota: route.observation };
}

export function routeMicrotask({ task: input, deterministic_tool = null, local_resources = [], remote_lanes = [], policy = createEconomicPolicy(), escalation_reason = null } = {}) {
  const task = { ...(input ?? {}), capability: input?.capability ?? input?.required_capability };
  const classification = classifyMicrotask(task);
  const authorityReason = classification.authority_reason;
  const events = [{ type: 'task.classified', task_id: task.task_id, execution_class: classification.execution_class }];

  if (!authorityReason && deterministic_tool && deterministic_tool.available !== false && deterministic_tool.trust_domain === task.trust_domain && has(deterministic_tool.capabilities, task.capability) && deterministic_tool.validator === true) {
    return { ...classification, execution_class: 'DETERMINISTIC', invoke: true, selected_resource: deterministic_tool.id ?? deterministic_tool.resource_id, reason_code: 'DETERMINISTIC_PATH_AVAILABLE', events: [...events, { type: 'execution.deterministic_selected', task_id: task.task_id }] };
  }
  if (authorityReason) {
    const remote = remoteRoute(task, remote_lanes, policy, authorityReason);
    return { ...classification, ...remote, execution_class: 'REMOTE_REQUIRED', invoke: false, selected_resource: null, events: [...events, { type: 'escalation.required', task_id: task.task_id, reason_code: authorityReason }] };
  }

  const matching = local_resources.filter(resource => resourceMatches(resource, task));
  const unavailable = matching.some(resource => resource.available === false);
  let localFailure = matching.length === 0 ? 'NO_LOCAL_CAPABILITY' : unavailable ? 'LOCAL_RESOURCE_UNAVAILABLE' : null;
  for (const resource of matching.filter(item => item.available !== false)) {
    const fit = fitLocalResource(resource, task);
    if (!fit.ok) { localFailure = fit.reason_code; continue; }
    return { ...classification, execution_class: resource.local === false ? 'LOCAL_GENERAL' : 'LOCAL_SPECIALIST', invoke: true, selected_resource: resource.id ?? resource.resource_id, resource_contract: fit.contract, reason_code: 'LOCAL_ACCEPTED', events: [...events, { type: 'execution.local_selected', task_id: task.task_id, resource_id: resource.id ?? resource.resource_id }] };
  }

  const remote = remoteRoute(task, remote_lanes, policy, localFailure ?? 'NO_LOCAL_CAPABILITY');
  // Resource admission is a hard boundary. It is reconsiderable, not an implicit
  // remote fallback and therefore never invokes a remote lane here.
  if (localFailure === 'LOCAL_RESOURCE_FIT_FAILED' || localFailure === 'LOCAL_RESOURCE_CONTRACT_MISSING' || localFailure === 'LOCAL_RESOURCE_UNAVAILABLE') {
    return { ...classification, execution_class: 'REMOTE_REQUIRED', invoke: false, reason_code: localFailure, local_reconsideration: true, candidates: remote.candidates, events: [...events, { type: 'escalation.required', task_id: task.task_id, reason_code: localFailure }] };
  }
  return { ...classification, ...remote, events: [...events, remote.invoke ? { type: 'execution.remote_selected', task_id: task.task_id, reason_code: remote.reason_code } : { type: 'escalation.required', task_id: task.task_id, reason_code: remote.reason_code }] };
}

function safeTask(task) {
  return { task_id: task.task_id, trust_domain: task.trust_domain, capability: task.capability, question: task.question ?? '', source_paths: [...(task.source_paths ?? [])], output_schema: task.output_schema ?? null, max_facts: task.max_facts ?? null };
}

export function compileFreshLocalPacket({ task, sources = [], resource_contract } = {}) {
  const selectors = task.source_selectors ?? task.source_paths?.map(path => ({ path, selector: { kind: 'whole_file', max_bytes: 12000, reason: 'bounded task source' } })) ?? [];
  if (sources.length > 0) {
    const request = { task_id: task.task_id, role: task.role ?? 'local_specialist', trust_domain: task.trust_domain, capability: task.capability, question: task.question ?? '', source_paths: [...new Set(task.source_paths ?? sources.map(source => source.path))], max_facts: task.max_facts ?? 1, budget: task.budget ?? { max_output_tokens: outputReserve(task) } };
    const packet = compileResourceAwareTaskPacket({ request, sources, selectors, resource_contract, output_reserve: outputReserve(task), requested_output_tokens: task.budget?.max_output_tokens ?? outputReserve(task) });
    if (packet.resource_fit !== 'PASS') throw new Error(packet.fit?.reason ?? 'local packet does not fit resource contract');
    return packet;
  }
  const packet = { task_id: task.task_id, trust_domain: task.trust_domain, capability: task.capability, invariant: safeTask(task), source_selectors: [...new Map(selectors.map(item => [canonicalize(item), item])).values()].sort((a, b) => canonicalize(a).localeCompare(canonicalize(b))), output_schema: task.output_schema ?? null, validation_contract: { deterministic: task.validator === true }, resource_contract: normalizeResourceContract(resource_contract), forbidden_context: ['parent_conversation', 'prior_local_transcript', 'hidden_reasoning'] };
  return { ...packet, packet_sha256: hashCanonical(packet), context_bytes: Buffer.byteLength(canonicalize(packet)) };
}

export function buildEscalationPacket({ task, reason, evidence = [], validator = null, unresolved = '', raw_transcript = null } = {}) {
  if (!ESCALATION_REASONS.includes(reason)) throw new Error(`unknown typed escalation reason: ${reason}`);
  const selectedEvidence = evidence.map(item => ({ path: item.path ?? null, sha256: item.sha256 ?? item.source_sha256 ?? null, claim: item.claim ?? null, evidence: item.evidence ?? null, error: item.error ?? null }));
  const packet = { task: safeTask(task), reason, known: { evidence: selectedEvidence, validator: validator ? { result: validator.result ?? null, errors: validator.errors ?? [] } : null }, unresolved, context_policy: 'evidence-only-no-transcript' };
  // raw_transcript is deliberately accepted only as a proof-of-discard input; it
  // is never copied into the packet or its hash.
  void raw_transcript;
  return { ...packet, packet_sha256: hashCanonical(packet) };
}

function acceptedResult(result) {
  return result?.validation?.accepted === true || result?.validation?.result === 'PASS';
}

export function makeEconomicReceipt({ task, execution_class, resource = null, provider = null, model = null, local_calls = 0, remote_calls = 0, local_input_tokens = null, local_output_tokens = null, remote_input_tokens = null, remote_output_tokens = null, context_bytes = null, latency_ms = null, repairs = 0, validation = 'UNKNOWN', accepted = false, escalation_reason = null, remote_call_avoided = null, context_hash = null } = {}) {
  return { task_id: task?.task_id ?? null, execution_class, resource_id: resource?.resource_id ?? resource?.id ?? resource?.lane_id ?? null, provider, model, local_calls, remote_calls, local_input_tokens, local_output_tokens, remote_input_tokens, remote_output_tokens, context_bytes, context_hash, latency_ms, repairs, validation, accepted, escalation_reason, remote_call_avoided };
}

export async function executeMicrotask({ task: input, deterministic_tool = null, local_resources = [], remote_lanes = [], policy = createEconomicPolicy(), sources = [], local_execute, remote_execute, escalation_reason = null } = {}) {
  const task = { ...(input ?? {}), capability: input?.capability ?? input?.required_capability };
  const route = routeMicrotask({ task, deterministic_tool, local_resources, remote_lanes, policy, escalation_reason });
  const started = performance.now();
  if (route.execution_class === 'REMOTE_REQUIRED' && !route.invoke) return { status: 'RECONSIDERATION_REQUIRED', route, receipt: makeEconomicReceipt({ task, execution_class: route.execution_class, escalation_reason: route.reason_code }) };
  if (route.execution_class.startsWith('REMOTE')) {
    if (!escalation_reason || !ESCALATION_REASONS.includes(escalation_reason)) throw new Error('remote execution requires a typed escalation reason');
    if (typeof remote_execute !== 'function') throw new Error('remote executor is required');
    const result = await remote_execute({ task: safeTask(task), escalation_reason });
    const accepted = acceptedResult(result);
    return { status: accepted ? 'ACCEPTED' : 'DEGRADED', route, output: result?.output ?? result, receipt: makeEconomicReceipt({ task, execution_class: route.execution_class, resource: route, provider: route.provider, model: route.model, remote_calls: 1, remote_input_tokens: result?.telemetry?.input_tokens ?? null, remote_output_tokens: result?.telemetry?.output_tokens ?? null, latency_ms: Math.round(performance.now() - started), validation: accepted ? 'PASS' : 'FAIL', accepted, escalation_reason }) };
  }
  let packet = null;
  if (route.execution_class === 'DETERMINISTIC') {
    const output = typeof deterministic_tool.execute === 'function' ? await deterministic_tool.execute({ task: safeTask(task) }) : null;
    const accepted = acceptedResult(output);
    return { status: accepted ? 'ACCEPTED' : 'DEGRADED', route, output: output?.output ?? output, receipt: makeEconomicReceipt({ task, execution_class: 'DETERMINISTIC', resource: deterministic_tool, latency_ms: Math.round(performance.now() - started), validation: accepted ? 'PASS' : 'FAIL', accepted }) };
  }
  if (typeof local_execute !== 'function') throw new Error('local executor is required');
  try {
    packet = compileFreshLocalPacket({ task, sources, resource_contract: route.resource_contract });
  } catch (error) {
    const reason = /fit|resource/i.test(error.message) ? 'LOCAL_RESOURCE_FIT_FAILED' : 'LOCAL_CONTEXT_COMPILE_FAILED';
    const reconsidered = { ...route, execution_class: 'REMOTE_REQUIRED', invoke: false, reason_code: reason, local_reconsideration: true };
    return { status: 'RECONSIDERATION_REQUIRED', route: reconsidered, receipt: makeEconomicReceipt({ task, execution_class: 'REMOTE_REQUIRED', escalation_reason: reason }) };
  }
  const result = await local_execute(packet);
  let validation = result?.validation ?? { accepted: acceptedResult(result), result: acceptedResult(result) ? 'PASS' : 'FAIL' };
  if (!acceptedResult(result) && typeof result?.normalize === 'function') {
    const normalized = await result.normalize(result.output);
    validation = normalized?.validation ?? { accepted: acceptedResult(normalized), result: acceptedResult(normalized) ? 'PASS' : 'FAIL' };
  }
  const accepted = validation.accepted === true || validation.result === 'PASS';
  const receipt = makeEconomicReceipt({ task, execution_class: route.execution_class, resource: route.resource_contract ?? { resource_id: route.selected_resource }, local_calls: 1, local_input_tokens: result?.telemetry?.input_tokens ?? null, local_output_tokens: result?.telemetry?.output_tokens ?? null, context_bytes: packet.context_bytes ?? packet.sources?.reduce((sum, source) => sum + Buffer.byteLength(source.excerpt), 0) ?? null, context_hash: packet.packet_sha256, latency_ms: Math.round(performance.now() - started), validation: accepted ? 'PASS' : 'FAIL', accepted, escalation_reason: accepted ? 'LOCAL_ACCEPTED' : 'LOCAL_VALIDATION_FAILED', remote_call_avoided: accepted && task.remote_required_if_not_local === true ? true : null });
  if (accepted) return { status: 'ACCEPTED', route, packet, output: result?.output ?? result, validation, receipt, capability_update: null, events: [...route.events, { type: 'local.accepted', task_id: task.task_id }] };
  const escalation = buildEscalationPacket({ task, reason: 'LOCAL_VALIDATION_FAILED', evidence: packet.sources ?? [], validator: validation, unresolved: 'validated local result is insufficient' });
  return { status: 'ESCALATION_REQUIRED', route, packet, output: result?.output ?? result, validation, escalation_packet: escalation, escalation_reason: 'LOCAL_VALIDATION_FAILED', capability_update: null, receipt: { ...receipt, escalation_reason: 'LOCAL_VALIDATION_FAILED' }, events: [...route.events, { type: 'local.rejected', task_id: task.task_id, reason_code: 'LOCAL_VALIDATION_FAILED' }] };
}

export function recordDistillationCandidate({ task, receipts = [] } = {}) {
  const accepted = receipts.length >= 2 && receipts.every(receipt => receipt?.accepted === true && (receipt.validation === undefined || receipt.validation === 'PASS' || receipt.validation?.result === 'PASS'));
  return { candidate: accepted, promoted: false, type: accepted ? 'DETERMINISTIC_TOOL_CANDIDATE' : null, task_id: task?.task_id ?? null, evidence_count: receipts.length, policy_lesson: accepted ? 'repeated validated extraction may migrate downward' : null };
}
