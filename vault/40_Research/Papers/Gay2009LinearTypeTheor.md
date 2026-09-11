---
type: paper
title: "Linear type theory for asynchronous session types"
paper: "[[Gay2009LinearTypeTheor]]"
source: "https://doi.org/10.1017/s0956796809990268"
doi: "10.1017/s0956796809990268"
year: 2009
citations: 235
journal: "Journal of Functional Programming"
study_type: "theoretical, modeling, or simulation study"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P2
questions:
  - Q04
noises:
  - R2
tags:
  - research
  - paper
  - pilar/P2
  - noise/R2
---

# Linear type theory for asynchronous session types

## Identificação Epistêmica
- **Citekey**: `Gay2009LinearTypeTheor`
- **Autores**: S. Gay, V. Vasconcelos
- **Ano**: 2009 | **Citações**: 235 | **Veículo**: Journal of Functional Programming
- **DOI**: [10.1017/s0956796809990268](https://doi.org/10.1017/s0956796809990268)
- **Questão Vinculada**: [[Q04]] — Behavioral type systems and session types for component interaction and lifecycle protocols
- **Pilares Suportados**: P2
- **Ruído Mitigado**: R2

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: This paper presents a multithreaded functional language with session types, simplifying their use and providing a secure foundation for language developments like polymorphism and object-orientation.

### Abstract
Abstract Session types support a type-theoretic formulation of structured patterns of communication, so that the communication behaviour of agents in a distributed system can be verified by static typechecking. Applications include network protocols, business processes and operating system services. In this paper we define a multithreaded functional language with session types, which unifies, simplifies and extends previous work. There are four main contributions. First is an operational semantics with buffered channels, instead of the synchronous communication of previous work. Second, we prove that the session type of a channel gives an upper bound on the necessary size of the buffer. Third, session types are manipulated by means of the standard structures of a linear type theory, rather than by means of new forms of typing judgement. Fourth, a notion of subtyping, including the standard subtyping relation for session types (imported into the functional setting), and a novel form of subtyping between standard and linear function types, which allows the typechecker to handle linear types conveniently. Our new approach significantly simplifies session types in the functional setting, clarifies their essential features and provides a secure foundation for language developments such as polymorphism and object-orientation.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Gay2009LinearTypeTheor`) no Elicit Notebook correspondente à **Q04** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Especificação tipo-comportamental dos seams de ativação/desativação (base para WP-KAD-STC-SANDBOX-HARDENING-033).
- **Lacuna no PRIME_DIRECTIVE**: R2/P2: Ordenação estática de ativação/desativação ("dependentes antes de dependências")
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

