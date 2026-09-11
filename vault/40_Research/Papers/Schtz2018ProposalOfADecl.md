---
type: paper
title: "Proposal of a declarative and parallelizable artificial neural network using the notification-oriented paradigm"
paper: "[[Schtz2018ProposalOfADecl]]"
source: "https://doi.org/10.1007/s00521-018-3517-y"
doi: "10.1007/s00521-018-3517-y"
year: 2018
citations: 6
journal: "Neural Computing and Applications"
study_type: "theoretical, modeling, or simulation study"
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

# Proposal of a declarative and parallelizable artificial neural network using the notification-oriented paradigm

## Identificação Epistêmica
- **Citekey**: `Schtz2018ProposalOfADecl`
- **Autores**: Fernando Schütz, J. A. Fabro, A. F. Ronszcka, P. C. Stadzisz, J. M. Simão
- **Ano**: 2018 | **Citações**: 6 | **Veículo**: Neural Computing and Applications
- **DOI**: [10.1007/s00521-018-3517-y](https://doi.org/10.1007/s00521-018-3517-y)
- **Questão Vinculada**: [[Q01]] — Theoretical and empirical foundations of Notification-Oriented Paradigm (NOP) vs event-driven/reactive architectures
- **Pilares Suportados**: P1, P2
- **Ruído Mitigado**: R1, R2

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: The notification-oriented paradigm (NOP) enables decoupled and distributed artificial neural networks, allowing parallel code generation and efficient distribution on multicore platforms.

### Abstract
Since the 1960s, artificial neural networks (ANNs) have been implemented and applied in various areas of knowledge. Most of these implementations had their development guided by imperative programming (IP), usually resulting in highly coupled programs. Thus, even though intrinsically parallel in theory, ANNs do not easily take an effective distribution on multiple processors when developed under IP. As an alternative, the notification-oriented paradigm (NOP) emerges as a new programming technique. NOP facilitates the development of decoupled and distributed systems, using abstraction of knowledge through logical–causal rules, as well as the generation of an optimized code. Both features are possible by means of a notification-oriented inference process, which avoids structural and temporal redundancies in the logic–causal evaluations. These advantages are relevant to systems that have parts decoupled in order to run in parallel, such as ANN. In this sense, this work presents the development of a multilayer perceptron ANN using backpropagation training algorithm based on the concepts of a NOP implementation. Such implementation allows, transparently from high-level programming, parallel code generation that runs on multicore platforms. Furthermore, the solution based on NOP, when compared against the equivalent on IP, presents a high level of decoupling and explicit use of logic–causal elements, which are, respectively, useful to distribution, understanding and improvement of the application.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Schtz2018ProposalOfADecl`) no Elicit Notebook correspondente à **Q01** e exporte o CSV para ingestão.

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

