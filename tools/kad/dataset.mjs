import { readFileSync, writeFileSync, existsSync } from 'node:fs';

/**
 * Extracts and formats causal journal turns into structured training/evaluation dataset format.
 *
 * @param {string} journalPath - Source JSONL journal path
 * @param {string} [outputPath] - Optional output dataset path
 * @returns {Array<object>} Dataset rows
 */
export function generateTurnDataset(journalPath, outputPath = null) {
  if (!existsSync(journalPath)) {
    throw new Error(`Journal file not found at ${journalPath}`);
  }

  const lines = readFileSync(journalPath, 'utf8').trim().split('\n').filter(Boolean);
  const rows = [];

  for (const line of lines) {
    const rec = JSON.parse(line);
    const row = {
      dataset_id: `kad-ds-${rec.turn_index || Date.now()}`,
      instruction: 'Interpret natural language command into CandidateIntent, validate deterministically, and compute StateDiff and PON reactions.',
      turn_index: rec.turn_index,
      input_text: rec.input || rec.input_text,
      candidate_intent: rec.candidate_intent,
      validation_status: rec.validation_status || rec.status,
      validation_detail: rec.validation || rec.validation_detail,
      resolution: rec.resolution,
      state_diff: rec.state_diff,
      state_before_hash: rec.state_before_hash,
      state_after_hash: rec.state_after_hash,
      domain_event: rec.domain_event,
      pon_reactions: rec.pon_reactions || []
    };
    rows.push(row);
  }

  if (outputPath) {
    const content = rows.map(r => JSON.stringify(r)).join('\n') + '\n';
    writeFileSync(outputPath, content, 'utf8');
  }

  return rows;
}
