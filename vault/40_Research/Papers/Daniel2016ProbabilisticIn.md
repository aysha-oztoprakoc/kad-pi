---
type: paper
title: "Probabilistic inference for determining options in reinforcement learning"
paper: "[[Daniel2016ProbabilisticIn]]"
source: "https://doi.org/10.1007/s10994-016-5580-x"
doi: "10.1007/s10994-016-5580-x"
year: 2016
citations: 119
journal: "Machine Learning"
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

# Probabilistic inference for determining options in reinforcement learning

## Identificação Epistêmica
- **Citekey**: `Daniel2016ProbabilisticIn`
- **Autores**: Christian Daniel, H. V. Hoof, Jan Peters, G. Neumann
- **Ano**: 2016 | **Citações**: 119 | **Veículo**: Machine Learning
- **DOI**: [10.1007/s10994-016-5580-x](https://doi.org/10.1007/s10994-016-5580-x)
- **Questão Vinculada**: [[Q15]] — Temporal abstraction frameworks (options, macro-actions, hierarchical RL) for reusable skills acquisition and transfer
- **Pilares Suportados**: P5
- **Ruído Mitigado**: R5

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: The proposed model, using semi Markov decision process setting and option framework, effectively combines simple sub-policies to solve complex tasks and improves learning performance on simpler tasks.

### Abstract
Tasks that require many sequential decisions or complex solutions are hard to solve using conventional reinforcement learning algorithms. Based on the semi Markov decision process setting (SMDP) and the option framework, we propose a model which aims to alleviate these concerns. Instead of learning a single monolithic policy, the agent learns a set of simpler sub-policies as well as the initiation and termination probabilities for each of those sub-policies. While existing option learning algorithms frequently require manual specification of components such as the sub-policies, we present an algorithm which infers all relevant components of the option framework from data. Furthermore, the proposed approach is based on parametric option representations and works well in combination with current policy search methods, which are particularly well suited for continuous real-world tasks. We present results on SMDPs with discrete as well as continuous state-action spaces. The results show that the presented algorithm can combine simple sub-policies to solve complex tasks and can improve learning performance on simpler tasks.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Daniel2016ProbabilisticIn`) no Elicit Notebook correspondente à **Q15** e exporte o CSV para ingestão.

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

