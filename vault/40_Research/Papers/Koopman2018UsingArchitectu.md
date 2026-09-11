---
type: paper
title: "Using Architectural Properties to Model and Measure System-Wide Graceful Degradation"
paper: "[[Koopman2018UsingArchitectu]]"
source: "https://doi.org/10.1184/r1/6626387.v1"
doi: "10.1184/r1/6626387.v1"
year: 2018
citations: 15
journal: ""
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

# Using Architectural Properties to Model and Measure System-Wide Graceful Degradation

## Identificação Epistêmica
- **Citekey**: `Koopman2018UsingArchitectu`
- **Autores**: P. Koopman, C. Shelton
- **Ano**: 2018 | **Citações**: 15 | **Veículo**: 
- **DOI**: [10.1184/r1/6626387.v1](https://doi.org/10.1184/r1/6626387.v1)
- **Questão Vinculada**: [[Q07]] — Formal models for graceful degradation, fail-soft behavior, and degraded modes of operation
- **Pilares Suportados**: P4
- **Ruído Mitigado**: R4

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: This paper presents a component-based model for evaluating and improving system-wide graceful degradation in computer systems, using software architecture to group components into subsystems and measure overall utility.

### Abstract
System-wide graceful degradation may be a viable approach to improving dependability in computer systems. In order to evaluate and improve system-wide graceful degradation we present initial work on a component-based model that will explicitly define graceful degradation as a system property, and measure how well a system gracefully degrades in the presence of multiple combinations of component failures. The system’s software architecture plays a major role in this model, because the interface and component specifications embody the architecture’s abstraction principle. We use the architecture to group components into subsystems that enable reasoning about overall system utility. We apply this model to an example distributed embedded control system and report on initial results.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Koopman2018UsingArchitectu`) no Elicit Notebook correspondente à **Q07** e exporte o CSV para ingestão.

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

