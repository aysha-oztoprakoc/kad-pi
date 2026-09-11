---
type: paper
title: "The Option-Critic Architecture"
paper: "[[Bacon2016TheOptionCritic]]"
source: "https://doi.org/10.1609/aaai.v31i1.10916"
doi: "10.1609/aaai.v31i1.10916"
year: 2016
citations: 1345
journal: "ArXiv"
study_type: "theoretical, modeling, or simulation study"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P5
questions:
  - Q15
noises:
  - R5
tags:
  - research
  - paper
  - pilar/P5
  - noise/R5
---

# The Option-Critic Architecture

## Identificação Epistêmica
- **Citekey**: `Bacon2016TheOptionCritic`
- **Autores**: Pierre-Luc Bacon, J. Harb, Doina Precup
- **Ano**: 2016 | **Citações**: 1345 | **Veículo**: ArXiv
- **DOI**: [10.1609/aaai.v31i1.10916](https://doi.org/10.1609/aaai.v31i1.10916)
- **Questão Vinculada**: [[Q15]] — Temporal abstraction frameworks (options, macro-actions, hierarchical RL) for reusable skills acquisition and transfer
- **Pilares Suportados**: P5
- **Ruído Mitigado**: R5

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: The option-critic architecture effectively learns internal policies and termination conditions of options in reinforcement learning without additional rewards or subgoals, demonstrating its flexibility and efficiency in discrete and continuous environments.

### Abstract
Temporal abstraction is key to scaling up learning and planning in reinforcement learning. While planning with temporally extended actions is well understood, creating such abstractions autonomously from data has remained challenging.We tackle this problem in the framework of options [Sutton,Precup and Singh, 1999; Precup, 2000]. We derive policy gradient theorems for options and propose a new option-critic architecture capable of learning both the internal policies and the termination conditions of options, in tandem with the policy over options, and without the need to provide any additional rewards or subgoals. Experimental results in both discrete and continuous environments showcase the flexibility and efficiency of the framework.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Bacon2016TheOptionCritic`) no Elicit Notebook correspondente à **Q15** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Critério de aceite semântico para adoção de skills (substituir grep) e fundamentação de EXP-KAD-DISTILLATION-006.
- **Lacuna no PRIME_DIRECTIVE**: R5/P5: Skills como opções (SMDP); convergência de distilação de trajetórias
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

