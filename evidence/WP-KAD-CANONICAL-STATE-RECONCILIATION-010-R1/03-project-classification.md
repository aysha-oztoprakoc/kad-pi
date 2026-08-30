# Epistemic Project Classification

## Classification System

Projects are classified along two dimensions:
1. **Strategic Role**: `CORE`, `ACTIVE_SUPPORTING`, `EXPERIMENTAL`, `REFERENCE`, `LEGACY`, `ARCHIVED`, `UNRELATED`, `UNKNOWN`.
2. **Epistemic Class**: `CONFIRMED` (directly evidenced), `OBSERVED` (empirically observed), `DERIVED_SYNTHESIS`, `PROJECT_INFERENCE`, `UNKNOWN`.

---

## Classified Project Register

| Project ID | Name | Strategic Role | Status | Epistemic Class | Relation to KAD-PI |
|---|---|---|---|---|---|
| `kad-pi` | KAD-PI | `CORE` | ACTIVE | `CONFIRMED` | Primary Workspace |
| `data-workspace` | DATA_WORKSPACE | `ACTIVE_SUPPORTING` | ACTIVE | `CONFIRMED` | Sibling desktop widget (M908 mapping) |
| `technopagan-netrunner` | Technopagan Netrunner | `ACTIVE_SUPPORTING` | ACTIVE | `CONFIRMED` | Desktop shell suite & multi-harness TUI |
| `deepseek-harness-reference`| DeepSeek Harness Lab | `REFERENCE` | FROZEN | `CONFIRMED` | Upstream reference clone |
| `kad-lab` | KAD Lab | `EXPERIMENTAL` | HISTORICAL | `CONFIRMED` | Early protocol / tracer experiments |
| `kad-rpg` | KAD RPG Notes | `REFERENCE` | HISTORICAL | `CONFIRMED` | Aesthetic & input specification notes |
| `kad-sillytavern` | KAD SillyTavern | `ACTIVE_SUPPORTING` | ACTIVE | `CONFIRMED` | Local model serving stack & runbooks |
| `amdy-platform` | AMDY Platform Evidence | `LEGACY` | HISTORICAL | `CONFIRMED` | Migration preflight evidence |
| `kad-presentation` | Site / Dashboard / Interface | `CORE` | DEFERRED | `CONFIRMED` | Presentation layer (deferred redesign) |
| `legacy-data-rein` | DATA_REIN (amdy-HDD) | `LEGACY` | QUARANTINED | `CONFIRMED` | Predecessor repository (AMDY-003 D10) |

---

## Authority & Isolation Rules

1. **`kad-pi`**: Single primary authority for KAD specifications, workpackages, and governed knowledge.
2. **`data-workspace` & `technopagan-netrunner`**: Independent git roots; side projects under Omarchy 4; cannot mutate KAD canonical knowledge plane or publish KAD canon.
3. **`legacy-data-rein`**: Quarantined predecessor on external storage (`amdy-HDD`). Historical code and documents serve as evidence only, never active design authority.
4. **`deepseek-harness-reference`**: Upstream third-party code; read-only reference implementation.
