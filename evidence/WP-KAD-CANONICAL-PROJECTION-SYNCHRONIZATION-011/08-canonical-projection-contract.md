# Canonical Projection Compiler Contract — WP-KAD-CANONICAL-PROJECTION-SYNCHRONIZATION-011

## 1. Core Architectural Contract
The Canonical Projection Compiler (`tools/kad/wiki/projection.mjs` & `./bin/kad-wiki rebuild`) enforces a strict unidirectional flow of knowledge:

```text
[ Canonical Vault (vault/) ]  <-- Sole Human-Authored Ground Truth
             │
             ├──> [ Root README.md ] (Public Landing Projection)
             ├──> [ docs/generated/ ] (Derived Repository Documentation)
             ├──> [ site/generated/public-state.json ] (Fail-Closed Public Website Data)
             ├──> [ vault/90_Derived/Projections/sofia-projection.json ] (Sofia v3 Data Feed)
             ├──> [ vault/90_Derived/Projections/graph.json ] (Project Knowledge Graph)
             ├──> [ vault/90_Derived/Projections/projects.json ] (Ecosystem Projects Status)
             ├──> [ vault/90_Derived/Projections/workpackages.json ] (Reconciled WP Matrix)
             ├──> [ vault/90_Derived/Projections/research.json ] (5-Paper Audited Research Index)
             └──> [ wiki/ ] (Legacy Generated Compatibility Only)
```

## 2. Invariants
1. **Unidirectional Authority**: Projections are strictly derived; reverse mutations from projections into `vault/` are prohibited and fail closed.
2. **Provenance Binding**: Every projection artifact retains `source_vault_revision`, `generator_version`, and `generated_at`.
3. **Fail-Closed Privacy**: Private notes (`visibility: private`, `publish: false`) and non-canonical zones (`00_Governance/`, `10_Raw/`, `80_Review/`, `90_Derived/`, `99_Archive/`) are strictly filtered from public surfaces.
4. **Staleness Detection**: Downstream adapters detect stale projections whenever `projection.source_vault_revision !== revision(vaultRoot)`.
