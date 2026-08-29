# WP-KAD-MATT-001 capability matrix

Evidence sources: local copies under `agent/skills/`, the tracked `skills-lock.json`, and WP-SKILL-002 classification artifacts. No upstream update was installed.

| Matt mechanism | Existing KAD equivalent | KAD treatment | Deterministic opportunity / risk |
|---|---|---|---|
| Progressive disclosure and context pointers (`writing-for-agents`) | Context trails exist in WP-KAD-005; no KAD-specific distillation pointer | **ADAPT** | Static contract test can verify pointers and authority links; stale/weak pointers remain a variance risk |
| Small composable skills (`writing-for-agents`, `tdd`, `code-review`) | `.agents/skills` composition and KAD tests | **DUPLICATE / ADAPT** | Preserve composition, but KAD gates must remain authoritative |
| Handoff | `handoff` is already present and classified KEEP_AS_IS | **DUPLICATE** | No new implementation justified |
| `to-spec` | Existing skill classified COMPOSED | **DUPLICATE** | Its tracker and human-interaction assumptions do not belong in KAD evidence gates |
| Setup skill | Existing `setup-matt-pocock-skills` and `skills-lock.json` | **REJECT as runtime dependency** | Setup is prompt-driven and must not mutate KAD automatically |
| Model-independent process | PRIME_DIRECTIVE role/provider separation | **DUPLICATE / ADAPT** | Candidate contains no provider/model names; deterministic verifier remains final authority |
| Router skills | Existing local capability router | **DISTILL / DUPLICATE** | Route deterministic machinery before models; do not add another router |
| TDD / review composition | Existing tests and CI | **DUPLICATE** | Candidate uses one narrow contract test rather than a new framework |
| External provenance/version pinning | `skills-lock.json` | **ADOPT** | Hash and source path are recorded; lock is evidence, not authority |
