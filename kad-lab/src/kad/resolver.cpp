#include "resolver.hpp"

#include <optional>

#include "state_diff.hpp"

namespace kad {

Resolution Resolver::resolve(const GameState& before,
                             const ValidatedIntent& intent,
                             const RandomContext& /*ctx*/) {
  // ctx.seed is accepted but deliberately unused: Acquire/Move are
  // deterministic in EXPERIMENT-001 (no stochastic mechanics invented).
  GameState after = before;  // copy; mutated only on success
  Outcome outcome = Outcome::Success;
  EventKind kind = EventKind::PlayerMoved;
  EntityId subject = entity::player;  // placeholder; assigned on every path
  std::optional<EntityId> from;
  std::optional<EntityId> to;

  switch (intent.action) {
    case Action::Move: {
      const EntityId room = intent.target;  // guaranteed Location (validator)
      subject = room;
      if (room == before.player_room) {
        // Already there: no canonical transition.
        outcome = Outcome::UnsuccessfulAttempt;
        kind = EventKind::MoveFailed;
        from = room;
        to = room;
      } else {
        kind = EventKind::PlayerMoved;
        from = before.player_room;
        to = room;
        after.player_room = room;
      }
      break;
    }
    case Action::Acquire: {
      const EntityId object = intent.target;  // guaranteed Object (validator)
      subject = object;
      const std::optional<EntityId> object_room =
          (object == entity::key) ? before.key_room : before.crate_room;
      if (!object_room.has_value()) {
        // Already held: canonical state is "held"; no transition occurred.
        // Event.from = nullopt, Event.to = nullopt (PATCH 03).
        outcome = Outcome::UnsuccessfulAttempt;
        kind = EventKind::AcquireFailed;
        from = std::nullopt;
        to = std::nullopt;
      } else if (*object_room == before.player_room) {
        // In this room: acquisition succeeds; the object becomes held.
        kind = EventKind::ObjectAcquired;
        from = *object_room;
        to = std::nullopt;  // held
        if (object == entity::key) {
          after.key_room = std::nullopt;
        } else {
          after.crate_room = std::nullopt;
        }
      } else {
        // Object is in ANOTHER room: the attempt is unsuccessful and nothing
        // moves. Event describes what canonically occurred, NOT the requested
        // consequence: from = to = the object's current room. Event.to is
        // NEVER nullopt here, because nullopt means "held", which did not
        // occur (PATCH 03).
        outcome = Outcome::UnsuccessfulAttempt;
        kind = EventKind::AcquireFailed;
        from = *object_room;
        to = *object_room;
      }
      break;
    }
  }

  const Event event{kind, intent.actor, subject, from, to};
  // Single source of truth for StateDiff; guarantees by construction that
  // apply(diff, before) == after (STATE_DIFF_INVARIANT).
  const StateDiff d = diff(before, after);
  return Resolution{outcome, event, d, after};
}

}  // namespace kad
