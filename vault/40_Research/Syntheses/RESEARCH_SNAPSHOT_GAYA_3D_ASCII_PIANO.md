---
kad_id: SNAP-GAYA-3D-ASCII-PIANO-001
title: "Research Snapshot: Deterministic 3D ASCII Text-RPG, PIANO Cognitive Architecture, and Gaya World Substrate on Consumer Hardware"
type: synthesis
version: 1.0.0
status: DRAFT_FOR_ASTRA_ISA
authority: CANONICAL_RESEARCH_GROUNDING
epistemic_class: SOURCE_DERIVED
review_status: PENDING_ASTRA_SYNTHESIS
visibility: project
context_eligible: true
train_eligible: true
publish: false
temporal_status: CURRENT
owner: "Human Project Lead & KAD Architecture"
date: 2026-09-08
tags:
  - research_snapshot
  - project_sid
  - piano_architecture
  - gaya_rpg
  - 3d_ascii
  - local_models
  - smdp_options
---

![[docs/research/RESEARCH_SNAPSHOT_GAYA_3D_ASCII_PIANO.md]]

# Research Snapshot: 3D ASCII RPG + PIANO on Consumer Hardware

Este documento consolida a fundamentação teórica e as decisões arquiteturais para a implementação do RPG textual com gráficos 3D em ASCII art, integrado à arquitetura de cognição concorrente **PIANO** do **Project Sid** e ambientado no canon do **Gaya RPG** (Refúgio YKT).

O artefato canônico completo e estruturado para ingestão pelo compilador de ISA do Astra encontra-se em:
`docs/research/RESEARCH_SNAPSHOT_GAYA_3D_ASCII_PIANO.md`

### Sumário dos Componentes Principais
1. **Motor Gráfico 3D ASCII**: DDA / Raycasting com Z-buffering e compensação de aspect ratio de fontes de terminal (~2:1), executando em loop assíncrono desacoplado a 60 FPS com ANSI TrueColor.
2. **Substrato de Mundo (Gaya RPG)**: Topologia do Refúgio YKT (Commons, Despensa, Cozinha, Salão de Douglas, Salas de Mana e Síntese) com cosmologia Khan (cinética) vs Yorman (ordem) e personagens canônicos.
3. **Arquitetura Cognitiva PIANO**: 6 módulos desacoplados (Propriocepção, Social, Memória, Action Awareness, Planejamento SMDP Options e Cognitive Controller) operando via modelos locais (Qwen2.5-7B e Stheno-v3.2) no hardware AMD Ryzen 7 7700 + AMD Navi GPU com custo de tokens de $0.00.
4. **4 Fenômenos Emergentes do Project Sid**: Economia aberta de troca, especialização vocacional, governança democrática via conselho e difusão memética cultural.
5. **Bloco de Claims para Compilação de ISA no Astra**: 6 claims prontas com classes formais, target states e validadores determinísticos.
