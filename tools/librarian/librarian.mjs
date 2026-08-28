#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

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
 * @returns {object|null}
 */
export function lookupTerm(term, taxonomy) {
  if (!term || typeof term !== 'string' || !taxonomy || !taxonomy.concepts) {
    return null;
  }
  const cleanTerm = term.trim();
  if (!cleanTerm) return null;

  const direct = taxonomy.concepts[cleanTerm];
  if (direct) return direct;

  // Case-insensitive fallback or synonym search
  const lower = cleanTerm.toLowerCase();
  for (const [key, val] of Object.entries(taxonomy.concepts)) {
    if (key.toLowerCase() === lower) return val;
    if (val.synonyms && val.synonyms.some(s => s.toLowerCase() === lower)) {
      return val;
    }
  }
  return null;
}

/**
 * Searches knowledge base documents and retrieval index cards
 * @param {string} query
 * @param {object} catalog
 * @param {object} options
 * @returns {Array<object>}
 */
export function searchKnowledgeBase(query, catalog, options = {}) {
  const { index = [], domain, epistemicStatus, limit = 10 } = options;
  if (!query || typeof query !== 'string') return [];
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

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
      scoredDocs.push({
        ...doc,
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
      scoredDocs.push({
        id: card.card_id,
        doc_id: card.doc_id,
        title: card.heading,
        domain: card.domain || 'SYNTHETIC_CARD',
        epistemic_status: card.epistemic_status,
        summary: card.content,
        matchType: 'chunk',
        score
      });
    }
  }

  scoredDocs.sort((a, b) => b.score - a.score);
  return scoredDocs.slice(0, limit);
}

/**
 * Validates links, files, and epistemic tags across the knowledge base
 * @param {object} param0
 * @returns {object}
 */
export function verifyKnowledgeBase({ rootDir, wikiDir }) {
  const missingFiles = [];
  const brokenLinks = [];
  let validDocumentsCount = 0;

  const catalogPath = resolve(wikiDir, 'synthetic/CATALOG.json');
  if (!existsSync(catalogPath)) {
    return {
      status: 'FAIL',
      missingFiles: ['wiki/synthetic/CATALOG.json'],
      brokenLinks: [],
      validDocumentsCount: 0
    };
  }

  let catalog;
  try {
    catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  } catch (err) {
    return {
      status: 'FAIL',
      missingFiles: [`wiki/synthetic/CATALOG.json (malformed JSON: ${err.message})`],
      brokenLinks: [],
      validDocumentsCount: 0
    };
  }

  for (const doc of catalog.documents || []) {
    const fullPath = resolve(rootDir, doc.path);
    if (!existsSync(fullPath)) {
      missingFiles.push(doc.path);
    } else {
      validDocumentsCount++;
      const content = readFileSync(fullPath, 'utf8');

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
              const srcPath = resolve(rootDir, src.replace(/^['"]|['"]$/g, ''));
              if (!existsSync(srcPath)) {
                brokenLinks.push({
                  file: doc.path,
                  link: `source_documents: ${src}`,
                  resolved: relative(rootDir, srcPath)
                });
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
          // Normalize relative path
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
        }
      }
    }
  }

  return {
    status: missingFiles.length === 0 && brokenLinks.length === 0 ? 'PASS' : 'FAIL',
    missingFiles,
    brokenLinks,
    validDocumentsCount
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
      limit: cli.options.limit || 10
    });
    console.log(JSON.stringify(results, null, 2));
  } else if (cli.command === 'lookup') {
    const term = cli.positional[0];
    if (!term) {
      console.error('Error: Term required for lookup.');
      process.exit(1);
    }
    const taxonomy = loadTaxonomy(resolve(SYNTHETIC_DIR, 'TAXONOMY.json'));
    const result = lookupTerm(term, taxonomy);
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
