---
type: paper
title: "Modeling publish/subscribe communication systems: towards a formal approach"
paper: "[[Baldoni2003ModelingPublish]]"
source: "https://doi.org/10.1109/words.2003.1218097"
doi: "10.1109/words.2003.1218097"
year: 2003
citations: 56
journal: "Proceedings of the Eighth International Workshop on Object-Oriented Real-Time Dependable Systems, 2003. (WORDS 2003)."
study_type: "theoretical, modeling, or simulation study"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P1
  - P2
questions:
  - Q02
noises:
  - R2
tags:
  - research
  - paper
  - pilar/P1
  - pilar/P2
  - noise/R2
---

# Modeling publish/subscribe communication systems: towards a formal approach

## Identificação Epistêmica
- **Citekey**: `Baldoni2003ModelingPublish`
- **Autores**: R. Baldoni, M. Contenti, S. Piergiovanni, A. Virgillito
- **Ano**: 2003 | **Citações**: 56 | **Veículo**: Proceedings of the Eighth International Workshop on Object-Oriented Real-Time Dependable Systems, 2003. (WORDS 2003).
- **DOI**: [10.1109/words.2003.1218097](https://doi.org/10.1109/words.2003.1218097)
- **Questão Vinculada**: [[Q02]] — Formal semantic frameworks for event-driven reactive systems with asynchronous notifications
- **Pilares Suportados**: P1, P2
- **Ruído Mitigado**: R2

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: This paper proposes a framework for modeling publish/subscribe computations, capturing completeness and minimality properties, and provides a centralized implementation for minimal and complete computations.

### Abstract
Publish/subscribe is a widespread communication paradigm for asynchronous messaging that naturally fits the decoupled nature of distributed systems, allowing simple and effective development of distributed applications. In this paper we propose a framework, which includes a model of a publish/subscribe computation and a few properties on the computation, namely completeness and minimality, which capture, from an application viewpoint, the expected behavior of a publish/subscribe system with respect to the semantic of the notification of the information. Finally, we provide also a centralized implementation of publish/subscribe system which produces minimal and complete computations.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Baldoni2003ModelingPublish`) no Elicit Notebook correspondente à **Q02** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Escolher um formalismo (LTS/traces/observação) para o loop canônico de execução e para testes de notification selectivity.
- **Lacuna no PRIME_DIRECTIVE**: R2/P1: Semântica operacional (sistemas síncronos, cálculo de processos, atores) para o loop reativo
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

