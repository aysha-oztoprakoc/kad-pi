/**
 * KAD-PI Public Website Data Adapter
 *
 * Consumes public canonical projections compiled from vault/90_Derived/Projections/
 * Enforces strict fail-closed publication filtering:
 * - authority == 'CANONICAL_KNOWLEDGE'
 * - review_status == 'APPROVED'
 * - publish == true
 * - visibility == 'public'
 */

export const PUBLICATION_FILTER_SCHEMA = 'kad-public-adapter-v1';

/**
 * Fetch and validate public state from static JSON artifact.
 */
export async function fetchPublicState(fetchImpl = globalThis.fetch, url = './generated/public-state.json') {
  const response = await fetchImpl(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Public projection fetch failed: HTTP ${response.status}`);
  }
  const data = await response.json();
  if (data.publication_class !== 'PUBLIC') {
    throw new Error('Non-public projection rejected by security adapter');
  }
  return data;
}

/**
 * Pure filter ensuring only approved, public records are displayed.
 */
export function filterPublicRecords(records = []) {
  if (!Array.isArray(records)) return [];
  return records.filter(r => (
    r && typeof r === 'object' &&
    r.publish !== false &&
    r.visibility !== 'private' &&
    (r.review_status === 'APPROVED' || r.authority === 'CANONICAL_KNOWLEDGE' || r.privacy_class === 'PUBLIC')
  ));
}

/**
 * Search public records by query string against title, description, id, or type.
 */
export function searchPublicRecords(records = [], query = '') {
  const q = String(query).trim().toLowerCase();
  if (!q) return records;
  return records.filter(r => {
    const id = String(r.id || r.kad_id || '').toLowerCase();
    const title = String(r.title || '').toLowerCase();
    const desc = String(r.description || r.excerpt || '').toLowerCase();
    const type = String(r.type || r.namespace || '').toLowerCase();
    return id.includes(q) || title.includes(q) || desc.includes(q) || type.includes(q);
  });
}

/**
 * Filter public records by semantic type or namespace.
 */
export function filterRecordsByType(records = [], type = '') {
  if (!type || type === 'ALL') return records;
  const t = String(type).toUpperCase();
  return records.filter(r => {
    const recType = String(r.type || r.namespace || '').toUpperCase();
    return recType === t;
  });
}

/**
 * Produce structured summary of public platform status.
 */
export function summarizePublicState(state = {}) {
  const proj = state.project || {};
  const records = filterPublicRecords(state.records || []);
  const components = state.component_summary || {};

  return {
    projectName: proj.name || 'KAD-PI',
    status: proj.status || 'UNKNOWN',
    sourceCount: proj.source_count ?? records.length,
    recordCount: proj.record_count ?? records.length,
    publicRecords: records,
    components,
    schemaVersion: state.schema_version || 'unknown'
  };
}
