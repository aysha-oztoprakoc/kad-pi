# ADR 0019: Usage-Aware Retry Policy for the Subscription Lanes

## Context

Two OMP windows on the same Google account reported `google-antigravity` models as rate-limited
while the provider's own client (`agy`) showed quota available. The difference is not a contradiction
of fact, it is two different measurements:

1. OMP evaluates the *specific model bucket* the session is bound to, minus a reserve.
   `retry.usageReservePct` — *"Treat a coding-plan model as near its limit below this remaining
   percentage"* — defaults to **10**. Nothing in this workspace declared it, so the default applied,
   and a bucket with headroom below the reserve reads as unavailable.
2. `retry.maxDelayMs` — *"Maximum wait between retries, in ms. When the provider asks us to wait
   longer than this and no credential or model fallback succeeds, the request fails fast instead of
   sleeping (e.g. 3-hour Anthropic rate-limit windows). **0 disables the ceiling — to let the session
   auto-resume through provider-stated quota resets.**"* — defaults to **300000** (5 minutes), so a
   stated reset beyond five minutes could not be waited out. `retry.waitForUsageReset` is already
   `true` in the machine-level config; the ceiling was what made it inert.
3. Every fallback chain led with `google-antigravity/*`, so recovery from any saturated lane landed
   on the lane most likely to be saturated, and two windows sharing one account bucket contend
   directly.

## Decisions

1. **`retry.usageReservePct: 5`.** The reserve is halved rather than removed: a bucket genuinely at
   its limit still triggers fallback, but the false "near its limit" report starts at 5% instead of
   10%.

2. **`retry.maxDelayMs: 0`.** The documented setting for letting a session resume through a
   provider-stated quota reset. This is the operator's explicit preference: wait out the window
   rather than fail over.

3. **`retry.usageAwareFallback: true` and the tuning are declared in `.omp/config.yml`**, not left to
   machine-global defaults, so they are reviewable in git and comparable against the settings matrix.

4. **`retry.fallbackChains.default` leads with `openai-codex/*`.** Recovery should not prefer the
   bucket that most recently reported exhaustion.

## Consequences

- **Positive.** The reserve no longer reports healthy quota as exhaustion, and a stated reset is
  waited out instead of surfacing as "rate-limited". Both values are declared and diffable.
- **Negative.** With `maxDelayMs: 0` a session can sleep through a long provider-stated window
  instead of failing fast. The wait is abortable with Esc, but it also holds subagents, so an
  unattended run can stall where it previously failed fast. Reverting is a one-line change to
  `maxDelayMs`. Windows on one account remain a shared bucket: no configuration makes two
  simultaneous sessions independent of it.

## Amendment — 2026-09-12: the procedure was wrong on the KAD path

The Context note above says `retry.waitForUsageReset` "is already `true` in the machine-level
config". That is true of the ambient `omp` flow and **false** of `bin/omp-kad` runs: the launcher
redirects `PI_CODING_AGENT_DIR` into `.state/omp-kad/<profile>`, so the machine-level agent config
is deliberately not read. Measured both ways on this checkout:

| invocation | `omp config get retry.waitForUsageReset` |
| --- | --- |
| `omp` in this directory (ambient agent dir) | `true` |
| `PI_CODING_AGENT_DIR=.state/omp-kad/agent omp …` (until this amendment) | `false` |

So decision 2's ceiling had been lifted on a path where the wait itself was disabled: KAD runs
failed fast instead of resuming through a stated reset — the opposite of the declared preference —
and the setting that decided it lived outside the repository, where no review could see it.

**Decision 5.** Each launcher profile declares its retry posture in the repository and installs it as
that profile's agent-dir config: `config/omp-interactive.yml` (`waitForUsageReset: true`, the default
profile) and `config/omp-unattended.yml` (`false`, selected by `bin/omp-kad --unattended`). An
interactive session may wait out a stated reset because a human can abort it; an unattended run has
nobody to abort it and must fail fast. `tools/kad/test/launcher-profiles.test.mjs` pins the wiring,
and the resolved value stays re-checkable with
`PI_CODING_AGENT_DIR=.state/omp-kad/<profile> omp config get retry.waitForUsageReset`.
