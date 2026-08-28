# 0002. Spatiotemporal Composability and Cordis Lifetime Ownership

## Status
Accepted

## Context
Components frequently execute unmanaged mutations, leak event listeners, and fail to clean up resources during teardown or error scenarios. Ambient authority and unmanaged side-effects make deterministic experimentation and graceful degradation impossible.

## Decision
We enforce Spatiotemporal Composability (STC) using Cordis as the lifetime and capability container:
1. Spatial: Components explicitly declare required dependencies (`coeffects`) and provided capabilities. No ambient global state is permitted.
2. Temporal: Every managed mutation (`effect`) must register its exact inverse upon application.
3. Teardown & Rollback: Component deactivation or partial activation failure unwinds registered effects in reverse order.
4. Cordis context boundaries govern service lifecycles (`Fiber.effect`, `ctx.on('dispose')`), ensuring zero listener residue on deactivation.
