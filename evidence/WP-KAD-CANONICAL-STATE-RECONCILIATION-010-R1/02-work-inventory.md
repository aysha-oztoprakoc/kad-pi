# Bounded `/Work` Project Inventory

## Overview

This inventory records all top-level projects, subprojects, and related repositories discovered in `/home/amdy/Work` and the associated legacy storage `/run/media/amdy/amdy-HDD`. Large vendor artifacts, node_modules, build caches, and model weight blobs are excluded from recursive enumeration.

---

## 1. KAD-PI (Primary Workspace)
- **Project ID**: `kad-pi`
- **Name**: KAD-PI
- **Path**: `/home/amdy/Work`
- **Git Repo**: Yes (`.git`)
- **Remote**: `origin` (`https://github.com/aysha-oztoprakoc/kad-pi.git`)
- **Local HEAD**: `ca1f56a020a3416eeffa3d49f3c34f113b536902`
- **Current Branch**: `main`
- **Tracking**: `origin/main` (ahead by 57 commits)
- **Dirty State**: 12 modified files (pre-existing dirt), 10 untracked files/dirs (pre-existing)
- **Size Class**: ~1.5 GB (excluding large temporary zip archives `ngccli_linux.zip`)
- **Languages**: JavaScript (Node.js ESM), Shell/Bash, Python, Markdown, JSON, YAML
- **Entrypoints**: `PRIME_DIRECTIVE.md`, `CONTEXT.md`, `AGENTS.md`, `Justfile`, `Makefile`
- **Status Evidence**: Primary active repository, 537 passing tests, governed workpackages managed via `workctl`.
- **Relation to KAD-PI**: Self (Core project root)
- **Confidence**: HIGH (CONFIRMED)

---

## 2. DATA_WORKSPACE
- **Project ID**: `data-workspace`
- **Name**: DATA_WORKSPACE
- **Path**: `/home/amdy/Work/data_workspace`
- **Git Repo**: Yes (`data_workspace/.git`)
- **Remote**: None configured locally
- **Local HEAD**: `223df1f935ae555487f3a8daa2fead37fca7032e`
- **Current Branch**: `main`
- **Last Meaningful Commits**:
  - `223df1f` bridge: route M908 actions through native shell IPC
  - `3a9485d` acceptance: record M908 isolation and live limits
  - `b86714b` forensics: prove M908 interface and keypad mappings
- **Dirty State**: Clean
- **Size Class**: ~2.5 MB (source + docs + tests)
- **Languages**: JavaScript (Node.js), Python (M908 adapter), Lua/JSON (shell baselines), Markdown
- **Documentation**: `README.md`, `DATA_WORKSPACE_R1_BUILD_REPORT.md`, `docs/M908_INPUT_FORENSICS.md`
- **Status Evidence**: `npm test` passes (5 tests), `npm run check` passes, M908 input forensics verified live.
- **Relation to KAD-PI**: `DERIVED_FROM` KAD aesthetic principles / `SIDE_PROJECT` (Quickshell M908 desktop widget)
- **Confidence**: HIGH (CONFIRMED)

---

## 3. Technopagan Netrunner
- **Project ID**: `technopagan-netrunner`
- **Name**: Technopagan Netrunner Cyberdeck
- **Path**: `/home/amdy/Work/technopagan-netrunner`
- **Git Repo**: Yes (`technopagan-netrunner/.git`)
- **Remote**: None configured locally
- **Local HEAD**: `53fc4d51930171fa21d1f09cab5ab8dba0faec61`
- **Current Branch**: `theme/technopagan-full-suite` (also has `main`)
- **Last Meaningful Commits**:
  - `53fc4d5` fix(core): reject non-finite agent clocks
  - `e82d4ff` fix(core): clamp agent timestamps
  - `df6615e` docs: record live full-suite acceptance
- **Dirty State**: Clean
- **Size Class**: ~3.8 MB (QML plugins, shell scripts, configs)
- **Languages**: QML (Quickshell 0.3.1), JavaScript, Shell, Python (gnosis_sampler), Markdown
- **Documentation**: `README.md`, `cyberdeck-init.sh`, `install.sh`
- **Status Evidence**: `bash tests/run_all.sh` passing, 13 plugin manifests valid on Omarchy 4.0.1-1.
- **Relation to KAD-PI**: `SIDE_PROJECT` / `PARALLEL_PROJECT` (Desktop shell environment, theme & multi-harness TUI orchestration)
- **Confidence**: HIGH (CONFIRMED)

---

## 4. DeepSeek Harness Lab (Reference)
- **Project ID**: `deepseek-harness-reference`
- **Name**: DeepSeek Harness Lab
- **Path**: `/home/amdy/Work/tries/deepseek-harness-lab`
- **Git Repo**: Yes (`tries/deepseek-harness-lab/.git`)
- **Remote**: `origin` (`https://github.com/deepseek-ai/deepseek-harness.git`)
- **Local HEAD**: `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
- **Current Branch**: `master`
- **Dirty State**: Clean
- **Size Class**: ~1.2 MB
- **Languages**: Python
- **Status Evidence**: Third-party checkout, read-only reference implementation.
- **Relation to KAD-PI**: `REFERENCE` / `INSPIRATION_FOR` (Third-party reference repo; governed under AMDY-003 Decision D8)
- **Confidence**: HIGH (CONFIRMED)

---

## 5. KAD Lab Experiments
- **Project ID**: `kad-lab`
- **Name**: KAD Lab
- **Path**: `/home/amdy/Work/kad-lab`
- **Git Repo**: Tracked within KAD-PI root Git
- **Contents**: `exp-002`, `exp-003-pi-tracer`, `Makefile`, `README.md`
- **Size Class**: ~850 KB
- **Languages**: C, Rust, Python, Makefile
- **Status Evidence**: Historical scratch experiments for Pi session tracing and protocol probing.
- **Relation to KAD-PI**: `COMPONENT_OF` / `EXPERIMENT_FOR` (Early lower-level experimental prototypes)
- **Confidence**: HIGH (CONFIRMED)

---

## 6. KAD RPG Notes
- **Project ID**: `kad-rpg`
- **Name**: KAD RPG Design & Aesthetic Mapping
- **Path**: `/home/amdy/Work/kad-rpg`
- **Git Repo**: Tracked within KAD-PI root Git
- **Contents**: `CURRENT_THEME_AUDIT.md`, `KAD_AESTHETIC_MAP.md`, `M908_INPUT_MAP.md`, `ROADMAP.md`
- **Size Class**: ~70 KB
- **Languages**: Markdown
- **Status Evidence**: Design notes created on 2026-08-28 documenting theme mapping, M908 input, and aesthetic rules.
- **Relation to KAD-PI**: `COMPONENT_OF` / `REFERENCE` (Design documentation / aesthetic specifications)
- **Confidence**: HIGH (CONFIRMED)

---

## 7. KAD SillyTavern
- **Project ID**: `kad-sillytavern`
- **Name**: KAD SillyTavern Local Stack
- **Path**: `/home/amdy/Work/kad-sillytavern`
- **Git Repo**: Nested `SillyTavern/.git`
- **Contents**: `RUNBOOK.md`, `download-models.sh`, `verify-stack.sh`, `koboldcpp/`, `models/`, `SillyTavern/`
- **Size Class**: ~150 MB (excluding GGUF weights)
- **Languages**: JavaScript, Shell, Python
- **Status Evidence**: Local runtime stack for GGUF model hosting and manual interaction testing.
- **Relation to KAD-PI**: `ACTIVE_SUPPORTING` / `REFERENCE` (Local model runtime and verification tooling)
- **Confidence**: HIGH (CONFIRMED)

---

## 8. AMDY Platform Evidence
- **Project ID**: `amdy-platform`
- **Name**: AMDY Platform
- **Path**: `/home/amdy/Work/amdy-platform`
- **Git Repo**: Tracked within KAD-PI root Git
- **Contents**: `evidence/`
- **Size Class**: ~50 KB
- **Languages**: Markdown, JSON
- **Status Evidence**: Migration verification evidence from 2026-08-25.
- **Relation to KAD-PI**: `HISTORICAL` / `REFERENCE`
- **Confidence**: HIGH (CONFIRMED)

---

## 9. Presentation & UI Surfaces (site, dashboard, interface)
- **Project ID**: `kad-presentation`
- **Paths**: `/home/amdy/Work/site`, `/home/amdy/Work/dashboard`, `/home/amdy/Work/interface`
- **Git Repo**: Tracked within KAD-PI root Git
- **Status Evidence**: Static HTML/CSS/JS surfaces. Redesign deferred in WP-KAD-STRATEGIC-WAYFINDING-001.
- **Relation to KAD-PI**: `COMPONENT_OF` (Operator dashboards & deferred public site)
- **Confidence**: HIGH (CONFIRMED)

---

## 10. Legacy DATA_REIN (amdy-HDD)
- **Project ID**: `legacy-data-rein`
- **Name**: DATA_REIN Predecessor Repository
- **Path**: `/run/media/amdy/amdy-HDD/data_rein`
- **Git Repo**: Yes (`.git`), HEAD `6ac7390325639624a56809427642a41b6ca28b38`, branch `main`
- **Additional Branches**: `archive/local-main-pre-dsh-20260823`, `migration/dsh-foundation`, `prod-ready`, `snapshot/discovery-001-preflight`
- **Size Class**: ~137 GB gross (including 62 GB Ollama + 31 GB ComfyUI stores)
- **Languages**: Python, Nix, Shell, JavaScript, Markdown
- **Status Evidence**: Inactive predecessor repository on external storage (`amdy-HDD`). Governed by Migration Manifest `AMDY-003-R3` with Decision D10 (`preserve-in-quarantine`) and D9 (`stay-on-hdd`).
- **Relation to KAD-PI**: `PREDECESSOR_OF` KAD-PI (Architectural origin of PON engine, cybernetic aesthetics, Odysseus agent, and context management; isolated from direct canonical authority)
- **Confidence**: HIGH (CONFIRMED)
