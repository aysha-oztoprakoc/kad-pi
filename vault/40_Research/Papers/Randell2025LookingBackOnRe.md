---
type: paper
title: "Looking Back on Recovery Blocks and Conversations"
paper: "[[Randell2025LookingBackOnRe]]"
source: "https://doi.org/10.1109/tse.2025.3533973"
doi: "10.1109/tse.2025.3533973"
year: 2025
citations: 0
journal: "IEEE Transactions on Software Engineering"
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

# Looking Back on Recovery Blocks and Conversations

## Identificação Epistêmica
- **Citekey**: `Randell2025LookingBackOnRe`
- **Autores**: Brian Randell, Jie Xu
- **Ano**: 2025 | **Citações**: 0 | **Veículo**: IEEE Transactions on Software Engineering
- **DOI**: [10.1109/tse.2025.3533973](https://doi.org/10.1109/tse.2025.3533973)
- **Questão Vinculada**: [[Q08]] — Recovery blocks and runtime acceptance tests providing fault tolerance through retry with verification
- **Pilares Suportados**: P4, P3
- **Ruído Mitigado**: R4

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Recovery Blocks and Conversations are effective error recovery strategies for isolated processes and interacting processes, respectively, in software fault tolerance.

### Abstract
Our 1975 paper “System Structure for Software Fault Tolerance” introduced “Recovery Blocks” (a backward error recovery strategy for use in isolated processes), the “Domino Effect” (the problem that a single error could cause multiple interacting processes with uncoordinated error recovery strategies to lose all their recovery capability) and “Conversations” (an error recovery strategy for interacting processes motivated by the danger of the domino effect). This retrospective account describes how these ideas were developed by the Newcastle group and its collaborators, and what further research ensued. A tentative assessment is then provided of the impact of this research.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Randell2025LookingBackOnRe`) no Elicit Notebook correspondente à **Q08** e exporte o CSV para ingestão.

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

