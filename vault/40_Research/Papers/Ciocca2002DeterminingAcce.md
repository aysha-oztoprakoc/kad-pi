---
type: paper
title: "Determining Acceptance Tests for Application-Level Fault Detection"
paper: "[[Ciocca2002DeterminingAcce]]"
source: "https://consensus.app/papers/determining-acceptance-tests-for-applicationlevel-fault-ciocca-koren/e507b4bcea40575cac4afcce4e0d50b1/"
doi: ""
year: 2002
citations: 3
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

# Determining Acceptance Tests for Application-Level Fault Detection

## Identificação Epistêmica
- **Citekey**: `Ciocca2002DeterminingAcce`
- **Autores**: E. Ciocca, I. Koren, C. M. Krishna
- **Ano**: 2002 | **Citações**: 3 | **Veículo**: 
- **DOI**: [N/A](https://doi.org/)
- **Questão Vinculada**: [[Q08]] — Recovery blocks and runtime acceptance tests providing fault tolerance through retry with verification
- **Pilares Suportados**: P4, P3
- **Ruído Mitigado**: R4

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Application-level fault detection can save significant error penalties, but the end user must balance error bounds and runtime with a balance among acceptance tests for optimal fault detection and low overhead.

### Abstract
| Faults are often diÆcult to detect, especially when the detection algorithm does not understand the semantic context of the faulty data. By allowing the application itself to take on the responsibility of detecting faults, signi cant savings can be made in incurred error penalty. However, such an approach to fault detection is inherently bound to be inaccurate sometimes. Inaccuracies may be the result of either faulty elements which were not detected, or nonfaulty elements which were wrongly considered to be faulty. The end user must consider not only the error penalty of missed faults, but also the extra runtime which may come with a false alarm. Our approach to software level fault tolerance allows for levels of customization within each acceptance test. As such, the correct con guration of these error bounds is a matter left to the end user. The end user must also determine a balance among the acceptance tests, such that the serialization of multiple tests results in not only the best fault detection, but also a low overhead. We demonstrate these principles as applied to NASA's Orbital Thermal Imaging Spectrometer (OTIS) application.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Ciocca2002DeterminingAcce`) no Elicit Notebook correspondente à **Q08** e exporte o CSV para ingestão.

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

