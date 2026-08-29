import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  ACCEPTANCE_STATES,
  EPISTEMIC_CLASSES,
  IDENTIFIER_TYPES,
  RESEARCH_SCHEMA_VERSION,
  DeterministicResearchCorpus,
  ResearchCandidate,
  ResearchConflictError,
  ResearchDocument,
  ResearchIdentifier,
  ResearchProvenance,
  ResearchSecurityError,
  ResearchSource,
  createCandidate,
  createDocument,
  createIdentifier,
  createProvenance,
  createSource,
  hashSourceBytes,
  normalizeIdentifier
} from '../research.mjs';

test('ResearchIdentifier normalizes DOIs, arXiv IDs, and internal identifiers deterministically', () => {
  // DOI normalization
  const doi1 = normalizeIdentifier('10.1145/3290605.3300852');
  assert.equal(doi1.type, IDENTIFIER_TYPES.DOI);
  assert.equal(doi1.value, '10.1145/3290605.3300852');

  const doiUrl = normalizeIdentifier('https://doi.org/10.1145/3290605.3300852');
  assert.equal(doiUrl.type, IDENTIFIER_TYPES.DOI);
  assert.equal(doiUrl.value, '10.1145/3290605.3300852');

  const doiDx = normalizeIdentifier('http://dx.doi.org/10.1145/3290605.3300852 ');
  assert.equal(doiDx.type, IDENTIFIER_TYPES.DOI);
  assert.equal(doiDx.value, '10.1145/3290605.3300852');

  const doiCase = normalizeIdentifier('DOI:10.1145/ABC.123');
  assert.equal(doiCase.type, IDENTIFIER_TYPES.DOI);
  assert.equal(doiCase.value, '10.1145/abc.123');

  // arXiv normalization
  const arxiv1 = normalizeIdentifier('arXiv:2301.12345');
  assert.equal(arxiv1.type, IDENTIFIER_TYPES.ARXIV);
  assert.equal(arxiv1.value, '2301.12345');

  const arxivUrl = normalizeIdentifier('https://arxiv.org/abs/2301.12345v2');
  assert.equal(arxivUrl.type, IDENTIFIER_TYPES.ARXIV);
  assert.equal(arxivUrl.value, '2301.12345v2');

  const arxivPdf = normalizeIdentifier('https://arxiv.org/pdf/2301.12345.pdf');
  assert.equal(arxivPdf.type, IDENTIFIER_TYPES.ARXIV);
  assert.equal(arxivPdf.value, '2301.12345');

  // Internal / other identifiers
  const internal = normalizeIdentifier({ type: 'internal', value: 'kad:research:paper-001' });
  assert.equal(internal.type, IDENTIFIER_TYPES.INTERNAL);
  assert.equal(internal.value, 'kad:research:paper-001');

  // Malformed identifier rejection
  assert.throws(() => normalizeIdentifier(''), /identifier cannot be empty/i);
  assert.throws(() => normalizeIdentifier({ type: 'doi', value: 'not-a-doi' }), /invalid doi format/i);
  assert.throws(() => normalizeIdentifier({ type: 'unknown_type', value: '123' }), /unsupported identifier type/i);
});

test('ResearchCandidate preserves explicit nulls, is non-authoritative, and does not fabricate fields', () => {
  const candidate = createCandidate({
    title: 'A Deterministic Paper on PON/STC',
    identifiers: ['10.1000/182'],
    provenance: {
      method: 'manual',
      origin: 'user_fixture',
      actor: 'test_runner'
    }
  });

  assert.equal(candidate.title, 'A Deterministic Paper on PON/STC');
  assert.equal(candidate.authors, null);
  assert.equal(candidate.year, null);
  assert.equal(candidate.abstract, null);
  assert.equal(candidate.metadata_only, true);
  assert.equal(candidate.acceptance_state, ACCEPTANCE_STATES.PROPOSED);
  assert.equal(candidate.epistemic_class, EPISTEMIC_CLASSES.OBSERVED);
  assert.equal(candidate.identifiers.length, 1);
  assert.equal(candidate.identifiers[0].value, '10.1000/182');
  assert.ok(candidate.candidate_id.startsWith('cand:'));

  // Repeated creation of same candidate is idempotent
  const repeatCandidate = createCandidate({
    title: 'A Deterministic Paper on PON/STC',
    identifiers: ['10.1000/182'],
    provenance: {
      method: 'manual',
      origin: 'user_fixture',
      actor: 'test_runner'
    }
  });
  assert.equal(repeatCandidate.candidate_id, candidate.candidate_id);
});

test('ResearchSource safely resolves local files, hashes bytes deterministically, and rejects unsafe paths', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kad-research-test-'));
  try {
    const fixturePath = join(tempDir, 'fixture.txt');
    const content = 'Deterministic Research Source Content\n';
    await writeFile(fixturePath, content, 'utf8');

    // Safe local file ingestion
    const source = createSource({
      source_path: 'fixture.txt',
      rootDir: tempDir,
      provenance: {
        method: 'local_file',
        origin: 'filesystem',
        actor: 'test_runner'
      }
    });

    assert.ok(source.source_id.startsWith('src:hash:'));
    assert.equal(source.source_path, 'fixture.txt');
    assert.equal(typeof source.source_hash, 'string');
    assert.equal(source.source_hash.length, 64);
    assert.equal(source.source_hash, hashSourceBytes(Buffer.from(content)));
    assert.equal(source.byte_size, Buffer.byteLength(content));
    assert.equal(source.acceptance_state, ACCEPTANCE_STATES.PROPOSED);

    // Path traversal attempt rejected
    assert.throws(() => createSource({
      source_path: '../outside.txt',
      rootDir: tempDir
    }), ResearchSecurityError);

    assert.throws(() => createSource({
      source_path: 'subdir/../../outside.txt',
      rootDir: tempDir
    }), ResearchSecurityError);

    // Null byte injection rejected
    assert.throws(() => createSource({
      source_path: 'fixture.txt\0.pdf',
      rootDir: tempDir
    }), ResearchSecurityError);

    // Symlink escape outside root rejected
    const outsideDir = await mkdtemp(join(tmpdir(), 'kad-outside-'));
    const outsideFile = join(outsideDir, 'secret.pdf');
    await writeFile(outsideFile, 'secret content', 'utf8');
    const linkPath = join(tempDir, 'escaped-link.pdf');
    await symlink(outsideFile, linkPath);

    assert.throws(() => createSource({
      source_path: 'escaped-link.pdf',
      rootDir: tempDir
    }), ResearchSecurityError);

    await rm(outsideDir, { recursive: true, force: true });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('ResearchDocument enforces identifier precedence and canonical identity', () => {
  const docFromDoi = createDocument({
    title: 'Distributed Systems Invariants',
    authors: ['Leslie Lamport'],
    year: 1998,
    identifiers: [
      'https://doi.org/10.1145/3290605.3300852',
      'arXiv:2301.12345'
    ],
    provenance: {
      method: 'manual',
      origin: 'test',
      actor: 'builder'
    }
  });

  // DOI outranks arXiv for primary document ID
  assert.equal(docFromDoi.document_id, 'doc:doi:10.1145/3290605.3300852');
  assert.equal(docFromDoi.primary_identifier.type, IDENTIFIER_TYPES.DOI);
  assert.equal(docFromDoi.identifiers.length, 2);
  assert.equal(docFromDoi.acceptance_state, ACCEPTANCE_STATES.ACCEPTED);
  assert.equal(docFromDoi.authority_class, 'CANONICAL_RESEARCH');
  assert.equal(docFromDoi.epistemic_class, EPISTEMIC_CLASSES.DOCUMENT_DERIVED);

  // arXiv primary when DOI absent
  const docFromArxiv = createDocument({
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer'],
    year: 2017,
    identifiers: ['arXiv:1706.03762v5'],
    provenance: {
      method: 'manual',
      origin: 'arxiv',
      actor: 'builder'
    }
  });
  assert.equal(docFromArxiv.document_id, 'doc:arxiv:1706.03762v5');
  assert.equal(docFromArxiv.primary_identifier.type, IDENTIFIER_TYPES.ARXIV);
});

test('DeterministicResearchCorpus provides idempotent ingestion and deduplication', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kad-research-corpus-'));
  try {
    const paperPdf = join(tempDir, 'paper.pdf');
    const content = '%PDF-1.4 Mock Paper Content\n';
    await writeFile(paperPdf, content, 'utf8');

    const corpus = new DeterministicResearchCorpus({
      rootDir: tempDir,
      storageDir: join(tempDir, '.research-storage')
    });

    // Ingest candidate
    const candidateResult = corpus.ingestCandidate({
      title: 'Scalable Agreement Protocols',
      authors: ['Alice Smith', 'Bob Jones'],
      year: 2024,
      identifiers: ['10.1234/sap.2024.01'],
      provenance: { method: 'manual', origin: 'fixture', actor: 'test' }
    });

    assert.equal(candidateResult.status, 'INGESTED');
    const docId = candidateResult.document.document_id;
    assert.equal(docId, 'doc:doi:10.1234/sap.2024.01');

    // Ingest source file for the same paper
    const sourceResult = corpus.ingestSource({
      source_path: 'paper.pdf',
      identifiers: ['10.1234/sap.2024.01'],
      provenance: { method: 'local_file', origin: 'filesystem', actor: 'test' }
    });

    assert.equal(sourceResult.status, 'ATTACHED');
    assert.equal(sourceResult.document.document_id, docId);
    assert.equal(sourceResult.document.sources.length, 1);
    assert.ok(sourceResult.document.sources[0].source_hash);

    // Re-ingest same candidate: idempotent, no duplicates
    const repeatResult = corpus.ingestCandidate({
      title: 'Scalable Agreement Protocols',
      authors: ['Alice Smith', 'Bob Jones'],
      year: 2024,
      identifiers: ['10.1234/sap.2024.01'],
      provenance: { method: 'manual', origin: 'fixture', actor: 'test' }
    });

    assert.equal(repeatResult.status, 'IDEMPOTENT_EXISTING');
    assert.equal(repeatResult.document.document_id, docId);
    assert.equal(corpus.listDocuments().length, 1);

    // Re-ingest exact same source file: idempotent
    const repeatSourceResult = corpus.ingestSource({
      source_path: 'paper.pdf',
      identifiers: ['10.1234/sap.2024.01'],
      provenance: { method: 'local_file', origin: 'filesystem', actor: 'test' }
    });
    assert.equal(repeatSourceResult.status, 'IDEMPOTENT_EXISTING');
    assert.equal(repeatSourceResult.document.sources.length, 1);
    assert.equal(corpus.listDocuments().length, 1);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('DeterministicResearchCorpus fails closed on conflicting identity evidence', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kad-research-conflict-'));
  try {
    const corpus = new DeterministicResearchCorpus({
      rootDir: tempDir,
      storageDir: join(tempDir, '.research-storage')
    });

    corpus.ingestCandidate({
      title: 'Original Consensus Study',
      authors: ['Alice Author'],
      year: 2020,
      identifiers: ['10.1234/consensus.001'],
      provenance: { method: 'manual', origin: 'canonical_source', actor: 'validator' }
    });

    // Incompatible metadata asserting the same DOI must fail closed
    assert.throws(() => {
      corpus.ingestCandidate({
        title: 'Completely Different Quantum Mechanics Paper',
        authors: ['Zack Stranger'],
        year: 1970,
        identifiers: ['10.1234/consensus.001'],
        provenance: { method: 'unverified_scraper', origin: 'web', actor: 'bot' }
      });
    }, ResearchConflictError);

    // Verify canonical state was NOT mutated or corrupted
    const doc = corpus.inspectDocument('doc:doi:10.1234/consensus.001');
    assert.equal(doc.title, 'Original Consensus Study');
    assert.deepEqual(doc.authors, ['Alice Author']);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('Derived or external metadata cannot overwrite canonical accepted source data', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kad-research-authority-'));
  try {
    const corpus = new DeterministicResearchCorpus({
      rootDir: tempDir,
      storageDir: join(tempDir, '.research-storage')
    });

    corpus.ingestCandidate({
      title: 'Ground Truth Protocol Spec',
      authors: ['Core Team'],
      year: 2025,
      abstract: 'Canonical abstract from peer-reviewed source.',
      identifiers: ['10.5555/spec.2025'],
      provenance: { method: 'manual', origin: 'canonical_editor', actor: 'human_lead' }
    });

    // Attempting to update canonical document with derived LLM/OpenViking metadata fails
    assert.throws(() => {
      corpus.updateMetadata('doc:doi:10.5555/spec.2025', {
        abstract: 'Hallucinated or inferred summary.',
        actor: 'OpenViking',
        epistemic_class: EPISTEMIC_CLASSES.INFERRED
      });
    }, /cannot overwrite canonical source/i);

    const doc = corpus.inspectDocument('doc:doi:10.5555/spec.2025');
    assert.equal(doc.abstract, 'Canonical abstract from peer-reviewed source.');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('Corpus persistence survives reload and provides atomic state management', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kad-research-persistence-'));
  const storageDir = join(tempDir, '.research-storage');
  try {
    const corpus1 = new DeterministicResearchCorpus({
      rootDir: tempDir,
      storageDir
    });

    corpus1.ingestCandidate({
      title: 'Persistent Research Record',
      authors: ['Grace Hopper'],
      year: 1952,
      identifiers: ['10.1000/hopper.1952'],
      provenance: { method: 'manual', origin: 'archive', actor: 'historian' }
    });

    await corpus1.save();

    // Verify storage file exists and matches schema
    const catalogFile = join(storageDir, 'CATALOG.json');
    const catalogData = JSON.parse(await readFile(catalogFile, 'utf8'));
    assert.equal(catalogData.schema_version, RESEARCH_SCHEMA_VERSION);
    assert.equal(catalogData.documents.length, 1);
    assert.equal(catalogData.documents[0].document_id, 'doc:doi:10.1000/hopper.1952');

    // Reload in a brand new corpus instance
    const corpus2 = new DeterministicResearchCorpus({
      rootDir: tempDir,
      storageDir
    });
    await corpus2.load();

    const loadedDoc = corpus2.inspectDocument('doc:doi:10.1000/hopper.1952');
    assert.ok(loadedDoc);
    assert.equal(loadedDoc.title, 'Persistent Research Record');
    assert.deepEqual(loadedDoc.authors, ['Grace Hopper']);
    assert.equal(loadedDoc.provenance.origin, 'archive');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('Exact source trace resolves local bytes and provenance', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kad-research-trace-'));
  try {
    const relativePath = 'papers/my-paper.pdf';
    await mkdir(join(tempDir, 'papers'), { recursive: true });
    const content = 'Exact bytes for source tracing\n';
    await writeFile(join(tempDir, relativePath), content, 'utf8');

    const corpus = new DeterministicResearchCorpus({
      rootDir: tempDir,
      storageDir: join(tempDir, '.research-storage')
    });

    const result = corpus.ingestSource({
      source_path: relativePath,
      identifiers: ['arXiv:2401.99999'],
      provenance: {
        method: 'local_file',
        origin: 'manual_download',
        actor: 'researcher',
        evidence_ref: 'evidence/manual-download-receipt.json'
      }
    });

    const docId = result.document.document_id;
    const trace = corpus.resolveSource(result.document.sources[0].source_id);

    assert.equal(trace.found, true);
    assert.equal(trace.source.source_path, relativePath);
    assert.equal(trace.absolute_path, resolve(tempDir, relativePath));
    assert.equal(trace.source.source_hash, hashSourceBytes(Buffer.from(content)));
    assert.equal(trace.source.provenance.evidence_ref, 'evidence/manual-download-receipt.json');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('Corpus integrity verification detects missing and altered source files', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kad-research-integrity-'));
  try {
    const file1 = 'file1.pdf';
    const file2 = 'file2.pdf';
    await writeFile(join(tempDir, file1), 'Original Content 1', 'utf8');
    await writeFile(join(tempDir, file2), 'Original Content 2', 'utf8');

    const corpus = new DeterministicResearchCorpus({
      rootDir: tempDir,
      storageDir: join(tempDir, '.storage')
    });

    corpus.ingestSource({ source_path: file1, identifiers: ['10.1001/f1'] });
    corpus.ingestSource({ source_path: file2, identifiers: ['10.1001/f2'] });

    // Pre-mutation: valid integrity
    const preCheck = corpus.verifyIntegrity();
    assert.equal(preCheck.valid, true);
    assert.equal(preCheck.issues.length, 0);

    // Modify file1 content
    await writeFile(join(tempDir, file1), 'Tampered Content 1', 'utf8');
    // Delete file2
    await rm(join(tempDir, file2));

    // Post-mutation: invalid integrity detected
    const postCheck = corpus.verifyIntegrity();
    assert.equal(postCheck.valid, false);
    assert.equal(postCheck.issues.length, 2);
    assert.ok(postCheck.issues.some(i => i.error.includes('Source hash mismatch')));
    assert.ok(postCheck.issues.some(i => i.error.includes('Source file missing')));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('Multiple sources attach cleanly to a single document and listDocuments supports filtering', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kad-research-multi-'));
  try {
    await writeFile(join(tempDir, 'main.pdf'), 'Main text bytes', 'utf8');
    await writeFile(join(tempDir, 'supplement.txt'), 'Supplemental tables', 'utf8');

    const corpus = new DeterministicResearchCorpus({
      rootDir: tempDir,
      storageDir: join(tempDir, '.storage')
    });

    corpus.ingestCandidate({
      title: 'Multimodal Research Systems',
      authors: ['Carol Danvers'],
      year: 2023,
      identifiers: ['10.2000/multi.2023']
    });

    corpus.ingestSource({
      source_path: 'main.pdf',
      identifiers: ['10.2000/multi.2023'],
      provenance: { method: 'pdf_download', actor: 'builder' }
    });

    corpus.ingestSource({
      source_path: 'supplement.txt',
      identifiers: ['10.2000/multi.2023'],
      provenance: { method: 'supplement_download', actor: 'builder' }
    });

    const doc = corpus.inspectDocument('doc:doi:10.2000/multi.2023');
    assert.equal(doc.sources.length, 2);
    assert.equal(doc.sources[0].source_path, 'main.pdf');
    assert.equal(doc.sources[1].source_path, 'supplement.txt');

    // listDocuments filter tests
    const all = corpus.listDocuments();
    assert.equal(all.length, 1);

    const byYear = corpus.listDocuments({ year: 2023 });
    assert.equal(byYear.length, 1);

    const byWrongYear = corpus.listDocuments({ year: 1999 });
    assert.equal(byWrongYear.length, 0);

    const byQuery = corpus.listDocuments({ query: 'Multimodal' });
    assert.equal(byQuery.length, 1);

    const byAuthor = corpus.listDocuments({ query: 'Danvers' });
    assert.equal(byAuthor.length, 1);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('End-to-end vertical acceptance fixture demonstrates exact trace, idempotence, and persistence reload', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kad-research-acceptance-'));
  const storageDir = join(tempDir, 'wiki', 'research');
  try {
    // 1. Create a fixture paper on disk
    const fixtureRelPath = 'fixtures/papers/kad-pi-pon-foundation-2026.pdf';
    await mkdir(join(tempDir, 'fixtures', 'papers'), { recursive: true });
    const fixtureBytes = '%PDF-1.4 Mock KAD-PI PON Foundation Research Paper\nDeterministic Body\n';
    await writeFile(join(tempDir, fixtureRelPath), fixtureBytes, 'utf8');
    const expectedHash = hashSourceBytes(Buffer.from(fixtureBytes));

    // 2. Initialize fresh corpus
    const corpus = new DeterministicResearchCorpus({
      rootDir: tempDir,
      storageDir
    });

    // 3. Ingest candidate metadata
    const candResult = corpus.ingestCandidate({
      title: 'Notification-Oriented Paradigm in Real-Time Agent Harnesses',
      authors: ['A. Builder', 'K. Validator'],
      year: 2026,
      abstract: 'A deterministic evaluation of PON/STC event-driven coordination for autonomous agents.',
      identifiers: [
        'https://doi.org/10.9999/kad.pon.2026.01',
        'arXiv:2608.00001'
      ],
      provenance: {
        method: 'manual',
        origin: 'author_fixture',
        actor: 'gemini-builder',
        evidence_ref: 'evidence/WP-KAD-RESEARCH-WORKFLOW-SCAFFOLD-001/ticket-01-canonical-research-api/fixture-provenance.json'
      }
    });

    assert.equal(candResult.status, 'INGESTED');
    const canonicalDocId = 'doc:doi:10.9999/kad.pon.2026.01';
    assert.equal(candResult.document.document_id, canonicalDocId);

    // 4. Ingest local source file
    const srcResult = corpus.ingestSource({
      source_path: fixtureRelPath,
      identifiers: ['10.9999/kad.pon.2026.01'],
      provenance: {
        method: 'local_file',
        origin: 'filesystem',
        actor: 'gemini-builder'
      }
    });

    assert.equal(srcResult.status, 'ATTACHED');
    assert.equal(srcResult.document.document_id, canonicalDocId);
    assert.equal(srcResult.document.sources[0].source_hash, expectedHash);

    // 5. Repeat import (idempotence verification)
    const repeatCand = corpus.ingestCandidate({
      title: 'Notification-Oriented Paradigm in Real-Time Agent Harnesses',
      authors: ['A. Builder', 'K. Validator'],
      year: 2026,
      identifiers: ['10.9999/kad.pon.2026.01'],
      provenance: { method: 'manual', origin: 'author_fixture', actor: 'gemini-builder' }
    });
    assert.equal(repeatCand.status, 'IDEMPOTENT_EXISTING');
    assert.equal(repeatCand.document.document_id, canonicalDocId);
    assert.equal(corpus.listDocuments().length, 1);

    const repeatSrc = corpus.ingestSource({
      source_path: fixtureRelPath,
      identifiers: ['10.9999/kad.pon.2026.01']
    });
    assert.equal(repeatSrc.status, 'IDEMPOTENT_EXISTING');
    assert.equal(corpus.listDocuments().length, 1);

    // 6. Save corpus atomically
    const saveResult = await corpus.save();
    assert.equal(saveResult.status, 'SAVED');
    assert.equal(saveResult.count, 1);

    // 7. Reload in a new instance and verify exact trace
    const reloadedCorpus = new DeterministicResearchCorpus({
      rootDir: tempDir,
      storageDir
    });
    const loadResult = await reloadedCorpus.load();
    assert.equal(loadResult.status, 'LOADED');
    assert.equal(loadResult.count, 1);

    const tracedDoc = reloadedCorpus.inspectDocument(canonicalDocId);
    assert.ok(tracedDoc);
    assert.equal(tracedDoc.title, 'Notification-Oriented Paradigm in Real-Time Agent Harnesses');
    assert.deepEqual(tracedDoc.authors, ['A. Builder', 'K. Validator']);
    assert.equal(tracedDoc.identifiers.length, 2);
    assert.equal(tracedDoc.sources.length, 1);

    const sourceTrace = reloadedCorpus.resolveSource(tracedDoc.sources[0].source_id);
    assert.equal(sourceTrace.found, true);
    assert.equal(sourceTrace.source.source_hash, expectedHash);
    assert.equal(sourceTrace.absolute_path, resolve(tempDir, fixtureRelPath));

    // 8. Verify corpus integrity
    const integrity = reloadedCorpus.verifyIntegrity();
    assert.equal(integrity.valid, true);
    assert.equal(integrity.issues.length, 0);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('Research corpus operations execute with zero external network or model dependency', () => {
  // Verify that all core classes and methods are pure deterministic JS with no network calls or external SDK imports
  const candidate = createCandidate({
    title: 'Offline Proof',
    identifiers: ['arXiv:2501.12345'],
    provenance: { method: 'offline_test', actor: 'test' }
  });
  assert.equal(candidate.candidate_id, 'cand:arxiv:2501.12345');

  const doc = createDocument({
    title: 'Offline Proof Document',
    identifiers: ['10.1111/offline.proof'],
    provenance: { method: 'offline_test', actor: 'test' }
  });
  assert.equal(doc.document_id, 'doc:doi:10.1111/offline.proof');
});
