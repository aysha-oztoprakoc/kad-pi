import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  CATALOG_SCHEMA,
  EXPOSURE_PATH,
  catalogHash,
  fetchCatalog,
  readCatalog,
  renderOmpModelsBlock,
  spliceOmpModelsBlock,
  syncCatalog
} from '../omniroute-catalog.mjs';

const MODELS_YML = `providers:
  zai-free:
    baseUrl: https://api.z.ai/api/paas/v4
    apiKey: ZAI_API_KEY
    api: openai-completions
    models:
      - id: glm-4.7-flash
        name: GLM-4.7-Flash (Z.AI Open Platform free)
  kad-local-world:
    baseUrl: http://127.0.0.1:5001/v1
    auth: none
    models:
      - id: kad-local-s13
        name: Stheno v3.2 (KAD WORLD-only)
  kad-local-qwen:
    baseUrl: http://127.0.0.1:5002/v1
    auth: none
    models:
      - id: qwen-local
        name: Qwen3.5-9B (KAD retrieval-only)
`;

function jsonResponse(status, payload) {
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return { ok: status >= 200 && status < 300, status, text: async () => body };
}

function makeRepo() {
  const root = mkdtempSync(join(tmpdir(), 'kad-omniroute-'));
  mkdirSync(join(root, 'config'), { recursive: true });
  mkdirSync(join(root, '.omp'), { recursive: true });
  writeFileSync(join(root, '.omp/models.yml'), MODELS_YML);
  // The exposure policy is part of the fixture: without it the sync falls back to
  // the never-widen default and the local/subscription lanes cannot be exercised.
  writeFileSync(join(root, EXPOSURE_PATH), `${JSON.stringify({
    schema_version: 'kad-omniroute-exposure-1',
    policy: 'LOCAL_SUBSCRIPTION_AND_FREE_TIERS_ONLY',
    include_all_from: ['llama-cpp', 'oc', 'opencode-go'],
    metered: ['openrouter'],
    include_free_tier_ids: true,
    free_tier_markers: [':free', '-free'],
    exclude_prefixes: ['auto/'],
    unlisted_providers: 'exclude'
  }, null, 2)}\n`);
  return root;
}

function fakeFetch(payload, status = 200) {
  return async () => jsonResponse(status, payload);
}

test('catalogHash is order independent and matches an independently computed sha256', () => {
  const ids = ['b-model', 'a-model', 'c-model'];
  const expected = createHash('sha256').update(['a-model', 'b-model', 'c-model'].join('\n')).digest('hex');
  assert.equal(catalogHash(ids), expected);
  assert.equal(catalogHash([...ids].reverse()), expected);
  assert.equal(catalogHash([]), createHash('sha256').update('').digest('hex'));
});

test('fetchCatalog ignores the trailing slash, dedupes, sorts, and drops non-string ids', async () => {
  let seenUrl = null;
  const fetchImpl = async (url) => {
    seenUrl = url;
    return jsonResponse(200, { data: [{ id: 'zeta' }, { id: 'alpha' }, { id: 'zeta' }, { id: 42 }, { id: '' }, {}] });
  };
  const result = await fetchCatalog({ baseUrl: 'http://127.0.0.1:20128/v1/', fetchImpl });
  assert.equal(seenUrl, 'http://127.0.0.1:20128/v1/models');
  assert.deepEqual(result.model_ids, ['alpha', 'zeta']);
  assert.equal(result.raw_count, 6);
});

test('fetchCatalog rejects a non-2xx gateway response with a descriptive error', async () => {
  await assert.rejects(
    () => fetchCatalog({ fetchImpl: fakeFetch('{"error":{"message":"Authentication required"}}', 401) }),
    /HTTP 401.*Authentication required/s
  );
});

test('fetchCatalog rejects a body without a data array', async () => {
  await assert.rejects(() => fetchCatalog({ fetchImpl: fakeFetch({ models: [] }) }), /no data\[\] model array/);
  await assert.rejects(() => fetchCatalog({ fetchImpl: fakeFetch('not json at all') }), /non-JSON body/);
});

test('fetchCatalog rejects an unreachable gateway without throwing raw transport errors', async () => {
  const fetchImpl = async () => {
    throw new Error('connect ECONNREFUSED 127.0.0.1:20128');
  };
  await assert.rejects(() => fetchCatalog({ fetchImpl }), /OmniRoute gateway unreachable.*ECONNREFUSED/s);
});

test('syncCatalog records the full advertised catalog but projects only policy-exposed models', async () => {
  const root = makeRepo();
  try {
    // Advertised set deliberately spans every policy branch: the local lane, a
    // metered provider's paid and free ids, the excluded auto/* combos, an
    // unlisted provider, and a second include lane.
    const advertised = [
      { id: 'llama-cpp/kad-local-s13' },
      { id: 'openrouter/anthropic/claude-paid' },
      { id: 'openrouter/google/gemma-4-31b-it:free' },
      { id: 'auto/best-coding' },
      { id: 'aihorde/never-connected' },
      { id: 'oc/big-pickle' }
    ];
    const result = await syncCatalog({ repoRoot: root, fetchImpl: fakeFetch({ data: advertised }) });
    assert.equal(result.changed, true);

    const catalog = readCatalog(join(root, 'config/omniroute-catalog.json'));
    assert.equal(catalog.schema_version, CATALOG_SCHEMA);
    assert.equal(catalog.source_url, 'http://127.0.0.1:20128/v1/models');
    assert.match(catalog.fetched_at, /^\d{4}-\d{2}-\d{2}T/);

    // The advertised catalog is recorded in full, and stays hash-verifiable.
    assert.deepEqual(catalog.model_ids, advertised.map((m) => m.id).sort());
    assert.equal(catalog.model_count, 6);
    assert.equal(catalog.catalog_hash, catalogHash(catalog.model_ids));

    // The exposure projection is recorded alongside it for auditability.
    assert.equal(catalog.exposure_policy, 'LOCAL_SUBSCRIPTION_AND_FREE_TIERS_ONLY');
    assert.equal(catalog.exposure_policy_source, EXPOSURE_PATH);
    assert.match(catalog.exposure_policy_hash, /^[0-9a-f]{64}$/);
    assert.deepEqual(catalog.exposed_model_ids, [
      'llama-cpp/kad-local-s13',
      'oc/big-pickle',
      'openrouter/google/gemma-4-31b-it:free'
    ]);
    assert.equal(catalog.exposed_count, 3);

    // The OMP projection carries the exposed subset only.
    const models = readFileSync(join(root, '.omp/models.yml'), 'utf8');
    assert.match(models, /^ {2}omniroute:$/m);
    assert.match(models, /^ {2}omniroute:\n {4}baseUrl: http:\/\/127\.0\.0\.1:20128\/v1$/m);
    assert.match(models, /^ {6}- id: llama-cpp\/kad-local-s13$/m);
    assert.match(models, /^ {6}- id: oc\/big-pickle$/m);
    assert.match(models, /^ {6}- id: openrouter\/google\/gemma-4-31b-it:free$/m);
    // No metered, unlisted or auto-routed id is projected into the harness.
    assert.doesNotMatch(models, /claude-paid/);
    assert.doesNotMatch(models, /aihorde/);
    assert.doesNotMatch(models, /auto\/best-coding/);
    assert.match(models, /^ {8}name: oc\/big-pickle \(OmniRoute gateway\)$/m);
    assert.match(models, /^ {8}maxTokens: 16384$/m);
    // cost is zero across the board: the gateway publishes no per-model prices
    assert.equal((models.match(/^ {10}input: 0$/gm) || []).length, 3);
    assert.equal((models.match(/^ {10}output: 0$/gm) || []).length, 3);
    assert.equal((models.match(/^ {10}cacheRead: 0$/gm) || []).length, 3);
    assert.equal((models.match(/^ {10}cacheWrite: 0$/gm) || []).length, 3);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a second syncCatalog with identical input reports unchanged and leaves the file byte identical', async () => {
  const root = makeRepo();
  try {
    const fetchImpl = fakeFetch({ data: [{ id: 'auto' }] });
    const first = await syncCatalog({ repoRoot: root, fetchImpl });
    assert.equal(first.changed, true);
    const catalogBytes = readFileSync(join(root, 'config/omniroute-catalog.json'));
    const modelsBytes = readFileSync(join(root, '.omp/models.yml'));

    const second = await syncCatalog({ repoRoot: root, fetchImpl });
    assert.equal(second.changed, false);
    assert.equal(second.catalog.catalog_hash, first.catalog.catalog_hash);
    assert.deepEqual(readFileSync(join(root, 'config/omniroute-catalog.json')), catalogBytes);
    assert.deepEqual(readFileSync(join(root, '.omp/models.yml')), modelsBytes);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('syncCatalog refuses an empty model list and never erases an existing catalog', async () => {
  const root = makeRepo();
  try {
    const seeded = await syncCatalog({ repoRoot: root, fetchImpl: fakeFetch({ data: [{ id: 'auto' }] }) });
    const catalogBytes = readFileSync(join(root, 'config/omniroute-catalog.json'));
    const modelsBytes = readFileSync(join(root, '.omp/models.yml'));

    await assert.rejects(() => syncCatalog({ repoRoot: root, fetchImpl: fakeFetch({ data: [] }) }), /exposed no models/);
    assert.deepEqual(readFileSync(join(root, 'config/omniroute-catalog.json')), catalogBytes);
    assert.deepEqual(readFileSync(join(root, '.omp/models.yml')), modelsBytes);

    const unreachable = async () => {
      throw new Error('connect ECONNREFUSED 127.0.0.1:20128');
    };
    await assert.rejects(() => syncCatalog({ repoRoot: root, fetchImpl: unreachable }), /unreachable/);
    const survivor = readCatalog(join(root, 'config/omniroute-catalog.json'));
    assert.equal(survivor.catalog_hash, seeded.catalog.catalog_hash);
    assert.deepEqual(survivor.model_ids, ['auto']);
    assert.deepEqual(readFileSync(join(root, '.omp/models.yml')), modelsBytes);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('spliceOmpModelsBlock preserves other providers and is idempotent', () => {
  const block = renderOmpModelsBlock(['auto', 'glm-5']);
  const once = spliceOmpModelsBlock(MODELS_YML, block);
  const twice = spliceOmpModelsBlock(once, block);
  assert.equal(twice, once);

  const expected = `providers:\n${block}`;
  assert.ok(twice.startsWith(expected), 'block is inserted directly inside the providers map');
  for (const provider of ['zai-free:', 'kad-local-world:', 'kad-local-qwen:']) {
    assert.ok(twice.includes(`  ${provider}`), `${provider} survives the splice`);
  }
  assert.ok(twice.includes('      - id: glm-4.7-flash'), 'zai-free model survives verbatim');
  assert.ok(twice.includes('      - id: kad-local-s13'), 'kad-local-world model survives verbatim');
  assert.ok(twice.includes('      - id: qwen-local'), 'kad-local-qwen model survives verbatim');
  assert.ok(twice.endsWith('      - id: qwen-local\n        name: Qwen3.5-9B (KAD retrieval-only)\n'));
});

test('spliceOmpModelsBlock replaces an existing omniroute block in place', () => {
  const original = spliceOmpModelsBlock(MODELS_YML, renderOmpModelsBlock(['old-model']));
  const updated = spliceOmpModelsBlock(original, renderOmpModelsBlock(['new-model']));
  assert.equal((updated.match(/^ {2}omniroute:$/gm) || []).length, 1);
  assert.ok(updated.includes('      - id: new-model'));
  assert.ok(!updated.includes('old-model'));
  assert.ok(updated.includes('      - id: qwen-local'));
  assert.equal(updated, spliceOmpModelsBlock(updated, renderOmpModelsBlock(['new-model'])));
});

test('renderOmpModelsBlock emits zero cost, the gateway credential placeholder, and sorted ids', () => {
  const block = renderOmpModelsBlock(['zeta', 'alpha']);
  assert.match(block, /^ {2}omniroute:$/m);
  assert.match(block, /^ {4}apiKey: OMNIROUTE_API_KEY$/m);
  assert.match(block, /^ {4}api: openai-completions$/m);
  assert.match(block, /^ {4}auth: apiKey$/m);
  assert.ok(block.indexOf('alpha') < block.indexOf('zeta'));
  assert.equal((block.match(/^ {10}input: 0$/gm) || []).length, 2);
  assert.equal((block.match(/^ {8}contextWindow: 128000$/gm) || []).length, 2);
});
