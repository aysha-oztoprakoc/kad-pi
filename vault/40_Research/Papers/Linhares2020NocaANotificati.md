---
kad_id: kad-0088345e8fb6630bfc2784fc
type: paper
title: "NOCA — A Notification-Oriented Computer Architecture: Prototype and Simulator"
paper: "[[Linhares2020NocaANotificati]]"
source: "https://doi.org/10.1109/access.2020.2975360"
doi: "10.1109/access.2020.2975360"
year: 2020
citations: 4
journal: "IEEE Access"
study_type: "bench experiment"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P1
  - P2
questions:
  - Q01
noises:
  - R1
  - R2
tags:
  - research
  - paper
  - pilar/P1
  - pilar/P2
  - noise/R1
  - noise/R2
---

# NOCA — A Notification-Oriented Computer Architecture: Prototype and Simulator

## Identificação Epistêmica
- **Citekey**: `Linhares2020NocaANotificati`
- **Autores**: R. Linhares, L. F. Pordeus, J. M. Simão, P. C. Stadzisz
- **Ano**: 2020 | **Citações**: 4 | **Veículo**: IEEE Access
- **DOI**: [10.1109/access.2020.2975360](https://doi.org/10.1109/access.2020.2975360)
- **Questão Vinculada**: [[Q01]] — Theoretical and empirical foundations of Notification-Oriented Paradigm (NOP) vs event-driven/reactive architectures
- **Pilares Suportados**: P1, P2
- **Ruído Mitigado**: R1, R2

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: The NOCA architecture efficiently executes NOP software of any size, maximizing speedups and minimizing memory access bottlenecks.

### Abstract
The Notification Oriented Paradigm (NOP) introduced a new organization of software and hardware logic based on notifications among computational entities. This NOP new organization avoids processing redundancy and allows processing unit decoupling, therefore permitting proper processing performance and processing parallelism/distribution. Thus, the NOP provides means to make efficient use of the parallel execution capabilities of modern computing systems. However, as expected, the execution dynamics of NOP, based on notifications, is not efficiently performed by the hardware of most current computing systems. This paper presents a new solution called Notification-Oriented Computer Architecture (NOCA), which is suitable for the execution of software developed according to the NOP computing model. The NOCA was designed according to principles of generality and scalability, which allow it to execute NOP software of any size by fetching the application from memory. The proposed architecture is organized as a fine-grained multiprocessor that hierarchically executes instructions through sets of specialized processing cores. Preliminary experiments performed on prototypal FPGA implementation of the NOCA showed the expected behavior of executing NOP applications according to its theoretical computing model. This paper also presents experiments performed on a NOCA simulator extending the scale of parallelization of applications. Results show improvements in maximizing the speedups at higher scales of parallelization, as well as minimizing the effects of processor-to-memory communication bottlenecks by reducing the number of required memory accesses during execution.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Linhares2020NocaANotificati`) no Elicit Notebook correspondente à **Q01** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: População de docs/prime-directive/PON.md com citações verificadas; rebaixar [SOURCE_DERIVED]→[DESIGN_DECISION] onde a literatura não suportar.
- **Lacuna no PRIME_DIRECTIVE**: R1/P1: Literatura própria do PON (paradigma acadêmico brasileiro de sistemas reativos baseados em notificação)
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

