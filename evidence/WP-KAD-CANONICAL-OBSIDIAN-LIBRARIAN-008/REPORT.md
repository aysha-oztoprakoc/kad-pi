# WP-KAD-CANONICAL-OBSIDIAN-LIBRARIAN-008

Wayfinder: choose a repo-local `vault/` canonical container rather than making historical `wiki/` authoritative. This keeps human Markdown editable in Obsidian while preserving existing wiki pages as non-canonical workspace material.

Authority chain: vault Markdown > KnowledgePlane manifest > lexical/context projections. RAW_EVIDENCE is immutable by policy; proposals enter `80_Review/Pending`; exact SHA-256 receipts are required for apply. Agent execution cannot approve. UNKNOWN and unreviewed content are excluded from query/context.

Migration classification: existing `wiki/` pages remain untouched and are classified as `LEGACY_REVIEW_REQUIRED` unless an explicit provenance audit promotes them. No historical page was silently promoted. No private vault path is accessed.

Evidence: `node --test tools/kad/test/wiki-librarian.test.mjs` — 3 passed, including raw/unreviewed exclusion, approval tamper rejection, and stale pack detection. No Needle training performed.
