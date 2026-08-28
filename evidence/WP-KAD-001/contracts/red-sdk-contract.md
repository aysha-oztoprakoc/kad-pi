# SDK KAD-PON contract RED evidence

Reality level: `INTEGRATION` for the real official SDK fixture; the target vertical slice is `RED`.

Command:

```bash
KAD_PI_SDK_ROOT=/tmp/wp-kad-001-sdk/runtime \
node --test test/sdk-kad-pon.contract.test.mjs
```

Exit status: `1`.

The direct diagnostic produced six semantic failures, each at the deliberately empty `mountKadPon()` seam with `NotImplemented: mountKadPon`. The SDK import, provenance check, real `createAgentSession()` fixture, Cordis construction, fail-closed provider counter, and complete installed-Pi distribution manifest check all initialized successfully. This is valid RED, not a fixture/import/syntax failure.
