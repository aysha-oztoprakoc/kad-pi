# Recibo de Execução — Frame 02: Qualificação Completa de Ingestão e Fontes

**Workpackage:** `WP-GAYA-DATASET-G1-02`
**Projeto:** `kad-rpg` (`SIDE_PROJECT`)
**Claim ID:** `d8c7190b-f446-42e9-9665-cbbad923f459`
**Base Commit / Fixed Point:** `0389137746b0e92a34013e7cf72abfbf0679c1e4`
**Status:** `REVIEW` (Execução Concluída com Sucesso)
**Timestamp:** `2026-09-09T02:14:01.328055+00:00`

---

## 1. Escopo e Limites de Mutação Executados
Todos os artefatos modificados e gerados residem estritamente dentro da fronteira autorizada (`owned_paths`):
- `kad-gaya/ingestion/corpus_ingestor.py`: Motor determinístico de censo e extração sem perdas.
- `kad-gaya/pipeline/dataset_cli.py`: Despacho do subcomando `run` com validação de colisão e contenção.
- `kad-gaya/pipeline/schemas.py`: Extensão de classificadores e extensões de descoberta sem dependências circulares.
- `kad-gaya/tests/test_dataset_cli_and_schemas.py`: Testes unitários do pipeline de ingestão e CLI.
- `kad-gaya/dataset_runs/staging/02-ingestion/`: Staging virgem de saída com evidências seladas.

---

## 2. Resultados do Censo e Reconciliação (Invariante Zero Silent Drops)
- **Total de Arquivos Descobertos:** `315`
- **Volume Total:** `397062319` bytes (~378.67 MB)
- **Verificação de Zero Quedas Silenciosas:** `PASS` (Soma das categorias = 315 == 315)
- **Famílias de Duplicatas Detectadas:** `17`

### Reconciliação Terminal:
- `processed_success` (Lore Canônico Extraído): **143**
- `pending_ocr` (PDFs/Imagens aguardando OCR): **0**
- `failed_parser` (Erros de Parser): **0**
- `media_assets` (Imagens e Ativos de Mídia Rastreados): **151**
- `structured_data` (Dados Estruturados): **3**
- `documentation` (Documentos Técnicos/Engenharia): **6**
- `excluded_code` (Código-fonte/Scripts excluídos): **11**
- `excluded_database` (Bancos operacionais legados excluídos): **1**

---

## 3. Manifesto Selado e Hashes dos Artefatos
- **Manifesto do Estágio:** `manifest.json` (SHA-256 do Selo: `28770e52f0471e0225dd5ae4a0cb936e5c005b21534077af7737e6e822cf66c6`)
- `ingestion_summary.json`: `e8c5a637d0f2c521f48e9278fd7f984f1ee23d9db32c9caea49b81c062b9efa9`
- `sources.jsonl`: `a478405b11eacdeaab66e0c7c75e105a3d84f20955c199f9dd290c59cbcb48e6`
- `extraction_records.jsonl`: `6a869d2b77e5c900abc12e110e0539b911776faf1f22faca232cc0f9201e1258`
- **Textos Extraídos em Staging:** `extracted_texts/` (146 arquivos `.txt` + 146 `.meta.json`)

---

## 4. Verificação Determinística
- **Suíte de Testes Unitários:** `python -m unittest discover kad-gaya/tests`
  - 23 testes executados, 23 aprovados (`OK`), 0 falhas, 0 erros em 1.83s.
