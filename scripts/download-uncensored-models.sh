#!/usr/bin/env bash
# scripts/download-uncensored-models.sh
# Download manager for Top Uncensored Roleplay models on Vulkan GPU (8GB VRAM)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORK_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEST_DIR="$WORK_ROOT/.models/gguf/world"
ST_MODELS="$WORK_ROOT/kad-sillytavern/models"
CHUNKS="${MODEL_CHUNKS:-8}"

mkdir -p "$DEST_DIR" "$ST_MODELS"

declare -A MODEL_FILES=(
  ["lunaris"]="L3-8B-Lunaris-v1-Q4_K_M.gguf"
  ["dolphin"]="Dolphin3.0-Llama3.1-8B-Q4_K_M.gguf"
  ["neural-daredevil"]="NeuralDaredevil-8B-abliterated-Q4_K_M.gguf"
  ["hermes3"]="Hermes-3-Llama-3.1-8B.Q4_K_M.gguf"
  ["openhermes"]="openhermes-2.5-mistral-7b.Q4_K_M.gguf"
  ["llama-abliterated"]="Meta-Llama-3.1-8B-Instruct-abliterated-Q4_K_M.gguf"
  ["dark-planet"]="Llama-3.1-128k-Dark-Planet-Uncensored-8B-Q4_k_m.gguf"
  ["chaos-rp"]="Chaos_RP_l3_8B-Q4_K_M-imat.gguf"
  ["gemma-e4b"]="Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-Q4_K_M.gguf"
  ["rocinante"]="Rocinante-12B-v1.1-Q4_K_M.gguf"
  ["violet-lotus"]="MN-Violet-Lotus-12B.Q4_K_M.gguf"
  ["stheno"]="L3-8B-Stheno-v3.2-Q4_K_M.gguf"
  ["qwen"]="Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Q4_K_M.gguf"
  ["rp-hero"]="L3.1-RP-Hero-InBetween-8B-D_AU-Q4_k_m.gguf"
  ["lumimaid"]="Llama-3-Lumimaid-8B-v0.1-OAS-Q4_K_M-imat.gguf"
)

declare -A MODEL_URLS=(
  ["lunaris"]="https://huggingface.co/bartowski/L3-8B-Lunaris-v1-GGUF/resolve/main/L3-8B-Lunaris-v1-Q4_K_M.gguf"
  ["dolphin"]="https://huggingface.co/cognitivecomputations/Dolphin3.0-Llama3.1-8B-GGUF/resolve/main/Dolphin3.0-Llama3.1-8B-Q4_K_M.gguf"
  ["neural-daredevil"]="https://huggingface.co/bartowski/NeuralDaredevil-8B-abliterated-GGUF/resolve/main/NeuralDaredevil-8B-abliterated-Q4_K_M.gguf"
  ["hermes3"]="https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B-GGUF/resolve/main/Hermes-3-Llama-3.1-8B.Q4_K_M.gguf"
  ["openhermes"]="https://huggingface.co/TheBloke/OpenHermes-2.5-Mistral-7B-GGUF/resolve/main/openhermes-2.5-mistral-7b.Q4_K_M.gguf"
  ["llama-abliterated"]="https://huggingface.co/bartowski/meta-llama-3.1-8b-instruct-abliterated-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-abliterated-Q4_K_M.gguf"
  ["dark-planet"]="https://huggingface.co/DavidAU/Llama-3.1-128k-Dark-Planet-Uncensored-8B-GGUF/resolve/main/Llama-3.1-128k-Dark-Planet-Uncensored-8B-Q4_k_m.gguf"
  ["chaos-rp"]="https://huggingface.co/Lewdiculous/Chaos_RP_l3_8B-GGUF-IQ-Imatrix/resolve/main/Chaos_RP_l3_8B-Q4_K_M-imat.gguf"
  ["gemma-e4b"]="https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive/resolve/main/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-Q4_K_M.gguf"
  ["rocinante"]="https://huggingface.co/bartowski/Rocinante-12B-v1.1-GGUF/resolve/main/Rocinante-12B-v1.1-Q4_K_M.gguf"
  ["violet-lotus"]="https://huggingface.co/mradermacher/MN-Violet-Lotus-12B-GGUF/resolve/main/MN-Violet-Lotus-12B.Q4_K_M.gguf"
)

declare -A MODEL_SIZES=(
  ["lunaris"]=4920734240
  ["dolphin"]=4920745856
  ["neural-daredevil"]=4920734272
  ["hermes3"]=4920733824
  ["openhermes"]=4368450304
  ["llama-abliterated"]=4920734720
  ["dark-planet"]=4920734848
  ["chaos-rp"]=4920733856
  ["gemma-e4b"]=5335285728
  ["rocinante"]=7477203712
  ["violet-lotus"]=7477209440
  ["stheno"]=4920734240
  ["qwen"]=5627044224
  ["rp-hero"]=4920767200
  ["lumimaid"]=4920733888
)

declare -A MODEL_DESCRIPTIONS=(
  ["stheno"]="L3-8B-Stheno-v3.2: Classic SillyTavern RP specialist (16k ctx, Llama 3)"
  ["qwen"]="Qwen3.5-9B-Uncensored-HauhauCS: Top dense pick for 8GB VRAM (16k ctx, ChatML)"
  ["rp-hero"]="L3.1-RP-Hero-InBetween-8B: Balanced roleplay fine-tune (16k ctx, Llama 3.1)"
  ["lumimaid"]="Llama-3-Lumimaid-8B: Creative RP fine-tune (16k ctx, Llama 3)"
  ["lunaris"]="L3-8B-Lunaris-v1: Emotional intelligence & high prose consistency (Llama 3)"
  ["dolphin"]="Dolphin 3.0 Llama 3.1 8B: Zero-refusal versatile roleplay & general chat"
  ["neural-daredevil"]="NeuralDaredevil 8B: Unfiltered creative writing without guardrails"
  ["hermes3"]="Nous Hermes 3 8B: Complex GM, world-building & multi-turn agent logic"
  ["openhermes"]="OpenHermes 2.5 Mistral 7B: Classic lightweight staple, snappy on 8GB"
  ["llama-abliterated"]="Llama 3.1 8B Instruct Abliterated: Official alignment removed"
  ["dark-planet"]="Dark Planet Uncensored 8B: Specialized for dark / dystopian fantasy"
  ["chaos-rp"]="Chaos RP L3 8B: Wild, unrestricted dialogue with high character fidelity"
  ["gemma-e4b"]="Gemma-4-E4B Uncensored: Ultra-fast loading, descriptive analytical style"
  ["rocinante"]="Rocinante 12B v1.1: Long-form fiction, needs light CPU offload on 8GB VRAM"
  ["violet-lotus"]="MN-Violet-Lotus 12B: Mistral Nemo base, rich emotion & long memory"
)

check_installed() {
  local id="$1"
  local file="${MODEL_FILES[$id]}"
  local exp_size="${MODEL_SIZES[$id]}"

  local paths=("$DEST_DIR/$file" "$WORK_ROOT/.models/gguf/retrieval/$file" "$ST_MODELS/$file")
  for p in "${paths[@]}"; do
    if [[ -f "$p" ]]; then
      local sz
      sz=$(stat -c%s "$p" 2>/dev/null || echo 0)
      if [[ "$sz" -eq "$exp_size" ]]; then
        return 0
      fi
    fi
  done
  return 1
}

list_models() {
  echo "=== Top Uncensored Models Catalog for 8GB VRAM ==="
  printf "%-18s %-12s %-8s %s\n" "ID" "STATUS" "SIZE" "DESCRIPTION"
  echo "--------------------------------------------------------------------------------"
  for id in stheno qwen rp-hero lumimaid lunaris dolphin neural-daredevil hermes3 openhermes llama-abliterated dark-planet chaos-rp gemma-e4b rocinante violet-lotus; do
    local sz_mb=$((MODEL_SIZES[$id] / 1024 / 1024))
    if check_installed "$id"; then
      printf "\e[32m%-18s %-12s\e[0m %4d MB   %s\n" "$id" "INSTALLED" "$sz_mb" "${MODEL_DESCRIPTIONS[$id]}"
    else
      printf "\e[33m%-18s %-12s\e[0m %4d MB   %s\n" "$id" "AVAILABLE" "$sz_mb" "${MODEL_DESCRIPTIONS[$id]}"
    fi
  done
}

download_model() {
  local id="$1"
  if [[ -z "${MODEL_URLS[$id]:-}" ]]; then
    echo "Unknown model ID: $id"
    exit 1
  fi

  if check_installed "$id"; then
    echo "Model '$id' is already installed."
    return 0
  fi

  local file="${MODEL_FILES[$id]}"
  local url="${MODEL_URLS[$id]}"
  local size="${MODEL_SIZES[$id]}"
  local target="$DEST_DIR/$file"
  local tmp="$DEST_DIR/.${file}.parts"

  echo ">>> Downloading $id ($file, $((size / 1024 / 1024)) MB) using $CHUNKS parallel streams..."
  mkdir -p "$tmp"

  local -a pids=()
  for ((i=0; i<CHUNKS; i++)); do
    local start=$((size * i / CHUNKS))
    local end=$((size * (i + 1) / CHUNKS - 1))
    local part="$tmp/$i"
    local expected_part_size=$((end - start + 1))
    local cur_size=0
    if [[ -f "$part" ]]; then
      cur_size=$(stat -c%s "$part" 2>/dev/null || echo 0)
    fi
    if [[ "$cur_size" -ge "$expected_part_size" ]]; then
      continue
    fi
    local chunk_start=$((start + cur_size))
    curl -fL --retry 15 --retry-delay 2 --retry-all-errors --range "$chunk_start-$end" -o - "$url" >> "$part" 2>"$tmp/$i.log" &
    pids+=("$!")
  done

  for p in "${pids[@]}"; do
    wait "$p"
  done

  echo ">>> Assembling parts for $file..."
  local assembled="$DEST_DIR/.${file}.assembled"
  : > "$assembled"
  for ((i=0; i<CHUNKS; i++)); do
    local part="$tmp/$i"
    local expected_part_size=$((size * (i + 1) / CHUNKS - size * i / CHUNKS))
    if [[ "$(stat -c%s "$part")" -ne "$expected_part_size" ]]; then
      echo "Error: Part $i corrupted. Please re-run."
      rm -f "$assembled"
      return 1
    fi
    cat "$part" >> "$assembled"
  done

  if [[ "$(stat -c%s "$assembled")" -ne "$size" ]]; then
    echo "Error: Assembled file size mismatch."
    rm -f "$assembled"
    return 1
  fi

  mv -f "$assembled" "$target"
  rm -rf "$tmp"

  # Link into SillyTavern models directory
  ln -sf "$target" "$ST_MODELS/$file"

  echo "[OK] Successfully installed $id -> $target"
}

case "${1:-list}" in
  list)
    list_models
    ;;
  download)
    if [[ -z "${2:-}" ]]; then
      echo "Usage: $0 download <model-id|all>"
      exit 1
    fi
    if [[ "$2" == "all" ]]; then
      for id in lunaris dolphin neural-daredevil hermes3 openhermes llama-abliterated dark-planet chaos-rp gemma-e4b rocinante violet-lotus; do
        download_model "$id"
      done
    else
      download_model "$2"
    fi
    ;;
  *)
    echo "Usage: $0 [list | download <id|all>]"
    exit 1
    ;;
esac
