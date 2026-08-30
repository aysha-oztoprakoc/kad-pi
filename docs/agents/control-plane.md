# KAD Operator Control Plane

This document describes the native OMP control plane, deterministic token/quota telemetry plane, system metrics, developer toolchain, and operator interfaces in KAD-PI.

## 1. Overview & North Star

The KAD Operator Control Plane serves as the cockpit for KAD-PI inside Oh My Pi (OMP). It provides live, deterministic visibility into:
* Active model and provider roles.
* Live OMP session token and cache usage.
* Provider quota and rate limit telemetry with rigorous epistemic provenance.
* Active economic route, execution class, and paid spend authorization.
* Active workctl ticket claim, execution mode, and frontier status.
* AMD GPU utilization, VRAM usage, temperature, and power.
* Health status of optional local services (OpenViking, Zotero API, Needle 2, local inference).
* Mathematically defensible TOKENMAXXING metrics.

```text
                     OMP Interactive Runtime
                               │
            KAD Control Plane Extension (.omp/extensions/kad-control-plane/)
                               │
       ┌───────────────────────┼────────────────────────┐
       │                       │                        │
Telemetry Plane           Policy View               Native UI
(schema, ledger,       (economic router,       (compact meter,
 adapters, metrics)     workctl state)          detailed panel)
       │                       │                        │
       └───────────────────────┼────────────────────────┘
                               │
                  Deterministic KAD Services
```

---

## 2. Telemetry Epistemic Honesty Rules

Provider limits vary drastically (tokens, messages, requests, credits, rolling windows, daily/monthly allowances). KAD-PI enforces a strict **anti-fabrication rule**:

> **NEVER convert an unknown provider allowance into a fake token balance.**

Every telemetry observation carries explicit epistemic classification:

| Epistemic State | Description | Example |
| --- | --- | --- |
| `AUTHORITATIVE_REMOTE` | Documented provider quota endpoint / official API | OpenAI subscription quota: 68% remaining |
| `AUTHORITATIVE_LOCAL` | Documented local ledger / system counters | Local VRAM allocation, process counters |
| `OBSERVED` | Measured events during normal operation | 128,420 tokens used in current session |
| `DERIVED` | Calculated from valid inputs (e.g. limit - used) | Manual 1000 requests limit - 100 used = 900 remaining |
| `MANUAL` | Human-declared versioned quota constraint | Team-allocated daily budget |
| `STALE` | Expired observation past `stale_after` TTL | Quota check from previous hour |
| `UNKNOWN` | Provider exposed no machine-readable quota | Limit UNKNOWN, remaining UNKNOWN |
| `DEGRADED` | Telemetry adapter encountered connection error | Timeout probing provider status |

---
## 4. OMP Native Usage Bridge & Passive Telemetry

KAD-PI integrates with OMP 18.0.10's native usage subsystem through a two-tier public boundary:

1. **Authoritative Baseline Snapshot (`omp usage --json`)**:
   * Consumed by `tools/kad/telemetry/omp-usage-adapter.mjs`.
   * Normalizes native provider reports (`openai-codex`, `google-antigravity`, `github-copilot`, `cursor`, `opencode-go`) into `kad-telemetry-v1` records.
   * Preserves multi-window scopes (5h primary, 7d secondary, daily, monthly) without window collapsing or fake token conversions.
   * Respects explicit `allowed=true / limitReached=false` metadata.

2. **Passive In-Flight Observation (`after_provider_response` event)**:
   * Extension hook captures response status, sanitized headers, and request metadata per turn.
   * Zero active network polling; purely event-driven.
   * Strictly strips credentials, auth headers, and session cookies via `redactSecrets()`.

---

## 5. OMP Native Extension Architecture
The extension is installed at `.omp/extensions/kad-control-plane/` (and `.omp/extensions/kad-control-plane.js`).

### Extension Lifecycle Hooks
* `session_start`: Initializes telemetry ledger, registers periodic timer (5s), performs first scan.
* `turn_end`: Updates session tokens, context window utilization, and cache metrics.
* `message_end`: Reconciles live usage against ledger.
* `model_select`: Reacts to active model or provider changes.
* `session_shutdown`: Cleans up active background timers without leaking resources.

### Custom Native Commands
* `/kad`: Toggles the full modal detailed control plane overlay.
* `/kad-status`: Shows summarized status in session transcript.
* `/kad-tokens`: Shows token breakdown and provider quotas.
* `/kad-providers`: Lists all configured, enabled, and disabled providers.
* `/kad-budget`: Shows current economic router authorization and execution class.
* `/kad-services`: Shows health of OpenViking, Zotero API, Needle 2, and local inference.
* `/kad-work`: Shows active workctl claim, actor, and frontier.
* `/kad-refresh`: Forces immediate telemetry refresh.
* `/kad-doctor`: Runs comprehensive health diagnostics.

### Agent Tools
* `kad_telemetry`: Bounded machine-readable telemetry query for agents.
* `kad_policy_status`: Read-only economic policy and routing query.

---

## 5. CLI Transport (`bin/kad` & `bin/kad-doctor`)

Deterministic operator commands are available outside OMP:

```bash
# Show full status formatted or as JSON
bin/kad status [--json]

# Run diagnostic health check
bin/kad doctor [--json]

# Show provider quotas
bin/kad tokens [--json]

# Show provider inventory
bin/kad providers [--json]

# Show workctl claim & frontier
bin/kad work [--json]
```

---

## 6. Developer Toolchain & Security Gates

KAD-PI integrates deterministic development utilities configured via `Justfile` and `.pre-commit-config.yaml`:

| Tool | Role | Command |
| --- | --- | --- |
| `just` | Task runner | `just verify`, `just test`, `just security`, `just lint`, `just bench` |
| `prek` | Fast Git hook runner | `prek run` |
| `gitleaks` | Secret detection gate | `gitleaks protect --staged --redact` |
| `trivy` | Vulnerability & misconfig scanner | `trivy fs --scanners vuln,secret .` |
| `ast-grep` | Structural AST analysis | `ast-grep scan` |
| `hyperfine` | CLI benchmarking | `hyperfine 'bin/kad status --json'` |
| `amdgpu_top` | AMD GPU structured metrics | `amdgpu_top -J -n 1` |
| `Context7 MCP`| Library documentation lookup | `@upstash/context7-mcp` via `.omp/mcp.json` |

---

## 7. Failure Isolation & Degradation Matrix

| Component Outage | Observable Degradation | Invariant Preserved |
| --- | --- | --- |
| Provider Quota API Down | Provider status marked `DEGRADED`, limit `UNKNOWN` | No fake quota invented; session continues |
| OpenViking Offline | OpenViking marked `UNAVAILABLE` | Falls back to exact KAD librarian retrieval |
| Zotero API Offline | Zotero marked `UNAVAILABLE` | Standard export/manifest import remains operational |
| AMD GPU Telemetry Down | GPU section displays `UNAVAILABLE` | Extension and OMP session continue |
| Workctl No Active Claim | Workctl displays `NO ACTIVE CLAIM` | No future work or claim manufactured |
| Telemetry Collector Error | Error captured in `errors[]`, status `DEGRADED` | OMP never crashes; UI remains interactive |
