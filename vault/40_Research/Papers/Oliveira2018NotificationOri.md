---
type: paper
title: "Notification Oriented Paradigm Applied to Ambient Assisted Living Tool"
paper: "[[Oliveira2018NotificationOri]]"
source: "https://doi.org/10.1109/tla.2018.8327425"
doi: "10.1109/tla.2018.8327425"
year: 2018
citations: 13
journal: "IEEE Latin America Transactions"
study_type: ""
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

# Notification Oriented Paradigm Applied to Ambient Assisted Living Tool

## Identificação Epistêmica
- **Citekey**: `Oliveira2018NotificationOri`
- **Autores**: Rodrigo Nunes Oliveira, Valmir Roth, Alexandre Felippeto Henzen, J. M. Simão, P. Nohama, Emilio Carlos Gomes Wille
- **Ano**: 2018 | **Citações**: 13 | **Veículo**: IEEE Latin America Transactions
- **DOI**: [10.1109/tla.2018.8327425](https://doi.org/10.1109/tla.2018.8327425)
- **Questão Vinculada**: [[Q01]] — Theoretical and empirical foundations of Notification-Oriented Paradigm (NOP) vs event-driven/reactive architectures
- **Pilares Suportados**: P1, P2
- **Ruído Mitigado**: R1, R2

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: The Notification Oriented Paradigm (NOP) effectively develops intelligent systems for smart environments, enabling Ambient Assisted Living (AAL) for elderly and people with limitations, with execution times in the range of milliseconds.

### Abstract
The rising in life expectancy is reflected in an increase in the elderly population and numerous actions become necessary to ensure the elderly a proper quality of life and independence in performing daily tasks. One of the applications of the Internet of Things technology (IoT) is the creation of smart environments with interactive devices allowing integration between the physical environment and the individual. A viable application of intelligent environments is the Ambient Assisted Living (AAL), which can enable elderly and people with some kind of limitations be assisted in their daily routine, independently and safely. In this context, in order to provide support technology, this research aims to evaluate the adhesion of Notification Oriented Paradigm (NOP) to IoT. NOP provides means for the development of robust systems, distributed, consistent, and rule-based systems for smart environments. Thus, to verify this adherence, it was created an application where is possible to manage rules and sensors dynamically and in real time, besides to enable notifications between sensors connected in different environments. This application can run on a microcomputer Raspberry Pi that simulates the rules and sensors in a virtual environment, acting as a simulator. The result of the simulation was evaluated by measuring the execution time of a set of rules notified among different environments. The results achieved for execution time, in the range of milliseconds, are sufficient for the demands required by systems in real scenarios, thus demonstrating the effectiveness of the intelligent systems developed by means of NOP.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Oliveira2018NotificationOri`) no Elicit Notebook correspondente à **Q01** e exporte o CSV para ingestão.

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

