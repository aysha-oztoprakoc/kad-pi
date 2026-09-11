---
kad_id: kad-925e5807674dc1a35a0c5f3d
type: paper
title: "Multi-Agent Verification: Scaling Test-Time Compute with Multiple Verifiers"
paper: "[[Lifshitz2025MultiAgentVerif]]"
source: "https://doi.org/10.48550/arxiv.2502.20379"
doi: "10.48550/arxiv.2502.20379"
year: 2025
citations: 54
journal: "ArXiv"
study_type: "theoretical, modeling, or simulation study"
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

# Multi-Agent Verification: Scaling Test-Time Compute with Multiple Verifiers

## Identificação Epistêmica
- **Citekey**: `Lifshitz2025MultiAgentVerif`
- **Autores**: Shalev Lifshitz, Sheila A. McIlraith, Yilun Du
- **Ano**: 2025 | **Citações**: 54 | **Veículo**: ArXiv
- **DOI**: [10.48550/arxiv.2502.20379](https://doi.org/10.48550/arxiv.2502.20379)
- **Questão Vinculada**: [[Q12]] — Test-time (inference-time) computation scaling and optimal allocation between generation and verification
- **Pilares Suportados**: P9, P3
- **Ruído Mitigado**: R8

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Scaling the number of verifiers in Multi-Agent Verification (MAV) improves language model performance at test-time without additional training.

### Abstract
By utilizing more computational resources at test-time, large language models (LLMs) can improve without additional training. One common strategy uses verifiers to evaluate candidate outputs. In this work, we propose a novel scaling dimension for test-time compute: scaling the number of verifiers. We introduce Multi-Agent Verification (MAV) as a test-time compute paradigm that combines multiple verifiers to improve performance. We propose using Aspect Verifiers (AVs), off-the-shelf LLMs prompted to verify different aspects of outputs, as one possible choice for the verifiers in a MAV system. AVs are a convenient building block for MAV since they can be easily combined without additional training. Moreover, we introduce BoN-MAV, a simple multi-agent verification algorithm that combines best-of-n sampling with multiple verifiers. BoN-MAV demonstrates stronger scaling patterns than self-consistency and reward model verification, and we demonstrate both weak-to-strong generalization, where combining weak verifiers improves even stronger LLMs, and self-improvement, where the same base model is used to both generate and verify outputs. Our results establish scaling the number of verifiers as a promising new dimension for improving language model performance at test-time.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Lifshitz2025MultiAgentVerif`) no Elicit Notebook correspondente à **Q12** e exporte o CSV para ingestão.

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

