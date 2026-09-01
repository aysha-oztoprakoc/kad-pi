# R2 authorization-model assessment

R2 requires machine-verifiable separation between the human issuer and the authorized executor/delegate. The existing `HUMAN_AUTHORIZATION_RECEIPT_V1` implementation in `tools/kad/governance/human-receipt.mjs` contains only one identity field, `actor_id` (default `human.project_lead`). It has no issuer field, delegate/subject field, or validation option that binds an executor separately from the issuer.

The receipt hash covers the available fields, but placing issuer/delegate prose in `note` would not make the relationship machine-verifiable. Treating `actor_id` as both issuer and executor would repeat R1's semantic ambiguity.

Per the R2 contract, no fresh receipt or privileged action is issued under this representation. R2 stops before claim creation, preflight, watchdog creation, route deletion, and offline execution.

Classification: `GOVERNANCE_FAILURE`, severity P2, specifically an authorization-model expressiveness defect. This experiment does not redesign governance or modify the receipt subsystem.
