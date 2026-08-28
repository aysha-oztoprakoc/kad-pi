# Existing Cordis ownership discovery

The existing implementation is `@deepseek-ai/cordis` v4.0.1 at `/home/amdy/Work/tries/deepseek-harness-lab/vendor/cordis`.

- `new Context()` installs the root Fiber: `src/context.ts:70-83`.
- `Fiber.effect()` owns a cleanup returned by its effect: `src/fiber.ts:405-418`.
- Fiber unload drains all owned disposers and logs cleanup errors without suppressing other cleanup: `src/fiber.ts:675-686`.

This is a real Cordis ownership mechanism, not a Cordis-like local replacement. It cannot create a missing Pi unsubscribe contract.
