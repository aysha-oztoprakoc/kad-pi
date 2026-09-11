---
kad_id: kad-566420266670f9c3d0727df3
type: paper
title: "Gödel Agent: A Self-Referential Agent Framework for Recursively Self-Improvement"
paper: "[[Yin2025GodelAgentASelf]]"
source: "https://doi.org/10.18653/v1/2025.acl-long.1354"
doi: "10.18653/v1/2025.acl-long.1354"
year: 2025
citations: 27
journal: ""
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

# Gödel Agent: A Self-Referential Agent Framework for Recursively Self-Improvement

## Identificação Epistêmica
- **Citekey**: `Yin2025GodelAgentASelf`
- **Autores**: Xunjian Yin, Xinyi Wang, Liangming Pan, Li Lin, Xiaojun Wan, W. Wang
- **Ano**: 2025 | **Citações**: 27 | **Veículo**: 
- **DOI**: [10.18653/v1/2025.acl-long.1354](https://doi.org/10.18653/v1/2025.acl-long.1354)
- **Questão Vinculada**: [[Q09]] — Conditions for safe or provably correct self-modifying systems (proof-based self-modification, Gödel machines)
- **Pilares Suportados**: P5, P8
- **Ruído Mitigado**: R5

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Gödel Agent, a self-evolving framework, enables agents to continuously improve themselves using large language models, outperforming manual crafted agents in performance, efficiency, and generalizability.

### Abstract
The rapid advancement of large language models (LLMs) has significantly enhanced the capabilities of agents across various tasks.However, existing agentic systems, whether based on fixed pipeline algorithms or pre-defined meta-learning frameworks, cannot search the whole agent design space due to the restriction of human-designed components, and thus might miss the more optimal agent design.In this paper, we introduce Gödel Agent, a selfevolving framework inspired by the Gödel machine, enabling agents to recursively improve themselves without relying on predefined routines or fixed optimization algorithms.Gödel Agent leverages LLMs to dynamically modify its own logic and behavior, guided solely by high-level objectives through prompting.Experimental results on multiple domains demonstrate that implementation of Gödel Agent can achieve continuous self-improvement, surpassing manually crafted agents in performance, efficiency, and generalizability.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Yin2025GodelAgentASelf`) no Elicit Notebook correspondente à **Q09** e exporte o CSV para ingestão.

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

