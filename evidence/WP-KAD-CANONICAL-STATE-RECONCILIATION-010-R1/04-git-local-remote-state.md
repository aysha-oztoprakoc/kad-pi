# Git Local vs Remote State

## Explicit Distinction

```text
LOCAL_STATE: The live filesystem and local Git repository under /home/amdy/Work
REMOTE_GITHUB_STATE: The upstream public repository on GitHub (aysha-oztoprakoc/kad-pi)
CANONICAL_VAULT_STATE: The governed Obsidian vault under /home/amdy/Work/vault/
```

---

## KAD-PI Git Synchronization State

- **Local HEAD Commit**: `ca1f56a020a3416eeffa3d49f3c34f113b536902`
- **Local Current Branch**: `main`
- **Remote Tracking Branch**: `origin/main`
- **Remote URL**: `https://github.com/aysha-oztoprakoc/kad-pi.git`
- **Remote HEAD Commit**: `27ed3c67016e330b658aa9be2b049b4020912109` (Author: Aysha Oztoprakoc, Date: 2026-08-28 11:38:24 -0300)
- **Divergence**: Local `main` is ahead of `origin/main` by **57 commits**.
- **Behind Count**: 0 commits behind.
- **Synchronization Status**: `LOCAL_AHEAD_UNPUSHED`

### Summary of Local Commits Ahead (57 commits)
1. `ca1f56a` feat(kad): unify vault wiki migration contract (WP-010)
2. `2d5ef8b` feat(kad): add pinned fusion and canonical wiki librarian (WP-007A, WP-008, WP-009)
3. `2d368db` feat: promote audited knowledge claims (WP-007)
4. `ccafcc7` fix(research): complete epistemic claim audit and source-fidelity repair for five-source real corpus (R1) (WP-006-R1)
5. `0ba74b9` feat(research): evaluate real-corpus research workflow on deterministic agent control literature (WP-006)
6. `9342702` feat: advance counterfactual observatory and promotion readiness (WP-004, WP-005)
7. `8774f8d` feat(kad): establish shadow economic evaluator and telemetry usage bridge (WP-002, WP-003)
8. `cb59d84` feat(kad): integrate operator control plane and developer security toolchain (WP-001)
9. `ea324af` feat(research): implement research capabilities profile, openviking context, and read-only zotero adapter (WP-003, WP-004, WP-005)
10. `b057ffc` feat(research): implement canonical research api, persistence, and operator cli (WP-001, WP-002)
11. `cad814f` feat(workspace): implement portable workspace agent substrate and tool integration (WP-001)
... (46 earlier local development commits)

---

## Subproject Git States

### `data_workspace`
- **Local HEAD**: `223df1f935ae555487f3a8daa2fead37fca7032e`
- **Branch**: `main`
- **Remote**: None configured locally.
- **Divergence**: Independent local repository.

### `technopagan-netrunner`
- **Local HEAD**: `53fc4d51930171fa21d1f09cab5ab8dba0faec61`
- **Branch**: `theme/technopagan-full-suite`
- **Remote**: None configured locally.
- **Divergence**: Independent local repository.

### `tries/deepseek-harness-lab`
- **Local HEAD**: `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
- **Branch**: `master`
- **Remote**: `https://github.com/deepseek-ai/deepseek-harness.git`
- **Divergence**: In sync with upstream release tag `dsh-0.1.1-rc.2`.

---

## Doctrine Invariant

Neither local git nor remote GitHub is automatically canonical for project knowledge. The canonical knowledge source is the **Canonical Obsidian Vault** (`vault/`), which records the verified facts about both local implementation and remote synchronization.
