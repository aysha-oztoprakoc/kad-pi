# WP-KAD-LIB-002: Deterministic Provenance & Verifier Hardening

**Status:** `RECONCILED`  
**Verdict:** `PARTIAL` (at commit `76ac60c`) → Superseded by `WP-KAD-LIB-002-R1` for CI portability  
**Date:** 2026-08-28  

---

## 1. Executive Summary

WorkPackage `WP-KAD-LIB-002` hardened the Librarian documentation and retrieval layer into a truthful, deterministic, and mechanically verifiable system. All **6 findings** (F-01 through F-06) from the adversarial review were resolved:
1. Retrieval cards in `RETRIEVAL_INDEX.jsonl` carry exact line-numbered provenance locators (`source_path`, `start_line`, `end_line`, `locator`).
2. `tools/librarian/librarian.mjs` was upgraded to perform deep verification of `CATALOG.json`, `TAXONOMY.json`, `RETRIEVAL_INDEX.jsonl`, epistemic enums, declared domains, line ranges within file bounds, frontmatter sources, and markdown links.
3. `searchKnowledgeBase()` and `lookupTerm()` expose complete deterministic locators and file URIs.
4. Comprehensive unit and fault-injection tests prove that corrupting any link, line range, or domain causes `verify` to return `FAIL`.
5. Dead code was removed (F-05) and JSON parser error contexts were encapsulated (F-06).
6. A continuous integration workflow (`.github/workflows/ci.yml`) was authored and published.

---

## 2. Acceptance Verification & Evidence Reconciliation

| Acceptance Criterion | Verification Command / Artifact | Status at `76ac60c` | Status after `WP-KAD-LIB-002-R1` |
|---|---|---|---|
| Every retrieval card has deterministic provenance locators | `wiki/synthetic/RETRIEVAL_INDEX.jsonl` (21/21 cards validated) | **PASS** | **PASS** |
| `verify` validates catalog, taxonomy, index, schemas, line numbers | `node tools/librarian/librarian.mjs verify` (22 docs, 21 cards, 16 concepts) | **PASS** | **PASS** |
| Deliberate corruption causes `verify` to return `FAIL` | `tools/librarian/test/librarian.test.mjs` (test 9: failure injection) | **PASS** | **PASS** |
| Search results expose sufficient provenance for citation | `node tools/librarian/librarian.mjs search "PON causality"` | **PASS** | **PASS** |
| Existing 9 tests & KAD regressions remain green | `tools/librarian/test/librarian.test.mjs`, `make test` (14/14 passed) | **PASS** | **PASS** |
| Independent reviewer audit preserved in evidence | `evidence/WP-KAD-LIB-002/adversarial-review-audit.md` | **PASS** | **PASS** |
| GitHub Actions CI workflow | Run ID `33170749930` on GitHub | **FAIL** (Absolute path in `validate_prime_directive.py`) | **PASS** (Reconciled in R1) |

---

## 3. Historical Record of Initial CI Failure

- **Commit**: `76ac60c2cff437123bfc446ad63704d382f99c86`
- **GitHub Actions Run ID**: `33170749930` ([Run URL](https://github.com/aysha-oztoprakoc/kad-pi/actions/runs/33170749930))
- **Failed Step**: `Run Prime Directive Constitution Check` (`Error: PRIME_DIRECTIVE.md not found.`)
- **Root Cause**: `validate_prime_directive.py` contained hardcoded `/home/amdy/Work/PRIME_DIRECTIVE.md`.
- **Corrective Action**: Reconciled and resolved in `WP-KAD-LIB-002-R1`.
