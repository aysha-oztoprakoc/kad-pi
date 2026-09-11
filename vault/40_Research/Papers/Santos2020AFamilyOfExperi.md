---
kad_id: kad-caa4ae6cff34733ecfda4e34
type: paper
title: "A family of experiments on test-driven development"
paper: "[[Santos2020AFamilyOfExperi]]"
source: "https://doi.org/10.1007/s10664-020-09895-8"
doi: "10.1007/s10664-020-09895-8"
year: 2020
citations: 31
journal: "Empirical Software Engineering"
study_type: "meta-analysis"
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

# A family of experiments on test-driven development

## Identificação Epistêmica
- **Citekey**: `Santos2020AFamilyOfExperi`
- **Autores**: Adrián Santos, S. Vegas, Ó. Dieste, F. Uyaguari, A. Tosun, D. Fucci, Burak Turhan, G. Scanniello, Simone Romano, I. Karac, M. Kuhrmann, Vladimir Mandic, R. Ramač, Dietmar Pfahl, Christian Engblom, Jarno Kyykka, Kerli Rungi, C. Palomeque, J. Spisak, M. Oivo, N. Juristo
- **Ano**: 2020 | **Citações**: 31 | **Veículo**: Empirical Software Engineering
- **DOI**: [10.1007/s10664-020-09895-8](https://doi.org/10.1007/s10664-020-09895-8)
- **Questão Vinculada**: [[Q05]] — Empirical evidence for test-driven development impact on defect density, code quality, and productivity
- **Pilares Suportados**: P3
- **Ruído Mitigado**: R3

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: TDD improves software quality, but its effectiveness varies depending on the task, programming environment, and experiment characteristics.

### Abstract
Test-driven development (TDD) is an agile software development approach that has been widely claimed to improve software quality. However, the extent to which TDD improves quality appears to be largely dependent upon the characteristics of the study in which it is evaluated (e.g., the research method, participant type, programming environment, etc.). The particularities of each study make the aggregation of results untenable. The goal of this paper is to: increase the accuracy and generalizability of the results achieved in isolated experiments on TDD, provide joint conclusions on the performance of TDD across different industrial and academic settings, and assess the extent to which the characteristics of the experiments affect the quality-related performance of TDD. We conduct a family of 12 experiments on TDD in academia and industry. We aggregate their results by means of meta-analysis. We perform exploratory analyses to identify variables impacting the quality-related performance of TDD. TDD novices achieve a slightly higher code quality with iterative test-last development (i.e., ITL, the reverse approach of TDD) than with TDD. The task being developed largely determines quality. The programming environment, the order in which TDD and ITL are applied, or the learning effects from one development approach to another do not appear to affect quality. The quality-related performance of professionals using TDD drops more than for students. We hypothesize that this may be due to their being more resistant to change and potentially less motivated than students. Previous studies seem to provide conflicting results on TDD performance (i.e., positive vs. negative, respectively). We hypothesize that these conflicting results may be due to different study durations, experiment participants being unfamiliar with the TDD process, or case studies comparing the performance achieved by TDD vs. the control approach (e.g., the waterfall model), each applied to develop a different system. Further experiments with TDD experts are needed to validate these hypotheses.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Santos2020AFamilyOfExperi`) no Elicit Notebook correspondente à **Q05** e exporte o CSV para ingestão.

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

