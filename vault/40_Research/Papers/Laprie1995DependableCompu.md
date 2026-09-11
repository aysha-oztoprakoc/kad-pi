---
kad_id: kad-a2ff7b320c4d506d98b77e2f
type: paper
title: "DEPENDABLE COMPUTING AND FAULT TOLERANCE : CONCEPTS AND TERMINOLOGY"
paper: "[[Laprie1995DependableCompu]]"
source: "https://doi.org/10.1109/ftcsh.1995.532603"
doi: "10.1109/ftcsh.1995.532603"
year: 1995
citations: 614
journal: "Twenty-Fifth International Symposium on Fault-Tolerant Computing, 1995, ' Highlights from Twenty-Five Years'."
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

# DEPENDABLE COMPUTING AND FAULT TOLERANCE : CONCEPTS AND TERMINOLOGY

## Identificação Epistêmica
- **Citekey**: `Laprie1995DependableCompu`
- **Autores**: J. Laprie
- **Ano**: 1995 | **Citações**: 614 | **Veículo**: Twenty-Fifth International Symposium on Fault-Tolerant Computing, 1995, ' Highlights from Twenty-Five Years'.
- **DOI**: [10.1109/ftcsh.1995.532603](https://doi.org/10.1109/ftcsh.1995.532603)
- **Questão Vinculada**: [[Q07]] — Formal models for graceful degradation, fail-soft behavior, and degraded modes of operation
- **Pilares Suportados**: P4
- **Ruído Mitigado**: R4

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: This paper provides a conceptual framework for describing dependable computing attributes, focusing on fault-tolerance and fault-avoidance, and measures reliability, availability, maintainability, and safety.

### Abstract
This paper provides a concepeual framework for expressing the attributes of what constitutes dependable and reliable computing: the impairrnents to dependability: faults, errors, and failures, the means for dependability: fault-avoidance, fault-tolerance, enor-removal, and errorthe measures of dependability: reliability, availability, maintainability, and safety. Emphasis is being put on the dependability impairments and on fault-tolerance. -

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Laprie1995DependableCompu`) no Elicit Notebook correspondente à **Q07** e exporte o CSV para ingestão.

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

