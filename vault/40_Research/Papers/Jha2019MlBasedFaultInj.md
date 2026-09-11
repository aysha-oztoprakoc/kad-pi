---
kad_id: kad-8c26d8e15a7e09368eb54435
type: paper
title: "ML-Based Fault Injection for Autonomous Vehicles: A Case for Bayesian Fault Injection"
paper: "[[Jha2019MlBasedFaultInj]]"
source: "https://doi.org/10.1109/dsn.2019.00025"
doi: "10.1109/dsn.2019.00025"
year: 2019
citations: 138
journal: "2019 49th Annual IEEE/IFIP International Conference on Dependable Systems and Networks (DSN)"
study_type: "other"
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

# ML-Based Fault Injection for Autonomous Vehicles: A Case for Bayesian Fault Injection

## Identificação Epistêmica
- **Citekey**: `Jha2019MlBasedFaultInj`
- **Autores**: Saurabh Jha, Subho Sankar Banerjee, Timothy Tsai, S. Hari, Michael B. Sullivan, Z. Kalbarczyk, S. Keckler, R. Iyer
- **Ano**: 2019 | **Citações**: 138 | **Veículo**: 2019 49th Annual IEEE/IFIP International Conference on Dependable Systems and Networks (DSN)
- **DOI**: [10.1109/dsn.2019.00025](https://doi.org/10.1109/dsn.2019.00025)
- **Questão Vinculada**: [[Q14]] — Experimental methodologies (fault injection, dependability benchmarking) for autonomous systems under capability loss
- **Pilares Suportados**: P4, P9
- **Ruído Mitigado**: R10

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: DriveFI, a machine learning-based fault injection engine, effectively mines situations and faults that impact autonomous vehicle safety, finding 561 safety-critical faults in less than 4 hours compared to random injection experiments.

### Abstract
The safety and resilience of fully autonomous vehicles (AVs) are of significant concern, as exemplified by several headline-making accidents. While AV development today involves verification, validation, and testing, end-to-end assessment of AV systems under accidental faults in realistic driving scenarios has been largely unexplored. This paper presents DriveFI, a machine learning-based fault injection engine, which can mine situations and faults that maximally impact AV safety, as demonstrated on two industry-grade AV technology stacks (from NVIDIA and Baidu). For example, DriveFI found 561 safety-critical faults in less than 4 hours. In comparison, random injection experiments executed over several weeks could not find any safety-critical faults.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Jha2019MlBasedFaultInj`) no Elicit Notebook correspondente à **Q14** e exporte o CSV para ingestão.

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

