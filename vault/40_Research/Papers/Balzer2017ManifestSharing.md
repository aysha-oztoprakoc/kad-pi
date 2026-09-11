---
kad_id: kad-71885c04bad5613069eec2b9
type: paper
title: "Manifest sharing with session types"
paper: "[[Balzer2017ManifestSharing]]"
source: "https://doi.org/10.1145/3110281"
doi: "10.1145/3110281"
year: 2017
citations: 82
journal: "Proceedings of the ACM on Programming Languages"
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

# Manifest sharing with session types

## Identificação Epistêmica
- **Citekey**: `Balzer2017ManifestSharing`
- **Autores**: Stephanie Balzer, F. Pfenning
- **Ano**: 2017 | **Citações**: 82 | **Veículo**: Proceedings of the ACM on Programming Languages
- **DOI**: [10.1145/3110281](https://doi.org/10.1145/3110281)
- **Questão Vinculada**: [[Q04]] — Behavioral type systems and session types for component interaction and lifecycle protocols
- **Pilares Suportados**: P2
- **Ruído Mitigado**: R2

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: This paper introduces sharing into a session-typed language, retaining session fidelity but not deadlock freedom, enabling natural programming patterns with shared resources.

### Abstract
Session-typed languages building on the Curry-Howard isomorphism between linear logic and session-typed communication guarantee session fidelity and deadlock freedom. Unfortunately, these strong guarantees exclude many naturally occurring programming patterns pertaining to shared resources. In this paper, we introduce sharing into a session-typed language where types are stratified into linear and shared layers with modal operators connecting the layers. The resulting language retains session fidelity but not the absence of deadlocks, which can arise from contention for shared processes. We illustrate our language on various examples, such as the dining philosophers problem, and provide a translation of the untyped asynchronous π-calculus into our language.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Balzer2017ManifestSharing`) no Elicit Notebook correspondente à **Q04** e exporte o CSV para ingestão.

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

