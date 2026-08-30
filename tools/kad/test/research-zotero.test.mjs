import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ZoteroLocalAdapter,
  ZoteroSecurityError,
  ZoteroClientError,
  normalizeZoteroItem,
  isLoopbackUrl
} from '../research-zotero.mjs';
import { DeterministicResearchCorpus } from '../research.mjs';
import { parseResearchManifest } from '../research-cli.mjs';

test('Loopback confinement: Only localhost, 127.0.0.1, and [::1] are permitted', () => {
  assert.equal(isLoopbackUrl('http://localhost:23119/api/'), true);
  assert.equal(isLoopbackUrl('http://127.0.0.1:23119/api/'), true);
  assert.equal(isLoopbackUrl('http://[::1]:23119/api/'), true);

  assert.equal(isLoopbackUrl('http://example.com:23119/api/'), false);
  assert.equal(isLoopbackUrl('http://192.168.1.50:23119/api/'), false);
  assert.equal(isLoopbackUrl('http://api.zotero.org/'), false);

  assert.throws(() => {
    new ZoteroLocalAdapter({ baseUrl: 'http://example.com:23119/api/' });
  }, ZoteroSecurityError);

  assert.throws(() => {
    new ZoteroLocalAdapter({ baseUrl: 'https://api.zotero.org/' });
  }, /loopback/i);
});

test('Read-only enforcement: Adapter rejects mutation methods locally', async () => {
  const adapter = new ZoteroLocalAdapter();
  assert.equal(adapter.readOnly, true);

  // Structural check: No write methods exist on adapter
  assert.equal(adapter.createItem, undefined);
  assert.equal(adapter.updateItem, undefined);
  assert.equal(adapter.deleteItem, undefined);

  // Internal request enforcement rejects non-GET
  await assert.rejects(async () => {
    await adapter.request('/items', { method: 'POST' });
  }, /read-only/i);

  await assert.rejects(async () => {
    await adapter.request('/items', { method: 'DELETE' });
  }, /read-only/i);
});

test('Zotero item normalization maps creators, dates, identifiers, and provenance correctly', () => {
  const zoteroItem = {
    key: 'ITEM1234',
    version: 42,
    data: {
      key: 'ITEM1234',
      itemType: 'journalArticle',
      title: 'Decentralized Consensus in Open Multi-Agent Systems',
      creators: [
        { creatorType: 'author', firstName: 'Leslie', lastName: 'Lamport' },
        { creatorType: 'author', name: 'Satoshi Nakamoto' }
      ],
      date: '2024-05-12',
      publicationTitle: 'ACM Transactions on Distributed Systems',
      abstractNote: 'A framework for fault-tolerant decentralized coordination.',
      DOI: '10.1145/3300852.1234567',
      url: 'https://dl.acm.org/doi/10.1145/3300852.1234567',
      extra: 'arXiv: 2405.00001\nPMID: 99887766'
    }
  };

  const candidate = normalizeZoteroItem(zoteroItem, {
    serverId: 'zotero-srv-01',
    apiVersion: '3'
  });

  assert.equal(candidate.title, 'Decentralized Consensus in Open Multi-Agent Systems');
  assert.deepEqual(candidate.authors, ['Leslie Lamport', 'Satoshi Nakamoto']);
  assert.equal(candidate.year, 2024);
  assert.equal(candidate.abstract, 'A framework for fault-tolerant decentralized coordination.');

  // Identifiers: DOI, URL, arXiv, PMID
  const doi = candidate.identifiers.find(id => id.type === 'doi');
  assert.ok(doi);
  assert.equal(doi.value, '10.1145/3300852.1234567');

  const arxiv = candidate.identifiers.find(id => id.type === 'arxiv');
  assert.ok(arxiv);
  assert.equal(arxiv.value, '2405.00001');

  // Provenance: Zotero key is provenance, NOT canonical identity
  assert.equal(candidate.provenance.ingestion_method, 'zotero_local_api');
  assert.equal(candidate.provenance.origin, 'zotero');
  assert.equal(candidate.provenance.origin_record_id, 'ITEM1234');
  assert.equal(candidate.provenance.server_id, 'zotero-srv-01');
});

test('Zotero mock server probe, list, inspect, and degradation states work end-to-end', async () => {
  // Create an adapter with mocked client fetch
  const mockItems = [
    {
      key: 'ZOT001',
      version: 1,
      data: {
        key: 'ZOT001',
        itemType: 'journalArticle',
        title: 'Verifiable Computing Systems',
        creators: [{ firstName: 'Alan', lastName: 'Turing' }],
        date: '1936',
        DOI: '10.1000/turing1936'
      }
    }
  ];

  const mockFetcher = async (url, init) => {
    const u = new URL(url);
    if (u.pathname === '/api/' || u.pathname === '/api') {
      return {
        ok: true,
        status: 200,
        headers: new Map([
          ['zotero-api-version', '3'],
          ['zotero-server-id', 'mock-local-zotero-99']
        ]),
        text: async () => 'Zotero Local API'
      };
    }
    if (u.pathname === '/api/users/0/items') {
      return {
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        text: async () => JSON.stringify(mockItems)
      };
    }
    if (u.pathname === '/api/users/0/items/ZOT001') {
      return {
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        text: async () => JSON.stringify(mockItems[0])
      };
    }
    return {
      ok: false,
      status: 404,
      headers: new Map(),
      text: async () => 'Not Found'
    };
  };

  const adapter = new ZoteroLocalAdapter({ fetcher: mockFetcher });

  // Probe
  const probe = await adapter.probe();
  assert.equal(probe.status, 'AVAILABLE');
  assert.equal(probe.apiVersion, '3');
  assert.equal(probe.serverId, 'mock-local-zotero-99');

  // List
  const items = await adapter.listItems({ limit: 10 });
  assert.equal(items.length, 1);
  assert.equal(items[0].key, 'ZOT001');

  // Get single item
  const item = await adapter.getItem('ZOT001');
  assert.equal(item.data.title, 'Verifiable Computing Systems');

  // Degraded probe on 403 Forbidden (Local API disabled in settings)
  const forbiddenFetcher = async () => ({
    ok: false,
    status: 403,
    headers: new Map(),
    text: async () => 'Forbidden: Local API is disabled'
  });
  const forbiddenAdapter = new ZoteroLocalAdapter({ fetcher: forbiddenFetcher });
  const forbiddenProbe = await forbiddenAdapter.probe();
  assert.equal(forbiddenProbe.status, 'UNAUTHORIZED');
  assert.equal(forbiddenProbe.reason, 'LOCAL_API_DISABLED');

  // Unavailable probe on connection error
  const downFetcher = async () => {
    throw new Error('connect ECONNREFUSED 127.0.0.1:23119');
  };
  const downAdapter = new ZoteroLocalAdapter({ fetcher: downFetcher });
  const downProbe = await downAdapter.probe();
  assert.equal(downProbe.status, 'UNAVAILABLE');
  assert.equal(downProbe.reason, 'CONNECTION_REFUSED');
});

test('Transport Equivalence & Idempotency: Zotero import and manifest import produce identical canonical state', async () => {
  const tmp = await mkdtemp(join(tmpdir(), 'kad-zotero-equiv-'));
  try {
    const corpus = new DeterministicResearchCorpus({ storageDir: tmp, rootDir: tmp });

    const zoteroItem = {
      key: 'ZOTERO_ITEM_42',
      data: {
        title: 'Universal Transport Invariance',
        creators: [{ firstName: 'Grace', lastName: 'Hopper' }],
        date: '2024',
        DOI: '10.1000/transport-invariance-01'
      }
    };

    const mockFetcher = async () => ({
      ok: true,
      status: 200,
      headers: new Map([['zotero-api-version', '3']]),
      text: async () => JSON.stringify(zoteroItem)
    });

    const adapter = new ZoteroLocalAdapter({ fetcher: mockFetcher });

    // Ingest via Zotero adapter
    const candidateFromZotero = normalizeZoteroItem(zoteroItem);
    const zoteroResult = corpus.ingestCandidate(candidateFromZotero);
    assert.equal(zoteroResult.status, 'INGESTED');
    const canonicalDocId = zoteroResult.document.document_id;
    assert.equal(canonicalDocId, 'doc:doi:10.1000/transport-invariance-01');

    // Ingest same paper via deterministic Manifest
    const manifestJson = JSON.stringify({
      schema_version: 'kad-research-manifest-v1',
      candidate: {
        title: 'Universal Transport Invariance',
        authors: ['Grace Hopper'],
        year: 2024,
        identifiers: [{ type: 'doi', value: '10.1000/transport-invariance-01' }]
      },
      provenance: {
        method: 'manifest',
        origin: 'standard_export'
      }
    });
    const manifest = parseResearchManifest(manifestJson);
    const manifestResult = corpus.ingestCandidate(manifest.candidate);

    // Must detect existing canonical document idempotently
    assert.equal(manifestResult.status, 'IDEMPOTENT_EXISTING');
    assert.equal(manifestResult.document.document_id, canonicalDocId);

    // Repeat Zotero import is also idempotent
    const repeatZoteroResult = corpus.ingestCandidate(candidateFromZotero);
    assert.equal(repeatZoteroResult.status, 'IDEMPOTENT_EXISTING');
    assert.equal(repeatZoteroResult.document.document_id, canonicalDocId);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('Attachment Safety: Attachment metadata does NOT create source without local file validation', async () => {
  const tmp = await mkdtemp(join(tmpdir(), 'kad-zotero-attach-'));
  try {
    const corpus = new DeterministicResearchCorpus({ storageDir: tmp, rootDir: tmp });

    // Item with attachment metadata only
    const zoteroItem = {
      key: 'ITEM_WITH_ATTACH',
      data: {
        title: 'Attachment Safety Test',
        DOI: '10.1000/attach-safe-01'
      },
      attachment: {
        path: '/non/existent/file.pdf',
        mimeType: 'application/pdf'
      }
    };

    const candidate = normalizeZoteroItem(zoteroItem);
    const result = corpus.ingestCandidate(candidate);
    assert.equal(result.status, 'INGESTED');
    // Sources list is empty because file was not acquired
    assert.equal(result.document.sources.length, 0);

    // Ingest item with valid admitted local attachment
    const validFile = join(tmp, 'valid-paper.pdf');
    await writeFile(validFile, 'PDF Content for safe attachment test', 'utf8');

    const sourceResult = corpus.ingestSource({
      source_path: validFile,
      identifiers: result.document.identifiers,
      mime_type: 'application/pdf',
      provenance: { origin: 'zotero_local_attachment' }
    });

    assert.equal(sourceResult.status, 'ATTACHED');
    assert.ok(sourceResult.source.source_hash);

    // Attempting unsafe path traversal attachment fails safely
    assert.throws(() => {
      corpus.ingestSource({
        source_path: '../../../etc/passwd',
        identifiers: result.document.identifiers
      });
    }, /traversal|security/i);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('Zero external credentials or remote dependencies required in baseline tests', () => {
  assert.equal(process.env.ZOTERO_API_KEY, undefined);
});
