# WP-KAD-QUOTA-002 final report

## Verdict

**PARTIAL** — implementation is complete and safe; live visibility is partial because the authorized OpenRouter surface exposed usage but no numeric allowance, and no other provider exposed a trustworthy current allowance.

## Operational classification

- `IMPLEMENTATION: PASS`
- `LIVE_VISIBILITY: PARTIAL`

## Provider observations

| Provider | Surface | Authentication | Result | Windows | Confidence | Limitation |
|---|---|---|---|---:|---|---|
| `openrouter` | `GET /api/v1/key` | existing OAuth, no refresh | `OBSERVED` | 4 | usage `OBSERVED`; allowance `UNKNOWN` | `limit`, `limit_remaining`, and reset were null |
| `openai-codex` | installed Codex 0.150.1 `/status` | Pi OAuth ready | `PARSE_UNSUPPORTED` | 0 | UNKNOWN | bounded PTY produced no machine-readable allowance; no model task |
| `github-copilot` | user billing usage endpoint | existing GitHub session | `AUTH_INSUFFICIENT` | 0 | UNKNOWN | existing scopes lacked `Plan: read`; no scope/PAT change |
| `opencode-go` | native allowance status | Pi API key ready | `NOT_EXPOSED` | 0 | DECLARED policy only | CLI exposes local statistics/credentials, not current provider allowance |

OpenCode Go's published `$12` 5-hour, `$30` weekly, and `$60` monthly values remain `DECLARED`, with usage and remaining `UNKNOWN`.

## Economic state

OpenRouter returned provider-owned usage values of `0` for key, daily, weekly, and monthly surfaces. Each was preserved as a native `USD` window with `capacity: null`, `remaining: null`, and `status: UNKNOWN`. Effective bottleneck: `UNKNOWN`; no scalar capacity was fabricated.

## Routing

`DRY_RUN_ROUTE` selected the approved `openrouter-observed` subscription lane for a synthetic useful-work requirement, with `WATERMARK_UNKNOWN` and `QUOTA_UNKNOWN`. No model task was executed.

## Spend safety

`payg_authorized=false`, `allow_paid_fallback=false`, `allow_auto_topup=false`, `max_incremental_cost=0`. Observed OpenRouter usage and `is_free_tier=false` did not authorize spend.

## Security and PON

No credentials, bearer tokens, or authorization headers entered evidence. Auth checks used `--no-refresh`; the OpenRouter token was held only in process memory. No browser, provider mutation, synthetic inference, or polling daemon was used. PON evidence records probe requested/observed, per-window normalization, targeted route reconsideration, and identical-observation no-noise behavior.

## Tests

- Multi-window/provider tests: **22/22**.
- Prior quota/economic tests: **38/38**.
- Full KAD suite: **152/152**.
- Real Pi integration: **7/7**.
- Librarian: **11/11**.
- PRIME directive: pass, 1,478 estimated tokens <= 1,500.
- `git diff --check`: pass.

## Remaining limitation

No currently authorized provider exposed a trustworthy numeric current allowance/reset window; therefore live TOKENMAX scarcity ranking remains conservative and incomplete.

## Next smallest experiment

Check one provider-documented OpenRouter allowance surface, if one exists for the already-authorized OAuth scope, using the same bounded in-memory read-only method; otherwise stop and retain `UNKNOWN`.
