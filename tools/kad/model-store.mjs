import { createHash } from 'node:crypto';
import { closeSync, existsSync, lstatSync, openSync, readFileSync, readSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
export const MODEL_STORE_SCHEMA = 'kad-local-model-registry-1';

function repositoryRoot(start = process.cwd()) {
  let current = resolve(start);
  while (true) {
    if (existsSync(resolve(current, 'PRIME_DIRECTIVE.md'))) return current;
    const parent = dirname(current);
    if (parent === current) throw new Error('repository root not found');
    current = parent;
  }
}

export function resolveModelHome({ root = repositoryRoot(), env = process.env } = {}) {
  const configured = env?.KAD_MODEL_HOME?.trim();
  return resolve(configured || resolve(root, '.models'));
}

export function loadRegistry({ root = repositoryRoot(), registryPath } = {}) {
  const path = registryPath ? resolve(registryPath) : resolve(root, 'config', 'local-models.registry.json');
  const registry = JSON.parse(readFileSync(path, 'utf8'));
  if (registry.schema_version !== MODEL_STORE_SCHEMA || !Array.isArray(registry.models)) {
    throw new Error(`invalid model registry: ${path}`);
  }
  const ids = new Set();
  for (const model of registry.models) {
    if (!model?.id || ids.has(model.id)) throw new Error(`invalid or duplicate model ID: ${model?.id ?? 'UNKNOWN'}`);
    if (typeof model.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(model.sha256)) {
      throw new Error(`invalid sha256 for ${model.id ?? 'UNKNOWN'}`);
    }
    if (!model.relative_path || model.relative_path.startsWith('/') || model.relative_path.split('/').includes('..')) {
      throw new Error(`invalid relative_path for ${model.id}`);
    }
    ids.add(model.id);
  }
  return registry;
}

function entryFor(modelId, options) {
  const registry = loadRegistry(options);
  const entry = registry.models.find(model => model.id === modelId);
  if (!entry) throw new Error(`unknown model ID: ${modelId}`);
  return entry;
}

function safePath(entry, options) {
  const modelHome = resolveModelHome(options);
  const path = resolve(modelHome, entry.relative_path);
  const rel = relative(modelHome, path);
  if (!rel || rel.startsWith(`..${sep}`) || rel === '..' || rel.split(sep).includes('..')) {
    throw new Error(`model path escapes KAD_MODEL_HOME: ${entry.id}`);
  }
  let current = modelHome;
  for (const segment of entry.relative_path.split('/')) {
    current = resolve(current, segment);
    try {
      if (lstatSync(current).isSymbolicLink()) throw new Error(`model path contains a symlink: ${current}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      break;
    }
  }
  return { path, exists: existsSync(path) };
}

function resolveEntry(entry, options) {
  const resolved = safePath(entry, options);
  return { ...entry, ...resolved, model_home: resolveModelHome(options) };
}

export function resolveModel(modelId, options = {}) {
  return resolveEntry(entryFor(modelId, options), options);
}

export function metadata(modelId, options = {}) {
  return resolveModel(modelId, options);
}

function sha256(path) {
  const digest = createHash('sha256');
  const file = openSync(path, 'r');
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  try {
    let bytesRead;
    do {
      bytesRead = readSync(file, buffer, 0, buffer.length, null);
      if (bytesRead > 0) digest.update(buffer.subarray(0, bytesRead));
    } while (bytesRead > 0);
  } finally {
    closeSync(file);
  }
  return digest.digest('hex');
}

export function verifyModel(modelId, options = {}) {
  const registry = loadRegistry(options);
  const entry = registry.models.find(model => model.id === modelId);
  if (!entry) return { id: modelId, state: 'MISSING', available: false, capability_state: 'UNAVAILABLE', reason: `unknown model ID: ${modelId}` };
  const model = resolveEntry(entry, options);
  if (!model.exists) return { ...model, state: 'MISSING', available: false, capability_state: 'UNAVAILABLE' };
  const observedSha256 = sha256(model.path);
  if (observedSha256 !== model.sha256) {
    return { ...model, observed_sha256: observedSha256, state: 'HASH_MISMATCH', available: false, capability_state: 'UNAVAILABLE', quarantine_required: true };
  }
  const duplicateIds = registry.models
    .filter(candidate => candidate.id !== model.id && candidate.sha256 && candidate.sha256 === observedSha256)
    .map(candidate => candidate.id);
  return { ...model, observed_sha256: observedSha256, state: model.qualification_state ?? 'UNKNOWN', available: true, capability_state: 'AVAILABLE', duplicate_ids: duplicateIds };
}

export function listModels(options = {}) {
  const registry = loadRegistry(options);
  return registry.models.map(entry => resolveEntry(entry, options));
}

export function candidates(options = {}) {
  return listModels(options).filter(model => model.qualification_state === 'UNKNOWN' || model.relative_path.includes('/candidates/'));
}