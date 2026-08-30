# KAD Research Workflow

This document describes the deterministic research corpus workflow, operator interface, and manifest transport in KAD-PI.

## Architecture

The research domain maintains strict separation between discovery, acquisition, canonical identity, and derived context:

```text
Discovery / Input (DOI, arXiv, PDF, Manifest)
                 ↓
         ResearchCandidate (non-authoritative observation)
                 ↓
         ResearchSource (content-hashed bytes, path security)
                 ↓
         ResearchDocument (canonical identity & precedence)
                 ↓
         CATALOG persistence (wiki/research/CATALOG.json)
```

## Operator Namespace

Operator tasks are managed through the thin `kad-knowledge research` namespace:

```sh
kad-knowledge research <subcommand> [options]
```

### Subcommands

| Subcommand | Description | Example |
| --- | --- | --- |
| `import` | Ingest DOI, arXiv, local file, or manifest | `kad-knowledge research import 10.1145/3290605.3300852` |
| `inspect` | Inspect canonical document metadata by ID, DOI, or hash | `kad-knowledge research inspect doc:doi:10.1145/3290605.3300852` |
| `verify` | Check source file presence and SHA-256 content hashes | `kad-knowledge research verify` |
| `list` | List canonical documents in corpus (with optional filters) | `kad-knowledge research list --year 2024` |
| `export` | Export canonical document as a deterministic manifest | `kad-knowledge research export doc:doi:10.1145/3290605.3300852` |

## Supported Inputs

- **DOI**: e.g. `10.1145/3290605.3300852` or `https://doi.org/10.1145/3290605.3300852` (normalized to lowercase).
- **arXiv**: e.g. `arXiv:2301.12345` or `https://arxiv.org/abs/2301.12345` (normalized without URL/pdf prefixes).
- **Local PDF / Source**: `--source papers/sample.pdf` (hashed via SHA-256 with path confinement).
- **Deterministic Manifest**: `--manifest path/to/manifest.json`.

## Manifest Specification

Manifests use schema `kad-research-manifest-v1` and serve as transport representations of API inputs:

```json
{
  "schema_version": "kad-research-manifest-v1",
  "candidate": {
    "title": "Scalable Agreement Protocols",
    "authors": ["Alice Smith", "Bob Jones"],
    "year": 2024,
    "abstract": "A deterministic consensus protocol for distributed agents.",
    "identifiers": [
      { "type": "doi", "value": "10.1234/sap.2024.01" }
    ]
  },
  "source": {
    "source_path": "papers/sap2024.pdf"
  },
  "provenance": {
    "method": "manifest",
    "origin": "manual_fixture",
    "actor": "operator"
  }
}
```

## Security & Path Confinement

1. **Path Traversal**: Relative navigation (`..`), root directory escapes, and null-byte injection (`\0`) are strictly rejected with `ResearchSecurityError`.
2. **Symlink Protection**: Symlinks pointing outside the repository root are detected and blocked before read operations.
3. **Authority Protection**: Derived metadata and external providers cannot overwrite canonical source metadata without explicit authorized transitions.

## Graceful Degradation & Zero-Model Baseline

The entire research ingestion and verification pipeline executes 100% locally and deterministically. It requires no network connection, no API keys, no LLM inference, and no OpenViking service.
