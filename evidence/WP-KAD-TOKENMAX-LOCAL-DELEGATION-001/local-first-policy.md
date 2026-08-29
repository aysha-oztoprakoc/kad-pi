# Local-first policy

`CHEAPEST_SUFFICIENT_TRUSTED_EXECUTION` is implemented by `tools/kad/microtask-router.mjs`.

Decision order is authority/trust, capability, deterministic availability, local resource availability, explicit resource-contract fit, context/output fit, then existing economic ranking. A local-first task is read-only, has a bounded source count, bounded output schema, no mutation/security/architecture/acceptance authority, a deterministic validator, and an explicit proven resource contract with identity, lifecycle evidence, and known fit.

Local admission requires `resource_id`, `model_identity`, runtime argv/configuration hashes, evidence, non-UNKNOWN confidence, availability, matching trust/capability, and `preflightResourceContract` PASS. Legacy workers without that contract are not eligible for this new surface.

One local inference is allowed. No probabilistic repair is performed. Formatting may be normalized deterministically. Validation failure returns `LOCAL_VALIDATION_FAILED` and an evidence-only escalation packet; it does not invoke remote work. Resource failure is reconsideration, not fallback.

Remote lanes are selected only through `routeEconomically`, with existing non-PAYG policy and explicit typed escalation. The router never grants authority from price, locality, identity, or quota.
