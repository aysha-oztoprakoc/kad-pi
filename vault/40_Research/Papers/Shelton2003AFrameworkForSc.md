---
kad_id: kad-4d9e19cc3d094d201c900e43
type: paper
title: "A framework for scalable analysis and design of system-wide graceful degradation in distributed embedded systems"
paper: "[[Shelton2003AFrameworkForSc]]"
source: "https://doi.org/10.1109/words.2003.1218078"
doi: "10.1109/words.2003.1218078"
year: 2003
citations: 75
journal: "Proceedings of the Eighth International Workshop on Object-Oriented Real-Time Dependable Systems, 2003. (WORDS 2003)."
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

# A framework for scalable analysis and design of system-wide graceful degradation in distributed embedded systems

## Identificação Epistêmica
- **Citekey**: `Shelton2003AFrameworkForSc`
- **Autores**: C. Shelton, P. Koopman, W. Nace
- **Ano**: 2003 | **Citações**: 75 | **Veículo**: Proceedings of the Eighth International Workshop on Object-Oriented Real-Time Dependable Systems, 2003. (WORDS 2003).
- **DOI**: [10.1109/words.2003.1218078](https://doi.org/10.1109/words.2003.1218078)
- **Questão Vinculada**: [[Q07]] — Formal models for graceful degradation, fail-soft behavior, and degraded modes of operation
- **Pilares Suportados**: P4
- **Ruído Mitigado**: R4

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: This framework enables scalable analysis and design of graceful degradation in distributed embedded systems, improving system dependability by identifying architectural properties that enhance graceful degradation.

### Abstract
We present a framework that will enable scalable analysis and design of graceful degradation in distributed embedded systems. We define graceful degradation in terms of utility. A system that gracefully degrades suffers a proportional loss of system utility as individual software and hardware components fail. However, explicitly designing a system to gracefully degrade; i.e. handle all possible combinations of component failures, becomes impractical for systems with more than a few components. We avoid this exponential complexity of component combinations by exploiting the structure of the system architecture to partition components into subsystems. We view each subsystem as a configuration of components that changes when components are removed or added. Thus, a subsystem's utility changes when components fail or are repaired. We then view the system as a composition of subsystems that each contribute to overall system utility. We demonstrate the scalability of our framework by applying it to an example automobile navigation system. Using this framework, we improve the system dependability by identifying architectural properties that enhance a system's ability to gracefully degrade.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Shelton2003AFrameworkForSc`) no Elicit Notebook correspondente à **Q07** e exporte o CSV para ingestão.

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

