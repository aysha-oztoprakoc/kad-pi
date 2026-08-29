# Frozen experimental contract

- **Hypothesis:** A small KAD-native evidence-gate skill, using progressive disclosure and deterministic receipts, will make distillation boundaries clearer without duplicating constitutional authority.
- **Baseline A:** Current local Matt-derived skill set, especially `agent/skills/writing-for-agents/SKILL.md`, with no KAD-specific evidence-gate skill.
- **Candidate B:** `.agents/skills/kad-evidence-gate/SKILL.md` plus its disclosed contract reference and one static contract test. Existing executable distillation code is treated as a pre-existing seam, not reimplemented here.
- **Measurements:** skill bytes, contract-test PASS/FAIL, full KAD test/CI baseline, authority/provider-name checks, and evidence completeness. Agent invocation accuracy, model tokens, model calls, and process reproducibility are `NOT_MEASURED` in this fixture-only run.
- **Acceptance gate:** candidate test passes; all accepted baseline gates pass; candidate has explicit scope, STOP conditions, provenance, deterministic verification, and no provider lock-in.
- **Rejection conditions:** any baseline regression, missing authority pointer, provider-specific semantics, unverifiable promotion path, or claimed benefit unsupported by measurement.

This contract was frozen before candidate implementation. No metric threshold was changed after observation.
