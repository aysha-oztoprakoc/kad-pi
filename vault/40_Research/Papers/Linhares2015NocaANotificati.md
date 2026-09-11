---
kad_id: kad-173e512a652b393b61e5e65e
type: paper
title: "NOCA ‑ A Notification-Oriented Computer Architecture"
paper: "[[Linhares2015NocaANotificati]]"
source: "https://doi.org/10.1109/tla.2015.7112020"
doi: "10.1109/tla.2015.7112020"
year: 2015
citations: 15
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

# NOCA ‑ A Notification-Oriented Computer Architecture

## Identificação Epistêmica
- **Citekey**: `Linhares2015NocaANotificati`
- **Autores**: Robson Ribeiro Linhares, J. M. Simão, P. C. Stadzisz
- **Ano**: 2015 | **Citações**: 15 | **Veículo**: IEEE Latin America Transactions
- **DOI**: [10.1109/tla.2015.7112020](https://doi.org/10.1109/tla.2015.7112020)
- **Questão Vinculada**: [[Q01]] — Theoretical and empirical foundations of Notification-Oriented Paradigm (NOP) vs event-driven/reactive architectures
- **Pilares Suportados**: P1, P2
- **Ruído Mitigado**: R1, R2

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: NOCA is a new computer architecture that efficiently executes software developed according to the Notification Oriented Paradigm, presenting improvements in performance comparative evaluations.

### Abstract
Current software development processes lack techniques for the productive and quality design of software that makes efficient use of the parallel execution capabilities provided by the hardware of modern computing systems. In this context, the Notification Oriented Paradigm (NOP) has been recently developed aiming at a new organization of software logic based on notifications among causal-logical entities. NOP allows exploring the parallelization and/or distribution in a simpler and more efficient way than more commonly used programming paradigms. However, the execution dynamics under the NOP, based on notifications, is not efficiently performed by the hardware of current computing systems. This paper presents a new computer architecture, named NOCA, which is suitable for execution of software developed according to the NOP computing model. NOCA was designed in accordance with the principles of generality and scalability, which allow it to execute NOP software at any level of complexity by fetching it from a program memory. The developed architecture is organized as a fine grain multiprocessor that hierarchically executes instructions through sets of specialized processor cores. Preliminary experiments performed on this architecture show that NOCA presents improvements in terms of performance comparative evaluations.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Linhares2015NocaANotificati`) no Elicit Notebook correspondente à **Q01** e exporte o CSV para ingestão.

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

