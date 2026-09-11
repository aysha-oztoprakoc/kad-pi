---
type: paper
title: "Reduction of Unnecessarily Ordered Event Messages in Peer-to-Peer Model of Topic-Based Publish/Subscribe Systems"
paper: "[[Nakayama2016ReductionOfUnne]]"
source: "https://doi.org/10.1109/aina.2016.152"
doi: "10.1109/aina.2016.152"
year: 2016
citations: 30
journal: "2016 IEEE 30th International Conference on Advanced Information Networking and Applications (AINA)"
study_type: "theoretical, modeling, or simulation study"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P1
  - P2
questions:
  - Q02
noises:
  - R2
tags:
  - research
  - paper
  - pilar/P1
  - pilar/P2
  - noise/R2
---

# Reduction of Unnecessarily Ordered Event Messages in Peer-to-Peer Model of Topic-Based Publish/Subscribe Systems

## Identificação Epistêmica
- **Citekey**: `Nakayama2016ReductionOfUnne`
- **Autores**: Hiroki Nakayama, Dilawaer Duolikun, T. Enokido, M. Takizawa
- **Ano**: 2016 | **Citações**: 30 | **Veículo**: 2016 IEEE 30th International Conference on Advanced Information Networking and Applications (AINA)
- **DOI**: [10.1109/aina.2016.152](https://doi.org/10.1109/aina.2016.152)
- **Questão Vinculada**: [[Q02]] — Formal semantic frameworks for event-driven reactive systems with asynchronous notifications
- **Pilares Suportados**: P1, P2
- **Ruído Mitigado**: R2

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: The TBC protocol reduces the number of unnecessarily ordered messages in peer-to-peer topic-based publish/subscribe systems by using linear and physical clocks with topic vectors.

### Abstract
A distributed system is considered in an event-driven model where a state of a process transits on occurrence of an event. In this paper, we discuss a peer-to-peer topic-based publish/subscribe (P2PPS) model where each peer process (peer) can both subscribe and publish event messages. The subscriptions and publications are specified in terms of topics. Each event message e carries a vector e:TV = (tv1, , tvh) of topics t1, , th in a system. An event message e1 causally precedes an event message e2 with respect to a topic subset T iff not only e1 causally precedes e2 but also e1.tvj ≤ e2.tvj for every topic tj in an intersection T of the publications of e1 and e2 and the subscription Si of pi. A pair of event messages e1 and e2 are unnecessarily ordered if e1.TV ≤ e2.TV but e1 does not causally precede e2. In this paper, we newly propose a topic-based-causally delivering (TBC) protocol where the linear clock and physical clock are used with topic vectors to reduce the number of pairs of messages unnecessarily ordered. We evaluate the TBC protocol and show the number of pairs of unnecessarily ordered messages is reduced.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Nakayama2016ReductionOfUnne`) no Elicit Notebook correspondente à **Q02** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Escolher um formalismo (LTS/traces/observação) para o loop canônico de execução e para testes de notification selectivity.
- **Lacuna no PRIME_DIRECTIVE**: R2/P1: Semântica operacional (sistemas síncronos, cálculo de processos, atores) para o loop reativo
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

