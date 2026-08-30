import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../..');

// Import Compute Fabric probe modules
import {
  createExperimentTuple,
  validateExperimentTuple,
  serializeTupleKey,
  calculateScarceCost,
  normalizeProbeMetrics,
  captureEnvironmentBaseline,
  validateExtensionAdmission,
  resolveInterceptionPipeline,
  recordProbeReceipt,
  verifyEvidenceChain,
  runBenchmarkProbe,
  INTERCEPTION_STAGES,
  ADMISSION_LIFECYCLE_STAGES
} from '../compute/index.mjs';

test('WP-021: 9-Tuple experimental configuration parser, validator, and serializer', () => {
  const validConfig = {
    model: 'Qwen/Qwen2.5-Coder-7B-Instruct',
    quant: 'Q4_K_M',
    runtime: 'rocm-hip',
    devices: 'amdgpu:0 [Navi 44]',
    context: 4096,
    KV: 'fp16',
    speculation: 'none',
    threading: 'auto',
    network: 'local_memory'
  };

  const tuple = createExperimentTuple(validConfig);
  assert.equal(tuple.schema, 'kad-compute-experiment-tuple-v1');
  assert.equal(tuple.model, 'Qwen/Qwen2.5-Coder-7B-Instruct');
  assert.equal(tuple.context, 4096);

  const validation = validateExperimentTuple(tuple);
  assert.equal(validation.valid, true);

  const key = serializeTupleKey(tuple);
  assert.equal(key, 'Qwen/Qwen2.5-Coder-7B-Instruct:Q4_K_M:rocm-hip:amdgpu:0 [Navi 44]:4096:fp16:none:auto:local_memory');

  // Incomplete tuple fails validation
  const invalidTuple = createExperimentTuple({ model: 'Qwen' });
  const invalidValidation = validateExperimentTuple(invalidTuple);
  assert.equal(invalidValidation.valid, false);
  assert.ok(invalidValidation.missingDimensions.length > 0);
});

test('WP-021: 11 Telemetry metrics normalizer and scarce resource cost calculation', () => {
  const rawMetrics = {
    ttft_ms: 45.2,
    prefill_tok_per_sec: 320.5,
    decode_tok_per_sec: 42.8,
    peak_vram_bytes: 4294967296,
    peak_ram_bytes: 8589934592,
    network_transfer_bytes: 0,
    failure_rate: 0.0,
    task_acceptance_rate: 1.0,
    structured_output_validity: 1.0,
    quality_score: 0.95
  };

  const normalized = normalizeProbeMetrics(rawMetrics);
  assert.equal(normalized.schema, 'kad-compute-11-metrics-v1');
  assert.equal(normalized.ttft_ms, 45.2);
  assert.equal(normalized.task_acceptance_rate, 1.0);
  assert.ok(normalized.scarce_resource_cost > 0);

  // Scarce cost incorporates latency, memory, and failure penalties
  const cost = calculateScarceCost(normalized);
  assert.equal(typeof cost, 'number');
  assert.ok(cost > 0);
});

test('WP-021: Confounder and environment baselining isolates thermal and background load', () => {
  const baseline = captureEnvironmentBaseline({ mock: true, gpuDevice: 'amdgpu:0' });
  assert.ok(baseline.timestamp);
  assert.equal(typeof baseline.gpu_temperature_c, 'number');
  assert.equal(typeof baseline.compositor_load_percent, 'number');
  assert.equal(typeof baseline.vram_baseline_used_bytes, 'number');
});

test('WP-021: OMP Extension Admission and Deterministic Interception Pipeline (D021-002, D021-003)', () => {
  const validExtension = {
    id: 'pi-death-loop-guard',
    version: '1.0.0',
    authority: 'NON_AUTHORITATIVE_OBSERVER',
    state_class: 'EPHEMERAL_DERIVED',
    interception_stage: 'LOOP_REDUNDANCY_GUARD',
    can_veto: true,
    mutates_canonical_knowledge: false,
    mutates_routing_policy: false
  };

  const admission = validateExtensionAdmission(validExtension);
  assert.equal(admission.admitted, true);
  assert.equal(admission.stage, ADMISSION_LIFECYCLE_STAGES.SANDBOX);

  // Rejects extension attempting canonical mutation or routing authority
  const rogueExtension = {
    id: 'rogue-plugin',
    mutates_canonical_knowledge: true,
    mutates_routing_policy: true
  };
  const rogueAdmission = validateExtensionAdmission(rogueExtension);
  assert.equal(rogueAdmission.admitted, false);
  assert.ok(rogueAdmission.violations.length > 0);

  // Pipeline ordering strictly follows D021-003
  const extensions = [
    { id: 'ui-meter', stage: 'PRESENTATION_UI' },
    { id: 'sec-guard', stage: 'AUTHORITY_SECURITY' },
    { id: 'loop-breaker', stage: 'LOOP_REDUNDANCY_GUARD' },
    { id: 'context-filter', stage: 'CONTEXT_SAFETY' }
  ];

  const pipeline = resolveInterceptionPipeline(extensions);
  assert.deepEqual(pipeline.map(e => e.id), ['sec-guard', 'context-filter', 'loop-breaker', 'ui-meter']);
});

test('WP-021: Cryptographically hash-chained evidence ledger for probe receipts', () => {
  const testDir = path.join(repoRoot, 'evidence/WP-KAD-COMPUTE-FABRIC-EXPERIMENTAL-PROBE-021/test-receipts');
  fs.mkdirSync(testDir, { recursive: true });

  const receipt1 = {
    run_id: 'probe-run-001',
    tuple_key: 'test-tuple-1',
    metrics: { ttft_ms: 50, decode_tok_per_sec: 40 }
  };

  const recorded1 = recordProbeReceipt(receipt1, { evidenceDir: testDir, reset: true });
  assert.equal(recorded1.sequence, 1);
  assert.ok(recorded1.receipt_hash);
  assert.equal(recorded1.previous_hash, 'GENESIS');

  const receipt2 = {
    run_id: 'probe-run-002',
    tuple_key: 'test-tuple-2',
    metrics: { ttft_ms: 45, decode_tok_per_sec: 44 }
  };

  const recorded2 = recordProbeReceipt(receipt2, { evidenceDir: testDir });
  assert.equal(recorded2.sequence, 2);
  assert.equal(recorded2.previous_hash, recorded1.receipt_hash);

  const chainValidation = verifyEvidenceChain(testDir);
  assert.equal(chainValidation.valid, true);
  assert.equal(chainValidation.totalReceipts, 2);
});

test('WP-021: Deterministic probe runner executes warm-up, measures repetitions, and compiles receipt', async () => {
  const tuple = createExperimentTuple({
    model: 'Qwen/Qwen2.5-Coder-7B-Instruct',
    quant: 'Q4_K_M',
    runtime: 'rocm-hip',
    devices: 'amdgpu:0 [Navi 44]',
    context: 4096,
    KV: 'fp16',
    speculation: 'none',
    threading: 'auto',
    network: 'local_memory'
  });

  const mockAdapter = {
    executeInference: async (tuple, repIndex) => ({
      ttft_ms: 40 + repIndex,
      prefill_tok_per_sec: 350 - repIndex,
      decode_tok_per_sec: 45 + repIndex,
      peak_vram_bytes: 4000000000,
      peak_ram_bytes: 8000000000,
      structured_output_validity: 1.0,
      task_acceptance_rate: 1.0
    })
  };

  const probeResult = await runBenchmarkProbe(tuple, {
    executionAdapter: mockAdapter,
    repetitions: 3,
    warmup: 1,
    mockConfounder: true
  });

  assert.equal(probeResult.status, 'MEASURED');
  assert.equal(probeResult.repetitions_measured, 3);
  assert.equal(probeResult.warmup_discarded, 1);
  assert.ok(probeResult.metrics);
  assert.ok(probeResult.metrics.ttft_ms > 0);
  assert.ok(probeResult.metrics.decode_tok_per_sec > 0);
  assert.ok(probeResult.metrics.scarce_resource_cost > 0);
  assert.ok(probeResult.environment_baseline);
});
