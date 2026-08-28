// KAD-WP-002 — C++ Validator/Resolver CLI adapter (EXPERIMENT TRANSPORT ONLY).
// Mechanically converts experimental transport data to the accepted WP-001
// CandidateIntent type and calls the REAL WP-001 Validator, then the Resolver
// ONLY after real Validator acceptance. Reuses ../../src/kad/*.cpp unchanged.
// Standard library only. No JSON library. Deterministic line protocol.
//
// Input (stdin):
//   <player_room>   room_a | room_b | held
//   <key_room>      room_a | room_b | held   (held == nullopt == carried)
//   <crate_room>    room_a | room_b | held
//   <action_count>
//   per action:
//     <verb_null_flag>  0 | 1
//     <verb_string>     (blank line == empty string, used when flag == 1)
//     <target_count>
//     <target>  repeated target_count times
//   <property_count>
//   per property:
//     <key>
//     <value>
//
// Output: exactly ONE JSON line with the actual WP-001 result.
// Rejected:  {"status":"rejected","failure":"<FailureKind>"}
// Accepted:  {"status":"accepted","action":...,"actor":"player","target":...,
//             "outcome":...,"eventKind":...,"from":...,"to":...,
//             "afterPlayerRoom":...,"afterKeyRoom":...,"afterCrateRoom":...,
//             "diffFields":[...]}
// Serialization is EXPERIMENT TRANSPORT ONLY; it does not define semantic equality.

#include <iostream>
#include <optional>
#include <string>
#include <vector>

#include "../../src/kad/candidate.hpp"
#include "../../src/kad/resolver.hpp"
#include "../../src/kad/state_diff.hpp"
#include "../../src/kad/types.hpp"
#include "../../src/kad/validated.hpp"
#include "../../src/kad/validator.hpp"

namespace {

std::vector<std::string> read_lines() {
  // STRICT POSITIONAL protocol: exactly the lines the counts dictate. A blank
  // (whitespace-only) line is a real value — the empty string — used to
  // represent verb = null (verb_null_flag = 1). Nothing is skipped.
  std::vector<std::string> lines;
  std::string line;
  while (std::getline(std::cin, line)) {
    size_t b = line.find_first_not_of(" \t\r");
    size_t e = line.find_last_not_of(" \t\r");
    if (b == std::string::npos) {
      lines.push_back("");  // blank line == empty value (deterministic)
    } else {
      lines.push_back(line.substr(b, e - b + 1));
    }
  }
  return lines;
}

std::string json_escape(const std::string& s) {
  std::string out;
  for (char c : s) {
    if (c == '"' || c == '\\') out += '\\';
    out += c;
  }
  return out;
}

struct ParseError { std::string message; };

std::optional<kad::EntityId> parse_entity_field(const std::string& token) {
  // Returns nullopt for "held" (canonical 'not engaged' state), else the EntityId.
  if (token == "held") return std::nullopt;
  if (token == "room_a") return kad::entity::room_a;
  if (token == "room_b") return kad::entity::room_b;
  if (token == "key") return kad::entity::key;
  if (token == "crate") return kad::entity::crate;
  if (token == "player") return kad::entity::player;
  throw ParseError{"unknown state token \"" + token + "\""};
}

std::string entity_name(const kad::EntityId& id) {
  if (id == kad::entity::room_a) return "room_a";
  if (id == kad::entity::room_b) return "room_b";
  if (id == kad::entity::key) return "key";
  if (id == kad::entity::crate) return "crate";
  if (id == kad::entity::player) return "player";
  return "?";
}

std::string opt_entity_name(const std::optional<kad::EntityId>& v) {
  // nullopt == "held" (PATCH 03 semantics: nullopt means carried by the actor).
  return v.has_value() ? entity_name(*v) : "held";
}

std::string field_name(kad::FieldId f) {
  switch (f) {
    case kad::FieldId::PlayerRoom: return "PlayerRoom";
    case kad::FieldId::KeyRoom: return "KeyRoom";
    case kad::FieldId::CrateRoom: return "CrateRoom";
  }
  return "?";
}

std::string failure_kind_name(kad::FailureKind k) {
  switch (k) {
    case kad::FailureKind::Malformed: return "Malformed";
    case kad::FailureKind::UnknownReference: return "UnknownReference";
    case kad::FailureKind::AmbiguousReference: return "AmbiguousReference";
    case kad::FailureKind::InvalidParameter: return "InvalidParameter";
    case kad::FailureKind::UnsupportedAction: return "UnsupportedAction";
    case kad::FailureKind::MultipleActions: return "MultipleActions";
    case kad::FailureKind::UnexpectedProperty: return "UnexpectedProperty";
  }
  return "?";
}

std::string action_name(kad::Action a) {
  return a == kad::Action::Move ? "Move" : "Acquire";
}

std::string outcome_name(kad::Outcome o) {
  return o == kad::Outcome::Success ? "Success" : "UnsuccessfulAttempt";
}

std::string event_kind_name(kad::EventKind k) {
  switch (k) {
    case kad::EventKind::PlayerMoved: return "PlayerMoved";
    case kad::EventKind::ObjectAcquired: return "ObjectAcquired";
    case kad::EventKind::MoveFailed: return "MoveFailed";
    case kad::EventKind::AcquireFailed: return "AcquireFailed";
  }
  return "?";
}

}  // namespace

int main() {
  try {
    const std::vector<std::string> lines = read_lines();
    size_t i = 0;
    const auto next = [&]() -> std::string {
      if (i >= lines.size()) throw ParseError{"unexpected end of input"};
      return lines[i++];
    };
    const auto next_int = [&]() -> int {
      const std::string t = next();
      try {
        size_t pos = 0;
        const int v = std::stoi(t, &pos);
        if (pos != t.size() || t.empty()) throw std::invalid_argument("");
        return v;
      } catch (...) {
        throw ParseError{"expected integer, got \"" + t + "\""};
      }
    };

    kad::GameState state;
    state.player_room = *parse_entity_field(next());
    state.key_room = parse_entity_field(next());
    state.crate_room = parse_entity_field(next());

    kad::CandidateIntent candidate;

    const int action_count = next_int();
    if (action_count < 0) throw ParseError{"negative action_count"};
    for (int a = 0; a < action_count; ++a) {
      kad::RawAction raw;
      const int verb_null = next_int();
      if (verb_null != 0 && verb_null != 1) throw ParseError{"verb_null_flag must be 0 or 1"};
      const std::string verb = next();
      if (verb_null == 0) raw.verb = verb;
      const int target_count = next_int();
      if (target_count < 0) throw ParseError{"negative target_count"};
      for (int t = 0; t < target_count; ++t) raw.targets.push_back(next());
      candidate.actions.push_back(std::move(raw));
    }

    const int property_count = next_int();
    if (property_count < 0) throw ParseError{"negative property_count"};
    for (int p = 0; p < property_count; ++p) {
      const std::string key = next();
      const std::string value = next();
      candidate.properties.emplace_back(key, value);
    }

    const kad::ValidationResult result = kad::Validator::validate(candidate, state);
    if (!kad::is_accepted(result)) {
      const kad::ValidationFailure& failure = std::get<kad::ValidationFailure>(result);
      std::cout << "{\"status\":\"rejected\",\"failure\":\"" << failure_kind_name(failure.kind)
                << "\"}" << std::endl;
      return 0;
    }

    const kad::ValidatedIntent& intent = std::get<kad::ValidatedIntent>(result);
    // Resolver runs ONLY after real Validator acceptance. ctx.seed has no
    // influence on Acquire/Move outcomes (EXPERIMENT-001: no stochastic mechanics).
    const kad::Resolution res =
        kad::Resolver::resolve(state, intent, kad::RandomContext{0});

    std::string diff_json;
    const char* sep = "";
    for (const kad::FieldChange& change : res.diff.changes) {
      diff_json += sep;
      diff_json += "\"" + field_name(change.field) + "\"";
      sep = ",";
    }

    std::cout << "{\"status\":\"accepted\",\"action\":\"" << action_name(intent.action)
              << "\",\"actor\":\"" << entity_name(intent.actor)
              << "\",\"target\":\"" << entity_name(intent.target)
              << "\",\"outcome\":\"" << outcome_name(res.outcome)
              << "\",\"eventKind\":\"" << event_kind_name(res.event.kind)
              << "\",\"from\":\"" << opt_entity_name(res.event.from)
              << "\",\"to\":\"" << opt_entity_name(res.event.to)
              << "\",\"afterPlayerRoom\":\"" << entity_name(res.after.player_room)
              << "\",\"afterKeyRoom\":\"" << opt_entity_name(res.after.key_room)
              << "\",\"afterCrateRoom\":\"" << opt_entity_name(res.after.crate_room)
              << "\",\"diffFields\":[" << diff_json << "]}" << std::endl;
    return 0;
  } catch (const ParseError& e) {
    std::cout << "{\"status\":\"internal_error\",\"error\":\""
              << json_escape(e.message) << "\"}" << std::endl;
    return 1;
  }
}
