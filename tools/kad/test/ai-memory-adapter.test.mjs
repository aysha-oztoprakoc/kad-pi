import assert from 'node:assert/strict';
import test from 'node:test';
import { AI_MEMORY_BASE_URL, createAiMemoryAccessAdapter } from '../knowledge-plane-adapters.mjs';

const TOKEN = 'test-bearer-token';

// Response shapes captured from a live ai-memory 2.1.1 service (`/admin/*` read surface).
const STATUS = {
  version: '2.1.1',
  data_dir: '/home/amdy/Work/.ai-memory',
  bind: '0.0.0.0:49374',
  counts: { pages_latest: 174, pages_all: 234, sessions: 0, observations: 0 },
  derived: { pages_fts_rows: 234, embedding_rows: 173 }
};

const SEARCH_HITS = [
  { id: '01a090eb-c537-77b0-9ae7-e1b4d914ba02', path: '00_Governance/ISA-KAD-MEMORY-001.md', title: 'KAD Memory ISA', snippet: '# Memory ISA\n\nCanonical <mark>bootstrap</mark> doctrine.', rank: -9.26 },
  { id: '01a090fe-5451-78f0-ac8d-c919d3f0030b', path: 'notes/substrate-bootstrap.md', title: null, snippet: 'Record project created for KAD-PI.', rank: -1.85 }
];

const PAGE = {
  path: '00_Governance/ISA-KAD-MEMORY-001.md',
  workspace: 'kad',
  project: 'kad-pi',
  title: 'KAD Memory ISA',
  body: '# Memory ISA\n\nCanonical bootstrap doctrine.\n',
  frontmatter: { type: 'Rule' }
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } });
}

function routingFetch(routes) {
  return async (url) => {
    const { pathname } = new URL(url);
    const handler = routes[pathname];
    return handler ? handler(url) : new Response('not found', { status: 404 });
  };
}

const HEALTHY_ROUTES = {
  '/admin/status': () => jsonResponse(STATUS),
  '/admin/search': () => jsonResponse(SEARCH_HITS),
  '/admin/read-page': () => jsonResponse(PAGE)
};

function healthyAdapter(options = {}) {
  return createAiMemoryAccessAdapter({ token: TOKEN, fetchImpl: routingFetch(HEALTHY_ROUTES), ...options });
}

function assertProvenancedProposal(record) {
  assert.equal(record.acceptance_state, 'PROPOSED');
  assert.equal(record.epistemic_class, 'INFERRED');
  assert.equal(record.authority, 'DERIVED');
  assert.equal(record.trust_domain, 'memory');
  assert.ok(record.source_ref.startsWith('ai-memory://kad/kad-pi/'), `source_ref is not an ai-memory reference: ${record.source_ref}`);
  assert.match(record.source_hash, /^[0-9a-f]{64}$/);
}

test('a healthy probe reports PASS and stays non-authoritative', async () => {
  const adapter = healthyAdapter();
  assert.equal(adapter.name, 'ai-memory');
  assert.equal(adapter.authority, false);
  assert.equal(adapter.kind, 'retrieval');
  assert.equal(adapter.trust_domain, 'memory');

  const probe = await adapter.probe();
  assert.equal(probe.adapter, 'ai-memory');
  assert.equal(probe.status, 'PASS');
  assert.equal(probe.authority, false);
  assert.equal(probe.version, '2.1.1');
  assert.match(probe.detail, /ai-memory 2\.1\.1/);
});

test('search returns PROPOSED records addressed by /admin/search with scoping and bearer auth', async () => {
  const calls = [];
  const adapter = createAiMemoryAccessAdapter({
    token: TOKEN,
    fetchImpl: async (url, init) => {
      calls.push({ url: new URL(url), init });
      return jsonResponse(SEARCH_HITS);
    }
  });

  const records = await adapter.search({ query: 'bootstrap', limit: 5 });
  assert.equal(records.length, 2);
  for (const record of records) assertProvenancedProposal(record);

  assert.equal(records[0].source_ref, 'ai-memory://kad/kad-pi/00_Governance/ISA-KAD-MEMORY-001.md');
  assert.equal(records[0].title, 'KAD Memory ISA');
  assert.equal(records[0].excerpt, '# Memory ISA Canonical bootstrap doctrine.');
  assert.equal(records[1].title, null);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.origin, AI_MEMORY_BASE_URL);
  assert.equal(calls[0].url.pathname, '/admin/search');
  assert.equal(calls[0].url.searchParams.get('q'), 'bootstrap');
  assert.equal(calls[0].url.searchParams.get('workspace'), 'kad');
  assert.equal(calls[0].url.searchParams.get('project'), 'kad-pi');
  assert.equal(calls[0].url.searchParams.get('limit'), '5');
  assert.equal(calls[0].init.headers.authorization, `Bearer ${TOKEN}`);
});

test('read returns one PROPOSED page addressed by /admin/read-page', async () => {
  const calls = [];
  const adapter = createAiMemoryAccessAdapter({
    token: TOKEN,
    fetchImpl: async (url, init) => {
      calls.push({ url: new URL(url), init });
      return jsonResponse(PAGE);
    }
  });

  const record = await adapter.read({ path: '00_Governance/ISA-KAD-MEMORY-001.md' });
  assertProvenancedProposal(record);
  assert.equal(record.path, '00_Governance/ISA-KAD-MEMORY-001.md');
  assert.equal(record.source_ref, 'ai-memory://kad/kad-pi/00_Governance/ISA-KAD-MEMORY-001.md');
  assert.match(record.excerpt, /Canonical bootstrap doctrine/);

  assert.equal(calls[0].url.pathname, '/admin/read-page');
  assert.equal(calls[0].url.searchParams.get('path'), '00_Governance/ISA-KAD-MEMORY-001.md');
  assert.equal(calls[0].url.searchParams.get('workspace'), 'kad');
  assert.equal(calls[0].url.searchParams.get('project'), 'kad-pi');
});

test('read and search reject unusable input without a request', async () => {
  const adapter = createAiMemoryAccessAdapter({
    token: TOKEN,
    fetchImpl: async () => {
      throw new Error('no request may be issued for empty input');
    }
  });

  assert.equal(await adapter.read({}), null);
  assert.equal(await adapter.read({ path: '' }), null);
  assert.deepEqual(await adapter.search({ query: '   ' }), []);
});

test('an ACCEPTED server payload cannot become an accepted record', async () => {
  const adapter = createAiMemoryAccessAdapter({
    token: TOKEN,
    fetchImpl: async (url) => {
      const { pathname } = new URL(url);
      if (pathname === '/admin/read-page') return jsonResponse({ ...PAGE, acceptance_state: 'ACCEPTED', authority: 'AUTHORITATIVE', trust_domain: 'engineering' });
      if (pathname === '/admin/search') return jsonResponse(SEARCH_HITS.map(hit => ({ ...hit, acceptance_state: 'ACCEPTED', authority: 'AUTHORITATIVE' })));
      return jsonResponse(STATUS);
    }
  });

  const [hit] = await adapter.search({ query: 'bootstrap' });
  const page = await adapter.read({ path: PAGE.path });
  assertProvenancedProposal(hit);
  assertProvenancedProposal(page);
});

test('a refused connection degrades without throwing', async () => {
  const adapter = createAiMemoryAccessAdapter({
    token: TOKEN,
    fetchImpl: async () => {
      throw new TypeError('fetch failed: connection refused');
    }
  });

  const probe = await adapter.probe();
  assert.equal(probe.status, 'DEGRADED');
  assert.equal(probe.authority, false);
  assert.match(probe.detail, /unreachable/);
  assert.deepEqual(await adapter.search({ query: 'bootstrap' }), []);
  assert.equal(await adapter.read({ path: '00_Governance/ISA-KAD-MEMORY-001.md' }), null);
});

test('a stalled request degrades after the bounded timeout', async () => {
  const adapter = createAiMemoryAccessAdapter({
    token: TOKEN,
    timeoutMs: 10,
    fetchImpl: (_url, init) => new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    })
  });

  const probe = await adapter.probe();
  assert.equal(probe.status, 'DEGRADED');
  assert.match(probe.detail, /timed out after 10ms/);
});

test('a missing bearer token degrades without issuing a request', async () => {
  const previous = process.env.AI_MEMORY_AUTH_TOKEN;
  delete process.env.AI_MEMORY_AUTH_TOKEN;
  let called = false;
  try {
    const adapter = createAiMemoryAccessAdapter({
      fetchImpl: async () => {
        called = true;
        return jsonResponse(STATUS);
      }
    });

    const probe = await adapter.probe();
    assert.equal(probe.status, 'DEGRADED');
    assert.match(probe.detail, /AI_MEMORY_AUTH_TOKEN/);
    assert.deepEqual(await adapter.search({ query: 'bootstrap' }), []);
    assert.equal(await adapter.read({ path: '00_Governance/ISA-KAD-MEMORY-001.md' }), null);
    assert.equal(called, false);
  } finally {
    if (previous === undefined) delete process.env.AI_MEMORY_AUTH_TOKEN;
    else process.env.AI_MEMORY_AUTH_TOKEN = previous;
  }
});

test('an authentication failure degrades without throwing', async () => {
  const adapter = createAiMemoryAccessAdapter({
    token: TOKEN,
    fetchImpl: async () => jsonResponse({ error: 'unauthorized' }, 401)
  });

  const probe = await adapter.probe();
  assert.equal(probe.status, 'DEGRADED');
  assert.match(probe.detail, /HTTP 401/);
  assert.deepEqual(await adapter.search({ query: 'bootstrap' }), []);
  assert.equal(await adapter.read({ path: '00_Governance/ISA-KAD-MEMORY-001.md' }), null);
});
