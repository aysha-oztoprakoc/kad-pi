const stages = ['normalize_ms', 'economic_route_ms', 'controller_decompose_ms', 'packet_compile_ms', 'local_lifecycle_start_ms', 'local_worker_ms', 'validation_ms', 'controller_consume_ms', 'local_lifecycle_stop_ms', 'total_ms'];

export function createStageTelemetry(input = {}) {
  return { task_id: input.task_id ?? null, ...Object.fromEntries(stages.map(stage => [stage, null])), controller_calls: 0, local_calls: 0, deterministic_calls: 0, repairs: 0, accepted: null, selected_lane: null, reason_codes: [], remote_input_tokens: null, remote_output_tokens: null, local_input_tokens: null, local_output_tokens: null, quota_units: null, avoided_model_calls: 0 };
}
export function recordStage(telemetry, stage, durationMs) { if (!stages.includes(stage)) throw new Error(`unknown telemetry stage: ${stage}`); telemetry[stage] = Number.isFinite(durationMs) ? durationMs : null; return telemetry; }
export function finishStageTelemetry(telemetry, totalMs = null) { telemetry.total_ms = totalMs; return telemetry; }
export { stages as TELEMETRY_STAGES };
