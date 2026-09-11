// Append-Only Event Ledger & Cryptographic Integrity Verification
// Follows Section 7.4 (Event ledger) and Section 8.6 (Determinism and replay).

import { createHash } from 'node:crypto';

export class EventLedger {
  constructor(runId = 'run-local-001') {
    this.runId = runId;
    this.events = [];
    this.eventCounter = 0;
  }

  /**
   * Appends an event to the ledger with a sequential event ID.
   */
  append({
    tick,
    event_type,
    causation_id = null,
    actor_ids = [],
    location_ids = [],
    before_hash,
    after_hash,
    payload = {},
    ruleset_version = 'gaya-sim-0.1'
  }) {
    this.eventCounter += 1;
    const event_id = `evt-${String(this.eventCounter).padStart(6, '0')}`;

    const record = Object.freeze({
      event_id,
      run_id: this.runId,
      tick,
      event_type,
      causation_id,
      actor_ids: [...actor_ids].sort(),
      location_ids: [...location_ids].sort(),
      before_hash,
      after_hash,
      payload: Object.freeze({ ...payload }),
      ruleset_version,
      timestamp: new Date().toISOString()
    });

    this.events.push(record);
    return record;
  }

  /**
   * Returns copy of all committed events.
   */
  getEvents() {
    return [...this.events];
  }

  /**
   * Computes a deterministic SHA256 digest of the entire event sequence.
   */
  computeLedgerHash() {
    const serialized = this.events.map((e) => `${e.event_id}:${e.event_type}:${e.before_hash}:${e.after_hash}`).join('|');
    return createHash('sha256').update(serialized).digest('hex');
  }

  /**
   * Verifies that the event sequence is uncorrupted and contiguous.
   */
  verifyIntegrity() {
    for (let i = 0; i < this.events.length; i++) {
      const expectedId = `evt-${String(i + 1).padStart(6, '0')}`;
      if (this.events[i].event_id !== expectedId) {
        return { valid: false, error: `Broken sequence at index ${i}: expected ${expectedId}` };
      }
    }
    return { valid: true, count: this.events.length, ledger_hash: this.computeLedgerHash() };
  }
}
