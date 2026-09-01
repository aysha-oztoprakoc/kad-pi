# WP-041 Second Corrective Pass — Delta Report

**Verdict**: all three contract violations corrected; all 10 verification checks pass. Awaiting human acceptance before push.

## Three violations → corrections

1. **schema_default ≠ effective_value.** Rebuilt the matrix from the exact OMP 18.0.11 source (`v18.0.11` → `b8ce33a5`, `packages/coding-agent/src/config/settings-schema.ts`) via static-schema-extraction. Each of the 481 settings now carries `schema_default` (+ `schema_default_kind`) from source and `effective_value` (+ `effective_source`) from `omp config list --json`, with `default_compatibility` and `effective_compatibility` evaluated separately. No effective value is copied into a default.
2. **Builder provenance.** Recorded `MODEL_ROUTING_DECISION.md`: capability-role routing (ROLE ≠ MODEL ≠ PROVIDER); `role.kad-builder → opencode-go/deepseek-v4-flash` as bootstrap/canary only; first-pass builders were `@task` = `openai-codex/gpt-5.4-mini` (corrected); second-pass extraction was deterministic (script, not LLM).
3. **RED receipt.** `red-receipt.txt`: corrected contract run against the preserved `47c7b59` snapshot (14-row matrix) → **6 FAIL / 3 PASS**. Current artifacts → **9/9 PASS** (GREEN). No history rewritten.

## Ten verification checks

1. 481 discovered OMP settings represented — PASS (surface re-parsed to fix hyphenated keys; surface == schema == 481).
2. No missing/duplicate setting IDs — PASS (exhaustive test).
3. `effective_value` vs `schema_default` distinct fields + distinct provenance — PASS.
4. No unsupported default inference — PASS (`schema_default_kind` ∈ literal/constant/undefined/unknown/arithmetic; no `copied`/`inferred`).
5. Deviations computed from correct value class — PASS (dual compatibility fields).
6. Builder provenance identifies actual model — PASS (`MODEL_ROUTING_DECISION.md`).
7. RED + GREEN receipts exist — PASS (`red-receipt.txt` + current 9/9).
8. CSA↔ISA post-WP consistency — PASS (3 `OWNED_BY_WP041` gaps RESOLVED).
9. Mandatory provenance valid — PASS (8 sections carry evidence).
10. Full regression green — PASS (**790/790**; `kad doctor` PASS; `workctl doctor` healthy; `git diff --check` clean).

## Semantic findings (deferred to policy)
- `tools.approvalMode` schema default is `yolo` (upstream auto-approve) — `REQUIRES_HUMAN_POLICY`; KAD effective value must be confirmed separately.
- Memory/learning subsystems (`memories.*`, `mnemopi.*`, `hindsight.*`, `sharpshooter.*`) default ON upstream but are dormant via `memory.backend=off`; `ttsr.enabled`/`recap.enabled` are independent interaction features defaulting ON — genuine policy candidates.
- 10 KAD-relevant `effective≠default` divergences (the project overrides) confirmed as intentional.

## Commit delta (prior commits preserved unamended)
`8cb52bb` → `47c7b59` → `13002b9` → `10ab1f3` → **`9ccc491`** (this pass, 7 files). Not pushed; `origin/main` remains `c029d90`.
