---
kad_id: kad-93a104f42fde9c80e64f647a
type: paper
title: "Assume-guarantee contracts for continuous-time systems"
paper: "[[Saoud2021AssumeGuarantee]]"
source: "https://doi.org/10.1016/j.automatica.2021.109910"
doi: "10.1016/j.automatica.2021.109910"
year: 2021
citations: 46
journal: "Autom."
study_type: "theoretical, modeling, or simulation study"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P2
  - P1
  - P3
questions:
  - Q03
noises:
  - R2
  - R3
tags:
  - research
  - paper
  - pilar/P2
  - pilar/P1
  - pilar/P3
  - noise/R2
  - noise/R3
---

# Assume-guarantee contracts for continuous-time systems

## Identificação Epistêmica
- **Citekey**: `Saoud2021AssumeGuarantee`
- **Autores**: Adnane Saoud, A. Girard, L. Fribourg
- **Ano**: 2021 | **Citações**: 46 | **Veículo**: Autom.
- **DOI**: [10.1016/j.automatica.2021.109910](https://doi.org/10.1016/j.automatica.2021.109910)
- **Questão Vinculada**: [[Q03]] — Assume–guarantee (compositional) reasoning to verify component contracts in reactive systems
- **Pilares Suportados**: P2, P1, P3
- **Ruído Mitigado**: R2, R3

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Assume-guarantee contracts and compositional reasoning can effectively verify properties of continuous-time systems with interconnected components, recasting the small-gain theorem as a specific case.

### Abstract
Resumo não disponível.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Saoud2021AssumeGuarantee`) no Elicit Notebook correspondente à **Q03** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Semântica de contrato para leases STC e para MUST NOT conflate (regra de tipagem das duas relações).
- **Lacuna no PRIME_DIRECTIVE**: R2–R3/P2: Ordenação de dependências e efeitos com inverso; separação de fluxo de dados vs fluxo de autorização
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

