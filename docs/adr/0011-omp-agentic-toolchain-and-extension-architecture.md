# ADR 0011: OMP Agentic Toolchain and Extension Architecture

* **Status**: ACCEPTED
* **Date**: 2026-08-30
* **Author**: KAD-PI Architecture & Implementation Team
* **Authority**: Wayfinder + KAD Human Decision Gate
* **Supercedes**: None
* **Related ADRs**: ADR 0004 (Model-Agnostic Control Plane)

---

## Context
KAD-PI runs within the Oh My Pi (OMP) harness. We need a clear, reproducible, and secure architecture for agentic extensions, skills, tools, rules, and marketplace integrations without creating global configuration drift or coupling to specific model providers.

## Decision

### 1. Scope Hierarchy & Placement Invariant
* **Project-Scoped Default**:
  - All KAD-specific capabilities MUST be registered under project `.omp/extensions/` or `.omp/` configuration.
  - Project skills reside in `.agents/skills/`.
  - MCP configurations reside in `.omp/mcp.json` (e.g. `context7`).
* **Global Scope Restriction**:
  - Third-party marketplace plugins are audited and installed project-scoped by default.
  - Promotion to user/global scope is permitted ONLY when the capability is intentionally project-independent, general-purpose, and proven across multiple independent workspaces.

### 2. Authority Separation
* **Skills**: Own guidance, procedural workflows, and cognitive instructions. Skills do NOT possess direct execution authority.
* **Extensions / Tools**: Expose read-only observations, telemetry views, and candidate proposals via OMP ExtensionAPI (`createKadControlPlaneExtension`, etc.).
* **Deterministic KAD Programs & `workctl`**: Sole owners of state transitions, workpackage claim lifecycle, and governed mutations. Extensions and tools MUST NOT bypass `workctl` or mutate state out-of-band.

### 3. Model & Provider Independence
* The OMP configuration must not assume Claude-, OpenAI-, or Gemini-specific model bindings.
* Model roles (`@plan`, `@task`, `@verifier`, `@research`, `@smol`, `@world`, `@local_retrieval`) map to configured providers dynamically.
* Local inference capabilities (`kad-local-world`, `kad-local-qwen`) remain STC-owned and separate from external API lanes.

### 4. Marketplace Tool Auditing Policy
* Before adopting any marketplace tool or extension:
  1. Inspect network calls and credential access.
  2. Verify offline/local execution capability.
  3. Ensure no unapproved paid token expenditure or hidden telemetry.
  4. Adapt valuable principles into project-owned skills rather than incurring heavy upstream runtime dependencies.

## Consequences

### Positive
- Fully self-contained repository: cloning onto a clean machine with OMP provides identical behavior.
- Zero risk of global configuration conflicts across different projects.
- Strict security and privacy guarantees.

### Negative / Trade-offs
- Shared extensions across multiple local repositories must be linked or copied rather than installed once globally.
