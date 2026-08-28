# 0007. Synthetic Knowledge Base and Librarian Agent Architecture

## Status
Accepted

## Context
Raw handoffs, session transcripts, and architecture documents grow rapidly in length and complexity, creating context exhaustion and token waste for LLM agents. Traditional RAG systems often suffer from chunk fragmentation, semantic drift, and failure to preserve epistemic certainty levels.

## Decision
We establish a two-tier knowledge architecture optimized for autonomous Librarian agents:
1. Raw Knowledge Layer (`wiki/` root): Immutable historical handoffs, session transcripts, and exploratory notes.
2. Synthetic Knowledge Layer (`wiki/synthetic/`): High-density, machine-navigable distilled documents with structured frontmatter, epistemic status tags, exact signatures, and causal state machines.
3. Structured Indexing: Machine-readable `CATALOG.json`, ontology `TAXONOMY.json`, chunk-level `RETRIEVAL_INDEX.jsonl`, and operational protocol `LIBRARIAN.md`.
4. Deterministic Librarian Engine: Local, zero-overhead Node.js CLI tool (`tools/librarian/librarian.mjs`) enabling subagents to perform exact term lookups, filtered searches, and integrity verification before making LLM calls.
