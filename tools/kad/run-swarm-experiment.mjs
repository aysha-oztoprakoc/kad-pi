#!/usr/bin/env node
import { execFileSync, spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { inspectPreflight } from './omp-orchestration-preflight.mjs';
import { CapabilityRegistry } from './local-router.mjs';
import { runLocalPiChild } from './pi/local-child.mjs';
import { canonicalSwarmReceipt, executeSwarm, selectControllerLane } from './swarm.mjs';
import { routeEconomically, createEconomicPolicy } from './economic-router.mjs';

const root = resolve(process.cwd());
const evidence = join(root, 'evidence', 'WP-KAD-SWARM-001');
mkdirSync(evidence, { recursive: true });
const taskId = 'SWARM-REAL-001';
const request = { task_id: taskId, role: 'local_retrieval', trust_domain: 'retrieval', capability: 'repository-fact-finding', question: 'What exact rule does eligibility apply to a resource?', source_paths: ['tools/kad/local-router.mjs'], max_facts: 1, budget: { max_input_tokens: 2048, max_output_tokens: 192, max_model_calls: 1, max_repairs: 1, deadline_ms: 180000 } };

function parseJson(text) {
  const value = String(text ?? '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try { return JSON.parse(value); } catch {}
  const match = value.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

function runPiController(prompt, lane) {
  return new Promise((resolveResult, reject) => {
    const args = ['--mode', 'json', '-p', '--no-session', '--model', `${lane.provider}/${lane.model}`, '--no-tools', '--no-context-files', '--no-skills', '--no-extensions', '--thinking', 'off', prompt];
    const child = spawn('pi', args, { cwd: root, env: { ...process.env, PI_CODING_AGENT_DIR: join(root, '.pi', 'agent') }, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    const timer = setTimeout(() => child.kill('SIGTERM'), 90000);
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', exitCode => {
      clearTimeout(timer);
      const events = stdout.split('\n').filter(Boolean).flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
      const messages = events.filter(event => event.type === 'message_end').map(event => event.message).filter(message => message?.role === 'assistant');
      const message = messages.at(-1);
      const text = message?.content?.filter(part => part.type === 'text').map(part => part.text).join('') ?? '';
      resolveResult({ exitCode, output: text, plan: parseJson(text), stderr, telemetry: { input_tokens: message?.usage?.input ?? null, output_tokens: message?.usage?.output ?? null, cost: message?.usage?.cost ?? null, latency_ms: message?.duration ?? null, provider: message?.provider ?? 'openai-codex', model: message?.model ?? 'gpt-5.6-luna' } });
    });
  });
}

const preflight = inspectPreflight({ root });
const qwen = preflight.local_inference.resources.find(resource => resource.provider === 'kad-local-qwen');
if (!qwen || qwen.capability_state !== 'AVAILABLE' || qwen.ownership !== 'OWNED') throw new Error(`Qwen preflight is not ready: ${qwen?.capability_state ?? 'MISSING'}/${qwen?.ownership ?? 'MISSING'}`);
const registry = new CapabilityRegistry();
registry.register({ id: 'kad-local-retrieval-amdy', local: true, deterministic: false, priority: 10, context_window: 2048, trust_domain: 'retrieval', capabilities: ['repository-fact-finding', 'structured-extraction'], available: true, provider: qwen.provider, model_identity: qwen.observed_identity, ownership: qwen.ownership });
registry.register({ id: 'kad-local-world-external', local: true, priority: 0, context_window: 4096, trust_domain: 'world', capabilities: ['world-generation'], available: true, provider: 'kad-local-world', ownership: 'EXTERNAL' });
const controllerPolicy = JSON.parse(readFileSync(join(root, '.omp', 'controllers.json'), 'utf8'));
const economicControllerRoute = routeEconomically({ requirement: { trust_domain: 'control', capabilities: ['decomposition'] }, lanes: controllerPolicy.lanes, policy: createEconomicPolicy(), now: Date.now(), queued_work: true });
if (economicControllerRoute.status !== 'ROUTED') throw new Error(`economic controller route unavailable: ${economicControllerRoute.reason_codes.join(',')}`);
const selectedControllerDefinition = controllerPolicy.lanes.find(lane => lane.lane_id === economicControllerRoute.selected_lane || lane.id === economicControllerRoute.selected_lane);
const controller = {
  lanes: [selectedControllerDefinition],
  economic_route: economicControllerRoute,
  execute: async normalized => {
    const manifest = { task_id: normalized.task_id, role: normalized.role, capability: normalized.capability, trust_domain: normalized.trust_domain, source_paths: normalized.source_paths, max_facts: normalized.max_facts, question: normalized.question };
    const selectedController = selectControllerLane(controller.lanes).selected_lane;
    const result = await runPiController(`You are the semantic controller for KAD. Do not use tools. Decompose this one bounded retrieval request into a JSON plan only. Preserve the listed source_paths and capability; do not add paths. Return exactly {"capability":"repository-fact-finding","source_paths":["tools/kad/local-router.mjs"],"question":"...","max_facts":1}. Request=${JSON.stringify(manifest)}`, selectedController);
    if (!result.plan) throw new Error(`controller returned no JSON plan (exit ${result.exitCode})`);
    return { plan: result.plan, telemetry: result.telemetry };
  },
  consume: async ({ request: consumedRequest, result: workerResult }) => {
    const selectedController = selectControllerLane(controller.lanes).selected_lane;
    const result = await runPiController(`You are the semantic controller for KAD. Consume this already validated local result. Do not re-evaluate authority or add facts. Return exactly {"consumed":true,"task_id":"${consumedRequest.task_id}"}. RESULT=${JSON.stringify(workerResult)}`, selectedController);
    return { consumed: result.plan?.consumed === true && result.plan?.task_id === consumedRequest.task_id, telemetry: result.telemetry };
  }
};
const worker = {
  resource_id: 'kad-local-retrieval-amdy',
  execute: async packet => {
    const repair = packet.repair ? ` Previous validation errors were ${JSON.stringify(packet.repair.previous_errors)}. Repair exactly those errors. The fact key MUST be claim (never rule), task_id MUST equal ${packet.task_id}, and output MUST be raw JSON with no markdown fences.` : '';
    const prompt = `You are a bounded KAD retrieval worker. Do not use tools. Read only this packet and return raw JSON, no markdown, no explanation. Use exactly these keys: task_id, facts, unknowns, conflicts. Each fact MUST use exactly claim, source_path, evidence. Do not use a rule key. At most ${packet.limits.max_facts} fact. Evidence must be an exact substring of a packet source.${repair} PACKET=${JSON.stringify(packet)}`;
    const result = await runLocalPiChild({ cwd: root, agentDir: join(root, '.pi', 'agent'), model: 'kad-local-qwen/qwen-local', task: prompt });
    return { output: result.output, telemetry: { input_tokens: result.usage.input || null, output_tokens: result.usage.output || null, latency_ms: result.wall_ms, provider: result.provider, model: result.model } };
  }
};
const events = [];
const result = await executeSwarm({ request, sources: [{ path: request.source_paths[0], content: readFileSync(join(root, request.source_paths[0]), 'utf8') }], controller, registry, worker, max_repairs: 1, emit: event => events.push(event) });
const run = { workpackage: 'WP-KAD-SWARM-001', task_id: taskId, preflight_status: preflight.status, status: result.status, request: result.request, packet: result.packet, controller: result.controller, worker: result.worker, validation: result.validation, telemetry: result.telemetry, events: result.events, episode: result.episode };
writeFileSync(join(evidence, 'real-swarm-run.json'), JSON.stringify(run, null, 2) + '\n');
writeFileSync(join(evidence, 'real-swarm-run-receipt.json'), canonicalSwarmReceipt(result) + '\n');
writeFileSync(join(evidence, 'episode.json'), JSON.stringify(result.episode, null, 2) + '\n');
writeFileSync(join(evidence, 'controller-routing.json'), JSON.stringify({ selected: result.telemetry.route, policy: 'semantic-role controller; approved non-PAYG subscription-backed lane', observed_auth: 'ready', cost_claim: 'UNKNOWN' }, null, 2) + '\n');
writeFileSync(join(evidence, 'token-telemetry.jsonl'), JSON.stringify({ task_id: taskId, controller_invocations: result.telemetry.controller_invocations, remote_lane: result.telemetry.remote_lane, remote_input_tokens: result.telemetry.remote_input_tokens, remote_output_tokens: result.telemetry.remote_output_tokens, remote_cost: result.telemetry.remote_cost, local_invocations: result.telemetry.local_invocations, local_resource: result.worker?.resource_id ?? null, context_bytes: result.telemetry.context_bytes, repairs: result.telemetry.repairs, escalations: result.telemetry.escalations, accepted: result.telemetry.accepted, latency_ms: result.telemetry.latency_ms }) + '\n');
await result.dispose();
const after = inspectPreflight({ root });
writeFileSync(join(evidence, 'preflight-after-worker.json'), JSON.stringify(after, null, 2) + '\n');
console.log(JSON.stringify({ status: result.status, controller: result.controller?.lane, validation: result.validation, telemetry: result.telemetry, worker_provider: result.worker?.provider, preflight_after: after.status }, null, 2));
process.exitCode = result.status === 'ACCEPTED' ? 0 : 2;
