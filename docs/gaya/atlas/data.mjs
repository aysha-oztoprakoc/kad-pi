// Single source of truth for Gaya: The YKT Refuge System Atlas.
// Build: node docs/gaya/atlas/build.mjs → writes docs/gaya/SYSTEM.md and docs/gaya/atlas.html

export const META = {
  title: 'Gaya — The YKT Refuge',
  artifactUrl: '',
  sourcePath: 'docs/gaya/atlas/data.mjs',
  buildCmd: 'node docs/gaya/atlas/build.mjs',
  stats: [
    { k: 'Engine', v: 'Deterministic ESM' },
    { k: 'Authority', v: 'Kernel-only commit' },
    { k: 'Baseline', v: 'Zero-LLM runnable' },
    { k: 'Local Models', v: 'Stheno · Qwen · RP-Hero' },
  ],
  intro: `_**This file is the living architectural source of truth for Gaya: The YKT Refuge.** The interactive atlas and SYSTEM.md twin are compiled from this data file._`,
  onePara: `Gaya: The YKT Refuge is a 2D ASCII settlement simulation combining Dwarf Fortress emergent life, RimWorld schedule/needs logistics, Factorio data-driven recipes, and modded Minecraft room structures with canonical Gaya tabletop cosmology. The distinctive technical architecture separates mechanical state authority from local LLM cognition: all available local models (Stheno, Qwen, Lumimaid, RP-Hero) act as pluggable actor controllers proposing structured actions, while a pure deterministic kernel validates, prices, and commits all state transitions into an append-only event ledger.`,
  costModel: [
    '| Resource Tier | Role | Hardware Target | Cost / Limit |',
    '|---|---|---|---|',
    '| **Deterministic Engine** | Kernel, state transitions, replay | AMDY CPU / Node ESM | $0.00 · 0 token overhead |',
    '| **Local World Model** | Amethysta/Douglas RP personas | AMDY Vulkan GPU (Port 5001: Stheno-v3.2 8B) | $0.00 · 2048 ctx · 128 max tokens |',
    '| **Local Retrieval Model** | Begonio instruction / Tactics | AMDY Vulkan GPU (Port 5002: Qwen3.5 9B) | $0.00 · 2048 ctx · 192 max tokens |',
    '| **Remote Inference** | Emergency planning / Review only | Cloud reasoning models (Gemini 3.8 / Codex) | Governed spend · Zero direct simulation mutation |',
  ],
  deepDive: `See [KAD-PI Technical Handoff: Gaya Multi-Model ASCII Game](/home/amdy/Downloads/GAYA_KAD_PI_MULTI_MODEL_ASCII_GAME_HANDOFF_2026-09-08.md) and [Evidence D-GAYA-001](../../evidence/WP-GAYA-001/01-wayfinder-decision-map.md).`,
  platformGives: 'KAD-PI workspace substrate, workctl lifecycle claims, local KoboldCpp Vulkan inference servers, SillyTavern asset sync script.',
  weOwn: 'Deterministic domain simulation kernel, command validators, append-only SHA256 event ledger, ASCII terminal renderer, local model observation/action compiler, Gaya content registry.',
  filesystem: `tools/gaya/\n  kernel/\n    state.mjs\n    transition.mjs\n    validator.mjs\n    ledger.mjs\n  content/\n    registry.mjs\n    codex.mjs\n    rooms.mjs\n    recipes.mjs\n  models/\n    registry.mjs\n    compiler.mjs\n    adapter.mjs\n    scripted-policy.mjs\n  ui/\n    ascii-terminal.mjs\n    render.mjs\n  test/\n    kernel.test.mjs\n    replay.test.mjs\n    sintese.test.mjs\n    model-contract.test.mjs\ndocs/gaya/\n  atlas/\n    data.mjs\n    build.mjs\n    template.html\n  SYSTEM.md\n  atlas.html`,
};

export const DECISIONS = [
  { axis: 'Bootstrap Sequencing', decision: 'Tracer-Bullet Zero-LLM Deterministic Kernel + Explorable System Atlas First (WP-000 + WP-001)', adr: '[D-GAYA-001](../../evidence/WP-GAYA-001/01-wayfinder-decision-map.md)' },
  { axis: 'State Authority', decision: 'Deterministic kernel owns state, rules, costs, legal actions, event order, and replay; models only propose', adr: '[ADR-0005](../adr/0005-deterministic-first-and-epistemic-classification.md)' },
  { axis: 'Model Replay', decision: 'Kernel replay uses strict command tapes; model evaluation uses cached proposal tapes or recorded decision fingerprints', adr: '[ADR-0004](../adr/0004-model-agnostic-control-plane.md)' },
  { axis: 'Epistemic Provenance', decision: 'Every record is labeled (Approved canon, Proposed design, Simulated event, Character belief, Unknown); unknowns remain UNKNOWN', adr: '[ADR-0003](../adr/0003-intent-authority-boundary.md)' },
  { axis: 'Local Inference Fit', decision: 'Pre-inference resource admission enforces context windows (2048) and output token caps before invoking local models', adr: '[ADR-0014](../adr/0014-generalized-ideal-state-artifact-and-compute-fabric-governance.md)' },
];

export const GROUPS = [
  { id: 'sim', title: 'Deterministic Simulation Core' },
  { id: 'model', title: 'Multi-Model Actor Fabric' },
  { id: 'canon', title: 'Canon & Epistemic Boundaries' },
  { id: 'ui', title: 'Presentation & Control Surfaces' },
];

export const NODES = [
  // Simulation Core
  {
    id: 'K', code: 'K', name: 'Simulation Kernel', short: 'KERNEL', group: 'sim',
    gx: 7, gy: 5, w: 3, d: 3, h: 56, kind: 'tall',
    one: 'The authoritative state machine executing discrete time ticks and atomic command batches.',
    what: 'Maintains canonical world state, advances clock ticks, applies validated transactions, and notifies subscribers.',
    how: 'Pure ESM function <code>State(t+1) = Apply(Ruleset, State(t), AcceptedCommands, RNG)</code> with zero side-effects outside event generation.',
    steps: [
      ['Collect', 'Gather pending commands from human, scripted routines, or model proposal buffers.'],
      ['Validate', 'Send each command through the Action Validator for precondition and cost checks.'],
      ['Commit', 'Execute atomic state transition and write committed event into the append-only ledger.'],
      ['Notify', 'Emit PON facts and advance actor needs (hunger, fatigue, reservations).']
    ],
    cond: [
      { q: 'Can an unvalidated action enter the kernel?', r: 'No. All inputs pass through the Action Validator barrier (D-GAYA-001).' },
      { q: 'How is logical actor order determined?', r: 'Fixed deterministic ordering by actor ID and tick (2026-09-08).' }
    ]
  },
  {
    id: 'S', code: 'S', name: 'World State & Snapshots', short: 'STATE', group: 'sim',
    gx: 3, gy: 5, w: 3, d: 3, h: 36, kind: 'store',
    one: 'Normalized state tree containing rooms, residents, inventories, schedules, and reservations.',
    what: 'Holds the complete current state of the YKT Refuge. Supports snapshotting, forking, diffing, and restoration.',
    how: 'JSON-serializable immutable state container with canonical key sorting and deterministic SHA256 hashing.',
    steps: [
      ['Serialize', 'Convert entities, rooms, needs, and resource pools into canonical JSON.'],
      ['Hash', 'Compute sha256 digest of normalized state for replay comparison.'],
      ['Fork', 'Clone state branch at current tick for counterfactual tournament comparison.']
    ],
    cond: [
      { q: 'Does state persist across sessions?', r: 'Yes, via snapshot manager into SQLite/JSON run manifests (2026-09-08).' }
    ]
  },
  {
    id: 'V', code: 'V', name: 'Action Validator', short: 'VALIDATOR', group: 'sim',
    gx: 11, gy: 5, w: 2, d: 2, h: 48, kind: 'gate',
    one: 'Precondition and economic gatekeeper rejecting unaffordable or illegal action proposals.',
    what: 'Checks whether an actor is alive, present in the room, has required items/skills, and whether resources are free.',
    how: 'Pure function producing an explicit receipt: <code>ACCEPTED</code> or <code>REJECTED(reason_code)</code>.',
    steps: [
      ['Preconditions', 'Verify actor location, status, and target eligibility.'],
      ['Affordability', 'Verify Khan/Yorman or material supplies and reserve inputs atomically.'],
      ['Receipt', 'Return structured receipt with accepted event ID or rejection reason.']
    ],
    cond: [
      { q: 'Can a model hallucinate an action?', r: 'Yes, but the validator rejects it with an explicit receipt and zero world mutation.' }
    ]
  },
  {
    id: 'E', code: 'E', name: 'Event Ledger', short: 'LEDGER', group: 'sim',
    gx: 7, gy: 9, w: 3, d: 2, h: 28, kind: 'cards',
    one: 'Immutable append-only record of all committed facts with causation IDs and before/after hashes.',
    what: 'Provides the ground truth audit trail for settlement history, chronicle generation, and replay qualification.',
    how: 'JSON event sequence where each event records <code>event_id</code>, <code>causation_id</code>, <code>before_hash</code>, <code>after_hash</code>.',
    steps: [
      ['Append', 'Record event immediately upon kernel state commit.'],
      ['Hash', 'Chain state hashes to guarantee tampering is detectable.'],
      ['Project', 'Feed presentation layers and chronicle generators without re-querying state.']
    ],
    cond: [
      { q: 'Can history be edited?', r: 'Never. Corrections are new compensating events or forks (2026-09-08).' }
    ]
  },

  // Multi-Model Actor Fabric
  {
    id: 'MR', code: 'MR', name: 'Model Registry', short: 'REGISTRY', group: 'model',
    gx: 15, gy: 1, w: 2, d: 2, h: 32, kind: 'store',
    one: 'Inventory and health status of all available local LLMs on AMDY/TELL hardware.',
    what: 'Tracks model GGUF weights, KoboldCpp ports, verified context windows, output caps, and role qualifications.',
    how: 'Dynamic JSON registry populated by active health probes against ports 5001, 5002, etc.',
    steps: [
      ['Probe', 'Check localhost port availability and model identity.'],
      ['Verify', 'Read proven parameter bounds (Vulkan device, max tokens, context size).'],
      ['Authorize', 'Grant actor controller permission (never file/kernel mutation authority).']
    ],
    cond: [
      { q: 'What if an endpoint goes offline?', r: 'Actor degrades deterministically to scripted policy or human pause (2026-09-08).' }
    ]
  },
  {
    id: 'FC', code: 'FC', name: 'Context & Fit Compiler', short: 'COMPILER', group: 'model',
    gx: 15, gy: 5, w: 2, d: 2, h: 44, kind: 'box',
    one: 'Pre-inference admission engine compiling actor observations into bounded prompts.',
    what: 'Filters world facts by actor perception scope and validates prompt size against model context limits.',
    how: 'Enforces grammar-constrained output schema (gaya.action.v1) and rejects over-budget observations.',
    steps: [
      ['Scope', 'Filter state to what the character actually sees and knows.'],
      ['Pack', 'Format legal choices and need meters into structured observation JSON.'],
      ['Admit', 'Verify total token budget <= model context limit before dispatch.']
    ],
    cond: [
      { q: 'Can a model see another character’s secrets?', r: 'No. Observation filtering strips facts outside actor knowledge scope.' }
    ]
  },
  {
    id: 'ST', code: 'ST', name: 'Stheno v3.2 Local', short: 'STHENO', group: 'model',
    gx: 19, gy: 3, w: 2, d: 2, h: 36, kind: 'box',
    one: 'Local 8B model (port 5001) specialized for expressive character dialogue and domestic life.',
    what: 'Controls personas like Amethysta, Douglas, or refuge residents during social and creative turns.',
    how: 'KoboldCpp OpenAI-compatible endpoint with Llama-3 prompt template, temperature=0 for evaluation.',
    steps: [
      ['Inference', 'Receive observation prompt and return structured choice + dialogue draft.'],
      ['Propose', 'Send gaya.action.v1 proposal to Action Validator.']
    ],
    cond: [
      { q: 'Can Stheno grant herself items?', r: 'No. Proposals only select from legal choice IDs generated by the kernel.' }
    ]
  },
  {
    id: 'QW', code: 'QW', name: 'Qwen 3.5 9B Local', short: 'QWEN', group: 'model',
    gx: 19, gy: 7, w: 2, d: 2, h: 36, kind: 'box',
    one: 'Local 9B model (port 5002) specialized for tactical drills, resource logistics, and instruction.',
    what: 'Controls instructors like Begonio or tactical combat drills, proposing analytical decisions.',
    how: 'KoboldCpp ChatML endpoint with reasoning effort controls and 192 output token limit.',
    steps: [
      ['Analyze', 'Evaluate combat formations or magic study lesson choices.'],
      ['Propose', 'Return structured choice proposal with reason label.']
    ],
    cond: []
  },
  {
    id: 'SC', code: 'SC', name: 'Scripted Policy', short: 'SCRIPT', group: 'model',
    gx: 15, gy: 9, w: 2, d: 2, h: 30, kind: 'box',
    one: 'Zero-LLM deterministic fallback executing rule-based schedules and priority queues.',
    what: 'Powers the baseline game without requiring any GPU or local model. Serves as graceful degradation target.',
    how: 'Rule table evaluating needs (if hunger > 0.7 -> eat; if fatigue > 0.8 -> rest; else work duty).',
    steps: [
      ['Evaluate', 'Check priority matrix against current needs and schedule.'],
      ['Submit', 'Emit legal action command directly to validator.']
    ],
    cond: [
      { q: 'Is the game playable without models?', r: 'Yes. Option 1 delivers the full one-day refuge slice under scripted policy.' }
    ]
  },

  // Canon & Lore Boundaries
  {
    id: 'CAN', code: 'CAN', name: 'Gaya Canon Codex', short: 'CODEX', group: 'canon',
    gx: 3, gy: 1, w: 3, d: 2, h: 36, kind: 'store',
    one: 'Immutable repository of verified Gaya cosmology, character codexes, and epistemic labels.',
    what: 'Maintains Khan/Yorman definitions, Ayşa/Amethysta canon, and marks unapproved lore as UNKNOWN.',
    how: 'Strict registry mapping IDs to canon status. Rejects fabricated city reserves or unapproved spells.',
    steps: [
      ['Validate', 'Verify entity claims against approved tabletop source documents.'],
      ['Filter', 'Block game branches from altering canonical codex entries.']
    ],
    cond: [
      { q: 'Can gameplay overwrite tabletop canon?', r: 'Never. Simulated events remain isolated to their run branch (2026-09-08).' }
    ]
  },
  {
    id: 'SIN', code: 'SIN', name: 'Síntese Engine', short: 'SÍNTESE', group: 'canon',
    gx: 7, gy: 1, w: 3, d: 2, h: 42, kind: 'gate',
    one: 'Conceptual matter-manipulation engine governing Khan and Yorman expenditure.',
    what: 'Enforces Ayşa’s Yaark Nustraad rules: perception of skeins, eligibility predicates, approved recipes.',
    how: 'Checks eligibility (inanimate or killed by Ayşa), debits Khan/Yorman pools, and produces approved items.',
    steps: [
      ['Perceive', 'Check if target skein is visible and eligible for manipulation.'],
      ['Recipe Check', 'Verify requested craft has an approved recipe in the content registry.'],
      ['Transmute', 'Spend Khan/Yorman and synthesize verified product into inventory.']
    ],
    cond: [
      { q: 'Can Síntese synthesize arbitrary prompt ideas?', r: 'No. Only approved recipes in the content registry can execute.' }
    ]
  },

  // Presentation & Control
  {
    id: 'TUI', code: 'TUI', name: 'ASCII Terminal Shell', short: 'ASCII TUI', group: 'ui',
    gx: 3, gy: 9, w: 3, d: 3, h: 48, kind: 'screen',
    one: 'Keyboard-driven terminal interface rendering the ASCII refuge map, status, and choice menu.',
    what: 'Renders Heartwood Commons, kitchen, dormitories, present actors, and displays context-sensitive menus.',
    how: 'Pure Node.js stdout renderer using ANSI TrueColor/monospace with zero external heavy frameworks.',
    steps: [
      ['Render', 'Display ASCII map, actor positions, status meters, and log.'],
      ['Input', 'Capture keyboard choice (1..9) and translate to command packet.'],
      ['Receipt', 'Display action receipt and dialogue draft in separated text panels.']
    ],
    cond: [
      { q: 'Is color required to play?', r: 'No. Symbols and text are fully readable in monochrome (2026-09-08).' }
    ]
  },
  {
    id: 'STE', code: 'STE', name: 'SillyTavern Adapter', short: 'SILLYTAVERN', group: 'ui',
    gx: 11, gy: 9, w: 2, d: 2, h: 36, kind: 'screen',
    ghost: true,
    one: 'Future extension exposing refuge dialogue and character cards into SillyTavern web UI.',
    what: 'Projects committed events into SillyTavern chat panels while reading live HP and inventory from the kernel.',
    how: 'Local HTTP/WebSocket bridge syncing Gaya_Codex.json and Character Card V2 metadata.',
    steps: [
      ['Sync', 'Transmit committed state facts to SillyTavern character context.'],
      ['Chat', 'Allow player to converse with NPC personas using local models.']
    ],
    cond: [
      { q: 'Can SillyTavern overwrite kernel state?', r: 'No. Kernel remains sole authority; SillyTavern is view/chat only.' }
    ]
  },
];

export const FLOWS = [
  {
    id: 'turn',
    name: 'Single Actor Turn',
    hops: [
      ['K', 'FC', 'observation', { actor_id: 'npc.amethysta', hunger: 0.72, legal_choices: ['eat.shared_meal', 'rest.short'] }, 'xy'],
      ['FC', 'ST', 'prompt', { model: 'stheno-local', max_tokens: 128 }, 'xy'],
      ['ST', 'V', 'action proposal', { choice_id: 'eat.shared_meal', dialogue_draft: 'I am hungry. May I eat?' }, 'yx'],
      ['V', 'K', 'validated command', { status: 'ACCEPTED', cost: { 'shared.food': 1 } }, 'yx'],
      ['K', 'S', 'state mutation', { 'shared.food': 3, 'amethysta.hunger': 0.1 }, 'xy'],
      ['K', 'E', 'event commit', { event_type: 'meal.consumed', tick: 42 }, 'xy'],
      ['E', 'TUI', 'receipt log', { text: 'Amethysta ate a meal in the Heartwood Commons.' }, 'yx'],
    ]
  },
  {
    id: 'sintese',
    name: 'Síntese Transmutation Flow',
    hops: [
      ['TUI', 'SIN', 'propose synthesis', { actor: 'aysha', target: 'molted_scales', recipe: 'kravarius_reinforcement' }, 'yx'],
      ['SIN', 'CAN', 'verify recipe', { recipe_id: 'kravarius_reinforcement' }, 'xy'],
      ['CAN', 'SIN', 'recipe verified', { approved: true, cost_khan: 10, cost_yorman: 5 }, 'yx'],
      ['SIN', 'V', 'submit transaction', { debit: { khan: 10, yorman: 5 }, produce: 'reinforced_shield' }, 'xy'],
      ['V', 'K', 'execute synthesis', { status: 'ACCEPTED' }, 'yx'],
      ['K', 'E', 'commit event', { event_type: 'sintese.completed' }, 'xy'],
    ]
  },
  {
    id: 'replay',
    name: 'Deterministic Replay Verification',
    hops: [
      ['E', 'K', 'load command tape', { run_id: 'run-001', command_count: 50 }, 'yx'],
      ['K', 'S', 'reset to initial seed', { seed: 1337, tick: 0 }, 'xy'],
      ['K', 'S', 're-apply commands', { tick: 50 }, 'xy'],
      ['S', 'K', 'compute state hash', { final_hash: 'sha256:...' }, 'yx'],
      ['K', 'E', 'verify event ledger hash', { match: true }, 'xy'],
    ]
  }
];

export const CH = [
  {
    id: 'ch1',
    title: 'The Deterministic Refuge Core',
    reveal: ['K', 'S', 'E'],
    lede: `At the foundation sits a pure deterministic state machine with an append-only ledger.`,
    story: `<p>The <b>Simulation Kernel</b> executes discrete ticks without any external side-effects. The <b>World State</b> holds normalized refuge entities with deterministic SHA256 hashing. Every committed fact is recorded forever in the <b>Event Ledger</b>.</p>`,
    flow: [
      ['K', 'S', 'state tick', { tick: 1 }],
      ['K', 'E', 'record event', { event_type: 'tick.advanced' }]
    ]
  },
  {
    id: 'ch2',
    title: 'The Command & Validation Barrier',
    reveal: ['V', 'SC'],
    lede: `No action touches world state without passing through the Action Validator.`,
    story: `<p>The <b>Action Validator</b> verifies actor presence, target eligibility, and resource affordability. The <b>Scripted Policy</b> provides a zero-LLM deterministic fallback so the simulation runs completely offline without GPU or models.</p>`,
    flow: [
      ['SC', 'V', 'action proposal', { choice_id: 'work.chop_wood' }],
      ['V', 'K', 'validated command', { status: 'ACCEPTED' }],
      ['K', 'E', 'event commit', { event_type: 'job.started' }]
    ]
  },
  {
    id: 'ch3',
    title: 'The Multi-Model Actor Fabric',
    reveal: ['MR', 'FC', 'ST', 'QW'],
    lede: `Local models propose actions; the kernel commits them.`,
    story: `<p>The <b>Model Registry</b> probes live local LLM endpoints on AMDY. The <b>Context & Fit Compiler</b> scopes observations to what the character perceives and enforces token caps. <b>Stheno</b> (social/RP) and <b>Qwen</b> (tactical/reasoning) propose actions as untrusted clients.</p>`,
    flow: [
      ['K', 'FC', 'actor observation', { actor: 'amethysta', hunger: 0.72 }],
      ['FC', 'ST', 'prompt', { tokens: 840 }],
      ['ST', 'V', 'action proposal', { choice: 'eat.shared_meal' }],
      ['V', 'K', 'accepted', { status: 'ACCEPTED' }]
    ]
  },
  {
    id: 'ch4',
    title: 'Canon & Síntese Boundaries',
    reveal: ['CAN', 'SIN'],
    lede: `Protecting tabletop canon and governing cosmic transmutations.`,
    story: `<p>The <b>Canon Codex</b> isolates tabletop canon from proposed refuge architecture and runtime branch events. The <b>Síntese Engine</b> enforces the strict cosmology of Khan and Yorman manipulation, rejecting unapproved recipes.</p>`,
    flow: [
      ['SIN', 'CAN', 'check recipe', { id: 'kravarius_reinforcement' }],
      ['CAN', 'SIN', 'approved', { status: 'APPROVED' }],
      ['SIN', 'K', 'commit synthesis', { spent: { khan: 10, yorman: 5 } }]
    ]
  },
  {
    id: 'ch5',
    title: 'Presentation & Control Surfaces',
    reveal: ['TUI', 'STE'],
    lede: `Human interaction via terminal ASCII shell and optional SillyTavern extension.`,
    story: `<p>The <b>ASCII Terminal Shell</b> delivers an immediate keyboard-driven refuge experience. The <b>SillyTavern Adapter</b> provides an optional narrative window without compromising kernel authority.</p>`,
    flow: [
      ['TUI', 'K', 'player command', { actor: 'aysha', action: 'move.north' }],
      ['K', 'E', 'commit event', { event_type: 'actor.moved' }],
      ['E', 'TUI', 'render frame', { location: 'Commons' }]
    ]
  },
  {
    id: 'ch6',
    title: 'The Whole System',
    reveal: [],
    lede: `The complete multi-model deterministic settlement simulation architecture.`,
    story: `<p>Explore all 13 structures, inspect data packets across flows, and review open questions. The kernel guarantees that any local model can play while the game remains reproducible and testable.</p>`,
    flow: null
  }
];

export const HOW_HTML = `<div class="eyebrow">Gaya · Architecture Atlas V1</div>
<h1 class="t">How It's Built</h1>
<div class="sub">Mechanical determinism, local-first inference, and epistemic boundaries</div>
<h3 class="sec">Constitutional Principles</h3>
<ul>
  <li><b>PRIME_DIRECTIVE:</b> Deterministic-first execution. Kernel state transition is a pure function.</li>
  <li><b>Authority Separation:</b> Models propose; kernel validates and commits. Models never mutate state or files.</li>
  <li><b>Epistemic Classification:</b> Explicit separation between Approved Canon, Proposed Design, Simulated Event, and Unknown.</li>
  <li><b>Offline Survival:</b> Zero-LLM baseline runs complete one-day refuge scenario with 100% test pass.</li>
</ul>
<h3 class="sec">Filesystem Layout</h3>
<pre>${META.filesystem}</pre>`;
