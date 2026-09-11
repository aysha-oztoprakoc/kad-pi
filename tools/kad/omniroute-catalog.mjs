/**
 * KAD OmniRoute Gateway Model Catalog Synchronization
 *
 * Deterministically snapshots the OpenAI-compatible model catalog exposed by the
 * local OmniRoute gateway (loopback transport only) into a hash-verifiable KAD
 * artifact, and projects the same catalog into the OMP `providers:` model map as a
 * single `omniroute` transport provider.
 *
 * The gateway is a transport, never a qualification authority: reachability is
 * OBSERVED, cost fields are written as zeros because the gateway publishes no
 * per-model prices, and an unreachable gateway degrades to the previous snapshot
 * instead of erasing it.
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/** Schema identifier for the deterministic gateway catalog snapshot. */
export const CATALOG_SCHEMA = 'kad-omniroute-catalog-1';

/** Loopback gateway base URL; overridable for remote/dev instances only. */
export const GATEWAY_BASE_URL = process.env.OMNIROUTE_BASE_URL || 'http://127.0.0.1:20128/v1';

/** Repository-relative catalog snapshot path. */
export const CATALOG_PATH = 'config/omniroute-catalog.json';

/** Repository-relative OMP provider map path. */
export const OMP_MODELS_PATH = '.omp/models.yml';

/** Repository-relative model-exposure policy path. */
export const EXPOSURE_PATH = 'config/omniroute-exposure.json';

/**
 * Version of the exposure-selection semantics in this module. Bump it whenever
 * `selectExposedModels` changes meaning, so `syncCatalog` cannot mistake a projection
 * made under the old rules for a current one — the policy file hash only covers the
 * policy, not the code that reads it.
 */
export const SELECTOR_VERSION = 2;

/**
 * Exposure policy of last resort, used only when the policy file is absent.
 * Mirrors config/omniroute-exposure.json: never widen beyond local, subscription
 * and explicitly free-tier ids.
 */
export const DEFAULT_EXPOSURE = Object.freeze({
  schema_version: 'kad-omniroute-exposure-1',
  policy: 'LOCAL_SUBSCRIPTION_AND_FREE_TIERS_ONLY',
  include_all_from: ['llama-cpp'],
  metered: [],
  include_free_tier_ids: true,
  free_tier_markers: [':free', '-free'],
  exclude_prefixes: ['auto/'],
  unlisted_providers: 'exclude'
});

/** Loads the KAD model-exposure policy, falling back to the conservative default. */
export function loadExposurePolicy(repoRoot) {
  const file = resolve(repoRoot, EXPOSURE_PATH);
  if (!existsSync(file)) return { policy: { ...DEFAULT_EXPOSURE }, source: null, hash: null };
  const text = readFileSync(file, 'utf8');
  const policy = JSON.parse(text);
  return { policy, source: EXPOSURE_PATH, hash: createHash('sha256').update(text).digest('hex') };
}

/** Provider prefix of a gateway model id (the first path segment). */
export function providerOf(modelId) {
  return String(modelId).split('/')[0];
}

/**
 * Model segment of a gateway id: everything after the provider prefix. Free-tier
 * markers are matched against this segment only, so a provider whose *name* ends in
 * `-free` cannot whitelist its entire catalog — `unlisted_providers: exclude` stays
 * binding.
 */
function modelSegmentOf(modelId) {
  const text = String(modelId);
  const slash = text.indexOf('/');
  return slash === -1 ? text : text.slice(slash + 1);
}

const hasFreeMarker = (id, markers) => {
  const segment = modelSegmentOf(id);
  return markers.some((marker) => segment.endsWith(marker));
};

/**
 * Selects which advertised gateway models KAD-PI is willing to expose.
 *
 * Evaluated in order, first match wins:
 *   1. an excluded prefix  -> exclude (the gateway's own `auto/*` routing combos are
 *      dropped first, because they select across upstreams the policy has not
 *      classified);
 *   2. a free-tier marker  -> include (a free-tier *model* id cannot fall back to a
 *      paid candidate, so it is safe even inside an otherwise-metered provider);
 *   3. a local/subscription provider -> include;
 *   4. anything else       -> exclude (`unlisted_providers: exclude`).
 *
 * Exclusions are authoritative: a marker may rescue a model, never a provider.
 * Bump SELECTOR_VERSION when these semantics change.
 *
 * The advertised catalog is recorded in full; only this projection reaches the
 * harness model list.
 */
export function selectExposedModels(modelIds, policy = DEFAULT_EXPOSURE) {
  const markers = Array.isArray(policy.free_tier_markers) ? policy.free_tier_markers : [];
  const includeAll = new Set(policy.include_all_from ?? []);
  const excludePrefixes = policy.exclude_prefixes ?? [];
  const allowFreeTier = policy.include_free_tier_ids !== false;

  return normalizeIds(modelIds).filter((id) => {
    if (excludePrefixes.some((prefix) => id.startsWith(prefix))) return false;
    if (allowFreeTier && markers.length && hasFreeMarker(id, markers)) return true;
    return includeAll.has(providerOf(id));
  });
}

const PROVIDER_NAME = 'omniroute';
/** Indentation of a provider key inside the top-level `providers:` map. */
const PROVIDER_INDENT = '  ';
/** Indentation of a model list entry (`- id:`) inside a provider's `models:` list. */
const MODEL_ENTRY_INDENT = '      ';
/** Indentation of a model entry's keys. */
const MODEL_KEY_INDENT = '        ';
/** Indentation of the nested cost map keys. */
const COST_KEY_INDENT = '          ';

/**
 * Computes the canonical catalog hash: SHA-256 over the sorted model ids joined by
 * newlines. Order of the input is irrelevant; the digest is over sorted ids.
 */
export function catalogHash(modelIds) {
  if (!Array.isArray(modelIds)) throw new Error('modelIds must be an array');
  return createHash('sha256').update([...modelIds].sort().join('\n')).digest('hex');
}

function normalizeIds(entries) {
  const ids = new Set();
  for (const entry of entries) {
    const id = typeof entry === 'string' ? entry : entry && typeof entry.id === 'string' ? entry.id : null;
    if (typeof id === 'string' && id.trim() !== '') ids.add(id);
  }
  return [...ids].sort();
}

function preview(text, limit = 200) {
  return String(text).replace(/\s+/g, ' ').trim().slice(0, limit);
}

/**
 * Fetches the live gateway catalog. GET <baseUrl>/models with the optional
 * `OMNIROUTE_API_KEY` bearer. Throws a descriptive Error on transport failure,
 * non-2xx status, unparsable body, or a body without a `data` array — callers
 * decide the degradation policy.
 */
export async function fetchCatalog({ baseUrl = GATEWAY_BASE_URL, fetchImpl = fetch } = {}) {
  const url = `${String(baseUrl).replace(/\/+$/, '')}/models`;
  const apiKey = process.env.OMNIROUTE_API_KEY;
  const headers = { accept: 'application/json' };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;

  let response;
  try {
    response = await fetchImpl(url, { headers });
  } catch (err) {
    const cause = err && err.cause && (err.cause.code || err.cause.message);
    throw new Error(`OmniRoute gateway unreachable at ${url}: ${err.message}${cause ? ` (${cause})` : ''}`);
  }

  const body = typeof response.text === 'function'
    ? await response.text()
    : JSON.stringify(await response.json());

  if (!response.ok) {
    throw new Error(`OmniRoute gateway ${url} returned HTTP ${response.status}: ${preview(body)}`);
  }

  let payload;
  try {
    payload = JSON.parse(body);
  } catch (err) {
    throw new Error(`OmniRoute gateway ${url} returned a non-JSON body: ${preview(body)}`);
  }

  if (!payload || !Array.isArray(payload.data)) {
    throw new Error(`OmniRoute gateway ${url} response carries no data[] model array: ${preview(body)}`);
  }

  return { model_ids: normalizeIds(payload.data), raw_count: payload.data.length };
}

/** Reads a catalog snapshot; returns null when the file does not exist. */
export function readCatalog(file) {
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, 'utf8'));
}

/** Writes a catalog snapshot as pretty JSON with a trailing newline. */
export function writeCatalog(file, catalog) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(catalog, null, 2)}\n`);
  return catalog;
}

/**
 * Renders the YAML fragment for the single `omniroute` OMP provider. Indentation
 * mirrors the existing `.omp/models.yml` provider blocks exactly.
 */
export function renderOmpModelsBlock(modelIds, { baseUrl = GATEWAY_BASE_URL } = {}) {
  const lines = [
    `${PROVIDER_INDENT}${PROVIDER_NAME}:`,
    `${PROVIDER_INDENT}  baseUrl: ${baseUrl}`,
    `${PROVIDER_INDENT}  apiKey: OMNIROUTE_API_KEY`,
    `${PROVIDER_INDENT}  api: openai-completions`,
    `${PROVIDER_INDENT}  auth: apiKey`,
    `${PROVIDER_INDENT}  models:`
  ];
  for (const id of normalizeIds(modelIds)) {
    lines.push(
      `${MODEL_ENTRY_INDENT}- id: ${id}`,
      `${MODEL_KEY_INDENT}name: ${id} (OmniRoute gateway)`,
      `${MODEL_KEY_INDENT}api: openai-completions`,
      `${MODEL_KEY_INDENT}input: [text]`,
      `${MODEL_KEY_INDENT}cost:`,
      `${COST_KEY_INDENT}input: 0`,
      `${COST_KEY_INDENT}output: 0`,
      `${COST_KEY_INDENT}cacheRead: 0`,
      `${COST_KEY_INDENT}cacheWrite: 0`,
      `${MODEL_KEY_INDENT}contextWindow: 128000`,
      `${MODEL_KEY_INDENT}maxTokens: 16384`
    );
  }
  return `${lines.join('\n')}\n`;
}

/** True when the OMP model map already carries the `omniroute` provider block. */
export function hasOmpModelsBlock(content) {
  return content.split('\n').some((line) => line === `${PROVIDER_INDENT}${PROVIDER_NAME}:`);
}

/**
 * Inserts or replaces the `omniroute:` provider block inside the top-level
 * `providers:` map, preserving every other provider verbatim. Idempotent: splicing
 * the same block twice returns byte-identical content.
 */
export function spliceOmpModelsBlock(content, block) {
  if (typeof content !== 'string' || content === '') throw new Error('.omp/models.yml content is empty');
  const lines = content.split('\n');
  const providersIdx = lines.findIndex((line) => /^providers:\s*$/.test(line));
  if (providersIdx === -1) throw new Error('.omp/models.yml has no top-level providers: map');
  const blockLines = block.replace(/\n$/, '').split('\n');
  if (blockLines.length === 0 || blockLines[0] === '') throw new Error('omniroute provider block is empty');

  const start = lines.findIndex((line, index) => index > providersIdx && line === `${PROVIDER_INDENT}${PROVIDER_NAME}:`);
  if (start === -1) {
    return [...lines.slice(0, providersIdx + 1), ...blockLines, ...lines.slice(providersIdx + 1)].join('\n');
  }

  let end = start + 1;
  while (end < lines.length && lines[end] !== '' && !/^ {2}\S/.test(lines[end]) && !/^\S/.test(lines[end])) end += 1;
  return [...lines.slice(0, start), ...blockLines, ...lines.slice(end)].join('\n');
}

/**
 * Synchronizes the gateway catalog and the OMP provider projection.
 *
 * Idempotent: when the recomputed `catalog_hash` matches the recorded one and the
 * OMP block is already present, nothing is written. An empty model list throws
 * before any write, so an unreachable or empty gateway can never erase the
 * previous snapshot.
 */
export async function syncCatalog({ repoRoot = process.cwd(), baseUrl = GATEWAY_BASE_URL, fetchImpl = fetch } = {}) {
  const catalogFile = resolve(repoRoot, CATALOG_PATH);
  const modelsFile = resolve(repoRoot, OMP_MODELS_PATH);

  const { model_ids: modelIds, raw_count: rawCount } = await fetchCatalog({ baseUrl, fetchImpl });
  if (modelIds.length === 0) {
    throw new Error(`OmniRoute gateway at ${baseUrl} exposed no models (raw entries: ${rawCount}); catalog left unchanged`);
  }

  const { policy, source: policySource, hash: policyHash } = loadExposurePolicy(repoRoot);
  const exposedIds = selectExposedModels(modelIds, policy);

  const catalog = {
    schema_version: CATALOG_SCHEMA,
    fetched_at: new Date().toISOString(),
    source_url: `${String(baseUrl).replace(/\/+$/, '')}/models`,
    catalog_hash: catalogHash(modelIds),
    model_ids: modelIds,
    model_count: modelIds.length,
    exposure_policy: policy.policy,
    exposure_policy_source: policySource,
    exposure_policy_hash: policyHash,
    selector_version: SELECTOR_VERSION,
    exposed_model_ids: exposedIds,
    exposed_count: exposedIds.length
  };

  const previous = readCatalog(catalogFile);
  if (!existsSync(modelsFile)) throw new Error(`${modelsFile} is absent; cannot project the gateway provider`);
  const modelsContent = readFileSync(modelsFile, 'utf8');
  const blockPresent = hasOmpModelsBlock(modelsContent);

  if (
    previous
    && previous.catalog_hash === catalog.catalog_hash
    && previous.exposure_policy_hash === catalog.exposure_policy_hash
    && previous.selector_version === SELECTOR_VERSION
    && blockPresent
  ) {
    return { changed: false, catalog: previous };
  }

  // The harness projection carries the exposed subset only; the full advertised
  // catalog stays in the snapshot for auditability.
  const splicedContent = spliceOmpModelsBlock(
    modelsContent,
    exposedIds.length ? renderOmpModelsBlock(exposedIds, { baseUrl }) : `${PROVIDER_INDENT}${PROVIDER_NAME}:\n${PROVIDER_INDENT}  baseUrl: ${baseUrl}\n${PROVIDER_INDENT}  apiKey: OMNIROUTE_API_KEY\n${PROVIDER_INDENT}  api: openai-completions\n${PROVIDER_INDENT}  auth: apiKey\n${PROVIDER_INDENT}  models: []\n`
  );
  writeCatalog(catalogFile, catalog);
  if (splicedContent !== modelsContent) writeFileSync(modelsFile, splicedContent);
  return { changed: true, catalog };
}
