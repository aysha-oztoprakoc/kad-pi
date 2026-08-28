import { readFileSync, existsSync } from 'node:fs';
import { PersistentSession } from './session.mjs';
import { createDeclarativeWorld, computeWorldHash } from './world-model.mjs';

/**
 * Deterministically replays a multi-turn journal and verifies state equivalence at every turn.
 *
 * @param {string} journalPath - Path to append-oriented JSONL journal
 * @param {object} [initialTopology] - Optional starting world topology
 * @returns {object} Replay verification report
 */
export function replayJournal(journalPath, initialTopology = null) {
  if (!existsSync(journalPath)) {
    throw new Error(`Journal file not found at ${journalPath}`);
  }

  const rawContent = readFileSync(journalPath, 'utf8').trim();
  if (!rawContent) {
    return {
      verified: true,
      turns_replayed: 0,
      initial_state_hash: null,
      final_state_hash: null,
      details: []
    };
  }

  const records = rawContent.split('\n').filter(Boolean).map(JSON.parse);
  const startingWorld = initialTopology || createDeclarativeWorld();
  const initialHash = computeWorldHash(startingWorld);

  const replaySession = new PersistentSession({
    initialWorld: startingWorld,
    sessionId: `replay-${Date.now()}`
  });

  const stepDetails = [];

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const rawInput = rec.input_text || rec.input;
    const replayed = replaySession.executeTurn(rawInput);

    const matchBefore = replayed.state_before_hash === rec.state_before_hash;
    const matchAfter = replayed.state_after_hash === rec.state_after_hash;
    const matchStatus = replayed.status === rec.validation_status;

    stepDetails.push({
      turn_index: rec.turn_index,
      input: rec.input,
      match_before: matchBefore,
      match_after: matchAfter,
      match_status: matchStatus,
      recorded_after_hash: rec.state_after_hash,
      replayed_after_hash: replayed.state_after_hash
    });

    if (!matchBefore || !matchAfter || !matchStatus) {
      throw new Error(
        `DETERMINISTIC REPLAY MISMATCH at Turn ${rec.turn_index}: Input="${rec.input}", RecordedAfterHash=${rec.state_after_hash}, ReplayedAfterHash=${replayed.state_after_hash}`
      );
    }
  }

  const finalHash = computeWorldHash(replaySession.worldState);

  return {
    verified: true,
    turns_replayed: records.length,
    initial_state_hash: initialHash,
    final_state_hash: finalHash,
    details: stepDetails
  };
}
