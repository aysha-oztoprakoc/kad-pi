---
type: paper
title: "Toward a Lingua Franca for Deterministic Concurrent Systems"
paper: "[[Lohstroh2021TowardALinguaFr]]"
source: "https://doi.org/10.1145/3448128"
doi: "10.1145/3448128"
year: 2021
citations: 126
journal: "ACM Transactions on Embedded Computing Systems (TECS)"
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

# Toward a Lingua Franca for Deterministic Concurrent Systems

## Identificação Epistêmica
- **Citekey**: `Lohstroh2021TowardALinguaFr`
- **Autores**: Marten Lohstroh, Christian Menard, S. Bateni, Edward A. Lee
- **Ano**: 2021 | **Citações**: 126 | **Veículo**: ACM Transactions on Embedded Computing Systems (TECS)
- **DOI**: [10.1145/3448128](https://doi.org/10.1145/3448128)
- **Questão Vinculada**: [[Q02]] — Formal semantic frameworks for event-driven reactive systems with asynchronous notifications
- **Pilares Suportados**: P1, P2
- **Ruído Mitigado**: R2

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Reactors enable determinism in concurrent systems while preserving modularity, allowing distributed execution, and promoting timing control without compromising determinacy.

### Abstract
Many programming languages and programming frameworks focus on parallel and distributed computing. Several frameworks are based on actors, which provide a more disciplined model for concurrency than threads. The interactions between actors, however, if not constrained, admit nondeterminism. As a consequence, actor programs may exhibit unintended behaviors and are less amenable to rigorous testing. We show that nondeterminism can be handled in a number of ways, surveying dataflow dialects, process networks, synchronous-reactive models, and discrete-event models. These existing approaches, however, tend to require centralized control, pose challenges to modular system design, or introduce a single point of failure. We describe “reactors,” a new coordination model that combines ideas from several of these approaches to enable determinism while preserving much of the style of actors. Reactors promote modularity and allow for distributed execution. By using a logical model of time that can be associated with physical time, reactors also provide control over timing. Reactors also expose parallelism that can be exploited on multicore machines and in distributed configurations without compromising determinacy.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Lohstroh2021TowardALinguaFr`) no Elicit Notebook correspondente à **Q02** e exporte o CSV para ingestão.

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

