# Technology Registry Projection Record — WP-KAD-TECHNOLOGY-STACK-AND-AGENTIC-VISUALIZATION-ARCHITECTURE-012

## 1. Projection Metadata
- **Target Path**: `vault/90_Derived/Projections/technology-registry.json`
- **Schema**: `kad-technology-registry-v1`
- **Generator**: `exportTechnologyRegistry` in `tools/kad/wiki/projection.mjs`
- **Rebuild Trigger**: Executed automatically via `./bin/kad-wiki rebuild`

## 2. Invariants
- Provides a machine-readable technology inventory without creating a competing authority.
- Retains classified decisions (`KEEP`, `AUGMENT`, `ADOPT`, `EXPERIMENTAL`, `RETIRE`).
- Tested in `tools/kad/test/projection-compiler.test.mjs`.
