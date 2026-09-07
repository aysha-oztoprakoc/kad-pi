/**
 * Deterministic Empirical Benchmark Probe Runner
 * Authority: D021-004 (9-Tuple x 11 Metrics Empirical Probe)
 */

import { validateExperimentTuple, serializeTupleKey } from './tuple.mjs';
import { normalizeProbeMetrics } from './metrics.mjs';
import { captureEnvironmentBaseline } from './confounder.mjs';
import { recordProbeReceipt } from './evidence-recorder.mjs';

export async function runBenchmarkProbe(tuple, {
  executionAdapter = null,
  repetitions = 3,
  warmup = 1,
  mockConfounder = false,
  evidenceDir = null
} = {}) {
  const validation = validateExperimentTuple(tuple);
  if (!validation.valid) {
    return {
      status: 'INVALID_TUPLE',
      qualification: 'UNQUALIFIED',
      reason: `Missing dimensions: ${validation.missingDimensions?.join(', ')}`,
      tuple
    };
  }

  const baseline = captureEnvironmentBaseline({
    gpuDevice: tuple.devices || 'amdgpu:0',
    mock: mockConfounder
  });

  if (!executionAdapter) {
    return {
      status: 'NON_MEASURED',
      qualification: 'UNQUALIFIED',
      reason: 'No execution adapter provided; live benchmark requires an explicitly identified real execution adapter',
      tuple_key: serializeTupleKey(tuple),
      tuple,
      environment_baseline: baseline,
      generated_at: new Date().toISOString()
    };
  }

  if (!repetitions || repetitions <= 0) {
    return {
      status: 'NON_MEASURED',
      qualification: 'UNQUALIFIED',
      reason: 'Zero repetitions specified; measurement requires repetitions > 0',
      tuple_key: serializeTupleKey(tuple),
      tuple,
      environment_baseline: baseline,
      generated_at: new Date().toISOString()
    };
  }

  const isReal = executionAdapter.isRealAdapter === true;
  const status = isReal ? 'MEASURED' : 'SIMULATED';
  const qualification = isReal ? 'EMPIRICAL_MEASURED' : 'SIMULATED_NOT_EMPIRICAL';

  // 1. Warm-up runs (discarded from metrics to avoid cold-start confounders)
  for (let w = 0; w < warmup; w++) {
    await executionAdapter.executeInference(tuple, w);
  }

  // 2. Measured repetitions
  const samples = [];
  for (let r = 0; r < repetitions; r++) {
    const repMetrics = await executionAdapter.executeInference(tuple, r);
    samples.push(repMetrics);
  }

  // 3. Compute aggregated means from valid observed values
  const avg = (key) => {
    const validSamples = samples.filter((s) => s && s[key] !== null && s[key] !== undefined && Number.isFinite(Number(s[key])));
    if (validSamples.length === 0) return null;
    return validSamples.reduce((acc, s) => acc + Number(s[key]), 0) / validSamples.length;
  };

  const max = (key) => {
    const validSamples = samples.filter((s) => s && s[key] !== null && s[key] !== undefined && Number.isFinite(Number(s[key])));
    if (validSamples.length === 0) return null;
    return Math.max(...validSamples.map((s) => Number(s[key])));
  };

  const aggregatedMetrics = normalizeProbeMetrics({
    ttft_ms: avg('ttft_ms'),
    prefill_tok_per_sec: avg('prefill_tok_per_sec'),
    decode_tok_per_sec: avg('decode_tok_per_sec'),
    peak_vram_bytes: max('peak_vram_bytes'),
    peak_ram_bytes: max('peak_ram_bytes'),
    network_transfer_bytes: avg('network_transfer_bytes'),
    failure_rate: avg('failure_rate'),
    task_acceptance_rate: avg('task_acceptance_rate'),
    structured_output_validity: avg('structured_output_validity'),
    quality_score: avg('quality_score')
  });

  const tupleKey = serializeTupleKey(tuple);
  const result = {
    status,
    qualification,
    tuple_key: tupleKey,
    tuple,
    adapter_id: executionAdapter.adapter_id || (isReal ? 'real-execution-adapter' : 'simulated-adapter'),
    metrics: aggregatedMetrics,
    repetitions_measured: repetitions,
    warmup_discarded: warmup,
    environment_baseline: baseline,
    samples_count: samples.length,
    generated_at: new Date().toISOString()
  };

  if (evidenceDir) {
     recordProbeReceipt(result, { evidenceDir });
  }

  return result;
}
