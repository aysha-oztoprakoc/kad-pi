---
name: skill-governance
description: Manages skills lockfile (skills.lock.json), schema validation, doctor diagnostics, and audits.
class: POLICY_FRONTEND
version: 1.0.0
triggers:
  - skill governance
  - check skills
  - skills doctor
  - lockfile check
tools:
  - bin/workctl skills doctor
  - read
  - write
disposition: KEEP
---

# `skill-governance` — Canonical Skill Governance & Lockfile Manager

Governs the installation, verification, checksum pinning, and doctor auditing of all skills in the workspace.

## Two lockfiles, two jobs — do not conflate them

| File | Scope | What it records | Authority |
|---|---|---|---|
| `.agents/workspace/skills.lock.json` | the 19 governed imported skills | `revision`, `upstream_sha256` (upstream copy at pin time), `execution_sha256` (**the file actually executed**), `local_mode`, `local_delta` | the lock for local execution |
| `skills-lock.json` (repository root) | the 38-skill upstream import (mattpocock/skills) | `source`, `sourceType`, `skillPath`, `computedHash` of the upstream artefact as imported | provenance evidence only |

Where they disagree, **neither is wrong**: they hash different artefacts. The governance
lock's `execution_sha256` is the claim that must hold — it is the hash of
`.agents/skills/<name>/SKILL.md` as executed here — while the root lock pins *where the
material came from* and is never used for runtime decisions. When the two record
different upstream revisions, the governance lock is the one that was verified locally.

## Skill roots

`.agents/skills/` is the canonical corpus and the only one an agent should read.
`.claude/skills/` and `agent/skills/` are harness-local mirrors of the upstream import;
they are gitignored, are not kept in sync, and must not be treated as a source. The
canonical corpus is deliberately a superset: KAD-native skills (`kad-*`, `workspace-*`,
`gaya-*`, `godot-*`, `ai-memory-*`) exist only in `.agents/skills/`, and a skill present
in the canonical root but absent from a mirror is expected, not drift.
`bin/workctl skills status` enumerates every root, so the collision report stays
authoritative for the canonical root.

## Invariants
1. **Pinned Checksums**: External skills are pinned in `.agents/workspace/skills.lock.json` and never auto-updated.
2. **ISA Alignment**: Every skill must have a valid class (`PROCESS_DISCIPLINE`, `WORKFLOW`, `POLICY_FRONTEND`, `CAPABILITY_FRONTEND`, `HARNESS_ADAPTER`, `PRESENTATION`).
3. **Doctor Verification**: `bin/workctl skills doctor` must report healthy with zero invalid schemas.
4. **Name Matches Directory**: A skill's frontmatter `name` must equal its directory name, or harnesses that resolve by declared name cannot find it.
