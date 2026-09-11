#!/usr/bin/env python3
"""Build the pinned stack qualification project; no global shell configuration."""
import argparse
import os
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent
GODOT = Path.home() / ".local/share/godot/4.7.2/Godot_v4.7.2-stable_linux.x86_64"
NIGHTLY = "nightly-2026-09-07"

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("target", choices=["linux", "windows", "web"])
parser.add_argument("--export", action="store_true", help="Export a runnable debug qualification build")
args = parser.parse_args()

env = os.environ.copy()
env["GODOT4_BIN"] = str(GODOT)
env["PATH"] = str(ROOT / "emsdk/upstream/emscripten") + os.pathsep + env["PATH"]
command = ["cargo", "build", "--locked", "-p", "stack-extension"]
if args.target == "web":
    command = ["cargo", "+" + NIGHTLY, "build", "--locked", "-Zbuild-std", "--target", "wasm32-unknown-emscripten", "-p", "stack-extension", "--features", "web"]
    artifact = ROOT / "target/wasm32-unknown-emscripten/debug/stack_extension.wasm"
elif args.target == "windows":
    command += ["--target", "x86_64-pc-windows-gnu"]
    artifact = ROOT / "target/x86_64-pc-windows-gnu/debug/stack_extension.dll"
else:
    artifact = ROOT / "target/debug/libstack_extension.so"

print("+", " ".join(command), flush=True)
subprocess.run(command, cwd=ROOT, env=env, check=True)
bin_dir = ROOT / "godot"
shutil.copy2(artifact, bin_dir / artifact.name)

# Editor import runs on the host even when exporting another platform.
if args.target != "linux" and not (bin_dir / "libstack_extension.so").exists():
    raise SystemExit("Build linux once before exporting: python build.py linux")
subprocess.run([str(GODOT), "--headless", "--path", str(ROOT / "godot"), "--editor", "--import"], env=env, check=True)
if args.export:
    presets = {"linux": ("Linux", "qualification.x86_64"), "windows": ("Windows", "qualification.exe"), "web": ("Web", "index.html")}
    preset, filename = presets[args.target]
    export_dir = ROOT / "exports" / args.target
    export_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run([str(GODOT), "--headless", "--path", str(ROOT / "godot"), "--export-debug", preset, str(export_dir / filename)], env=env, check=True)
    print("Export:", export_dir / filename)
