# 0004. Model-Agnostic Control Plane and Role-Based Swarm Routing

## Status
Accepted

## Context
Coupling orchestration or core workflow code to specific proprietary model names (e.g. `gpt-4`, `claude-3-opus`, `gemini-1.5-pro`) creates vendor lock-in, breaks cross-harness portability, and leads to rapid obsolescence when models are updated or rate-limited.

## Decision
We enforce strict decoupling between control logic and model backends:
1. Invariant: The harness may know capabilities; the configuration may know models; the experiment may know providers; but control logic MUST NOT require any of them by name.
2. Routing is resolved dynamically: `role + task + budget + capability + availability → provider/model`.
3. Specialized swarm roles are decoupled:
   - `kad-master` (Architect / Final Synthesis): High-reasoning tier (`pro`).
   - `kad-researcher`, `kad-builder`, `kad-tester`, `kad-reviewer`: Focused execution workers (`flash`).
4. Workers explore and prove; Master synthesizes and decides.
