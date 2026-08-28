// KAD-WP-002 Deterministic Authority Engine CLI
// Pure C++20 standard library CLI for the KAD intent-authority boundary.
//
// Input Protocol (stdin):
//   Line 1: player_room (room_a | room_b)
//   Line 2: key_room    (room_a | room_b | held)
//   Line 3: crate_room  (room_a | room_b | held)
//   Line 4: action_count (integer, e.g. 1)
//   Per Action:
//     Line A: verb_null_flag (0 = verb present, 1 = null/empty)
//     Line B: verb_string (e.g. "Acquire" or "Move" or "Open")
//     Line C: target_count (integer)
//     Line D+: target_string (repeated target_count times)
//   Line 5: property_count (integer)
//   Per Property:
//     Line P1: key
//     Line P2: value
//
// Output: Single-line JSON representation of validation, resolution, and StateDiff.

#include <iostream>
#include <optional>
#include <sstream>
#include <string>
#include <vector>

#include "candidate.hpp"
#include "resolver.hpp"
#include "state_diff.hpp"
#include "types.hpp"
#include "validated.hpp"
#include "validator.hpp"

namespace {

std::vector<std::string> read_all_lines() {
  std::vector<std::string> lines;
  std::string line;
  while (std::getline(std::cin, line)) {
    // Strip trailing carriage returns
    if (!line.empty() && line.back() == '\r') {
      line.pop_back();
    }
    lines.push_back(line);
  }
  return lines;
}

std::string json_escape(const std::string& s) {
  std::string out;
  for (char c : s) {
    if (c == '"') out += "\\\"";
    else if (c == '\\') out += "\\\\";
    else if (c == '\n') out += "\\n";
    else if (c == '\r') out += "\\r";
    else if (c == '\t') out += "\\t";
    else out += c;
  }
  return out;
}

std::optional<kad::EntityId> parse_entity_token(const std::string& token) {
  if (token == "held" || token == "null" || token.empty()) return std::nullopt;
  if (token == "room_a") return kad::entity::room_a;
  if (token == "room_b") return kad::entity::room_b;
  if (token == "player") return kad::entity::player;
  if (token == "key") return kad::entity::key;
  if (token == "crate") return kad::entity::crate;
  throw std::runtime_error("Unknown entity token: " + token);
}

std::string entity_to_str(const kad::EntityId& id) {
  if (id == kad::entity::room_a) return "room_a";
  if (id == kad::entity::room_b) return "room_b";
  if (id == kad::entity::player) return "player";
  if (id == kad::entity::key) return "key";
  if (id == kad::entity::crate) return "crate";
  return "unknown";
}

std::string opt_entity_to_str(const std::optional<kad::EntityId>& opt) {
  return opt.has_value() ? entity_to_str(*opt) : "held";
}

std::string failure_kind_to_str(kad::FailureKind k) {
  switch (k) {
    case kad::FailureKind::Malformed: return "Malformed";
    case kad::FailureKind::UnknownReference: return "UnknownReference";
    case kad::FailureKind::AmbiguousReference: return "AmbiguousReference";
    case kad::FailureKind::InvalidParameter: return "InvalidParameter";
    case kad::FailureKind::UnsupportedAction: return "UnsupportedAction";
    case kad::FailureKind::MultipleActions: return "MultipleActions";
    case kad::FailureKind::UnexpectedProperty: return "UnexpectedProperty";
  }
  return "UnknownFailure";
}

std::string action_to_str(kad::Action a) {
  return (a == kad::Action::Move) ? "Move" : "Acquire";
}

std::string outcome_to_str(kad::Outcome o) {
  return (o == kad::Outcome::Success) ? "Success" : "UnsuccessfulAttempt";
}

std::string event_kind_to_str(kad::EventKind k) {
  switch (k) {
    case kad::EventKind::PlayerMoved: return "PlayerMoved";
    case kad::EventKind::ObjectAcquired: return "ObjectAcquired";
    case kad::EventKind::MoveFailed: return "MoveFailed";
    case kad::EventKind::AcquireFailed: return "AcquireFailed";
  }
  return "UnknownEvent";
}

std::string field_id_to_str(kad::FieldId f) {
  switch (f) {
    case kad::FieldId::PlayerRoom: return "PlayerRoom";
    case kad::FieldId::KeyRoom: return "KeyRoom";
    case kad::FieldId::CrateRoom: return "CrateRoom";
  }
  return "UnknownField";
}

std::string field_val_to_str(const kad::FieldValue& val) {
  if (val.index() == 0) {
    return entity_to_str(std::get<kad::EntityId>(val));
  }
  return "held";
}

}  // namespace

int main() {
  try {
    const std::vector<std::string> lines = read_all_lines();
    size_t cursor = 0;

    auto next_line = [&]() -> std::string {
      if (cursor >= lines.size()) {
        throw std::runtime_error("Unexpected EOF in input stream");
      }
      return lines[cursor++];
    };

    auto next_int = [&]() -> int {
      std::string s = next_line();
      try {
        return std::stoi(s);
      } catch (...) {
        throw std::runtime_error("Expected integer, got: " + s);
      }
    };

    // 1. Initial State
    kad::GameState state;
    auto p_room = parse_entity_token(next_line());
    if (!p_room.has_value()) {
      throw std::runtime_error("player_room cannot be held/null");
    }
    state.player_room = *p_room;
    state.key_room = parse_entity_token(next_line());
    state.crate_room = parse_entity_token(next_line());

    // 2. Candidate Intent
    kad::CandidateIntent candidate;
    int action_count = next_int();
    if (action_count < 0) throw std::runtime_error("Negative action count");

    for (int a = 0; a < action_count; ++a) {
      kad::RawAction raw;
      int verb_null = next_int();
      std::string verb_str = next_line();
      if (verb_null == 0 && !verb_str.empty()) {
        raw.verb = verb_str;
      }
      int target_count = next_int();
      if (target_count < 0) throw std::runtime_error("Negative target count");
      for (int t = 0; t < target_count; ++t) {
        raw.targets.push_back(next_line());
      }
      candidate.actions.push_back(std::move(raw));
    }

    int prop_count = next_int();
    if (prop_count < 0) throw std::runtime_error("Negative property count");
    for (int p = 0; p < prop_count; ++p) {
      std::string k = next_line();
      std::string v = next_line();
      candidate.properties.emplace_back(k, v);
    }

    // 3. Deterministic Validation
    const kad::ValidationResult val_res = kad::Validator::validate(candidate, state);

    if (!kad::is_accepted(val_res)) {
      const auto& failure = std::get<kad::ValidationFailure>(val_res);
      std::cout << "{\"status\":\"rejected\","
                << "\"failure_kind\":\"" << failure_kind_to_str(failure.kind) << "\","
                << "\"detail\":\"" << json_escape(failure.detail) << "\","
                << "\"state_after\":{"
                << "\"player_room\":\"" << entity_to_str(state.player_room) << "\","
                << "\"key_room\":\"" << opt_entity_to_str(state.key_room) << "\","
                << "\"crate_room\":\"" << opt_entity_to_str(state.crate_room) << "\""
                << "},"
                << "\"diff_changes\":[]"
                << "}" << std::endl;
      return 0;
    }

    // 4. Deterministic Resolution (ONLY after acceptance)
    const auto& intent = std::get<kad::ValidatedIntent>(val_res);
    const kad::Resolution resolution = kad::Resolver::resolve(state, intent, kad::RandomContext{0});

    // 5. Build StateDiff JSON
    std::ostringstream diff_json;
    diff_json << "[";
    for (size_t i = 0; i < resolution.diff.changes.size(); ++i) {
      const auto& ch = resolution.diff.changes[i];
      if (i > 0) diff_json << ",";
      diff_json << "{\"field\":\"" << field_id_to_str(ch.field) << "\","
                << "\"before\":\"" << field_val_to_str(ch.before) << "\","
                << "\"after\":\"" << field_val_to_str(ch.after) << "\"}";
    }
    diff_json << "]";

    std::cout << "{\"status\":\"accepted\","
              << "\"action\":\"" << action_to_str(intent.action) << "\","
              << "\"actor\":\"" << entity_to_str(intent.actor) << "\","
              << "\"target\":\"" << entity_to_str(intent.target) << "\","
              << "\"outcome\":\"" << outcome_to_str(resolution.outcome) << "\","
              << "\"event_kind\":\"" << event_kind_to_str(resolution.event.kind) << "\","
              << "\"from\":\"" << opt_entity_to_str(resolution.event.from) << "\","
              << "\"to\":\"" << opt_entity_to_str(resolution.event.to) << "\","
              << "\"state_after\":{"
              << "\"player_room\":\"" << entity_to_str(resolution.after.player_room) << "\","
              << "\"key_room\":\"" << opt_entity_to_str(resolution.after.key_room) << "\","
              << "\"crate_room\":\"" << opt_entity_to_str(resolution.after.crate_room) << "\""
              << "},"
              << "\"diff_changes\":" << diff_json.str()
              << "}" << std::endl;

    return 0;
  } catch (const std::exception& e) {
    std::cout << "{\"status\":\"error\",\"message\":\"" << json_escape(e.what()) << "\"}" << std::endl;
    return 1;
  }
}
