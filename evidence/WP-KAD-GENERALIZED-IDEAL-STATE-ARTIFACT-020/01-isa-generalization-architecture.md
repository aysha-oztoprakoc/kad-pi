# ISA Generalization Architecture

## 1. Architectural Model

The KAD Ideal State Artifact (ISA) framework is generalized from a single-domain aesthetic tool into an extensible multi-domain governance primitive:

```text
                  Generic ISA Governance Contract
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
Aesthetic Domain Adapter                    Compute Fabric Domain Adapter
(`ISA-KAD-AESTHETIC-001`)                   (`ISA-KAD-COMPUTE-FABRIC-001`)
        │                                               │
        ▼                                               ▼
`isa-aesthetic.json`                         `isa-compute-fabric.json`
        │                                               │
        └───────────────────────┬───────────────────────┘
                                ▼
                     `isa-registry.json`
                                │
                                ▼
                 Read-Only Presentation Observers
                 (Sofia v3, Public Web, Workctl, CLI)
```

## 2. Core Epistemic Status Model

Every claim and capability in an ISA is explicitly typed:
- `CANONICAL_TARGET`: Governed specification and requirement for future implementation.
- `CURRENT_CONFIRMED`: Verifiably implemented and evidenced in current repository state.
- `DERIVED`: Synthesized from canonical knowledge or verified metrics.
- `HEURISTIC`: Probabilistic advisory or empirical suggestion.
- `UNKNOWN`: Unobserved or unmeasured parameter awaiting experimentation.
- `BLOCKED`: Dependency or gate condition unsatisfied.

## 3. Validator Registry & Execution Security

- Zero arbitrary shell execution from markdown.
- All validators are pure JavaScript functions registered in `VALIDATOR_REGISTRY` in `tools/kad/isa.mjs`.
- Security rule: Markdown references validator IDs (e.g. `compute.pon.typed_notifications`) and evidence paths; the engine executes only allowlisted functions.
- Validators fail closed on missing paths, syntax errors, or unexpected exceptions.

## 4. Multi-ISA Discovery & Compilation

- `discoverIsas(rootDir)` discovers all active `vault/00_Governance/ISA-*.md`.
- `buildIsaProjection(filePath, outputPath)` compiles domain-specific machine projections.
- `compileAllIsas(rootDir)` compiles all discovered ISAs and builds the composite registry at `vault/90_Derived/Projections/isa-registry.json`.
