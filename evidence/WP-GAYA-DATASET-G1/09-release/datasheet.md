# Ficha Técnica do Dataset (Datasheet) — As Crônicas de Gaya (Geração 1)

**Identificador KAD:** `ISA-GAYA-DATASET-G1-001`
**Versão da Release:** `1.0.0`
**Data da Release:** `2026-09-09T04:00:49.617908+00:00`
**Selo Criptográfico do Manifesto (SHA-256):** `bd56586d841558a8c8ef45db9a7b472ae89576f5b14593b193965afc4864d9c1`
**Status dos Portões ISA:** **11/11 APROVADOS (PASS)**
**Diretório Oficial de Release:** `evidence/WP-GAYA-DATASET-G1/09-release/`
**Regime de Direitos e Licença:** `INTERNAL_RPG_CANON` (Uso interno no projeto KAD-RPG / KAD-PI)

---

## 1. Composição do Corpus e Censo de Fontes (GAYA-G1-01, GAYA-G1-02, GAYA-G1-03)

O corpus de entrada foi censurado exaustivamente a partir do repositório autoritário `/home/amdy/Work/kad-rpg/kad-gaya`:
* **Total de Arquivos Descobertos:** 321 arquivos (397.3 MB)
* **Documentos de Lore Positivo Aprovados:** 149 documentos
* **Ativos de Mídia Rastreados:** 151 imagens (PNG, WebP, JPG)
* **Estruturas de Dados Internas:** 3 arquivos (.jsonl, .json)
* **Documentação Operacional:** 6 arquivos (.md, .txt)
* **Códigos e Ferramentas Excluídos:** 17 arquivos (.py) com justificativa explícita de exclusão
* **Bancos de Dados Excluídos:** 1 arquivo (.sqlite) com justificativa de exclusão
* **Taxa de Queda Silenciosa (Silent Drops):** **0% (Zero perdas)**
* **Falhas de Parser e OCR Pendente:** **0**

---

## 2. Exemplos Sintéticos Normalizados e Treinamento (GAYA-G1-06, GAYA-G1-07)

Foram compilados **37 exemplos sintéticos canônicos** com **39 fitas de replay determinísticas**, particionados estritamente por escopo cognitivo e divisão de treino:

### Distribuição por Divisão de Dados (Splits)
* **`train`:** 26 exemplos (70.3%)
* **`validation`:** 2 exemplos (5.4%)
* **`test`:** 9 exemplos (24.3%)

### Distribuição por Escopo de Conhecimento (Scopes)
* **`persona`:** 16 exemplos (foco na voz e perspectiva de personagens como Ayşa Öztoprak)
* **`world_planner`:** 10 exemplos (foco em mecânicas, regras de combate e economia)
* **`narrator`:** 11 exemplos (foco em cosmogonia, fronteiras e fatos canônicos)

### Cobertura das 8 Famílias Canônicas Pré-registradas
1. `grounded_lore_qa`: 5 exemplos
2. `character_identity_and_style`: 4 exemplos
3. `relationships_and_evidence_paths`: 5 exemplos
4. `items_and_mechanics`: 5 exemplos
5. `spatial_containment_and_routes`: 4 exemplos
6. `visual_entity_references`: 4 exemplos
7. `bounded_situational_decisions`: 5 exemplos
8. `memory_and_abstention`: 5 exemplos

---

## 3. Bundles de Release Segregados para Consumidores (GAYA-G1-08)

A release é estruturada em três bundles independentes e desacoplados:

### A. Bundle de Treinamento (`training/`)
* **Formatos:** JSONL nativo e formato padrão ShareGPT (`training/sharegpt/<scope>/<split>.jsonl`).
* **Sidecar de Proveniência Lossless (`training/provenance.jsonl`):** 37 registros vinculando cada exemplo aos hashes dos arquivos-fonte, ID da semente, escopo e veredito de revisão (`lineage_resolution_rate: 1.0`).
* **Consumo Offline Verificado:** `TrainingParserConsumer` aprovou 100% dos exemplos com estimativa de tokens (média 41 tokens/turno) e 0 canários.

### B. Bundle do Game Engine (`game/`)
* **Grafo Canônico (`game/world.json`):**
  * **53 entidades canônicas** (Akuanduba, Ayşa Öztoprak, Amethysta, etc.).
  * **8 relacionamentos tipados** com integridade referencial estrita (**0 entidades órfãs**).
  * **Grafo de Navegação Espacial:** 16 nós e 13 arestas comprovadas.
  * **Regras Canônicas Validadas:** Proibição de síntese em vivos, Redução de Dano (RD 2 na Crosta de Kravarius), Dano Verdadeiro irredutível e conservação de moedas (1 Yorman = 100 Khan).
  * **Geografia Desconhecida:** Zonas inexploradas mantidas estritamente como `UNKNOWN_PROPOSED` com coordenadas `null` (zero geometria inventada).
* **Catálogo de Ativos Visuais (`game/assets.jsonl`):** 151 imagens classificadas com dimensões extraídas via `struct` nativo em puro Python.

### C. Bundle de Scoped Retrieval / RAG (`rag/`)
* **Registros de Consulta (`rag/records.jsonl`):** 304 trechos canônicos indexados com SHA-256 e referência de fonte verificada.
* **Isolamento de Escopo:** Consultas sob escopo `persona` nunca têm acesso a segredos ou notas de narrador.

---

## 4. Garantias Críticas de Segurança, Qualificação e Falhas (GAYA-G1-04, GAYA-G1-09, GAYA-G1-10)

* **Canários Secretos (`canary_verification.json`):** Zero escapes de `CANARY_SEC_001` ou `CANARY_SEC_002` em toda a release; sensor de controle positivo `CANARY_CTRL_POS_001` operacional.
* **Alegações Revogadas:** Zero ocorrências de alegações proibidas ("Sofia mãe de Lylia", "Amethysta namorada de Lylia", etc.) em todos os arquivos de release.
* **Suíte Metamórfica Adversarial:** 4 mutações testadas (`MUT_NEG_001`, `MUT_DIR_001`, `MUT_UNIT_001`, `MUT_REL_001`), **100% detectadas, 0 escapes**.
* **Revisão Semântica Independente:** Amostra estratificada de 28 exemplos (**76% de cobertura**, superando o mínimo de 20%), **100% de cobertura de sementes de alto risco**, **0 rejeições**.
* **Tolerância a Falhas e Recuperação:** 5/5 testes de injeção de falhas passaram (escrita interrompida, injeção de alegação revogada, injeção de canário, ativo ausente), comprovando ausência de falso COMPLETE e preservação integral da release original.
* **Determinismo Bit-a-Bit:** Replay independente produz exatamente os mesmos bytes e hashes SHA-256.

---

## 5. Limitações Conhecidas e Não-Objetivos

1. **Ausência de Treinamento Conduzido:** Nenhum ajuste fino ou treinamento de pesos foi realizado; a release entrega apenas os dados pré-qualificados.
2. **Não Autoriza Invenção de Lore:** A aprovação desta release restringe-se estritamente aos fatos extraídos das fontes canônicas; o modelo não possui autoridade para extrapolar fora do cânone consolidado.
3. **Escopos de Visibilidade:** Agentes atuando como personagens (personas) devem consumir exclusivamente arquivos do escopo `persona`, preservando a barreira contra segredos narrativos.

---

## 6. Comandos para Reexecução e Verificação

### Verificação Nativa via KAD ISA CLI
```bash
node bin/kad-isa check docs/gaya/dataset-generation/ISA-GAYA-DATASET-G1-001.md
```

### Qualificação e Verificação Offline via Dataset CLI
```bash
python3 -m pipeline.dataset_cli verify --release evidence/WP-GAYA-DATASET-G1/09-release
```

### Replay Determinístico Bit-a-Bit
```bash
python3 -m pipeline.dataset_cli replay --release evidence/WP-GAYA-DATASET-G1/09-release --output /tmp/gaya_replay_check
```
