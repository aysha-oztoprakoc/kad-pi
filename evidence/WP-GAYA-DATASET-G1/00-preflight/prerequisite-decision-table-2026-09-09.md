# Prerequisite Decision Table — Gaya Dataset G1

**Artifact:** `evidence/WP-GAYA-DATASET-G1/00-preflight/prerequisite-decision-table-2026-09-09.md`  
**Timestamp:** 2026-09-09T01:46:34Z  
**Context:** KAD Project Authority Resolution for `ISA-GAYA-DATASET-G1-001`  
**Epistemic Class:** `GOVERNANCE_CONTRACT_REQUIREMENTS`  

---

## 1. Authority Prerequisite Matrix

| Missing Authority / Prerequisite | Affected Frames | Current Observed State & Failure Mode | Permitted Read-Only Continuation | Exact Decision Evidence Required from Human Lead |
|---|---|---|---|---|
| **1. `kad-rpg` Project Enrollment**<br>Enrollment of `kad-rpg` as an authorized mutating project in `.agents/workspace/projects.json`. | **Frames 01 through 08** (all code and pipeline changes in `kad-rpg/kad-gaya/`) | `.agents/workspace/projects.json` records `kad-rpg-unknown` with `kind: "UNKNOWN"` and `agent_enabled: false`.<br>Calling `bin/workctl claim` aborts with `Error: project is not claimable: kad-rpg-unknown`. | Offline test inspection (`python -m unittest discover kad-gaya/tests`), dry-run AST/schema parsing, syntax validation, draft script generation into `evidence/`. **Zero writes to `kad-rpg/`.** | Update `.agents/workspace/projects.json` to enroll `kad-rpg` as a `SIDE_PROJECT`: ```json
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
  "notes": "Nested repository for As Crônicas de Gaya data pipeline and game construction."
}
``` |
| **2. Native Task Registration**<br>Materialization of canonical task JSON files into `.agents/work/`. | **Frames 00 through 09** (complete pipeline) | Frames exist only as proposed specifications in `docs/gaya/dataset-generation/workpackages.json` (`status: "PROPOSED"`, `fixed_point: null`, `native_workctl_registered: false`). No tasks exist in `.agents/work/`. | Drafting native workctl task JSON schemas into review artifacts under `evidence/WP-GAYA-DATASET-G1/00-preflight/`. **Zero writes to `.agents/work/`.** | Human lead writes or promotes the 10 task files `WP-GAYA-DATASET-G1-00.json` through `09.json` into `.agents/work/`, binding Frames 01–08 to `project: "kad-rpg"`, Frames 00 & 09 to `project: "kad-pi"`, and setting `fixed_point: "0389137746b0e92a34013e7cf72abfbf0679c1e4"` for `kad-rpg`. |
| **3. Evidence Staging Architecture**<br>Separation of nested repository code mutation and parent workspace evidence recording. | **Frames 01 through 08** (staged execution) | In `bin/workctl`, a claim on `kad-rpg` cannot own parent workspace paths (`evidence/WP-GAYA-DATASET-G1/*`), and a claim on `kad-pi` cannot mutate `kad-rpg/`. Mixed-root ownership in a single claim throws validation errors in `stc-lease.mjs`. | All intermediate extraction receipts, manifests, and qualification logs are staged inside the nested repository (`kad-rpg/kad-gaya/dataset_runs/staging/`). | Governance approval of the two-tier evidence pattern:<br>1. Frames 01–08 write stage receipts inside `kad-rpg/kad-gaya/dataset_runs/`.<br>2. Final delivery Frame 09 (on `kad-pi`) synchronizes/copies sealed artifacts into parent `evidence/WP-GAYA-DATASET-G1/` and runs workspace-level ISA checks. |
| **4. Local LLM Compute Fabric Admission**<br>Authorization and admission of a local inference daemon. | **Frames 05 and 06** (dialogue synthesis and variation) | TCP ports 11434, 8080, 5000, 1234 are closed. Gemini 3.8 Flash is an engineering builder in OMP; remote teacher inference for data generation is strictly prohibited by Prime Directive. | Rule-based and template-driven deterministic synthesis directly from grounded canon seeds (`pipeline/deterministic.py`). Zero live model inference. | Human lead either:<br>**Option A**: Starts and admits a local LLM daemon (e.g., Ollama or llama.cpp on `127.0.0.1:11434` / `8080`) with approved open model weights (e.g. Qwen 2.5 / Stheno) and records a telemetry lease; **OR**<br>**Option B**: Authorizes purely deterministic seed-compilation for G1 synthesis without live LLM inference. |

---

## 2. Decision Dependency and Unlock Sequence

```
[Human Lead Decision 1: projects.json Enrollment]
                     │
                     ▼
[Human Lead Decision 2: Task Registration in .agents/work/]
                     │
                     ▼
             Unlocks Frame 01 (Contracts & CLI)
                     │
                     ▼
             Unlocks Frame 02 (Corpus Ingestion)
                     │
                     ▼
             Unlocks Frame 03 (Knowledge Extraction)
                     │
                     ▼
             Unlocks Frame 04 (Visual Association)
                     │
                     ▼
[Human Lead Decision 4: LLM Admission / Deterministic Fallback Approval]
                     │
                     ▼
             Unlocks Frames 05 & 06 (Synthesis & Qualification)
                     │
                     ▼
             Unlocks Frame 07 (Exports Generation)
                     │
                     ▼
             Unlocks Frame 08 (Test & Replay Execution)
                     │
                     ▼
[Human Lead Decision 3: Evidence Promotion to Parent Workspace]
                     │
                     ▼
             Unlocks Frame 09 (Release Packaging & Final ISA Acceptance)
```
