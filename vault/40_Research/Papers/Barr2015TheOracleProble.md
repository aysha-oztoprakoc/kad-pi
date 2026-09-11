---
type: paper
title: "The Oracle Problem in Software Testing: A Survey"
paper: "[[Barr2015TheOracleProble]]"
source: "https://doi.org/10.1109/tse.2014.2372785"
doi: "10.1109/tse.2014.2372785"
year: 2015
citations: 1171
journal: "IEEE Transactions on Software Engineering"
study_type: ""
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

# The Oracle Problem in Software Testing: A Survey

## Identificação Epistêmica
- **Citekey**: `Barr2015TheOracleProble`
- **Autores**: Earl T. Barr, M. Harman, Phil McMinn, Muzammil Shahbaz, S. Yoo
- **Ano**: 2015 | **Citações**: 1171 | **Veículo**: IEEE Transactions on Software Engineering
- **DOI**: [10.1109/tse.2014.2372785](https://doi.org/10.1109/tse.2014.2372785)
- **Questão Vinculada**: [[Q06]] — Formal properties test suites can establish: test oracle theory, mutation adequacy, metamorphic testing
- **Pilares Suportados**: P3
- **Ruído Mitigado**: R3

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Test oracle automation can help distinguish correct behavior from potentially incorrect behavior in software testing, reducing costs and increasing benefits.

### Abstract
Testing involves examining the behaviour of a system in order to discover potential faults. Given an input for a system, the challenge of distinguishing the corresponding desired, correct behaviour from potentially incorrect behavior is called the “test oracle problem”. Test oracle automation is important to remove a current bottleneck that inhibits greater overall test automation. Without test oracle automation, the human has to determine whether observed behaviour is correct. The literature on test oracles has introduced techniques for oracle automation, including modelling, specifications, contract-driven development and metamorphic testing. When none of these is completely adequate, the final source of test oracle information remains the human, who may be aware of informal specifications, expectations, norms and domain specific information that provide informal oracle guidance. All forms of test oracles, even the humble human, involve challenges of reducing cost and increasing benefit. This paper provides a comprehensive survey of current approaches to the test oracle problem and an analysis of trends in this important area of software testing research and practice.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Barr2015TheOracleProble`) no Elicit Notebook correspondente à **Q06** e exporte o CSV para ingestão.

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

