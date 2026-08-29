# WP-KAD-QWEN-CONTRACT-002 final report

## Verdict

PASS — LIVE_CONTRACT_PROVEN.

## Live Qwen identity

`koboldcpp/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Q4_K_M` from non-generative `GET /api/v1/model` during owned activation.

## Ownership

`OWNED`, PID `215607`, activated through `LocalInferenceCapability`; activation receipt existed during activation and was removed on dispose.

## Observed runtime context

`2048`, OBSERVED_RUNTIME from `/proc/215607/cmdline` containing `--contextsize 2048`.

## Observed/runtime output limit

No KoboldCpp process argv generation ceiling was present (`UNKNOWN` at runtime argv level). Effective output remains transport-proven `max_tokens=192` from WP-KAD-QWEN-CONTRACT-001.

## Declaration comparison

Task `4096/512`; Pi `2048/192`; OMP `4096/256`; STC launch `2048/context`; live process `2048/context`; transport output `192`. Effective contract: context `2048 OBSERVED_RUNTIME`, output `192 OBSERVED_NO_MODEL_INFERENCE`.

## Frozen TOKENMAX task fit

Canonical gate replay: `INITIAL_FIT=FAIL`, `REPAIR_FIT=FAIL`, `OUTPUT_FIT=FAIL`. Therefore `RESOURCE_CONTRACT_MISMATCH=CONFIRMED_LIVE` and `FROZEN_TASK=UNSATISFIABLE_FOR_CURRENT_QWEN_RESOURCE`.

## Generation cap saturation

Preserved as OBSERVED: R2 used 192 output tokens on both attempts and transport cap is 192.

## Historical R2 truncation

UNKNOWN. Finish reason remains unavailable; saturation is not upgraded to truncation.

## Zero-inference proof

`completion_requests=0`, `chat_completion_requests=0`, `controller_calls=0`, `remote_tokens=0`, `local_generation_calls=0`; only `/proc/<pid>/cmdline` and `GET /api/v1/model` were inspected.

## Lifecycle

Qwen was disposed and receipt removed. Postflight shows Qwen unavailable/inactive. External Stheno remains EXTERNAL WORLD and available.
