---
type: paper
title: "Delegation Logic: A Logic-based Approach to Distrbuted Authorization"
paper: "[[Li2000DelegationLogic]]"
source: "https://consensus.app/papers/delegation-logic-a-logicbased-approach-to-distrbuted-li-grosof/24321f9da7a358e29392cc81a9e380b7/"
doi: ""
year: 2000
citations: 462
journal: ""
study_type: "theoretical, modeling, or simulation study"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P6
  - P8
questions:
  - Q13
noises:
  - R9
tags:
  - research
  - paper
  - pilar/P6
  - pilar/P8
  - noise/R9
---

# Delegation Logic: A Logic-based Approach to Distrbuted Authorization

## Identificação Epistêmica
- **Citekey**: `Li2000DelegationLogic`
- **Autores**: Ninghui Li, Benjamin N. Grosof, J. Feigenbaum
- **Ano**: 2000 | **Citações**: 462 | **Veículo**: 
- **DOI**: [N/A](https://doi.org/)
- **Questão Vinculada**: [[Q13]] — Formal logics modeling delegation and authority attenuation in distributed and multi-agent systems
- **Pilares Suportados**: P6, P8
- **Ruído Mitigado**: R9

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Delegation Logic (DL) is a logic-based language that represents policies, credentials, and requests in distributed authorization, providing a logical framework for studying delegation and proof-of-compliance.

### Abstract
We address the problem of authorization in large-scale, open, distributed systems. Authorization decisions are needed in electronic commerce, mobile-code execution, remote resource sharing, privacy protection, and many other applications. We adopt the trust-management approach, in which “authorization” is viewed as a “proof-of-compliance” problem: Does a set of credentials prove that a request complies with a policy? We develop a logic-based language, called Delegation Logic (DL), to represent policies, credentials, and requests in distributed authorization. In this paper, we describe D1LP, the monotonic version of DL. D1LP extends the logic-programming (LP) language Datalog with expressive delegation constructs that feature delegation depth and a wide variety of complex principals (including, but not limited to, k-out-of-n thresholds). Our approach to defining and implementing D1LP is based on tractably compiling D1LP programs into ordinary logic programs (OLP’s). This compilation approach enables D1LP to be implemented modularly on top of existing technologies for OLP, e.g., Prolog. As a trust-management language, D1LP provides a concept of proof-of-compliance that is founded on well-understood principles of logic programming and knowledge representation. D1LP also provides a logical framework for studying delegation.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Li2000DelegationLogic`) no Elicit Notebook correspondente à **Q13** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Semântica para leases STC em subárvores RLM — verificação estática de escopo herdado.
- **Lacuna no PRIME_DIRECTIVE**: R9/P6+P8: Atenuação de autoridade na descida da recursão de subagentes (leases STC "advisory")
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

