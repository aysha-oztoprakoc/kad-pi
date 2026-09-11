---
kad_id: kad-adc160afa98b763ab72bcf01
type: paper
title: "Sample, Scrutinize and Scale: Effective Inference-Time Search by Scaling Verification"
paper: "[[Zhao2025SampleScrutiniz]]"
source: "https://doi.org/10.48550/arxiv.2502.01839"
doi: "10.48550/arxiv.2502.01839"
year: 2025
citations: 49
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

# Sample, Scrutinize and Scale: Effective Inference-Time Search by Scaling Verification

## Identificação Epistêmica
- **Citekey**: `Zhao2025SampleScrutiniz`
- **Autores**: Eric Zhao, Pranjal Awasthi, Sreenivas Gollapudi
- **Ano**: 2025 | **Citações**: 49 | **Veículo**: ArXiv
- **DOI**: [10.48550/arxiv.2502.01839](https://doi.org/10.48550/arxiv.2502.01839)
- **Questão Vinculada**: [[Q12]] — Test-time (inference-time) computation scaling and optimal allocation between generation and verification
- **Pilares Suportados**: P9, P3
- **Ruído Mitigado**: R8

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Scaling up a minimalist sampling-based search using random sampling and direct self-verification improves inference-time search capabilities, with comparing across responses and different output styles for different contexts.

### Abstract
Sampling-based search, a simple paradigm for utilizing test-time compute, involves generating multiple candidate responses and selecting the best one -- typically by having models self-verify each response for correctness. In this paper, we study the scaling trends governing sampling-based search. Among our findings is that simply scaling up a minimalist implementation of sampling-based search, using only random sampling and direct self-verification, provides a practical inference method that, for example, elevates the reasoning capabilities of Gemini v1.5 Pro above that of o1-Preview on popular benchmarks. We partially attribute the scalability of sampling-based search to a phenomenon of implicit scaling, where sampling a larger pool of responses in turn improves self-verification accuracy. We further identify two useful principles for improving self-verification capabilities with test-time compute: (1) comparing across responses provides helpful signals about the locations of errors and hallucinations, and (2) different model output styles are useful for different contexts -- chains of thought are useful for reasoning but harder to verify. We also find that, though accurate verification can be elicited, frontier models demonstrate remarkably weak out-of-box verification capabilities and introduce a benchmark to measure progress on these deficiencies.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Zhao2025SampleScrutiniz`) no Elicit Notebook correspondente à **Q12** e exporte o CSV para ingestão.

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

