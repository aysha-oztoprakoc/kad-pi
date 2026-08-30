# Successor Handoff: GitHub Operationalization, Commit & Vault Projection (WP-028)

**Date**: 2026-08-30  
**Handoff Author**: Gemini 3.7 Flash High (Implementation Agent, WP-028)  
**Pre-requisite Baseline**: `ISA-KAD-SKILL-ROLE-002 / v1.1.0` Frozen Snapshot (675/675 tests PASS)

---

## 1. Governing Sequence

The post-snapshot operationalization **MUST** execute in this strict, linear 3-phase sequence:

```text
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│         PHASE A         │     │         PHASE B         │     │         PHASE C         │
│  GitHub Operationalize  │ ──> │   Git Commit & Push     │ ──> │  Vault/Wiki Projection  │
│  (Workflows/Governance) │     │ (Canonical Repository)  │     │ (Derived from Git SHA)  │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

---

## 2. Phase A: GitHub Operationalization

### Objectives:
1. Configure only the GitHub workflows and governance policies strictly required by `ISA-KAD-SKILL-ROLE-002` and repository validation.
2. Verify GitHub Actions workflow definitions:
   - CI workflow running `npm test` and `bin/kad doctor` on PR/push.
   - Deterministic pre-commit / pre-push sanity checks.
3. Establish branch protection rules on `main`:
   - Require linear history.
   - Require status checks to pass before merging.
   - Enforce signed commits / verified actors.

### Invariants:
- Do not add remote governance that overrides `workctl` local authority.
- Do not enable auto-merge.

---

## 3. Phase B: Canonical Git Commit + Push

### Objectives:
1. Verify working tree status:
   ```bash
   git status
   git diff --check
   npm test
   ```
2. Stage and commit the complete accepted repository baseline with an authoritative commit message.
3. Verify remote ancestry (`git fetch origin main`) and push using fast-forward only:
   ```bash
   git push origin main
   ```
4. Record the resulting pushed commit SHA (e.g. `COMMIT_SHA`).

---

## 4. Phase C: Canonical Vault / Wiki Projection

### Objectives:
1. Using the exact pushed commit SHA as provenance, update the local Vault/Wiki.
2. Compile derived projections:
   ```bash
   bin/kad-isa compile all
   bin/kad-wiki rebuild
   ```
3. Update `vault/00_Governance/` with the official markdown projection of `ISA-KAD-SKILL-ROLE-002` if promoted to canonical governance notes.
4. Record provenance metadata in vault notes referencing `COMMIT_SHA`.

### Invariants:
- The Vault **MUST NOT** describe uncommitted local state as canonical.
- Vault updates are strictly derived projections of the committed, pushed Git state.
