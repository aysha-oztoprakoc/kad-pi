# WP-KAD-005 implementation manifest

- `tools/kad/pi/local-models.json`: project-scoped Pi custom provider configuration.
- `tools/kad/pi/local-worker.mjs`: real Pi SDK session using localhost OpenAI-compatible KoboldCpp; exact-result validator.
- `tools/kad/local-router.mjs`: explainable capability/trust-domain/availability router.
- `tools/kad/test/local-router.test.mjs`: routing, degradation, and validation tests.
- `evidence/WP-KAD-005/`: observed inventories, benchmark, trail, claims, and limitations.

No model downloads. No remote calls were required by the local GREEN. TELL was not mutated.
