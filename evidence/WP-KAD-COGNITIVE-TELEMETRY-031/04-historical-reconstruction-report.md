# WP-KAD-COGNITIVE-TELEMETRY-031: 04 - Historical Reconstruction Report

## 1. Scope & Purpose of Historical Reconstruction
Historical reconstruction parses existing `.agents/work/` workpackage definitions, claim logs in `.agents/work/claims/`, and accepted evidence packages to bootstrap an initial structural baseline for KAD-PI without retroactive fabrication.

## 2. Epistemic Integrity Invariants
1. **Classification**: Every reconstructed record is stamped `origin_class: "RECONSTRUCTED"`.
2. **Zero Fabrication**:
   - `human.active_minutes_estimate`: `null` (`origin: UNKNOWN`)
   - `context.input_tokens`: `null` (`origin: UNKNOWN`)
   - `context.output_tokens`: `null` (`origin: UNKNOWN`)
   - `economic.api_cost_usd`: `null` (`origin: UNKNOWN`)
   - `compute.cpu_time_ms`: `null` (`origin: UNKNOWN`)
3. **Deterministic Derivations**:
   - `work.workpackage_id`, `work.ticket_id`, `work.work_class`, `work.risk_tier` derived from task files.
   - `outcome.accepted`, `outcome.acceptance_revision`, `outcome.acceptance_evidence_refs` derived from status and fixed points.
   - `provenance.record_hash` computed deterministically over all canonical fields.

## 3. Backfill Execution Summary

Ran `bin/kad-telemetry backfill` over workspace root:
- **Total Workpackages Scanned**: 37
- **Reconstructed Records Created**: 37
- **Stored in `.agents/telemetry/outcomes/`**: 37 records in `outcomes.jsonl` and individual files in `records/`
- **Integrity Status**: 37/37 valid SHA-256 digests verified

### Stratification Breakdown
- **Implementation**: 17 workpackages
- **Research**: 6 workpackages
- **Debugging / Repair**: 4 workpackages
- **Governance / ISA**: 3 workpackages
- **Documentation**: 3 workpackages
- **Projections / Snapshots**: 3 workpackages
- **Benchmarks**: 1 workpackage
