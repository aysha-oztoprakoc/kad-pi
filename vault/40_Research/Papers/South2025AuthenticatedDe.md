---
type: paper
title: "Authenticated Delegation and Authorized AI Agents"
paper: "[[South2025AuthenticatedDe]]"
source: "https://doi.org/10.48550/arxiv.2501.09674"
doi: "10.48550/arxiv.2501.09674"
year: 2025
citations: 66
journal: "ArXiv"
study_type: "theoretical, modeling, or simulation study"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P6
  - P8
questions:
  - Q13
noises:
  - R9
tags:
  - research
  - paper
  - pilar/P6
  - pilar/P8
  - noise/R9
---

# Authenticated Delegation and Authorized AI Agents

## Identificação Epistêmica
- **Citekey**: `South2025AuthenticatedDe`
- **Autores**: Tobin South, Samuele G. Marro, T. Hardjono, Robert Mahari, C. Whitney, Dazza Greenwood, Alan Chan, A. Pentland
- **Ano**: 2025 | **Citações**: 66 | **Veículo**: ArXiv
- **DOI**: [10.48550/arxiv.2501.09674](https://doi.org/10.48550/arxiv.2501.09674)
- **Questão Vinculada**: [[Q13]] — Formal logics modeling delegation and authority attenuation in distributed and multi-agent systems
- **Pilares Suportados**: P6, P8
- **Ruído Mitigado**: R9

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: This paper presents a novel framework for authenticated, authorized, and auditable delegation of authority to AI agents, enabling secure and accountable deployment while addressing security and accountability concerns.

### Abstract
The rapid deployment of autonomous AI agents creates urgent challenges around authorization, accountability, and access control in digital spaces. New standards are needed to know whom AI agents act on behalf of and guide their use appropriately, protecting online spaces while unlocking the value of task delegation to autonomous agents. We introduce a novel framework for authenticated, authorized, and auditable delegation of authority to AI agents, where human users can securely delegate and restrict the permissions and scope of agents while maintaining clear chains of accountability. This framework builds on existing identification and access management protocols, extending OAuth 2.0 and OpenID Connect with agent-specific credentials and metadata, maintaining compatibility with established authentication and web infrastructure. Further, we propose a framework for translating flexible, natural language permissions into auditable access control configurations, enabling robust scoping of AI agent capabilities across diverse interaction modalities. Taken together, this practical approach facilitates immediate deployment of AI agents while addressing key security and accountability concerns, working toward ensuring agentic AI systems perform only appropriate actions and providing a tool for digital service providers to enable AI agent interactions without risking harm from scalable interaction.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`South2025AuthenticatedDe`) no Elicit Notebook correspondente à **Q13** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Semântica para leases STC em subárvores RLM — verificação estática de escopo herdado.
- **Lacuna no PRIME_DIRECTIVE**: R9/P6+P8: Atenuação de autoridade na descida da recursão de subagentes (leases STC "advisory")
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

