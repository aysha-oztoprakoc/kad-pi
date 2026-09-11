---
kad_id: kad-c776eced9308a256ec25557d
type: paper
title: "A Survey on Model Compression for Large Language Models"
paper: "[[Zhu2023ASurveyOnModelC]]"
source: "https://doi.org/10.1162/tacl_a_00704"
doi: "10.1162/tacl_a_00704"
year: 2023
citations: 504
journal: "Transactions of the Association for Computational Linguistics"
study_type: "literature review"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P7
  - P8
questions:
  - Q11
noises:
  - R7
tags:
  - research
  - paper
  - pilar/P7
  - pilar/P8
  - noise/R7
---

# A Survey on Model Compression for Large Language Models

## Identificação Epistêmica
- **Citekey**: `Zhu2023ASurveyOnModelC`
- **Autores**: Xunyu Zhu, Jian Li, Yong Liu, Can Ma, Weiping Wang
- **Ano**: 2023 | **Citações**: 504 | **Veículo**: Transactions of the Association for Computational Linguistics
- **DOI**: [10.1162/tacl_a_00704](https://doi.org/10.1162/tacl_a_00704)
- **Questão Vinculada**: [[Q11]] — Impact of context compression, summarization, or memory pruning on LLM reasoning accuracy
- **Pilares Suportados**: P7, P8
- **Ruído Mitigado**: R7

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Model compression techniques like quantization, pruning, and knowledge distillation can enhance the efficiency and real-world applicability of Large Language Models in resource-limited settings.

### Abstract
Abstract Large Language Models (LLMs) have transformed natural language processing tasks successfully. Yet, their large size and high computational needs pose challenges for practical use, especially in resource-limited settings. Model compression has emerged as a key research area to address these challenges. This paper presents a survey of model compression techniques for LLMs. We cover methods like quantization, pruning, and knowledge distillation, highlighting recent advancements. We also discuss benchmarking strategies and evaluation metrics crucial for assessing compressed LLMs. This survey offers valuable insights for researchers and practitioners, aiming to enhance efficiency and real-world applicability of LLMs while laying a foundation for future advancements.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Zhu2023ASurveyOnModelC`) no Elicit Notebook correspondente à **Q11** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Política de compactação com fidelidade mínima explícita; reconciliar autolearn e memória estruturada.
- **Lacuna no PRIME_DIRECTIVE**: R7/P7: snapcompact@70% e compressão destrutiva do contexto; tensão L2 (lossy) vs L3 (lossless)
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

