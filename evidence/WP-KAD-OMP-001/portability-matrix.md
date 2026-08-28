| KAD artifact | Current location | OMP support | Action / classification |
|---|---|---|---|
| Constitution | `PRIME_DIRECTIVE.md` | `.omp/AGENTS.md` context | THIN_ADAPTER; pointer, not duplication |
| Hard invariants | PRIME + accepted evidence | `.omp/RULES.md` | THIN_ADAPTER; short sticky rules |
| Matt/KAD skills | `.agents/skills` | OMP `agents` provider | REUSE_IN_PLACE; no copy |
| Pi agents | `.pi/agents` | `.omp/agents` contract | THIN_ADAPTER for world only; others DEFER |
| Local models | KAD STC/KoboldCpp | custom `models.yml` provider | THIN_ADAPTER; endpoint remains KAD-owned |
| Economic router | `tools/kad/local-router.mjs`, evidence policy | semantic roles | KAD_NATIVE_SUPERIOR; no second router |
| Distillation | `tools/kad/episode.mjs`, evidence | telemetry can be bridged | DEFER; no new database |
| Tests | root Makefile / `kad-lab` | shell/tool reuse | REUSE_IN_PLACE |
| Provider auth | external harnesses | OMP supported login only | DEFER; no token copying |
