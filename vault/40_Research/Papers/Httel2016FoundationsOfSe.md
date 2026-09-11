---
type: paper
title: "Foundations of Session Types and Behavioural Contracts"
paper: "[[Httel2016FoundationsOfSe]]"
source: "https://doi.org/10.1145/2873052"
doi: "10.1145/2873052"
year: 2016
citations: 77
journal: "ACM Computing Surveys (CSUR)"
study_type: "literature review"
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

# Foundations of Session Types and Behavioural Contracts

## Identificação Epistêmica
- **Citekey**: `Httel2016FoundationsOfSe`
- **Autores**: Hans Hüttel, Ivan Lanese, V. Vasconcelos, Luís Caires, Marco Carbone, Pierre-Malo Deniélou, D. Mostrous, Luca Padovani, A. Ravara, Emilio Tuosto, Hugo Torres Vieira, G. Zavattaro
- **Ano**: 2016 | **Citações**: 77 | **Veículo**: ACM Computing Surveys (CSUR)
- **DOI**: [10.1145/2873052](https://doi.org/10.1145/2873052)
- **Questão Vinculada**: [[Q04]] — Behavioral type systems and session types for component interaction and lifecycle protocols
- **Pilares Suportados**: P2
- **Ruído Mitigado**: R2

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Session types and behavioral contracts have evolved over the last 20 years to effectively specify software components' expected interaction patterns, ensuring correct interaction with other components.

### Abstract
Behavioural type systems, usually associated to concurrent or distributed computations, encompass concepts such as interfaces, communication protocols, and contracts, in addition to the traditional input/output operations. The behavioural type of a software component specifies its expected patterns of interaction using expressive type languages, so types can be used to determine automatically whether the component interacts correctly with other components. Two related important notions of behavioural types are those of session types and behavioural contracts. This article surveys the main accomplishments of the last 20 years within these two approaches.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Httel2016FoundationsOfSe`) no Elicit Notebook correspondente à **Q04** e exporte o CSV para ingestão.

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

