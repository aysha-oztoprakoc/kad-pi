# WP-KAD-QUOTA-001 closure

## Verdict

**PASS** — adapter implementation and live observation boundary passed. Live numeric quota visibility remains **UNKNOWN**, truthfully.

## Final commit

Recorded in the closure response after the scoped commit.

## Provider inventory

- `openai-codex/gpt-5.6-luna`: `PARTIALLY_OBSERVABLE`; authenticated status `ready`, quota not exposed.
- `github-copilot/gpt-5.6-luna`: `PARTIALLY_OBSERVABLE`; status ready, not adapted.
- `opencode-go/gpt-5.6-luna`: `PARTIALLY_OBSERVABLE`; status ready, not adapted.
- `openrouter/openai/gpt-5.6-luna`: `PARTIALLY_OBSERVABLE`; status ready, not adapted.

## Live quota visibility

**UNKNOWN**. The selected provider-owned command was `pi auth check --provider openai-codex --no-refresh --json`. It returned authenticated `ready`/OAuth state but no quota, remaining, capacity, unit, or reset fields.

## Normalized observation

`status=UNKNOWN`, `unit=null`, `remaining=null`, `capacity=null`, `reset_at=null`, `watermark=UNKNOWN`, `confidence=UNKNOWN`, with an observed timestamp, sanitized-source hash, parser version, model scope, window scope, and freshness TTL.

## Economic routing

The existing provider-agnostic router selected the approved controller lane with `ELIGIBLE`, `EXECUTION_CLASS_REMOTE_SUBSCRIPTION`, `WATERMARK_UNKNOWN`, and `QUOTA_UNKNOWN`. Trust, capability, authority, and spend checks remained dominant. Synthetic fixtures proved GREEN/YELLOW/RED/EXPIRING/STALE behavior without being presented as live quota.

## Spend safety

PAYG, paid fallback, and auto-topup remain disabled. Quota observation grants no spend authority.

## PON

Emitted and recorded: `provider.quota.observed`, `quota.normalized`, `quota.unchanged`, and `economic.route.reconsidered`. Identical observations create no affected decision path.

## Security

Credential-like fields are redacted before receipt/hash generation. No credential-bearing material was stored. `secret-redaction-receipt.json` is PASS.

## Tests

- New adapter tests: **17/17 PASS**.
- Existing relevant KAD tests: **109/109 PASS**.
- Prior accepted swarm integration evidence: **7/7 PASS**.
- Librarian: **11/11 PASS**.
- Prime, syntax, JSON/config validation, replay, and economic routing: **PASS**.

The full KAD command was also attempted; seven existing integration tests require an absent provenance SDK fixture and were not masked.

## Evidence

`evidence/WP-KAD-QUOTA-001/` contains the baseline, inventory, contract, sanitized live observation, normalized state, routing receipt, quota events, replay receipt, redaction receipt, claim ledger, regression report, and adversarial review.

## Remaining limitation

The configured provider exposes authentication readiness but no trustworthy numeric quota/reset state through the permitted read-only surface; live quota remains UNKNOWN.
