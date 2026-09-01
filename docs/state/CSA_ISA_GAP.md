# CSA ↔ ISA Gap Model

**Schema**: `kad.csa-isa-gap/v1` · **CSA**: `CSA_KAD_PI_CURRENT.json` · **ISA**: `docs/architecture/KAD_PI_IDEAL_STATE_V2.md`

| Gap | Domain | Owner | Ownership | Action |
|---|---|---|---|---|
| GAP-CSA-001 | STATE_MODEL | WP-041 | OWNED_BY_WP041 | generate CSA |
| GAP-GAPMODEL-002 | STATE_MODEL | WP-041 | OWNED_BY_WP041 | generate gap model |
| GAP-SETTINGS-003 | OMP_SETTINGS | WP-041 | OWNED_BY_WP041 | generate settings matrix |
| GAP-SKILLRAT-004 | SKILLS | successor | PROPOSE_SUCCESSOR_WP | propose `WP-KAD-SKILL-RATIONALIZATION-*` |
| GAP-CONTRADICT-005 | KNOWLEDGE_PLANE | WP-040 | EXISTING_SUCCESSOR_WP | route to contradiction journal |
| GAP-STCSANDBOX-006 | SECURITY | WP-033 | EXISTING_SUCCESSOR_WP | route to STC sandbox hardening |
| GAP-PONBUS-007 | NOTIFICATION | WP-019 | EXISTING_SUCCESSOR_WP | route to SSE transport |
| GAP-PTC-008 | TOOLS | none | NO_ACTION_REQUIRED | classify SUPERSEDED |
| GAP-CONTEXT7-009 | SECURITY | human | HUMAN_DECISION_REQUIRED | pin/audit/vendor/remove |
| GAP-GLOBALCFG-010 | OMP_SETTINGS | human | HUMAN_DECISION_REQUIRED | characterize divergence |
| GAP-TELL-011 | COMPUTE | EXP-TELL-005 | EXISTING_SUCCESSOR_WP | reverify + route |

Machine source: `CSA_ISA_GAP.json` (each gap carries `current`, `target`, `evidence`, `acceptance_test`).
