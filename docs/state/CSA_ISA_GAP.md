# CSA ↔ ISA Gap Model

**Schema**: `kad.csa-isa-gap/v1` · **CSA**: `CSA_KAD_PI_CURRENT.json` · **ISA**: `docs/architecture/KAD_PI_IDEAL_STATE_V2.md`

| Gap | Domain | Status | Owner | Ownership | Baseline | Action |
|---|---|---|---|---|---|---|
| GAP-CSA-001 | STATE_MODEL | RESOLVED | WP-041 | OWNED_BY_WP041 | absent before WP-041 | generate CSA |
| GAP-GAPMODEL-002 | STATE_MODEL | RESOLVED | WP-041 | OWNED_BY_WP041 | no machine CSA↔ISA comparison before WP-041 | generate gap model |
| GAP-SETTINGS-003 | OMP_SETTINGS | RESOLVED | WP-041 | OWNED_BY_WP041 | only decision matrix (prose) before WP-041 | generate settings matrix |
| GAP-SKILLRAT-004 | SKILLS | OPEN | successor | PROPOSE_SUCCESSOR_WP | — | propose `WP-KAD-SKILL-RATIONALIZATION-*` |
| GAP-CONTRADICT-005 | KNOWLEDGE_PLANE | OPEN | WP-040 | EXISTING_SUCCESSOR_WP | — | route to contradiction journal |
| GAP-STCSANDBOX-006 | SECURITY | OPEN | WP-033 | EXISTING_SUCCESSOR_WP | — | route to STC sandbox hardening |
| GAP-PONBUS-007 | NOTIFICATION | OPEN | WP-019 | EXISTING_SUCCESSOR_WP | — | route to SSE transport |
| GAP-PTC-008 | TOOLS | SUPERSEDED | none | NO_ACTION_REQUIRED | — | classify SUPERSEDED |
| GAP-CONTEXT7-009 | SECURITY | OPEN | human | HUMAN_DECISION_REQUIRED | — | pin/audit/vendor/remove |
| GAP-GLOBALCFG-010 | OMP_SETTINGS | OPEN | human | HUMAN_DECISION_REQUIRED | — | characterize divergence |
| GAP-TELL-011 | COMPUTE | UNKNOWN | EXP-TELL-005 | EXISTING_SUCCESSOR_WP | — | reverify + route |

Machine source: `CSA_ISA_GAP.json` (each gap carries `current`, `target`, `evidence`, `status`, `baseline`, `acceptance_test`).
