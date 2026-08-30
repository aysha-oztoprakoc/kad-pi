#!/usr/bin/env node
import { ZoteroLocalAdapter, normalizeZoteroItem } from './research-zotero.mjs';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import {
  ACCEPTANCE_STATES,
  DeterministicResearchCorpus,
  EPISTEMIC_CLASSES,
  IDENTIFIER_TYPES,
  ResearchConflictError,
  ResearchError,
  ResearchSecurityError,
  ResearchValidationError,
  createCandidate,
  createDocument,
  createSource,
  normalizeIdentifier
} from './research.mjs';

export const RESEARCH_MANIFEST_SCHEMA = 'kad-research-manifest-v1';

/**
 * Validates and parses a research manifest
 * @param {string|object} input
 * @param {object} options
 * @returns {object} validated manifest data
 */
export function parseResearchManifest(input, options = {}) {
  let data = input;
  if (typeof input === 'string') {
    try {
      data = JSON.parse(input);
    } catch (err) {
      throw new ResearchValidationError(`Malformed manifest JSON: ${err.message}`);
    }
  }

  if (!data || typeof data !== 'object') {
    throw new ResearchValidationError('Manifest must be a non-empty object');
  }

  if (data.schema_version !== RESEARCH_MANIFEST_SCHEMA) {
    throw new ResearchValidationError(
      `Unsupported manifest schema version: ${data.schema_version} (expected ${RESEARCH_MANIFEST_SCHEMA})`
    );
  }

  return {
    schema_version: RESEARCH_MANIFEST_SCHEMA,
    candidate: data.candidate || null,
    source: data.source || null,
    provenance: data.provenance || options.provenance || {
      method: 'manifest',
      origin: 'manifest_import',
      actor: 'operator'
    }
  };
}

/**
 * Serializes a ResearchDocument or manifest object to JSON
 * @param {object} manifestData
 * @returns {string} JSON formatted string
 */
export function serializeResearchManifest(manifestData) {
  if (!manifestData) {
    throw new ResearchValidationError('Cannot serialize empty manifest data');
  }
  return `${JSON.stringify(manifestData, null, 2)}\n`;
}

/**
 * Parses CLI arguments for research subcommands
 * @param {string[]} args
 * @returns {object} parsed options
 */
export function parseResearchCliArgs(args) {
  const flags = {
    command: null,
    subcommand: null,
    positional: [],
    manifest: null,
    source: null,
    doi: null,
    arxiv: null,
    title: null,
    authors: null,
    year: null,
    abstract: null,
    origin: null,
    storageDir: null,
    rootDir: null,
    query: null,
    out: null,
    json: false
  };

  const rawArgs = [...args];
  let i = 0;

  if (rawArgs.length > 0 && !rawArgs[0].startsWith('-')) {
    flags.subcommand = rawArgs[0];
    i++;
  }

  while (i < rawArgs.length) {
    const arg = rawArgs[i];
    if (arg === '--manifest' && i + 1 < rawArgs.length) {
      flags.manifest = rawArgs[++i];
    } else if (arg === '--source' && i + 1 < rawArgs.length) {
      flags.source = rawArgs[++i];
    } else if (arg === '--doi' && i + 1 < rawArgs.length) {
      flags.doi = rawArgs[++i];
    } else if (arg === '--arxiv' && i + 1 < rawArgs.length) {
      flags.arxiv = rawArgs[++i];
    } else if (arg === '--title' && i + 1 < rawArgs.length) {
      flags.title = rawArgs[++i];
    } else if (arg === '--authors' && i + 1 < rawArgs.length) {
      flags.authors = rawArgs[++i];
    } else if (arg === '--year' && i + 1 < rawArgs.length) {
      flags.year = rawArgs[++i];
    } else if (arg === '--abstract' && i + 1 < rawArgs.length) {
      flags.abstract = rawArgs[++i];
    } else if (arg === '--origin' && i + 1 < rawArgs.length) {
      flags.origin = rawArgs[++i];
    } else if (arg === '--storage-dir' && i + 1 < rawArgs.length) {
      flags.storageDir = rawArgs[++i];
    } else if (arg === '--root-dir' && i + 1 < rawArgs.length) {
      flags.rootDir = rawArgs[++i];
    } else if (arg === '--query' && i + 1 < rawArgs.length) {
      flags.query = rawArgs[++i];
    } else if (arg === '--out' && i + 1 < rawArgs.length) {
      flags.out = rawArgs[++i];
    } else if (arg === '--json') {
      flags.json = true;
    } else if (!arg.startsWith('-')) {
      flags.positional.push(arg);
    }
    i++;
  }

  return flags;
}

/**
 * Main operator entrypoint for `kad-knowledge research ...`
 * @param {string[]} args
 * @param {object} options
 * @returns {number} exit code (0, 1, 2)
 */
export function runResearchCli(args, options = {}) {
  const stdout = options.stdout || console.log;
  const stderr = options.stderr || console.error;
  const rootDir = options.rootDir || resolve(process.cwd());
  const parsed = parseResearchCliArgs(args);

  const effectiveRootDir = parsed.rootDir ? resolve(parsed.rootDir) : rootDir;
  const effectiveStorageDir = parsed.storageDir
    ? resolve(parsed.storageDir)
    : join(effectiveRootDir, 'wiki', 'research');

  const corpus = new DeterministicResearchCorpus({
    rootDir: effectiveRootDir,
    storageDir: effectiveStorageDir
  });

  try {
    corpus.loadSync();
  } catch (err) {
    stderr(`Warning: failed to load existing research catalog: ${err.message}`);
  }

  const { subcommand, positional } = parsed;

  if (subcommand === 'import') {
    try {
      let result = null;

      // Mode 1: Import via Manifest
      if (parsed.manifest) {
        const manifestFullPath = resolve(effectiveRootDir, parsed.manifest);
        if (!existsSync(manifestFullPath)) {
          stderr(`Error: Manifest file not found: ${parsed.manifest}`);
          return 1;
        }
        const rawContent = readFileSync(manifestFullPath, 'utf8');
        const manifest = parseResearchManifest(rawContent);

        if (manifest.candidate) {
          result = corpus.ingestCandidate({
            ...manifest.candidate,
            provenance: manifest.provenance
          });
        }

        if (manifest.source && manifest.source.source_path) {
          const sourceResult = corpus.ingestSource({
            source_path: manifest.source.source_path,
            identifiers: (manifest.candidate?.identifiers || []).map(id => id.value),
            provenance: manifest.provenance
          });
          result = sourceResult;
        }
      }
      // Mode 2: Direct Source File with Optional Flags
      else if (parsed.source) {
        const identifiers = [];
        if (parsed.doi) identifiers.push(parsed.doi);
        if (parsed.arxiv) identifiers.push(parsed.arxiv);

        const authors = parsed.authors
          ? parsed.authors.split(',').map(a => a.trim()).filter(Boolean)
          : null;

        const sourceResult = corpus.ingestSource({
          source_path: parsed.source,
          title: parsed.title,
          identifiers,
          provenance: {
            method: 'cli_import',
            origin: parsed.origin || 'operator_filesystem',
            actor: 'operator'
          }
        });

        // If additional metadata provided, update canonical document
        if (parsed.title || authors || parsed.year || parsed.abstract) {
          corpus.updateMetadata(sourceResult.document.document_id, {
            title: parsed.title,
            authors,
            year: parsed.year ? Number(parsed.year) : undefined,
            abstract: parsed.abstract,
            epistemic_class: EPISTEMIC_CLASSES.DOCUMENT_DERIVED
          });
        }

        result = sourceResult;
      }
      // Mode 3: Direct Identifier or Positional Input
      else if (positional.length > 0) {
        const target = positional[0];
        const identifiers = [];

        // Check if target is a file or manifest
        if (target.endsWith('.json') || target.endsWith('.yaml') || target.endsWith('.yml')) {
          const fileFullPath = resolve(effectiveRootDir, target);
          if (!existsSync(fileFullPath)) {
            stderr(`Error: Manifest file not found: ${target}`);
            return 1;
          }
          const raw = readFileSync(fileFullPath, 'utf8');
          const manifest = parseResearchManifest(raw);
          result = corpus.ingestCandidate({
            ...manifest.candidate,
            provenance: manifest.provenance
          });
        } else {
          // Identifier positional (DOI or arXiv)
          identifiers.push(target);
          if (parsed.doi) identifiers.push(parsed.doi);
          if (parsed.arxiv) identifiers.push(parsed.arxiv);

          const authors = parsed.authors
            ? parsed.authors.split(',').map(a => a.trim()).filter(Boolean)
            : null;

          result = corpus.ingestCandidate({
            title: parsed.title || null,
            authors,
            year: parsed.year ? Number(parsed.year) : null,
            abstract: parsed.abstract || null,
            identifiers,
            provenance: {
              method: 'cli_import',
              origin: parsed.origin || 'operator_cli',
              actor: 'operator'
            }
          });
        }
      } else {
        stderr('Error: import requires a target identifier, --manifest <file>, or --source <file>');
        return 2;
      }

      // Persist changes
      corpus.saveSync();

      const doc = result.document;
      const response = {
        status: result.status,
        document_id: doc.document_id,
        title: doc.title,
        identifiers: doc.identifiers,
        source_count: doc.sources.length,
        source_hash: doc.sources[0]?.source_hash || null,
        authority_class: doc.authority_class,
        acceptance_state: doc.acceptance_state
      };

      stdout(JSON.stringify(response, null, 2));
      return 0;
    } catch (err) {
      if (err instanceof ResearchSecurityError) {
        stderr(`Security Error: ${err.message}`);
        return 1;
      }
      if (err instanceof ResearchConflictError) {
        stderr(`Conflict Error: ${err.message}`);
        return 1;
      }
      if (err instanceof ResearchValidationError) {
        stderr(`Validation Error: ${err.message}`);
        return 1;
      }
      if (err instanceof ResearchError) {
        stderr(`Research Error: ${err.message}`);
        return 1;
      }
      stderr(`Error: ${err.message}`);
      return 1;
    }
  }

  if (subcommand === 'inspect') {
    const target = positional[0] || parsed.doi || parsed.arxiv;
    if (!target) {
      stderr('usage: kad-knowledge research inspect <id|doi|arxiv|hash>');
      return 2;
    }

    const doc = corpus.inspectDocument(target);
    if (!doc) {
      stderr(`Document not found: ${target}`);
      return 1;
    }

    stdout(JSON.stringify(doc, null, 2));
    return 0;
  }

  if (subcommand === 'verify') {
    const target = positional[0];
    if (target) {
      const doc = corpus.inspectDocument(target);
      if (!doc) {
        stderr(`Document not found: ${target}`);
        return 1;
      }
      const issues = [];
      for (const src of doc.sources) {
        if (src.source_path && src.source_hash) {
          const fullPath = resolve(effectiveRootDir, src.source_path);
          if (!existsSync(fullPath)) {
            issues.push({ source_id: src.source_id, error: `Source file missing: ${src.source_path}` });
          }
        }
      }
      const result = {
        valid: issues.length === 0,
        document_id: doc.document_id,
        issues
      };
      stdout(JSON.stringify(result, null, 2));
      return result.valid ? 0 : 1;
    }

    const integrity = corpus.verifyIntegrity();
    stdout(JSON.stringify(integrity, null, 2));
    return integrity.valid ? 0 : 1;
  }

  if (subcommand === 'list') {
    const filter = {};
    if (parsed.year) filter.year = Number(parsed.year);
    if (parsed.query) filter.query = parsed.query;

    const docs = corpus.listDocuments(filter);
    const response = {
      count: docs.length,
      documents: docs.map(d => ({
        document_id: d.document_id,
        title: d.title,
        authors: d.authors,
        year: d.year,
        identifiers: d.identifiers,
        source_count: d.sources.length
      }))
    };
    stdout(JSON.stringify(response, null, 2));
    return 0;
  }

  if (subcommand === 'export') {
    const target = positional[0];
    if (!target) {
      stderr('usage: kad-knowledge research export <id|doi> [--out <file>]');
      return 2;
    }

    const doc = corpus.inspectDocument(target);
    if (!doc) {
      stderr(`Document not found: ${target}`);
      return 1;
    }

    const manifest = {
      schema_version: RESEARCH_MANIFEST_SCHEMA,
      candidate: {
        title: doc.title,
        authors: doc.authors,
        year: doc.year,
        abstract: doc.abstract,
        identifiers: doc.identifiers.map(id => ({
          type: id.type,
          value: id.value,
          raw_value: id.raw_value
        }))
      },
      source: doc.sources.length > 0 ? {
        source_path: doc.sources[0].source_path,
        source_ref: doc.sources[0].source_ref
      } : null,
      provenance: {
        method: 'export',
        origin: 'kad_canonical_corpus',
        actor: 'operator'
      }
    };

    const serialized = serializeResearchManifest(manifest);
    if (parsed.out) {
      const outPath = resolve(effectiveRootDir, parsed.out);
      writeFileSync(outPath, serialized, 'utf8');
      stdout(JSON.stringify({ status: 'EXPORTED', path: parsed.out, document_id: doc.document_id }, null, 2));
    } else {
      stdout(serialized);
    }
    return 0;
  }
  if (subcommand === 'zotero') {
    return runZoteroCli(positional, parsed, corpus, { stdout, stderr });
  }

  stderr('usage: kad-knowledge research import|inspect|verify|list|export|zotero [options]');
  return 2;
}

async function runZoteroCli(positional, parsed, corpus, { stdout, stderr }) {
  const action = positional[0] || 'status';
  const adapter = new ZoteroLocalAdapter();

  if (action === 'status' || action === 'probe') {
    const probe = await adapter.probe();
    stdout(JSON.stringify(probe, null, 2));
    return probe.healthy ? 0 : 1;
  }

  if (action === 'import') {
    const itemKey = positional[1];
    if (!itemKey) {
      stderr('usage: kad-knowledge research zotero import <item_key>');
      return 2;
    }
    try {
      const item = await adapter.getItem(itemKey);
      const candidate = normalizeZoteroItem(item);
      const result = corpus.ingestCandidate(candidate);
      corpus.saveSync();
      stdout(JSON.stringify({
        status: result.status,
        document_id: result.document.document_id,
        title: result.document.title
      }, null, 2));
      return 0;
    } catch (err) {
      stderr(`Zotero import failed: ${err.message}`);
      return 1;
    }
  }

  if (action === 'list') {
    try {
      const items = await adapter.listItems({ limit: 50 });
      stdout(JSON.stringify({ count: items.length, items }, null, 2));
      return 0;
    } catch (err) {
      stderr(`Zotero list failed: ${err.message}`);
      return 1;
    }
  }

  stderr(`Unknown zotero action: '${action}'. Allowed: status, import, list`);
  return 2;
}
