#!/usr/bin/env python3
"""Run local parsers, format checks, linters, WASM validation, and native replay smoke test."""
import json
import os
import shutil
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
GODOT = Path.home() / ".local/share/godot/4.7.2/Godot_v4.7.2-stable_linux.x86_64"
EXPECTED = "ticks=600 position_bits=15099494400 snapshot_equal=true"
WASM = ROOT / "target/wasm32-unknown-emscripten/debug/stack_extension.wasm"
WASM_TOOLS = shutil.which("wasm-tools") or str(Path.home() / ".cargo/bin/wasm-tools")
WASM_OPT = ROOT / "emsdk/upstream/bin/wasm-opt"

commands = [
    ["/usr/bin/cargo", "fmt", "--all", "--", "--check"],
    ["/usr/bin/cargo", "clippy", "--locked", "--workspace", "--all-targets", "--", "-D", "warnings"],
    [str(ROOT / ".venv/bin/gdparse"), "godot/main.gd"],
    [str(ROOT / ".venv/bin/gdformat"), "--check", "godot/main.gd"],
    [str(ROOT / ".venv/bin/gdlint"), "godot/main.gd"],
    [str(GODOT), "--headless", "--path", str(ROOT / "godot"), "--check-only", "--script", "res://main.gd"],
    ["/usr/bin/cargo", "run", "--locked", "--quiet", "-p", "stack-core"],
    [str(GODOT), "--headless", "--path", str(ROOT / "godot"), "--quit-after", "60"],
]

# WASM structural validation is conditional: it applies only after `build.py web`
# has produced the module, and requires wasm-tools to be installed.
if WASM.exists():
    commands.append([WASM_TOOLS, "validate", "--features", "legacy-exceptions", str(WASM)])

results = []
for command in commands:
    print("+", " ".join(command), flush=True)
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, timeout=300)
    text = result.stdout + result.stderr
    passed = result.returncode == 0
    if "stack-core" in command:
        passed = passed and result.stdout.strip() == EXPECTED
    if "--quit-after" in command:
        passed = passed and f"STACK_QUALIFICATION PASS: {EXPECTED}" in result.stdout
    if "wasm-tools" in command:
        passed = passed and "error" not in text.lower()
    if "SCRIPT ERROR" in text or "ERROR:" in text:
        passed = False
    results.append({"command": command, "exit": result.returncode, "passed": passed, "output": text})
    print(text, end="", flush=True)

# Informational (non-gating) size report: debug build vs binaryen-optimized.
size_note = None
if WASM.exists() and Path(WASM_OPT).exists():
    debug_size = WASM.stat().st_size
    optimized = Path("/tmp/stack_extension.opt.wasm")
    subprocess.run(
        [str(WASM_OPT), "-O3", "--strip-debug", "--strip-producers", "-o", str(optimized), str(WASM)],
        cwd=ROOT, capture_output=True, text=True, timeout=300,
    )
    if optimized.exists():
        opt_size = optimized.stat().st_size
        size_note = {"debug_bytes": debug_size, "optimized_bytes": opt_size,
                     "reduction_pct": round(100 * (1 - opt_size / debug_size), 1)}
        print(f"WASM size: {debug_size} -> {opt_size} bytes ({size_note['reduction_pct']}% smaller)", flush=True)

report = {"passed": all(row["passed"] for row in results), "checks": results}
if size_note:
    report["wasm_size"] = size_note
print(json.dumps(report, indent=2))
sys.exit(0 if report["passed"] else 1)
