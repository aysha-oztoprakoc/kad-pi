#pragma once
// KAD-WP-001-INTENT-AUTHORITY-BOUNDARY — canonical microdomain types.
// EXPERIMENT-001 fixed microdomain: rooms {room_a, room_b}, actor {player},
// objects {key, crate}; command variants {Acquire, Move}.
// ALL canonical state lives in GameState; every canonical transition is
// described by Event + StateDiff + GameState_after.

#include <cstdint>
#include <optional>
#include <variant>
#include <vector>

namespace kad {

// Opaque typed canonical identity.
enum class EntityKind : uint8_t { Location, Actor, Object };

struct EntityId {
  EntityKind kind;
  uint32_t index;
  bool operator==(const EntityId&) const = default;
  bool operator!=(const EntityId&) const = default;
};

// Predefined canonical entities (opaque: kind + index).
namespace entity {
  inline constexpr EntityId room_a{EntityKind::Location, 0};
  inline constexpr EntityId room_b{EntityKind::Location, 1};
  inline constexpr EntityId player{EntityKind::Actor, 0};
  inline constexpr EntityId key{EntityKind::Object, 0};
  inline constexpr EntityId crate{EntityKind::Object, 1};
}

// Canonical command variants.
enum class Action : uint8_t { Acquire, Move };

// ALL canonical simulation state (exactly 3 fields).
struct GameState {
  EntityId player_room;               // room_a | room_b
  std::optional<EntityId> key_room;   // engaged = in that room; nullopt = held
  std::optional<EntityId> crate_room; // engaged = in that room; nullopt = held
  bool operator==(const GameState&) const = default;  // SEMANTIC deep equality
};

// Exhaustive canonical field set.
enum class FieldId : uint8_t { PlayerRoom, KeyRoom, CrateRoom };

// FieldValue nullopt member == "held" (object carried by the actor).
using FieldValue = std::variant<EntityId, std::nullopt_t>;

// Explicit semantic equality for FieldValue (std::nullopt_t alternatives have
// no library operator==, so defaulted member-wise equality is ill-formed).
inline bool operator==(const FieldValue& a, const FieldValue& b) {
  if (a.index() != b.index()) return false;
  if (a.index() == 0) return std::get<EntityId>(a) == std::get<EntityId>(b);
  return true;  // both alternatives "held" (nullopt_t)
}
inline bool operator!=(const FieldValue& a, const FieldValue& b) {
  return !(a == b);
}

struct FieldChange {
  FieldId field;
  FieldValue before;
  FieldValue after;
  bool operator==(const FieldChange&) const = default;
};

// Complete canonical mutation description. Empty == no canonical mutation.
struct StateDiff {
  std::vector<FieldChange> changes;
  bool operator==(const StateDiff&) const = default;
};

enum class EventKind : uint8_t { PlayerMoved, ObjectAcquired, MoveFailed, AcquireFailed };

// Semantic event: Event.actor = entity performing the canonical attempt;
// Event.subject = canonical target affected by the attempt.
struct Event {
  EventKind kind;
  EntityId actor;
  EntityId subject;
  std::optional<EntityId> from;  // nullopt = "held" where meaningful
  std::optional<EntityId> to;    // nullopt = "held" where meaningful
  bool operator==(const Event&) const = default;
};

enum class Outcome : uint8_t { Success, UnsuccessfulAttempt };

struct Resolution {
  Outcome outcome;
  Event event;
  StateDiff diff;
  GameState after;
  bool operator==(const Resolution&) const = default;
};

// Explicit deterministic random context. Accepted by the Resolver; does NOT
// influence Acquire/Move outcomes in EXPERIMENT-001 (no invented stochastic
// mechanics).
struct RandomContext {
  uint64_t seed;
};

}  // namespace kad
