---
name: kad-evidence-gate
description: Use when turning an observed or proposed trajectory into reusable KAD knowledge, or when checking whether a candidate skill/policy may be promoted. Do not invoke for ordinary implementation without a distillation candidate.
---

# KAD evidence gate

Turn one bounded experience into a candidate record, then let deterministic verification decide its state. The model proposes; the verifier observes.

## Process

1. **Scope** — identify the task, trust domain, owner, mutation boundary, and source artifact. Read `PRIME_DIRECTIVE.md` and `CONTEXT.md` when the task touches authority or domain terms.
2. **Classify** — label the source as an accepted trajectory, teacher correction, experiment, or failure. Preserve negative evidence; do not convert a claim into an observation.
3. **Record** — create one `kad-distill-1` record with canonical input, provenance, required/forbidden behavior, and evidence references. Use `tools/kad/episode.mjs` for an episode source and `tools/kad/distillation.mjs` for the record contract.
4. **Verify** — run the allowlisted deterministic verifier(s). A model assertion, prose similarity, or claimed PASS cannot establish verification.
5. **Promote or reject** — promote only with valid receipts, provenance, and explicit authority. Otherwise record a typed failure and stop. Never repair evidence by weakening a verifier.
6. **Leave evidence** — retain the candidate, verifier receipts, hashes, command/result, and final state so another process can reconstruct the decision.

For the state machine, provenance rules, and promotion contract, load [`references/contract.md`](references/contract.md).

## STOP

Stop with the current evidence when the source artifact, owner, authority, verifier, or mutation boundary is unknown; when a required postcondition cannot be observed; or when completion would require widening authority or weakening a proven gate.

## Completion

The record is complete only when its state is explicit, its provenance is hashable, its deterministic receipts are reproducible, and the outcome is `GOLDEN`, `REJECTED`, or an explicitly documented non-promoted state.
