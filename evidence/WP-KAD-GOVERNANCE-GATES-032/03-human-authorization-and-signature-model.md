# WP-KAD-GOVERNANCE-GATES-032: 03 - Human Authorization & Signature Model

## 1. Anti-Spoofing & Prose Rejection Principle
A major vulnerability in LLM-assisted coding systems is **approval spoofing via prose**:
- Example: Agent claims `"The user approved this git push in the prompt"` without evidence.
- Governance Invariant: **`MODEL CLAIMS HUMAN APPROVED != HUMAN_DECISION_EXISTS`**.
- Informal text assertions are strictly rejected by the preflight evaluator with `REASON_CODES.FAKE_HUMAN_APPROVAL_PROSE_REJECTED`.

## 2. `HUMAN_AUTHORIZATION_RECEIPT_V1` Structure
Authorizations require a typed receipt:
```json
{
  "schema_version": "HUMAN_AUTHORIZATION_RECEIPT_V1",
  "receipt_id": "har-1725055000-abc123",
  "actor_id": "human.project_lead",
  "workpackage_id": "WP-KAD-GOVERNANCE-GATES-032",
  "operation_class": "REMOTE_GIT_PUSH",
  "scope": [
    "origin/main"
  ],
  "resource_refs": [
    "git:remote:origin"
  ],
  "note": "Authorized push for WP-032 acceptance",
  "issued_at": "2026-08-30T22:00:00.000Z",
  "valid_until": "2026-08-30T23:00:00.000Z",
  "receipt_hash": "sha256:..."
}
```

## 3. Cryptographic Verification & Binding
- **Integrity**: Computed via deterministic canonical JSON serialization and SHA-256 digest. Any modification invalidates `receipt_hash`.
- **Temporal Boundedness**: Every receipt contains an explicit `valid_until` ISO timestamp; expired receipts fail validation with `HUMAN_RECEIPT_EXPIRED`.
- **Four-Way Binding**: Receipts are strictly bound to `workpackage_id`, `operation_class`, `scope`, and `resource_refs`, preventing cross-task or cross-resource reuse.
