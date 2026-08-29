#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  SwarmCoordinator,
  aggregateSwarmResults,
  createResourceRegistry,
  decomposeTaskRequests,
} from './swarm-control-plane.mjs';
import { createQwenRetrievalWorker, createSthenoWorldWorker } from './swarm-workers.mjs';

const root = resolve(process.cwd());
const evidenceDir = join(root, 'evidence', 'WP-KAD-CONTEXT-SWARM-001');
const statePath = join(root, '.state', 'omp-kad', 'runtime', 'swarm-state.json');
mkdirSync(evidenceDir, { recursive: true });

const tasks = decomposeTaskRequests([
  { task_id: 'SWARM-MVP-QWEN-001', requested_capability: 'repository-fact-finding', trust_domain: 'retrieval', input_reference: 'fixture:repository-policy', expected_output_schema: { type: 'object', required: ['value'] }, max_runtime: 1000, resource_policy: { mode: 'time-multiplexed', compiled_prompt_tokens: 128, required_output_reserve: 128 }, evidence_requirements: ['worker-receipt'] },
  { task_id: 'SWARM-MVP-STHENO-001', requested_capability: 'world-simulation', trust_domain: 'world', input_reference: 'fixture:bounded-world', expected_output_schema: { type: 'object', required: ['value'] }, max_runtime: 1000, resource_policy: { mode: 'time-multiplexed', compiled_prompt_tokens: 128, required_output_reserve: 128 }, evidence_requirements: ['worker-receipt'] },
]);

const registry = createResourceRegistry([
  { id: 'kad-local-qwen-amdy', provider: 'kad-local-qwen', model_identity: 'Qwen3.5-9B', capabilities: ['repository-fact-finding', 'structured-extraction'], trust_domain: 'retrieval', context_window: 2048, max_output_tokens: 512, ownership: 'OWNED', priority: 10 },
  { id: 'kad-local-world-amdy', provider: 'kad-local-world', model_identity: 'L3-8B-Stheno', capabilities: ['world-simulation'], trust_domain: 'world', context_window: 4096, max_output_tokens: 512, ownership: 'EXTERNAL', priority: 0 },
]);
const telemetryPath = join(evidenceDir, 'swarm-telemetry.jsonl');
const coordinator = new SwarmCoordinator({ registry, statePath, telemetryPath });
coordinator.registerWorker(createQwenRetrievalWorker({
  resource_id: 'kad-local-qwen-amdy',
  supported_capabilities: ['repository-fact-finding', 'structured-extraction'],
  activate: async () => ({ model_identity: 'Qwen3.5-9B', activation_ms: 0, transport: 'controlled-fixture' }),
  invoke: async task => ({ value: `retrieval result for ${task.input_reference}`, evidence: ['controlled retrieval fixture'] }),
  release: async () => {},
  expected_model_identity: 'Qwen3.5-9B',
}));
coordinator.registerWorker(createSthenoWorldWorker({
  resource_id: 'kad-local-world-amdy',
  model_identity: 'L3-8B-Stheno',
  invoke: async task => ({ value: `world result for ${task.input_reference}`, evidence: ['controlled world fixture'] }),
}));

const started = performance.now();
const results = await coordinator.runAll(tasks);
const aggregation = aggregateSwarmResults(results, { required_trust_domains: ['retrieval', 'world'] });
const status = aggregation.complete && aggregation.trust_domains_separate ? 'PASS' : 'PARTIAL';
const receipt = {
  schema_version: 'kad-local-swarm-experiment-v1',
  epistemic_class: 'EXPERIMENT',
  status,
  experiment: 'two independent typed local capability tasks with deterministic aggregation',
  orchestration: { controller: 'SwarmCoordinator deterministic controller', remote_orchestration_tokens: null, premium_oracle_attempted: false, payg_attempted: false },
  schedule: 'TIME_MULTIPLEXED',
  aggregation: { accepted_results: aggregation.accepted_results, trust_domains: aggregation.trust_domains, trust_domains_separate: aggregation.trust_domains_separate, complete: aggregation.complete, model_vote_used: aggregation.model_vote_used, deterministic_gate: true },
  telemetry: { local_inference_calls: 2, local_activation_time_ms: 0, local_inference_time_ms: Math.round(performance.now() - started), compactions: 0, estimated_remote_work_displaced: 'UNKNOWN' },
  limitations: ['controlled fixture transport; not a live Qwen/Stheno inference receipt'],
};
writeFileSync(join(evidenceDir, 'swarm-experiment-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
writeFileSync(join(evidenceDir, 'swarm-state-recovery.json'), `${JSON.stringify(SwarmCoordinator.recover(statePath), null, 2)}\n`);
console.log(JSON.stringify(receipt, null, 2));
process.exitCode = status === 'PASS' ? 0 : 2;
