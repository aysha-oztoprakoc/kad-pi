#include "validator.hpp"

#include <string>
#include <string_view>
#include <utility>
#include <vector>

namespace kad {
namespace {

// Deterministic exact-match reference table. Each name maps to 1 or many
// canonical entities. "room" -> {room_a, room_b} and "object" -> {key, crate}
// are the documented ambiguous aliases (multi-match => AmbiguousReference).
struct NamedEntity {
  std::string_view name;
  EntityId id;
};

constexpr NamedEntity kReferenceTable[] = {
    {"room_a", entity::room_a},
    {"room_b", entity::room_b},
    {"player", entity::player},
    {"key", entity::key},
    {"crate", entity::crate},
    {"room", entity::room_a},   // ambiguous alias
    {"room", entity::room_b},   // ambiguous alias
    {"object", entity::key},    // ambiguous alias
    {"object", entity::crate},  // ambiguous alias
};

// Returns 0, 1, or >1 matches in deterministic table order.
std::vector<EntityId> find_matches(const std::string& name) {
  std::vector<EntityId> matches;
  for (const NamedEntity& entry : kReferenceTable) {
    if (entry.name == name) {
      matches.push_back(entry.id);
    }
  }
  return matches;
}

ValidationFailure reject(FailureKind kind, std::string detail) {
  return ValidationFailure{kind, std::move(detail)};
}

}  // namespace

ValidationResult Validator::validate(const CandidateIntent& candidate,
                                     const GameState& /*state*/) {
  // GameState is intentionally const& and unused: validation NEVER consults or
  // mutates canonical state and NEVER decides the simulation outcome.

  // Shape (PATCH 01): exactly one action.
  if (candidate.actions.size() != 1) {
    return reject(FailureKind::MultipleActions,
                  "actions.size() != 1 (exactly one RawAction required)");
  }
  const RawAction& raw = candidate.actions.front();

  // Shape (PATCH 01): the single RawAction must have a verb and EXACTLY ONE
  // target. Zero or multiple targets are never accepted.
  if (!raw.verb.has_value() || raw.verb->empty() || raw.targets.size() != 1) {
    return reject(FailureKind::Malformed,
                  "verb missing/empty or targets.size() != 1");
  }

  // Action vocabulary.
  Action action;
  if (*raw.verb == "Move") {
    action = Action::Move;
  } else if (*raw.verb == "Acquire") {
    action = Action::Acquire;
  } else {
    return reject(FailureKind::UnsupportedAction, "verb \"" + *raw.verb + "\"");
  }

  // Reference resolution (PATCH 02) — three distinct states:
  //   name absent                                        -> UnknownReference
  //   name maps to multiple entities                     -> AmbiguousReference
  //   name resolves exactly but kind incompatible        -> InvalidParameter
  const std::string& name = raw.targets.front();
  const std::vector<EntityId> matches = find_matches(name);
  if (matches.empty()) {
    return reject(FailureKind::UnknownReference, "name \"" + name + "\"");
  }
  if (matches.size() > 1) {
    return reject(FailureKind::AmbiguousReference, "name \"" + name + "\"");
  }
  const EntityId target = matches.front();
  const EntityKind required =
      (action == Action::Move) ? EntityKind::Location : EntityKind::Object;
  if (target.kind != required) {
    // New FailureKind::InvalidParameter; NOT UnknownReference, NOT
    // UnsupportedAction. No discretion over this mapping.
    return reject(FailureKind::InvalidParameter,
                  "resolved name \"" + name + "\" has EntityKind "
                  "incompatible with the action");
  }

  // Invented/outcome-shaped properties (e.g. "success=true") are never
  // admitted.
  if (!candidate.properties.empty()) {
    return reject(FailureKind::UnexpectedProperty,
                  "unexpected property present");
  }

  // Acceptance: EXACTLY ONE ValidatedIntent (PATCH 04: field is "actor";
  // actor = entity::player for EXPERIMENT-001).
  return ValidatedIntent(entity::player, action, target);
}

}  // namespace kad
