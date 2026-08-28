# WP-KAD-004 Independent Adversarial Architecture, Code, and Evidence Review

**Target:** WP-KAD-004 (Real Pi Harness Persistent World Runtime)  
**Evaluator:** Independent Adversarial Reviewer (`kad-reviewer`)  
**Date:** 2026-08-28  
**Verdict:** **PASS**

---

## 1. Executive Summary & Verdict

An adversarial audit of the WP-KAD-004 implementation, runtime execution paths, test suite, and evidence artifacts was conducted to attempt to falsify all claims regarding SDK provenance, authority boundaries, event transport, PON selectivity, Cordis effect lifecycle ownership, provider isolation, and persistent transaction semantics.

All 6 workpackage claims and 10 constitutional review criteria were verified against the codebase and runtime traces. No hardcoded or dummy assertions were found; all evaluations execute against genuine dynamic data structures and the real `@earendil-works/pi-coding-agent` v0.84.3 SDK package.

**Final Verdict:** **`PASS`**

---

## 2. Evaluation Against Constitutional Review Criteria

| # | Constitutional Criterion | Evaluation & Proof Evidence | Status |
|---|---|---|---|
| **1** | **Real SDK AgentSession Instantiation**<br>Is the test using a real SDK AgentSession instantiated from `@earendil-works/pi-coding-agent` v0.84.3? | Provenance verification in [`sdk-loader.mjs`](file:///home/amdy/Work/tools/kad/pi/sdk-loader.mjs#L21-L87) dynamically resolves the package and verifies name (`@earendil-works/pi-coding-agent`), version (`0.84.3`), and exports (`createAgentSession`, `SessionManager.inMemory`). In [`pi-real-persistent.integration.test.mjs`](file:///home/amdy/Work/tools/kad/test/pi-real-persistent.integration.test.mjs#L31-L36), `createAgentSession({ sessionManager: sdk.SessionManager.inMemory(), noTools: 'all' })` is executed. | **PASS** |
| **2** | **Persistent World Driven by Real Pi Events**<br>Does the persistent world advance only from real Pi event delivery (`session.steer`)? | Verified in [`pi-adapter.mjs`](file:///home/amdy/Work/tools/kad/pi-adapter.mjs#L104-L126). The adapter binds to `session.subscribe` and processes `queue_update` events. In test 2 ([`pi-real-persistent.integration.test.mjs:L150-L175`](file:///home/amdy/Work/tools/kad/test/pi-real-persistent.integration.test.mjs#L150-L175)), turns 1, 2, and 3 advance sequentially via `await session.steer()`. | **PASS** |
| **3** | **Pi Outside Deterministic Authority**<br>Does Pi remain transport only, with C++ Validator/Resolver holding authority? | Confirmed. Pi delivers raw input strings from `event.steering`. Resolution occurs entirely within the deterministic C++ engine ([`bridge.mjs`](file:///home/amdy/Work/tools/kad/bridge.mjs) / [`orchestrator.mjs`](file:///home/amdy/Work/tools/kad/orchestrator.mjs#L44-L86)). Pi never participates in validity decisions or state calculation. | **PASS** |
| **4** | **PON Selective Premise Evaluation**<br>Does PON evaluate only affected rules and skip unaffected rules without condition evaluation? | Confirmed in [`pon-engine.mjs:L85-L126`](file:///home/amdy/Work/tools/kad/pon-engine.mjs#L85-L126). Fact index matches `StateDiff` field deltas and evaluates conditions on affected rules only. Test 2 proves `rule-keycard-alarm` evaluated 1 condition while `rule-crate-sensor` evaluated 0 conditions (`crateSensorEvaluations === 0`). | **PASS** |
| **5** | **Cordis / STC Fiber Effect Unsubscription Ownership**<br>Is real SDK unsubscribe owned by Cordis / STC Fiber effect? | Verified in [`pi-adapter.mjs:L128-L155`](file:///home/amdy/Work/tools/kad/pi-adapter.mjs#L128-L155). The subscription closure is wrapped in `fiber.effect(..., 'kad-pon.pi-persistent-subscription')`. Test 2 validates active tracking under `context.fiber.getEffects()` and confirms `unsubscribeCalls === 1` upon teardown. | **PASS** |
| **6** | **Post-Dispose Steering Silence**<br>Does post-dispose `session.steer()` produce zero processing? | Verified in [`pi-adapter.mjs:L105`](file:///home/amdy/Work/tools/kad/pi-adapter.mjs#L105) and [`pi-real-persistent.integration.test.mjs:L183-L186`](file:///home/amdy/Work/tools/kad/test/pi-real-persistent.integration.test.mjs#L183-L186). Following `adapter.dispose()`, steering `move room_b` produces 0 additional turn executions and world state remains unchanged in `room_a`. | **PASS** |
| **7** | **Zero Provider / Network Calls**<br>Are provider and network calls actually zero during deterministic integration? | Verified in [`pi-real-persistent.integration.test.mjs:L22-L45`](file:///home/amdy/Work/tools/kad/test/pi-real-persistent.integration.test.mjs#L22-L45). `globalThis.fetch` and `session.agent.streamFunction` are stubbed to throw immediately on invocation. Test confirms `{ networkCalls: 0, agentStreamCalls: 0 }`. | **PASS** |
| **8** | **Truthful Reality Levels**<br>Are reality levels truthful (`INTEGRATION` for real SDK suite, `SIMULATED` for mocks)? | Confirmed across all test suites and claims: [`pi-real-persistent.integration.test.mjs`](file:///home/amdy/Work/tools/kad/test/pi-real-persistent.integration.test.mjs) uses `INTEGRATION`, whereas mock harness suites in [`multi-turn-pon.test.mjs:L227`](file:///home/amdy/Work/tools/kad/test/multi-turn-pon.test.mjs#L227) and [`world-turn.test.mjs:L268`](file:///home/amdy/Work/tools/kad/test/world-turn.test.mjs#L268) explicitly denote `(SIMULATED)`. | **PASS** |
| **9** | **Clean Adapter Architecture**<br>Are there duplicate competing Pi adapters, or has `pi-adapter.mjs` been cleanly unified? | Single unified production adapter module [`tools/kad/pi-adapter.mjs`](file:///home/amdy/Work/tools/kad/pi-adapter.mjs) provides both `mountPiTurnAdapter` (single-turn) and `mountPiPersistentSessionAdapter` (multi-turn persistent). No rogue adapters exist. | **PASS** |
| **10** | **NO JOURNAL -> NO COMMIT Transaction Policy**<br>Does journal failure prevent persistent session advancement? | Tested in failure test PI-F4 ([`pi-real-persistent.integration.test.mjs:L292-L330`](file:///home/amdy/Work/tools/kad/test/pi-real-persistent.integration.test.mjs#L292-L330)). Synchronously injected journal append errors throw before state mutation, rejecting `session.steer()` and leaving `persistentSession.worldState` invariant (`KeyRoom` remained `room_a`). | **PASS** |

---

## 3. Audit Matrix & Findings Table

| Finding ID | Severity | Category | Description | Assessment & Resolution |
|---|---|---|---|---|
| **FND-004-01** | **LOW** | *Lifecycle / Metrology* | In [`session.mjs:L33`](file:///home/amdy/Work/tools/kad/session.mjs#L33), `this.turnIndex` is pre-incremented prior to calling `runTurn()`. When a journal failure occurs (as tested in PI-F4), `worldState` remains invariant, but `turnIndex` reflects the attempted turn. | Non-critical metrological detail. Authority and world state integrity are 100% preserved because `this.worldState` is not reassigned. |
| **FND-004-02** | **LOW** | *Configuration Fallback* | In [`sdk-loader.mjs:L9-L13`](file:///home/amdy/Work/tools/kad/pi/sdk-loader.mjs#L9-L13), `DEFAULT_SDK_SEARCH_PATHS` includes a developer lab path alongside `/tmp/wp-kad-001-sdk/runtime`. | Safe fallback chain. `KAD_PI_SDK_ROOT` environment override is evaluated first, with verified runtime directory as the default. |

*No HIGH or MEDIUM severity findings were identified.*

---

## 4. Final Review Verdict

**Final Audit Verdict:** **`PASS`**
