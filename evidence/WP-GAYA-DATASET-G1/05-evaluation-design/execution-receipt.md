# Recibo de Execução — Frame 05: Congelamento de Avaliação, Splits e Oráculos de Cenário

**Workpackage:** `WP-GAYA-DATASET-G1-05`
**Projeto:** `kad-rpg` (`SIDE_PROJECT`)
**Claim ID:** `cb137a31-5c1c-4641-80ce-598f02b15888`
**Base Commit / Fixed Point:** `0389137746b0e92a34013e7cf72abfbf0679c1e4`
**Status:** `REVIEW` (Execução Concluída com Sucesso)
**Timestamp:** `2026-09-09T02:54:34.710515+00:00`
**Portões ISA Cobertos:** `GAYA-G1-06` (Isolamento de Splits e Canários), `GAYA-G1-07` (Oráculos Parciais e Mecânica) e `GAYA-G1-09` (Suíte Metamórfica e Pré-registro de Portões)

---

## 1. Escopo e Limites de Mutação Executados
Todos os artefatos modificados e gerados residem estritamente dentro da fronteira autorizada (`owned_paths`):
- `kad-gaya/training/splits.py`: Motor de particionamento estrito (`SplitPartition`), isolamento de 6 famílias canônicas, rejeição de pontes multi-fonte (`CROSS_PARTITION_BRIDGE`) e injeção/auditoria de canários secretos.
- `kad-gaya/pipeline/scenario_oracles.py`: Oráculo de cenários bounded com rastreamento de conservação de recursos (`ScenarioOracle`), verificação de rotas espaciais e avaliador de sensibilidade semântica (`MetamorphicEvaluator`).
- `kad-gaya/pipeline/dataset_cli.py`: Despacho do subcomando `run --stage eval-oracles` com validação de pré-requisitos dos Frames 02, 03 e 04.
- `kad-gaya/tests/test_dataset_cli_and_schemas.py`: Testes unitários para particionamento, detecção de canários, oráculos e suíte metamórfica.
- `kad-gaya/dataset_runs/staging/05-eval-oracles/`: Staging virgem contendo splits congelados, oráculos de cenário executados, testes metamórficos e manifesto selado.

---

## 2. Congelamento de Partições e Políticas de Split

Total de 315 documentos do corpus alocados estritamente por famílias canônicas sem mistura aleatória de linhas:

| Família Canônica | Partição Alocada | Qtd Documentos | Tratamento de Vazamento |
| :--- | :--- | :--- | :--- |
| `FAM_CANONICAL_CODICES` | `train` | 5 | Cânone principal consolidado |
| `FAM_CHARACTER_PRIMARY_SHEETS` | `train` | 84 | Fichas primárias de personagens |
| `FAM_VAULT_OPENVIKING_MIRRORS` | `validation` | 60 | Espelho Vault/OpenViking mantido como validação |
| `FAM_MEDIA_VISUAL_ASSETS` | `train` | 151 | Ativos visuais e imagens |
| `FAM_SESSION_LOGS_AND_REPORTS` | `validation` | 6 | Diários e relatórios históricos de sessão |
| `FAM_HELD_OUT_EVALUATION` | `test` | 2 | Fichas e documentos isolados para teste independente (Lylia_2.pdf, Charlotte) |
| **Total Corpus Atribuído** | — | **315** | **Zero colisões e zero pontes permitidas** |

---

## 3. Oráculos de Cenário e Conservação de Recursos

8 cenários bounded foram executados pelo `ScenarioOracle` com 100% de conformidade com as regras de Gaya:
1. `scen_001_mov_valid`: Movimento válido pelo grafo espacial do Refúgio YKT (`PASS` - `VALID`).
2. `scen_002_mov_out_of_bounds`: Movimento para local inacessível fora do grafo rejeitado (`PASS` - `OUT_OF_BOUNDS`).
3. `scen_003_imbue_valid`: Consumo de 1 ponto de Khan para imbuir dano por Ayşa (`PASS` - `VALID`).
4. `scen_004_imbue_insufficient`: Tentativa de gasto de Khan sem saldo disponível rejeitada (`PASS` - `INVALID_PRECONDITION`).
5. `scen_005_damage_division_bond`: Divisão do vínculo de dano entre Ayşa e Amethysta com RD 2 (`PASS` - `VALID`).
6. `scen_006_true_damage_unreduced`: Dano verdadeiro de Queimar o Título não redutível por RD (`PASS` - `VALID`).
7. `scen_007_trade_conservation`: Comércio de ouro e rações entre atores com conservação estrita (`PASS` - `VALID`, `conservation_verified: True`).
8. `scen_008_synthesis_living_prohibited`: Tentativa de extrair novelo de ocupante vivo proibida pelo códice (`PASS` - `RULE_VIOLATION`).

---

## 4. Avaliação Metamórfica e Canários Secretos
- **Zero Escapes Metamórficos (`zero_escapes_verified: True`):**
  - Inversão de Negação (`MUT_NEG_001`): Detecção de arma atribuída a Amethysta (`REJECT`).
  - Reversão de Direção (`MUT_DIR_001`): Detecção de inversão de maternidade entre Sofia e Lylia (`REJECT`).
  - Distorção de Unidades (`MUT_UNIT_001`): Detecção de conversão arbitrária de pés para metros (`REJECT`).
  - Relação Não Suportada (`MUT_REL_001`): Detecção de drenagem vital inexistente na Síntese (`REJECT`).
- **Canários Secretos:**
  - `CANARY_SEC_001` (`GAYA_CANARY_NARRATOR_SECRET_98412_REIDRAKOVIA`): Escopo Narrador auditado contra vazamento em treino.
  - `CANARY_SEC_002` (`GAYA_CANARY_HELD_OUT_TEST_33190_KRAVARIUS_ORIGIN`): Escopo Teste isolado.
  - `CANARY_CTRL_POS_001` (`GAYA_CANARY_CONTROL_POS_VISIBLE_AYSHA`): Controle positivo público verificado.

---

## 5. Portões Pré-registrados (Tolerância Zero)
- `zero_schema_violations_threshold`: 0
- `zero_revoked_claims_threshold`: 0
- `zero_split_family_collisions_threshold`: 0
- `zero_secret_canary_escapes_threshold`: 0
- `zero_critical_semantic_escapes_threshold`: 0
- `human_review_sample_ratio`: 20%
- `high_risk_review_sample_ratio`: 100%
- `generation_attempt_limit_per_seed`: 3

---

## 6. Manifesto Selado e Hashes dos Artefatos
- **Manifesto do Estágio:** `manifest.json` (SHA-256 do Selo: `8b4f367f11ce3c2020e3b37df851297aff43b13f3435ca33cdf8c665817eb969`)
- `splits.json`: `e597d3255a11141c9f71e9b815950fd15f4f01c4a82a617816b00461eec0fb32` (6 famílias, 315 documentos mapeados)
- `scenario_oracles.jsonl`: `c0df59ea8b7d550ea4097233d1089c8ffe93c798d0b8da2c96f633449682f58a` (8 cenários avaliados)
- `canary_suite.json`: `531881ef76c043debaa801c977c7021865e1d28f627aac5303030febe8a3f181` (canários e 4 testes metamórficos)
- `eval_summary.json`: `deb89511bf5eb2f7f99fe7c49193e9fd11d106ec1031ea6864bf12aa6c76d9e9`

---

## 7. Verificação Determinística
- **Suíte de Testes Unitários:** `python -m unittest discover kad-gaya/tests`
  - 33 testes executados, 33 aprovados (`OK`), 0 falhas, 0 erros em 34.91s.
