---
type: paper
title: "Analyzing Graceful Degradation for Mixed Critical Fault-Tolerant Real-Time Systems"
paper: "[[Becker2015AnalyzingGracef]]"
source: "https://doi.org/10.1109/isorc.2015.10"
doi: "10.1109/isorc.2015.10"
year: 2015
citations: 20
journal: "2015 IEEE 18th International Symposium on Real-Time Distributed Computing"
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

# Analyzing Graceful Degradation for Mixed Critical Fault-Tolerant Real-Time Systems

## Identificação Epistêmica
- **Citekey**: `Becker2015AnalyzingGracef`
- **Autores**: Klaus Becker, Sebastian Voss
- **Ano**: 2015 | **Citações**: 20 | **Veículo**: 2015 IEEE 18th International Symposium on Real-Time Distributed Computing
- **DOI**: [10.1109/isorc.2015.10](https://doi.org/10.1109/isorc.2015.10)
- **Questão Vinculada**: [[Q07]] — Formal models for graceful degradation, fail-soft behavior, and degraded modes of operation
- **Pilares Suportados**: P4
- **Ruído Mitigado**: R4

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Graceful degradation mechanisms in fault-tolerant systems can ensure that remaining resources are efficiently used to execute fail-operational features, while ensuring fail-operationality.

### Abstract
Fault-tolerant distributed embedded systems have to react properly on the occurrence of faults in order to avoid harm to the system or its environment. Faulty system resources have to be isolated from the remaining system. Hence, these resources become unavailable, leading to a decreasing number of available resources and input data. In such cases, mechanisms like graceful degradation may be applied to ensure that the system does not turn off completely, but degrades its provided set of functional features gracefully. It must be ensured that the remaining intact resources are efficiently used to execute at least those features, which are required to behave fail-operational. In this paper, we investigate deployments of mixed-critical software components to a fault-tolerant system platform. We introduce a formal model of software components and their publish/subscribe based communication channels. We use this model to analyze the graceful degradation of the system in different scenarios of failing execution hardware. This includes also the explicit deactivation of software components due to unavailable required input data. Our analysis is based on using an SMT solver and contributes to guarantee that all requirements with respect to fail-operationality are met by the system design. The approach is evaluated by an example and a scalability analysis.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Becker2015AnalyzingGracef`) no Elicit Notebook correspondente à **Q07** e exporte o CSV para ingestão.

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

