import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

let globalTurnSequence = 0;

/**
 * Generates a deterministic or monotonic correlation/causation ID.
 * @param {string} prefix
 * @returns {string}
 */
export function generateCausalId(prefix = 'kad') {
  return `${prefix}:${Date.now()}:${++globalTurnSequence}`;
}

/**
 * Appends a structured turn record to the causal journal.
 * @param {string} journalPath
 * @param {object} entry
 */
export function appendJournalEntry(journalPath, entry) {
  if (!journalPath) return;

  const dir = dirname(journalPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const record = {
    turn_id: entry.turn_id || `turn-${Date.now()}-${++globalTurnSequence}`,
    run_id: entry.run_id || `run-wp002-${Date.now()}`,
    causation_id: entry.causation_id || 'root-user-command',
    correlation_id: entry.correlation_id || 'session-kad-main',
    timestamp_iso: entry.timestamp_iso || new Date().toISOString(),
    input_text: entry.input_text,
    candidate_intent: entry.candidate_intent,
    validation_status: entry.validation_status,
    validation_detail: entry.validation_detail || null,
    resolution: entry.resolution || null,
    state_before: entry.state_before,
    state_before_hash: entry.state_before_hash,
    state_diff: entry.state_diff || [],
    state_after: entry.state_after,
    state_after_hash: entry.state_after_hash,
    domain_event: entry.domain_event || null,
    epistemic_status: entry.epistemic_status || 'OBSERVED',
    reality_level: entry.reality_level || 'INTEGRATION',
    engine_provenance: {
      version: 'WP-KAD-002-v1',
      binary: 'kad-lab/build/kad_engine_cli',
      authority_boundary: 'deterministic-cpp20'
    }
  };

  const line = JSON.stringify(record) + '\n';
  appendFileSync(journalPath, line, 'utf8');
  return record;
}
