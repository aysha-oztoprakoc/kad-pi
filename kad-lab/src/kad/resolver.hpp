#pragma once
// Deterministic Resolver: GameState_before + ValidatedIntent + explicit
// RandomContext -> exactly one Resolution. Accepts ONLY ValidatedIntent
// (compile-time authority boundary: CandidateIntent can never reach here).
// Pure and deterministic; the seed is accepted but does not influence
// Acquire/Move outcomes.

#include "types.hpp"
#include "validated.hpp"

namespace kad {

struct Resolver {
  static Resolution resolve(const GameState& before,
                            const ValidatedIntent& intent,
                            const RandomContext& ctx);
};

}  // namespace kad
