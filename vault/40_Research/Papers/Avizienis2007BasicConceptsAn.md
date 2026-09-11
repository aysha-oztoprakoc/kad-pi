---
type: paper
title: "Basic concepts and taxonomy of dependable and secure computing"
paper: "[[Avizienis2007BasicConceptsAn]]"
source: "https://doi.org/10.1109/tdsc.2004.2"
doi: "10.1109/tdsc.2004.2"
year: 2007
citations: 5785
journal: "IEEE Transactions on Dependable and Secure Computing"
study_type: "theoretical, modeling, or simulation study"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P4
questions:
  - Q07
noises:
  - R4
tags:
  - research
  - paper
  - pilar/P4
  - noise/R4
---

# Basic concepts and taxonomy of dependable and secure computing

## Identificação Epistêmica
- **Citekey**: `Avizienis2007BasicConceptsAn`
- **Autores**: A. Avizienis, J. Laprie, B. Randell, C. Landwehr
- **Ano**: 2007 | **Citações**: 5785 | **Veículo**: IEEE Transactions on Dependable and Secure Computing
- **DOI**: [10.1109/tdsc.2004.2](https://doi.org/10.1109/tdsc.2004.2)
- **Questão Vinculada**: [[Q07]] — Formal models for graceful degradation, fail-soft behavior, and degraded modes of operation
- **Pilares Suportados**: P4
- **Ruído Mitigado**: R4

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: This paper provides basic definitions and taxonomies for dependable and secure computing, aiding communication and cooperation among various scientific and technical communities.

### Abstract
This paper gives the main definitions relating to dependability, a generic concept including a special case of such attributes as reliability, availability, safety, integrity, maintainability, etc. Security brings in concerns for confidentiality, in addition to availability and integrity. Basic definitions are given first. They are then commented upon, and supplemented by additional definitions, which address the threats to dependability and security (faults, errors, failures), their attributes, and the means for their achievement (fault prevention, fault tolerance, fault removal, fault forecasting). The aim is to explicate a set of general concepts, of relevance across a wide range of situations and, therefore, helping communication and cooperation among a number of scientific and technical communities, including ones that are concentrating on particular types of system, of system failures, or of causes of system failures.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Avizienis2007BasicConceptsAn`) no Elicit Notebook correspondente à **Q07** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Formalizar §6 como máquina de estados tipada com lattice de capacidades.
- **Lacuna no PRIME_DIRECTIVE**: R4/P4: Taxonomia de dependabilidade e ordem parcial de configurações degradadas ("safest useful level")
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

