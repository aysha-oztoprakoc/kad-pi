# Cross-Surface Token Contract - WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015

## 1. Architectural Model
The KAD Aesthetic Directive is governed by a **Renderer-Neutral Canonical Token Contract**. The canonical tokens reside in the Ideal State Artifact (ISA) and its machine-readable projection, which project deterministically into renderer-specific adapters.

```text
                  KAD AESTHETIC ISA
                          │
                          ▼
            Canonical Token Registry (JSON)
                          │
    ┌─────────────┬───────┴───────┬─────────────┬─────────────┐
    ▼             ▼               ▼             ▼             ▼
Web CSS        QML / QS       Terminal       Mermaid       Obsidian
(tokens.css)   (Theme.qml)   (Omarchy/ANSI)  (Diagrams)   (Bridge CSS)
```

---

## 2. Canonical Token Mapping Matrix

| Canonical Token Key | Semantic Meaning | Web / CSS Variable | QML / Quickshell Property | Terminal Color Slot | Diagram / Hex Value |
|---|---|---|---|---|---|
| `surface.canvas` | Deepest structural field | `--ink-canvas` | `theme.surfaceCanvas` | `color0` (Black) | `#07090e` / `#050608` |
| `surface.panel` | Standard panel background | `--ink-panel` | `theme.surfacePanel` | `color8` (Dark Gray) | `#151923` / `#10131a` |
| `surface.crimson` | Active viewport / oxblood backdrop | `--crimson-plane` | `theme.surfaceCrimson` | Custom 24-bit / Red Tint | `#2b0d12` / `#1a080a` |
| `surface.lift` | Popout / elevated card | `--ink-lift` | `theme.surfaceLift` | `color8` (Lighter) | `#1b202b` / `#24141a` |
| `text.primary` | High-contrast data / cyan text | `--cyan` / `--paper` | `theme.textPrimary` | `color14` (Bright Cyan) | `#68d5e8` / `#e7e8e6` |
| `text.secondary` | Muted supporting text | `--muted` | `theme.textSecondary` | `color7` (Gray) | `#9da5b2` / `#94a3b8` |
| `text.faint` | Timestamps / de-emphasized lines | `--line-hot` | `theme.textFaint` | `color8` (Line) | `#515d70` / `#64748b` |
| `semantic.canonical` | Authority / accepted governance | `--gold` | `theme.semanticCanonical` | `color11` (Bright Yellow) | `#e7ba72` / `#fbbf24` |
| `semantic.derived` | Deterministic synthesis / index | `--cyan` | `theme.semanticDerived` | `color6` (Cyan) | `#68d5e8` / `#38bdf8` |
| `semantic.heuristic` | Probabilistic / degraded state | `--amber` | `theme.semanticHeuristic` | `color3` (Yellow/Amber) | `#f0c36d` / `#f59e0b` |
| `semantic.pass` | Verified / qualified / healthy | `--green` | `theme.semanticPass` | `color10` (Bright Green) | `#79d69a` / `#4ade80` |
| `semantic.fail` | Error / blocked / cost | `--red` | `theme.semanticFail` | `color9` (Bright Red) | `#f05252` / `#ef4444` |
| `semantic.historical`| Superseded / archived | `--purple` | `theme.semanticHistorical` | `color13` (Bright Magenta) | `#c084fc` / `#a855f7` |
| `line.base` | Structural separator border | `--line` | `theme.lineBase` | Standard border | `#303746` (1px solid) |
| `line.focus` | Accessible focus ring | `--focus-ring` | `theme.lineFocus` | Inverse / Highlight | `#e7ba72` (3px solid) |

---

## 3. Invariants
1. **Traceability**: Every CSS variable, QML property, and terminal escape sequence must trace directly to a canonical token key.
2. **Immutable Semantic Roles**: A token's semantic meaning cannot be altered by a downstream adapter.
3. **Fail-Closed Validation**: `bin/kad-isa check` validates that all active stylesheets and theme configurations conform strictly to this matrix.
