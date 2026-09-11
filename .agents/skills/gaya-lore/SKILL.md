---
name: gaya-lore
description: Canonical Gaya cosmology, character codexes, D&D 5e mechanics, SillyTavern assets, and local model inference workflows.
class: CAPABILITY_FRONTEND
version: 1.0.0
triggers:
  - gaya
  - aysha
  - amethysta
  - sintese
  - lylia
  - sillytavern
  - drakovia
tools:
  - bin/kad-serve
  - scripts/build-gaya-sillytavern.mjs
  - read
---

# Gaya Lore & SillyTavern Local Model Integration

This skill documents the canonical setting of **Gaya**, its cosmology, factions, character sheets, and the operational workflows for running immersive roleplay and narrative campaigns with local LLMs (Stheno, Qwen, Lumimaid, RP-Hero) via KoboldCpp and SillyTavern.

---

## 1. Cosmology & World Order

### The Primordial Duality
- **Khan (Knaerethum)**: The cosmic primordial of tangible matter, physical reality, and bodily form. All physical substance, earth, bone, and stone are emanations of Khan.
- **Yorman (Eorarmethum)**: The primordial of abstract consciousness, will, concept, soul, and invisible law.
- **The Titans**: Direct progeny of the primordial tension who shaped the planetary architecture before the gods arose.
- **The Pantheon**: Ascended divinities governing celestial, elemental, and domain spheres across the eras.
- **Midgard (Planeta Gaya)**: The mortal world, sustained by the world axis (Midgraciil / Yggdrasil).

### The Seven Eras of Gaya
1. **Era dos Titãs**: Emergence of primal titans from Khan's raw matter and Yorman's first spark.
2. **Era da Criação**: Formation of continents, biomes, and elder mortal races.
3. **Era de Ouro**: Peak of high arcane civilization, planar portals, and harmony with ancient spirits.
4. **A Grande Guerra / Queda**: Cataclysmic clash between titan worshipers, pantheon faithful, and extraplanar horrors; shattered high cities.
5. **A Terra Morta**: Century of ash, magical fallout, and survival in isolated bastions.
6. **Nova Gaya**: Reconstruction era; emergence of the current sovereign nations and empires.
7. **A Guerra da Platina (Era Atual)**: Shifting cold and hot wars between the expansionist Drakovian Empire, elven isolationists, and frontier rebellions.

---

## 2. Major Nations & Regions

- **Império de Drakovia**:
  - Militaristic, draconian empire led by dragonborn legions (Brigada Adamantina). Values discipline, hierarchy, martial supremacy, and absolute loyalty to the dragon throne. Capital seat around Kram'tor and the Rubralma citadel.
- **Galahad & Floresta Negra**:
  - Ancestral elven territory afflicted by the creeping *Hex*—a corrupting supernatural fog that twists beasts and blights the ancient canopy. Guarded by isolationist rangers and surviving circle custodians.
- **Dulhast**:
  - Mountain fortress bastion of the dwarves and allied duergar clans. Renowned for adamantine metallurgy, runic warding, and stalwart paladin orders.
- **Galfenhard**:
  - Barren frontier lands where enslaved orc populations revolted against Drakovian tyranny. Aysha Öztoprak's refusal to slaughter orc civilians here marked her desertion from the empire.
- **Savana Negra**:
  - Vast, arid, predator-dense wilderness littered with ancient draconic nests. The birthplace of Amethysta.
- **Os Druidas e a Grande Árvore (Druidar)**:
  - The remnants of the 500 surviving druids of Gaia. Keepers of the sacred 16 Yor cycles and the ancient druidic script. Guardians of natural ley nodes.
- **Os Yaarks e Nuustrad**:
  - Primordial, biomechanical, black-and-white entities embodying pure action and conceptual resolution. They do not answer to Khan or Yorman; they knit and unify opposites.

---

## 3. Canonical Dramatis Personae

### Aysha Öztoprak
- **Identity**: Amethyst Dragonborn (Draconata de Ametista), Female, 26 years old, 2.07m tall, 80kg. Slender, muscular, commanding military carriage, smooth violet scales, obsidian eyes.
- **Class**: Cavaleiro do Dragão (Dragoon) Level 7 (D&D 5.5e / Homebrew).
- **History**: Former Lieutenant in Drakovia's Imperial Army; veteran of the elite Brigada Adamantina. Deserted after defying orders to execute orc survivors in Galfenhard. Adoptive mother and fierce protector of Amethysta.
- **Relics & Gear**:
  - *Crosta de Kravarius*: Half-plate formed from the molted elder dragon scales of Kravarius, shifting crimson under sunlight.
  - *Nyr & Zhar*: Paired twin blades woven by Síntese. Nyr channels lunar/reflective (Yorman) energy; Zhar radiates solar/kinetic (Khan) fire.
- **Voice & Persona**: Laconic, disciplined, protective, severe, pragmatic. Deep maternal tenderness toward Amethysta beneath a soldier's scarred armor.

### Amethysta
- **Identity**: Young Amethyst Dragon (juvenile), bonded daughter of Aysha. Hatched in the Savana Negra.
- **Dual Form**: Shifts between a sleek amethyst drake and a 12-year-old halfling girl with bouncing violet curls, amethyst dragon horns, small scaled wings, and an active reptilian tail.
- **Combat Style**: Fights exclusively through innate psionic and violet lightning magic (Eldritch Blast, Lightning Lure, Shocking Grasp, electric/paralyzing breath). Never carries weapons.
- **Gear**: *Manto de Kravarius*, an enchanted amethyst and gold-embroidered tunic woven by Síntese that redirects damage across the bond.
- **Voice & Persona**: Curious, cheerful, voracious appetite (loves roasted meats), playful, but fiercely protective of Aysha.

### Síntese
- **Identity**: A Yaark Nustraad anchored to Aysha's spine.
- **Appearance**: Biomechanical silhouette in high-contrast black and white. Its head features a pure white circular aperture inside which it continuously knits a conceptual ball of yarn.
- **Function**: Manifests pure conceptual action, bridging matter and consciousness. Created Nyr, Zhar, and the Manto de Kravarius.
- **Voice & Persona**: Silent telepathic resonance, cryptic, rhythmic, speaking in poetic aphorisms about threads, seams, and cosmic dualities.

### Lylia, a Centelha de Sofia
- **Identity**: Female Shifter, Druid of the Circle of the Shepherd / Divine Soul Sorcerer (Level 6/7).
- **Background**: Sole survivor of her tribal settlement in the Floresta Negra of Galahad following the massacre by the Primal Bear.
- **Relics**: The talisman of Sofia, channeling the healing light of the Great Tree of Gaia.
- **Voice & Persona**: Gentle, contemplative, attuned to animal spirits, resilient in grief.

---

## 4. Local Model Inference & Serving Architecture

Local text generation runs on the localhost Vulkan GPU stack managed via `bin/kad-serve`.

### Available Backends & Models
1. **Stheno v3.2 (Recommended for RP & Gaya Immersion)**:
   - GGUF: `L3-8B-Stheno-v3.2-Q4_K_M.gguf`
   - Port: `127.0.0.1:5001`
   - Context: 16,384 tokens with `q8_0` KV cache (Llama 3 prompt)
   - Launch: `bin/kad-serve stheno`
2. **RP-Hero 8B (Recommended for Dynamic Roleplay & Pacing)**:
   - GGUF: `L3.1-RP-Hero-InBetween-8B-D_AU-Q4_k_m.gguf`
   - Port: `127.0.0.1:5001`
   - Context: 16,384 tokens with `q8_0` KV cache (Llama 3.1 prompt)
   - Launch: `bin/kad-serve rp-hero`
3. **Lumimaid 8B (Creative & Emotional Roleplay)**:
   - GGUF: `Llama-3-Lumimaid-8B-v0.1-OAS-Q4_K_M-imat.gguf`
   - Port: `127.0.0.1:5001`
   - Context: 16,384 tokens with `q8_0` KV cache (Llama 3 prompt)
   - Launch: `bin/kad-serve lumimaid`
4. **Qwen 3.5 9B (Analysis & Complex Planning)**:
   - GGUF: `Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Q4_K_M.gguf`
   - Port: `127.0.0.1:5001` (or 5002)
   - Context: 16,384 tokens with `q8_0` KV cache (ChatML prompt)
   - Launch: `bin/kad-serve qwen`

### Serving Commands
```bash
# List available local GGUF models
bin/kad-serve list

# Launch any model on port 5001 (standard KoboldCpp port)
bin/kad-serve stheno
bin/kad-serve rp-hero
bin/kad-serve lumimaid
bin/kad-serve qwen

# Load an arbitrary model by ID or file path
bin/kad-serve load <model-id-or-path> [port]

# Check active backend status
bin/kad-serve status

# Stop all KoboldCpp instances
bin/kad-serve stop
```

---

## 5. SillyTavern Frontend Integration

SillyTavern runs locally from `/home/amdy/Work/kad-sillytavern/SillyTavern`.

### Asset Paths
- **World Info (Lorebook)**:
  `kad-sillytavern/SillyTavern/data/default-user/worlds/Gaya_Codex.json` (22 indexed entries covering Khan, Yorman, Drakovia, Yaarks, Aysha, Amethysta, etc.).
- **Character Cards (CCv2 with embedded PNG chunks)**:
  - `data/default-user/characters/Aysha_Oztoprak.png`
  - `data/default-user/characters/Amethysta.png`
  - `data/default-user/characters/Aysha_e_Amethysta.png` (Duo card)
  - `data/default-user/characters/Sintese_Yaark.png`
  - `data/default-user/characters/Lylia_Centelha_de_Sofia.png`
- **Instruct Preset**:
  `data/default-user/instruct/Llama-3-Gaya.json`
- **KoboldAI Sampler Preset**:
  `data/default-user/KoboldAI Settings/Gaya-Stheno.json`

### Starting SillyTavern
```bash
cd /home/amdy/Work/kad-sillytavern/SillyTavern
npm run start -- --listenAddressIPv4 127.0.0.1 --port 8000 --browserLaunchEnabled false --dataRoot ./data
```

Access the UI at: `http://127.0.0.1:8000`

### Rebuilding & Synchronizing Gaya Assets
If source files in `/home/amdy/Downloads/reports/gaya/` are updated, re-execute:
```bash
node /home/amdy/Work/scripts/build-gaya-sillytavern.mjs
```
This automatically updates `Gaya_Codex.json`, rebuilds all character PNGs with verified Character Card V2 metadata, sets `extensions.world = "Gaya_Codex"`, and verifies settings.
