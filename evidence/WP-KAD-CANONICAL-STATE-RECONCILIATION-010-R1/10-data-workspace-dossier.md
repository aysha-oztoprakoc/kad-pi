# Canonical Historical Dossier: DATA_WORKSPACE

## 1. Identity
- **Project Name**: `DATA_WORKSPACE`
- **Location**: `/home/amdy/Work/data_workspace`
- **Git HEAD**: `223df1f935ae555487f3a8daa2fead37fca7032e`
- **Current Branch**: `main`
- **Build Status**: `DATA_WORKSPACE_R1_PARTIAL` (Commit `223df1f`)

---

## 2. Goal
Build an independent, native Omarchy 4 / Quickshell plugin that maps the Redragon M908 12-button side keypad to discrete actions (`data.invoke.01` … `data.invoke.12`) and exposes a 3-column control widget in the desktop bar.

---

## 3. Architecture
- **Hardware Adapter**: `tools/m908_adapter.py` reading Linux input events from `/dev/input/event3` (interface-01, codes `2..11, 78, 74`).
- **Native Action Bridge**: Emits actions via `omarchy-shell` native IPC directly to `plugins/data_workspace`.
- **UI Surface**: QML bar widget with a 12-slot popup control matrix.
- **Isolation**: Physical keys map only to scoped action IDs; standard keyboard numbers and keypad keys remain unaffected.

---

## 4. Technologies
- **Runtime**: Omarchy 4.0.1-1, Quickshell 0.3.1, Hyprland 0.56.2 on Arch Linux.
- **Languages**: JavaScript (Node.js for test harness), Python 3 (evdev adapter), QML, Lua/JSON.

---

## 5. Experiments & Results
- **M908 Input Forensics**: Observed that the Redragon M908 keypad operates on `interface-01` (`event3`), emitting keycodes `2..11, 78, 74`.
- **Keyboard Isolation Verification**: Confirmed that ordinary keyboard keypad strokes (`KP_1` … `KP_0`) do not trigger `data.invoke` actions.
- **Native IPC Direct Calls**: Direct IPC calls returned `ok` for all valid action targets and cleanly rejected invalid actions (`data.invoke.13` -> `invalid-action`).

---

## 6. Relationship to KAD-PI
- **Lineage**: `DERIVED_FROM` KAD aesthetic principles and `technopagan-netrunner` plugin foundation; classified as `SIDE_PROJECT` in `projects.json`.
- **Boundary**: Does NOT import, mutate, or publish KAD canonical knowledge. Operates purely as a desktop environment utility.

---

## 7. Current Status
`ACTIVE` / `SIDE_PROJECT` (Foundation validated, background daemon integration pending future desktop phase).

---

## 8. Reusable Assets vs Deprecated
- **Reusable**:
  - Validated M908 input forensics mapping table (`docs/M908_INPUT_FORENSICS.md`).
  - Native Omarchy 4 plugin manifest and IPC bridge contracts.
- **Non-reusable / Deprecated**:
  - Temporary foreground adapter script (requires future systemd user service for permanent autostart).

---

## 9. Known UNKNOWNs
- Future mapping of 12 actions to specific KAD workflows (provisional taxonomy only).
