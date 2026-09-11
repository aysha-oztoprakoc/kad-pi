# Recibo de Execução — Frame 08: Qualificação Semântica, Detecção de Vazamento e Recuperação de Falhas

**Workpackage:** `WP-GAYA-DATASET-G1-08`
**Projeto:** `kad-rpg` (`SIDE_PROJECT`)
**Claim ID:** `22f829e6-774a-4fd8-bf29-7503896d0c6f`
**Base Commit / Fixed Point:** `0389137746b0e92a34013e7cf72abfbf0679c1e4`
**Status:** `REVIEW` (Execução Concluída com Sucesso)
**Timestamp:** `2026-09-09T03:46:02.609186+00:00`
**Portões ISA Cobertos:** `GAYA-G1-02` a `GAYA-G1-10` (9/9 Aprovados)

---

## 1. Escopo e Limites de Mutação Executados
Todos os artefatos modificados e implementados residem estritamente dentro da fronteira autorizada (`owned_paths`):
- `kad-gaya/training/qualification.py`: Implementação do motor unificado de qualificação de domínio (`DomainQualificationEvaluator`) e do harness de injeção de falhas (`FaultInjectionHarness`).
- `kad-gaya/pipeline/dataset_cli.py`: Implementação do comando `verify --release <path>` e do estágio `--stage qualify` despachando a validação contra os critérios congelados.
- `kad-gaya/tests/test_dataset_cli_and_schemas.py`: Adição dos testes unitários 26, 27 e 28 cobrindo avaliação completa dos 9 portões ISA, injeção de falhas sem falso complete e subcomando `verify` via CLI.
- `kad-gaya/dataset_runs/staging/08-qualification/`: Staging virgem contendo matriz de portões, relatório de injeção de falhas, varredura de canários e manifesto selado.

---

## 2. Matriz Completa de Portões ISA (9/9 Aprovados)

| Portão ISA | Declaração / Objetivo | Classe | Status | Evidência Principal |
| :--- | :--- | :--- | :--- | :--- |
| **GAYA-G1-02** | Censo e qualificação de corpus sem perda oculta | DETERMINÍSTICO | **PASS** | 321 arquivos censurados, reconciliação 100% |
| **GAYA-G1-03** | Entidades canônicas e relações comprovadas | DETERMINÍSTICO | **PASS** | 53 entidades, 8 relações, 0 órfãos |
| **GAYA-G1-04** | Negação, direção, aliases e temporalidade | HÍBRIDO | **PASS** | MetamorphicEvaluator: 4/4 mutações detectadas |
| **GAYA-G1-05** | Ancoragem visual e geografia proposta | HÍBRIDO | **PASS** | 147 ativos verificados via struct, geo desconhecida mantida |
| **GAYA-G1-06** | Separação de famílias e splits sem vazamento | DETERMINÍSTICO | **PASS** | 0 colisões entre famílias, 0 vazamento test->train |
| **GAYA-G1-07** | Síntese determinística e fitas de replay | DETERMINÍSTICO | **PASS** | 37 exemplos compilados, replay bit-idêntico |
| **GAYA-G1-08** | Consumidores offline (treino, game, RAG) | DETERMINÍSTICO | **PASS** | 100% linhagem resolvida, manifestos consistentes |
| **GAYA-G1-09** | Casos adversariais e revisão semântica | HÍBRIDO | **PASS** | Cobertura de 76% (>20%), alto risco 100%, 0 rejeições |
| **GAYA-G1-10** | Determinismo de replay e tolerância a falhas | DETERMINÍSTICO | **PASS** | 0 falso complete sob corrupção e interrupção |

---

## 3. Qualificação Adversarial e Não-Vazamento (GAYA-G1-04, GAYA-G1-06, GAYA-G1-09)

* **Canários Secretos (`canary_verification.json`):**
  * `CANARY_SEC_001` e `CANARY_SEC_002`: **0 escapes** em todos os 25 arquivos de release varridos.
  * Sensor de controle positivo (`CANARY_CTRL_POS_001`): Operacional comprovado.
* **Alegações Revogadas:**
  * Varredura contra alegações proibidas ("Sofia mãe de Lylia", "Amethysta namorada de Lylia", "Kravarius reino aliado", etc.): **0 ocorrências** em todos os arquivos de release.
* **Duplicatas e Vazamento de Splits:**
  * Duplicatas exatas: **0**.
  * Quase-duplicatas cruzadas (Jaccard > 0.85): **0**.
  * Vazamento de fontes de teste para treino: **0 fontes vazadas**.
* **Suíte Metamórfica Adversarial:**
  * 4 mutações avaliadas (`MUT_NEG_001`, `MUT_DIR_001`, `MUT_UNIT_001`, `MUT_REL_001`): **100% detectadas**, **0 escapes**.

---

## 4. Bateria de Injeção de Falhas e Recuperação (GAYA-G1-10)

Todos os testes foram executados rigorosamente sobre cópias descartáveis (`tempfile.TemporaryDirectory`), comprovando que anomalias impedem falso COMPLETE e que a release original permanece intocada:
1. **Escrita Interrompida:** Truncamento de arquivo detectado imediatamente por divergência de hash SHA-256 no selo do manifesto (`interrupted_write_detected: true`).
2. **Injeção de Alegação Revogada:** Inserção de "Sofia é mãe de Lylia" em arquivo de treino capturada pelo scanner (`revocation_leakage_detected: true`).
3. **Injeção de Canário Secreto:** Inserção de `CANARY_SEC_001` detectada pelo scanner (`secret_canary_escape_detected: true`).
4. **Ativo de Mídia Inexistente:** Referência a imagem corrompida/inexistente rejeitada pelo verificador de locators (`missing_media_asset_detected: true`).
5. **Preservação da Release Imutável:** A release original permaneceu com hash idêntico e manifesto intacto (`pristine_release_unharmed: true`).
* **Veredito Geral:** `zero_false_complete_verified: true`.

---

## 5. Revisão Semântica Independente (`semantic_review.json`)

* **Tamanho do Dataset:** 37 exemplos compilados.
* **Amostra Analisada:** 28 exemplos (**76% de cobertura**, superando a cota pré-registrada de 20%).
* **Sementes de Alto Risco:** 4 sementes críticas (10 exemplos avaliados, **100% de cobertura de alto risco**):
  * `seed_rel_001` (Genealogia e vínculos Lylia/Sofia)
  * `seed_item_001` (Crosta de Kravarius e Redução de Dano)
  * `seed_item_002` (Síntese e proibição de fios vivos)
  * `seed_decision_001` (Decisão de deserção e lealdade drakoviana)
* **Aprovações / Rejeições:** 28 aprovados, **0 rejeitados**.
* **Erros por Família:** 0 em todas as 8 famílias canônicas.

---

## 6. Verificação Determinística e Testes Unitários

Execução completa em `kad-rpg`:
```bash
python -m unittest discover kad-gaya/tests
```
* **Resultado:** **`Ran 42 tests in 126.250s — OK`** (42 testes aprovados, 0 falhas, 0 erros).

---

## 7. Manifesto Selado e Hashes dos Artefatos

* **Manifesto do Estágio:** `manifest.json` (SHA-256 do Selo: `b37e63bfdb6b24436464002fd0bef4fc5db355d8033ac072a7f6ec2970959e0f`)
* `qualification_summary.json`: `26781ced51f00a7cb51acb187f4047b4a5d3a2a4bd8c86ac3a2b544b8e7a2308`
* `fault_injection_report.json`: `18e09711130094e03eed343ab46bf21653defc718d2f440f7012ee0df752c05b`
* `canary_verification.json`: `ce1a5decd569cbe1ed89b94a32774a48cc85596fa1d9f91d27acec7f7efe7b4b`
* `semantic_review.json`: `6a0f263c4838757381449dfd9a42a8beba8ce6ad40def5f92cb8312a6eaa9110`
* `isa_gates_matrix.json`: `3465ad5118c1ae2d536a0af07e195b2f75d0448e33ee1f14d740d799f0640aa2`
