import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';

import {
  loadCatalog,
  loadTaxonomy,
  loadRetrievalIndex,
  lookupTerm,
  searchKnowledgeBase,
  verifyKnowledgeBase,
  parseCliArgs,
  VALID_EPISTEMIC_STATUSES
} from '../librarian.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '../../..');
const WIKI_DIR = resolve(ROOT_DIR, 'wiki');
const SYNTHETIC_DIR = resolve(WIKI_DIR, 'synthetic');
const CATALOG_PATH = resolve(SYNTHETIC_DIR, 'CATALOG.json');
const TAXONOMY_PATH = resolve(SYNTHETIC_DIR, 'TAXONOMY.json');
const RETRIEVAL_INDEX_PATH = resolve(SYNTHETIC_DIR, 'RETRIEVAL_INDEX.jsonl');

test('Librarian Knowledge Base Verification Suite (WP-KAD-LIB-002)', async (t) => {
  await t.test('1. Catalog, Taxonomy, and Index files exist on disk', () => {
    assert.ok(existsSync(CATALOG_PATH), `CATALOG.json must exist at ${CATALOG_PATH}`);
    assert.ok(existsSync(TAXONOMY_PATH), `TAXONOMY.json must exist at ${TAXONOMY_PATH}`);
    assert.ok(existsSync(RETRIEVAL_INDEX_PATH), `RETRIEVAL_INDEX.jsonl must exist at ${RETRIEVAL_INDEX_PATH}`);
  });

  await t.test('2. Catalog conforms to schema, all indexed files exist, and epistemic tags are valid', () => {
    const catalog = loadCatalog(CATALOG_PATH);
    assert.ok(Array.isArray(catalog.documents), 'Catalog must contain a documents array');
    assert.ok(catalog.documents.length >= 10, 'Catalog must index at least 10 documents');

    const seenIds = new Set();
    for (const doc of catalog.documents) {
      assert.ok(doc.id, 'Document must have an ID');
      assert.ok(!seenIds.has(doc.id), `Duplicate document ID: ${doc.id}`);
      seenIds.add(doc.id);

      assert.ok(doc.title, `Document ${doc.id} must have a title`);
      assert.ok(doc.path, `Document ${doc.id} must have a path`);
      assert.ok(doc.type, `Document ${doc.id} must have a type`);
      assert.ok(doc.domain, `Document ${doc.id} must have a domain`);
      assert.ok(
        VALID_EPISTEMIC_STATUSES.includes(doc.epistemic_status),
        `Document ${doc.id} has invalid epistemic status: ${doc.epistemic_status}`
      );
      assert.ok(doc.summary, `Document ${doc.id} must have a summary`);
      assert.ok(Array.isArray(doc.retrieval_keywords), `Document ${doc.id} must have retrieval_keywords`);

      const fullPath = resolve(ROOT_DIR, doc.path);
      assert.ok(existsSync(fullPath), `Document file must exist at ${fullPath}`);
    }
  });

  await t.test('3. Taxonomy conforms to schema and all concept domains exist in taxonomy.domains', () => {
    const taxonomy = loadTaxonomy(TAXONOMY_PATH);
    assert.ok(taxonomy.domains, 'Taxonomy must define domains');
    assert.ok(taxonomy.concepts, 'Taxonomy must define concepts');
    assert.ok(taxonomy.relationships, 'Taxonomy must define relationships');

    const expectedConcepts = [
      'Notification',
      'Fact',
      'Premise',
      'Rule',
      'Effect',
      'Coeffect',
      'Fiber',
      'Context',
      'CandidateIntent',
      'ValidatedIntent',
      'Resolver',
      'StateDiff',
      'GameState',
      'WorkPackage',
      'Evidence'
    ];

    for (const concept of expectedConcepts) {
      assert.ok(taxonomy.concepts[concept], `Taxonomy must define concept: ${concept}`);
      const c = taxonomy.concepts[concept];
      assert.ok(c.domain, `Concept ${concept} must have a domain`);
      assert.ok(
        taxonomy.domains[c.domain],
        `Concept ${concept} domain "${c.domain}" must be declared in taxonomy.domains`
      );
      assert.ok(
        VALID_EPISTEMIC_STATUSES.includes(c.epistemic_class),
        `Concept ${concept} has invalid epistemic class: ${c.epistemic_class}`
      );
      assert.ok(c.definition, `Concept ${concept} must have a definition`);
    }
  });

  await t.test('4. Retrieval Index has valid JSONL entries, valid line numbers, and locators', () => {
    const catalog = loadCatalog(CATALOG_PATH);
    const catalogMap = new Map(catalog.documents.map(d => [d.id, d]));
    const indexEntries = loadRetrievalIndex(RETRIEVAL_INDEX_PATH);
    assert.ok(indexEntries.length >= 20, 'Retrieval index must have at least 20 search cards');

    const seenCardIds = new Set();
    for (const entry of indexEntries) {
      assert.ok(entry.card_id, 'Entry must have card_id');
      assert.ok(!seenCardIds.has(entry.card_id), `Duplicate card_id: ${entry.card_id}`);
      seenCardIds.add(entry.card_id);

      assert.ok(entry.doc_id, 'Entry must have doc_id');
      assert.ok(catalogMap.has(entry.doc_id), `Card ${entry.card_id} doc_id ${entry.doc_id} must exist in catalog`);

      const doc = catalogMap.get(entry.doc_id);
      assert.equal(entry.source_path, doc.path, `Card ${entry.card_id} source_path must match catalog doc.path`);

      const fullPath = resolve(ROOT_DIR, entry.source_path);
      assert.ok(existsSync(fullPath), `Source file for ${entry.card_id} must exist on disk`);

      const fileLines = readFileSync(fullPath, 'utf8').split('\n').length;
      assert.ok(typeof entry.start_line === 'number' && entry.start_line >= 1, `Invalid start_line in ${entry.card_id}`);
      assert.ok(
        typeof entry.end_line === 'number' && entry.end_line >= entry.start_line && entry.end_line <= fileLines,
        `Invalid end_line in ${entry.card_id} (file has ${fileLines} lines, card has ${entry.end_line})`
      );

      assert.equal(
        entry.locator,
        `${entry.source_path}#L${entry.start_line}-L${entry.end_line}`,
        `Card ${entry.card_id} locator mismatch`
      );

      assert.ok(entry.heading, 'Entry must have heading');
      assert.ok(
        VALID_EPISTEMIC_STATUSES.includes(entry.epistemic_status),
        `Invalid epistemic_status in ${entry.card_id}: ${entry.epistemic_status}`
      );
      assert.ok(Array.isArray(entry.keywords), 'Entry must have keywords array');
      assert.ok(entry.content, 'Entry must have content');
    }
  });

  await t.test('5. lookupTerm resolves exact definitions, case-insensitive, and returns locator provenance', () => {
    const taxonomy = loadTaxonomy(TAXONOMY_PATH);
    const fiber = lookupTerm('Fiber', taxonomy, { rootDir: ROOT_DIR });
    assert.ok(fiber, 'Lookup for Fiber must return concept definition');
    assert.equal(fiber.domain, 'PON_STC_CORE');
    assert.equal(fiber.source_path, 'wiki/synthetic/TAXONOMY.json');
    assert.equal(fiber.locator, 'wiki/synthetic/TAXONOMY.json#concept:Fiber');
    assert.ok(fiber.file_uri.startsWith('file://'));

    const fiberLower = lookupTerm('fiber', taxonomy, { rootDir: ROOT_DIR });
    assert.ok(fiberLower, 'Case-insensitive lookup must succeed');
    assert.equal(fiberLower.definition, fiber.definition);

    const intent = lookupTerm('CandidateIntent', taxonomy, { rootDir: ROOT_DIR });
    assert.ok(intent, 'Lookup for CandidateIntent must return definition');
    assert.equal(intent.domain, 'KAD_SIMULATION');

    // Negative & defensive tests
    assert.equal(lookupTerm(undefined, taxonomy), null);
    assert.equal(lookupTerm('', taxonomy), null);
    assert.equal(lookupTerm('NonExistentConceptXYZ', taxonomy), null);
    assert.equal(lookupTerm('Fiber', null), null);
  });

  await t.test('6. searchKnowledgeBase returns ranked results with exact provenance locators', () => {
    const catalog = loadCatalog(CATALOG_PATH);
    const index = loadRetrievalIndex(RETRIEVAL_INDEX_PATH);

    const ponResults = searchKnowledgeBase('notification causal rule', catalog, { index, rootDir: ROOT_DIR });
    assert.ok(ponResults.length > 0, 'Search for PON should return matches');
    assert.match(ponResults[0].title + ponResults[0].summary + (ponResults[0].content || ''), /notification|PON|causal/i);

    // Provenance verification on all search results
    for (const res of ponResults) {
      assert.ok(res.source_path, `Search result ${res.title} must have source_path`);
      assert.ok(res.start_line >= 1, `Search result ${res.title} must have start_line >= 1`);
      assert.ok(res.end_line >= res.start_line, `Search result ${res.title} must have end_line >= start_line`);
      assert.ok(res.locator, `Search result ${res.title} must have locator`);
      assert.ok(res.file_uri.startsWith('file://'), `Search result ${res.title} must have file_uri`);
    }

    const filtered = searchKnowledgeBase('quota economics', catalog, {
      index,
      domain: 'SUBSCRIPTION_ECONOMICS',
      rootDir: ROOT_DIR
    });
    assert.ok(filtered.length > 0, 'Filtered search should return domain matches');
    for (const res of filtered) {
      assert.equal(res.domain, 'SUBSCRIPTION_ECONOMICS');
    }

    const epistemicFiltered = searchKnowledgeBase('state diff', catalog, {
      index,
      epistemicStatus: 'OBSERVED',
      rootDir: ROOT_DIR
    });
    for (const res of epistemicFiltered) {
      assert.equal(res.epistemic_status, 'OBSERVED');
    }

    // Negative & empty query tests
    assert.deepEqual(searchKnowledgeBase('', catalog), []);
    assert.deepEqual(searchKnowledgeBase(null, catalog), []);
    assert.deepEqual(searchKnowledgeBase('zzzzzzzznonexistentword', catalog), []);
  });

  await t.test('7. parseCliArgs correctly handles flags, options, and positional queries', () => {
    const parsed1 = parseCliArgs(['search', 'PON', 'causality', '--domain', 'PON_STC_CORE', '--limit', '5']);
    assert.equal(parsed1.command, 'search');
    assert.equal(parsed1.query, 'PON causality');
    assert.equal(parsed1.options.domain, 'PON_STC_CORE');
    assert.equal(parsed1.options.limit, 5);

    const parsed2 = parseCliArgs(['lookup', 'Fiber']);
    assert.equal(parsed2.command, 'lookup');
    assert.equal(parsed2.positional[0], 'Fiber');

    const parsed3 = parseCliArgs(['verify']);
    assert.equal(parsed3.command, 'verify');
  });

  await t.test('8. Deep verifyKnowledgeBase passes on live knowledge base', () => {
    const report = verifyKnowledgeBase({ rootDir: ROOT_DIR, wikiDir: WIKI_DIR });
    assert.equal(report.status, 'PASS', `Verifier failed with errors: ${JSON.stringify(report.errors)}`);
    assert.equal(report.brokenLinks.length, 0, `Found broken links: ${JSON.stringify(report.brokenLinks)}`);
    assert.equal(report.missingFiles.length, 0, `Found missing files: ${JSON.stringify(report.missingFiles)}`);
    assert.equal(report.corruptedLocators.length, 0, `Found corrupted locators: ${JSON.stringify(report.corruptedLocators)}`);
    assert.equal(report.invalidSchemas.length, 0, `Found invalid schemas: ${JSON.stringify(report.invalidSchemas)}`);
    assert.ok(report.validDocumentsCount >= 20, 'Must validate at least 20 documents');
    assert.ok(report.validCardsCount >= 20, 'Must validate at least 20 retrieval cards');
    assert.ok(report.validConceptsCount >= 15, 'Must validate at least 15 taxonomy concepts');
  });

  await t.test('9. Failure Injection: verifyKnowledgeBase detects corrupted relationships', () => {
    const tempDir = resolve('/tmp/librarian-corrupt-test-' + Date.now());
    mkdirSync(join(tempDir, 'synthetic'), { recursive: true });

    try {
      // 1. Corrupted doc_id in RETRIEVAL_INDEX
      writeFileSync(
        join(tempDir, 'synthetic/CATALOG.json'),
        JSON.stringify({
          schema_version: '1.0.0',
          documents: [
            {
              id: 'DOC_REAL',
              title: 'Doc',
              path: 'fake.md',
              type: 'synthetic',
              domain: 'DOM_TEST',
              epistemic_status: 'DESIGN_DECISION',
              summary: 'Summary',
              retrieval_keywords: ['test']
            }
          ]
        })
      );
      writeFileSync(join(tempDir, 'fake.md'), '# Fake Doc\nline 1\nline 2\n');
      writeFileSync(
        join(tempDir, 'synthetic/TAXONOMY.json'),
        JSON.stringify({
          domains: { DOM_TEST: 'Test domain' },
          concepts: { TestConcept: { domain: 'DOM_TEST', epistemic_class: 'DESIGN_DECISION', definition: 'Def' } }
        })
      );
      // Index card with unknown doc_id
      writeFileSync(
        join(tempDir, 'synthetic/RETRIEVAL_INDEX.jsonl'),
        JSON.stringify({
          card_id: 'CARD_01',
          doc_id: 'UNKNOWN_DOC_ID',
          source_path: 'fake.md',
          start_line: 1,
          end_line: 2,
          locator: 'fake.md#L1-L2',
          heading: 'Heading',
          epistemic_status: 'DESIGN_DECISION',
          keywords: ['test'],
          content: 'Content'
        }) + '\n'
      );

      const res1 = verifyKnowledgeBase({ rootDir: tempDir, wikiDir: tempDir });
      assert.equal(res1.status, 'FAIL', 'Verifier must fail when doc_id is unknown');
      assert.ok(res1.corruptedLocators.some(c => c.reason.includes('Unresolved doc_id')));

      // 2. Out-of-bounds line range in RETRIEVAL_INDEX
      writeFileSync(
        join(tempDir, 'synthetic/RETRIEVAL_INDEX.jsonl'),
        JSON.stringify({
          card_id: 'CARD_01',
          doc_id: 'DOC_REAL',
          source_path: 'fake.md',
          start_line: 1,
          end_line: 9999, // Exceeds file length of 3 lines
          locator: 'fake.md#L1-L9999',
          heading: 'Heading',
          epistemic_status: 'DESIGN_DECISION',
          keywords: ['test'],
          content: 'Content'
        }) + '\n'
      );

      const res2 = verifyKnowledgeBase({ rootDir: tempDir, wikiDir: tempDir });
      assert.equal(res2.status, 'FAIL', 'Verifier must fail when line range exceeds file lines');
      assert.ok(res2.corruptedLocators.some(c => c.reason.includes('Invalid line range')));

      // 3. Undeclared domain in TAXONOMY
      writeFileSync(
        join(tempDir, 'synthetic/TAXONOMY.json'),
        JSON.stringify({
          domains: { DOM_TEST: 'Test domain' },
          concepts: { BadConcept: { domain: 'NON_EXISTENT_DOMAIN', epistemic_class: 'DESIGN_DECISION', definition: 'Def' } }
        })
      );
      const res3 = verifyKnowledgeBase({ rootDir: tempDir, wikiDir: tempDir });
      assert.equal(res3.status, 'FAIL', 'Verifier must fail on undeclared domain');
      assert.ok(res3.errors.some(e => e.includes('undeclared domain')));

      // 4. Invalid epistemic status in CATALOG
      writeFileSync(
        join(tempDir, 'synthetic/CATALOG.json'),
        JSON.stringify({
          schema_version: '1.0.0',
          documents: [
            {
              id: 'DOC_REAL',
              title: 'Doc',
              path: 'fake.md',
              type: 'synthetic',
              domain: 'DOM_TEST',
              epistemic_status: 'INVALID_STATUS_XYZ',
              summary: 'Summary',
              retrieval_keywords: ['test']
            }
          ]
        })
      );
      const res4 = verifyKnowledgeBase({ rootDir: tempDir, wikiDir: tempDir });
      assert.equal(res4.status, 'FAIL', 'Verifier must fail on invalid epistemic status');
      assert.ok(res4.errors.some(e => e.includes('invalid epistemic_status')));
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
