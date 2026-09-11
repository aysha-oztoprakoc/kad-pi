---
kad_id: kad-1d2f5ce94c5b7c65b37735f9
type: paper
title: "The Evolution of the Recovery Block Concept"
paper: "[[Randell1994TheEvolutionOfT]]"
source: "https://consensus.app/papers/the-evolution-of-the-recovery-block-concept-randell-xu/f647907c4f075c2ab76710ae5d160550/"
doi: ""
year: 1994
citations: 233
journal: ""
study_type: "other"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P4
  - P3
questions:
  - Q08
noises:
  - R4
tags:
  - research
  - paper
  - pilar/P4
  - pilar/P3
  - noise/R4
---

# The Evolution of the Recovery Block Concept

## Identificação Epistêmica
- **Citekey**: `Randell1994TheEvolutionOfT`
- **Autores**: B. Randell, Jie Xu
- **Ano**: 1994 | **Citações**: 233 | **Veículo**: 
- **DOI**: [N/A](https://doi.org/)
- **Questão Vinculada**: [[Q08]] — Recovery blocks and runtime acceptance tests providing fault tolerance through retry with verification
- **Pilares Suportados**: P4, P3
- **Ruído Mitigado**: R4

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: The recovery block approach to software fault tolerance has evolved from its early 1970s origins at Newcastle University to include extensions, concurrent systems, and linguistic support using object-oriented programming concepts.

### Abstract
This chapter reviews the development of the recovery block approach to software fault tolerance and subsequent work based on this approach. It starts with an account of the development and implementations of the basic recovery block scheme in the early 1970s at Newcastle, and then goes on to describe work at Newcastle and elsewhere on extensions to the basic scheme, recovery in concurrent systems, and linguistic support for recovery blocks based on the use of object-oriented programming concepts.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Randell1994TheEvolutionOfT`) no Elicit Notebook correspondente à **Q08** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Padrão arquitetural para "retry justificado" (§6: retry com oráculo parcial em modos degradados).
- **Lacuna no PRIME_DIRECTIVE**: R4/P4+P3: Validade de testes em estados de falha; oráculo condicional sob assunções preservadas
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

