#pragma once
// Trusted canonical command: produced ONLY by the Validator, consumed ONLY by
// the Resolver. The constructor is private (Validator is friend) so an
// untrusted CandidateIntent can never construct one; only a copied
// ValidatedIntent, or one built by the Validator, exists.

#include <cstdint>
#include <string>
#include <variant>

#include "types.hpp"

namespace kad {

class Validator;

struct ValidatedIntent {
  EntityId actor;    // entity performing the canonical attempt (entity::player
                     // in EXPERIMENT-001). Field is named "actor", not
                     // "subject" (binding amendment PATCH 04).
  Action action;     // exactly one canonical action
  EntityId target;   // canonical EntityId reference

  bool operator==(const ValidatedIntent&) const = default;

 private:
  friend class Validator;
  ValidatedIntent(EntityId actor_, Action action_, EntityId target_)
      : actor(actor_), action(action_), target(target_) {}
};

enum class FailureKind : uint8_t {
  Malformed,           // verb missing/empty, or targets.size() != 1
  UnknownReference,    // name absent from the reference table
  AmbiguousReference,  // name maps to multiple entities
  InvalidParameter,    // resolves exactly, but EntityKind incompatible with the
                       // action
  UnsupportedAction,   // verb not in {Acquire, Move}
  MultipleActions,     // actions.size() != 1
  UnexpectedProperty   // any invented/outcome-shaped property
};

struct ValidationFailure {
  FailureKind kind;
  std::string detail;
  bool operator==(const ValidationFailure&) const = default;
};

using ValidationResult = std::variant<ValidatedIntent, ValidationFailure>;

inline bool is_accepted(const ValidationResult& result) {
  return std::holds_alternative<ValidatedIntent>(result);
}

}  // namespace kad
