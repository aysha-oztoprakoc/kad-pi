# WP-KAD-RESEARCH-ZOTERO-005 — RETROSPECTIVE EVIDENCE INDEX

> **Label**: `RETROSPECTIVE_EVIDENCE_INDEX`
> This index is reconstructed from immutable existing sources during `WP-KAD-PROJECT-CLOSURE-AND-ZERO-PENDING-BASELINE-043` (evidence closure, §8.1). It is NOT a contemporaneous receipt set. It records where the durable evidence for this accepted workpackage actually lives.

## Identity

- Work item: `.agents/work/WP-KAD-RESEARCH-ZOTERO-005.json` (status: ACCEPTED)
- Claim: `.agents/work/claims/WP-KAD-RESEARCH-ZOTERO-005.json` (claim_id `10f06a0a-a7a0-4d0f-8d26-bb2b49c2b0d9`, actor `gemini-builder`, started 2026-08-30T00:25:04Z, released 2026-08-30T00:33:07Z)
- Title: Read-Only Zotero Local API Integration
- Objective: optional read-only Zotero Local HTTP API adapter converting local bibliography items into canonical research candidates with permanent export fallback.

## Durable evidence (immutable sources)

| Source | Path / Ref | Kind |
|---|---|---|
| Implementing commit | `445e000` "feat(research): implement read-only Zotero local API integration (WP-KAD-RESEARCH-ZOTERO-005)" | git commit |
| Implementation | `tools/kad/research-zotero.mjs` | source |
| Tests | `tools/kad/test/research-zotero.test.mjs` (part of the 781-test npm suite) | tests |
| Capability config | `config/research-capabilities/zotero.json` | config |
| Ticket-05 scaffolding evidence (12 files) | `evidence/WP-KAD-RESEARCH-WORKFLOW-SCAFFOLD-001/ticket-05-zotero/` (baseline, specification-review, security-review, validation, degradation-matrix, loopback-security, transport-equivalence, candidate-normalization, attachment-behavior, mock-zotero-fixture, standards-review) | evidence |
| Work item + claim | `.agents/work/WP-KAD-RESEARCH-ZOTERO-005.json`, `.agents/work/claims/WP-KAD-RESEARCH-ZOTERO-005.json` | ledger |

## Gap disposition

No dedicated `evidence/WP-KAD-RESEARCH-ZOTERO-005/` directory existed at closure time. Per closure policy §8.1, no historical evidence was fabricated; the durable sources above are the evidence surface. This index makes the mapping explicit.

`EVIDENCE_GAP_RECONCILED_BY_RETROSPECTIVE_INDEX` — accepted on 2026-09-01 during WP-043 closure.
