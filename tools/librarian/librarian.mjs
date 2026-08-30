#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const VALID_EPISTEMIC_STATUSES = Object.freeze([
  'SOURCE_DERIVED',
  'DESIGN_DECISION',
  'HYPOTHESIS',
  'EXPERIMENT',
  'OBSERVED',
  'CONFIRMED'
]);

/**
 * Loads and parses CATALOG.json
 * @param {string} catalogPath
 * @returns {object}
 */
export function loadCatalog(catalogPath) {
  if (!existsSync(catalogPath)) {
    throw new Error(`Catalog file not found at: ${catalogPath}`);
  }
  try {
    const raw = readFileSync(catalogPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse catalog JSON at ${catalogPath}: ${err.message}`);
  }
}

/**
 * Loads and parses TAXONOMY.json
 * @param {string} taxonomyPath
 * @returns {object}
 */
export function loadTaxonomy(taxonomyPath) {
  if (!existsSync(taxonomyPath)) {
    throw new Error(`Taxonomy file not found at: ${taxonomyPath}`);
  }
  try {
    const raw = readFileSync(taxonomyPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse taxonomy JSON at ${taxonomyPath}: ${err.message}`);
  }
}

/**
 * Loads and parses RETRIEVAL_INDEX.jsonl
 * @param {string} indexPath
 * @returns {Array<object>}
 */
export function loadRetrievalIndex(indexPath) {
  if (!existsSync(indexPath)) {
    throw new Error(`Retrieval index file not found at: ${indexPath}`);
  }
  try {
    const raw = readFileSync(indexPath, 'utf8');
    return raw
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, idx) => {
        try {
          return JSON.parse(line);
        } catch (err) {
          throw new Error(`Malformed JSONL entry on line ${idx + 1}: ${err.message}`);
        }
      });
  } catch (err) {
    throw new Error(`Failed to read retrieval index at ${indexPath}: ${err.message}`);
  }
}

/**
 * Looks up a term in the taxonomy ontology
 * @param {string} term
 * @param {object} taxonomy
 * @param {object} options
 * @returns {object|null}
 */
export function lookupTerm(term, taxonomy, options = {}) {
  if (!term || typeof term !== 'string' || !taxonomy || !taxonomy.concepts) {
    return null;
  }
  const cleanTerm = term.trim();
  if (!cleanTerm) return null;

  let conceptKey = cleanTerm;
  let direct = taxonomy.concepts[cleanTerm];

  if (!direct) {
    // Case-insensitive fallback or synonym search
    const lower = cleanTerm.toLowerCase();
    for (const [key, val] of Object.entries(taxonomy.concepts)) {
      if (key.toLowerCase() === lower) {
        conceptKey = key;
        direct = val;
        break;
      }
      if (val.synonyms && val.synonyms.some(s => s.toLowerCase() === lower)) {
        conceptKey = key;
        direct = val;
        break;
      }
    }
  }

  if (!direct) return null;

  const rootDir = options.rootDir || process.cwd();
  const sourcePath = 'wiki/synthetic/TAXONOMY.json';
  const fullPath = resolve(rootDir, sourcePath);

  return {
    term: conceptKey,
    ...direct,
    source_path: sourcePath,
    locator: `${sourcePath}#concept:${conceptKey}`,
    file_uri: `${pathToFileURL(fullPath).href}#concept:${conceptKey}`
  };
}

/**
 * Searches knowledge base documents and retrieval index cards with exact provenance
 * @param {string} query
 * @param {object} catalog
 * @param {object} options
 * @returns {Array<object>}
 */
export function searchKnowledgeBase(query, catalog, options = {}) {
  const { index = [], domain, epistemicStatus, limit = 10, rootDir = process.cwd() } = options;
  if (!query || typeof query !== 'string') return [];
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const catalogMap = new Map();
  for (const doc of catalog?.documents || []) {
    if (doc.id) catalogMap.set(doc.id, doc);
  }

  const scoredDocs = [];

  for (const doc of catalog?.documents || []) {
    if (domain && doc.domain !== domain) continue;
    if (epistemicStatus && doc.epistemic_status !== epistemicStatus) continue;

    let score = 0;
    const titleLower = (doc.title || '').toLowerCase();
    const summaryLower = (doc.summary || '').toLowerCase();
    const keywords = (doc.retrieval_keywords || []).map(k => k.toLowerCase());

    for (const term of terms) {
      if (titleLower.includes(term)) score += 10;
      if (keywords.some(k => k.includes(term))) score += 5;
      if (summaryLower.includes(term)) score += 2;
    }

    if (score > 0) {
      const fullPath = resolve(rootDir, doc.path);
      scoredDocs.push({
        ...doc,
        source_path: doc.path,
        start_line: 1,
        end_line: 1,
        locator: `${doc.path}#L1`,
        file_uri: pathToFileURL(fullPath).href,
        matchType: 'document',
        score
      });
    }
  }

  // Also score retrieval cards
  for (const card of index) {
    if (domain && card.domain && card.domain !== domain) continue;
    if (epistemicStatus && card.epistemic_status !== epistemicStatus) continue;

    let score = 0;
    const headingLower = (card.heading || '').toLowerCase();
    const contentLower = (card.content || '').toLowerCase();
    const keywords = (card.keywords || []).map(k => k.toLowerCase());

    for (const term of terms) {
      if (headingLower.includes(term)) score += 8;
      if (keywords.some(k => k.includes(term))) score += 4;
      if (contentLower.includes(term)) score += 2;
    }

    if (score > 0) {
      const doc = catalogMap.get(card.doc_id);
      const sourcePath = card.source_path || doc?.path || 'unknown';
      const startLine = card.start_line || 1;
      const endLine = card.end_line || startLine;
      const fullPath = resolve(rootDir, sourcePath);
      const locator = card.locator || `${sourcePath}#L${startLine}-L${endLine}`;

      scoredDocs.push({
        id: card.card_id,
        doc_id: card.doc_id,
        title: card.heading,
        domain: card.domain || doc?.domain || 'SYNTHETIC_CARD',
        epistemic_status: card.epistemic_status,
        summary: card.content,
        source_path: sourcePath,
        start_line: startLine,
        end_line: endLine,
        locator,
        file_uri: `${pathToFileURL(fullPath).href}#L${startLine}-L${endLine}`,
        matchType: 'chunk',
        score
      });
    }
  }

  scoredDocs.sort((a, b) => b.score - a.score);
  return scoredDocs.slice(0, limit);
}

/**
 * Deeply validates catalog, taxonomy, retrieval index, provenance locators, frontmatter, and links
 * @param {object} param0
 * @returns {object}
 */
export function verifyKnowledgeBase({ rootDir, wikiDir }) {
  const errors = [];
  const missingFiles = [];
  const brokenLinks = [];
  const corruptedLocators = [];
  const invalidSchemas = [];
  let validDocumentsCount = 0;
  let validCardsCount = 0;
  let validConceptsCount = 0;

  const catalogPath = resolve(wikiDir, 'synthetic/CATALOG.json');
  const taxonomyPath = resolve(wikiDir, 'synthetic/TAXONOMY.json');
  const indexPath = resolve(wikiDir, 'synthetic/RETRIEVAL_INDEX.jsonl');

  // 1. Validate CATALOG.json existence and schema
  if (!existsSync(catalogPath)) {
    return {
      status: 'FAIL',
      errors: ['Missing CATALOG.json'],
      missingFiles: ['wiki/synthetic/CATALOG.json'],
      brokenLinks: [],
      corruptedLocators: [],
      invalidSchemas: ['CATALOG.json'],
      validDocumentsCount: 0,
      validCardsCount: 0,
      validConceptsCount: 0
    };
  }

  let catalog;
  try {
    catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  } catch (err) {
    return {
      status: 'FAIL',
      errors: [`Failed to parse CATALOG.json: ${err.message}`],
      missingFiles: [],
      brokenLinks: [],
      corruptedLocators: [],
      invalidSchemas: ['CATALOG.json'],
      validDocumentsCount: 0,
      validCardsCount: 0,
      validConceptsCount: 0
    };
  }

  // 2. Validate TAXONOMY.json existence and schema
  if (!existsSync(taxonomyPath)) {
    return {
      status: 'FAIL',
      errors: ['Missing TAXONOMY.json'],
      missingFiles: ['wiki/synthetic/TAXONOMY.json'],
      brokenLinks: [],
      corruptedLocators: [],
      invalidSchemas: ['TAXONOMY.json'],
      validDocumentsCount: 0,
      validCardsCount: 0,
      validConceptsCount: 0
    };
  }

  let taxonomy;
  try {
    taxonomy = JSON.parse(readFileSync(taxonomyPath, 'utf8'));
  } catch (err) {
    return {
      status: 'FAIL',
      errors: [`Failed to parse TAXONOMY.json: ${err.message}`],
      missingFiles: [],
      brokenLinks: [],
      corruptedLocators: [],
      invalidSchemas: ['TAXONOMY.json'],
      validDocumentsCount: 0,
      validCardsCount: 0,
      validConceptsCount: 0
    };
  }

  if (!taxonomy.domains || typeof taxonomy.domains !== 'object') {
    invalidSchemas.push('TAXONOMY.json: missing domains object');
    errors.push('TAXONOMY.json must define domains');
  }

  if (!taxonomy.concepts || typeof taxonomy.concepts !== 'object') {
    invalidSchemas.push('TAXONOMY.json: missing concepts object');
    errors.push('TAXONOMY.json must define concepts');
  } else {
    for (const [conceptName, conceptData] of Object.entries(taxonomy.concepts)) {
      validConceptsCount++;
      if (!conceptData.domain || !taxonomy.domains[conceptData.domain]) {
        errors.push(`Concept "${conceptName}" references undeclared domain "${conceptData.domain}"`);
        invalidSchemas.push(`Concept ${conceptName} undeclared domain`);
      }
      if (!conceptData.epistemic_class || !VALID_EPISTEMIC_STATUSES.includes(conceptData.epistemic_class)) {
        errors.push(`Concept "${conceptName}" has invalid epistemic class "${conceptData.epistemic_class}"`);
        invalidSchemas.push(`Concept ${conceptName} invalid epistemic class`);
      }
    }
  }

  // 3. Validate Catalog Documents & Content on Disk
  const catalogDocMap = new Map();
  const fileLineCountCache = new Map();

  for (const doc of catalog.documents || []) {
    if (!doc.id) {
      errors.push('Catalog document missing id');
      invalidSchemas.push('Catalog document without id');
      continue;
    }
    if (catalogDocMap.has(doc.id)) {
      errors.push(`Duplicate document ID in catalog: ${doc.id}`);
      invalidSchemas.push(`Duplicate doc_id: ${doc.id}`);
    }
    catalogDocMap.set(doc.id, doc);

    if (!doc.epistemic_status || !VALID_EPISTEMIC_STATUSES.includes(doc.epistemic_status)) {
      errors.push(`Document ${doc.id} has invalid epistemic_status: ${doc.epistemic_status}`);
      invalidSchemas.push(`Document ${doc.id} invalid epistemic_status`);
    }

    const fullPath = resolve(rootDir, doc.path);
    if (!existsSync(fullPath)) {
      missingFiles.push(doc.path);
      errors.push(`Catalog document ${doc.id} file not found: ${doc.path}`);
    } else {
      validDocumentsCount++;
      const content = readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      fileLineCountCache.set(doc.path, lines.length);

      // Check frontmatter source_documents if present
      if (content.startsWith('---')) {
        const frontmatterMatch = content.match(/^---([\s\S]*?)---/);
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          const sourceDocsMatch = frontmatter.match(/source_documents:\n((?:\s+-\s+[^\n]+\n?)+)/);
          if (sourceDocsMatch) {
            const sources = sourceDocsMatch[1]
              .split('\n')
              .map(s => s.replace(/^\s+-\s+/, '').trim())
              .filter(Boolean);
            for (const src of sources) {
              const cleanSrc = src.replace(/^['"]|['"]$/g, '');
              const srcPath = resolve(rootDir, cleanSrc);
              if (!existsSync(srcPath)) {
                brokenLinks.push({
                  file: doc.path,
                  link: `source_documents: ${src}`,
                  resolved: relative(rootDir, srcPath)
                });
                errors.push(`Broken source_document reference in ${doc.path}: ${src}`);
              }
            }
          }
        }
      }

      // Parse markdown links outside of code blocks and inline code
      const codeBlockRegex = /```[\s\S]*?```/g;
      const inlineCodeRegex = /`[^`\n]+`/g;
      const strippedContent = content.replace(codeBlockRegex, '').replace(inlineCodeRegex, '');
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(strippedContent)) !== null) {
        const linkTarget = match[2];
        if (
          linkTarget.startsWith('http://') ||
          linkTarget.startsWith('https://') ||
          linkTarget.startsWith('#') ||
          linkTarget.startsWith('mailto:')
        ) {
          continue;
        }
        let resolvedLink;
        if (linkTarget.startsWith('file:///')) {
          resolvedLink = fileURLToPath(linkTarget.split('#')[0]);
        } else {
          const targetClean = decodeURIComponent(linkTarget.split('#')[0]).replace(/^['"]|['"]$/g, '');
          if (!targetClean) continue;
          resolvedLink = resolve(dirname(fullPath), targetClean);
        }
        if (!existsSync(resolvedLink)) {
          brokenLinks.push({
            file: doc.path,
            link: linkTarget,
            resolved: relative(rootDir, resolvedLink)
          });
          errors.push(`Broken link in ${doc.path}: ${linkTarget}`);
        }
      }
    }
  }

  // 4. Validate RETRIEVAL_INDEX.jsonl Existence, Schema, and Provenance Locators
  if (!existsSync(indexPath)) {
    return {
      status: 'FAIL',
      errors: ['Missing RETRIEVAL_INDEX.jsonl'],
      missingFiles: ['wiki/synthetic/RETRIEVAL_INDEX.jsonl'],
      brokenLinks,
      corruptedLocators,
      invalidSchemas: ['RETRIEVAL_INDEX.jsonl'],
      validDocumentsCount,
      validCardsCount: 0,
      validConceptsCount
    };
  }

  let indexEntries;
  try {
    indexEntries = loadRetrievalIndex(indexPath);
  } catch (err) {
    return {
      status: 'FAIL',
      errors: [`Failed to parse RETRIEVAL_INDEX.jsonl: ${err.message}`],
      missingFiles,
      brokenLinks,
      corruptedLocators,
      invalidSchemas: ['RETRIEVAL_INDEX.jsonl'],
      validDocumentsCount,
      validCardsCount: 0,
      validConceptsCount
    };
  }

  const seenCardIds = new Set();
  for (const card of indexEntries) {
    if (!card.card_id) {
      errors.push('Card missing card_id');
      invalidSchemas.push('Card without card_id');
      continue;
    }
    if (seenCardIds.has(card.card_id)) {
      errors.push(`Duplicate card_id: ${card.card_id}`);
      corruptedLocators.push({ card_id: card.card_id, reason: 'Duplicate card_id' });
    }
    seenCardIds.add(card.card_id);

    if (!card.doc_id || !catalogDocMap.has(card.doc_id)) {
      errors.push(`Card ${card.card_id} references unknown doc_id "${card.doc_id}"`);
      corruptedLocators.push({ card_id: card.card_id, reason: `Unresolved doc_id: ${card.doc_id}` });
      continue;
    }

    const doc = catalogDocMap.get(card.doc_id);
    if (card.source_path && card.source_path !== doc.path) {
      errors.push(`Card ${card.card_id} source_path "${card.source_path}" does not match catalog path "${doc.path}"`);
      corruptedLocators.push({ card_id: card.card_id, reason: 'Mismatched source_path' });
    }

    const sourcePath = card.source_path || doc.path;
    const fullPath = resolve(rootDir, sourcePath);

    if (!existsSync(fullPath)) {
      errors.push(`Card ${card.card_id} source file not found on disk: ${sourcePath}`);
      missingFiles.push(sourcePath);
      continue;
    }

    let lineCount = fileLineCountCache.get(sourcePath);
    if (lineCount === undefined) {
      lineCount = readFileSync(fullPath, 'utf8').split('\n').length;
      fileLineCountCache.set(sourcePath, lineCount);
    }

    if (
      typeof card.start_line !== 'number' ||
      typeof card.end_line !== 'number' ||
      card.start_line < 1 ||
      card.end_line < card.start_line ||
      card.end_line > lineCount
    ) {
      errors.push(
        `Card ${card.card_id} has invalid line range [${card.start_line}, ${card.end_line}] (total lines: ${lineCount})`
      );
      corruptedLocators.push({
        card_id: card.card_id,
        reason: `Invalid line range [${card.start_line}, ${card.end_line}], file total: ${lineCount}`
      });
    }

    if (!card.epistemic_status || !VALID_EPISTEMIC_STATUSES.includes(card.epistemic_status)) {
      errors.push(`Card ${card.card_id} has invalid epistemic_status "${card.epistemic_status}"`);
      invalidSchemas.push(`Card ${card.card_id} invalid epistemic_status`);
    }

    validCardsCount++;
  }

  const isPass =
    errors.length === 0 &&
    missingFiles.length === 0 &&
    brokenLinks.length === 0 &&
    corruptedLocators.length === 0 &&
    invalidSchemas.length === 0;

  return {
    status: isPass ? 'PASS' : 'FAIL',
    errors,
    missingFiles,
    brokenLinks,
    corruptedLocators,
    invalidSchemas,
    validDocumentsCount,
    validCardsCount,
    validConceptsCount
  };
}

/**
 * Parses CLI command line arguments with options
 * @param {Array<string>} args
 * @returns {object}
 */
export function parseCliArgs(args) {
  const command = args[0] || 'help';
  const positional = [];
  const options = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--domain' && i + 1 < args.length) {
      options.domain = args[++i];
    } else if (arg === '--epistemic' && i + 1 < args.length) {
      options.epistemicStatus = args[++i];
    } else if (arg === '--limit' && i + 1 < args.length) {
      options.limit = parseInt(args[++i], 10) || 10;
    } else if (arg.startsWith('--')) {
      options[arg.slice(2)] = true;
    } else {
      positional.push(arg);
    }
  }

  return {
    command,
    positional,
    options,
    query: positional.join(' ')
  };
}

/**
 * Read-only claim traceability over canonical KnowledgePlane records.
 * Derived projections are accepted as references, never as authority.
 */
export function queryClaimTraceability(claimId, { records = [], derived = [] } = {}) {
  const canonicalId = claimId.startsWith('kp:claim:') ? claimId : `kp:claim:${claimId}`;
  const canonical = records.find(record => record.id === canonicalId || record.canonical_id === canonicalId) ?? null;
  const references = derived.filter(item => item.canonical_id === canonicalId).map(item => ({ ...item, authority: 'DERIVED' }));
  return {
    status: canonical ? 'PASS' : 'UNKNOWN',
    canonical,
    derived_references: references,
    authority: canonical?.authority_class ?? 'UNKNOWN',
    epistemic_class: canonical?.epistemic_class ?? 'UNKNOWN',
    superseded: canonical?.acceptance_state === 'SUPERSEDED'
  };
}

// CLI Execution
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const cli = parseCliArgs(process.argv.slice(2));

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const ROOT_DIR = resolve(__dirname, '../..');
  const WIKI_DIR = resolve(ROOT_DIR, 'wiki');
  const SYNTHETIC_DIR = resolve(WIKI_DIR, 'synthetic');

  if (cli.command === 'verify') {
    const result = verifyKnowledgeBase({ rootDir: ROOT_DIR, wikiDir: WIKI_DIR });
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.status === 'PASS' ? 0 : 1);
  } else if (cli.command === 'search') {
    if (!cli.query) {
      console.error('Error: Search query required.');
      process.exit(1);
    }
    const catalog = loadCatalog(resolve(SYNTHETIC_DIR, 'CATALOG.json'));
    const index = loadRetrievalIndex(resolve(SYNTHETIC_DIR, 'RETRIEVAL_INDEX.jsonl'));
    const results = searchKnowledgeBase(cli.query, catalog, {
      index,
      domain: cli.options.domain,
      epistemicStatus: cli.options.epistemicStatus,
      limit: cli.options.limit || 10,
      rootDir: ROOT_DIR
    });
    console.log(JSON.stringify(results, null, 2));
  } else if (cli.command === 'lookup') {
    const term = cli.positional[0];
    if (!term) {
      console.error('Error: Term required for lookup.');
      process.exit(1);
    }
    const taxonomy = loadTaxonomy(resolve(SYNTHETIC_DIR, 'TAXONOMY.json'));
    const result = lookupTerm(term, taxonomy, { rootDir: ROOT_DIR });
    if (!result) {
      console.log(JSON.stringify({ notFound: true, term }, null, 2));
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  } else {
    console.log('Usage:');
    console.log('  node tools/librarian/librarian.mjs verify');
    console.log('  node tools/librarian/librarian.mjs search <query> [--domain <domain>] [--epistemic <status>] [--limit <n>]');
    console.log('  node tools/librarian/librarian.mjs lookup <term>');
  }
}
