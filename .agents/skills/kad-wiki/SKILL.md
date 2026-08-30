---
name: kad-wiki
description: Governed canonical Obsidian vault librarian workflow
---

# KAD Wiki

The repository-local `vault/` is the canonical human-editable Markdown database. `wiki/` and `90_Derived/` outputs are projections and never authority.

Every session: read `00_Governance/SCHEMA.md`, `AUTHORITY.md`, `index.md`, recent `log.md`, then search before creating notes.

Operations:
- `orient`: inspect governance and current lint status.
- `ingest`: capture immutable raw source metadata and hashes; never publish knowledge.
- `query`: deterministic search over approved canonical notes only.
- `propose`: write `80_Review/Pending`; model output remains unreviewed.
- `review`: human inspects proposal in Obsidian.
- `approve`: human shell only; exact proposal hash is recorded.
- `apply`: requires matching receipt and rejects changed bytes/path escapes.
- `lint`: deterministic validation.
- `context`: bounded derived pack; stale packs are not reusable.

Threat model: this prevents accidental/cooperative self-propagation. It is not hardened isolation against a malicious same-user process. Never run Needle training from this skill. Confidence never substitutes for provenance.

Inspired by NousResearch/hermes-agent `skills/research/llm-wiki/SKILL.md` and `skills/note-taking/obsidian/SKILL.md`, reference commit `89b38ed734ab2d5c3d263bc24fbdb8c74e931af4`; MIT attribution retained as architectural inspiration, not copied code.
