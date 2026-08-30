# OMP Capability Admission & Extension Architecture Evaluation (WP-021 Phase 2)

## 1. Context & Problem Statement
In Oh My Pi (OMP), third-party extensions provide powerful runtime hooks (`before_agent_start`, `after_provider_response`, custom tools, shortcuts). However, without strict architectural boundaries, plugins risk:
1. Accidentally becoming architectural dependencies;
2. Mutating canonical knowledge or routing policy without governance;
3. Leaking secrets or unmetered token spend;
4. Introducing non-deterministic interception ordering.

## 2. The Core Admission Invariant
```text
ISA / ADR Authority
        ↓
workctl + KAD Policy Gate
        ↓
OMP Runtime Harness
        ↓
Replaceable Capabilities / Extensions
```
**Inviolable Rule**: *If every third-party plugin disappeared tomorrow, KAD canonical truth and operations must survive 100% intact.*

---

## 3. Evaluation of Candidate Extensions

| Extension Candidate | Primary Function | Risk Level | Authority Boundary | Admission Recommendation |
|---|---|---|---|---|
| **`pi-lens`** | Token/context window breakdown visualizer | `LOW` | Presentation / Observer only (read-only) | Eligible for Canary |
| **`pi-death-loop-guard`** | Repetitive failure / infinite cycle circuit breaker | `MEDIUM` | Interception / Execution abort | High Value; requires strict deterministic thresholds |
| **`pi-behavior-control`** | Action envelope constraint | `MEDIUM` | Interception / Pre-validation | Evaluated as supplementary to KAD evidence gates |
| **`context-mode`** | Progressive context compression | `HIGH` | Context mutation | Must not alter canonical evidence packs |
| **`Plannotator`** | Visual task dependency annotation | `LOW` | Presentation only | Must remain non-authoritative over `workctl` |
| **`pi-lean-edit`** | AST-aware surgical editing | `MEDIUM` | Tool / Code mutation | Evaluated as deterministic tool provider |
| **`pi-graph-viz`** | Dynamic runtime dependency graph viewer | `LOW` | Presentation / Sofia adapter | Read-only observer only |

---

## 4. Architectural Alternatives for Admission Governance

### Option A: Separate Bounded OMP Capability Canary WP
- **Description**: Halt WP-021 to draft and execute a dedicated `WP-KAD-OMP-CAPABILITY-CANARY-022` testing each plugin in isolation before measuring compute fabric performance.
- **Trade-off**: Increases process serialization; delays empirical compute fabric hardware benchmarking.

### Option B: Define Admission Contract in WP-021; Defer Plugin Canaries to Follow-on WPs (RECOMMENDED)
- **Description**: Define the formal **6-Stage Capability Admission Contract** (`discover` → `sandbox` → `measure` → `verify` → `promote narrowly` → `degrade safely` → `replace freely`) and **Interception Precedence Matrix** inside the Compute Fabric Ideal State specification in WP-021. Defer actual multi-plugin runtime installation to bounded follow-on experimental workpackages.
- **Trade-off**: Keeps WP-021 focused on compute fabric self-measurement while locking down plugin governance.

### Option C: Minimal Generic Contract, No Extension Evaluation
- **Description**: Declare basic non-authority of plugins without specifying admission stages, candidate evaluations, or interception ordering.
- **Trade-off**: Leaves plugin boundary ambiguous; risks future architectural erosion.
