# Deterministic Project Lineage Map

## Evidence-Gated Lineage Graph

```text
                                [ DATA_REIN (amdy-HDD) ]
                                (Historical Predecessor)
                                           │
                        ┌──────────────────┴──────────────────┐
                        │ (Inspiration / PON / Architecture)  │ (Visual Grammar / M908)
                        ▼                                     ▼
                   [ KAD-PI ]                     [ technopagan-netrunner ]
                (Primary Workspace)               (Omarchy Cyberdeck Suite)
                        │                                     │
           ┌────────────┴────────────┐                        │ (Quickshell sibling derivation)
           ▼                         ▼                        ▼
  [ Governed Vault ]       [ KAD Lab / Exp ]          [ data_workspace ]
(Canonical Knowledge)      (Pi Tracer Scratch)       (M908 Input & Controls)
```

---

## Lineage Relations Matrix

| Source Project | Target Project | Relation | Epistemic Basis | Evidence Source |
|---|---|---|---|---|
| `legacy-data-rein` | `kad-pi` | `PREDECESSOR_OF` | `CONFIRMED` | `AMDY-003-R3` manifest M-001, `PRIME_DIRECTIVE.md`, `OFFICIAL_SOL_REVIEWER_HANDOFF_DREAM_SETUP_R2.md` |
| `legacy-data-rein` | `technopagan-netrunner` | `INSPIRATION_FOR` | `CONFIRMED` | `technopagan-netrunner/README.md` (dialectic/gnostic framing, cyberdeck layout) |
| `technopagan-netrunner` | `data-workspace` | `PREDECESSOR_OF` | `CONFIRMED` | `data_workspace/DATA_WORKSPACE_R1_BUILD_REPORT.md` (Omarchy 4 plugin baseline, input mapping) |
| `kad-pi` | `data-workspace` | `INSPIRATION_FOR` | `CONFIRMED` | `data_workspace/README.md` ("derived from KAD corpus; does not import/mutate KAD canon") |
| `deepseek-harness` | `kad-pi` | `INSPIRATION_FOR` | `CONFIRMED` | `AMDY-003-R3` Decision D8 (`reference-selective-integration`) |
| `kad-lab` | `kad-pi` | `EXPERIMENT_FOR` | `CONFIRMED` | Directory within repository; contains `exp-002`, `exp-003-pi-tracer` |
| `kad-rpg` | `kad-pi` | `COMPONENT_OF` | `CONFIRMED` | Directory within repository; theme audits and aesthetic maps |
| `kad-sillytavern` | `kad-pi` | `ACTIVE_SUPPORTING` | `CONFIRMED` | Directory within repository; local model hosting runbooks |

---

## Lineage Invariant Statements

1. **DATA_REIN is NOT KAD-PI**: `DATA_REIN` was the monolithic predecessor project on `amdy-HDD`. It was quarantined under `AMDY-003-R3` Decision D10 to prevent unreviewed legacy activation.
2. **data_workspace is NOT DATA_REIN**: `data_workspace` is a lightweight Omarchy 4 desktop plugin specifically created for Redragon M908 12-button keypad mapping and quickshell control widgets. It is derived from `technopagan-netrunner` and KAD aesthetic principles.
3. **technopagan-netrunner is a Desktop Suite**: It is an independent Omarchy 4 Quattro shell and theme suite. It does not own KAD architecture or mutate the canonical vault.
