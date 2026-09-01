# WP-KAD-GOVERNANCE-GATES-032: 01 - Authority Taxonomy & Policy Resolution

## 1. Six Canonical Authority Classes

| Authority Class | Description | Permitted Operations | Human In-The-Loop |
| :--- | :--- | :--- | :--- |
| **`HUMAN_ONLY`** | Sovereign project lead decisions | Constitutional mutations, doctrine promotions, root scope expansions, releases, budget cap increases | Required directly |
| **`HUMAN_PREAUTHORIZED`** | Operations requiring an unexpired, verifiable human authorization receipt | Remote git push, PR creation, main merges, authenticated external reads | Verified via typed receipt |
| **`DETERMINISTIC_POLICY`** | Fully deterministic, low-risk operations authorized by policy rules | Derived projection rebuilds, documentation compilation, local verification | None (Autonomous) |
| **`DELEGATED_WITH_GATE`** | High-leverage operations delegated to agents subject to passing automated gates | Metered API calls within pre-authorized FinOps envelope, public web reads | Automated gate |
| **`AUTONOMOUS_WITHIN_LEASE`**| Bounded operations within an active workctl task lease and owned paths | Local file edits in owned scope, local git commits, local unit tests | None (Inside active lease) |
| **`FORBIDDEN`** | Permanently prohibited operations across all actors and roles | Raw secret reading, force pushes to main, git history rewriting, budget self-escalation | Strictly Prohibited |

## 2. Governed Operation Classes (17 Operations)

1. `READ_LOCAL` $\rightarrow$ `AUTONOMOUS_WITHIN_LEASE`
2. `PUBLIC_NETWORK_READ` $\rightarrow$ `DELEGATED_WITH_GATE`
3. `AUTHENTICATED_READ` $\rightarrow$ `HUMAN_PREAUTHORIZED` (`CAPABILITY_BROKER_V1` fallback)
4. `WORKSPACE_MUTATION` $\rightarrow$ `AUTONOMOUS_WITHIN_LEASE` (requires active claim & valid lease)
5. `LOCAL_GIT_COMMIT` $\rightarrow$ `AUTONOMOUS_WITHIN_LEASE` (requires active claim & valid lease)
6. `REMOTE_GIT_PUSH` $\rightarrow$ `HUMAN_PREAUTHORIZED` (requires human receipt)
7. `PR_CREATE` $\rightarrow$ `HUMAN_PREAUTHORIZED` (requires human receipt)
8. `MAIN_MERGE` $\rightarrow$ `HUMAN_PREAUTHORIZED` (requires independent verification & human receipt)
9. `RELEASE_PUBLISH` $\rightarrow$ `HUMAN_ONLY`
10. `CANONICAL_KNOWLEDGE_PROMOTION` $\rightarrow$ `HUMAN_ONLY`
11. `DERIVED_PROJECTION_REBUILD` $\rightarrow$ `DETERMINISTIC_POLICY`
12. `METERED_API_CALL` $\rightarrow$ `DELEGATED_WITH_GATE` (requires FinOps envelope & `paidAuthorized=true`)
13. `SCOPED_CREDENTIAL_USE` $\rightarrow$ `HUMAN_PREAUTHORIZED` (`CAPABILITY_BROKER_V1` fallback)
14. `RAW_SECRET_ACCESS` $\rightarrow$ `FORBIDDEN`
15. `INFRASTRUCTURE_MUTATION` $\rightarrow$ `HUMAN_ONLY`
16. `POLICY_MUTATION` $\rightarrow$ `HUMAN_ONLY`
17. `CONSTITUTIONAL_MUTATION` $\rightarrow$ `HUMAN_ONLY`

## 3. Target Authority vs Active Enforcement Status
When an operation's target authority is `DELEGATED_WITH_GATE` but its enforcement capability (e.g. `CAPABILITY_BROKER_V1`) is `NOT_IMPLEMENTED`, the policy resolver automatically falls back closed to `HUMAN_PREAUTHORIZED` or `HUMAN_ONLY`.
