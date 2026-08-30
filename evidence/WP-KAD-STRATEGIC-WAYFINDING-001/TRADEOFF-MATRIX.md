# Strategic Trade-off Matrix

Scores are advisory, on a 1–5 scale. Higher is better. For cost and risk dimensions, 5 means lower cost/risk. Scores are comparative judgments grounded in the current evidence and human answers; they are not measurements or an aggregate decision.

| Dimension | Option A: governed knowledge | Option B: local/PON research | Option C: mixed workstation |
|---|---:|---:|---:|
| Human utility | 4 | 2 | 5 |
| Research validity/value | 4 | 5 | 3 |
| Dependency leverage | 5 | 3 | 3 |
| Implementation cost | 3 | 3 | 3 |
| Token cost | 4 | 4 | 3 |
| Local compute utilization | 3 | 5 | 3 |
| Risk | 4 | 3 | 2 |
| Reversibility | 4 | 4 | 3 |
| Portfolio value | 4 | 3 | 3 |
| Academic value | 5 | 5 | 3 |

## Reading the matrix

- **Option A** has the strongest dependency leverage and academic/documentation value while delivering utility after a bounded contract/projection slice. Its main risk is projection scope creep.
- **Option B** produces the strongest direct local/PON/STC evidence, but current Needle confidence and Qwen availability are known blockers and daily utility is delayed.
- **Option C** reaches a usable workflow fastest, but has the greatest risk of prematurely shaping a general contract around one task and the weakest broad research value.

No total is presented. The human explicitly weighted research validity, selected a governed wiki projection as the near-term milestone, and requires a usable workflow next week; those priorities favor Option A with an intentionally user-visible first slice.

## Hard trade-offs

1. **Reusable contract vs immediate workflow:** Option A spends more up front; Option C reaches a workflow sooner but risks local optimization.
2. **Research certainty vs utility:** Option B maximizes measurement but delays the wiki assistant.
3. **Surface order:** Dashboard/public website/GitHub redesign provide lower leverage now because their status/provenance/privacy contracts are not yet the evidenced bottleneck.
4. **Model breadth vs qualification:** More model bytes do not resolve the current runtime and confidence unknowns; one bounded worker qualification is more informative.
