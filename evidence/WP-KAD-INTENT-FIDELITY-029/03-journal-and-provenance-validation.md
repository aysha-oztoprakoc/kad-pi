# Append-Only Journal & Cryptographic Provenance Validation (WP-029)

**Workpackage ID**: `WP-KAD-INTENT-FIDELITY-029`  
**Events Journal**: `evidence/intent/events.jsonl`  
**Normalizations File**: `evidence/intent/normalizations.jsonl`  
**Date**: 2026-08-30  
**Validation Command**: `bin/kad-intent validate`  
**Verdict**: **`PASS`**  

---

## 1. Append-Only Invariant Enforcement

The intent engine enforces append-only journal storage:

1. **Deterministic Record Hashing**:
   Each `INTENT_DECISION_EVENT_V1` computes `record_hash` using canonical JSON stringification of all content fields (excluding the hash itself). Any byte-level modification of question, options, raw note, actor, or timestamp causes immediate hash mismatch.

2. **No Silent Rewriting / In-Place Modification**:
   Revising an existing decision requires emitting a new event referencing the prior event's `record_hash` in `provenance.supersedes`. Attempting to append a duplicate `decision_id` without `supersedes` is rejected by the journal validator (`T10`).

3. **Normalization Referential Integrity**:
   Each `INTENT_DECISION_NORMALIZATION_V1` must link to an existing `record_hash` in the events journal. Dangling normalizations referencing unknown hashes are rejected (`T12`).

---

## 2. Validation Execution Receipt

```text
=== KAD INTENT JOURNAL VALIDATION ===

Events Journal:        /home/amdy/Work/evidence/intent/events.jsonl
Normalizations File:   /home/amdy/Work/evidence/intent/normalizations.jsonl
Total Events:          24
Active Decisions:      24
Superseded Events:     0
Total Normalizations:  24

[PASS] All intent events and normalizations are cryptographically valid and append-only verified.
```
