# Semantic Visual Language - WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015

## 1. Core Visual Paradigm: Cyberpunk 2077 Terminal & Occult Precision
The KAD visual language fuses high-density diegetic cyberdeck terminal interfaces (inspired by Cyberpunk 2077 database and dataterm UIs) with clinical bureaucratic precision and sacred/geometric state anchors.

---

## 2. Color Roles & Palette Architecture

### A. Surface & Structural Framing
- `surface.canvas`: Deepest structural void (`#050608` / `#0a0b0f`).
- `surface.panel`: Primary panel / viewport background (`#10131a` / `#151923`).
- `surface.crimson`: Oxblood / dark crimson accent field (`#1a080a` / `#2b0d12` / `#3d121a`), used for active viewports, HUD headers, and contextual backdrops.
- `surface.lift`: Elevated container / popout backdrop (`#1b202b` / `#24141a`).

### B. Typography & Text Contrast
- `text.primary`: High-contrast electric cyan / ice blue (`#68d5e8` / `#7dd3fc` / `#38bdf8`) on dark crimson/ink surfaces; or bone paper (`#e7e8e6`) for standard reading literature.
- `text.secondary`: Muted cyberdeck blue-gray (`#9da5b2` / `#94a3b8`).
- `text.faint`: De-emphasized metadata / timestamp ink (`#515d70` / `#64748b`).

### C. Semantic Status & Epistemic Tiers
- `semantic.canonical`: Restrained Sanctity Gold (`#e7ba72` / `#fbbf24`) — indicates immutable authority, accepted doctrine, and canonical vault records.
- `semantic.derived`: Diagnostic Cyan (`#68d5e8` / `#38bdf8`) — indicates deterministic derived projections, verifiable indices, and runtime observations.
- `semantic.heuristic`: Advisory Amber (`#f0c36d` / `#f59e0b`) — indicates probabilistic synthesis, recommendations, or degraded non-fatal states.
- `semantic.pass`: Verified Green (`#79d69a` / `#4ade80`) — indicates passed test suites, qualified models, and healthy daemons.
- `semantic.fail`: Cost / Emergency Red (`#f05252` / `#ef4444` / `#a72b35`) — indicates errors, test failures, blocked tasks, and irreversible operations.
- `semantic.historical`: Abyssal Purple (`#c084fc` / `#a855f7`) — indicates superseded milestones, archived workpackages, and historical precedents.

---

## 3. Geometry, Framing & Chamfers
- **Borders**: Sharp 1px–2px structural lines (`--line: #303746`, `--line-hot: #68d5e8`).
- **Corners**: Brutalist 2px radius (`--radius: 2px`) or 45-degree cyberdeck chamfer cuts (`clip-path: polygon(...)`) on primary modal corners and panel titles.
- **Grids & Density**: Dense tabular alignments, fixed monospace columns, compact 4px–12px padding scales.
- **Texture**: Subtle background dot-matrix / grid overlays; scanlines and chromatic distortion are permitted strictly as transient diagnostic feedback during fault/error states.

---

## 4. Typography Hierarchy & Roles
- **Primary Interface & Monospace**: `ui-monospace`, `SFMono-Regular`, `JetBrains Mono`, `Menlo`, `Liberation Mono`.
- **Prose & Reading**: `Inter`, `ui-sans-serif`, `system-ui`, `-apple-system`, `Roboto`, `Helvetica Neue`.
- **Scale Hierarchy**:
  - `Display / Hero`: `2.5rem` – `4.5rem` (clamp), bold, uppercase, tracked.
  - `Title (H1/H2)`: `1.4rem` – `1.8rem`, uppercase, sharp cyberdeck accent border.
  - `Section (H3/H4)`: `1.0rem` – `1.15rem`, monospace, indexed (`01 // SECTION`).
  - `Body`: `0.9rem` – `1.0rem`, line-height `1.5`–`1.6`.
  - `Telemetry / HUD`: `0.74rem` – `0.86rem`, tabular monospace, uppercase.
