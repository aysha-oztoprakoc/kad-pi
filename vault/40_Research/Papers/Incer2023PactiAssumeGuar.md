---
type: paper
title: "Pacti: Assume-Guarantee Contracts for Efficient Compositional Analysis and Design"
paper: "[[Incer2023PactiAssumeGuar]]"
source: "https://doi.org/10.1145/3704736"
doi: "10.1145/3704736"
year: 2023
citations: 22
journal: "ACM Transactions on Cyber-Physical Systems"
study_type: "other"
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

# Pacti: Assume-Guarantee Contracts for Efficient Compositional Analysis and Design

## Identificação Epistêmica
- **Citekey**: `Incer2023PactiAssumeGuar`
- **Autores**: Inigo Incer, Apurva Badithela, Josefine B. Graebener, Piergiuseppe Mallozzi, Ayush Pandey, Nicolas Rouquette, Sheng-Jung Yu, A. Benveniste, B. Caillaud, R. Murray, A. Sangiovanni-Vincentelli, S. Seshia
- **Ano**: 2023 | **Citações**: 22 | **Veículo**: ACM Transactions on Cyber-Physical Systems
- **DOI**: [10.1145/3704736](https://doi.org/10.1145/3704736)
- **Questão Vinculada**: [[Q03]] — Assume–guarantee (compositional) reasoning to verify component contracts in reactive systems
- **Pilares Suportados**: P2, P1, P3
- **Ruído Mitigado**: R2, R3

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Pacti is a tool that efficiently computes algebraic operations in contract-based design, enabling modular system design in various case studies.

### Abstract
Contract-based design is a method to facilitate modular design of systems. While there has been substantial progress on the theory of contracts, there has been less progress on practical algorithms for the algebraic operations in the theory. In this article, we present (1) principles to implement a contract-based design tool at scale and (2) Pacti, a tool that can efficiently compute these operations. We illustrate the use of Pacti in a variety of case studies.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Incer2023PactiAssumeGuar`) no Elicit Notebook correspondente à **Q03** e exporte o CSV para ingestão.

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

