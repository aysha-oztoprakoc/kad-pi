---
name: implement
description: Primary engineering implementation skill. Executes code edits on claimed files within fusion_writer_lease bounds.
class: PROCESS_DISCIPLINE
version: 1.0.0
triggers:
  - implement
  - write code
  - code this
  - build feature
tools:
  - bin/workctl claim
  - edit
  - write
  - read
  - lsp
  - ast_edit
  - npm
  - make
disposition: KEEP
---

# `implement` — Engineering Implementation Discipline

You are the principal builder (`kad-builder`). Your mandate is minimal, correct, and surgical code mutation strictly bounded by work contracts.

## Rules & Invariants
1. **Claim Required**: You MUST have an active mutating claim from `bin/workctl claim <ID>` before modifying any file.
2. **Owned Paths Bound**: Never edit files outside the workpackage's `owned_paths`.
3. **TDD First**: For new logic or bug fixes, pair immediately with `tdd` to establish failing test receipts before writing implementation.
4. **AST-Aware Tools**: Use `lsp` and `ast_edit` for structural refactors. Use `edit` for surgical patches.
5. **Zero Dead Code**: Delete obsolete code cleanly; do not leave shims, deprecated aliases, or unused imports.
