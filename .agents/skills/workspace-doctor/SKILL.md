---
name: workspace-doctor
description: Diagnose registry, skills, tools, work, claims, handoffs, and project entrypoints without model inference.
---

Run `bin/workctl doctor` and `bin/workctl skills status`.

Treat failures as evidence: repair the owning registry, contract, or adapter; do not broaden authority or silently choose among duplicate skills. Check that each project path and instruction entrypoint exists, work paths remain inside their project, dependencies are resolvable, claims are explicit, handoffs are paired, and unknown/reference projects remain read-only.
