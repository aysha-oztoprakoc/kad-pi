# KAD distillation contract

`tools/kad/distillation.mjs` is authoritative for the executable contract.

- States progress only as `RAW → CANDIDATE → VERIFIED → GOLDEN → ACTIVE`; rejection is terminal.
- A record needs `kad-distill-1`, canonical input plus matching hash, task class/objective, and provenance.
- Verification uses registered verifier implementations and content-addressed receipts. Receipts are re-executed during verification.
- `GOLDEN` requires deterministic verification, source-artifact integrity, and explicit promotion authority/evidence.
- Training export is separate from runtime steering and requires explicit rights and quality approval.
- Replay without a registered adapter and fresh observation is `NOT_REPLAYED`.

Authority remains in `PRIME_DIRECTIVE.md`; this reference is an execution pointer, not a replacement for constitutional rules.
