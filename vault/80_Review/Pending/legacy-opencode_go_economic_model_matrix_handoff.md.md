---
kad_id: kad-fcbe5aba0b1b5fc7b4579598
title: Review: OPENCODE_GO_ECONOMIC_MODEL_MATRIX_HANDOFF.md
type: review_record
authority: PROPOSAL_UNREVIEWED
epistemic_class: UNKNOWN
review_status: PENDING
visibility: project
context_eligible: false
train_eligible: false
publish: false
temporal_status: HISTORICAL
legacy_source: wiki/OPENCODE_GO_ECONOMIC_MODEL_MATRIX_HANDOFF.md
---

# Handoff — OpenCode Go Economic Model Matrix

**Purpose:** handoff to a new chat dedicated to deciding which models should handle which software-engineering tasks when using **OpenCode Go**, while keeping the current **ChatGPT Plus / OpenAI Codex** lane available for higher-value planning and implementation.

**Snapshot date:** 2026-08-28  
**Status:** discussion baseline, not a frozen routing policy.

---

## 1. Current workflow context

The current intended OpenCode control lane is:

- **Planner / architect:** GPT-5.6 Terra Medium through the ChatGPT Plus / OpenAI Codex quota.
- **Builder:** GPT-5.6 Luna Medium through the ChatGPT Plus / OpenAI Codex quota when practical.
- **OpenCode Go:** candidate pool for cheap parallel researchers, testers, reviewers, scanners, secondary builders, and escalation models.

The economic question for the next chat is therefore not simply “which model is strongest?”

It is:

> **Which model gives the best evidence-adjusted engineering value for each task while minimizing scarce premium quota, duplicate reasoning, and unnecessary Go budget burn?**

The desired workflow remains evidence-first:

`research → plan → RED → bounded implementation → independent test → adversarial review → acceptance`

Models should be assigned by role rather than using one model for every stage.

---

## 2. Verified OpenCode Go economics

Official OpenCode documentation currently describes Go as:

- **US$10/month subscription**
- **US$12 usage allowance per 5-hour window**
- **US$30 weekly usage allowance**
- **US$60 monthly usage allowance**
- usage limits are measured in dollar value, so cheaper models permit more requests
- additional credit can be purchased if needed
- available models can change over time

The request counts below are OpenCode's own **estimated typical request counts**, not fixed per-request API prices.

### Important temporary-promotion caveat

The normal documentation currently lists **GLM-5.3-Flash at ~1,580 requests / 5h**, while the OpenCode Go landing page advertises a temporary **2× usage promotion**, showing roughly **3,160 requests / 5h**.

Use the baseline number for long-term planning and treat promotional capacity as temporary.

---

## 3. Economic capacity matrix

**Implied budget/request** is calculated as:

`US$12 / official estimated requests per 5-hour window`

It is only an economic comparison proxy.

**Relative capacity vs Luna** = estimated requests per 5h divided by GPT-5.6 Luna's 2,050.

| Model | Requests / 5h | Requests / week | Requests / month | Relative capacity vs Luna | Implied Go budget / typical request |
|---|---:|---:|---:|---:|---:|
| MiMo-V2.5 | 30,100 | 75,200 | 150,400 | 14.68× | ~$0.0004 |
| LongCat-2.0 | 11,400 | 28,600 | 57,200 | 5.56× | ~$0.0011 |
| DeepSeek V4 Flash | 7,600 | 18,900 | 37,800 | 3.71× | ~$0.0016 |
| Qwen3.7 Plus | 4,300 | 10,800 | 21,600 | 2.10× | ~$0.0028 |
| Hy3 | 4,300 | 10,750 | 21,500 | 2.10× | ~$0.0028 |
| DeepSeek V4 Flash Vision Exp | 3,800 | 9,450 | 18,900 | 1.85× | ~$0.0032 |
| MiniMax M2.7 | 3,400 | 8,500 | 17,000 | 1.66× | ~$0.0035 |
| Qwen3.6 Plus | 3,300 | 8,200 | 16,300 | 1.61× | ~$0.0036 |
| MiMo-V2.5-Pro | 3,250 | 8,150 | 16,300 | 1.59× | ~$0.0037 |
| MiniMax M3 | 3,200 | 8,000 | 16,000 | 1.56× | ~$0.0038 |
| **GPT-5.6 Luna** | **2,050** | **5,100** | **10,250** | **1.00×** | **~$0.0059** |
| GLM-5.3-Flash | 1,580 baseline | 3,950 | 7,900 | 0.77× | ~$0.0076 |
| Kimi K2.7 Code | 1,350 | 3,380 | 6,750 | 0.66× | ~$0.0089 |
| Kimi K2.6 | 1,150 | 2,880 | 5,750 | 0.56× | ~$0.0104 |
| DeepSeek V4 Pro | 1,050 | 2,600 | 5,200 | 0.51× | ~$0.0114 |
| GLM-5.2 | 880 | 2,150 | 4,300 | 0.43× | ~$0.0136 |
| GLM-5.1 | 880 | 2,150 | 4,300 | 0.43× | ~$0.0136 |
| Qwen3.7 Max | 340 | 840 | 1,690 | 0.17× | ~$0.0353 |
| GLM-5.3 | 220 | 540 | 1,080 | 0.11× | ~$0.0545 |
| Grok 4.6 | 169 | 423 | 845 | 0.08× | ~$0.0710 |
| Qwen3.8 Max | 160 | 400 | 810 | 0.08× | ~$0.0750 |
| Kimi K3 | 110 | 250 | 490 | 0.05× | ~$0.1091 |

### Economic interpretation

A premium Go model should not be selected merely because it is stronger in the abstract.

For example, under OpenCode's estimated request counts:

- one typical **Kimi K3** request consumes roughly the same Go allowance as ~27 typical **DeepSeek V4 Flash** requests;
- one typical **Qwen3.8 Max** request consumes roughly the allowance of ~47 DeepSeek V4 Flash requests;
- one typical **Grok 4.6** request consumes roughly the allowance of ~45 DeepSeek V4 Flash requests;
- **MiMo-V2.5** offers roughly 14.7× Luna's request capacity, making it economically interesting for low-risk, high-volume work if quality is sufficient.

These ratios must be weighed against correctness, context efficiency, tool use, and rework cost.

---

## 4. Candidate task-routing matrix

This is a **working hypothesis for discussion**, not a final recommendation.

| Engineering task | Economic priority | Candidate Go models to test | Current role hypothesis |
|---|---|---|---|
| Repository inventory / grep / read-only scanning | Extreme throughput | MiMo-V2.5, LongCat-2.0, DeepSeek V4 Flash | Use the cheapest model that reliably follows scope and returns evidence paths |
| Bounded source research | Throughput + instruction following | DeepSeek V4 Flash, Qwen3.7 Plus, MiniMax M3 | Parallel worker tier |
| Documentation/source extraction | Throughput | MiMo-V2.5, LongCat-2.0, DeepSeek V4 Flash | Avoid premium models unless synthesis is required |
| Test-case generation from frozen contracts | Precision + moderate cost | DeepSeek V4 Flash, Qwen3.7 Plus, MiniMax M3, Luna | Benchmark for valid RED vs superficial tests |
| Mechanical implementation against strong tests | Coding reliability + cost | DeepSeek V4 Flash, Luna, Kimi K2.7 Code | Potential secondary builder lane |
| Difficult implementation / legacy framework work | Correctness over raw throughput | Luna, DeepSeek V4 Pro, Kimi K2.7 Code | Escalate only after cheaper builder fails |
| Bug localization | Search efficiency + reasoning | DeepSeek V4 Flash, Luna, Qwen3.7 Plus | Separate diagnosis from mutation |
| Hard debugging / multi-file causal reasoning | Higher reasoning budget | Luna, DeepSeek V4 Pro; premium Go models only if benchmarked | Escalation task, not default worker |
| Test execution / evidence auditing | Discipline + low hallucination | DeepSeek V4 Flash, Qwen3.7 Plus, MiniMax M3 | Independent from builder |
| Adversarial code review | Falsification quality | Luna, DeepSeek V4 Pro, possibly GLM/Kimi/Qwen Max after calibration | Spend premium budget only on high-value review |
| Architecture synthesis | Highest reasoning quality | Prefer Terra Medium on Plus quota | Go premium models should be fallback/challenger, not default |
| Final acceptance decision | Independence + evidence synthesis | Terra Medium / separate high-reasoning reviewer | Do not let builder self-certify |
| Vision / screenshot debugging | Vision-specific | DeepSeek V4 Flash Vision Exp | Use only when visual input materially matters |
| Large swarm background tasks | Cost dominates | MiMo-V2.5, LongCat-2.0, DeepSeek V4 Flash | Avoid premium Go models in fan-out by default |

---

## 5. Current economic routing hypothesis

A plausible starting hierarchy for experiments is:

### Control lane — ChatGPT Plus / Codex

**Terra Medium**
- architecture
- decomposition
- evidence gates
- synthesis
- conflict resolution
- acceptance decisions

**Luna Medium**
- bounded implementation
- difficult repair
- implementation where tests and scope are already frozen

This uses the separate ChatGPT Plus/Codex quota rather than consuming OpenCode Go allowance for the most valuable control decisions.

### Cheap Go worker lane

Primary models worth benchmarking first:

1. **DeepSeek V4 Flash**
   - strong economic position
   - ~7,600 estimated requests / 5h
   - candidate default researcher/tester/secondary builder

2. **MiMo-V2.5**
   - exceptional request capacity
   - candidate for inventories, extraction, repetitive low-risk tasks

3. **LongCat-2.0**
   - very high throughput
   - candidate for scans and bounded research

4. **Qwen3.7 Plus / MiniMax M3**
   - middle-cost worker candidates
   - useful comparison against DeepSeek Flash when tasks need more reasoning discipline

### Go escalation lane

Candidates:

- DeepSeek V4 Pro
- Kimi K2.7 Code
- GLM-5.x variants
- possibly high-cost Max/K3/Grok models

These should need empirical justification before becoming routine.

### Economically dangerous default choices

The following have very low request capacity relative to the rest of Go:

- Kimi K3
- Qwen3.8 Max
- Grok 4.6
- GLM-5.3
- Qwen3.7 Max

They may still be worthwhile for rare tasks, but placing them in a parallel swarm without evidence of a major quality advantage can burn the Go allowance extremely quickly.

---

## 6. Cost model for agentic swarms

The relevant quantity is not just cost per request.

Use:

`effective task cost = direct model usage + retries + duplicated context + failed implementation + reviewer repair cost`

Therefore a cheaper model is not actually cheaper if it:

- repeatedly violates scope;
- requires Terra to redo its work;
- produces invalid RED tests;
- hallucinates source evidence;
- writes large unnecessary patches;
- requires multiple repair cycles.

Likewise, a premium model can be economical if a single call replaces many failed cheap-agent attempts.

The goal should be to benchmark **cost per accepted WorkPackage step**, not cost per token/request.

---

## 7. Proposed benchmark dimensions for the next chat

For each candidate model, evaluate:

### Correctness
- valid implementation rate
- valid RED rate
- tests actually proving claimed behavior
- regression rate

### Agent discipline
- respects allowed files
- respects STOP conditions
- avoids architecture invention
- distinguishes UNKNOWN from guess
- does not self-certify PASS

### Evidence quality
- exact paths/symbols
- reality classification
- reproducible commands
- real exit codes
- causal evidence

### Context efficiency
- amount of unnecessary repository scanning
- output verbosity
- duplicate reading
- tokens/context consumed before useful result

### Tool behavior
- reliable file edits
- command execution
- source search
- subagent compatibility

### Economic outcome
- Go allowance consumed
- retries required
- accepted tasks per 5-hour window
- accepted tasks per weekly allowance
- premium escalation frequency

The preferred metric:

> **accepted engineering evidence per dollar-equivalent of Go allowance**

---

## 8. Questions the next chat should answer

1. Should **DeepSeek V4 Flash** become the default Go worker for research + testing + simple implementation?
2. Is **MiMo-V2.5** reliable enough to replace DeepSeek Flash for low-risk read-only tasks?
3. Does **LongCat-2.0** have a useful niche beyond cheap repository scanning?
4. Which model should be the default independent reviewer?
5. Which Go model is the best **fallback builder** when Luna/Plus quota should be preserved?
6. Is **DeepSeek V4 Pro** worth ~7× the implied request cost of DeepSeek V4 Flash for hard coding tasks?
7. Is **Kimi K2.7 Code** worth its higher economic cost as a specialist coding model?
8. Do premium models such as Kimi K3, Qwen3.8 Max, Grok 4.6, or GLM-5.3 ever provide enough improvement to justify their very low request capacity?
9. Should premium Go models be prohibited from broad parallel fan-out and used only as explicit escalation targets?
10. Which model combinations minimize **total accepted-task cost**, not merely raw inference cost?
11. How should OpenCode route tasks automatically between Plus and Go without letting workers choose architecture?
12. Which models should be benchmarked on the user's actual codebases before any routing policy is frozen?

---

## 9. Suggested experimental routing policy to test

Not frozen:

```text
TERRA MEDIUM / PLUS
  ↓
plan + freeze architecture
  ↓
cheap Go read-only workers in parallel
  ↓
tester RED
  ↓
LUNA MEDIUM / PLUS
  OR benchmarked Go fallback builder
  ↓
independent cheap Go tester
  ↓
higher-quality reviewer only when warranted
  ↓
TERRA acceptance
```

Default principle:

> **Cheap models gather evidence. Strong models make high-impact decisions. Builders receive frozen contracts. Premium Go models are escalations, not swarm defaults.**

---

## 10. Facts vs hypotheses

### Verified current facts

- OpenCode Go costs US$10/month.
- Allowance: US$12 / 5h, US$30 / week, US$60 / month.
- Official estimated request counts are those recorded in the economic matrix above.
- GPT-5.6 Luna is currently listed in OpenCode Go.
- OpenCode Go includes multiple DeepSeek, Kimi, Qwen, GLM, MiniMax, MiMo, LongCat, Hy3, Grok, and related models.
- The model list may change.
- GLM-5.3-Flash currently has a temporary promotional usage multiplier on the Go landing page.

### Working hypotheses requiring benchmarking

- DeepSeek V4 Flash is the likely economic default Go engineering worker.
- MiMo-V2.5 may be preferable for extremely high-volume low-risk work.
- Luna should remain a high-value bounded builder.
- Terra Medium should remain the control-plane planner/acceptance model.
- Expensive Go models should be escalation-only.
- The best routing policy may differ substantially by task type and codebase.

---

## 11. Source basis

Current economic figures were checked against the official OpenCode Go documentation and Go product page on **2026-08-28**.

For the next chat, refresh the official Go documentation before freezing any policy because:

- available models can change;
- request estimates can change;
- promotional multipliers can expire;
- subscription limits can change.

---

# Handoff directive for the next chat

Act as an **AI engineering economics advisor**.

Use this matrix as the starting state, then determine the best model-routing policy for software development inside OpenCode.

Optimize simultaneously for:

1. correctness;
2. engineering evidence quality;
3. agent discipline;
4. latency;
5. context/token efficiency;
6. OpenCode Go allowance consumption;
7. ChatGPT Plus quota preservation;
8. minimal rework.

Do not rank models from reputation alone.

Distinguish:

- verified pricing/capacity;
- benchmark evidence;
- model capability hypotheses;
- user-specific workflow decisions.

Prefer empirical role-based benchmarking over choosing one “best model.”
