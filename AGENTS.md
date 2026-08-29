# Amdy Work Workspace

`/home/amdy/Work` is a shared workspace. **WORKSPACE COORDINATES. PROJECTS AUTHORIZE.**

## Startup

1. Run `bin/workctl bootstrap` and `bin/workctl doctor`.
2. Identify the nearest project from `.agents/workspace/projects.json`.
3. Read this file, then the nearest project instruction entrypoint and its authority files.
4. Run `bin/workctl next --project <id>`; resume an existing claim before selecting new READY work.
5. Use `bin/workctl show`, `claim`, `handoff`, `resume`, and `release` to leave durable state.

## Shared contracts

- Canonical portable skills: `.agents/skills/`; harness-specific views are derived adapters.
- Work items and claims: `.agents/work/`; paired handoffs are JSON and Markdown.
- Task contracts request capabilities, not model, provider, or harness names.
- `GIT + PROJECT EVIDENCE > WORK LEDGER > HANDOFF > MEMORY`.
- `CAPABILITY != AUTHORITY`; `TASK != MODEL`; `TASK != PROVIDER`; `TASK != HARNESS`.
- Coordination is deterministic and zero-model. Unsupported harnesses use `bin/workctl`.
- Mutate only an enrolled project with an explicit claim and owned paths. Reference, vendor, and UNKNOWN projects are read-only.
- KAD authority is confined to the KAD-PI project. Side projects define their own rules.

See `.agents/workspace/projects.json`, `.agents/workspace/tools.json`, and `.agents/skills/workspace-orient/SKILL.md` for the durable index and procedures.
