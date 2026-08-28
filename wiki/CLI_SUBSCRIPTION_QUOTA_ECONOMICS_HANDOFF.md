# Handoff — CLI Subscription Quota Economics Matrix

**Purpose:** provide a cross-subscription economic baseline for deciding which CLI/harness/model should perform which engineering tasks.

**Snapshot date:** 2026-08-28  
**Scope:** fixed-price subscriptions currently in use for coding/agentic CLI work:

1. **ChatGPT Plus / OpenAI Codex** — US$20/month
2. **Google AI Pro / Gemini CLI + Code Assist agent mode** — US$19.99/month
3. **OpenCode Go** — US$10/month

**Combined nominal subscription spend:** **~US$49.99/month**

This document deliberately separates:

- **OFFICIAL** limits published by providers;
- **OBSERVED** account/status evidence;
- **CALCULATED** extrapolations;
- **ASSUMPTIONS** used to translate quotas into approximate engineering-task capacity.

Do not treat calculated task-equivalents as contractual limits.

---

# 1. Executive economic picture

The three subscriptions expose three economically independent-looking quota pools:

| Pool | Nominal monthly price | Primary CLI surface | Published quota basis | Main economic role |
|---|---:|---|---|---|
| ChatGPT Plus | $20.00 | Codex CLI / Codex / Work | Compute/token-weighted 5h + weekly pool; official local-message ranges by model | Premium control lane |
| Google AI Pro | $19.99 | Gemini CLI + Code Assist agent mode | 1,500 model requests/user/day | High-volume proprietary-model worker lane |
| OpenCode Go | $10.00 | OpenCode or compatible agent via Go provider | $12/5h, $30/week, $60/month usage value | High-volume cheap/open-model swarm lane |
| **Total** | **$49.99** | — | Three distinct metering systems | Diversified quota portfolio |

A central conclusion for the next discussion:

> **The subscriptions should not be compared by raw request count alone. A Codex “local message,” a Gemini “model request,” and an OpenCode Go “request” are different economic units.**

The practical optimization target should be:

> **accepted engineering steps per exhausted quota pool**

rather than raw requests per dollar.

---

# 2. ChatGPT Plus / Codex CLI

## 2.1 Official current quota anchor

OpenAI currently publishes approximate **local messages per 5-hour window** for Plus:

| Codex model | Official local messages / 5h |
|---|---:|
| GPT-5.6 Sol | 15–90 |
| GPT-5.6 Terra | 20–110 |
| GPT-5.6 Luna | 50–280 |

OpenAI states that:

- local messages share a 5-hour usage window;
- additional weekly limits apply;
- usage depends on model, task complexity, context, tools, reasoning, and execution;
- Codex, ChatGPT Work, ChatGPT for Excel, and Workspace Agents can draw from the same agentic pool.

Therefore the numbers above are **ranges**, not guaranteed message counts.

---

## 2.2 Account-observed weekly calibration

Recent Terra Medium `/status` snapshots in the current engineering session showed approximately:

- snapshot A: **78% 5h remaining / 71% weekly remaining**
- snapshot B: **72% 5h remaining / 70% weekly remaining**

For that small slice of similar Terra work:

- 5h meter delta ≈ **6 percentage points**
- weekly meter delta ≈ **1 percentage point**

A naive ratio gives:

`weekly budget ≈ 6 × one 5h budget`

### Confidence

**LOW.**

Reasons:

- only one short observation interval;
- UI percentages are rounded;
- task complexity varied;
- model metering may be nonlinear;
- shared agentic-pool activity may interfere;
- OpenAI does not publish the exact Plus weekly quantity.

Use **6× only as a planning center point**, with a sensitivity band of approximately **4×–8×** until more `/status` measurements are collected.

---

## 2.3 Calculated Plus capacity — central 6× weekly estimate

Using the official 5h ranges and the tentative `6×` weekly factor:

| Model | Official / 5h | Approx / week @ 6× | Approx / 30-day month* |
|---|---:|---:|---:|
| GPT-5.6 Sol | 15–90 | 90–540 | ~391–2,346 |
| GPT-5.6 Terra | 20–110 | 120–660 | ~521–2,868 |
| GPT-5.6 Luna | 50–280 | 300–1,680 | ~1,304–7,300 |

\* Monthly approximation uses 4.345 weeks/month.

These monthly figures are **not official**. They are intended only to make the relative quota economics discussable.

---

## 2.4 Sensitivity of the unknown weekly cap

If the true weekly budget corresponds to only 4 five-hour windows:

| Model | Approx weekly @ 4× |
|---|---:|
| Sol | 60–360 |
| Terra | 80–440 |
| Luna | 200–1,120 |

If it corresponds to 8 windows:

| Model | Approx weekly @ 8× |
|---|---:|
| Sol | 120–720 |
| Terra | 160–880 |
| Luna | 400–2,240 |

This wide range is why future routing should collect actual `/status` deltas by model and task class.

---

## 2.5 Approximate subscription-attributed cost

If the entire US$20 Plus subscription were attributed only to Codex CLI—which is intentionally conservative because Plus includes many other features—the central monthly estimate implies roughly:

| Model | Central estimated monthly local messages | Subscription $ / local message |
|---|---:|---:|
| Sol | ~1,369 | ~$0.0146 |
| Terra | ~1,695 | ~$0.0118 |
| Luna | ~4,302 | ~$0.0046 |

These are **not API prices** and should not be compared directly with API token prices.

They are merely subscription-allocation ratios.

---

## 2.6 OpenAI role economics

The strongest current economic interpretation is:

### Terra Medium
Use for:
- architecture;
- decomposition;
- synthesis;
- acceptance;
- high-impact debugging decisions;
- conflict resolution.

Avoid spending Terra quota on:
- broad grep/search;
- mechanical inventory;
- repetitive test execution;
- trivial edits.

### Luna Medium
Use for:
- bounded implementation;
- routine repairs;
- coding against frozen RED tests;
- implementation-heavy work where Plus quota is preferable to Go escalation models.

Luna's official 5h request range is roughly **2.5×** Terra's range at the low end and **~2.55×** at the high end.

This makes Luna economically attractive as the default Plus builder.

### Sol
Use selectively for:
- genuinely difficult architecture/reasoning where Terra fails;
- high-stakes review;
- complex multi-domain synthesis.

It has the lowest local-message capacity among the GPT-5.6 Plus options.

---

# 3. Google AI Pro / Gemini CLI

## 3.1 Official current quota

The Gemini CLI quota documentation currently lists:

**Google AI Pro: 1,500 maximum model requests per user per day**

Important properties:

- quota is shared across Gemini CLI and agent mode in Gemini Code Assist IDE extensions;
- a user prompt may result in multiple model requests;
- requests are also subject to per-minute/service availability limits;
- model-family-specific effective throttles may exist;
- actual Pro-model availability has had user-reported inconsistencies, so `/stats model` should remain the account-local authority.

---

## 3.2 Straight-line quota extrapolation

If the full 1,500/day nominal allowance is consistently available:

| Period | Nominal model requests |
|---|---:|
| Day | 1,500 |
| Week | 10,500 |
| 30-day month | 45,000 |
| 365-day year | 547,500 |

At US$19.99/month, allocating the entire subscription to CLI access yields:

`$19.99 / 45,000 ≈ $0.000444 per nominal model request`

Again, this is **subscription allocation**, not an API price.

Google AI Pro also includes substantial non-CLI benefits, so the effective marginal cost of Gemini CLI may be lower for someone who values the other subscription features.

---

## 3.3 Agentic-task equivalents

One user instruction can trigger multiple Gemini model requests.

Use the following planning scenarios:

| Agentic task class | Assumed model requests / task | Approx tasks / day | Approx tasks / 30 days |
|---|---:|---:|---:|
| Tiny lookup / bounded extraction | 3 | 500 | 15,000 |
| Small agentic task | 8 | ~188 | ~5,625 |
| Medium repo task | 15 | 100 | 3,000 |
| Heavy agentic task | 30 | 50 | 1,500 |
| Very heavy loop | 50 | 30 | 900 |

These are calculated quota divisions, **not observed task capacities**.

The next chat should calibrate actual request/task ratios using:

`/stats model`

after representative Gemini CLI tasks.

---

## 3.4 Effective Pro-model caution

Official documentation gives the subscription-level 1,500/day figure, but Google does not provide a simple public current split such as:

`Pro = X/day`
`Flash = Y/day`

There have also been public reports of Pro-family quota exhaustion well below the nominal 1,500 total requests.

Therefore use two planning layers:

### Nominal whole-family budget
**1,500 requests/day**

### Conservative Pro-heavy planning
Until local `/stats` evidence is collected, assume that heavy Pro-model work may encounter a materially lower effective cap than 1,500/day.

Do not freeze a numerical Pro-only cap from community reports.

Instead record measured local values.

---

## 3.5 Google AI Pro role economics

Potentially strong use cases:

- parallel research workers;
- large-context source reading;
- alternative architecture critique;
- independent review;
- documentation synthesis;
- second-opinion debugging;
- tasks where 1,500/day provides more aggregate headroom than the premium Codex pool.

However:

> **Google AI Pro's Gemini CLI entitlement should not be assumed to be reusable inside arbitrary third-party agents through OAuth.**

Google's Gemini CLI documentation recommends supported API-key/Vertex paths for third-party agents.

Therefore treat:

**Gemini CLI / Code Assist quota**

as its own sanctioned CLI lane unless the provider explicitly supports another harness.

Do not count the same subscription quota twice across Gemini CLI and another harness.

---

# 4. OpenCode Go

## 4.1 Official economic pool

OpenCode Go:

- subscription: **US$10/month**
- 5-hour usage allowance: **US$12 equivalent**
- weekly allowance: **US$30 equivalent**
- monthly allowance: **US$60 equivalent**

OpenCode describes the plan as targeting roughly **6× subscription value** in usage for many models.

Actual request capacity is model-dependent.

---

## 4.2 Full current Go request-capacity matrix

| Model | Requests / 5h | Requests / week | Requests / month | $10 subscription / monthly request |
|---|---:|---:|---:|---:|
| Muse Spark 1.2 Contributor | 45,300 | 113,300 | 226,600 | ~$0.000044 |
| MiMo-V2.5 | 30,100 | 75,200 | 150,400 | ~$0.000066 |
| LongCat-2.0 | 11,400 | 28,600 | 57,200 | ~$0.000175 |
| DeepSeek V4 Flash | 7,600 | 18,900 | 37,800 | ~$0.000265 |
| Qwen3.7 Plus | 4,300 | 10,800 | 21,600 | ~$0.000463 |
| Hy3 | 4,300 | 10,750 | 21,500 | ~$0.000465 |
| DeepSeek V4 Flash Vision Exp | 3,800 | 9,450 | 18,900 | ~$0.000529 |
| MiniMax M2.7 | 3,400 | 8,500 | 17,000 | ~$0.000588 |
| Qwen3.6 Plus | 3,300 | 8,200 | 16,300 | ~$0.000613 |
| MiMo-V2.5-Pro | 3,250 | 8,150 | 16,300 | ~$0.000613 |
| MiniMax M3 | 3,200 | 8,000 | 16,000 | ~$0.000625 |
| GPT-5.6 Luna | 2,050 | 5,100 | 10,250 | ~$0.000976 |
| GLM-5.3-Flash | 1,580 baseline | 3,950 | 7,900 | ~$0.001266 |
| Kimi K2.7 Code | 1,350 | 3,380 | 6,750 | ~$0.001481 |
| Kimi K2.6 | 1,150 | 2,880 | 5,750 | ~$0.001739 |
| DeepSeek V4 Pro | 1,050 | 2,600 | 5,200 | ~$0.001923 |
| GLM-5.2 | 880 | 2,150 | 4,300 | ~$0.002326 |
| GLM-5.1 | 880 | 2,150 | 4,300 | ~$0.002326 |
| Qwen3.7 Max | 340 | 840 | 1,690 | ~$0.005917 |
| GLM-5.3 | 220 | 540 | 1,080 | ~$0.009259 |
| Grok 4.6 | 169 | 423 | 845 | ~$0.011834 |
| Qwen3.8 Max | 160 | 400 | 810 | ~$0.012346 |
| Kimi K3 | 110 | 250 | 490 | ~$0.020408 |

### Promotion caveat

The Go landing page may advertise temporary request multipliers for selected models.

Long-term routing should use the baseline documentation, not promotional capacity.

---

# 5. Cross-subscription normalized view

These units are **not semantically identical**, but the table shows the scale of each pool.

| Subscription / model | Meter unit | Approx monthly capacity | Monthly price | Crude unit/$ |
|---|---|---:|---:|---:|
| Plus / Terra | Codex local messages | ~521–2,868 calculated | $20.00 | ~26–143 msgs/$ |
| Plus / Luna | Codex local messages | ~1,304–7,300 calculated | $20.00 | ~65–365 msgs/$ |
| Google AI Pro | Gemini model requests | 45,000 nominal | $19.99 | ~2,251 req/$ |
| Go / DeepSeek V4 Flash | Go requests | 37,800 official estimate | $10.00 | 3,780 req/$ |
| Go / MiMo-V2.5 | Go requests | 150,400 official estimate | $10.00 | 15,040 req/$ |
| Go / Luna | Go requests | 10,250 official estimate | $10.00 | 1,025 req/$ |
| Go / DeepSeek V4 Pro | Go requests | 5,200 official estimate | $10.00 | 520 req/$ |
| Go / Kimi K3 | Go requests | 490 official estimate | $10.00 | 49 req/$ |

**Do not conclude that MiMo is “100× better” than Terra from this table.**

A Codex local message can contain substantial autonomous reasoning/tool execution, while a Gemini/Go provider request can be only one inference inside a longer agent loop.

Use these numbers to understand **pool scarcity**, not model capability.

---

# 6. Approximate engineering-task capacity

To make the quotas actionable, define rough engineering-task units.

These are deliberately conservative discussion assumptions.

## 6.1 Codex local-message assumptions

| Work type | Approx Codex local messages |
|---|---:|
| Small architecture decision | 1–2 |
| Bounded research/synthesis | 1–3 |
| Small implementation | 2–4 |
| Medium implementation + tests | 3–6 |
| Hard debugging cycle | 4–10 |
| Full WorkPackage planning + review | 4–12 |

Using central Plus monthly estimates:

### Terra
~521–2,868 local messages/month

At **2 messages per planning decision**:

~260–1,434 bounded planning decisions/month.

At **5 messages per hard reasoning cycle**:

~104–574 difficult reasoning cycles/month.

### Luna
~1,304–7,300 local messages/month

At **4 messages per bounded implementation**:

~326–1,825 bounded implementation cycles/month.

These ranges inherit the low-confidence weekly extrapolation.

---

## 6.2 Gemini CLI task assumptions

At 1,500 model requests/day:

| Calls / task | Approx tasks/day | Approx tasks/month |
|---:|---:|---:|
| 5 | 300 | 9,000 |
| 10 | 150 | 4,500 |
| 20 | 75 | 2,250 |
| 40 | ~38 | ~1,125 |

Gemini CLI therefore has strong theoretical capacity for **many parallel bounded workers**, assuming the selected model family remains available.

---

## 6.3 OpenCode Go task assumptions

If one bounded OpenCode subtask averages **3 provider requests**, approximate monthly subtask capacity becomes:

| Model | Monthly requests | Approx bounded subtasks @ 3 req/task |
|---|---:|---:|
| MiMo-V2.5 | 150,400 | ~50,133 |
| LongCat-2.0 | 57,200 | ~19,067 |
| DeepSeek V4 Flash | 37,800 | ~12,600 |
| Qwen3.7 Plus | 21,600 | ~7,200 |
| MiniMax M3 | 16,000 | ~5,333 |
| GPT-5.6 Luna | 10,250 | ~3,417 |
| Kimi K2.7 Code | 6,750 | ~2,250 |
| DeepSeek V4 Pro | 5,200 | ~1,733 |
| Qwen3.8 Max | 810 | 270 |
| Kimi K3 | 490 | ~163 |

If real OpenCode agent loops average 10 provider requests per subtask instead, divide these capacities by ~3.33.

This is why empirical **requests per accepted subtask** must be measured.

---

# 7. Combined monthly engineering portfolio

The three subscriptions together cost approximately:

`$20.00 + $19.99 + $10.00 = $49.99/month`

A quota-aware engineering workflow can treat them as three resource classes.

## Class A — Scarce high-value control

**ChatGPT Plus / Codex**

Use:
- Terra for architecture and acceptance;
- Luna for bounded implementation;
- Sol only for selective escalation.

Goal:
**maximize accepted decisions per percentage point of Plus weekly quota.**

---

## Class B — Large proprietary worker pool

**Google AI Pro / Gemini CLI**

Nominal:
**45,000 model requests per 30 days.**

Use:
- parallel source research;
- independent analysis;
- large-context reading;
- second-opinion review;
- alternative planning;
- tasks where Gemini model strengths justify leaving OpenCode.

Goal:
**consume Google quota before spending scarce Plus quota on repetitive investigation.**

---

## Class C — Cheapest broad swarm pool

**OpenCode Go**

Use:
- read-only repository workers;
- test-design candidates;
- evidence extraction;
- repetitive scanning;
- cheap independent reviewers;
- secondary builders after benchmarking.

Goal:
**make Go the default fan-out pool and reserve expensive Go models for explicit escalation.**

---

# 8. Suggested quota allocation policy

This is a hypothesis to test, not a frozen rule.

## ChatGPT Plus weekly pool

- **30% reserve — Terra architecture/acceptance**
- **50% — Luna implementation/repair**
- **10% — independent premium review/debug escalation**
- **10% emergency reserve**

Do not allow bulk research workers to consume this pool by default.

---

## Google AI Pro daily pool

Of nominal 1,500 requests/day:

- **50% (~750)** — research/source-reading workers
- **20% (~300)** — independent reviewer/alternative reasoning
- **20% (~300)** — large-context or difficult Gemini-specialist tasks
- **10% (~150)** — reserve for quota/model-family variability

This should be revised after local `/stats model` measurements.

---

## OpenCode Go monthly pool

Budget by dollar-equivalent usage, not raw request count:

- **60%** — cheap worker swarm
- **20%** — tester/reviewer lane
- **10%** — fallback builder lane
- **10%** — expensive-model escalation reserve

Avoid letting Kimi K3 / Qwen Max / Grok-tier calls appear automatically in broad fan-out.

---

# 9. Recommended cross-pool routing experiment

A candidate workflow:

```text
USER INTENT
    ↓
TERRA MEDIUM / PLUS
freeze objective + contracts
    ↓
OPENCode GO CHEAP WORKERS
parallel discovery / evidence
    ↓
OPTIONAL GEMINI CLI
large-context or independent second opinion
    ↓
TESTER RED
prefer Go / Gemini worker
    ↓
LUNA MEDIUM / PLUS
minimum bounded GREEN
    ↓
GO TESTER
independent verification
    ↓
GO OR GEMINI REVIEWER
adversarial falsification
    ↓
TERRA / PLUS
final acceptance
```

High-impact principle:

> **Use premium subscription quota for decisions and mutations; use high-volume pools for evidence gathering and falsification.**

---

# 10. Quota exhaustion order

For routine engineering, a plausible economic order is:

### Read-only evidence gathering
1. OpenCode Go cheap model
2. Google AI Pro / Gemini CLI
3. Plus / Luna
4. Plus / Terra
5. Plus / Sol

### Routine implementation
1. Luna Medium / Plus while quota is healthy
2. benchmarked Go fallback builder
3. Gemini CLI builder if it performs well on the project
4. expensive Go specialist
5. Sol only if the task is genuinely difficult

### Architecture
1. Terra Medium / Plus
2. Gemini high-reasoning challenger
3. expensive Go challenger if benchmarked
4. Sol escalation

### Adversarial review
1. cheap independent Go reviewer
2. Gemini independent reviewer
3. Terra final synthesis
4. Sol only for unresolved critical disagreement

---

# 11. Measurement plan for making this matrix accurate

The most important next step is not another web benchmark.

Collect local telemetry.

For every representative task record:

```text
subscription
harness
model
reasoning effort
task class
start quota
end quota
wall time
context size
provider/model requests if visible
tool calls
files scanned
files changed
tests run
accepted/rejected
repair cycles
```

## OpenAI Codex

Before/after each task:

`/status`

Record:

- 5h percentage delta;
- weekly percentage delta;
- model;
- task class.

After ~20 homogeneous Terra and Luna tasks, estimate:

`median %5h / accepted task`
`median %weekly / accepted task`

This will replace the weak 6× weekly extrapolation.

---

## Gemini CLI

Use:

`/stats model`

Record:

- model requests consumed;
- model family;
- tokens;
- task outcome.

After ~20 tasks derive:

`model requests / accepted task`

and separate Pro vs Flash if the CLI reports them.

---

## OpenCode Go

Record provider/model usage before/after representative subagent tasks.

Derive:

`Go requests / accepted subtask`
`Go $-equivalent / accepted subtask`

Do this separately for:

- researcher;
- tester;
- reviewer;
- builder.

---

# 12. Economic metrics the next chat should optimize

Avoid raw benchmark score alone.

Use:

## Evidence efficiency

`accepted evidence artifacts / quota consumed`

## Builder efficiency

`accepted implementations / quota consumed`

## Review efficiency

`real defects found / quota consumed`

## Rework multiplier

`total calls including repairs / first-pass calls`

## Quota-adjusted quality

`acceptance probability / expected quota cost`

## Scarcity-adjusted cost

A task that consumes 10% of the Plus weekly pool may be economically more expensive than hundreds of Go requests even if both subscriptions are already paid.

---

# 13. Important metering caveats

## ChatGPT Plus

- exact weekly limit is not publicly quantified;
- current estimates depend on one small observed `/status` delta;
- Codex/Work/other agentic surfaces may share the same pool;
- model, context, tools, and task complexity materially change consumption.

**Confidence in monthly Plus extrapolation: LOW–MEDIUM.**

---

## Google AI Pro

- 1,500/day is the official top-level quota;
- it is a count of **model requests**, not prompts;
- one prompt may consume many requests;
- model-family throttles may make Pro-heavy effective capacity lower;
- Gemini CLI + Code Assist agent mode share quota.

**Confidence in nominal daily/monthly total: HIGH.**  
**Confidence in Pro-only effective capacity: LOW.**

---

## OpenCode Go

- 5h/week/month dollar-equivalent limits are explicit;
- model-specific request counts are official estimates based on typical usage;
- actual request cost varies with workload;
- temporary promotions may increase selected models' capacity.

**Confidence in relative Go economic ordering: HIGH.**

---

# 14. Subscription value beyond CLI

Do not interpret the whole subscription price as coding cost without context.

### ChatGPT Plus also provides
- general ChatGPT;
- reasoning/chat models;
- file analysis;
- Deep Research and other features;
- image and multimodal features.

### Google AI Pro also provides
- Gemini app;
- Google storage and other Google One benefits;
- NotebookLM / Google productivity integrations;
- other AI-plan features.

### OpenCode Go is the subscription most directly attributable to coding-model inference.

Therefore, when comparing pure CLI economics:

> **OpenCode Go's $10 is almost entirely a coding budget, whereas Plus and Google AI Pro deliver substantial non-CLI value.**

---

# 15. Current economic hypothesis

The likely optimal portfolio is not “pick one best subscription.”

It is:

### Plus / Terra
**control plane**

### Plus / Luna
**trusted bounded builder**

### OpenCode Go / cheap models
**default swarm/data plane**

### Google AI Pro / Gemini CLI
**large independent secondary pool**

### Sol / expensive Go models
**rare escalation plane**

This minimizes the probability that the highest-value weekly quota is exhausted by work that a cheaper independent pool could have performed.

---

# 16. Questions for the next chat

1. What is the best way to measure actual Terra and Luna Plus quota cost per accepted task?
2. Should Luna implementation be preferred on Plus or OpenCode Go when Luna exists in both pools?
3. At what Plus weekly remaining percentage should builders automatically move to Go?
4. Which Go model gives the best accepted-task economics for:
   - research;
   - testing;
   - code review;
   - implementation?
5. Which Gemini model/task types best exploit the 1,500/day Google AI Pro pool?
6. Can Gemini CLI become the default independent reviewer without increasing rework?
7. How much Plus quota should always be reserved for Terra?
8. Is DeepSeek V4 Flash the best default Go worker once real accepted-task cost is measured?
9. Is MiMo-V2.5's huge quota actually useful, or does lower reliability erase its economic advantage?
10. When is DeepSeek V4 Pro cheaper in total than repeated Flash repairs?
11. Should premium Go models be hard-disabled from automatic fan-out?
12. How should OpenCode route between Plus-backed Codex and Go based on live quota state?
13. Can a simple quota-aware router use:
    - Codex `/status`;
    - Gemini `/stats model`;
    - Go usage data;
    to choose the next worker pool automatically?
14. What task telemetry should be retained to build an empirical model-routing policy?

---

# 17. Source basis — 2026-08-28

Current figures were checked against:

- OpenAI Codex pricing/usage documentation:
  - Plus local-message ranges currently shown for GPT-5.6 Sol, Terra, and Luna;
  - additional weekly limits apply;
  - agentic products share quota where applicable.

- OpenAI ChatGPT Plus documentation:
  - US$20/month.

- Google Gemini CLI quota documentation:
  - Google AI Pro: 1,500 model requests/user/day;
  - shared with Code Assist agent mode;
  - one prompt can generate multiple model requests.

- Google One plan documentation:
  - Google AI Pro list price US$19.99/month in the referenced US pricing view.

- OpenCode Go documentation:
  - US$10/month;
  - $12/5h;
  - $30/week;
  - $60/month;
  - current model-specific request estimates.

Because these products change rapidly, refresh official sources before freezing routing rules.

---

# Handoff directive

Act as an **AI engineering quota economist and model-routing architect**.

Use this document as an approximate baseline.

Your task is to design the optimal allocation of engineering work across:

- ChatGPT Plus / Codex;
- Google AI Pro / Gemini CLI;
- OpenCode Go.

Optimize:

1. accepted engineering work;
2. correctness;
3. evidence quality;
4. independent verification;
5. quota longevity;
6. context efficiency;
7. minimal rework;
8. minimal premium-quota waste.

Do not compare raw request counts as if all providers meter the same unit.

First improve the estimates using locally observed quota telemetry.

Then recommend a routing policy by **task class × model × subscription pool**.
