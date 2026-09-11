---
kad_id: kad-cb5f8f1732a46718bf74e698
type: paper
title: "General Belief Revision"
paper: "[[Delgrande2018GeneralBeliefRe]]"
source: "https://doi.org/10.1145/3203409"
doi: "10.1145/3203409"
year: 2018
citations: 25
journal: "Journal of the ACM (JACM)"
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

# General Belief Revision

## Identificação Epistêmica
- **Citekey**: `Delgrande2018GeneralBeliefRe`
- **Autores**: J. Delgrande, P. Peppas, S. Woltran
- **Ano**: 2018 | **Citações**: 25 | **Veículo**: Journal of the ACM (JACM)
- **DOI**: [10.1145/3203409](https://doi.org/10.1145/3203409)
- **Questão Vinculada**: [[Q10]] — Belief revision and truth maintenance systems handling contradictions while preserving consistency and relevance
- **Pilares Suportados**: P5
- **Ruído Mitigado**: R6

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: The AGM approach to belief revision can be extended to minimally assuming a language with sentences satisfied at models, or possible worlds, enabling belief revision in AI systems without classical propositional logic.

### Abstract
In artificial intelligence, a key question concerns how an agent may rationally revise its beliefs in light of new information. The standard (AGM) approach to belief revision assumes that the underlying logic contains classical propositional logic. This is a significant limitation, since many representation schemes in AI don’t subsume propositional logic. In this article, we consider the question of what the minimal requirements are on a logic, such that the AGM approach to revision may be formulated. We show that AGM-style revision can be obtained even when extremely little is assumed of the underlying language and its semantics; in fact, one requires little more than a language with sentences that are satisfied at models, or possible worlds. The classical AGM postulates are expressed in this framework and a representation result is established between the postulate set and certain preorders on possible worlds. To obtain the representation result, we add a new postulate to the AGM postulates, and we add a constraint to preorders on worlds. Crucially, both of these additions are redundant in the original AGM framework, and so we extend, rather than modify, the AGM approach. As well, iterated revision is addressed and the Darwiche/Pearl postulates are shown to be compatible with our approach. Various examples are given to illustrate the approach, including Horn clause revision, revision in extended logic programs, and belief revision in a very basic logic called literal revision.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Delgrande2018GeneralBeliefRe`) no Elicit Notebook correspondente à **Q10** e exporte o CSV para ingestão.

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

