# WP-KAD-LOCAL-001 Contract

Establish an independently addressable KAD STC-owned Qwen retrieval process on a free localhost port without touching external Stheno at 5001.

Frozen acceptance: endpoint identity must match Qwen, process must be spawned and tracked by `LocalInferenceCapability`, OMP must inspect providers independently, LOCAL-RECON-01 and LOCAL-AUDIT-01 must pass deterministic validation, and teardown must withdraw only Qwen.

Conservative runtime: CPU-only Qwen, context 2048, batch 128, four threads, localhost binding, port 5002. No arbitrary parameter search and no remote spend.
