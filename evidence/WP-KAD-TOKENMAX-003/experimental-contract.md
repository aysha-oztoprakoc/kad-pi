# Experimental contract

## Declared task

`TOKENMAX-LIVE-001`: perform one useful, read-only KAD trust-isolation regression audit. Determine from supplied current repository evidence: the exact eligibility trust-domain rule, Qwen's advertised retrieval boundary, Stheno's WORLD boundary, and whether WORLD can satisfy RETRIEVAL.

## Constraints

- `trust_domain`: `retrieval`
- `capability`: `repository-fact-finding` with structured JSON extraction
- mutation: forbidden
- acceptance authority: deterministic KAD validator
- local worker: STC-owned Qwen only
- WORLD: excluded before execution
- controller: existing approved non-PAYG subscription lane
- no benchmark, quota-induced request, provider change, credential change, or route mutation

## Evidence contract

The canonical live result must originate from `executeSwarm`; its returned episode economic receipt is copied only after runtime attachment. Quota is captured immediately before controller routing using the existing bounded QUOTA-002 probe. Missing allowance, cache, reasoning, and monetary-cost fields remain UNKNOWN/null.

## Outcome rule

A deterministic validation failure is useful negative evidence and is reported as `PARTIAL`; it is not converted to acceptance. No additional experiment is run after the canonical rejected execution.
