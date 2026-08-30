# Canonical Obsidian librarian

Architecture decision: repo-local `vault/` is the canonical human-editable vault (smallest safe architecture for this workspace); `wiki/` remains an existing workspace and is not promoted automatically. All generated library data lives under `vault/90_Derived/`.

Commands: `bin/kad-wiki status`, `lint`, `ingest --source ID --file FILE`, `propose --id ID --target 30_Knowledge/name.md --body FILE`, `approve ID`, `apply ID`, `query TERMS`, `rebuild`, and `context --query TERMS`.

Agents can ingest and propose but cannot approve when `KAD_AGENT_EXECUTION=1`; approval receipts bind SHA-256 of exact proposal bytes. Apply refuses missing receipts, changed proposals, absolute paths, and path escapes. Human Obsidian edits are plain Markdown and require only `bin/kad-wiki lint` then `rebuild`.
