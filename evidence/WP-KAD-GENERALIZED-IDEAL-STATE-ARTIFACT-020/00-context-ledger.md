# WP-020 Context Ledger & Workpackage Provenance

## Identity
- **Workpackage ID**: `WP-KAD-GENERALIZED-IDEAL-STATE-ARTIFACT-020`
- **Claim ID**: `b64200fa-7fd0-4074-9b3f-d268912decb8`
- **Project**: `kad-pi`
- **Base Commit / Fixed Point**: `2da2266eb76bfb5571838017449d553fbc8b4bee`
- **Date**: 2026-08-30
- **Actor**: `Gemini 3.7 Flash High running inside OMP`

## Mission
> Generalize the successful KAD-PI **Ideal State Artifact (ISA)** pattern into a reusable governance primitive, then instantiate the first non-aesthetic ISA for the compute fabric target:
> **"Build a self-measuring compute fabric that discovers the cheapest reliable way to complete each kind of cognition using whatever resources currently exist."**

## Scope & Owned Paths
- `vault/00_Governance/` (`ISA-KAD-AESTHETIC-001.md`, `ISA-KAD-COMPUTE-FABRIC-001.md`)
- `docs/adr/` (`0014-generalized-ideal-state-artifact-and-compute-fabric-governance.md`)
- `vault/90_Derived/Projections/` (`isa-aesthetic.json`, `isa-compute-fabric.json`, `isa-registry.json`)
- `tools/kad/isa.mjs`
- `tools/kad/test/isa.test.mjs`
- `bin/kad-isa`
- `evidence/WP-KAD-GENERALIZED-IDEAL-STATE-ARTIFACT-020/`
- `.agents/work/WP-KAD-GENERALIZED-IDEAL-STATE-ARTIFACT-020.json`

## Non-Scope Boundaries
- Implementing runtime compute schedulers or distributed worker daemons in this WP.
- Benchmarking live remote providers or paid API spend.
- Arbitrary shell execution from markdown.
- Weakening existing aesthetic ISA validations or regression tests.
