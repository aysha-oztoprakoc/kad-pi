---
name: wasm-toolchain
description: WebAssembly build, validate, optimize, and debug workflow for the Godot 4.7.2 + Rust web target (wasm32-unknown-emscripten GDExtension). Use when building, inspecting, shrinking, or debugging the browser export.
---

# WebAssembly Toolchain (Godot + Rust web target)

Target: `wasm32-unknown-emscripten` — the Rust GDExtension compiled to WASM for the
Godot web export. This is the **browser presentation transport**, not the simulation
authority (see `tools/game-stack/AGENTS.md`).

## Architecture invariants

- **Rust simulation stays native fixed-point.** The WASM build is presentation-only.
  Determinism is proven by the native `stack-core` replay (`cargo run -p stack-core`),
  never by the WASM build.
- **Emscripten ABI, not wasm-bindgen / WASI.** The module imports browser/Emscripten JS
  functions, so `wasmtime` and WASI runtimes cannot instantiate it. Validate with
  `wasm-tools`, optimize with `wasm-opt`; execute it only in the browser via the Godot
  web export.
- **Pin the toolchain for reproducibility.** Native `rust-toolchain.toml` pins 1.98.1;
  the wasm build uses `nightly-2026-09-07` (`build.py web`). `build_web_templates.py`
  pins the Godot source revision and emsdk. Record exact versions before claiming
  byte-identical outputs.

## Build

```bash
python build.py web --export          # build stack_extension.wasm, import, export web
python build_web_templates.py         # rebuild custom exception-compatible web templates
```

Outputs: `exports/web/index.html`, `index.wasm` (engine), `index.side.wasm` (engine
side module), `stack_extension.wasm` (this crate's GDExtension), `index.pck`.

## Validate and inspect (parser / linter)

```bash
# Structural + type validation. The Emscripten build emits the LEGACY `try`
# instruction (JS-based exception handling), so the legacy-exceptions feature is
# REQUIRED — otherwise wasm-tools rejects a well-formed module:
wasm-tools validate --features legacy-exceptions \
  target/wasm32-unknown-emscripten/debug/stack_extension.wasm

# Disassemble to inspect imports/exports. Entrypoint is `gdext_rust_init`:
wasm-tools print target/wasm32-unknown-emscripten/debug/stack_extension.wasm | grep -E '\(export'

# List metadata (name, size, producers):
wasm-tools metadata show target/wasm32-unknown-emscripten/debug/stack_extension.wasm
```

## Optimize and shrink

The debug build is ~27 MB. Binaryen (`wasm-opt`, bundled with emsdk at
`emsdk/upstream/bin/wasm-opt`, version 123) shrinks it ~95%:

```bash
wasm-opt -O3 --strip-debug --strip-producers -o stack_extension.opt.wasm stack_extension.wasm
# ~27 MB -> ~1.3 MB (verified)
```

## Debug (browser DevTools)

- The web export loads `stack_extension.wasm` in the browser. Debug with Chrome/Edge
  DevTools → Sources → the wasm (debug build carries source maps).
- Native simulation bugs: use `lldb-dap` on the native binary (see `.omp/dap.json`),
  NOT the wasm — the deterministic simulation lives in native Rust.

## Verification gate

`check.py` runs `wasm-tools validate` and a `wasm-opt` size report on the built module
whenever `build.py web` has produced `stack_extension.wasm`.
