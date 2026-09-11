---
kad_id: kad-331171389ee0004a516046f5
type: paper
title: "In-context Autoencoder for Context Compression in a Large Language Model"
paper: "[[Ge2023InContextAutoen]]"
source: "https://doi.org/10.48550/arxiv.2307.06945"
doi: "10.48550/arxiv.2307.06945"
year: 2023
citations: 190
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

# In-context Autoencoder for Context Compression in a Large Language Model

## Identificação Epistêmica
- **Citekey**: `Ge2023InContextAutoen`
- **Autores**: Tao Ge, Jing Hu, Xun Wang, Si-Qing Chen, Furu Wei
- **Ano**: 2023 | **Citações**: 190 | **Veículo**: ArXiv
- **DOI**: [10.48550/arxiv.2307.06945](https://doi.org/10.48550/arxiv.2307.06945)
- **Questão Vinculada**: [[Q11]] — Impact of context compression, summarization, or memory pruning on LLM reasoning accuracy
- **Pilares Suportados**: P7, P8
- **Ruído Mitigado**: R7

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: The In-context Autoencoder (ICAE) effectively compresses long contexts into short memory slots, improving latency and GPU memory cost during inference, and offering insights into working memory and representation learning in large language models.

### Abstract
We propose the In-context Autoencoder (ICAE), leveraging the power of a large language model (LLM) to compress a long context into short compact memory slots that can be directly conditioned on by the LLM for various purposes. ICAE is first pretrained using both autoencoding and language modeling objectives on massive text data, enabling it to generate memory slots that accurately and comprehensively represent the original context. Then, it is fine-tuned on instruction data for producing desirable responses to various prompts. Experiments demonstrate that our lightweight ICAE, introducing about 1% additional parameters, effectively achieves $4\times$ context compression based on Llama, offering advantages in both improved latency and GPU memory cost during inference, and showing an interesting insight in memorization as well as potential for scalability. These promising results imply a novel perspective on the connection between working memory in cognitive science and representation learning in LLMs, revealing ICAE's significant implications in addressing the long context problem and suggesting further research in LLM context management. Our data, code and models are available at https://github.com/getao/icae.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Ge2023InContextAutoen`) no Elicit Notebook correspondente à **Q11** e exporte o CSV para ingestão.

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

