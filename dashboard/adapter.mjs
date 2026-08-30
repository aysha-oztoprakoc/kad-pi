/**
 * Sofia v3 Canonical Knowledge Adapter
 *
 * Provides a read-only projection adapter over canonical vault knowledge
 * and live control-plane runtime telemetry.
 *
 * Invariants:
 * 1. Zero canonical mutation authority.
 * 2. Complete provenance retention (kad_id, canonical_hash, vault_revision, epistemic_class).
 * 3. Explicit staleness detection on vault revision mismatch.
 */

export const SOFIA_ADAPTER_SCHEMA = 'kad-sofia-adapter-v1';

export function parseSofiaRecord(record) {
  if (!record || !record.kad_id || !record.canonical_hash) {
    throw new Error('Malformed Sofia knowledge record: missing kad_id or canonical_hash');
  }
  return {
    id: record.kad_id,
    title: record.title || record.kad_id,
    path: record.canonical_path,
    hash: record.canonical_hash,
    revision: record.vault_revision,
    authority: record.authority || 'UNKNOWN',
    epistemic_class: record.epistemic_class || 'UNKNOWN',
    temporal_status: record.temporal_status || 'CURRENT',
    review_status: record.review_status || 'UNKNOWN',
    context_eligible: Boolean(record.context_eligible),
    excerpt: record.body_excerpt || ''
  };
}

export function createSofiaKnowledgeFeed(projection) {
  if (!projection || projection.schema !== 'kad-sofia-projection-v1') {
    throw new Error('Invalid Sofia projection schema');
  }

  const parsedRecords = (projection.records || []).map(parseSofiaRecord);
  const byId = new Map(parsedRecords.map(r => [r.id, r]));

  return {
    schema_version: SOFIA_ADAPTER_SCHEMA,
    source_vault_revision: projection.source_vault_revision,
    generated_at: projection.generated_at,
    total_records: parsedRecords.length,
    current_records: parsedRecords.filter(r => r.temporal_status === 'CURRENT'),
    historical_records: parsedRecords.filter(r => r.temporal_status === 'HISTORICAL' || r.temporal_status === 'SUPERSEDED'),
    getRecord(id) {
      return byId.get(id) || null;
    },
    listCurrent() {
      return parsedRecords.filter(r => r.temporal_status === 'CURRENT');
    }
  };
}
