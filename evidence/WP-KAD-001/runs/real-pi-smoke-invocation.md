# Real Pi smoke invocation

Reality level: `LIVE_OBSERVED`

```bash
PI_CODING_AGENT_DIR=/tmp/wp-kad-001-pi-config \
PI_CODING_AGENT_SESSION_DIR=/tmp/wp-kad-001-pi-sessions \
PI_OFFLINE=1 PI_SKIP_VERSION_CHECK=1 \
KAD_PI_SMOKE_OUTPUT=/home/amdy/Work/evidence/WP-KAD-001/runs/real-pi-smoke.jsonl \
/home/amdy/.local/share/mise/installs/pi/0.84.3/pi/pi \
  --offline --no-session --no-extensions \
  -e /home/amdy/Work/kad-lab/exp-003-pi-tracer/test/real-pi-smoke.mjs \
  -p 'kad-real-pi-smoke'
```

Observed exit status: `0` (`real-pi-smoke.exit-status`). Captured process streams are `real-pi-smoke.stdout` and `real-pi-smoke.stderr`; both are empty. A second independent callback record is `real-pi-smoke-second.jsonl`.

Observed callback record:

```json
{"kind":"pi_input_callback","text":"kad-real-pi-smoke","source":"interactive"}
```

The extension's handler returned `{ action: "handled" }`; Pi documentation states that this skips agent processing. No provider/model call was requested by this invocation.
