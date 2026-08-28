# Adversarial review

1. Pi functional: PASS — `pi --version` 0.84.3; no Pi paths changed.
2. Global pollution: FOUND — OMP v18.0.9 writes `~/.omp/logs`; wrapper cleanup is bounded when root was absent. Native behavior is not zero-side-effect.
3. Skills reused: PASS by documented provider/source and zero copies; direct invocability NOT_MEASURED.
4. Governance duplicated: no — bridge is 1 pointer context + 7 short invariants.
5. PAYG risk: bounded by `enabledModels: kad-local-world/*` and only keyless custom provider; no remote auth.
6. Private data leakage: no remote providers configured; local endpoint is 127.0.0.1.
7. STC bypass: no process lifecycle controls in OMP; it only connects to existing endpoint.
8. Advisor: disabled and config-observed false.
9. Auto-learn/memory: disabled and config-observed off/false.
10. Agent authority: world adapter read-only; no engineering authority.
11. Model resolution: `@world` resolved to actual configured selector.
12. Fresh session: version/config/models commands succeeded from wrapper state.
13. Rollback: bounded paths listed in rollback-manifest.json; global root cleanup caveat recorded.
14. Dirty worktree attribution: pre-state captured; no pre-existing paths edited/staged.
15. Shell restart: wrapper uses absolute binary/state paths and does not edit shell startup files.

Conclusion: core install/discovery boundary is useful but H6/H7 and native global side-effect requirements are incomplete.
