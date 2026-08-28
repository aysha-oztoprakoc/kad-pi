# Official Pi SDK 0.84.3 lifecycle micro-proof

Reality level: `INTEGRATION`.

The executable test is `kad-lab/exp-003-pi-tracer/test/sdk-lifecycle-microproof.mjs`, run against the provenance-verified SDK location in `sdk-package-provenance.json`.

Observed exit status: `0` (`sdk-lifecycle-microproof.exit-status`).

Observed result (`sdk-lifecycle-microproof.json`):

```json
{"package":"@earendil-works/pi-coding-agent","version":"0.84.3","event":{"type":"queue_update","steering":["kad-sdk-lifecycle-token"],"followUp":[]},"callbackCount":1,"providerCalls":0,"model":{"provider":"unknown","id":"unknown"},"unsubscribeType":"function","disposed":true}
```

The test replaces `globalThis.fetch` with a fail-closed counter/thrower and asserts `providerCalls === 0`. It starts with Pi's `unknown` placeholder model rather than a configured provider, observes exactly one callback from the first `steer`, calls the returned SDK unsubscribe, repeats the same `steer`, and observes no second callback.
