#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, renameSync, writeFileSync } from 'node:fs';
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, normalize, relative, resolve, sep } from 'node:path';
import { ACCEPTANCE_STATES, EPISTEMIC_CLASSES } from './knowledge-plane.mjs';

export { ACCEPTANCE_STATES, EPISTEMIC_CLASSES };

export const RESEARCH_SCHEMA_VERSION = 'kad-research-corpus-v1';

export const IDENTIFIER_TYPES = Object.freeze({
  DOI: 'doi',
  ARXIV: 'arxiv',
  ISBN: 'isbn',
  PMID: 'pmid',
  URL: 'url',
  INTERNAL: 'internal'
});

export const IDENTIFIER_PRECEDENCE = Object.freeze([
  IDENTIFIER_TYPES.DOI,
  IDENTIFIER_TYPES.ARXIV,
  IDENTIFIER_TYPES.ISBN,
  IDENTIFIER_TYPES.PMID,
  IDENTIFIER_TYPES.URL,
  IDENTIFIER_TYPES.INTERNAL
]);

export class ResearchError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code || 'RESEARCH_ERROR';
    this.details = options.details || null;
  }
}

export class ResearchSecurityError extends ResearchError {
  constructor(message, details = null) {
    super(message, { code: 'SECURITY_ERROR', details });
  }
}

export class ResearchConflictError extends ResearchError {
  constructor(message, details = null) {
    super(message, { code: 'CONFLICT_ERROR', details });
  }
}

export class ResearchValidationError extends ResearchError {
  constructor(message, details = null) {
    super(message, { code: 'VALIDATION_ERROR', details });
  }
}

/**
 * Computes SHA-256 hash over a buffer
 * @param {Buffer|Uint8Array|string} data
 * @returns {string} hex digest
 */
export function hashSourceBytes(data) {
  if (typeof data === 'string') {
    return createHash('sha256').update(data, 'utf8').digest('hex');
  }
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Safe path verification preventing directory traversal and symlink escapes
 * @param {string} rootDir
 * @param {string} sourcePath
 * @returns {{ fullPath: string, relativePath: string }}
 */
export function assertSafePath(rootDir, sourcePath) {
  if (typeof sourcePath !== 'string' || !sourcePath.trim()) {
    throw new ResearchSecurityError('Source path must be a non-empty string');
  }
  if (sourcePath.includes('\0')) {
    throw new ResearchSecurityError(`Path contains null byte: ${sourcePath}`);
  }

  const root = resolve(rootDir);
  const normalizedInput = normalize(sourcePath.trim());
  const full = isAbsolute(normalizedInput)
    ? normalizedInput
    : resolve(root, normalizedInput);

  const rel = relative(root, full);
  if (!rel || rel.startsWith(`..${sep}`) || rel === '..' || rel.split(sep).includes('..')) {
    throw new ResearchSecurityError(`Source path escapes root directory: ${sourcePath}`);
  }

  // Check each path segment for symlink traversal escapes
  const segments = rel.split(sep);
  let current = root;
  for (const segment of segments) {
    current = join(current, segment);
    try {
      if (lstatSync(current).isSymbolicLink()) {
        const target = realpathSync(current);
        const targetRel = relative(root, target);
        if (!targetRel || targetRel.startsWith(`..${sep}`) || targetRel === '..' || targetRel.split(sep).includes('..')) {
          throw new ResearchSecurityError(`Symlink in path points outside root: ${sourcePath} -> ${target}`);
        }
      }
    } catch (err) {
      if (err instanceof ResearchSecurityError) throw err;
      if (err.code !== 'ENOENT') throw err;
      break;
    }
  }

  return {
    fullPath: full,
    relativePath: rel.replaceAll('\\', '/')
  };
}

/**
 * Normalizes an identifier string or object
 * @param {string|object} identifierInput
 * @param {object} options
 * @returns {ResearchIdentifier}
 */
export function normalizeIdentifier(identifierInput, options = {}) {
  if (!identifierInput) {
    throw new ResearchValidationError('Identifier cannot be empty');
  }

  let type = null;
  let rawValue = '';
  let provenance = options.provenance || null;

  if (typeof identifierInput === 'string') {
    rawValue = identifierInput.trim();
    if (!rawValue) {
      throw new ResearchValidationError('Identifier string cannot be empty');
    }

    if (/^https?:\/\/(dx\.)?doi\.org\//i.test(rawValue)) {
      type = IDENTIFIER_TYPES.DOI;
    } else if (/^doi:/i.test(rawValue)) {
      type = IDENTIFIER_TYPES.DOI;
    } else if (/^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/i.test(rawValue)) {
      type = IDENTIFIER_TYPES.DOI;
    } else if (/^https?:\/\/arxiv\.org\/(abs|pdf)\//i.test(rawValue)) {
      type = IDENTIFIER_TYPES.ARXIV;
    } else if (/^arxiv:/i.test(rawValue)) {
      type = IDENTIFIER_TYPES.ARXIV;
    } else if (/^(\d{4}\.\d{4,5}(v\d+)?|[a-z-]+(?:\.[a-z]{2})?\/\d{7}(?:v\d+)?)$/i.test(rawValue)) {
      type = IDENTIFIER_TYPES.ARXIV;
    } else if (/^https?:\/\//i.test(rawValue)) {
      type = IDENTIFIER_TYPES.URL;
    } else if (rawValue.includes(':')) {
      type = IDENTIFIER_TYPES.INTERNAL;
    } else {
      type = IDENTIFIER_TYPES.INTERNAL;
    }
  } else if (typeof identifierInput === 'object') {
    type = identifierInput.type;
    rawValue = String(identifierInput.value || identifierInput.raw_value || '').trim();
    provenance = identifierInput.provenance || provenance;
    if (!type || !Object.values(IDENTIFIER_TYPES).includes(type)) {
      throw new ResearchValidationError(`Unsupported identifier type: ${type}`);
    }
    if (!rawValue) {
      throw new ResearchValidationError('Identifier value cannot be empty');
    }
  } else {
    throw new ResearchValidationError('Invalid identifier input type');
  }

  let normalizedValue = rawValue;

  switch (type) {
    case IDENTIFIER_TYPES.DOI: {
      let cleaned = rawValue
        .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
        .replace(/^doi:\s*/i, '')
        .trim();
      if (!/^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/i.test(cleaned)) {
        throw new ResearchValidationError(`Invalid DOI format: ${rawValue}`);
      }
      normalizedValue = cleaned.toLowerCase();
      break;
    }
    case IDENTIFIER_TYPES.ARXIV: {
      let cleaned = rawValue
        .replace(/^https?:\/\/arxiv\.org\/(abs|pdf)\//i, '')
        .replace(/\.pdf$/i, '')
        .replace(/^arxiv:\s*/i, '')
        .trim();
      if (!/^(\d{4}\.\d{4,5}(v\d+)?|[a-z-]+(?:\.[a-z]{2})?\/\d{7}(?:v\d+)?)$/i.test(cleaned)) {
        throw new ResearchValidationError(`Invalid arXiv format: ${rawValue}`);
      }
      normalizedValue = cleaned;
      break;
    }
    case IDENTIFIER_TYPES.ISBN: {
      const digits = rawValue.replace(/[-\s]/g, '');
      if (!/^(97[89])?\d{9}[\dX]$/i.test(digits)) {
        throw new ResearchValidationError(`Invalid ISBN format: ${rawValue}`);
      }
      normalizedValue = digits.toUpperCase();
      break;
    }
    case IDENTIFIER_TYPES.PMID: {
      if (!/^\d+$/.test(rawValue)) {
        throw new ResearchValidationError(`Invalid PMID format: ${rawValue}`);
      }
      normalizedValue = rawValue;
      break;
    }
    case IDENTIFIER_TYPES.URL: {
      try {
        const parsed = new URL(rawValue);
        normalizedValue = parsed.href;
      } catch {
        throw new ResearchValidationError(`Invalid URL format: ${rawValue}`);
      }
      break;
    }
    case IDENTIFIER_TYPES.INTERNAL: {
      normalizedValue = rawValue;
      break;
    }
    default:
      throw new ResearchValidationError(`Unsupported identifier type: ${type}`);
  }

  return new ResearchIdentifier({
    type,
    value: normalizedValue,
    raw_value: rawValue,
    provenance
  });
}

export class ResearchIdentifier {
  constructor({ type, value, raw_value, provenance = null }) {
    this.type = type;
    this.value = value;
    this.raw_value = raw_value || value;
    this.provenance = provenance ? createProvenance(provenance) : null;
    Object.freeze(this);
  }
}

export function createIdentifier(input, options) {
  return normalizeIdentifier(input, options);
}

export class ResearchProvenance {
  constructor(input = {}) {
    const opts = input || {};
    this.method = opts.method || 'manual';
    this.origin = opts.origin || 'manual_entry';
    this.origin_record_id = opts.origin_record_id || null;
    this.observed_at = opts.observed_at || new Date().toISOString();
    this.actor = opts.actor || 'unknown';
    this.evidence_ref = opts.evidence_ref || null;
    Object.freeze(this);
  }
}

export function createProvenance(input) {
  if (input instanceof ResearchProvenance) return input;
  return new ResearchProvenance(input || {});
}

export class ResearchCandidate {
  constructor({
    candidate_id,
    title = null,
    authors = null,
    year = null,
    abstract = null,
    identifiers = [],
    source_references = [],
    provenance = null,
    epistemic_class = EPISTEMIC_CLASSES.OBSERVED,
    acceptance_state = ACCEPTANCE_STATES.PROPOSED,
    metadata_only = true,
    unresolved_conflicts = []
  }) {
    this.candidate_id = candidate_id;
    this.title = title;
    this.authors = authors ? Object.freeze([...authors]) : null;
    this.year = year !== null && year !== undefined ? Number(year) : null;
    this.abstract = abstract;
    this.identifiers = Object.freeze([...identifiers]);
    this.source_references = Object.freeze([...source_references]);
    this.provenance = createProvenance(provenance);
    this.epistemic_class = epistemic_class;
    this.acceptance_state = acceptance_state;
    this.metadata_only = Boolean(metadata_only);
    this.unresolved_conflicts = Object.freeze([...unresolved_conflicts]);
    Object.freeze(this);
  }
}

export function createCandidate(input, options = {}) {
  const identifiers = (input.identifiers || []).map(id => normalizeIdentifier(id, options));
  const primaryId = selectPrimaryIdentifier(identifiers);

  let candidate_id = input.candidate_id;
  if (!candidate_id) {
    if (primaryId) {
      candidate_id = `cand:${primaryId.type}:${primaryId.value}`;
    } else {
      const hashContent = [
        input.title || '',
        (input.authors || []).join(','),
        input.year || ''
      ].join('::');
      candidate_id = `cand:meta:${hashSourceBytes(hashContent).slice(0, 16)}`;
    }
  }

  const authors = Array.isArray(input.authors)
    ? input.authors.map(a => String(a).trim()).filter(Boolean)
    : null;

  return new ResearchCandidate({
    candidate_id,
    title: input.title ? String(input.title).trim() : null,
    authors: authors && authors.length > 0 ? authors : null,
    year: input.year !== undefined && input.year !== null ? Number(input.year) : null,
    abstract: input.abstract ? String(input.abstract).trim() : null,
    identifiers,
    source_references: input.source_references || [],
    provenance: input.provenance || options.provenance,
    epistemic_class: input.epistemic_class || EPISTEMIC_CLASSES.OBSERVED,
    acceptance_state: ACCEPTANCE_STATES.PROPOSED,
    metadata_only: input.metadata_only ?? (input.source_path ? false : true),
    unresolved_conflicts: input.unresolved_conflicts || []
  });
}

export class ResearchSource {
  constructor({
    source_id,
    kind = 'reference',
    source_path = null,
    source_ref = '',
    source_hash = null,
    byte_size = null,
    mime_type = null,
    acquired_at = new Date().toISOString(),
    provenance = null,
    epistemic_class = EPISTEMIC_CLASSES.OBSERVED,
    acceptance_state = ACCEPTANCE_STATES.PROPOSED,
    trust_domain = 'engineering'
  }) {
    this.source_id = source_id;
    this.kind = kind;
    this.source_path = source_path;
    this.source_ref = source_ref;
    this.source_hash = source_hash;
    this.byte_size = byte_size;
    this.mime_type = mime_type;
    this.acquired_at = acquired_at;
    this.provenance = createProvenance(provenance);
    this.epistemic_class = epistemic_class;
    this.acceptance_state = acceptance_state;
    this.trust_domain = trust_domain;
    Object.freeze(this);
  }
}

export function createSource(input, options = {}) {
  const rootDir = input.rootDir || options.rootDir || process.cwd();
  let source_path = null;
  let source_ref = input.source_ref || '';
  let source_hash = input.source_hash || null;
  let byte_size = input.byte_size || null;
  let mime_type = input.mime_type || null;

  if (input.source_path) {
    const { fullPath, relativePath } = assertSafePath(rootDir, input.source_path);
    source_path = relativePath;
    source_ref = source_ref || relativePath;

    if (existsSync(fullPath)) {
      const buffer = readFileSync(fullPath);
      source_hash = hashSourceBytes(buffer);
      byte_size = buffer.length;
      if (source_path.toLowerCase().endsWith('.pdf')) {
        mime_type = 'application/pdf';
      } else if (source_path.toLowerCase().endsWith('.txt') || source_path.toLowerCase().endsWith('.md')) {
        mime_type = 'text/plain';
      } else if (source_path.toLowerCase().endsWith('.json')) {
        mime_type = 'application/json';
      }
    } else if (input.require_exists !== false) {
      throw new ResearchError(`Local source file not found at: ${fullPath}`);
    }
  }

  let source_id = input.source_id;
  if (!source_id) {
    if (source_hash) {
      source_id = `src:hash:${source_hash}`;
    } else {
      source_id = `src:ref:${hashSourceBytes(source_ref || 'unknown').slice(0, 16)}`;
    }
  }

  return new ResearchSource({
    source_id,
    kind: input.kind || (source_path ? 'local_file' : 'reference'),
    source_path,
    source_ref,
    source_hash,
    byte_size,
    mime_type,
    acquired_at: input.acquired_at || new Date().toISOString(),
    provenance: input.provenance || options.provenance,
    epistemic_class: source_hash ? EPISTEMIC_CLASSES.DOCUMENT_DERIVED : EPISTEMIC_CLASSES.OBSERVED,
    acceptance_state: ACCEPTANCE_STATES.PROPOSED,
    trust_domain: input.trust_domain || 'engineering'
  });
}

function selectPrimaryIdentifier(identifiers) {
  if (!Array.isArray(identifiers) || identifiers.length === 0) return null;
  for (const type of IDENTIFIER_PRECEDENCE) {
    const match = identifiers.find(id => id.type === type);
    if (match) return match;
  }
  return identifiers[0];
}

export class ResearchDocument {
  constructor({
    document_id,
    title,
    authors = null,
    year = null,
    abstract = null,
    identifiers = [],
    primary_identifier = null,
    sources = [],
    provenance = null,
    epistemic_class = EPISTEMIC_CLASSES.DOCUMENT_DERIVED,
    authority_class = 'CANONICAL_RESEARCH',
    acceptance_state = ACCEPTANCE_STATES.ACCEPTED,
    trust_domain = 'engineering',
    created_at = new Date().toISOString(),
    updated_at = new Date().toISOString(),
    version = 1
  }) {
    this.document_id = document_id;
    this.title = title;
    this.authors = authors ? Object.freeze([...authors]) : null;
    this.year = year !== null && year !== undefined ? Number(year) : null;
    this.abstract = abstract;
    this.identifiers = Object.freeze([...identifiers]);
    this.primary_identifier = primary_identifier || selectPrimaryIdentifier(this.identifiers);
    this.sources = Object.freeze([...sources]);
    this.provenance = createProvenance(provenance);
    this.epistemic_class = epistemic_class;
    this.authority_class = authority_class;
    this.acceptance_state = acceptance_state;
    this.trust_domain = trust_domain;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.version = version;
    Object.freeze(this);
  }
}

export function createDocument(input, options = {}) {
  if (!input.title || !String(input.title).trim()) {
    throw new ResearchValidationError('Document title is required');
  }

  const identifiers = (input.identifiers || []).map(id => normalizeIdentifier(id, options));
  const primary_identifier = input.primary_identifier
    ? normalizeIdentifier(input.primary_identifier, options)
    : selectPrimaryIdentifier(identifiers);

  const sources = (input.sources || []).map(src => src instanceof ResearchSource ? src : createSource(src, options));

  let document_id = input.document_id;
  if (!document_id) {
    if (primary_identifier) {
      document_id = `doc:${primary_identifier.type}:${primary_identifier.value}`;
    } else if (sources.length > 0 && sources[0].source_hash) {
      document_id = `doc:hash:${sources[0].source_hash.slice(0, 16)}`;
    } else {
      const hashContent = [
        String(input.title).trim().toLowerCase(),
        (input.authors || []).join(','),
        input.year || ''
      ].join('::');
      document_id = `doc:meta:${hashSourceBytes(hashContent).slice(0, 16)}`;
    }
  }

  const authors = Array.isArray(input.authors)
    ? input.authors.map(a => String(a).trim()).filter(Boolean)
    : null;

  return new ResearchDocument({
    document_id,
    title: String(input.title).trim(),
    authors: authors && authors.length > 0 ? authors : null,
    year: input.year !== undefined && input.year !== null ? Number(input.year) : null,
    abstract: input.abstract ? String(input.abstract).trim() : null,
    identifiers,
    primary_identifier,
    sources,
    provenance: input.provenance || options.provenance,
    epistemic_class: input.epistemic_class || EPISTEMIC_CLASSES.DOCUMENT_DERIVED,
    authority_class: 'CANONICAL_RESEARCH',
    acceptance_state: input.acceptance_state || ACCEPTANCE_STATES.ACCEPTED,
    trust_domain: input.trust_domain || 'engineering',
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || new Date().toISOString(),
    version: input.version || 1
  });
}

function normalizeTitleForCompare(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function titlesConflict(title1, title2) {
  const norm1 = normalizeTitleForCompare(title1);
  const norm2 = normalizeTitleForCompare(title2);
  if (!norm1 || !norm2) return false;
  if (norm1 === norm2) return false;
  if (norm1.includes(norm2) || norm2.includes(norm1)) return false;

  const words1 = new Set(norm1.split(' '));
  const words2 = new Set(norm2.split(' '));
  let overlap = 0;
  for (const w of words1) {
    if (words2.has(w)) overlap++;
  }
  const maxWords = Math.max(words1.size, words2.size);
  // If word overlap is under 40%, titles are materially incompatible
  return (overlap / maxWords) < 0.4;
}

export class DeterministicResearchCorpus {
  constructor({
    rootDir = process.cwd(),
    storageDir = join(process.cwd(), 'wiki', 'research'),
    trustDomain = 'engineering'
  } = {}) {
    this.rootDir = resolve(rootDir);
    this.storageDir = resolve(storageDir);
    this.trustDomain = trustDomain;
    this.documents = new Map(); // document_id -> ResearchDocument
  }

  listDocuments(filter = {}) {
    let docs = [...this.documents.values()];
    if (filter.trust_domain) {
      docs = docs.filter(d => d.trust_domain === filter.trust_domain);
    }
    if (filter.year) {
      docs = docs.filter(d => d.year === Number(filter.year));
    }
    if (filter.query) {
      const q = String(filter.query).toLowerCase();
      docs = docs.filter(d =>
        d.title.toLowerCase().includes(q) ||
        (d.authors && d.authors.some(a => a.toLowerCase().includes(q))) ||
        (d.abstract && d.abstract.toLowerCase().includes(q))
      );
    }
    return docs;
  }

  inspectDocument(idOrQuery) {
    if (!idOrQuery) return null;
    if (this.documents.has(idOrQuery)) {
      return this.documents.get(idOrQuery);
    }

    // Try finding by normalized identifier or source hash
    let normalized = null;
    try {
      normalized = normalizeIdentifier(idOrQuery);
    } catch {
      // not a standard identifier string
    }

    for (const doc of this.documents.values()) {
      if (normalized && doc.identifiers.some(id => id.type === normalized.type && id.value === normalized.value)) {
        return doc;
      }
      if (doc.sources.some(src => src.source_hash === idOrQuery || src.source_id === idOrQuery)) {
        return doc;
      }
    }

    return null;
  }

  resolveSource(sourceIdOrHash) {
    for (const doc of this.documents.values()) {
      for (const src of doc.sources) {
        if (src.source_id === sourceIdOrHash || src.source_hash === sourceIdOrHash) {
          const absolute_path = src.source_path ? resolve(this.rootDir, src.source_path) : null;
          return {
            found: true,
            source: src,
            absolute_path,
            document_id: doc.document_id
          };
        }
      }
    }
    return { found: false, source: null, absolute_path: null, document_id: null };
  }

  ingestCandidate(candidateInput, options = {}) {
    const candidate = createCandidate(candidateInput, { rootDir: this.rootDir, ...options });

    // Check for matching existing document
    let existingDoc = null;
    for (const id of candidate.identifiers) {
      existingDoc = this.inspectDocument(id.value);
      if (existingDoc) break;
    }

    if (existingDoc) {
      // Conflict detection: materially incompatible title or year
      if (candidate.title && existingDoc.title && titlesConflict(candidate.title, existingDoc.title)) {
        throw new ResearchConflictError(
          `Candidate title "${candidate.title}" conflicts with existing canonical document "${existingDoc.title}" for identifier`
        );
      }

      if (candidate.year && existingDoc.year && Math.abs(candidate.year - existingDoc.year) > 2) {
        throw new ResearchConflictError(
          `Candidate year ${candidate.year} conflicts with existing canonical document year ${existingDoc.year}`
        );
      }

      // Merge non-conflicting identifiers and metadata
      const existingIdValues = new Set(existingDoc.identifiers.map(id => `${id.type}:${id.value}`));
      const newIdentifiers = [...existingDoc.identifiers];
      for (const id of candidate.identifiers) {
        if (!existingIdValues.has(`${id.type}:${id.value}`)) {
          newIdentifiers.push(id);
          existingIdValues.add(`${id.type}:${id.value}`);
        }
      }

      const updatedDoc = new ResearchDocument({
        ...existingDoc,
        title: existingDoc.title || candidate.title,
        authors: existingDoc.authors || candidate.authors,
        year: existingDoc.year || candidate.year,
        abstract: existingDoc.abstract || candidate.abstract,
        identifiers: newIdentifiers,
        updated_at: new Date().toISOString()
      });

      this.documents.set(updatedDoc.document_id, updatedDoc);

      return {
        status: 'IDEMPOTENT_EXISTING',
        document: updatedDoc,
        candidate
      };
    }

    // New document creation from candidate
    const document = createDocument({
      title: candidate.title || (candidate.identifiers[0] ? `Paper ${candidate.identifiers[0].value}` : 'Untitled Research Document'),
      authors: candidate.authors,
      year: candidate.year,
      abstract: candidate.abstract,
      identifiers: candidate.identifiers,
      provenance: candidate.provenance,
      acceptance_state: ACCEPTANCE_STATES.ACCEPTED,
      trust_domain: this.trustDomain
    }, { rootDir: this.rootDir, ...options });

    this.documents.set(document.document_id, document);

    return {
      status: 'INGESTED',
      document,
      candidate
    };
  }

  ingestSource(sourceInput, options = {}) {
    const source = createSource(sourceInput, { rootDir: this.rootDir, ...options });
    const identifiers = (sourceInput.identifiers || []).map(id => normalizeIdentifier(id, options));

    let existingDoc = null;
    for (const id of identifiers) {
      existingDoc = this.inspectDocument(id.value);
      if (existingDoc) break;
    }

    if (!existingDoc && source.source_hash) {
      existingDoc = this.inspectDocument(source.source_hash);
    }

    if (existingDoc) {
      const hasSource = existingDoc.sources.some(s =>
        (s.source_hash && s.source_hash === source.source_hash) ||
        (s.source_path && s.source_path === source.source_path)
      );

      if (hasSource) {
        return {
          status: 'IDEMPOTENT_EXISTING',
          document: existingDoc,
          source
        };
      }

      const updatedDoc = new ResearchDocument({
        ...existingDoc,
        sources: [...existingDoc.sources, source],
        updated_at: new Date().toISOString()
      });

      this.documents.set(updatedDoc.document_id, updatedDoc);

      return {
        status: 'ATTACHED',
        document: updatedDoc,
        source
      };
    }

    const title = sourceInput.title || (source.source_path ? basename(source.source_path) : 'Acquired Research Source');
    const document = createDocument({
      title,
      identifiers,
      sources: [source],
      provenance: source.provenance,
      acceptance_state: ACCEPTANCE_STATES.ACCEPTED,
      trust_domain: this.trustDomain
    }, { rootDir: this.rootDir, ...options });

    this.documents.set(document.document_id, document);

    return {
      status: 'INGESTED',
      document,
      source
    };
  }

  updateMetadata(documentId, updates = {}) {
    const doc = this.documents.get(documentId);
    if (!doc) {
      throw new ResearchError(`Document not found: ${documentId}`);
    }

    // Protect canonical authority: derived/inferred external updates cannot overwrite canonical source fields
    if (updates.epistemic_class === EPISTEMIC_CLASSES.INFERRED || updates.actor === 'OpenViking') {
      if (doc.epistemic_class === EPISTEMIC_CLASSES.DOCUMENT_DERIVED || doc.authority_class === 'CANONICAL_RESEARCH') {
        throw new ResearchError('Derived metadata cannot overwrite canonical source data without authorized transition');
      }
    }

    const updated = new ResearchDocument({
      ...doc,
      title: updates.title || doc.title,
      authors: updates.authors || doc.authors,
      year: updates.year !== undefined ? updates.year : doc.year,
      abstract: updates.abstract !== undefined ? updates.abstract : doc.abstract,
      updated_at: new Date().toISOString(),
      version: doc.version + 1
    });

    this.documents.set(documentId, updated);
    return updated;
  }

  async save() {
    await mkdir(this.storageDir, { recursive: true });
    const catalogData = {
      schema_version: RESEARCH_SCHEMA_VERSION,
      updated_at: new Date().toISOString(),
      trust_domain: this.trustDomain,
      document_count: this.documents.size,
      documents: [...this.documents.values()]
    };

    const tempFile = join(this.storageDir, `CATALOG.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}.json`);
    const finalFile = join(this.storageDir, 'CATALOG.json');

    await writeFile(tempFile, JSON.stringify(catalogData, null, 2), 'utf8');
    await rename(tempFile, finalFile);
    return { status: 'SAVED', path: finalFile, count: this.documents.size };
  }

  async load() {
    const catalogFile = join(this.storageDir, 'CATALOG.json');
    if (!existsSync(catalogFile)) {
      return { status: 'EMPTY', count: 0 };
    }

    const raw = await readFile(catalogFile, 'utf8');
    const data = JSON.parse(raw);
    if (data.schema_version !== RESEARCH_SCHEMA_VERSION) {
      throw new ResearchValidationError(`Unsupported catalog schema version: ${data.schema_version}`);
    }

    this.documents.clear();
    for (const docData of data.documents || []) {
      const doc = new ResearchDocument(docData);
      this.documents.set(doc.document_id, doc);
    }

    return { status: 'LOADED', count: this.documents.size };
  }

  verifyIntegrity() {
    const issues = [];
    for (const doc of this.documents.values()) {
      for (const src of doc.sources) {
        if (src.source_path && src.source_hash) {
          const fullPath = resolve(this.rootDir, src.source_path);
          if (!existsSync(fullPath)) {
            issues.push({
              document_id: doc.document_id,
              source_id: src.source_id,
              error: `Source file missing: ${src.source_path}`
            });
          } else {
            const currentHash = hashSourceBytes(readFileSync(fullPath));
            if (currentHash !== src.source_hash) {
              issues.push({
                document_id: doc.document_id,
                source_id: src.source_id,
                error: `Source hash mismatch: expected ${src.source_hash}, found ${currentHash}`
              });
            }
          }
        }
      }
    }
    return {
      valid: issues.length === 0,
      checked_documents: this.documents.size,
      issues
    };
  }
}
