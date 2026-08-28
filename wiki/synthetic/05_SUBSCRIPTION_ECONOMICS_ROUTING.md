---
doc_id: ECON_ROUTING
title: "Economics: Subscription Quota Economics & Dynamic Swarm Routing"
domain: SUBSCRIPTION_ECONOMICS
epistemic_status: DESIGN_DECISION
source_documents:
  - wiki/CLI_SUBSCRIPTION_QUOTA_ECONOMICS_HANDOFF.md
  - wiki/OPENCODE_GO_ECONOMIC_MODEL_MATRIX_HANDOFF.md
retrieval_keywords:
  - Quota Economics
  - ChatGPT Plus
  - Google AI Pro
  - OpenCode Go
  - Token Efficiency
  - Routing Matrix
  - Cost per Accepted Step
---

# Economics: Subscription Quota Economics & Dynamic Routing

## Executive Summary
This document establishes the multi-subscription economic baseline for agentic workflows across **ChatGPT Plus ($20/mo)**, **Google AI Pro ($19.99/mo)**, and **OpenCode Go ($10/mo)** (~$49.99/mo total). The core optimization target is **accepted engineering steps per exhausted quota pool**, rather than raw request counts.

---

## 1. Subscription Portfolio & Metering Comparison

| Quota Pool | Monthly Spend | Primary Surface | Published Metering Basis | Strategic Role |
|---|---:|---|---|---|
| **ChatGPT Plus** | $20.00 | OpenAI Codex / CLI | Compute/token weighted 5h + weekly pool. GPT-5.6 Sol (15-90/5h), Terra (20-110/5h), Luna (50-280/5h). | **Premium Control Lane**: High-level planning, deep architecture, difficult refactors, and adversarial code reviews. |
| **Google AI Pro** | $19.99 | Gemini CLI / AGY / Code Assist | 1,500 model requests / user / day. High token throughput. | **High-Volume Proprietary Worker Lane**: Parallel code generation, comprehensive codebase scanning, and large context refactors. |
| **OpenCode Go** | $10.00 | OpenCode / Go Agent | $12 usage / 5h, $30 / week, $60 / month usage value. Value-based request depletion. | **High-Volume Cheap/Open Swarm Lane**: Fast parallel researchers, testers, AST scanners, and unit test generation. |

---

## 2. Model-to-Role Routing Matrix

```text
               ┌─────────────────────────────────────────────────────────┐
               │                    INCOMING TASK                        │
               └────────────────────────────┬────────────────────────────┘
                                            │
                       ┌────────────────────┴────────────────────┐
                       ▼                                         ▼
            [HIGH-RISK / ARCHITECTURE]                 [BOUNDED / REPETITIVE]
                       │                                         │
                       ▼                                         ▼
          ChatGPT Plus / OpenAI Codex                      Google AI Pro / OpenCode Go
          - GPT-5.6 Sol (Adversarial Review)              - Gemini 3.1 Pro / Flash (AGY Swarm)
          - GPT-5.6 Terra (Architecture/Plan)             - GLM-5.3 Flash / DeepSeek V4 Flash
          - GPT-5.6 Luna (Complex Implementation)         - Fast parallel AST & test runners
```

---

## 3. Economic Routing Principles

* **[DESIGN_DECISION]** **Deterministic First**: Solve schema checks, linting, file existence, and test execution locally in zero-cost bash/node scripts before invoking any model API.
* **[DESIGN_DECISION]** **Unit Mismatch Awareness**: A Codex local message != a Gemini request != an OpenCode Go request. Compare tools based on net cognitive output.
* **[DESIGN_DECISION]** **Aggressive Context Compaction**: Workers receive strictly pruned, bounded prompts (under 2,000 tokens) with precise target lines to minimize per-request cost and maximize response quality.
* **[DESIGN_DECISION]** **Preserve Premium Quota**: Reserve Codex Sol/Terra pools for architectural decisions and final reviews; route bulk implementations and test generation to Gemini / OpenCode workers.
