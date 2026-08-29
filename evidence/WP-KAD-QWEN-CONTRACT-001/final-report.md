# WP-KAD-QWEN-CONTRACT-001 final report

## Verdict

CONTRACT_MISMATCH_CONFIRMED and SILENT_TRUNCATION_RISK_CONFIRMED for the frozen TOKENMAX shape under the currently evidenced local Qwen contract.

## Effective contract

- Effective OpenAI-compatible generation request: `max_tokens=192`, proven by local request-capture fixture with zero model inference.
- Pi declaration: `contextWindow=2048`, `maxTokens=192`, `samplingParams.max_tokens=192`.
- OMP declaration: `contextWindow=4096`, `maxTokens=256`.
- Task budget: `max_input_tokens=4096`, `max_output_tokens=512`.
- Kobold runtime context: current repository launch plan declares `--contextsize 2048`; current Qwen process was inactive, so current live runtime context is not freshly observed.

## R2 192-token saturation

OBSERVED against the captured effective request cap (`max_tokens=192`). R2 finish reason remains UNKNOWN, so this proves cap saturation, not backend truncation finish semantics.

## Frozen task fit

R2 archived attempts report 2302 and 2346 input tokens. Even with a 192-token reserve, both exceed a 2048 context. Component-level tokenizer split is unavailable; total attempt usage is the strongest archived evidence.

## Deterministic gate

When a local worker supplies `resource_contract`, `executeSwarm` now runs `required_prompt_tokens + required_output_reserve <= effective_context_window` and `requested_output_tokens <= effective_max_output_tokens` before `worker.execute`.
