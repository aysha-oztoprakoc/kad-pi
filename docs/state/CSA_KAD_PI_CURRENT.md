# KAD-PI Current State Artifact (CSA)

**Schema**: `kad.csa/v1` · **State**: `CURRENT` · **Generated**: 2026-09-08T21:09:01Z
**Evidence cutoff**: `1a738b5d36276f5eb0f011bf83eac39a294a202d` (OMP economical cascade + memory/autolearn/extended-context)

> This is the empirically observed current state, not intent. Machine source: `CSA_KAD_PI_CURRENT.json`. Every fact carries provenance (`state_class` + `evidence`).

## Repository
| Field | Value | Class |
|---|---|---|
| HEAD | `1a738b5` | VERIFIED_CURRENT |
| Branch | `main` | VERIFIED_CURRENT |
| Remote | `https://github.com/aysha-oztoprakoc/kad-pi.git` (HEAD `2f2ae35`) | VERIFIED_CURRENT |
| Divergence | `1` (ahead, unpushed) | VERIFIED_CURRENT |
| Dirty | `true` (parallel WPs: game-stack, gaya, telemetry, projections, skills) | VERIFIED_CURRENT |

## Hosts
- **AMDY**: Ryzen 7 7700 (16 threads), ~14 GiB RAM, Navi 44 RX 9060 XT + Raphael iGPU. VRAM/ROCm `UNKNOWN`.
- **TELL**: `UNKNOWN` (known_hosts alias only; no live probe).

## Harnesses
- **OMP** `18.1.14` (mise), project `.omp/config.yml`, global `~/.omp/agent/config.yml`. Settings schema source `UNKNOWN` (binary-only install).
- **OMP project settings**: `memory.backend=mnemopi`, `autolearn=true`, `extendedContext=true`.
  - Baseline agentic: `deepseek-v4-flash` (default), `gpt-5.6-luna` (task), `gemini-3.8-flash` (advisor/designer/vision).
  - Planning/architecture: `deepseek-v4-pro` (plan), `gpt-5.6-terra` (slow), `gemini-3.1-pro` (verifier/research), `gpt-5.6-terra:max` (oracle).
  - Local-first: `smol -> kad-local-qwen`, `librarian -> @local_retrieval`, `rpg -> rp-hero`.
  - Fallback cascade: retry enabled, model fallback on, `cooldown-expiry` revert.
- **Pi**: reference/portable worker adapter (`tools/kad/pi/`, `.pi/`).

## KnowledgePlane
- **Vault** (`vault/`) canonical doctrine; **OpenViking** LIVE `127.0.0.1:1933` v0.4.17 (non-authoritative substrate); context compiler + economy; projections derived/rebuildable.
- Context: `extendedContext` enabled; `contextPromotion` (overflow target) disabled; compaction `snapcompact@70%`.

## Skills
15 canonical (ISA-KAD-SKILL-ROLE-002) · 39 lockfile · 49 surface dirs · 16 `LOCAL_DELTA` (expected). Dual lockfile (root vs `.agents/workspace`).

## Plugins
Marketplace `claude-plugins-official` (catalog added; no plugins installed). Extensions: `kad-control-plane`, `kad-context-economy`. MCP: `context7` via `npx`.

## Compute
Router `economic-router.mjs` (DETERMINISTIC → … → HUMAN). Local: Stheno `:5001` DOWN, Qwen `:5002` DOWN (VOLATILE; `bin/kad-serve` not running). Remote: deepseek-v4-flash/pro, gpt-5.6-luna/terra, gemini-3.8-flash/3.1-pro, zai-free glm-4.7-flash.

## Security
Governance in `tools/kad/governance/`. **Authority-inversion risk**: `context7` MCP via `npx` (fetches remote code). Local endpoints auth:none (localhost).

## Unknowns
TELL reachability · GPU VRAM/ROCm · local model servers down cause (5001/5002) · OMP settings schema source.

## Deviations
Project `.omp/config.yml` now aligns with global mnemopi/autolearn toggles (was divergent) · dual lockfiles · `.dsh-ptc-canary/` placeholder · two OMP binaries.
