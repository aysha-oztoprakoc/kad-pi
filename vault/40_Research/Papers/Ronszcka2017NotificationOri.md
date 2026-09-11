---
kad_id: kad-fe624cc45e668718e01d6ac8
type: paper
title: "Notification-Oriented Paradigm Framework 2.0: An Implementation Based On Design Patterns"
paper: "[[Ronszcka2017NotificationOri]]"
source: "https://doi.org/10.1109/tla.2017.8070430"
doi: "10.1109/tla.2017.8070430"
year: 2017
citations: 9
journal: "IEEE Latin America Transactions"
study_type: "other"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P1
  - P2
questions:
  - Q01
noises:
  - R1
  - R2
tags:
  - research
  - paper
  - pilar/P1
  - pilar/P2
  - noise/R1
  - noise/R2
---

# Notification-Oriented Paradigm Framework 2.0: An Implementation Based On Design Patterns

## Identificação Epistêmica
- **Citekey**: `Ronszcka2017NotificationOri`
- **Autores**: A. F. Ronszcka, Glauber Z. Valença, R. Linhares, J. A. Fabro, P. C. Stadzisz, J. M. Simão
- **Ano**: 2017 | **Citações**: 9 | **Veículo**: IEEE Latin America Transactions
- **DOI**: [10.1109/tla.2017.8070430](https://doi.org/10.1109/tla.2017.8070430)
- **Questão Vinculada**: [[Q01]] — Theoretical and empirical foundations of Notification-Oriented Paradigm (NOP) vs event-driven/reactive architectures
- **Pilares Suportados**: P1, P2
- **Ruído Mitigado**: R1, R2

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: The NOP Framework 2.0, based on design patterns, significantly improves execution speed and structuration of NOP applications compared to the previous version, making it two times faster.

### Abstract
The Notification-Oriented Paradigm (NOP) is a new technique to develop software. NOP is a rule-oriented approach where every rule and fact-base element is derived into less complex entities with specific tasks. These entities particularly collaborate by means of notifications, which occur only when their state changes. This allows carrying out an inference process completely active. Due to this particular arrangement, NOP can eliminate most of the structural and temporal redundancies that affects program execution performance, difficulties in codification level, and high coupling in program modules. In order to validate the NOP state of art, a framework was initially implemented in C++. Even though it quite demonstrated the features of the paradigm in terms of the development process, it still presented a gap in execution performance. In this context, this paper presents the NOP Framework 2.0. This new version was reengineered aiming better structuration and improvements in the execution time of NOP applications. The experiments show that the new implementation is two times faster than the former one. In addition, new experiments were presented comparing the NOP applications to equivalent implementations based on Oriented-Object Paradigm (OOP) in C++. The NOP applications presented, in some cases, better performance than the OOP applications.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Ronszcka2017NotificationOri`) no Elicit Notebook correspondente à **Q01** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: População de docs/prime-directive/PON.md com citações verificadas; rebaixar [SOURCE_DERIVED]→[DESIGN_DECISION] onde a literatura não suportar.
- **Lacuna no PRIME_DIRECTIVE**: R1/P1: Literatura própria do PON (paradigma acadêmico brasileiro de sistemas reativos baseados em notificação)
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

