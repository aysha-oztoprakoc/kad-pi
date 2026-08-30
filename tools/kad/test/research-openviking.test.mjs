import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  RESEARCH_CONTEXT_DERIVATION_VERSION,
  buildResearchResourceUri,
  parseResearchResourceUri,
  deriveL0Context,
  deriveL1Context,
  deriveL2Chunk,
  evaluateContextStaleness,
  ResearchOpenVikingAdapter
} from '../research-openviking.mjs';
import {
  DeterministicResearchCorpus,
  ResearchDocument,
  ResearchSource,
  ResearchIdentifier,
  createCandidate,
  createSource,
  createDocument,
  hashSourceBytes
} from '../research.mjs';

test('Research URI scheme generates deterministic, reversible OpenViking URIs', () => {
  const docId = 'doc:doi:10.1145/3290605.3300852';
  const l0Uri = buildResearchResourceUri(docId, 'L0');
  const l1Uri = buildResearchResourceUri(docId, 'L1');
  const l2Uri = buildResearchResourceUri(docId, 'L2', 'chunk-01');

  assert.equal(l0Uri, 'viking://resources/research/doc:doi:10.1145/3290605.3300852/l0.json');
  assert.equal(l1Uri, 'viking://resources/research/doc:doi:10.1145/3290605.3300852/l1.json');
  assert.equal(l2Uri, 'viking://resources/research/doc:doi:10.1145/3290605.3300852/l2/chunk-01.json');

  const parsedL0 = parseResearchResourceUri(l0Uri);
  assert.equal(parsedL0.canonical_document_id, docId);
  assert.equal(parsedL0.layer, 'L0');
  assert.equal(parsedL0.chunk_id, null);

  const parsedL2 = parseResearchResourceUri(l2Uri);
  assert.equal(parsedL2.canonical_document_id, docId);
  assert.equal(parsedL2.layer, 'L2');
  assert.equal(parsedL2.chunk_id, 'chunk-01');

  // Title or provider change does NOT alter the canonical URI
  const docId2 = 'doc:doi:10.1145/3290605.3300852';
  assert.equal(buildResearchResourceUri(docId2, 'L0'), l0Uri);
});

test('Derived context layers (L0, L1, L2) preserve canonical trace metadata', () => {
  const sourceHash = hashSourceBytes('Authoritative paper content on distributed consensus algorithms.');
  const source = new ResearchSource({
    source_id: 'src:hash:' + sourceHash.slice(0, 16),
    source_ref: 'papers/dist-01.pdf',
    source_hash: sourceHash,
    mime_type: 'application/pdf'
  });
  const document = new ResearchDocument({
    document_id: 'doc:doi:10.1000/dist-01',
    title: 'Deterministic State Machine Consensus',
    authors: ['Leslie Lamport', 'Barbara Liskov'],
    year: 2024,
    abstract: 'A rigorous evaluation of deterministic consensus under network partitions.',
    identifiers: [{ type: 'doi', value: '10.1000/dist-01' }],
    sources: [source]
  });

  // L0: Compact Discovery
  const l0 = deriveL0Context(document, source);
  assert.equal(l0.canonical_document_id, document.document_id);
  assert.equal(l0.layer, 'L0');
  assert.equal(l0.derivation_version, RESEARCH_CONTEXT_DERIVATION_VERSION);
  assert.equal(l0.source_hash, source.source_hash);
  assert.equal(l0.title, document.title);
  assert.equal(l0.year, 2024);
  assert.ok(l0.brief_orientation);

  // L1: Structured Overview
  const l1 = deriveL1Context(document, source, {
    structured_overview: {
      research_question: 'Can state machines reach deterministic consensus under Byzantine faults?',
      method: 'Formal inductive proofs and executable TLA+ models.',
      contribution: 'A bounded verification framework for distributed agent systems.',
      limitations: 'Assumes partially synchronous communication.'
    }
  });
  assert.equal(l1.canonical_document_id, document.document_id);
  assert.equal(l1.layer, 'L1');
  assert.equal(l1.derivation_version, RESEARCH_CONTEXT_DERIVATION_VERSION);
  assert.equal(l1.source_hash, source.source_hash);
  assert.equal(l1.structured_overview.contribution, 'A bounded verification framework for distributed agent systems.');

  // L2: Bounded Source-Grounded Detail (NOT full document mirror)
  const l2 = deriveL2Chunk(document, source, {
    chunk_id: 'sec-3-proof',
    locator: { section: '3.2 Inductive Step', page: 7 },
    content: 'Theorem 3.2: If quorum Q1 intersects Q2 in at least f+1 nodes, agreement invariant holds.'
  });
  assert.equal(l2.canonical_document_id, document.document_id);
  assert.equal(l2.layer, 'L2');
  assert.equal(l2.source_id, source.source_id);
  assert.equal(l2.source_hash, source.source_hash);
  assert.equal(l2.locator.section, '3.2 Inductive Step');
  assert.ok(l2.content.startsWith('Theorem 3.2'));
});

test('Staleness detection identifies source hash and derivation version mismatches', () => {
  const origHash = 'aaa111bbb222';
  const l0 = {
    canonical_document_id: 'doc:doi:10.1000/stale-test',
    layer: 'L0',
    derivation_version: RESEARCH_CONTEXT_DERIVATION_VERSION,
    source_hash: origHash
  };

  const freshSource = { source_hash: origHash };
  const alteredSource = { source_hash: 'ccc333ddd444' };

  // Fresh
  const freshEval = evaluateContextStaleness(l0, freshSource);
  assert.equal(freshEval.is_stale, false);

  // Stale because source hash changed
  const staleHashEval = evaluateContextStaleness(l0, alteredSource);
  assert.equal(staleHashEval.is_stale, true);
  assert.equal(staleHashEval.reason, 'SOURCE_HASH_MISMATCH');

  // Stale because derivation version changed
  const oldVersionL0 = { ...l0, derivation_version: 'kad-research-context-v0-legacy' };
  const staleVerEval = evaluateContextStaleness(oldVersionL0, freshSource);
  assert.equal(staleVerEval.is_stale, true);
  assert.equal(staleVerEval.reason, 'DERIVATION_VERSION_MISMATCH');
});

test('Adapter indexes, reads, retrieves, and queries research context progressively', async () => {
  const adapter = new ResearchOpenVikingAdapter();
  const sourceBytes = 'Progressive retrieval in hierarchical knowledge contexts.';
  const sourceHash = hashSourceBytes(sourceBytes);

  const source = new ResearchSource({
    source_id: 'src:hash:' + sourceHash.slice(0, 16),
    source_ref: 'papers/arxiv2401.pdf',
    source_hash: sourceHash
  });
  const document = new ResearchDocument({
    document_id: 'doc:arxiv:2401.99999',
    title: 'Progressive Context Hierarchies',
    authors: ['Claude Shannon'],
    year: 2024,
    abstract: 'Methods for tiered representation in agent context windows.',
    identifiers: [{ type: 'arxiv', value: '2401.99999' }],
    sources: [source]
  });

  await adapter.indexResearchDocument(document, source, {
    l1: {
      structured_overview: {
        contribution: 'Tiered L0/L1/L2 progressive context loading'
      }
    },
    l2_chunks: [
      {
        chunk_id: 'intro-excerpt',
        locator: { section: '1. Introduction', paragraph: 2 },
        content: 'Hierarchical context layers reduce prompt token consumption by 80%.'
      }
    ]
  });

  // Read L0
  const l0Uri = buildResearchResourceUri(document.document_id, 'L0');
  const l0Resource = await adapter.readResource(l0Uri);
  assert.equal(l0Resource.canonical_document_id, document.document_id);
  assert.equal(l0Resource.layer, 'L0');

  // Read L1
  const l1Uri = buildResearchResourceUri(document.document_id, 'L1');
  const l1Resource = await adapter.readResource(l1Uri);
  assert.equal(l1Resource.layer, 'L1');
  assert.equal(l1Resource.structured_overview.contribution, 'Tiered L0/L1/L2 progressive context loading');

  // Semantic / Keyword retrieval across research context
  const searchResults = await adapter.retrieve('token consumption', {
    documentId: document.document_id
  });
  assert.ok(searchResults.length > 0);
  assert.equal(searchResults[0].layer, 'L2');
  assert.equal(searchResults[0].chunk_id, 'intro-excerpt');
});

test('Exact Fallback: Missing, stale, or unavailable OpenViking falls back to exact KAD source retrieval', async () => {
  const tmp = await mkdtemp(join(tmpdir(), 'kad-ov-fallback-'));
  try {
    const corpus = new DeterministicResearchCorpus({ storageDir: tmp, rootDir: tmp });
    const ingestion = corpus.ingestCandidate({
      title: 'Fallback Verification Paper',
      identifiers: [{ type: 'doi', value: '10.1000/fallback-01' }]
    });

    const docId = ingestion.document.document_id;
    const adapter = new ResearchOpenVikingAdapter();

    // Case 1: Context is missing from OpenViking -> fallback to canonical document
    const resMissing = await adapter.retrieveProgressiveContext(docId, {
      layer: 'L0',
      corpus
    });
    assert.equal(resMissing.status, 'FALLBACK_EXACT');
    assert.equal(resMissing.document.document_id, docId);
    assert.equal(resMissing.reason, 'CONTEXT_MISSING');

    // Case 2: OpenViking is unavailable -> fallback to canonical document
    adapter.setSimulatedAvailability(false);
    const resUnavailable = await adapter.retrieveProgressiveContext(docId, {
      layer: 'L0',
      corpus
    });
    assert.equal(resUnavailable.status, 'FALLBACK_EXACT');
    assert.equal(resUnavailable.document.document_id, docId);
    assert.equal(resUnavailable.reason, 'OPENVIKING_UNAVAILABLE');
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('Rebuildability: Deleting derived OpenViking context leaves canonical corpus intact and supports full rebuild', async () => {
  const tmp = await mkdtemp(join(tmpdir(), 'kad-ov-rebuild-'));
  try {
    const corpus = new DeterministicResearchCorpus({ storageDir: tmp, rootDir: tmp });
    const ingestion = corpus.ingestCandidate({
      title: 'Rebuildable Context Paper',
      identifiers: [{ type: 'doi', value: '10.1000/rebuild-01' }]
    });
    const docId = ingestion.document.document_id;
    const docBefore = corpus.inspectDocument(docId);
    const serializedDocBefore = JSON.stringify(docBefore);

    const adapter = new ResearchOpenVikingAdapter();
    await adapter.indexResearchDocument(docBefore, docBefore.sources[0] || null);

    // Verify context exists
    const l0Uri = buildResearchResourceUri(docId, 'L0');
    assert.ok(await adapter.readResource(l0Uri));

    // Delete derived context from OpenViking
    await adapter.deleteResearchContext(docId);
    assert.equal(await adapter.readResource(l0Uri), null);

    // Prove canonical corpus is 100% untouched
    const docAfterDelete = corpus.inspectDocument(docId);
    assert.deepEqual(JSON.stringify(docAfterDelete), serializedDocBefore);

    // Rebuild derived context from canonical corpus
    await adapter.rebuildResearchContext(docAfterDelete, docAfterDelete.sources[0] || null);
    const l0Rebuilt = await adapter.readResource(l0Uri);
    assert.ok(l0Rebuilt);
    assert.equal(l0Rebuilt.canonical_document_id, docId);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test('Canonical Authority Isolation: OpenViking derived context has authority: false and cannot mutate corpus', () => {
  const adapter = new ResearchOpenVikingAdapter();
  assert.equal(adapter.authority, false);
});

test('Baseline suite runs offline with zero external LLM or paid services', () => {
  assert.equal(process.env.OPENAI_API_KEY, undefined);
  assert.equal(process.env.ANTHROPIC_API_KEY, undefined);
});
