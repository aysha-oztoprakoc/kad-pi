---
kad_id: kad-54c152f460b89e88625386ae
type: paper
title: "Assessing Dependability with Software Fault Injection"
paper: "[[Natella2016AssessingDepend]]"
source: "https://doi.org/10.1145/2841425"
doi: "10.1145/2841425"
year: 2016
citations: 208
journal: "ACM Computing Surveys (CSUR)"
study_type: "literature review"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P4
  - P9
questions:
  - Q14
noises:
  - R10
tags:
  - research
  - paper
  - pilar/P4
  - pilar/P9
  - noise/R10
---

# Assessing Dependability with Software Fault Injection

## Identificação Epistêmica
- **Citekey**: `Natella2016AssessingDepend`
- **Autores**: R. Natella, Domenico Cotroneo, H. Madeira
- **Ano**: 2016 | **Citações**: 208 | **Veículo**: ACM Computing Surveys (CSUR)
- **DOI**: [10.1145/2841425](https://doi.org/10.1145/2841425)
- **Questão Vinculada**: [[Q14]] — Experimental methodologies (fault injection, dependability benchmarking) for autonomous systems under capability loss
- **Pilares Suportados**: P4, P9
- **Ruído Mitigado**: R10

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Software Fault Injection effectively assesses dependability in computer-based systems by predicting worst-case scenarios and enhancing fault representativeness, efficiency, and usability.

### Abstract
With the rise of software complexity, software-related accidents represent a significant threat for computer-based systems. Software Fault Injection is a method to anticipate worst-case scenarios caused by faulty software through the deliberate injection of software faults. This survey provides a comprehensive overview of the state of the art on Software Fault Injection to support researchers and practitioners in the selection of the approach that best fits their dependability assessment goals, and it discusses how these approaches have evolved to achieve fault representativeness, efficiency, and usability. The survey includes a description of relevant applications of Software Fault Injection in the context of fault-tolerant systems.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Natella2016AssessingDepend`) no Elicit Notebook correspondente à **Q14** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Protocolo experimental (variáveis de injeção de falha, métricas de sobrevivência) para modo offline.
- **Lacuna no PRIME_DIRECTIVE**: R10/P4+P9: Falta de instrumentação e fault injection formal para EXP-KAD-OFFLINE-SURVIVAL-001
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

