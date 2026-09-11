---
kad_id: kad-70d2bc1cb5b3dcf2b460d66d
type: paper
title: "Compressing Context to Enhance Inference Efficiency of Large Language Models"
paper: "[[Li2023CompressingCont]]"
source: "https://doi.org/10.48550/arxiv.2310.06201"
doi: "10.48550/arxiv.2310.06201"
year: 2023
citations: 228
journal: ""
study_type: ""
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

# Compressing Context to Enhance Inference Efficiency of Large Language Models

## Identificação Epistêmica
- **Citekey**: `Li2023CompressingCont`
- **Autores**: Yucheng Li, Bo Dong, Chenghua Lin, Frank Guerin
- **Ano**: 2023 | **Citações**: 228 | **Veículo**: 
- **DOI**: [10.48550/arxiv.2310.06201](https://doi.org/10.48550/arxiv.2310.06201)
- **Questão Vinculada**: [[Q11]] — Impact of context compression, summarization, or memory pruning on LLM reasoning accuracy
- **Pilares Suportados**: P7, P8
- **Ruído Mitigado**: R7

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Selective Context significantly reduces memory cost and inference time in large language models while maintaining comparable performance compared to full context use.

### Abstract
Large language models (LLMs) achieved remarkable performance across various tasks. However, they face challenges in managing long documents and extended conversations, due to significantly increased computational requirements, both in memory and inference time, and potential context truncation when the input exceeds the LLM's fixed context length. This paper proposes a method called Selective Context that enhances the inference efficiency of LLMs by identifying and pruning redundancy in the input context to make the input more compact. We test our approach using common data sources requiring long context processing: arXiv papers, news articles, and long conversations, on tasks of summarisation, question answering, and response generation. Experimental results show that Selective Context significantly reduces memory cost and decreases generation latency while maintaining comparable performance compared to that achieved when full context is used. Specifically, we achieve a 50\% reduction in context cost, resulting in a 36\% reduction in inference memory usage and a 32\% reduction in inference time, while observing only a minor drop of .023 in BERTscore and .038 in faithfulness on four downstream applications, indicating that our method strikes a good balance between efficiency and performance.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Li2023CompressingCont`) no Elicit Notebook correspondente à **Q11** e exporte o CSV para ingestão.

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

