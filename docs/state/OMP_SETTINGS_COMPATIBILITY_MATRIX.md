# OMP Settings Compatibility Matrix

**Schema**: `kad.settings-matrix/v1` · **OMP**: `18.0.11` · **Source**: `OMP_SETTINGS_COMPATIBILITY_MATRIX.json`

| Setting | Type | KAD policy | Security | Mutability | Current | Deviation |
|---|---|---|---|---|---|---|
| `modelRoleStorage` | string | KAD_DEFAULT | low | project | `project` | none |
| `modelRoles` | map | KAD_DEFAULT | medium | project | 8 roles (remote+local) | `default: null` |
| `modelTags` | map | PASS_THROUGH | low | project | 6 tags | none |
| `cycleOrder` | list | KAD_WRAPPED | low | project | smol→default→slow | none |
| `enabledModels` | list | KAD_RESTRICTED | medium | project | local-only | none |
| `disabledProviders` | list | KAD_RESTRICTED | medium | project | `[openrouter]` | none |
| `advisor.enabled` | bool | KAD_RESTRICTED | medium | project | `false` | none |
| `memory.backend` | string | KAD_DEFAULT | low | project | `off` | none |
| `autolearn.enabled` | bool | KAD_RESTRICTED | medium | project | `false` | none |
| `contextPromotion.enabled` | bool | KAD_RESTRICTED | medium | project | `false` | none |
| `compaction` | object | KAD_WRAPPED | low | project | snapcompact@70% | none |
| `skills.enabled` | object | KAD_DEFAULT | low | project | enabled, project-only | none |
| `task.agentModelOverrides` | map | KAD_WRAPPED | medium | project | kad-* → roles | none |
| `retry.modelFallback` | object | KAD_WRAPPED | medium | project | enabled + chains | none |

**Global config divergence** (`~/.omp/agent/config.yml`): `REQUIRES_HUMAN_POLICY` — project overrides must win (ADR 0011 §1).

**Unclassified**: none — every applicable setting classified.
