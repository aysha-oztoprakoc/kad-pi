/**
 * Cryptographically Hash-Chained Evidence Journal for Empirical Probes
 * Authority: PRIME_DIRECTIVE.md Section 8 (Immutable Evidence Ledgers)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function recordProbeReceipt(receipt, { evidenceDir, reset = false } = {}) {
  if (!evidenceDir) throw new Error('evidenceDir is required');
  fs.mkdirSync(evidenceDir, { recursive: true });

  const journalPath = path.join(evidenceDir, 'probe-journal.jsonl');

  let previousHash = 'GENESIS';
  let sequence = 1;

  if (!reset && fs.existsSync(journalPath)) {
    const validation = verifyEvidenceChain(evidenceDir);
    if (!validation.valid) {
      throw new Error(`Cannot append to corrupted evidence journal: ${validation.reason}`);
    }
    const lines = fs.readFileSync(journalPath, 'utf8').trim().split('\n').filter(Boolean);
    if (lines.length > 0) {
      const lastEntry = JSON.parse(lines[lines.length - 1]);
      previousHash = lastEntry.receipt_hash;
      sequence = lastEntry.sequence + 1;
    }
  }

  const payloadToHash = JSON.stringify({ sequence, previous_hash: previousHash, receipt });
  const receiptHash = sha256(payloadToHash);

  const entry = {
    sequence,
    timestamp: new Date().toISOString(),
    previous_hash: previousHash,
    receipt_hash: receiptHash,
    ...receipt
  };

  const line = `${JSON.stringify(entry)}\n`;
  if (reset) {
    fs.writeFileSync(journalPath, line, 'utf8');
  } else {
    fs.appendFileSync(journalPath, line, 'utf8');
  }

  return entry;
}

export function verifyEvidenceChain(evidenceDir, options = {}) {
  const journalPath = path.join(evidenceDir, 'probe-journal.jsonl');
  if (!fs.existsSync(journalPath)) {
    return { valid: false, reason: 'JOURNAL_NOT_FOUND', totalReceipts: 0 };
  }

  const raw = fs.readFileSync(journalPath, 'utf8').trim();
  if (!raw) {
    return { valid: false, reason: 'EMPTY_JOURNAL', totalReceipts: 0 };
  }

  const lines = raw.split('\n').filter(Boolean);
  let expectedPrev = 'GENESIS';

  for (let i = 0; i < lines.length; i++) {
    let entry;
    try {
      entry = JSON.parse(lines[i]);
    } catch {
      return { valid: false, reason: `MALFORMED_JSON_AT_LINE_${i + 1}`, totalReceipts: i };
    }

    if (!entry || typeof entry !== 'object') {
      return { valid: false, reason: `INVALID_ENTRY_OBJECT_AT_${i + 1}`, totalReceipts: i };
    }

    if (entry.sequence !== i + 1) {
      return { valid: false, reason: `SEQUENCE_GAP_AT_${i + 1}`, totalReceipts: lines.length };
    }

    if (entry.previous_hash !== expectedPrev) {
      return { valid: false, reason: `BROKEN_HASH_CHAIN_AT_${i + 1}`, totalReceipts: lines.length };
    }

    // Recompute payload digest from identical canonical serialization
    const { sequence, timestamp, previous_hash, receipt_hash, ...receiptPayload } = entry;
    const computedDigest = sha256(JSON.stringify({ sequence, previous_hash, receipt: receiptPayload }));
    if (receipt_hash !== computedDigest) {
      return { valid: false, reason: `PAYLOAD_TAMPERED_AT_${sequence}`, totalReceipts: lines.length };
    }

    expectedPrev = entry.receipt_hash;
  }

  if (options.expectedHead && expectedPrev !== options.expectedHead) {
    return { valid: false, reason: 'HEAD_HASH_MISMATCH', totalReceipts: lines.length, headHash: expectedPrev };
  }

  if (options.expectedCount !== null && options.expectedCount !== undefined && lines.length !== options.expectedCount) {
    return { valid: false, reason: 'COUNT_MISMATCH', totalReceipts: lines.length, headHash: expectedPrev };
  }

  return {
    valid: true,
    totalReceipts: lines.length,
    headHash: expectedPrev
  };
}
