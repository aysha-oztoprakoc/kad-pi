---
kad_id: kad-3512b39b72cd87015f416fbc
type: paper
title: "Project Sid: Many-Agent Simulations Toward AI Civilization"
paper: "[[Yang2024ProjectSidMany]]"
source: "https://doi.org/10.48550/arxiv.2411.00114"
doi: "10.48550/arxiv.2411.00114"
year: 2024
citations: 45
journal: "arXiv preprint"
study_type: "empirical multi-agent simulation study"
read_status: analyzed
evidence_status: source_derived
relevance: high
pillars:
  - P1
  - P2
  - P5
  - P8
questions:
  - Q01
  - Q02
  - Q15
noises:
  - R1
  - R5
tags:
  - research
  - paper
  - pilar/P1
  - pilar/P5
  - project-sid
  - piano
  - multi-agent
  - simulation
---

# Project Sid: Many-Agent Simulations Toward AI Civilization

## Identificação Epistêmica
- **Citekey**: `Yang2024ProjectSidMany`
- **Autores**: Robert Yang, Gabriel C. Huang, Jenny Jiang, Michael Zhang, Altera.AL Research Team
- **Ano**: 2024 | **DOI/ArXiv**: [10.48550/arxiv.2411.00114](https://arxiv.org/abs/2411.00114)
- **Repositório**: [altera-al/project-sid](https://github.com/altera-al/project-sid)
- **Questões Vinculadas**: [[Q01]] (NOP / Reatividade), [[Q02]] (LTS / Semântica Formal), [[Q15]] (Temporal Abstraction & Options)
- **Pilares Suportados**: P1 (PON), P2 (Semântica LTS), P5 (SMDP Options), P8 (Roteamento Econômico)

---

## Síntese do Artigo & Arquitetura PIANO
> **Premissa Central**: Superar o gargalo sequencial de "chamada de função única síncrona" em agentes LLM. O PIANO (*Parallel Information Aggregation via Neural Orchestration*) executa módulos cognitivos concorrentes orquestrados por um **Cognitive Controller (CC)** central.

### 1. Módulos Cognitivos Concorrentes
1. **Memory Module**: Memória episódica de curto e longo prazo indexada temporalmente;
2. **Proprioception / Internal State**: Rastreamento contínuo de necessidades vitais (fome, fadiga, inventário, recursos pessoais);
3. **Action Awareness Module**: Auto-monitoramento de ações recentes e feedback de execução do ambiente. *Ablation study*: remover este módulo quebra a difusão e adaptação de normas sociais;
4. **Social Awareness & Communication**: Detecção de agentes co-localizados, reputação, relações interpessoais e escuta de diálogos;
5. **Planning & Goal Hierarchy**: Decomposição de intenções em opções temporais (SMDP options);
6. **Cognitive Controller (CC)**: Filtro de arbitragem central que unifica os fluxos concorrentes em uma única ação atômica válida por ciclo (tick).

### 2. Fenômenos Emergentes Observados
- **Economia Emergente**: Troca aberta por escambo evoluindo para moeda comum de troca (gemas/cristais) baseada em oferta e demanda;
- **Especialização Profissional**: Divisão orgânica do trabalho (agricultores, cozinheiros, guardas, clérigos, acadêmicos);
- **Governança & Votação Coletiva**: Criação espontânea de regras de convivência, votação democrática e taxas para bens comuns;
- **Transmissão Cultural & Memética**: Propagação de memes sociais e crenças religiosas (ex.: clérigo mercantilista acumulando moeda para converter cidadãos).

---

## Mapeamento Direto para o KAD-PI e Gaya RPG

| Conceito do PIANO / Project Sid | Mapeamento no Gaya RPG & KAD-PI | Mecanismo Determinístico KAD |
| :--- | :--- | :--- |
| **Ambiente Virtual Sandbox** | Refúgio YKT (`tools/gaya/content/rooms.mjs`) | Topologia determinística de salas conectadas |
| **Parallel Cognitive Modules** | Reactive PON Streams (`tools/kad/isa.mjs`) | Eventos acionados por notificação (P1) |
| **Cognitive Controller (CC)** | State Transition Engine (`tools/gaya/kernel/transition.mjs`) | `applyTick(state, commands, ledger)` (P2) |
| **Validação de Ação** | Precondition Validator (`tools/gaya/kernel/validator.mjs`) | Verificação formal de regras e custos (P2) |
| **Memória & Ledger** | Append-Only Tamper-Proof Ledger (`tools/gaya/kernel/ledger.mjs`) | Criptografia SHA-256 com hash-chaining |
| **Emergent Economy** | Trocas de Gemas / Cristais de Mana e Refeições | Ação `trade` com contrato de conservação de recursos |
| **Emergent Governance** | Votações do Conselho no Commons / Ramo de Douglas | Ação `vote` mediada por Douglas (Consenso) |
| **Transmissão Cultural** | Filosofias Cósmicas Khan (Cinética) vs Yorman (Ordem) | Ação `talk` com payload de memes no Ledger |

---

## Claims Epistêmicos Vinculados
- [[CLAIM-PIANO-CONCURRENT-COGNITION-001]]
