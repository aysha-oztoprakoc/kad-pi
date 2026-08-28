#pragma once
// StateDiff primitives: complete, minimal canonical mutation description with
// read/write/diff/apply.

#include "types.hpp"

namespace kad {

FieldValue read_field(const GameState& state, FieldId field);

void write_field(GameState& state, FieldId field, const FieldValue& value);

// One FieldChange per field whose value differs; identical fields omitted.
StateDiff diff(const GameState& before, const GameState& after);

// Applies a consistent diff to a copy of `before`. Fails hard (throws
// std::logic_error) on an inconsistent diff (field current value !=
// change.before) or on a duplicated FieldId. Returns the mutated copy.
GameState apply(const StateDiff& d, GameState before);

}  // namespace kad
