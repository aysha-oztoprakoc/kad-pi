import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, writeFileSync, unlinkSync } from 'node:fs';

import {
  loadCatalog,
  loadTaxonomy,
  loadRetrievalIndex,
  lookupTerm,
  searchKnowledgeBase,
  verifyKnowledgeBase,
  parseCliArgs
} from '../librarian.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '../../..');
const WIKI_DIR = resolve(ROOT_DIR, 'wiki');
const SYNTHETIC_DIR = resolve(WIKI_DIR, 'synthetic');
const CATALOG_PATH = resolve(SYNTHETIC_DIR, 'CATALOG.json');
const TAXONOMY_PATH = resolve(SYNTHETIC_DIR, 'TAXONOMY.json');
const RETRIEVAL_INDEX_PATH = resolve(SYNTHETIC_DIR, 'RETRIEVAL_INDEX.jsonl');

test('Librarian Knowledge Base Verification Suite', async (t) => {
  await t.test('1. Catalog and Taxonomy files exist on disk', () => {
    assert.ok(existsSync(CATALOG_PATH), `CATALOG.json must exist at ${CATALOG_PATH}`);
    assert.ok(existsSync(TAXONOMY_PATH), `TAXONOMY.json must exist at ${TAXONOMY_PATH}`);
    assert.ok(existsSync(RETRIEVAL_INDEX_PATH), `RETRIEVAL_INDEX.jsonl must exist at ${RETRIEVAL_INDEX_PATH}`);
  });

  await t.test('2. Catalog conforms to schema, all indexed files exist, and epistemic tags are valid', () => {
    const catalog = loadCatalog(CATALOG_PATH);
    assert.ok(Array.isArray(catalog.documents), 'Catalog must contain a documents array');
    assert.ok(catalog.documents.length >= 10, 'Catalog must index at least 10 documents');

    const validEpistemicClasses = [
      'SOURCE_DERIVED',
      'DESIGN_DECISION',
      'HYPOTHESIS',
      'EXPERIMENT',
      'OBSERVED',
      'CONFIRMED'
    ];

    for (const doc of catalog.documents) {
      assert.ok(doc.id, 'Document must have an ID');
      assert.ok(doc.title, `Document ${doc.id} must have a title`);
      assert.ok(doc.path, `Document ${doc.id} must have a path`);
      assert.ok(doc.type, `Document ${doc.id} must have a type`);
      assert.ok(doc.domain, `Document ${doc.id} must have a domain`);
      assert.ok(
        validEpistemicClasses.includes(doc.epistemic_status),
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
      assert.ok(c.epistemic_class, `Concept ${concept} must have an epistemic_class`);
      assert.ok(c.definition, `Concept ${concept} must have a definition`);
    }
  });

  await t.test('4. Retrieval Index has valid JSONL entries and links', () => {
    const indexEntries = loadRetrievalIndex(RETRIEVAL_INDEX_PATH);
    assert.ok(indexEntries.length >= 20, 'Retrieval index must have at least 20 search cards');

    for (const entry of indexEntries) {
      assert.ok(entry.card_id, 'Entry must have card_id');
      assert.ok(entry.doc_id, 'Entry must have doc_id');
      assert.ok(entry.heading, 'Entry must have heading');
      assert.ok(entry.epistemic_status, 'Entry must have epistemic_status');
      assert.ok(Array.isArray(entry.keywords), 'Entry must have keywords array');
      assert.ok(entry.content, 'Entry must have content');
    }
  });

  await t.test('5. lookupTerm resolves exact definitions, case-insensitive, and safely handles edge cases', () => {
    const taxonomy = loadTaxonomy(TAXONOMY_PATH);
    const fiber = lookupTerm('Fiber', taxonomy);
    assert.ok(fiber, 'Lookup for Fiber must return concept definition');
    assert.equal(fiber.domain, 'PON_STC_CORE');

    const fiberLower = lookupTerm('fiber', taxonomy);
    assert.ok(fiberLower, 'Case-insensitive lookup must succeed');
    assert.equal(fiberLower.definition, fiber.definition);

    const intent = lookupTerm('CandidateIntent', taxonomy);
    assert.ok(intent, 'Lookup for CandidateIntent must return definition');
    assert.equal(intent.domain, 'KAD_SIMULATION');

    // Negative & defensive tests
    assert.equal(lookupTerm(undefined, taxonomy), null);
    assert.equal(lookupTerm('', taxonomy), null);
    assert.equal(lookupTerm('NonExistentConceptXYZ', taxonomy), null);
    assert.equal(lookupTerm('Fiber', null), null);
  });

  await t.test('6. searchKnowledgeBase returns ranked results and handles domain/epistemic filters', () => {
    const catalog = loadCatalog(CATALOG_PATH);
    const index = loadRetrievalIndex(RETRIEVAL_INDEX_PATH);

    const ponResults = searchKnowledgeBase('notification causal rule', catalog, { index });
    assert.ok(ponResults.length > 0, 'Search for PON should return matches');
    assert.match(ponResults[0].title + ponResults[0].summary + (ponResults[0].content || ''), /notification|PON|causal/i);

    const filtered = searchKnowledgeBase('quota economics', catalog, {
      index,
      domain: 'SUBSCRIPTION_ECONOMICS'
    });
    assert.ok(filtered.length > 0, 'Filtered search should return domain matches');
    for (const res of filtered) {
      assert.equal(res.domain, 'SUBSCRIPTION_ECONOMICS');
    }

    const epistemicFiltered = searchKnowledgeBase('state diff', catalog, {
      index,
      epistemicStatus: 'OBSERVED'
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

  await t.test('8. verifyKnowledgeBase checks markdown link integrity, frontmatter, and error handling', () => {
    const report = verifyKnowledgeBase({ rootDir: ROOT_DIR, wikiDir: WIKI_DIR });
    assert.equal(report.brokenLinks.length, 0, `Found broken links: ${JSON.stringify(report.brokenLinks)}`);
    assert.equal(report.missingFiles.length, 0, `Found missing files: ${JSON.stringify(report.missingFiles)}`);
    assert.ok(report.validDocumentsCount >= 10, 'Must validate at least 10 documents');
    assert.equal(report.status, 'PASS');

    // Error handling on nonexistent catalog
    const fakeReport = verifyKnowledgeBase({ rootDir: ROOT_DIR, wikiDir: '/tmp/nonexistent-wiki-dir' });
    assert.equal(fakeReport.status, 'FAIL');
    assert.ok(fakeReport.missingFiles.length > 0);
  });
});
