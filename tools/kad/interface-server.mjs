import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { observeRuntime, SELECTED_RUNTIME, validateRuntimeStatus } from './runtime-status.mjs';

const STATIC_FILES = Object.freeze({
  '/dashboard/index.html': 'dashboard/index.html',
  '/dashboard/dashboard.js': 'dashboard/dashboard.js',
  '/interface/kad.css': 'interface/kad.css',
  '/interface/kad-ui.js': 'interface/kad-ui.js',
  '/wiki/generated/kad-canonical/project-state.json': 'wiki/generated/kad-canonical/project-state.json',
  '/wiki/generated/kad-canonical/status.json': 'wiki/generated/kad-canonical/status.json',
  '/tools/kad/runtime-status.mjs': 'tools/kad/runtime-status.mjs',
  '/wiki/generated/kad-canonical/evidence-index.json': 'wiki/generated/kad-canonical/evidence-index.json'
});

const CONTENT_TYPES = Object.freeze({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' });

function json(response, statusCode, value) {
  const body = JSON.stringify(value);
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'content-length': Buffer.byteLength(body) });
  response.end(body);
}

function unavailableObservation(reason) {
  return {
    schema: 'kad-runtime-status-v1', runtime_id: SELECTED_RUNTIME.runtime_id, observed_at: new Date().toISOString(), state: 'UNKNOWN',
    capability: SELECTED_RUNTIME.capability, trust_domain: SELECTED_RUNTIME.trust_domain, endpoint_class: SELECTED_RUNTIME.endpoint_class,
    identity: null, latency_ms: null, reason, source: 'runtime-probe'
  };
}

function staticFile(rootDir, pathname) {
  const relative = STATIC_FILES[pathname];
  if (!relative) return null;
  return { path: join(rootDir, relative), contentType: CONTENT_TYPES[relative.slice(relative.lastIndexOf('.'))] ?? 'application/octet-stream' };
}

export function createInterfaceServer({ rootDir = process.cwd(), host = '127.0.0.1', port = 0, runtime = SELECTED_RUNTIME, observe = () => observeRuntime({ runtime }) } = {}) {
  const root = resolve(rootDir);
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? `${host}:${port}`}`);
    if (request.method !== 'GET') {
      response.writeHead(405, { allow: 'GET', 'content-type': 'text/plain; charset=utf-8' });
      response.end('GET only');
      return;
    }
    if (url.pathname === '/') {
      response.writeHead(302, { location: '/dashboard/index.html' });
      response.end();
      return;
    }
    if (url.pathname === '/api/runtime-status') {
      let observation;
      try { observation = await observe(); } catch (error) { observation = unavailableObservation(`runtime observer failed: ${error.message}`); }
      if (!validateRuntimeStatus(observation)) observation = unavailableObservation('runtime observer returned malformed status');
      json(response, 200, observation);
      return;
    }
    const file = staticFile(root, url.pathname);
    if (!file) { response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); response.end('Not found'); return; }
    try {
      const body = readFileSync(file.path);
      response.writeHead(200, { 'content-type': file.contentType, 'cache-control': 'no-store', 'content-length': body.byteLength });
      response.end(body);
    } catch {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    }
  });

  const ready = new Promise((resolveReady, reject) => {
    server.once('error', reject);
    server.listen({ host, port }, () => {
      server.removeListener('error', reject);
      resolveReady();
    });
  });

  return ready.then(() => ({
    server,
    address: server.address(),
    close: () => new Promise((resolveClose, rejectClose) => server.close(error => error ? rejectClose(error) : resolveClose()))
  }));
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const requestedPort = Number(process.env.KAD_INTERFACE_PORT ?? 4173);
  createInterfaceServer({ port: Number.isInteger(requestedPort) ? requestedPort : 4173 }).then(({ address }) => {
    console.log(`KAD interface listening on http://${address.address}:${address.port}`);
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
