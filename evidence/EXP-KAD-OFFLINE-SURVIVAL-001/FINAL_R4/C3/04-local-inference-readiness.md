# C3-04 Local Inference Readiness

Runtime started through the existing manual KoboldCpp mechanism from `kad-sillytavern/RUNBOOK.md`:

```text
./koboldcpp/koboldcpp-linux-x64-nocuda --model /home/amdy/Work/.models/gguf/world/L3-8B-Stheno-v3.2-Q4_K_M.gguf --usevulkan 0 --gpulayers -1 --autofit --contextsize 8192 --batchsize 512 --host 127.0.0.1 --port 5001 --skiplauncher
```

A local-only bounded probe succeeded at `2026-08-31`:

- endpoint: `http://127.0.0.1:5001/v1`
- `/v1/models`: HTTP success; loaded identity `koboldcpp/L3-8B-Stheno-v3.2-Q4_K_M`
- `/v1/completions`: HTTP success; 6 prompt tokens, 4 completion tokens, 10 total
- response: non-empty local completion (`No other text.`)
- external network: not used
- paid provider: not used

Gate: `LOCAL_INFERENCE_READY`.

This proves availability, not performance or offline survival.
