---
type: paper
title: "Behavioral Types in Programming Languages"
paper: "[[Ancona2016BehavioralTypes]]"
source: "https://doi.org/10.1561/2500000031"
doi: "10.1561/2500000031"
year: 2016
citations: 158
journal: "Found. Trends Program. Lang."
study_type: "literature review"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P2
questions:
  - Q04
noises:
  - R2
tags:
  - research
  - paper
  - pilar/P2
  - noise/R2
---

# Behavioral Types in Programming Languages

## Identificação Epistêmica
- **Citekey**: `Ancona2016BehavioralTypes`
- **Autores**: D. Ancona, V. Bono, M. Bravetti, Joana Campos, Giuseppe Castagna, Pierre-Malo Deniélou, S. Gay, N. Gesbert, Elena Giachino, Raymond Hu, E. Johnsen, F. Martins, V. Mascardi, F. Montesi, Rumyana Neykova, Nicholas Ng, L. Padovani, V. Vasconcelos, N. Yoshida
- **Ano**: 2016 | **Citações**: 158 | **Veículo**: Found. Trends Program. Lang.
- **DOI**: [10.1561/2500000031](https://doi.org/10.1561/2500000031)
- **Questão Vinculada**: [[Q04]] — Behavioral type systems and session types for component interaction and lifecycle protocols
- **Pilares Suportados**: P2
- **Ruído Mitigado**: R2

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Behavioral types in programming languages enhance correctness properties of large-scale systems by addressing practical aspects like representation, integration, and monitoring.

### Abstract
A recent trend in programming language research is to use behavioral type theory to ensure various correctness properties of large-scale, communication-intensive systems. Behavioral types encompass concepts such as interfaces, communication protocols, contracts, and choreography. The successful application of behavioral types requires a solid understanding of several practical aspects, from their representation in a concrete programming language, to their integration with other programming constructs such as methods and functions, to design and monitoring methodologies that take behaviors into account. Behavioral Types in Programming Languages provides the reader with the first comprehensive overview of the state of the art of these practical aspects, which are summarized as the pragmatics of behavioral types. Each section covers a particular programming paradigm or methodology, providing an ideal reference for programming languages researchers interested the topic, and in identifying the areas as yet unexplored.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Ancona2016BehavioralTypes`) no Elicit Notebook correspondente à **Q04** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Especificação tipo-comportamental dos seams de ativação/desativação (base para WP-KAD-STC-SANDBOX-HARDENING-033).
- **Lacuna no PRIME_DIRECTIVE**: R2/P2: Ordenação estática de ativação/desativação ("dependentes antes de dependências")
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

