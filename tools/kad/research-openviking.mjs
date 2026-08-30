import { createHash } from 'node:crypto';

export const RESEARCH_CONTEXT_DERIVATION_VERSION = 'kad-research-context-v1';
export const RESEARCH_VIKING_PREFIX = 'viking://resources/research/';

export class ResearchContextError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ResearchContextError';
  }
}

export function buildResearchResourceUri(documentId, layer = 'L0', chunkId = null) {
  if (!documentId || typeof documentId !== 'string') {
    throw new ResearchContextError('canonical documentId is required for OpenViking URI');
  }

  const normalizedLayer = String(layer).toUpperCase();
  if (normalizedLayer === 'L0') {
    return `${RESEARCH_VIKING_PREFIX}${documentId}/l0.json`;
  }
  if (normalizedLayer === 'L1') {
    return `${RESEARCH_VIKING_PREFIX}${documentId}/l1.json`;
  }
  if (normalizedLayer === 'L2') {
    if (chunkId) {
      return `${RESEARCH_VIKING_PREFIX}${documentId}/l2/${chunkId}.json`;
    }
    return `${RESEARCH_VIKING_PREFIX}${documentId}/l2.json`;
  }

  throw new ResearchContextError(`Unsupported research context layer: '${layer}'. Allowed: L0, L1, L2`);
}
export function parseResearchResourceUri(uri) {
  if (!uri || typeof uri !== 'string' || !uri.startsWith(RESEARCH_VIKING_PREFIX)) {
    throw new ResearchContextError(`Invalid research OpenViking URI: '${uri}'`);
  }

  const pathPart = uri.slice(RESEARCH_VIKING_PREFIX.length);

  if (pathPart.endsWith('/l0.json')) {
    const docId = pathPart.slice(0, -'/l0.json'.length);
    return { canonical_document_id: docId, layer: 'L0', chunk_id: null };
  }
  if (pathPart.endsWith('/l1.json')) {
    const docId = pathPart.slice(0, -'/l1.json'.length);
    return { canonical_document_id: docId, layer: 'L1', chunk_id: null };
  }
  if (pathPart.endsWith('/l2.json')) {
    const docId = pathPart.slice(0, -'/l2.json'.length);
    return { canonical_document_id: docId, layer: 'L2', chunk_id: null };
  }

  const l2Match = pathPart.match(/^(.+)\/l2\/(.+)\.json$/);
  if (l2Match) {
    return { canonical_document_id: l2Match[1], layer: 'L2', chunk_id: l2Match[2] };
  }

  throw new ResearchContextError(`Unrecognized research URI path: '${uri}'`);
}

export function deriveL0Context(document, source = null, options = {}) {
  if (!document || !document.document_id) {
    throw new ResearchContextError('Valid ResearchDocument is required to derive L0 context');
  }

  const abstract = document.abstract || '';
  const briefOrientation = abstract.length > 200
    ? abstract.slice(0, 197).trim() + '...'
    : abstract || document.title;

  return Object.freeze({
    canonical_document_id: document.document_id,
    layer: 'L0',
    derivation_version: options.derivation_version || RESEARCH_CONTEXT_DERIVATION_VERSION,
    source_id: source?.source_id || null,
    source_hash: source?.source_hash || null,
    title: document.title,
    authors: document.authors ? [...document.authors] : [],
    year: document.year || null,
    primary_identifier: document.primary_identifier
      ? { type: document.primary_identifier.type, value: document.primary_identifier.value }
      : null,
    brief_orientation: briefOrientation,
    derived_at: options.derived_at || new Date().toISOString()
  });
}

export function deriveL1Context(document, source = null, options = {}) {
  if (!document || !document.document_id) {
    throw new ResearchContextError('Valid ResearchDocument is required to derive L1 context');
  }

  const structuredOverview = options.structured_overview || {
    research_question: options.research_question || null,
    method: options.method || null,
    contribution: options.contribution || null,
    limitations: options.limitations || null
  };

  return Object.freeze({
    canonical_document_id: document.document_id,
    layer: 'L1',
    derivation_version: options.derivation_version || RESEARCH_CONTEXT_DERIVATION_VERSION,
    source_id: source?.source_id || null,
    source_hash: source?.source_hash || null,
    title: document.title,
    authors: document.authors ? [...document.authors] : [],
    year: document.year || null,
    abstract: document.abstract || null,
    structured_overview: Object.freeze({ ...structuredOverview }),
    derived_at: options.derived_at || new Date().toISOString()
  });
}

export function deriveL2Chunk(document, source, options = {}) {
  if (!document || !document.document_id) {
    throw new ResearchContextError('Valid ResearchDocument is required to derive L2 chunk');
  }
  if (!source || !source.source_hash) {
    throw new ResearchContextError('Valid ResearchSource with source_hash is required to derive L2 chunk');
  }
  if (!options.chunk_id || typeof options.chunk_id !== 'string') {
    throw new ResearchContextError('chunk_id is required for L2 chunk');
  }
  if (!options.content || typeof options.content !== 'string') {
    throw new ResearchContextError('content is required for L2 chunk');
  }

  return Object.freeze({
    canonical_document_id: document.document_id,
    layer: 'L2',
    derivation_version: options.derivation_version || RESEARCH_CONTEXT_DERIVATION_VERSION,
    source_id: source.source_id,
    source_ref: source.source_path || source.source_ref || null,
    source_hash: source.source_hash,
    chunk_id: String(options.chunk_id).trim(),
    locator: options.locator && typeof options.locator === 'object' ? Object.freeze({ ...options.locator }) : {},
    content: options.content,
    derived_at: options.derived_at || new Date().toISOString()
  });
}

export function evaluateContextStaleness(derivedResource, canonicalSource, options = {}) {
  if (!derivedResource) {
    return { is_stale: true, reason: 'CONTEXT_MISSING' };
  }

  const expectedDerivationVersion = options.derivation_version || RESEARCH_CONTEXT_DERIVATION_VERSION;
  if (derivedResource.derivation_version !== expectedDerivationVersion) {
    return {
      is_stale: true,
      reason: 'DERIVATION_VERSION_MISMATCH',
      expected_version: expectedDerivationVersion,
      actual_version: derivedResource.derivation_version
    };
  }

  if (canonicalSource && derivedResource.source_hash && canonicalSource.source_hash) {
    if (derivedResource.source_hash !== canonicalSource.source_hash) {
      return {
        is_stale: true,
        reason: 'SOURCE_HASH_MISMATCH',
        expected_hash: canonicalSource.source_hash,
        actual_hash: derivedResource.source_hash
      };
    }
  }

  return { is_stale: false };
}

export class ResearchOpenVikingAdapter {
  #store = new Map(); // key: uri, value: resource
  #available = true;

  constructor(options = {}) {
    this.name = 'OpenVikingResearchAdapter';
    this.authority = false; // Invariant: OpenViking is strictly non-authoritative
    this.baseUrl = options.baseUrl || 'http://127.0.0.1:1933';
  }

  setSimulatedAvailability(available) {
    this.#available = Boolean(available);
  }

  async health() {
    if (!this.#available) {
      return { status: 'DEGRADED', healthy: false, error: 'OpenViking service unavailable' };
    }
    return { status: 'PASS', healthy: true, version: '0.4.17', auth_mode: 'dev' };
  }

  async indexResearchDocument(document, source = null, options = {}) {
    if (!this.#available) {
      throw new ResearchContextError('OpenViking service is unavailable');
    }

    const docId = document.document_id;
    const l0 = deriveL0Context(document, source, options.l0);
    const l1 = deriveL1Context(document, source, options.l1);

    const l0Uri = buildResearchResourceUri(docId, 'L0');
    const l1Uri = buildResearchResourceUri(docId, 'L1');

    this.#store.set(l0Uri, l0);
    this.#store.set(l1Uri, l1);

    const indexedUris = [l0Uri, l1Uri];

    if (Array.isArray(options.l2_chunks) && source) {
      for (const chunkDef of options.l2_chunks) {
        const l2 = deriveL2Chunk(document, source, chunkDef);
        const l2Uri = buildResearchResourceUri(docId, 'L2', l2.chunk_id);
        this.#store.set(l2Uri, l2);
        indexedUris.push(l2Uri);
      }
    }

    return {
      status: 'INDEXED',
      canonical_document_id: docId,
      resource_count: indexedUris.length,
      uris: indexedUris
    };
  }

  async readResource(uri) {
    if (!this.#available) {
      throw new ResearchContextError('OpenViking service is unavailable');
    }
    return this.#store.get(uri) || null;
  }

  async deleteResearchContext(documentId) {
    const prefix = `${RESEARCH_VIKING_PREFIX}${documentId}/`;
    let deletedCount = 0;
    for (const key of [...this.#store.keys()]) {
      if (key.startsWith(prefix)) {
        this.#store.delete(key);
        deletedCount++;
      }
    }
    return { status: 'DELETED', deleted_count: deletedCount };
  }

  async rebuildResearchContext(document, source = null, options = {}) {
    await this.deleteResearchContext(document.document_id);
    return this.indexResearchDocument(document, source, options);
  }

  async retrieve(query, options = {}) {
    if (!this.#available) {
      throw new ResearchContextError('OpenViking service is unavailable');
    }

    const q = String(query).toLowerCase();
    const docFilter = options.documentId ? `${RESEARCH_VIKING_PREFIX}${options.documentId}/` : null;
    const results = [];

    for (const [uri, resource] of this.#store.entries()) {
      if (docFilter && !uri.startsWith(docFilter)) {
        continue;
      }
      if (options.layer && resource.layer !== options.layer) {
        continue;
      }

      // Match query in content / title / overview
      const matchableText = [
        resource.title,
        resource.brief_orientation,
        resource.abstract,
        resource.content,
        resource.structured_overview?.research_question,
        resource.structured_overview?.contribution,
        resource.structured_overview?.method
      ].filter(Boolean).join(' ').toLowerCase();

      if (matchableText.includes(q)) {
        results.push({
          uri,
          ...resource
        });
      }
    }

    return results.slice(0, options.limit || 10);
  }

  async retrieveProgressiveContext(documentId, options = {}) {
    const corpus = options.corpus;
    const requestedLayer = options.layer || 'L0';

    if (!this.#available) {
      if (corpus) {
        const canonicalDoc = corpus.inspectDocument(documentId);
        return {
          status: 'FALLBACK_EXACT',
          reason: 'OPENVIKING_UNAVAILABLE',
          document: canonicalDoc,
          source: canonicalDoc?.sources?.[0] || null
        };
      }
      throw new ResearchContextError('OpenViking unavailable and no corpus supplied for fallback');
    }

    const targetUri = buildResearchResourceUri(documentId, requestedLayer);
    const derivedResource = this.#store.get(targetUri);

    if (!derivedResource) {
      if (corpus) {
        const canonicalDoc = corpus.inspectDocument(documentId);
        return {
          status: 'FALLBACK_EXACT',
          reason: 'CONTEXT_MISSING',
          document: canonicalDoc,
          source: canonicalDoc?.sources?.[0] || null
        };
      }
      return { status: 'MISSING', document_id: documentId, layer: requestedLayer };
    }

    // Check staleness if corpus is available
    if (corpus) {
      const canonicalDoc = corpus.inspectDocument(documentId);
      const canonicalSource = canonicalDoc?.sources?.[0] || null;
      const staleness = evaluateContextStaleness(derivedResource, canonicalSource);
      if (staleness.is_stale) {
        return {
          status: 'FALLBACK_EXACT',
          reason: `STALE_${staleness.reason}`,
          document: canonicalDoc,
          source: canonicalSource,
          stale_resource: derivedResource
        };
      }
    }

    return {
      status: 'HIT',
      layer: requestedLayer,
      resource: derivedResource,
      trace: {
        canonical_document_id: derivedResource.canonical_document_id,
        source_id: derivedResource.source_id,
        source_hash: derivedResource.source_hash,
        derivation_version: derivedResource.derivation_version
      }
    };
  }
}
