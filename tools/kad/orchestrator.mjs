import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { interpretText } from './interpreter.mjs';
import { executeDeterministicCore } from './bridge.mjs';
import { createInitialState, computeStateHash, cloneState, isStateEqual } from './state.mjs';
import { appendJournalEntry, generateCausalId } from './journal.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '../..');
const DEFAULT_JOURNAL_PATH = resolve(ROOT_DIR, 'evidence/WP-KAD-002/causal-journal.jsonl');

/**
 * Runs a complete single-turn world transition through the deterministic authority boundary.
 *
 * Transaction Policy:
 * 1. Interpretation is untrusted and cannot mutate GameState.
 * 2. Deterministic Validator/Resolver owns authority.
 * 3. NO JOURNAL -> NO EXTERNAL STATE COMMIT: If journal recording fails, runTurn throws
 *    before returning, ensuring external caller / adapter state does NOT advance.
 *
 * @param {string|object} input
 * @param {object} [initialState]
 * @param {object} [options]
 * @returns {object}
 */
export function runTurn(input, initialState = null, options = {}) {
  const engineExecutor = options.engineExecutor || executeDeterministicCore;
  const journalAppender = options.journalAppender || appendJournalEntry;
  const idFactory = options.idFactory || null;
  const clock = options.clock || (() => new Date().toISOString());

  const causationId = options.causationId || generateCausalId('turn', idFactory);
  const correlationId = options.correlationId || 'session-kad-main';
  const journalPath = options.journalPath !== undefined ? options.journalPath : DEFAULT_JOURNAL_PATH;

  // 1. Authoritative State Before
  const stateBefore = initialState ? cloneState(initialState) : createInitialState();
  const stateBeforeHash = computeStateHash(stateBefore);

  // 2. Untrusted Interpretation Layer
  const candidateIntent = interpretText(input);

  // 3. Deterministic Validation & Resolution Boundary (C++20 Engine)
  const engineResult = engineExecutor(candidateIntent, stateBefore, options);

  let stateAfter;
  let stateDiff = [];
  let domainEvent = null;
  let validationStatus = engineResult?.status || 'rejected';
  let validationDetail = null;
  let resolution = null;

  if (validationStatus === 'accepted') {
    // Authoritative mutation committed by Resolver
    stateAfter = engineResult.state_after;
    stateDiff = engineResult.diff_changes || [];
    domainEvent = {
      event_kind: engineResult.event_kind,
      actor: engineResult.actor,
      subject: engineResult.target,
      from: engineResult.from,
      to: engineResult.to
    };
    validationDetail = {
      action: engineResult.action,
      actor: engineResult.actor,
      target: engineResult.target
    };
    resolution = {
      outcome: engineResult.outcome,
      event_kind: engineResult.event_kind,
      from: engineResult.from,
      to: engineResult.to
    };
  } else {
    // Rejected: GameState is invariant (byte-for-byte unchanged)
    stateAfter = cloneState(stateBefore);
    stateDiff = [];
    validationStatus = 'rejected';
    validationDetail = {
      failure_kind: engineResult?.failure_kind || 'Rejection',
      detail: engineResult?.detail || 'Rejected by policy'
    };
  }

  const stateAfterHash = computeStateHash(stateAfter);

  // 4. Invariant Verification: Rejection must never mutate state
  if (validationStatus === 'rejected') {
    if (!isStateEqual(stateBefore, stateAfter) || stateBeforeHash !== stateAfterHash) {
      throw new Error(
        `CRITICAL AUTHORITY INVARIANT VIOLATION: GameState mutated on rejected intent!`
      );
    }
  }

  // 5. Causal Journal Append (Transaction Gate)
  // If journal append fails, this throws, preventing caller from advancing external state
  const journalEntry = journalAppender(journalPath, {
    causation_id: causationId,
    correlation_id: correlationId,
    timestamp_iso: clock(),
    input_text: typeof input === 'string' ? input : JSON.stringify(input),
    candidate_intent: candidateIntent,
    validation_status: validationStatus,
    validation_detail: validationDetail,
    resolution,
    state_before: stateBefore,
    state_before_hash: stateBeforeHash,
    state_diff: stateDiff,
    state_after: stateAfter,
    state_after_hash: stateAfterHash,
    domain_event: domainEvent,
    epistemic_status: 'OBSERVED',
    reality_level: options.realityLevel || 'INTEGRATION'
  }, { clock, idFactory, correlationId });

  return {
    accepted: validationStatus === 'accepted',
    status: validationStatus,
    input: typeof input === 'string' ? input : JSON.stringify(input),
    candidate_intent: candidateIntent,
    validation: validationDetail,
    resolution,
    state_before: stateBefore,
    state_before_hash: stateBeforeHash,
    state_diff: stateDiff,
    state_after: stateAfter,
    state_after_hash: stateAfterHash,
    domain_event: domainEvent,
    journal_entry: journalEntry
  };
}
