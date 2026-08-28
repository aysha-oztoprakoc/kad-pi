# WP-KAD-005 implementation manifest

- `tools/kad/pi/local-models.json`: project-scoped Pi custom provider configuration.
- `tools/kad/pi/local-worker.mjs`: real Pi SDK session using localhost OpenAI-compatible KoboldCpp; exact-result validator.
- `tools/kad/local-router.mjs`: explainable capability/trust-domain/availability router.
- `tools/kad/test/local-router.test.mjs`: routing, degradation, trust-domain, and lifecycle tests.
- `tools/kad/local-inference-capability.mjs`: STC-owned process/endpoint/capability lifecycle.
- `tools/kad/rag-microexperiment.mjs`: executable three-condition PON/STC fixture.
- `tools/kad/context-experiment.mjs`: executable broad-vs-trail continuation comparison.
- `.pi/agents/kad-scout.md`: project-native subagent definition used by the Pi subagent extension.
- `evidence/WP-KAD-005/`: observed inventories, benchmark, trail, claims, and limitations.

No model downloads. No remote calls were required by the local GREEN. TELL was not mutated.
