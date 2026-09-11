---
kad_id: kad-1deb41aaa1eaf7215e00ac77
type: paper
title: "Metamorphic Testing: A New Approach for Generating Next Test Cases"
paper: "[[Cheung2020MetamorphicTest]]"
source: "https://doi.org/10.48550/arxiv.2002.12543"
doi: "10.48550/arxiv.2002.12543"
year: 2020
citations: 693
journal: "ArXiv"
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

# Metamorphic Testing: A New Approach for Generating Next Test Cases

## Identificação Epistêmica
- **Citekey**: `Cheung2020MetamorphicTest`
- **Autores**: S. Cheung, S. Yiu
- **Ano**: 2020 | **Citações**: 693 | **Veículo**: ArXiv
- **DOI**: [10.48550/arxiv.2002.12543](https://doi.org/10.48550/arxiv.2002.12543)
- **Questão Vinculada**: [[Q06]] — Formal properties test suites can establish: test oracle theory, mutation adequacy, metamorphic testing
- **Pilares Suportados**: P3
- **Ruído Mitigado**: R3

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Metamorphic testing reveals undetected software errors in successful test cases, enhancing the effectiveness of existing test selection strategies and helping uncover errors in the production phase without test oracles.

### Abstract
In software testing, a set of test cases is constructed according to some predefined selection criteria. The software is then examined against these test cases. Three interesting observations have been made on the current artifacts of software testing. Firstly, an error-revealing test case is considered useful while a successful test case which does not reveal software errors is usually not further investigated. Whether these successful test cases still contain useful information for revealing software errors has not been properly studied. Secondly, no matter how extensive the testing has been conducted in the development phase, errors may still exist in the software [5]. These errors, if left undetected, may eventually cause damage to the production system. The study of techniques for uncovering software errors in the production phase is seldom addressed in the literature. Thirdly, as indicated by Weyuker in [6], the availability of test oracles is pragmatically unattainable in most situations. However, the availability of test oracles is generally assumed in conventional software testing techniques. In this paper, we propose a novel test case selection technique that derives new test cases from the successful ones. The selection aims at revealing software errors that are possibly left undetected in successful test cases which may be generated using some existing strategies. As such, the proposed technique augments the effectiveness of existing test selection strategies. The technique also helps uncover software errors in the production phase and can be used in the absence of test oracles.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Cheung2020MetamorphicTest`) no Elicit Notebook correspondente à **Q06** e exporte o CSV para ingestão.

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

