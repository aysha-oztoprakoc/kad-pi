---
name: grill-with-docs
description: A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
disable-model-invocation: true
dependencies:
  - grilling
  - domain-modeling
capabilities:
  - ask_user
---

Execute a persistent interview by invoking the composed `grilling` and `domain-modeling` disciplines to sharpen a plan, decision, or design while capturing domain terms in `CONTEXT.md` and architecture decisions in ADRs.

**DEPENDENCY & CAPABILITY RESOLUTION**:
- Resolve and invoke `grilling` and `domain-modeling`.
- Interaction with the user is mediated by the canonical `ask_user` capability declared by `grilling`.
- If the required capability is unavailable, follow the graceful degradation policy defined by `ask_user`.
+
+For `kad-pi`, an architecture or governance choice is not resolved by the interview itself. Return the decision to Wayfinder, which presents five meaningful options plus one custom write-in through `ask_user`; only an `ANSWERED` human response becomes authoritative.
