# Dirty State Classification Record — WP-KAD-CANONICAL-PROJECTION-SYNCHRONIZATION-011

All dirty and untracked filesystem paths under `/home/amdy/Work` have been inventoried and classified into canonical categories:

| Path | Classification | Role / Description | Action |
|---|---|---|---|
| `.gitignore` | `COMMIT_PROJECT` | Ignores `.scratch/` and binary `ngc-cli` toolchain downloads | Stage & Commit |
| `.agents/workspace/skills.lock.json` | `COMMIT_PROJECT` | Agent skills lock manifest | Stage & Commit |
| `.omp/config.yml` | `COMMIT_PROJECT` | OMP workspace configuration and model routing settings | Stage & Commit |
| `CONTEXT.md` | `COMMIT_PROJECT` | Core architectural context note | Stage & Commit |
| `evidence/WP-KAD-002/causal-journal.jsonl` | `COMMIT_PROJECT` | Append-only causal journal records | Stage & Commit |
| `tools/kad/context-economy.mjs` | `COMMIT_PROJECT` | Core context compaction and budget logic | Stage & Commit |
| `wiki/` (legacy projection files) | `COMMIT_GENERATED_PROJECTION` | Regenerable legacy wiki projections (`GENERATED_COMPATIBILITY_ONLY`) | Stage & Commit |
| `docs/adr/0008-unified-context-knowledge-plane.md` | `COMMIT_PROJECT` | Architectural Decision Record ADR 0008 | Stage & Commit |
| `evidence/WP-KAD-CONTEXT-PLANE-001/` | `COMMIT_PROJECT` | Historical workpackage evidence | Stage & Commit |
| `evidence/WP-KAD-KNOWLEDGE-PLANE-001/` | `COMMIT_PROJECT` | Knowledge Plane evidence artifacts | Stage & Commit |
| `evidence/WP-KAD-RESEARCH-WORKFLOW-SCAFFOLD-001/` | `COMMIT_PROJECT` | Scaffold fidelity evidence | Stage & Commit |
| `evidence/WP-KAD-STRATEGIC-WAYFINDING-001/` | `COMMIT_PROJECT` | Strategic Wayfinding evidence records | Stage & Commit |
| `.agents/work/claims/*.json` | `COMMIT_PROJECT` | Workpackage claim and transition records | Stage & Commit |
| `.agents/work/WP-KAD-CANONICAL-PROJECTION-SYNCHRONIZATION-011.json` | `COMMIT_PROJECT` | Active workpackage descriptor | Stage & Commit |
| `evidence/WP-KAD-CANONICAL-PROJECTION-SYNCHRONIZATION-011/` | `COMMIT_PROJECT` | Workpackage 011 evidence package | Stage & Commit |
| `.scratch/` | `USER_SCRATCH` | Ephemeral scratch notes and conversation logs | Ignored via `.gitignore` |
| `ngc-cli*` / `ngccli_linux.zip` | `IGNORE_RUNTIME` | External NVIDIA NGC CLI binary download | Ignored via `.gitignore` |
| `data_workspace/`, `technopagan-netrunner/`, etc. | `IGNORE_RUNTIME` | Nested/sibling independent repositories | Ignored via `.gitignore` |
