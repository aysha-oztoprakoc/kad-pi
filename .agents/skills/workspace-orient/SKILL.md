---
name: workspace-orient
description: Orient an agent to the shared workspace, nearest project, governing instructions, and next safe deterministic action.
---

Run `bin/workctl bootstrap`, then `bin/workctl doctor`.

Read `AGENTS.md`, select the nearest project from `.agents/workspace/projects.json`, and read that project's `instruction_entrypoint` and `authority_entrypoints`. Use `bin/workctl status` and `bin/workctl next --project <id>` to inspect durable work. Resume an existing claim before selecting new READY work.

This skill coordinates workspace state. Project instructions authorize project changes. Load bounded task and evidence context; do not infer model, provider, or harness requirements.
