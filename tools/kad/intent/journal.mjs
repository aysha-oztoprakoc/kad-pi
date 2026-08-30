import { readFileSync, appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { validateIntentEvent, validateIntentNormalization } from './validator.mjs';

export const DEFAULT_EVENTS_JOURNAL_PATH = resolve(process.cwd(), 'evidence/intent/events.jsonl');
export const DEFAULT_NORMALIZATIONS_PATH = resolve(process.cwd(), 'evidence/intent/normalizations.jsonl');

/**
 * Reads and parses an append-only JSONL events journal.
 * @param {string} [filePath]
 * @returns {{ events: Array<object>, errors: string[] }}
 */
export function readIntentJournal(filePath = DEFAULT_EVENTS_JOURNAL_PATH) {
  if (!existsSync(filePath)) {
    return { events: [], errors: [] };
  }

  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const events = [];
  const errors = [];

  for (let i = 0; i < lines.length; i++) {
    try {
      const parsed = JSON.parse(lines[i]);
      events.push(parsed);
    } catch (err) {
      errors.push(`JSON parse error at line ${i + 1}: ${err.message}`);
    }
  }

  return { events, errors };
}

/**
 * Reads and parses an append-only JSONL normalizations file.
 * @param {string} [filePath]
 * @returns {{ normalizations: Array<object>, errors: string[] }}
 */
export function readIntentNormalizations(filePath = DEFAULT_NORMALIZATIONS_PATH) {
  if (!existsSync(filePath)) {
    return { normalizations: [], errors: [] };
  }

  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const normalizations = [];
  const errors = [];

  for (let i = 0; i < lines.length; i++) {
    try {
      const parsed = JSON.parse(lines[i]);
      normalizations.push(parsed);
    } catch (err) {
      errors.push(`JSON parse error at line ${i + 1}: ${err.message}`);
    }
  }

  return { normalizations, errors };
}

/**
 * Appends a validated intent event to the JSONL journal.
 * @param {string} filePath
 * @param {object} event
 * @returns {object}
 */
export function appendIntentEvent(filePath, event) {
  const val = validateIntentEvent(event);
  if (!val.valid) {
    throw new Error(`Cannot append invalid event: ${val.errors.join('; ')}`);
  }

  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const line = JSON.stringify(event) + '\n';
  appendFileSync(filePath, line, 'utf8');
  return event;
}

/**
 * Appends a validated normalization to the normalizations JSONL file.
 * @param {string} filePath
 * @param {object} normalization
 * @param {Array<object>} [knownEvents]
 * @returns {object}
 */
export function appendIntentNormalization(filePath, normalization, knownEvents = []) {
  const val = validateIntentNormalization(normalization, knownEvents);
  if (!val.valid) {
    throw new Error(`Cannot append invalid normalization: ${val.errors.join('; ')}`);
  }

  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const line = JSON.stringify(normalization) + '\n';
  appendFileSync(filePath, line, 'utf8');
  return normalization;
}

/**
 * Writes or rewrites full set of events safely (used during atomic ingestion).
 * @param {string} filePath
 * @param {Array<object>} events
 */
export function writeAllEvents(filePath, events) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const content = events.map(e => JSON.stringify(e)).join('\n') + (events.length > 0 ? '\n' : '');
  writeFileSync(filePath, content, 'utf8');
}

/**
 * Writes or rewrites full set of normalizations safely.
 * @param {string} filePath
 * @param {Array<object>} normalizations
 */
export function writeAllNormalizations(filePath, normalizations) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const content = normalizations.map(n => JSON.stringify(n)).join('\n') + (normalizations.length > 0 ? '\n' : '');
  writeFileSync(filePath, content, 'utf8');
}

/**
 * Loads the complete intent ledger (both events and normalizations) from default or given paths.
 * @param {object} [options]
 * @returns {{ events: Array<object>, normalizations: Array<object>, errors: string[] }}
 */
export function loadFullIntentLedger(options = {}) {
  const eventsPath = options.eventsPath || DEFAULT_EVENTS_JOURNAL_PATH;
  const normsPath = options.normsPath || DEFAULT_NORMALIZATIONS_PATH;

  const { events, errors: eventErrors } = readIntentJournal(eventsPath);
  const { normalizations, errors: normErrors } = readIntentNormalizations(normsPath);

  return {
    events,
    normalizations,
    errors: [...eventErrors, ...normErrors]
  };
}
