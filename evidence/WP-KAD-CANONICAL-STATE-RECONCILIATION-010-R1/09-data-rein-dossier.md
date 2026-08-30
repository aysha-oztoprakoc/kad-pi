# Canonical Historical Dossier: DATA_REIN

## 1. Identity
- **Project Name**: `DATA_REIN` / `data_rein`
- **Location**: `/run/media/amdy/amdy-HDD/data_rein` (External HDD `amdy-HDD`, UUID `9d31735a-9d6b-463a-8350-f039c8ecdc02`)
- **Historical Git HEAD**: `6ac7390325639624a56809427642a41b6ca28b38`
- **Primary Branch**: `main`
- **Additional Branches**: `archive/local-main-pre-dsh-20260823`, `migration/dsh-foundation`, `prod-ready`, `snapshot/discovery-001-preflight`

---

## 2. Goal
DATA_REIN attempted to build an all-encompassing cybernetic AI workstation environment, combining multi-agent orchestration (`odysseus`, `skills`), visual generative pipelines (`ComfyUI`, `flux1-schnell`), local LLM inference (`Ollama`, `ai_models`), NixOS environment packaging (`flake.nix`), prompt optimization, and desktop environment automation.

---

## 3. Architecture
Monolithic multi-domain repository structure containing:
- `odysseus/`: Autonomous agent daemon and environment.
- `sofia3/`: Early web/visual interface prototypes.
- `native/reins-pon-engine`: Low-level C/C++ PON causal engine gitlink/module.
- `knowledge_base/` and `wiki_vault/`: Early un-governed Markdown notes.
- `DATA/`: Sub-repositories and data stores (`kad-1.0/odysseus`).
- `ComfyUI/` and `ai_models/`: Large local model stores (~93 GB).
- `amdy-omarchy4-handoff-v1/`: System handoff and desktop integration configs.

---

## 4. Technologies
- **Languages**: Python (venv, uv, pyproject.toml), C/C++ (native PON), Nix (flakes, nix-cache), Bash/Shell, JavaScript.
- **Inference Backends**: Ollama, ComfyUI, PyTorch.
- **Harnesses**: Odysseus, early OpenCode, early Claude Code scripts.

---

## 5. Observed Outcomes & Lessons
- **Observed Failures**: Monolithic bloat (137 GB), circular symlinks (`.agents/skills/* -> skills/core/*`), secrets mixed into data trees (`.secrets.env`, `.app_key`, `auth.json`), un-governed knowledge decay, and un-bounded agent permissions.
- **Derived Synthesis**: Governed separation of concerns is mandatory. Model stores, secret identities, and un-reviewed agent code must be strictly isolated. Canonical knowledge requires deterministic review gates, not free-form wiki editing.

---

## 6. Relationship to KAD-PI
- **Lineage**: `PREDECESSOR_OF` KAD-PI.
- **Transferred Concepts**:
  - PON (Premise-Operation-Node) causal state engine.
  - STC (Simulated / Tracked Component) lifecycle management.
  - Restrained cybernetic aesthetic grammar (red/dark/instrumented).
- **Explicitly Quarantined / Excluded**:
  - Monolithic codebase and un-reviewed scripts.
  - Model blobs (Ollama/ComfyUI).
  - Un-audited historical wiki notes.
  - Ambient secret files.

---

## 7. Current Status
`QUARANTINED` / `ARCHIVED`
- Governed by Migration Manifest `AMDY-003-R3` under Decision D10 (`preserve-in-quarantine`) and D9 (`stay-on-hdd`).
- Historical artifacts serve as evidence only, never active design authority.

---

## 8. Reusable Assets vs Deprecated
- **Reusable**:
  - PON causal graph concepts and STC lifecycle patterns (formalized cleanly in `kad-pi` under `tools/kad/`).
  - Restrained cybernetic visual grammar.
- **Deprecated / Quarantined**:
  - `odysseus/` legacy runtime.
  - Monolithic `data_rein` python codebase.
  - Legacy `wiki_vault/` and `knowledge_base/` (superseded by `kad-pi/vault/`).

---

## 9. Known UNKNOWNs
- Exact runtime state of older experimental branches (`prod-ready`, `archive/local-main-pre-dsh-20260823`) on `amdy-HDD`. (Non-critical since codebase is quarantined).
