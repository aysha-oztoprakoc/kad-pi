import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

let globalTurnSequence = 0;

/**
 * Generates unique causal/turn identifiers.
 * Note: Uses process-local monotonic sequence + wall-clock timestamp unless custom idFactory is injected.
 * @param {string} prefix
 * @param {Function} [idFactory]
 * @returns {string}
 */
export function generateCausalId(prefix = 'kad', idFactory = null) {
  if (typeof idFactory === 'function') {
    return idFactory(prefix);
  }
  return `${prefix}:${Date.now()}:${++globalTurnSequence}`;
}

/**
 * Appends a structured turn record to the append-oriented JSONL causal journal.
 *
 * @param {string} journalPath
 * @param {object} entry
 * @param {object} [options]
 */
export function appendJournalEntry(journalPath, entry, options = {}) {
  if (!journalPath) return null;

  const dir = dirname(journalPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const clock = options.clock || (() => new Date().toISOString());
  const idFactory = options.idFactory || null;

  const record = {
    turn_id: entry.turn_id || generateCausalId('turn', idFactory),
    run_id: entry.run_id || (options.runId || `run-wp002-${Date.now()}`),
    causation_id: entry.causation_id || 'root-user-command',
    correlation_id: entry.correlation_id || (options.correlationId || 'session-kad-main'),
    timestamp_iso: entry.timestamp_iso || clock(),
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
