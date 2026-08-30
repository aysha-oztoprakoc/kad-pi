# KAD-PI Current State Record

## 1. Local Implementation State
- **Repository Root**: `/home/amdy/Work`
- **Current HEAD Commit**: `ca1f56a020a3416eeffa3d49f3c34f113b536902`
- **Branch**: `main`
- **Remote**: `origin` (`https://github.com/aysha-oztoprakoc/kad-pi.git`)
- **Remote HEAD Commit**: `27ed3c67016e330b658aa9be2b049b4020912109`
- **Divergence**: 57 commits ahead of `origin/main` (`LOCAL_AHEAD_UNPUSHED`).
- **Workspace Dirt**: Pre-existing tracked dirt and untracked scratch directories preserved intact.

---

## 2. Active Subsystems & Runtimes
1. **Prime Directive & Authority**: `PRIME_DIRECTIVE.md`, `vault/00_Governance/AUTHORITY.md`.
2. **Deterministic Workspace Ledger**: `tools/workspace/workctl.mjs` (active claim `WP-KAD-CANONICAL-STATE-RECONCILIATION-010-R1`).
3. **Operator Control Plane**: `bin/kad`, `tools/kad/telemetry/control-plane-runtime.mjs`.
4. **Economic Router & Shadow Evaluator**: `tools/kad/telemetry/economic-shadow.mjs`, `tools/kad/telemetry/omp-usage-adapter.mjs`.
5. **Counterfactual Observatory**: `tools/kad/telemetry/observatory.mjs` (tamper-evident SHA256 chained journal).
6. **Promotion Readiness Gate**: `tools/kad/telemetry/readiness.mjs`.
7. **Research Domain Engine**: `tools/kad/research.mjs` (5-source real corpus in `corpus/research/`).
8. **Governed KnowledgePlane & Canonical Obsidian Vault**: `vault/`, `tools/kad/wiki/`, `tools/kad/knowledge-plane.mjs`.
9. **Multi-Agent Local Swarm**: `tools/kad/swarm.mjs`, STC lifecycle manager, PON causal engine (`tools/kad/pon-engine.mjs`).
10. **Harness Bridges**: Native OMP extension, pinned Fusion harness adapter (`tools/kad/fusion/`).

---

## 3. Workstation & Hardware Infrastructure
- **Machine**: `amdy` (AMD Ryzen 7 7700 8-Core, AMD Radeon RX 9060 XT 16GB VRAM).
- **OS**: Arch Linux (`Linux 7.1.9-arch1-2`).
- **Desktop Environment**: Omarchy 4.0.1-1 Quattro on Hyprland 0.56.2.
- **Local Model Registry**: `Qwen2.5-Coder-7B-Instruct-GGUF` (STC-owned local retrieval), `Stheno-v3.2-8B-GGUF` (WORLD-only simulation).
- **Remote Providers**: Codex, Antigravity/Gemini Pro, OpenCode Go. Free/subscription quota priority; PAYG spend strictly disabled.
