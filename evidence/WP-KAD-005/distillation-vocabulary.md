# Distillation vocabulary (DISTILL-000)

**Distillation** transfers empirically useful behavior from a more expensive/general capability into a cheaper/narrower/local capability while preserving provenance, authority boundaries, reproducibility, trust domains, graceful degradation, and reversibility. It is not fine-tuning.

- **Teacher**: a capability whose observable artifact corrects or supervises another execution; teacher output is not truth by itself.
- **Student**: the cheaper/narrower capability being evaluated for recurring behavior.
- **Episode**: a reconstructable state + causal event + decision + observable action/result + validation/outcome record; never hidden reasoning.
- **Training example**: a later curated artifact, not an automatic runtime episode.
- **Challenger**: an unpromoted capability under empirical evaluation.
- **Capability**: a declared contract available within an STC scope.
- **Teacher artifact**: bounded observable proposal paired with validation.
- **Ancestry**: origin, producer lineage, and generation depth.
- **Training eligibility**: an explicit gate; defaults false and rights UNKNOWN remain ineligible.
- **Active teacher**: an escalation selected because local confidence is low, validation failed, novelty/OOD or a rare boundary requires it—not merely because it is available.
- **Negative episode**: retained evidence of a failed or dominated route, including what corrected it.
- **Teacher leverage**: future accepted local work attributable to a teacher investment; UNKNOWN until measured.

Distillation != quantization; != QLoRA; != RAG; != synthetic data. RAG supplies current context; distillation transfers recurring behavior. QLoRA may later implement an experiment, but training is out of scope here.

## Downward migration policy

`existing deterministic tool > justified new deterministic tool > tiny local specialist > local general > cheap remote > strong remote > human`, subject to constitutional correctness and functional acceptance. Models never grant authority, mutable K.A.D. output is never canon, and `training_eligibility.eligible` remains false by default.

## Roadmap

DISTILL-000 instrumentation → DISTILL-001 deterministic baselines → DISTILL-002 routing dataset → DISTILL-003 bounded training feasibility → DISTILL-004 tiny routing specialist → DISTILL-005 extraction specialist → DISTILL-006 context selector → DISTILL-007 critic → DISTILL-008 repair → DISTILL-009 active teacher sampling → DISTILL-010 trajectory specialist → DISTILL-011 controlled periodic learning → DISTILL-012 on-policy research.
