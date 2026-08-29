# OMP role routing receipt — 2026-08-29

## Verdict

[OBSERVED] The project-local OMP routing policy is installed and parses. The deterministic KAD preflight is `DEGRADED`, not `GREEN`, because the Qwen endpoint is intentionally released after its lifecycle probe and is therefore unavailable at preflight time. No preflight failure remains: the enabled model surface is local-only and `new_paid_spend_possible` is `false`.

[DESIGN_DECISION] OMP supplies transport-level role selection. KAD remains the economic, capability, and trust authority. No project policy promotes an unknown local weight into an authority-sensitive role.

## Source-derived remote inventory

[SOURCE_DERIVED] `omp models <provider> --json` on this workstation returned the following exact catalog entries used or considered by the policy. Costs are catalog metadata, not a spend authorization.

| Provider / exact model ID | Context | Max output | Input modalities | Reasoning levels | Catalog economics / status |
|---|---:|---:|---|---|---|
| `openai-codex/gpt-5.6-luna` | 272,000 | 128,000 | text, image | low, medium, high, xhigh, max | Codex entitlement; authenticated probe succeeded |
| `openai-codex/gpt-5.4-mini` | 272,000 | 128,000 | text, image | low, medium, high, xhigh | Codex entitlement; authenticated catalog entry |
| `google-antigravity/gemini-3-flash` | 1,048,576 | 65,536 | text, image | minimal, low, medium, high | Antigravity entitlement; authenticated probe succeeded |
| `zai-free/glm-4.7-flash` | 200,000 | 128,000 | text | minimal, low, medium, high | Catalog says zero-cost; bounded CLI probe succeeded, but a later scout spawn received `401 token expired or incorrect` |
| `opencode-go/deepseek-v4-flash` | 1,000,000 | 384,000 | text | low, high, max | $0.22/$0.66 catalog; weekly quota pressure; not a permanent advisor |
| `groq/llama-3.1-8b-instant` | 131,072 | 131,072 | text | none | $0.05/$0.08 catalog; Groq credentials not verified, not used in fallback |

[SOURCE_DERIVED] Local OMP registry entries remain limited to `kad-local-world/kad-local-s13` and `kad-local-qwen/qwen-local`; their OMP metadata is context 4,096, max output 16,384 and 256 respectively, text input, non-reasoning. Full file/runtime/capability inventory is in `evidence/local-model-registry-2026-08-29.json`.

## Final role map

[DESIGN_DECISION] Project-local role selectors:

| Role | Selector | Bound | Purpose |
|---|---|---|---|
| `default` | `openai-codex/gpt-5.6-luna:medium` | medium | normal work |
| `plan` | `openai-codex/gpt-5.6-luna:high` | high | planning and orchestration |
| `slow` | `google-antigravity/gemini-3-flash:high` | high | strongest justified slow path |
| `advisor` | `google-antigravity/gemini-3-flash:low` | low | defined but globally disabled |
| `task` | `openai-codex/gpt-5.4-mini:low` | low | bulk task work |
| `smol` | `zai-free/glm-4.7-flash:minimal` | minimal selector | free-first bounded helper |
| `tiny` | `zai-free/glm-4.7-flash:minimal` | minimal selector | free-first mechanical helper |
| `commit` | `zai-free/glm-4.7-flash:low` | low | free-first commit helper |
| `designer` | `google-antigravity/gemini-3-flash:high` | high | multimodal design |
| `vision` | `google-antigravity/gemini-3-flash:high` | high | verified text+image input |
| `oracle` | `openai-codex/gpt-5.6-luna:max` | max | manual premium escalation only |
| `verifier` | `google-antigravity/gemini-3-flash:high` | high | independent provider-family review |
| `research` | `google-antigravity/gemini-3-flash:medium` | medium | research/synthesis |
| `world` | `kad-local-world/kad-local-s13:low` | low | Stheno WORLD-only |
| `local_retrieval` | `kad-local-qwen/qwen-local:low` | low | Qwen retrieval-only, conditional on health |
| `local_general` | unassigned | — | reserved; no qualified model |

[DESIGN_DECISION] `cycleOrder` remains exactly `[smol, default, slow]`; `oracle`, local roles, and custom escalation roles cannot be reached by cycling.

## Custom tags and agent routing

[OBSERVED] `modelTags` exposes `oracle`, `verifier`, `research`, `world`, `local_retrieval`, and hidden `local_general` labels. `modelRoleStorage: project` is effective.

[DESIGN_DECISION] `task.agentModelOverrides` routes the discovered project and bundled agents as follows:

| Agent | Role |
|---|---|
| `kad-master` | `@plan` |
| `kad-builder` | `@task` |
| `kad-tester`, `kad-reviewer` | `@verifier` |
| `kad-researcher`, `librarian` | `@research` |
| `kad-local-world` | `@world` |
| `kad-local-extractor` | `@local_retrieval` |
| `scout` | `@smol` |
| `sonic` | `@tiny` |
| `designer` | `@designer` |
| `reviewer`, `security-reviewer` | `@verifier` |

[OBSERVED] A bounded CLI probe selected `zai-free/glm-4.7-flash` for `@smol` and returned successfully at zero catalog cost. A later actual `scout` spawn also selected Z.AI but failed before a response with `401 token expired or incorrect`; no file changes occurred. Thinking metadata was not exposed in the child startup receipt, so the selector-bound level is the deterministic evidence. Refreshing Z.AI auth is required before treating free-first subagent routing as reliable.

## Fallback chains

[DESIGN_DECISION] `retry.modelFallback: true` and `retry.fallbackRevertPolicy: cooldown-expiry` are active. Explicit chains:

- `default` -> Gemini Flash medium.
- `plan` -> Gemini Flash high.
- `slow` -> Luna high.
- `advisor` -> Codex 5.4 Mini low.
- `task` -> Z.AI GLM-4.7 Flash low.
- `smol`, `tiny` -> Codex 5.4 Mini minimal.
- `commit` -> Codex 5.4 Mini low.
- `designer`, `vision` -> Luna high.
- `verifier` -> Luna high.
- `research` -> Codex 5.4 Mini low.
- `oracle`, `world`, `local_retrieval`, `local_general` -> no automatic fallback.

[DESIGN_DECISION] Groq is excluded until credentials and zero-dollar/paid economics are authenticated. OpenCode Go is excluded from permanent advisor and fallback policy because its quota is under pressure. The Z.AI free-first entries are conditional: an expired/unavailable Z.AI session should advance to the configured Codex candidate rather than retry indefinitely.

## Trust, lifecycle, and spend receipts

[OBSERVED] Stheno endpoint `http://127.0.0.1:5001/v1` returned HTTP 200 with identity `koboldcpp/L3-8B-Stheno-v3.2-Q4_K_M`; one bounded chat probe returned `LOCAL_OK`. It is registered only for `world` and remains an externally owned process.

[EXPERIMENT] The existing KAD `LocalInferenceCapability` activated the Qwen GGUF with the existing KoboldCpp 1.119 binary on `127.0.0.1:5002`, observed identity `koboldcpp/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Q4_K_M`, and one bounded chat probe returned `QWEN_OK`. The adapter then disposed its owned process; a follow-up health request returned HTTP `000` connection refused. No install, replacement, weight move, or persistent process was performed.

[OBSERVED] The final `node tools/kad/omp-orchestration-preflight.mjs` receipt was:

- status: `DEGRADED`
- OMP 18.0.9 matches the pinned manifest
- governance, skills, advisor-off, memory-off, and autolearn-off checks passed
- `world`: resolved; `local_retrieval`: unavailable after controlled release
- enabled model surface: `kad-local-world/*`, `kad-local-qwen/qwen-local`
- approved surface: `true`
- new paid spend possible: `false`
- failures: `[]`

[DESIGN_DECISION] The project `enabledModels` allowlist intentionally stays local-only. Remote models are reachable only through explicit role/fallback selectors and cannot become a generic project-enabled spend surface. `disabledProviders` explicitly contains `openrouter` because project arrays replace global arrays.

[OBSERVED] `task.enableEffort=false`, `advisor.enabled=false`, `memory.backend=off`, and `autolearn.enabled=false` are effective. With effort disabled, task callers cannot submit the dynamic per-spawn `effort` field; role selectors remain the level contract.

## Human actions remaining

- Refresh/re-authenticate Z.AI access if free-first subagent routing is required; the current child probe observed an expired token.
- Authenticate and independently validate Groq before adding it to any chain.
- Start Qwen through the existing KAD/STC lifecycle when retrieval work is required; do not run it as an unowned background service.
- Qualify RP-Hero and Lumimaid with bounded capability/trust probes before registering either model.
- Add a `tell` node only after its endpoint, runtime owner, and capability evidence exist.
