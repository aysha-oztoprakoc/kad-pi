import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { CapabilityRegistry } from './local-router.mjs';
import { compileResourceAwareTaskPacket } from './context-compiler.mjs';
import { preflightResourceContract } from './resource-contract.mjs';

export const RESOURCE_STATES = Object.freeze(['AVAILABLE', 'ACTIVATING', 'ACTIVE', 'BUSY', 'RELEASING', 'UNAVAILABLE', 'DEGRADED']);
export const ACCEPTANCE_STATES = Object.freeze({ ACCEPTED: 'ACCEPTED', REJECTED: 'REJECTED', DEFERRED: 'DEFERRED' });
const QUALIFIED_CAPABILITIES = new Set(['repository-fact-finding', 'structured-extraction', 'world-simulation']);
const EPISTEMIC_CLASSES = new Set(['SOURCE_DERIVED', 'DESIGN_DECISION', 'HYPOTHESIS', 'EXPERIMENT', 'OBSERVED', 'UNKNOWN']);

function now() { return Date.now(); }
function iso() { return new Date().toISOString(); }
function finite(value) { return Number.isFinite(value) ? value : null; }
function clone(value) { return JSON.parse(JSON.stringify(value)); }

export function createTaskContract(input = {}) {
  const required = ['task_id', 'requested_capability', 'trust_domain', 'input_reference', 'expected_output_schema', 'max_runtime', 'resource_policy', 'evidence_requirements'];
  for (const key of required) if (input[key] === undefined || input[key] === null || input[key] === '') throw new Error(`${key} is required`);
  if (typeof input.task_id !== 'string' || !/^[-\w:.]+$/.test(input.task_id)) throw new Error('task_id must be a stable identifier');
  if (typeof input.requested_capability !== 'string') throw new Error('requested_capability must be a string');
  if (typeof input.trust_domain !== 'string' || !input.trust_domain.trim()) throw new Error('trust_domain must be a non-empty string');
  if (!Number.isFinite(input.max_runtime) || input.max_runtime <= 0) throw new Error('max_runtime must be positive');
  if (!input.expected_output_schema || typeof input.expected_output_schema !== 'object' || Array.isArray(input.expected_output_schema)) throw new Error('expected_output_schema must be an object');
  if (!Array.isArray(input.evidence_requirements)) throw new Error('evidence_requirements must be an array');
  return Object.freeze({
    task_id: input.task_id,
    requested_capability: input.requested_capability,
    trust_domain: input.trust_domain,
    input_reference: clone(input.input_reference),
    expected_output_schema: clone(input.expected_output_schema),
    max_runtime: Math.floor(input.max_runtime),
    resource_policy: clone(input.resource_policy),
    evidence_requirements: [...input.evidence_requirements],
  });
}

export function decomposeTaskRequests(requests) {
  if (!Array.isArray(requests) || requests.length === 0) throw new Error('task requests must be a non-empty array');
  return requests.map(request => createTaskContract(request));
}

export class ResultEnvelope {
  constructor({ task, resource_id, model_identity, capability, trust_domain, output = null, evidence = [], runtime_status, epistemic_class = 'UNKNOWN', error = null, runtime_ms = null, resource_ownership = 'UNKNOWN' }) {
    if (!task?.task_id || !resource_id || !capability || !trust_domain) throw new Error('result envelope identity is incomplete');
    if (!EPISTEMIC_CLASSES.has(epistemic_class)) throw new Error(`invalid epistemic class: ${epistemic_class}`);
    this.task_id = task.task_id;
    this.resource_id = resource_id;
    this.model_identity = model_identity ?? 'UNKNOWN';
    this.capability = capability;
    this.trust_domain = trust_domain;
    this.output = output;
    this.evidence = Array.isArray(evidence) ? evidence : [];
    this.runtime_status = runtime_status;
    this.epistemic_class = epistemic_class;
    this.error = error;
    this.runtime_ms = finite(runtime_ms);
    this.resource_ownership = resource_ownership;
    Object.freeze(this);
  }
}

function resourceFits(task, resource) {
  const policy = task.resource_policy ?? {};
  const promptTokens = Number.isFinite(policy.compiled_prompt_tokens) ? policy.compiled_prompt_tokens : null;
  const outputReserve = Number.isFinite(policy.required_output_reserve) ? policy.required_output_reserve : null;
  const admission = preflightResourceContract({
    resource,
    required_prompt_tokens: promptTokens,
    required_output_reserve: outputReserve,
    requested_output_tokens: outputReserve,
  });
  const requirementKnown = promptTokens !== null && outputReserve !== null;
  return {
    compiled_prompt_tokens: promptTokens,
    required_output_reserve: outputReserve,
    effective_context_window: admission.contract.effective_context_window,
    effective_max_output_tokens: admission.contract.effective_max_output_tokens,
    fits: requirementKnown && admission.ok,
    reason: requirementKnown ? admission.reason : 'RESOURCE_REQUIREMENT_UNKNOWN',
  };
}
function compileTaskPacket(task, resource) {
  const policy = task.resource_policy ?? {};
  const reference = task.input_reference && typeof task.input_reference === 'object' ? task.input_reference : {};
  return compileResourceAwareTaskPacket({
    request: {
      task_id: task.task_id,
      capability: task.requested_capability,
      trust_domain: task.trust_domain,
      question: reference.question ?? String(task.input_reference),
      source_paths: Array.isArray(reference.source_paths) ? reference.source_paths : [],
      max_facts: Number.isInteger(reference.max_facts) ? reference.max_facts : 1,
      budget: { max_input_tokens: policy.compiled_prompt_tokens, max_output_tokens: policy.required_output_reserve },
    },
    sources: Array.isArray(reference.sources) ? reference.sources : [],
    selectors: Array.isArray(reference.selectors) ? reference.selectors : undefined,
    resource_contract: resource,
    output_reserve: policy.required_output_reserve,
    requested_output_tokens: policy.required_output_reserve,
  });
}

export class ResourceRegistry {
  #router = new CapabilityRegistry();
  #resources = new Map();
  #observations = [];
  register(resource) {
    if (!resource?.id || !resource.provider || !resource.trust_domain || !Array.isArray(resource.capabilities) || resource.capabilities.length === 0) throw new Error('resource id, provider, trust_domain, and capabilities are required');
    const normalized = {
      ...resource,
      resource_id: resource.id,
      state: resource.state ?? 'AVAILABLE',
      available: resource.available !== false,
      ownership: resource.ownership ?? 'OWNED',
      effective_context_window: resource.effective_context_window ?? resource.context_window ?? null,
      effective_max_output_tokens: resource.effective_max_output_tokens ?? resource.max_output_tokens ?? null,
      context_window: resource.context_window ?? resource.effective_context_window ?? null,
    };
    if (!RESOURCE_STATES.includes(normalized.state)) throw new Error(`invalid resource state: ${normalized.state}`);
    if (normalized.trust_domain === 'world' && normalized.capabilities.some(capability => capability !== 'world-simulation')) throw new Error('world resource cannot register non-world capability');
    if (normalized.trust_domain === 'retrieval' && normalized.capabilities.includes('world-simulation')) throw new Error('retrieval resource cannot register world capability');
    this.#resources.set(resource.id, normalized);
    this.#router.register(normalized);
  }

  route(task) {
    if (!QUALIFIED_CAPABILITIES.has(task?.requested_capability)) return { status: 'REJECT', reason: 'UNKNOWN_CAPABILITY', candidates: [] };
    const matching = [...this.#resources.values()].filter(resource => resource.trust_domain === task.trust_domain && resource.capabilities.includes(task.requested_capability));
    const available = matching.filter(resource => resource.available && resource.state === 'AVAILABLE');
    const fits = available.map(resource => ({ resource, contract: resourceFits(task, resource) }));
    const eligible = fits.filter(candidate => candidate.contract.fits);
    if (!eligible.length) {
      const reason = !matching.length ? 'TRUST_DOMAIN_MISMATCH' : !available.length ? 'RESOURCE_UNAVAILABLE' : 'RESOURCE_CONTRACT_MISMATCH';
      return { status: matching.length ? 'DEFER' : 'REJECT', reason, candidates: matching.map(resource => resource.id) };
    }
    eligible.sort((a, b) => (a.resource.priority ?? 0) - (b.resource.priority ?? 0) || a.resource.id.localeCompare(b.resource.id));
    return { status: 'ROUTED', resource_id: eligible[0].resource.id, contract: eligible[0].contract, candidates: eligible.map(candidate => candidate.resource.id) };
  }

  setState(id, state, reason = 'observed state change') {
    if (!RESOURCE_STATES.includes(state)) throw new Error(`invalid resource state: ${state}`);
    const resource = this.#resources.get(id);
    if (!resource) return false;
    resource.state = state;
    resource.available = state === 'AVAILABLE' || state === 'ACTIVE';
    resource.state_reason = reason;
    this.#router.setAvailability(id, resource.available, reason);
    this.#observations.push({ timestamp: iso(), resource_id: id, state, reason });
    return true;
  }

  restore(snapshot = []) {
    if (!Array.isArray(snapshot)) return 0;
    let restored = 0;
    for (const persisted of snapshot) {
      const resource = this.#resources.get(persisted?.id);
      if (!resource || !RESOURCE_STATES.includes(persisted.state)) continue;
      resource.state = persisted.state;
      resource.available = persisted.available !== false && (persisted.state === 'AVAILABLE' || persisted.state === 'ACTIVE');
      resource.state_reason = persisted.state_reason ?? 'recovered';
      this.#router.setAvailability(resource.id, resource.available, resource.state_reason);
      restored += 1;
    }
    return restored;
  }

  resource(id) { const resource = this.#resources.get(id); return resource ? { ...resource } : null; }
  snapshot() { return [...this.#resources.values()].map(resource => ({ ...resource })); }
  observations() { return this.#observations.map(observation => ({ ...observation })); }
}

export function createResourceRegistry(resources = []) {
  if (!Array.isArray(resources)) throw new Error('resources must be an array');
  const registry = new ResourceRegistry();
  for (const resource of resources) registry.register(resource);
  return registry;
}


export class AcceptanceGate {
  accept(task, result, resource) {
    const errors = [];
    if (!(result instanceof ResultEnvelope)) errors.push('result is not a ResultEnvelope');
    if (result?.task_id !== task.task_id) errors.push('task_id mismatch');
    if (result?.resource_id !== resource?.id) errors.push('resource identity mismatch');
    if (result?.capability !== task.requested_capability) errors.push('capability mismatch');
    if (result?.trust_domain !== task.trust_domain) errors.push('trust-domain mismatch');
    if (result?.runtime_status !== 'COMPLETED') errors.push(result?.error ?? 'worker did not complete');
    if (!result?.output || typeof result.output !== 'object' || Array.isArray(result.output)) errors.push('output schema is malformed');
    for (const key of task.expected_output_schema?.required ?? []) if (!(key in (result?.output ?? {}))) errors.push(`output field missing: ${key}`);
    if (!Array.isArray(result?.evidence) || result.evidence.length === 0) errors.push('evidence is missing');
    return { accepted: errors.length === 0, errors };
  }
}

function event(type, task_id, data = {}) { return { type, task_id, timestamp: iso(), ...data }; }

export class SwarmCoordinator {
  #workers = new Map();
  #completed = [];
  #events = [];
  #statePath;
  #tasksTotal = null;
  #gate;
  #telemetryPath;

  constructor({ registry, statePath = null, telemetryPath = null, gate = new AcceptanceGate(), emit = () => {} } = {}) {
    if (!registry) throw new Error('registry is required');
    this.registry = registry;
    this.#statePath = statePath;
    this.#telemetryPath = telemetryPath;
    this.#gate = gate;
    if (statePath) {
      const recovered = SwarmCoordinator.recover(statePath);
      this.registry.restore(recovered.resources);
      this.#completed = Array.isArray(recovered.completed_task_ids) ? [...new Set(recovered.completed_task_ids)] : [];
      this.#events = Array.isArray(recovered.events) ? recovered.events : [];
      this.#tasksTotal = Number.isFinite(recovered.tasks_total) ? recovered.tasks_total : null;
    }
    this.emit = notification => { this.#events.push(notification); emit(notification); };
  }

  registerWorker(worker) {
    if (!worker?.resource_id || typeof worker.execute !== 'function') throw new Error('worker resource_id and execute are required');
    this.#workers.set(worker.resource_id, worker);
  }

  async run(taskInput) {
    const task = taskInput.task_id ? taskInput : createTaskContract(taskInput);
    this.emit(event('TASK_REQUESTED', task.task_id, { capability: task.requested_capability, trust_domain: task.trust_domain }));
    const route = this.registry.route(task);
    this.emit(event('CAPABILITY_MATCHED', task.task_id, route));
    if (route.status === 'REJECT') return this.#finish(task, { acceptance: ACCEPTANCE_STATES.REJECTED, runtime_status: 'REJECTED', error: route.reason, route });
    if (route.status !== 'ROUTED') return this.#finish(task, { acceptance: ACCEPTANCE_STATES.DEFERRED, runtime_status: 'DEFERRED', error: route.reason, route });
    const worker = this.#workers.get(route.resource_id);
    const resource = this.registry.resource(route.resource_id);
    if (!worker || !resource) return this.#finish(task, { acceptance: ACCEPTANCE_STATES.REJECTED, runtime_status: 'REJECTED', error: 'WORKER_NOT_REGISTERED', route });
    let packet;
    try {
      packet = compileTaskPacket(task, resource);
    } catch (error) {
      return this.#finish(task, { acceptance: ACCEPTANCE_STATES.DEFERRED, runtime_status: 'DEFERRED', error: error instanceof Error ? error.message : String(error), route, resource_id: resource.id });
    }
    if (packet.resource_fit !== 'PASS') return this.#finish(task, { acceptance: ACCEPTANCE_STATES.DEFERRED, runtime_status: 'DEFERRED', error: packet.fit?.code ?? 'RESOURCE_CONTRACT_MISMATCH', route: { ...route, status: 'DEFER', packet_sha256: packet.packet_sha256 }, resource_id: resource.id });
    route.packet_sha256 = packet.packet_sha256;
    const executionTask = { ...task, compiled_packet: packet };
    this.registry.setState(resource.id, 'BUSY', 'task acquired');
    this.emit(event('RESOURCE_ACTIVATED', task.task_id, { resource_id: resource.id }));
    let result;
    try {
      result = await worker.execute(executionTask);
      const validation = this.#gate.accept(task, result, resource);
      if (validation.accepted) {
        if (!this.#completed.includes(task.task_id)) this.#completed.push(task.task_id);
        return this.#finish(task, { acceptance: ACCEPTANCE_STATES.ACCEPTED, runtime_status: result.runtime_status, result, validation, route, resource_id: resource.id });
      }
      return this.#finish(task, { acceptance: ACCEPTANCE_STATES.REJECTED, runtime_status: result.runtime_status, result, validation, route, resource_id: resource.id });
    } catch (error) {
      result = new ResultEnvelope({ task, resource_id: resource.id, model_identity: resource.model_identity, capability: task.requested_capability, trust_domain: task.trust_domain, runtime_status: 'REJECTED', epistemic_class: 'UNKNOWN', error: error instanceof Error ? error.message : String(error) });
      this.emit(event('INFERENCE_COMPLETED', task.task_id, { resource_id: resource.id, runtime_status: result.runtime_status }));
      const validation = this.#gate.accept(task, result, resource);
      return this.#finish(task, { acceptance: ACCEPTANCE_STATES.REJECTED, runtime_status: result.runtime_status, result, validation, route, resource_id: resource.id });
    } finally {
      this.emit(event('RESOURCE_RELEASED', task.task_id, { resource_id: resource.id, ownership: resource.ownership }));
      const releaseState = result?.runtime_status === 'COMPLETED' ? 'AVAILABLE' : 'DEGRADED';
      this.registry.setState(resource.id, releaseState, releaseState === 'AVAILABLE' ? 'task released' : 'worker execution degraded');
      this.#persist();
    }
  }

  async runAll(tasks) {
    this.#tasksTotal = tasks.length;
    this.#persist();
    const results = [];
    for (const task of tasks) results.push(await this.run(task));
    return results;
  }

  #finish(task, result) {
    const output = { task_id: task.task_id, schedule: 'TIME_MULTIPLEXED', ...result, events: this.#events.filter(item => item.task_id === task.task_id) };
    if (this.#telemetryPath) appendSwarmTelemetry(this.#telemetryPath, {
      task_id: task.task_id,
      acceptance: result.acceptance,
      runtime_status: result.runtime_status,
      resource_id: result.resource_id ?? null,
      route_status: result.route?.status ?? null,
      route_reason: result.route?.reason ?? null,
      timestamp: iso(),
    });
    this.#persist();
    return output;
  }

  #persist() {
    if (!this.#statePath) return;
    mkdirSync(dirname(this.#statePath), { recursive: true });
    writeFileSync(this.#statePath, `${JSON.stringify({ schema_version: 'kad-swarm-state-v1', status: 'ACTIVE', schedule: 'TIME_MULTIPLEXED', tasks_completed: this.#completed.length, tasks_total: this.#tasksTotal, completed_task_ids: this.#completed, resources: this.registry.snapshot(), events: this.#events.slice(-100) }, null, 2)}\n`);
  }

  snapshot() { return { completed_task_ids: [...this.#completed], events: this.#events.map(clone), resources: this.registry.snapshot() }; }
  static recover(statePath) {
    if (!existsSync(statePath)) return { completed_task_ids: [], events: [], resources: [] };
    try { return JSON.parse(readFileSync(statePath, 'utf8')); } catch { return { completed_task_ids: [], events: [], resources: [], recovery_error: 'MALFORMED_STATE' }; }
  }
}

export function aggregateSwarmResults(results, { required_trust_domains = [] } = {}) {
  if (!Array.isArray(results)) throw new Error('results must be an array');
  const accepted = results.filter(result => result?.acceptance === ACCEPTANCE_STATES.ACCEPTED);
  const trustDomains = [...new Set(accepted.map(result => result.result?.trust_domain).filter(Boolean))];
  return {
    accepted_results: accepted.length,
    trust_domains: trustDomains,
    trust_domains_separate: trustDomains.length === accepted.length,
    complete: required_trust_domains.every(domain => trustDomains.includes(domain)),
    model_vote_used: false,
    results: accepted,
  };

}
export function appendSwarmTelemetry(path, entry) {
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, `${JSON.stringify({ timestamp: iso(), ...entry })}\n`, 'utf8');
}
