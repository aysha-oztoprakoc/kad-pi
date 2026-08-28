# KAD-WP-001-INTENT-AUTHORITY-BOUNDARY (EXPERIMENT-001)

Purpose: prove that untrusted CandidateIntent data cannot create canonical
consequences (Event / StateDiff / GameState_after) except by being
deterministically admitted as EXACTLY ONE ValidatedIntent (pure Validator) and
resolved by the deterministic Resolver.

Build: `make`   (g++ -std=c++20, -Wall -Wextra -Werror -pedantic)

Test: `make test` (runs the 14 self-asserting evidence cases; exit 0 = PASS)
