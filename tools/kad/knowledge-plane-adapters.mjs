import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const AI_MEMORY_BASE_URL = 'http://127.0.0.1:49374';
export const AI_MEMORY_EXCERPT_LIMIT = 500;

// A plain `ai-memory serve` exposes its read surface under `/admin/*` behind the root
// bearer token. `/api/v1/*` belongs to the optional web surface and is not mounted here.
const AI_MEMORY_STATUS_PATH = '/admin/status';
const AI_MEMORY_SEARCH_PATH = '/admin/search';
const AI_MEMORY_READ_PAGE_PATH = '/admin/read-page';

function collapseText(text) {
  return String(text ?? '').replace(/<\/?mark>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Read-only, non-authoritative access to the ai-memory wiki of record.
 *
 * Every record is a PROPOSED/INFERRED proposal: this adapter cannot emit `ACCEPTED`,
 * cannot widen trust, and never mutates the substrate. Transport failure, a missing
 * bearer token, and an authentication failure all degrade instead of throwing, so the
 * KnowledgePlane keeps its exact deterministic fallback.
 */
export function createAiMemoryAccessAdapter({
  baseUrl = AI_MEMORY_BASE_URL,
  token = process.env.AI_MEMORY_AUTH_TOKEN,
  workspace = 'kad',
  project = 'kad-pi',
  fetchImpl = fetch,
  timeoutMs = 2000
} = {}) {
  async function request(pathname, params = {}) {
    if (!token) return { ok: false, status: null, reason: 'AI_MEMORY_AUTH_TOKEN is not set' };
    const url = new URL(pathname, baseUrl);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, {
        method: 'GET',
        headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
        signal: controller.signal
      });
      let payload = null;
      try { payload = await response.json(); } catch { payload = null; }
      if (!response.ok) return { ok: false, status: response.status, reason: `ai-memory ${pathname} returned HTTP ${response.status}` };
      return { ok: true, status: response.status, payload };
    } catch (error) {
      return {
        ok: false,
        status: null,
        reason: error?.name === 'AbortError' ? `ai-memory ${pathname} timed out after ${timeoutMs}ms` : `ai-memory ${pathname} was unreachable`
      };
    } finally {
      clearTimeout(timer);
    }
  }

  // `source_hash` is the SHA-256 of the exact normalised text the server returned for the
  // record: the page body for `read()`, the FTS snippet for `search()` (search hits are
  // not content-addressed by the server). It is never absent, so every record is displayable.
  function normalise(path, title, content) {
    const text = collapseText(content);
    return Object.freeze({
      source_ref: `ai-memory://${workspace}/${project}/${path}`,
      source_hash: createHash('sha256').update(text, 'utf8').digest('hex'),
      title: typeof title === 'string' && title !== '' ? title : null,
      path,
      excerpt: text.length > AI_MEMORY_EXCERPT_LIMIT ? `${text.slice(0, AI_MEMORY_EXCERPT_LIMIT)}…` : text,
      acceptance_state: 'PROPOSED',
      epistemic_class: 'INFERRED',
      authority: 'DERIVED',
      trust_domain: 'memory'
    });
  }

  return Object.freeze({
    name: 'ai-memory',
    authority: false,
    kind: 'retrieval',
    trust_domain: 'memory',
    async probe() {
      const result = await request(AI_MEMORY_STATUS_PATH);
      if (!result.ok) return { adapter: 'ai-memory', status: 'DEGRADED', authority: false, detail: result.reason, version: null };
      const version = typeof result.payload?.version === 'string' ? result.payload.version : null;
      return { adapter: 'ai-memory', status: 'PASS', authority: false, detail: `ai-memory ${version ?? 'unknown version'} at ${baseUrl}`, version };
    },
    async search({ query, limit = 10 } = {}) {
      if (typeof query !== 'string' || query.trim() === '') return [];
      const result = await request(AI_MEMORY_SEARCH_PATH, {
        q: query,
        workspace,
        project,
        limit: Math.min(100, Math.max(1, Number(limit) || 10))
      });
      if (!result.ok || !Array.isArray(result.payload)) return [];
      return result.payload
        .filter(hit => hit && typeof hit.path === 'string' && hit.path !== '')
        .map(hit => normalise(hit.path, hit.title, hit.snippet));
    },
    async read({ path } = {}) {
      if (typeof path !== 'string' || path === '') return null;
      const result = await request(AI_MEMORY_READ_PAGE_PATH, { workspace, project, path });
      if (!result.ok || !result.payload || typeof result.payload.body !== 'string') return null;
      const servedPath = typeof result.payload.path === 'string' && result.payload.path !== '' ? result.payload.path : path;
      return normalise(servedPath, result.payload.title, result.payload.body);
    }
  });
}

export function createNeedleAdapter({ infer = null } = {}) {
  return Object.freeze({
    name: 'Needle',
    authority: false,
    async health() {
      return infer ? { available: true, mode: 'injected-structured-inference' } : { available: false, mode: 'not-configured' };
    },
    async infer(input, schema) {
      if (typeof infer !== 'function') throw new Error('Needle inference adapter is not configured');
      const output = await infer(input, schema);
      return { output, authority: false, acceptance_state: 'PROPOSED' };
    }
  });
}

export async function runOptionalAdapterProbe(adapter, fixture) {
  if (!adapter || adapter.authority !== false) throw new Error('optional adapters must be non-authoritative');
  const health = await adapter.health();
  if (adapter.name === 'Needle') {
    const inference = await adapter.infer(fixture.input, fixture.schema);
    return { adapter: adapter.name, status: 'PASS', health, inference, authority: false };
  }
  const ingested = await adapter.ingest(fixture);
  const read = await adapter.read(fixture.uri);
  const expectedHash = createHash('sha256').update(fixture.content).digest('hex');
  if (expectedHash !== fixture.source_hash) throw new Error('adapter fixture source hash mismatch');
  if (read !== fixture.content) throw new Error('adapter exact read mismatch');
  const retrieval = await adapter.retrieve(fixture.query, { target_uri: fixture.target_uri, limit: 5 });
  return {
    adapter: adapter.name,
    status: 'PASS',
    health,
    ingested,
    read,
    retrieval,
    source_ref: fixture.source_ref,
    source_hash: fixture.source_hash,
    authority: false,
    acceptance_state: 'PROPOSED'
  };
}

export function readFixture(path) {
  return readFileSync(path, 'utf8');
}
