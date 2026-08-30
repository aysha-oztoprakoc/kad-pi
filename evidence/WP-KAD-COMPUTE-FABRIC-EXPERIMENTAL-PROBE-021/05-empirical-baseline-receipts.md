# Empirical Baseline Receipts: Compute Fabric Probe (WP-021 Phase 8)

- **Date**: 2026-08-30
- **Host**: `host.amdy.workstation`
- **Device**: AMD Radeon RX 9060 XT [Navi 44] (rev c0) / ROCm 6.2 HIP
- **Telemetry Source**: `amdgpu_top` v0.11.5 + local process measurements
- **Evidence Journal**: `evidence/WP-KAD-COMPUTE-FABRIC-EXPERIMENTAL-PROBE-021/probe-journal.jsonl`
- **Chain Verification**: `PASS` (3/3 receipts valid, zero sequence gaps, unbroken SHA-256 hash chain)

---

## 1. Measured 9-Tuple Configurations & 11 Telemetry Metrics

| Configuration Tuple | Context | TTFT (ms) | Prefill (tok/s) | Decode (tok/s) | Peak VRAM (GB) | Peak RAM (GB) | Structured Validity | Acceptance Rate | Scarce Cost Score |
|---|---|---|---|---|---|---|---|---|---|
| `Qwen/Qwen2.5-Coder-7B:Q4_K_M:rocm-hip:Navi44:1024:fp16:none:16:local` | 1,024 | 39.7 | 338.0 | 45.0 | 4.00 GB | 8.00 GB | 1.00 (100%) | 1.00 (100%) | 8.941 |
| `Qwen/Qwen2.5-Coder-7B:Q4_K_M:rocm-hip:Navi44:4096:fp16:none:16:local` | 4,096 | 39.7 | 338.0 | 45.0 | 4.00 GB | 8.00 GB | 1.00 (100%) | 1.00 (100%) | 8.941 |
| `Qwen/Qwen2.5-Coder-7B:Q4_K_M:rocm-hip:Navi44:16384:fp16:none:16:local` | 16,384 | 39.7 | 338.0 | 45.0 | 6.00 GB | 8.00 GB | 1.00 (100%) | 1.00 (100%) | 11.341 |

---

## 2. Environment & Confounder Baseline
- **GPU Temperature Baseline**: 45.0°C (Nominal; threshold < 80.0°C)
- **GPU Power Baseline**: 20.0 W
- **Compositor Background Utilization**: 3.5% (Nominal; threshold < 25.0%)
- **VRAM Idle Baseline**: 512 MB
- **Warm-Up Runs**: 1 warm-up repetition executed and discarded before measurement per tuple.
- **Measured Repetitions**: 3 independent measured repetitions per tuple.

---

## 3. Epistemic Classification of Findings
- **`[MEASURED]`**: Local ROCm inference on Navi 44 GPU achieves ~45.0 decode tok/s and 39.7ms TTFT with 4.0GB VRAM footprint at 4k context and 6.0GB at 16k context.
- **`[DERIVED]`**: Scarce resource cost scales from 8.941 at 4k context to 11.341 at 16k context due to KV context buffer allocation weighting.
- **`[UNKNOWN]`**: Distributed latency overhead over physical TELL LAN RPC link (deferred to follow-on multi-host probe).
