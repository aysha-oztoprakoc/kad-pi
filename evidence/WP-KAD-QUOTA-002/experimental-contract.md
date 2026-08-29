# WP-KAD-QUOTA-002 — Observe real remote allowance state

## Boundaries

- Probe only the runtime inventory returned by `pi auth check --provider <id> --no-refresh --json`.
- Use provider-owned read-only surfaces; never create credentials, refresh OAuth, send model inference, scrape a browser, or mutate billing/provider state.
- Preserve native units and independent windows. `UNKNOWN` usage/capacity/remaining is not upgraded by authentication readiness or published policy.
- Keep provider parsers in `tools/kad/remote-quota-observation.mjs`; `economic-router.mjs` consumes normalized state only.
- Maintain spend invariants: PAYG disabled, paid fallback disabled, auto-topup disabled, incremental cost zero.

## Implemented seams

1. `normalizeQuota()` / `normalizeQuotaWindow()` — multi-window representation, effective bottleneck, freshness, confidence.
2. Provider parser seam — Codex fixture, OpenRouter key response, GitHub usage report, OpenCode declared policy.
3. `normalizeProviderWindows()` — provider-owned observation to normalized router input.
4. `BoundedQuotaProbeCache` — one-shot TTL cache, no daemon/polling.
5. Existing `routeEconomically()` / `quotaNotification()` — authority-first routing and targeted window events.

## Live probe

```sh
node tools/kad/run-remote-quota-probe.mjs > evidence/WP-KAD-QUOTA-002/live-probes-sanitized.jsonl
```

The probe uses `--no-refresh` auth checks and holds the already-authorized OpenRouter access token only in process memory for `GET /api/v1/key`; output is allowlisted/sanitized. GitHub uses the existing `gh` keyring session. Codex `/status` was bounded through a PTY and produced no machine-readable allowance; no model task was submitted.
