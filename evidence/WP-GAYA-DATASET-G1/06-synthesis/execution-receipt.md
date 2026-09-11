# Recibo de Execução — Frame 06: Geração Sintética Bounded e Replay Determinístico

**Workpackage:** `WP-GAYA-DATASET-G1-06`
**Projeto:** `kad-rpg` (`SIDE_PROJECT`)
**Claim ID:** `3d749d87-2a90-4d3d-9322-301f5de45f72`
**Base Commit / Fixed Point:** `0389137746b0e92a34013e7cf72abfbf0679c1e4`
**Status:** `REVIEW` (Execução Concluída com Sucesso)
**Timestamp:** `2026-09-09T03:08:31.621705+00:00`
**Portões ISA Cobertos:** `GAYA-G1-07` (Geração Apoiada em Sementes e Oráculos) e `GAYA-G1-10` (Replay Determinístico Bit-Identical)

---

## 1. Escopo e Limites de Mutação Executados
Todos os artefatos modificados e gerados residem estritamente dentro da fronteira autorizada (`owned_paths`):
- `kad-gaya/training/synthetic_builder.py`: Motor de compilação sintética canônica (`SyntheticDatasetBuilder`), normalização de registros (`SyntheticExampleRecord`), gravação de fitas (`GenerationTapeRecord`) e motor de replay (`DeterministicReplayEngine`).
- `kad-gaya/pipeline/dataset_cli.py`: Despacho das etapas `run --stage synthesis` e do subcomando `replay --release <source> --output <dest>`.
- `kad-gaya/tests/test_dataset_cli_and_schemas.py`: Testes unitários para cobertura das 8 famílias, separação de pares contrastivos/abstenção e integridade criptográfica do replay.
- `kad-gaya/dataset_runs/staging/06-synthesis/`: Staging virgem contendo os exemplos compilados, aceitos, fitas de geração, auditoria de rejeições e manifesto selado.

---

## 2. Cobertura das 8 Famílias Requeridas do Dataset

Total de 37 exemplos compilados com 100% de cobertura das famílias definidas no contrato ISA:

| Família do Dataset | Total Exemplos | Exemplos Aceitos | Elegíveis Treino | Controles Negativos / Teste |
| :--- | :--- | :--- | :--- | :--- |
| `grounded_lore_qa` | 6 | 6 | 4 | 2 (refutação canônica) |
| `character_identity_and_style` | 2 | 2 | 2 | 0 |
| `relationships_and_evidence_paths` | 5 | 5 | 4 | 1 (ruptura histórica de lealdade) |
| `items_and_mechanics` | 5 | 5 | 4 | 1 (negação de posse Nyr/Zhar) |
| `spatial_containment_and_routes` | 2 | 2 | 2 | 0 |
| `visual_entity_references` | 10 | 10 | 8 | 2 (distinção histórica / tokens) |
| `bounded_situational_decisions` | 2 | 2 | 2 | 0 |
| `memory_and_abstention` | 5 | 5 | 4 | 1 (abstenção obrigatória Faemathar) |
| **Total Global** | **37** | **37** | **30** | **7** |

---

## 3. Distribuição por Partições de Split

- `train`: 24 exemplos canônicos elegíveis para treino direto.
- `validation`: 2 exemplos de contenção espacial e espelhos.
- `test`: 11 exemplos (incluindo 7 pares contrastivos de refutação e abstenções fáticas).

---

## 4. Auditoria de Rejeições e Contenção de Vazamento

2 tentativas de geração inválidas foram propostas e rejeitadas pelos filtros antes da aceitação:
1. `SECRET_CANARY_LEAK`: Canário secreto de narrador (`GAYA_CANARY_NARRATOR_SECRET_98412_REIDRAKOVIA`) detectado em prompt de proposta -> Rejeitado deterministamente.
2. `UNSUPPORTED_RELATION`: Inversão genealógica não suportada ("Sofia é mãe de Lylia") -> Rejeitada deterministamente pelo oráculo canônico.

---

## 5. Comprovação Criptográfica de Replay Determinístico (GAYA-G1-10)

O subcomando `replay` foi executado contra o estágio `06-synthesis`:
* Total de fitas reproduzidas: 39 (37 aceitas, 2 rejeições auditadas).
* SHA-256 da fita de geração original: `1a3b5d8dd526d9fee868c173fd4b59fbddc774f6b7dd429c97d9b644f26dc8b3`
* SHA-256 da fita reproduzida: `1a3b5d8dd526d9fee868c173fd4b59fbddc774f6b7dd429c97d9b644f26dc8b3`
* **Resultado:** **`is_bit_identical: True`** (Reprodução bit a bit sem chamada a nenhum modelo externo).

---

## 6. Manifesto Selado e Hashes dos Artefatos
- **Manifesto do Estágio:** `manifest.json` (SHA-256 do Selo: `7e7ecd4ddf2ffddbc1187290287631808e70e5deca6d56e9a76ef281dcff9eb7`)
- `examples.jsonl`: `3e1cf9b35085044d28dac6159af3aa30c076cc231b2cc96b476c7dea53c43217` (37 exemplos normalizados)
- `accepted_examples.jsonl`: `3e1cf9b35085044d28dac6159af3aa30c076cc231b2cc96b476c7dea53c43217` (37 exemplos aceitos)
- `generation_tapes.jsonl`: `1a3b5d8dd526d9fee868c173fd4b59fbddc774f6b7dd429c97d9b644f26dc8b3` (39 fitas de tentativa)
- `rejections.jsonl`: `d22513647912ad4f12b46e45cb0b8d902b181e5410284e5d3c9718c09c978423` (2 registros de rejeição)
- `synthesis_summary.json`: `4f20150377f95fde548de5d52e766af7a5a4c12e67ddbe64cc617020fb778359`

---

## 7. Verificação Determinística
- **Suíte de Testes Unitários:** `python -m unittest discover kad-gaya/tests`
  - 36 testes executados, 36 aprovados (`OK`), 0 falhas, 0 erros em 64.70s.
