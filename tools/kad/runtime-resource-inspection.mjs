import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const SECRET_PATTERNS = [/api[-_]?key/i, /token/i, /authorization/i, /secret/i, /password/i];
const KNOWN_FLAGS_WITH_VALUES = new Set(['--model', '--contextsize', '--ctx-size', '--batchsize', '--threads', '--host', '--port', '--gpulayers']);

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function sanitizeArgv(argv = []) {
  const out = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = String(argv[i]);
    out.push(arg);
    if (arg.startsWith('--') && SECRET_PATTERNS.some(pattern => pattern.test(arg)) && i + 1 < argv.length) {
      i += 1;
      out.push('[REDACTED]');
    }
  }
  return out;
}

function valueAfter(argv, names) {
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    for (const name of names) {
      if (arg === name && i + 1 < argv.length) return argv[i + 1];
      if (arg.startsWith(`${name}=`)) return arg.slice(name.length + 1);
    }
  }
  return null;
}

function numberAfter(argv, names) {
  const value = valueAfter(argv, names);
  const number = value === null ? NaN : Number(value);
  return Number.isFinite(number) ? number : null;
}

export function parseKoboldRuntimeArgv(argv = []) {
  return {
    executable: argv[0] ?? null,
    model_path: valueAfter(argv, ['--model']),
    context_window: numberAfter(argv, ['--contextsize', '--ctx-size', '-c', '-ctx']),
    batch_size: numberAfter(argv, ['--batchsize', '--batch-size']),
    threads: numberAfter(argv, ['--threads', '-t']),
    host: valueAfter(argv, ['--host']),
    port: numberAfter(argv, ['--port']),
    gpu_layers: numberAfter(argv, ['--gpulayers', '--gpu-layers']),
    cpu_mode: argv.includes('--usecpu'),
    skiplauncher: argv.includes('--skiplauncher'),
    generation_ceiling: numberAfter(argv, ['--max-length', '--max-tokens', '--n-predict']),
  };
}

export function observeProcessArgv({ pid, argv = null, observed_at = new Date().toISOString() } = {}) {
  if (!pid) throw new Error('pid is required');
  const rawArgv = argv ?? readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0').filter(Boolean);
  const sanitized_argv = sanitizeArgv(rawArgv);
  const parsed = parseKoboldRuntimeArgv(sanitized_argv);
  return {
    pid,
    observed_at,
    argv_sha256: sha256(sanitized_argv.join('\0')),
    sanitized_argv,
    parsed,
    fields: {
      context_window: { value: parsed.context_window, class: parsed.context_window === null ? 'UNKNOWN' : 'OBSERVED_RUNTIME' },
      generation_ceiling: { value: parsed.generation_ceiling, class: parsed.generation_ceiling === null ? 'UNKNOWN' : 'OBSERVED_RUNTIME' },
      threads: { value: parsed.threads, class: parsed.threads === null ? 'UNKNOWN' : 'OBSERVED_RUNTIME' },
      batch_size: { value: parsed.batch_size, class: parsed.batch_size === null ? 'UNKNOWN' : 'OBSERVED_RUNTIME' },
      cpu_mode: { value: parsed.cpu_mode, class: 'OBSERVED_RUNTIME' },
      gpu_layers: { value: parsed.gpu_layers, class: parsed.gpu_layers === null ? 'UNKNOWN' : 'OBSERVED_RUNTIME' },
      model_path: { value: parsed.model_path, class: parsed.model_path === null ? 'UNKNOWN' : 'OBSERVED_RUNTIME' },
      port: { value: parsed.port, class: parsed.port === null ? 'UNKNOWN' : 'OBSERVED_RUNTIME' },
    },
  };
}

export function runtimeEvidenceContract({ resource, processObservation, transportOutputCap }) {
  const context = processObservation?.parsed?.context_window ?? null;
  return {
    resource_id: resource.resource_id,
    trust_domain: resource.trust_domain,
    capabilities: [...(resource.capabilities ?? [])],
    effective_context_window: context,
    effective_max_output_tokens: transportOutputCap ?? null,
    evidence: [processObservation?.argv_sha256 ? `process-argv:${processObservation.argv_sha256}` : null].filter(Boolean),
    confidence: context === null ? 'PARTIAL' : 'OBSERVED_RUNTIME',
  };
}

export function zeroInferenceLedger(input = {}) {
  return {
    completion_requests: input.completion_requests ?? 0,
    chat_completion_requests: input.chat_completion_requests ?? 0,
    controller_calls: input.controller_calls ?? 0,
    remote_tokens: input.remote_tokens ?? 0,
    local_generation_calls: input.local_generation_calls ?? 0,
    inspected_endpoints: [...(input.inspected_endpoints ?? [])],
    NO_INFERENCE: [input.completion_requests ?? 0, input.chat_completion_requests ?? 0, input.controller_calls ?? 0, input.remote_tokens ?? 0, input.local_generation_calls ?? 0].every(value => value === 0) ? 'PROVEN' : 'UNKNOWN',
  };
}
