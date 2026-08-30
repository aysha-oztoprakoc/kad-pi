# Deterministic Validation Receipts (WP-028)

**Date**: 2026-08-30  
**Test Runner**: Node.js Test Runner (v26.7.0)  
**Execution Environment**: Linux x86_64 Arch Linux (Navi 44 / Radeon RX 9060 XT)

---

## 1. Primary Test Suite (`npm test`)

```bash
npm test
```
**Output Summary**:
```text
> kad-pi@0.1.0 test
> node --test tools/kad/test/*.test.mjs tools/workspace/workctl.test.mjs

ℹ tests 675
ℹ suites 0
ℹ pass 675
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 10050.137588
```
**Verdict**: `PASS` (675/675 tests passing, 0 failures).

---

## 2. KAD Doctor Diagnostics (`bin/kad doctor`)

```bash
bin/kad doctor
```
**Output**:
```text
KAD DOCTOR: PASS

  [✓] omp_extension            kad-control-plane extension registered
  [✓] workctl                  Workctl state clean (no active claim)
  [✓] economic_router          Economic policy active (paidAuthorized: false)
  [✓] observatory_journal      Journal valid (12 events recorded)
  [✓] readiness_gate           Gate active (status: UNKNOWN_DOMINATED, canary authorized: false)
  [✓] toolchain_trivy          Version: 0.74.0
  [✓] toolchain_gitleaks       gitleaks 8.30.1
  [✓] toolchain_amdgpu_top     amdgpu_top v0.11.5
```
**Verdict**: `PASS`

---

## 3. Workctl Ledger Doctor (`bin/workctl doctor`)

```bash
bin/workctl doctor
```
**Output**:
```json
{
  "status": "healthy",
  "errors": [],
  "warnings": [
    "skill-governance: 5-persona-advisory-board: LOCAL_DELTA",
    ...
  ],
  "toolStatus": [
    { "id": "workctl", "command": "bin/workctl", "available": true },
    { "id": "kad-knowledge", "command": "bin/kad-knowledge", "available": true },
    { "id": "kad-runtime-status", "command": "bin/kad-runtime-status", "available": true },
    { "id": "kad-interface-server", "command": "bin/kad-interface-server", "available": true },
    { "id": "make-verify", "command": "make verify", "available": true },
    { "id": "data-workspace-test", "command": "npm test", "available": true },
    { "id": "technopagan-test", "command": "bash tests/run_all.sh", "available": true }
  ],
  "llm_required": false
}
```
**Verdict**: `PASS` (`healthy`, 0 errors).

---

## 4. Ideal State Artifact Validation (`bin/kad-isa check all`)

```bash
bin/kad-isa check all
```
**Output Summary**:
- `ISA-KAD-AESTHETIC-001` (v1.0.0, domain: aesthetic): 10/10 claims PASS.
- `ISA-KAD-COMPUTE-FABRIC-001` (v1.0.0, domain: compute-fabric): 12/12 claims PASS.
**Total Claims Checked**: 22 claims.  
**Passed Claims**: 22 claims (100%).  
**Verdict**: `PASS`

---

## 5. Canonical Knowledge Vault Linter (`bin/kad-wiki lint`)

```bash
bin/kad-wiki lint
```
**Output**:
```json
{
  "ok": true,
  "errors": [],
  "count": 64
}
```
**Verdict**: `PASS` (64 notes verified, 0 errors).

---

## 6. Git Diff Whitespace & Hygiene Check (`git diff --check`)

```bash
git diff --check
```
**Output**: (Empty — clean)  
**Verdict**: `PASS`
