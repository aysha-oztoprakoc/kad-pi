# Pre-live gates

Baseline commit: `f21f130bee833af9f89af307b15d255f3c558d79`.

Before spending the canonical controller call:

- accepted-work economics tests: 25/25 pass;
- full KAD suite: 177/177 pass;
- real Pi integration: 7/7 pass;
- Librarian: 11/11 pass;
- PRIME: PASS;
- diff hygiene: PASS;
- OMP/Pi pinned versions and spend gates: PASS;
- Qwen activation: `ACTIVE`, identity verified, `OWNED`, port 5002;
- preflight during Qwen activation: `READY`;
- external Stheno: healthy on port 5001, identity `koboldcpp/L3-8B-Stheno-v3.2-Q4_K_M`, external PID 125225.

The initial preflight before Qwen activation was `DEGRADED` only because the owned Qwen resource was inactive. Qwen was activated before the controller call and disposed afterward.
