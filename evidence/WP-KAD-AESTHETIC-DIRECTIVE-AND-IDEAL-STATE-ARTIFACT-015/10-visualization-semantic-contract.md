# Visualization Semantic Contract - WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015

## 1. Multi-Redundant Visual Encoding
Visual representations of state, epistemic authority, and system health must NEVER rely on color hue alone. Every visualization across Sofia v3 (Cytoscape/ECharts), desktop HUDs, and documentation diagrams must use 4-way redundant cues:
1. **Color (Hue)**
2. **Border Style (Solid, Dashed, Dotted)**
3. **Badge / Text Label (`[CANONICAL]`, `[PASS]`, etc.)**
4. **Geometric Shape (Circle, Diamond, Square, Hexagon)**

---

## 2. Epistemic & State Mapping Specification

| State / Tier | Color Token | Border Style | Badge Text | Node Shape | Cytoscape / ECharts Spec |
|---|---|---|---|---|---|
| **`EXPLICIT_CANONICAL`** | Sanctity Gold (`#e7ba72`) | `2px solid` | `[CANONICAL]` | Ellipse / Solid Circle | `shape: 'ellipse', border-color: '#e7ba72', border-width: 2` |
| **`DETERMINISTIC_DERIVED`** | Diagnostic Cyan (`#68d5e8`) | `2px dashed` | `[DERIVED]` | Diamond / Rhombus | `shape: 'diamond', border-color: '#68d5e8', border-style: 'dashed'` |
| **`HEURISTIC_SUGGESTION`** | Advisory Amber (`#f0c36d`) | `2px dotted` | `[HEURISTIC]` | Hexagon | `shape: 'hexagon', border-color: '#f0c36d', border-style: 'dotted'` |
| **`UNKNOWN_STATUS`** | Muted Faint (`#9da5b2`) | `1px dashed` | `[UNKNOWN]` | Hollow Rectangle | `shape: 'rectangle', border-color: '#515d70', opacity: 0.7` |
| **`VERIFIED_PASS`** | Qualified Green (`#79d69a`) | `2px solid` | `[PASS]` | Rounded Rectangle | `shape: 'round-rectangle', border-color: '#79d69a'` |
| **`DEGRADED_PARTIAL`** | Warning Amber (`#f0c36d`) | `2px dashed` | `[DEGRADED]` | Triangle / Cut Rectangle | `shape: 'triangle', border-color: '#f0c36d'` |
| **`BLOCKED_FAIL`** | Emergency Red (`#f05252`) | `2px solid` | `[FAIL]` | Octagon / Red Glow | `shape: 'octagon', border-color: '#f05252', background-color: '#2b0d12'` |
| **`HISTORICAL_ARCHIVE`** | Abyssal Purple (`#c084fc`) | `1px solid` | `[ARCHIVED]` | Barrel / Muted Node | `shape: 'barrel', border-color: '#c084fc', opacity: 0.6` |

---

## 3. Interaction & Selection Semantics
- **Active Selection**: Node border highlights with `--line-hot: #68d5e8` or `--gold: #e7ba72` with 1-hop neighbor edge illumination.
- **Traversal / Path Exploration**: Active traversal paths pulse once (200ms duration) and remain highlighted in solid cyan (`#68d5e8`).
- **Telemetry HUD Meters**: Monospace percentage meters with 3-segment color thresholds (<70% Green, 70–90% Amber, >90% Red).
