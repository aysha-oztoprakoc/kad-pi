# 0006. Pi 0.84.3 SDK Session Subscription Integration Seam

## Status
Accepted

## Context
In WP-KAD-001, tracing real agent lifecycle events through Pi coding agent required identifying a sanctioned integration seam. While extension `input` hooks allow live callback interception, `pi.on` does not provide an unsubscription or disposal contract. In contrast, the official `@earendil-works/pi-coding-agent` SDK exports `createAgentSession()` where `session.subscribe()` returns an explicit disposal cleanup function `() => void`.

## Decision
We establish the sanctioned integration seam for Pi lifecycle tracing:
1. Live execution uses provenance-verified `@earendil-works/pi-coding-agent` 0.84.3 SDK.
2. The lifecycle is mounted into Cordis via `mountKadPon(ctx, session)`.
3. `session.subscribe()` registers event listeners that are bound to the Cordis context teardown hook (`ctx.on('dispose', unsubscribe)`).
4. `session.steer()` drives deterministic `queue_update` events through the adapter.
5. The locally installed binary distribution of Pi remains completely unmodified as an immutable reference baseline.
