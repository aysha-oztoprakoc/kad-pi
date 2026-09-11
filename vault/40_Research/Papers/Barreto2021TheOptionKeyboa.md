---
type: paper
title: "The Option Keyboard: Combining Skills in Reinforcement Learning"
paper: "[[Barreto2021TheOptionKeyboa]]"
source: "https://doi.org/10.13140/rg.2.2.12370.50882"
doi: "10.13140/rg.2.2.12370.50882"
year: 2021
citations: 117
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

# The Option Keyboard: Combining Skills in Reinforcement Learning

## Identificação Epistêmica
- **Citekey**: `Barreto2021TheOptionKeyboa`
- **Autores**: André Barreto, Diana Borsa, Shaobo Hou, Gheorghe Comanici, Eser Aygün, P. Hamel, Daniel Toyama, Jonathan J. Hunt, Shibl Mourad, David Silver, Doina Precup
- **Ano**: 2021 | **Citações**: 117 | **Veículo**: ArXiv
- **DOI**: [10.13140/rg.2.2.12370.50882](https://doi.org/10.13140/rg.2.2.12370.50882)
- **Questão Vinculada**: [[Q15]] — Temporal abstraction frameworks (options, macro-actions, hierarchical RL) for reusable skills acquisition and transfer
- **Pilares Suportados**: P5
- **Ruído Mitigado**: R5

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Combining skills in reinforcement learning using pseudo-rewards (cumulants) allows for instantaneous synthesis of new options, improving performance in resource management and navigation tasks.

### Abstract
The ability to combine known skills to create new ones may be crucial in the solution of complex reinforcement learning problems that unfold over extended periods. We argue that a robust way of combining skills is to define and manipulate them in the space of pseudo-rewards (or "cumulants"). Based on this premise, we propose a framework for combining skills using the formalism of options. We show that every deterministic option can be unambiguously represented as a cumulant defined in an extended domain. Building on this insight and on previous results on transfer learning, we show how to approximate options whose cumulants are linear combinations of the cumulants of known options. This means that, once we have learned options associated with a set of cumulants, we can instantaneously synthesise options induced by any linear combination of them, without any learning involved. We describe how this framework provides a hierarchical interface to the environment whose abstract actions correspond to combinations of basic skills. We demonstrate the practical benefits of our approach in a resource management problem and a navigation task involving a quadrupedal simulated robot.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Barreto2021TheOptionKeyboa`) no Elicit Notebook correspondente à **Q15** e exporte o CSV para ingestão.

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

