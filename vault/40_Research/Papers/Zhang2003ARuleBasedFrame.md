---
kad_id: kad-b3c7512e3f46d0d8cc19d4a2
type: paper
title: "A rule-based framework for role-based delegation and revocation"
paper: "[[Zhang2003ARuleBasedFrame]]"
source: "https://doi.org/10.1145/937527.937530"
doi: "10.1145/937527.937530"
year: 2003
citations: 223
journal: "ACM Trans. Inf. Syst. Secur."
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

# A rule-based framework for role-based delegation and revocation

## Identificação Epistêmica
- **Citekey**: `Zhang2003ARuleBasedFrame`
- **Autores**: Longhua Zhang, Gail-Joon Ahn, B. Chu
- **Ano**: 2003 | **Citações**: 223 | **Veículo**: ACM Trans. Inf. Syst. Secur.
- **DOI**: [10.1145/937527.937530](https://doi.org/10.1145/937527.937530)
- **Questão Vinculada**: [[Q13]] — Formal logics modeling delegation and authority attenuation in distributed and multi-agent systems
- **Pilares Suportados**: P6, P8
- **Ruído Mitigado**: R9

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: The RDM2000 rule-based framework effectively manages privilege delegation and revocation in distributed systems, providing a secure and reliable solution for law enforcement agencies.

### Abstract
Delegation is the process whereby an active entity in a distributed environment authorizes another entity to access resources. In today's distributed systems, a user often needs to act on another user's behalf with some subset of his/her rights. Most systems have attempted to resolve such delegation requirements with ad-hoc mechanisms by compromising existing disorganized policies or simply attaching additional components to their applications. Still, there is a strong need in the large, distributed systems for a mechanism that provides effective privilege delegation and revocation management. This paper describes a rule-based framework for role-based delegation and revocation. The basic idea behind a role-based delegation is that users themselves may delegate role authorities to others to carry out some functions authorized to the former. We present a role-based delegation model called RDM2000 (role-based delegation model 2000) supporting hierarchical roles and multistep delegation. Different approaches for delegation and revocation are explored. A rule-based language for specifying and enforcing policies on RDM2000 is proposed. We describe a proof-of-concept prototype implementation of RDM2000 to demonstrate the feasibility of the proposed framework and provide secure protocols for managing delegations. The prototype is a web-based application for law enforcement agencies allowing reliable delegation and revocation. The future directions are also discussed.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Zhang2003ARuleBasedFrame`) no Elicit Notebook correspondente à **Q13** e exporte o CSV para ingestão.

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

