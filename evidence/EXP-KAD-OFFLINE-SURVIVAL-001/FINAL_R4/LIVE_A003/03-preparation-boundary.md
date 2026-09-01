# R4-A003-03 Preparation Boundary

Phase A artifacts prepared only. No live observer, experiment timer, rollback timer, route mutation, V2 receipt, or deterministic preflight has been started or created yet.

Prepared:

- Fresh A003 baseline and route observation.
- Fresh hash-bound authorization request.
- Exact deletion and rollback commands.
- 180-second observer script with expected-end recording.
- Correct user-manager verification requirement.
- Human local-terminal preparation requirement (`sudo -v` before Phase B).
- Critical timing predicates and fail-closed conditions.

Phase B ordering is fixed: receipt/preflight after exact authorization, then all final probes and human terminal preparation; only after that start and verify observer, assert remaining lifetime, arm and verify guard, record `T_GUARD_ARMED`, perform zero-time predicates, and coordinate the already-authorized human mutation.

A002 remains immutable historical evidence with disposition `INSUFFICIENT_EVIDENCE / ABORTED_SAFE_TIMING_BUDGET`.
