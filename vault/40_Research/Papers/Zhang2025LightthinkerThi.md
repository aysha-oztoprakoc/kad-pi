---
type: paper
title: "LightThinker: Thinking Step-by-Step Compression"
paper: "[[Zhang2025LightthinkerThi]]"
source: "https://doi.org/10.48550/arxiv.2502.15589"
doi: "10.48550/arxiv.2502.15589"
year: 2025
citations: 116
journal: ""
study_type: "theoretical, modeling, or simulation study"
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

# LightThinker: Thinking Step-by-Step Compression

## Identificação Epistêmica
- **Citekey**: `Zhang2025LightthinkerThi`
- **Autores**: Jintian Zhang, Yuqi Zhu, Mengshu Sun, Yujie Luo, Shuofei Qiao, Lun Du, Da Zheng, Huajun Chen, Ningyu Zhang
- **Ano**: 2025 | **Citações**: 116 | **Veículo**: 
- **DOI**: [10.48550/arxiv.2502.15589](https://doi.org/10.48550/arxiv.2502.15589)
- **Questão Vinculada**: [[Q11]] — Impact of context compression, summarization, or memory pruning on LLM reasoning accuracy
- **Pilares Suportados**: P7, P8
- **Ruído Mitigado**: R7

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: LightThinker improves the efficiency of large language models in complex reasoning tasks by dynamically compressing intermediate thoughts, maintaining competitive accuracy.

### Abstract
Large language models (LLMs) have shown remarkable performance in complex reasoning tasks, but their efficiency is hindered by the substantial memory and computational costs associated with generating lengthy tokens. In this paper, we propose LightThinker, a novel method that enables LLMs to dynamically compress intermediate thoughts during reasoning. Inspired by human cognitive processes, LightThinker compresses verbose thought steps into compact representations and discards the original reasoning chains, thereby significantly reducing the number of tokens stored in the context window. This is achieved by training the model on when and how to perform compression through data construction, mapping hidden states to condensed gist tokens, and creating specialized attention masks. Additionally, we introduce the Dependency (Dep) metric to quantify the degree of compression by measuring the reliance on historical tokens during generation. Extensive experiments on four datasets and two models show that LightThinker reduces peak memory usage and inference time, while maintaining competitive accuracy. Our work provides a new direction for improving the efficiency of LLMs in complex reasoning tasks without sacrificing performance. Code is released at https://github.com/zjunlp/LightThinker.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Zhang2025LightthinkerThi`) no Elicit Notebook correspondente à **Q11** e exporte o CSV para ingestão.

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

