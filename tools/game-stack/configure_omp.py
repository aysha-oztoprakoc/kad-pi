#!/usr/bin/env python3
"""Link canonical workspace policy and skills without replacing local adaptations."""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent
WORKSPACE = ROOT.parent.parent
links = {
    ROOT / ".omp" / name: WORKSPACE / ".omp" / name
    for name in ("config.yml", "models.yml", "mcp.json", "extensions", "agents", "controllers.json")
}
for skill in sorted((WORKSPACE / ".agents/skills").iterdir()):
    if (skill / "SKILL.md").is_file():
        links[ROOT / ".agents/skills" / skill.name] = skill
for destination, source in links.items():
    if not source.exists():
        raise SystemExit(f"Required canonical source missing: {source}")
    if destination.exists() or destination.is_symlink():
        if not destination.is_symlink() or destination.resolve() != source.resolve():
            raise SystemExit(f"Refusing to replace existing project entry: {destination}")
        continue
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.symlink_to(os.path.relpath(source, destination.parent), target_is_directory=source.is_dir())
    print(f"Linked {destination.relative_to(ROOT)} -> {source.relative_to(WORKSPACE)}")
