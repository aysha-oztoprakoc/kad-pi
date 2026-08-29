# Advisory Board Result

The upstream `5-persona-advisory-board` CRIT process was applied to the architecture question: direct fork, thin overlay/composition, or independent replacement.

## Lenses

- **Epistemic Integrity:** preserve upstream files; overlays must be explicit and additive; record options, selection, provenance, and evidence gaps.
- **Authority & Safety:** `workctl` owns claims/state/handoffs; `ask_user` owns human choice; bridge validation must be idempotent and conflict-explicit.
- **Systems & Lifecycle:** composition preserves reusable upstream behavior and keeps TDD/review visible; prevent overlays becoming hidden replacements.
- **Economy & Determinism:** deterministic normalized bridge and replay behavior are essential; fork only if measured integration cost justifies it.
- **Research & Long-Horizon Value:** composition preserves comparability, reversibility, and upstream updateability.

## Disagreement

Economy may tolerate a fork if deterministic requirements become invasive. Research rejects an early fork because it destroys comparability. Systems warns that an oversized overlay is a replacement in disguise.

## Recommendation

Use **thin project-scoped overlay/composition**. Preserve upstream skill content, add minimal deltas, keep Wayfinder plus canonical `ask_user` for 5+1 decisions, keep `workctl` authoritative, and version the upstream lock and overlay delta.

## Authority boundary

Advisory only. The board cannot authorize implementation, claims, lifecycle transitions, handoffs, merges, or releases. Human responses and deterministic policy remain authoritative.

## Invocation note

The external background invocation failed with a provider authentication error. The board process was then applied locally against the pinned upstream skill and recorded here as advisory input, not as a PASS gate.
