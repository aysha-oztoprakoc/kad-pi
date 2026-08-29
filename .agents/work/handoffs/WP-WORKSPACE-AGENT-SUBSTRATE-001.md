# Handoff: WP-WORKSPACE-AGENT-SUBSTRATE-001

- Project: kad-pi
- Title: Implement portable workspace agent substrate
- Fixed point: 7f241585d8fb147f566def39d88e0670d1785852
- Current HEAD: 7f241585d8fb147f566def39d88e0670d1785852
- Owner: omp-wayfinder
- Mode: mutate

## Scope

- Owned paths: AGENTS.md, .agents/workspace, .agents/work, .agents/skills/workspace-orient, .agents/skills/workspace-pick-work, .agents/skills/workspace-handoff, .agents/skills/workspace-finish, .agents/skills/workspace-doctor, bin/workctl, tools/workspace, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001
- Scope: AGENTS.md, .agents/workspace, .agents/work, .agents/skills/workspace-*, bin/workctl, tools/workspace, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001
- Non-scope: pre-existing dirty paths, side projects, model/provider routing, public publication

## State

- Status: IN_PROGRESS
- Completed: none recorded
- Remaining: Continue from the task contract
- Dirty owned paths: .agents/skills/workspace-doctor/SKILL.md, .agents/skills/workspace-finish/SKILL.md, .agents/skills/workspace-handoff/SKILL.md, .agents/skills/workspace-orient/SKILL.md, .agents/skills/workspace-pick-work/SKILL.md, .agents/work/WP-WORKSPACE-AGENT-SUBSTRATE-001.json, .agents/work/claims/WP-WORKSPACE-AGENT-SUBSTRATE-001.json, .agents/work/handoffs/WP-WORKSPACE-AGENT-SUBSTRATE-001.json, .agents/work/handoffs/WP-WORKSPACE-AGENT-SUBSTRATE-001.md, .agents/workspace/projects.json, .agents/workspace/tools.json, AGENTS.md, bin/workctl, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/REPORT.md, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/agnosticism-validation.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/chat-independence.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/claim-validation.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/doctor-validation.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/fixed-point.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/handoff-validation.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/harness-compatibility.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/harness-inventory.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/project-isolation.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/project-registry.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/resume-validation.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/security-review.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/skill-collisions.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/skill-inventory.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/skill-provenance.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/skill-update-report.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/state-machine.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/tool-manifest.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/validation.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/work-contract.json, evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/workspace-census.json, tools/workspace/workctl.mjs, tools/workspace/workctl.test.mjs

## Validation and evidence

- Tests run: none recorded
- Tests pending: node --test tools/workspace/workctl.test.mjs; bin/workctl doctor; make verify; make test; git diff --check
- Failures: none recorded
- Blockers: none recorded
- Evidence: evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001

## Next deterministic action

Read project instructions, inspect the fixed point, then follow the task validation list.
