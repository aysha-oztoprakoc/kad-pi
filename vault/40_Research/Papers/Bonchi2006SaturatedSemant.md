---
type: paper
title: "Saturated Semantics for Reactive Systems"
paper: "[[Bonchi2006SaturatedSemant]]"
source: "https://doi.org/10.1109/lics.2006.46"
doi: "10.1109/lics.2006.46"
year: 2006
citations: 62
journal: "21st Annual IEEE Symposium on Logic in Computer Science (LICS'06)"
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

# Saturated Semantics for Reactive Systems

## Identificação Epistêmica
- **Citekey**: `Bonchi2006SaturatedSemant`
- **Autores**: F. Bonchi, B. König, U. Montanari
- **Ano**: 2006 | **Citações**: 62 | **Veículo**: 21st Annual IEEE Symposium on Logic in Computer Science (LICS'06)
- **DOI**: [10.1109/lics.2006.46](https://doi.org/10.1109/lics.2006.46)
- **Questão Vinculada**: [[Q02]] — Formal semantic frameworks for event-driven reactive systems with asynchronous notifications
- **Pilares Suportados**: P1, P2
- **Ruído Mitigado**: R2

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Saturated semantics, based on a weaker notion of observation, can automatically derive labelled transition systems from reaction rules, resulting in congruences and consistent with standard semantics.

### Abstract
The semantics of process calculi has traditionally been specified by labelled transition systems (LTS), but with the development of name calculi it turned out that reaction rules (i.e., unlabelled transition rules) are often more natural. This leads to the question of how behavioural equivalences (bisimilarity, trace equivalence, etc.) defined for LTS can be transferred to unlabelled transition systems. Recently, in order to answer this question, several proposals have been made with the aim of automatically deriving an LTS from reaction rules in such a way that the resulting equivalences are congruences. Furthermore these equivalences should agree with the standard semantics, whenever one exists. In this paper we propose saturated semantics, based on a weaker notion of observation and orthogonal to all the previous proposals, and we demonstrate the appropriateness of our semantics by means of two examples: logic programming and a subset of the open pi-calculus. Indeed, we prove that our equivalences are congruences and that they coincide with logical equivalence and open bisimilarity respectively, while equivalences studied in previous works are strictly finer

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Bonchi2006SaturatedSemant`) no Elicit Notebook correspondente à **Q02** e exporte o CSV para ingestão.

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

