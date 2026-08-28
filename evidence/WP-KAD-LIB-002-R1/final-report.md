# WP-KAD-LIB-002-R1: CI Portability & Evidence Reconciliation

**Status:** `IN_PROGRESS` (Awaiting GitHub Actions verification)  
**Date:** 2026-08-28  

---

## 1. Objective & Scope

Repair the CI portability failure observed in GitHub Actions run `33170749930` for commit `76ac60c`, reconcile all durable evidence records with GitHub reality, and verify a 100% green GitHub Actions workflow.

---

## 2. Root Cause & Corrective Mutations

1. **Root Cause**: `validate_prime_directive.py` contained hardcoded `/home/amdy/Work/PRIME_DIRECTIVE.md`.
2. **Validator Fix**: Replaced with `Path(__file__).resolve().parent / "PRIME_DIRECTIVE.md"`.
3. **Regression Test**: Added test 10 in `tools/librarian/test/librarian.test.mjs` verifying execution from `/tmp` (outside repo cwd) and failure on missing targets.
4. **Evidence Reconciliation**: Updated `evidence/WP-KAD-LIB-002/final-report.md` to record the historical failure of `76ac60c` and corrected the finding count to 6.

---

## 3. Local Verification Results

- `python3 validate_prime_directive.py` (from repo root and `/tmp`): **PASS** (Estimated tokens: 1478 <= 1500)
- `node tools/librarian/librarian.mjs verify`: **PASS** (22 docs, 21 cards, 16 concepts, 0 errors)
- `node --test tools/librarian/test/librarian.test.mjs`: **PASS** (11/11 tests passed)
- `node --test .agents/capabilities/ask_user/contract_test.mjs`: **PASS** (1/1 tests passed)
- `cd kad-lab && make test`: **PASS** (14/14 evidence cases passed)
