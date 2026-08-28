---
name: grill-me
description: A relentless interview to sharpen a plan or design.
disable-model-invocation: true
dependencies:
  - grilling
capabilities:
  - ask_user
---

Execute a stateless interview by invoking the composed `grilling` discipline to sharpen a plan, decision, or design.

**DEPENDENCY & CAPABILITY RESOLUTION**:
- Resolve and invoke the `grilling` discipline.
- Interaction with the user is mediated by the canonical `ask_user` capability declared by `grilling`.
- If the required capability is unavailable, follow the graceful degradation policy defined by `ask_user`.
