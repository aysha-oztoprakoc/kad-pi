import { createCandidate } from './research.mjs';

export const DEFAULT_ZOTERO_LOCAL_URL = 'http://localhost:23119/api/';

export class ZoteroError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ZoteroError';
  }
}

export class ZoteroSecurityError extends ZoteroError {
  constructor(message) {
    super(message);
    this.name = 'ZoteroSecurityError';
  }
}

export class ZoteroClientError extends ZoteroError {
  constructor(message, status = null) {
    super(message);
    this.name = 'ZoteroClientError';
    this.status = status;
  }
}

export function isLoopbackUrl(urlStr) {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname.toLowerCase();
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '[::1]'
    );
  } catch {
    return false;
  }
}

export function normalizeZoteroItem(zoteroItem, options = {}) {
  if (!zoteroItem || typeof zoteroItem !== 'object') {
    throw new ZoteroError('Invalid Zotero item: object expected');
  }

  const data = zoteroItem.data || zoteroItem;
  const itemKey = String(data.key || zoteroItem.key || '').trim();
  const title = String(data.title || '').trim();

  // Extract authors / creators
  const rawCreators = Array.isArray(data.creators) ? data.creators : [];
  const authors = [];
  for (const c of rawCreators) {
    if (c.name && String(c.name).trim()) {
      authors.push(String(c.name).trim());
    } else {
      const parts = [c.firstName, c.lastName].filter(Boolean).map(s => String(s).trim());
      if (parts.length > 0) {
        authors.push(parts.join(' '));
      }
    }
  }

  // Extract year
  let year = null;
  if (data.date) {
    const match = String(data.date).match(/\b(19\d{2}|20\d{2})\b/);
    if (match) {
      year = parseInt(match[1], 10);
    }
  }

  // Extract identifiers
  const identifiers = [];
  if (data.DOI && String(data.DOI).trim()) {
    identifiers.push({ type: 'doi', value: String(data.DOI).trim() });
  }
  if (data.ISBN && String(data.ISBN).trim()) {
    identifiers.push({ type: 'isbn', value: String(data.ISBN).trim() });
  }
  if (data.url && String(data.url).trim()) {
    identifiers.push({ type: 'url', value: String(data.url).trim() });
  }

  // Check extra field for arXiv / PMID
  if (data.extra) {
    const extraStr = String(data.extra);
    const arxivMatch = extraStr.match(/(?:arXiv:\s*|arxiv:\s*)([0-9]{4}\.[0-9]{4,5}(?:v\d+)?|[a-z\-]+(?:\.[A-Z]{2})?\/\d{7})/i);
    if (arxivMatch) {
      identifiers.push({ type: 'arxiv', value: arxivMatch[1] });
    }
    const pmidMatch = extraStr.match(/(?:PMID:\s*|pmid:\s*)(\d+)/i);
    if (pmidMatch) {
      identifiers.push({ type: 'pmid', value: pmidMatch[1] });
    }
  }

  const provenance = {
    method: 'zotero_local_api',
    ingestion_method: 'zotero_local_api',
    origin: 'zotero',
    origin_record_id: itemKey || null,
    server_id: options.serverId || null,
    api_version: options.apiVersion || '3',
    observed_at: options.observedAt || new Date().toISOString()
  };

  return createCandidate({
    title,
    authors: authors.length > 0 ? authors : null,
    year,
    abstract: data.abstractNote ? String(data.abstractNote).trim() : null,
    identifiers,
    provenance,
    metadata_only: true
  });
}

export class ZoteroLocalAdapter {
  constructor(options = {}) {
    const baseUrl = options.baseUrl || DEFAULT_ZOTERO_LOCAL_URL;
    if (!isLoopbackUrl(baseUrl)) {
      throw new ZoteroSecurityError(
        `Zotero Local API is restricted strictly to loopback addresses (localhost, 127.0.0.1, [::1]). Rejecting '${baseUrl}'`
      );
    }

    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    this.userId = options.userId || '0';
    this.timeoutMs = options.timeoutMs || 5000;
    this.fetcher = options.fetcher || fetch;
    this.readOnly = true;
    this.authority = false;

    this.lastProbe = null;
  }

  async request(path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    if (method !== 'GET' && method !== 'HEAD') {
      throw new ZoteroSecurityError(
        `ZoteroLocalAdapter is strictly read-only. HTTP method '${method}' is forbidden.`
      );
    }

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const fullUrl = new URL(cleanPath, this.baseUrl);

    if (!isLoopbackUrl(fullUrl.toString())) {
      throw new ZoteroSecurityError(`Request target URL is not a loopback address: ${fullUrl}`);
    }

    const headers = {
      Accept: 'application/json',
      'Zotero-API-Version': '3',
      ...(options.headers || {})
    };

    let response;
    try {
      response = await this.fetcher(fullUrl.toString(), {
        method,
        headers,
        signal: AbortSignal.timeout(this.timeoutMs)
      });
    } catch (err) {
      if (err.name === 'TimeoutError') {
        throw new ZoteroClientError(`Zotero Local API request timed out after ${this.timeoutMs}ms`, 408);
      }
      throw new ZoteroClientError(`Zotero Local API connection failed: ${err.message}`, 503);
    }

    if (response.status === 403) {
      throw new ZoteroClientError('Zotero Local API access forbidden (Local API communication may be disabled in Zotero settings)', 403);
    }

    if (!response.ok) {
      const bodyText = await response.text().catch(() => '');
      throw new ZoteroClientError(`Zotero Local API returned HTTP ${response.status}: ${bodyText}`, response.status);
    }

    return response;
  }

  async probe() {
    try {
      const response = await this.request('');
      const apiVersion = response.headers?.get?.('zotero-api-version') || '3';
      const serverId = response.headers?.get?.('zotero-server-id') || null;

      const probeResult = {
        status: 'AVAILABLE',
        apiVersion,
        serverId,
        endpoint: this.baseUrl,
        healthy: true,
        checkedAt: new Date().toISOString()
      };
      this.lastProbe = probeResult;
      return probeResult;
    } catch (err) {
      let status = 'UNAVAILABLE';
      let reason = 'CONNECTION_REFUSED';

      if (err.status === 403) {
        status = 'UNAUTHORIZED';
        reason = 'LOCAL_API_DISABLED';
      } else if (err.status === 408) {
        status = 'DEGRADED';
        reason = 'TIMEOUT';
      }

      const degradedResult = {
        status,
        reason,
        error: err.message,
        endpoint: this.baseUrl,
        healthy: false,
        checkedAt: new Date().toISOString()
      };
      this.lastProbe = degradedResult;
      return degradedResult;
    }
  }

  async listItems(options = {}) {
    const limit = options.limit || 50;
    const start = options.start || 0;
    const path = `users/${this.userId}/items?limit=${limit}&start=${start}`;

    const response = await this.request(path);
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      throw new ZoteroClientError(`Failed to parse Zotero items JSON: ${err.message}`);
    }
  }

  async getItem(itemKey) {
    if (!itemKey || typeof itemKey !== 'string') {
      throw new ZoteroError('itemKey is required');
    }

    const path = `users/${this.userId}/items/${encodeURIComponent(itemKey)}`;
    const response = await this.request(path);
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      throw new ZoteroClientError(`Failed to parse Zotero item JSON: ${err.message}`);
    }
  }

  async listCollections(options = {}) {
    const limit = options.limit || 50;
    const start = options.start || 0;
    const path = `users/${this.userId}/collections?limit=${limit}&start=${start}`;

    const response = await this.request(path);
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      throw new ZoteroClientError(`Failed to parse Zotero collections JSON: ${err.message}`);
    }
  }

  async getCollectionItems(collectionKey, options = {}) {
    if (!collectionKey || typeof collectionKey !== 'string') {
      throw new ZoteroError('collectionKey is required');
    }

    const limit = options.limit || 50;
    const start = options.start || 0;
    const path = `users/${this.userId}/collections/${encodeURIComponent(collectionKey)}/items?limit=${limit}&start=${start}`;

    const response = await this.request(path);
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      throw new ZoteroClientError(`Failed to parse Zotero collection items JSON: ${err.message}`);
    }
  }
}
