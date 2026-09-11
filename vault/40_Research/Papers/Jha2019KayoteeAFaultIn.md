---
type: paper
title: "Kayotee: A Fault Injection-based System to Assess the Safety and Reliability of Autonomous Vehicles to Faults and Errors"
paper: "[[Jha2019KayoteeAFaultIn]]"
source: "https://doi.org/10.48550/arxiv.1907.01024"
doi: "10.48550/arxiv.1907.01024"
year: 2019
citations: 44
journal: "ArXiv"
study_type: "theoretical, modeling, or simulation study"
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

# Kayotee: A Fault Injection-based System to Assess the Safety and Reliability of Autonomous Vehicles to Faults and Errors

## Identificação Epistêmica
- **Citekey**: `Jha2019KayoteeAFaultIn`
- **Autores**: Saurabh Jha, Timothy Tsai, S. Hari, Michael B. Sullivan, Z. Kalbarczyk, S. Keckler, R. Iyer
- **Ano**: 2019 | **Citações**: 44 | **Veículo**: ArXiv
- **DOI**: [10.48550/arxiv.1907.01024](https://doi.org/10.48550/arxiv.1907.01024)
- **Questão Vinculada**: [[Q14]] — Experimental methodologies (fault injection, dependability benchmarking) for autonomous systems under capability loss
- **Pilares Suportados**: P4, P9
- **Ruído Mitigado**: R10

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Kayotee is a fault injection-based tool that assesses the safety and reliability of autonomous vehicles to faults and errors, evaluating their resiliency at various levels.

### Abstract
Fully autonomous vehicles (AVs), i.e., AVs with autonomy level 5, are expected to dominate road transportation in the near-future and contribute trillions of dollars to the global economy. The general public, government organizations, and manufacturers all have significant concern regarding resiliency and safety standards of the autonomous driving system (ADS) of AVs . In this work, we proposed and developed (a) `Kayotee' - a fault injection-based tool to systematically inject faults into software and hardware components of the ADS to assess the safety and reliability of AVs to faults and errors, and (b) an ontology model to characterize errors and safety violations impacting reliability and safety of AVs. Kayotee is capable of characterizing fault propagation and resiliency at different levels - (a) hardware, (b) software, (c) vehicle dynamics, and (d) traffic resilience. We used Kayotee to study a proprietary ADS technology built by Nvidia corporation and are currently applying Kayotee to other open-source ADS systems.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Jha2019KayoteeAFaultIn`) no Elicit Notebook correspondente à **Q14** e exporte o CSV para ingestão.

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

