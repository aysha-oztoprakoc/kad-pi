# KAD KnowledgePlane Claim Projection

<!-- DERIVED: canonical claim records remain authoritative. -->

## CLM-001-REACT-REASONING-ACTING

- Canonical ID: `kp:claim:CLM-001-REACT-REASONING-ACTING`
- Epistemic class: `SOURCE_FACT`
- Authority: `AUTHORITATIVE_EVIDENCE`
- Source: `corpus/research/react-iclr2023.txt`
- Source hash: `ec5216b74c23182e3c9899d1e84582954b5f115d93d9b7982b424c42cbff17dc`
- Claim: Prompting language models to generate interleaved reasoning traces and task-specific actions improves multi-step decision-making and factual retrieval over reasoning-only or action-only baselines.

## CLM-002-REACT-STATE-SEPARATION

- Canonical ID: `kp:claim:CLM-002-REACT-STATE-SEPARATION`
- Epistemic class: `SOURCE_FACT`
- Authority: `AUTHORITATIVE_EVIDENCE`
- Source: `corpus/research/react-iclr2023.txt`
- Source hash: `ec5216b74c23182e3c9899d1e84582954b5f115d93d9b7982b424c42cbff17dc`
- Claim: Separating thoughts (internal mental state representation) from acts (external state transitions) provides a human-interpretable trace for diagnosing agent behavior.

## CLM-003-SWEBENCH-BENCHMARK-HARNESS

- Canonical ID: `kp:claim:CLM-003-SWEBENCH-BENCHMARK-HARNESS`
- Epistemic class: `SOURCE_FACT`
- Authority: `AUTHORITATIVE_EVIDENCE`
- Source: `corpus/research/swe-bench-iclr2024.txt`
- Source hash: `7014cded3f4b165bca4b525f6df5ae5eb6730251248e505b802a2067cd0b542c`
- Claim: SWE-bench evaluates LLM code generation on 2,294 real-world GitHub issues using existing repository unit tests and issue-reproducing fail-to-pass tests.

## CLM-004-SWEBENCH-BASELINE-ACCURACY

- Canonical ID: `kp:claim:CLM-004-SWEBENCH-BASELINE-ACCURACY`
- Epistemic class: `SOURCE_FACT`
- Authority: `AUTHORITATIVE_EVIDENCE`
- Source: `corpus/research/swe-bench-iclr2024.txt`
- Source hash: `7014cded3f4b165bca4b525f6df5ae5eb6730251248e505b802a2067cd0b542c`
- Claim: Baseline language models in a zero-shot scaffold resolved fewer than 5% of SWE-bench GitHub issues (Claude 2: 4.8%, GPT-4: 1.7%).

## CLM-006-TOOLFORMER-PERPLEXITY-FILTER

- Canonical ID: `kp:claim:CLM-006-TOOLFORMER-PERPLEXITY-FILTER`
- Epistemic class: `SOURCE_FACT`
- Authority: `AUTHORITATIVE_EVIDENCE`
- Source: `corpus/research/toolformer-neurips2023.txt`
- Source hash: `092036dc592088a056cad8f5d36d603dbf9969035d65a07cef91dcfc44dd39db`
- Claim: Toolformer self-supervises API call generation and execution, retaining only those tool calls that reduce language modeling perplexity on predicting subsequent tokens.

## CLM-007-TOOLFORMER-BENCHMARKS

- Canonical ID: `kp:claim:CLM-007-TOOLFORMER-BENCHMARKS`
- Epistemic class: `SOURCE_FACT`
- Authority: `AUTHORITATIVE_EVIDENCE`
- Source: `corpus/research/toolformer-neurips2023.txt`
- Source hash: `092036dc592088a056cad8f5d36d603dbf9969035d65a07cef91dcfc44dd39db`
- Claim: Toolformer achieves improved zero-shot performance on math (ASDiv, SVAMP), QA (LAMA), and temporal reasoning (TempLAMA) benchmarks via API execution.

## CLM-008-TOOLFORMER-DETERMINISTIC-FRAMING

- Canonical ID: `kp:claim:CLM-008-TOOLFORMER-DETERMINISTIC-FRAMING`
- Epistemic class: `DERIVED_SYNTHESIS`
- Authority: `DERIVED_KAD_KNOWLEDGE`
- Source: `corpus/research/toolformer-neurips2023.txt`
- Source hash: `092036dc592088a056cad8f5d36d603dbf9969035d65a07cef91dcfc44dd39db`
- Claim: Deterministic API execution overcomes probabilistic weaknesses in arithmetic, temporal reasoning, and factual retrieval.

## CLM-009-REFLEXION-EPISODIC-FEEDBACK

- Canonical ID: `kp:claim:CLM-009-REFLEXION-EPISODIC-FEEDBACK`
- Epistemic class: `SOURCE_FACT`
- Authority: `AUTHORITATIVE_EVIDENCE`
- Source: `corpus/research/reflexion-neurips2023.txt`
- Source hash: `9dd6a6550dd6d5a72205217eb7cf08849c7c8da56b2dd53ba5f56176577643ca`
- Claim: Reflexion endows language agents with verbal reinforcement learning by storing natural language self-reflections derived from external environment signals (e.g. test failures, scalar rewards) in an episodic memory buffer.

## CLM-010-REFLEXION-HUMANEVAL-SCORE

- Canonical ID: `kp:claim:CLM-010-REFLEXION-HUMANEVAL-SCORE`
- Epistemic class: `SOURCE_FACT`
- Authority: `AUTHORITATIVE_EVIDENCE`
- Source: `corpus/research/reflexion-neurips2023.txt`
- Source hash: `9dd6a6550dd6d5a72205217eb7cf08849c7c8da56b2dd53ba5f56176577643ca`
- Claim: Reflexion improves GPT-4 pass@1 accuracy on the HumanEval Python coding benchmark from 67.0% to 91.0% through iterative self-reflection on unit test feedback.

## CLM-011-SELFREFINE-INTERNAL-CRITIQUE

- Canonical ID: `kp:claim:CLM-011-SELFREFINE-INTERNAL-CRITIQUE`
- Epistemic class: `SOURCE_FACT`
- Authority: `AUTHORITATIVE_EVIDENCE`
- Source: `corpus/research/self-refine-neurips2023.txt`
- Source hash: `da4c142b68a7da1ed45ccd5064a2bf547b8ae8624c609c9177a2f3c3ba08eae6`
- Claim: Self-Refine iteratively improves text generation using self-generated multi-aspect critique without requiring external environment execution feedback, task-specific training, or human annotations.

## CLM-012-SELFREFINE-PERFORMANCE

- Canonical ID: `kp:claim:CLM-012-SELFREFINE-PERFORMANCE`
- Epistemic class: `SOURCE_FACT`
- Authority: `AUTHORITATIVE_EVIDENCE`
- Source: `corpus/research/self-refine-neurips2023.txt`
- Source hash: `da4c142b68a7da1ed45ccd5064a2bf547b8ae8624c609c9177a2f3c3ba08eae6`
- Claim: Self-Refine achieves an average absolute performance gain of ~20% across 7 generation tasks including code optimization, acronym generation, and constrained dialogue.

