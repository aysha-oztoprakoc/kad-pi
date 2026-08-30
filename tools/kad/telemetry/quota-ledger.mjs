import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  createTelemetryRecord,
  validateTelemetryRecord,
  reconcileTelemetry,
  checkStaleness,
  redactSecrets,
} from './schema.mjs';

function resolveDefaultStorageDir() {
  const xdgState = process.env.XDG_STATE_HOME || path.join(os.homedir(), '.local', 'state');
  return path.join(xdgState, 'kad-pi', 'telemetry');
}

export class TelemetryLedger {
  constructor({ storageDir = resolveDefaultStorageDir(), maxEntries = 1000 } = {}) {
    this.storageDir = storageDir;
    this.maxEntries = maxEntries;
    this.ledgerFile = path.join(this.storageDir, 'observations.jsonl');
    this.inMemoryRecords = [];
    this.recordsByKey = new Map();
    this._ensureStorage();
    this._loadExisting();
  }

  _ensureStorage() {
    try {
      fs.mkdirSync(this.storageDir, { recursive: true, mode: 0o700 });
    } catch {
      // Memory fallback if disk is not writable
    }
  }

  _loadExisting() {
    if (!fs.existsSync(this.ledgerFile)) return;
    try {
      const content = fs.readFileSync(this.ledgerFile, 'utf8');
      const lines = content.split('\n').filter((l) => l.trim().length > 0);
      for (const line of lines.slice(-this.maxEntries)) {
        try {
          const raw = JSON.parse(line);
          const record = createTelemetryRecord(raw);
          if (validateTelemetryRecord(record)) {
            this._indexRecord(record);
          }
        } catch {
          // ignore corrupted lines
        }
      }
    } catch {
      // fallback
    }
  }

  _indexRecord(record) {
    const key = `${record.provider_id}:${record.metric}`;
    if (!this.recordsByKey.has(key)) {
      this.recordsByKey.set(key, []);
    }
    const list = this.recordsByKey.get(key);
    list.push(record);
    if (list.length > 50) list.shift();

    this.inMemoryRecords.push(record);
    if (this.inMemoryRecords.length > this.maxEntries) {
      this.inMemoryRecords.shift();
    }
  }

  record(rawRecord) {
    const sanitized = redactSecrets(rawRecord);
    const record = createTelemetryRecord(sanitized);
    if (!validateTelemetryRecord(record)) {
      throw new TypeError('Invalid telemetry record passed to ledger');
    }

    this._indexRecord(record);

    try {
      fs.appendFileSync(this.ledgerFile, `${JSON.stringify(record)}\n`, { mode: 0o600 });
    } catch {
      // memory only fallback
    }

    return record;
  }

  getLatest(providerId, metric, now = Date.now()) {
    const key = `${providerId}:${metric}`;
    const list = this.recordsByKey.get(key);
    if (!list || !list.length) return null;
    const latest = list[list.length - 1];
    return checkStaleness(latest, now);
  }

  getAllLatest(now = Date.now()) {
    const result = [];
    for (const [_, list] of this.recordsByKey.entries()) {
      if (list.length) {
        result.push(checkStaleness(list[list.length - 1], now));
      }
    }
    return result;
  }

  reconcile(providerId, metric, now = Date.now()) {
    const key = `${providerId}:${metric}`;
    const list = this.recordsByKey.get(key) || [];
    return reconcileTelemetry(list, now);
  }

  query({ provider_id, metric, state, limit = 50, now = Date.now() } = {}) {
    let matches = this.inMemoryRecords;
    if (provider_id) matches = matches.filter((r) => r.provider_id === provider_id);
    if (metric) matches = matches.filter((r) => r.metric === metric);
    if (state) matches = matches.filter((r) => r.state === state);
    return matches.slice(-limit).map((r) => checkStaleness(r, now));
  }

  clear() {
    this.inMemoryRecords = [];
    this.recordsByKey.clear();
    try {
      if (fs.existsSync(this.ledgerFile)) fs.unlinkSync(this.ledgerFile);
    } catch {
      // ignore
    }
  }
}
