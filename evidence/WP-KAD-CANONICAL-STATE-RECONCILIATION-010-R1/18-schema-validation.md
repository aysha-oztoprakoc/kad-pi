# Schema & Property Validation Report

## 1. Schema Invariant Verification
The canonical vault adheres to the flat typed property registry defined in `vault/00_Governance/PROPERTY_REGISTRY.md` and schema constraints in `vault/00_Governance/SCHEMA.md`.

- **Validator Command**: `./bin/kad-wiki lint`
- **Total Canonical & Governed Notes Evaluated**: 62 notes
- **Error Count**: 0 errors
- **Lint Status**: `ok: true`

---

## 2. Standard Properties Enforced

| Property Name | Allowed Values | Semantic Meaning |
|---|---|---|
| `kad_id` | `kad-[a-z0-9_-]+` | Unique, stable content/semantic identifier |
| `title` | string | Human-readable title |
| `type` | `documentation`, `project`, `architecture`, `workpackage`, `roadmap`, `dossier`, `governance`, `review_record` | Document class |
| `authority` | `CANONICAL_KNOWLEDGE`, `CANONICAL_PROJECT_DECISION`, `RAW_EVIDENCE`, `PROPOSAL_UNREVIEWED`, `DERIVED`, `ARCHIVED` | Governing authority level |
| `epistemic_class` | `SOURCE_FACT`, `DERIVED_SYNTHESIS`, `PROJECT_INFERENCE`, `UNKNOWN` | Epistemic status of claims |
| `review_status` | `APPROVED`, `PENDING`, `REJECTED`, `UNREVIEWED` | Review state |
| `visibility` | `project`, `public`, `private` | Visibility boundary |
| `context_eligible` | `true`, `false` | Normal agent context inclusion gate |
| `train_eligible` | `true`, `false` | Training / fine-tuning dataset inclusion gate |
| `publish` | `true`, `false` | Public site export gate |
| `temporal_status` | `CURRENT`, `HISTORICAL`, `SUPERSEDED`, `PROPOSED`, `EXPERIMENTAL` | Time dimension |
| `legacy_source` | string (optional) | Provenance path of migrated legacy artifacts |
