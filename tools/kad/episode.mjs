import { randomUUID } from 'node:crypto';

const executionClasses = new Set(['DETERMINISTIC_EXISTING', 'DETERMINISTIC_NEW', 'LOCAL_SPECIALIST', 'LOCAL_GENERAL', 'REMOTE_CHEAP', 'REMOTE_STRONG', 'HUMAN']);

export function createEpisode(input = {}) {
  const task = input.task ?? {};
  const resolution = input.resolution ?? {};
  const episode = {
    episode_id: input.episode_id ?? `ep-${randomUUID()}`,
    schema_version: '1',
    causation: { event_id: input.causation?.event_id ?? `event-${randomUUID()}`, parent_event_id: input.causation?.parent_event_id ?? null, pon_event: input.causation?.pon_event ?? 'task.received' },
    task: { task_id: task.task_id ?? 'unknown', domain: task.domain ?? task.trust_domain ?? 'UNKNOWN', task_class: task.task_class ?? 'unknown', objective: task.objective ?? '', trust_domain: task.trust_domain ?? task.domain ?? 'UNKNOWN' },
    state: { available_capabilities: input.state?.available_capabilities ?? [], unavailable_capabilities: input.state?.unavailable_capabilities ?? [], scope: input.state?.scope ?? 'task', host_state_refs: input.state?.host_state_refs ?? [] },
    context: { available_refs: input.context?.available_refs ?? [], selected_refs: input.context?.selected_refs ?? [], selected_bytes: input.context?.selected_bytes ?? 0, selected_tokens: input.context?.selected_tokens ?? null, provenance: input.context?.provenance ?? [] },
    decision: { actor_role: input.decision?.actor_role ?? 'CAPABILITY_ROUTER', required_capability: input.decision?.required_capability ?? null, selected_resource: input.decision?.selected_resource ?? resolution.capability_id ?? null, reason_code: input.decision?.reason_code ?? 'bounded-contract', confidence: input.decision?.confidence ?? null },
    resolution: { deterministic_capability_available: resolution.deterministic_capability_available ?? resolution.selected_execution_class?.startsWith('DETERMINISTIC') ?? false, deterministic_capability_considered: resolution.deterministic_capability_considered ?? true, selected_execution_class: resolution.selected_execution_class ?? 'LOCAL_SPECIALIST', capability_id: resolution.capability_id ?? null, model_avoided: resolution.model_avoided ?? false, new_tool_created: resolution.new_tool_created ?? false, reason_code: resolution.reason_code ?? 'tested_capability_sufficient' },
    trajectory: input.trajectory ?? [],
    validation: { validator: input.validation?.validator ?? 'unspecified', result: input.validation?.result ?? 'UNKNOWN', tests: input.validation?.tests ?? [], postconditions: input.validation?.postconditions ?? [] },
    outcome: { accepted: input.outcome?.accepted ?? false, remote_escalation: input.outcome?.remote_escalation ?? false, human_correction: input.outcome?.human_correction ?? false },
    economics: { local_input_tokens: input.economics?.local_input_tokens ?? null, local_output_tokens: input.economics?.local_output_tokens ?? null, remote_input_tokens: input.economics?.remote_input_tokens ?? null, remote_output_tokens: input.economics?.remote_output_tokens ?? null, wall_ms: input.economics?.wall_ms ?? null, tool_calls: input.economics?.tool_calls ?? null },
    slop: { duplicate_reads: input.slop?.duplicate_reads ?? 0, redundant_tool_calls: input.slop?.redundant_tool_calls ?? 0, blind_retries: input.slop?.blind_retries ?? 0, invalid_structured_outputs: input.slop?.invalid_structured_outputs ?? 0, unused_worker_outputs: input.slop?.unused_worker_outputs ?? 0, unsupported_claims: input.slop?.unsupported_claims ?? 0, violations: input.slop?.violations ?? [] },
    teacher: { used: input.teacher?.used ?? false, provider: input.teacher?.provider ?? null, model: input.teacher?.model ?? null, version: input.teacher?.version ?? null, supervision_artifact: input.teacher?.supervision_artifact ?? null },
    ancestry: { origin: input.ancestry?.origin ?? 'REAL_SYSTEM_OBSERVATION', generation_depth: input.ancestry?.generation_depth ?? 0, parents: input.ancestry?.parents ?? [] },
    training_eligibility: { eligible: false, rights_status: input.training_eligibility?.rights_status ?? 'UNKNOWN', quality_status: input.training_eligibility?.quality_status ?? 'UNREVIEWED', reason: input.training_eligibility?.reason ?? 'runtime-episode-only' },
    teacher_interest: input.teacher_interest ?? 'NONE',
    evidence_refs: input.evidence_refs ?? []
  };
  return episode;
}

export function validateEpisode(episode) {
  const errors = [];
  if (episode?.schema_version !== '1') errors.push('schema_version must be 1');
  if (!episode?.episode_id || !episode?.task?.task_id) errors.push('episode and task identifiers are required');
  if (!executionClasses.has(episode?.resolution?.selected_execution_class)) errors.push('invalid execution class');
  if (episode?.training_eligibility?.eligible !== false) errors.push('training eligibility must default false');
  if (episode?.teacher?.used === false && (episode?.teacher?.provider || episode?.teacher?.model)) errors.push('unused teacher cannot have provenance');
  return { valid: errors.length === 0, errors };
}
