# WP-KAD-REPRO-001 final report

## Outcome

The Pi SDK integration gate is now reproducible from repository-controlled metadata. The resolver uses the canonical `.tools/kad/pi-sdk/0.84.3/runtime` materialization and fail-closes on missing, wrong, global, ephemeral, or tampered candidates. `KAD_PI_SDK_ROOT` is an explicit verified override, not a fallback.

The bootstrap obtains exactly `@earendil-works/pi-coding-agent@0.84.3`, verifies the previously accepted registry and tarball digests before extraction, installs with scripts disabled, records a content-addressed artifact receipt, and atomically finalizes the canonical runtime. The generated runtime is ignored; a clean checkout can reproduce it with `node tools/kad/pi/bootstrap-sdk.mjs` (or `--offline` when the exact npm cache material is present).

## Proof

- Resolver TDD: **14/14 pass**.
- Real Pi persistent integration: **7/7 pass**.
- Full KAD suite: **130/130 pass**.
- Canonical bootstrap repeated successfully with an identical `already-verified` receipt.
- Real SDK package identity/version and content integrity were confirmed; provider network and agent-stream calls remained zero in the integration isolation test.

## Boundaries

Stheno remains external and WORLD-only. Qwen remains retrieval-only. KAD retains authority over trust, capability, validation, lifecycle, spending, and acceptance. No PAYG, auto-top-up, new provider, credential, routing, swarm, quota, or economic policy was added or changed. Existing unrelated dirty/untracked paths were preserved and not staged.
