# WP-KAD-COGNITIVE-TELEMETRY-031: 09 - Backlog & Experiment Discoveries

## 1. Backlog Discoveries

1. **`BP-KAD-TELEMETRY-HOOK-OMP-001`**: Automatic Turn-Level Intervention Capture Adapter
   - *Description*: Hook into OMP extension events to automatically infer `MANUAL_RETRY` and `CORRECTIVE_INTERVENTION` when prompt steerings occur immediately after tool failures.
   - *Impact*: Reduces manual annotation friction during prospective baseline collection.

2. **`BP-KAD-TELEMETRY-SOFIA-CHART-002`**: Sofia v3 Multi-Dimensional Vector Profile Widget
   - *Description*: Add an interactive radar/vector visualizer in Sofia v3 consuming `outcomes.jsonl` to render friction vs quality profiles without server-side daemons.
   - *Impact*: Enhances operator visibility into cognitive leverage trends.

## 2. Experiment Candidates

1. **`EXP-KAD-COGNITIVE-LEVERAGE-001`**: Comparative Cognitive Friction: Prompt-Driven vs Contract-Driven Execution
   - *Hypothesis*: Contract-driven workpackages with explicit ISA validation and deterministic gates produce 50%+ fewer corrective interventions per accepted outcome compared to unconstrained prompt loops.
   - *Telemetry Protocol*: Matched 10-unit trial comparing intervention count and low-leverage friction ratio under matched IMPLEMENTATION workloads.
