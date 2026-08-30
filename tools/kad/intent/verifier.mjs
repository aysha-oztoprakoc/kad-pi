import { compileAlignmentReport } from './compiler.mjs';

/**
 * Verifies that a human-readable alignment report matches the exact compiled output
 * from typed intent events and normalizations without semantic or text drift.
 *
 * @param {string} reportMarkdown
 * @param {Array<object>} events
 * @param {Array<object>} normalizations
 * @param {object} [options]
 * @returns {{ verified: boolean, errors: string[] }}
 */
export function verifyAlignmentReport(reportMarkdown, events = [], normalizations = [], options = {}) {
  const errors = [];

  if (typeof reportMarkdown !== 'string' || reportMarkdown.trim() === '') {
    return { verified: false, errors: ['Report markdown is empty or invalid'] };
  }

  // Extract date from header if present
  let date = options.date;
  if (!date) {
    const match = reportMarkdown.match(/# KAD-PI CANONICAL INTENTION ALIGNMENT & DECISION REGISTER \(([0-9]{4}-[0-9]{2}-[0-9]{2})\)/);
    if (match) {
      date = match[1];
    }
  }

  const expectedMarkdown = compileAlignmentReport(events, normalizations, { ...options, date });

  // Normalize newlines and trailing whitespace for robust comparison
  const normalize = (str) => str.replace(/\r\n/g, '\n').trim();

  if (normalize(reportMarkdown) !== normalize(expectedMarkdown)) {
    errors.push('Report markdown divergence mismatch: output does not match deterministically compiled output of typed ledger');
  }

  return {
    verified: errors.length === 0,
    errors
  };
}
