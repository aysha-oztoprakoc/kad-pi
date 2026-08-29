# KAD Resource Contract Policy

Distilled invariant: before a local specialist worker is invoked, KAD must compile the task against that worker's proven resource envelope and prove resource fit.

Runtime order:

1. Select a candidate resource by trust domain and capability.
2. Bind a proven resource contract to the selected resource identity and runtime provenance.
3. Resolve only allowlisted deterministic source selectors.
4. Compile a packet whose `compiled` contract reflects the worker envelope, not the aspirational task budget.
5. Prove `compiled_prompt_tokens + required_output_reserve <= effective_context_window`.
6. Prove `required_output_reserve <= effective_max_output_tokens`.
7. Invoke `worker.execute()` only after both checks pass.

Admission failure is an infrastructure contract failure, not model failure. It must not count against model reliability or authorize repair sampling.
