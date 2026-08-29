# WP-KAD-SHARED-MODEL-STORE-001: Local Model Research

**Method and date:** Primary-source sweep performed on 2026-08-29 using official model/org pages, official model cards, and official runtime docs. I did not download weights, install runtimes, or modify model authority/configuration.

## Ground rules for interpretation

- **Observed source fact** means the claim appears directly in the cited source.
- **Hardware-fit estimate** means I inferred fit from the observed source facts plus the observed node constraints (Ryzen 7 7700, 14 GiB RAM total, ~6.8 GiB available at probe, RX 9060 XT with 8,539,602,944-byte VRAM counter, no Vulkan/ROCm tools available).
- Where a source does not state a fact, I mark it **unknown** rather than guess.
- Tier labels used here:
  - **INSTALL_NOW**: likely sensible to try now on this node.
  - **QUALIFICATION_QUEUE**: promising, but I would gate behind validation / benchmark qualification.
  - **FUTURE_HARDWARE**: technically interesting but not a realistic local target on this node.
  - **REJECT**: not a fit for the local-model store trajectory.
  - **UNKNOWN**: insufficient authoritative data.

## Executive summary

Best local-fit candidates among the requested set are the small dense / edge models with official local-runtime support: **Qwen3.5-0.8B**, **Qwen3.5-4B**, **Ministral 3 3B Instruct/Reasoning**, **Ministral 3 8B Instruct/Reasoning**, and **Gemma 4 E2B/E4B Instruct**. **Nemotron 3 Nano 4B** is also viable, but its official license is NVIDIA-specific rather than Apache-2.0.

The large defer list is dominated by models that are technically impressive but not realistic fits for this machine. For Qwen, I found an authoritative official **Qwen3.8-27B** release, but I did **not** find an authoritative official **Qwen3.8-9B** release; the available evidence indicates 9B is a community distillation, not an official Qwen release.

## Comparison table

| Candidate | Upstream | Release / update date | License | Params | Quant availability / size (when sourced) | Vision | Tool calling | Reasoning | Coding | Context | Runtime support | Expected RAM / VRAM | Novel capability | Overlap | Tier |
|---|---|---:|---|---:|---|---|---|---|---|---|---|---|---|---|---|
| Qwen3.5-0.8B | Qwen / Alibaba Cloud | Release date not stated in the model card I read; Qwen3.5 blog exists but I could not reliably extract a date from it | Apache-2.0 | 0.8B | Unknown in official card | Yes: vision encoder; image-text-to-text | Supported by ecosystem-compatible card; native tool calling not explicitly claimed in card excerpt | Multimodal / thinking-oriented hybrid architecture; context 262,144 native | Yes, benchmarked on coding-related tasks in card | 262,144 native | Transformers, vLLM, SGLang, KTransformers, etc. | **Estimate:** fit in CPU RAM; likely also low-VRAM if quantized, but not sourced | Unified vision-language foundation; 262K context at tiny size | Overlaps with lightweight generalist, visual QA, and small coding assistants | INSTALL_NOW |
| Qwen3.5-4B | Qwen / Alibaba Cloud | Release date not stated in the model card I read | Apache-2.0 | 4B | Unknown in official card | Yes: vision encoder; image-text-to-text | Supported by ecosystem-compatible card; native tool calling not explicitly claimed in card excerpt | Hybrid architecture, multimodal, context 262,144 native | Yes, benchmarked on coding-related tasks in card | 262,144 native, extensible to 1,010,000 | Transformers, vLLM, SGLang, KTransformers, etc. | **Estimate:** likely fits with aggressive quantization / offload; BF16 is likely too large for this node's comfortable RAM headroom | 1M+ extensibility on a 4B multimodal model | Overlaps with general assistant, light coding, and some document tasks | QUALIFICATION_QUEUE |
| Ministral 3 3B Instruct | Mistral AI | December 2, 2025 (page + blog) | Apache-2.0 | 3B | The doc page states “Model Size: 2.58 GB” for the E2B page only; no exact 3B quant size sourced here | Yes: image understanding / vision | Official docs expose function-calling feature set for the family | Reasoning variant exists; instruct variant is strong general model | Yes: coding is a stated use case on the model page | 256K (family page) | Official Mistral docs; API features include function calling and document QnA | **Estimate:** likely INSTALL_NOW in quantized/local form; very plausible on this node | Edge-optimized 3B with vision and local setup support | Overlaps with local generalist, document Q&A, and coding assistant roles | INSTALL_NOW |
| Ministral 3 3B Reasoning | Mistral AI | December 2, 2025 (family launch) | Apache-2.0 | 3B | Unknown | Yes | Official function-calling support on docs site | Explicit reasoning variant exists | Yes | 256K (family page) | Official docs; local setup support implied on model page | **Estimate:** likely INSTALL_NOW | Same edge family, but reasoning-tuned | Overlaps with Stheno/WORLD-like reasoning, small agent use, and coding triage | INSTALL_NOW |
| Ministral 3 8B Instruct | Mistral AI | December 2, 2025 (page + blog) | Apache-2.0 | 8B | Unknown in the page I read | Yes | Official function-calling support on docs site | Reasoning variant exists in family, but this row is instruct | Yes | 256K (family page) | Official docs; local setup support stated | **Estimate:** borderline but plausible with quantization/offload; fits better than 12B+ | Best-in-class text and vision in Ministral family | Overlaps with general assistant and document tasks | QUALIFICATION_QUEUE |
| Ministral 3 8B Reasoning | Mistral AI | December 2, 2025 (family launch) | Apache-2.0 | 8B | Unknown | Yes | Official function-calling support on docs site | Explicit reasoning variant exists | Yes | 256K (family page) | Official docs; local setup support stated | **Estimate:** borderline but plausible with quantization/offload; may be tight on this node | Edge reasoning at the 8B tier | Overlaps with RP/WORLD-style reasoning plus coding assistant roles | QUALIFICATION_QUEUE |
| Gemma 4 E2B Instruct | Google DeepMind / Google | Last updated 2026-06-02 UTC on the AI Edge page; model card states Gemma 4 released with text, audio and image input | Apache-2.0 | 2.3B effective / 5.1B with embeddings | LiteRT page: 2.58 GB model size | Yes: text, image, audio | Native function calling / structured outputs in model card and docs | Yes: configurable thinking modes | Yes: code generation, completion, correction | 128K | LiteRT-LM, Transformers, and Google AI docs mention local execution / deployment | **Estimate:** likely INSTALL_NOW with quantized/local runtime; model size page suggests small footprint | Multimodal + audio + document parsing + variable image resolution | Overlaps with multimodal doc intelligence, OCR, screen understanding, and coding | INSTALL_NOW |
| Gemma 4 E4B Instruct | Google DeepMind / Google | Last updated 2026-06-02 UTC on the AI Edge page | Apache-2.0 | 4.5B effective / 8B with embeddings | LiteRT page: 3.65 GB model size | Yes: text, image, audio | Native function calling / structured outputs in model card and docs | Yes | Yes | 128K | LiteRT-LM, Transformers, and Google AI docs mention local execution / deployment | **Estimate:** likely INSTALL_NOW with quantization; may need careful RAM headroom | Same multimodal / audio / document stack, slightly larger than E2B | Overlaps with multimodal doc work, coding, and reasoning | INSTALL_NOW |
| Nemotron 3 Nano 4B | NVIDIA | Release date: 3/16/2026 (HF card) | NVIDIA Nemotron Open Model License (not Apache) | 3.97B | BF16 / FP8 / Q4_K_M GGUF are explicitly listed in the blog; exact file sizes not sourced in the excerpt | No | Yes: official examples use `enable_auto_tool_choice` and tool-call parser | Yes: reasoning-on/off modes | Yes: coding languages called out; tool use and agentic tasks emphasized | 262K | Transformers, vLLM >= 0.15.1, TRT-LLM, Llama.cpp; tested on NVIDIA-oriented stacks | **Estimate:** BF16 likely too large for comfortable local use on this node; Q4_K_M / FP8 could be plausible if tooling exists, but this node lacks Vulkan/ROCm tooling | Hybrid Mamba-Transformer, pruned/distilled from Nemotron Nano 9B v2, reasoning-on/off | Overlaps with agentic assistant and code/tool-use roles | QUALIFICATION_QUEUE |

## Candidate notes

### Qwen3.5-0.8B

Observed facts from the official model card:

- Task: image-text-to-text.
- License: Apache-2.0.
- Model overview states 0.8B parameters, 24 layers, and 262,144 native context length.
- It is a causal language model with a vision encoder.
- The card says the artifacts are compatible with Transformers, vLLM, SGLang, KTransformers, etc.

Source:
- https://huggingface.co/Qwen/Qwen3.5-0.8B

Hardware-fit inference: this is the most obviously deployable Qwen candidate on this node. Even without precise quant file sizes, the size class is tiny enough that CPU-RAM or low-VRAM quantized use is a reasonable expectation.

### Qwen3.5-4B

Observed facts from the official model card:

- Task: image-text-to-text.
- License: Apache-2.0.
- Model overview states 4B parameters, 32 layers, and 262,144 native context length extensible up to 1,010,000 tokens.
- It is a causal language model with a vision encoder.
- The card says artifacts are compatible with Transformers, vLLM, SGLang, KTransformers, etc.

Source:
- https://huggingface.co/Qwen/Qwen3.5-4B

Hardware-fit inference: still plausible locally, but more likely to want quantization or offload than the 0.8B variant. I would not place it in a “run unqualified” bucket without confirming a concrete quant/runtime combination.

### Ministral 3 3B / 8B Instruct and Reasoning

Observed facts from Mistral:

- The family is announced in the official Mistral 3 launch post.
- For edge and local use cases, the 3B/8B/14B Ministral 3 family has base, instruct, and reasoning variants, each with image understanding capabilities, under Apache 2.0.
- The model pages say the 3B and 8B are built for edge deployment and local setups.
- The docs pages list 256K context, pricing, and feature entries including structured outputs, function calling, and document QnA.

Sources:
- https://mistral.ai/news/mistral-3/
- https://docs.mistral.ai/models/ministral-3-3b-25-12
- https://docs.mistral.ai/models/ministral-3-8b-25-12

Hardware-fit inference: 3B is comfortably local; 8B is still plausible but should be qualified against memory and runtime because Mistral’s docs page does not give me a direct GGUF or LiteRT size in the excerpt I read.

### Gemma 4 E2B / E4B Instruct

Observed facts from Google:

- Gemma 4 model card says models are multimodal, handling text and image input; audio is supported on E2B, E4B, and 12B.
- License is Apache 2.0.
- E2B and E4B have configurable thinking modes, native system prompt support, native function calling, and can process documents / PDFs / OCR / screen understanding / charts.
- The AI Edge page states E2B model size is 2.58 GB and E4B is 3.65 GB in LiteRT-LM form.
- The AI Edge page was last updated 2026-06-02 UTC.

Sources:
- https://ai.google.dev/gemma/docs/core/model_card_4
- https://developers.google.com/edge/litert-lm/models/gemma-4

Hardware-fit inference: these are especially interesting because the model sizes are explicitly small and the documented local runtimes are first-party. E2B is the strongest “INSTALL_NOW” multimodal/document candidate here.

### Nemotron 3 Nano 4B

Observed facts from NVIDIA:

- HF model card states release date 3/16/2026.
- Model card states the model is a small language model trained from scratch, compressed from Nemotron Nano 9B v2 using Nemotron Elastic.
- It uses a hybrid Mamba-2 + MLP architecture with four attention layers.
- The model card says context length is up to 262K and gives supported hardware/software notes.
- The card includes transformers and vLLM usage examples; the blog states BF16, FP8, and Q4_K_M GGUF releases exist and names the inference engines Transformers, vLLM, TRT-LLM, and Llama.cpp.
- The card also states the model is intended for agentic AI on edge platforms and coding languages.

Sources:
- https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- https://huggingface.co/blog/nvidia/nemotron-3-nano-4b

Hardware-fit inference: the BF16 checkpoint is unlikely to be the best local match on this machine, but Q4_K_M or FP8 would be the likely path if the toolchain were present. Since this node currently lacks Vulkan/ROCm tooling, I would keep it as qualified but not automatic.

## Large defer list

These are models I would defer from the shared store for this node, either because they are too large, because the fit is unclear, or because the model line is not authoritative enough for an automatic store authority decision.

### Clearly defer

- **Qwen3.8-27B** — official model exists, but it is much larger than the small-edge set; official Qwen card says 27B parameters, 262,144 native context, extensible to 1,000,000 tokens, with image and video understanding.
  - Source: https://huggingface.co/Qwen/Qwen3.8-27B
  - Tier: **FUTURE_HARDWARE** for this node.

- **Ministral 3 14B Instruct / Reasoning** — official family model, but larger than the 3B/8B candidates and not the best near-term local fit for this node.
  - Source family: https://mistral.ai/news/mistral-3/ and https://docs.mistral.ai/models/overview
  - Tier: **FUTURE_HARDWARE**.

- **Gemma 4 12B Unified / 26B A4B / 31B** — the model card explicitly says these are larger deployment targets than E2B/E4B.
  - Source: https://ai.google.dev/gemma/docs/core/model_card_4
  - Tier: **FUTURE_HARDWARE**.

- **Nemotron Nano 9B v2 parent** — not requested as a candidate, but it is the teacher / parent for the 4B. On this node it remains too large relative to the 4B edge target and is not the right store choice.
  - Source family: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
  - Tier: **FUTURE_HARDWARE**.

### Qwen3.8-9B resolution

I explicitly checked for an authoritative official **Qwen3.8-9B**. I did **not** find one.

What I did find:

- The official Qwen Hugging Face org lists **Qwen3.8-27B** and **Qwen3.8-Flash-Next** among official releases.
- A Qwen3.8-9B result that surfaced in search was identified as a community distillation, not an official Alibaba/Qwen release.
- The Qwen org page itself did not show any official Qwen3.8-9B repository in the official listing visible to me.

Sources:
- https://huggingface.co/Qwen
- https://huggingface.co/Qwen/Qwen3.8-27B
- https://qwen.ai/blog?id=qwen3.8-flash-next
- https://huggingface.co/empero-ai/Qwen3.8-9B-Distill (community distillation, not official)

Conclusion: **No authoritative official Qwen3.8-9B exists in the sources I checked.**

## RP / WORLD and coding candidate sections

### RP / WORLD fit

If the goal is a lightweight generalist for roleplay/world simulation, the safest candidates from this sweep are:

- **Gemma 4 E2B / E4B**: multimodal, thinking, local runtime docs, and strong document / image handling.
- **Ministral 3 3B Reasoning**: edge-optimized, reasoning variant, and local setup support.
- **Qwen3.5-4B**: broader multimodal / context capability, but less directly “edge documented” than Gemma/Mistral.

I would **not** automatically replace existing authorities such as Stheno WORLD-only, Qwen tuned RETRIEVAL-only, Needle constrained specialist, or RP-Hero/Lumimaid unqualified. The new candidates can expand the store, but the authority split remains a policy choice, not a source fact.

### Coding candidate section

Most promising coding candidates from the cited sources:

- **Qwen3.5-4B** — official card explicitly lists coding benchmarks and compatibility with common serving stacks.
- **Gemma 4 E2B / E4B** — official card explicitly says “Enhanced Coding & Agentic Capabilities” and “coding” use cases.
- **Ministral 3 8B Reasoning** — Mistral positions the family for coding, agentic workflows, and document intelligence.
- **Qwen3.8-27B** — strong coding benchmark profile, but it is a defer due to size.
- **Nemotron 3 Nano 4B** — strongest agentic/tool-use framing, but NVIDIA-specific licensing and hardware ecosystem make it a qualified rather than automatic choice here.

## Multimodal / document section

Best documented multimodal/document candidates:

1. **Gemma 4 E2B / E4B**
   - Text, image, and audio.
   - Document/PDF parsing, OCR, screen/UI understanding, chart comprehension, handwriting recognition.
   - Native function calling and structured outputs.
   - First-party local runtime documentation and explicit small model sizes.

2. **Qwen3.5-4B**
   - Vision encoder; image-text-to-text.
   - Large context and ecosystem compatibility.
   - Good general multimodal local candidate, but I lack an authoritative first-party local-runtime size/quant figure in the sources I read.

3. **Ministral 3 3B / 8B**
   - Officially described as offering image understanding and edge/local deployment.
   - Good if the store wants a Mistral-family multimodal option with Apache 2.0 licensing.

4. **Nemotron 3 Nano 4B**
   - More agentic than document-centric; no vision claim in the official card excerpt I read.
   - Better as an edge reasoning/tool-use slot than as the primary document model.

## No-download decision

I recommend **no download now**. The evidence supports adding or qualifying several local candidates, but the report also shows that the best-fit options depend on quant format, runtime availability, and the store’s authority policy. Since this task explicitly forbids downloading weights or changing runtime authority, the right outcome is to record the candidate set, the defer list, and the Qwen3.8-9B nonexistence finding, then let the runtime/store owner decide which specific checkpoints to stage later.

## Citations

- Qwen org page: https://huggingface.co/Qwen
- Qwen3.5-0.8B model card: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Qwen3.5-4B model card: https://huggingface.co/Qwen/Qwen3.5-4B
- Qwen3.8-27B model card: https://huggingface.co/Qwen/Qwen3.8-27B
- Qwen3.8-Flash-Next blog: https://qwen.ai/blog?id=qwen3.8-flash-next
- Mistral 3 launch post: https://mistral.ai/news/mistral-3/
- Ministral 3 3B docs: https://docs.mistral.ai/models/ministral-3-3b-25-12
- Ministral 3 8B docs: https://docs.mistral.ai/models/ministral-3-8b-25-12
- Gemma 4 model card: https://ai.google.dev/gemma/docs/core/model_card_4
- Gemma 4 AI Edge page: https://developers.google.com/edge/litert-lm/models/gemma-4
- Nemotron 3 Nano 4B HF card: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Nemotron 3 Nano 4B blog: https://huggingface.co/blog/nvidia/nemotron-3-nano-4b
