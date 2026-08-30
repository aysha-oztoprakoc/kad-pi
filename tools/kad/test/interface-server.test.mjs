import assert from 'node:assert/strict';
import test from 'node:test';
import { request } from 'node:http';
import { createInterfaceServer } from '../interface-server.mjs';

function getJson(address, path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = request({ ...address, path, method }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body, json: () => JSON.parse(body) }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('localhost server exposes read-only runtime status', async () => {
  const server = await createInterfaceServer({
    rootDir: process.cwd(),
    observe: async () => ({ schema: 'kad-runtime-status-v1', runtime_id: 'stheno-v3.2', observed_at: '2026-08-29T21:00:00.000Z', state: 'AVAILABLE', capability: 'world', trust_domain: 'world', endpoint_class: 'localhost-openai-models', identity: 'koboldcpp/L3-8B-Stheno-v3.2-Q4_K_M', latency_ms: 4, reason: null, source: 'runtime-probe' })
  });

  try {
    assert.equal(server.address.address, '127.0.0.1');
    const response = await getJson(server.address, '/api/runtime-status');
    assert.equal(response.status, 200);
    assert.equal(response.json().state, 'AVAILABLE');
  } finally {
    await server.close();
  }
});

test('server rejects writes, unknown routes, and traversal paths', async () => {
  const server = await createInterfaceServer({ rootDir: process.cwd() });
  try {
    assert.equal((await getJson(server.address, '/api/runtime-status', 'POST')).status, 405);
    assert.equal((await getJson(server.address, '/api/other')).status, 404);
    assert.equal((await getJson(server.address, '/%2e%2e/PRIME_DIRECTIVE.md')).status, 404);
  } finally {
    await server.close();
  }
});

test('malformed observer output is bounded as UNKNOWN', async () => {
  const server = await createInterfaceServer({ rootDir: process.cwd(), observe: async () => ({ state: 'AVAILABLE' }) });
  try {
    const response = await getJson(server.address, '/api/runtime-status');
    assert.equal(response.status, 200);
    assert.equal(response.json().state, 'UNKNOWN');
    assert.match(response.json().reason, /malformed status/);
  } finally {
    await server.close();
  }
});

test('server serves only allowlisted dashboard assets', async () => {
  const server = await createInterfaceServer({ rootDir: process.cwd() });
  try {
    const dashboard = await getJson(server.address, '/dashboard/index.html');
    assert.equal(dashboard.status, 200);
    assert.match(dashboard.headers['content-type'], /text\/html/);
    assert.equal((await getJson(server.address, '/CONTEXT.md')).status, 404);
  } finally {
    await server.close();
  }
});

test('server serves vendor ESM libraries and projections with proper MIME types', async () => {
  const server = await createInterfaceServer({ rootDir: process.cwd() });
  try {
    const cy = await getJson(server.address, '/vendor/cytoscape.esm.min.mjs');
    assert.equal(cy.status, 200);
    assert.match(cy.headers['content-type'], /text\/javascript/);

    const echarts = await getJson(server.address, '/vendor/echarts.esm.min.mjs');
    assert.equal(echarts.status, 200);
    assert.match(echarts.headers['content-type'], /text\/javascript/);

    const graph = await getJson(server.address, '/vault/90_Derived/Projections/graph.json');
    assert.equal(graph.status, 200);
    assert.match(graph.headers['content-type'], /application\/json/);
  } finally {
    await server.close();
  }
});