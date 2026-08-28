# HANDOFF — DEEPHAR DREAM OS / SAFE PLUGIN LAB
## Architecture & Implementation Steering Checkpoint — 2026-08-26

## Purpose

Terminology:
- **DeepHar** = DeepSeek Harness (`dsh`).
- **Dream OS** = the user's Omarchy 4 Quattro workstation progressively operated/customized through agents.
- **Trusted workspace root** = `/home/amdy/Work`.
- **KAD lab** = RPG implementation/testing lab. It is a consumer of harness capabilities, not the harness infrastructure repo.
- **DeepHar kernel/plugin lab** = `/home/amdy/Work/tries/deepseek-harness-lab`.
- Existing tutorial scratch area: `/home/amdy/Work/tries/deepseek-harness-lab/tmp/cordis-tutorial`.

Near-term objective:

> Build a safe, reversible, evidence-producing DeepHar development environment in which first-party experiments and third-party DeepHar/Cordis plugins can be inspected, tested, rejected, versioned, and only then promoted.

Long-term objective:

> Use DeepHar as the user's primary harness for fun/personal projects, including safe customization of Omarchy, Hyprland, Quickshell, and the Omarchy shell/plugin ecosystem.

---

## Current Human + Model Workflow

Human remains final authority.

- Planner / Architect: GPT-5.6 Luna HIGH or DeepSeek V4 Pro HIGH.
- Builder: DeepSeek V4 Flash.
- Independent reviewer: ChatGPT GPT-5.6 Sol HIGH.
- Primary access: OpenCode Go.
- Secondary pools: Google AI Pro, ChatGPT Plus.
- OpenRouter emergency reserve: USD 1.50.

Frozen principles:
- `ROLE != MODEL`
- `ROLE != PROVIDER`
- `UNKNOWN > guess`
- `STOP means STOP`
- Builder may not repair-and-continue after STOP.
- Builder may not choose architecture or expand scope.
- Fresh-session WorkPackages must be self-contained.
- Deterministic validation outranks model self-assessment.

Preferred loop:

USER INTENT
→ ARCHITECT / PLANNER
→ REVIEWER
→ bounded self-contained WorkPackage
→ BUILDER
→ deterministic evidence
→ REVIEWER
→ ACCEPT | REVISE | ROLLBACK | REPLAN

Evidence vocabulary:
`CONFIRMED`, `DOCUMENTED`, `OBSERVED`, `INFERRED`, `HYPOTHESIS`, `UNKNOWN`, `DRIFT`, `DESIGN_DECISION`.

---

## Existing Labs

### KAD

Latest accepted state:
- `KAD-WP-002 = ACCEPTED_BLOCKED`
- `PRIMARY_CALLS = 0`
- `HYPOTHESIS = NOT_EVALUATED`
- deterministic adapter/parser/control infrastructure is green for tested paths
- WP-001 integrity preserved
- blocker: Builder session could not reach the mandated direct `ctx.llm.stream()` seam through the required temporary Cordis plugin path.

A discovery WorkPackage was prepared:
`KAD-WP-002A — SANCTIONED TRANSPORT-SEAM DISCOVERY`

Its output remains useful because the same Cordis runtime composition question matters to the future DeepHar plugin lab.

Do **not** turn KAD into the global plugin infrastructure repository.

### DeepHar kernel/plugin lab

Path:
`/home/amdy/Work/tries/deepseek-harness-lab`

Prior work includes Cordis/PON/spatiotemporal-composability experiments and `PON-KERNEL-*` probes, with state around `PON-KERNEL-008`.

Do not blindly resume old probes. First reconcile that lab with the target architecture below.

---

## Official DeepHar Architecture Relevant to This Plan

DeepSeek Harness is a developer preview and explicitly warns about compatibility-breaking changes.

Useful native architecture:
- Cordis is the plugin kernel.
- Model adapters, tools, sessions, sandboxing, scheduling, UI, and agent loops are plugins.
- Ordinary extension should happen by mounting plugins beside existing ones, not by patching a privileged core.
- Profiles compose ordered bundles and patch layers.
- Out-of-tree plugins can live in profiles.
- Session runs are traceable.
- Cordis registrations/effects are lifecycle-managed and reversible.

Useful modes:
- Standard
- Code
- Minimal
- Creator

Creator mode is the intended surface for runtime inspection, in-memory plugin experiments, and preset authoring.

The extensions subsystem supports:
- versioned Plugins;
- immutable Packages;
- Host/Client halves;
- approval;
- inspection;
- activation;
- stop;
- update/rollback;
- teardown.

`@deepseek-ai/dsh-tool-cordis` exposes model-facing dynamic Cordis tools, but is deliberately not enabled in shipped trees by default because dynamic plugin code reaches the live runtime.

---

## Critical Security Boundary

DeepHar's built-in process sandbox is useful but not sufficient by itself for hostile/untrusted in-process plugins.

The official process sandbox:
- confines spawned subprocess file effects;
- supports `read-only`, `workspace-write`, `danger-full-access`;
- can use Linux Bubblewrap/Landlock;
- must fail closed when confinement is unavailable;
- does not claim network or process-visibility confinement.

Important consequence:

> A plugin/tool running in-process is not made safe merely because subprocesses use `ctx.sandbox`.

Therefore unknown internet plugins require a **whole-DeepHar-process isolation layer** for first execution.

Do not treat Node `vm` alone as a strong hostile-code OS security boundary.

---

## Target Trust Zones

### Z0 — Production / Personal DeepHar
- normal daily use;
- real `/home/amdy/Work`;
- approved plugins only;
- no arbitrary internet plugin executed directly.

### Z1 — Integration Lab
- dedicated DeepHar lab profile;
- selected workspace only;
- no unrelated home/config writes;
- secrets only by explicit test need;
- network opt-in.

### Z2 — Dynamic Plugin Sandbox
- Creator mode / `dsh-tool-cordis`;
- disposable DeepHar HOME/XDG state;
- whole DeepHar process inside OS-level confinement;
- only fixture workspace writable;
- personal config/credentials absent;
- network disabled by default;
- deterministic teardown.

### Z3 — Internet Plugin Quarantine
Default = **DO NOT EXECUTE**.

Pipeline:
1. fetch/clone without activation;
2. pin exact revision;
3. record origin + hash;
4. inspect metadata;
5. static audit;
6. dependency audit;
7. enumerate Cordis services/events/tools used;
8. privilege classification;
9. deterministic tests;
10. first execution only in Z2.

---

## Candidate On-Disk Shape

Do not create until a bounded WorkPackage authorizes it.

`/home/amdy/Work/tries/deepseek-harness-lab/`

- `upstream/`
- `kernel/`
- `plugins/first-party/`
- `plugins/third-party/`
- `plugins/approved/`
- `quarantine/`
- `fixtures/`
- `profiles/`
- `sandbox/`
- `tests/`
- `evidence/`
- `docs/`
- `tmp/`

KAD outputs remain outside this infrastructure tree.

---

## Plugin Promotion Pipeline

`UNSEEN`
→ `QUARANTINED`
→ `STATICALLY_REVIEWED`
→ `SANDBOX_TESTED`
→ `INTEGRATION_TESTED`
→ `APPROVED`
→ `ENABLED`
→ `REVOKED`

Per-plugin record should capture:
- plugin id/name;
- source URL;
- exact commit/tag/hash;
- license;
- DeepHar/Cordis version tested;
- services/tools/filesystem/network/credential requirements;
- Host/Client halves;
- persistent effects;
- cleanup;
- tests;
- reviewer verdict;
- promotion history.

A new upstream version re-enters review.

---

## Dynamic Cordis Development Strategy

Prefer DeepHar's native extension model.

Rapid experiment workflow:
1. inspect exact runtime API;
2. define immutable Package;
3. run in isolated lab process;
4. inspect diagnostics;
5. stop/update/rollback;
6. promote accepted behavior to a normal local/project/repository Plugin.

Keep identities distinct:
- `Plugin` = stable extension identity
- `Package` = immutable version
- `Run` = one activation attempt

`dsh-tool-cordis` should be lab-only, not casually enabled in the normal daily profile.

---

## Whole-Host Isolation Requirements

Minimum target for first execution of untrusted plugin code:

- host filesystem read-only by default;
- explicit fixture workspace writable;
- disposable XDG DATA/CACHE/STATE/TMP;
- disposable/minimal HOME;
- no personal credentials;
- no SSH/GPG/cloud/OpenCode/provider secrets unless explicitly mapped;
- network disabled by default;
- no privileged devices;
- no mutation access to real Omarchy config;
- no access to `~/.config/omarchy/plugins` or `shell.json`;
- deterministic cleanup;
- fail closed if isolation cannot be established.

DeepHar's own per-process sandbox should remain active where applicable. Whole-host and per-process sandboxing are complementary.

---

## Omarchy / Dream OS Integration

Omarchy 4 Quattro is a strong long-term target:
- one long-running Quickshell process (`omarchy-shell`);
- bar, panels, overlays, menu, services, etc. are plugins;
- user plugins live under `~/.config/omarchy/plugins/<id>/`;
- plugins have `manifest.json`;
- shell IPC can list/rescan/reload/enable/disable;
- user customizations are separated from Omarchy-owned source.

Critical official warning:

> Third-party Omarchy shell plugins run arbitrary unsandboxed code inside the user's long-lived shell process.

Therefore DeepHar must never automatically install+enable arbitrary Omarchy plugins from the internet.

Future workflow:

SOURCE
→ quarantine
→ manifest validation
→ static audit
→ isolated/demo test
→ UI validation
→ reviewer/user acceptance
→ install disabled
→ inspect state/diff
→ enable
→ health check
→ rollback retained

Prefer user plugin directories, user shell config, supported IPC, and supported plugin APIs.
Avoid editing Omarchy-owned first-party source.

Long-term DeepHar targets:
- Quickshell widgets/panels;
- bar composition;
- notifications;
- themes;
- shell IPC;
- Hyprland user config;
- wallpapers/backgrounds;
- terminal config;
- launchers;
- status/telemetry;
- project workflow UI.

Dream OS evolution:

`Recover`
→ `Stabilize`
→ `Sandbox`
→ `Compose`
→ `Customize`
→ `Distribute`
→ `Train`
→ `Automate`

---

## Relationship Between KAD and DeepHar Lab

KAD should become an early integration client.

`KAD-WP-002A` remains useful because it asks whether a bounded agent can reach the required live Cordis/LLM seam.

After its report:

**Do not immediately perform a KAD-specific global profile mutation.**

Instead ask:

> Can the required seam be provided through a dedicated DeepHar Lab profile without changing the normal daily-use profile?

If yes:
- implement in the lab;
- rerun KAD through the lab.

If no:
- escalate architecture before touching shared production composition.

---

## Revised Near-Term Roadmap

### PHASE A — Evidence capture
A1. Receive/review current `KAD-WP-002A` output.

A2. Extract only facts that generalize to the DeepHar lab:
- profile/bundle composition;
- Creator/Cordis tool activation;
- runtime lifecycle;
- required restart/reload;
- direct `ctx.llm.stream()` exposure path.

### PHASE B — Lab architecture preflight

`DEEPHAR-LAB-001 — CURRENT RUNTIME & ISOLATION CAPABILITY MAP`

Questions:
- Can a separate lab profile exist without altering the normal profile?
- How are out-of-tree plugins/profile patches loaded?
- Can Creator / `dsh-tool-cordis` be lab-only?
- Which sandbox backend/enforcement is active on this Omarchy host?
- Can the entire lab DeepHar process run under bwrap?
- Which paths must be writable to boot?
- Which credential/model path is minimally required for model-backed tests?
- Can credentials be mapped read-only without exposing unrelated secrets?

Discovery only.

### PHASE C — Whole-host sandbox canary

`DEEPHAR-LAB-002 — DISPOSABLE HOST BOOT CANARY`

Boot a separate DeepHar lab instance/profile with:
- production FS read-only;
- fixture workspace writable;
- disposable state;
- no real user config writes;
- no secrets;
- deterministic cleanup.

No third-party plugin.

### PHASE D — Native dynamic plugin canary

`DEEPHAR-LAB-003 — CREATOR/CORDIS HELLO PLUGIN`

Prove:
- inspect;
- define;
- activate;
- harmless tool/service registration;
- stop;
- effects unwind;
- new Package;
- update;
- rollback;
- undefine.

### PHASE E — Safety canaries

`DEEPHAR-LAB-004`

Synthetic buggy/malicious plugins:
- forbidden file write;
- outside-fixture write;
- child process;
- network attempt;
- mount failure;
- dispose failure;
- listener/timer leak;
- bounded long/infinite operation.

Classify:
- `ENFORCED`
- `PARTIALLY_ENFORCED`
- `UNENFORCEABLE`

### PHASE F — Third-party quarantine

`DEEPHAR-LAB-005`

Choose one small external plugin:
- pin revision;
- static audit;
- run only in Z2;
- provenance + behavior report.

### PHASE G — KAD integration

Rerun KAD-WP-002 through the sanctioned lab seam.

### PHASE H — Omarchy adapter

Build a DeepHar skill/plugin that can:
- inspect Omarchy plugin/config state;
- validate candidates;
- stage user-owned config;
- generate diffs;
- request approval;
- apply bounded mutations;
- health-check shell;
- rollback.

Do not grant blanket write access to all `~/.config`.

### PHASE I — Dream OS workflow

Use DeepHar as primary personal-project harness with:
- project-scoped mutation;
- plugin lab;
- Omarchy adapter;
- model routing;
- evidence/review loop;
- controlled automation later.

---

## Model Routing

- Builder: DeepSeek V4 Flash HIGH.
- Architecture choices: DeepSeek V4 Pro HIGH.
- Cross-component reconciliation: GPT-5.6 Luna HIGH.
- Reviewer: GPT-5.6 Sol HIGH while available.
- Secondary architecture/review: Gemini 3.1 Pro HIGH.
- Cheap discovery/summaries: Gemini 3.7 Flash.
- OpenRouter reserve only as emergency failover.

Do not spend Luna on mechanical discovery.

---

## Immediate Steering Instruction

When the next terminal output arrives:

1. Review it strictly as evidence for `KAD-WP-002A`.
2. Do not authorize global profile mutation merely because it identifies a way to enable `dsh-tool-cordis`.
3. Extract transport/composition facts that generalize to the DeepHar Lab.
4. Close KAD discovery with PASS/BLOCKED.
5. Next architecture gate should be:
   `DEEPHAR-LAB-001 — CURRENT RUNTIME & ISOLATION CAPABILITY MAP`.
6. KAD model experiment resumes later through the sanctioned lab environment.

---

## First Useful DeepHar Lab MVP Acceptance Criteria

The lab MVP is complete when:

- normal DeepHar profile is unchanged;
- dedicated lab startup is reproducible;
- lab state is disposable or explicitly scoped;
- only a fixture/project root is writable;
- secrets are absent by default;
- network is disabled by default or limitation explicitly classified;
- Creator/Cordis tooling is lab-only;
- one trusted test plugin can define/run/stop/update/rollback/undefine;
- effects demonstrably unwind;
- forbidden write canary fails;
- crash/failure leaves production profile untouched;
- deterministic evidence is produced;
- third-party code can be quarantined without activation;
- promotion requires explicit Reviewer/Human acceptance.

This is the first meaningful milestone toward the Dream OS.

---

## Source-of-Truth References

DeepSeek Harness:
- https://deepseek.com/harness/en/
- https://github.com/deepseek-ai/deepseek-harness
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cordis-primer.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cordis-tutorial/index.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/extensions.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/sandbox.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/tool-catalog.md

Cordis:
- https://github.com/cordiverse/cordis

Omarchy:
- https://omarchy.org/
- https://github.com/basecamp/omarchy
- https://github.com/basecamp/omarchy/blob/quattro/manual/32-shell-plugins.md
- https://github.com/basecamp/omarchy/blob/quattro/docs/omarchy-shell.md
- https://github.com/basecamp/omarchy/blob/quattro/shell/README.md
- https://github.com/basecamp/omarchy/blob/quattro/AGENTS.md

Videos supplied for orientation:
- https://youtu.be/legYz3Hk2rQ
- https://youtu.be/F7fe9pa8OeE
- https://youtu.be/_CuibYl_Fh0
- https://youtu.be/OIUBhUcx8cA
- https://youtu.be/MWvH7BRgwL8

---

## Role for a New Chat

You are the user's:

**DEEPHAR IMPLEMENTATION ADVISOR / NEXT-STEP REVIEWER**

Do not compete with the high-level Architect.

Translate:

USER INTENT
+ ARCHITECT PLAN
+ CURRENT PROJECT STATE
+ REAL TERMINAL EVIDENCE

into:

THE SMALLEST SAFE IMPLEMENTABLE NEXT STEP.

Preserve:
- trust zones;
- promotion pipeline;
- KAD/DeepHar infrastructure separation;
- evidence-driven WorkPackages;
- human final authority;
- model/provider independence;
- reversible Omarchy customization;
- third-party plugin quarantine.

Do not authorize production/Dream-OS mutation until the DeepHar Lab MVP has proven its safety boundaries.
