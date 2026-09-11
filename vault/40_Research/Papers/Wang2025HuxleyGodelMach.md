---
kad_id: kad-bc4943fef9df08c7a8b3a86a
type: paper
title: "Huxley-Gödel Machine: Human-Level Coding Agent Development by an Approximation of the Optimal Self-Improving Machine"
paper: "[[Wang2025HuxleyGodelMach]]"
source: "https://doi.org/10.48550/arxiv.2510.21614"
doi: "10.48550/arxiv.2510.21614"
year: 2025
citations: 33
journal: "ArXiv"
study_type: "theoretical, modeling, or simulation study"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P5
  - P8
questions:
  - Q09
noises:
  - R5
tags:
  - research
  - paper
  - pilar/P5
  - pilar/P8
  - noise/R5
---

# Huxley-Gödel Machine: Human-Level Coding Agent Development by an Approximation of the Optimal Self-Improving Machine

## Identificação Epistêmica
- **Citekey**: `Wang2025HuxleyGodelMach`
- **Autores**: Wenyi Wang, Nanbo Li, Firas Laakom, Yimeng Chen, M. Ostaszewski, Mingchen Zhuge
- **Ano**: 2025 | **Citações**: 33 | **Veículo**: ArXiv
- **DOI**: [10.48550/arxiv.2510.21614](https://doi.org/10.48550/arxiv.2510.21614)
- **Questão Vinculada**: [[Q09]] — Conditions for safe or provably correct self-modifying systems (proof-based self-modification, Gödel machines)
- **Pilares Suportados**: P5, P8
- **Ruído Mitigado**: R5

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: The Huxley-Gödel Machine (HGM) effectively develops human-level coding agents by using a metric to estimate their potential for self-improvement, outperforming prior methods and using fewer CPU hours.

### Abstract
Recent studies operationalize self-improvement through coding agents that edit their own codebases. They grow a tree of self-modifications through expansion strategies that favor higher software engineering benchmark performance, assuming that this implies more promising subsequent self-modifications. However, we identify a mismatch between the agent's self-improvement potential (metaproductivity) and its coding benchmark performance, namely the Metaproductivity-Performance Mismatch. Inspired by Huxley's concept of clade, we propose a metric ($\mathrm{CMP}$) that aggregates the benchmark performances of the descendants of an agent as an indicator of its potential for self-improvement. We show that, in our self-improving coding agent development setting, access to the true $\mathrm{CMP}$ is sufficient to simulate how the G\"odel Machine would behave under certain assumptions. We introduce the Huxley-G\"odel Machine (HGM), which, by estimating $\mathrm{CMP}$ and using it as guidance, searches the tree of self-modifications. On SWE-bench Verified and Polyglot, HGM outperforms prior self-improving coding agent development methods while using fewer allocated CPU hours. Last but not least, HGM demonstrates strong transfer to other coding datasets and large language models. The agent optimized by HGM on SWE-bench Verified with GPT-5-mini and evaluated on SWE-bench Lite with GPT-5 achieves human-level performance, matching the best officially checked results of human-engineered coding agents. Our code is publicly available at https://github.com/metauto-ai/HGM.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Wang2025HuxleyGodelMach`) no Elicit Notebook correspondente à **Q09** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Justificar teoricamente "auto-learning desabilitado; KAD gates own promotion" e critério formal de promoção de skills.
- **Lacuna no PRIME_DIRECTIVE**: R5/P5+P8: Auto-modificação com portão determinístico + humano vs prova de utilidade; limites de Goodhart
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

