# Claim Ledger & Validation Matrix

## 1. Compute Fabric Claims (`ISA-KAD-COMPUTE-FABRIC-001`)

| Claim ID | Statement | Class | Target State | Severity | Validator | Status |
|---|---|---|---|---|---|---|
| `ISA-KAD-COMPUTE-001` | Meaningful compute state transitions emit typed PON notifications rather than relying on active polling. | `DETERMINISTIC` | `CANONICAL_TARGET` | `BLOCKER` | `compute.pon.typed_notifications` | `PASS` |
| `ISA-KAD-COMPUTE-002` | Tasks request spatial capability contracts rather than hardcoded machine identities. | `DETERMINISTIC` | `CURRENT_CONFIRMED` | `BLOCKER` | `compute.stc.spatial_capability_contracts` | `PASS` |
| `ISA-KAD-COMPUTE-003` | Local models, runtimes, and worker processes enforce explicit temporal lifecycle ownership and LIFO teardown. | `DETERMINISTIC` | `CURRENT_CONFIRMED` | `BLOCKER` | `compute.stc.temporal_lifecycle_ownership` | `PASS` |
| `ISA-KAD-COMPUTE-004` | Route promotion requires local empirical evidence; theoretical capability creates a hypothesis only. | `DETERMINISTIC` | `CURRENT_CONFIRMED` | `BLOCKER` | `compute.tdd.empirical_route_promotion` | `PASS` |
| `ISA-KAD-COMPUTE-005` | Capability degradation gracefully steps through lower tiers without silently escalating authority or spend. | `DETERMINISTIC` | `CURRENT_CONFIRMED` | `BLOCKER` | `compute.degradation.fail_safe_hierarchy` | `PASS` |
| `ISA-KAD-COMPUTE-006` | System optimizes for useful work per scarce resource used and rejects ungrounded token generation (TOKENMAXXING). | `DETERMINISTIC` | `CURRENT_CONFIRMED` | `HIGH` | `compute.tokenmaxxing.efficiency_metric` | `PASS` |
| `ISA-KAD-COMPUTE-007` | Heterogeneous host definitions (AMDY vs TELL) adapt into canonical capability contracts without OS leakage. | `DETERMINISTIC` | `CANONICAL_TARGET` | `HIGH` | `compute.hosts.heterogeneous_adapter_boundary` | `PASS` |
| `ISA-KAD-COMPUTE-008` | Ten distinct capability-oriented cognition classes define task classification and routing contracts. | `DETERMINISTIC` | `CANONICAL_TARGET` | `HIGH` | `compute.cognition.ten_class_taxonomy` | `PASS` |
| `ISA-KAD-COMPUTE-009` | Inference execution configurations are evaluated against the 9-dimensional experimental tuple schema. | `DETERMINISTIC` | `CANONICAL_TARGET` | `HIGH` | `compute.measurement.experimental_tuple_schema` | `PASS` |
| `ISA-KAD-COMPUTE-010` | Repeated accepted probabilistic work generates candidates for downward distillation and deterministic replacement. | `DETERMINISTIC` | `CURRENT_CONFIRMED` | `HIGH` | `compute.distillation.downward_migration_policy` | `PASS` |
| `ISA-KAD-COMPUTE-011` | Presentation, observation, and telemetry layers have zero direct mutation authority over compute routing state. | `DETERMINISTIC` | `CURRENT_CONFIRMED` | `BLOCKER` | `compute.governance.zero_shell_mutation` | `PASS` |
| `ISA-KAD-COMPUTE-012` | Canonical compute fabric architecture and self-measuring governance approved by Human Project Lead. | `HUMAN_REVIEW` | `CANONICAL_TARGET` | `BLOCKER` | `compute.architecture.human_governed_target` | `PASS` |

---

## 2. Aesthetic Claims Backward Compatibility (`ISA-KAD-AESTHETIC-001`)

| Claim ID | Statement | Class | Target State | Severity | Validator | Status |
|---|---|---|---|---|---|---|
| `ISA-KAD-AESTHETIC-001` | All assets 100% locally hosted with zero remote CDN. | `DETERMINISTIC` | `CURRENT_CONFIRMED` | `BLOCKER` | `aesthetic.assets.local_only` | `PASS` |
| `ISA-KAD-AESTHETIC-002` | Registered semantic tokens without raw hex literals. | `DETERMINISTIC` | `CURRENT_CONFIRMED` | `HIGH` | `aesthetic.tokens.no_unregistered_hex` | `PASS` |
| `ISA-KAD-AESTHETIC-003` | Paper & cyan text exceed WCAG AAA contrast ratio (14:1). | `DETERMINISTIC` | `CURRENT_CONFIRMED` | `BLOCKER` | `aesthetic.contrast.text_readability` | `PASS` |
| `ISA-KAD-AESTHETIC-004` | Zero infinite ambient looping animations. | `DETERMINISTIC` | `CURRENT_CONFIRMED` | `HIGH` | `aesthetic.motion.no_ambient_loop` | `PASS` |
| `ISA-KAD-AESTHETIC-005` | Explicit NO_AUDIO_UI with zero audio element dependencies. | `DETERMINISTIC` | `CURRENT_CONFIRMED` | `HIGH` | `aesthetic.sound.no_audio_ui` | `PASS` |
| `ISA-KAD-AESTHETIC-006` | Accessible skip links and visible focus rings. | `DETERMINISTIC` | `CURRENT_CONFIRMED` | `BLOCKER` | `aesthetic.accessibility.skip_link_and_focus` | `PASS` |
| `ISA-KAD-AESTHETIC-007` | Zero shell mutation authority from presentation layers. | `DETERMINISTIC` | `CURRENT_CONFIRMED` | `BLOCKER` | `aesthetic.governance.zero_shell_mutation` | `PASS` |
| `ISA-KAD-AESTHETIC-008` | Workstation & Sofia cockpit Cyberpunk 2077 terminal aesthetic. | `HUMAN_REVIEW` | `CURRENT_CONFIRMED` | `HIGH` | `aesthetic.identity.cyberpunk_2077_terminal` | `PASS` |
| `ISA-KAD-AESTHETIC-009` | Public website and docs clean scientific presentation. | `HUMAN_REVIEW` | `CURRENT_CONFIRMED` | `HIGH` | `aesthetic.stratification.two_tier_balance` | `PASS` |
| `ISA-KAD-AESTHETIC-010` | 4-way redundant visual encoding (Color+Border+Badge+Shape). | `HYBRID` | `CURRENT_CONFIRMED` | `HIGH` | `aesthetic.visualization.multi_redundant_encoding` | `PASS` |
