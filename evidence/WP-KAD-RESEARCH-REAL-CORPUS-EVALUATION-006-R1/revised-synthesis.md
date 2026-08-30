# Revised Research Synthesis: Deterministic vs. Probabilistic Agent Control in Software Engineering Systems (R1 Audit)

## 1. Research Question

> **How do state-of-the-art agent architectures reconcile probabilistic model generation with deterministic verification, fail-closed security invariants, and reproducible task execution?**

---

## 2. Epistemic Classification Framework

All statements are strictly partitioned into four epistemic categories:
* **`[SOURCE_FACT]`**: Directly supported by verified primary publication text without added framing.
* **`[DERIVED_SYNTHESIS]`**: Explicit logical derivation across multiple verified primary sources.
* **`[PROJECT_INFERENCE]`**: Architectural application to KAD-PI design and software invariants.
* **`[UNKNOWN]`**: Open empirical questions requiring further experimental evidence.

---

## 3. Audited Source-Grounded Findings (`[SOURCE_FACT]`)

### 3.1 ReAct: Thought-Action Interleaving
* `[SOURCE_FACT]` Prompting language models to generate interleaved reasoning traces and task-specific actions improves multi-step decision-making on interactive benchmarks (ALFWorld, WebShop) and reduces hallucination/error propagation on question answering (HotpotQA) and fact verification (Fever) compared to reasoning-only or action-only baselines (*Yao et al., ICLR 2023, Abstract, §1, §3*).
* `[SOURCE_FACT]` Separating thoughts (internal working memory and state tracking) from acts (external environment transitions) provides a human-interpretable execution trajectory for diagnosing agent behavior (*Yao et al., ICLR 2023, §3.1, §4*).

### 3.2 SWE-bench: Multi-File Code Evaluation via Unit Test Harnesses
* `[SOURCE_FACT]` SWE-bench evaluates language model code patch generation across 2,294 real-world GitHub problems from 12 Python repositories using pre-existing repository unit tests (pass-to-pass) and issue-reproducing tests (fail-to-pass) (*Jimenez et al., ICLR 2024, Abstract, §2, §3*).
* `[SOURCE_FACT]` Frontier models deployed in a zero-shot scaffold resolved fewer than 5% of real GitHub issues in the SWE-bench evaluation suite (Claude 2: 4.8%, GPT-4: 1.7%) (*Jimenez et al., ICLR 2024, §4 [Table 1]*).

### 3.3 Toolformer: Self-Supervised API Insertion via Perplexity Filtering
* `[SOURCE_FACT]` Toolformer learns self-supervised API call generation by training on text augmented with candidate tool calls, retaining only those calls where the returned tool execution result strictly reduces language modeling cross-entropy loss on subsequent token prediction (*Schick et al., NeurIPS 2023, Abstract, §2, §3*).
* `[SOURCE_FACT]` Filtering API invocations based on perplexity reduction enables a single model to improve zero-shot performance across math (ASDiv, SVAMP), QA (LAMA), and temporal reasoning (TempLAMA) benchmarks using external APIs (Calculator, QA, Wikipedia, Calendar) (*Schick et al., NeurIPS 2023, §4 [Tables 1-3]*).

### 3.4 Reflexion: Verbal Reinforcement Learning from External Feedback
* `[SOURCE_FACT]` Reflexion endows language agents with verbal reinforcement learning by converting external environment feedback (e.g. test failure traces, scalar rewards, execution errors) into natural language self-reflections stored in an episodic memory buffer across consecutive trials (*Shinn et al., NeurIPS 2023, Abstract, §2, §3*).
* `[SOURCE_FACT]` Storing verbal self-reflections in episodic memory improves GPT-4 pass@1 accuracy on the HumanEval Python benchmark from 67.0% to 91.0% through iterative execution feedback without fine-tuning model parameters (*Shinn et al., NeurIPS 2023, §4.1 [Table 1]*).

### 3.5 Self-Refine: Training-Free Multi-Aspect Self-Critique
* `[SOURCE_FACT]` Self-Refine iteratively improves text generation using self-generated multi-aspect critique and actionable feedback on a single frozen LLM without requiring external execution feedback, training data, or human annotations (*Madaan et al., NeurIPS 2023, Abstract, §2, §3*).
* `[SOURCE_FACT]` Iterative self-refinement improves one-step generation performance by ~20% absolute across 7 tasks, including code optimization, acronym generation, and constrained dialogue (*Madaan et al., NeurIPS 2023, §4 [Table 1]*).

---

## 4. Derived Synthesis across Literature (`[DERIVED_SYNTHESIS]`)

* `[DERIVED_SYNTHESIS]` **Executable Evaluation vs. Universal Truth**: Executable unit test suites provide concrete behavioral verification signals that reveal when syntactically plausible model completions break regressions (as demonstrated in SWE-bench and Reflexion); however, test execution is a benchmark grading mechanism and does not constitute universal semantic correctness.
* `[DERIVED_SYNTHESIS]` **External Execution as Grounding**: Interleaving external API calls and environment actions into language model decoding grounds the model in deterministic environment state transitions and reduces predictive loss on downstream tasks (synthesized from *Yao et al.* and *Schick et al.*).
* `[DERIVED_SYNTHESIS]` **External Feedback vs. Internal Critique**: Inference-time reflection loops improve task performance without weight updates through two distinct mechanisms: (1) external environment/test feedback stored in episodic memory (*Reflexion*), or (2) internal self-generated multi-aspect critique (*Self-Refine*).

---

## 5. Architectural Application to KAD-PI (`[PROJECT_INFERENCE]`)

* `[PROJECT_INFERENCE]` **Tripartite Separation of Authority**: In KAD-PI, reconciling probabilistic models with deterministic software invariants is achieved by structurally separating:
  1. **Probabilistic Generator (Model)**: Proposes reasoning traces, diffs, and candidates.
  2. **Deterministic Substrate & Harness (KAD-PI)**: Enforces security invariants (path confinement, secret redaction), manages claims, and validates manifests.
  3. **Deterministic Verifier (Environment)**: Executes test suites, computes cryptographic hashes, and gates workctl ticket transitions.
* `[PROJECT_INFERENCE]` **Fail-Closed Verification Doctrine**: Because language models struggle to reliably self-evaluate without external grounding (*Yao et al.*, *Jimenez et al.*), model-asserted success is never treated as authoritative evidence; ticket acceptance strictly requires deterministic test suite PASS.

---

## 6. Remaining UNKNOWNs (`[UNKNOWN]`)

* `[UNKNOWN]` Optimal trade-off between external test feedback loops (*Reflexion*) versus internal self-critique (*Self-Refine*) in multi-turn software engineering tasks.
* `[UNKNOWN]` Token economics and latency costs of multi-trial verbal reflection compared to deterministic AST linting and static analysis tools.
