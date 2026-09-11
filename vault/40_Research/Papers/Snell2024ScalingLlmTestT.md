---
kad_id: kad-b268bbf9fb1b74e6ee0554bf
type: paper
title: "Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters"
paper: "[[Snell2024ScalingLlmTestT]]"
source: "https://doi.org/10.48550/arxiv.2408.03314"
doi: "10.48550/arxiv.2408.03314"
year: 2024
citations: 2113
journal: "ArXiv"
study_type: ""
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P9
  - P3
questions:
  - Q12
noises:
  - R8
tags:
  - research
  - paper
  - pilar/P9
  - pilar/P3
  - noise/R8
---

# Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters

## Identificação Epistêmica
- **Citekey**: `Snell2024ScalingLlmTestT`
- **Autores**: C. Snell, Jaehoon Lee, Kelvin Xu, Aviral Kumar
- **Ano**: 2024 | **Citações**: 2113 | **Veículo**: ArXiv
- **DOI**: [10.48550/arxiv.2408.03314](https://doi.org/10.48550/arxiv.2408.03314)
- **Questão Vinculada**: [[Q12]] — Test-time (inference-time) computation scaling and optimal allocation between generation and verification
- **Pilares Suportados**: P9, P3
- **Ruído Mitigado**: R8

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Adaptive scaling of test-time compute in LLMs can improve performance by more than 4x compared to a best-of-N baseline, potentially outperforming 14x larger models.

### Abstract
Enabling LLMs to improve their outputs by using more test-time computation is a critical step towards building generally self-improving agents that can operate on open-ended natural language. In this paper, we study the scaling of inference-time computation in LLMs, with a focus on answering the question: if an LLM is allowed to use a fixed but non-trivial amount of inference-time compute, how much can it improve its performance on a challenging prompt? Answering this question has implications not only on the achievable performance of LLMs, but also on the future of LLM pretraining and how one should tradeoff inference-time and pre-training compute. Despite its importance, little research attempted to understand the scaling behaviors of various test-time inference methods. Moreover, current work largely provides negative results for a number of these strategies. In this work, we analyze two primary mechanisms to scale test-time computation: (1) searching against dense, process-based verifier reward models; and (2) updating the model's distribution over a response adaptively, given the prompt at test time. We find that in both cases, the effectiveness of different approaches to scaling test-time compute critically varies depending on the difficulty of the prompt. This observation motivates applying a"compute-optimal"scaling strategy, which acts to most effectively allocate test-time compute adaptively per prompt. Using this compute-optimal strategy, we can improve the efficiency of test-time compute scaling by more than 4x compared to a best-of-N baseline. Additionally, in a FLOPs-matched evaluation, we find that on problems where a smaller base model attains somewhat non-trivial success rates, test-time compute can be used to outperform a 14x larger model.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Snell2024ScalingLlmTestT`) no Elicit Notebook correspondente à **Q12** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Justificativa teórica do cascade econômico e dos bindings papel→modelo ("cognition only where required").
- **Lacuna no PRIME_DIRECTIVE**: R8/P9+P3: Roteador DETERMINISTIC → MODEL → HUMAN sem ancoragem formal; verifiers e scaling de compute
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

