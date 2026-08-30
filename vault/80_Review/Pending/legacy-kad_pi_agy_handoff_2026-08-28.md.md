---
kad_id: kad-604a843770c3906ce08e219b
title: Review: KAD_PI_AGY_HANDOFF_2026-08-28.md
type: review_record
authority: PROPOSAL_UNREVIEWED
epistemic_class: UNKNOWN
review_status: PENDING
visibility: project
context_eligible: false
train_eligible: false
publish: false
temporal_status: HISTORICAL
legacy_source: wiki/KAD_PI_AGY_HANDOFF_2026-08-28.md
---

# KAD / PI / AGY — MASTER HANDOFF
**Date:** 2026-08-28  
**Purpose:** Continue the current engineering conversation in a fresh ChatGPT context without reopening settled decisions.

---

## 1. ROLE FOR THE NEXT ASSISTANT

Act as the user's **Implementation Advisor / Independent Reviewer / Next-Step Optimizer**.

For every pasted terminal/agent result, ask:

> What is the smallest useful next step that advances the current objective, preserves accepted decisions, and produces new trustworthy evidence?

Do not merely summarize another model's output.

Expected response pattern:
1. independently audit;
2. return `PASS | PARTIAL | BLOCKED`;
3. identify evidence gaps/overclaims;
4. preserve frozen architecture;
5. provide an exact paste-ready next instruction when useful.

The user strongly prefers:
- deterministic-first work;
- TDD;
- STOP conditions;
- exact rollback;
- durable evidence;
- provider/model agnosticism;
- bounded WorkPackages;
- scientific reconstructability;
- progressive disclosure;
- token/context efficiency;
- genuine agentic swarm execution;
- one-shot autonomous execution after architecture is frozen.

Rules:
- `UNKNOWN > guess`
- `STOP means STOP`
- simulation != live;
- model self-report != evidence;
- a test may claim only what it actually proves;
- do not hardcode `PASS`;
- builders do not decide architecture;
- workers do not silently widen scope.

---

## 2. RELEVANT USER CONTEXT

The user is associated with UTFPR and is building projects combining:
- AI/ML;
- software architecture;
- local models;
- agent systems;
- PON;
- STC;
- deterministic experimentation;
- RPG/world simulation;
- synthetic data.

The user is especially interested in PON in an academic/software-engineering context and wants parts of this work to become useful prototypes, experiments, reports, and eventually game/synthetic-data infrastructure.

Main Linux workspace:

`/home/amdy/Work`

Frequently used tools:
- Antigravity CLI (`agy`);
- Pi coding agent;
- OpenCode;
- DeepSeek Harness;
- Gemini CLI;
- tmux;
- Git/GitHub;
- NotebookLM.

The user wants `/home/amdy/Work` to remain a shared model/harness workspace.

Sensitive personal information is intentionally omitted from this handoff because it is not needed for technical continuation.

---

## 3. PRIME DIRECTIVE — FROZEN

Canonical file:

`/home/amdy/Work/PRIME_DIRECTIVE.md`

Validator:

`/home/amdy/Work/validate_prime_directive.py`

Accepted synthesis:

> **PON governs causal activation. STC governs composition, dependency, lifetime, and recovery. TDD governs how behavior becomes accepted implementation. Graceful Degradation governs what happens when expected capabilities cease to exist. Evidence governs what the system is allowed to claim.**

Mantra:
- `NOTIFY, DON'T POLL.`
- `DECLARE, DON'T REACH.`
- `TRACK, DON'T ASSUME CLEANUP.`
- `TEST, DON'T CLAIM.`
- `DEGRADE, DON'T ESCALATE AUTHORITY.`
- `RECORD, DON'T GUESS.`

---

## 4. PON / STC RESPONSIBILITY BOUNDARY

### PON = Notification-Oriented Paradigm

PON decides **when and why causal reaction occurs**.

Conceptual path:

```text
state/event changes
→ notify affected causal knowledge
→ evaluate relevant premises/conditions
→ rule fires only if condition is satisfied
→ action/instigation
```

PON must not degrade into:

```text
loop:
  poll state
  maybe react
```

Notification-driven does not automatically imply determinism. Ordering, duplicates, retries, cancellation, concurrency, and idempotence still require explicit policy.

### STC / Cordis

STC decides:
- dependency topology;
- scope/locality;
- capability validity;
- lifetime;
- activation/deactivation;
- managed effects;
- teardown;
- recovery.

Desired managed-effect model:

```text
effect
→ tracked cleanup/inverse
→ dispose
→ unwind
```

Failure:

```text
component failure
→ unwind partial tracked effects
→ record
→ capability disappears
→ dependency consequences propagate
→ unrelated components remain intact
```

Important:
- rollback != compensation;
- Cordis lifecycle isolation != OS security sandbox.

Combined path:

```text
STATE CHANGE
→ PON NOTIFICATION
→ RELEVANT RULE
→ ACTION INTENT
→ POLICY
→ STC-MANAGED EFFECT
→ CONTEXT/DEPENDENCY CHANGE
→ EVIDENCE
```

---

## 5. MODEL-AGNOSTIC CONTROL INVARIANT

Central invariant:

> THE HARNESS MAY KNOW CAPABILITIES.  
> THE CONFIGURATION MAY KNOW MODELS.  
> THE EXPERIMENT MAY KNOW PROVIDERS.  
> THE CONTROL LOGIC MUST NOT REQUIRE ANY OF THEM BY NAME.

Routing concept:

```text
role + task + budget + context + capability + availability + degradation state
→ provider/model
```

Parent/master owns:
- architecture;
- decomposition;
- synthesis;
- conflict resolution;
- mutation authority;
- final acceptance.

Workers provide:
- evidence;
- test designs;
- bounded implementation;
- independent review.

---

## 6. SKILL ECOSYSTEM ARCHITECTURE

Frozen conceptual tiers:

### Workflows
Own larger task progression:
- phases;
- decisions;
- handoffs;
- orchestration.

Examples:
- `wayfinder`
- `grill-me`

### Disciplines
Bounded reusable reasoning/procedural capabilities.

Examples:
- `grilling`
- `code-review`
- `diagnosing-bugs`
- `codebase-design`

### Adapters
Environment-specific translation only.
No domain policy.
No workflow ownership.

---

## 7. CANONICAL `ask_user`

Canonical capability:

`/home/amdy/Work/.agents/capabilities/ask_user/CAPABILITY.md`

Antigravity adapter:

`/home/amdy/Work/.agents/adapters/antigravity/ask_user.md`

Canonical request now includes:
- question;
- options/choices;
- `allowCustom`;
- optional stable request/correlation ID.

Canonical result:
- `ANSWERED`
- `UNAVAILABLE`
- `FAILED`

`WAITING_USER` is orchestration/policy state, not adapter output.

Accepted topology:

```text
Skill / Workflow
→ canonical ask_user
→ harness adapter
→ native harness interaction
```

Rejected topology:

```text
child process
→ custom IPC
→ parent AGY
→ ask_question
```

No custom AGY child-process IPC is required for the current architecture.

---

## 8. SKILL WORKPACKAGE HISTORY

### WP-SKILL-001A — CLOSED

Read-only skill baseline.

Accepted evidence archive:

`/home/amdy/Work/evidence/WP-SKILL-001A-R2-evidence.tar.gz`

Accepted:
- 51 artifacts in scanned scope;
- no source mutation;
- shared skill root:
  `/home/amdy/Work/.agents/skills`

Do not reopen unless new evidence invalidates the baseline.

### WP-SKILL-001B — CANONICAL `ask_user`

After several repairs:
- canonical contract separated from AGY adapter;
- `FAILED != UNAVAILABLE`;
- `WAITING_USER` policy separated;
- `allowCustom` added after real `grilling` migration exposed write-in as a required semantic;
- native AGY question mechanism proven;
- no IPC built.

Treat as conceptually accepted unless contradictory evidence appears.

### WP-SKILL-001C — `grilling`

Migration preserved:
- interview design-tree/frontier behavior;
- recommended option first;
- native write-in;
- real human wait behavior;
- harness-specific tool names removed from semantic skill;
- dependency on canonical `ask_user`.

### WP-SKILL-002 — LARGE ONE-SHOT REFACTOR

Gemini 3.7 Flash High performed a 37-skill refactor.

Useful work:
- many dependency declarations;
- rollback artifacts;
- validators;
- migration map;
- `kad-pi` GitHub repository.

Independent audit found serious epistemic problems:
1. a required "live vertical slice" was actually Python simulation;
2. the requested swarm was not actually used;
3. many behavior validators only checked frontmatter + keywords;
4. `final-audit.json` hardcoded major PASS claims;
5. migration-map confidence/evidence was too weak;
6. `/home/amdy/Work` itself was initialized as a Git repo despite containing unrelated projects;
7. publication evidence became stale/self-referential;
8. `skills-lock.json` semantics were not fully established.

Therefore:

`WP-SKILL-002 = PARTIAL / REOPEN FOR EPISTEMIC REPAIR`

Do not trust its final PASS verbatim.

---

## 9. `kad-pi` GITHUB STATE

Public repository:

`https://github.com/aysha-oztoprakoc/kad-pi`

Known commits from independent verification:
- `2ef04ade9323113e99efa4f290c8f0a7dfeeab7e`
  — main refactor content
- `3f964c645027ae3cdab3854c567a36cff887eb6a`
  — publication evidence commit

Known topology problem:

`/home/amdy/Work/.git`

was created, making the whole multi-project workspace a Git worktree.

Risk:
ordinary Git commands inside unrelated non-Git children may resolve upward to `/home/amdy/Work`.

Do not worsen this during the Pi experiment.

Potential future repair must be evidence-driven:
- dedicated repo directory, or
- external git-dir/work-tree,
while preserving shared `.agents` discovery.

No force-push.

---

## 10. `skills-lock.json`

Path:

`/home/amdy/Work/skills-lock.json`

It records upstream sources such as `mattpocock/skills`.

Many local skill SHA values differ from `computedHash`.

Do not assume corruption.

Current state:

`LOCKFILE_SEMANTICS = UNKNOWN / NOT FULLY PROVEN`

Possible meanings:
- upstream provenance;
- installed artifact;
- normalized content;
- stale lock;
- other.

Investigate the installer/setup mechanism before modifying it.

---

## 11. AGY NATIVE SWARM — VERIFIED

### AGY version

`1.1.22`

### Observed model list

```text
gemini-3.6-flash-medium
gemini-3.6-flash-low
gemini-3.5-flash-high
gemini-3.5-flash-medium
gemini-3.5-flash-low
gemini-3.1-pro-high
gemini-3.1-pro-low
claude-sonnet-4-6
claude-opus-4-6-thinking
gpt-oss-120b-medium
```

Important correction:
Gemini 3.7 Flash is NOT exposed in this AGY build.

Recommended hierarchy:

```text
MASTER / ARCHITECT:
gemini-3.1-pro-high

DEFAULT SUBAGENTS:
model: flash

PREFERRED EXACT BACKEND IF AGY RESOLVES IT:
gemini-3.6-flash-medium

DIFFICULT WORKER ESCALATION:
gemini-3.5-flash-high

ARCHITECTURAL ESCALATION:
gemini-3.1-pro-high
```

Exact mapping of custom-agent `model: flash` to `gemini-3.6-flash-medium` remains unproven.

Do not block implementation on that.

---

## 12. CUSTOM AGY AGENTS

Workspace root:

`/home/amdy/Work/.agents/agents/`

Created:
- `kad-master`
- `kad-researcher`
- `kad-builder`
- `kad-tester`
- `kad-reviewer`

Each lives in:

`.agents/agents/<name>/agent.md`

### kad-master

Responsibilities:
- architecture;
- planning;
- decomposition;
- mutation authority;
- synthesis;
- escalation;
- final acceptance.

Model tier:
`pro`

Actual current target:
`gemini-3.1-pro-high`

### kad-researcher

Read-only evidence investigator.
Returns source paths/symbols/UNKNOWNs.
`model: flash`
`subagent: true`

### kad-builder

Bounded implementation worker.
Receives architecture from master.
`RED → minimum GREEN`.
No architecture invention.
`model: flash`

### kad-tester

Deterministic test/evidence worker.
Must distinguish:
- STATIC
- SIMULATED
- INTEGRATION
- LIVE_OBSERVED

`model: flash`

### kad-reviewer

Independent adversarial reviewer.
Attempts to falsify claims.
Does not mutate source.
`model: flash`

---

## 13. AGY SUBAGENT DEBUG HISTORY

In the first session:
- custom agents were created after the parent session had already started;
- AGY recognized agent names (`DefineSubagent` said already exists);
- native invocation failed:
  `subagent "kad-researcher" not found or not allowed to be invoked`

After fully restarting AGY from the workspace, the fresh session succeeded.

### Fresh-session smoke test

Observed:

```text
agy_version: 1.1.22
master_model: gemini-3.1-pro-high

custom_agent_registry: PRESENT
single_custom_invocation: SUCCESS
native_worker_id: e24d28e1-91b7-4a00-86f8-8f9433ae8cde

parallel_workers_requested: 3
parallel_workers_spawned: 3
parallel_overlap_observed: YES

kad_researcher_model: flash
kad_tester_model: flash
kad_reviewer_model: flash

flash_worker: PROVEN
flash_medium_routing: UNPROVEN

parent_executed_worker_tasks: NO
fresh_session_fixed_invocation: YES
errors: None
```

Independent interpretation:

```text
AGY_SWARM_CONFIGURATION = PASS
EXACT_FLASH_EFFORT_PINNING = UNPROVEN
```

This is enough to proceed.

Do not re-debug native subagent configuration unless it fails again.

---

## 14. SWARM OPERATING PRINCIPLE

Useful shorthand:

> **Flash explores and proves; Pro decides.**

Recommended flow:

```text
parallel Flash read-only discovery
→ Pro master architecture decision
→ Flash tester creates RED
→ Flash builder implements minimum GREEN
→ Flash tester verifies
→ Flash reviewer attacks result
→ Pro master repairs/accepts
```

Escalate the task, not the whole swarm.

Avoid:
- master duplicating worker investigation;
- every worker scanning the whole repo;
- multiple workers mutating the same file;
- polling raw transcript files when `ManageSubagents` works.

Use `ManageSubagents` as the main worker lifecycle control surface.

---

## 15. PI INSTALLATION — CURRENT EVIDENCE

Installed Pi:

`0.84.3`

Install path:

`/home/amdy/.local/share/mise/installs/pi/0.84.3/pi`

Package:
`@earendil-works/pi-coding-agent`

Observed package data:
- version `0.84.3`;
- binary `dist/bundle/cli.js`;
- root library export;
- `./rpc-entry`;
- `./client`.

Relevant installed material discovered:

```text
docs/extensions.md
docs/sdk.md
docs/rpc.md
examples/extensions/**
examples/sdk/06-extensions.ts
examples/rpc-extension-ui.ts
```

Observed extension example included roughly:

```ts
pi.registerCommand("mycommand", {
  description: "Do something",
  handler: async (args, ctx) => {
    ctx.ui.notify(...)
  }
})
```

This strongly indicates a sanctioned Pi extension layer exists.

Do not yet assume which event seam is best. Let `kad-researcher` prove the smallest real lifecycle-observable seam.

---

## 16. EXISTING `kad-lab`

Relevant project:

`/home/amdy/Work/kad-lab`

Observed structure:

```text
build/
exp-002/
Makefile
README.md
src/
test/
```

Existing experiment theme:
deterministic authority boundary for `CandidateIntent → ValidatedIntent → Resolver`.

Build:
`g++ -std=c++20`

Test:
`make test`

This may contain reusable deterministic/evidence patterns.

Do not assume it is automatically the correct Pi experiment root.

---

## 17. CURRENT NEXT WORKPACKAGE

# WP-KAD-001 — PI × KAD-PON × STC TRACER

Goal is NOT a production runtime.

Experiment question:

> Can a real sanctioned Pi event pass through a thin Pi adapter, become one typed KAD-PON notification owned by a Cordis/STC-scoped service, activate only the relevant deterministic causal rule, emit one typed ActionIntent to a harmless sink, and disappear cleanly on teardown with reconstructable evidence?

Target:

```text
REAL PI EVENT
→ THIN PI ADAPTER
→ TYPED KAD NOTIFICATION
→ CORDIS-OWNED KAD-PON SERVICE
→ DETERMINISTIC CONDITION/RULE
→ TYPED ACTION INTENT
→ HARMLESS SINK
→ APPEND-ONLY EVIDENCE
```

Teardown:

```text
DISPOSE
→ EFFECT/LISTENER WITHDRAWAL
→ SAME EVENT AGAIN
→ ZERO REACTION
```

Runtime must make:

`0 model calls`

---

## 18. WP-KAD-001 NON-GOALS

Do NOT build:
- full KAD-PON runtime;
- generic capability resolver;
- provider/model router;
- distributed event bus;
- workflow engine;
- production database;
- long-term memory;
- agent scheduler;
- custom Pi fork;
- SillyTavern integration;
- RPG functionality;
- child-process IPC just for abstraction;
- a new Cordis implementation.

Prefer Pi-sanctioned extension/plugin mechanisms.
Do not modify installed Pi distribution for convenience.

---

## 19. EXPECTED WP-KAD-001 SWARM

Initial parallel tasks:

### A — Pi seam researcher
Prove:
- extension registration;
- event hook;
- lifecycle;
- unsubscribe/dispose;
- real Pi involvement;
- exact source/docs paths.

### B — KAD/Cordis reuse researcher
Find:
- existing lifecycle/service patterns;
- notification concepts;
- journals;
- failure-injection patterns.

### C — tester
Design deterministic RED:
1. adapter translation;
2. relevant activation;
3. irrelevant silence;
4. typed ActionIntent;
5. mount;
6. dispose;
7. post-dispose silence;
8. rule failure;
9. sink failure;
10. no blind retry;
11. journal causality;
12. upstream Pi purity.

### D — reviewer
Pre-mortem:
- simulation mislabeled integration;
- EventEmitter pretending to be Pi;
- polling disguised as PON;
- leaked listener;
- Cordis mentioned but not owning lifecycle;
- hardcoded PASS;
- fake causal metadata.

Master waits for all four and chooses architecture.

---

## 20. REALITY LEVELS

Every test/claim must be labeled:

- `STATIC`
- `SIMULATED`
- `INTEGRATION`
- `LIVE_OBSERVED`

Critical rule:

> A manually constructed Pi-shaped event/object is SIMULATED, not INTEGRATION.

WP-KAD-001 cannot PASS unless actual installed Pi participates in the seam.

---

## 21. MINIMUM CONTRACTS

Keep types narrow.

Possible minimum:

```text
KadNotification {
  id
  type
  source
  payload
  causationId?
  correlationId
}
```

```text
ActionIntent {
  id
  type
  payload
  causationId
  correlationId
}
```

Rule must be explicit:

```text
notification A
→ evaluate condition C

C false
→ no action

C true
→ ActionIntent X
```

Do not hide causal semantics inside an opaque general event emitter.

---

## 22. REQUIRED TESTS

At minimum:
1. one observed Pi callback → one canonical notification;
2. relevant event activates target rule;
3. irrelevant event produces zero target activation;
4. satisfied rule emits one typed ActionIntent;
5. mount installs lifecycle-owned listener;
6. dispose removes it;
7. same input post-dispose causes zero reaction;
8. rule failure cleans up;
9. sink failure cleans up;
10. no blind retry;
11. causal journal reconstructs execution;
12. no unauthorized Pi source mutation;
13. zero runtime model calls.

Do not claim global/distributed exactly-once semantics.

Prefer:
`one observed callback invocation → one notification translation`

---

## 23. EVIDENCE

Suggested root:

`/home/amdy/Work/evidence/WP-KAD-001/`

Suggested artifacts:

```text
environment.json
pre-manifest.tsv
post-manifest.tsv
architecture-decision.json
swarm/
discovery/
contracts/
tests/
runs/
failures/
reviews/
claim-ledger.jsonl
final-audit.json
final-report.md
```

Journal fields may include:

```text
schema_version
event_id
run_id
experiment_id
parent_event_id
causation_id
correlation_id
wall_timestamp
monotonic_timestamp
event_type
component
component_version
stc_scope
code_revision
config_hash
input_artifact_refs
output_artifact_refs
outcome
error
state_before_hash
state_after_hash
```

Nullable where legitimately unavailable.
Never fabricate values.

---

## 24. CLAIM LEDGER

Use:

`claim-ledger.jsonl`

Suggested schema:

```text
claim_id
claim
epistemic_class
reality_level
evidence
derivation
reviewer
verdict
```

Epistemic classes:
- `SOURCE_DERIVED`
- `DESIGN_DECISION`
- `HYPOTHESIS`
- `EXPERIMENT`
- `OBSERVED`

Normative force remains separate:
- `MUST`
- `SHOULD`
- `MUST NOT`

Final verdict must be derived from evidence.

---

## 25. PASS CRITERIA

PASS only when evidence supports:

```text
real_pi_seam = PROVEN
upstream_pi_mutation = ZERO
notification_translation = PASS
relevant_activation = PASS
irrelevant_activation = ZERO
action_intent = PASS
cordis_lifecycle = PASS
dispose = PASS
post_dispose_silence = PASS
rule_failure_cleanup = PASS
sink_failure_cleanup = PASS
blind_retry = ZERO
runtime_model_calls = ZERO
journal_reconstructability = PASS
critical_findings = ZERO
high_findings = ZERO
```

If actual Pi involvement is unproven:
`PARTIAL`

not PASS.

---

## 26. CURRENT STATUS SNAPSHOT

```text
PRIME_DIRECTIVE = FROZEN
ask_user canonical capability = ESTABLISHED
grilling migration = ESTABLISHED ON AGY
AGY native custom subagents = PROVEN
AGY parallel swarm = PROVEN
master model = gemini-3.1-pro-high
worker tier = flash
exact Flash Medium mapping = UNPROVEN
Pi installed = 0.84.3
Pi sanctioned extension layer = STRONGLY INDICATED
WP-KAD-001 final implementation = NOT YET ACCEPTED
WP-SKILL-002 final PASS = NOT TRUSTED; PARTIAL pending epistemic repair
```

The next chat should NOT reconfigure AGY swarm unless it breaks.

Focus should be:
- audit WP-KAD-001 execution output;
- help choose/verify the real Pi seam;
- review RED/GREEN integration evidence;
- prevent simulated or self-certified PASS.

---

## 27. BROADER PROJECT CONTEXT — DO NOT EXPAND CURRENT SCOPE

The user is also building toward a larger pipeline:

```text
SillyTavern worldbuilding
→ canonical world artifacts
→ synthetic interaction data
→ PON/STC/TDD text-game/runtime
→ small local models
→ RAG / QLoRA / quantized inference
→ iterative synthetic-data generation
```

RPG project:
`KHAYN // ABHEL : DYSKORDIA (K.A.D.)`

Themes include:
- cyberpunk;
- supernatural;
- urban Brazil;
- Salvador;
- DATA;
- ABHEL;
- KHAYN;
- DYSKORDIA.

These broader goals matter strategically but are NOT part of WP-KAD-001 unless explicitly brought back into scope.

---

## 28. REVIEW CHECKLIST FOR NEXT TERMINAL OUTPUT

When the user pastes the next agent/terminal run, verify:

1. what was actually proven;
2. STATIC vs SIMULATED vs INTEGRATION vs LIVE_OBSERVED;
3. real Pi participation;
4. Pi adapter thinness;
5. PON causal logic vs polling;
6. Cordis/STC actual lifecycle ownership;
7. RED existed before GREEN;
8. failure injection;
9. post-dispose silence;
10. no blind retries;
11. zero runtime LLM calls;
12. authorized mutation only;
13. exact rollback;
14. claim ledger consistency;
15. no hardcoded PASS;
16. reviewer independence;
17. worker tasks really delegated;
18. no architecture scope creep.

Then return:

`PASS | PARTIAL | BLOCKED`

and the smallest useful next prompt.

---

## 29. ANTI-PATTERNS ALREADY DISCOVERED

Do not repeat:
- custom IPC for a harness capability;
- simulation labeled live;
- keyword checks labeled behavioral equivalence;
- hardcoded final PASS;
- fake "swarm" performed by one master;
- undocumented AGY YAML/model fields;
- assuming `model: flash` means exact Medium;
- all agents scanning the same corpus;
- multiple workers mutating the same file;
- rebuilding known discovery from zero;
- initializing unnecessary repositories;
- modifying Pi installation for convenience;
- self-referential commit evidence.

---

## 30. FINAL CONTINUATION DIRECTIVE

Preserve frozen architecture.

Use real swarm execution where parallelism helps.

Keep control logic model/provider agnostic.

Prefer the smallest empirical tracer that proves the architecture.

A small trustworthy `PARTIAL` outranks a sophisticated false `PASS`.
