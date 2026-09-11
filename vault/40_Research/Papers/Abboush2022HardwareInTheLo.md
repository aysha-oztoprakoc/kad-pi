---
type: paper
title: "Hardware-in-the-Loop-Based Real-Time Fault Injection Framework for Dynamic Behavior Analysis of Automotive Software Systems"
paper: "[[Abboush2022HardwareInTheLo]]"
source: "https://doi.org/10.3390/s22041360"
doi: "10.3390/s22041360"
year: 2022
citations: 43
journal: "Sensors (Basel, Switzerland)"
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

# Hardware-in-the-Loop-Based Real-Time Fault Injection Framework for Dynamic Behavior Analysis of Automotive Software Systems

## Identificação Epistêmica
- **Citekey**: `Abboush2022HardwareInTheLo`
- **Autores**: Mohammad Abboush, Daniel Bamal, Christoph Knieke, A. Rausch
- **Ano**: 2022 | **Citações**: 43 | **Veículo**: Sensors (Basel, Switzerland)
- **DOI**: [10.3390/s22041360](https://doi.org/10.3390/s22041360)
- **Questão Vinculada**: [[Q14]] — Experimental methodologies (fault injection, dependability benchmarking) for autonomous systems under capability loss
- **Pilares Suportados**: P4, P9
- **Ruído Mitigado**: R10

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: The proposed real-time fault injection framework accurately analyzes automotive software systems' response under abnormal conditions, aiding in early system development and safety assessment.

### Abstract
A well-known challenge in the development of safety-critical systems in vehicles today is that reliability and safety assessment should be rigorously addressed and monitored. As a matter of fact, most safety problems caused by system failures can lead to serious hazards and loss of life. Notwithstanding the existence of several traditional analytical techniques used for evaluation based on specification documents, a complex design, with its multivariate dynamic behavior of automotive systems, requires an effective method for an experimental analysis of the system's response under abnormal conditions. Simulation-based fault injection (FI) is a recently developed approach to simulate the system behavior in the presence of faults at an early stage of system development. However, in order to analyze the behavior of the system accurately, comprehensively and realistically, the real-time conditions, as well as the dynamic system model of the vehicle, should be considered. In this study, a real-time FI framework is proposed based on a hardware-in-the-loop (HiL) simulation platform and a real-time electronic control unit (ECU) prototype. The framework is modelled in the MATLAB/Simulink environment and implemented in the HiL simulation to enable the analysis process in real time during the V-cycle development process. With the objective of covering most of the potential faults, nine different types of sensor and actuator control signal faults are injected programmatically into the HiL system as single and multiple faults without changing the original system model. Besides, the model of the whole system, containing vehicle dynamics with the environment system model, is considered with complete and comprehensive behavioral characteristics. A complex gasoline engine system is used as a case study to demonstrate the capabilities and advantages of the proposed framework. Through the proposed framework, transient and permanent faults are injected in real time during the operation of the system. Finally, experimental results show the effects of single and simultaneous faults on the system performance under a faulty mode compared to the golden running mode.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Abboush2022HardwareInTheLo`) no Elicit Notebook correspondente à **Q14** e exporte o CSV para ingestão.

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

