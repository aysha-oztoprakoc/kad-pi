# WP-KAD-LOCAL-WIKI-CONTEXT-LIBRARY-009

Canonical vault Markdown is compiled into `90_Derived/KnowledgePlane/manifest.json` and `90_Derived/Indexes/lexical.json`; both carry canonical revision and note hashes. Search uses deterministic lexical matching with no model or embedding dependency. Context packs are bounded and include approved, non-UNKNOWN notes only; canonical revision mismatch marks packs stale. OpenViking is optional and unavailable state falls back to deterministic index. No Needle training performed.

Observed verification: `node --test tools/kad/test/wiki-library.test.mjs` — 2 passed.
