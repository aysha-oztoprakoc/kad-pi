---
type: paper
title: "Metamorphic Testing and Testing with Special Values"
paper: "[[Chen2024MetamorphicTest]]"
source: "https://doi.org/10.25916/sut.26291794"
doi: "10.25916/sut.26291794"
year: 2024
citations: 63
journal: ""
study_type: "theoretical, modeling, or simulation study"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P3
questions:
  - Q06
noises:
  - R3
tags:
  - research
  - paper
  - pilar/P3
  - noise/R3
---

# Metamorphic Testing and Testing with Special Values

## Identificação Epistêmica
- **Citekey**: `Chen2024MetamorphicTest`
- **Autores**: T. Chen, Fei-Ching Kuo, Y. Liu, A. Tang
- **Ano**: 2024 | **Citações**: 63 | **Veículo**: 
- **DOI**: [10.25916/sut.26291794](https://doi.org/10.25916/sut.26291794)
- **Questão Vinculada**: [[Q06]] — Formal properties test suites can establish: test oracle theory, mutation adequacy, metamorphic testing
- **Pilares Suportados**: P3
- **Ruído Mitigado**: R3

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Metamorphic testing can effectively uncover faults in programs that special value testing cannot detect, making it a complementary method for ensuring correctness.

### Abstract
The problem of testing programs without test oracles is well known. A commonly used approach is to use special values in testing but this is often insufficient to ensure program correctness. This paper demonstrates the use of metamorphic testing to uncover faults in programs, which could not be detected by special test values. Metamorphic testing can be used as a complementary test method to special value testing. In this paper, the sine function and a search function are used as examples to demonstrate the usefulness of metamorphic testing. This paper also examines metamorphic relationships and the extent of their usefulness in program testing.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Chen2024MetamorphicTest`) no Elicit Notebook correspondente à **Q06** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Vocabulário de alegações verificáveis para critérios de aceite (substituir "grep zero identificadores" por equivalência observável).
- **Lacuna no PRIME_DIRECTIVE**: R3/P3: "Testes provam comportamento semântico" exige teoria de oráculo e adequação
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

