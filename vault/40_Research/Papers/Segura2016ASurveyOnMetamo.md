---
kad_id: kad-41975079f60597e21e106214
type: paper
title: "A Survey on Metamorphic Testing"
paper: "[[Segura2016ASurveyOnMetamo]]"
source: "https://doi.org/10.1109/tse.2016.2532875"
doi: "10.1109/tse.2016.2532875"
year: 2016
citations: 580
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

# A Survey on Metamorphic Testing

## Identificação Epistêmica
- **Citekey**: `Segura2016ASurveyOnMetamo`
- **Autores**: Sergio Segura, Gordon Fraser, A. B. Sánchez, Antonio Ruiz-Cortés
- **Ano**: 2016 | **Citações**: 580 | **Veículo**: IEEE Transactions on Software Engineering
- **DOI**: [10.1109/tse.2016.2532875](https://doi.org/10.1109/tse.2016.2532875)
- **Questão Vinculada**: [[Q06]] — Formal properties test suites can establish: test oracle theory, mutation adequacy, metamorphic testing
- **Pilares Suportados**: P3
- **Ruído Mitigado**: R3

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Metamorphic testing, a technique for determining correctness in complex programs, has been successfully applied to various domains, but faces challenges in capturing complex input-output relations.

### Abstract
A test oracle determines whether a test execution reveals a fault, often by comparing the observed program output to the expected output. This is not always practical, for example when a program's input-output relation is complex and difficult to capture formally. Metamorphic testing provides an alternative, where correctness is not determined by checking an individual concrete output, but by applying a transformation to a test input and observing how the program output “morphs” into a different one as a result. Since the introduction of such metamorphic relations in 1998, many contributions on metamorphic testing have been made, and the technique has seen successful applications in a variety of domains, ranging from web services to computer graphics. This article provides a comprehensive survey on metamorphic testing: It summarises the research results and application areas, and analyses common practice in empirical studies of metamorphic testing as well as the main open challenges.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Segura2016ASurveyOnMetamo`) no Elicit Notebook correspondente à **Q06** e exporte o CSV para ingestão.

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

