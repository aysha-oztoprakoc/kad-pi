/**
 * 11 Telemetry Metrics & Scarce Cost Normalizer
 * Authority: ISA-KAD-COMPUTE-FABRIC-001 Section 3.2 & D021-004
 *
 * Metrics:
 * 1. ttft_ms
 * 2. prefill_tok_per_sec
 * 3. decode_tok_per_sec
 * 4. peak_vram_bytes
 * 5. peak_ram_bytes
 * 6. network_transfer_bytes
 * 7. failure_rate
 * 8. task_acceptance_rate
 * 9. structured_output_validity
 * 10. quality_score
 * 11. scarce_resource_cost
 */

export const TELEMETRY_11_METRICS_SCHEMA = 'kad-compute-11-metrics-v1';

/**
 * Calculates multi-dimensional scarce resource cost weighting across latency, memory, network, and failures.
 * Lower cost = superior efficiency.
 */
export function calculateScarceCost(metrics = {}) {
  const ttft = Number(metrics.ttft_ms) || 50;
  const decodeRate = Math.max(1, Number(metrics.decode_tok_per_sec) || 30);
  const vramGb = (Number(metrics.peak_vram_bytes) || 0) / (1024 ** 3);
  const ramGb = (Number(metrics.peak_ram_bytes) || 0) / (1024 ** 3);
  const netMb = (Number(metrics.network_transfer_bytes) || 0) / (1024 ** 2);
  const failureRate = Math.max(0, Math.min(1, Number(metrics.failure_rate) || 0));
  const acceptance = Math.max(0.01, Math.min(1, Number(metrics.task_acceptance_rate) || 1));

  // Latency component (seconds per 100 tokens)
  const latencySec = (ttft / 1000) + (100 / decodeRate);

  // Memory footprint weighting (VRAM is 3x more scarce than system RAM)
  const memoryWeight = (vramGb * 3.0) + (ramGb * 1.0);

  // Network penalty
  const networkPenalty = netMb * 0.1;

  // Reliability penalty (failures amplify cost exponentially)
  const reliabilityPenalty = (1 + failureRate * 5) / acceptance;

  const rawCost = (latencySec * 0.4 + memoryWeight * 0.4 + networkPenalty * 0.2) * reliabilityPenalty;
  return Math.round(rawCost * 1000) / 1000;
}

export function normalizeProbeMetrics(raw = {}) {
  const metrics = {
    schema: TELEMETRY_11_METRICS_SCHEMA,
    ttft_ms: typeof raw.ttft_ms === 'number' ? raw.ttft_ms : (Number(raw.ttft_ms) || 0),
    prefill_tok_per_sec: typeof raw.prefill_tok_per_sec === 'number' ? raw.prefill_tok_per_sec : (Number(raw.prefill_tok_per_sec) || 0),
    decode_tok_per_sec: typeof raw.decode_tok_per_sec === 'number' ? raw.decode_tok_per_sec : (Number(raw.decode_tok_per_sec) || 0),
    peak_vram_bytes: typeof raw.peak_vram_bytes === 'number' ? raw.peak_vram_bytes : (Number(raw.peak_vram_bytes) || 0),
    peak_ram_bytes: typeof raw.peak_ram_bytes === 'number' ? raw.peak_ram_bytes : (Number(raw.peak_ram_bytes) || 0),
    network_transfer_bytes: typeof raw.network_transfer_bytes === 'number' ? raw.network_transfer_bytes : (Number(raw.network_transfer_bytes) || 0),
    failure_rate: typeof raw.failure_rate === 'number' ? raw.failure_rate : (Number(raw.failure_rate) || 0),
    task_acceptance_rate: typeof raw.task_acceptance_rate === 'number' ? raw.task_acceptance_rate : (Number(raw.task_acceptance_rate) || 1.0),
    structured_output_validity: typeof raw.structured_output_validity === 'number' ? raw.structured_output_validity : (Number(raw.structured_output_validity) || 1.0),
    quality_score: typeof raw.quality_score === 'number' ? raw.quality_score : (Number(raw.quality_score) || 0)
  };

  metrics.scarce_resource_cost = calculateScarceCost(metrics);
  return metrics;
}
