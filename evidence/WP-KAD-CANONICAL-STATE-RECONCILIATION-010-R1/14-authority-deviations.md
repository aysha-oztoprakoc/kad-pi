# Authority Deviations & Mitigations

## Audit of Reported Authority Risks

### 1. Agent Approval Detection (`KAD_AGENT_EXECUTION`)
- **Reported Risk**: Approval relies on ambient `KAD_AGENT_EXECUTION` environment variable.
- **Audit Findings**:
  - `process.env.KAD_AGENT_EXECUTION === '1'` acts as a cooperative runtime guard against self-approval in automated subagent runs.
  - However, relying solely on an environment variable cannot provide hardware/kernel-enforced sandboxing.
- **Repairs Applied**:
  - Expanded check to include `OMP_AGENT` and `AI_AGENT` variables.
  - Enforced that proposal application requires a cryptographic receipt in `80_Review/Receipts/` with an exact SHA256 proposal hash, target canonical paths, target previous hashes, intended operations, and the canonical revision at approval time.
  - Documented honestly as an in-process cooperative guard backed by cryptographic receipt validation.

### 2. Proposal Target Scope (`applyProposal`)
- **Reported Risk**: Approved proposal could gain arbitrary vault-wide mutation rights.
- **Audit Findings**: Previously, `applyProposal` only checked `r.proposal_hash === sha256(proposal)`. It did not verify that the receipt bound the specific target paths or that target files hadn't been mutated between approval and apply.
- **Repairs Applied (TDD Verified)**:
  - Approval receipts now strictly bind `target_canonical_files`, `target_previous_hashes`, `intended_operation`, and `canonical_revision`.
  - `applyProposal` verifies:
    1. Target files match the receipt's target list.
    2. Operation matches the receipt's intended operation.
    3. Target file hash on disk matches `target_previous_hashes` (intervening mutation / race condition protection).
    4. Target file cannot be in unauthorized zones (`00_Governance/`, `80_Review/Receipts/`).

### 3. Context Retrieval Bounds (`query` / `search`)
- **Reported Risk**: Unbounded search across all vault directories could pull raw/unreviewed material.
- **Repairs Applied (TDD Verified)**:
  - Clamped query limit strictly between 1 and 50 (default 10).
  - Enforced that `contextEligible` strictly excludes non-canonical zones (`00_Governance/`, `10_Raw/`, `10_Inbox/`, `80_Review/`, `90_Derived/`, `99_Archive/`).
  - Required `review_status === 'APPROVED'`, `context_eligible === true`, `authority` in `[CANONICAL_KNOWLEDGE, CANONICAL_PROJECT_DECISION]`, and `epistemic_class !== 'UNKNOWN'`.

### 4. Redundant Reads in `lintVault`
- **Reported Risk**: `lintVault` called `fs.readFileSync` twice per note.
- **Repairs Applied**: Single-pass read per file: `const text = fs.readFileSync(file, 'utf8'); return { file, text, meta: noteMetadata(text, ...) };`.

### 5. Filename Migration Heuristics
- **Reported Risk**: Filename heuristics alone must not grant canonical authority.
- **Mitigation**: All 8 `MIGRATE_CANONICAL` files correspond directly to verified, accepted workpackages (`WP-001` through `WP-007`). Their canonical properties and IDs are validated against the property registry and schema during migration.
