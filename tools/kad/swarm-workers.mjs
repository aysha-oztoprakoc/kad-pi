import { ResultEnvelope } from './swarm-control-plane.mjs';

function now() { return Date.now(); }

function raceWithTimeout(work, timeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Object.assign(new Error(`worker timed out after ${timeout}ms`), { code: 'WORKER_TIMEOUT' })), timeout);
    Promise.resolve().then(work).then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
}
function remaining(deadline) { return Math.max(0, deadline - now()); }

function workerEnvelope(worker, task, fields) {
  const capability = fields.capability ?? (worker.capabilities?.includes(task.requested_capability) ? task.requested_capability : worker.capability);
  return new ResultEnvelope({ task, resource_id: worker.resource_id, model_identity: worker.model_identity, capability, trust_domain: worker.trust_domain, resource_ownership: worker.ownership, ...fields });
}

function validateWorkerTask(worker, task) {
  const capabilities = worker.capabilities ?? [worker.capability];
  if (!capabilities.includes(task.requested_capability) || task.trust_domain !== worker.trust_domain) return `worker cannot satisfy ${task.requested_capability}/${task.trust_domain}`;
  return null;
}

export function createQwenRetrievalWorker({ capability: lifecycleCapability = null, resource_id, activate = lifecycleCapability?.activate?.bind(lifecycleCapability), invoke, release = lifecycleCapability?.dispose?.bind(lifecycleCapability), expected_model_identity, supported_capabilities = ['repository-fact-finding'], trust_domain = 'retrieval', ownership = 'OWNED' } = {}) {
  if (!resource_id || !Array.isArray(supported_capabilities) || supported_capabilities.length === 0 || typeof activate !== 'function' || typeof invoke !== 'function' || typeof release !== 'function') throw new Error('Qwen worker requires resource_id, supported_capabilities, activate, invoke, and release');
  return {
    resource_id, capabilities: supported_capabilities, capability: supported_capabilities[0], trust_domain, ownership,
    async execute(task) {
      const started = now();
      const deadline = started + task.max_runtime;
      const mismatch = validateWorkerTask(this, task);
      if (mismatch) return workerEnvelope(this, task, { runtime_status: 'REJECTED', epistemic_class: 'UNKNOWN', error: 'TRUST_DOMAIN_OR_CAPABILITY_MISMATCH', runtime_ms: now() - started });
      let activationStarted = false;
      try {
        activationStarted = true;
        const activation = await raceWithTimeout(() => activate(task), remaining(deadline));
        const modelIdentity = activation?.model_identity ?? 'UNKNOWN';
        if (!modelIdentity.toLowerCase().includes(String(expected_model_identity).toLowerCase())) return workerEnvelope({ ...this, model_identity: modelIdentity }, task, { runtime_status: 'IDENTITY_MISMATCH', epistemic_class: 'UNKNOWN', error: 'WRONG_MODEL_IDENTITY', runtime_ms: now() - started });
        const output = await raceWithTimeout(() => invoke(task, activation), remaining(deadline));
        if (!output || typeof output !== 'object' || Array.isArray(output)) return workerEnvelope({ ...this, model_identity: modelIdentity }, task, { runtime_status: 'MALFORMED', epistemic_class: 'UNKNOWN', error: 'MALFORMED_OUTPUT', runtime_ms: now() - started });
        return workerEnvelope({ ...this, model_identity: modelIdentity }, task, { output, evidence: output.evidence, runtime_status: 'COMPLETED', epistemic_class: 'OBSERVED', runtime_ms: now() - started });
      } catch (error) {
        return workerEnvelope(this, task, { runtime_status: error.code === 'WORKER_TIMEOUT' ? 'TIMEOUT' : 'UNAVAILABLE', epistemic_class: 'UNKNOWN', error: error.code === 'WORKER_TIMEOUT' ? 'WORKER_TIMEOUT' : error.message, runtime_ms: now() - started });
      } finally {
        if (activationStarted) {
          try { await raceWithTimeout(() => release(task), remaining(deadline)); } catch {}
        }
      }
    },
  };
}

export function createSthenoWorldWorker({ resource_id, model_identity, invoke, capability = 'world-simulation', trust_domain = 'world', ownership = 'EXTERNAL' } = {}) {
  if (!resource_id || !model_identity || typeof invoke !== 'function') throw new Error('Stheno worker requires resource_id, model_identity, and invoke');
  return {
    resource_id, model_identity, capability, trust_domain, ownership,
    async execute(task) {
      const started = now();
      const deadline = started + task.max_runtime;
      const mismatch = validateWorkerTask(this, task);
      if (mismatch) return workerEnvelope(this, task, { runtime_status: 'REJECTED', epistemic_class: 'UNKNOWN', error: 'TRUST_DOMAIN_OR_CAPABILITY_MISMATCH', runtime_ms: now() - started });
      try {
        const output = await raceWithTimeout(() => invoke(task), remaining(deadline));
        if (!output || typeof output !== 'object' || Array.isArray(output)) return workerEnvelope(this, task, { runtime_status: 'MALFORMED', epistemic_class: 'UNKNOWN', error: 'MALFORMED_OUTPUT', runtime_ms: now() - started });
        return workerEnvelope(this, task, { output, evidence: output.evidence, runtime_status: 'COMPLETED', epistemic_class: 'OBSERVED', runtime_ms: now() - started });
      } catch (error) {
        return workerEnvelope(this, task, { runtime_status: error.code === 'WORKER_TIMEOUT' ? 'TIMEOUT' : 'UNAVAILABLE', epistemic_class: 'UNKNOWN', error: error.code === 'WORKER_TIMEOUT' ? 'WORKER_TIMEOUT' : error.message, runtime_ms: now() - started });
      }
    },
  };
}
