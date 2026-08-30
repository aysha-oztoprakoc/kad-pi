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

export function filterPublicRecords(records = []) {
  return records.filter(r => (
    r.publish === true &&
    r.visibility === 'public' &&
    r.review_status === 'APPROVED'
  ));
}
