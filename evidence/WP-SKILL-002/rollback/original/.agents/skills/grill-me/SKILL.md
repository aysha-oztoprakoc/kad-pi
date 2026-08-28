---
name: grill-me
description: A relentless interview to sharpen a plan or design.
disable-model-invocation: true
---

Call the Skill tool with "grilling".

**CRITICAL UI REQUIREMENT**: Whenever you ask the user a question, you MUST use your harness's interactive question tool (`ask_question` in Antigravity, or `ask_user_question` in Pi/DSH) with up to 4 specific selectable options (top one prefixed with `(Recommended) `). Rely on the tool's native UI for the 5th "other" write-in option. Do NOT output raw markdown questions like `❓ **Q1**`.
