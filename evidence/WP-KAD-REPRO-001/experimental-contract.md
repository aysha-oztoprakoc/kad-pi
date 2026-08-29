# WP-KAD-REPRO-001 — Reproducible Pi SDK Integration Gate

## Contract

- Resolve only the canonical project-scoped runtime at `.tools/kad/pi-sdk/0.84.3/runtime`.
- Permit `KAD_PI_SDK_ROOT` only as an explicit override carrying the same signed-by-repository provenance expectations; it is not a fallback.
- Accept only `@earendil-works/pi-coding-agent@0.84.3` and the previously accepted registry SHA-1, SHA-512 integrity, SHA-256, and SHA-512 digests.
- Verify package identity/version, tarball digests, package-lock digest, and the complete 1,044-file package inventory before import.
- Reject absent, global, ephemeral, wrong-version, wrong-package, tampered, or unreceipted candidates.
- Bootstrap with exact npm package/version, scripts disabled, and an atomic staged installation. Existing verified materialization is idempotent.
- Do not alter provider, swarm, economic, trust, authority, validation, lifecycle, spending, or acceptance architecture.
- Materialized SDK dependencies remain ignored work-local artifacts; the repository stores the resolver, bootstrapper, accepted provenance, tests, and evidence rather than generated `node_modules`.

## Acceptance commands

```sh
node tools/kad/pi/bootstrap-sdk.mjs --offline
node --test tools/kad/test/sdk-resolver.test.mjs
node --test tools/kad/test/pi-real-persistent.integration.test.mjs
node --test tools/kad/test/*.test.mjs
```

The final full invocation is run without masking failures.
