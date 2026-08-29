# Adversarial review

| Falsification target | Result |
|---|---|
| Static 2048/192 hard-coded instead of resource contract | Rejected by tests T1/T11; compiler consumes `resource_contract`. |
| Context compiler silently drops required evidence | Rejected by T19 and selector manifest reasons. |
| Approximate tokenizer treated as exact | Rejected; token confidence is `CONSERVATIVE_BOUND`. |
| Requested output silently clipped to 192 | Rejected; `requested.budget` is preserved separately from `compiled.output_reserve`. |
| Controller expands `max_facts` without authority | Rejected; execution fails closed on expansion. Lowering is a bounded deterministic reduction and cannot add work. |
| Source selectors escape allowlist | Rejected by T4. |
| Controller selector proposal becomes authority | Rejected; deterministic selector resolver validates allowlist/existence/bounds. |
| Larger context changes Qwen authority | Rejected by T13. |
| Task-fit failure counted as Qwen failure | Rejected by T14/T17. |
| Historical evidence rewritten | Rejected by T16/T17; interpretation is derived. |
| Distillation claims Qwen is unreliable | Rejected by T18 and claim ledger. |
| Context reduction uses probabilistic summary | Rejected; only symbol/JSON pointer/YAML path selectors used. |
| Task splitting creates unbounded calls | Rejected by T20. |
| PON emits telemetry noise | Rejected by T21. |
| Stale STC evidence authorizes new process | Rejected by T22. |
