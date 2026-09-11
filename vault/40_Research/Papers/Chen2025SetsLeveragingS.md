---
type: paper
title: "SETS: Leveraging Self-Verification and Self-Correction for Improved Test-Time Scaling"
paper: "[[Chen2025SetsLeveragingS]]"
source: "https://doi.org/10.48550/arxiv.2501.19306"
doi: "10.48550/arxiv.2501.19306"
year: 2025
citations: 63
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

# SETS: Leveraging Self-Verification and Self-Correction for Improved Test-Time Scaling

## Identificação Epistêmica
- **Citekey**: `Chen2025SetsLeveragingS`
- **Autores**: Jiefeng Chen, Jie Ren, Xinyun Chen, Chengrun Yang, Ruoxi Sun, Sercan Ö. Arik
- **Ano**: 2025 | **Citações**: 63 | **Veículo**: ArXiv
- **DOI**: [10.48550/arxiv.2501.19306](https://doi.org/10.48550/arxiv.2501.19306)
- **Questão Vinculada**: [[Q12]] — Test-time (inference-time) computation scaling and optimal allocation between generation and verification
- **Pilares Suportados**: P9, P3
- **Ruído Mitigado**: R8

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Self-Enhanced Test-Time Scaling (SETS) effectively improves performance on complex tasks by combining parallel and sequential techniques and leveraging Large Language Models' self-improvement abilities.

### Abstract
Recent advancements in Large Language Models (LLMs) have created new opportunities to enhance performance on complex reasoning tasks by leveraging test-time computation. However, existing scaling methods have key limitations: parallel methods like repeated sampling are often inefficient and quickly saturate, while sequential methods like SELF-REFINE struggle to improve after a few rounds. Although combining these approaches shows promise, current methods require fine-tuned reward and revision models. This paper proposes Self-Enhanced Test-Time Scaling (SETS), a simple yet effective approach that overcomes these limitations by strategically combining parallel and sequential techniques and fully leveraging LLMs'self-improvement abilities. SETS exploits the inherent self-verification and self-correction capabilities of LLMs, unifying sampling, verification, and correction within a single framework. This facilitates efficient and scalable test-time computation for enhanced performance on complex tasks without any model training. Our comprehensive experimental results on challenging benchmarks spanning planning, reasoning, math, and coding demonstrate that SETS achieves significant performance improvements and more advantageous test-time scaling behavior than the alternatives.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Chen2025SetsLeveragingS`) no Elicit Notebook correspondente à **Q12** e exporte o CSV para ingestão.

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

