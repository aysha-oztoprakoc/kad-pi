#pragma once
// UNTRUSTED candidate data: plain data only, no methods, no GameState access,
// no authority. May carry invented/outcome-shaped claims (properties) or
// multiple actions; the Validator must never let any of it reach the
// Resolver.

#include <optional>
#include <string>
#include <utility>
#include <vector>

namespace kad {

struct RawAction {
  std::optional<std::string> verb;
  std::vector<std::string> targets;
};

struct CandidateIntent {
  std::vector<RawAction> actions;
  std::vector<std::pair<std::string, std::string>> properties;
};

}  // namespace kad
