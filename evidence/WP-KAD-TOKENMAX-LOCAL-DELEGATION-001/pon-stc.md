# PON / STC evidence

PON event vocabulary is causal and episode-scoped: `task.classified`, `execution.deterministic_selected`, `execution.local_selected`, `local.accepted`, `local.rejected`, `escalation.required`. No token-level events are emitted.

Every local receipt binds the resource ID, model/runtime evidence through the contract, compiled context hash, validator result, call count, and latency where observed. Availability is lifecycle state; an unavailable Qwen process is not re-advertised by economic policy. WORLD remains a separate trust-domain resource.

Raw local output and hidden reasoning are not placed in receipts or escalation packets. `buildEscalationPacket` retains source hashes, validator result, typed reason, and unresolved residue only.
