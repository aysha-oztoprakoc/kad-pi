# Proposed Native Task Registration Bundle — Gaya Dataset G1

**Artifact:** `evidence/WP-GAYA-DATASET-G1/00-preflight/proposed-registration-bundle-2026-09-09.md`  
**Timestamp:** 2026-09-09T01:46:34Z  
**Status:** `DRAFT_PROPOSAL_FOR_REVIEW`  
**Governance Guard:** Proposal only; NOT written to `.agents/work/`.  
**Target:** `ISA-GAYA-DATASET-G1-001`  

---

## 1. Registration Metadata & Observed Fixed Points

- **Workspace Container:** `kad-pi` (Observed HEAD: `3a0b5b0f2cb11ed00b65ef8da7bb49c309c42af5`)
- **Nested Repository:** `kad-rpg` (Observed HEAD: `0389137746b0e92a34013e7cf72abfbf0679c1e4`)
- **Registration Fixed Point Policy:** Marked `TO_RESOLVE_AT_REGISTRATION`. When the human lead enrolls `kad-rpg` and registers the tasks into `.agents/work/`, the exact commit hashes above should be bound as `fixed_point`.

---

## 2. Frozen Operational Policies

1. **Source Inventory & Disposition Policy:**
   - 209 items discovered and indexed (11 subdirectories, 198 files).
   - Six mutually exclusive disposition buckets:
     - `POSITIVE_LORE_CANDIDATE` (41 files): Core world lore and character sheets.
     - `MEDIA_ASSET` (151 files): Visual references, token images, map art; tracked by path and hash without hallucinating narrative canon.
     - `STRUCTURED_DATA` (1 file): Spell sublists.
     - `DOCUMENTATION` (1 file): Requirements reports.
     - `EXCLUDED_CODE` (1 file): `extract_and_ingest_gaya.py` (destructive legacy script).
     - `EXCLUDED_DATABASE` (3 files): `gaya_knowledge_db.*` and journal (pre-existing stores preserved intact).
   - Zero source corpus or pre-existing database mutation permitted.

2. **Split-Family Partitioning Policy:**
   - Datasets are partitioned strictly by **source duplicate/revision family**, preventing test leakage from near-identical character sheet versions or lore drafts.
   - Multi-source examples bridging separate family partitions are rejected.
   - Separate scopes: `persona` (actor-bounded knowledge) vs `world` (omniscient narrator).
   - Canary secret isolation (Experiment E6) enforced across split boundaries.

3. **Two-Tier Evidence Staging Architecture:**
   - **Tier 1 (Frames 01–08 in `kad-rpg`):** Intermediate run outputs, stage manifests, and extraction logs are written to `kad-rpg/kad-gaya/dataset_runs/staging/`. This maintains single-project path ownership per task claim.
   - **Tier 2 (Frame 09 in `kad-pi`):** Final release compiler copies and seals verified artifacts into parent workspace `evidence/WP-GAYA-DATASET-G1/`, computing non-recursive SHA-256 manifests and executing native ISA checks.

---

## 3. Frame Task Specification Summary (10 Proposed Frames)

| Task ID | Project Binding | Title | Blocked By (`depends_on`) | Blocks | Authority / Trust | Owned Paths Scope | ISA Gates |
|---|---|---|---|---|---|---|---|
| **WP-GAYA-DATASET-G1-00** | `kad-pi` | Preflight, Authority & Research Protocol | *None* | `01` | `kad-pi-project` / `engineering` | `evidence/WP-GAYA-DATASET-G1/00-preflight/` | `GAYA-G1-01` |
| **WP-GAYA-DATASET-G1-01** | `kad-rpg` | Dataset CLI Contract & Staging Schemas | `00` | `02` | `kad-rpg-project` / `engineering` | `kad-gaya/cli/`, `kad-gaya/pipeline/` | `GAYA-G1-01`, `GAYA-G1-02`, `GAYA-G1-10` |
| **WP-GAYA-DATASET-G1-02** | `kad-rpg` | Full Corpus Ingestion & Source Accounting | `01` | `03` | `kad-rpg-project` / `engineering` | `kad-gaya/ingestion/`, `kad-gaya/dataset_runs/` | `GAYA-G1-01`, `GAYA-G1-03` |
| **WP-GAYA-DATASET-G1-03** | `kad-rpg` | Entity Resolution & World Graph Extraction | `02` | `04` | `kad-rpg-project` / `engineering` | `kad-gaya/pipeline/`, `kad-gaya/knowledge/` | `GAYA-G1-02`, `GAYA-G1-04` |
| **WP-GAYA-DATASET-G1-04** | `kad-rpg` | Visual References & Spatial Grounding | `03` | `05` | `kad-rpg-project` / `engineering` | `kad-gaya/ingestion/media_references.py`, `kad-gaya/dataset_runs/` | `GAYA-G1-05` |
| **WP-GAYA-DATASET-G1-05** | `kad-rpg` | Benchmark Suites, Canaries & Splits | `04` | `06` | `kad-rpg-project` / `engineering` | `kad-gaya/eval/`, `kad-gaya/tests/` | `GAYA-G1-06`, `GAYA-G1-07`, `GAYA-G1-09` |
| **WP-GAYA-DATASET-G1-06** | `kad-rpg` | Dialogue, Persona & World Synthesis | `05` | `07` | `kad-rpg-project` / `engineering` | `kad-gaya/synthesis/`, `kad-gaya/dataset_runs/` | `GAYA-G1-07`, `GAYA-G1-10` |
| **WP-GAYA-DATASET-G1-07** | `kad-rpg` | Multi-Consumer Export Packaging | `06` | `08` | `kad-rpg-project` / `engineering` | `kad-gaya/exports/`, `kad-gaya/training/` | `GAYA-G1-05`, `GAYA-G1-08`, `GAYA-G1-10` |
| **WP-GAYA-DATASET-G1-08** | `kad-rpg` | Deterministic Verification & Replay Suite | `07` | `09` | `kad-rpg-project` / `engineering` | `kad-gaya/tests/test_dataset_g1.py`, `kad-gaya/dataset_runs/` | `GAYA-G1-02..07`, `GAYA-G1-09..10` |
| **WP-GAYA-DATASET-G1-09** | `kad-pi` | Release Qualification & ISA Validation | `08` | *None* | `kad-pi-project` / `engineering` | `evidence/WP-GAYA-DATASET-G1/09-release/` | All 11 ISA claims (`GAYA-G1-01` to `G1-11`) |

---

## 4. Integrity Summary

The complete proposal JSON file is stored at:  
`evidence/WP-GAYA-DATASET-G1/00-preflight/proposed-registration-bundle-2026-09-09.json`.

- All 10 frame drafts validate strictly against the `workctl` task schema.
- Project roots are strictly separated (`kad-pi` for 00/09; `kad-rpg` for 01–08).
- Sequential topological order is preserved (Frame 04 explicitly depends on Frame 03 entity resolution).
- Non-scope boundaries are explicitly asserted on every frame.
