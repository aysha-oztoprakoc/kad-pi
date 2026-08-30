---
doc_id: PI_HARNESS_INTEGRATION
title: "Integration: Pi Coding Agent SDK & Lifecycle Seams (WP-KAD-001)"
domain: PI_INTEGRATION
epistemic_status: CONFIRMED
source_documents:
  - wiki/KAD_PI_AGY_HANDOFF_2026-08-28.md
  - evidence/WP-KAD-001/final-report.md
  - evidence/WP-KAD-001/acceptance-amendment.json
  - evidence/WP-KAD-001/sdk-package-provenance.json
retrieval_keywords:
  - Pi Coding Agent
  - @earendil-works/pi-coding-agent
  - createAgentSession
  - session.subscribe
  - session.steer
  - queue_update
  - WP-KAD-001
  - Cordis mount
  - Teardown
---

# Integration: Pi Coding Agent SDK & Lifecycle Seams

## Executive Summary
This document specifies the integration seam connecting the **Pi Coding Agent** to the **KAD-PON / Cordis** runtime. Through empirical discovery in WP-KAD-001, we established that while Pi's CLI extension hook (`pi.on`) lacks unsubscription, the official `@earendil-works/pi-coding-agent` (v0.84.3) SDK provides full programmatic session subscription with explicit unsubscription closures, enabling true spatiotemporal lifecycle ownership.

---

## 1. Verified SDK Topology & Contracts

```text
       ┌───────────────────────────────────────────────────────────┐
       │         Provenance-Verified Pi SDK (v0.84.3)               │
       │         (@earendil-works/pi-coding-agent)                 │
       │                                                           │
       │   const session = await createAgentSession({ ... });      │
       │   const unsubscribe = session.subscribe(eventHandler);   │
       │   await session.steer({ ... });                           │
       └─────────────────────────────┬─────────────────────────────┘
                                     │
                                     │ (Sanctioned SDK Events)
                                     ▼
       ┌───────────────────────────────────────────────────────────┐
       │               Thin Pi Adapter (KAD-PON)                   │
       │                                                           │
       │   mountKadPon(ctx, session)                               │
       │   - Subscribes to session events                          │
       │   - Binds unsubscribe() to ctx.on('dispose')              │
       │   - Translates queue_update -> KadNotification            │
       └─────────────────────────────┬─────────────────────────────┘
                                     │
                                     │ (Typed Notification)
                                     ▼
       ┌───────────────────────────────────────────────────────────┐
       │              Cordis-Scoped KAD-PON Rule                   │
       │                                                           │
       │   rule: on(KadNotification) -> eval -> ActionIntent       │
       │   sink: records pure ActionIntent to Causal Journal       │
       └───────────────────────────────────────────────────────────┘
```

---

## 2. Invariants & Epistemic Distinctions

### Provenance & Upstream Purity
* **[OBSERVED]** **SDK Provenance**: Verified from registry `registry.npmjs.org/@earendil-works/pi-coding-agent/-/pi-coding-agent-0.84.3.tgz` with SHA1 `c040a5c2cfacd996731ce302a323269f124c8bdc` and SHA512 hash matches.
* **[DESIGN_DECISION]** **Installed Binary Immutability**: The locally installed binary at `/home/amdy/.local/share/mise/installs/pi/0.84.3/pi` must remain untouched and verified via pre/post cryptographic manifests.
* **[OBSERVED]** **Extension Smoke vs SDK Integration**:
  - `LIVE_OBSERVED`: Installed Pi CLI loads an extension and invokes the `input` callback.
  - `INTEGRATION`: Provenance-verified Pi SDK session generates real `queue_update` events routed into Cordis and cleanly torn down via `session.subscribe()` unsubscription.

### Lifecycle & Teardown Guarantees
* **[CONFIRMED]** **Post-Dispose Silence**: Calling `ctx.dispose()` executes `unsubscribe()`. Subsequent events emitted on `session` produce **zero** reactions in KAD rules or sinks.
* **[CONFIRMED]** **Failure Isolation**: If a rule or sink throws an exception, the error is recorded to the causal journal, no blind retries are executed, and the Cordis context disposes cleanly without hanging listeners.
* **[DESIGN_DECISION]** **Zero Runtime LLM Calls**: The tracer pipeline executes with deterministic mock providers or steer events; zero API tokens/calls are consumed at runtime.
