# Local wiki context library

`tools/kad/wiki-library` compiles approved canonical vault Markdown into a manifest and lexical index. Search is offline and requires no LLM or embeddings. `materialize` writes bounded context packs carrying canonical revision and note metadata; `packFresh` detects edits. OpenViking is optional and represented as derived/unavailable; deterministic search remains the fallback.

KnowledgePlane is compiled output, never a write path to canonical notes. Local-model summaries and proposed updates belong in Review. No Needle training is run.
