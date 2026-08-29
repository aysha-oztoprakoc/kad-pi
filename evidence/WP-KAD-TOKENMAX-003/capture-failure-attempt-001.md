# Attempt 001 capture failure

A first live invocation reached the KAD swarm path and completed model execution, but the one-off evidence harness failed before persisting the runtime result. The post-processing call passed the historical raw object to `createDistillationCandidateReceipt`, which requires normalized `kad-economic-1` receipts and raised:

```text
TypeError: Cannot read properties of undefined (reading 'accepted')
```

No receipt, usage, acceptance, or comparison values from that attempt are claimed. Qwen teardown completed and the external Stheno process remained healthy. The harness was corrected to normalize historical evidence and persist the live runtime receipt before analysis. The following bounded execution is the canonical evidence for this WP; it was rejected by deterministic validation after one repair.
