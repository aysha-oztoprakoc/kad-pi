---
name: workspace-pick-work
description: Select and claim the highest-priority unblocked READY work item using the shared deterministic ledger.
---

Run `bin/workctl next --project <id>`. Inspect the returned contract with `bin/workctl show <task>`.

Verify its fixed point, scope, owned paths, authority, and validation list. Claim with `bin/workctl claim <task> --actor <label>` before mutation. Use `--mode readonly` for parallel review; read-only work does not reserve mutation paths. Existing claims, path conflicts, unresolved blockers, unknown projects, and fixed-point mismatches fail closed.
