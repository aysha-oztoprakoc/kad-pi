---
type: paper
title: "Temporal Abstraction in Reinforcement Learning with the Successor Representation"
paper: "[[Machado2021TemporalAbstrac]]"
source: "https://doi.org/10.48550/arxiv.2110.05740"
doi: "10.48550/arxiv.2110.05740"
year: 2021
citations: 81
journal: "J. Mach. Learn. Res."
study_type: "other"
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

# Temporal Abstraction in Reinforcement Learning with the Successor Representation

## Identificação Epistêmica
- **Citekey**: `Machado2021TemporalAbstrac`
- **Autores**: Marlos C. Machado, André Barreto, Doina Precup
- **Ano**: 2021 | **Citações**: 81 | **Veículo**: J. Mach. Learn. Res.
- **DOI**: [10.48550/arxiv.2110.05740](https://doi.org/10.48550/arxiv.2110.05740)
- **Questão Vinculada**: [[Q15]] — Temporal abstraction frameworks (options, macro-actions, hierarchical RL) for reusable skills acquisition and transfer
- **Pilares Suportados**: P5
- **Ruído Mitigado**: R5

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: The successor representation (SR) in reinforcement learning can help discover and use temporal abstractions, enabling a virtuous cycle of refinement between representation and options.

### Abstract
Reasoning at multiple levels of temporal abstraction is one of the key attributes of intelligence. In reinforcement learning, this is often modeled through temporally extended courses of actions called options. Options allow agents to make predictions and to operate at different levels of abstraction within an environment. Nevertheless, approaches based on the options framework often start with the assumption that a reasonable set of options is known beforehand. When this is not the case, there are no definitive answers for which options one should consider. In this paper, we argue that the successor representation (SR), which encodes states based on the pattern of state visitation that follows them, can be seen as a natural substrate for the discovery and use of temporal abstractions. To support our claim, we take a big picture view of recent results, showing how the SR can be used to discover options that facilitate either temporally-extended exploration or planning. We cast these results as instantiations of a general framework for option discovery in which the agent's representation is used to identify useful options, which are then used to further improve its representation. This results in a virtuous, never-ending, cycle in which both the representation and the options are constantly refined based on each other. Beyond option discovery itself, we also discuss how the SR allows us to augment a set of options into a combinatorially large counterpart without additional learning. This is achieved through the combination of previously learned options. Our empirical evaluation focuses on options discovered for exploration and on the use of the SR to combine them. The results of our experiments shed light on important design decisions involved in the definition of options and demonstrate the synergy of different methods based on the SR, such as eigenoptions and the option keyboard.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Machado2021TemporalAbstrac`) no Elicit Notebook correspondente à **Q15** e exporte o CSV para ingestão.

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

