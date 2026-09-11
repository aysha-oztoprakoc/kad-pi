---
type: paper
title: "Darwin Godel Machine: Open-Ended Evolution of Self-Improving Agents"
paper: "[[Zhang2025DarwinGodelMach]]"
source: "https://doi.org/10.48550/arxiv.2505.22954"
doi: "10.48550/arxiv.2505.22954"
year: 2025
citations: 200
journal: "ArXiv"
study_type: "other"
read_status: unread
evidence_status: candidate
relevance: high
pillars:
  - P5
  - P8
questions:
  - Q09
noises:
  - R5
tags:
  - research
  - paper
  - pilar/P5
  - pilar/P8
  - noise/R5
---

# Darwin Godel Machine: Open-Ended Evolution of Self-Improving Agents

## Identificação Epistêmica
- **Citekey**: `Zhang2025DarwinGodelMach`
- **Autores**: Jenny Zhang, Shengran Hu, Cong Lu, R. Lange, Jeff Clune
- **Ano**: 2025 | **Citações**: 200 | **Veículo**: ArXiv
- **DOI**: [10.48550/arxiv.2505.22954](https://doi.org/10.48550/arxiv.2505.22954)
- **Questão Vinculada**: [[Q09]] — Conditions for safe or provably correct self-modifying systems (proof-based self-modification, Gödel machines)
- **Pilares Suportados**: P5, P8
- **Ruído Mitigado**: R5

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: The Darwin Godel Machine (DGM) is a self-improving AI system that modifies its own code and performs better in coding benchmarks, advancing AI development and accelerating its benefits.

### Abstract
Most of today’s AI systems are constrained by human-designed, fixed architectures and cannot autonomously and continuously improve themselves. The scientific method, on the other hand, provides a cumulative and open-ended system, where each innovation builds upon previous artifacts, enabling future discoveries. There is growing hope that the current manual process of advancing AI could itself be automated. If done safely, such automation would accelerate AI development and allow us to reap its benefits much sooner. This prospect raises the question of how AI systems can endlessly improve themselves while getting better at solving relevant problems. Previous approaches, such as meta-learning, provide a toolset for automating the discovery of novel algorithms but are limited by the human design of a suitable search space and first-order improvements. The Godel machine [116], on the other hand, introduced a theoretical approach to a self-improving AI, capable of modifying itself in a provably beneficial manner. Unfortunately, this original formulation is in practice impossible to create due to the inability to prove the impact of most self-modifications. To address this limitation, we propose the Darwin Godel Machine (DGM), a novel self-improving system that iteratively modifies its own code (thereby also improving its ability to modify its own codebase) and empirically validates each change using coding benchmarks. In this paper, the DGM aims to optimize the design of coding agents, powered by frozen foundation models, which enable the ability to read, write, and execute code via tool use. Inspired by biological evolution and open-endedness research, the DGM maintains an archive of generated coding agents. It then samples from this archive and tries to create a new, interesting, improved version of the sampled agent. This open-ended exploration forms a growing tree of diverse, high-quality agents and allows the parallel exploration of many different paths through the search space. Empirically, the DGM automatically improves its coding capabilities (e.g., better code editing tools, long-context window management, peer-review mechanisms), producing performance increases on SWE-bench from 20.0% to 50.0%, and on Polyglot from 14.2% to 30.7%. Furthermore, the DGM significantly outperforms baselines without self-improvement or open-ended exploration. All experiments were done with safety precautions (e.g., sandboxing, human oversight). Overall, the DGM represents a significant step toward self-improving AI, capable of gathering its own stepping stones along a path that unfolds into endless innovation. All code is open-sourced at https://github.com/jennyzzt/dgm.

---

## Extração Estruturada (Elicit Free Tier)

> [!info] Status de Extração no Elicit
> Este artigo está classificado como **candidate**. Para extração formal detalhada, importe este citekey (`Zhang2025DarwinGodelMach`) no Elicit Notebook correspondente à **Q09** e exporte o CSV para ingestão.

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
- **Decisão Vinculada**: Justificar teoricamente "auto-learning desabilitado; KAD gates own promotion" e critério formal de promoção de skills.
- **Lacuna no PRIME_DIRECTIVE**: R5/P5+P8: Auto-modificação com portão determinístico + humano vs prova de utilidade; limites de Goodhart
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

