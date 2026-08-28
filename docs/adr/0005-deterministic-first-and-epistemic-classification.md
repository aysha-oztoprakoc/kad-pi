# 0005. Deterministic-First Resolution and Epistemic Classification

## Status
Accepted

## Context
AI agents often hallucinate claims of success or rely on self-reported "PASS" assessments without empirical verification. Furthermore, research ideas, temporary hacks, and proven theorems frequently get conflated in documentation.

## Decision
We enforce two core epistemological invariants across the harness:
1. Deterministic First: Before delegating to an LLM, resolve tasks via state inspection, schema validation, static analysis, unit tests, or deterministic routing. Models provide cognition only where deterministic solutions do not exist.
2. Epistemic Classification: Every claim, invariant, and architectural statement must be explicitly marked:
   - `[SOURCE_DERIVED]`: Backed by literature/formal papers.
   - `[DESIGN_DECISION]`: Accepted architectural consensus.
   - `[HYPOTHESIS]`: Expected benefit pending empirical demonstration.
   - `[EXPERIMENT]`: Temporary mechanism to test a hypothesis.
   - `[OBSERVED]`: Measured behavior from executable runs.
3. Model self-report != evidence. An accepted outcome requires verifiable artifacts and deterministic assertions.
