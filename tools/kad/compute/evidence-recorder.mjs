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
    const lines = fs.readFileSync(journalPath, 'utf8').trim().split('\n').filter(Boolean);
    if (lines.length > 0) {
      try {
        const lastEntry = JSON.parse(lines[lines.length - 1]);
        previousHash = lastEntry.receipt_hash || 'GENESIS';
        sequence = (lastEntry.sequence || lines.length) + 1;
      } catch {
        // Fallback
      }
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

export function verifyEvidenceChain(evidenceDir) {
  const journalPath = path.join(evidenceDir, 'probe-journal.jsonl');
  if (!fs.existsSync(journalPath)) {
    return { valid: false, reason: 'JOURNAL_NOT_FOUND', totalReceipts: 0 };
  }

  const lines = fs.readFileSync(journalPath, 'utf8').trim().split('\n').filter(Boolean);
  let expectedPrev = 'GENESIS';

  for (let i = 0; i < lines.length; i++) {
    const entry = JSON.parse(lines[i]);
    if (entry.sequence !== i + 1) {
      return { valid: false, reason: `SEQUENCE_GAP_AT_${i + 1}`, totalReceipts: lines.length };
    }
    if (entry.previous_hash !== expectedPrev) {
      return { valid: false, reason: `BROKEN_HASH_CHAIN_AT_${i + 1}`, totalReceipts: lines.length };
    }
    expectedPrev = entry.receipt_hash;
  }

  return {
    valid: true,
    totalReceipts: lines.length,
    headHash: expectedPrev
  };
}
