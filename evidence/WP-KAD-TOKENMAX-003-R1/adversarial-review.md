# Adversarial review

1. **Formatter semantics:** transformations are limited to whitespace, one JSON fence, one complete unique object, and paired visible reasoning wrappers. No keys, values, IDs, paths, citations, or trust claims are changed.
2. **Multiple objects:** extraction returns `MULTIPLE_JSON_VALUES` and fails closed.
3. **Truncation:** unmatched structured text returns `TRUNCATED_JSON`; no guess is made.
4. **Schema:** syntactically valid wrong-key/missing-field JSON is passed unchanged to the existing validator and is not repaired by normalization.
5. **Authority:** the normalizer has no acceptance field or acceptance authority; KAD validation remains decisive.
6. **Reasoning:** wrapper metadata is retained only as a boolean; reasoning content is not stored.
7. **Repair suppression:** the unit/integration test proves a deterministic wrapper recovery uses one local call and zero model repairs.
8. **Live recovery:** R1 nevertheless needed one model repair because the first normalized result did not yield final acceptance; the second output had multiple JSON candidates and failed closed.
9. **Resume:** parent packet, source hashes, controller decomposition, and quota snapshot were verified unchanged. The controller was not rerun; `new_remote_controller_calls=0`.
10. **Economics:** parent 709 remote tokens remain sunk. Recovery adds zero remote tokens, two local calls, one repair, and 203548 ms observed latency; no fake cost is assigned.
11. **Trust:** the external WORLD resource was excluded by retrieval eligibility before Qwen execution; Stheno was not called.
12. **Lifecycle:** Qwen reached OWNED, then DISPOSED; activation receipt was removed. Stheno remained healthy.
13. **Production:** routing and model roles were not mutated.
14. **Scope:** no second recovery execution was performed after the canonical R1 failure.
15. **Dirty work:** only the R1 evidence and attributable normalizer/resume changes are staged; existing dirty/untracked work remains unstaged.
