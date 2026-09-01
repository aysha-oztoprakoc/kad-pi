# WP-041 Corrective Pass — Delta Report

**Verdict**: corrective pass complete; artifacts now satisfy the semantic-review contract. Awaiting human acceptance before push.

## Proof of the six required properties

### 1. Exhaustive OMP settings coverage
`docs/state/schema/omp-settings-surface.json` captures the **478** unique settings across **11** sections from `omp config list` (18.0.11). The matrix has exactly 478 rows; the independent test asserts `matrix.setting_ids == surface.setting_ids` (missing/duplicate/invented → FAIL). Prior matrix was 14 group-level rows.

### 2. Zero unsupported inferred upstream defaults
440 settings carry `upstream_default` copied verbatim from the `omp config list` snapshot; **38** are `null` where the snapshot reports `(not set)`/absent. No value is guessed. Test asserts `upstream_default !== undefined` for every row.

### 3. Post-execution CSA↔ISA consistency
The three `OWNED_BY_WP041` gaps (CSA, gap model, settings matrix) are now `status: RESOLVED` with a `baseline` field recording their pre-WP-041 absence. Unresolved gaps (context7, global-config, skill-rationalization, WP-033/019/040, TELL) remain `OPEN` with owners.

### 4. Mandatory provenance coverage
CSA now carries `evidence {source, command|hash|path}` on all 8 required sections (`repository`, `hosts.amdy`, `hosts.tell`, `harnesses.omp`, `knowledge_plane`, `skills`, `compute`, `security`). The provenance test requires evidence by contract — omitting `state_class` no longer exempts a fact.

### 5. Flash builder / Pro verifier separation
- **Pro** (orchestrator): discovered settings, wrote `corrective-spec.md`, wrote the corrected `state-artifacts.test.mjs` (TDD red), semantically verified output.
- **Flash** (2 `task` builders): `MatrixRebuilder` (478-row matrix) and `StateModelRebuilder` (gap + CSA). Neither edited the test or made architecture decisions.
- **Human**: acceptance authority (this report).

### 6. Full regression non-regression
`node --test tools/kad/test/* tools/workspace/workctl.test.mjs docs/state/test/*` → **789/789 PASS** (781 pre-existing + 8 characterization). `kad doctor` PASS, `workctl doctor` healthy, `kad-wiki lint` PASS, `git diff --check` clean.

## Semantic findings surfaced (deferred to human policy)
- `tools.approvalMode = yolo` → `REQUIRES_HUMAN_POLICY` (auto-approves all tool calls; conflicts with KAD authority model).
- `secrets.enabled = true` → `REQUIRES_HUMAN_POLICY`.
- 84 settings `KAD_RESTRICTED` (memory/learning subsystems, spend gates, authority gates); `ttsr.enabled`/`recap.enabled`/`hindsight.autoRecall`/`mnemopi.autoRecall` default ON upstream and are governed only by `memory.backend=off` — flagged for follow-up.

## Commit delta (preserving prior commits unchanged)
- `8cb52bb` WP-041 artifacts (unchanged)
- `47c7b59` transition to REVIEW (unchanged)
- `13002b9` corrective delta (this pass): 9 files, +11719/−213.
- Not pushed. `origin/main` remains `c029d90`.
