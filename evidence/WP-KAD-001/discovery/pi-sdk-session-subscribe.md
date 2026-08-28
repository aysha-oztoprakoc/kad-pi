# Pi 0.84.3 SDK session.subscribe discovery

## PROVEN

- `createAgentSession()` is the SDK's main `AgentSession` factory: `docs/sdk.md:46-63`.
- `AgentSession.subscribe(listener)` returns `() => void`, explicitly documented as an unsubscribe function: `docs/sdk.md:66-80`.
- Session replacement documentation calls `unsubscribe()` before subscribing to the replacement session: `docs/sdk.md:161-178`.
- `abort(): Promise<void>` and `dispose(): void` are public lifecycle APIs: `docs/sdk.md:102-110`.
- Documented events include `queue_update`: `docs/sdk.md:262-325`.
- Installed executable source confirms `AgentSession.subscribe` stores the actual listener and its returned closure removes that same listener. It also confirms `session.steer(text)` emits `queue_update` before delegating to agent steering. These symbols are embedded in `/home/amdy/.local/share/mise/installs/pi/0.84.3/pi/pi`.
- Therefore the required sequence is supported by actual Pi SDK semantics: subscribe -> `await session.steer(token)` -> receive `queue_update` -> unsubscribe -> `await session.steer(token)` -> no callback.
- Cordis `Fiber.effect()` can own the returned real `() => void` directly (see `cordis-seam.md`).
- No installed Pi distribution mutation is required by this public API.

## UNKNOWN

- The installed mise binary distribution's `package.json` declares `./dist/index.js`, but `dist/` is absent. It cannot be directly imported as the SDK package in its current layout. A live integration must use a version-pinned, external `@earendil-works/pi-coding-agent@0.84.3` package and prove that provenance without modifying the installed distribution.

## Architecture implication

`pi_extension_path = BLOCKED`; `pi_sdk_path = candidate`. The WorkPackage remains `PARTIAL` until the actual SDK import and teardown run is tested.
