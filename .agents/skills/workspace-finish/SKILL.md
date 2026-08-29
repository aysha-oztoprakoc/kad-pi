---
name: workspace-finish
description: Finish a claimed work item with project validation, review, evidence, and explicit state transition.
---

Read the task validation list. Run project-local checks and the applicable review skill. Record deterministic results under the task evidence target, then update the handoff. Transition the work item to `REVIEW` or `ACCEPTED` only when postconditions are observed. Release or close the claim explicitly with `bin/workctl release <task> --actor <label>` when ownership ends.

Keep workspace coordination separate from project authority. Do not publish private claims, handoffs, local paths, or harness metadata.
