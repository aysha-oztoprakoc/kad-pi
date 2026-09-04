# OMP Patch Deployment & Runtime Canary Receipt

**Date**: 2026-09-03  
**Target Repository**: `github:can1357/oh-my-pi@18.0.11` (commit `b8ce33a58911c26bed1d48f0d9ba5e2e727c49a2`)  
**Workspace**: `<workspace-root>`  
**Verdict**: `UPSTREAM_DEFECT_MITIGATED_LOCALLY`  
**Status**: Bounded patched canary deployed and verified in isolation. Stock OMP binary retained intact.

---

## 1. Binary & Source Identities

| Component | Path | SHA256 Checksum | Version / Ref |
|---|---|---|---|
| **Stock OMP Executable** | `~/.local/share/mise/installs/github-can1357-oh-my-pi/latest/omp` | `23f92de8671db116515ab93c5dd728e63238ebf75025e2430a81f8aa6b4c036f` | `omp/18.0.11` |
| **Patched Canary Executable** | `bin/omp-patched-canary` | `e0ff9cf2fc622d775597c970d6dcbba6b1ca93ea10c52ae2ad60b0ef9cc34ed3` | `omp/18.0.11` (patched) |
| **Upstream Git Revision** | `/tmp/oh-my-pi` | `b8ce33a58911c26bed1d48f0d9ba5e2e727c49a2` | `tag: v18.0.11` |
| **Unified Source Patch** | `OMP_ROUTING_AUTH_FIX.patch` | `88c9cfddc38096f4df3d47ad96e2a225434ce88ec0c5417ae41e5446f25091a1` | 220 lines (81 additions, 23 deletions) |

---

## 2. Build Receipt

- **Build Environment**: Arch Linux x86_64, Bun v1.4.0 (Linux x64)
- **Working Directory**: `/tmp/oh-my-pi/packages/coding-agent`
- **Build Command**: `mise exec -- bun scripts/build-binary.ts`
- **Build Artifact**: `/tmp/oh-my-pi/packages/coding-agent/dist/omp` (192MB ELF 64-bit binary)
- **Archive Copy**: `cp dist/omp ./bin/omp-patched-canary && chmod +x ./bin/omp-patched-canary`

```text
$ bun scripts/generate-client-bundle.ts --generate
$ bun run build.ts
Building Tailwind CSS...
Building React app...
Build complete
Generated src/embedded-client.generated.txt
$ bun scripts/build-tool-views.ts
Generated ../coding-agent/src/export/html/tool-views.generated.js (277.8 KiB)
$ bun scripts/embed-native.ts
$ bun scripts/embed-native.ts --reset
$ bun scripts/generate-client-bundle.ts --reset
Reset src/embedded-client.generated.txt
```

---

## 3. Runtime Canary Verification Results

**Test Script**: `bun scripts/runtime-canary-suite.mjs`  
**Execution Mode**: Exercises `bin/omp-patched-canary` and patched runtime modules against isolated fixtures in `/tmp/canary-*`.  
**Overall Result**: **7/7 PASS (100% Deterministic)**

| Scenario ID | Test Scenario | Verified Behavior | Pre/Post SHA256 Invariance |
|---|---|---|:---:|
| **C1** | Canary binary execution | Runs standalone, prints `omp/18.0.11` | N/A |
| **C2** | Read config via CLI | `omp config get modelRoles --json` produces zero config mutation | Global & Project hashes 100% invariant |
| **C3** | Explicit project assignment | Persists strictly to project config; global config completely untouched | Global hash 100% invariant; Project updated |
| **C4** | Explicit global assignment under `modelRoleStorage: project` | Persists strictly to global config; project config completely untouched | Project hash 100% invariant; Global updated |
| **C5** | Value-neutral assignment (no semantic change) | Completely bypasses write syscall; comments, mtime, and file hashes preserved | Global & Project hashes 100% invariant; mtime unchanged |
| **C6** | Temporary model switch (`setModelTemporary`) | Ephemeral session switch only; zero disk I/O | Global & Project hashes 100% invariant |
| **C7** | Session startup, restore, and restart | Rehydrates session without mutating persisted config | Global & Project hashes 100% invariant |

### Exact Canary Execution Output
```text
=== OMP RUNTIME CANARY VERIFICATION SUITE ===
Target Executable: bin/omp-patched-canary
Executable SHA256: e0ff9cf2fc622d775597c970d6dcbba6b1ca93ea10c52ae2ad60b0ef9cc34ed3
Stock Executable:  ~/.local/share/mise/installs/github-can1357-oh-my-pi/latest/omp
Stock SHA256:       23f92de8671db116515ab93c5dd728e63238ebf75025e2430a81f8aa6b4c036f

[PASS] C1: Canary binary version
   version: omp/18.0.11
[PASS] C2: Config read produces ZERO mutation
   globalBefore: 25248226a04524a21482598fd29b74b93db718aa65f718325c4501d5a76da93c
   globalAfter: 25248226a04524a21482598fd29b74b93db718aa65f718325c4501d5a76da93c
   projectBefore: abe3b5ec50d7b09da952291e5ca76b4294e4c64dec1bdc5603012b64a13dd175
   projectAfter: abe3b5ec50d7b09da952291e5ca76b4294e4c64dec1bdc5603012b64a13dd175
[PASS] C3: Explicit project assignment updates PROJECT only
   globalHashUnchanged: true
   projectHashChanged: true
   projectContainsNewModel: true
[PASS] C4: Explicit global assignment while storage=project updates GLOBAL only
   projectHashUnchanged: true
   globalHashChanged: true
   globalContainsNewModel: true
[PASS] C5: Value-neutral assignment preserves mtime, SHA256 & comments
   globalHashUnchanged: true
   projectHashUnchanged: true
   mtimeUnchanged: true
   commentsPreserved: true
[PASS] C6: Temporary model switch produces ZERO config mutation
   globalHashUnchanged: true
   projectHashUnchanged: true
[PASS] C7: Session startup & restart produces ZERO config mutation
   globalHashUnchanged: true
   projectHashUnchanged: true

Canary Results: 7/7 PASS
CANARY VERIFICATION SUCCESS: All runtime scenarios verified.
```

---

## 4. Current KAD Configuration State

- **File**: `.omp/config.yml`
- **Accepted Baseline Restored**:
  - `modelRoleStorage: project`
  - `modelRoles.default: opencode-go/deepseek-v4-flash:high` (human-authorized canary)
  - Full D5 security posture comment block and settings preserved.
- **Git Status**: Clean (`git diff -- .omp/config.yml` is empty).
- **Global Config State** (`~/.omp/agent/config.yml`):
  - `modelRoleStorage: project`
  - `modelRoles.default: null` (no rogue default persisted)
  - `modelRoles.advisor: google-antigravity/gemini-3.7-flash:high`

---

## 5. Rollback Procedure

Because the user's primary OMP binary was **NOT overwritten**, rolling back or removing the patched canary is instantaneous and risk-free:

1. **Remove Patched Canary Binary**:
   ```bash
   rm bin/omp-patched-canary
   ```
2. **Revert Temporary Git Checkout in `/tmp`**:
   ```bash
   rm -rf /tmp/oh-my-pi
   ```
3. **No changes were made to system PATH or mise configuration**:
   `which omp` remains `~/.local/share/mise/installs/github-can1357-oh-my-pi/latest/omp`.
