# Research Synthesis: Deterministic vs. Probabilistic Agent Control in Software Engineering Systems

## 1. Research Question

> **How do state-of-the-art agent architectures reconcile probabilistic model generation with deterministic verification, fail-closed security invariants, and reproducible task execution?**

---

## 2. Epistemic Classification Framework

To preserve research integrity, findings are strictly classified into four epistemic categories:
* **`[SOURCE_FACT]`**: Directly extracted from verified peer-reviewed publications.
* **`[DERIVED_SYNTHESIS]`**: Logical integration across multiple verified source findings.
* **`[PROJECT_INFERENCE]`**: Architectural application to KAD-PI design and invariants.
* **`[UNKNOWN]`**: Open empirical questions requiring further experimental validation.

---

## 3. Core Findings from Real Corpus

### 3.1 Separation of Thoughts and External Actions
* `[SOURCE_FACT]` Language models struggle with multi-step reasoning when reasoning-only (hallucination) or action-only (lack of long-term planning) approaches are used in isolation (*Yao et al., 2023 [ReAct]*).
* `[SOURCE_FACT]` Generating interleaved reasoning traces allows models to maintain and update action plans, while external actions ground the model in real environment state transitions (*Yao et al., 2023 [ReAct]*).
* `[PROJECT_INFERENCE]` KAD-PI's separation between model planning (proposals) and deterministic authority (gates, workctl, economic routing) aligns directly with ReAct's thought-action boundary.

### 3.2 Deterministic Test Execution as Ground-Truth Anchor
* `[SOURCE_FACT]` Real-world software engineering issues cannot be solved reliably without multi-file context and deterministic unit test execution (*Jimenez et al., 2024 [SWE-bench]*).
* `[SOURCE_FACT]` Seemingly plausible LLM patch completions frequently fail regression tests or introduce subtle edge-case breakage when subjected to deterministic verification (*Jimenez et al., 2024 [SWE-bench]*).
* `[PROJECT_INFERENCE]` Model output must never be treated as authoritative evidence; acceptance requires deterministic test suite execution (`make test`, `node --test`).

### 3.3 Overcoming Probabilistic Limits with Deterministic Tools
* `[SOURCE_FACT]` LLMs exhibit inherent failure modes in precise arithmetic, dynamic factual lookup, and temporal reasoning (*Schick et al., 2023 [Toolformer]*).
* `[SOURCE_FACT]` Executing deterministic API calls and filtering out unhelpful tool invocations significantly reduces prediction perplexity (*Schick et al., 2023 [Toolformer]*).
* `[PROJECT_INFERENCE]` KAD-PI's deterministic-first toolchain (`jq`, `ast-grep`, `trivy`, `gitleaks`) provides hard guarantees that probabilistic model inference cannot reliably deliver.

### 3.4 Dynamic Verbal Reflection Without Weight Mutation
* `[SOURCE_FACT]` Storing verbal self-reflections derived from execution failure signals in an episodic memory buffer enables agents to rapidly correct errors on subsequent attempts without model fine-tuning (*Shinn et al., 2023 [Reflexion]*; *Madaan et al., 2023 [Self-Refine]*).
* `[DERIVED_SYNTHESIS]` Inference-time reflection loops anchored on deterministic environment feedback (e.g. test failures, linter errors) provide a sample-efficient mechanism for agent self-repair without mutating underlying model weights.

---

## 4. Architectural Synthesis for KAD-PI

`[DERIVED_SYNTHESIS]` Reconciling probabilistic models with deterministic requirements requires a tripartite architecture:
1. **Probabilistic Generator (Model)**: Proposes candidate code edits, reasoning traces, and tactical steps.
2. **Deterministic Harness & Gates (KAD-PI Substrate)**: Enforces security invariants (path confinement, secret scanning), verifies provenance, and manages claims.
3. **Deterministic Verifier (Environment)**: Executes test suites, computes hashes, and gates ticket transitions.

---

## 5. Remaining UNKNOWNs

* `[UNKNOWN]` Optimal ratio of self-reflection rounds before diminishing returns occur in complex multi-file refactoring tasks.
* `[UNKNOWN]` Empirical performance impact of local vs remote models when executing deterministic tool-use loops under constrained token budgets.
