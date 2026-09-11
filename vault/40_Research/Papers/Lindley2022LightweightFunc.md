---
type: paper
title: "Lightweight functional session types"
paper: "[[Lindley2022LightweightFunc]]"
source: "https://doi.org/10.1201/9781003337331-12"
doi: "10.1201/9781003337331-12"
year: 2022
citations: 50
journal: ""
study_type: "theoretical, modeling, or simulation study"
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

# Lightweight functional session types

## Identificação Epistêmica
- **Citekey**: `Lindley2022LightweightFunc`
- **Autores**: Sam Lindley, J. Garrett Morris
- **Ano**: 2022 | **Citações**: 50 | **Veículo**: 
- **DOI**: [10.1201/9781003337331-12](https://doi.org/10.1201/9781003337331-12)
- **Questão Vinculada**: [[Q04]] — Behavioral type systems and session types for component interaction and lifecycle protocols
- **Pilares Suportados**: P2
- **Ruído Mitigado**: R2

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: This paper introduces FST, a modular extension of GV, which preserves all desirable properties and supports polymorphism, row typing, and a subkinding system, while considering further extensions like recursion and access points.

### Abstract
Session types describe communication protocols, capturing both the type and the order of messages. Recently, we presented a semantics for a core session-typed linear λ-calculus, GV, and proved that it enjoys a number of desirable properties beyond type soundness, including deadlock freedom, determinism (and hence race freedom), and termination. In this paper, we modularly extend GV with practical features. We begin by introducing FST (System F with Session Types), an extension of GV, with features including polymorphism, row typing (to support extensible records, variants, and session types), and a subkinding system (to integrate linear and unlimited types). FST preserves all of GV’s desirable properties. We then consider further extensions of FST with recursion and recursive types, which preserve all of the properties save for termination. Finally, we consider an additional extension of FST with access points (a much more expressive mechanism for initiating communication among threads) in return for giving up deadlock freedom, determinism (and indeed race freedom), and termination. Building on the formal development, we discuss the design of Session Links, a session-typing extension of the Links web programming language and a full implementation of FST.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Lindley2022LightweightFunc`) no Elicit Notebook correspondente à **Q04** e exporte o CSV para ingestão.

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

