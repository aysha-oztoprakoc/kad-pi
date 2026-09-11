---
kad_id: kad-d0fde8df18521cd538a8feba
type: paper
title: "A Controlled Experiment with Novice Developers on the Impact of Task Description Granularity on Software Quality in Test-Driven Development"
paper: "[[Karac2021AControlledExpe]]"
source: "https://doi.org/10.1109/tse.2019.2920377"
doi: "10.1109/tse.2019.2920377"
year: 2021
citations: 24
journal: "IEEE Transactions on Software Engineering"
study_type: "non-randomized experimental study"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P3
questions:
  - Q05
noises:
  - R3
tags:
  - research
  - paper
  - pilar/P3
  - noise/R3
---

# A Controlled Experiment with Novice Developers on the Impact of Task Description Granularity on Software Quality in Test-Driven Development

## Identificação Epistêmica
- **Citekey**: `Karac2021AControlledExpe`
- **Autores**: Evrim I. Karac, Burak Turhan, N. Juristo
- **Ano**: 2021 | **Citações**: 24 | **Veículo**: IEEE Transactions on Software Engineering
- **DOI**: [10.1109/tse.2019.2920377](https://doi.org/10.1109/tse.2019.2920377)
- **Questão Vinculada**: [[Q05]] — Empirical evidence for test-driven development impact on defect density, code quality, and productivity
- **Pilares Suportados**: P3
- **Ruído Mitigado**: R3

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Using more granular task descriptions in Test-Driven Development significantly improves software quality for novice developers, with task complexity being a significant predictor of quality.

### Abstract
Background: Test-Driven Development (TDD) is an iterative software development process characterized by test-code-refactor cycle. TDD recommends that developers work on small and manageable tasks at each iteration. However, the ability to break tasks into small work items effectively is a learned skill that improves with experience. In experimental studies of TDD, the granularity of task descriptions is an overlooked factor. In particular, providing a more granular task description in terms of a set of sub-tasks versus providing a coarser-grained, generic description. Objective: We aim to investigate the impact of task description granularity on the outcome of TDD, as implemented by novice developers, with respect to software quality, as measured by functional correctness and functional completeness. Method: We conducted a one-factor crossover experiment with 48 graduate students in an academic environment. Each participant applied TDD and implemented two tasks, where one of the tasks was presented using a more granular task description. Resulting artifacts were evaluated with acceptance tests to assess functional correctness and functional completeness. Linear mixed-effects models (LMM) were used for analysis. Results: Software quality improved significantly when participants applied TDD using more granular task descriptions. The effect of task description granularity is statistically significant and had a medium to large effect size. Moreover, the task was found to be a significant predictor of software quality which is an interesting result (because two tasks used in the experiment were considered to be of similar complexity). Conclusion: For novice TDD practitioners, the outcome of TDD is highly coupled with the ability to break down the task into smaller parts. For researchers, task selection and task description granularity requires more attention in the design of TDD experiments. Task description granularity should be taken into account in secondary studies. Further comparative studies are needed to investigate whether task descriptions affect other development processes similarly.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Karac2021AControlledExpe`) no Elicit Notebook correspondente à **Q05** e exporte o CSV para ingestão.

### Modelo Formal & Framework
*Aguardando extração Elicit...*

### Teoremas, Invariantes & Garantias Formais
*Aguardando extração Elicit...*

### Métricas & Resultados Empíricos
*Aguardando extração Elicit...*

### Assunções & Modos de Falha / Limitações
*Aguardando extração Elicit...*


---

## Impacto na Arquitetura KAD-PI
- **Decisão Vinculada**: Calibrar o gate de TDD; buscar contra-evidência deliberadamente conforme rigor científico da constituição.
- **Lacuna no PRIME_DIRECTIVE**: R3/P3: O loop RED→GREEN→REFACTOR como [DESIGN_DECISION]; evidência empírica calibrada
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

