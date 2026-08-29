---
name: workspace-handoff
description: Record durable continuation state so another harness can resume work without conversation history.
---

Before leaving a task, run `bin/workctl handoff <task> --actor <label>`.

The command writes paired `.agents/work/handoffs/<task>.json` and `.md` artifacts containing the task contract, project instructions, fixed point, current HEAD, scope, owned paths, completed and remaining work, validation, failures, blockers, evidence, and dirty paths. Record no hidden reasoning or secrets. Git and project evidence outrank the handoff.
