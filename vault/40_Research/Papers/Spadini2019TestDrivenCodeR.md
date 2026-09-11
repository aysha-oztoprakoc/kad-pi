---
type: paper
title: "Test-Driven Code Review: An Empirical Study"
paper: "[[Spadini2019TestDrivenCodeR]]"
source: "https://doi.org/10.1109/icse.2019.00110"
doi: "10.1109/icse.2019.00110"
year: 2019
citations: 35
journal: "2019 IEEE/ACM 41st International Conference on Software Engineering (ICSE)"
study_type: "other"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P3
questions:
  - Q05
noises:
  - R3
tags:
  - research
  - paper
  - pilar/P3
  - noise/R3
---

# Test-Driven Code Review: An Empirical Study

## Identificação Epistêmica
- **Citekey**: `Spadini2019TestDrivenCodeR`
- **Autores**: D. Spadini, Fabio Palomba, T. Baum, Stefan Hanenberg, M. Bruntink, Alberto Bacchelli
- **Ano**: 2019 | **Citações**: 35 | **Veículo**: 2019 IEEE/ACM 41st International Conference on Software Engineering (ICSE)
- **DOI**: [10.1109/icse.2019.00110](https://doi.org/10.1109/icse.2019.00110)
- **Questão Vinculada**: [[Q05]] — Empirical evidence for test-driven development impact on defect density, code quality, and productivity
- **Pilares Suportados**: P3
- **Ruído Mitigado**: R3

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Test-Driven Code Review (TDR) finds the same proportion of defects in production code but more in test code, with fewer maintainability issues in production code, but poor test code quality and no tool support hinder its adoption.

### Abstract
Test-Driven Code Review (TDR) is a code review practice in which a reviewer inspects a patch by examining the changed test code before the changed production code. Although this practice has been mentioned positively by practitioners in informal literature and interviews, there is no systematic knowledge of its effects, prevalence, problems, and advantages. In this paper, we aim at empirically understanding whether this practice has an effect on code review effectiveness and how developers' perceive TDR. We conduct (i) a controlled experiment with 93 developers that perform more than 150 reviews, and (ii) 9 semi-structured interviews and a survey with 103 respondents to gather information on how TDR is perceived. Key results from the experiment show that developers adopting TDR find the same proportion of defects in production code, but more in test code, at the expenses of fewer maintainability issues in production code. Furthermore, we found that most developers prefer to review production code as they deem it more critical and tests should follow from it. Moreover, general poor test code quality and no tool support hinder the adoption of TDR. Public preprint: https://doi.org/10.5281/zenodo.2551217, data and materials: https://doi.org/10.5281/zenodo.2553139

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Spadini2019TestDrivenCodeR`) no Elicit Notebook correspondente à **Q05** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Calibrar o gate de TDD; buscar contra-evidência deliberadamente conforme rigor científico da constituição.
- **Lacuna no PRIME_DIRECTIVE**: R3/P3: O loop RED→GREEN→REFACTOR como [DESIGN_DECISION]; evidência empírica calibrada
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

