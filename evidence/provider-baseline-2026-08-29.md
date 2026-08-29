# OMP Provider Readiness Baseline — 2026-08-29

## Scope and evidence status

`[OBSERVED]` This is an environment observation for the KAD-PI OMP bridge. It does not modify KAD application code or final model roles. Claims marked `[OBSERVED]` come from commands or probes run during this work package. Provider metadata marked `[SOURCE_DERIVED]` comes from the official Z.AI API documentation.

`[OBSERVED]` The requested `/home/amdy/Work/kad-pi` path is absent on this machine; the active KAD-PI repository is `/home/amdy/Work`, identified by `PRIME_DIRECTIVE.md`, the `.omp/` bridge, and the KAD gates.

## OMP baseline

| Item | Observation |
|---|---|
| Global OMP | `[OBSERVED]` v18.0.10 at `~/.local/share/mise/installs/github-can1357-oh-my-pi/18.0.10/omp` |
| KAD bridge OMP | `[OBSERVED]` v18.0.9 at `.tools/oh-my-pi/v18.0.9`, executable and manifest-matched |
| Update check | `[OBSERVED]` v18.0.10 already up to date |
| Secret obfuscation | `[OBSERVED]` changed from `secrets.enabled=false` to `secrets.enabled=true` |
| KAD preflight | `[OBSERVED]` `DEGRADED`, because local Qwen retrieval endpoint is unavailable; OMP, governance, authority, spend, and WORLD checks pass |
| Active project model surface | `[OBSERVED]` `kad-local-world/*` and `kad-local-qwen/qwen-local` only; no remote model was enabled in `.omp/config.yml` |
| OpenRouter policy | `[OBSERVED]` global `disabledProviders` now contains `openrouter`; no paid fallback is active |

## Reproducibility receipts

`[OBSERVED]` Receipts were collected on 2026-08-29 on Linux x64. Commands were run from `/home/amdy/Work`; credential checks reported presence/absence only. No credential value or private prompt content was recorded.

| Command | Sanitized result |
|---|---|
| `omp --version` | `omp/18.0.10` |
| `bin/omp-kad --version` | `omp/18.0.9` |
| `omp update --check` | `Current version: 18.0.10; Already up to date` |
| `omp config get secrets.enabled` | `true` |
| `omp models groq --json` | `{"models":[]}` |
| `omp models zai-free --json` | One model: `zai-free/glm-4.7-flash`, context `200000`, max `128000`, zero listed cost |
| `omp --no-session --no-tools --model openai-codex/gpt-5.6-luna:high -p 'Return exactly: CODEX_OK'` | `CODEX_OK` |
| `omp --no-session --no-tools --model google-antigravity/gemini-3-flash:low -p 'Return exactly: ANTIGRAVITY_OK'` | `ANTIGRAVITY_OK` |
| `omp --no-session --no-tools --model opencode-go/deepseek-v4-flash:low -p 'Return exactly: OPENCODE_GO_OK'` | `OPENCODE_GO_OK` |
| `omp --no-session --no-tools --model github-copilot/claude-haiku-4.5:low -p 'Return exactly: COPILOT_OK'` | Timed out after 120 seconds while still `Working...` |
| Unauthenticated POST to `https://api.z.ai/api/paas/v4/chat/completions` with model `glm-4.7-flash` | HTTP `401`; sanitized body `{"error":{}}` |
| Local POST to `http://127.0.0.1:5001/v1/chat/completions` with Stheno model and `LOCAL_OK` prompt | HTTP `200`; response model `koboldcpp/L3-8B-Stheno-v3.2-Q4_K_M`; content `LOCAL_OK` |
| `node tools/kad/omp-orchestration-preflight.mjs` | Exit `2`; status `DEGRADED`; Qwen retrieval unavailable; spend and authority checks passed |
| `make test` | Completed successfully; all invoked validation suites reported passing |
| Credential presence loop | `GROQ_API_KEY=MISSING`, `ZAI_API_KEY=MISSING`, and all other checked API-key variables missing; OAuth presence only was counted |
| `omp auth-broker list --json` | OAuth/login IDs included `openai-codex`, `github-copilot`, `google-antigravity`, `zai`, and `zai-coding-plan`; no `groq` ID |
| `omp token zai --list`, `omp token zai-coding-plan --list`, `omp token groq --list` | Zero stored accounts for each |
| Byte scan of installed OMP binary for provider literals | `groq` count `62`; `zai-coding-plan` count `1`; `api.z.ai/api/coding` count `1`; no secret-like values emitted |
| `omp usage --provider openai-codex/google-antigravity/opencode-go --json` with identity fields removed | Codex Plus quota allowed; Antigravity daily entitlement available; OpenCode Go 5-hour/month capacity available, weekly usage warning |
| `omp usage --provider github-copilot --json` with identity fields removed | Individual account; chat limit `200`, completions limit `2000`; premium limit `0` |
| `omp models kilo --json` | Selected catalog model listed nonzero input/output cost |
| `omp models nvidia --json`, `omp models ollama-cloud --json` | Catalogs present; no credential/entitlement proof |
| `omp config get disabledProviders` | `["openrouter"]` |

## Mutation ownership and reversibility

`[DESIGN_DECISION]` The user-authorized OMP baseline permits global OMP configuration changes but forbids KAD application changes, spend, and credential disclosure. `[OBSERVED]` The only global mutations were enabling `secrets.enabled`, adding the non-secret `zai-free` model declaration, and disabling `openrouter`. `[DESIGN_DECISION]` These are OMP-owned, externally controlled configuration effects and are reversible by restoring the prior setting, removing `zai-free` from `~/.omp/agent/models.yml`, and removing `openrouter` from `disabledProviders`; no rollback claim is made for remote provider state.

`[OBSERVED]` No subscription, billing, credit purchase, autorecharge, API-key creation, or OAuth login was performed by this work package.

## Groq root cause and fix

`[OBSERVED]` The installed OMP binary contains a `groq` provider registry with OpenAI-compatible base URL `https://api.groq.com/openai/v1`; the provider is absent from `omp auth-broker list --json`, which is the installed interactive-login registry. `omp models groq --json` returned an empty model list. `GROQ_API_KEY` was absent. `[HYPOTHESIS]` The combined evidence explains the observed `/login` absence as an interactive-handler plus credential-resolution boundary, not as proof that the provider implementation is unsupported.

`[OBSERVED]` No credential was created or copied. Groq remains `HUMAN_ACTION_REQUIRED` until a GroqCloud API key is securely injected as `GROQ_API_KEY`. No discovery or inference request was made without a key; no blind retry occurred.

## Z.AI root cause and fix

`[OBSERVED]` Installed OMP provider code defines the built-in `zai` key-entry validation against `https://api.z.ai/api/coding/paas/v4` and model `glm-5.2`. The installed auth registry also exposes `zai` and `zai-coding-plan` as Coding Plan entries.

`[SOURCE_DERIVED]` Official Z.AI documentation defines the general Open Platform route as `https://api.z.ai/api/paas/v4/chat/completions`, lists `glm-4.7-flash`, and describes GLM-4.7-Flash as completely free with 200K context and 128K maximum output. The API is OpenAI-compatible and documents text input, thinking, function calling, and structured output capabilities. Sources:

- https://docs.z.ai/api-reference/llm/chat-completion
- https://docs.z.ai/guides/llm/glm-4.7

`[OBSERVED]` An unauthenticated POST to the official general endpoint returned HTTP 401. `ZAI_API_KEY` was absent, so key validity and authenticated inference could not be established. `[HYPOTHESIS]` A general Open Platform key may fail the built-in Coding Plan validation because the configured validation path and model differ from the general route; this remains untested until a credential is available.

`[OBSERVED]` Minimal fix applied: added a distinct `zai-free` provider to `~/.omp/agent/models.yml` with the general Open Platform base URL, `api: openai-completions`, `apiKey: ZAI_API_KEY`, and only the documented `glm-4.7-flash` metadata. `omp models zai-free --json` now resolves `zai-free/glm-4.7-flash` with 200000 context, 128000 max output, text input, and zero listed cost. The built-in `zai` Coding Plan semantics were not changed.

`[OBSERVED]` Inference remains `HUMAN_ACTION_REQUIRED` until `ZAI_API_KEY` is securely injected. No key value appears in this artifact.

## Live provider matrix

`[OBSERVED]` Provider IDs, model IDs, credential presence, catalog rows, and probe results in this table are direct observations. `[SOURCE_DERIVED]` Z.AI's zero-dollar classification is supported by the official model documentation cited above. `[OBSERVED]` Groq pricing and entitlement were not established, so Groq is intentionally `UNKNOWN`; no unverified free quota is claimed. `[DESIGN_DECISION]` Policy statuses such as `DEFER_PAID` and `DISABLED_PAYG` are explicit decisions from the no-spend requirement, not provider self-reports.

| Provider | Actual model ID | Economic class | Auth | Probe / discovery | Status |
|---|---|---|---|---|---|
| `openai-codex` | `gpt-5.6-luna` | `FIXED_ALREADY_PAID` | Stored OAuth account (presence only) | `CODEX_OK`; usage reports Plus quota | PASS |
| `google-antigravity` | `gemini-3-flash` | `FIXED_ALREADY_PAID` | Stored OAuth account (presence only) | `ANTIGRAVITY_OK`; usage reports daily entitlement | PASS |
| `opencode-go` | `deepseek-v4-flash` | `FIXED_ALREADY_PAID` | Stored entitlement resolved by OMP | `OPENCODE_GO_OK`; usage reports OpenCode Go quota | PASS; weekly quota near limit |
| `groq` | Not discovered | `UNKNOWN` | `GROQ_API_KEY` missing | Registry present; no request | HUMAN_ACTION_REQUIRED |
| `zai-free` | `glm-4.7-flash` | `RECURRING_FREE [SOURCE_DERIVED]` | `ZAI_API_KEY` missing | Static discovery PASS; unauthenticated endpoint probe HTTP 401 | HUMAN_ACTION_REQUIRED |
| `github-copilot` | `claude-haiku-4.5` | `UNKNOWN` | Stored OAuth account (presence only) | 200 chat / 2000 completion quota observed; minimal probe timed out | PARTIAL; zero-dollar economics unverified |
| `kilo` | `~deepseek/deepseek-v4-flash-latest` | `DEFER_PAID` | Stored OAuth account (presence only) | Catalog model cost is nonzero; no probe | DEFER_PAID |
| `nvidia` | `abacusai/dracarys-llama-3_1-70b-instruct` | `UNKNOWN` | API key missing | Catalog present with zero listed cost; entitlement unproven | HUMAN_ACTION_REQUIRED |
| `ollama-cloud` | `deepseek-v4-flash` | `UNKNOWN` | Credential missing | Catalog present; no entitlement probe | HUMAN_ACTION_REQUIRED |
| `google` | Not selected | `UNKNOWN` | Credential missing | No direct Google API credential; no probe | DEFERRED |
| `mistral` | Not selected | `UNKNOWN` | API key missing | No credential; no probe | DEFERRED |
| `vercel-ai-gateway` | Not selected | `DISABLED_PAYG` | Missing | No free-only guarantee; not enabled | DISABLED |
| `cloudflare-ai-gateway` | Not selected | `DISABLED_PAYG` | Missing | No free-only guarantee; not enabled | DISABLED |
| `openrouter` | Not selected | `DISABLED_PAYG` | Missing | 51 `:free` catalog rows exist, but deterministic free-only routing cannot be guaranteed | DISABLED |
| `cursor` | Not selected | `UNKNOWN` | Stored credential presence | Optional provider; no economic proof or probe | DEFERRED |
| `cerebras` | Not selected | `UNKNOWN` | Missing | No model catalog or credential | DEFERRED |
| `huggingface` | Not selected | `UNKNOWN` | Missing | Catalog present; no entitlement proof | DEFERRED |

## Local capability

`[OBSERVED]` `http://127.0.0.1:5001/api/v1/model` returned `koboldcpp/L3-8B-Stheno-v3.2-Q4_K_M`, and one tiny OpenAI-compatible chat request returned exactly `LOCAL_OK` with HTTP 200. The KAD preflight classifies this as an external, available WORLD resource. The Qwen retrieval endpoint at `127.0.0.1:5002` was unavailable. No local engine was installed and no KAD local adapter was changed. The existing Stheno WORLD-only boundary remains intact.

## Proposed model roles (not applied)

`[HYPOTHESIS]` These are proposals based only on successful provider/model probes and static catalog capability metadata. They are intentionally not written to final role configuration.

| Role | Proposed selector | Basis |
|---|---|---|
| `default` | `openai-codex/gpt-5.6-luna:high` | Successful Codex probe; current session role |
| `plan` | `openai-codex/gpt-5.6-luna:xhigh` | Same verified paid family; stronger reasoning setting, unprobed |
| `slow` | `google-antigravity/gemini-3-flash:low` | Successful independent paid-family probe |
| `advisor` | `opencode-go/deepseek-v4-flash:low` | Successful independent provider-family probe |
| `task` | Unassigned | No recurring-free inference PASS yet |
| `smol` | Unassigned | No recurring-free inference PASS yet |
| `tiny` | Unassigned | No recurring-free inference PASS yet |
| `vision` | `openai-codex/gpt-5.6-luna:high` | Catalog advertises image input; image request not probed |

## Readiness gate

`[OBSERVED]` OMP installation healthy: PASS for the KAD-pinned v18.0.9 bridge; global v18.0.10 is current.
`[OBSERVED]` Secret obfuscation enabled: PASS.
`[HYPOTHESIS]` Groq root cause is the diagnosed interactive-handler/credential boundary; inference: NOT READY.
`[HYPOTHESIS]` Z.AI root cause is the diagnosed Coding Plan versus general Open Platform route mismatch; general provider config/static discovery: PASS; authenticated inference: NOT READY.
`[OBSERVED]` OpenAI Codex: PASS.
`[OBSERVED]` Google Antigravity: PASS.
`[OBSERVED]` OpenCode Go: PASS.
`[OBSERVED]` At least two independent recurring-free remote providers: NOT MET; Groq and Z.AI await credentials, GitHub Copilot probe timed out.
`[OBSERVED]` Local inference preserved: PASS for existing Stheno WORLD capability; Qwen retrieval remains unavailable.
`[OBSERVED]` New paid service, credit purchase, billing activation, and autorecharge: none performed.
`[OBSERVED]` Paid OpenRouter fallback: PASS; provider disabled globally and project remote surface remains disabled.
`[OBSERVED]` Baseline recorded: PASS.
`[OBSERVED]` Final role configuration derived empirically: NOT APPLIED; proposals recorded above.

## Remaining human actions

1. Securely provide a GroqCloud API key as `GROQ_API_KEY`.
2. Securely provide a general Z.AI Open Platform key as `ZAI_API_KEY` (not a Coding Plan-only credential).
3. After both variables resolve in the OMP process environment, run exactly one discovery and one tiny `GROQ_OK` / `ZAI_FREE_OK` probe per provider. Do not paste values into chat.

## KAD research decision

`[DESIGN_DECISION]` `NO-GO` for declaring the requested provider baseline READY. The machine is `READY_WITH_DEFERRED_OPTIONALS` for the already-paid pools and preserved local WORLD path, but it is not yet ready to claim the requested two-provider recurring-free gate or to activate Elicit Plus based on this work package. Literature accumulation and a fresh KAD-PI OMP research session should wait until the two free-provider credentials are injected and probes pass.
