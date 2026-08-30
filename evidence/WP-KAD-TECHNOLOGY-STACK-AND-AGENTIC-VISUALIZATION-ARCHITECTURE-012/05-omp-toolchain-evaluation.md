# OMP Toolchain Evaluation Record — WP-KAD-TECHNOLOGY-STACK-AND-AGENTIC-VISUALIZATION-ARCHITECTURE-012

## 1. Extension & Skill Boundaries
- **Project-Scoped Default**: Native ExtensionAPI in `.omp/extensions/` (`kad-control-plane.js`, `kad-context-economy.js`), MCP configs in `.omp/mcp.json` (`context7`), project skills in `.agents/skills/`.
- **Authority Separation**:
  - Skills guide prompts and workflows.
  - Extension tools provide read-only observation.
  - `workctl` and deterministic KAD CLIs own mutation authority.
- **Model Independence**: Roles (`@plan`, `@task`, `@verifier`, `@research`, `@smol`, `@world`, `@local_retrieval`) map dynamically to available providers without vendor lock-in.
- **Marketplace Policy**: External tools (code-review, security-guidance, frontend-design) are adapted into project-owned skills rather than installed as global packages.
