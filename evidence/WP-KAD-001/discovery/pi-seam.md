# Pi 0.84.3 lifecycle discovery

## PROVEN

- Installed binary: `/home/amdy/.local/share/mise/installs/pi/0.84.3/pi/pi`; `--version` printed `0.84.3`.
- `pi.on(event, handler)` is the sanctioned extension subscription API: `docs/extensions.md:1341-1345`.
- An `input` handler may return `{ action: "handled" }`; Pi then skips agent processing: `docs/extensions.md:895-902, 917-920, 935-939`.
- `session_shutdown` is emitted before started-session runtime teardown: `docs/extensions.md:516-525`.
- Extension factories may be async: `docs/extensions.md:154-181`.

## UNPROVEN / ABSENT FROM THE SANCTIONED SURFACE

- No public `pi.off`, `removeListener`, or unsubscribe is documented for `pi.on`.
- The installed embedded loader's `createExtensionAPI.on(event, handler)` appends the handler and returns `void`; it has no matching public removal method.
- The installed loader awaits a factory result but ignores the resolved value, so a factory-returned disposer is not a teardown contract.

## Consequence

Cordis can own a disposer, but Pi provides no sanctioned way for that disposer to withdraw a `pi.on` listener. Replacing it with EventEmitter removal would only be SIMULATED.
