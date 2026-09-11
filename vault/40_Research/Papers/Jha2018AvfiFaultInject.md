---
type: paper
title: "AVFI: Fault Injection for Autonomous Vehicles"
paper: "[[Jha2018AvfiFaultInject]]"
source: "https://doi.org/10.1109/dsn-w.2018.00027"
doi: "10.1109/dsn-w.2018.00027"
year: 2018
citations: 65
journal: "2018 48th Annual IEEE/IFIP International Conference on Dependable Systems and Networks Workshops (DSN-W)"
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

# AVFI: Fault Injection for Autonomous Vehicles

## Identificação Epistêmica
- **Citekey**: `Jha2018AvfiFaultInject`
- **Autores**: Saurabh Jha, Subho Sankar Banerjee, James Cyriac, Z. Kalbarczyk, R. Iyer
- **Ano**: 2018 | **Citações**: 65 | **Veículo**: 2018 48th Annual IEEE/IFIP International Conference on Dependable Systems and Networks Workshops (DSN-W)
- **DOI**: [10.1109/dsn-w.2018.00027](https://doi.org/10.1109/dsn-w.2018.00027)
- **Questão Vinculada**: [[Q14]] — Experimental methodologies (fault injection, dependability benchmarking) for autonomous systems under capability loss
- **Pilares Suportados**: P4, P9
- **Ruído Mitigado**: R10

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: This paper proposes a fault injection method for autonomous vehicles, aiming to assess their overall resilience and safety, aiming to improve public acceptance and adoption of autonomous vehicles.

### Abstract
Autonomous vehicle (AV) technology is rapidly becoming a reality on U.S. roads, offering the promise of improvements in traffic management, safety, and the comfort and efficiency of vehicular travel. With this increasing popularity and ubiquitous deployment, resilience has become a critical requirement for public acceptance and adoption. Recent studies into the resilience of AVs have shown that though the AV systems are improving over time, they have not reached human levels of automation. Prior work in this area has studied the safety and resilience of individual components of the AV system (e.g., testing of neural networks powering the perception function). However, methods for holistic end-to-end resilience assessment of AV systems are still non-existent.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Jha2018AvfiFaultInject`) no Elicit Notebook correspondente à **Q14** e exporte o CSV para ingestão.

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

