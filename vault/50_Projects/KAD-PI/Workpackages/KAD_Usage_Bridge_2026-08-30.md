---
kad_id: kad-63517e1567e1d643bfa2f23a
title: KAD Usage Bridge 2026-08-30
type: workpackage
authority: CANONICAL_KNOWLEDGE
epistemic_class: PROJECT_INFERENCE
review_status: APPROVED
visibility: project
context_eligible: true
train_eligible: false
publish: false
temporal_status: CURRENT
legacy_source: wiki/KAD_Usage_Bridge_2026-08-30.md
---

# KAD-PI OMP-Native Usage → KAD Telemetry Bridge (2026-08-30)

## Executive Summary

Workpackage **WP-KAD-USAGE-BRIDGE-002** establishes the deterministic bridge between Oh My Pi (OMP 18.0.10)'s native provider usage/quota subsystem and KAD's normalized telemetry plane (`kad-telemetry-v1`).

---

## 1. Single Authority Chain

Rather than establishing a competing quota interpretation engine or scraping private endpoints, KAD enforces a single authority chain:

```text
Provider API / Headers
         ↓
OMP Provider Adapter (e.g. OpenAI Codex x-codex-* parser, Antigravity project manager)
         ↓
OMP UsageReport (`omp usage --json`) & `after_provider_response` event
         ↓
KAD Usage Adapter (`tools/kad/telemetry/omp-usage-adapter.mjs`)
         ↓
`kad-telemetry-v1` Normalized Records & Ephemeral Ledger
         ↓
View Model & Native OMP TUI / CLI (`/kad`, `/kad-tokens`, `bin/kad status`)
```

---

## 2. Multi-Window Preservation & Scoping

Different providers structure quota across multiple distinct dimensions:
* **OpenAI Codex**:
  * Primary window: 5 hours (`openai-codex:primary`, duration: 18,000,000ms).
  * Secondary window: 7 days (`openai-codex:secondary`, duration: 604,800,000ms).
* **Google Antigravity**:
  * Project-level daily quotas (`daily`, duration: 86,400,000ms).
* **GitHub Copilot**:
  * Chat requests, completions, and premium requests.
* **OpenCode Go**:
  * 5h rolling, 7d weekly, and monthly limit windows.

KAD preserves each window as a distinct telemetry record with its explicit `window.kind`, `window.resets_at`, and `unit`. The compact meter computes the binding constraint (minimum remaining percentage) for the active provider while the detailed panel surfaces all window dimensions.

---

## 3. Epistemic Precedence & Honesty Rules

1. **Explicit Allowed Outranks Advisory Usage**: If a provider exposes `metadata.allowed = true` and `metadata.limitReached = false`, this authoritative state is preserved even if advisory percentages indicate saturation.
2. **No Unit Fabrication**: Quotas in requests, messages, or percent are never converted into artificial token estimates.
3. **Passive In-Flight Observability**: In-flight response metadata is captured passively via `after_provider_response` with zero active polling loops or credential scraping.
4. **Strict Secret Redaction**: Headers and metadata pass through `redactSecrets()`, guaranteeing zero authorization tokens or session cookies enter the ledger or evidence.
