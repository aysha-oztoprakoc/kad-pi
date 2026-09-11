---
type: paper
title: "AIP: Agent Identity Protocol for Verifiable Delegation Across MCP and A2A"
paper: "[[Prakash2026AipAgentIdentit]]"
source: "https://doi.org/10.48550/arxiv.2603.24775"
doi: "10.48550/arxiv.2603.24775"
year: 2026
citations: 6
journal: "ArXiv"
study_type: "other"
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

# AIP: Agent Identity Protocol for Verifiable Delegation Across MCP and A2A

## Identificação Epistêmica
- **Citekey**: `Prakash2026AipAgentIdentit`
- **Autores**: S. Prakash
- **Ano**: 2026 | **Citações**: 6 | **Veículo**: ArXiv
- **DOI**: [10.48550/arxiv.2603.24775](https://doi.org/10.48550/arxiv.2603.24775)
- **Questão Vinculada**: [[Q13]] — Formal logics modeling delegation and authority attenuation in distributed and multi-agent systems
- **Pilares Suportados**: P6, P8
- **Ruído Mitigado**: R9

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: The AIP protocol provides a secure and efficient method for verifying agent identity across MCP and A2A protocols, with minimal overhead and 100% rejection rate of attack attempts.

### Abstract
AI agents increasingly call tools via the Model Context Protocol (MCP) and delegate to other agents via Agent-to-Agent (A2A), yet neither protocol verifies agent identity. A scan of approximately 2,000 MCP servers found all lacked authentication. In our survey, we did not identify a prior implemented protocol that jointly combines public-key verifiable delegation, holder-side attenuation, expressive chained policy, transport bindings across MCP/A2A/HTTP, and provenance-oriented completion records. We introduce Invocation-Bound Capability Tokens (IBCTs), a primitive that fuses identity, attenuated authorization, and provenance binding into a single append-only token chain. IBCTs operate in two wire formats: compact mode (a signed JWT for single-hop cases) and chained mode (a Biscuit token with Datalog policies for multi-hop delegation). We provide reference implementations in Python and Rust with full cross-language interoperability. Compact mode verification takes 0.049ms (Rust) and 0.189ms (Python), with 0.22ms overhead over no-auth in real MCP-over-HTTP deployment. In a real multi-agent deployment with Gemini 2.5 Flash, AIP adds 2.35ms of overhead (0.086% of total end-to-end latency). Adversarial evaluation across 600 attack attempts shows 100% rejection rate, with two attack categories (delegation depth violation and audit evasion through empty context) uniquely caught by AIP's chained delegation model that neither unsigned nor plain JWT deployments detect.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Prakash2026AipAgentIdentit`) no Elicit Notebook correspondente à **Q13** e exporte o CSV para ingestão.

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

