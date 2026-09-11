---
kad_id: kad-f1efe1bb052df71efd2cb2e7
type: paper
title: "Categorizing Variants of Goodhart's Law"
paper: "[[Manheim2018CategorizingVar]]"
source: "https://doi.org/10.48550/arxiv.1803.04585"
doi: "10.48550/arxiv.1803.04585"
year: 2018
citations: 201
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

# Categorizing Variants of Goodhart's Law

## Identificação Epistêmica
- **Citekey**: `Manheim2018CategorizingVar`
- **Autores**: David Manheim, Scott Garrabrant
- **Ano**: 2018 | **Citações**: 201 | **Veículo**: ArXiv
- **DOI**: [10.48550/arxiv.1803.04585](https://doi.org/10.48550/arxiv.1803.04585)
- **Questão Vinculada**: [[Q09]] — Conditions for safe or provably correct self-modifying systems (proof-based self-modification, Gödel machines)
- **Pilares Suportados**: P5, P8
- **Ruído Mitigado**: R5

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: This paper explores four distinct mechanisms of Goodhart's Law, aiming to improve understanding of these failure modes in economic regulation, public policy, machine learning, and AI alignment.

### Abstract
There are several distinct failure modes for overoptimization of systems on the basis of metrics. This occurs when a metric which can be used to improve a system is used to an extent that further optimization is ineffective or harmful, and is sometimes termed Goodhart's Law. This class of failure is often poorly understood, partly because terminology for discussing them is ambiguous, and partly because discussion using this ambiguous terminology ignores distinctions between different failure modes of this general type. This paper expands on an earlier discussion by Garrabrant, which notes there are "(at least) four different mechanisms" that relate to Goodhart's Law. This paper is intended to explore these mechanisms further, and specify more clearly how they occur. This discussion should be helpful in better understanding these types of failures in economic regulation, in public policy, in machine learning, and in Artificial Intelligence alignment. The importance of Goodhart effects depends on the amount of power directed towards optimizing the proxy, and so the increased optimization power offered by artificial intelligence makes it especially critical for that field.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Manheim2018CategorizingVar`) no Elicit Notebook correspondente à **Q09** e exporte o CSV para ingestão.

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

