# Workpackage Register Export Record — WP-KAD-CANONICAL-PROJECTION-SYNCHRONIZATION-011

## 1. Export Metadata
- **Target Path**: `vault/90_Derived/Projections/workpackages.json`
- **Schema**: `kad-workpackage-export-v1`
- **Generator**: `exportWorkpackages` in `tools/kad/wiki/projection.mjs`
- **Reconciled WPs Exported**: 20 workpackages (including active WP-011)

## 2. Invariants
- Direct projection from `.agents/work/*.json` and canonical vault workpackage records.
- Preserves `wp_id`, `title`, `status`, `priority`, `fixed_point`, `evidence_target`, and `description`.
- Strictly read-only projection; does not duplicate `workctl` execution state machine authority.
