#pragma once
// Pure, deterministic, side-effect-free Validator:
//   (CandidateIntent, GameState const&) -> Accepted(ValidatedIntent)
//                                       | Rejected(ValidationFailure)
// Never mutates GameState, never produces Event/StateDiff, never predicts an
// outcome. Acceptance yields EXACTLY ONE ValidatedIntent.

#include "candidate.hpp"
#include "types.hpp"
#include "validated.hpp"

namespace kad {

class Validator {
 public:
  static ValidationResult validate(const CandidateIntent& candidate,
                                   const GameState& state);
};

}  // namespace kad
