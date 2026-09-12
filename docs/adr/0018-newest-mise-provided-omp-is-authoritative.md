# ADR 0018: The Newest Mise-Provided OMP Is Authoritative

## Context

The OMP orchestration preflight asserted that the harness was release **18.0.9**, staged at
`.tools/oh-my-pi/v18.0.9` and described by `evidence/WP-KAD-OMP-001/install-manifest.json`. That
assertion had stopped describing the machine: `bin/omp-kad` resolves `which omp` first, which is
the mise-managed build (`github:can1357/oh-my-pi`), so the preflight certified a 194 MB binary that
no session executes. The published receipt said 18.0.9 while the running harness was 18.1.14.

The check was also fail-open. `inspectOmp` derived `version` from `observed.ompVersion`, and the CLI
entrypoint calls `inspectPreflight()` with no observations, so `observed.ompVersion` was always
`undefined`. The mismatch failure is pushed only `if (version && !versionMatches)`; with `version`
null, no failure is pushed at all. A receipt that cannot identify the harness therefore reported the
harness as acceptable — the same defect class as the spend and learning gates in ADR 0016/0017.

The operator's ruling (2026-09-12): **always use the newest OMP that mise provides**, exempt from
mise's `minimum_release_age` guard. Mise's default guard withholds any release younger than 24
hours, and it was materially behind the newest published build:

```
mise WARN newer github:can1357/oh-my-pi release 18.1.18 (released 2026-09-11,
eligible 2026-09-12 18:43 -03) ignored by minimum_release_age (24h);
latest eligible release is 18.1.17
```

The guard is a supply-chain soak: it trades freshness for a window in which a compromised or broken
release is likely to be caught by others first. Exempting one tool removes that window for that
tool. This ADR records the trade rather than hiding it.

## Decisions

1. **The authoritative OMP is the mise-provided build.** `~/.config/mise/config.toml` holds
   `github:can1357/oh-my-pi = "latest"` and, under `[settings]`,
   `minimum_release_age_excludes = ["github:can1357/oh-my-pi"]` — the setting mise documents as
   *"Tools and backends to exclude from the global/default minimum_release_age setting."* Other
   tools keep the 24-hour guard; only the harness is exempt.

2. **The launcher and the receipt both resolve the harness through mise, in this order:**
   `OMP_BINARY`, `mise which omp`, `omp` on `PATH`, then the KAD canary at
   `bin/omp-patched-canary`. The version is read by executing the binary that wins. A staged pin
   under `.tools/oh-my-pi/` and the legacy install manifest are reported as historical drift, never
   as authority.

   `PATH` alone is not sufficient, which this host demonstrated: `command -v omp` in a login shell
   answers `/home/amdy/.local/bin/omp` — a hand-installed 18.1.14 that precedes every mise path on
   `PATH` — while mise dispatches 18.1.18. A launcher trusting `which omp` ran the older build. The
   receipt reports such a shadow (`path_shadow`) and names the route it took (`via`), so the
   difference is visible without being fatal.

3. **An unidentifiable harness is blocking.** `OMP_VERSION_UNKNOWN` (a binary that will not report a
   version) and `OMP_BINARY_UNAVAILABLE` block the receipt. Failure to resolve is no longer a pass.

4. **Mise provenance is a degraded signal.** `OMP_BINARY_NOT_MISE_MANAGED` marks a receipt as
   DEGRADED rather than BLOCKED: running a non-mise harness contradicts decision 1, but a checkout
   without mise must still be able to produce a usable receipt. The origin is printed either way.

## Consequences

- **Positive.** The receipt describes the running harness. Version drift between the certified and
  the executed binary is no longer possible, because there is only one binary in the receipt. The
  operator's freshness preference is encoded in one setting and enforced by one gate.
- **Negative.** No soak window for OMP releases. A regression or a compromised release reaches this
  workspace within the hour it is published. The mitigations are that mise verifies GitHub artifact
  attestations and SLSA provenance at install time, that the receipt records the exact version so an
  incident is attributable, and that `bin/omp-kad` keeps its digest-pinned path for any explicitly
  patched canary. A bad release is recovered by pinning the previous version in mise, which is a
  deliberate, visible act rather than a silent fallback.
- **Superseded.** `evidence/WP-KAD-OMP-001/install-manifest.json` no longer certifies the harness. It
  remains as the historical record of the 18.0.9 qualification.
