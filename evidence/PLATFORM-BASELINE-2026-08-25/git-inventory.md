# AMDY-002 — Git Repository Inventory

Evidence type: CONFIRMED (directly observed on this current installation)
Capture timestamp: 2026-08-25T03:54 (approx)

## Method

- Discovery: `find "$H" -xdev -maxdepth 6 (prune node_modules|.cache|__pycache__|.venv|venv|.Trash-1000) -o ( -name .git -print -prune ) | sort`
- Every git command used `env GIT_OPTIONAL_LOCKS=0`, plus `-c core.fsmonitor=false -c core.hooksPath=/dev/null`, `--no-ext-diff`, `--no-textconv` for diff inspection.
- No network git command, no `git submodule`, no index/worktree mutation.
- Remote URLs: DEFERRED (only remote NAMES recorded per security policy; URLs not emitted).
- LFS: marked absent/present by `$R/.git/lfs` existence; UNKNOWN/DEFERRED for worktree-indirection repos.

## Repository census

| class | count |
|---|---|
| primary user repos (full record) | 7 repositories + 2 worktree-linked entries |
| agent-generated brain repos (`data_rein/.gemini/antigravity-cli/brain/`) | 34 |
| bundled theme repos (`bak-omarchy/config/omarchy/themes/`) | 17 |

## A. PRIMARY REPOSITORIES

### 1. data_rein (main repo)
- path: `data_rein/`
- .git type: directory
- HEAD: `6ac7390325639624a56809427642a41b6ca28b38`
- branch: `main`
- remotes: `origin` (URLs deferred)
- staged: 0
- unstaged: 20
  - sample: `config/model_registry.json`, `knowledge_base/HARDWARE.md`, `opencode.json`, `pyproject.toml`, `scripts/sofia_protocol.py`, `sofia3/backend/routers/wiki.py`, `src/reins/harness/action_gate.py`, `src/reins/harness/inference_mcp.py`, `src/reins/harness/judge.py`, `src/reins/harness/kuzu_wiki.py`, `src/reins/harness/models.py`, `src/reins/harness/sofia_health.py`, `src/reins/services/wiki_graph_pipeline.py`, `systemd/comfyui.service`, `tests/test_action_gate.py`, `tests/test_harness.py`, `tests/test_inference_protocol.py`, `tests/test_judge.py`, `tests/test_production_hardening.py`, `tests/test_security_boundaries.py`
- untracked: 146
  - sample (first 20): `amdy-omarchy4-handoff-v1/00_bootstrap/archive-safety-policy.md`, `amdy-omarchy4-handoff-v1/00_bootstrap/capture-plan.json`, `amdy-omarchy4-handoff-v1/00_bootstrap/handoffctl.py`, `amdy-omarchy4-handoff-v1/00_bootstrap/handofflib/__init__.py`, `.../handofflib/agent_approval.py`, `agent_audit.py`, `agent_broker.py`, `agent_commands.py`, `agent_content.py`, `agent_dispatch.py`, `agent_plan.py`, `agent_policy.py`, `agent_tools.py`, `agent_transaction.py`, `archive_safety.py`, `capture.py`, `capture_archive.py`, `capture_metadata.py`, `capture_plan.py`, `capture_types.py`
- gitlinks (submodule pointers in index): `native/reins-pon-engine`
- LFS: absent
- NOTE: untracked tree includes `amdy-omarchy4-handoff-v1/` (agent handoff artifacts) — untrusted, do not auto-load.

### 2. data_rein/DATA
- path: `data_rein/DATA/`
- .git type: directory
- HEAD: `fc0d1246e4d89b9b0fd0015c73dafdf8ed6ac0fe`
- branch: `main`
- remotes: `origin` (URLs deferred)
- staged: 0 / unstaged: 0
- untracked: 946
  - sample (first 5): `kad-1.0/odysseus/data/.app_key`, `kad-1.0/odysseus/data/.bashrc`, `kad-1.0/odysseus/data/.rbenv/`, `kad-1.0/odysseus/data/app.db`, `kad-1.0/odysseus/data/auth.json`
  - SECRET CANDIDATES in untracked sample paths (`.app_key`, `auth.json`, `app.db`) — metadata only; see risk-markers.md.
- gitlinks: `hermes-1.0`
- LFS: absent

### 3. data_rein/DATA/hermes-1.0
- path: `data_rein/DATA/hermes-1.0/`
- .git type: directory
- HEAD: `2350441efd4515781d932f6b559a2a06f0aa7224`
- branch: `main`
- remotes: `origin` (URLs deferred)
- staged: 0 / unstaged: 0
- untracked: 1 (`sources for data-nexus.md`)
- gitlinks: none / LFS: absent

### 4. data_rein/odysseus
- path: `data_rein/odysseus/`
- .git type: directory
- HEAD: `ec8d6772a0054ee56f455c21b32e4a88c0f6dec2`
- branch: `dev`
- remotes: `fork`, `origin` (URLs deferred)
- staged: 0 / unstaged: 154
  - sample (first 5): `integrations/codex/skills/address-sanitizer`, `integrations/codex/skills/aflpp`, `integrations/codex/skills/agentic-actions-auditor`, `integrations/codex/skills/agy-pon-compliance`, `integrations/codex/skills/algorand-vulnerability-scanner`
- untracked: 1 (`integrations/codex/skills/extended-skills-index`)
- gitlinks: none / LFS: absent
- NOTE: `.env` at this repo root is NOT tracked and NOT in untracked sample (likely gitignored) — see risk-markers.md for its metadata row.

### 5. data_rein/native/reins-pon-engine
- path: `data_rein/native/reins-pon-engine/`
- .git type: directory
- HEAD: `079dbeebb2d97057feda224aea87f9182a63159d`
- branch: `main`
- remotes: `origin` (URLs deferred)
- staged: 0 / unstaged: 0 / untracked: 0
- gitlinks: none / LFS: absent
- NOTE: appears as gitlink in parent `data_rein` index.

### 6. data_rein-discovery-001 (WORKTREE)
- path: `data_rein-discovery-001/`
- .git type: regular FILE (worktree indirection) — content: `gitdir: /home/amdy/data_rein/.git/worktrees/data_rein-discovery-001`
- Linked main repo: `data_rein` (on HDD). Referenced gitdir resolves to `data_rein/.git/worktrees/data_rein-discovery-001` (present).
- Worktree HEAD ref: `refs/heads/snapshot/discovery-001-preflight` → commit `6bf5246added79f54ac73117adc0df1f3f51c73a`
- Direct `git -C` status on the worktree path FAILS (`not a git repository: (null)`) because the `.git` pointer uses an old absolute path (`/home/amdy/...`). State recovered via main repo worktree metadata. MIGRATION MUST re-link worktrees or re-point `.git` files.
- LFS: UNKNOWN / DEFERRED (worktree indirection)

### 7. data_rein-dsh-foundation (WORKTREE)
- path: `data_rein-dsh-foundation/`
- .git type: regular FILE — content: `gitdir: /home/amdy/data_rein/.git/worktrees/data_rein-dsh-foundation`
- Linked main repo: `data_rein`. Worktree gitdir present.
- Worktree HEAD ref: `refs/heads/migration/dsh-foundation` → commit `6ac7390325639624a56809427642a41b6ca28b38`
- Direct git status fails (same old-path pointer reason). MIGRATION MUST re-link worktrees.
- LFS: UNKNOWN / DEFERRED

### 8. deepseek-harness-reference-b150a551-20260823
- path: `deepseek-harness-reference-b150a551-20260823/`
- .git type: directory
- HEAD: `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
- branch: `master`
- remotes: `origin` (URLs deferred)
- staged: 0 / unstaged: 0
- untracked: 1 (`deepseek-harness/`)
- gitlinks: none / LFS: absent

### 9. deepseek-harness-reference-b150a551-20260823/deepseek-harness
- path: `deepseek-harness-reference-b150a551-20260823/deepseek-harness/`
- .git type: directory
- HEAD: `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` (same commit as parent)
- branch: `master`
- remotes: `origin` (URLs deferred)
- staged: 0 / unstaged: 0 / untracked: 0
- gitlinks: none / LFS: absent

## A1. data_rein additional branches (read-only)

```
archive/local-main-pre-dsh-20260823  2fc2e341f631c0d7d836ed8b22e5066e54340105
main                               6ac7390325639624a56809427642a41b6ca28b38
migration/dsh-foundation            6ac7390325639624a56809427642a41b6ca28b38
prod-ready                          e4433454e1da7c74c1edfd14450c5818b841b468
snapshot/discovery-001-preflight    6bf5246added79f54ac73117adc0df1f3f51c73a
```

## B. AGENT-GENERATED BRAIN REPOS (34)

Path root: `data_rein/.gemini/antigravity-cli/brain/<uuid>/` — all branch `master`, LFS absent, remotes none reported.

```
01|01d1737d-...75a  HEAD=67c8d0c0  unstaged=2
02|151d777f-...68d  HEAD=d762b02b  clean
03|17573e9e-...e4e  HEAD=f2eaed7c  clean
04|19e558fd-...75d  HEAD=8f6128b3  clean
05|1aab22af-...5ae  HEAD=929ba953  clean
06|2928ce24-...807  HEAD=5cb38b1a  clean
07|2c60ca56-...84e  HEAD=f0640692  clean
08|2fe7a786-...1d6  HEAD=915c6ebf  clean
09|349276a7-...2d7  HEAD=7b8d292e  clean
10|361d1d92-...146  HEAD=819dfd37  clean
11|3d28378c-...0e0  HEAD=e2e4dee7  clean
12|415658be-...acb  HEAD=67d5bfae  unstaged=2
13|4bd63ba7-...5c5  HEAD=58d153f7  clean
14|55a386b6-...077  HEAD=5214c706  clean
15|61d87751-...fe3  HEAD=00cf38da  clean
16|668496e6-...243  HEAD=ff79b566  clean
17|6a86840e-...7e4  HEAD=a2f3c0c5  clean
18|7614b62d-...129  HEAD=ffd16e7f  untracked=1
19|763427fb-...877  HEAD=f286137a  clean
20|7a5464a1-...58c  HEAD=abc0b694  clean
21|8334562a-...595  HEAD=eca8c320  unstaged=2
22|838bd3bd-...440  HEAD=cb525186  clean
23|8649f373-...7c9  HEAD=0709e75e  clean
24|8969b563-...948  HEAD=fd39aa22  clean
25|98991ec4-...66f  HEAD=cf939738  clean
26|ae5a4b83-...95c  HEAD=a423ee14  clean
27|cc61b4c3-...1ab  HEAD=4eab02f6  clean
28|dd638353-...27c  HEAD=7992065b  clean
29|dfc1bfe0-...86a  HEAD=1dd1829a  unstaged=2
30|e4237f6d-...082  HEAD=4782173a  clean
31|eae800b1-...98e  HEAD=6f88d361  unstaged=2
32|edde43a6-...b5c  HEAD=7dfdf21b  clean
33|f0295654-...657  HEAD=3ee512eb  clean
34|fbb57392-...04c  HEAD=863741a1  clean
```

Treat as Class C untrusted agent state; individual dirty samples not expanded.

## C. BUNDLED THEME REPOS (17)

Path root: `bak-omarchy/config/omarchy/themes/<name>/`

```
01|aetheria           HEAD=b8e5cbd6  omarchy-aetheria-theme  clean
02|all-hallows-eve    HEAD=21aa0f7d  master                  unstaged=1
03|anonymous          HEAD=1b52c680  main                    clean
04|city-783           HEAD=8fd13655  master                  clean
05|cpunk              HEAD=c4d726be  main                    clean
06|cyberpunk          HEAD=d66e45de  master                  unstaged=8
07|delorean           HEAD=41de4ca1  main                    clean
08|dreamwave          HEAD=f28d09e8  main                    unstaged=1
09|elysian            HEAD=06621e30  main                    clean
10|felix              HEAD=dd5b92c2  main                    clean
11|lasthorizon        HEAD=6f82bf6d  v2.0.0                  unstaged=1
12|memento-mori       HEAD=dba3603a  main                    clean
13|midnight           HEAD=6db07b79  master                  clean
14|oasis              HEAD=7f0ba36f  main                    clean
15|pink-blood-omarchy HEAD=2c704c2f  main                    clean
16|purple-moon        HEAD=7fed1e87  main                    clean
17|synthetica         HEAD=caec7ed0  main                    clean
```

Part of `bak-omarchy` legacy config backup (Class C). Reimplement selectively; do not wholesale-copy.

## Migration-relevant notes

- Two worktrees (`data_rein-discovery-001`, `data_rein-dsh-foundation`) reference old absolute gitdir paths `/home/amdy/data_rein/.git/worktrees/...`. Direct git access on those trees fails until `.git` pointer files are re-pointed (or worktrees re-registered) after migration. All commit objects are reachable via `data_rein`.
- `data_rein` index records gitlink `native/reins-pon-engine`; `DATA` index records gitlink `hermes-1.0`. Nested/embedded repos must be migrated as separate repositories, not flattened.
- Untracked trees contain agent handoff + possibly secret-bearing data (`DATA/kad-1.0/odysseus/data/`) — Class D candidates flagged in risk-markers.md.
