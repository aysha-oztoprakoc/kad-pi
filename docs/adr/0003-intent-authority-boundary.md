# 0003. Intent Authority Boundary in Simulation and Game Core

## Status
Accepted

## Context
Probabilistic language models are well suited for interpreting natural language input, unstructured lore, and player intent, but they are nondeterministic and cannot be trusted with direct authority to mutate canonical simulation state.

## Decision
We enforce a strict deterministic authority boundary between probabilistic interpretation and state mutation:
1. LLM interpreters produce unvalidated, untrusted `CandidateIntent` objects only.
2. A pure deterministic `Validator` rejects malformed schemas, nonexistent entity references, ambiguous targets, and authority-leakage attempts.
3. Only `ValidatedIntent` passes through to the deterministic `Resolver`.
4. The `Resolver` computes an explicit `StateDiff` and emits canonical `Event` objects.
5. Canonical `GameState` transitions exclusively via `apply(GameState, StateDiff)`. Zero LLM calls are permitted inside the authority boundary.
