# KAD-PI Counterfactual Observatory Architecture (2026-08-30)

## Executive Summary

Workpackage **WP-KAD-COUNTERFACTUAL-OBSERVATORY-004** implements the longitudinal observation architecture required to evaluate actual production routing versus shadow economic routing opportunities across multi-turn sessions without polluting git history, without granting execution authority to shadow recommendations, and without claiming unverified empirical cost/token savings.

## Key Architectural Decisions

1. **Wayfinder Decision (WAYFINDER-OBSERVATORY-004-01)**:
   * Selected: Runtime append-only tamper-evident journal under XDG state (`$XDG_STATE_HOME/kad-pi/shadow-observatory/observations.jsonl`) with deterministic export snapshots to repository `evidence/`.
   * Rejected: Direct git commits on every event (repo churn), SQLite (unnecessary binary dependency), External LLM evaluators (non-deterministic token waste).

2. **Tamper-Evident SHA-256 Hash Chain**:
   * Events include `sequence`, `previous_hash`, and `event_hash = SHA256(previous_hash + canonical_event)`.
   * `verifyJournalIntegrity()` verifies chain consistency, detecting historical modifications, deleted records, or broken sequences.

3. **Strict Epistemic Isolation**:
   * Distinguishes `OBSERVED`, `COUNTERFACTUAL`, `DERIVED`, `ESTIMATED_COUNTERFACTUAL`, and `UNKNOWN`.
   * Prevents labeling counterfactual estimates as empirical savings.

4. **Zero Production Mutation**:
   * Production router execution and authority remain 100% immutable.
