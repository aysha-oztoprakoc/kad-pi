# WP-041 Corrective Pass — Builder Specification

Authority: DeepSeek V4 Pro (spec) → DeepSeek V4 Flash (build) → Human (accept).

## Inputs (read-only, already on disk)
- `docs/state/schema/omp-settings-surface.json` — 478 setting IDs across 11 sections (authoritative `omp config list`).
- `evidence/WP-KAD-OMP-METAHARNESS-REFACTOR-041/omp-settings-snapshot.txt` — raw `omp config list` with OMP defaults + types.
- `.omp/config.yml` — KAD project overrides.
- `docs/state/schema/settings-matrix.schema.json` — 18-field per-row contract.

## KAD override set (from .omp/config.yml) — these settings are KAD-configured
`modelRoleStorage`, `modelRoles`, `modelTags`, `cycleOrder`, `enabledModels`, `disabledProviders`, `advisor.enabled`, `memory.backend`, `autolearn.enabled`, `autolearn.autoContinue`, `contextPromotion.enabled`, `compaction.enabled`, `compaction.midTurnEnabled`, `compaction.methodOrder`, `compaction.thresholdPercent`, `compaction.thresholdTokens`, `compaction.keepRecentTokens`, `compaction.autoContinue`, `skills.enabled`, `skills.enableAgentsProject`, `skills.enablePiProject`, `task.agentModelOverrides`, `task.agentAdvisor`, `retry.enabled`, `retry.modelFallback`, `retry.fallbackRevertPolicy`, `retry.fallbackChains`.

## Classification rules (apply to every one of the 478 settings)

- `KAD_DEFAULT` — KAD sets a project-scoped value that IS the desired default (the override set above, EXCEPT the restricted/wrapped ones listed below).
- `KAD_RESTRICTED` — value MUST be held for authority/security/spend/determinism. Includes: `disabledProviders` (openrouter), `advisor.enabled` (false), `autolearn.enabled` (false), `contextPromotion.enabled` (false), `memory.backend` (off), and every memory/learning subsystem setting (`memories.*`, `mnemopi.*`, `hindsight.*`, `sharpshooter.*`, `ttsr.*`, `recap.*`, `autolearn.*`). Flag any of these whose OMP default is non-off as `deviation`.
- `KAD_WRAPPED` — KAD deterministic tooling extends it: `compaction.*`, `retry.*`, `cycleOrder`, `task.agentModelOverrides`, `task.agentAdvisor`.
- `PASS_THROUGH` — KAD does not override and the OMP default is acceptable (appearance, tui, images, model thinking/temperature/tier, providers, shell, files, interaction, bash).
- `NOT_APPLICABLE` — irrelevant to KAD-PI (TTS voice, speech, live.voice, codex resets, collab, share, images.urls, codexResets, exa).
- `REQUIRES_HUMAN_POLICY` — credential/network/security implications: `auth.broker.*`, `secrets.enabled`, `tools.approvalMode`, `tools.approval`, `collab.*`, `share.*`, `searxng.*`, `hindsight.apiUrl`, `hindsight.apiToken`, `mnemopi.embeddingApiKey`, `mnemopi.llmApiKey`, `dev.autoqaPush.token`, `dev.autoqaConsent`.

## No-inference rule
`upstream_default` MUST be copied verbatim from the snapshot's `(type)`-annotated value. Where the snapshot shows `(not set)` or the default is absent, `upstream_default` = `null` and `current_result` = `UNKNOWN`. Do NOT guess a default.

## Per-row fields (all 18, per schema)
`setting_id, omp_version, schema_source, type, upstream_default, global_support, project_support, cli_override, runtime_override, precedence, kad_policy, kad_default, security_class, mutability, test_method, current_result, expected_result, deviation, rationale`.

- `omp_version` = `18.0.11`; `schema_source` = `omp config list`; `type` from snapshot; `precedence` = `project > global > default` for KAD-configured, else `default`; `mutability` = `project` for KAD-configured, else `global|project|cli` per snapshot; `test_method` = `omp config get <id>` or `config-list parse`; `expected_result` = KAD desired value (or `PASS_THROUGH` if none).

## Outputs (each builder writes exactly its files)
1. **Matrix builder**: overwrite `docs/state/OMP_SETTINGS_COMPATIBILITY_MATRIX.json` with 478 rows (one per setting id, no grouping, no omission, no duplicates). Then regenerate `docs/state/OMP_SETTINGS_COMPATIBILITY_MATRIX.md` as a per-section human projection.
2. **Test builder**: rewrite `docs/state/test/state-artifacts.test.mjs` — add an INDEPENDENT completeness test that loads `omp-settings-surface.json` (EXPECTED_SETTING_SET) and asserts the matrix's `setting_id` set equals it exactly (missing/duplicate/grouped → FAIL). Keep the existing 6 tests passing.
3. **State-model builder**: (a) regenerate `docs/state/CSA_ISA_GAP.json` — gaps solved by WP-041 (CSA, gap model, settings matrix) get `status: RESOLVED` and a `baseline` field recording the pre-WP-041 state; keep unresolved gaps with `BASELINE`/`RESOLVED` metadata. (b) strengthen `docs/state/CSA_KAD_PI_CURRENT.json` so every important mutable CURRENT fact carries mandatory `evidence` (source+command/hash); update `docs/state/test/state-artifacts.test.mjs` provenance test to require evidence on facts (not opt-in via state_class). Regenerate the two `.md` projections.

Do NOT touch: `.omp/config.yml`, skills, plugins, `tools/kad/`, global OMP, or unrelated residue. Do NOT commit, push, or run the full suite (Pro verifies).
