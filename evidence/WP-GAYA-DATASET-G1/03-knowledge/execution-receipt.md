# Recibo de Execução — Frame 03: Ancoragem de Evidências e Conhecimento Canônico

**Workpackage:** `WP-GAYA-DATASET-G1-03`
**Projeto:** `kad-rpg` (`SIDE_PROJECT`)
**Claim ID:** `5896c2ed-5120-4a4c-9f22-b7604f43733e`
**Base Commit / Fixed Point:** `0389137746b0e92a34013e7cf72abfbf0679c1e4`
**Status:** `REVIEW` (Execução Concluída com Sucesso)
**Timestamp:** `2026-09-09T02:26:36.360942+00:00`
**Portões ISA Cobertos:** `GAYA-G1-02` (Evidência, Revisão e Ciclo Epistêmico), `GAYA-G1-04` (Conhecimento Canônico e Grafos de Relações)

---

## 1. Escopo e Limites de Mutação Executados
Todos os artefatos modificados e gerados residem estritamente dentro da fronteira autorizada (`owned_paths`):
- `kad-gaya/pipeline/deterministic.py`: Implementação do grafo direcionado sem atalhos sintéticos (`RelationshipGraph`), registros de entidades canônicas com tipagem estrita (`CanonicalEntityRecord`), sementes revisadas para as 8 famílias (`ReviewedSeedRecord`) e construtor (`GayaKnowledgeBuilder`).
- `kad-gaya/pipeline/dataset_cli.py`: Despacho do subcomando `run --stage canon` com verificação estrita dos pré-requisitos do Frame 02.
- `kad-gaya/tests/test_dataset_cli_and_schemas.py`: Expansão dos testes unitários para validar assimetria, não-transitividade de caminhos e integridade das 8 famílias.
- `kad-gaya/dataset_runs/staging/03-canon/`: Staging virgem de saída contendo entidades, fatos, grafos e sementes seladas.

---

## 2. Invariantes Críticos Verificados

| Invariante | Status | Detalhe |
| :--- | :--- | :--- |
| `lylia_mae_de_sofia_direction_preserved` | `PASS` | Direção `Lylia -> mae_de -> Sofia` estritamente preservada sem inversão |
| `lylia_nao_carrega_nyr_negation_preserved` | `PASS` | Negação preservada (`polarity=False`), sem conversão para posse positiva |
| `desertion_not_current_affiliation` | `PASS` | `desertou_de` categorizado como `HISTORICAL_DESERTION`, distinto de `afiliado_a` |
| `gaia_gaya_distinction_preserved` | `PASS` | Gaia (Druida) e Gaya (Planeta/Mundo) mantidos como entidades canônicas separadas |
| `generic_mentions_unlinked` | `PASS` | Substantivos genéricos isolados ("floresta", "brigada", "dragão") não viram entidades |
| `non_transitive_relationship_paths` | `PASS` | Consulta de 3º elemento retorna o caminho de evidências multi-hop sem inventar aresta direta |

---

## 3. Cobertura das 8 Famílias Requeridas do Dataset

- `grounded_lore_qa`: 2 sementes qualificadas
- `character_identity_and_style`: 1 sementes qualificadas
- `relationships_and_evidence_paths`: 2 sementes qualificadas
- `items_and_mechanics`: 2 sementes qualificadas
- `spatial_containment_and_routes`: 1 sementes qualificadas
- `visual_entity_references`: 1 sementes (**BLOQUEADA**: aguardando Frame 04 para ancoragem de imagens reais)
- `bounded_situational_decisions`: 1 sementes qualificadas
- `memory_and_abstention`: 2 sementes qualificadas (com controles negativos explícitos)

---

## 4. Manifesto Selado e Hashes dos Artefatos
- **Manifesto do Estágio:** `manifest.json` (SHA-256 do Selo: `b4f2bfac4b9a16ecc7dee38bc64e1b554ec216ae646ebf257fe10295f15671b0`)
- `canonical_entities.jsonl`: `a36a68b275500553088b5a4d7fc0a55a57330bac292d9f67ca46e1899c67a6db` (53 entidades)
- `canonical_facts.jsonl`: `a92874f89a4a39d61eaba18cc58e196ca1d37817f6ecdd342909b6b568580183` (8 fatos canônicos)
- `relationship_graph.json`: `234ef188048ab3669577ba5c926f74990fd65e091816f78fb8622debfc886799` (6 nós, 8 arestas direcionadas)
- `reviewed_seeds.jsonl`: `36ef7b4a7630710fdd5a8ecc6c015e4cf21ec81be62c33b46494065299b4f688` (12 sementes)
- `knowledge_summary.json`: `761aa18739718c5b3c079c50af1284177e3a9484ea87f3ee1bd36870a4f2c31b`

---

## 5. Verificação Determinística
- **Suíte de Testes Unitários:** `python -m unittest discover kad-gaya/tests`
  - 26 testes executados, 26 aprovados (`OK`), 0 falhas, 0 erros em 12.16s.
