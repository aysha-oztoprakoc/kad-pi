---
kad_id: kad-5fdadcf7da8c62c1e30c0ebf
type: paper
title: "Between MDPs and Semi-MDPs: A Framework for Temporal Abstraction in Reinforcement Learning"
paper: "[[Sutton1999BetweenMdpsAndS]]"
source: "https://doi.org/10.1016/s0004-3702(99)00052-1"
doi: "10.1016/s0004-3702(99)00052-1"
year: 1999
citations: 4384
journal: "Artif. Intell."
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

# Between MDPs and Semi-MDPs: A Framework for Temporal Abstraction in Reinforcement Learning

## Identificação Epistêmica
- **Citekey**: `Sutton1999BetweenMdpsAndS`
- **Autores**: R. Sutton, Doina Precup, Satinder Singh
- **Ano**: 1999 | **Citações**: 4384 | **Veículo**: Artif. Intell.
- **DOI**: [10.1016/s0004-3702(99)00052-1](https://doi.org/10.1016/s0004-3702(99)00052-1)
- **Questão Vinculada**: [[Q15]] — Temporal abstraction frameworks (options, macro-actions, hierarchical RL) for reusable skills acquisition and transfer
- **Pilares Suportados**: P5
- **Ruído Mitigado**: R5

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Options in reinforcement learning framework enable temporally abstract knowledge and actions to be included in planning and learning methods, improving performance without committing to specific approaches.

### Abstract
Resumo não disponível.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Sutton1999BetweenMdpsAndS`) no Elicit Notebook correspondente à **Q15** e exporte o CSV para ingestão.

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

