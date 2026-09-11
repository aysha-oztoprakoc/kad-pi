# Recibo de Execução — Frame 01: Shared Contracts & Safe Entrypoint

- **Workpackage**: `WP-GAYA-DATASET-G1-01`
- **Projeto**: `kad-rpg` (SIDE_PROJECT)
- **Claim ID**: `3dd4bb4a-e436-4db2-ab41-15c1e3a459f5`
- **Base Commit**: `0389137746b0e92a34013e7cf72abfbf0679c1e4`
- **Ambiente Python**: Python 3.12.14
- **Data de Execução**: 2026-09-09
- **Status do Frame**: `BUILDER_COMPLETE` / `READY_FOR_HANDOFF`

---

## 1. Contratos Extendidos em `pipeline/schemas.py`

### 1.1 Códigos de Disposição Terminal (`SourceDisposition`)
| Código | Semântica Canônica |
|---|---|
| `POSITIVE_LORE_CANDIDATE` | Documentos markdown, PDFs, DOCX/ODT contendo lore canônico e fichas de personagens |
| `MEDIA_ASSET` | Imagens e ativos visuais (`.png`, `.webp`, `.jpg`, etc.) |
| `STRUCTURED_DATA` | Listas de magias, dados estruturados JSON e diários de persistência |
| `DOCUMENTATION` | Documentação técnica de engenharia, relatórios e planos |
| `EXCLUDED_CODE` | Código-fonte de ferramentas e scripts executáveis (`.py`, `.sh`, `.mjs`, etc.) |
| `EXCLUDED_DATABASE` | Bancos relacionais operacionais (`.sqlite`, `.db`) excluídos da ingestão primária |

### 1.2 Registros Canônicos da Seção 3.1 da ISA
- `SourceDocument`: Documento descoberto com SHA-256, tamanho, caminho relativo e disposição terminal.
- `EvidenceSpan`: Âncora exata com offset de caracteres, verificação de integridade verbatim e prevenção de truncamento.
- `ExtractionRecord`: Rastreamento de fidelidade e limites de parser.
- `ClaimRecord`: Afirmação semântica com polaridade explícita (`polarity: bool`), temporalidade e escopo de contexto.
- `ReviewDecision`: Decisão imutável de autoridade.
- `MediaAssetRecord`: Ativo multimídia com digest e entidades retratadas.
- `SyntheticExampleRecord`: Exemplo sintético com família, split, requisitos de evidência e elegibilidade de treino.
- `StageManifest`: Manifesto de estágio com selamento determinístico por SHA-256 (`sealed_sha256`).

---

## 2. Ponto de Entrada da CLI (`pipeline/dataset_cli.py`)

Comandos suportados e seus comportamentos verificados:

```bash
# 1. Inspect: Real corpus read-only censo (PASS, zero writes)
python -m pipeline.dataset_cli inspect --config dataset_runs/staging/01-contracts/validated-config.json

# 2. Run: Despacho fail-closed explícito para Frame 02
python -m pipeline.dataset_cli run --config dataset_runs/staging/01-contracts/validated-config.json --output dataset_runs/staging/01-contracts/test_run
# Saída: [DISPATCH BLOCKED] O estágio de execução 'run' não está disponível no Frame 01. A execução do pipeline de ingestão e extração de corpus pertence ao Frame 02 (WP-GAYA-DATASET-G1-02).

# 3. Verify: Despacho fail-closed explícito para Frame 08
python -m pipeline.dataset_cli verify --release dataset_runs/staging/01-contracts
# Saída: [DISPATCH BLOCKED] O estágio de qualificação 'verify' não está disponível no Frame 01. A qualificação semântica e estrutural de release pertence ao Frame 08 (WP-GAYA-DATASET-G1-08).

# 4. Replay: Despacho fail-closed explícito para Frame 06
python -m pipeline.dataset_cli replay --release dataset_runs/staging/01-contracts --output dataset_runs/staging/01-contracts/replay_out
# Saída: [DISPATCH BLOCKED] O estágio de verificação 'replay' não está disponível no Frame 01. A reprodução determinística por fita de respostas pertence ao Frame 06 (WP-GAYA-DATASET-G1-06).
```

---

## 3. Censo Real do Corpus (Zero-Write Invariant)

- **Diretório Inspecionado**: `/home/amdy/Work/kad-rpg/kad-gaya`
- **Total de Arquivos Descobertos**: 315
- **Total de Bytes**: 397,046,643 (~378.6 MB)
- **Distribuição por Disposição**:
  - `POSITIVE_LORE_CANDIDATE`: 143
  - `MEDIA_ASSET`: 151
  - `STRUCTURED_DATA`: 3
  - `DOCUMENTATION`: 6
  - `EXCLUDED_CODE`: 11
  - `EXCLUDED_DATABASE`: 1
- **Capacidades do Sistema Detectadas**:
  - `pdftotext`: Presente (`true`)
  - `soffice`: Presente (`true`)
  - `tesseract`: Presente (`true`)
  - `python_version`: `3.12.14`

---

## 4. Bateria de Testes Unitários

- **Comando**: `python -m unittest discover kad-gaya/tests`
- **Suítes**: `test_e2e_pipeline.py` (7 testes) + `test_dataset_cli_and_schemas.py` (15 testes)
- **Total de Testes**: 22
- **Falhas**: 0
- **Erros**: 0
- **Tempo de Execução**: 0.46s

---

## 5. Selamento de Manifesto (`manifest.json`)

- **Stage ID**: `WP-GAYA-DATASET-G1-01`
- **Manifest Hash (SHA-256)**: `59ef0bf76d59a3a601ede4976987c9b3cc877182ea6b894564e028a35370ccad`
- **Invariante**: Nem o manifesto em si nem recibos de aceitação são recursivamente hasheados no payload.
