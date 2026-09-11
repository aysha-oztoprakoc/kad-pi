---
type: paper
title: "Metamorphic Testing"
paper: "[[Chen2018MetamorphicTest]]"
source: "https://doi.org/10.1145/3143561"
doi: "10.1145/3143561"
year: 2018
citations: 417
journal: "ACM Computing Surveys (CSUR)"
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

# Metamorphic Testing

## Identificação Epistêmica
- **Citekey**: `Chen2018MetamorphicTest`
- **Autores**: T. Chen, Fei-Ching Kuo, Huai Liu, P. Poon, Dave Towey, T. H. Tse, Z. Zhou
- **Ano**: 2018 | **Citações**: 417 | **Veículo**: ACM Computing Surveys (CSUR)
- **DOI**: [10.1145/3143561](https://doi.org/10.1145/3143561)
- **Questão Vinculada**: [[Q06]] — Formal properties test suites can establish: test oracle theory, mutation adequacy, metamorphic testing
- **Pilares Suportados**: P3
- **Ruído Mitigado**: R3

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Metamorphic testing is a promising approach for test case generation and result verification in software systems, with potential for further improvement and integration with other software engineering techniques.

### Abstract
Metamorphic testing is an approach to both test case generation and test result verification. A central element is a set of metamorphic relations, which are necessary properties of the target function or algorithm in relation to multiple inputs and their expected outputs. Since its first publication, we have witnessed a rapidly increasing body of work examining metamorphic testing from various perspectives, including metamorphic relation identification, test case generation, integration with other software engineering techniques, and the validation and evaluation of software systems. In this article, we review the current research of metamorphic testing and discuss the challenges yet to be addressed. We also present visions for further improvement of metamorphic testing and highlight opportunities for new research.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Chen2018MetamorphicTest`) no Elicit Notebook correspondente à **Q06** e exporte o CSV para ingestão.

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

