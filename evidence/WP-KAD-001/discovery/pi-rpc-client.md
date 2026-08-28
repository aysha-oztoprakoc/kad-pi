# Installed Pi 0.84.3 RPC/client discovery

## PROVEN

- The actual installed executable supports official JSONL RPC mode: `pi --mode rpc`; see `docs/rpc.md:1-37`, `docs/usage.md:168-176`.
- RPC commands and events travel as JSONL over stdin/stdout. `queue_update` is documented: `docs/rpc.md:80-100,832-860`.
- The embedded RPC server calls `session.subscribe(event => output(toJsonEvent(event)))`; that server-owned subscription is released only at RPC process shutdown.
- `steer` calls `session.steer()`, whose embedded implementation emits `queue_update` before handing work to the agent queue. This remains STATIC-only for zero model calls.

## ABSENT

- The documented RPC protocol has no observer subscribe/unsubscribe, observer id, disconnect-observer, or AbortSignal command. `abort` concerns active agent work, not observer removal.
- `package.json` declares `./client` and `./rpc-entry` exports under `dist/`, but the targets are absent, as is root `dist/index.js`.
- The embedded `RpcClient.onEvent()` has a local callback removal closure, but it is not an importable sanctioned installed export.
- A local stdout parser can detach only from its own stream; it cannot withdraw Pi's server-side process subscription. It is therefore not a valid Cordis-owned Pi listener disposer.

## Consequence

`pi_rpc_path = BLOCKED` for the frozen teardown invariant. The official protocol remains valuable for diagnostic-only live events, but cannot form the required subscription-withdrawal chain.
