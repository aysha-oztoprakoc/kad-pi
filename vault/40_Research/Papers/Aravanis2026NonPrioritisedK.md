---
type: paper
title: "Non-prioritised kernel contraction"
paper: "[[Aravanis2026NonPrioritisedK]]"
source: "https://doi.org/10.1080/11663081.2025.2611670"
doi: "10.1080/11663081.2025.2611670"
year: 2026
citations: 2
journal: "Journal of Applied Non-Classical Logics"
study_type: "theoretical, modeling, or simulation study"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P5
questions:
  - Q10
noises:
  - R6
tags:
  - research
  - paper
  - pilar/P5
  - noise/R6
---

# Non-prioritised kernel contraction

## Identificação Epistêmica
- **Citekey**: `Aravanis2026NonPrioritisedK`
- **Autores**: Theofanis I. Aravanis
- **Ano**: 2026 | **Citações**: 2 | **Veículo**: Journal of Applied Non-Classical Logics
- **DOI**: [10.1080/11663081.2025.2611670](https://doi.org/10.1080/11663081.2025.2611670)
- **Questão Vinculada**: [[Q10]] — Belief revision and truth maintenance systems handling contradictions while preserving consistency and relevance
- **Pilares Suportados**: P5
- **Ruído Mitigado**: R6

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: Non-prioritized kernel contraction allows for adjusting beliefs' firmness, offering greater flexibility in belief change and mitigating inconsistencies within belief bases.

### Abstract
Hansson's kernel contraction is a fundamental operation for contracting information from belief bases, which adheres to the Success postulate, ensuring that all non-tautological beliefs are retractable. In this article, we propose a non-prioritised, weakened variant of kernel contraction. To formalise this operation, we introduce the degree of firmness of arbitrary sentences within a belief base (a measure of epistemic entrenchment), drawing from well-established measures of inconsistency. Instead of necessarily withdrawing beliefs, non-prioritised kernel contraction allows for adjusting their degree of firmness, thereby violating the (controversial) Success postulate, while offering greater flexibility in belief change. As we demonstrate, non-prioritised kernel contraction is also perfectly suitable for mitigating inconsistency within belief bases. This new contraction method is constructed using a special type of incision function that determines which sentences are subject to retraction, and is axiomatically characterised by a relaxation of Hansson's original postulates. Finally, we introduce a refined form of classical kernel contraction designed to mitigate inconsistencies within belief bases.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Aravanis2026NonPrioritisedK`) no Elicit Notebook correspondente à **Q10** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Fundamentar WP-KAD-CONTRADICTION-JOURNAL-040 e máquina de estados do WP-KAD-KNOWLEDGE-LIFECYCLE-034.
- **Lacuna no PRIME_DIRECTIVE**: R6/P5: Contração AGM como remoção minimamente perdedora; TMS/ATMS para rótulos CANDIDATE/VERIFIED/CONTESTED
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

