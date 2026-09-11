---
kad_id: kad-77d0109d995479caeb5bcdb3
type: paper
title: "Compositional synthesis via a convex parameterization of assume-guarantee contracts"
paper: "[[Ghasemi2020CompositionalSy]]"
source: "https://doi.org/10.1145/3365365.3382212"
doi: "10.1145/3365365.3382212"
year: 2020
citations: 33
journal: "Proceedings of the 23rd International Conference on Hybrid Systems: Computation and Control"
study_type: "theoretical, modeling, or simulation study"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P2
  - P1
  - P3
questions:
  - Q03
noises:
  - R2
  - R3
tags:
  - research
  - paper
  - pilar/P2
  - pilar/P1
  - pilar/P3
  - noise/R2
  - noise/R3
---

# Compositional synthesis via a convex parameterization of assume-guarantee contracts

## Identificação Epistêmica
- **Citekey**: `Ghasemi2020CompositionalSy`
- **Autores**: K. Ghasemi, Sadra Sadraddini, C. Belta
- **Ano**: 2020 | **Citações**: 33 | **Veículo**: Proceedings of the 23rd International Conference on Hybrid Systems: Computation and Control
- **DOI**: [10.1145/3365365.3382212](https://doi.org/10.1145/3365365.3382212)
- **Questão Vinculada**: [[Q03]] — Assume–guarantee (compositional) reasoning to verify component contracts in reactive systems
- **Pilares Suportados**: P2, P1, P3
- **Ruído Mitigado**: R2, R3

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Our assume-guarantee framework simplifies large-scale linear systems control by breaking verification and synthesis into small convex programs for individual subsystems, achieving correctness in a compositional way.

### Abstract
We develop an assume-guarantee framework for control of large scale linear (time-varying) systems from finite-time reach and avoid or infinite-time invariance specifications. The contracts describe the admissible set of states and controls for individual subsystems. A set of contracts compose correctly if mutual assumptions and guarantees match in a way that we formalize. We propose a rich parameterization of contracts such that the set of parameters that compose correctly is convex. Moreover, we design a potential function of parameters that describes the distance of contracts from a correct composition. Thus, the verification and synthesis for the aggregate system are broken to solving small convex programs for individual subsystems, where correctness is ultimately achieved in a compositional way. Illustrative examples demonstrate the scalability of our method.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Ghasemi2020CompositionalSy`) no Elicit Notebook correspondente à **Q03** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Semântica de contrato para leases STC e para MUST NOT conflate (regra de tipagem das duas relações).
- **Lacuna no PRIME_DIRECTIVE**: R2–R3/P2: Ordenação de dependências e efeitos com inverso; separação de fluxo de dados vs fluxo de autorização
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

