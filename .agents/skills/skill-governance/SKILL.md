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

## Invariants
1. **Pinned Checksums**: External skills are pinned in `.agents/workspace/skills.lock.json` and never auto-updated.
2. **ISA Alignment**: Every skill must have a valid class (`PROCESS_DISCIPLINE`, `WORKFLOW`, `POLICY_FRONTEND`, `CAPABILITY_FRONTEND`, `HARNESS_ADAPTER`, `PRESENTATION`).
3. **Doctor Verification**: `bin/workctl skills doctor` must report healthy with zero invalid schemas.
