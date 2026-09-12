---
name: warframe-tutor
description: >
  Answer Warframe progression questions from the player's own account snapshot: what to do next,
  what to level for mastery, which quest comes next and what it gates, whether something can be
  built and where the missing parts drop, what the next Mastery Rank unlocks, and what a
  watchlist item sells for. Use for any question about this player's Warframe progress — MR,
  star chart, quests, foundry, mods, resources, farm locations, market prices. The tutor answers
  deterministically from fresh data and reports UNKNOWN rather than guessing.
class: DOMAIN_TUTOR
version: 1.0.0
triggers:
  - warframe
  - what should I do in warframe
  - warframe progression
  - warframe mastery
  - warframe quest
  - warframe build
  - warframe farm location
  - warframe market price
tools:
  - bin/kad-warframe
  - read
disposition: KEEP
---

# `warframe-tutor` — deterministic Warframe progression advice

The tutor is a **program**, not a prompt: `kad-warframe/bin/kad-warframe`. Run it before answering
any progression question and answer from its output. Do not recall Warframe facts from memory —
drop tables, mastery requirements and quest order change between updates, and the tutor's whole
value is that its answers trace to data.

## Run it

```bash
kad-warframe/bin/kad-warframe check          # fresh? exit 1 means do not advise yet
kad-warframe/bin/kad-warframe next --evidence
kad-warframe/bin/kad-warframe mr             # mastery gap, what to level, next-rank unlocks
kad-warframe/bin/kad-warframe quests --all
kad-warframe/bin/kad-warframe item <name>
kad-warframe/bin/kad-warframe build <name>
kad-warframe/bin/kad-warframe price "<name>"
```

`--json` goes **before** the subcommand (`bin/kad-warframe --json next`). Exit codes: 0 success,
1 stale/missing data, 2 usage or ambiguous lookup. A `2` on a name usually means several different
items match; ask the player which one instead of picking.

## Answer from the output, including its provenance

Every action prints the facts behind it, and the header prints the data's age. Quote those facts.
When the tutor says UNKNOWN — an undeclared platinum balance, an unclassifiable ref, a drop
location it cannot resolve — pass that through as UNKNOWN. Filling the gap from memory converts a
trustworthy tool into a plausible one.

## Boundaries

* **The acquisition boundary belongs to the player.** `inventory.json`, `warframe.db` and the
  WFCD cache come from warframe-helper's TUI (**Fetch Inventory**, **Database Operations**). When
  `check` reports staleness, tell the player to run those — do not invent a refreshed state and do
  not edit those files.
* **Account data never leaves `~/.warframe-helper`.** Do not copy inventory contents, account ids
  or balances into any repository, doc, commit message or issue.
* **The tutor advises; the player decides.** Its plan is ranked advice with citations, not
  authority. If the player disagrees with a weight, that is a rules discussion in
  `kadwarframe/plan.py`, not a fact to argue about.
* **Zero platinum means farming.** Any suggestion that needs platinum contradicts a declared zero
  balance; the plan is built so this cannot happen, and a test enforces it.

## Changing the tutor

Project instructions live in `kad-warframe/AGENTS.md`. Rules are in `kadwarframe/plan.py`, curated
game data in `data/*.json` (with provenance blocks that must be updated when edited), and the test
suite is hermetic — run `python3 -m unittest discover -s kad-warframe/tests` from the workspace
root before and after any change.
