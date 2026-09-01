/**
 * KAD Outcome Telemetry Storage & Integrity Engine
 *
 * Local-first, append-only, tamper-verifiable storage for KAD_OUTCOME_COST_TELEMETRY_V1 records.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  TELEMETRY_OUTCOME_SCHEMA_VERSION,
  validateOutcomeTelemetryRecord,
  verifyRecordIntegrity,
  computeRecordHash,
  createOutcomeTelemetryRecord,
} from './outcome-cost-schema.mjs';

export function resolveDefaultTelemetryStorageDir(cwd = process.cwd()) {
  return path.join(cwd, '.agents', 'telemetry', 'outcomes');
}

export class OutcomeTelemetryStorage {
  constructor({ storageDir = null, cwd = process.cwd() } = {}) {
    this.cwd = cwd;
    this.storageDir = storageDir || resolveDefaultTelemetryStorageDir(cwd);
    this.journalFile = path.join(this.storageDir, 'outcomes.jsonl');
    this.recordsDir = path.join(this.storageDir, 'records');
    this._ensureDirectories();
  }

  _ensureDirectories() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
    if (!fs.existsSync(this.recordsDir)) {
      fs.mkdirSync(this.recordsDir, { recursive: true });
    }
  }

  appendRecord(recordInput, options = {}) {
    const startTime = Date.now();
    const cpuStart = process.cpuUsage();

    let record = recordInput;
    if (!record.provenance?.record_hash) {
      record = createOutcomeTelemetryRecord(recordInput);
    }

    const validation = validateOutcomeTelemetryRecord(record, options);
    if (!validation.valid) {
      throw new Error(`Cannot store invalid telemetry record: ${validation.errors.join(', ')}`);
    }

    const line = JSON.stringify(record) + '\n';
    const bytesWritten = Buffer.byteLength(line, 'utf8');

    // Append to JSONL journal
    fs.appendFileSync(this.journalFile, line, 'utf8');

    // Also store individual record file by WP and timestamp
    const safeWpId = (record.work?.workpackage_id || 'wp').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeTimestamp = (record.provenance?.observed_at || new Date().toISOString()).replace(/[^a-zA-Z0-9_-]/g, '_');
    const recordFile = path.join(this.recordsDir, `${safeWpId}_${safeTimestamp}.json`);
    fs.writeFileSync(recordFile, JSON.stringify(record, null, 2) + '\n', 'utf8');

    const wallMs = Date.now() - startTime;
    const cpuDiff = process.cpuUsage(cpuStart);
    const cpuMs = (cpuDiff.user + cpuDiff.system) / 1000;

    return {
      stored: true,
      record_hash: record.provenance.record_hash,
      workpackage_id: record.work.workpackage_id,
      observer_overhead: {
        wall_ms: wallMs,
        cpu_ms: cpuMs,
        bytes_written: bytesWritten,
      },
    };
  }

  listRecords() {
    const records = [];
    if (!fs.existsSync(this.journalFile)) {
      return records;
    }

    const content = fs.readFileSync(this.journalFile, 'utf8');
    const lines = content.split('\n').filter((l) => l.trim().length > 0);

    for (let i = 0; i < lines.length; i++) {
      try {
        const parsed = JSON.parse(lines[i]);
        records.push(parsed);
      } catch (err) {
        // Corrupted line record
      }
    }
    return records;
  }

  queryRecords(filters = {}) {
    const all = this.listRecords();
    return all.filter((rec) => {
      if (filters.work_class && rec.work?.work_class !== filters.work_class) return false;
      if (filters.workpackage_id && rec.work?.workpackage_id !== filters.workpackage_id) return false;
      if (typeof filters.accepted === 'boolean' && rec.outcome?.accepted !== filters.accepted) return false;
      if (filters.provider_class && rec.work?.provider_class !== filters.provider_class) return false;
      if (filters.origin_class && rec.provenance?.origin_class !== filters.origin_class) return false;
      if (filters.experiment_id && rec.work?.experiment_id !== filters.experiment_id) return false;
      return true;
    });
  }

  verifyAllRecords() {
    const all = this.listRecords();
    let validCount = 0;
    let corruptedCount = 0;
    const errors = [];

    for (let i = 0; i < all.length; i++) {
      const rec = all[i];
      const wp = rec.work?.workpackage_id || `line-${i + 1}`;
      if (!verifyRecordIntegrity(rec)) {
        corruptedCount++;
        errors.push(`Record ${wp} failed integrity check (hash mismatch)`);
      } else {
        const val = validateOutcomeTelemetryRecord(rec);
        if (!val.valid) {
          corruptedCount++;
          errors.push(`Record ${wp} invalid: ${val.errors.join(', ')}`);
        } else {
          validCount++;
        }
      }
    }

    return {
      total: all.length,
      valid: validCount,
      corrupted: corruptedCount,
      errors,
    };
  }
}
