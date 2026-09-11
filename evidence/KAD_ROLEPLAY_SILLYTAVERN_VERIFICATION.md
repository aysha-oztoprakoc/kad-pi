# KAD / SillyTavern Roleplay Stack Verification Evidence

**Date:** 2026-09-07  
**Authority:** `PRIME_DIRECTIVE.md`, ADR 0008, `config/local-models.registry.json`  
**Scope:** Local private roleplaying chatbot infrastructure via SillyTavern + KoboldCpp (Vulkan GPU)  
**Status:** `VERIFIED`

---

## 1. Stack & Model Verification
The stack verification script was executed against the canonical model store:
```bash
bash kad-sillytavern/verify-stack.sh
```
**Result:** `PASS (Exit 0)`
- KoboldCpp: `1.119` (Vulkan acceleration, AMD Radeon RX 9060 XT)
- SillyTavern commit: `8172dcd0ee672d3cd9a5e5f7af134f91a45cd2b8`
- `L3-8B-Stheno-v3.2-Q4_K_M.gguf`: `OK` (4,920,734,240 bytes, valid GGUF header)
- `L3.1-RP-Hero-InBetween-8B-D_AU-Q4_k_m.gguf`: `OK` (4,920,767,200 bytes, valid GGUF header)
- `Llama-3-Lumimaid-8B-v0.1-OAS-Q4_K_M-imat.gguf`: `OK` (4,920,733,888 bytes, valid GGUF header)
- `Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Q4_K_M.gguf`: `OK` (5,627,044,224 bytes, valid GGUF header)

---

## 2. Character Cards & Lorebook Assets
Generated via `scripts/build-kad-roleplay.mjs` and unified in `scripts/build-gaya-sillytavern.mjs`:
- **Character Cards:**
  - `KAD_DATA_Archivist.png`: `TavernCardValidator` validates V3 (`validateV3() === true`)
  - `KAD_DATA_Narrator.png`: `TavernCardValidator` validates V3 (`validateV3() === true`)
- **Lorebook:** `KAD_Narrative.json`
  - 5 source-grounded entries (`KAD / DATA Enquadramento`, `Cosmologia Três Forças`, `CAIN e Jamais Vu`, `Protocolo Leviathan`, `Geografia Narrativa de Salvador`)
  - Bound per-character via `card.data.extensions.world = "KAD_Narrative"` (preventing global cross-character contamination)
  - Provenance: embedded SHA256 hashes of 10 source documents from `/home/amdy/xxx/st/` and `/home/amdy/Downloads/kad-rpg/`
- **QuickReplies:** `KAD_Roleplay.json`
  - `📝 Sumário Local`: `/summarize source=main`
  - `🔍 Buscar Banco (RAG)`: `/db-search source=chat count=3 `
  - `📌 Nota de Cena`: `/send [REGISTRO FORENSE // NOTA DE CENA: ]`
  - `⚖️ Verificar Incerteza`: Forensic clinical query template

---

## 3. Formatting & Prompt Alignment
- **Instruct Preset:** `Llama-3-Gaya` updated with actual Llama 3 tokens:
  - Input: `<|start_header_id|>user<|end_header_id|>\n\n`
  - Output: `<|start_header_id|>assistant<|end_header_id|>\n\n`
  - System: `<|start_header_id|>system<|end_header_id|>\n\n`
  - Stop: `<|eot_id|>`
- **Context Template:** `Llama 3 Instruct` (16,384 context length matching KoboldCpp)
- **Sampler Preset:** `Gaya-Stheno` (`min_p: 0.08`, `rep_pen: 1.08`, `temp: 1.05`, `streaming_kobold: true`)
- **Connection Profile:** `kad-local-roleplay` (`http://127.0.0.1:5001/api`, no fake model switching)

---

## 4. End-to-End Live Execution Evidence

### 4.1 World Info Activation
Tested live in SillyTavern with input mentioning `KHAYN` and `Salvador`:
- Entries activated: `Geografia Narrativa de Salvador`, `Cosmologia das Três Forças`, `KAD / DATA Enquadramento Operacional`
- Injected context: 1,096 characters added to prompt before character card

### 4.2 Local Turn Generation
- **Character:** `DATA — Narradora da K.A.D.`
- **Input:** *"Eu caminho pela ladeira sob a chuva de Salvador e examino o atrito de KHAYN. O que a leitura registra?"*
- **Observed Response:**
> "O atrito de KHAYN flui em ondas pulsacionais ao longo do asfalto, indicando áreas de sobrecarga energética nos pontos de conexão entre a fiação clandestina e os sistemas públicos. A leitura da K.A.D. sugere que a instalação poderia explodir a qualquer momento, causando danos extensivos à infraestrutura urbana e liberando correntes caóticas que podem afetar a mentalidade local.
>
> Já a atmosfera está pesada com a essência da cidade: óleo sintético, umidade marinha e um toque de desânimo que permeia a coluna vertebral... Em primeiro plano, as ruas do Pelourinho parecem imunes a essa degeneração... Será que eles já perceberam sua presença aqui?"

### 4.3 Local Memory Summarization
- **Command:** `/summarize source=main`
- **Observed Output:** 1,058 characters summarized entirely via KoboldCpp on port 5001 without external API calls.

### 4.4 Network Isolation & Loopback Confinement
- Socket audit via `ss -tupan` confirmed:
  - SillyTavern bound to `127.0.0.1:8000`
  - KoboldCpp bound to `127.0.0.1:5001`
  - All communication was strictly `127.0.0.1:8000 <-> 127.0.0.1:5001`
  - Zero external IP connections or DNS queries observed.

### 4.5 Failure Boundary & Graceful Degradation
- Probed with offline target port `5099`: failed closed with `ConnectionRefused` without fallback to external cloud services.
