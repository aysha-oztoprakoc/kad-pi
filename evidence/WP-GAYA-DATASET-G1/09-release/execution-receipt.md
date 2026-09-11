# Recibo de Execução — Frame 09: Vinculação de Portões Nativos ISA e Entrega de Release Qualificada

**Workpackage:** `WP-GAYA-DATASET-G1-09`
**Projeto:** `kad-pi` (`PRIMARY`)
**Claim ID:** `a04740a8-4c97-4503-bd9c-752ec24056d1`
**Base Commit / Fixed Point:** `3a0b5b0f2cb11ed00b65ef8da7bb49c309c42af5`
**Status:** `REVIEW` (Execução Concluída com Sucesso)
**Timestamp:** `2026-09-09T04:00:49.617908+00:00`
**Portões ISA Cobertos:** `GAYA-G1-01` a `GAYA-G1-11` (**11/11 Aprovados**)
**Selo da Release (SHA-256):** `bd56586d841558a8c8ef45db9a7b472ae89576f5b14593b193965afc4864d9c1`

---

## 1. Escopo e Limites de Mutação Executados
Todos os artefatos modificados e implementados residem estritamente dentro da fronteira autorizada de `kad-pi` (`owned_paths`):
- `tools/kad/isa.mjs`: Registro formal dos 11 validadores de domínio sob a allowlist do motor nativo KAD ISA.
- `tools/kad/gaya-dataset-qualification.mjs`: Implementação do adaptador de qualificação compartilhada do domínio Gaya validando censos, proveniência, extração, grafos, ancoragem visual, não-vazamento, síntese, consumidores offline, qualidade semântica, replay e aceitação.
- `tools/kad/test/gaya-dataset-qualification.test.mjs`: Testes unitários com cobertura positiva e 11 controles negativos/adversariais comprovando detecção de adulteração de dados.
- `evidence/WP-GAYA-DATASET-G1/09-release/`: Promoção da release completa selada contendo os bundles de treino, game e RAG, relatórios de qualificação, ficha técnica (`datasheet.md`), recibo de aceitação (`acceptance-receipt.json`) e recibos de execução.

---

## 2. Resultados dos 11 Portões ISA Nativos

Todos os 11 portões foram validados via execução determinística (`node bin/kad-isa check docs/gaya/dataset-generation/ISA-GAYA-DATASET-G1-001.md`):

| Portão ISA | Declaração do Requisito | Classe | Status | Evidência Determinística Registrada |
| :--- | :--- | :--- | :--- | :--- |
| **GAYA-G1-01** | Censo completo e exclusões explícitas | DETERMINÍSTICO | **PASS** | 315 fontes registradas, 0 perdas silenciosas, 0 falhas |
| **GAYA-G1-02** | Proveniência, elegibilidade e revisão | HÍBRIDO | **PASS** | 37/37 exemplos com elegibilidade e referências imutáveis |
| **GAYA-G1-03** | Locators de fonte e integridade de extração | HÍBRIDO | **PASS** | 149 documentos positivos com SHA-256 preservados |
| **GAYA-G1-04** | Entidades, direção, negação e tempo | HÍBRIDO | **PASS** | 53 entidades, 8 relações, 4/4 mutações metamórficas detectadas |
| **GAYA-G1-05** | Ancoragem visual e geografia proposta | HÍBRIDO | **PASS** | 147 ativos com dimensões reais, geo desconhecida mantida |
| **GAYA-G1-06** | Isolamento de splits e não-vazamento | DETERMINÍSTICO | **PASS** | 0 duplicatas exatas, 0 near-duplicates > 0.85, 0 vazamentos |
| **GAYA-G1-07** | Síntese determinística e 8 famílias | HÍBRIDO | **PASS** | 37 exemplos cobrindo todas as 8 famílias canônicas |
| **GAYA-G1-08** | Consumidores offline (treino, game, RAG) | DETERMINÍSTICO | **PASS** | TrainingParser, GameLoader e ScopedRetriever aprovados |
| **GAYA-G1-09** | Casos adversariais e revisão semântica | HÍBRIDO | **PASS** | 0 canários, 0 fatos revogados, 76% revisão com 0 rejeições |
| **GAYA-G1-10** | Replay idêntico e recuperação de falhas | DETERMINÍSTICO | **PASS** | 5/5 testes de falha passaram, 0 falso complete verificado |
| **GAYA-G1-11** | Cobertura total e aceitação autorizada | HÍBRIDO | **PASS** | Pacote de aceitação selado (bd56586d841558a8...), recibo vinculado |

---

## 3. Comandos de Verificação Exercitados

* **Lint Estrutural ISA:** `node bin/kad-isa lint docs/gaya/dataset-generation/ISA-GAYA-DATASET-G1-001.md` -> `[PASS] ISA Lint OK: ISA-GAYA-DATASET-G1-001 (11 claims verified)`
* **Check Completo ISA:** `node bin/kad-isa check docs/gaya/dataset-generation/ISA-GAYA-DATASET-G1-001.md` -> `Summary: 11/11 claims PASS`
* **Suíte de Testes Nativos:** `node --test tools/kad/test/gaya-dataset-qualification.test.mjs` -> `3/3 tests passed (OK)`
