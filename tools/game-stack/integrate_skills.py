#!/usr/bin/env python3
"""Curate and flatten the applicable gamedev skills into OMP's actual discovery root.

OMP discovers skills at the git-root `.agents/skills` (verified: `omp read skill://<name>`
resolves from the repo root, not from nested project dirs). This script therefore
flattens the curated upstream gamedev subset into `<repo-root>/.agents/skills/`, where
the 50 installed skills already live. The architecture guardrail is NOT a skill here —
it lives in `tools/game-stack/AGENTS.md`, which ancestor-walks only when cwd is inside
the game project, keeping determinism invariants scoped instead of global.

Preserves upstream content verbatim (SKILL.md + references/) and records a reconciliation
manifest. Deterministic and re-runnable: re-runs copy over destinations idempotently.
"""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parent.parent          # /home/amdy/Work (git root, verified)
UPSTREAM = ROOT / "upstream" / "gamedev"
DEST = REPO_ROOT / ".agents" / "skills"  # OMP discovery root
MANIFEST = ROOT / "skills-manifest.json"

# Flattened project skill name -> upstream relative path (curated, guardrailed subset).
CURATED = {
    "gamedev-router": "router",
    "godot-gdscript": "skills/godot/godot-gdscript",
    "godot-export": "skills/godot/godot-export",
    "godot-nodes-scenes": "skills/godot/godot-nodes-scenes",
    "godot-signals-groups": "skills/godot/godot-signals-groups",
    "godot-resources": "skills/godot/godot-resources",
    "godot-ui-control": "skills/godot/godot-ui-control",
    "godot-animation": "skills/godot/godot-animation",
    "godot-audio": "skills/godot/godot-audio",
    "save-systems": "skills/disciplines/save-systems",
    "input-systems": "skills/disciplines/input-systems",
    "performance-optimization": "skills/disciplines/performance-optimization",
}

# Skills excluded from integration and the reason (recorded, not silently dropped).
EXCLUDED = {
    "godot-physics": "state-authority conflict: asserts Godot physics owns simulation state",
    "godot-multiplayer": "state-authority conflict: asserts Godot hosts authoritative netcode",
    "godot-csharp": "out-of-scope: project uses GDScript for presentation + Rust for simulation",
    "godot-2d-movement": "state-authority conflict: movement lives in Rust fixed-point simulation",
    "godot-tilemap": "out-of-scope: tilemap gameplay logic is Rust-owned",
    "godot-3d-essentials": "out-of-scope: not needed for the 2D qualification harness",
    "godot-shaders": "optional presentation; reference-only via upstream snapshot",
    "unity-*": "out-of-scope engine",
    "unreal-*": "out-of-scope engine",
    "roblox-*": "out-of-scope engine",
    "web-engines/phaser-*": "out-of-scope engine",
    "web-engines/pixijs-*": "out-of-scope engine",
    "web-engines/threejs-*": "out-of-scope engine",
    "other-engines/bevy-ecs": "out-of-scope engine",
    "other-engines/pygame-core": "out-of-scope engine",
    "other-engines/love2d-core": "out-of-scope engine",
    "genres/*": "out-of-scope: no genre-specific template applies to the qualification harness",
    "workflows/game-jam": "process; reference-only",
    "workflows/steam-publish": "publication authority boundary; reference-only",
    "workflows/itch-publish": "publication authority boundary; reference-only",
    "workflows/prototype-fast": "process; reference-only",
    "disciplines/physics-tuning": "state-authority conflict: Godot physics tuning implies Godot-side simulation",
    "disciplines/procedural-gen": "Rust-owned; deterministic RNG in stack-core, reference-only",
    "disciplines/game-ai": "Rust-owned simulation logic; reference-only",
    "disciplines/dialogue-systems": "out-of-scope for current harness",
    "disciplines/camera-systems": "presentation-only; reference-only",
    "disciplines/game-feel": "presentation-only; reference-only",
    "disciplines/level-design": "out-of-scope for current harness",
    "disciplines/audio-design": "presentation-only; reference-only",
    "disciplines/shader-programming": "presentation-only; reference-only",
    "disciplines/game-ui-ux": "presentation-only; reference-only",
    "disciplines/create-game-assets": "asset pipeline; not part of this integration",
    "disciplines/ai-behavior-trees-utility-ai": "Rust-owned simulation logic; reference-only",
}

def copy_skill(name, rel):
    src = UPSTREAM / rel
    dst = DEST / name
    if not (src / "SKILL.md").is_file():
        raise SystemExit(f"Missing SKILL.md at {src}")
    dst.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src / "SKILL.md", dst / "SKILL.md")
    refs = src / "references"
    if refs.is_dir():
        dst_refs = dst / "references"
        dst_refs.mkdir(exist_ok=True)
        for child in refs.iterdir():
            if child.is_file():
                shutil.copy2(child, dst_refs / child.name)
    print(f"copied {name} <- {rel}")

if not UPSTREAM.is_dir():
    raise SystemExit(f"Upstream snapshot missing: {UPSTREAM}. Clone gamedev collection first.")

DEST.mkdir(parents=True, exist_ok=True)
for name, rel in CURATED.items():
    copy_skill(name, rel)

manifest = {
    "generated_by": "integrate_skills.py",
    "upstream": {
        "mattpocock": {"rev": "3cca18b368ae95cdbdebbff572ccafa662551015", "disposition": "already reconciled into workspace .agents/skills (superset)"},
        "gamedev": {"rev": "cf44d99a0315dabff6ac6f407c6ccc026190f16c", "disposition": "curated flatten into workspace .agents/skills (OMP discovery root)"},
        "voltagent": {"rev": "8873794bcb26ff5dcf9cd518c87cf5638ca44b92", "disposition": "catalog-only: README index of links, not installable skills"},
    },
    "integrated": {name: {"source": rel} for name, rel in CURATED.items()},
    "excluded": EXCLUDED,
    "guardrail": "tools/game-stack/AGENTS.md (project-scoped context file, not a global skill)",
}
MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n")
print(f"wrote {MANIFEST.relative_to(ROOT)} with {len(CURATED)} integrated, {len(EXCLUDED)} exclusion notes")
