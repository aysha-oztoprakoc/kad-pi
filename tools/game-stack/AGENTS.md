# Game Stack Architecture Guardrails

`[KAD-DERIVED]` determinism and ownership constraints for the Godot 4.7.2 + Rust
deterministic game stack. This file is a project-scoped context file: OMP loads it
only when working inside `tools/game-stack/`. These invariants override any
engine-skill guidance (including the integrated `gamedev-router`, `godot-*`,
`save-systems`, `input-systems`, `performance-optimization` skills) wherever they conflict.

## Non-negotiable invariants

1. **Rust owns 100% of simulation state.** Position, health, inventory, input history,
   RNG state, and the tick counter live in `stack-core` using fixed-point arithmetic.
   No gameplay state may live in Godot nodes, GDScript variables, or Godot physics bodies.
2. **Fixed-point math only in simulation.** No `f32`/`f64` inside `stack-core`. Use the
   canonical fixed type (`fixed::types::I32F32`) so behavior is identical across
   Intel/AMD/ARM architectures.
3. **Fixed deterministic tick, decoupled from render.** Simulation advances in invariant
   steps (1/60 s) driven by an accumulator in Rust. Godot `_process(delta)` /
   `_physics_process(delta)` may exist only as a frame/input pump that forwards
   **discrete integer commands** to Rust; they MUST NOT advance simulation state or run
   `move_and_slide` / `RigidBody` / physics.
4. **Godot = presentation + input capture.** GDScript reads Rust state for rendering and
   forwards discrete integer commands. It MUST NOT mutate simulation state, host
   authoritative netcode, or run native physics.
5. **Save/load serializes the Rust snapshot.** Deterministic, byte-identical serialization
   of `stack-core` state — not Godot node trees. Apply the `save-systems` skill's
   versioning/migration discipline to Rust state.
6. **Deterministic RNG lives in Rust**, seeded explicitly; never use Godot `randi()` /
   `randomize()` for simulation.
7. **Verification gate is `check.py`.** Before claiming done: `python check.py` must pass
   every stage — `cargo fmt --check`, `clippy -D warnings`, `gdparse`, `gdformat --check`,
   `gdlint`, Godot `--check-only`, native replay
   `ticks=600 position_bits=15099494400 snapshot_equal=true`, and headless smoke
   `STACK_QUALIFICATION PASS`.
8. **Build gates:** `python build.py <linux|windows|web>`. Web builds use the custom
   exception-compatible templates produced by `build_web_templates.py`.
9. **WebAssembly is the presentation transport only.** The `wasm32-unknown-emscripten`
   GDExtension ships Rust state to the browser; it is not the simulation authority.
   Validate it with `wasm-tools validate --features legacy-exceptions` (Emscripten
   legacy `try` instruction) and optimize with the bundled `wasm-opt`. See the
   `wasm-toolchain` skill.

## Skill precedence

- This file wins over any conflicting guidance in the integrated gamedev skills.
- `godot-physics`, `godot-multiplayer`, and `godot-csharp` are deliberately NOT integrated
  because they assert Godot-side state authority that violates invariant 1.
- When an integrated gamedev skill and this file disagree, this file is authoritative.
