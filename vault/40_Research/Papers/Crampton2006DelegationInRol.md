---
type: paper
title: "Delegation in role-based access control"
paper: "[[Crampton2006DelegationInRol]]"
source: "https://doi.org/10.1007/s10207-007-0044-8"
doi: "10.1007/s10207-007-0044-8"
year: 2006
citations: 180
journal: "International Journal of Information Security"
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

# Delegation in role-based access control

## Identificação Epistêmica
- **Citekey**: `Crampton2006DelegationInRol`
- **Autores**: J. Crampton, H. Khambhammettu
- **Ano**: 2006 | **Citações**: 180 | **Veículo**: International Journal of Information Security
- **DOI**: [10.1007/s10207-007-0044-8](https://doi.org/10.1007/s10207-007-0044-8)
- **Questão Vinculada**: [[Q13]] — Formal logics modeling delegation and authority attenuation in distributed and multi-agent systems
- **Pilares Suportados**: P6, P8
- **Ruído Mitigado**: R9

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: This paper primarily studies transfer delegations in role-based access control models, highlighting the efficiency of using administrative scope for authorizing delegations and their application in workflow systems.

### Abstract
User delegation is a mechanism for assigning access rights available to one user to another user. A delegation can either be a grant or transfer operation. Existing work on delegation in the context of role-based access control models has extensively studied grant delegations, but transfer delegations have largely been ignored. This is largely because enforcing transfer delegation policies is more complex than grant delegation policies. This paper, primarily, studies transfer delegations for role-based access control models. We also include grant delegations in our model for completeness. We present various mechanisms that authorize delegations in our model. In particular, we show that the use of administrative scope for authorizing delegations is more efficient than using relations. We also discuss the enforcement and revocation of delegations. Finally, we study delegation in the context of workflow systems. In particular, we demonstrate the application of the administrative scope and administrative domain concepts to control delegation of tasks in worklist-based workflow systems.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Crampton2006DelegationInRol`) no Elicit Notebook correspondente à **Q13** e exporte o CSV para ingestão.

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

