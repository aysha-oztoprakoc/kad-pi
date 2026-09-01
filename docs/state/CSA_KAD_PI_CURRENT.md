# KAD-PI Current State Artifact (CSA)

**Schema**: `kad.csa/v1` · **State**: `CURRENT` · **Generated**: 2026-09-01T18:36:00Z
**Evidence cutoff**: `c029d908d0e902ae2750dd32806bc6557c8d6191` (integration-safe baseline)

> This is the empirically observed current state, not intent. Machine source: `CSA_KAD_PI_CURRENT.json`. Every fact carries provenance (`state_class` + `evidence`).

## Repository
| Field | Value | Class |
|---|---|---|
| HEAD | `c029d90` | VERIFIED_CURRENT |
| Branch | `main` | VERIFIED_CURRENT |
| Remote | `https://github.com/aysha-oztoprakoc/kad-pi.git` (HEAD `c029d90`) | VERIFIED_CURRENT |
| Divergence | `0` (synced) | VERIFIED_CURRENT |
| Dirty | `true` (non-accepted residue: offline-R1, system-atlas, `.omp/config.yml`, projections, journals) | VERIFIED_CURRENT |

## Hosts
- **AMDY**: Ryzen 7 7700 (16 threads), ~14.7 GiB RAM, Navi 44 RX 9060 XT + Raphael iGPU. VRAM/ROCm `UNKNOWN`.
- **TELL**: `UNKNOWN` (known_hosts alias only; no live probe).

## Harnesses
- **OMP** `18.0.11` (mise), project `.omp/config.yml`, global `~/.omp/agent/config.yml` (divergent). Settings schema source `UNKNOWN` (binary-only install).
- **Pi**: reference/portable worker adapter (`tools/kad/pi/`, `.pi/`).

## KnowledgePlane
- **Vault** (`vault/`) canonical doctrine; **OpenViking** LIVE `127.0.0.1:1933` v0.4.17 (non-authoritative substrate); context compiler + economy; projections derived/rebuildable.

## Skills
15 canonical (ISA-KAD-SKILL-ROLE-002) · 39 lockfile · 49 surface dirs · 16 `LOCAL_DELTA` (expected). Dual lockfile (root vs `.agents/workspace`).

## Compute
Router `economic-router.mjs` (DETERMINISTIC → … → HUMAN). Local: Stheno `:5001` UP, Qwen `:5002` DOWN (VOLATILE). Remote: openai-codex/gpt-5.6-luna (SUBSCRIPTION_BACKED), google-antigravity, zai-free.

## Security
Governance in `tools/kad/governance/`. **Authority-inversion risk**: `context7` MCP via `npx` (fetches remote code). Local endpoints auth:none (localhost).

## Unknowns
TELL reachability · GPU VRAM/ROCm · Qwen `:5002` down cause · OMP settings schema source · `.omp/config.yml` default-role owner.

## Deviations
Local `modelRoles.default=null` vs global toggles · dual lockfiles · `.dsh-ptc-canary/` placeholder · two OMP binaries.
