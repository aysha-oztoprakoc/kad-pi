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
function parseFiniteOrNull(val) {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
}

export function calculateScarceCost(metrics = {}) {
  if (metrics.ttft_ms === null || metrics.ttft_ms === undefined || !Number.isFinite(Number(metrics.ttft_ms))) return null;
  if (metrics.decode_tok_per_sec === null || metrics.decode_tok_per_sec === undefined || !Number.isFinite(Number(metrics.decode_tok_per_sec))) return null;
  const ttft = Number(metrics.ttft_ms);
  const decodeRate = Number(metrics.decode_tok_per_sec);
  if (ttft <= 0 || decodeRate <= 0) return null;

  const vramGb = (Number(metrics.peak_vram_bytes) || 0) / (1024 ** 3);
  const ramGb = (Number(metrics.peak_ram_bytes) || 0) / (1024 ** 3);
  const netMb = (Number(metrics.network_transfer_bytes) || 0) / (1024 ** 2);
  const failureRate = metrics.failure_rate != null && Number.isFinite(Number(metrics.failure_rate))
    ? Math.max(0, Math.min(1, Number(metrics.failure_rate)))
    : 0;
  const acceptance = metrics.task_acceptance_rate != null && Number.isFinite(Number(metrics.task_acceptance_rate))
    ? Math.max(0.01, Math.min(1, Number(metrics.task_acceptance_rate)))
    : 1;

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
    ttft_ms: parseFiniteOrNull(raw.ttft_ms),
    prefill_tok_per_sec: parseFiniteOrNull(raw.prefill_tok_per_sec),
    decode_tok_per_sec: parseFiniteOrNull(raw.decode_tok_per_sec),
    peak_vram_bytes: parseFiniteOrNull(raw.peak_vram_bytes),
    peak_ram_bytes: parseFiniteOrNull(raw.peak_ram_bytes),
    network_transfer_bytes: parseFiniteOrNull(raw.network_transfer_bytes),
    failure_rate: parseFiniteOrNull(raw.failure_rate),
    task_acceptance_rate: parseFiniteOrNull(raw.task_acceptance_rate),
    structured_output_validity: parseFiniteOrNull(raw.structured_output_validity),
    quality_score: parseFiniteOrNull(raw.quality_score)
  };

  const baseFields = [
    metrics.ttft_ms,
    metrics.prefill_tok_per_sec,
    metrics.decode_tok_per_sec,
    metrics.peak_vram_bytes,
    metrics.peak_ram_bytes,
    metrics.network_transfer_bytes,
    metrics.failure_rate,
    metrics.task_acceptance_rate,
    metrics.structured_output_validity,
    metrics.quality_score
  ];
  metrics.metrics_coverage = baseFields.every((f) => f !== null) ? 'FULL' : 'PARTIAL';
  metrics.scarce_resource_cost = calculateScarceCost(metrics);
  return metrics;
}
