---
kad_id: kad-aed72bcf97a7345349520e10
type: paper
title: "On the Composition of Discrete and Continuous-time Assume-Guarantee Contracts for Invariance"
paper: "[[Saoud2018OnTheCompositio]]"
source: "https://doi.org/10.23919/ecc.2018.8550622"
doi: "10.23919/ecc.2018.8550622"
year: 2018
citations: 37
journal: "2018 European Control Conference (ECC)"
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

# On the Composition of Discrete and Continuous-time Assume-Guarantee Contracts for Invariance

## Identificação Epistêmica
- **Citekey**: `Saoud2018OnTheCompositio`
- **Autores**: Adnane Saoud, A. Girard, L. Fribourg
- **Ano**: 2018 | **Citações**: 37 | **Veículo**: 2018 European Control Conference (ECC)
- **DOI**: [10.23919/ecc.2018.8550622](https://doi.org/10.23919/ecc.2018.8550622)
- **Questão Vinculada**: [[Q03]] — Assume–guarantee (compositional) reasoning to verify component contracts in reactive systems
- **Pilares Suportados**: P2, P1, P3
- **Ruído Mitigado**: R2, R3

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Assume-guarantee contracts and compositional reasoning can effectively verify invariance properties of large discrete-time and continuous-time systems, with weak satisfaction sufficient for cascade compositions and strong satisfaction needed for feedback compositions.

### Abstract
Many techniques for verifying invariance properties are limited to systems of moderate size. In this paper, we propose an approach based on assume-guarantee contracts and compositional reasoning for verifying invariance properties of a broad class of discrete-time and continuous-time systems consisting of interconnected components. The notion of assume- guarantee contracts makes it possible to divide responsibilities among the system components: a contract specifies an invariance property that a component must fulfill under some assumptions on the behavior of its environment (i.e. of the other components). We define weak and strong semantics of assumeguarantee contracts for both discrete-time and continuous-time systems. We then establish a certain number of results for compositional reasoning, which allow us to show that a global invariance property of the whole system is satisfied when all components satisfy their own contract. Interestingly, we show that the weak satisfaction of the contract is sufficient to deal with cascade compositions, while strong satisfaction is needed to reason about feedback composition. Specific results for systems described by differential inclusions are then developed. Throughout the paper, the main results are illustrated using simple examples.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Saoud2018OnTheCompositio`) no Elicit Notebook correspondente à **Q03** e exporte o CSV para ingestão.

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

