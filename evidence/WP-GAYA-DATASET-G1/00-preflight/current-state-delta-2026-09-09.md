# Current-State Delta Receipt — WP-GAYA-DATASET-G1-00

**Artifact:** `evidence/WP-GAYA-DATASET-G1/00-preflight/current-state-delta-2026-09-09.md`  
**Timestamp:** 2026-09-09T01:46:34Z  
**Preflight Reference:** `evidence/WP-GAYA-DATASET-G1/00-preflight/preflight-report.json` (2026-09-08T22:21:00Z)  
**Refactor Reference:** `evidence/GAYA-DATASET-WP-REFACTOR-001/review.json` (2026-09-09T01:45:00Z)  
**Status:** `PREFLIGHT_DELTA_OBSERVED_READONLY`  
**Epistemic Class:** `OBSERVED_DETERMINISTIC`  

---

## 1. Item-by-Item Delta Observation Table

| Item | Observation Command | Observed State | Timestamp | Status vs Preflight | Notes |
|---|---|---|---|---|---|
| **Project Registry (`kad-rpg`)** | `node bin/workctl projects` | `id: kad-rpg-unknown`, `kind: UNKNOWN`, `agent_enabled: false` | 2026-09-09T01:46:34Z | `UNCHANGED_SINCE_PREFLIGHT` | Project remains unclassified; mutation blocked by workctl contract |
| **Project Registry (`kad-pi`)** | `node bin/workctl projects` | `id: kad-pi`, `kind: PRIMARY`, `agent_enabled: true` | 2026-09-09T01:46:34Z | `UNCHANGED_SINCE_PREFLIGHT` | Primary workspace container active |
| **Active Claims** | `node bin/workctl status` | 1 active claim: `WP-GAME-STACK-001` on `kad-pi` (`tools/game-stack`, `evidence/WP-GAME-STACK-001`) | 2026-09-09T01:46:34Z | `UNCHANGED_SINCE_PREFLIGHT` | Active claim does not touch Gaya dataset paths |
| **`kad-rpg` Git HEAD** | `git -C kad-rpg rev-parse HEAD` | `0389137746b0e92a34013e7cf72abfbf0679c1e4` | 2026-09-09T01:46:34Z | `UNCHANGED_SINCE_PREFLIGHT` | Clean git tree, default branch `main`, remote `origin` |
| **`kad-rpg` Git Status** | `git -C kad-rpg status --short` | `CLEAN` (empty output) | 2026-09-09T01:46:34Z | `UNCHANGED_SINCE_PREFLIGHT` | Zero corpus or pipeline files modified |
| **Workspace Git HEAD** | `git rev-parse HEAD` | `3a0b5b0f2cb11ed00b65ef8da7bb49c309c42af5` | 2026-09-09T01:46:34Z | `CHANGED` | Workspace HEAD observed at current commit |
| **Python Runtime** | `python3 --version` | `Python 3.12.14` (Clang 22.1.3) | 2026-09-09T01:46:34Z | `UNCHANGED_SINCE_PREFLIGHT` | Stdlib document parsers operational |
| **Document Binaries** | `which pdftotext soffice tesseract` | `/usr/bin/pdftotext`, `/usr/bin/soffice`, `/usr/bin/tesseract` | 2026-09-09T01:46:34Z | `UNCHANGED_SINCE_PREFLIGHT` | All required extraction binaries available |
| **TCP Ports** | Direct TCP connect (timeout 0.2s) | Port 8000: `OPEN` (SillyTavern)<br>Ports 11434, 8080, 5000, 1234: `CLOSED` | 2026-09-09T01:46:34Z | `UNCHANGED_SINCE_PREFLIGHT` | Local frontend preserved; no local LLM service running |
| **Corpus Source Stability** | Re-hash 21 source files from manifest | 21 checked, 21 MATCH, 0 DIFF, 0 MISSING | 2026-09-09T01:46:34Z | `UNCHANGED_SINCE_PREFLIGHT` | 100% source stability verified |
| **Deliverable Fingerprints** | Re-hash 6 deliverable files from manifest | 2 UNCHANGED (`CSA-GAYA-DATASET-001.md`, `RESEARCH-MAP.md`)<br>4 `REFACTORED_BY_WP_REFACTOR_001` (`workpackages.json`, `WORKPACKAGES.md`, `PROMPT-GEMINI-BUILDER.md`, `ISA-GAYA-DATASET-G1-001.md`) | 2026-09-09T01:46:34Z | `CHANGED` | Refactored plan files match `evidence/GAYA-DATASET-WP-REFACTOR-001/review.json` outputs_after |
| **Native ISA Lint** | `node bin/kad-isa lint docs/gaya/dataset-generation/ISA-GAYA-DATASET-G1-001.md` | Exit code 1: 11 unregistered validator IDs (`gaya.dataset.*`) | 2026-09-09T01:46:34Z | `UNCHANGED_SINCE_PREFLIGHT` | Expected initial condition preserved; no gate weakening |

---

## 2. Refactored Plan Fingerprints (GAYA-DATASET-WP-REFACTOR-001)

| Plan File | Current SHA-256 Digest | Historical Manifest Digest | Classification |
|---|---|---|---|
| `docs/gaya/dataset-generation/CSA-GAYA-DATASET-001.md` | `b7f59f8927b727cd070bb81b6567109ebcd62f022cb2f1457d3ed5ea663f9122` | `b7f59f8927b727cd070bb81b6567109ebcd62f022cb2f1457d3ed5ea663f9122` | `UNCHANGED` |
| `docs/gaya/dataset-generation/RESEARCH-MAP.md` | `f19004c0e2f356ef10bcdd968204f8b8860550961d345f0a855ecdfca3a94514` | `f19004c0e2f356ef10bcdd968204f8b8860550961d345f0a855ecdfca3a94514` | `UNCHANGED` |
| `docs/gaya/dataset-generation/ISA-GAYA-DATASET-G1-001.md` | `29384e5779ab7ef4df483a86af32aa63ad2ee73471a8a1291326584430810b76` | `bea676b519dac4e2f676a0eeea2713b7451dc72f997ee2b3b94a42c9db4af0e1` | `REFACTORED_BY_WP_REFACTOR_001` |
| `docs/gaya/dataset-generation/workpackages.json` | `a58414a00c33e36047a28303b5d27e9bb6659cdf0e7da5810d7880fc5f3a6a8e` | `8148f7ffd951d44907cee722b18498864bdd298fa698621a005320a98b1e56d3` | `REFACTORED_BY_WP_REFACTOR_001` |
| `docs/gaya/dataset-generation/WORKPACKAGES.md` | `559baa63ed709ae6e3dcd02e35856f69adf4a5d4493fac227f359612ed271110` | `72b53cecc461378d2833a3b354634fca3b4cdefe50b9676b1244175ec25cf6b8` | `REFACTORED_BY_WP_REFACTOR_001` |
| `docs/gaya/dataset-generation/PROMPT-GEMINI-BUILDER.md` | `da5f41cb177cb1f8b46e409c57bfd5f9f84074e4d738e8d1e7c9e6eaa859135a` | `743a3e9aa54eb6ae0f47fd2815fb7eb7d535b34eba4690f98466084b28c71c00` | `REFACTORED_BY_WP_REFACTOR_001` |
