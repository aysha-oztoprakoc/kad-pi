#include "state_diff.hpp"

#include <stdexcept>

namespace kad {
namespace {

FieldValue value(EntityId id) {
  return FieldValue{std::in_place_type<EntityId>, id};
}

FieldValue held() {
  return FieldValue{std::in_place_type<std::nullopt_t>, std::nullopt};
}

bool is_held(const FieldValue& v) {
  return std::holds_alternative<std::nullopt_t>(v);
}

EntityId as_entity(const FieldValue& v) {
  return std::get<EntityId>(v);
}

}  // namespace

FieldValue read_field(const GameState& state, FieldId field) {
  switch (field) {
    case FieldId::PlayerRoom:
      return value(state.player_room);
    case FieldId::KeyRoom:
      return state.key_room.has_value() ? value(*state.key_room) : held();
    case FieldId::CrateRoom:
      return state.crate_room.has_value() ? value(*state.crate_room) : held();
  }
  return held();  // unreachable: FieldId is exhaustive
}

void write_field(GameState& state, FieldId field, const FieldValue& v) {
  switch (field) {
    case FieldId::PlayerRoom:
      state.player_room = as_entity(v);
      break;
    case FieldId::KeyRoom:
      state.key_room = is_held(v) ? std::nullopt
                                  : std::optional<EntityId>(as_entity(v));
      break;
    case FieldId::CrateRoom:
      state.crate_room = is_held(v) ? std::nullopt
                                    : std::optional<EntityId>(as_entity(v));
      break;
  }
}

StateDiff diff(const GameState& before, const GameState& after) {
  StateDiff result;
  const FieldId kFields[] = {FieldId::PlayerRoom, FieldId::KeyRoom,
                             FieldId::CrateRoom};
  for (FieldId field : kFields) {
    const FieldValue b = read_field(before, field);
    const FieldValue a = read_field(after, field);
    if (!(b == a)) {
      result.changes.push_back(FieldChange{field, b, a});
    }
  }
  return result;
}

GameState apply(const StateDiff& d, GameState before) {
  uint8_t seen = 0;  // bit per FieldId; rejects duplicated fields
  for (const FieldChange& change : d.changes) {
    const uint8_t bit =
        static_cast<uint8_t>(static_cast<uint8_t>(1) << static_cast<uint8_t>(change.field));
    if ((seen & bit) != 0) {
      throw std::logic_error("apply: duplicated FieldId in StateDiff");
    }
    seen = static_cast<uint8_t>(seen | bit);
    if (read_field(before, change.field) != change.before) {
      throw std::logic_error(
          "apply: inconsistent StateDiff (current value != change.before)");
    }
    write_field(before, change.field, change.after);
  }
  return before;
}

}  // namespace kad
