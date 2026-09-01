# WP-041 Reconnaissance Evidence Index

**Workpackage**: `WP-KAD-OMP-METAHARNESS-REFACTOR-041`
**Recon baseline**: `7401b875` (read-only) → integration-safe baseline `c029d90`
**Claim**: `e8d73da8-926e-4c0a-b2d0-62ffa3bcfe05` (actor `deepseek-v4-pro`, base `c029d90`)

## Discovery sources (provenance)

| Observation | Source | Class |
|---|---|---|
| OMP runtime/version | `omp --version` = 18.0.11; binary hash `6513082…` | STABLE_OBSERVED |
| Project config | `.omp/config.yml` hash `9c2e245…` | STABLE_OBSERVED |
| Global config divergence | `~/.omp/agent/config.yml` hash `4a93c0a…` | VOLATILE_OBSERVED |
| Skills | `skills-lock.json` (39), `.agents/skills/` (49), `.agents/workspace/skills.lock.json` | STABLE_OBSERVED |
| Compute | `economic-router.mjs`, `config/local-models.registry.json`, `/proc/cpuinfo` | STABLE_OBSERVED |
| Local models | `curl :5001` UP / `:5002` DOWN | VOLATILE_OBSERVED |
| OpenViking | LIVE `127.0.0.1:1933` v0.4.17 | STABLE_OBSERVED |
| TELL | known_hosts alias only | UNKNOWN |
| GPU VRAM / ROCm | not probed | UNKNOWN |

## Housekeeping integration (repository integrator)

- Committed + pushed accepted WP-031 (`394cf78`) and WP-032 (`c029d90`).
- Preserved immutable WP-032R commits (`7eee4df`, `7401b87`) — pushed, not rewritten.
- Remote verified `origin/main = c029d90`, divergence `0`.
- Non-accepted residue left uncommitted (offline-R1, system-atlas, `.omp/config.yml`, projections, journals).

## Verification receipts

See `docs/state/test/state-artifacts.test.mjs` (run via `node --test docs/state/test/*.test.mjs`) and the final report.
