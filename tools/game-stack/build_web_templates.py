#!/usr/bin/env python3
"""Build Godot 4.7.2 web templates with native Wasm exception handling."""
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "godot-source"
EXPECTED_REVISION = "ed1daf0bf001b61586d9930840f2f1394092c079"
revision = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=SOURCE, text=True).strip()
if revision != EXPECTED_REVISION:
    raise SystemExit(f"Unexpected Godot source revision: {revision}")
env = os.environ.copy()
env["PATH"] = str(ROOT / "emsdk/upstream/emscripten") + os.pathsep + env["PATH"]
for target in ("template_debug", "template_release"):
    command = [
        str(ROOT / ".venv/bin/scons"), "-j2", "platform=web", f"target={target}",
        "arch=wasm32", "threads=no", "dlink_enabled=yes", "disable_exceptions=no",
        "ccflags=-fwasm-exceptions", "linkflags=-fwasm-exceptions",
        "lto=none", "debug_symbols=no",
    ]
    print("+", " ".join(command), flush=True)
    subprocess.run(command, cwd=SOURCE, env=env, check=True)
