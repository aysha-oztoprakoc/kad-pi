---
doc_id: SAFE_LAB_TOOLCHAINS
title: "Lab & Toolchains: DeepHar, Safe Plugins & Omarchy Workstation Customization"
domain: SAFE_LAB_TOOLCHAINS
epistemic_status: DESIGN_DECISION
source_documents:
  - wiki/DEEPHAR_DREAM_OS_SAFE_PLUGIN_LAB_HANDOFF.md
  - "wiki/HANDOFF — Omarchy QuickShell Aesthetic Design via OpenCode Harness.md"
  - wiki/OFFICIAL_SOL_REVIEWER_HANDOFF_DREAM_SETUP_R2.md
retrieval_keywords:
  - DeepHar
  - DeepSeek Harness
  - Dream OS
  - QuickShell
  - Omarchy
  - Hyprland
  - Plugin Sandbox
  - Safe Lab
---

# Lab & Toolchains: DeepHar, Safe Plugins & Omarchy Customization

## Executive Summary
This document specifies the safe experimental lab environment for **DeepHar (DeepSeek Harness / Cordis)**, **Dream OS (Omarchy 4 Quattro)**, and **QuickShell / Hyprland** desktop customizations. The harness provides an isolated staging area to test, verify, and reject plugins before promoting them to the live operating system environment.

---

## 1. Laboratory Layout & Hierarchy

```text
/home/amdy/Work
  ├── tries/deepseek-harness-lab/       <-- Isolated DeepHar / Cordis Plugin Lab
  │     ├── tmp/cordis-tutorial/        <-- Ephemeral scratch area (Gitignored)
  │     └── vendor/cordis/              <-- Vendored Cordis library
  │
  ├── technopagan-netrunner/            <-- QuickShell / QML / Theme Plugins
  │     ├── quickshell/                 <-- QML UI Shell definition
  │     └── plugins/                    <-- Domain-specific QML plugins
  │
  └── data_workspace/                   <-- M908 / Controller input routing
```

---

## 2. Safe Plugin Protocol & Isolation Invariants

```text
[THIRD-PARTY / UNTRUSTED PLUGIN]
               │
               ▼
   [INSPECT & STATIC SCAN]
   (AST validation, import check, authority bounds)
               │
               ▼
    [ISOLATED PROBE RUN]
    (tries/deepseek-harness-lab sandbox, mock effects)
               │
               ├─(failure/leak detected)─► [REJECT & RECORD DEFECT]
               │
               ▼
   [PASS: VERIFIED DISPOSAL]
   (Verified ctx.on('dispose') cleanup)
               │
               ▼
   [PROMOTION TO DREAM OS]
```

### Invariants
* **[DESIGN_DECISION]** **No Live OS Modification Without Prior Lab Verification**: Plugins modifying system configuration, desktop shell, or keybindings must pass deterministic verification in `tries/deepseek-harness-lab` first.
* **[DESIGN_DECISION]** **Cordis Scoping != OS Security Boundary**: Cordis manages component lifetimes, event teardowns, and dependency graphs. Malicious binary code or low-level shell calls must be constrained by OS permissions / sandbox controls.
* **[DESIGN_DECISION]** **Progressive Aesthetic Tuning**: UI changes to QuickShell / Omarchy follow single-variable bounded visual iterations with before/after screenshots and regression verification.
