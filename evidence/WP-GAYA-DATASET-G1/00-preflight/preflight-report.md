# Preflight & Ownership Qualification Report — WP-GAYA-DATASET-G1-00

**Artifact:** `evidence/WP-GAYA-DATASET-G1/00-preflight/preflight-report.md`  
**Timestamp:** 2026-09-08T22:21:00Z  
**Status:** `PREFLIGHT_COMPLETE_MUTATION_BLOCKED_PENDING_AUTHORITY`  
**Epistemic Class:** `OBSERVED_DETERMINISTIC`  
**Target:** `ISA-GAYA-DATASET-G1-001`  

---

## 1. Executive Summary & Stop-Condition Evaluation

In strict adherence to **PRIME_DIRECTIVE.md (§9 Global STOP Conditions)**, **ISA-GAYA-DATASET-G1-001 (§10 Graceful Degradation)**, and **WORKPACKAGES.md (WP-GAYA-DATASET-G1-00)**:

1. **Current State Observed**: `.agents/workspace/projects.json` lists `kad-rpg-unknown` as `kind: UNKNOWN` and `agent_enabled: false`. In `bin/workctl`, non-primary/non-side projects cannot be claimed for mutation.
2. **Deterministic Reality**: `kad-rpg` is verified to be an independent, clean Git repository at commit `0389137746b0e92a34013e7cf72abfbf0679c1e4` (default branch `main`, remote `origin` `https://github.com/aysha-oztoprakoc/kad-rpg.git`), with entrypoint `README.md` and test suite `python -m unittest discover kad-gaya/tests` passing cleanly (7/7 tests OK).
3. **Non-Goals Honored**: The builder did **not** unilaterally alter `.agents/workspace/projects.json`, did **not** claim the parent project as a bypass, did **not** execute destructive scripts, did **not** configure providers, and did **not** incur any marginal paid API spend.
4. **Degradation Policy**: Because project enrollment authority requires external authorization, code/source/database mutation is **BLOCKED**. In accordance with the handoff contract (*"If authority is unavailable, finish all reachable read-only source/capability/research analysis and return the exact decision required"*), the complete read-only investigation has been executed and recorded below.

---

## 2. Source Stability & Fingerprint Verification

All 21 source files and 6 deliverable files documented in `evidence/GAYA-DATASET-HANDOFF-001/source-manifest.json` were re-hashed with SHA-256 and matched with zero drift:

- **Source files checked**: 21 (21 MATCH, 0 DIFF, 0 MISSING)
- **Deliverables checked**: 6 (6 MATCH, 0 DIFF, 0 MISSING)
- **Stability status**: `UNMUTATED_VERIFIED`

---

## 3. Environment & Capability Census

| Capability | Observed State | Status |
|---|---|---|
| **Python Runtime** | 3.12.14 (Clang 22.1.3) | `OBSERVED` |
| **Document Parsers (Python stdlib)** | Pure `zipfile` + `xml.etree.ElementTree` handles DOCX, ODT, ODG | `QUALIFIED` (Tested on real corpus) |
| **PDF Extraction** | `/usr/bin/pdftotext -layout` functional | `QUALIFIED` (Tested on real corpus) |
| **System Binaries** | `pdftotext`, `tesseract`, `soffice`, `unzip`, `node` (26.7.0), `git`, `make` | `AVAILABLE` |
| **RAM** | 15.4 GB total, ~7.3 GB available | `OBSERVED` |
| **GPU / Acceleration** | AMD Navi 44 [Radeon RX 9060 XT]; no `rocm-smi` / `rocminfo` installed | `NO_ROCM_OBSERVED` |
| **Local LLM Daemons** | Ports 11434, 8080, 5000, 1234 all CLOSED | `NO_LOCAL_LLM_ACTIVE` |
| **Frontend Service** | Port 8000 listening (SillyTavern HTTP frontend) | `PRESERVED_NO_MUTATION` |
| **Economic Boundary** | $0.00 marginal spend; no remote teacher model; no weight training | `ENFORCED` |

---

## 4. Full Source Census & Disposition Policy

Inspection of `/home/amdy/Work/kad-rpg/kad-gaya` identified **209 total entries** (11 subdirectories, 198 files):

- **6 Markdown files** (`Gaya_Codice_Canonico_Consolidado_2026-09-08.md`, `Gaya_Lore_Codex_Atualizado.md`, `calendario.md`, etc.) — `POSITIVE_LORE_CANDIDATE`
- **1 DOCX file** (`O Códice de Gaya História e Cosmogo.docx`, 13,617 bytes) — `POSITIVE_LORE_CANDIDATE`
- **1 ODT file** (`Manto de Kravarius.odt`, 2,910 chars) — `POSITIVE_LORE_CANDIDATE`
- **2 ODG files** (Editable character sheets, e.g. Ayşa/Amethysta) — `POSITIVE_LORE_CANDIDATE`
- **31 PDF files** (Character sheets, Kravarius item expansions, rules) — `POSITIVE_LORE_CANDIDATE`
- **151 Media Assets** (140 PNG, 8 WebP, 3 JPG; screenshots, character art, tokens) — `MEDIA_ASSET` (tracked, not hallucinated as lore)
- **1 Legacy Script** (`extract_and_ingest_gaya.py`, 82,673 bytes) — `EXCLUDED_CODE` (contains destructive SQLite DROP/CREATE)
- **3 Generated Stores** (`gaya_knowledge_db.sqlite`, `gaya_knowledge_db.json`, `.persistence_journal.jsonl`) — `EXCLUDED_DATABASE` (preserved, not recycled into canon)
- **1 Structured Data** (`spells-sublist-amethysta.json`) — `STRUCTURED_DATA`
- **1 Documentation file** (`relatorio_requisitos_gaya.html.txt`) — `DOCUMENTATION`

### Disposition Sample

1. **Original Lore**: `O Códice de Gaya História e Cosmogo.docx` (`sha256: 706ff1cbfa17b4c6e93eb5183312c3f81df95e9ff075c3db112c38cbda5060ee`) → POSITIVE_LORE_CANDIDATE
2. **Historical Revision**: `YKT _ Lylia_Nivel_6.pdf` (`sha256: 6a111a91d293883a8b417e9fe5589a19491a92e1dd3ba4bc25e6e8e815668b13`) vs `YKT _ Lylia_Nivel_7.pdf` → HISTORICAL_REVISION (preserved separately, no silent merging)
3. **Media Asset**: `YKT _ Amethysta comendo.png` (`sha256: 9e6f30a94aa002a275215c2cf0ea0b001a1d13f9c6e3b5e40e698ea7ee3a44ad`) → MEDIA_ASSET (linked to Amethysta, no invented rules)
4. **Code**: `extract_and_ingest_gaya.py` (`sha256: 5231b82d7833622b7f0863fc2406a31be42a579dc98a9adfe41e0fc153239f37`) → EXCLUDED_FROM_POSITIVE_LORE
5. **Pre-existing Database**: `gaya_knowledge_db.sqlite` (`sha256: 807908c69ee03a270db79fbc957a41407fcfaf3a7d459639535798da2b6be009`) → EXCLUDED_FROM_POSITIVE_LORE

---

## 5. Research Ledger (Consensus Reports R1–R8 / E1–E8)

All 46 files in `/home/amdy/Downloads/reports/plano de pesquisa` were cataloged with SHA-256 and size. Theoretical adaptations are bound to local experiments E1–E8:

- **E1 (R1 Self-Instruct)**: Seeded synthetic tasks from verified canon seeds. Compare deterministic templates against bounded local generation on frozen splits.
- **E2 (R2 Datasheets for Datasets)**: Provenance sidecar connecting every exported row to immutable source spans; test source revocation exclusion.
- **E3 (R3 Oracle Theory / Q6)**: Metamorphic fault injection (negation flips, entity direction, route legality, unit scaling); adversarial controls.
- **E4 (R4 Truth Maintenance / Q10)**: Strict tracking of candidate vs approved vs contested vs superseded claims; preserve narrator vs persona scopes.
- **E5 (R5 Prompt Compression / Q11)**: Strict evaluation of full text vs L0/L1 summaries; zero corruption of numeric attributes or negation.
- **E6 (R6 Authority Attenuation / Q13)**: Secret canary injection outside actor visibility; prove zero secret leakage into persona exports.
- **E7 (R7 Bounded Options / Q15)**: Simulation oracles with initiation preconditions, resource accounting, step bounds, and failure receipts.
- **E8 (R8 Test-Time Compute / Q12)**: Preregistered attempt limits; deterministic verification independent of generator self-scores.

---

## 6. Exact Decision Required for Authority Resolution

To unlock downstream mutation frames (01 through 09), the human project lead or authorized governance must apply the following resolution:

1. **Update `.agents/workspace/projects.json`**:
```json
{
  "id": "kad-rpg",
  "name": "KAD RPG",
  "path": "kad-rpg",
  "kind": "SIDE_PROJECT",
  "git_root": ".",
  "default_branch": "main",
  "instruction_entrypoint": "README.md",
  "authority_entrypoints": ["README.md"],
  "status_command": "git status --short",
  "validation_command": "python -m unittest discover kad-gaya/tests",
  "agent_enabled": true,
  "notes": "Nested repository for As Crônicas de Gaya data-scraping pipeline and game construction."
}
```

2. **Register Workpackages in `.agents/work/`**:
Register `WP-GAYA-DATASET-G1-00.json` through `WP-GAYA-DATASET-G1-09.json` targeting `project: "kad-rpg"` with `fixed_point: "0389137746b0e92a34013e7cf72abfbf0679c1e4"`.

Once registered, frames 01–09 can be claimed and executed sequentially.
