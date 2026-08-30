# Ask-User Checkpoints & Decisions Record

## 1. Ask-User Evaluation Principle
Per Doctrine Section 23, questions are only presented to the human when evidence is genuinely ambiguous and cannot be deterministically resolved. Unnecessary interruptions for facts already established by repository history and accepted manifests are avoided.

---

## 2. Evaluated Decision Checkpoints

### A. Lineage of `DATA_REIN` vs `KAD-PI`
- **Candidate Ambiguity**: Is `DATA_REIN` an active project, parallel branch, or predecessor?
- **Evidence Found**:
  - `AMDY-003-R3` Decision Compilation Manifest (`/home/amdy/migration/manifest/migration-manifest.json`).
  - Decision D10 explicitly selected `preserve-in-quarantine` for `DATA_REIN`.
  - Decision D9 explicitly selected `stay-on-hdd` for migration backups.
  - `OFFICIAL_SOL_REVIEWER_HANDOFF_DREAM_SETUP_R2.md` states: *"Historical DATA_REIN artifacts are evidence, not current design authority."*
- **Resolution**: `DATA_REIN` is a quarantined `PREDECESSOR_OF` KAD-PI on external HDD (`amdy-HDD`). Resolved deterministically without human interruption.

### B. Purpose of `data_workspace`
- **Candidate Ambiguity**: Is `data_workspace` a fork of `DATA_REIN` or an active KAD component?
- **Evidence Found**:
  - `data_workspace/README.md` states: *"Experimental Omarchy 4 / Quickshell sibling derived from the KAD corpus. The project is independently runnable and does not import, mutate, or publish KAD canon."*
  - `data_workspace/DATA_WORKSPACE_R1_BUILD_REPORT.md` details M908 input forensics on Omarchy 4.
- **Resolution**: Classified as `SIDE_PROJECT` / `ACTIVE_SUPPORTING` desktop plugin. Resolved deterministically.

### C. Legacy `wiki/` Artifact Disposition
- **Candidate Ambiguity**: Which legacy wiki files are canonical vs review vs archive?
- **Evidence Found**:
  - 8 files correspond directly to accepted workpackages (`WP-001` through `WP-007`).
  - 11 files are historical handoffs/plans needing human review records.
  - 12 files in `synthetic/` are non-grounded fixtures (`ARCHIVE`).
  - 44 files in `generated/` are derived projections (`DERIVED_ONLY`).
- **Resolution**: Physically migrated and recorded in `vault/`. Resolved deterministically.
