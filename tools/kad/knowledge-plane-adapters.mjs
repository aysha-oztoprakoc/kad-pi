import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

function unwrapResponse(payload) {
  if (payload && typeof payload === 'object' && 'result' in payload) return payload.result;
  return payload;
}

async function requestJson(baseUrl, path, init = {}) {
  const response = await fetch(new URL(path, baseUrl), init);
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  if (!response.ok) throw new Error(`OpenViking ${response.status}: ${typeof payload === 'string' ? payload : JSON.stringify(payload)}`);
  return unwrapResponse(payload);
}

export function createOpenVikingAdapter({ base_url: baseUrl = 'http://127.0.0.1:1933', user_id: userId = 'kad-knowledge-plane' } = {}) {
  const headers = { 'X-OpenViking-User': userId };
  return Object.freeze({
    name: 'OpenViking',
    authority: false,
    async health() {
      return requestJson(baseUrl, '/health', { headers });
    },
    async ingest({ content, source_ref: sourceRef, target_uri: targetUri }) {
      const form = new FormData();
      form.append('file', new Blob([content], { type: 'text/markdown' }), basename(sourceRef));
      const upload = await requestJson(baseUrl, '/api/v1/resources/temp_upload', { method: 'POST', headers, body: form });
      return requestJson(baseUrl, '/api/v1/resources', {
        method: 'POST',
        headers: { ...headers, 'content-type': 'application/json' },
        body: JSON.stringify({ temp_file_id: upload.temp_file_id, to: targetUri, wait: true, source_name: basename(sourceRef) })
      });
    },
    async read(uri) {
      const url = new URL('/api/v1/content/read', baseUrl);
      url.searchParams.set('uri', uri);
      url.searchParams.set('offset', '0');
      url.searchParams.set('limit', '-1');
      const response = await fetch(url, { headers: { ...headers, accept: 'text/plain' }, method: 'GET' });
      if (!response.ok) throw new Error(`OpenViking read failed: ${response.status}`);
      const body = await response.text();
      try {
        const payload = JSON.parse(body);
        return payload && typeof payload === 'object' && 'result' in payload ? payload.result : payload;
      } catch {
        return body;
      }
    },
    async retrieve(query, { target_uri: targetUri = '', limit = 5 } = {}) {
      return requestJson(baseUrl, '/api/v1/search/find', {
        method: 'POST',
        headers: { ...headers, 'content-type': 'application/json' },
        body: JSON.stringify({ query, target_uri: targetUri, limit })
      });
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
