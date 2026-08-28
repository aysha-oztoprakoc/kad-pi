// KAD-WP-001-INTENT-AUTHORITY-BOUNDARY (EXPERIMENT-001)
// 14 self-asserting evidence cases. Exit code 0 iff every case passes.
// No clock, no RNG, no filesystem, no network anywhere in this program.

#include <cstdint>
#include <iostream>
#include <optional>
#include <string>
#include <type_traits>
#include <utility>
#include <variant>
#include <vector>

#include "../src/kad/candidate.hpp"
#include "../src/kad/resolver.hpp"
#include "../src/kad/state_diff.hpp"
#include "../src/kad/types.hpp"
#include "../src/kad/validated.hpp"
#include "../src/kad/validator.hpp"

using namespace kad;

namespace {

int g_failures = 0;

void note_failure(const char* file, int line, const char* expr) {
  std::cerr << "    FAIL " << file << ":" << line << ": " << expr << std::endl;
  ++g_failures;
}

}  // namespace

// Variadic single-line CHECK: safe with commas inside braces and requires no
// backslash continuations.
#define CHECK(...) do { if (!(__VA_ARGS__)) note_failure(__FILE__, __LINE__, #__VA_ARGS__); } while (0)

// ---------------------------------------------------------------------------
// ---- Case 11 (compile-time part): type enforcement — the authority         --
// ---- boundary is a TYPE boundary, proven by the fact that these            --
// ---- assertions compile at all.                                            --
// ---------------------------------------------------------------------------
// CandidateIntent (untrusted) is NOT convertible to / constructible as
// ValidatedIntent in any way.
static_assert(!std::is_convertible_v<CandidateIntent, ValidatedIntent>);
static_assert(!std::is_constructible_v<ValidatedIntent, CandidateIntent>);
// ValidatedIntent has no public constructor (Validator is the only friend).
static_assert(!std::is_constructible_v<ValidatedIntent, EntityId, Action,
                                       EntityId>);
// ... but copies of an already-validated intent are fine (replay).
static_assert(std::is_copy_constructible_v<ValidatedIntent>);
// Resolver accepts ONLY ValidatedIntent; Validator returns exactly
// ValidationResult.
static_assert(std::is_same_v<
              decltype(Validator::validate(std::declval<const CandidateIntent&>(),
                                           std::declval<const GameState&>())),
              ValidationResult>);
static_assert(std::is_same_v<
              decltype(Resolver::resolve(std::declval<const GameState&>(),
                                         std::declval<const ValidatedIntent&>(),
                                         std::declval<const RandomContext&>())),
              Resolution>);

namespace {

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
GameState st(EntityId player_room, std::optional<EntityId> key_room,
             std::optional<EntityId> crate_room) {
  return GameState{player_room, key_room, crate_room};
}

// player in room_a; key in room_b; crate in room_a.
GameState default_state() {
  return st(entity::room_a, entity::room_b, entity::room_a);
}

CandidateIntent command(const std::optional<std::string>& verb,
                        std::vector<std::string> targets) {
  return CandidateIntent{{RawAction{verb, std::move(targets)}}, {}};
}

CandidateIntent with_property(CandidateIntent candidate, std::string key,
                              std::string value) {
  candidate.properties.emplace_back(std::move(key), std::move(value));
  return candidate;
}

// nullopt == accepted; otherwise the rejection kind.
std::optional<FailureKind> rejection(const CandidateIntent& candidate,
                                     const GameState& game_state) {
  const ValidationResult result = Validator::validate(candidate, game_state);
  if (is_accepted(result)) {
    return std::nullopt;
  }
  return std::get<ValidationFailure>(result).kind;
}

ValidatedIntent accepted(const CandidateIntent& candidate,
                         const GameState& game_state) {
  const ValidationResult result = Validator::validate(candidate, game_state);
  if (!is_accepted(result)) {
    note_failure(__FILE__, __LINE__,
                 "expected acceptance but validation rejected");
  }
  return std::get<ValidatedIntent>(result);
}

Resolution run(const GameState& before, const ValidatedIntent& intent) {
  return Resolver::resolve(before, intent, RandomContext{42});
}

bool same_resolution(const Resolution& a, const Resolution& b) {
  return a.outcome == b.outcome && a.event == b.event && a.diff == b.diff &&
         a.after == b.after;
}

// ---------------------------------------------------------------------------
// 1  valid successful action
// ---------------------------------------------------------------------------
void case_1_valid_success() {
  std::cout << "1  valid success (Move room_a->room_b; Acquire key in hand room) ... ";

  // Move: player room_a -> room_b.
  {
    const GameState before = st(entity::room_a, entity::room_a, entity::room_a);
    const ValidatedIntent vi = accepted(command("Move", {"room_b"}), before);
    CHECK(vi.actor == entity::player);  // PATCH 04: actor == player
    CHECK(vi.action == Action::Move);
    CHECK(vi.target == entity::room_b);
    const Resolution res = run(before, vi);

    CHECK(res.outcome == Outcome::Success);
    CHECK(res.event.kind == EventKind::PlayerMoved);
    CHECK(res.event == Event{EventKind::PlayerMoved, entity::player,
                             entity::room_b, entity::room_a, entity::room_b});
    CHECK(res.after.player_room == entity::room_b);
    CHECK(res.diff.changes.size() == 1);
    CHECK(res.diff.changes[0].field == FieldId::PlayerRoom);
    CHECK(apply(res.diff, before) == res.after);
  }

  // Acquire: key in the same room as the player -> held.
  {
    const GameState before = st(entity::room_a, entity::room_a, entity::room_a);
    const ValidatedIntent vi = accepted(command("Acquire", {"key"}), before);
    CHECK(vi.actor == entity::player);
    CHECK(vi.action == Action::Acquire);
    CHECK(vi.target == entity::key);
    const Resolution res = run(before, vi);

    CHECK(res.outcome == Outcome::Success);
    CHECK(res.event.kind == EventKind::ObjectAcquired);
    CHECK(res.event == Event{EventKind::ObjectAcquired, entity::player,
                             entity::key, entity::room_a, std::nullopt});
    CHECK(!res.after.key_room.has_value());  // now held
    CHECK(res.diff.changes.size() == 1);
    CHECK(res.diff.changes[0].field == FieldId::KeyRoom);
    CHECK(apply(res.diff, before) == res.after);
  }
  std::cout << "PASS" << std::endl;
}

// ---------------------------------------------------------------------------
// 2  valid unsuccessful attempt (PATCH 03 event semantics)
// ---------------------------------------------------------------------------
void case_2_valid_unsuccessful() {
  std::cout << "2  valid unsuccessful (Acquire cross-room; Move already there; Acquire held) ... ";

  // Acquire(key) while player in room_a and key in room_b:
  // Outcome=UnsuccessfulAttempt, EventKind=AcquireFailed, Event.from=room_b,
  // Event.to=room_b (NOT nullopt), StateDiff empty, after==before (PATCH 03).
  {
    const GameState before = default_state();
    const ValidatedIntent vi = accepted(command("Acquire", {"key"}), before);
    const Resolution res = run(before, vi);

    CHECK(res.outcome == Outcome::UnsuccessfulAttempt);
    CHECK(res.event.kind == EventKind::AcquireFailed);
    CHECK(res.event == Event{EventKind::AcquireFailed, entity::player,
                             entity::key, entity::room_b, entity::room_b});
    CHECK(res.diff.changes.empty());
    CHECK(res.after == before);
  }

  // Move(room_a) while already in room_a: no canonical transition.
  {
    const GameState before = st(entity::room_a, entity::room_a, entity::room_a);
    const ValidatedIntent vi = accepted(command("Move", {"room_a"}), before);
    const Resolution res = run(before, vi);

    CHECK(res.outcome == Outcome::UnsuccessfulAttempt);
    CHECK(res.event.kind == EventKind::MoveFailed);
    CHECK(res.event == Event{EventKind::MoveFailed, entity::player,
                             entity::room_a, entity::room_a, entity::room_a});
    CHECK(res.diff.changes.empty());
    CHECK(res.after == before);
  }

  // Acquire(key) while already held: Event.from = nullopt, Event.to = nullopt,
  // StateDiff empty, after==before (PATCH 03).
  {
    const GameState before = st(entity::room_a, std::nullopt, entity::room_a);
    const ValidatedIntent vi = accepted(command("Acquire", {"key"}), before);
    const Resolution res = run(before, vi);

    CHECK(res.outcome == Outcome::UnsuccessfulAttempt);
    CHECK(res.event.kind == EventKind::AcquireFailed);
    CHECK(res.event == Event{EventKind::AcquireFailed, entity::player,
                             entity::key, std::nullopt, std::nullopt});
    CHECK(res.diff.changes.empty());
    CHECK(res.after == before);
  }
  std::cout << "PASS" << std::endl;
}

// ---------------------------------------------------------------------------
// 3  reference resolution: unknown vs wrong-kind (PATCH 02)
// ---------------------------------------------------------------------------
void case_3_reference_unknown_and_invalid_parameter() {
  std::cout << "3  unknown reference + InvalidParameter (wrong EntityKind) ... ";
  const GameState before = default_state();

  // Name absent from the reference table -> UnknownReference.
  CHECK(rejection(command("Acquire", {"diamond"}), before) ==
        FailureKind::UnknownReference);

  // Name resolves exactly, but EntityKind is incompatible with the action ->
  // InvalidParameter. NOT UnknownReference, NOT UnsupportedAction (PATCH 02).
  CHECK(rejection(command("Move", {"key"}), before) ==
        FailureKind::InvalidParameter);      // Move expects a Location
  CHECK(rejection(command("Acquire", {"room_a"}), before) ==
        FailureKind::InvalidParameter);      // Acquire expects an Object
  CHECK(rejection(command("Move", {"player"}), before) ==
        FailureKind::InvalidParameter);      // Actor is not a Location
  CHECK(rejection(command("Acquire", {"player"}), before) ==
        FailureKind::InvalidParameter);      // Actor is not an Object
  std::cout << "PASS" << std::endl;
}

// ---------------------------------------------------------------------------
// 4  ambiguous reference
// ---------------------------------------------------------------------------
void case_4_ambiguous_reference() {
  std::cout << "4  ambiguous reference (room / object) ... ";
  const GameState before = default_state();
  CHECK(rejection(command("Move", {"room"}), before) ==
        FailureKind::AmbiguousReference);    // {room_a, room_b}
  CHECK(rejection(command("Acquire", {"object"}), before) ==
        FailureKind::AmbiguousReference);    // {key, crate}
  std::cout << "PASS" << std::endl;
}

// ---------------------------------------------------------------------------
// 5  unsupported action
// ---------------------------------------------------------------------------
void case_5_unsupported_action() {
  std::cout << "5  unsupported action (Open; lowercase) ... ";
  const GameState before = default_state();
  CHECK(rejection(command("Open", {"room_b"}), before) ==
        FailureKind::UnsupportedAction);
  CHECK(rejection(command("move", {"room_b"}), before) ==
        FailureKind::UnsupportedAction);  // vocabulary is exact, case-sensitive
  std::cout << "PASS" << std::endl;
}

// ---------------------------------------------------------------------------
// 6  malformed (PATCH 01: exactly one target)
// ---------------------------------------------------------------------------
void case_6_malformed() {
  std::cout << "6  malformed (verb missing/empty; zero or multiple targets) ... ";
  const GameState before = default_state();
  CHECK(rejection(command(std::nullopt, {"room_b"}), before) ==
        FailureKind::Malformed);          // verb missing
  CHECK(rejection(command("", {"room_b"}), before) ==
        FailureKind::Malformed);          // verb empty
  CHECK(rejection(command("Move", {}), before) ==
        FailureKind::Malformed);          // zero targets (PATCH 01)
  CHECK(rejection(command("Move", {"room_a", "room_b"}), before) ==
        FailureKind::Malformed);          // multiple targets (PATCH 01)
  std::cout << "PASS" << std::endl;
}

// ---------------------------------------------------------------------------
// 7  invented property
// ---------------------------------------------------------------------------
void case_7_invented_property() {
  std::cout << "7  invented property (foo=bar) ... ";
  const GameState before = default_state();
  CHECK(rejection(with_property(command("Move", {"room_b"}), "foo", "bar"),
                  before) == FailureKind::UnexpectedProperty);
  std::cout << "PASS" << std::endl;
}

// ---------------------------------------------------------------------------
// 8  multiple actions (and zero actions)
// ---------------------------------------------------------------------------
void case_8_multiple_actions() {
  std::cout << "8  multiple actions (and zero actions) ... ";
  const GameState before = default_state();
  // actions.size() != 1 -> MultipleActions (PATCH 01).
  const CandidateIntent two_actions{
      {RawAction{"Move", {"room_b"}}, RawAction{"Move", {"room_a"}}}, {}};
  CHECK(rejection(two_actions, before) == FailureKind::MultipleActions);
  const CandidateIntent zero_actions{{}, {}};
  CHECK(rejection(zero_actions, before) == FailureKind::MultipleActions);
  std::cout << "PASS" << std::endl;
}

// ---------------------------------------------------------------------------
// 9  authority-leak attempt: outcome-shaped claim
// ---------------------------------------------------------------------------
void case_9_authority_leak() {
  std::cout << "9  authority-leak attempt (success=true) ... ";
  const GameState before = default_state();
  const CandidateIntent leak =
      with_property(command("Acquire", {"key"}), "success", "true");
  CHECK(rejection(leak, before) == FailureKind::UnexpectedProperty);

  // "No Resolution produced": the rejected path yields a ValidationFailure,
  // never a Resolution (Resolution is produced only by Resolver::resolve on a
  // ValidatedIntent, which rejection can never create).
  const ValidationResult result = Validator::validate(leak, before);
  CHECK(!is_accepted(result));
  CHECK(std::holds_alternative<ValidationFailure>(result));
  std::cout << "PASS" << std::endl;
}

// ---------------------------------------------------------------------------
// 10 rejected AND accepted leave GameState deep-unchanged
// ---------------------------------------------------------------------------
void case_10_state_unchanged() {
  std::cout << "10 GameState unchanged for every rejection AND acceptance ... ";
  const GameState before = default_state();
  const CandidateIntent candidates[] = {
      command("Acquire", {"diamond"}),          // UnknownReference
      command("Move", {"room"}),                // AmbiguousReference
      command("Acquire", {"room_a"}),           // InvalidParameter
      command("Open", {"room_b"}),              // UnsupportedAction
      command("Move", {}),                      // Malformed
      with_property(command("Move", {"room_b"}), "foo", "bar"),  // UnexpectedProperty
      CandidateIntent{{RawAction{"Move", {"room_b"}},
                       RawAction{"Move", {"room_a"}}},
                      {}},                      // MultipleActions
      with_property(command("Acquire", {"key"}), "success", "true"),  // leak
      command("Move", {"room_b"}),              // accepted
      command("Acquire", {"key"}),              // accepted
  };
  for (const CandidateIntent& c : candidates) {
    GameState snapshot = before;
    (void)Validator::validate(c, snapshot);
    CHECK(snapshot == before);
  }
  std::cout << "PASS" << std::endl;
}

// ---------------------------------------------------------------------------
// 11 type enforcement (compile-time proofs above; runtime demonstration)
// ---------------------------------------------------------------------------
void case_11_type_enforcement() {
  std::cout << "11 type enforcement (static_asserts above) ... ";
  const GameState before = default_state();
  const CandidateIntent candidate = command("Move", {"room_b"});
  const ValidationResult result = Validator::validate(candidate, before);
  CHECK(is_accepted(result));
  const ValidatedIntent& vi = std::get<ValidatedIntent>(result);
  CHECK(vi.actor == entity::player);  // PATCH 04
  CHECK(vi.action == Action::Move);
  CHECK(vi.target == entity::room_b);
  const Resolution res = Resolver::resolve(before, vi, RandomContext{0});
  CHECK(res.outcome == Outcome::Success);
  std::cout << "PASS" << std::endl;
}

// ---------------------------------------------------------------------------
// 12 deterministic replay (same state + intent + seed => same Resolution)
// ---------------------------------------------------------------------------
void case_12_deterministic_replay() {
  std::cout << "12 deterministic replay (state+intent+seed twice) ... ";
  struct Scenario {
    const char* verb;
    const char* target;
    GameState before;
  };
  const Scenario scenarios[] = {
      {"Move", "room_b", st(entity::room_a, entity::room_a, entity::room_a)},
      {"Move", "room_a", st(entity::room_a, entity::room_a, entity::room_a)},
      {"Acquire", "key", st(entity::room_a, entity::room_a, entity::room_a)},
      {"Acquire", "key", default_state()},  // cross-room failure
      {"Acquire", "crate", st(entity::room_a, entity::room_a, entity::room_a)},
      {"Acquire", "key", st(entity::room_a, std::nullopt, entity::room_a)},  // held
  };
  const uint64_t seeds[] = {0, 42, 123456789};
  for (const Scenario& s : scenarios) {
    const ValidatedIntent vi = accepted(command(s.verb, {s.target}), s.before);
    for (uint64_t seed : seeds) {
      const RandomContext ctx{seed};
      const Resolution r1 = Resolver::resolve(s.before, vi, ctx);
      const Resolution r2 = Resolver::resolve(s.before, vi, ctx);
      const Resolution r3 = Resolver::resolve(s.before, vi, ctx);
      CHECK(same_resolution(r1, r2));
      CHECK(same_resolution(r1, r3));
    }
  }
  std::cout << "PASS" << std::endl;
}

// ---------------------------------------------------------------------------
// 13 complete StateDiff: resolver diff == diff(before, after), exactly
// ---------------------------------------------------------------------------
void case_13_complete_state_diff() {
  std::cout << "13 complete StateDiff (no missing, no extra fields) ... ";
  struct Scenario {
    const char* verb;
    const char* target;
    GameState before;
  };
  const Scenario scenarios[] = {
      {"Move", "room_b", st(entity::room_a, entity::room_a, entity::room_a)},
      {"Move", "room_a", st(entity::room_a, entity::room_a, entity::room_a)},
      {"Acquire", "key", st(entity::room_a, entity::room_a, entity::room_a)},
      {"Acquire", "key", default_state()},
      {"Acquire", "key", st(entity::room_a, std::nullopt, entity::room_a)},
      {"Acquire", "crate", st(entity::room_a, entity::room_a, entity::room_a)},
  };
  for (const Scenario& s : scenarios) {
    const ValidatedIntent vi = accepted(command(s.verb, {s.target}), s.before);
    const Resolution res = Resolver::resolve(s.before, vi, RandomContext{1});
    const StateDiff expected = diff(s.before, res.after);
    CHECK(res.diff == expected);
    CHECK(res.diff.changes.size() == expected.changes.size());
  }
  std::cout << "PASS" << std::endl;
}

// ---------------------------------------------------------------------------
// 14 consistency: outcome<->EventKind; apply(); from/to vs diff; after
// ---------------------------------------------------------------------------
void case_14_consistency() {
  std::cout << "14 consistency (outcome<->EventKind; apply(); from/to vs diff) ... ";
  struct Scenario {
    const char* verb;
    const char* target;
    GameState before;
    Outcome outcome;
    EventKind kind;
  };
  const Scenario scenarios[] = {
      {"Move", "room_b",
       st(entity::room_a, entity::room_a, entity::room_a),
       Outcome::Success, EventKind::PlayerMoved},
      {"Move", "room_a",
       st(entity::room_a, entity::room_a, entity::room_a),
       Outcome::UnsuccessfulAttempt, EventKind::MoveFailed},
      {"Acquire", "key",
       st(entity::room_a, entity::room_a, entity::room_a),
       Outcome::Success, EventKind::ObjectAcquired},
      {"Acquire", "key", default_state(),
       Outcome::UnsuccessfulAttempt, EventKind::AcquireFailed},
      {"Acquire", "key",
       st(entity::room_a, std::nullopt, entity::room_a),
       Outcome::UnsuccessfulAttempt, EventKind::AcquireFailed},
  };
  for (const Scenario& s : scenarios) {
    const ValidatedIntent vi = accepted(command(s.verb, {s.target}), s.before);
    const Resolution res = Resolver::resolve(s.before, vi, RandomContext{7});

    // outcome <-> EventKind mapping
    CHECK((res.outcome == Outcome::Success) ==
          (res.event.kind == EventKind::PlayerMoved ||
           res.event.kind == EventKind::ObjectAcquired));
    CHECK((res.outcome == Outcome::UnsuccessfulAttempt) ==
          (res.event.kind == EventKind::MoveFailed ||
           res.event.kind == EventKind::AcquireFailed));
    CHECK(res.event.kind == s.kind);

    // apply(diff, before) == after (STATE_DIFF_INVARIANT)
    CHECK(apply(res.diff, s.before) == res.after);

    // Event from/to must match the diff (same canonical transition).
    if (res.diff.changes.empty()) {
      // No canonical transition: from describes the unchanged location
      // (from == to, or both nullopt when the object is held).
      CHECK(res.event.from == res.event.to);
    } else {
      CHECK(res.diff.changes.size() == 1);
      const FieldChange& change = res.diff.changes[0];
      if (res.event.from.has_value()) {
        CHECK(*res.event.from == std::get<EntityId>(change.before));
      } else {
        CHECK(std::holds_alternative<std::nullopt_t>(change.before));
      }
      if (res.event.to.has_value()) {
        CHECK(*res.event.to == std::get<EntityId>(change.after));
      } else {
        CHECK(std::holds_alternative<std::nullopt_t>(change.after));
      }
    }
  }
  std::cout << "PASS" << std::endl;
}

}  // namespace

int main() {
  std::cout << "KAD-WP-001-INTENT-AUTHORITY-BOUNDARY — EXPERIMENT-001" << std::endl;
  std::cout << "14 evidence cases (self-asserting):" << std::endl;
  std::cout << std::endl;

  case_1_valid_success();
  case_2_valid_unsuccessful();
  case_3_reference_unknown_and_invalid_parameter();
  case_4_ambiguous_reference();
  case_5_unsupported_action();
  case_6_malformed();
  case_7_invented_property();
  case_8_multiple_actions();
  case_9_authority_leak();
  case_10_state_unchanged();
  case_11_type_enforcement();
  case_12_deterministic_replay();
  case_13_complete_state_diff();
  case_14_consistency();

  std::cout << std::endl;
  if (g_failures == 0) {
    std::cout << "ALL 14 EVIDENCE CASES: PASS" << std::endl;
    return 0;
  }
  std::cout << "FAILURES: " << g_failures << std::endl;
  return 1;
}