# Adversarial review

| Attack | Result |
|---|---|
| Provider text injects routing instructions | Raw status is parsed only for structured quota fields; no instructions are consumed. |
| Malformed output becomes GREEN | Fails closed to UNKNOWN. |
| UNKNOWN becomes zero/infinity | Remaining and capacity remain null. |
| Stale observation becomes fresh | Freshness TTL produces STALE. |
| Remaining exceeds capacity | Capacity/remaining are preserved as observed; no token conversion or authority grant occurs. |
| Past reset becomes EXPIRING | Expiring requires reset_at >= observation time and healthy headroom. |
| Unlimited string becomes numeric infinity | Numeric fields require finite numbers. |
| Model quota leaks to another model | `QUOTA_SCOPE_MISMATCH` rejects unrelated model scope. |
| Quota overrides trust/capability | Economic routing runs after eligibility. |
| Quota authorizes PAYG | Adapter exposes no spend authority; router rejects PAYG by policy. |
| Credentials enter evidence | Key names and credential-like strings are redacted; only sanitized hash/receipt is retained. |
| Identical observation creates churn | `quota.unchanged` has no affected lane IDs. |
| Parser change silently changes replay | Parser/normalization versions and sanitized source hash are recorded; frozen replay passes. |
| Provider outage breaks local/deterministic routing | Adapter returns UNKNOWN without throwing; economic fallback remains available. |

No unresolved acceptance-critical issue was found. Live quota visibility remains UNKNOWN, as required by the evidence boundary.
