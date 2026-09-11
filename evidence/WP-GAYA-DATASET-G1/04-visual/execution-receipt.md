# Recibo de Execução — Frame 04: Ancoragem de Referências Visuais e Associações Espaciais

**Workpackage:** `WP-GAYA-DATASET-G1-04`
**Projeto:** `kad-rpg` (`SIDE_PROJECT`)
**Claim ID:** `049e89b1-bb26-47a9-8a7f-4b90d66ed197`
**Base Commit / Fixed Point:** `0389137746b0e92a34013e7cf72abfbf0679c1e4`
**Status:** `REVIEW` (Execução Concluída com Sucesso)
**Timestamp:** `2026-09-09T02:39:56.094009+00:00`
**Portões ISA Cobertos:** `GAYA-G1-05` (Ancoragem Visual, Multimodalidade e Associações Espaciais)

---

## 1. Escopo e Limites de Mutação Executados
Todos os artefatos modificados e gerados residem estritamente dentro da fronteira autorizada (`owned_paths`):
- `kad-gaya/ingestion/media_references.py`: Motor de extração de dimensões em puro Python (`get_image_dimensions`), categorização visual controlada (`VisualCategory`), grafo hierárquico espacial (`SpatialContainmentGraph`) e orquestrador (`VisualSpatialGroundingEngine`).
- `kad-gaya/pipeline/dataset_cli.py`: Despacho do subcomando `run --stage visual` com validação de pré-requisitos dos Frames 02 e 03.
- `kad-gaya/tests/test_dataset_cli_and_schemas.py`: Testes unitários para extração de dimensões, contenção de alucinações, grafos espaciais e execução da CLI.
- `kad-gaya/dataset_runs/staging/04-visual-spatial/`: Staging virgem contendo associações de mídia, grafo espacial, sementes visuais desbloqueadas e manifesto selado.

---

## 2. Rastreamento e Classificação dos 151 Ativos de Mídia

Todos os 151 ativos de mídia descobertos no Frame 02 foram qualificados deterministamente:

| Categoria Visual | Quantidade | Tratamento Semântico | Elegibilidade Treino |
| :--- | :--- | :--- | :--- |
| `PORTRAIT` | 1 | Retrato facial canônico (`Minos.webp`) | `APPROVED` (`True`) |
| `CHARACTER_MOMENT` | 1 | Cena de personagem em atividade cotidiana (`Amethysta comendo.png`) | `APPROVED` (`True`) |
| `HISTORICAL_REFERENCE` | 1 | Referência estética antiga preservada sem sobrescrever códice (`Amethysta_REF_ANTIGA.webp`) | `SUPERSEDED` (`True`) |
| `FACTION_TROOP` | 3 | Tropas e combatentes de Drakovia (`Goblin escravo`, `Humano aliado`, `Soldado drakoviano`) | `APPROVED` (`True`) |
| `BATTLE_TOKEN` | 1 | Marcador tático de combate em mesa (`token_1.png`) | `APPROVED` (`False`) |
| `SESSION_UI_SCREENSHOT` | 83 | Capturas de interface/sessão mantidas como evidência de execução | `CANDIDATE` (`False`) |
| `UNLABELED_CANDIDATE` | 61 | Imagens sem anotação nominal no cânone mantidas em quarentena | `CANDIDATE` (`False`) |
| **Total** | **151** | **Reconciliação exata de 100% dos ativos de mídia** | — |

---

## 3. Invariante de Zero Alucinação Visual e Espacial

- **Contenção Estrita:** Nenhuma imagem não rotulada ou captura de tela operacional foi inventada como personagem ou fato canônico (`zero_hallucination_verified: True`).
- **Dimensões Nativas:** Extração direta de largura e altura dos cabeçalhos binários (sem dependência de VLM ou bibliotecas externas pesadas).
- **Grafo Espacial Comprovado:** 16 locais canônicos interligados por 13 relações de contenção e adjacência documentadas nas fontes (ex.: Heartwood, Escola de Mana e Câmara de Síntese no Refúgio YKT; Templo Suspenso sobre a árvore; Savana Negra fronteiriça à Floresta Negra).

---

## 4. Desbloqueio da Família 'visual_entity_references'

A família `visual_entity_references`, anteriormente bloqueada no Frame 03, foi desbloqueada com sucesso, gerando 4 sementes qualificadas com digests de integridade:
- `seed_visual_001`: Pareamento visual de Amethysta em momento de descanso (`YKT _ Amethysta comendo.png`).
- `seed_visual_002`: Distinção histórica e evolução de design (`YKT _ Amethysta_REF_ANTIGA.webp` vs Códice).
- `seed_visual_003`: Identificação de tropas do Império Drakoviano (`Goblin escravo` e `Soldado drakoviano`).
- `seed_visual_004`: Retrato canônico de Minos (`Minos.webp`).

---

## 5. Manifesto Selado e Hashes dos Artefatos
- **Manifesto do Estágio:** `manifest.json` (SHA-256 do Selo: `e47eb86971893b92e5e1bd46eb989b4270a1f31261a4a42a72e9bb5d1f5c2de4`)
- `media_associations.jsonl`: `6f08023aaa9257d4daff683bad5d4ebb21a70c968f012e68ca4b1a430afab776` (151 registros)
- `spatial_graph.json`: `96e5299c3cc6f3405cc436e26f3767155628918111555e4d77fdae096db6f4cf` (16 locais, 13 relações)
- `visual_seeds.jsonl`: `40d928a7299ba29ea19cacbf6dc59f1230a06b50fb3eda581f8a0c77a6e780d1` (4 sementes qualificadas)
- `visual_spatial_summary.json`: `0ced1cab6710816c4b7d776a56ebd4cc9ab2314ab7e29f8f5c2ac4845fd05116`

---

## 6. Verificação Determinística
- **Suíte de Testes Unitários:** `python -m unittest discover kad-gaya/tests`
  - 29 testes executados, 29 aprovados (`OK`), 0 falhas, 0 erros em 22.55s.
