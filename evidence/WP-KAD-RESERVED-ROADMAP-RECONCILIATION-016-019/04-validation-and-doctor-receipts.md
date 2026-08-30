# Validation & Doctor Receipts

## 1. Test Suite Execution
- **Command**: `node --test tools/kad/test/*.test.mjs tools/workspace/workctl.test.mjs`
- **Result**: `618 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo`
- **Duration**: ~10.3s
- **Status**: `PASS`

## 2. ISA Checks
- **Command**: `bin/kad-isa check vault/00_Governance/ISA-KAD-AESTHETIC-001.md`
- **Summary**: `10/10 claims PASS`
- **Status**: `PASS`

- **Command**: `bin/kad-isa check vault/00_Governance/ISA-KAD-COMPUTE-FABRIC-001.md`
- **Summary**: `12/12 claims PASS`
- **Status**: `PASS`

## 3. Governance Linters
- **Command**: `bin/kad-wiki lint`
- **Result**: `64 notes OK, 0 errors`
- **Status**: `PASS`

## 4. Platform Doctors
- **Command**: `bin/kad doctor`
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
- **Status**: `PASS`

- **Command**: `bin/workctl doctor`
  ```json
  {
    "status": "healthy",
    "errors": [],
    "warnings": [
      "skill-governance: 5-persona-advisory-board: LOCAL_DELTA",
      "skill-governance: ask-matt: LOCAL_DELTA",
      "skill-governance: code-review: LOCAL_DELTA",
      "skill-governance: domain-modeling: LOCAL_DELTA",
      "skill-governance: grill-with-docs: LOCAL_DELTA",
      "skill-governance: implement: LOCAL_DELTA",
      "skill-governance: improve-codebase-architecture: LOCAL_DELTA",
      "skill-governance: prototype: LOCAL_DELTA",
      "skill-governance: research: LOCAL_DELTA",
      "skill-governance: tdd: LOCAL_DELTA",
      "skill-governance: to-spec: LOCAL_DELTA",
      "skill-governance: to-tickets: LOCAL_DELTA",
      "skill-governance: triage: LOCAL_DELTA",
      "skill-governance: wayfinder: LOCAL_DELTA"
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
- **Status**: `HEALTHY` (0 errors)

## 5. Git Hygiene
- **Command**: `git diff --check`
- **Result**: Clean diff, zero whitespace errors or formatting issues.
- **Status**: `PASS`
