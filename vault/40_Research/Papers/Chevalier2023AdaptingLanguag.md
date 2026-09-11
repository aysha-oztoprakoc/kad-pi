---
kad_id: kad-f786d2bec33cb3d69c1fe376
type: paper
title: "Adapting Language Models to Compress Contexts"
paper: "[[Chevalier2023AdaptingLanguag]]"
source: "https://doi.org/10.48550/arxiv.2305.14788"
doi: "10.48550/arxiv.2305.14788"
year: 2023
citations: 388
journal: "ArXiv"
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

# Adapting Language Models to Compress Contexts

## Identificação Epistêmica
- **Citekey**: `Chevalier2023AdaptingLanguag`
- **Autores**: A. Chevalier, Alexander Wettig, Anirudh Ajith, Danqi Chen
- **Ano**: 2023 | **Citações**: 388 | **Veículo**: ArXiv
- **DOI**: [10.48550/arxiv.2305.14788](https://doi.org/10.48550/arxiv.2305.14788)
- **Questão Vinculada**: [[Q11]] — Impact of context compression, summarization, or memory pruning on LLM reasoning accuracy
- **Pilares Suportados**: P7, P8
- **Ruído Mitigado**: R7

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: AutoCompressors adapt pre-trained language models to compress long contexts into compact summary vectors, increasing accuracy and reducing inference cost while extending the context window.

### Abstract
Transformer-based language models (LMs) are powerful and widely-applicable tools, but their usefulness is constrained by a finite context window and the expensive computational cost of processing long text documents. We propose to adapt pre-trained LMs into AutoCompressors. These models are capable of compressing long contexts into compact summary vectors, which are then accessible to the model as soft prompts. Summary vectors are trained with an unsupervised objective, whereby long documents are processed in segments and summary vectors from all previous segments are used in language modeling. We fine-tune OPT models on sequences of up to 30,720 tokens and show that AutoCompressors can utilize long contexts to improve perplexity. We evaluate AutoCompressors on in-context learning by compressing task demonstrations. We find that summary vectors are good substitutes for plain-text demonstrations, increasing accuracy while reducing inference cost. Finally, we explore the benefits of pre-computing summary vectors for large corpora by applying summary vectors to retrieval-augmented language modeling. Overall, AutoCompressors emerge as a simple and inexpensive solution for extending the context window of LMs while speeding up inference over long contexts.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Chevalier2023AdaptingLanguag`) no Elicit Notebook correspondente à **Q11** e exporte o CSV para ingestão.

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

