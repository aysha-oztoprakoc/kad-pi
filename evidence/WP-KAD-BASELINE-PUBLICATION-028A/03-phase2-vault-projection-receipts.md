# Phase 2: Exact-SHA Vault Projection Receipts (WP-028A)

**Workpackage ID**: `WP-KAD-BASELINE-PUBLICATION-028A`  
**Execution Phase**: `PHASE_2_EXACT_SHA_VAULT_PROJECTION`  
**Date**: 2026-08-30  
**Remote Provenance Anchor SHA**: `1c8c9dff3391193b19b72308d3e4da85882aa365`  
**Host Environment**: Linux x86_64 Arch Linux (Kernel 7.1.9) / AMD Radeon RX 9060 XT  

---

## 1. Provenance Anchoring

* **Canonical Remote SHA**: `1c8c9dff3391193b19b72308d3e4da85882aa365`
* **Canonical Remote Branch**: `main`
* **Remote Repository**: `https://github.com/aysha-oztoprakoc/kad-pi.git`
* **Remote CI Run**: Run ID `33328656696` (`success`)

---

## 2. Projection Compilation Commands & Results

| Subsystem | Command | Result Summary | Exit Code | Epistemic Status |
|---|---|---|---|---|
| **ISA Projections** | `bin/kad-isa compile all` | 2 ISA projections compiled; registry updated at `vault/90_Derived/Projections/isa-registry.json` | `0` | `PASS` |
| **Wiki Manifest & Projections** | `bin/kad-wiki rebuild` | Manifest rebuilt with 64 registered notes; projections updated in `docs/generated/`, `vault/90_Derived/`, and `site/generated/` | `0` | `PASS` |

---

## 3. Post-Projection Verification Suite

| Verification Check | Command | Result Summary | Exit Code | Epistemic Status |
|---|---|---|---|---|
| **Primary Test Suite** | `npm test` | 675/675 tests PASS, 0 failures, duration: 14.67s | `0` | `PASS` |
| **ISA Governance Check** | `bin/kad-isa check all` | 22/22 claims PASS (10 Aesthetic + 12 Compute Fabric) | `0` | `PASS` |
| **Knowledge Vault Linter** | `bin/kad-wiki lint` | 64/64 notes clean, 0 syntax/frontmatter errors | `0` | `PASS` |
| **Workctl Ledger Doctor** | `bin/workctl doctor` | Status healthy, 0 errors | `0` | `PASS` |
| **KAD Operator Doctor** | `bin/kad doctor` | All 8 diagnostic checks clean (PASS) | `0` | `PASS` |

---

## 4. Invariant Verification

1. **No Authority Inversion**: Vault updates are strictly derived projections of the canonical Git state.
2. **Deterministic Reproducibility**: Running `bin/kad-isa compile all` and `bin/kad-wiki rebuild` reproduces exact projection JSON structures without manual intervention.
3. **No Unintended Promotion**: No architecture from the reconciled intention alignment report was prematurely promoted into canonical governance notes.

---

## 5. Phase 2 Verdict

**`VAULT_PROJECTED_FROM_EXACT_SHA`**  
Projections compiled from exact remote SHA `1c8c9dff3391193b19b72308d3e4da85882aa365` and fully validated by all deterministic validators.
