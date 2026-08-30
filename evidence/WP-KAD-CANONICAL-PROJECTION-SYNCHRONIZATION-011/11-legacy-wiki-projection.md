# Legacy Wiki Projection Record — WP-KAD-CANONICAL-PROJECTION-SYNCHRONIZATION-011

## 1. Status
- **Classification**: `GENERATED_COMPATIBILITY_ONLY`
- **Location**: `wiki/`
- **Reverse Mutation Prevention**: Verified via unit tests (`tools/kad/test/wiki-librarian.test.mjs`, `tools/kad/test/wiki-migration.test.mjs`). Any attempt to edit `wiki/` manually does not mutate `vault/`.
- **Rebuild Flow**: `vault/` $\rightarrow$ `bin/kad-wiki rebuild` $\rightarrow$ `wiki/generated/kad-canonical/` projections.
- **Physical Migration Completed**: All 8 `MIGRATE_CANONICAL` files reside in `vault/50_Projects/KAD-PI/Workpackages/`; 11 `REVIEW_REQUIRED` files reside in `vault/80_Review/Pending/`; 44 derived files reside in `vault/90_Derived/LegacyWiki/generated/`; 12 synthetic test files reside in `vault/99_Archive/LegacyWiki/synthetic/`.
