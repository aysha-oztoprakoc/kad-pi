# Recibo de Execução — Frame 07: Exportação de Bundles de Treinamento, Jogo e Scoped Retrieval

**Workpackage:** `WP-GAYA-DATASET-G1-07`
**Projeto:** `kad-rpg` (`SIDE_PROJECT`)
**Claim ID:** `54b77de2-4038-46ae-8b59-088f05d483de`
**Base Commit / Fixed Point:** `0389137746b0e92a34013e7cf72abfbf0679c1e4`
**Status:** `REVIEW` (Execução Concluída com Sucesso)
**Timestamp:** `2026-09-09T03:29:19.413530+00:00`
**Portões ISA Cobertos:** `GAYA-G1-05` (Ancoragem Visual), `GAYA-G1-08` (Consumidores Offline e Linhagem) e `GAYA-G1-10` (Determinismo de Release)

---

## 1. Escopo e Limites de Mutação Executados
Todos os artefatos modificados e gerados residem estritamente dentro da fronteira autorizada (`owned_paths`):
- `kad-gaya/training/sharegpt_exporter.py`: Extensão com `export_scoped_splits`, formatação ShareGPT estrita (`id` e `conversations`) e geração paralela de sidecar lossless de proveniência.
- `kad-gaya/training/release_exporter.py`: Motor unificado de release (`ReleaseExporter`), e três consumidores offline executáveis: `TrainingParserConsumer`, `GameContentLoaderConsumer` e `ScopedRetrieverConsumer`.
- `kad-gaya/pipeline/dataset_cli.py`: Despacho da etapa `07-consumers` via subcomando `run --stage consumers` com execução e registro isolado dos três testes de fumaça.
- `kad-gaya/tests/test_dataset_cli_and_schemas.py`: Adição dos testes 23, 24 e 25 cobrindo exportação completa, qualificação sem modelo dos consumidores e determinismo de release bit-idêntico.
- `kad-gaya/dataset_runs/staging/07-consumers/`: Staging virgem contendo os três bundles segregados, recibos de fumaça e manifestos selados.

---

## 2. Segregação e Contagem dos Bundles de Release

| Bundle de Release | Artefatos Principais | Contagem de Itens | Status de Consumo |
| :--- | :--- | :--- | :--- |
| **Treinamento** | `training/<scope>/<split>.jsonl`<br>`training/sharegpt/<scope>/<split>.jsonl`<br>`training/provenance.jsonl` | 37 exemplos normalizados<br>37 conversações ShareGPT<br>37 entradas no sidecar | **PASS** (100% linhagem resolvida, 0 canários) |
| **Game Engine** | `game/world.json`<br>`game/assets.jsonl` | 53 entidades canônicas<br>8 relacionamentos tipados<br>151 ativos de mídia verificados | **PASS** (0 ativos não resolvidos, regras validadas) |
| **Scoped Retrieval** | `rag/records.jsonl` | 304 registros recuperáveis | **PASS** (0 citações inválidas, isolamento comprovado) |

---

## 3. Qualificação dos Três Consumidores Offline (Critério de Aceitação 1 - GAYA-G1-08)

### A. TrainingParserConsumer (`training_parser_smoke.json`)
- **Arquivos Inspecionados:** 7 arquivos ShareGPT (`persona`, `world_planner`, `narrator`) e 7 arquivos internos.
- **Taxa de Resolução de Linhagem no Sidecar:** **100.0%** (37/37 exemplos mapeados para fontes e seeds).
- **Verificação Multimodal:** 10/10 exemplos visuais com imagens reais verificadas (cabeçalho de formato PNG/WebP e dimensões validadas via `struct` nativo).
- **Vazamento de Canários Secretos:** **0 violações**.

### B. GameContentLoaderConsumer (`game_loader_smoke.json`)
- **Integridade Referencial:** 53 entidades carregadas, 8 relações verificadas, **0 entidades órfãs**.
- **Resolução de Ativos de Mídia:** 151 ativos checados contra o disco, **0 ativos não resolvidos**.
- **Geografia Desconhecida:** Regiões desconhecidas (ex.: Estepes Cinzentas Além-Kravarius) mantidas estritamente como `UNKNOWN_PROPOSED` com coordenadas `None` (Critério de Aceitação 2).
- **Regras Canônicas Exercitadas:**
  - *Proibição de Fios Vivos:* Violação canônica rejeitada (`allowed: false, verdict: VIOLATION`).
  - *Redução de Dano:* Dano de 10 reduzido para 8 com RD 2; Dano Verdadeiro não reduzido (10).
  - *Conservação de Moedas:* 1 Yorman = 100 Khan, conservação estrita em trocas.
- **Canários e Fatos Revogados:** **0 encontrados**.

### C. ScopedRetrieverConsumer (`scoped_retrieval_smoke.json`)
- **Registros Indexados:** 304 trechos canônicos com hash SHA-256 e referência de fonte verificada.
- **Isolamento de Escopo:** Consultas sob escopo `persona` nunca acessam notas secretas de narrador.
- **Buscas Testadas:** 19 correspondências para queries legítimas ("Gaya"), **0 correspondências para canários** e **0 correspondências para fatos revogados** ("Sofia mãe de Lylia").

---

## 4. Comprovação Criptográfica de Determinismo de Release (GAYA-G1-10)

Execuções repetidas da CLI com destinos distintos (`staging/07-consumers-a` vs `staging/07-consumers-b`):
- `sealed_sha256`: idêntico em ambas as execuções.
- Hashes de todos os artefatos nos bundles: idênticos bit a bit.

---

## 5. Manifesto Selado e Hashes dos Artefatos
- **Manifesto do Estágio:** `manifest.json` (SHA-256 do Selo: `2ded0edd5db7c6676ee52c910ce60bd23bc20ba50d8d74ad7c24a32220705e93`)
- **Manifesto de Release:** `consumer_manifest.json` (SHA-256 do Selo: `04fea0862991d06b4b2e0398cce4f037092f1d72a6b0985b1b8cf2c321bf8b9a`)
- `training/provenance.jsonl`: `bb4970d9cb7aa3efcd1364a0b7f71642ab74eeed4283cb8629c243c778055636`
- `game/world.json`: `f25435aa5198a4c96d05636a0edb512a796ffabd30ede3390a0769b50feb825b`
- `game/assets.jsonl`: `6a25b0e9998a10411ccd9f73a13296347125fb5fdff54980040a303565462c3a`
- `rag/records.jsonl`: `29aab452df71821d88c2d54aad24c8a29ea1d455b2907285513ab6e860107a9d`

---

## 6. Verificação Determinística
- **Suíte de Testes Unitários:** `python -m unittest discover kad-gaya/tests`
  - 39 testes executados, 39 aprovados (`OK`), 0 falhas, 0 erros em 95.35s.
