# WP-KAD-GOVERNANCE-GATES-032: 11 - Backlog & Experiment Discoveries

## 1. Backlog Discoveries

1. **`BP-KAD-CAPABILITY-BROKER-001`**: Cryptographic Local Capability Token Issuer (`CAPABILITY_BROKER_V1`)
   - *Description*: Implement local micro-capability tokens for `SCOPED_CREDENTIAL_USE` and `AUTHENTICATED_READ`, replacing fallback human gating with fine-grained cryptographic attenuation.
   - *Impact*: Enables autonomous authenticated package retrieval and external read operations without ambient credential leakage.

2. **`BP-KAD-GOVERNANCE-WORKFLOW-HOOKS-002`**: Automatic Preflight Interceptor for Agent Harnesses
   - *Description*: Integrate preflight checks directly into tool execution seams (`fs.write`, `git.push`, `provider.call`) in Pi and OMP adapters to intercept unauthorized operations before dispatch.
   - *Impact*: Eliminates need for manual preflight call boilerplate.

## 2. Experiment Discoveries

1. **`EXP-KAD-OFFLINE-SURVIVAL-001`**: Empirical Offline Engineering & Research Survival Experiment
   - *Hypothesis*: An agent equipped with local deterministic governance gates, local Qwen STC capabilities, and offline canonical knowledge can execute end-to-end multi-step implementation tasks without network egress or external API dependency.
   - *Prerequisite*: Satisfied by WP-032 (deterministic governance gates and boundary enforcement).
