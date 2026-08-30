# Canonical Source Index & Provenance Hierarchy

## 1. Provenance Hierarchy
Authoritative claims within KAD-PI must trace to at least one verified source category:

```text
Level 1 (Highest): Scientific Primary Sources (corpus/research/ PDFs & DOIs)
Level 2: Accepted Workpackage Evidence & Causal Journals (evidence/WP-*/)
Level 3: Repository Commit State & Deterministic Tool Output (Git HEAD / sha256)
Level 4: Human-Authored Canonical Knowledge & Policies (vault/00_Governance/, 50_Projects/)
Level 5: Runtime Telemetry Observations (telemetry-ledger.jsonl)
Level 6: Derived Projections & Indexes (90_Derived/, wiki/)
Level 7: Quarantined Predecessors (amdy-HDD/data_rein)
```

---

## 2. Authoritative Source Registry

| Source Identifier | Source Category | Location | Epistemic Class | Verification Method |
|---|---|---|---|---|
| `corpus/research/toolformer.pdf` | Scientific Primary Source | `corpus/research/` | `SOURCE_FACT` | SHA256 byte hash & DOI |
| `corpus/research/reflexion.pdf` | Scientific Primary Source | `corpus/research/` | `SOURCE_FACT` | SHA256 byte hash & arXiv ID |
| `corpus/research/self_refine.pdf` | Scientific Primary Source | `corpus/research/` | `SOURCE_FACT` | SHA256 byte hash & arXiv ID |
| `corpus/research/swe_bench.pdf` | Scientific Primary Source | `corpus/research/` | `SOURCE_FACT` | SHA256 byte hash & arXiv ID |
| `corpus/research/voyager.pdf` | Scientific Primary Source | `corpus/research/` | `SOURCE_FACT` | SHA256 byte hash & arXiv ID |
| `evidence/WP-KAD-002/causal-journal.jsonl` | Runtime Causal Journal | `evidence/WP-KAD-002/` | `OBSERVED` | SHA256 hash-chain verification |
| `evidence/WP-KAD-COUNTERFACTUAL-OBSERVATORY-004/` | Observatory Snapshot | `evidence/WP-KAD-004/` | `OBSERVED` | Append-only journal replay |
| `PRIME_DIRECTIVE.md` | Core System Doctrine | Root repository | `CANONICAL_PROJECT_DECISION` | Versioned text & test gate |
| `vault/00_Governance/AUTHORITY.md` | Authority Specification | `vault/` | `CANONICAL_PROJECT_DECISION` | Flat property linting |
| `AMDY-003-R3` Migration Manifest | Migration Manifest | `/home/amdy/migration/`| `PROJECT_INFERENCE` | Schema v1.3.0 determinism check |
